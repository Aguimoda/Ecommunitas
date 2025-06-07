/**
 * @file usersStore.ts
 * @description Pinia store for user management
 * Handles user state, caching, and operations
 */

import { defineStore } from 'pinia'
import { computed, reactive } from 'vue'
import { userService, type User, type UpdateUserData } from '../services/userService'
import { useNotifications } from '@/shared/composables/useNotifications'
import { processError } from '@/shared/utils/errorHandler'

// Types
export interface UserFilters {
  search?: string
  role?: string
  location?: string
  isActive?: boolean
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface UserPagination {
  page: number
  limit: number
  total: number
  pages: number
}

export interface UserCache {
  [key: string]: {
    data: User
    timestamp: number
    ttl: number
  }
}

export interface UsersState {
  // Core data
  users: User[]
  user: User | null
  currentUser: User | null
  
  // UI state
  isLoading: boolean
  isLoadingUser: boolean
  isUpdating: boolean
  error: string | null
  
  // Pagination
  pagination: UserPagination
  
  // Filters
  filters: UserFilters
  
  // Cache
  cache: UserCache
  lastFetch: number | null
  
  // Initialization
  isInitialized: boolean
}

/**
 * Users store
 * Manages user data, operations, and state
 */
export const useUsersStore = defineStore('users', () => {
  // State
  const state = reactive<UsersState>({
    users: [],
    user: null,
    currentUser: null,
    isLoading: false,
    isLoadingUser: false,
    isUpdating: false,
    error: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      pages: 0
    },
    filters: {},
    cache: {},
    lastFetch: null,
    isInitialized: false
  })

  // Composables
  const { notifySuccess, notifyError } = useNotifications()

  // Constants
  const CACHE_TTL = 5 * 60 * 1000 // 5 minutes
  const REFRESH_THRESHOLD = 2 * 60 * 1000 // 2 minutes

  // Getters
  const getUsers = computed(() => state.users)
  const getUser = computed(() => state.user)
  const getCurrentUser = computed(() => state.currentUser)
  const isLoading = computed(() => state.isLoading)
  const isLoadingUser = computed(() => state.isLoadingUser)
  const isUpdating = computed(() => state.isUpdating)
  const hasError = computed(() => !!state.error)
  const getError = computed(() => state.error)
  const getPagination = computed(() => state.pagination)
  const getFilters = computed(() => state.filters)
  const hasActiveFilters = computed(() => {
    return Object.keys(state.filters).some(key => {
      const value = state.filters[key as keyof UserFilters]
      return value !== undefined && value !== null && value !== ''
    })
  })
  const needsRefresh = computed(() => {
    if (!state.lastFetch) return true
    return Date.now() - state.lastFetch > REFRESH_THRESHOLD
  })
  const totalUsers = computed(() => state.pagination.total)
  const hasMorePages = computed(() => state.pagination.page < state.pagination.pages)
  const isInitialized = computed(() => state.isInitialized)

  // Cache helpers
  const getCachedUser = (userId: string): User | null => {
    const cached = state.cache[userId]
    if (!cached) return null
    
    const isExpired = Date.now() - cached.timestamp > cached.ttl
    if (isExpired) {
      delete state.cache[userId]
      return null
    }
    
    return cached.data
  }

  const setCachedUser = (user: User, ttl: number = CACHE_TTL): void => {
    const userId = user.id || user._id
    if (!userId) return
    
    state.cache[userId] = {
      data: user,
      timestamp: Date.now(),
      ttl
    }
  }

  const updateCachedUser = (userId: string, updates: Partial<User>): void => {
    const cached = state.cache[userId]
    if (cached) {
      cached.data = { ...cached.data, ...updates }
      cached.timestamp = Date.now()
    }
  }

  // Error handling
  const handleStoreError = (error: any, context: string): void => {
    const processedError = processError(error)
    state.error = processedError.message
    console.error(`[UsersStore] ${context}:`, error)
    notifyError(processedError.message)
  }

  // Actions
  
  /**
   * Initialize store
   */
  const initialize = async (): Promise<void> => {
    if (state.isInitialized) return
    
    try {
      await fetchCurrentUser()
      state.isInitialized = true
    } catch (error) {
      console.warn('[UsersStore] Failed to initialize:', error)
      state.isInitialized = true // Mark as initialized even on error
    }
  }

  /**
   * Fetch current user profile
   */
  const fetchCurrentUser = async (): Promise<User | null> => {
    state.isLoadingUser = true
    state.error = null
    
    try {
      const response = await userService.getCurrentUserProfile()
      
      if (response.success) {
        state.currentUser = response.data
        setCachedUser(response.data)
        return response.data
      } else {
        throw new Error((response as any).error || 'Error desconocido')
      }
    } catch (error) {
      handleStoreError(error, 'fetchCurrentUser')
      return null
    } finally {
      state.isLoadingUser = false
    }
  }

  /**
   * Fetch user by ID
   */
  const fetchUser = async (userId: string, useCache: boolean = true): Promise<User | null> => {
    // Check cache first
    if (useCache) {
      const cached = getCachedUser(userId)
      if (cached) {
        state.user = cached
        return cached
      }
    }
    
    state.isLoadingUser = true
    state.error = null
    
    try {
      const response = await userService.getUserProfile(userId)
      
      if (response.success) {
        state.user = response.data
        setCachedUser(response.data)
        return response.data
      } else {
        throw new Error((response as any).error || 'Error desconocido')
      }
    } catch (error) {
      handleStoreError(error, 'fetchUser')
      return null
    } finally {
      state.isLoadingUser = false
    }
  }

  /**
   * Fetch all users with filters and pagination
   */
  const fetchUsers = async (options?: {
    page?: number
    limit?: number
    filters?: UserFilters
    append?: boolean
  }): Promise<User[]> => {
    const { page = 1, limit = 10, filters = {}, append = false } = options || {}
    
    if (!append) {
      state.isLoading = true
    }
    state.error = null
    
    try {
      const params = {
        page,
        limit,
        ...filters
      }
      
      const response = await userService.getAllUsers(params)
      
      if (response.success) {
        const users = response.data || []
        
        if (append) {
          state.users = [...state.users, ...users]
        } else {
          state.users = users
        }
        
        // Update pagination
        if (response.pagination) {
          state.pagination = response.pagination
        }
        
        // Cache users
        users.forEach(user => setCachedUser(user))
        
        state.lastFetch = Date.now()
        return users
      } else {
        throw new Error((response as any).error || 'Error desconocido')
      }
    } catch (error) {
      handleStoreError(error, 'fetchUsers')
      return []
    } finally {
      state.isLoading = false
    }
  }

  /**
   * Search users
   */
  const searchUsers = async (query: string, options?: {
    page?: number
    limit?: number
    filters?: Omit<UserFilters, 'search'>
  }): Promise<User[]> => {
    const { page = 1, limit = 10, filters = {} } = options || {}
    
    state.isLoading = true
    state.error = null
    
    try {
      const params = {
        page,
        limit,
        ...filters
      }
      
      const response = await userService.searchUsers(query, params)
      
      if (response.success) {
        const users = response.data || []
        state.users = users
        
        // Update pagination
        if (response.pagination) {
          state.pagination = response.pagination
        }
        
        // Cache users
        users.forEach(user => setCachedUser(user))
        
        return users
      } else {
        throw new Error((response as any).error || 'Error desconocido')
      }
    } catch (error) {
      handleStoreError(error, 'searchUsers')
      return []
    } finally {
      state.isLoading = false
    }
  }

  /**
   * Update user profile
   */
  const updateUser = async (userId: string, userData: UpdateUserData): Promise<User | null> => {
    state.isUpdating = true
    state.error = null
    
    try {
      const response = await userService.updateUserProfile(userId, userData)
      
      if (response.success) {
        const updatedUser = response.data
        
        // Update state
        if (state.user?.id === userId || state.user?._id === userId) {
          state.user = updatedUser
        }
        
        if (state.currentUser?.id === userId || state.currentUser?._id === userId) {
          state.currentUser = updatedUser
        }
        
        // Update users list
        const userIndex = state.users.findIndex(u => u.id === userId || u._id === userId)
        if (userIndex !== -1) {
          state.users[userIndex] = updatedUser
        }
        
        // Update cache
        setCachedUser(updatedUser)
        
        notifySuccess(response.message || 'Usuario actualizado correctamente')
        return updatedUser
      } else {
        throw new Error((response as any).error || 'Error desconocido')
      }
    } catch (error) {
      handleStoreError(error, 'updateUser')
      return null
    } finally {
      state.isUpdating = false
    }
  }

  /**
   * Delete user (admin only)
   */
  const deleteUser = async (userId: string): Promise<boolean> => {
    state.isLoading = true
    state.error = null
    
    try {
      const response = await userService.deleteUser(userId)
      
      if (response.success) {
        // Remove from state
        state.users = state.users.filter(u => u.id !== userId && u._id !== userId)
        
        if (state.user?.id === userId || state.user?._id === userId) {
          state.user = null
        }
        
        // Remove from cache
        delete state.cache[userId]
        
        // Update pagination
        state.pagination.total = Math.max(0, state.pagination.total - 1)
        
        notifySuccess(response.message || 'Usuario eliminado correctamente')
        return true
      } else {
        throw new Error((response as any).error || 'Error desconocido')
      }
    } catch (error) {
      handleStoreError(error, 'deleteUser')
      return false
    } finally {
      state.isLoading = false
    }
  }

  /**
   * Update user role (admin only)
   */
  const updateUserRole = async (userId: string, role: string): Promise<User | null> => {
    state.isUpdating = true
    state.error = null
    
    try {
      const response = await userService.updateUserRole(userId, role)
      
      if (response.success) {
        const updatedUser = response.data
        
        // Update state
        if (state.user?.id === userId || state.user?._id === userId) {
          state.user = updatedUser
        }
        
        // Update users list
        const userIndex = state.users.findIndex(u => u.id === userId || u._id === userId)
        if (userIndex !== -1) {
          state.users[userIndex] = updatedUser
        }
        
        // Update cache
        updateCachedUser(userId, { role })
        
        notifySuccess(response.message || 'Rol actualizado correctamente')
        return updatedUser
      } else {
        throw new Error((response as any).error || 'Error desconocido')
      }
    } catch (error) {
      handleStoreError(error, 'updateUserRole')
      return null
    } finally {
      state.isUpdating = false
    }
  }

  /**
   * Toggle user active status (admin only)
   */
  const toggleUserStatus = async (userId: string, isActive: boolean): Promise<User | null> => {
    state.isUpdating = true
    state.error = null
    
    try {
      const response = await userService.toggleUserStatus(userId, isActive)
      
      if (response.success) {
        const updatedUser = response.data
        
        // Update state
        if (state.user?.id === userId || state.user?._id === userId) {
          state.user = updatedUser
        }
        
        // Update users list
        const userIndex = state.users.findIndex(u => u.id === userId || u._id === userId)
        if (userIndex !== -1) {
          state.users[userIndex] = updatedUser
        }
        
        // Update cache
        updateCachedUser(userId, { isActive })
        
        notifySuccess(response.message || `Usuario ${isActive ? 'activado' : 'desactivado'} correctamente`)
        return updatedUser
      } else {
        throw new Error((response as any).error || 'Error desconocido')
      }
    } catch (error) {
      handleStoreError(error, 'toggleUserStatus')
      return null
    } finally {
      state.isUpdating = false
    }
  }

  /**
   * Set filters
   */
  const setFilters = (filters: UserFilters): void => {
    state.filters = { ...filters }
    state.pagination.page = 1 // Reset to first page
  }

  /**
   * Reset filters
   */
  const resetFilters = (): void => {
    state.filters = {}
    state.pagination.page = 1
  }

  /**
   * Set page
   */
  const setPage = (page: number): void => {
    state.pagination.page = page
  }

  /**
   * Reset pagination
   */
  const resetPagination = (): void => {
    state.pagination = {
      page: 1,
      limit: 10,
      total: 0,
      pages: 0
    }
  }

  /**
   * Load more users (for infinite scroll)
   */
  const loadMore = async (): Promise<User[]> => {
    if (!hasMorePages.value || state.isLoading) {
      return []
    }
    
    const nextPage = state.pagination.page + 1
    return await fetchUsers({
      page: nextPage,
      limit: state.pagination.limit,
      filters: state.filters,
      append: true
    })
  }

  /**
   * Refresh current data
   */
  const refresh = async (): Promise<void> => {
    await fetchUsers({
      page: state.pagination.page,
      limit: state.pagination.limit,
      filters: state.filters
    })
  }

  /**
   * Clear error
   */
  const clearError = (): void => {
    state.error = null
  }

  /**
   * Clear user
   */
  const clearUser = (): void => {
    state.user = null
  }

  /**
   * Clear cache
   */
  const clearCache = (): void => {
    state.cache = {}
  }

  /**
   * Reset store
   */
  const reset = (): void => {
    state.users = []
    state.user = null
    state.isLoading = false
    state.isLoadingUser = false
    state.isUpdating = false
    state.error = null
    resetPagination()
    resetFilters()
    clearCache()
    state.lastFetch = null
  }

  /**
   * Get store statistics
   */
  const getStoreStats = () => {
    return {
      usersCount: state.users.length,
      cacheSize: Object.keys(state.cache).length,
      lastFetch: state.lastFetch,
      isInitialized: state.isInitialized,
      hasActiveFilters: hasActiveFilters.value,
      pagination: state.pagination
    }
  }

  return {
    // State
    ...state,
    
    // Getters
    getUsers,
    getUser,
    getCurrentUser,
    isLoading,
    isLoadingUser,
    isUpdating,
    hasError,
    getError,
    getPagination,
    getFilters,
    hasActiveFilters,
    needsRefresh,
    totalUsers,
    hasMorePages,
    isInitialized,
    
    // Actions
    initialize,
    fetchCurrentUser,
    fetchUser,
    fetchUsers,
    searchUsers,
    updateUser,
    deleteUser,
    updateUserRole,
    toggleUserStatus,
    setFilters,
    resetFilters,
    setPage,
    resetPagination,
    loadMore,
    refresh,
    clearError,
    clearUser,
    clearCache,
    reset,
    getStoreStats
  }
})

// Export types