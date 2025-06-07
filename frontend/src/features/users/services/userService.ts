/**
 * @fileoverview Servicio de Gestión de Usuarios para comunicación con la API
 * 
 * Este servicio maneja todas las peticiones HTTP relacionadas con usuarios,
 * proporcionando una interfaz completa para la gestión de perfiles, artículos,
 * intercambios y administración de usuarios.
 * 
 * Características principales:
 * - Gestión completa de perfiles de usuario
 * - Operaciones CRUD para usuarios
 * - Manejo de artículos por usuario
 * - Historial de intercambios
 * - Funciones administrativas
 * - Búsqueda y filtrado de usuarios
 * - Estadísticas de usuario
 * - Manejo robusto de errores
 * 
 * Tecnologías utilizadas:
 * - Axios para peticiones HTTP
 * - TypeScript para tipado estático
 * - Manejo centralizado de errores
 * - Autenticación con headers JWT
 * 
 * @author Sistema de Gestión de Usuarios
 * @version 1.0.0
 */

import axios, { AxiosResponse } from 'axios'
import { USER_ROUTES, ITEM_ROUTES } from '@/config/apiRoutes'
import { processError, handleAuthError } from '@/shared/utils/errorHandler'
import { getAuthHeaders, getAuthHeadersFormData } from '@/features/auth/utils/authUtils'

/**
 * Interfaz para representar un usuario del sistema
 * 
 * Contiene toda la información de perfil de un usuario,
 * incluyendo datos personales, preferencias y metadatos.
 * 
 * @interface User
 */
export interface User {
  /** Identificador único del usuario */
  id: string
  /** ID alternativo para compatibilidad con versiones anteriores */
  _id?: string
  /** Nombre completo del usuario */
  name: string
  /** Dirección de correo electrónico del usuario */
  email: string
  /** URL del avatar del usuario (opcional) */
  avatar?: string
  /** Rol del usuario en el sistema (opcional) */
  role?: string
  /** Biografía o descripción personal del usuario (opcional) */
  bio?: string
  /** Ubicación geográfica del usuario (opcional) */
  location?: string
  /** Número de teléfono del usuario (opcional) */
  phone?: string
  /** Fecha de creación de la cuenta (opcional) */
  createdAt?: string
  /** Fecha de última actualización del perfil (opcional) */
  updatedAt?: string
  /** Estado activo del usuario (opcional) */
  isActive?: boolean
  /** Fecha del último inicio de sesión (opcional) */
  lastLogin?: string
  /** Preferencias personalizadas del usuario (opcional) */
  preferences?: UserPreferences
}

/**
 * Interfaz para las preferencias de usuario
 * 
 * Define las configuraciones personalizables que cada usuario
 * puede ajustar según sus necesidades y preferencias.
 * 
 * @interface UserPreferences
 */
export interface UserPreferences {
  /** Configuraciones de notificaciones (opcional) */
  notifications?: {
    /** Notificaciones por correo electrónico */
    email?: boolean
    /** Notificaciones push */
    push?: boolean
    /** Notificaciones de intercambios */
    trades?: boolean
    /** Notificaciones de mensajes */
    messages?: boolean
  }
  /** Configuraciones de privacidad (opcional) */
  privacy?: {
    /** Mostrar email públicamente */
    showEmail?: boolean
    /** Mostrar teléfono públicamente */
    showPhone?: boolean
    /** Mostrar ubicación públicamente */
    showLocation?: boolean
  }
  /** Idioma preferido del usuario (opcional) */
  language?: string
  /** Tema visual preferido (opcional) */
  theme?: 'light' | 'dark' | 'auto'
}

/**
 * Interfaz para datos de actualización de usuario
 * 
 * Define los campos que pueden ser actualizados en el perfil
 * de un usuario, incluyendo archivos como avatares.
 * 
 * @interface UpdateUserData
 */
export interface UpdateUserData {
  /** Nuevo nombre del usuario (opcional) */
  name?: string
  /** Nuevo email del usuario (opcional) */
  email?: string
  /** Nueva biografía del usuario (opcional) */
  bio?: string
  /** Nueva ubicación del usuario (opcional) */
  location?: string
  /** Nuevo teléfono del usuario (opcional) */
  phone?: string
  /** Nuevo avatar como URL o archivo (opcional) */
  avatar?: string | File
  /** Nuevas preferencias del usuario (opcional) */
  preferences?: Partial<UserPreferences>
  /** Campos adicionales dinámicos */
  [key: string]: any
}

/**
 * Interfaz para representar un artículo de usuario
 * 
 * Contiene la información de los artículos publicados
 * por un usuario específico.
 * 
 * @interface UserItem
 */
export interface UserItem {
  /** Identificador único del artículo */
  id: string
  /** Título del artículo */
  title: string
  /** Descripción detallada del artículo */
  description: string
  /** Categoría del artículo */
  category: string
  /** Condición del artículo */
  condition: string
  /** Array de URLs de imágenes del artículo */
  images: string[]
  /** Ubicación del artículo */
  location: string
  /** Estado de disponibilidad del artículo */
  isAvailable: boolean
  /** Fecha de creación del artículo */
  createdAt: string
  /** Fecha de última actualización del artículo */
  updatedAt: string
}

/**
 * Interfaz para representar un intercambio de usuario
 * 
 * Contiene la información de los intercambios en los que
 * ha participado un usuario.
 * 
 * @interface UserTrade
 */
export interface UserTrade {
  /** Identificador único del intercambio */
  id: string
  /** Estado actual del intercambio */
  status: string
  /** ID del usuario que inició el intercambio */
  initiatedBy: string
  /** ID del usuario que respondió al intercambio */
  respondedBy: string
  /** Artículo ofrecido en el intercambio */
  itemOffered: UserItem
  /** Artículo solicitado en el intercambio */
  itemRequested: UserItem
  /** Fecha de creación del intercambio */
  createdAt: string
  /** Fecha de última actualización del intercambio */
  updatedAt: string
}

/**
 * Interfaz para respuesta de lista de usuarios
 * 
 * Formato estándar de respuesta del API para operaciones
 * que devuelven múltiples usuarios con paginación.
 * 
 * @interface UsersResponse
 */
export interface UsersResponse {
  /** Estado de éxito de la operación */
  success: boolean
  /** Array de usuarios devueltos */
  data: User[]
  /** Información de paginación (opcional) */
  pagination?: {
    /** Página actual */
    page: number
    /** Límite de resultados por página */
    limit: number
    /** Total de usuarios */
    total: number
    /** Total de páginas disponibles */
    pages: number
  }
}

/**
 * Interfaz para respuesta de usuario individual
 * 
 * Formato estándar de respuesta del API para operaciones
 * que devuelven un solo usuario.
 * 
 * @interface UserResponse
 */
export interface UserResponse {
  /** Estado de éxito de la operación */
  success: boolean
  /** Datos del usuario */
  data: User
  /** Mensaje opcional del servidor */
  message?: string
}

/**
 * Interfaz para respuesta de artículos de usuario
 * 
 * Formato estándar de respuesta del API para operaciones
 * que devuelven artículos de un usuario específico.
 * 
 * @interface UserItemsResponse
 */
export interface UserItemsResponse {
  /** Estado de éxito de la operación */
  success: boolean
  /** Array de artículos del usuario */
  data: UserItem[]
  /** Información de paginación (opcional) */
  pagination?: {
    /** Página actual */
    page: number
    /** Límite de resultados por página */
    limit: number
    /** Total de artículos */
    total: number
    /** Total de páginas disponibles */
    pages: number
  }
}

/**
 * Interfaz para respuesta de intercambios de usuario
 * 
 * Formato estándar de respuesta del API para operaciones
 * que devuelven intercambios de un usuario específico.
 * 
 * @interface UserTradesResponse
 */
export interface UserTradesResponse {
  /** Estado de éxito de la operación */
  success: boolean
  /** Array de intercambios del usuario */
  data: UserTrade[]
  /** Información de paginación (opcional) */
  pagination?: {
    /** Página actual */
    page: number
    /** Límite de resultados por página */
    limit: number
    /** Total de intercambios */
    total: number
    /** Total de páginas disponibles */
    pages: number
  }
}

/**
 * Clase de Servicio de Usuarios
 * 
 * Centraliza todas las operaciones de API relacionadas con usuarios,
 * proporcionando una interfaz unificada para la gestión de perfiles,
 * artículos, intercambios y funciones administrativas.
 * 
 * Proporciona métodos para:
 * - Obtener y actualizar perfiles de usuario
 * - Gestionar artículos de usuario
 * - Consultar historial de intercambios
 * - Funciones administrativas (solo admin)
 * - Búsqueda y filtrado de usuarios
 * - Estadísticas de usuario
 * 
 * @class UserService
 */
class UserService {
  /**
   * Maneja errores de API de manera consistente
   * 
   * Procesa errores de peticiones HTTP y proporciona respuestas
   * estandarizadas, incluyendo manejo especial para errores de autenticación.
   * 
   * @private
   * @param {any} error - El objeto de error recibido
   * @param {string} defaultMessage - Mensaje de error por defecto
   * @returns {Object} Respuesta de error procesada
   * 
   * @example
   * ```typescript
   * // Uso interno en métodos del servicio
   * return this.handleError(error, 'Error al obtener usuario')
   * ```
   */
  private handleError(error: any, defaultMessage: string): { success: false; error: string; data: null } {
    const processedError = processError(error)
    
    // Manejar errores de autenticación específicamente
    if (error.response?.status === 401) {
      handleAuthError(error, true)
    }
    
    return {
      success: false,
      error: processedError.message || defaultMessage,
      data: null
    }
  }

  /**
   * Obtiene el perfil del usuario actual
   * 
   * Recupera la información completa del perfil del usuario autenticado,
   * incluyendo datos personales, preferencias y metadatos.
   * 
   * @returns {Promise<UserResponse | {success: false, error: string, data: null}>} Datos del perfil del usuario
   * @throws {Error} Si ocurre un error al obtener el perfil
   * 
   * @example
   * ```typescript
   * // Obtener perfil del usuario actual
   * const profile = await userService.getCurrentUserProfile()
   * if (profile.success) {
   *   console.log('Usuario:', profile.data.name)
   * }
   * ```
   */
  async getCurrentUserProfile(): Promise<UserResponse | { success: false; error: string; data: null }> {
    try {
      const response: AxiosResponse<{success: boolean, data: User}> = await axios.get(
        USER_ROUTES.PROFILE,
        { headers: getAuthHeaders() }
      )
      return { success: true, data: response.data.data }
    } catch (error) {
      return this.handleError(error, 'Error al obtener el perfil del usuario')
    }
  }

  /**
   * Obtiene el perfil de un usuario por su ID
   * 
   * Recupera la información pública del perfil de un usuario específico
   * basado en su identificador único.
   * 
   * @param {string} userId - ID del usuario a consultar
   * @returns {Promise<UserResponse | {success: false, error: string, data: null}>} Datos del perfil del usuario
   * @throws {Error} Si ocurre un error al obtener el perfil
   * 
   * @example
   * ```typescript
   * // Obtener perfil de un usuario específico
   * const profile = await userService.getUserProfile('user123')
   * if (profile.success) {
   *   console.log('Usuario:', profile.data.name)
   * }
   * ```
   */
  async getUserProfile(userId: string): Promise<UserResponse | { success: false; error: string; data: null }> {
    try {
      const response: AxiosResponse<User> = await axios.get(
        USER_ROUTES.BY_ID(userId),
        { headers: getAuthHeaders() }
      )
      return { success: true, data: response.data }
    } catch (error) {
      return this.handleError(error, 'Error al cargar el perfil')
    }
  }

  /**
   * Actualiza el perfil de un usuario
   * 
   * Modifica la información del perfil de un usuario, incluyendo
   * datos personales, preferencias y archivos como avatares.
   * 
   * @param {string} userId - ID del usuario a actualizar
   * @param {UpdateUserData | FormData} profileData - Datos del perfil a actualizar
   * @returns {Promise<UserResponse | {success: false, error: string, data: null}>} Usuario actualizado
   * @throws {Error} Si ocurre un error al actualizar el perfil
   * 
   * @example
   * ```typescript
   * // Actualizar datos básicos
   * const result = await userService.updateUserProfile('user123', {
   *   name: 'Nuevo Nombre',
   *   bio: 'Nueva biografía'
   * })
   * 
   * // Actualizar con archivo de avatar
   * const formData = new FormData()
   * formData.append('avatar', avatarFile)
   * formData.append('name', 'Nuevo Nombre')
   * const result = await userService.updateUserProfile('user123', formData)
   * ```
   */
  async updateUserProfile(
    userId: string, 
    profileData: UpdateUserData | FormData
  ): Promise<UserResponse | { success: false; error: string; data: null }> {
    try {
      const isFormData = profileData instanceof FormData
      const headers = isFormData ? getAuthHeadersFormData() : getAuthHeaders()
      
      const response: AxiosResponse<{ success: boolean; data: User; message?: string }> = await axios.put(
        USER_ROUTES.BY_ID(userId),
        profileData,
        { headers }
      )
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Perfil actualizado correctamente'
        }
      } else {
        return this.handleError(
          new Error(response.data?.message || 'Error desconocido'),
          'Error al actualizar el perfil'
        )
      }
    } catch (error) {
      return this.handleError(error, 'Error al actualizar el perfil')
    }
  }

  /**
   * Obtiene los artículos de un usuario
   * 
   * Recupera una lista paginada de todos los artículos publicados
   * por un usuario específico, con opciones de filtrado.
   * 
   * @param {string} userId - ID del usuario
   * @param {Object} params - Parámetros de consulta opcionales
   * @param {number} params.page - Número de página
   * @param {number} params.limit - Límite de resultados por página
   * @param {string} params.category - Filtrar por categoría
   * @param {string} params.condition - Filtrar por condición
   * @param {boolean} params.isAvailable - Filtrar por disponibilidad
   * @returns {Promise<UserItemsResponse | {success: false, error: string, data: null}>} Lista de artículos del usuario
   * @throws {Error} Si ocurre un error al obtener los artículos
   * 
   * @example
   * ```typescript
   * // Obtener todos los artículos de un usuario
   * const items = await userService.getUserItems('user123')
   * 
   * // Obtener artículos con filtros
   * const filteredItems = await userService.getUserItems('user123', {
   *   category: 'electronics',
   *   isAvailable: true,
   *   page: 1,
   *   limit: 10
   * })
   * ```
   */
  async getUserItems(
    userId: string,
    params?: {
      page?: number
      limit?: number
      category?: string
      condition?: string
      isAvailable?: boolean
    }
  ): Promise<UserItemsResponse | { success: false; error: string; data: null }> {
    try {
      const response: AxiosResponse<UserItemsResponse> = await axios.get(
        ITEM_ROUTES.BY_USER(userId),
        {
          headers: getAuthHeaders(),
          params
        }
      )
      return response.data
    } catch (error) {
      return this.handleError(error, 'Error al cargar los artículos del usuario')
    }
  }

  /**
   * Obtiene el historial de intercambios de un usuario
   * 
   * Recupera una lista paginada de todos los intercambios en los que
   * ha participado un usuario, con opciones de filtrado por estado.
   * 
   * @param {string} userId - ID del usuario
   * @param {Object} params - Parámetros de consulta opcionales
   * @param {number} params.page - Número de página
   * @param {number} params.limit - Límite de resultados por página
   * @param {string} params.status - Filtrar por estado del intercambio
   * @returns {Promise<UserTradesResponse | {success: false, error: string, data: null}>} Historial de intercambios
   * @throws {Error} Si ocurre un error al obtener los intercambios
   * 
   * @example
   * ```typescript
   * // Obtener todos los intercambios de un usuario
   * const trades = await userService.getUserTrades('user123')
   * 
   * // Obtener intercambios completados
   * const completedTrades = await userService.getUserTrades('user123', {
   *   status: 'completed',
   *   page: 1,
   *   limit: 20
   * })
   * ```
   */
  async getUserTrades(
    userId: string,
    params?: {
      page?: number
      limit?: number
      status?: string
    }
  ): Promise<UserTradesResponse | { success: false; error: string; data: null }> {
    try {
      const response: AxiosResponse<UserTradesResponse> = await axios.get(
        USER_ROUTES.TRADES(userId),
        {
          headers: getAuthHeaders(),
          params
        }
      )
      return response.data
    } catch (error) {
      return this.handleError(error, 'Error al cargar el historial de intercambios')
    }
  }

  /**
   * Obtiene todos los usuarios (solo administradores)
   * 
   * Recupera una lista paginada de todos los usuarios del sistema
   * con opciones avanzadas de filtrado y ordenamiento.
   * 
   * @param {Object} params - Parámetros de consulta opcionales
   * @param {number} params.page - Número de página
   * @param {number} params.limit - Límite de resultados por página
   * @param {string} params.search - Término de búsqueda
   * @param {string} params.role - Filtrar por rol
   * @param {boolean} params.isActive - Filtrar por estado activo
   * @param {string} params.sortBy - Campo por el que ordenar
   * @param {'asc' | 'desc'} params.sortOrder - Orden ascendente o descendente
   * @returns {Promise<UsersResponse | {success: false, error: string, data: null}>} Lista de usuarios
   * @throws {Error} Si ocurre un error al obtener los usuarios
   * 
   * @example
   * ```typescript
   * // Obtener todos los usuarios
   * const users = await userService.getAllUsers()
   * 
   * // Búsqueda con filtros
   * const filteredUsers = await userService.getAllUsers({
   *   search: 'juan',
   *   role: 'user',
   *   isActive: true,
   *   sortBy: 'createdAt',
   *   sortOrder: 'desc'
   * })
   * ```
   */
  async getAllUsers(params?: {
    page?: number
    limit?: number
    search?: string
    role?: string
    isActive?: boolean
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }): Promise<UsersResponse | { success: false; error: string; data: null }> {
    try {
      const response: AxiosResponse<UsersResponse> = await axios.get(
        USER_ROUTES.BASE,
        {
          headers: getAuthHeaders(),
          params
        }
      )
      return response.data
    } catch (error) {
      return this.handleError(error, 'Error al cargar los usuarios')
    }
  }

  /**
   * Elimina un usuario (solo administradores)
   * 
   * Borra permanentemente un usuario del sistema. Esta acción
   * es irreversible y debe usarse con extrema precaución.
   * 
   * @param {string} userId - ID del usuario a eliminar
   * @returns {Promise<{success: boolean, message?: string} | {success: false, error: string, data: null}>} Resultado de la eliminación
   * @throws {Error} Si ocurre un error al eliminar el usuario
   * 
   * @example
   * ```typescript
   * // Eliminar un usuario
   * const result = await userService.deleteUser('user123')
   * if (result.success) {
   *   console.log('Usuario eliminado:', result.message)
   * }
   * ```
   */
  async deleteUser(userId: string): Promise<{ success: boolean; message?: string } | { success: false; error: string; data: null }> {
    try {
      const response: AxiosResponse<{ success: boolean; message: string }> = await axios.delete(
        USER_ROUTES.BY_ID(userId),
        { headers: getAuthHeaders() }
      )
      
      return {
        success: true,
        message: response.data.message || 'Usuario eliminado correctamente'
      }
    } catch (error) {
      return this.handleError(error, 'Error al eliminar el usuario')
    }
  }

  /**
   * Actualiza el rol de un usuario (solo administradores)
   * 
   * Modifica el rol asignado a un usuario específico,
   * cambiando sus permisos y accesos en el sistema.
   * 
   * @param {string} userId - ID del usuario
   * @param {string} role - Nuevo rol a asignar
   * @returns {Promise<UserResponse | {success: false, error: string, data: null}>} Usuario con rol actualizado
   * @throws {Error} Si ocurre un error al actualizar el rol
   * 
   * @example
   * ```typescript
   * // Cambiar rol de usuario a administrador
   * const result = await userService.updateUserRole('user123', 'admin')
   * if (result.success) {
   *   console.log('Rol actualizado:', result.data.role)
   * }
   * ```
   */
  async updateUserRole(
    userId: string, 
    role: string
  ): Promise<UserResponse | { success: false; error: string; data: null }> {
    try {
      const response: AxiosResponse<{ success: boolean; data: User; message?: string }> = await axios.patch(
        `${USER_ROUTES.BY_ID(userId)}/role`,
        { role },
        { headers: getAuthHeaders() }
      )
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Rol actualizado correctamente'
      }
    } catch (error) {
      return this.handleError(error, 'Error al actualizar el rol del usuario')
    }
  }

  /**
   * Cambia el estado activo de un usuario (solo administradores)
   * 
   * Activa o desactiva una cuenta de usuario, controlando
   * su acceso al sistema sin eliminar permanentemente la cuenta.
   * 
   * @param {string} userId - ID del usuario
   * @param {boolean} isActive - Nuevo estado activo
   * @returns {Promise<UserResponse | {success: false, error: string, data: null}>} Usuario con estado actualizado
   * @throws {Error} Si ocurre un error al cambiar el estado
   * 
   * @example
   * ```typescript
   * // Desactivar un usuario
   * const result = await userService.toggleUserStatus('user123', false)
   * 
   * // Reactivar un usuario
   * const result = await userService.toggleUserStatus('user123', true)
   * ```
   */
  async toggleUserStatus(
    userId: string, 
    isActive: boolean
  ): Promise<UserResponse | { success: false; error: string; data: null }> {
    try {
      const response: AxiosResponse<{ success: boolean; data: User; message?: string }> = await axios.patch(
        `${USER_ROUTES.BY_ID(userId)}/status`,
        { isActive },
        { headers: getAuthHeaders() }
      )
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || `Usuario ${isActive ? 'activado' : 'desactivado'} correctamente`
      }
    } catch (error) {
      return this.handleError(error, 'Error al cambiar el estado del usuario')
    }
  }

  /**
   * Busca usuarios en el sistema
   * 
   * Realiza una búsqueda de usuarios basada en un término de consulta,
   * con opciones adicionales de filtrado por rol y ubicación.
   * 
   * @param {string} query - Término de búsqueda
   * @param {Object} params - Parámetros adicionales opcionales
   * @param {number} params.page - Número de página
   * @param {number} params.limit - Límite de resultados por página
   * @param {string} params.role - Filtrar por rol
   * @param {string} params.location - Filtrar por ubicación
   * @returns {Promise<UsersResponse | {success: false, error: string, data: null}>} Resultados de búsqueda
   * @throws {Error} Si ocurre un error al buscar usuarios
   * 
   * @example
   * ```typescript
   * // Búsqueda simple
   * const results = await userService.searchUsers('juan')
   * 
   * // Búsqueda con filtros
   * const filteredResults = await userService.searchUsers('maria', {
   *   role: 'user',
   *   location: 'Madrid',
   *   limit: 20
   * })
   * ```
   */
  async searchUsers(
    query: string,
    params?: {
      page?: number
      limit?: number
      role?: string
      location?: string
    }
  ): Promise<UsersResponse | { success: false; error: string; data: null }> {
    try {
      const response: AxiosResponse<UsersResponse> = await axios.get(
        `${USER_ROUTES.BASE}/search`,
        {
          headers: getAuthHeaders(),
          params: { q: query, ...params }
        }
      )
      return response.data
    } catch (error) {
      return this.handleError(error, 'Error al buscar usuarios')
    }
  }

  /**
   * Obtiene estadísticas de usuario (solo administradores)
   * 
   * Recupera métricas y estadísticas detalladas de un usuario específico
   * o del usuario actual, útiles para análisis y reportes.
   * 
   * @param {string} userId - ID del usuario (opcional, por defecto usuario actual)
   * @returns {Promise<any>} Estadísticas del usuario
   * @throws {Error} Si ocurre un error al obtener las estadísticas
   * 
   * @example
   * ```typescript
   * // Obtener estadísticas del usuario actual
   * const stats = await userService.getUserStats()
   * 
   * // Obtener estadísticas de un usuario específico
   * const userStats = await userService.getUserStats('user123')
   * ```
   */
  async getUserStats(userId?: string): Promise<any> {
    try {
      const endpoint = userId 
        ? `${USER_ROUTES.BY_ID(userId)}/stats`
        : `${USER_ROUTES.PROFILE}/stats`
        
      const response: AxiosResponse<any> = await axios.get(
        endpoint,
        { headers: getAuthHeaders() }
      )
      return response.data
    } catch (error) {
      return this.handleError(error, 'Error al cargar las estadísticas del usuario')
    }
  }
}

/**
 * Instancia singleton del servicio de usuarios
 * 
 * Se exporta una instancia única para uso en toda la aplicación.
 * Esto garantiza consistencia en el manejo del estado y configuración,
 * evitando la creación de múltiples instancias innecesarias.
 * 
 * @example
 * ```typescript
 * import { userService } from '@/features/users/services/userService'
 * 
 * // Usar el servicio en cualquier parte de la aplicación
 * const profile = await userService.getCurrentUserProfile()
 * ```
 */
export const userService = new UserService()
export default userService

// Todas las interfaces están exportadas como tipos arriba