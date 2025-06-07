/**
 * @file authService.test.ts
 * @description Test suite for authService
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import authService from '@/features/auth/services/authService'
import type { User, LoginCredentials, RegisterCredentials, AuthResponse } from '@/features/auth/services/authService'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock data
const mockUser: User = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'user',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
}

const mockAuthResponse: AuthResponse = {
  user: mockUser,
  token: 'mock-jwt-token',
  refreshToken: 'mock-refresh-token'
}

const mockLoginCredentials: LoginCredentials = {
  email: 'test@example.com',
  password: 'password123'
}

const mockRegisterData: RegisterCredentials = {
  email: 'test@example.com',
  password: 'password123',
  name: 'Test User',
  confirmPassword: 'password123'
}

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockClear()
    localStorageMock.getItem.mockClear()
    localStorageMock.setItem.mockClear()
    localStorageMock.removeItem.mockClear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('login', () => {
    it('should login successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAuthResponse
      })

      const result = await authService.login(mockLoginCredentials)

      expect(mockFetch).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(mockLoginCredentials)
      })
      expect(result).toEqual(mockAuthResponse)
      expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_token', mockAuthResponse.token)
      expect(localStorageMock.setItem).toHaveBeenCalledWith('refresh_token', mockAuthResponse.refreshToken)
    })

    it('should handle invalid credentials', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({ message: 'Invalid credentials' })
      })

      await expect(authService.login(mockLoginCredentials)).rejects.toThrow('Invalid credentials')
      expect(localStorageMock.setItem).not.toHaveBeenCalled()
    })

    it('should handle validation errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({
          message: 'Validation failed',
          errors: ['Email is required', 'Password is required']
        })
      })

      await expect(authService.login(mockLoginCredentials)).rejects.toThrow('Validation failed')
    })

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(authService.login(mockLoginCredentials)).rejects.toThrow('Network error')
    })
  })

  describe('register', () => {
    it('should register successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAuthResponse
      })

      const result = await authService.register(mockRegisterData)

      expect(mockFetch).toHaveBeenCalledWith('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(mockRegisterData)
      })
      expect(result).toEqual(mockAuthResponse)
      expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_token', mockAuthResponse.token)
      expect(localStorageMock.setItem).toHaveBeenCalledWith('refresh_token', mockAuthResponse.refreshToken)
    })

    it('should handle email already exists', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 409,
        statusText: 'Conflict',
        json: async () => ({ message: 'Email already exists' })
      })

      await expect(authService.register(mockRegisterData)).rejects.toThrow('Email already exists')
    })

    it('should handle password mismatch', async () => {
      const invalidData = {
        ...mockRegisterData,
        confirmPassword: 'different-password'
      }

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ message: 'Passwords do not match' })
      })

      await expect(authService.register(invalidData)).rejects.toThrow('Passwords do not match')
    })
  })

  describe('logout', () => {
    it('should logout successfully', async () => {
      localStorageMock.getItem.mockReturnValue('mock-token')
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Logged out successfully' })
      })

      await authService.logout()

      expect(mockFetch).toHaveBeenCalledWith('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer mock-token'
        }
      })
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('refresh_token')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user')
    })

    it('should clear local storage even if API call fails', async () => {
      localStorageMock.getItem.mockReturnValue('mock-token')
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await authService.logout()

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('refresh_token')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user')
    })

    it('should handle logout without token', async () => {
      localStorageMock.getItem.mockReturnValue(null)

      await authService.logout()

      expect(mockFetch).not.toHaveBeenCalled()
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('refresh_token')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user')
    })
  })

  describe('getCurrentUser', () => {
    it('should get current user successfully', async () => {
      localStorageMock.getItem.mockReturnValue('mock-token')
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser
      })

      const result = await authService.getCurrentUser()

      expect(mockFetch).toHaveBeenCalledWith('/api/auth/me', {
        headers: {
          'Authorization': 'Bearer mock-token'
        }
      })
      expect(result).toEqual(mockUser)
    })

    it('should handle unauthorized access', async () => {
      localStorageMock.getItem.mockReturnValue('invalid-token')
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized'
      })

      await expect(authService.getCurrentUser()).rejects.toThrow('Failed to get current user: 401 Unauthorized')
    })

    it('should handle missing token', async () => {
      localStorageMock.getItem.mockReturnValue(null)

      await expect(authService.getCurrentUser()).rejects.toThrow('No authentication token found')
    })
  })

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      localStorageMock.getItem.mockReturnValue('mock-refresh-token')
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAuthResponse
      })

      const result = await authService.refreshToken()

      expect(mockFetch).toHaveBeenCalledWith('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken: 'mock-refresh-token' })
      })
      expect(result).toEqual(mockAuthResponse)
      expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_token', mockAuthResponse.token)
      expect(localStorageMock.setItem).toHaveBeenCalledWith('refresh_token', mockAuthResponse.refreshToken)
    })

    it('should handle expired refresh token', async () => {
      localStorageMock.getItem.mockReturnValue('expired-refresh-token')
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({ message: 'Refresh token expired' })
      })

      await expect(authService.refreshToken()).rejects.toThrow('Refresh token expired')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('refresh_token')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user')
    })

    it('should handle missing refresh token', async () => {
      localStorageMock.getItem.mockReturnValue(null)

      await expect(authService.refreshToken()).rejects.toThrow('No refresh token found')
    })
  })

  describe('updateProfile', () => {
    it('should update profile successfully', async () => {
      const updateData = { name: 'Updated Name', email: 'updated@example.com' }
      const updatedUser = { ...mockUser, ...updateData }
      
      localStorageMock.getItem.mockReturnValue('mock-token')
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => updatedUser
      })

      const result = await authService.updateProfile(updateData)

      expect(mockFetch).toHaveBeenCalledWith('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token'
        },
        body: JSON.stringify(updateData)
      })
      expect(result).toEqual(updatedUser)
    })

    it('should handle validation errors during update', async () => {
      const updateData = { email: 'invalid-email' }
      
      localStorageMock.getItem.mockReturnValue('mock-token')
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ message: 'Invalid email format' })
      })

      await expect(authService.updateProfile(updateData)).rejects.toThrow('Invalid email format')
    })
  })

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const passwordData = {
        currentPassword: 'oldpassword',
        newPassword: 'newpassword',
        confirmPassword: 'newpassword'
      }
      
      localStorageMock.getItem.mockReturnValue('mock-token')
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Password changed successfully' })
      })

      await authService.changePassword(passwordData)

      expect(mockFetch).toHaveBeenCalledWith('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token'
        },
        body: JSON.stringify(passwordData)
      })
    })

    it('should handle incorrect current password', async () => {
      const passwordData = {
        currentPassword: 'wrongpassword',
        newPassword: 'newpassword',
        confirmPassword: 'newpassword'
      }
      
      localStorageMock.getItem.mockReturnValue('mock-token')
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ message: 'Current password is incorrect' })
      })

      await expect(authService.changePassword(passwordData)).rejects.toThrow('Current password is incorrect')
    })
  })

  describe('forgotPassword', () => {
    it('should send forgot password email successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Reset email sent successfully' })
      })

      await authService.forgotPassword('test@example.com')

      expect(mockFetch).toHaveBeenCalledWith('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: 'test@example.com' })
      })
    })

    it('should handle email not found', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ message: 'Email not found' })
      })

      await expect(authService.forgotPassword('notfound@example.com')).rejects.toThrow('Email not found')
    })
  })

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      const resetData = {
        token: 'reset-token',
        password: 'newpassword',
        confirmPassword: 'newpassword'
      }
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Password reset successfully' })
      })

      await authService.resetPassword(resetData)

      expect(mockFetch).toHaveBeenCalledWith('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(resetData)
      })
    })

    it('should handle invalid or expired reset token', async () => {
      const resetData = {
        token: 'invalid-token',
        password: 'newpassword',
        confirmPassword: 'newpassword'
      }
      
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ message: 'Invalid or expired reset token' })
      })

      await expect(authService.resetPassword(resetData)).rejects.toThrow('Invalid or expired reset token')
    })
  })

  describe('verifyEmail', () => {
    it('should verify email successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Email verified successfully' })
      })

      await authService.verifyEmail('verification-token')

      expect(mockFetch).toHaveBeenCalledWith('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: 'verification-token' })
      })
    })

    it('should handle invalid verification token', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ message: 'Invalid verification token' })
      })

      await expect(authService.verifyEmail('invalid-token')).rejects.toThrow('Invalid verification token')
    })
  })
})