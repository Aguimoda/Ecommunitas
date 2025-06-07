/**
 * @fileoverview Utilidades de seguridad para la aplicación
 * @description Proporciona funciones para configurar políticas de seguridad, sanitización de datos,
 * manejo de sesiones y protección contra vulnerabilidades comunes como XSS y CSRF
 */

import { ref } from 'vue'
import DOMPurify from 'dompurify'
import { useToast } from 'vue-toastification'

/**
 * Configuración de directivas CSP (Content Security Policy)
 * @description Define las políticas de seguridad de contenido para la aplicación
 */
type CSPDirectives = {
  'default-src'?: string[]
  'script-src'?: string[]
  'style-src'?: string[]
  'img-src'?: string[]
  'connect-src'?: string[]
  'font-src'?: string[]
  'object-src'?: string[]
  'media-src'?: string[]
  'frame-src'?: string[]
  'worker-src'?: string[]
  'child-src'?: string[]
  'form-action'?: string[]
  'frame-ancestors'?: string[]
  'plugin-types'?: string[]
  'base-uri'?: string[]
  'report-uri'?: string[]
  'report-to'?: string[]
  'require-trusted-types-for'?: string[]
  'trusted-types'?: string[]
  'upgrade-insecure-requests'?: boolean
  'block-all-mixed-content'?: boolean
  /** Alias para report-uri en formato camelCase */
  reportUri?: string
}

/**
 * Configuración general de seguridad de la aplicación
 * @description Opciones para configurar diferentes aspectos de seguridad
 */
type SecurityConfig = {
  /** Políticas de seguridad de contenido */
  csp?: CSPDirectives | string
  /** Habilitar HTTP Strict Transport Security */
  hsts?: boolean
  /** Habilitar protección X-Content-Type-Options */
  nosniff?: boolean
  /** Habilitar protección XSS */
  xssProtection?: boolean
  /** Configuración de X-Frame-Options */
  frameOptions?: 'DENY' | 'SAMEORIGIN' | string
  /** Habilitar modo de solo reporte para CSP */
  cspReportOnly?: boolean
  /** Nonce para CSP */
  cspNonce?: string
  /** Habilitar cookies seguras */
  secureCookies?: boolean
  /** Token CSRF */
  csrfToken?: string
}

// Estado reactivo de seguridad
const securityEnabled = ref(true)

/**
 * Configura las políticas de seguridad para la aplicación
 * @param {SecurityConfig} config - Configuración de seguridad a aplicar
 * @description Establece CSP, protección XSS y otras medidas de seguridad en el DOM
 */
export function configureSecurity(config: SecurityConfig) {
  // Configurar CSP
  if (config.csp) {
    const meta = document.createElement('meta')
    meta.httpEquiv = config.cspReportOnly ? 'Content-Security-Policy-Report-Only' : 'Content-Security-Policy'
    
    let cspValue: string
    if (typeof config.csp === 'string') {
      cspValue = config.csp
    } else {
      const directives = []
      
      if (config.cspNonce) {
        directives.push(`script-src 'nonce-${config.cspNonce}' 'strict-dynamic' 'unsafe-inline' 'self'`)
        directives.push(`style-src 'nonce-${config.cspNonce}' 'unsafe-inline' 'self'`)
        directives.push('worker-src blob:')
        directives.push('manifest-src \'self\'')
        directives.push('upgrade-insecure-requests')
        directives.push('block-all-mixed-content')
      }
      
      Object.entries(config.csp).forEach(([key, value]) => {
        if (key !== 'reportUri' && value) {
          directives.push(`${key} ${Array.isArray(value) ? value.join(' ') : value}`)
        }
      })
      
      if (config.csp.reportUri) {
        directives.push(`report-uri ${config.csp.reportUri}`)
      }
      
      cspValue = directives.join('; ')
    }
    
    meta.content = cspValue
    document.head.appendChild(meta)
  }

  // Configurar protección XSS
  if (config.xssProtection !== false) {
    const xssProtectionMeta = document.createElement('meta')
    xssProtectionMeta.httpEquiv = 'X-XSS-Protection'
    xssProtectionMeta.content = '1; mode=block'
    document.head.appendChild(xssProtectionMeta)
  }

  // Configurar cookies seguras
  if (config.secureCookies !== false) {
    const cookieAttributes = [
      'SameSite=' + (location.protocol === 'https:' ? 'None' : 'Lax'),
      location.protocol === 'https:' ? 'Secure' : '',
      'Path=/'
    ].filter(Boolean).join('; ')
    
    // Set standard secure cookie
    document.cookie = `SecureCookie=true; ${cookieAttributes}`
    
    // Set __Secure- prefixed cookie for HTTPS
    if (location.protocol === 'https:') {
      document.cookie = `__Secure-Cookie=true; ${cookieAttributes}`
    }
    
    // Set partitioned cookie for cross-site usage
    if (location.protocol === 'https:') {
      document.cookie = `PartitionedCookie=true; ${cookieAttributes}; Partitioned`
    }
  }

  // Configurar token CSRF
  if (config.csrfToken) {
    localStorage.setItem('csrfToken', config.csrfToken)
  }
}

/**
 * Sanitiza una cadena de texto eliminando contenido potencialmente peligroso
 * @param {string} input - Texto a sanitizar
 * @returns {string} Texto sanitizado y seguro
 * @description Utiliza DOMPurify para eliminar scripts y contenido malicioso
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return ''
  }
  
  // Usar DOMPurify para limpiar el input
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  })
}

/**
 * Sanitiza recursivamente todos los campos de texto en un objeto de datos
 * @param {Record<string, any>} data - Objeto con datos a sanitizar
 * @returns {Record<string, any>} Objeto con datos sanitizados
 * @description Aplica sanitización a strings, arrays y objetos anidados
 */
export function sanitizeFormData(data: Record<string, any>): Record<string, any> {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [
      key,
      typeof value === 'string' ? sanitizeInput(value) : 
      Array.isArray(value) ? value.map(item => 
        typeof item === 'string' ? sanitizeInput(item) : item
      ) : 
      value && typeof value === 'object' ? sanitizeFormData(value) : value
    ])
  )
}

/**
 * Genera headers de seguridad estándar para peticiones HTTP
 * @returns {Headers} Headers configurados con políticas de seguridad
 * @description Incluye protecciones XSS, CSRF, frame options y más
 */
export function getSecureHeaders(): Headers {
  const headers: Record<string, string> = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
  }
  
  if (securityEnabled.value) {
    headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
  }
  
  // Agregar token CSRF si está disponible
  const csrfToken = localStorage.getItem('csrfToken')
  if (csrfToken) {
    headers['X-CSRF-Token'] = csrfToken
  }
  
  return new Headers(headers)
}

/**
 * Genera un token CSRF criptográficamente seguro
 * @returns {string} Token CSRF único
 * @description Utiliza crypto.getRandomValues para generar tokens seguros
 */
export function generateCSRFToken(): string {
  const array = new Uint32Array(10)
  crypto.getRandomValues(array)
  return Array.from(array, dec => ('0' + dec.toString(16)).substr(-2)).join('')
}

/**
 * Habilita o deshabilita las medidas de seguridad globalmente
 * @param {boolean} enabled - Si las medidas de seguridad deben estar activas
 * @description Útil para desarrollo, pero debe estar habilitado en producción
 */
export function toggleSecurity(enabled: boolean) {
  securityEnabled.value = enabled
  
  if (enabled) {
    setupSessionManagement()
    // toast.success('Seguridad activada')
  } else {
    cleanupSessionManagement()
    // toast.warning('Seguridad desactivada')
    console.warn('⚠️ Seguridad deshabilitada - Solo para desarrollo')
  }
}

/**
 * Verifica si las medidas de seguridad están habilitadas
 * @returns {boolean} Estado actual de la seguridad
 */
export function isSecurityEnabled() {
  return securityEnabled.value
}

/**
 * Session management with cross-tab synchronization and inactivity timeout
 */
const sessionTimeout = ref<NodeJS.Timeout | null>(null)
const SESSION_TIMEOUT_MS = 30 * 60 * 1000 // 30 minutes
const SESSION_EVENT = 'session-event'

export function setupSessionManagement() {
  // Handle cross-tab events
  window.addEventListener('storage', (event) => {
    if (event.key === 'session-activity') {
      resetInactivityTimer()
    }
  })

  // Track user activity
  window.addEventListener('mousemove', resetInactivityTimer)
  window.addEventListener('keydown', resetInactivityTimer)
  window.addEventListener('scroll', resetInactivityTimer)

  resetInactivityTimer()
}

function resetInactivityTimer() {
  if (sessionTimeout.value) {
    clearTimeout(sessionTimeout.value)
  }

  // Broadcast activity to other tabs
  localStorage.setItem('session-activity', Date.now().toString())

  sessionTimeout.value = setTimeout(() => {
    window.dispatchEvent(new CustomEvent(SESSION_EVENT, {
      detail: { type: 'timeout' }
    }))
    // Optional: trigger logout or other actions
  }, SESSION_TIMEOUT_MS)
}

export function cleanupSessionManagement() {
  if (sessionTimeout.value) {
    clearTimeout(sessionTimeout.value)
    sessionTimeout.value = null
  }

  window.removeEventListener('mousemove', resetInactivityTimer)
  window.removeEventListener('keydown', resetInactivityTimer)
  window.removeEventListener('scroll', resetInactivityTimer)
}

/**
 * Vue Router middleware for security enhancements
 */
export function createSecurityMiddleware(options: {
  authRequired?: boolean
  csrfProtected?: boolean
}) {
  return (to: any, _from: any, next: any) => {
    // Check if security is enabled
    if (!isSecurityEnabled()) {
      return next()
    }

    // Auth protection
    if (options.authRequired && !isAuthenticated()) {
      return next({ name: 'LoginView', query: { redirect: to.fullPath } })
    }

    // CSRF protection for sensitive routes
    if (options.csrfProtected) {
      const csrfToken = localStorage.getItem('csrfToken')
      if (!csrfToken || csrfToken !== to.meta.csrfToken) {
        const toast = useToast()
        toast.error('Invalid CSRF token')
        return next(false)
      }
    }

    // Apply security headers
    applyRouteSecurityHeaders(to)
    next()
  }
}

function isAuthenticated(): boolean {
  // Implementation depends on your auth system
  return !!localStorage.getItem('authToken')
}

function applyRouteSecurityHeaders(route: any) {
  // Apply security headers specific to route
  const headers = getSecureHeaders()
  route.meta.headers = {
    ...route.meta.headers,
    ...headers
  }
}

/**
 * Example usage in router:
 * {
 *   path: '/secure',
 *   component: SecureComponent,
 *   meta: { csrfToken: 'generated-token' },
 *   beforeEnter: createSecurityMiddleware({
 *     authRequired: true,
 *     csrfProtected: true
 *   })
 * }
 */