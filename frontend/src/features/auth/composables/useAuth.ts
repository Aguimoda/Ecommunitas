/**
 * @file useAuth.ts
 * @description Composable para gestión de autenticación en Ecommunitas
 * 
 * Este composable proporciona una interfaz unificada para todas las operaciones
 * relacionadas con la autenticación de usuarios en la aplicación.
 * 
 * Funcionalidades principales:
 * - Inicio de sesión con email y contraseña
 * - Registro de nuevos usuarios
 * - Cierre de sesión
 * - Verificación de estado de autenticación
 * - Gestión de tokens JWT
 * - Manejo de errores de autenticación
 * - Persistencia de sesión en localStorage
 * 
 * Características técnicas:
 * - Utiliza Pinia store para gestión de estado
 * - Integración con API REST del backend
 * - Manejo de errores con feedback al usuario
 * - Validación de formularios
 * - Redirección automática después de autenticación
 * 
 * @author Equipo de Desarrollo Ecommunitas
 * @version 1.0.0
 */

// Importaciones de Vue y librerías externas
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

// Importaciones de stores y servicios locales
import { useAuthStore } from '../stores/authStore'
import { authService } from '../services/authService'

// Importaciones de tipos TypeScript
import type { LoginCredentials, RegisterData, User } from '../types'

/**
 * Composable useAuth
 * 
 * Proporciona una interfaz reactiva para todas las operaciones de autenticación.
 * Este composable actúa como una capa de abstracción entre los componentes
 * y el store de autenticación, facilitando el uso y mantenimiento.
 * 
 * @returns {Object} Objeto con propiedades reactivas y métodos de autenticación
 */
export function useAuth() {
  /**
   * Inicialización del router de Vue
   * Utilizado para navegación programática después de operaciones de auth
   */
  const router = useRouter()
  
  /**
   * Inicialización del store de autenticación
   * Contiene todo el estado global relacionado con la autenticación
   */
  const authStore = useAuthStore()
  
  /**
   * Estados reactivos locales para el manejo de la UI
   * Estos estados se utilizan para mostrar feedback al usuario
   */
  
  /** Estado de carga para operaciones de autenticación */
  const isLoading = ref(false)
  
  /** Mensaje de error para mostrar al usuario */
  const error = ref('')
  
  /** Mensaje de éxito para operaciones completadas */
  const successMessage = ref('')
  
  /**
   * Propiedades computadas que exponen el estado del store
   * Estas propiedades son reactivas y se actualizan automáticamente
   */
  
  /** Usuario actualmente autenticado (null si no hay sesión) */
  const user = computed(() => authStore.user)
  
  /** Estado de autenticación del usuario */
  const isAuthenticated = computed(() => authStore.isAuthenticated)
  
  /** Token JWT actual (null si no hay sesión) */
  const token = computed(() => authStore.token)
  
  /** Rol del usuario actual (para control de acceso) */
  const userRole = computed(() => authStore.user?.role)
  
  /** Permisos del usuario actual */
  const userPermissions = computed(() => authStore.user?.permissions || [])
  
  /**
   * Función para limpiar mensajes de error y éxito
   * Utilizada antes de iniciar nuevas operaciones
   */
  const clearMessages = () => {
    error.value = ''
    successMessage.value = ''
  }
  
  /**
   * Función para manejar errores de autenticación
   * Procesa diferentes tipos de errores y muestra mensajes apropiados
   * 
   * @param {Error} err - Error capturado durante la operación
   */
  const handleAuthError = (err: any) => {
    console.error('Error de autenticación:', err)
    
    // Determinar el mensaje de error apropiado basado en el tipo de error
    if (err.response?.status === 401) {
      error.value = 'Credenciales inválidas. Por favor, verifica tu email y contraseña.'
    } else if (err.response?.status === 403) {
      error.value = 'No tienes permisos para realizar esta acción.'
    } else if (err.response?.status === 422) {
      // Errores de validación del servidor
      const validationErrors = err.response.data?.errors
      if (validationErrors) {
        error.value = Object.values(validationErrors).flat().join(', ')
      } else {
        error.value = 'Datos inválidos. Por favor, revisa la información ingresada.'
      }
    } else if (err.response?.status === 429) {
      error.value = 'Demasiados intentos. Por favor, espera unos minutos antes de intentar nuevamente.'
    } else if (err.code === 'NETWORK_ERROR' || !err.response) {
      error.value = 'Error de conexión. Por favor, verifica tu conexión a internet.'
    } else {
      error.value = err.response?.data?.message || 'Ha ocurrido un error inesperado. Por favor, intenta nuevamente.'
    }
  }
  
  /**
   * Función de inicio de sesión
   * 
   * Autentica al usuario con email y contraseña, almacena el token
   * y redirige a la página apropiada según el rol del usuario.
   * 
   * @param {LoginCredentials} credentials - Credenciales de inicio de sesión
   * @param {string} credentials.email - Email del usuario
   * @param {string} credentials.password - Contraseña del usuario
   * @param {boolean} credentials.rememberMe - Si mantener la sesión activa
   * @returns {Promise<boolean>} True si el login fue exitoso, false en caso contrario
   */
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      // Limpiar mensajes previos y activar estado de carga
      clearMessages()
      isLoading.value = true
      
      // Validación básica de credenciales
      if (!credentials.email || !credentials.password) {
        error.value = 'Por favor, ingresa tu email y contraseña.'
        return false
      }
      
      // Validación de formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(credentials.email)) {
        error.value = 'Por favor, ingresa un email válido.'
        return false
      }
      
      // Realizar petición de autenticación al servidor
      const response = await authService.login(credentials)
      
      // Verificar que la respuesta contenga los datos necesarios
      if (!response.data.token || !response.data.user) {
        throw new Error('Respuesta inválida del servidor')
      }
      
      // Actualizar el store con los datos del usuario autenticado
      authStore.saveAuth(response.data.token, response.data.user)
      
      // Configurar persistencia de sesión si se solicitó
      if (credentials.rememberMe) {
        localStorage.setItem('rememberMe', 'true')
      }
      
      // Mostrar mensaje de éxito
      successMessage.value = `¡Bienvenido/a, ${response.data.user.name}!`
      
      // Redirigir según el rol del usuario
      const redirectPath = getRedirectPath(response.data.user.role)
      await router.push(redirectPath)
      
      return true
      
    } catch (err) {
      // Manejar errores de autenticación
      handleAuthError(err)
      return false
      
    } finally {
      // Desactivar estado de carga
      isLoading.value = false
    }
  }
  
  /**
   * Función de registro de usuario
   * 
   * Registra un nuevo usuario en el sistema y opcionalmente
   * inicia sesión automáticamente después del registro.
   * 
   * @param {RegisterData} userData - Datos del nuevo usuario
   * @param {boolean} autoLogin - Si iniciar sesión automáticamente después del registro
   * @returns {Promise<boolean>} True si el registro fue exitoso, false en caso contrario
   */
  const register = async (userData: RegisterData, autoLogin: boolean = true): Promise<boolean> => {
    try {
      // Limpiar mensajes previos y activar estado de carga
      clearMessages()
      isLoading.value = true
      
      // Validación de datos requeridos
      const requiredFields = ['name', 'email', 'password']
      const missingFields = requiredFields.filter(field => !userData[field])
      
      if (missingFields.length > 0) {
        error.value = `Por favor, completa los siguientes campos: ${missingFields.join(', ')}`
        return false
      }
      
      // Validación de formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(userData.email)) {
        error.value = 'Por favor, ingresa un email válido.'
        return false
      }
      
      // Validación de fortaleza de contraseña
      if (userData.password.length < 8) {
        error.value = 'La contraseña debe tener al menos 8 caracteres.'
        return false
      }
      
      // Validación de confirmación de contraseña
      if (userData.password !== userData.confirmPassword) {
        error.value = 'Las contraseñas no coinciden.'
        return false
      }
      
      // Realizar petición de registro al servidor
      const response = await authService.register(userData)
      
      // Mostrar mensaje de éxito
      successMessage.value = '¡Registro exitoso! Tu cuenta ha sido creada.'
      
      // Iniciar sesión automáticamente si se solicitó
      if (autoLogin && response.data.token && response.data.user) {
        authStore.saveAuth(response.data.token, response.data.user)
        
        // Redirigir a la página de bienvenida o dashboard
        await router.push('/welcome')
      } else {
        // Redirigir a la página de login para que el usuario inicie sesión
        await router.push('/login')
      }
      
      return true
      
    } catch (err) {
      // Manejar errores de registro
      handleAuthError(err)
      return false
      
    } finally {
      // Desactivar estado de carga
      isLoading.value = false
    }
  }
  
  /**
   * Función de cierre de sesión
   * 
   * Cierra la sesión del usuario actual, limpia el almacenamiento local
   * y redirige a la página de inicio.
   * 
   * @param {boolean} showMessage - Si mostrar mensaje de confirmación
   * @returns {Promise<void>}
   */
  const logout = async (showMessage: boolean = true): Promise<void> => {
    try {
      // Limpiar mensajes previos
      clearMessages()
      
      // Intentar notificar al servidor sobre el cierre de sesión
      try {
        await authService.logout()
      } catch (err) {
        // Si falla la notificación al servidor, continuar con el logout local
        console.warn('No se pudo notificar al servidor sobre el logout:', err)
      }
      
      // Limpiar el estado de autenticación
      await authStore.clearAuth()
      
      // Limpiar datos de persistencia
      localStorage.removeItem('rememberMe')
      
      // Mostrar mensaje de confirmación si se solicitó
      if (showMessage) {
        successMessage.value = 'Sesión cerrada exitosamente.'
      }
      
      // Redirigir a la página de inicio
      await router.push('/')
      
    } catch (err) {
      console.error('Error durante el logout:', err)
      // Forzar limpieza local incluso si hay errores
      await authStore.clearAuth()
      await router.push('/')
    }
  }
  
  /**
   * Función para verificar si el usuario tiene un rol específico
   * 
   * @param {string} role - Rol a verificar
   * @returns {boolean} True si el usuario tiene el rol especificado
   */
  const hasRole = (role: string): boolean => {
    return authStore.user?.role === role
  }
  
  /**
   * Función para verificar si el usuario tiene un permiso específico
   * 
   * @param {string} permission - Permiso a verificar
   * @returns {boolean} True si el usuario tiene el permiso especificado
   */
  const hasPermission = (permission: string): boolean => {
    return authStore.user?.permissions?.includes(permission) || false
  }
  
  /**
   * Función para verificar si el usuario puede acceder a una ruta
   * 
   * @param {string} routeName - Nombre de la ruta
   * @param {string[]} requiredRoles - Roles requeridos para acceder
   * @param {string[]} requiredPermissions - Permisos requeridos para acceder
   * @returns {boolean} True si el usuario puede acceder
   */
  const canAccess = (routeName: string, requiredRoles?: string[], requiredPermissions?: string[]): boolean => {
    // Si no está autenticado, no puede acceder a rutas protegidas
    if (!isAuthenticated.value) {
      return false
    }
    
    // Verificar roles requeridos
    if (requiredRoles && requiredRoles.length > 0) {
      const hasRequiredRole = requiredRoles.some(role => hasRole(role))
      if (!hasRequiredRole) {
        return false
      }
    }
    
    // Verificar permisos requeridos
    if (requiredPermissions && requiredPermissions.length > 0) {
      const hasRequiredPermission = requiredPermissions.some(permission => hasPermission(permission))
      if (!hasRequiredPermission) {
        return false
      }
    }
    
    return true
  }
  
  /**
   * Función para obtener la ruta de redirección según el rol del usuario
   * 
   * @param {string} role - Rol del usuario
   * @returns {string} Ruta de redirección
   */
  const getRedirectPath = (role: string): string => {
    switch (role) {
      case 'admin':
        return '/admin/dashboard'
      case 'moderator':
        return '/moderator/dashboard'
      case 'user':
      default:
        return '/feed'
    }
  }
  
  /**
   * Función para refrescar el token de autenticación
   * 
   * @returns {Promise<boolean>} True si el refresh fue exitoso
   */
  const refreshToken = async (): Promise<boolean> => {
    try {
      const response = await authService.refreshToken()
      
      if (response.data.token) {
        await authStore.updateToken(response.data.token)
        return true
      }
      
      return false
      
    } catch (err) {
      console.error('Error al refrescar token:', err)
      // Si falla el refresh, cerrar sesión
      await logout(false)
      return false
    }
  }
  
  /**
   * Función para verificar la validez del token actual
   * 
   * @returns {Promise<boolean>} True si el token es válido
   */
  const verifyToken = async (): Promise<boolean> => {
    try {
      if (!token.value) {
        return false
      }
      
      const response = await authService.verifyToken()
      return response.data.valid
      
    } catch (err) {
      console.error('Error al verificar token:', err)
      return false
    }
  }
  
  /**
   * Función para actualizar el perfil del usuario
   * 
   * @param {Partial<User>} userData - Datos a actualizar
   * @returns {Promise<boolean>} True si la actualización fue exitosa
   */
  const updateProfile = async (userData: Partial<User>): Promise<boolean> => {
    try {
      clearMessages()
      isLoading.value = true
      
      const response = await authService.updateProfile(userData)
      
      // Actualizar el usuario en el store
      await authStore.updateUser(response.data.user)
      
      successMessage.value = 'Perfil actualizado exitosamente.'
      return true
      
    } catch (err) {
      handleAuthError(err)
      return false
      
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * Función para cambiar la contraseña del usuario
   * 
   * @param {string} currentPassword - Contraseña actual
   * @param {string} newPassword - Nueva contraseña
   * @param {string} confirmPassword - Confirmación de nueva contraseña
   * @returns {Promise<boolean>} True si el cambio fue exitoso
   */
  const changePassword = async (currentPassword: string, newPassword: string, confirmPassword: string): Promise<boolean> => {
    try {
      clearMessages()
      isLoading.value = true
      
      // Validaciones
      if (!currentPassword || !newPassword || !confirmPassword) {
        error.value = 'Todos los campos son requeridos.'
        return false
      }
      
      if (newPassword !== confirmPassword) {
        error.value = 'Las contraseñas no coinciden.'
        return false
      }
      
      if (newPassword.length < 8) {
        error.value = 'La nueva contraseña debe tener al menos 8 caracteres.'
        return false
      }
      
      await authService.changePassword({
        currentPassword,
        newPassword,
        confirmPassword
      })
      
      successMessage.value = 'Contraseña cambiada exitosamente.'
      return true
      
    } catch (err) {
      handleAuthError(err)
      return false
      
    } finally {
      isLoading.value = false
    }
  }
  
  // Retornar la interfaz pública del composable
  return {
    // Estados reactivos
    user,
    isAuthenticated,
    token,
    userRole,
    userPermissions,
    isLoading,
    error,
    successMessage,
    
    // Métodos de autenticación
    login,
    register,
    logout,
    refreshToken,
    verifyToken,
    
    // Métodos de autorización
    hasRole,
    hasPermission,
    canAccess,
    
    // Métodos de gestión de perfil
    updateProfile,
    changePassword,
    
    // Métodos utilitarios
    clearMessages,
    getRedirectPath
  }
}