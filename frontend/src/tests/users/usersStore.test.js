import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUsersStore } from '@/features/users/stores/usersStore'
import userService from '@/features/users/services/userService'

// Mock the user service
vi.mock('@/features/users/services/userService', () => ({
  default: {
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
    uploadAvatar: vi.fn(),
    getAllUsers: vi.fn(),
    getUserById: vi.fn(),
    searchUsers: vi.fn()
  }
}))

describe('Users Store', () => {
  let usersStore

  beforeEach(() => {
    setActivePinia(createPinia())
    usersStore = useUsersStore()
    vi.clearAllMocks()
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      expect(usersStore.users).toEqual([])
      expect(usersStore.currentUser).toBeNull()
      expect(usersStore.isLoading).toBe(false)
      expect(usersStore.error).toBeNull()
      expect(usersStore.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
      })
    })
  })

  describe('Getters', () => {
    it('should return users by role', () => {
      usersStore.users = [
        { id: 1, role: 'admin', name: 'Admin User' },
        { id: 2, role: 'user', name: 'Regular User' },
        { id: 3, role: 'moderator', name: 'Moderator User' },
        { id: 4, role: 'user', name: 'Another User' }
      ]

      expect(usersStore.adminUsers).toHaveLength(1)
      expect(usersStore.adminUsers[0].name).toBe('Admin User')
      
      expect(usersStore.moderatorUsers).toHaveLength(1)
      expect(usersStore.moderatorUsers[0].name).toBe('Moderator User')
      
      expect(usersStore.regularUsers).toHaveLength(2)
    })

    it('should return active users', () => {
      usersStore.users = [
        { id: 1, isActive: true, name: 'Active User' },
        { id: 2, isActive: false, name: 'Inactive User' },
        { id: 3, isActive: true, name: 'Another Active User' }
      ]

      expect(usersStore.activeUsers).toHaveLength(2)
      expect(usersStore.activeUsers.every(user => user.isActive)).toBe(true)
    })
  })

  describe('Actions', () => {
    describe('fetchUsers', () => {
      it('should fetch users successfully', async () => {
        const mockResponse = {
          data: {
            data: [
              { id: 1, name: 'User 1' },
              { id: 2, name: 'User 2' }
            ],
            pagination: {
              page: 1,
              limit: 10,
              total: 2,
              totalPages: 1
            }
          }
        }
        
        userService.getAllUsers.mockResolvedValue(mockResponse)
        
        await usersStore.fetchUsers()
        
        expect(usersStore.users).toHaveLength(2)
        expect(usersStore.pagination.total).toBe(2)
        expect(usersStore.isLoading).toBe(false)
        expect(usersStore.error).toBeNull()
      })

      it('should handle fetch users error', async () => {
        const mockError = new Error('Failed to fetch users')
        userService.getAllUsers.mockRejectedValue(mockError)
        
        await usersStore.fetchUsers()
        
        expect(usersStore.users).toEqual([])
        expect(usersStore.isLoading).toBe(false)
        expect(usersStore.error).toBe('Failed to fetch users')
      })
    })

    describe('fetchUserById', () => {
      it('should fetch user by id successfully', async () => {
        const mockUser = { id: 1, name: 'Test User', email: 'test@example.com' }
        userService.getUserById.mockResolvedValue({ data: mockUser })
        
        const result = await usersStore.fetchUserById(1)
        
        expect(result).toEqual(mockUser)
        expect(userService.getUserById).toHaveBeenCalledWith(1)
      })
    })

    describe('updateUserProfile', () => {
      it('should update user profile successfully', async () => {
        const userId = 1
        const updateData = { name: 'Updated Name' }
        const mockUpdatedUser = { id: 1, name: 'Updated Name', email: 'test@example.com' }
        
        userService.updateProfile.mockResolvedValue({ data: mockUpdatedUser })
        
        // Add user to store first
        usersStore.users = [{ id: 1, name: 'Original Name', email: 'test@example.com' }]
        
        await usersStore.updateUserProfile(userId, updateData)
        
        expect(userService.updateProfile).toHaveBeenCalledWith(userId, updateData)
        expect(usersStore.users[0].name).toBe('Updated Name')
      })
    })

    describe('searchUsers', () => {
      it('should search users successfully', async () => {
        const mockResponse = {
          data: {
            data: [{ id: 1, name: 'Search Result' }],
            pagination: { page: 1, limit: 10, total: 1, totalPages: 1 }
          }
        }
        
        userService.searchUsers.mockResolvedValue(mockResponse)
        
        const result = await usersStore.searchUsers('search term')
        
        expect(result).toEqual([{ id: 1, name: 'Search Result' }])
        expect(userService.searchUsers).toHaveBeenCalledWith('search term', {
          page: 1,
          limit: 10
        })
      })
    })

    describe('uploadUserAvatar', () => {
      it('should upload avatar successfully', async () => {
        const userId = 1
        const file = new File([''], 'avatar.jpg', { type: 'image/jpeg' })
        const mockResponse = { data: { avatarUrl: 'https://example.com/avatar.jpg' } }
        
        userService.uploadAvatar.mockResolvedValue(mockResponse)
        
        // Add user to store first
        usersStore.users = [{ id: 1, name: 'Test User', avatarUrl: null }]
        
        await usersStore.uploadUserAvatar(userId, file)
        
        expect(userService.uploadAvatar).toHaveBeenCalledWith(userId, file)
        expect(usersStore.users[0].avatarUrl).toBe('https://example.com/avatar.jpg')
      })
    })

    describe('Cache Management', () => {
      it('should clear cache', () => {
        usersStore.users = [{ id: 1, name: 'Test User' }]
        usersStore.currentUser = { id: 1, name: 'Test User' }
        
        usersStore.clearCache()
        
        expect(usersStore.users).toEqual([])
        expect(usersStore.currentUser).toBeNull()
        expect(usersStore.error).toBeNull()
      })

      it('should invalidate cache', () => {
        const clearCacheSpy = vi.spyOn(usersStore, 'clearCache')
        
        usersStore.invalidateCache()
        
        expect(clearCacheSpy).toHaveBeenCalled()
      })
    })
  })
})