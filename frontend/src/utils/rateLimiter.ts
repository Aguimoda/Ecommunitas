/**
 * @file rateLimiter.ts
 * @description Utilidad para limitar la velocidad de peticiones HTTP en el frontend
 * @module Utils/RateLimiter
 * @version 1.0.0
 * @author Ecommunitas Team
 * @created 2024
 * 
 * Este módulo proporciona funcionalidades para:
 * - Limitar el número de peticiones por período de tiempo
 * - Gestionar colas de peticiones cuando se alcanza el límite
 * - Manejar respuestas 429 (Too Many Requests) del servidor
 * - Reintentar automáticamente peticiones después del período de espera
 * - Mostrar notificaciones al usuario cuando se activa el rate limiting
 */

import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { ref } from 'vue'
import { displayError } from '@/shared/utils/errorHandler'

/**
 * Configuración para el rate limiter
 * 
 * @interface RateLimitConfig
 */
type RateLimitConfig = {
  /** Número máximo de peticiones permitidas */
  maxRequests: number
  /** Período de tiempo en milisegundos para el límite */
  perMilliseconds: number
  /** Nombre del header que contiene el tiempo de reintento (opcional) */
  retryAfterHeader?: string
  /** Callback ejecutado cuando se activa el rate limiting (opcional) */
  onRateLimited?: () => void
}

/**
 * Estructura de una petición en cola
 * 
 * @interface QueuedRequest
 */
type QueuedRequest = {
  /** Configuración de la petición Axios */
  config: AxiosRequestConfig
  /** Función para resolver la promesa */
  resolve: (value: AxiosResponse) => void
  /** Función para rechazar la promesa */
  reject: (reason?: unknown) => void
}

// const toast = useToast()
const isRateLimited = ref(false)
const retryAfter = ref(0)
const queue: QueuedRequest[] = []
const activeRequests = ref(0)
const lastRequestTime = ref(0)
const requestCount = ref(0)

const rateLimiter = (config: RateLimitConfig) => {
  const { maxRequests, perMilliseconds, retryAfterHeader = 'retry-after', onRateLimited } = config
  
  const processQueue = () => {
    if (queue.length === 0 || activeRequests.value >= maxRequests) return
    
    const now = Date.now()
    if (now - lastRequestTime.value < perMilliseconds) {
      setTimeout(processQueue, perMilliseconds - (now - lastRequestTime.value))
      return
    }
    
    activeRequests.value++
    requestCount.value++
    lastRequestTime.value = now
    
    const { config: requestConfig, resolve, reject } = queue.shift()!
    
    axios(requestConfig)
      .then(response => {
        resolve(response)
        activeRequests.value--
        processQueue()
      })
      .catch(error => {
        if (error.response?.status === 429) {
          const waitTime = parseInt(error.response.headers[retryAfterHeader]) || 60
          retryAfter.value = waitTime
          isRateLimited.value = true
          
          if (onRateLimited) onRateLimited()
          
          displayError(`Demasiadas solicitudes. Intenta nuevamente en ${waitTime} segundos`)
          
          setTimeout(() => {
            isRateLimited.value = false
            retryAfter.value = 0
            processQueue()
          }, waitTime * 1000)
        } else {
          reject(error)
        }
        activeRequests.value--
      })
  }
  
  return {
    request: async (config: AxiosRequestConfig) => {
      return new Promise((resolve, reject) => {
        queue.push({ config, resolve, reject })
        processQueue()
      })
    },
    isRateLimited,
    retryAfter,
    getQueueSize: () => queue.length,
    getActiveRequests: () => activeRequests.value,
    getRequestCount: () => requestCount.value
  }
}

export default rateLimiter