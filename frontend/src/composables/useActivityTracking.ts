/**
 * @file useActivityTracking.ts
 * @description Composable para el tracking de actividad del usuario
 * Implementa seguimiento de actividad, detección de inactividad y
 * sincronización con el sistema de autenticación.
 */

import { ref, computed, onMounted, onUnmounted, readonly } from 'vue'
import axios from 'axios'

// Tipos para el tracking de actividad
interface ActivityOptions {
  /** Tiempo en milisegundos para considerar al usuario inactivo */
  inactivityTimeout: number
  /** Eventos a escuchar para detectar actividad */
  events: string[]
  /** Callback a ejecutar cuando el usuario se vuelve inactivo */
  onInactive?: () => void
  /** Callback a ejecutar cuando el usuario vuelve a estar activo */
  onActive?: () => void
  /** Si debe registrar la actividad en el servidor */
  trackOnServer?: boolean
  /** Intervalo en milisegundos para enviar actualizaciones al servidor */
  serverUpdateInterval?: number
  /** URL del endpoint para registrar actividad */
  activityEndpoint?: string
  /** Si debe sincronizar con peticiones HTTP */
  syncWithHttp?: boolean
}

// Singleton para prevenir múltiples instancias
let trackingInstance: ReturnType<typeof createActivityTracking> | null = null
let mountCount = 0

/**
 * Composable para el tracking de actividad del usuario
 * @param options Opciones de configuración para el tracking
 * @returns Objeto con métodos y estado para manejar el tracking de actividad
 */
export function useActivityTracking(options: Partial<ActivityOptions> = {}) {
  // Si ya existe una instancia, retornarla para mantener un estado global
  if (trackingInstance) {
    mountCount++
    return trackingInstance
  }
  
  // Crear una nueva instancia si no existe
  trackingInstance = createActivityTracking(options)
  mountCount++
  
  return trackingInstance
}

/**
 * Función interna para crear la instancia de tracking de actividad
 * @param customOptions Opciones de configuración para el tracking
 * @returns Objeto con métodos y estado para manejar el tracking de actividad
 */
function createActivityTracking(customOptions: Partial<ActivityOptions> = {}) {
  // Opciones por defecto
  const defaultOptions: ActivityOptions = {
    inactivityTimeout: 30 * 60 * 1000, // 30 minutos
    events: ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click', 'visibilitychange'],
    trackOnServer: false,
    serverUpdateInterval: 5 * 60 * 1000, // 5 minutos
    activityEndpoint: '/api/user/activity',
    syncWithHttp: true
  }
  
  // Combinar opciones por defecto con las personalizadas
  const options: ActivityOptions = { ...defaultOptions, ...customOptions }
  
  // Estado de actividad
  const lastActivity = ref<number>(Date.now())
  const isActive = ref<boolean>(true)
  const activityEvents = ref<{type: string, timestamp: number}[]>([])
  const isSendingActivity = ref<boolean>(false)
  
  // Temporizadores
  let inactivityTimer: number | null = null
  let serverUpdateTimer: number | null = null
  let visibilityTimer: number | null = null
  
  /**
   * Actualiza el tiempo de última actividad
   * @param eventType Tipo de evento que generó la actividad
   */
  const updateActivity = (eventType: string = 'user_interaction') => {
    const now = Date.now()
    lastActivity.value = now
    
    // Registrar evento de actividad
    activityEvents.value.push({
      type: eventType,
      timestamp: now
    })
    
    // Limitar el historial de eventos a los últimos 100
    if (activityEvents.value.length > 100) {
      activityEvents.value = activityEvents.value.slice(-100)
    }
    
    // Si el usuario estaba inactivo, ejecutar callback de activación
    if (!isActive.value) {
      isActive.value = true
      options.onActive?.()
    }
    
    // Reiniciar temporizador de inactividad
    resetInactivityTimer()
  }
  
  /**
   * Reinicia el temporizador de inactividad
   */
  const resetInactivityTimer = () => {
    // Limpiar temporizador existente
    if (inactivityTimer !== null) {
      window.clearTimeout(inactivityTimer)
    }
    
    // Configurar nuevo temporizador
    inactivityTimer = window.setTimeout(() => {
      isActive.value = false
      options.onInactive?.()
    }, options.inactivityTimeout)
  }
  
  /**
   * Envía actualización de actividad al servidor
   */
  const sendActivityToServer = async () => {
    if (!options.trackOnServer || isSendingActivity.value) return
    
    try {
      isSendingActivity.value = true
      
      // Preparar datos de actividad
      const activityData = {
        lastActivity: lastActivity.value,
        isActive: isActive.value,
        events: activityEvents.value.slice(-10), // Enviar solo los últimos 10 eventos
        userAgent: navigator.userAgent,
        screenSize: `${window.innerWidth}x${window.innerHeight}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
      
      // Enviar datos al servidor
      await axios.post(options.activityEndpoint || '/api/user/activity', activityData)
      
      // Limpiar eventos enviados
      activityEvents.value = activityEvents.value.slice(-5) // Mantener solo los últimos 5 eventos
      
      console.log('Actividad enviada al servidor:', new Date(lastActivity.value))
    } catch (error) {
      console.error('Error al enviar actividad al servidor:', error)
    } finally {
      isSendingActivity.value = false
    }
  }
  
  /**
   * Configura los listeners de eventos para detectar actividad
   */
  const setupEventListeners = () => {
    // Función de manejo de eventos
    const handleActivity = (event: Event) => updateActivity(event.type)
    
    // Manejar cambios de visibilidad del documento
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updateActivity('visibility_visible')
      } else {
        // Registrar cambio a oculto
        activityEvents.value.push({
          type: 'visibility_hidden',
          timestamp: Date.now()
        })
      }
    }
    
    // Añadir listeners para todos los eventos configurados
    options.events.forEach(eventName => {
      if (eventName === 'visibilitychange') {
        document.addEventListener(eventName, handleVisibilityChange, { passive: true })
      } else {
        window.addEventListener(eventName, handleActivity, { passive: true })
      }
    })
    
    // Configurar timer para verificar visibilidad periódicamente
    visibilityTimer = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        updateActivity('visibility_check')
      }
    }, 60000) // Verificar cada minuto
    
    // Retornar función para limpiar listeners
    return () => {
      options.events.forEach(eventName => {
        if (eventName === 'visibilitychange') {
          document.removeEventListener(eventName, handleVisibilityChange)
        } else {
          window.removeEventListener(eventName, handleActivity)
        }
      })
      
      if (visibilityTimer !== null) {
        window.clearInterval(visibilityTimer)
        visibilityTimer = null
      }
    }
  }
  
  /**
   * Sincroniza la actividad con las peticiones HTTP
   */
  const syncWithHttpRequests = () => {
    if (!options.syncWithHttp) return
    
    // Interceptar peticiones para actualizar actividad
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        updateActivity('http_request')
        return config
      }
    )
    
    // Interceptar respuestas para actualizar actividad
    const responseInterceptor = axios.interceptors.response.use(
      (response) => {
        updateActivity('http_response')
        return response
      },
      (error) => {
        updateActivity('http_error')
        return Promise.reject(error)
      }
    )
    
    // Retornar función para limpiar interceptores
    return () => {
      axios.interceptors.request.eject(requestInterceptor)
      axios.interceptors.response.eject(responseInterceptor)
    }
  }
  
  // Configurar tracking al montar el componente
  onMounted(() => {
    // Inicializar estado
    updateActivity('init')
    
    // Configurar listeners de eventos
    const cleanupListeners = setupEventListeners()
    
    // Configurar sincronización con peticiones HTTP
    const cleanupHttpSync = syncWithHttpRequests()
    
    // Configurar temporizador para enviar actividad al servidor
    if (options.trackOnServer && options.serverUpdateInterval) {
      serverUpdateTimer = window.setInterval(
        sendActivityToServer,
        options.serverUpdateInterval
      )
      
      // Enviar actividad inicial al servidor
      sendActivityToServer()
    }
    
    // Limpiar recursos al desmontar
    onUnmounted(() => {
      mountCount--
      
      // Solo limpiar recursos si no hay más instancias montadas
      if (mountCount === 0) {
        // Limpiar listeners de eventos
        cleanupListeners()
        
        // Limpiar temporizadores
        if (inactivityTimer !== null) {
          window.clearTimeout(inactivityTimer)
          inactivityTimer = null
        }
        
        if (serverUpdateTimer !== null) {
          window.clearInterval(serverUpdateTimer)
          serverUpdateTimer = null
        }
        
        if (visibilityTimer !== null) {
          window.clearInterval(visibilityTimer)
          visibilityTimer = null
        }
        
        // Limpiar interceptores HTTP
        cleanupHttpSync?.()
        
        // Limpiar instancia singleton
        trackingInstance = null
      }
    })
  })
  
  // Exponer estado y métodos (usando readonly para prevenir modificaciones externas)
  return {
    lastActivity: readonly(lastActivity),
    isActive: readonly(isActive),
    activityEvents: readonly(activityEvents),
    isSendingActivity: readonly(isSendingActivity),
    updateActivity,
    sendActivityToServer,
    // Métodos adicionales
    getTimeSinceLastActivity: computed(() => Date.now() - lastActivity.value),
    getActivitySummary: computed(() => {
      const eventCounts: Record<string, number> = {}
      activityEvents.value.forEach(event => {
        eventCounts[event.type] = (eventCounts[event.type] || 0) + 1
      })
      return eventCounts
    })
  }
}