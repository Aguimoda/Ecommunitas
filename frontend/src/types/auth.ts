/**
 * @file auth.ts
 * @description Definiciones de tipos para el sistema de autenticación
 */

/**
 * Información del usuario autenticado
 */
export interface User {
  _id: string
  name: string
  email: string
  profileImage?: string
  location?: string
  bio?: string
  createdAt: string
  lastActivity?: string
}

/**
 * Estado de autenticación
 */
export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  lastActivity: number
}

/**
 * Credenciales para inicio de sesión
 */
export interface LoginCredentials {
  email: string
  password: string
  remember?: boolean
}

/**
 * Credenciales para registro de usuario
 */
export interface RegisterCredentials extends LoginCredentials {
  name: string
}

/**
 * Respuesta de autenticación del servidor
 */
export interface AuthResponse {
  token: string
  user?: User
}

/**
 * Opciones para el sistema de autenticación
 */
export interface AuthOptions {
  /** URL base para peticiones de autenticación */
  apiBaseUrl?: string
  /** Tiempo de expiración del token en milisegundos */
  tokenExpiration?: number
  /** Número máximo de reintentos para operaciones fallidas */
  maxRetries?: number
  /** Tiempo entre reintentos en milisegundos */
  retryDelay?: number
  /** Si debe refrescar automáticamente el token */
  autoRefreshToken?: boolean
  /** Intervalo para refrescar el token en milisegundos */
  refreshTokenInterval?: number
  /** Si debe hacer tracking de actividad */
  trackActivity?: boolean
  /** Tiempo de inactividad para cerrar sesión en milisegundos */
  inactivityTimeout?: number
}