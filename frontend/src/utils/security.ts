import Headers  from 'axios'
import { ref } from 'vue'
import { useToast } from 'vue-toastification'

type CSPDirectives = {
  defaultSrc?: string[]
  scriptSrc?: string[]
  styleSrc?: string[]
  imgSrc?: string[]
  connectSrc?: string[]
  fontSrc?: string[]
  objectSrc?: string[]
  mediaSrc?: string[]
  frameSrc?: string[]
  reportUri?: string
  reportTo?: string
  workerSrc?: string[]
  manifestSrc?: string[]
  prefetchSrc?: string[]
  navigateTo?: string[]
  formAction?: string[]
  sandbox?: string[]
  upgradeInsecureRequests?: boolean
  blockAllMixedContent?: boolean
}

type SecurityConfig = {
  csp?: string | CSPDirectives
  xssProtection?: boolean
  secureCookies?: boolean
  csrfToken?: string
  cspNonce?: string
  cspReportOnly?: boolean
}

const toast = useToast()
const securityEnabled = ref(true)

/**
 * Configura las políticas de seguridad para la aplicación
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
    const meta = document.createElement('meta')
    meta.httpEquiv = 'X-XSS-Protection'
    meta.content = '1; mode=block'
    document.head.appendChild(meta)
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
 * Sanitiza entradas de usuario para prevenir XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Valida y limpia datos de formulario
 */
export function sanitizeFormData(data: Record<string, any>): Record<string, any> {
  return Object.entries(data).reduce((acc, [key, value]) => {
    if (typeof value === 'string') {
      acc[key] = sanitizeInput(value)
    } else if (Array.isArray(value)) {
      acc[key] = value.map(item => 
        typeof item === 'string' ? sanitizeInput(item) : item
      )
    } else if (value && typeof value === 'object') {
      acc[key] = sanitizeFormData(value)
    } else {
      acc[key] = value
    }
    return acc
  }, {} as Record<string, any>)
}

/**
 * Configura headers de seguridad para axios
 */
export function getSecureHeaders(): Headers {
  const headers: Record<string, string> = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'accelerometer=(), ambient-light-sensor=(), autoplay=(), battery=(), camera=(), cross-origin-isolated=(), display-capture=(), document-domain=(), encrypted-media=(), execution-while-not-rendered=(), execution-while-out-of-viewport=(), fullscreen=(), geolocation=(), gyroscope=(), keyboard-map=(), magnetometer=(), microphone=(), midi=(), navigation-override=(), payment=(), picture-in-picture=(), publickey-credentials-get=(), screen-wake-lock=(), sync-xhr=(), usb=(), web-share=(), xr-spatial-tracking=(), clipboard-write=(), gamepad=(), speaker-selection=(), conversion-measurement=(), focus-without-user-activation=(), hid=(), idle-detection=(), interest-cohort=(), serial=(), sync-script=(), trust-token-redemption=(), unload=(), vertical-scroll=()',
    'Cross-Origin-Embedder-Policy': 'require-corp',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin',
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    'Document-Policy': 'document-write=(), oversized-images=2.0, unsized-media=()',
    'Origin-Agent-Cluster': '?1',
    'Cache-Control': 'no-store',
    'Clear-Site-Data': '"cache", "cookies", "storage", "executionContexts"',
    'Expect-CT': 'max-age=86400, enforce'
  }

  const csrfToken = localStorage.getItem('csrfToken')
  if (csrfToken) {
    headers['X-CSRF-Token'] = csrfToken
  }

  return headers
}

/**
 * Genera un token CSRF seguro
 */
export function generateCSRFToken(): string {
  const array = new Uint32Array(10)
  window.crypto.getRandomValues(array)
  return Array.from(array, dec => dec.toString(16).padStart(2, '0')).join('')
}

/**
 * Habilita/deshabilita las funciones de seguridad
 */
export function toggleSecurity(enabled: boolean) {
  securityEnabled.value = enabled
  
  if (enabled) {
    setupSessionManagement()
    toast.success('Seguridad activada')
  } else {
    cleanupSessionManagement()
    toast.warning('Seguridad desactivada')
  }
}

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
  return (to: any, from: any, next: any) => {
    // Check if security is enabled
    if (!isSecurityEnabled()) {
      return next()
    }

    // Auth protection
    if (options.authRequired && !isAuthenticated()) {
      return next({ name: 'login', query: { redirect: to.fullPath } })
    }

    // CSRF protection for sensitive routes
    if (options.csrfProtected) {
      const csrfToken = localStorage.getItem('csrfToken')
      if (!csrfToken || csrfToken !== to.meta.csrfToken) {
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