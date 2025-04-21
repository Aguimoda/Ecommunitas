/**
 * @file useAuthManager.ts
 * @description Composable para la gestión centralizada de autenticación
 * Implementa un sistema de autenticación con JWT, reintentos inteligentes,
 * tracking de actividad y prevención de múltiples mounts.
 */

import { ref, computed, watch, onMounted, onUnmounted, readonly } from 'vue'
import axios, { AxiosError } from 'axios'
import { useRouter } from 'vue-router'
import { useActivityTracking } from './useActivityTracking'
import { useAxiosInterceptors } from './useAxiosInterceptors'
import { AuthState, LoginCredentials, RegisterCredentials, User, AuthOptions } from '../types/auth'

// Singleton para prevenir múltiples instancias
let authInstance: ReturnType<typeof createAuthManager> | null = null
let mountCount = 0

/**
 * Composable para la gestión centralizada de autenticación
 * @param options Opciones de configuración para la autenticación
 * @returns Objeto con métodos y estado para manejar la autenticación
 */
export function useAuthManager(options: Partial<AuthOptions> = {}) {
  // Si ya existe una instancia, retornarla para mantener un estado global
  if (authInstance) {
    mountCount++
    return authInstance
  }
  
  // Crear una nueva instancia si no existe
  authInstance = createAuthManager(options)
  mountCount++
  
  return authInstance
}

/**
 * Función interna para crear la instancia de autenticación
 * @param customOptions Opciones de configuración para la autenticación
 * @returns Objeto con métodos y estado para manejar la autenticación
 */
function createAuthManager(customOptions: Partial<AuthOptions> = {}) {
  const router = useRouter()
  
  // Opciones por defecto
  const defaultOptions: AuthOptions = {
    apiBaseUrl: '/api',
    tokenExpiration: 24 * 60 * 60 * 1000, // 24 horas
    maxRetries: 3,
    retryDelay: 1000,
    autoRefreshToken: true,
    refreshTokenInterval: 15 * 60 * 1000, // 15 minutos
    trackActivity: true,
    inactivityTimeout: 30 * 60 * 1000 // 30 minutos
  }
  
  // Combinar opciones por defecto con las personalizadas
  const options: AuthOptions = { ...defaultOptions, ...customOptions }
  
  // Estado de autenticación (privado)
  const state = ref<AuthState>({
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: !!localStorage.getItem('token'),
    isLoading: false,
    error: null,
    lastActivity: Date.now()
  })
  
  // Contador de reintentos para operaciones fallidas
  const retryCount = ref(0)
  
  // Intervalo para refrescar el token
  let refreshTokenInterval: number | null = null
  
  // Configurar interceptores de Axios para reintentos inteligentes
  const { setupInterceptors, isRetrying } = useAxiosInterceptors()
  const cleanupInterceptors = setupInterceptors({
    maxRetries: options.maxRetries,
    retryDelay: options.retryDelay,
    retryableStatusCodes: [408, 429, 500, 502, 503, 504] // Códigos de error retryables
  })
  
  // Integración con tracking de actividad
  const activity = options.trackActivity ? useActivityTracking({
    inactivityTimeout: options.inactivityTimeout,
    onInactive: () => {
      // Opcional: cerrar sesión por inactividad
      // logout()
      console.log('Usuario inactivo por', options.inactivityTimeout, 'ms')
    }
  }) : null
  
  /**
   * Actualiza el tiempo de última actividad
   */
  const updateActivity = () => {
    state.value.lastActivity = Date.now()
    activity?.updateActivity()
  }
  
  /**
   * Configura los headers de autorización para las peticiones
   */
  const setAuthHeader = () => {
    if (state.value.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${state.value.token}`
    } else {
      delete axios.defaults.headers.common['Authorization']
    }
  }
  
  /**
   * Guarda el token en localStorage con medidas de seguridad
   * @param token Token JWT a guardar
   */
  const saveToken = (token: string) => {
    // Guardar token en localStorage
    localStorage.setItem('token', token)
    state.value.token = token
    state.value.isAuthenticated = true
    setAuthHeader()
    updateActivity()
  }
  
  /**
   * Elimina el token y datos de sesión
   */
  const clearToken = () => {
    localStorage.removeItem('token')
    state.value.token = null
    state.value.user = null
    state.value.isAuthenticated = false
    delete axios.defaults.headers.common['Authorization']
  }
  
  /**
   * Obtiene información del usuario actual
   */
  const fetchUserProfile = async () => {
    if (!state.value.token) return
    
    try {
      state.value.isLoading = true
      state.value.error = null
      
      const response = await axios.get(`${options.apiBaseUrl}/v1/auth/me`)
      state.value.user = response.data
      updateActivity()
      return response.data
    } catch (err) {
      const error = err as AxiosError
      
      // Si el error es de autorización, limpiar token
      if (error.response?.status === 401) {
        clearToken()
        router.push('/login')
      } else if (retryCount.value < (options.maxRetries || 3)) {
        // Implementar reintentos inteligentes
        retryCount.value++
        await new Promise(resolve => setTimeout(resolve, (options.retryDelay || 1000) * retryCount.value))
        return fetchUserProfile()
      } else {
        state.value.error = 'Error al obtener perfil de usuario'
        console.error('Error al obtener perfil:', error)
      }
    } finally {
      state.value.isLoading = false
      retryCount.value = 0 // Resetear contador de reintentos
    }
  }
  
  /**
   * Inicia sesión con email y contraseña
   * @param credentials Credenciales de inicio de sesión
   */
  const login = async (credentials: LoginCredentials) => {
    try {
      state.value.isLoading = true
      state.value.error = null
      
      const response = await axios.post(`${options.apiBaseUrl}/v1/auth/login`, credentials)
      
      // Guardar token y configurar estado
      saveToken(response.data.token)
      
      // Obtener información del usuario
      await fetchUserProfile()
      
      return true
    } catch (err) {
      const error = err as AxiosError
      
      if (error.response?.status === 401) {
        state.value.error = 'Credenciales incorrectas'
      } else if (retryCount.value < (options.maxRetries || 3)) {
        // Implementar reintentos inteligentes
        retryCount.value++
        await new Promise(resolve => setTimeout(resolve, (options.retryDelay || 1000) * retryCount.value))
        return login(credentials)
      } else {
        state.value.error = 'Error al iniciar sesión'
        console.error('Error de login:', error)
      }
      
      return false
    } finally {
      state.value.isLoading = false
      retryCount.value = 0 // Resetear contador de reintentos
    }
  }
  
  /**
   * Registra un nuevo usuario
   * @param credentials Datos de registro
   */
  const register = async (credentials: RegisterCredentials) => {
    try {
      state.value.isLoading = true
      state.value.error = null
      
      const response = await axios.post(`${options.apiBaseUrl}/v1/auth/register`, credentials)
      
      // Guardar token y configurar estado
      saveToken(response.data.token)
      
      // Obtener información del usuario
      await fetchUserProfile()
      
      return true
    } catch (err) {
      const error = err as AxiosError
      
      if (error.response?.status === 409) {
        state.value.error = 'El email ya está registrado'
      } else if (retryCount.value < (options.maxRetries || 3)) {
        // Implementar reintentos inteligentes
        retryCount.value++
        await new Promise(resolve => setTimeout(resolve, (options.retryDelay || 1000) * retryCount.value))
        return register(credentials)
      } else {
        state.value.error = 'Error al registrar usuario'
        console.error('Error de registro:', error)
      }
      
      return false
    } finally {
      state.value.isLoading = false
      retryCount.value = 0 // Resetear contador de reintentos
    }
  }
  
  /**
   * Cierra la sesión del usuario
   */
  const logout = () => {
    clearToken()
    router.push('/login')
  }
  
  /**
   * Verifica si el token actual es válido
   */
  const validateToken = async () => {
    if (!state.value.token) return false
    
    try {
      // Hacer una petición simple para validar el token
      await axios.get(`${options.apiBaseUrl}/auth/validate`)
      updateActivity() // Actualizar actividad en validaciones exitosas
      return true
    } catch (err) {
      const error = err as AxiosError
      
      if (error.response?.status === 401) {
        clearToken()
        return false
      }
      
      // Si hay otros errores (como de red), mantener el token
      return !!state.value.token
    }
  }
  
  /**
   * Inicializa el sistema de autenticación
   */
  const initialize = async () => {
    setAuthHeader()
    
    if (state.value.token) {
      const isValid = await validateToken()
      
      if (isValid) {
        await fetchUserProfile()
      }
    }
  }
  
  // Observar cambios en el token
  watch(() => state.value.token, (newToken) => {
    if (newToken) {
      setAuthHeader()
    } else {
      delete axios.defaults.headers.common['Authorization']
    }
  })
  
  // Configurar listeners de eventos para tracking de actividad
  onMounted(() => {
    // Inicializar autenticación
    initialize()
    
    // Configurar intervalo para verificar token
    if (options.autoRefreshToken) {
      refreshTokenInterval = window.setInterval(
        validateToken, 
        options.refreshTokenInterval || 15 * 60 * 1000
      )
    }
  })
  
  // Limpiar recursos al desmontar
  onUnmounted(() => {
    mountCount--
    
    // Solo limpiar recursos si no hay más instancias montadas
    if (mountCount === 0) {
      if (refreshTokenInterval) {
        clearInterval(refreshTokenInterval)
        refreshTokenInterval = null
      }
      
      // Limpiar interceptores de Axios
      cleanupInterceptors()
      
      // Limpiar instancia singleton
      authInstance = null
    }
  })
  
  // Exponer estado y métodos (usando readonly para el estado para prevenir modificaciones externas)
  return {
    // Estado reactivo (solo lectura)
    user: computed(() => state.value.user),
    isAuthenticated: computed(() => state.value.isAuthenticated),
    isLoading: computed(() => state.value.isLoading),
    error: computed(() => state.value.error),
    lastActivity: computed(() => state.value.lastActivity),
    isRetrying: readonly(isRetrying), // Estado de reintento desde interceptores
    
    // Métodos
    login,
    register,
    logout,
    fetchUserProfile,
    validateToken,
    updateActivity
  }
}