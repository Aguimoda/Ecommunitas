/**
 * Shared Error Handler Composable
 * Centralizes error handling logic across the application
 * Provides consistent error messaging and logging
 */

import { ref } from 'vue'
import { useToast } from 'vue-toastification'

export interface ErrorDetails {
  message: string
  code: string
  status?: number
  context?: string
}

export function useErrorHandler() {
  const toast = useToast()
  const lastError = ref<ErrorDetails | null>(null)

  /**
   * Handles API errors with standardized messaging
   * @param error - The error object from API calls
   * @param context - Optional context for better error tracking
   */
  const handleApiError = (error: any, context?: string): ErrorDetails => {
    let message = 'Error desconocido'
    let errorCode = 'UNKNOWN'
    let status: number | undefined

    if (error.response) {
      // API Response Error
      status = error.response.status
      message = error.response.data?.message || error.response.data?.error || error.response.statusText
      errorCode = `API_${status}`

      // Specific messages for common status codes
      switch (status) {
        case 400:
          message = 'Datos inválidos: ' + (error.response.data?.errors?.join(', ') || message)
          break
        case 401:
          message = 'Sesión expirada. Por favor, inicia sesión nuevamente'
          // Clear invalid token
          localStorage.removeItem('token')
          break
        case 403:
          message = 'No tienes permisos para realizar esta acción'
          break
        case 404:
          message = 'Recurso no encontrado'
          break
        case 422:
          message = 'Error de validación: ' + (error.response.data?.errors?.join(', ') || message)
          break
        case 429:
          message = 'Demasiadas solicitudes. Intenta nuevamente en unos momentos'
          break
        case 500:
        case 502:
        case 503:
          message = 'Error del servidor. Intenta nuevamente más tarde'
          break
      }
    } else if (error.request) {
      // Network Error
      message = 'No se pudo conectar al servidor. Verifica tu conexión a internet'
      errorCode = 'NETWORK_ERROR'
    } else {
      // Client Error
      message = error.message || 'Error inesperado'
      errorCode = 'CLIENT_ERROR'
    }

    const errorDetails: ErrorDetails = {
      message,
      code: errorCode,
      status,
      context
    }

    lastError.value = errorDetails
    
    // Log error for debugging
    console.error('Error handled:', {
      ...errorDetails,
      originalError: error
    })

    return errorDetails
  }

  /**
   * Displays error message using toast notification
   * @param error - Error object or string message
   * @param context - Optional context for error tracking
   */
  const displayError = (error: any, context?: string): void => {
    const errorDetails = typeof error === 'string' 
      ? { message: error, code: 'CUSTOM', context }
      : handleApiError(error, context)

    toast.error(errorDetails.message)
  }

  /**
   * Displays success message using toast notification
   * @param message - Success message to display
   */
  const displaySuccess = (message: string): void => {
    toast.success(message)
  }

  /**
   * Displays info message using toast notification
   * @param message - Info message to display
   */
  const displayInfo = (message: string): void => {
    toast.info(message)
  }

  /**
   * Displays warning message using toast notification
   * @param message - Warning message to display
   */
  const displayWarning = (message: string): void => {
    toast.warning(message)
  }

  /**
   * Clears the last error
   */
  const clearError = (): void => {
    lastError.value = null
  }

  /**
   * Creates a standardized error object
   * @param message - Error message
   * @param code - Error code
   * @param status - HTTP status code (optional)
   */
  const createError = (message: string, code: string, status?: number): ErrorDetails => {
    return { message, code, status }
  }

  return {
    // State
    lastError,
    
    // Methods
    handleApiError,
    displayError,
    displaySuccess,
    displayInfo,
    displayWarning,
    clearError,
    createError
  }
}

// Export type for external use
export type UseErrorHandler = ReturnType<typeof useErrorHandler>