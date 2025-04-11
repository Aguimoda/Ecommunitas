import axios, { AxiosError } from 'axios'
import { useToast } from 'vue-toastification'

type ErrorType = 'network' | 'validation' | 'auth' | 'server' | 'timeout' | 'cancel' | 'unknown'

interface ErrorInfo {
  type: ErrorType
  message: string
  originalError: unknown
  retryable: boolean
}

const toast = useToast()

export function classifyError(error: unknown): ErrorInfo {
  if (axios.isCancel(error)) {
    return {
      type: 'cancel',
      message: 'Operación cancelada',
      originalError: error,
      retryable: false
    }
  }

  const axiosError = error as AxiosError
  
  if (!axios.isAxiosError(error)) {
    return {
      type: 'unknown',
      message: 'Error desconocido',
      originalError: error,
      retryable: false
    }
  }

  if (axiosError.code === 'ECONNABORTED') {
    return {
      type: 'timeout',
      message: 'Tiempo de espera agotado',
      originalError: error,
      retryable: true
    }
  }

  if (!axiosError.response) {
    return {
      type: 'network',
      message: 'Error de conexión',
      originalError: error,
      retryable: true
    }
  }

  const status = axiosError.response.status
  
  if (status === 401 || status === 403) {
    return {
      type: 'auth',
      message: 'No autorizado',
      originalError: error,
      retryable: false
    }
  }

  if (status === 400) {
    return {
      type: 'validation',
      message: 'Datos inválidos',
      originalError: error,
      retryable: false
    }
  }

  if (status >= 500) {
    return {
      type: 'server',
      message: 'Error del servidor',
      originalError: error,
      retryable: true
    }
  }

  return {
    type: 'unknown',
    message: 'Error desconocido',
    originalError: error,
    retryable: false
  }
}

export function handleError(error: unknown, customMessages?: Partial<Record<ErrorType, string>>) {
  const errorInfo = classifyError(error)
  const message = customMessages?.[errorInfo.type] || errorInfo.message
  
  toast.error(message)
  
  return errorInfo
}

export function withRetry<T>(
  fn: () => Promise<T>,
  options: { maxRetries?: number, delay?: number } = {}
): Promise<T> {
  const { maxRetries = 3, delay = 1000 } = options
  
  return new Promise((resolve, reject) => {
    let retries = 0
    
    const attempt = async () => {
      try {
        const result = await fn()
        resolve(result)
      } catch (error) {
        const errorInfo = classifyError(error)
        
        if (!errorInfo.retryable || retries >= maxRetries) {
          reject(error)
          return
        }
        
        retries++
        setTimeout(attempt, delay)
      }
    }
    
    attempt()
  })
}

export function createAbortController() {
  return new AbortController()
}