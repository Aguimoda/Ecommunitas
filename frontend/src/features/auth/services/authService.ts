/**
 * @fileoverview Servicio de Autenticación para comunicación con la API
 * 
 * Este servicio centraliza todas las operaciones de autenticación y autorización,
 * proporcionando una interfaz completa para el manejo de usuarios, sesiones
 * y seguridad en la aplicación.
 * 
 * Características principales:
 * - Autenticación de usuarios (login/logout)
 * - Registro de nuevos usuarios
 * - Gestión de perfiles de usuario
 * - Actualización de contraseñas
 * - Recuperación de contraseñas
 * - Verificación de tokens y roles
 * - Renovación automática de tokens
 * - Manejo robusto de errores
 * 
 * Tecnologías utilizadas:
 * - Axios para peticiones HTTP
 * - JWT para autenticación
 * - TypeScript para tipado estático
 * - LocalStorage para persistencia de tokens
 * - FormData para subida de archivos
 * 
 * @author Sistema de Autenticación
 * @version 1.0.0
 */

import axios, { AxiosResponse } from 'axios'
import { AUTH_ROUTES } from '@/config/apiRoutes'
import { processError, handleAuthError } from '@/shared/utils/errorHandler'

/**
 * Interfaz que define la estructura de un usuario del sistema
 * 
 * Contiene toda la información básica de un usuario registrado,
 * incluyendo datos de identificación, perfil y metadatos.
 * 
 * @interface User
 */
export interface User {
  /** Identificador único del usuario */
  id: string
  /** Nombre completo del usuario */
  name: string
  /** Dirección de correo electrónico del usuario */
  email: string
  /** URL del avatar del usuario (opcional) */
  avatar?: string
  /** Rol del usuario en el sistema (opcional) */
  role?: string
  /** Fecha de creación de la cuenta (opcional) */
  createdAt?: string
  /** Fecha de última actualización del perfil (opcional) */
  updatedAt?: string
}

/**
 * Interfaz para las credenciales de inicio de sesión
 * 
 * Define los datos requeridos para que un usuario
 * pueda autenticarse en el sistema.
 * 
 * @interface LoginCredentials
 */
export interface LoginCredentials {
  /** Correo electrónico del usuario */
  email: string
  /** Contraseña del usuario */
  password: string
}

/**
 * Interfaz para las credenciales de registro
 * 
 * Define los datos necesarios para crear una nueva
 * cuenta de usuario en el sistema.
 * 
 * @interface RegisterCredentials
 */
export interface RegisterCredentials {
  /** Nombre completo del usuario */
  name: string
  /** Correo electrónico del usuario */
  email: string
  /** Contraseña del usuario */
  password: string
  /** Confirmación de contraseña (opcional) */
  confirmPassword?: string
}

/**
 * Interfaz para la respuesta de autenticación
 * 
 * Formato estándar de respuesta del servidor para
 * operaciones de autenticación exitosas.
 * 
 * @interface AuthResponse
 */
export interface AuthResponse {
  /** Indica si la operación fue exitosa */
  success: boolean
  /** Token de autenticación JWT */
  token: string
  /** Datos del usuario autenticado */
  user: User
  /** Mensaje adicional del servidor (opcional) */
  message?: string
}

/**
 * Interfaz para los datos de actualización de perfil
 * 
 * Define los campos que pueden ser modificados en
 * el perfil de un usuario existente.
 * 
 * @interface UpdateProfileData
 */
export interface UpdateProfileData {
  /** Nuevo nombre del usuario (opcional) */
  name?: string
  /** Nuevo correo electrónico (opcional) */
  email?: string
  /** Nueva URL de avatar (opcional) */
  avatar?: string
  /** Campos adicionales dinámicos */
  [key: string]: any
}

/**
 * Interfaz para los datos de actualización de contraseña
 * 
 * Define la estructura requerida para cambiar la contraseña
 * de un usuario autenticado.
 * 
 * @interface PasswordUpdateData
 */
export interface PasswordUpdateData {
  /** Contraseña actual del usuario */
  currentPassword: string
  /** Nueva contraseña deseada */
  newPassword: string
  /** Confirmación de la nueva contraseña */
  confirmPassword: string
}

/**
 * Interfaz para los datos de recuperación de contraseña
 * 
 * Define los datos necesarios para iniciar el proceso
 * de recuperación de contraseña.
 * 
 * @interface ForgotPasswordData
 */
export interface ForgotPasswordData {
  /** Correo electrónico para enviar el enlace de recuperación */
  email: string
}

/**
 * Interfaz para los datos de restablecimiento de contraseña
 * 
 * Define la estructura para establecer una nueva contraseña
 * usando un token de recuperación.
 * 
 * @interface ResetPasswordData
 */
export interface ResetPasswordData {
  /** Nueva contraseña del usuario */
  password: string
  /** Confirmación de la nueva contraseña */
  confirmPassword: string
}

/**
 * Clase de Servicio de Autenticación
 * 
 * Centraliza todas las operaciones de autenticación y autorización,
 * proporcionando una interfaz unificada para el manejo de usuarios,
 * sesiones y seguridad en la aplicación.
 * 
 * Proporciona métodos para:
 * - Autenticación de usuarios (login/logout)
 * - Registro de nuevos usuarios
 * - Gestión de perfiles de usuario
 * - Actualización de contraseñas
 * - Recuperación de contraseñas
 * - Verificación de tokens y roles
 * - Renovación automática de tokens
 * 
 * @class AuthService
 */
class AuthService {
  /**
   * Obtiene headers de autenticación para peticiones JSON
   * 
   * Genera los headers necesarios para peticiones HTTP que requieren
   * autenticación, incluyendo el token JWT del localStorage.
   * 
   * @private
   * @returns {Object} Objeto con headers de Authorization y Content-Type
   * 
   * @example
   * ```typescript
   * // Uso interno en métodos del servicio
   * const headers = this.getAuthHeaders()
   * // { 'Authorization': 'Bearer token...', 'Content-Type': 'application/json' }
   * ```
   */
  private getAuthHeaders() {
    const token = localStorage.getItem('token')
    return token ? {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    } : {
      'Content-Type': 'application/json'
    }
  }

  /**
   * Obtiene headers de autenticación para peticiones FormData
   * 
   * Genera los headers necesarios para peticiones HTTP con FormData
   * (como subida de archivos), excluyendo Content-Type para permitir
   * que el navegador establezca el boundary automáticamente.
   * 
   * @private
   * @returns {Object} Objeto con headers de Authorization (sin Content-Type)
   * 
   * @example
   * ```typescript
   * // Uso interno para subida de archivos
   * const headers = this.getAuthHeadersFormData()
   * // { 'Authorization': 'Bearer token...' }
   * ```
   */
  private getAuthHeadersFormData() {
    const token = localStorage.getItem('token')
    return token ? {
      'Authorization': `Bearer ${token}`
    } : {}
  }

  /**
   * Maneja errores de API de forma consistente
   * 
   * Procesa errores de peticiones HTTP y proporciona manejo
   * especializado para errores de autenticación, lanzando
   * errores con mensajes procesados.
   * 
   * @private
   * @param {any} error - El objeto de error recibido
   * @param {string} defaultMessage - Mensaje de error por defecto
   * @throws {Error} Lanza un error con mensaje procesado
   * 
   * @example
   * ```typescript
   * // Uso interno en métodos del servicio
   * this.handleError(error, 'Error al procesar solicitud')
   * ```
   */
  private handleError(error: unknown, defaultMessage: string): never {
    const processedError = processError(error)
    
    // Maneja errores de autenticación específicamente
    if ((error as any)?.response?.status === 401) {
      handleAuthError(error, true)
    }
    
    throw new Error(processedError.message || defaultMessage)
  }

  /**
   * Inicia sesión de usuario
   * 
   * Autentica a un usuario con sus credenciales y devuelve
   * un token JWT junto con los datos del usuario.
   * 
   * @param {LoginCredentials} credentials - Credenciales de inicio de sesión
   * @returns {Promise<AuthResponse>} Promesa con respuesta de autenticación
   * @throws {Error} Si ocurre un error durante el inicio de sesión
   * 
   * @example
   * ```typescript
   * // Iniciar sesión con credenciales
   * const response = await authService.login({
   *   email: 'usuario@ejemplo.com',
   *   password: 'miContraseña123'
   * })
   * 
   * if (response.success) {
   *   console.log('Usuario autenticado:', response.user.name)
   *   localStorage.setItem('token', response.token)
   * }
   * ```
   */
  async login(credentials: LoginCredentials): Promise<{data: AuthResponse}> {
    try {
      const response: AxiosResponse<any> = await axios.post(
        AUTH_ROUTES.LOGIN,
        credentials,
        { headers: this.getAuthHeaders() }
      )
      
      // El backend envía {success, token, data: user} pero necesitamos {success, token, user}
      const backendData = response.data
      return {
        data: {
          success: backendData.success,
          token: backendData.token,
          user: backendData.data,
          message: backendData.message
        }
      }
    } catch (error) {
      this.handleError(error, 'Error al iniciar sesión')
    }
  }

  /**
   * Registra un nuevo usuario
   * 
   * Crea una nueva cuenta de usuario en el sistema y devuelve
   * un token JWT junto con los datos del usuario creado.
   * 
   * @param {RegisterCredentials} credentials - Credenciales de registro
   * @returns {Promise<AuthResponse>} Promesa con respuesta de autenticación
   * @throws {Error} Si ocurre un error durante el registro
   * 
   * @example
   * ```typescript
   * // Registrar nuevo usuario
   * const response = await authService.register({
   *   name: 'Juan Pérez',
   *   email: 'juan@ejemplo.com',
   *   password: 'miContraseña123',
   *   confirmPassword: 'miContraseña123'
   * })
   * 
   * if (response.success) {
   *   console.log('Usuario registrado:', response.user.name)
   * }
   * ```
   */
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const headers = this.getAuthHeaders()
    
    try {
      const response: AxiosResponse<AuthResponse> = await axios.post(
        AUTH_ROUTES.REGISTER,
        credentials,
        { headers }
      )
      
      return response.data
    } catch (error: unknown) {
      this.handleError(error, 'Error al registrar usuario')
    }
  }

  /**
   * Cierra sesión de usuario
   * 
   * Invalida la sesión actual del usuario en el servidor.
   * No lanza errores en caso de fallo, solo los registra en consola
   * para permitir logout local incluso si el servidor no responde.
   * 
   * @returns {Promise<void>} Promesa que se resuelve al completar el logout
   * 
   * @example
   * ```typescript
   * // Cerrar sesión del usuario
   * await authService.logout()
   * localStorage.removeItem('token')
   * // Redirigir a página de login
   * ```
   */
  async logout(): Promise<void> {
    try {
      await axios.post(
        AUTH_ROUTES.LOGOUT,
        {},
        { headers: this.getAuthHeaders() }
      )
    } catch (error) {
      // No lanza errores en logout, solo los registra
      console.warn('Logout error:', error)
    }
  }

  /**
   * Obtiene el perfil del usuario actual
   * 
   * Recupera los datos completos del usuario autenticado
   * basándose en el token JWT almacenado.
   * 
   * @returns {Promise<User>} Promesa con datos del usuario
   * @throws {Error} Si ocurre un error al obtener los datos del usuario
   * 
   * @example
   * ```typescript
   * // Obtener datos del usuario actual
   * const user = await authService.getCurrentUser()
   * console.log('Usuario actual:', user.name, user.email)
   * ```
   */
  async getCurrentUser(): Promise<User> {
    try {
      const response: AxiosResponse<User> = await axios.get(
        AUTH_ROUTES.ME,
        { headers: this.getAuthHeaders() }
      )
      return response.data
    } catch (error) {
      this.handleError(error, 'Error al obtener datos del usuario')
    }
  }

  /**
   * Actualiza el perfil del usuario
   * 
   * Modifica los datos del perfil del usuario autenticado
   * con la información proporcionada.
   * 
   * @param {UpdateProfileData} profileData - Datos del perfil a actualizar
   * @returns {Promise<User>} Promesa con datos del usuario actualizado
   * @throws {Error} Si ocurre un error al actualizar el perfil
   * 
   * @example
   * ```typescript
   * // Actualizar perfil del usuario
   * const updatedUser = await authService.updateProfile({
   *   name: 'Nuevo Nombre',
   *   email: 'nuevo@ejemplo.com'
   * })
   * 
   * console.log('Perfil actualizado:', updatedUser.name)
   * ```
   */
  async updateProfile(profileData: UpdateProfileData): Promise<User> {
    try {
      const response: AxiosResponse<User> = await axios.put(
        AUTH_ROUTES.PROFILE,
        profileData,
        { headers: this.getAuthHeaders() }
      )
      return response.data
    } catch (error) {
      this.handleError(error, 'Error al actualizar perfil')
    }
  }

  /**
   * Actualiza el perfil del usuario con FormData
   * 
   * Modifica el perfil del usuario incluyendo archivos como avatares.
   * Utiliza FormData para permitir la subida de archivos junto con
   * otros datos del perfil.
   * 
   * @param {FormData} formData - FormData con datos del perfil y archivos
   * @returns {Promise<User>} Promesa con datos del usuario actualizado
   * @throws {Error} Si ocurre un error al actualizar el perfil con archivos
   * 
   * @example
   * ```typescript
   * // Actualizar perfil con avatar
   * const formData = new FormData()
   * formData.append('name', 'Nuevo Nombre')
   * formData.append('avatar', avatarFile)
   * 
   * const updatedUser = await authService.updateProfileWithFiles(formData)
   * console.log('Perfil actualizado con avatar:', updatedUser.avatar)
   * ```
   */
  async updateProfileWithFiles(formData: FormData): Promise<User> {
    try {
      const response: AxiosResponse<User> = await axios.put(
        AUTH_ROUTES.PROFILE,
        formData,
        { headers: this.getAuthHeadersFormData() }
      )
      return response.data
    } catch (error) {
      this.handleError(error, 'Error al actualizar perfil con archivos')
    }
  }

  /**
   * Actualiza la contraseña del usuario
   * 
   * Cambia la contraseña del usuario autenticado después de
   * verificar la contraseña actual por seguridad.
   * 
   * @param {PasswordUpdateData} passwordData - Datos de actualización de contraseña
   * @returns {Promise<{success: boolean; message: string}>} Promesa con respuesta de éxito
   * @throws {Error} Si ocurre un error al actualizar la contraseña
   * 
   * @example
   * ```typescript
   * // Cambiar contraseña del usuario
   * const result = await authService.updatePassword({
   *   currentPassword: 'contraseñaActual',
   *   newPassword: 'nuevaContraseña123',
   *   confirmPassword: 'nuevaContraseña123'
   * })
   * 
   * if (result.success) {
   *   console.log('Contraseña actualizada:', result.message)
   * }
   * ```
   */
  async updatePassword(passwordData: PasswordUpdateData): Promise<{ success: boolean; message: string }> {
    try {
      const response: AxiosResponse<{ success: boolean; message: string }> = await axios.put(
        AUTH_ROUTES.UPDATE_PASSWORD,
        passwordData,
        { headers: this.getAuthHeaders() }
      )
      return response.data
    } catch (error) {
      this.handleError(error, 'Error al actualizar contraseña')
    }
  }

  /**
   * Solicita restablecimiento de contraseña
   * 
   * Envía un correo electrónico con un enlace para restablecer
   * la contraseña del usuario especificado.
   * 
   * @param {string} email - Correo electrónico del usuario
   * @returns {Promise<{success: boolean; message: string}>} Promesa con respuesta de éxito
   * @throws {Error} Si ocurre un error al enviar el email de recuperación
   * 
   * @example
   * ```typescript
   * // Solicitar recuperación de contraseña
   * const result = await authService.forgotPassword('usuario@ejemplo.com')
   * 
   * if (result.success) {
   *   console.log('Email enviado:', result.message)
   * }
   * ```
   */
  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const response: AxiosResponse<{ success: boolean; message: string }> = await axios.post(
        AUTH_ROUTES.FORGOT_PASSWORD,
        { email },
        { headers: this.getAuthHeaders() }
      )
      return response.data
    } catch (error) {
      this.handleError(error, 'Error al enviar email de recuperación')
    }
  }

  /**
   * Restablece la contraseña con token
   * 
   * Establece una nueva contraseña para el usuario utilizando
   * un token de recuperación válido recibido por correo electrónico.
   * 
   * @param {string} token - Token de restablecimiento
   * @param {ResetPasswordData} passwordData - Datos de nueva contraseña
   * @returns {Promise<AuthResponse>} Promesa con respuesta de autenticación
   * @throws {Error} Si ocurre un error al restablecer la contraseña
   * 
   * @example
   * ```typescript
   * // Restablecer contraseña con token
   * const response = await authService.resetPassword('token123', {
   *   password: 'nuevaContraseña123',
   *   confirmPassword: 'nuevaContraseña123'
   * })
   * 
   * if (response.success) {
   *   console.log('Contraseña restablecida para:', response.user.email)
   * }
   * ```
   */
  async resetPassword(token: string, passwordData: ResetPasswordData): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await axios.put(
        AUTH_ROUTES.RESET_PASSWORD(token),
        passwordData,
        { headers: this.getAuthHeaders() }
      )
      return response.data
    } catch (error) {
      this.handleError(error, 'Error al restablecer contraseña')
    }
  }

  /**
   * Verifica el token de autenticación
   * 
   * Comprueba si el token JWT almacenado es válido y devuelve
   * los datos del usuario si la verificación es exitosa.
   * 
   * @returns {Promise<{valid: boolean; user?: User}>} Promesa con resultado de verificación
   * 
   * @example
   * ```typescript
   * // Verificar token de autenticación
   * const verification = await authService.verifyToken()
   * 
   * if (verification.valid) {
   *   console.log('Token válido para:', verification.user?.name)
   * } else {
   *   console.log('Token inválido, redirigir a login')
   * }
   * ```
   */
  async verifyToken(): Promise<{ valid: boolean; user?: User }> {
    try {
      const user = await this.getCurrentUser()
      return { valid: true, user }
    } catch (error) {
      return { valid: false }
    }
  }

  /**
   * Verifica si el usuario tiene un rol específico
   * 
   * Comprueba si el usuario autenticado posee el rol especificado,
   * útil para control de acceso y autorización.
   * 
   * @param {string} role - Rol a verificar
   * @returns {Promise<boolean>} Promesa con resultado de verificación de rol
   * 
   * @example
   * ```typescript
   * // Verificar si el usuario es administrador
   * const isAdmin = await authService.checkRole('admin')
   * 
   * if (isAdmin) {
   *   console.log('Usuario tiene permisos de administrador')
   * } else {
   *   console.log('Acceso denegado')
   * }
   * ```
   */
  async checkRole(role: string): Promise<boolean> {
    try {
      const user = await this.getCurrentUser()
      return user.role === role
    } catch (error) {
      return false
    }
  }

  /**
   * Renueva el token de autenticación
   * 
   * Obtiene un nuevo token JWT válido utilizando el token actual,
   * útil para mantener la sesión activa sin requerir login.
   * 
   * @returns {Promise<AuthResponse>} Promesa con nueva respuesta de autenticación
   * @throws {Error} Si ocurre un error al renovar el token
   * 
   * @example
   * ```typescript
   * // Renovar token antes de que expire
   * const response = await authService.refreshToken()
   * 
   * if (response.success) {
   *   localStorage.setItem('token', response.token)
   *   console.log('Token renovado exitosamente')
   * }
   * ```
   */
  async refreshToken(): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await axios.post(
        `${AUTH_ROUTES.LOGIN}/refresh`,
        {},
        { headers: this.getAuthHeaders() }
      )
      return response.data
    } catch (error) {
      this.handleError(error, 'Error al renovar token')
    }
  }
}

/**
 * Instancia singleton del servicio de autenticación
 * 
 * Se exporta una instancia única para uso en toda la aplicación.
 * Esto garantiza consistencia en el manejo del estado de autenticación
 * y evita la creación de múltiples instancias innecesarias.
 * 
 * @example
 * ```typescript
 * import { authService } from '@/features/auth/services/authService'
 * 
 * // Usar el servicio en cualquier parte de la aplicación
 * const user = await authService.getCurrentUser()
 * ```
 */
export const authService = new AuthService()
export default authService

// Los tipos ya están exportados como tipos arriba