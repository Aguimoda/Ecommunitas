/**
 * Shared Utilities Index
 * Centralizes exports for all shared utility functions
 * Enables clean imports: import { displayError, formatFileSize } from '@/shared/utils'
 */

// Error handling utilities
export {
  displayError,
  processError,
  isAxiosError,
  handleValidationError,
  handleAuthError,
  createUserFriendlyMessage,
  logError,
  default as errorHandler
} from './errorHandler'

export type {
  ErrorCode,
  ErrorResponse,
  ApiError
} from './errorHandler'

// Common utility functions

/**
 * Formatea el tamaño de archivo en bytes a formato legible
 * @param {number} bytes - Tamaño en bytes
 * @param {number} decimals - Número de decimales a mostrar
 * @returns {string} Cadena con el tamaño formateado (ej: "1.5 MB")
 * @description Convierte bytes a unidades apropiadas (KB, MB, GB, etc.)
 */
export function formatFileSize(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

/**
 * Aplica debounce a una función para limitar su frecuencia de ejecución
 * @template T - Tipo de la función a aplicar debounce
 * @param {T} func - Función a la que aplicar debounce
 * @param {number} wait - Tiempo de espera en milisegundos
 * @param {boolean} immediate - Si ejecutar inmediatamente en la primera llamada
 * @returns {Function} Función con debounce aplicado
 * @description Útil para optimizar eventos como búsquedas en tiempo real
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      if (!immediate) func(...args)
    }
    
    const callNow = immediate && !timeout
    
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    
    if (callNow) func(...args)
  }
}

/**
 * Aplica throttle a una función para limitar su frecuencia de ejecución
 * @template T - Tipo de la función a aplicar throttle
 * @param {T} func - Función a la que aplicar throttle
 * @param {number} limit - Límite de tiempo en milisegundos entre ejecuciones
 * @returns {Function} Función con throttle aplicado
 * @description Útil para eventos que se disparan frecuentemente como scroll o resize
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  
  return function executedFunction(this: unknown, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * Capitaliza la primera letra de una cadena
 * @param {string} str - Cadena a capitalizar
 * @returns {string} Cadena con la primera letra en mayúscula
 * @description Convierte la primera letra a mayúscula y el resto a minúscula
 */
export function capitalize(str: string): string {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Convierte una cadena a formato kebab-case
 * @param {string} str - Cadena a convertir
 * @returns {string} Cadena en formato kebab-case (ej: "mi-cadena")
 * @description Útil para nombres de archivos, URLs y clases CSS
 */
export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase()
}

/**
 * Convierte una cadena a formato camelCase
 * @param {string} str - Cadena a convertir
 * @returns {string} Cadena en formato camelCase (ej: "miCadena")
 * @description Útil para nombres de variables y propiedades en JavaScript
 */
export function toCamelCase(str: string): string {
  return str
    .replace(/[-_\s]+(.)?/g, (_, char) => char ? char.toUpperCase() : '')
    .replace(/^[A-Z]/, char => char.toLowerCase())
}

/**
 * Convierte una cadena a formato PascalCase
 * @param {string} str - Cadena a convertir
 * @returns {string} Cadena en formato PascalCase (ej: "MiCadena")
 * @description Útil para nombres de clases y componentes
 */
export function toPascalCase(str: string): string {
  const camelCase = toCamelCase(str)
  return camelCase.charAt(0).toUpperCase() + camelCase.slice(1)
}

/**
 * Genera un ID aleatorio
 * @param {number} length - Longitud del ID a generar
 * @returns {string} ID aleatorio generado
 * @description Útil para crear identificadores únicos temporales
 */
export function generateId(length = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return result
}

/**
 * Parsea JSON de forma segura con valor de respaldo
 * @template T - Tipo del valor de retorno
 * @param {string} str - Cadena JSON a parsear
 * @param {T} fallback - Valor de respaldo si el parseo falla
 * @returns {T} Objeto parseado o valor de respaldo
 * @description Evita errores al parsear JSON inválido
 */
export function safeJsonParse<T>(str: string, fallback: T): T {
  try {
    return JSON.parse(str)
  } catch {
    return fallback
  }
}

/**
 * Verifica si un valor está vacío (null, undefined, cadena vacía, array vacío, objeto vacío)
 * @param {unknown} value - Valor a verificar
 * @returns {boolean} True si el valor está vacío
 * @description Útil para validaciones y verificaciones de datos
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim().length === 0
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

/**
 * Clona profundamente un objeto
 * @template T - Tipo del objeto a clonar
 * @param {T} obj - Objeto a clonar
 * @returns {T} Objeto clonado profundamente
 * @description Crea una copia independiente del objeto original
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as unknown as T
  if (typeof obj === 'object') {
    const clonedObj = {} as T
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
  return obj
}

/**
 * Formatea una fecha a cadena localizada
 * @param {Date} date - Fecha a formatear
 * @param {string} locale - Código de idioma/región
 * @param {Intl.DateTimeFormatOptions} options - Opciones de formato
 * @returns {string} Fecha formateada como cadena
 * @description Utiliza Intl.DateTimeFormat para formateo localizado
 */
export function formatDate(
  date: Date | string | number,
  locale = 'es-ES',
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }
): string {
  const dateObj = new Date(date)
  return dateObj.toLocaleDateString(locale, options)
}

/**
 * Formatea una fecha a tiempo relativo (ej: "hace 2 horas")
 * @param {Date|string|number} date - Fecha a formatear
 * @param {string} locale - Código de idioma/región
 * @returns {string} Cadena de tiempo relativo
 * @description Muestra el tiempo transcurrido de forma legible
 */
export function formatRelativeTime(
  date: Date | string | number,
  locale = 'es-ES'
): string {
  const dateObj = new Date(date)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000)
  
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
  
  if (diffInSeconds < 60) {
    return rtf.format(-diffInSeconds, 'second')
  } else if (diffInSeconds < 3600) {
    return rtf.format(-Math.floor(diffInSeconds / 60), 'minute')
  } else if (diffInSeconds < 86400) {
    return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour')
  } else if (diffInSeconds < 2592000) {
    return rtf.format(-Math.floor(diffInSeconds / 86400), 'day')
  } else if (diffInSeconds < 31536000) {
    return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month')
  } else {
    return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year')
  }
}

/**
 * Trunca texto a una longitud específica con puntos suspensivos
 * @param {string} text - Texto a truncar
 * @param {number} maxLength - Longitud máxima permitida
 * @param {string} suffix - Sufijo a agregar (por defecto: '...')
 * @returns {string} Texto truncado
 * @description Útil para mostrar texto en espacios limitados
 */
export function truncateText(text: string, maxLength: number, suffix = '...'): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength - suffix.length) + suffix
}

/**
 * Valida el formato de un email
 * @param {string} email - Email a validar
 * @returns {boolean} True si el email es válido
 * @description Utiliza expresión regular para validar formato básico
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Valida el formato de una URL
 * @param {string} url - URL a validar
 * @returns {boolean} True si la URL es válida
 * @description Utiliza el constructor URL nativo para validación
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Pausa la ejecución por los milisegundos especificados
 * @param {number} ms - Milisegundos a esperar
 * @returns {Promise<void>} Promise que se resuelve después del tiempo especificado
 * @description Útil para agregar delays en funciones async
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Reintenta una función con backoff exponencial
 * @template T - Tipo del valor de retorno de la función
 * @param {() => Promise<T>} fn - Función a reintentar
 * @param {number} maxRetries - Número máximo de reintentos
 * @param {number} baseDelay - Delay base en milisegundos
 * @returns {Promise<T>} Promise con el resultado de la función
 * @description Útil para operaciones que pueden fallar temporalmente
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      
      if (attempt === maxRetries) {
        throw lastError
      }
      
      const delay = baseDelay * Math.pow(2, attempt)
      await sleep(delay)
    }
  }
  
  throw lastError!
}