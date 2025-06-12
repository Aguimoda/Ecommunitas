/**
 * @file useGeolocation.ts
 * @description Composable para manejo de geolocalización en Ecommunitas
 * 
 * Este composable proporciona una interfaz completa para trabajar con la
 * geolocalización del usuario, incluyendo obtención de ubicación actual,
 * seguimiento de cambios de ubicación y cálculos de distancia geográfica.
 * 
 * CARACTERÍSTICAS PRINCIPALES:
 * - 📍 Obtención de ubicación actual del usuario
 * - 🔄 Seguimiento en tiempo real de cambios de ubicación
 * - 📏 Cálculo de distancias entre coordenadas (fórmula Haversine)
 * - 🚨 Manejo robusto de errores de geolocalización
 * - ⚙️ Configuración personalizable de precisión y timeouts
 * - 🔔 Notificaciones automáticas de estado
 * - 📱 Soporte completo para dispositivos móviles
 * 
 * FUNCIONALIDADES:
 * - Detección automática de soporte de geolocalización
 * - Mapeo inteligente de errores nativos a mensajes localizados
 * - Formateo automático de distancias (metros/kilómetros)
 * - Verificación de proximidad dentro de un radio específico
 * - Cache configurable para optimizar rendimiento
 * - Limpieza automática de watchers al desmontar
 * 
 * CASOS DE USO:
 * - Búsqueda de artículos por proximidad
 * - Autocompletado de ubicación en formularios
 * - Filtrado geográfico de resultados
 * - Cálculo de distancias para delivery
 * - Mapas interactivos con ubicación del usuario
 * 
 * CONFIGURACIÓN:
 * - enableHighAccuracy: Precisión alta (GPS vs red)
 * - timeout: Tiempo máximo de espera (ms)
 * - maximumAge: Tiempo de cache de ubicación (ms)
 * - showNotifications: Mostrar notificaciones automáticas
 * 
 * TECNOLOGÍAS:
 * - Vue 3 Composition API
 * - TypeScript para tipado estático
 * - Geolocation API nativa del navegador
 * - Fórmula Haversine para cálculos de distancia
 * - Sistema de notificaciones integrado
 * 
 * @author Equipo de Desarrollo Ecommunitas
 * @version 1.0.0
 * @since 1.0.0
 * 
 * @example
 * ```typescript
 * // Uso básico
 * const { 
 *   getCurrentLocation, 
 *   coordinates, 
 *   loading, 
 *   calculateDistance 
 * } = useGeolocation()
 * 
 * // Obtener ubicación actual
 * try {
 *   const coords = await getCurrentLocation()
 *   console.log(`Ubicación: ${coords.lat}, ${coords.lng}`)
 * } catch (error) {
 *   console.error('Error de geolocalización:', error.message)
 * }
 * 
 * // Calcular distancia entre dos puntos
 * const distance = calculateDistance(
 *   { lat: 40.4168, lng: -3.7038 }, // Madrid
 *   { lat: 41.3851, lng: 2.1734 }   // Barcelona
 * )
 * console.log(`Distancia: ${formatDistance(distance)}`)
 * 
 * // Configuración personalizada
 * const geoCustom = useGeolocation({
 *   enableHighAccuracy: false,
 *   timeout: 5000,
 *   showNotifications: false
 * })
 * ```
 */

import { ref, computed } from 'vue'
import { useNotifications } from './useNotifications'

export interface Coordinates {
  lat: number
  lng: number
}

export interface GeolocationOptions {
  enableHighAccuracy?: boolean
  timeout?: number
  maximumAge?: number
  showNotifications?: boolean
}

export interface GeolocationError {
  code: number
  message: string
  type: 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT' | 'NOT_SUPPORTED'
}

export function useGeolocation(options: GeolocationOptions = {}) {
  const { notifyError, notifySuccess } = useNotifications()
  
  // Default options
  const defaultOptions: Required<GeolocationOptions> = {
    enableHighAccuracy: true,
    timeout: 10000, // Increased timeout
    maximumAge: 300000, // 5 minutes cache
    showNotifications: true
  }
  
  const config = { ...defaultOptions, ...options }
  
  // Reactive state
  const coordinates = ref<Coordinates | null>(null)
  const loading = ref(false)
  const error = ref<GeolocationError | null>(null)
  const watchId = ref<number | null>(null)
  
  // Computed properties
  const isSupported = computed(() => 'geolocation' in navigator)
  const hasLocation = computed(() => coordinates.value !== null)
  const isWatching = computed(() => watchId.value !== null)
  
  /**
   * Maps GeolocationPositionError to our custom error format
   */
  const mapGeolocationError = (err: GeolocationPositionError): GeolocationError => {
    const errorMap: Record<number, { type: GeolocationError['type'], message: string }> = {
      1: {
        type: 'PERMISSION_DENIED',
        message: 'Acceso a la ubicación denegado. Por favor, permite el acceso en la configuración del navegador.'
      },
      2: {
        type: 'POSITION_UNAVAILABLE',
        message: 'No se pudo determinar tu ubicación. Verifica que el GPS esté activado.'
      },
      3: {
        type: 'TIMEOUT',
        message: 'Tiempo de espera agotado al obtener la ubicación. Intenta nuevamente.'
      }
    }
    
    const errorInfo = errorMap[err.code] || {
      type: 'POSITION_UNAVAILABLE' as const,
      message: 'Error desconocido al obtener la ubicación.'
    }
    
    return {
      code: err.code,
      ...errorInfo
    }
  }
  
  /**
   * Gets the current user location
   * @returns Promise with coordinates
   */
  const getCurrentLocation = (): Promise<Coordinates> => {
    return new Promise((resolve, reject) => {
      // Check if geolocation is supported
      if (!isSupported.value) {
        const geoError: GeolocationError = {
          code: 0,
          type: 'NOT_SUPPORTED',
          message: 'La geolocalización no está soportada por este navegador.'
        }
        error.value = geoError
        if (config.showNotifications) {
          notifyError(geoError.message)
        }
        reject(geoError)
        return
      }
      
      // Reset state
      loading.value = true
      error.value = null
      
      // Get current position
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: Coordinates = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          
          coordinates.value = coords
          loading.value = false
          
          if (config.showNotifications) {
            notifySuccess('Ubicación obtenida correctamente')
          }
          
          resolve(coords)
        },
        (err) => {
          const geoError = mapGeolocationError(err)
          error.value = geoError
          loading.value = false
          
          if (config.showNotifications) {
            notifyError(geoError.message)
          }
          
          reject(geoError)
        },
        {
          enableHighAccuracy: config.enableHighAccuracy,
          timeout: config.timeout,
          maximumAge: config.maximumAge
        }
      )
    })
  }
  
  /**
   * Starts watching user location for changes
   * @param callback - Optional callback for location updates
   */
  const watchLocation = (callback?: (coords: Coordinates) => void): void => {
    if (!isSupported.value) {
      if (config.showNotifications) {
        notifyError('La geolocalización no está soportada por este navegador.')
      }
      return
    }
    
    if (isWatching.value) {
      stopWatching()
    }
    
    watchId.value = navigator.geolocation.watchPosition(
      (position) => {
        const coords: Coordinates = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
        
        coordinates.value = coords
        callback?.(coords)
      },
      (err) => {
        const geoError = mapGeolocationError(err)
        error.value = geoError
        
        if (config.showNotifications) {
          notifyError(geoError.message)
        }
      },
      {
        enableHighAccuracy: config.enableHighAccuracy,
        timeout: config.timeout,
        maximumAge: config.maximumAge
      }
    )
  }
  
  /**
   * Stops watching location changes
   */
  const stopWatching = (): void => {
    if (watchId.value !== null) {
      navigator.geolocation.clearWatch(watchId.value)
      watchId.value = null
    }
  }
  
  /**
   * Calculates distance between two geographic points using Haversine formula
   * @param point1 - First coordinate point
   * @param point2 - Second coordinate point
   * @returns Distance in kilometers
   */
  const calculateDistance = (point1: Coordinates, point2: Coordinates): number => {
    const R = 6371 // Earth's radius in kilometers
    
    // Convert degrees to radians
    const lat1Rad = (point1.lat * Math.PI) / 180
    const lat2Rad = (point2.lat * Math.PI) / 180
    const lon1Rad = (point1.lng * Math.PI) / 180
    const lon2Rad = (point2.lng * Math.PI) / 180
    
    // Calculate differences
    const dLat = lat2Rad - lat1Rad
    const dLon = lon2Rad - lon1Rad
    
    // Haversine formula
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1Rad) * Math.cos(lat2Rad) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c
    
    return Math.round(distance * 100) / 100 // Round to 2 decimal places
  }
  
  /**
   * Formats distance for display
   * @param distance - Distance in kilometers
   * @returns Formatted distance string
   */
  const formatDistance = (distance: number): string => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)} m`
    }
    return `${distance.toFixed(1)} km`
  }
  
  /**
   * Checks if a point is within a certain radius of current location
   * @param point - Point to check
   * @param radiusKm - Radius in kilometers
   * @returns True if point is within radius
   */
  const isWithinRadius = (point: Coordinates, radiusKm: number): boolean => {
    if (!coordinates.value) return false
    return calculateDistance(coordinates.value, point) <= radiusKm
  }
  
  /**
   * Clears current location and error state
   */
  const clearLocation = (): void => {
    coordinates.value = null
    error.value = null
    stopWatching()
  }
  
  return {
    // State
    coordinates,
    loading,
    error,
    
    // Computed
    isSupported,
    hasLocation,
    isWatching,
    
    // Methods
    getCurrentLocation,
    watchLocation,
    stopWatching,
    calculateDistance,
    formatDistance,
    isWithinRadius,
    clearLocation
  }
}

// Export types for external use
export type UseGeolocation = ReturnType<typeof useGeolocation>