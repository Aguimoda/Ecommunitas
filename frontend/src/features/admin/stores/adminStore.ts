/**
 * @file adminStore.ts
 * @description Pinia store for admin management
 * Handles admin state, operations, and data caching
 */

import { defineStore } from 'pinia'
import { computed, reactive } from 'vue'
import { 
  adminService, 
  type AdminStats, 
  type AdminAnalytics, 
  type ModerationItem, 
  type AdminUser, 
  type SystemLog 
} from '../services/adminService'
import { useNotifications } from '@/shared/composables/useNotifications'
import { processError } from '@/shared/utils/errorHandler'

// Types
export interface AdminFilters {
  search?: string
  status?: string
  role?: string
  category?: string
  level?: 'error' | 'warn' | 'info' | 'debug'
  startDate?: string
  endDate?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface AdminPagination {
  page: number
  limit: number
  total: number
  pages: number
}

export interface AdminCache {
  stats?: {
    data: AdminStats
    timestamp: number
    ttl: number
  }
  analytics?: {
    data: AdminAnalytics
    timestamp: number
    ttl: number
  }
}

export interface AdminState {
  // Core data
  stats: AdminStats | null
  analytics: AdminAnalytics | null
  moderationItems: ModerationItem[]
  users: AdminUser[]
  logs: SystemLog[]
  
  // UI state
  isLoading: boolean
  isLoadingStats: boolean
  isLoadingAnalytics: boolean
  isLoadingModeration: boolean
  isLoadingUsers: boolean
  isLoadingLogs: boolean
  isUpdating: boolean
  error: string | null
  
  // Pagination
  moderationPagination: AdminPagination
  usersPagination: AdminPagination
  logsPagination: AdminPagination
  
  // Filters
  moderationFilters: AdminFilters
  usersFilters: AdminFilters
  logsFilters: AdminFilters
  
  // Cache
  cache: AdminCache
  lastFetch: {
    stats: number | null
    analytics: number | null
    moderation: number | null
    users: number | null
    logs: number | null
  }
  
  // Initialization
  isInitialized: boolean
}

/**
 * Admin store
 * Manages admin data, operations, and state
 */
export const useAdminStore = defineStore('admin', () => {
  // State
  const state = reactive<AdminState>({
    stats: null,
    analytics: null,
    moderationItems: [],
    users: [],
    logs: [],
    isLoading: false,
    isLoadingStats: false,
    isLoadingAnalytics: false,
    isLoadingModeration: false,
    isLoadingUsers: false,
    isLoadingLogs: false,
    isUpdating: false,
    error: null,
    moderationPagination: {
      page: 1,
      limit: 10,
      total: 0,
      pages: 0
    },
    usersPagination: {
      page: 1,
      limit: 10,
      total: 0,
      pages: 0
    },
    logsPagination: {
      page: 1,
      limit: 20,
      total: 0,
      pages: 0
    },
    moderationFilters: {},
    usersFilters: {},
    logsFilters: {},
    cache: {},
    lastFetch: {
      stats: null,
      analytics: null,
      moderation: null,
      users: null,
      logs: null
    },
    isInitialized: false
  })

  // Composables
  const { notifySuccess, notifyError } = useNotifications()

  // Constants
  const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  // Getters
  const getStats = computed(() => state.stats)
  const getAnalytics = computed(() => state.analytics)
  const getModerationItems = computed(() => state.moderationItems)
  const getUsers = computed(() => state.users)
  const getLogs = computed(() => state.logs)
  const isLoading = computed(() => state.isLoading)
  const isLoadingStats = computed(() => state.isLoadingStats)
  const isLoadingAnalytics = computed(() => state.isLoadingAnalytics)
  const isLoadingModeration = computed(() => state.isLoadingModeration)
  const isLoadingUsers = computed(() => state.isLoadingUsers)
  const isLoadingLogs = computed(() => state.isLoadingLogs)
  const isUpdating = computed(() => state.isUpdating)
  const hasError = computed(() => !!state.error)
  const getError = computed(() => state.error)
  const getModerationPagination = computed(() => state.moderationPagination)
  const getUsersPagination = computed(() => state.usersPagination)
  const getLogsPagination = computed(() => state.logsPagination)
  const getModerationFilters = computed(() => state.moderationFilters)
  const getUsersFilters = computed(() => state.usersFilters)
  const getLogsFilters = computed(() => state.logsFilters)
  const isInitialized = computed(() => state.isInitialized)

  // Cache helpers
  const isCacheValid = (key: keyof AdminCache): boolean => {
    const cached = state.cache[key]
    if (!cached) return false
    return Date.now() - cached.timestamp < cached.ttl
  }

  const setCacheData = <T>(key: keyof AdminCache, data: T, ttl: number = CACHE_TTL): void => {
    state.cache[key] = {
      data,
      timestamp: Date.now(),
      ttl
    } as any
  }

  const getCacheData = <T>(key: keyof AdminCache): T | null => {
    if (!isCacheValid(key)) return null
    return (state.cache[key]?.data as T) || null
  }

  // Error handling
  const handleStoreError = (error: any, context: string): void => {
    const processedError = processError(error)
    state.error = processedError.message
    console.error(`[AdminStore] ${context}:`, error)
    notifyError(processedError.message)
  }

  // Actions
  
  /**
   * Initialize store
   */
  const initialize = async (): Promise<void> => {
    if (state.isInitialized) return
    
    try {
      await Promise.all([
        fetchStats(),
        fetchAnalytics()
      ])
      state.isInitialized = true
    } catch (error) {
      console.warn('[AdminStore] Failed to initialize:', error)
      state.isInitialized = true // Mark as initialized even on error
    }
  }

  /**
   * Fetch system statistics
   */
  const fetchStats = async (useCache: boolean = true): Promise<AdminStats | null> => {
    // Check cache first
    if (useCache) {
      const cached = getCacheData<AdminStats>('stats')
      if (cached) {
        state.stats = cached
        return cached
      }
    }
    
    state.isLoadingStats = true
    state.error = null
    
    try {
      const response = await adminService.getStats()
      
      if (response.success) {
        state.stats = response.data
        setCacheData('stats', response.data)
        state.lastFetch.stats = Date.now()
        return response.data
      } else {
        throw new Error((response as any).error || 'Error en la operación')
      }
    } catch (error) {
      handleStoreError(error, 'fetchStats')
      return null
    } finally {
      state.isLoadingStats = false
    }
  }

  /**
   * Fetch analytics data
   */
  const fetchAnalytics = async (
    params?: {
      period?: 'day' | 'week' | 'month' | 'year'
      startDate?: string
      endDate?: string
    },
    useCache: boolean = true
  ): Promise<AdminAnalytics | null> => {
    // Check cache first (only if no params and cache enabled)
    if (useCache && !params) {
      const cached = getCacheData<AdminAnalytics>('analytics')
      if (cached) {
        state.analytics = cached
        return cached
      }
    }
    
    state.isLoadingAnalytics = true
    state.error = null
    
    try {
      const response = await adminService.getAnalytics(params)
      
      if (response.success) {
        state.analytics = response.data
        if (!params) {
          setCacheData('analytics', response.data)
        }
        state.lastFetch.analytics = Date.now()
        return response.data
      } else {
        throw new Error((response as any).error || 'Error en la operación')
      }
    } catch (error) {
      handleStoreError(error, 'fetchAnalytics')
      return null
    } finally {
      state.isLoadingAnalytics = false
    }
  }

  /**
   * Fetch moderation items
   */
  const fetchModerationItems = async (options?: {
    page?: number
    limit?: number
    filters?: AdminFilters
    append?: boolean
  }): Promise<ModerationItem[]> => {
    const { page = 1, limit = 10, filters = {}, append = false } = options || {}
    
    if (!append) {
      state.isLoadingModeration = true
    }
    state.error = null
    
    try {
      const params = {
        page,
        limit,
        status: filters.status as 'pending' | 'approved' | 'rejected' | undefined,
        category: filters.category,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      }
      
      const response = await adminService.getItemsForModeration(params)
      
      if (response.success) {
        const items = response.data || []
        
        if (append) {
          state.moderationItems = [...state.moderationItems, ...items]
        } else {
          state.moderationItems = items
        }
        
        // Update pagination
        if (response.pagination) {
          state.moderationPagination = response.pagination
        }
        
        state.lastFetch.moderation = Date.now()
        return items
      } else {
        throw new Error((response as any).error || 'Error en la operación')
      }
    } catch (error) {
      handleStoreError(error, 'fetchModerationItems')
      return []
    } finally {
      state.isLoadingModeration = false
    }
  }

  /**
   * Approve item
   */
  const approveItem = async (itemId: string, notes?: string): Promise<ModerationItem | null> => {
    state.isUpdating = true
    state.error = null
    
    try {
      const response = await adminService.approveItem(itemId, notes)
      
      if (response.success) {
        const updatedItem = response.data
        
        // Update item in list
        const itemIndex = state.moderationItems.findIndex(item => (item as any).id === itemId)
        if (itemIndex !== -1) {
          state.moderationItems[itemIndex] = updatedItem
        }
        
        notifySuccess('Artículo aprobado correctamente')
        return updatedItem
      } else {
        throw new Error((response as any).error || 'Error en la operación')
      }
    } catch (error) {
      handleStoreError(error, 'approveItem')
      return null
    } finally {
      state.isUpdating = false
    }
  }

  /**
   * Reject item
   */
  const rejectItem = async (itemId: string, reason: string, notes?: string): Promise<ModerationItem | null> => {
    state.isUpdating = true
    state.error = null
    
    try {
      const response = await adminService.rejectItem(itemId, reason, notes)
      
      if (response.success) {
        const updatedItem = response.data
        
        // Update item in list
        const itemIndex = state.moderationItems.findIndex(item => (item as any).id === itemId)
        if (itemIndex !== -1) {
          state.moderationItems[itemIndex] = updatedItem
        }
        
        notifySuccess('Artículo rechazado correctamente')
        return updatedItem
      } else {
        throw new Error((response as any).error || 'Error en la operación')
      }
    } catch (error) {
      handleStoreError(error, 'rejectItem')
      return null
    } finally {
      state.isUpdating = false
    }
  }

  /**
   * Toggle item availability
   */
  const toggleItemAvailability = async (itemId: string, isAvailable: boolean): Promise<boolean> => {
    state.isUpdating = true
    state.error = null
    
    try {
      const response = await adminService.toggleItemAvailability(itemId, isAvailable)
      
      if (response.success) {
        // Update item in moderation list if present
        const itemIndex = state.moderationItems.findIndex(item => (item as any).id === itemId)
        if (itemIndex !== -1) {
          (state.moderationItems[itemIndex] as any).isAvailable = isAvailable
        }
        
        notifySuccess(`Artículo ${isAvailable ? 'activado' : 'desactivado'} correctamente`)
        return true
      } else {
        throw new Error((response as any).error || 'Error en la operación')
      }
    } catch (error) {
      handleStoreError(error, 'toggleItemAvailability')
      return false
    } finally {
      state.isUpdating = false
    }
  }

  /**
   * Fetch admin users
   */
  const fetchUsers = async (options?: {
    page?: number
    limit?: number
    filters?: AdminFilters
    append?: boolean
  }): Promise<AdminUser[]> => {
    const { page = 1, limit = 10, filters = {}, append = false } = options || {}
    
    if (!append) {
      state.isLoadingUsers = true
    }
    state.error = null
    
    try {
      const params = {
        page,
        limit,
        search: filters.search,
        role: filters.role,
        status: filters.status as 'active' | 'inactive' | undefined,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      }
      
      const response = await adminService.getUsers(params)
      
      if (response.success) {
        const users = response.data || []
        
        if (append) {
          state.users = [...state.users, ...users]
        } else {
          state.users = users
        }
        
        // Update pagination
        if (response.pagination) {
          state.usersPagination = response.pagination
        }
        
        state.lastFetch.users = Date.now()
        return users
      } else {
        throw new Error((response as any).error || 'Error en la operación')
      }
    } catch (error) {
      handleStoreError(error, 'fetchUsers')
      return []
    } finally {
      state.isLoadingUsers = false
    }
  }

  /**
   * Update user role
   */
  const updateUserRole = async (userId: string, role: string): Promise<AdminUser | null> => {
    state.isUpdating = true
    state.error = null
    
    try {
      const response = await adminService.updateUserRole(userId, role)
      
      if (response.success) {
        const updatedUser = response.data
        
        // Update user in list
        const userIndex = state.users.findIndex(user => user.id === userId || user._id === userId)
        if (userIndex !== -1) {
          state.users[userIndex] = updatedUser
        }
        
        notifySuccess('Rol de usuario actualizado correctamente')
        return updatedUser
      } else {
        throw new Error((response as any).error || 'Error en la operación')
      }
    } catch (error) {
      handleStoreError(error, 'updateUserRole')
      return null
    } finally {
      state.isUpdating = false
    }
  }

  /**
   * Toggle user status
   */
  const toggleUserStatus = async (userId: string, isActive: boolean): Promise<AdminUser | null> => {
    state.isUpdating = true
    state.error = null
    
    try {
      const response = await adminService.toggleUserStatus(userId, isActive)
      
      if (response.success) {
        const updatedUser = response.data
        
        // Update user in list
        const userIndex = state.users.findIndex(user => user.id === userId || user._id === userId)
        if (userIndex !== -1) {
          state.users[userIndex] = updatedUser
        }
        
        notifySuccess(`Usuario ${isActive ? 'activado' : 'desactivado'} correctamente`)
        return updatedUser
      } else {
        throw new Error((response as any).error || 'Error en la operación')
      }
    } catch (error) {
      handleStoreError(error, 'toggleUserStatus')
      return null
    } finally {
      state.isUpdating = false
    }
  }

  /**
   * Delete user
   */
  const deleteUser = async (userId: string): Promise<boolean> => {
    state.isUpdating = true
    state.error = null
    
    try {
      const response = await adminService.deleteUser(userId)
      
      if (response.success) {
        // Remove user from list
        state.users = state.users.filter(user => user.id !== userId && user._id !== userId)
        
        // Update pagination
        state.usersPagination.total = Math.max(0, state.usersPagination.total - 1)
        
        notifySuccess('Usuario eliminado correctamente')
        return true
      } else {
        throw new Error((response as any).error || 'Error en la operación')
      }
    } catch (error) {
      handleStoreError(error, 'deleteUser')
      return false
    } finally {
      state.isUpdating = false
    }
  }

  /**
   * Fetch system logs
   */
  const fetchLogs = async (options?: {
    page?: number
    limit?: number
    filters?: AdminFilters
    append?: boolean
  }): Promise<SystemLog[]> => {
    const { page = 1, limit = 20, filters = {}, append = false } = options || {}
    
    if (!append) {
      state.isLoadingLogs = true
    }
    state.error = null
    
    try {
      const params = {
        page,
        limit,
        level: filters.level,
        startDate: filters.startDate,
        endDate: filters.endDate,
        userId: filters.search, // Use search as userId filter
        action: filters.category // Use category as action filter
      }
      
      const response = await adminService.getSystemLogs(params)
      
      if (response.success) {
        const logs = response.data || []
        
        if (append) {
          state.logs = [...state.logs, ...logs]
        } else {
          state.logs = logs
        }
        
        // Update pagination
        if (response.pagination) {
          state.logsPagination = response.pagination
        }
        
        state.lastFetch.logs = Date.now()
        return logs
      } else {
        throw new Error((response as any).error || 'Error en la operación')
      }
    } catch (error) {
      handleStoreError(error, 'fetchLogs')
      return []
    } finally {
      state.isLoadingLogs = false
    }
  }

  // Filter and pagination actions
  const setModerationFilters = (filters: AdminFilters): void => {
    state.moderationFilters = { ...filters }
    state.moderationPagination.page = 1
  }

  const setUsersFilters = (filters: AdminFilters): void => {
    state.usersFilters = { ...filters }
    state.usersPagination.page = 1
  }

  const setLogsFilters = (filters: AdminFilters): void => {
    state.logsFilters = { ...filters }
    state.logsPagination.page = 1
  }

  const setModerationPage = (page: number): void => {
    state.moderationPagination.page = page
  }

  const setUsersPage = (page: number): void => {
    state.usersPagination.page = page
  }

  const setLogsPage = (page: number): void => {
    state.logsPagination.page = page
  }

  // Utility actions
  const clearError = (): void => {
    state.error = null
  }

  const clearCache = (): void => {
    state.cache = {}
  }

  const refresh = async (): Promise<void> => {
    clearCache()
    await Promise.all([
      fetchStats(false),
      fetchAnalytics(undefined, false)
    ])
  }

  const reset = (): void => {
    state.stats = null
    state.analytics = null
    state.moderationItems = []
    state.users = []
    state.logs = []
    state.isLoading = false
    state.isLoadingStats = false
    state.isLoadingAnalytics = false
    state.isLoadingModeration = false
    state.isLoadingUsers = false
    state.isLoadingLogs = false
    state.isUpdating = false
    state.error = null
    state.moderationPagination = { page: 1, limit: 10, total: 0, pages: 0 }
    state.usersPagination = { page: 1, limit: 10, total: 0, pages: 0 }
    state.logsPagination = { page: 1, limit: 20, total: 0, pages: 0 }
    state.moderationFilters = {}
    state.usersFilters = {}
    state.logsFilters = {}
    clearCache()
    state.lastFetch = {
      stats: null,
      analytics: null,
      moderation: null,
      users: null,
      logs: null
    }
    state.isInitialized = false
  }

  const getStoreStats = () => {
    return {
      moderationItemsCount: state.moderationItems.length,
      usersCount: state.users.length,
      logsCount: state.logs.length,
      cacheSize: Object.keys(state.cache).length,
      lastFetch: state.lastFetch,
      isInitialized: state.isInitialized
    }
  }

  return {
    // State
    ...state,
    
    // Getters
    getStats,
    getAnalytics,
    getModerationItems,
    getUsers,
    getLogs,
    isLoading,
    isLoadingStats,
    isLoadingAnalytics,
    isLoadingModeration,
    isLoadingUsers,
    isLoadingLogs,
    isUpdating,
    hasError,
    getError,
    getModerationPagination,
    getUsersPagination,
    getLogsPagination,
    getModerationFilters,
    getUsersFilters,
    getLogsFilters,
    isInitialized,
    
    // Actions
    initialize,
    fetchStats,
    fetchAnalytics,
    fetchModerationItems,
    approveItem,
    rejectItem,
    toggleItemAvailability,
    fetchUsers,
    updateUserRole,
    toggleUserStatus,
    deleteUser,
    fetchLogs,
    setModerationFilters,
    setUsersFilters,
    setLogsFilters,
    setModerationPage,
    setUsersPage,
    setLogsPage,
    clearError,
    clearCache,
    refresh,
    reset,
    getStoreStats
  }
})

// Store is already exported with its definition above