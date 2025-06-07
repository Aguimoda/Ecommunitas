/**
 * @file useAuth.test.ts
 * @description Test suite para el composable useAuth
 * Prueba la funcionalidad de autenticación de usuarios
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'
import type { User, LoginCredentials, RegisterCredentials } from '@/features/auth/services/authService'

// Mock de datos de prueba
const mockUser: User = {
  id: '1',
  email: 'test@example.com',
  name: 'Usuario de Prueba',
  role: 'user',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

const mockLoginCredentials: LoginCredentials = {
  email: 'test@example.com',
  password: 'password123'
}

const mockRegisterData: RegisterCredentials = {
  email: 'test@example.com',
  password: 'password123',
  name: 'Usuario de Prueba',
  confirmPassword: 'password123'
}

// Mock del servicio de autenticación
const mockAuthService = {
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  checkAuth: vi.fn(),
  updateProfile: vi.fn()
}

// Mock del localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}

// Mock del router
const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  go: vi.fn(),
  back: vi.fn(),
  forward: vi.fn()
}

// Configurar mocks
vi.mock('@/features/auth/services/authService', () => ({
  default: mockAuthService
}))

vi.mock('@/shared/composables/useLocalStorage', () => ({
  useLocalStorage: vi.fn(() => [
    ref(null),
    vi.fn(),
    vi.fn()
  ])
}))

vi.mock('@/shared/utils/errorHandler', () => ({
  displayError: vi.fn()
}))

vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => mockRouter)
}))

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Configurar localStorage mock
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true
    })
  })

  describe('Inicialización', () => {
    it('debería inicializar con estado por defecto', async () => {
      // Importar dinámicamente para evitar problemas de hoisting
      const { useAuth } = await import('@/features/auth/composables/useAuth')
      
      const { user, isAuthenticated, isLoading } = useAuth()
      
      expect(user.value).toBeNull()
      expect(isAuthenticated.value).toBe(false)
      expect(isLoading.value).toBe(false)
    })
  })

  describe('Funcionalidad de login', () => {
    it('debería realizar login exitosamente', async () => {
      // Configurar mock para login exitoso
      mockAuthService.login.mockResolvedValue({
        user: mockUser,
        token: 'mock-token',
        refreshToken: 'mock-refresh-token'
      })
      
      const { useAuth } = await import('@/features/auth/composables/useAuth')
      const { login, user, isAuthenticated } = useAuth()
      
      const result = await login(mockLoginCredentials)
      
      expect(result.success).toBe(true)
      expect(mockAuthService.login).toHaveBeenCalledWith(mockLoginCredentials)
    })

    it('debería manejar errores de login', async () => {
      // Configurar mock para login fallido
      const mockError = new Error('Credenciales inválidas')
      mockAuthService.login.mockRejectedValue(mockError)
      
      const { useAuth } = await import('@/features/auth/composables/useAuth')
      const { login } = useAuth()
      
      const result = await login(mockLoginCredentials)
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('Credenciales inválidas')
    })
  })

  describe('Funcionalidad de registro', () => {
    it('debería realizar registro exitosamente', async () => {
      // Configurar mock para registro exitoso
      mockAuthService.register.mockResolvedValue({
        user: mockUser,
        token: 'mock-token',
        refreshToken: 'mock-refresh-token'
      })
      
      const { useAuth } = await import('@/features/auth/composables/useAuth')
      const { register } = useAuth()
      
      const result = await register(mockRegisterData)
      
      expect(result.success).toBe(true)
      expect(mockAuthService.register).toHaveBeenCalledWith(mockRegisterData)
    })

    it('debería manejar errores de registro', async () => {
      // Configurar mock para registro fallido
      const mockError = new Error('El email ya está en uso')
      mockAuthService.register.mockRejectedValue(mockError)
      
      const { useAuth } = await import('@/features/auth/composables/useAuth')
      const { register } = useAuth()
      
      const result = await register(mockRegisterData)
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('El email ya está en uso')
    })
  })

  describe('Funcionalidad de logout', () => {
    it('debería realizar logout exitosamente', async () => {
      // Configurar mock para logout exitoso
      mockAuthService.logout.mockResolvedValue(undefined)
      
      const { useAuth } = await import('@/features/auth/composables/useAuth')
      const { logout } = useAuth()
      
      await logout()
      
      expect(mockAuthService.logout).toHaveBeenCalled()
    })
  })

  describe('Verificación de autenticación', () => {
    it('debería verificar autenticación exitosamente', async () => {
      // Configurar mock para verificación exitosa
      mockAuthService.checkAuth.mockResolvedValue(mockUser)
      
      const { useAuth } = await import('@/features/auth/composables/useAuth')
      const { checkAuth } = useAuth()
      
      const result = await checkAuth()
      
      expect(result).toBe(true)
      expect(mockAuthService.checkAuth).toHaveBeenCalled()
    })

    it('debería manejar fallo en verificación de autenticación', async () => {
      // Configurar mock para verificación fallida
      mockAuthService.checkAuth.mockRejectedValue(new Error('Token inválido'))
      
      const { useAuth } = await import('@/features/auth/composables/useAuth')
      const { checkAuth } = useAuth()
      
      const result = await checkAuth()
      
      expect(result).toBe(false)
    })
  })

  describe('Actualización de perfil', () => {
    it('debería actualizar perfil exitosamente', async () => {
      const updateData = { name: 'Nuevo Nombre' }
      const updatedUser = { ...mockUser, name: 'Nuevo Nombre' }
      
      // Configurar mock para actualización exitosa
      mockAuthService.updateProfile.mockResolvedValue(updatedUser)
      
      const { useAuth } = await import('@/features/auth/composables/useAuth')
      const { updateProfile } = useAuth()
      
      const result = await updateProfile(updateData)
      
      expect(result.success).toBe(true)
      expect(mockAuthService.updateProfile).toHaveBeenCalledWith(updateData)
    })

    it('debería manejar errores en actualización de perfil', async () => {
      const updateData = { name: 'Nuevo Nombre' }
      const mockError = new Error('Error al actualizar perfil')
      
      // Configurar mock para actualización fallida
      mockAuthService.updateProfile.mockRejectedValue(mockError)
      
      const { useAuth } = await import('@/features/auth/composables/useAuth')
      const { updateProfile } = useAuth()
      
      const result = await updateProfile(updateData)
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('Error al actualizar perfil')
    })
  })
})