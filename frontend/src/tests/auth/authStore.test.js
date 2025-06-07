import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/features/auth/stores/authStore'
import authService from '@/features/auth/services/authService'

// Mock the auth service
vi.mock('@/features/auth/services/authService', () => ({
  default: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn(),
    refreshToken: vi.fn()
  }
}))

describe('Auth Store', () => {
  let authStore

  beforeEach(() => {
    setActivePinia(createPinia())
    authStore = useAuthStore()
    vi.clearAllMocks()
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      expect(authStore.user).toBeNull()
      expect(authStore.token).toBeNull()
      expect(authStore.isLoading).toBe(false)
      expect(authStore.error).toBeNull()
    })
  })

  describe('Getters', () => {
    it('should return correct isAuthenticated value', () => {
      expect(authStore.isAuthenticated).toBe(false)
      
      authStore.user = { id: 1, email: 'test@example.com' }
      authStore.token = 'test-token'
      
      expect(authStore.isAuthenticated).toBe(true)
    })

    it('should return correct isAdmin value', () => {
      expect(authStore.isAdmin).toBe(false)
      
      authStore.user = { id: 1, role: 'admin' }
      
      expect(authStore.isAdmin).toBe(true)
    })

    it('should return correct isModerator value', () => {
      expect(authStore.isModerator).toBe(false)
      
      authStore.user = { id: 1, role: 'moderator' }
      
      expect(authStore.isModerator).toBe(true)
    })
  })

  describe('Actions', () => {
    describe('login', () => {
      it('should login successfully', async () => {
        const mockResponse = {
          data: {
            token: 'test-token',
            user: { id: 1, email: 'test@example.com' }
          }
        }
        
        authService.login.mockResolvedValue(mockResponse)
        
        await authStore.login('test@example.com', 'password')
        
        expect(authStore.token).toBe('test-token')
        expect(authStore.user).toEqual({ id: 1, email: 'test@example.com' })
        expect(authStore.isLoading).toBe(false)
        expect(authStore.error).toBeNull()
      })

      it('should handle login error', async () => {
        const mockError = new Error('Invalid credentials')
        authService.login.mockRejectedValue(mockError)
        
        await authStore.login('test@example.com', 'wrong-password')
        
        expect(authStore.token).toBeNull()
        expect(authStore.user).toBeNull()
        expect(authStore.isLoading).toBe(false)
        expect(authStore.error).toBe('Invalid credentials')
      })
    })

    describe('register', () => {
      it('should register successfully', async () => {
        const mockResponse = {
          data: {
            token: 'test-token',
            user: { id: 1, email: 'test@example.com', name: 'Test User' }
          }
        }
        
        authService.register.mockResolvedValue(mockResponse)
        
        const userData = {
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        }
        
        await authStore.register(userData)
        
        expect(authStore.token).toBe('test-token')
        expect(authStore.user).toEqual({ id: 1, email: 'test@example.com', name: 'Test User' })
        expect(authStore.isLoading).toBe(false)
        expect(authStore.error).toBeNull()
      })
    })

    describe('logout', () => {
      it('should logout successfully', async () => {
        // Set initial state
        authStore.user = { id: 1, email: 'test@example.com' }
        authStore.token = 'test-token'
        
        authService.logout.mockResolvedValue()
        
        await authStore.logout()
        
        expect(authStore.user).toBeNull()
        expect(authStore.token).toBeNull()
        expect(authStore.error).toBeNull()
      })
    })

    describe('initialize', () => {
      it('should initialize with stored token', async () => {
        const mockUser = { id: 1, email: 'test@example.com' }
        
        // Mock localStorage
        localStorage.getItem.mockReturnValue('stored-token')
        authService.getCurrentUser.mockResolvedValue({ data: mockUser })
        
        await authStore.initialize()
        
        expect(authStore.token).toBe('stored-token')
        expect(authStore.user).toEqual(mockUser)
      })

      it('should handle initialization without token', async () => {
        localStorage.getItem.mockReturnValue(null)
        
        await authStore.initialize()
        
        expect(authStore.token).toBeNull()
        expect(authStore.user).toBeNull()
      })
    })
  })
})