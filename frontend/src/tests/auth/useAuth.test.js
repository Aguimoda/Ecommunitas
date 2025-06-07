import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuth } from '@/features/auth/composables/useAuth'
import { useAuthStore } from '@/features/auth/stores/authStore'

// Mock the router
const mockRouter = {
  push: vi.fn(),
  replace: vi.fn()
}

vi.mock('vue-router', () => ({
  useRouter: () => mockRouter
}))

// Mock the toast
const mockToast = {
  success: vi.fn(),
  error: vi.fn()
}

vi.mock('vue-toastification', () => ({
  useToast: () => mockToast
}))

describe('useAuth Composable', () => {
  let authStore
  let authComposable

  beforeEach(() => {
    setActivePinia(createPinia())
    authStore = useAuthStore()
    authComposable = useAuth()
    vi.clearAllMocks()
  })

  describe('Reactive Properties', () => {
    it('should expose reactive auth state', () => {
      expect(authComposable.isAuthenticated).toBeDefined()
      expect(authComposable.user).toBeDefined()
      expect(authComposable.isLoading).toBeDefined()
      expect(authComposable.error).toBeDefined()
    })

    it('should reflect store state changes', () => {
      authStore.user = { id: 1, email: 'test@example.com' }
      authStore.token = 'test-token'
      
      expect(authComposable.isAuthenticated.value).toBe(true)
      expect(authComposable.user.value).toEqual({ id: 1, email: 'test@example.com' })
    })
  })

  describe('Authentication Methods', () => {
    describe('login', () => {
      it('should call store login and redirect on success', async () => {
        const loginSpy = vi.spyOn(authStore, 'login').mockResolvedValue()
        
        await authComposable.login('test@example.com', 'password')
        
        expect(loginSpy).toHaveBeenCalledWith('test@example.com', 'password')
        expect(mockToast.success).toHaveBeenCalledWith('Login successful!')
        expect(mockRouter.push).toHaveBeenCalledWith('/')
      })

      it('should handle login error', async () => {
        const loginSpy = vi.spyOn(authStore, 'login').mockRejectedValue(new Error('Invalid credentials'))
        
        await authComposable.login('test@example.com', 'wrong-password')
        
        expect(loginSpy).toHaveBeenCalledWith('test@example.com', 'wrong-password')
        expect(mockToast.error).toHaveBeenCalledWith('Invalid credentials')
        expect(mockRouter.push).not.toHaveBeenCalled()
      })
    })

    describe('register', () => {
      it('should call store register and redirect on success', async () => {
        const registerSpy = vi.spyOn(authStore, 'register').mockResolvedValue()
        
        const userData = {
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        }
        
        await authComposable.register(userData)
        
        expect(registerSpy).toHaveBeenCalledWith(userData)
        expect(mockToast.success).toHaveBeenCalledWith('Registration successful!')
        expect(mockRouter.push).toHaveBeenCalledWith('/')
      })

      it('should handle registration error', async () => {
        const registerSpy = vi.spyOn(authStore, 'register').mockRejectedValue(new Error('Email already exists'))
        
        const userData = {
          name: 'Test User',
          email: 'existing@example.com',
          password: 'password123'
        }
        
        await authComposable.register(userData)
        
        expect(registerSpy).toHaveBeenCalledWith(userData)
        expect(mockToast.error).toHaveBeenCalledWith('Email already exists')
        expect(mockRouter.push).not.toHaveBeenCalled()
      })
    })

    describe('logout', () => {
      it('should call store logout and redirect to login', async () => {
        const logoutSpy = vi.spyOn(authStore, 'logout').mockResolvedValue()
        
        await authComposable.logout()
        
        expect(logoutSpy).toHaveBeenCalled()
        expect(mockToast.success).toHaveBeenCalledWith('Logged out successfully')
        expect(mockRouter.push).toHaveBeenCalledWith('/login')
      })
    })
  })

  describe('Permission Checks', () => {
    it('should check admin permissions correctly', () => {
      authStore.user = { id: 1, role: 'admin' }
      
      expect(authComposable.hasPermission('admin')).toBe(true)
      expect(authComposable.hasPermission('moderator')).toBe(true)
      expect(authComposable.hasPermission('user')).toBe(true)
    })

    it('should check moderator permissions correctly', () => {
      authStore.user = { id: 1, role: 'moderator' }
      
      expect(authComposable.hasPermission('admin')).toBe(false)
      expect(authComposable.hasPermission('moderator')).toBe(true)
      expect(authComposable.hasPermission('user')).toBe(true)
    })

    it('should check user permissions correctly', () => {
      authStore.user = { id: 1, role: 'user' }
      
      expect(authComposable.hasPermission('admin')).toBe(false)
      expect(authComposable.hasPermission('moderator')).toBe(false)
      expect(authComposable.hasPermission('user')).toBe(true)
    })

    it('should return false for unauthenticated users', () => {
      authStore.user = null
      
      expect(authComposable.hasPermission('admin')).toBe(false)
      expect(authComposable.hasPermission('moderator')).toBe(false)
      expect(authComposable.hasPermission('user')).toBe(false)
    })
  })

  describe('Route Guards', () => {
    it('should allow access for authenticated users', () => {
      authStore.user = { id: 1, email: 'test@example.com' }
      authStore.token = 'test-token'
      
      const result = authComposable.requireAuth()
      
      expect(result).toBe(true)
    })

    it('should redirect unauthenticated users to login', () => {
      authStore.user = null
      authStore.token = null
      
      const result = authComposable.requireAuth()
      
      expect(result).toBe(false)
      expect(mockRouter.push).toHaveBeenCalledWith('/login')
    })

    it('should allow access for guests only', () => {
      authStore.user = null
      authStore.token = null
      
      const result = authComposable.requireGuest()
      
      expect(result).toBe(true)
    })

    it('should redirect authenticated users from guest-only pages', () => {
      authStore.user = { id: 1, email: 'test@example.com' }
      authStore.token = 'test-token'
      
      const result = authComposable.requireGuest()
      
      expect(result).toBe(false)
      expect(mockRouter.push).toHaveBeenCalledWith('/')
    })
  })
})