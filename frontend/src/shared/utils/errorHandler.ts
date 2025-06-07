/**
 * Error Handler Utility
 * Centralized error handling and display logic
 * Provides consistent error processing across the application
 */

import { useNotifications } from '../composables/useNotifications'
import type { AxiosError } from 'axios'

// Error types
export type ErrorCode = 
  | 'UNKNOWN'
  | 'NETWORK_ERROR'
  | 'CLIENT_ERROR'
  | 'VALIDATION_ERROR'
  | 'AUTH_ERROR'
  | 'PERMISSION_ERROR'
  | 'NOT_FOUND'
  | 'SERVER_ERROR'
  | 'TIMEOUT_ERROR'
  | 'RATE_LIMIT_ERROR'

// Error response interface
export interface ErrorResponse {
  message: string
  code: ErrorCode
  details?: any
  statusCode?: number
}

// API Error interface
export interface ApiError {
  message?: string
  errors?: string[]
  code?: string
  details?: any
}

/**
 * Displays error using toast notifications
 * @param error - The error to display
 * @param options - Display options
 * @returns Error response object
 */
export function displayError(
  error: any,
  options: {
    showToast?: boolean
    logError?: boolean
    customMessage?: string
  } = {}
): ErrorResponse {
  const { showToast = true, logError = true, customMessage } = options
  const { notifyError } = useNotifications()
  
  const errorResponse = processError(error, customMessage)
  
  if (logError) {
    console.error(`[${errorResponse.code}] ${errorResponse.message}`, error)
  }
  
  if (showToast) {
    notifyError(errorResponse.message)
  }
  
  return errorResponse
}

/**
 * Processes error and returns standardized error response
 * @param error - The error to process
 * @param customMessage - Optional custom message override
 * @returns Standardized error response
 */
export function processError(error: any, customMessage?: string): ErrorResponse {
  let message = customMessage || 'Error desconocido'
  let code: ErrorCode = 'UNKNOWN'
  let statusCode: number | undefined
  let details: any
  
  if (isAxiosError(error)) {
    statusCode = error.response?.status
    const apiError = error.response?.data as ApiError
    
    if (error.response) {
      // API Error
      message = apiError?.message || error.response.statusText
      details = apiError?.details
      
      // Specific messages for common status codes
      switch (error.response.status) {
        case 400:
          code = 'VALIDATION_ERROR'
          if (apiError?.errors?.length) {
            message = 'Datos inválidos: ' + apiError.errors.join(', ')
          } else {
            message = 'Datos inválidos: ' + message
          }
          break
        case 401:
          code = 'AUTH_ERROR'
          message = 'No autorizado: ' + message
          break
        case 403:
          code = 'PERMISSION_ERROR'
          message = 'Sin permisos: ' + message
          break
        case 404:
          code = 'NOT_FOUND'
          message = 'Recurso no encontrado'
          break
        case 408:
          code = 'TIMEOUT_ERROR'
          message = 'Tiempo de espera agotado'
          break
        case 429:
          code = 'RATE_LIMIT_ERROR'
          message = 'Demasiadas solicitudes. Intenta más tarde.'
          break
        case 500:
        case 502:
        case 503:
        case 504:
          code = 'SERVER_ERROR'
          message = 'Error del servidor: ' + message
          break
        default:
          code = `API_${error.response.status}` as ErrorCode
      }
    } else if (error.request) {
      // Network Error
      code = 'NETWORK_ERROR'
      message = 'No se pudo conectar al servidor. Verifica tu conexión a internet.'
    } else {
      // Request setup error
      code = 'CLIENT_ERROR'
      message = error.message
    }
  } else if (error instanceof Error) {
    // Standard JavaScript Error
    code = 'CLIENT_ERROR'
    message = error.message
    details = error.stack
  } else if (typeof error === 'string') {
    // String error
    code = 'CLIENT_ERROR'
    message = error
  } else if (error && typeof error === 'object') {
    // Object with message property
    code = 'CLIENT_ERROR'
    message = error.message || JSON.stringify(error)
    details = error
  }
  
  return {
    message: customMessage || message,
    code,
    details,
    statusCode
  }
}

/**
 * Type guard to check if error is an Axios error
 * @param error - Error to check
 * @returns True if error is AxiosError
 */
export function isAxiosError(error: any): error is AxiosError {
  return error && error.isAxiosError === true
}

/**
 * Handles validation errors specifically
 * @param error - Validation error
 * @returns Formatted validation error message
 */
export function handleValidationError(error: any): string {
  if (isAxiosError(error) && error.response?.status === 400) {
    const apiError = error.response.data as ApiError
    if (apiError?.errors?.length) {
      return apiError.errors.join(', ')
    }
  }
  
  return 'Error de validación'
}

/**
 * Handles authentication errors
 * @param error - Auth error
 * @param redirectToLogin - Whether to redirect to login
 */
export function handleAuthError(error: any, redirectToLogin = false): void {
  const { notifyAuthError } = useNotifications()
  
  if (isAxiosError(error) && error.response?.status === 401) {
    notifyAuthError()
    
    if (redirectToLogin && typeof window !== 'undefined') {
      // Clear any stored auth data
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      
      // Redirect to login (you might want to use router here)
      window.location.href = '/login'
    }
  } else {
    displayError(error)
  }
}

/**
 * Creates a user-friendly error message
 * @param error - The error
 * @param context - Additional context
 * @returns User-friendly message
 */
export function createUserFriendlyMessage(error: any, context?: string): string {
  const errorResponse = processError(error)
  
  const contextPrefix = context ? `${context}: ` : ''
  
  switch (errorResponse.code) {
    case 'NETWORK_ERROR':
      return `${contextPrefix}Problema de conexión. Verifica tu internet e intenta nuevamente.`
    case 'AUTH_ERROR':
      return `${contextPrefix}Necesitas iniciar sesión para continuar.`
    case 'PERMISSION_ERROR':
      return `${contextPrefix}No tienes permisos para realizar esta acción.`
    case 'NOT_FOUND':
      return `${contextPrefix}El recurso solicitado no existe.`
    case 'VALIDATION_ERROR':
      return `${contextPrefix}Por favor, revisa los datos ingresados.`
    case 'SERVER_ERROR':
      return `${contextPrefix}Error del servidor. Intenta más tarde.`
    case 'RATE_LIMIT_ERROR':
      return `${contextPrefix}Demasiadas solicitudes. Espera un momento e intenta nuevamente.`
    default:
      return `${contextPrefix}${errorResponse.message}`
  }
}

/**
 * Logs error with additional context
 * @param error - The error to log
 * @param context - Additional context
 * @param level - Log level
 */
export function logError(
  error: any,
  context?: string,
  level: 'error' | 'warn' | 'info' = 'error'
): void {
  const errorResponse = processError(error)
  const contextStr = context ? ` [${context}]` : ''
  const logMessage = `[${errorResponse.code}]${contextStr} ${errorResponse.message}`
  
  switch (level) {
    case 'error':
      console.error(logMessage, error)
      break
    case 'warn':
      console.warn(logMessage, error)
      break
    case 'info':
      console.info(logMessage, error)
      break
  }
}

// Legacy export for backward compatibility
export { displayError as default }