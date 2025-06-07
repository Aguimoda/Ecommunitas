/**
 * @file setup.ts
 * @description Configuración global para los tests de Vitest
 * Configura Pinia, Vue Router y otros servicios necesarios para testing
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