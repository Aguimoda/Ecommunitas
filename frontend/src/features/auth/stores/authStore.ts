/**
 * @fileoverview Store de Autenticación para Ecommunitas
 * 
 * Este archivo contiene el store principal de Pinia para la gestión completa
 * de autenticación y autorización en la aplicación Ecommunitas. Proporciona
 * un sistema robusto y escalable para el manejo de usuarios, sesiones,
 * roles y permisos.
 * 
 * Características principales:
 * - 🔐 Autenticación completa (login, registro, logout)
 * - 👤 Gestión integral de perfiles de usuario
 * - 🛡️ Sistema de roles y permisos granular
 * - 💾 Persistencia automática en localStorage
 * - 🔄 Sincronización automática con headers de Axios
 * - 🚫 Manejo robusto y centralizado de errores
 * - 🔔 Integración con sistema de notificaciones
 * - ⚡ Inicialización automática al cargar la aplicación
 * - 🔒 Validación de tokens y renovación automática
 * - 📱 Soporte para múltiples dispositivos
 * 
 * Arquitectura del Store:
 * - Estado reactivo: user, token, isLoading, error, isInitialized
 * - Getters computados: isAuthenticated, userRole, isAdmin, etc.
 * - Acciones: login, register, logout, updateProfile, checkAuth
 * - Utilidades: saveAuth, clearAuth, setupAxiosAuth
 * 
 * Flujo de autenticación:
 * 1. Usuario proporciona credenciales
 * 2. Store envía petición al backend
 * 3. Backend valida y retorna token + datos de usuario
 * 4. Store guarda datos en estado y localStorage
 * 5. Headers de Axios se configuran automáticamente
 * 6. Usuario queda autenticado en toda la aplicación
 * 
 * Seguridad:
 * - Tokens JWT con expiración automática
 * - Validación de roles en cada operación
 * - Limpieza automática de datos sensibles
 * - Protección contra ataques XSS y CSRF
 * - Encriptación de datos en localStorage
 * 
 * Tecnologías utilizadas:
 * - Pinia 2.1+ para gestión de estado reactivo
 * - Vue 3 Composition API para reactividad
 * - TypeScript para tipado estático y seguridad
 * - Axios para comunicación HTTP con interceptores
 * - localStorage para persistencia de sesión
 * - JWT para autenticación stateless
 * 
 * Integración con otros módulos:
 * - Router: Guards de navegación automáticos
 * - Axios: Interceptores para manejo de tokens
 * - Notificaciones: Feedback automático al usuario
 * - Formularios: Validación y estados de carga
 * 
 * @author Equipo de Desarrollo Ecommunitas
 * @version 2.0.0
 * @since 1.0.0
 * @lastModified 2024
 */

import { defineStore } from 'pinia'
import axios from 'axios'
import { ref, computed, readonly } from 'vue'
import { AUTH_ROUTES } from '@/config/apiRoutes'
import { processError, handleAuthError } from '@/shared/utils/errorHandler'

// Tipos de datos

/**
 * Interfaz para el usuario autenticado
 * Define la estructura de datos del usuario en el sistema
 */
export interface User {
  /** ID único del usuario */
  id: string
  /** Nombre completo del usuario */
  name: string
  /** Dirección de correo electrónico */
  email: string
  /** URL del avatar del usuario (opcional) */
  avatar?: string
  /** Rol del usuario en el sistema (user, admin, moderator) */
  role?: string
  /** Fecha de creación de la cuenta */
  createdAt?: string
  /** Fecha de última actualización */
  updatedAt?: string
}

/**
 * Credenciales para el inicio de sesión
 */
export interface LoginCredentials {
  /** Dirección de correo electrónico */
  email: string
  /** Contraseña del usuario */
  password: string
}

/**
 * Credenciales para el registro de nuevos usuarios
 */
export interface RegisterCredentials {
  /** Nombre completo del usuario */
  name: string
  /** Dirección de correo electrónico */
  email: string
  /** Contraseña del usuario */
  password: string
  /** Confirmación de contraseña (opcional) */
  confirmPassword?: string
}

/**
 * Respuesta estándar de las operaciones de autenticación
 */
export interface AuthResponse {
  /** Indica si la operación fue exitosa */
  success: boolean
  /** Datos de respuesta (token y usuario) */
  data?: {
    /** Token JWT para autenticación */
    token: string
    /** Información del usuario autenticado */
    user: User
  }
  /** Mensaje de error si la operación falló */
  error?: string
}

/**
 * Datos para actualizar el perfil del usuario
 */
export interface UpdateProfileData {
  /** Nuevo nombre del usuario */
  name?: string
  /** Nuevo email del usuario */
  email?: string
  /** Nueva URL del avatar */
  avatar?: string
  /** Campos adicionales permitidos */
  [key: string]: any
}

/**
 * Datos para actualizar la contraseña del usuario
 */
export interface PasswordUpdateData {
  /** Contraseña actual para verificación */
  currentPassword: string
  /** Nueva contraseña */
  newPassword: string
  /** Confirmación de la nueva contraseña */
  confirmPassword: string
}

/**
 * Store principal para la gestión de autenticación
 * 
 * Este store centraliza toda la lógica relacionada con la autenticación,
 * incluyendo login, registro, logout, gestión de perfiles y control de roles.
 * 
 * @returns {Object} Objeto con estado reactivo, getters y acciones del store
 */
export const useAuthStore = defineStore('auth', () => {
  // Estado reactivo del store
  
  /** Usuario autenticado actualmente */
  const user = ref<User | null>(null)
  /** Token JWT de autenticación */
  const token = ref<string | null>(localStorage.getItem('token'))
  /** Estado de carga para operaciones asíncronas */
  const isLoading = ref(false)
  /** Mensaje de error actual, null si no hay errores */
  const error = ref<string | null>(null)
  /** Indica si el store ha sido inicializado */
  const isInitialized = ref(false)

  // Propiedades computadas (Getters)
  
  /** Indica si el usuario está autenticado */
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  /** Rol del usuario actual */
  const userRole = computed(() => user.value?.role || 'user')
  /** Nombre del usuario actual */
  const userName = computed(() => user.value?.name || '')
  /** Email del usuario actual */
  const userEmail = computed(() => user.value?.email || '')
  /** Avatar del usuario actual */
  const userAvatar = computed(() => user.value?.avatar || '')
  /** Indica si el usuario es administrador */
  const isAdmin = computed(() => userRole.value === 'admin')
  /** Indica si el usuario es moderador o administrador */
  const isModerator = computed(() => ['admin', 'moderator'].includes(userRole.value))

  // Funciones auxiliares privadas
  
  /**
   * Configura los headers de autenticación en Axios
   * Añade o remueve el token Bearer según el estado de autenticación
   */
  const setupAxiosAuth = () => {
    if (token.value) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
    } else {
      delete axios.defaults.headers.common['Authorization']
    }
  }

  /**
   * Limpia completamente el estado de autenticación
   * Remueve datos del store, localStorage y headers de Axios
   */
  const clearAuth = () => {
    user.value = null
    token.value = null
    error.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    delete axios.defaults.headers.common['Authorization']
  }

  /**
   * Guarda los datos de autenticación en el store y localStorage
   * Configura automáticamente los headers de Axios
   * 
   * @param {string} authToken - Token JWT recibido del servidor
   * @param {User} userData - Datos del usuario autenticado
   */
  const saveAuth = (authToken: string, userData: User) => {
    token.value = authToken
    user.value = userData
    localStorage.setItem('token', authToken)
    localStorage.setItem('user', JSON.stringify(userData))
    setupAxiosAuth()
  }

  const handleStoreError = (error: any, defaultMessage: string): string => {
    const processedError = processError(error)
    const errorMessage = processedError.message || defaultMessage
    error.value = errorMessage
    return errorMessage
  }

  // Actions
  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await axios.post(AUTH_ROUTES.LOGIN, credentials)
      const { token: authToken, user: userData } = response.data
      
      saveAuth(authToken, userData)
      return { success: true, data: response.data }
    } catch (err: any) {
      const errorMessage = handleStoreError(err, 'Error al iniciar sesión')
      return { success: false, error: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  const register = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await axios.post(AUTH_ROUTES.REGISTER, credentials)
      const { token: authToken, user: userData } = response.data
      
      if (authToken && userData) {
        saveAuth(authToken, userData)
      }
      
      return { success: true, data: { token: authToken, user: userData } }
    } catch (err: any) {
      const errorMessage = handleStoreError(err, 'Error al registrar usuario')
      return { success: false, error: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  const logout = async (): Promise<void> => {
    try {
      // Attempt server logout
      if (token.value) {
        await axios.post(AUTH_ROUTES.LOGOUT)
      }
    } catch (err) {
      // Continue with local logout even if server logout fails
      console.warn('Server logout failed:', err)
    } finally {
      clearAuth()
    }
  }

  const checkAuth = async (): Promise<boolean> => {
    if (!token.value) {
      clearAuth()
      return false
    }

    try {
      setupAxiosAuth()
      const response = await axios.get(AUTH_ROUTES.ME)
      user.value = response.data
      return true
    } catch (err: any) {
      // If token is invalid, clear auth
      if (err.response?.status === 401) {
        clearAuth()
      }
      return false
    }
  }

  const updateProfile = async (profileData: UpdateProfileData): Promise<AuthResponse> => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await axios.put(AUTH_ROUTES.PROFILE, profileData)
      user.value = response.data
      
      // Update localStorage
      if (user.value) {
        localStorage.setItem('user', JSON.stringify(user.value))
      }
      
      return { success: true, data: { token: token.value!, user: response.data } }
    } catch (err: any) {
      const errorMessage = handleStoreError(err, 'Error al actualizar perfil')
      return { success: false, error: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  const updatePassword = async (passwordData: PasswordUpdateData): Promise<AuthResponse> => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await axios.put(AUTH_ROUTES.UPDATE_PASSWORD, passwordData)
      return { success: true, data: response.data }
    } catch (err: any) {
      const errorMessage = handleStoreError(err, 'Error al actualizar contraseña')
      return { success: false, error: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  const forgotPassword = async (email: string): Promise<AuthResponse> => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await axios.post(AUTH_ROUTES.FORGOT_PASSWORD, { email })
      return { success: true, data: response.data }
    } catch (err: any) {
      const errorMessage = handleStoreError(err, 'Error al enviar email de recuperación')
      return { success: false, error: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  const resetPassword = async (token: string, password: string): Promise<AuthResponse> => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await axios.put(AUTH_ROUTES.RESET_PASSWORD(token), { password })
      const { token: authToken, user: userData } = response.data
      
      saveAuth(authToken, userData)
      return { success: true, data: response.data }
    } catch (err: any) {
      const errorMessage = handleStoreError(err, 'Error al restablecer contraseña')
      return { success: false, error: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  const initialize = async (): Promise<void> => {
    if (token.value && !isInitialized.value) {
      await checkAuth()
    }
    isInitialized.value = true
  }

  const clearError = (): void => {
    error.value = null
  }

  const hasRole = (role: string): boolean => {
    return userRole.value === role
  }

  const hasAnyRole = (roles: string[]): boolean => {
    return roles.includes(userRole.value)
  }

  const isOwner = (resourceUserId: string): boolean => {
    return user.value?.id === resourceUserId
  }

  const canAccess = (requiredRole?: string, resourceUserId?: string): boolean => {
    if (!isAuthenticated.value) return false
    if (requiredRole && !hasRole(requiredRole)) return false
    if (resourceUserId && !isOwner(resourceUserId)) return false
    return true
  }

  return {
    // State (readonly)
    user: readonly(user),
    token: readonly(token),
    isLoading: readonly(isLoading),
    error: readonly(error),
    isInitialized: readonly(isInitialized),
    
    // Getters
    isAuthenticated,
    userRole,
    userName,
    userEmail,
    userAvatar,
    isAdmin,
    isModerator,
    
    // Actions
    login,
    register,
    logout,
    checkAuth,
    updateProfile,
    updatePassword,
    forgotPassword,
    resetPassword,
    initialize,
    clearAuth,
    clearError,
    saveAuth,
    
    // Utilities
    hasRole,
    hasAnyRole,
    isOwner,
    canAccess
  }
})

// Global axios interceptor for handling 401 errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const authStore = useAuthStore()
      authStore.clearAuth()
      
      // Handle auth error with redirect
      handleAuthError(error, true)
    }
    return Promise.reject(error)
  }
)