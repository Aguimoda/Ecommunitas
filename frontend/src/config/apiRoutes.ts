/**
 * @file apiRoutes.ts
 * @description Configuración centralizada de rutas de API
 * Estandariza todas las llamadas a la API en la aplicación
 */

// Base URL de la API
export const API_BASE_URL = '/api/v1'

// Rutas de Autenticación
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

// Rutas de Items/Artículos
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

// Rutas de Usuarios
export const USER_ROUTES = {
  BASE: `${API_BASE_URL}/users`,
  BY_ID: (id: string) => `${API_BASE_URL}/users/${id}`,
  PROFILE: `${API_BASE_URL}/users/profile`,
  ITEMS: (userId: string) => `${API_BASE_URL}/users/${userId}/items`,
  TRADES: (userId: string) => `${API_BASE_URL}/users/${userId}/trades`
} as const

// Rutas de Mensajes
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

// Rutas de Administración
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

// Rutas del Sistema
export const SYSTEM_ROUTES = {
  HEALTH: `${API_BASE_URL}/health`,
  STATUS: `${API_BASE_URL}/status`
} as const

// Exportar todas las rutas como un objeto unificado
export const API_ROUTES = {
  AUTH: AUTH_ROUTES,
  ITEMS: ITEM_ROUTES,
  USERS: USER_ROUTES,
  MESSAGES: MESSAGE_ROUTES,
  ADMIN: ADMIN_ROUTES,
  SYSTEM: SYSTEM_ROUTES
} as const

// Tipos para TypeScript
export type AuthRoutes = typeof AUTH_ROUTES
export type ItemRoutes = typeof ITEM_ROUTES
export type UserRoutes = typeof USER_ROUTES
export type MessageRoutes = typeof MESSAGE_ROUTES
export type AdminRoutes = typeof ADMIN_ROUTES
export type SystemRoutes = typeof SYSTEM_ROUTES
export type ApiRoutes = typeof API_ROUTES

// Función helper para construir URLs con parámetros de consulta
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

// Función helper para validar rutas
export const isValidRoute = (route: string): boolean => {
  return route.startsWith(API_BASE_URL)
}

// Exportar por defecto las rutas principales
export default API_ROUTES