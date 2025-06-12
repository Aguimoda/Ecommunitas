/**
 * @file setup.ts
 * @description Configuración global para el entorno de testing de Ecommunitas
 * @module Tests/Setup
 * @version 1.0.0
 * @author Equipo de Desarrollo Ecommunitas
 * @created 2024
 * 
 * Este archivo configura el entorno global de testing para toda la aplicación.
 * Proporciona mocks, configuraciones y utilidades necesarias para ejecutar
 * tests unitarios y de integración de manera consistente y aislada.
 * 
 * CONFIGURACIONES INCLUIDAS:
 * =========================
 * 
 * 🏪 **PINIA (Estado Global)**:
 * - Instancia limpia de Pinia para cada test
 * - Aislamiento completo entre tests
 * - Configuración automática de stores
 * 
 * 🛣️ **VUE ROUTER**:
 * - Router mock con rutas básicas
 * - Navegación simulada para tests
 * - Configuración global para Vue Test Utils
 * 
 * 🔇 **CONSOLE MOCKING**:
 * - Silenciamiento de warnings de Vue
 * - Filtrado de logs innecesarios
 * - Preservación de errores importantes
 * 
 * 🌐 **WEB APIs MOCKING**:
 * - fetch: Cliente HTTP simulado
 * - localStorage: Almacenamiento local mock
 * - sessionStorage: Almacenamiento de sesión mock
 * - location: Objeto location del navegador
 * - IntersectionObserver: Observer de intersección
 * - ResizeObserver: Observer de redimensionamiento
 * 
 * VENTAJAS DE ESTA CONFIGURACIÓN:
 * ==============================
 * 
 * ✅ **Aislamiento**: Cada test ejecuta en un entorno limpio
 * ✅ **Consistencia**: Configuración uniforme para todos los tests
 * ✅ **Performance**: Mocks optimizados para velocidad
 * ✅ **Debugging**: Logs controlados y útiles
 * ✅ **Compatibilidad**: Soporte completo para Vue 3 y Pinia
 * ✅ **Realismo**: Mocks que simulan el comportamiento real
 * 
 * @example
 * ```typescript
 * // Este setup se ejecuta automáticamente antes de cada test
 * // No necesitas importarlo manualmente en tus archivos de test
 * 
 * // En tus tests, puedes usar los mocks configurados:
 * import { localStorageMock } from '@/tests/setup'
 * 
 * it('should use localStorage mock', () => {
 *   localStorageMock.setItem('key', 'value')
 *   expect(localStorageMock.setItem).toHaveBeenCalledWith('key', 'value')
 * })
 * ```
 */

import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, afterEach, vi } from 'vitest'
import { config } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'

// Configurar Pinia para todos los tests
beforeEach(() => {
  // Crear una nueva instancia de Pinia para cada test
  const pinia = createPinia()
  setActivePinia(pinia)
})

// Configurar Vue Test Utils globalmente
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: { template: '<div>Home</div>' } },
    { path: '/login', component: { template: '<div>Login</div>' } },
    { path: '/register', component: { template: '<div>Register</div>' } },
    { path: '/items', component: { template: '<div>Items</div>' } },
    { path: '/profile', component: { template: '<div>Profile</div>' } }
  ]
})

config.global.plugins = [router]

// Mock de console para evitar logs innecesarios en tests
const originalConsoleError = console.error
const originalConsoleWarn = console.warn

beforeEach(() => {
  // Silenciar warnings de Vue en tests
  console.error = vi.fn((message) => {
    if (typeof message === 'string' && (
      message.includes('[Vue warn]') ||
      message.includes('Pinia') ||
      message.includes('router')
    )) {
      return
    }
    originalConsoleError(message)
  })
  
  console.warn = vi.fn((message) => {
    if (typeof message === 'string' && (
      message.includes('[Vue warn]') ||
      message.includes('Pinia') ||
      message.includes('router')
    )) {
      return
    }
    originalConsoleWarn(message)
  })
})

// Restaurar console después de cada test
afterEach(() => {
  console.error = originalConsoleError
  console.warn = originalConsoleWarn
})

// Mock global de fetch para todos los tests
global.fetch = vi.fn()

// Mock de localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock de sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock
})

// Mock de window.location
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000',
    protocol: 'http:',
    host: 'localhost:3000',
    hostname: 'localhost',
    port: '3000',
    pathname: '/',
    search: '',
    hash: '',
    reload: vi.fn(),
    assign: vi.fn(),
    replace: vi.fn()
  },
  writable: true
})

// Mock de IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}))

// Mock de ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}))

export { localStorageMock, sessionStorageMock }