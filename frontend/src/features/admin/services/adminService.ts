/**
 * @fileoverview Servicio de Administración para comunicación con la API
 * 
 * Este servicio centraliza todas las operaciones administrativas del sistema,
 * proporcionando una interfaz completa para la gestión de usuarios, moderación
 * de contenido, análisis del sistema y configuración administrativa.
 * 
 * Características principales:
 * - Gestión de estadísticas y análisis del sistema
 * - Moderación de artículos y contenido
 * - Administración de usuarios y roles
 * - Gestión de logs del sistema
 * - Exportación de datos
 * - Respaldos del sistema
 * - Configuración del sistema
 * - Notificaciones administrativas
 * 
 * Tecnologías utilizadas:
 * - Axios para peticiones HTTP
 * - TypeScript para tipado estático
 * - Autenticación JWT
 * - Manejo robusto de errores
 * - Paginación y filtrado avanzado
 * 
 * @author Sistema de Administración
 * @version 1.0.0
 */

import axios, { AxiosResponse } from 'axios'
import { ADMIN_ROUTES, ITEM_ROUTES, USER_ROUTES } from '@/config/apiRoutes'
import { processError, handleAuthError } from '@/shared/utils/errorHandler'
import { getAuthHeaders } from '@/features/auth/utils/authUtils'
import type { Item } from '@/features/items/services/itemService'
import type { User } from '@/features/users/services/userService'

/**
 * Interfaz para las estadísticas administrativas del sistema
 * 
 * Proporciona métricas completas sobre usuarios, artículos, intercambios
 * y el estado general del sistema para el panel de administración.
 * 
 * @interface AdminStats
 */
export interface AdminStats {
  /** Estadísticas de usuarios del sistema */
  users: {
    /** Total de usuarios registrados */
    total: number
    /** Usuarios activos */
    active: number
    /** Usuarios inactivos */
    inactive: number
    /** Nuevos usuarios este mes */
    newThisMonth: number
    /** Distribución de usuarios por rol */
    byRole: Record<string, number>
  }
  /** Estadísticas de artículos del sistema */
  items: {
    /** Total de artículos */
    total: number
    /** Artículos disponibles */
    available: number
    /** Artículos no disponibles */
    unavailable: number
    /** Artículos pendientes de moderación */
    pending: number
    /** Artículos aprobados */
    approved: number
    /** Artículos rechazados */
    rejected: number
    /** Nuevos artículos este mes */
    newThisMonth: number
    /** Distribución de artículos por categoría */
    byCategory: Record<string, number>
  }
  /** Estadísticas de intercambios */
  trades: {
    /** Total de intercambios */
    total: number
    /** Intercambios completados */
    completed: number
    /** Intercambios pendientes */
    pending: number
    /** Intercambios cancelados */
    cancelled: number
    /** Nuevos intercambios este mes */
    newThisMonth: number
  }
  /** Información del sistema */
  system: {
    /** Tiempo de actividad del sistema */
    uptime: number
    /** Versión del sistema */
    version: string
    /** Fecha del último respaldo (opcional) */
    lastBackup?: string
    /** Uso del disco (opcional) */
    diskUsage?: {
      /** Espacio total en bytes */
      total: number
      /** Espacio usado en bytes */
      used: number
      /** Espacio libre en bytes */
      free: number
    }
  }
  /** Número de errores (opcional) */
  errors?: number
  /** Total de peticiones (opcional) */
  totalRequests?: number
  /** Moderaciones pendientes (opcional) */
  pendingModerations?: number
  /** Usuarios activos (opcional) */
  activeUsers?: number
  /** Total de usuarios (opcional) */
  totalUsers?: number
}

/**
 * Interfaz para los datos analíticos del sistema
 * 
 * Proporciona información detallada sobre tendencias y patrones
 * de uso del sistema para análisis administrativo.
 * 
 * @interface AdminAnalytics
 */
export interface AdminAnalytics {
  /** Crecimiento de usuarios a lo largo del tiempo */
  userGrowth: Array<{
    /** Fecha del registro */
    date: string
    /** Total de usuarios */
    users: number
    /** Nuevos usuarios */
    newUsers: number
  }>
  /** Actividad de artículos a lo largo del tiempo */
  itemActivity: Array<{
    /** Fecha del registro */
    date: string
    /** Total de artículos */
    items: number
    /** Nuevos artículos */
    newItems: number
    /** Intercambios realizados */
    trades: number
  }>
  /** Categorías más populares */
  popularCategories: Array<{
    /** Nombre de la categoría */
    category: string
    /** Número de artículos */
    count: number
    /** Porcentaje del total */
    percentage: number
  }>
  /** Actividad de usuarios */
  userActivity: Array<{
    /** Fecha del registro */
    date: string
    /** Usuarios activos */
    activeUsers: number
    /** Inicios de sesión */
    logins: number
  }>
}

/**
 * Interfaz para artículos en moderación
 * 
 * Extiende la interfaz Item con información específica
 * para el proceso de moderación administrativa.
 * 
 * @interface ModerationItem
 * @extends Item
 */
export interface ModerationItem extends Item {
  /** Estado de moderación del artículo */
  moderationStatus: 'pending' | 'approved' | 'rejected'
  /** ID del moderador (opcional) */
  moderatedBy?: string
  /** Fecha de moderación (opcional) */
  moderatedAt?: string
  /** Notas de moderación (opcional) */
  moderationNotes?: string
  /** Número de reportes (opcional) */
  reportCount?: number
  /** Lista de reportes (opcional) */
  reports?: Array<{
    /** ID del reporte */
    id: string
    /** Razón del reporte */
    reason: string
    /** Usuario que reportó */
    reportedBy: string
    /** Fecha del reporte */
    reportedAt: string
    /** Estado del reporte */
    status: 'pending' | 'resolved' | 'dismissed'
  }>
}

/**
 * Interfaz para usuarios en vista administrativa
 * 
 * Extiende la interfaz User con información adicional
 * relevante para la administración del sistema.
 * 
 * @interface AdminUser
 * @extends User
 */
export interface AdminUser extends User {
  /** Número de artículos del usuario (opcional) */
  itemsCount?: number
  /** Número de intercambios del usuario (opcional) */
  tradesCount?: number
  /** Número de reportes del usuario (opcional) */
  reportsCount?: number
  /** Última actividad del usuario (opcional) */
  lastActivity?: string
  /** Dirección IP de registro (opcional) */
  registrationIP?: string
  /** Estado de verificación (opcional) */
  verificationStatus?: 'pending' | 'verified' | 'rejected'
  /** Estado de verificación de email (opcional) */
  isEmailVerified?: boolean
}

/**
 * Interfaz para logs del sistema
 * 
 * Define la estructura de los registros de actividad
 * del sistema para auditoría y monitoreo.
 * 
 * @interface SystemLog
 */
export interface SystemLog {
  /** ID único del log */
  id: string
  /** Nivel de severidad del log */
  level: 'info' | 'warn' | 'error' | 'debug'
  /** Mensaje del log */
  message: string
  /** Marca de tiempo */
  timestamp: string
  /** ID del usuario (opcional) */
  userId?: string
  /** Dirección IP (opcional) */
  ip?: string
  /** User Agent del navegador (opcional) */
  userAgent?: string
  /** Acción realizada (opcional) */
  action?: string
  /** Recurso afectado (opcional) */
  resource?: string
  /** Detalles adicionales (opcional) */
  details?: Record<string, any>
}

/**
 * Interfaz para respuestas administrativas
 * 
 * Formato estándar de respuesta para todas las operaciones
 * administrativas con soporte para paginación.
 * 
 * @interface AdminResponse
 * @template T - Tipo de datos de la respuesta
 */
export interface AdminResponse<T = any> {
  /** Indica si la operación fue exitosa */
  success: boolean
  /** Datos de la respuesta */
  data: T
  /** Mensaje adicional (opcional) */
  message?: string
  /** Información de paginación (opcional) */
  pagination?: {
    /** Página actual */
    page: number
    /** Límite de elementos por página */
    limit: number
    /** Total de elementos */
    total: number
    /** Total de páginas */
    pages: number
  }
}

/**
 * Clase de Servicio de Administración
 * 
 * Centraliza todas las operaciones administrativas del sistema,
 * proporcionando una interfaz unificada para la gestión de usuarios,
 * moderación de contenido, análisis del sistema y configuración.
 * 
 * Proporciona métodos para:
 * - Gestión de estadísticas y análisis
 * - Moderación de artículos
 * - Administración de usuarios
 * - Gestión de logs del sistema
 * - Exportación de datos
 * - Respaldos del sistema
 * - Configuración del sistema
 * - Notificaciones administrativas
 * 
 * @class AdminService
 */
class AdminService {
  /**
   * Maneja errores de API de forma consistente
   * 
   * Procesa errores de peticiones HTTP y proporciona manejo
   * especializado para errores de autenticación, devolviendo
   * un formato estándar de error.
   * 
   * @private
   * @param {any} error - El objeto de error recibido
   * @param {string} defaultMessage - Mensaje de error por defecto
   * @returns {Object} Objeto de error procesado con formato estándar
   * 
   * @example
   * ```typescript
   * // Uso interno en métodos del servicio
   * return this.handleError(error, 'Error al procesar solicitud')
   * ```
   */
  private handleError(error: unknown, defaultMessage: string): { success: false; error: string; data: null } {
    const processedError = processError(error)
    
    // Maneja errores de autenticación específicamente
    if ((error as any).response?.status === 401) {
      handleAuthError(error, true)
    }
    
    return {
      success: false,
      error: processedError.message || defaultMessage,
      data: null
    }
  }

  /**
   * Obtiene estadísticas del sistema
   * 
   * Recupera métricas completas del sistema incluyendo usuarios,
   * artículos, intercambios y estado general del sistema.
   * 
   * @returns {Promise<AdminResponse<AdminStats> | {success: false; error: string; data: null}>} Promesa con estadísticas del sistema
   * 
   * @example
   * ```typescript
   * // Obtener estadísticas del sistema
   * const stats = await adminService.getStats()
   * 
   * if (stats.success) {
   *   console.log('Total usuarios:', stats.data.users.total)
   *   console.log('Artículos pendientes:', stats.data.items.pending)
   * }
   * ```
   */
  async getStats(): Promise<AdminResponse<AdminStats> | { success: false; error: string; data: null }> {
    try {
      const response: AxiosResponse<AdminResponse<AdminStats>> = await axios.get(
        ADMIN_ROUTES.ANALYTICS,
        { headers: getAuthHeaders() }
      )
      return response.data
    } catch (error) {
      return this.handleError(error, 'Error al cargar las estadísticas del sistema')
    }
  }

  /**
   * Obtiene análisis del sistema
   * 
   * Recupera datos analíticos detallados sobre tendencias y patrones
   * de uso del sistema para un período específico.
   * 
   * @param {Object} params - Parámetros de consulta (opcional)
   * @param {'day'|'week'|'month'|'year'} params.period - Período de análisis
   * @param {string} params.startDate - Fecha de inicio
   * @param {string} params.endDate - Fecha de fin
   * @returns {Promise<AdminResponse<AdminAnalytics> | {success: false; error: string; data: null}>} Promesa con datos analíticos
   * 
   * @example
   * ```typescript
   * // Obtener análisis del último mes
   * const analytics = await adminService.getAnalytics({
   *   period: 'month',
   *   startDate: '2024-01-01',
   *   endDate: '2024-01-31'
   * })
   * 
   * if (analytics.success) {
   *   console.log('Crecimiento de usuarios:', analytics.data.userGrowth)
   * }
   * ```
   */
  async getAnalytics(params?: {
    period?: 'day' | 'week' | 'month' | 'year'
    startDate?: string
    endDate?: string
  }): Promise<AdminResponse<AdminAnalytics> | { success: false; error: string; data: null }> {
    try {
      const response: AxiosResponse<AdminResponse<AdminAnalytics>> = await axios.get(
        ADMIN_ROUTES.ANALYTICS,
        {
          headers: getAuthHeaders(),
          params
        }
      )
      return response.data
    } catch (error) {
      return this.handleError(error, 'Error al cargar las analíticas')
    }
  }

  /**
   * Obtiene artículos para moderación
   * 
   * Recupera una lista de artículos que requieren moderación
   * con opciones de filtrado y paginación.
   * 
   * @param {Object} params - Parámetros de consulta (opcional)
   * @param {number} params.page - Número de página
   * @param {number} params.limit - Límite de elementos por página
   * @param {'pending'|'approved'|'rejected'} params.status - Estado de moderación
   * @param {string} params.category - Categoría de artículos
   * @param {string} params.sortBy - Campo de ordenamiento
   * @param {'asc'|'desc'} params.sortOrder - Orden de clasificación
   * @returns {Promise<AdminResponse<ModerationItem[]> | {success: false; error: string; data: null}>} Promesa con artículos para moderación
   * 
   * @example
   * ```typescript
   * // Obtener artículos pendientes de moderación
   * const items = await adminService.getItemsForModeration({
   *   status: 'pending',
   *   page: 1,
   *   limit: 20
   * })
   * 
   * if (items.success) {
   *   console.log('Artículos pendientes:', items.data.length)
   * }
   * ```
   */
  async getItemsForModeration(params?: {
    page?: number
    limit?: number
    status?: 'pending' | 'approved' | 'rejected'
    category?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }): Promise<AdminResponse<ModerationItem[]> | { success: false; error: string; data: null }> {
    try {
      const response: AxiosResponse<AdminResponse<ModerationItem[]>> = await axios.get(
        ADMIN_ROUTES.MODERATION,
        {
          headers: getAuthHeaders(),
          params
        }
      )
      return response.data
    } catch (error) {
      return this.handleError(error, 'Error al cargar artículos para moderación')
    }
  }

  /**
   * Aprueba un artículo
   * 
   * Marca un artículo como aprobado en el proceso de moderación,
   * permitiendo que sea visible públicamente.
   * 
   * @param {string} itemId - ID del artículo
   * @param {string} notes - Notas de moderación (opcional)
   * @returns {Promise<AdminResponse<ModerationItem> | {success: false; error: string; data: null}>} Promesa con resultado de aprobación
   * 
   * @example
   * ```typescript
   * // Aprobar un artículo con notas
   * const result = await adminService.approveItem(
   *   'item123',
   *   'Artículo cumple con todas las políticas'
   * )
   * 
   * if (result.success) {
   *   console.log('Artículo aprobado:', result.data.id)
   * }
   * ```
   */
  async approveItem(
    itemId: string,
    notes?: string
  ): Promise<AdminResponse<ModerationItem> | { success: false; error: string; data: null }> {
    try {
      const response: AxiosResponse<AdminResponse<ModerationItem>> = await axios.patch(
        ITEM_ROUTES.APPROVE(itemId),
        { notes },
        { headers: getAuthHeaders() }
      )
      return response.data
    } catch (error) {
      return this.handleError(error, 'Error al aprobar el artículo')
    }
  }

  /**
   * Rechaza un artículo
   * 
   * Marca un artículo como rechazado en el proceso de moderación,
   * impidiendo que sea visible públicamente.
   * 
   * @param {string} itemId - ID del artículo
   * @param {string} reason - Razón del rechazo
   * @param {string} notes - Notas de moderación (opcional)
   * @returns {Promise<AdminResponse<ModerationItem> | {success: false; error: string; data: null}>} Promesa con resultado de rechazo
   * 
   * @example
   * ```typescript
   * // Rechazar un artículo
   * const result = await adminService.rejectItem(
   *   'item123',
   *   'Contenido inapropiado',
   *   'El artículo contiene imágenes no permitidas'
   * )
   * 
   * if (result.success) {
   *   console.log('Artículo rechazado:', result.data.id)
   * }
   * ```
   */
  async rejectItem(
    itemId: string,
    reason: string,
    notes?: string
  ): Promise<AdminResponse<ModerationItem> | { success: false; error: string; data: null }> {
    try {
      const response: AxiosResponse<AdminResponse<ModerationItem>> = await axios.patch(
        ITEM_ROUTES.REJECT(itemId),
        { reason, notes },
        { headers: getAuthHeaders() }
      )
      return response.data
    } catch (error) {
      return this.handleError(error, 'Error al rechazar el artículo')
    }
  }

  /**
   * Cambia la disponibilidad de un artículo
   * 
   * Modifica el estado de disponibilidad de un artículo,
   * controlando si está disponible para intercambio.
   * 
   * @param {string} itemId - ID del artículo
   * @param {boolean} isAvailable - Estado de disponibilidad
   * @returns {Promise<AdminResponse<Item> | {success: false; error: string; data: null}>} Promesa con resultado de actualización
   * 
   * @example
   * ```typescript
   * // Hacer un artículo no disponible
   * const result = await adminService.toggleItemAvailability('item123', false)
   * 
   * if (result.success) {
   *   console.log('Disponibilidad actualizada:', result.data.isAvailable)
   * }
   * ```
   */
  async toggleItemAvailability(
    itemId: string,
    isAvailable: boolean
  ): Promise<AdminResponse<Item> | { success: false; error: string; data: null }> {
    try {
      const response: AxiosResponse<AdminResponse<Item>> = await axios.patch(
        ITEM_ROUTES.AVAILABILITY(itemId),
        { isAvailable },
        { headers: getAuthHeaders() }
      )
      return response.data
    } catch (error) {
      return this.handleError(error, 'Error al cambiar la disponibilidad del artículo')
    }
  }

  /**
   * Obtiene todos los usuarios para gestión administrativa
   * 
   * Recupera una lista completa de usuarios del sistema con
   * opciones avanzadas de filtrado, búsqueda y paginación.
   * 
   * @param {Object} params - Parámetros de consulta (opcional)
   * @param {number} params.page - Número de página
   * @param {number} params.limit - Límite de elementos por página
   * @param {string} params.search - Término de búsqueda
   * @param {string} params.role - Filtro por rol
   * @param {'active'|'inactive'} params.status - Filtro por estado
   * @param {string} params.sortBy - Campo de ordenamiento
   * @param {'asc'|'desc'} params.sortOrder - Orden de clasificación
   * @returns {Promise<AdminResponse<AdminUser[]> | {success: false; error: string; data: null}>} Promesa con lista de usuarios
   * 
   * @example
   * ```typescript
   * // Obtener usuarios activos con rol de admin
   * const users = await adminService.getUsers({
   *   role: 'admin',
   *   status: 'active',
   *   page: 1,
   *   limit: 50
   * })
   * 
   * if (users.success) {
   *   console.log('Administradores activos:', users.data.length)
   * }
   * ```
   */
  async getUsers(params?: {
    page?: number
    limit?: number
    search?: string
    role?: string
    status?: 'active' | 'inactive'
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }): Promise<AdminResponse<AdminUser[]> | { success: false; error: string; data: null }> {
    try {
      const response: AxiosResponse<AdminResponse<AdminUser[]>> = await axios.get(
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
   * Actualiza el rol de un usuario
   * 
   * Modifica el rol asignado a un usuario específico,
   * cambiando sus permisos y accesos en el sistema.
   * 
   * @param {string} userId - ID del usuario
   * @param {string} role - Nuevo rol a asignar
   * @returns {Promise<AdminResponse<AdminUser> | {success: false; error: string; data: null}>} Promesa con resultado de actualización
   * 
   * @example
   * ```typescript
   * // Promover usuario a administrador
   * const result = await adminService.updateUserRole('user123', 'admin')
   * 
   * if (result.success) {
   *   console.log('Rol actualizado:', result.data.role)
   * }
   * ```
   */
  async updateUserRole(
    userId: string,
    role: string
  ): Promise<AdminResponse<AdminUser> | { success: false; error: string; data: null }> {
    try {
      const response: AxiosResponse<AdminResponse<AdminUser>> = await axios.patch(
        `${USER_ROUTES.BY_ID(userId)}/role`,
        { role },
        { headers: getAuthHeaders() }
      )
      return response.data
    } catch (error) {
      return this.handleError(error, 'Error al actualizar el rol del usuario')
    }
  }

  /**
   * Cambia el estado de un usuario
   * 
   * Activa o desactiva una cuenta de usuario, controlando
   * su acceso al sistema.
   * 
   * @param {string} userId - ID del usuario
   * @param {boolean} isActive - Estado activo del usuario
   * @returns {Promise<AdminResponse<AdminUser> | {success: false; error: string; data: null}>} Promesa con resultado de actualización
   * 
   * @example
   * ```typescript
   * // Desactivar usuario
   * const result = await adminService.toggleUserStatus('user123', false)
   * 
   * if (result.success) {
   *   console.log('Usuario desactivado:', result.data.id)
   * }
   * ```
   */
  async toggleUserStatus(
    userId: string,
    isActive: boolean
  ): Promise<AdminResponse<AdminUser> | { success: false; error: string; data: null }> {
    try {
      const response: AxiosResponse<AdminResponse<AdminUser>> = await axios.patch(
        `${USER_ROUTES.BY_ID(userId)}/status`,
        { isActive },
        { headers: getAuthHeaders() }
      )
      return response.data
    } catch (error) {
      return this.handleError(error, 'Error al cambiar el estado del usuario')
    }
  }

  /**
   * Elimina un usuario
   * 
   * Elimina permanentemente una cuenta de usuario del sistema.
   * Esta acción es irreversible y debe usarse con precaución.
   * 
   * @param {string} userId - ID del usuario a eliminar
   * @returns {Promise<AdminResponse<void> | {success: false; error: string; data: null}>} Promesa con resultado de eliminación
   * 
   * @example
   * ```typescript
   * // Eliminar usuario
   * const result = await adminService.deleteUser('user123')
   * 
   * if (result.success) {
   *   console.log('Usuario eliminado exitosamente')
   * }
   * ```
   */
  async deleteUser(userId: string): Promise<AdminResponse<void> | { success: false; error: string; data: null }> {
    try {
      const response: AxiosResponse<AdminResponse<void>> = await axios.delete(
        USER_ROUTES.BY_ID(userId),
        { headers: getAuthHeaders() }
      )
      return response.data
    } catch (error) {
      return this.handleError(error, 'Error al eliminar el usuario')
    }
  }

  /**
   * Obtiene logs del sistema
   * 
   * Recupera registros de actividad del sistema con opciones
   * de filtrado por nivel, fecha, usuario y acción.
   * 
   * @param {Object} params - Parámetros de consulta (opcional)
   * @param {number} params.page - Número de página
   * @param {number} params.limit - Límite de elementos por página
   * @param {'info'|'warn'|'error'|'debug'} params.level - Nivel de log
   * @param {string} params.startDate - Fecha de inicio
   * @param {string} params.endDate - Fecha de fin
   * @param {string} params.userId - ID del usuario
   * @param {string} params.action - Acción específica
   * @returns {Promise<AdminResponse<SystemLog[]> | {success: false; error: string; data: null}>} Promesa con logs del sistema
   * 
   * @example
   * ```typescript
   * // Obtener logs de error del último día
   * const logs = await adminService.getSystemLogs({
   *   level: 'error',
   *   startDate: '2024-01-01',
   *   endDate: '2024-01-02'
   * })
   * 
   * if (logs.success) {
   *   console.log('Errores encontrados:', logs.data.length)
   * }
   * ```
   */
  async getSystemLogs(params?: {
    page?: number
    limit?: number
    level?: 'info' | 'warn' | 'error' | 'debug'
    startDate?: string
    endDate?: string
    userId?: string
    action?: string
  }): Promise<AdminResponse<SystemLog[]> | { success: false; error: string; data: null }> {
    try {
      const response: AxiosResponse<AdminResponse<SystemLog[]>> = await axios.get(
        ADMIN_ROUTES.LOGS,
        {
          headers: getAuthHeaders(),
          params
        }
      )
      return response.data
    } catch (error) {
      return this.handleError(error, 'Error al cargar los logs del sistema')
    }
  }

  /**
   * Exporta datos del sistema
   * 
   * Genera y descarga archivos de exportación de datos
   * en diferentes formatos (CSV, JSON, XLSX).
   * 
   * @param {'users'|'items'|'trades'|'logs'} type - Tipo de datos a exportar
   * @param {Object} params - Parámetros de exportación (opcional)
   * @param {'csv'|'json'|'xlsx'} params.format - Formato de exportación
   * @param {string} params.startDate - Fecha de inicio
   * @param {string} params.endDate - Fecha de fin
   * @param {Record<string, any>} params.filters - Filtros adicionales
   * @returns {Promise<AdminResponse<{downloadUrl: string}> | {success: false; error: string; data: null}>} Promesa con URL de descarga
   * 
   * @example
   * ```typescript
   * // Exportar usuarios en formato CSV
   * const export = await adminService.exportData('users', {
   *   format: 'csv',
   *   startDate: '2024-01-01',
   *   endDate: '2024-01-31'
   * })
   * 
   * if (export.success) {
   *   window.open(export.data.downloadUrl)
   * }
   * ```
   */
  async exportData(
    type: 'users' | 'items' | 'trades' | 'logs',
    params?: {
      format?: 'csv' | 'json' | 'xlsx'
      startDate?: string
      endDate?: string
      filters?: Record<string, any>
    }
  ): Promise<AdminResponse<{ downloadUrl: string }> | { success: false; error: string; data: null }> {
    try {
      const response: AxiosResponse<AdminResponse<{ downloadUrl: string }>> = await axios.post(
        `${ADMIN_ROUTES.EXPORT}/${type}`,
        params,
        { headers: getAuthHeaders() }
      )
      return response.data
    } catch (error) {
      return this.handleError(error, 'Error al exportar los datos')
    }
  }

  /**
   * Crea un respaldo del sistema
   * 
   * Genera un respaldo completo del sistema incluyendo
   * base de datos y archivos importantes.
   * 
   * @returns {Promise<AdminResponse<{backupId: string; downloadUrl: string}> | {success: false; error: string; data: null}>} Promesa con información del respaldo
   * 
   * @example
   * ```typescript
   * // Crear respaldo del sistema
   * const backup = await adminService.createBackup()
   * 
   * if (backup.success) {
   *   console.log('Respaldo creado:', backup.data.backupId)
   *   console.log('URL de descarga:', backup.data.downloadUrl)
   * }
   * ```
   */
  async createBackup(): Promise<AdminResponse<{ backupId: string; downloadUrl: string }> | { success: false; error: string; data: null }> {
    try {
      const response: AxiosResponse<AdminResponse<{ backupId: string; downloadUrl: string }>> = await axios.post(
        ADMIN_ROUTES.BACKUP,
        {},
        { headers: getAuthHeaders() }
      )
      return response.data
    } catch (error) {
      return this.handleError(error, 'Error al crear el respaldo')
    }
  }

  /**
   * Obtiene el historial de respaldos
   * 
   * Recupera una lista de todos los respaldos realizados
   * con su estado y enlaces de descarga.
   * 
   * @returns {Promise<AdminResponse<Array<{id: string; createdAt: string; size: number; status: string; downloadUrl?: string}>> | {success: false; error: string; data: null}>} Promesa con historial de respaldos
   * 
   * @example
   * ```typescript
   * // Obtener historial de respaldos
   * const history = await adminService.getBackupHistory()
   * 
   * if (history.success) {
   *   console.log('Respaldos disponibles:', history.data.length)
   *   history.data.forEach(backup => {
   *     console.log(`Respaldo ${backup.id}: ${backup.status}`)
   *   })
   * }
   * ```
   */
  async getBackupHistory(): Promise<AdminResponse<Array<{
    id: string
    createdAt: string
    size: number
    status: 'completed' | 'failed' | 'in_progress'
    downloadUrl?: string
  }>> | { success: false; error: string; data: null }> {
    try {
      const response = await axios.get(
        `${ADMIN_ROUTES.BACKUP}/history`,
        { headers: getAuthHeaders() }
      )
      return response.data
    } catch (error) {
      return this.handleError(error, 'Error al cargar el historial de respaldos')
    }
  }

  /**
   * Actualiza la configuración del sistema
   * 
   * Modifica configuraciones globales del sistema como
   * límites, políticas y parámetros operacionales.
   * 
   * @param {Record<string, any>} settings - Configuraciones a actualizar
   * @returns {Promise<AdminResponse<Record<string, any>> | {success: false; error: string; data: null}>} Promesa con configuración actualizada
   * 
   * @example
   * ```typescript
   * // Actualizar configuración del sistema
   * const result = await adminService.updateSystemSettings({
   *   maxItemsPerUser: 50,
   *   moderationRequired: true,
   *   maintenanceMode: false
   * })
   * 
   * if (result.success) {
   *   console.log('Configuración actualizada:', result.data)
   * }
   * ```
   */
  async updateSystemSettings(
    settings: Record<string, any>
  ): Promise<AdminResponse<Record<string, any>> | { success: false; error: string; data: null }> {
    try {
      const response: AxiosResponse<AdminResponse<Record<string, any>>> = await axios.patch(
        ADMIN_ROUTES.SETTINGS,
        settings,
        { headers: getAuthHeaders() }
      )
      return response.data
    } catch (error) {
      return this.handleError(error, 'Error al actualizar la configuración del sistema')
    }
  }

  /**
   * Obtiene la configuración del sistema
   * 
   * Recupera todas las configuraciones actuales del sistema
   * incluyendo límites, políticas y parámetros operacionales.
   * 
   * @returns {Promise<AdminResponse<Record<string, any>> | {success: false; error: string; data: null}>} Promesa con configuración del sistema
   * 
   * @example
   * ```typescript
   * // Obtener configuración actual
   * const settings = await adminService.getSystemSettings()
   * 
   * if (settings.success) {
   *   console.log('Modo mantenimiento:', settings.data.maintenanceMode)
   *   console.log('Máximo artículos por usuario:', settings.data.maxItemsPerUser)
   * }
   * ```
   */
  async getSystemSettings(): Promise<AdminResponse<Record<string, any>> | { success: false; error: string; data: null }> {
    try {
      const response: AxiosResponse<AdminResponse<Record<string, any>>> = await axios.get(
        ADMIN_ROUTES.SETTINGS,
        { headers: getAuthHeaders() }
      )
      return response.data
    } catch (error) {
      return this.handleError(error, 'Error al cargar la configuración del sistema')
    }
  }

  /**
   * Envía notificación del sistema
   * 
   * Envía notificaciones masivas a usuarios del sistema
   * a través de múltiples canales (email, push, in-app).
   * 
   * @param {Object} notification - Datos de la notificación
   * @param {string} notification.title - Título de la notificación
   * @param {string} notification.message - Mensaje de la notificación
   * @param {'info'|'warning'|'error'|'success'} notification.type - Tipo de notificación
   * @param {'all'|'admins'|'users'|string[]} notification.recipients - Destinatarios
   * @param {('email'|'push'|'in_app')[]} notification.channels - Canales de envío
   * @returns {Promise<AdminResponse<{sent: number; failed: number}> | {success: false; error: string; data: null}>} Promesa con resultado del envío
   * 
   * @example
   * ```typescript
   * // Enviar notificación de mantenimiento
   * const result = await adminService.sendSystemNotification({
   *   title: 'Mantenimiento Programado',
   *   message: 'El sistema estará en mantenimiento mañana de 2-4 AM',
   *   type: 'warning',
   *   recipients: 'all',
   *   channels: ['email', 'in_app']
   * })
   * 
   * if (result.success) {
   *   console.log(`Enviado a ${result.data.sent} usuarios`)
   * }
   * ```
   */
  async sendSystemNotification(notification: {
    title: string
    message: string
    type: 'info' | 'warning' | 'error' | 'success'
    recipients: 'all' | 'admins' | 'users' | string[]
    channels: ('email' | 'push' | 'in_app')[]
  }): Promise<AdminResponse<{ sent: number; failed: number }> | { success: false; error: string; data: null }> {
    try {
      const response: AxiosResponse<AdminResponse<{ sent: number; failed: number }>> = await axios.post(
        ADMIN_ROUTES.NOTIFICATIONS,
        notification,
        { headers: getAuthHeaders() }
      )
      return response.data
    } catch (error) {
      return this.handleError(error, 'Error al enviar la notificación')
    }
  }
}

/**
 * Instancia singleton del servicio de administración
 * 
 * Se exporta una instancia única para uso en toda la aplicación.
 * Esto garantiza consistencia en el manejo de operaciones administrativas
 * y evita la creación de múltiples instancias innecesarias.
 * 
 * @example
 * ```typescript
 * import { adminService } from '@/features/admin/services/adminService'
 * 
 * // Usar el servicio en cualquier parte de la aplicación
 * const stats = await adminService.getStats()
 * ```
 */
export const adminService = new AdminService()
export default adminService

// Types are already exported with their definitions above