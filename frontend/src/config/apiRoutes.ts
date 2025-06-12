/**
 * @file apiRoutes.ts
 * @description Configuración centralizada de rutas de API para Ecommunitas
 * @module Config/ApiRoutes
 * @version 1.0.0
 * @author Ecommunitas Team
 * @created 2024
 * 
 * Este módulo centraliza todas las rutas de la API REST para:
 * - Mantener consistencia en las URLs
 * - Facilitar el mantenimiento y actualizaciones
 * - Proporcionar tipado seguro para las rutas
 * - Evitar errores de escritura en URLs
 * - Permitir cambios centralizados de endpoints
 * 
 * Incluye rutas para:
 * - Autenticación (login, registro, perfil)
 * - Items/Artículos (CRUD, búsqueda, moderación)
 * - Usuarios (perfiles, gestión)
 * - Mensajes (conversaciones, notificaciones)
 * - Administración (moderación, estadísticas)
 */

/**
 * URL base para todas las rutas de la API
 * @constant {string} API_BASE_URL
 */
export const API_BASE_URL = '/api/v1'

/**
 * Rutas relacionadas con autenticación y gestión de sesiones
 * 
 * @constant {object} AUTH_ROUTES
 * @description
 * Contiene todas las rutas para operaciones de autenticación:
 * - LOGIN: Inicio de sesión
 * - REGISTER: Registro de nuevos usuarios
 * - LOGOUT: Cierre de sesión
 * - ME: Obtener información del usuario actual
 * - PROFILE: Gestión de perfil
 * - CHECK: Verificar estado de autenticación
 * - FORGOT_PASSWORD: Solicitar recuperación de contraseña
 * - RESET_PASSWORD: Restablecer contraseña con token
 * - UPDATE_PASSWORD: Actualizar contraseña
 */
export const AUTH_ROUTES = {
  LOGIN: `${API_BASE_URL}/auth/login`,
  REGISTER: `${API_BASE_URL}/auth/register`,
  LOGOUT: `${API_BASE_URL}/auth/logout`,
  ME: `${API_BASE_URL}/auth/me`,
  PROFILE: `${API_BASE_URL}/auth/profile`,
  CHECK: `${API_BASE_URL}/auth/check`,
  FORGOT_PASSWORD: `${API_BASE_URL}/auth/forgotpassword`,
  RESET_PASSWORD: (token: string) => `${API_BASE_URL}/auth/resetpassword/${token}`,
  UPDATE_PASSWORD: `${API_BASE_URL}/auth/updatepassword`
} as const

/**
 * Rutas para gestión de items/artículos
 * 
 * @constant {object} ITEM_ROUTES
 * @description
 * Contiene todas las rutas para operaciones con items:
 * - BASE: Operaciones CRUD básicas
 * - BY_ID: Obtener item específico por ID
 * - SEARCH: Búsqueda avanzada de items
 * - BY_USER: Items de un usuario específico
 * - AVAILABILITY: Gestión de disponibilidad
 * - MODERATION: Rutas de moderación
 * - APPROVE/REJECT: Aprobación y rechazo de items
 */
export const ITEM_ROUTES = {
  BASE: `${API_BASE_URL}/items`,
  BY_ID: (id: string) => `${API_BASE_URL}/items/${id}`,
  SEARCH: `${API_BASE_URL}/items/search`,
  BY_USER: (userId: string) => `${API_BASE_URL}/items/user/${userId}`,
  AVAILABILITY: (id: string) => `${API_BASE_URL}/items/${id}/availability`,
  MODERATION: `${API_BASE_URL}/items/moderation`,
  APPROVE: (id: string) => `${API_BASE_URL}/items/${id}/approve`,
  REJECT: (id: string) => `${API_BASE_URL}/items/${id}/reject`
} as const

/**
 * Rutas para gestión de usuarios
 * 
 * @constant {object} USER_ROUTES
 * @description
 * Contiene todas las rutas para operaciones con usuarios:
 * - BASE: Operaciones básicas de usuarios
 * - BY_ID: Obtener usuario específico por ID
 * - PROFILE: Gestión de perfil de usuario
 * - ITEMS: Items de un usuario específico
 * - TRADES: Intercambios de un usuario
 */
export const USER_ROUTES = {
  BASE: `${API_BASE_URL}/users`,
  BY_ID: (id: string) => `${API_BASE_URL}/users/${id}`,
  PROFILE: `${API_BASE_URL}/users/profile`,
  ITEMS: (userId: string) => `${API_BASE_URL}/users/${userId}/items`,
  TRADES: (userId: string) => `${API_BASE_URL}/users/${userId}/trades`
} as const

/**
 * Rutas para sistema de mensajería
 * 
 * @constant {object} MESSAGE_ROUTES
 * @description
 * Contiene todas las rutas para operaciones de mensajería:
 * - BASE: Operaciones básicas de mensajes
 * - BY_ID: Obtener mensaje específico por ID
 * - SEND: Enviar nuevos mensajes
 * - MESSAGES: Mensajes de una conversación específica
 * - CONVERSATIONS: Lista de conversaciones del usuario
 * - MARK_READ: Marcar mensajes como leídos
 * - UNREAD_COUNT: Contador de mensajes no leídos
 */
export const MESSAGE_ROUTES = {
  BASE: `${API_BASE_URL}/messages`,
  BY_ID: (id: string) => `${API_BASE_URL}/messages/${id}`,
  SEND: `${API_BASE_URL}/messages`,
  MESSAGES: `${API_BASE_URL}/messages/conversation/:conversationId`,
  CONVERSATIONS: `${API_BASE_URL}/messages/conversations`,
  CONVERSATION_BY_USER: (userId: string) => `${API_BASE_URL}/messages/conversations/${userId}`,
  UNREAD: `${API_BASE_URL}/messages/unread`,
  UNREAD_COUNT: `${API_BASE_URL}/messages/unread/count`,
  MARK_READ: (id: string) => `${API_BASE_URL}/messages/${id}/read`,
  MARK_CONVERSATION_READ: (userId: string) => `${API_BASE_URL}/messages/conversations/${userId}/read`,
  DELETE: (id: string) => `${API_BASE_URL}/messages/${id}`,
  START_CONVERSATION: `${API_BASE_URL}/messages/start`
} as const

/**
 * Rutas para funciones administrativas
 * 
 * @constant {object} ADMIN_ROUTES
 * @description
 * Contiene todas las rutas para operaciones administrativas:
 * - ANALYTICS: Estadísticas y análisis del sistema
 * - USERS: Gestión administrativa de usuarios
 * - MODERATION: Panel de moderación
 * - LOGS: Registros del sistema
 * - EXPORT: Exportación de datos
 * - BACKUP: Respaldos del sistema
 * - SETTINGS: Configuraciones del sistema
 * - NOTIFICATIONS: Gestión de notificaciones
 */
export const ADMIN_ROUTES = {
  ANALYTICS: `${API_BASE_URL}/analytics`,
  USERS: `${API_BASE_URL}/users`,
  MODERATION: `${API_BASE_URL}/items/moderation`,
  LOGS: `${API_BASE_URL}/admin/logs`,
  EXPORT: `${API_BASE_URL}/admin/export`,
  BACKUP: `${API_BASE_URL}/admin/backup`,
  SETTINGS: `${API_BASE_URL}/admin/settings`,
  NOTIFICATIONS: `${API_BASE_URL}/admin/notifications`
} as const

/**
 * Rutas para monitoreo del sistema
 * 
 * @constant {object} SYSTEM_ROUTES
 * @description
 * Contiene rutas para verificar el estado del sistema:
 * - HEALTH: Verificación de salud del sistema
 * - STATUS: Estado general del sistema
 */
export const SYSTEM_ROUTES = {
  HEALTH: `${API_BASE_URL}/health`,
  STATUS: `${API_BASE_URL}/status`
} as const

/**
 * Objeto unificado que contiene todas las rutas de la API
 * 
 * @constant {object} API_ROUTES
 * @description
 * Agrupa todas las rutas por categorías para fácil acceso:
 * - AUTH: Rutas de autenticación
 * - ITEMS: Rutas de items/artículos
 * - USERS: Rutas de usuarios
 * - MESSAGES: Rutas de mensajería
 * - ADMIN: Rutas administrativas
 * - SYSTEM: Rutas del sistema
 */
export const API_ROUTES = {
  AUTH: AUTH_ROUTES,
  ITEMS: ITEM_ROUTES,
  USERS: USER_ROUTES,
  MESSAGES: MESSAGE_ROUTES,
  ADMIN: ADMIN_ROUTES,
  SYSTEM: SYSTEM_ROUTES
} as const

/**
 * Tipos TypeScript para las rutas de la API
 * @description Proporcionan tipado seguro para todas las rutas
 */

/** Tipo para rutas de autenticación */
export type AuthRoutes = typeof AUTH_ROUTES

/** Tipo para rutas de items */
export type ItemRoutes = typeof ITEM_ROUTES

/** Tipo para rutas de usuarios */
export type UserRoutes = typeof USER_ROUTES

/** Tipo para rutas de mensajes */
export type MessageRoutes = typeof MESSAGE_ROUTES

/** Tipo para rutas administrativas */
export type AdminRoutes = typeof ADMIN_ROUTES

/** Tipo para rutas del sistema */
export type SystemRoutes = typeof SYSTEM_ROUTES

/** Tipo para todas las rutas de la API */
export type ApiRoutes = typeof API_ROUTES

/**
 * Construye una URL con parámetros de consulta
 * 
 * @function buildUrl
 * @param {string} baseUrl - URL base sin parámetros
 * @param {Record<string, any>} [params] - Objeto con parámetros de consulta
 * @returns {string} URL completa con parámetros de consulta
 * 
 * @example
 * ```typescript
 * const url = buildUrl('/api/v1/items', { page: 1, limit: 10 })
 * // Resultado: '/api/v1/items?page=1&limit=10'
 * ```
 */
export const buildUrl = (baseUrl: string, params?: Record<string, any>): string => {
  if (!params || Object.keys(params).length === 0) {
    return baseUrl
  }
  
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value))
    }
  })
  
  return `${baseUrl}?${searchParams.toString()}`
}

/**
 * Valida si una ruta pertenece a la API
 * 
 * @function isValidRoute
 * @param {string} route - Ruta a validar
 * @returns {boolean} true si la ruta es válida, false en caso contrario
 * 
 * @example
 * ```typescript
 * isValidRoute('/api/v1/items') // true
 * isValidRoute('/external/api') // false
 * ```
 */
export const isValidRoute = (route: string): boolean => {
  return route.startsWith(API_BASE_URL)
}

/**
 * Exportación por defecto de todas las rutas principales
 * @default API_ROUTES
 */
export default API_ROUTES