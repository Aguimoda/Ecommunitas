/**
 * @file useAxiosInterceptors.ts
 * @description Composable para configurar interceptores de Axios
 * Implementa manejo centralizado de errores, reintentos inteligentes, tracking de errores,
 * tracking de actividad para integración con el sistema de autenticación, refresh automático de JWT,
 * deduplicación de peticiones y estrategia de caché avanzada.
 */

import axios, { AxiosError, AxiosRequestConfig, AxiosResponse, AxiosRequestHeaders, CancelTokenSource } from 'axios'
import { ref, computed, onUnmounted, readonly, watch } from 'vue'

// Tipos de errores para taxonomía mejorada
export enum ErrorType {
  NETWORK = 'network',
  TIMEOUT = 'timeout',
  SERVER = 'server',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  NOT_FOUND = 'not_found',
  RATE_LIMIT = 'rate_limit',
  UNKNOWN = 'unknown'
}

// Estructura para errores clasificados
export interface ClassifiedError extends AxiosError {
  errorType?: ErrorType
  retryCount?: number
  timestamp?: number
}

// Configuración para reintentos e interceptores
interface RetryConfig {
  maxRetries: number
  retryDelay: number
  retryableStatusCodes: number[]
  trackActivity?: boolean
  enableDeduplication?: boolean
  enableJwtRefresh?: boolean
  refreshTokenEndpoint?: string
  jwtTokenSelector?: () => string | null
  onRequest?: (config: AxiosRequestConfig) => void
  onResponse?: (response: AxiosResponse) => void
  onError?: (error: ClassifiedError) => void
  onTokenRefresh?: (newToken: string) => void
  cacheTTL?: number
}

// Contador de reintentos por petición (singleton para prevenir múltiples instancias)
const retryMap = new Map<string, number>()

// Caché para peticiones GET (optimización de rendimiento)
interface CacheEntry {
  data: any
  timestamp: number
  headers?: Record<string, string>
  etag?: string
}

const requestCache = new Map<string, CacheEntry>()
const DEFAULT_CACHE_TTL = 5 * 60 * 1000 // 5 minutos por defecto

// Registro de peticiones en vuelo para deduplicación
const pendingRequests = new Map<string, Promise<any>>()

// Estado de refresh de token para prevenir múltiples refreshes simultáneos
let isRefreshingToken = false
let refreshTokenPromise: Promise<string> | null = null
const tokenSubscribers: ((token: string) => void)[] = []

// Singleton para prevenir múltiples instancias
let interceptorsInstance: ReturnType<typeof createAxiosInterceptors> | null = null
let mountCount = 0

/**
 * Genera una clave única para identificar una petición
 * @param config Configuración de la petición
 * @returns Clave única para la petición
 */
const getRequestKey = (config: AxiosRequestConfig): string => {
  return `${config.method}:${config.url}:${JSON.stringify(config.params)}:${JSON.stringify(config.data)}`
}

/**
 * Composable para configurar interceptores de Axios
 * @returns Objeto con métodos y estado para manejar interceptores
 */
export function useAxiosInterceptors(customConfig: Partial<RetryConfig> = {}) {
  // Si ya existe una instancia, retornarla para mantener un estado global
  if (interceptorsInstance) {
    mountCount++
    return interceptorsInstance
  }
  
  // Crear una nueva instancia si no existe
  interceptorsInstance = createAxiosInterceptors(customConfig)
  mountCount++
  
  return interceptorsInstance
}

/**
 * Función interna para crear la instancia de interceptores
 * @param customConfig Configuración personalizada para reintentos
 * @returns Objeto con métodos y estado para manejar interceptores
 */
function createAxiosInterceptors(customConfig: Partial<RetryConfig> = {}) {
  // Estado para tracking de errores
  const errors = ref<ClassifiedError[]>([])
  const isRetrying = ref(false)
  const lastRequestTime = ref<number>(0)
  const activeRequests = ref<number>(0)
  const isCachingEnabled = ref(true)
  const isDeduplicationEnabled = ref(customConfig.enableDeduplication ?? true)
  const isJwtRefreshEnabled = ref(customConfig.enableJwtRefresh ?? true)
  
  // Configuración por defecto para reintentos
  const defaultRetryConfig: RetryConfig = {
    maxRetries: 3,
    retryDelay: 1000,
    retryableStatusCodes: [408, 429, 500, 502, 503, 504],
    trackActivity: true,
    enableDeduplication: true,
    enableJwtRefresh: true,
    refreshTokenEndpoint: '/api/auth/refresh',
    cacheTTL: DEFAULT_CACHE_TTL
  }
  
  /**
   * Limpia la caché de peticiones
   */
  const clearCache = () => {
    requestCache.clear()
  }
  
  /**
   * Invalida entradas de caché que coincidan con un patrón de URL
   * @param urlPattern Patrón de URL para invalidar
   */
  const invalidateCache = (urlPattern: RegExp) => {
    Array.from(requestCache.keys()).forEach(key => {
      if (urlPattern.test(key.split(':')[1] || '')) {
        requestCache.delete(key)
      }
    })
  }
  
  /**
   * Invalida todas las entradas de caché relacionadas con una entidad
   * @param entityType Tipo de entidad (ej: 'users', 'items')
   */
  const invalidateCacheByEntity = (entityType: string) => {
    invalidateCache(new RegExp(`/${entityType}(/|$)`))
  }
  
  /**
   * Habilita o deshabilita la caché de peticiones
   * @param enabled Estado de la caché
   */
  const setCachingEnabled = (enabled: boolean) => {
    isCachingEnabled.value = enabled
  }
  
  /**
   * Habilita o deshabilita la deduplicación de peticiones
   * @param enabled Estado de la deduplicación
   */
  const setDeduplicationEnabled = (enabled: boolean) => {
    isDeduplicationEnabled.value = enabled
  }
  
  /**
   * Habilita o deshabilita el refresh automático de JWT
   * @param enabled Estado del refresh automático
   */
  const setJwtRefreshEnabled = (enabled: boolean) => {
    isJwtRefreshEnabled.value = enabled
  }
  
  /**
   * Clasifica un error según su tipo
   * @param error Error de Axios
   * @returns Error clasificado
   */
  const classifyError = (error: AxiosError): ClassifiedError => {
    const classifiedError = error as ClassifiedError
    classifiedError.timestamp = Date.now()
    
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        classifiedError.errorType = ErrorType.TIMEOUT
      } else if (error.request) {
        classifiedError.errorType = ErrorType.NETWORK
      } else {
        classifiedError.errorType = ErrorType.UNKNOWN
      }
      return classifiedError
    }
    
    // Clasificar según código de estado HTTP
    switch (error.response.status) {
      case 400:
        classifiedError.errorType = ErrorType.VALIDATION
        break
      case 401:
        classifiedError.errorType = ErrorType.AUTHENTICATION
        break
      case 403:
        classifiedError.errorType = ErrorType.AUTHORIZATION
        break
      case 404:
        classifiedError.errorType = ErrorType.NOT_FOUND
        break
      case 429:
        classifiedError.errorType = ErrorType.RATE_LIMIT
        break
      case 500:
      case 502:
      case 503:
      case 504:
        classifiedError.errorType = ErrorType.SERVER
        break
      default:
        classifiedError.errorType = ErrorType.UNKNOWN
    }
    
    return classifiedError
  }
  
  /**
   * Refresca el token JWT
   * @param config Configuración de interceptores
   * @returns Promesa con el nuevo token
   */
  const refreshToken = async (config: RetryConfig): Promise<string> => {
    // Si ya hay un refresh en curso, retornar la promesa existente
    if (isRefreshingToken && refreshTokenPromise) {
      return refreshTokenPromise
    }
    
    isRefreshingToken = true
    
    // Crear nueva promesa de refresh
    refreshTokenPromise = new Promise<string>(async (resolve, reject) => {
      try {
        // Obtener token actual si hay selector configurado
        const currentToken = config.jwtTokenSelector ? config.jwtTokenSelector() : null
        
        // Endpoint para refresh de token
        const endpoint = config.refreshTokenEndpoint || '/api/auth/refresh'
        
        // Realizar petición de refresh sin interceptores para evitar loops
        const response = await axios.post(
          endpoint,
          { token: currentToken },
          { skipAuthRefresh: true, skipErrorHandler: true }
        )
        
        const newToken = response.data.token
        
        // Notificar a los suscriptores sobre el nuevo token
        tokenSubscribers.forEach(callback => callback(newToken))
        tokenSubscribers.length = 0
        
        // Notificar sobre el refresh si hay callback configurado
        if (config.onTokenRefresh) {
          config.onTokenRefresh(newToken)
        }
        
        resolve(newToken)
      } catch (error) {
        tokenSubscribers.forEach(callback => callback(''))
        tokenSubscribers.length = 0
        reject(error)
      } finally {
        isRefreshingToken = false
        refreshTokenPromise = null
      }
    })
    
    return refreshTokenPromise
  }
  
  /**
   * Suscribe una petición para ser reintentada después del refresh de token
   * @param callback Función a ejecutar con el nuevo token
   */
  const subscribeTokenRefresh = (callback: (token: string) => void) => {
    tokenSubscribers.push(callback)
  }
  
  /**
   * Configura los interceptores de Axios
   * @param retryConfig Configuración personalizada para reintentos
   */
  const setupInterceptors = (retryConfig: Partial<RetryConfig> = {}) => {
    const config: RetryConfig = { ...defaultRetryConfig, ...customConfig, ...retryConfig }
    
    // Limpiar caché antigua cada cierto tiempo
    const now = Date.now()
    const cacheTTL = config.cacheTTL || DEFAULT_CACHE_TTL
    
    requestCache.forEach((value, key) => {
      if (now - value.timestamp > cacheTTL) {
        requestCache.delete(key)
      }
    })
    
    // Interceptor de peticiones
    const requestInterceptor = axios.interceptors.request.use(
      async (requestConfig) => {
        // Evitar interceptar peticiones de refresh de token
        if (requestConfig.skipAuthRefresh) {
          return requestConfig
        }
        
        // Crear copia de la configuración para no modificar la original
        const modifiedConfig = { ...requestConfig }
        
        // Asegurar que headers existe
        if (!modifiedConfig.headers) {
          modifiedConfig.headers = axios.defaults.headers.common as AxiosRequestHeaders
        }
        
        // Añadir timestamp para tracking de actividad
        const timestamp = Date.now()
        lastRequestTime.value = timestamp
        modifiedConfig.headers['X-Request-Time'] = timestamp.toString()
        
        // Incrementar contador de peticiones activas
        activeRequests.value++
        
        // Verificar si podemos usar la caché para peticiones GET
        if (isCachingEnabled.value && modifiedConfig.method?.toLowerCase() === 'get') {
          const cacheKey = getRequestKey(modifiedConfig)
          const cachedResponse = requestCache.get(cacheKey)
          
          if (cachedResponse) {
            // Verificar si la caché es válida
            if (Date.now() - cachedResponse.timestamp < cacheTTL) {
              // Añadir header para identificar respuesta cacheada
              modifiedConfig.headers['X-Cache-Hit'] = 'true'
              
              // Añadir ETag si existe para validación condicional
              if (cachedResponse.etag) {
                modifiedConfig.headers['If-None-Match'] = cachedResponse.etag
              }
            } else {
              // Caché expirada, eliminarla
              requestCache.delete(cacheKey)
            }
          }
        }
        
        // Implementar deduplicación de peticiones
        if (isDeduplicationEnabled.value && !modifiedConfig.skipDeduplication) {
          const requestKey = getRequestKey(modifiedConfig)
          
          // Verificar si ya hay una petición idéntica en vuelo
          const pendingRequest = pendingRequests.get(requestKey)
          
          if (pendingRequest) {
            // Marcar como petición duplicada
            modifiedConfig.headers['X-Deduplicated'] = 'true'
            
            // Retornar la promesa existente para evitar petición duplicada
            return Promise.reject({
              __DEDUPLICATED__: true,
              pendingRequest
            })
          }
        }
        
        // Notificar sobre la petición si hay callback configurado
        if (config.onRequest) {
          config.onRequest(modifiedConfig)
        }
        
        return modifiedConfig
      },
      (error) => {
        // Si es una petición deduplicada, no es realmente un error
        if (error.__DEDUPLICATED__) {
          return error.pendingRequest
        }
        
        const classifiedError = classifyError(error)
        errors.value.push(classifiedError)
        return Promise.reject(error)
      }
    )
    
    // Interceptor de respuestas
    const responseInterceptor = axios.interceptors.response.use(
      (response: AxiosResponse) => {
        // Registrar petición completada para deduplicación
        if (isDeduplicationEnabled.value && !response.config.skipDeduplication) {
          const requestKey = getRequestKey(response.config)
          pendingRequests.delete(requestKey)
        }
        
        // Guardar en caché si es una petición GET y la caché está habilitada
        if (isCachingEnabled.value && 
            response.config.method?.toLowerCase() === 'get' && 
            response.status >= 200 && 
            response.status < 300) {
          const cacheKey = getRequestKey(response.config)
          
          // Guardar en caché con ETag si está disponible
          requestCache.set(cacheKey, {
            data: response.data,
            timestamp: Date.now(),
            etag: response.headers.etag,
            headers: {
              'last-modified': response.headers['last-modified'],
              'cache-control': response.headers['cache-control']
            }
          })
        }
        
        // Decrementar contador de peticiones activas
        activeRequests.value = Math.max(0, activeRequests.value - 1)
        
        // Notificar sobre la respuesta si hay callback configurado
        if (config.onResponse) {
          config.onResponse(response)
        }
        
        return response
      },
      async (error: AxiosError) => {
        // Clasificar el error
        const classifiedError = classifyError(error)
        
        // Obtener configuración de la petición
        const originalConfig = error.config
        
        if (!originalConfig) {
          errors.value.push(classifiedError)
          return Promise.reject(classifiedError)
        }
        
        // Liberar petición pendiente para deduplicación
        if (isDeduplicationEnabled.value && !originalConfig.skipDeduplication) {
          const requestKey = getRequestKey(originalConfig)
          pendingRequests.delete(requestKey)
        }
        
        // Decrementar contador de peticiones activas
        activeRequests.value = Math.max(0, activeRequests.value - 1)
        
        // Manejar respuesta 304 Not Modified (caché válida)
        if (error.response?.status === 304 && isCachingEnabled.value) {
          const cacheKey = getRequestKey(originalConfig)
          const cachedResponse = requestCache.get(cacheKey)
          
          if (cachedResponse) {
            // Actualizar timestamp de la caché
            cachedResponse.timestamp = Date.now()
            requestCache.set(cacheKey, cachedResponse)
            
            // Retornar respuesta cacheada
            return Promise.resolve({
              ...error.response,
              status: 200,
              data: cachedResponse.data,
              __CACHED__: true
            })
          }
        }
        
        // Manejar refresh de token JWT
        if (isJwtRefreshEnabled.value && 
            error.response?.status === 401 && 
            !originalConfig.skipAuthRefresh && 
            config.jwtTokenSelector) {
          
          // Verificar si hay token actual
          const currentToken = config.jwtTokenSelector()
          
          if (currentToken) {
            // Evitar reintentar peticiones de refresh
            if (originalConfig.url === config.refreshTokenEndpoint) {
              return Promise.reject(classifiedError)
            }
            
            try {
              let newToken: string
              
              // Si ya hay un refresh en curso, suscribirse
              if (isRefreshingToken) {
                newToken = await new Promise((resolve, reject) => {
                  subscribeTokenRefresh((token) => {
                    if (token) resolve(token)
                    else reject(new Error('Failed to refresh token'))
                  })
                })
              } else {
                // Iniciar nuevo proceso de refresh
                newToken = await refreshToken(config)
              }
              
              // Actualizar token en la petición original
              if (!originalConfig.headers) {
                originalConfig.headers = axios.defaults.headers.common as AxiosRequestHeaders
              }
              originalConfig.headers['Authorization'] = `Bearer ${newToken}`
              
              // Reintentar la petición original con el nuevo token
              return axios(originalConfig)
            } catch (refreshError) {
              // Error al refrescar token, continuar con el rechazo normal
              console.error('Error al refrescar token JWT:', refreshError)
            }
          }
        }
        
        // Generar clave única para la petición
        const requestKey = getRequestKey(originalConfig)
        
        // Obtener contador de reintentos para esta petición
        const currentRetryCount = retryMap.get(requestKey) || 0
        classifiedError.retryCount = currentRetryCount
        
        // Verificar si debemos reintentar la petición
        const shouldRetry = 
          error.response && 
          config.retryableStatusCodes.includes(error.response.status) && 
          currentRetryCount < config.maxRetries
        
        if (shouldRetry) {
          isRetrying.value = true
          
          // Incrementar contador de reintentos
          retryMap.set(requestKey, currentRetryCount + 1)
          
          // Esperar antes de reintentar (con backoff exponencial)
          const delay = config.retryDelay * Math.pow(2, currentRetryCount)
          await new Promise(resolve => setTimeout(resolve, delay))
          
          isRetrying.value = false
          
          // Reintentar la petición
          return axios(originalConfig)
        }
        
        // Si ya no debemos reintentar, limpiar el contador
        retryMap.delete(requestKey)
        
        // Guardar error para análisis
        errors.value.push(classifiedError)
        
        // Notificar sobre el error si hay callback configurado
        if (config.onError) {
          config.onError(classifiedError)
        }
        
        return Promise.reject(classifiedError)
      }
    )
    
    // Retornar función para limpiar interceptores
    return () => {
      axios.interceptors.request.eject(requestInterceptor)
      axios.interceptors.response.eject(responseInterceptor)
    }
  }
  
  /**
   * Limpia los errores registrados
   */
  const clearErrors = () => {
    errors.value = []
  }
  
  /**
   * Verifica si hay peticiones activas
   */
  const hasActiveRequests = computed(() => activeRequests.value > 0)
  
  /**
   * Obtiene el tiempo de la última petición
   */
  const getLastRequestTime = computed(() => lastRequestTime.value)
  
  // Limpiar recursos al desmontar
  onUnmounted(() => {
    mountCount--
    
    // Solo limpiar recursos si no hay más instancias montadas
    if (mountCount === 0) {
      // Limpiar instancia singleton
      interceptorsInstance = null
    }
  })
  
  return {
    setupInterceptors,
    clearErrors,
    clearCache,
    invalidateCache,
    invalidateCacheByEntity,
    setCachingEnabled,
    setDeduplicationEnabled,
    setJwtRefreshEnabled,
    errors: readonly(errors),
    isRetrying: readonly(isRetrying),
    hasActiveRequests,
    lastRequestTime: getLastRequestTime,
    isCachingEnabled: readonly(isCachingEnabled),
    isDeduplicationEnabled: readonly(isDeduplicationEnabled),
    isJwtRefreshEnabled: readonly(isJwtRefreshEnabled),
    ErrorType
  }
}