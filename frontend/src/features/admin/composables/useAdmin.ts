/**
 * @file useAdmin.ts
 * @description Admin composables for managing admin functionality
 * Provides reactive admin operations and state management
 */

import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { useAdminStore } from '../stores/adminStore'
import { useAuthStore } from '@/features/auth/stores/authStore'
import { useNotifications } from '@/shared/composables/useNotifications'
import { useRouter } from 'vue-router'
import type { 
  AdminStats, 
  AdminAnalytics, 
  ModerationItem, 
  AdminUser, 
  SystemLog
} from '../services/adminService'
import type { AdminFilters } from '../stores/adminStore'

/**
 * Main admin composable
 * Provides comprehensive admin functionality
 */
export function useAdmin() {
  const adminStore = useAdminStore()
  const authStore = useAuthStore()
  const { notifyError } = useNotifications()
  const router = useRouter()

  // Reactive state
  const isInitializing = ref(false)
  const autoRefreshInterval = ref<NodeJS.Timeout | null>(null)
  const refreshRate = ref(30000) // 30 seconds

  // Computed properties
  const isAdmin = computed(() => authStore.isAdmin)
  const isModerator = computed(() => authStore.isModerator)
  const canAccess = computed(() => isAdmin.value || isModerator.value)
  const stats = computed(() => adminStore.getStats)
  const analytics = computed(() => adminStore.getAnalytics)
  const isLoading = computed(() => adminStore.isLoading)
  const hasError = computed(() => adminStore.hasError)
  const error = computed(() => adminStore.getError)
  const isInitialized = computed(() => adminStore.isInitialized)

  // Access control
  const checkAccess = (): boolean => {
    if (!canAccess.value) {
      notifyError('No tienes permisos para acceder a esta sección')
      router.push('/')
      return false
    }
    return true
  }

  // Initialization
  const initialize = async (): Promise<void> => {
    if (!checkAccess()) return
    
    if (isInitializing.value || isInitialized.value) return
    
    isInitializing.value = true
    try {
      await adminStore.initialize()
    } catch (error) {
      console.error('[useAdmin] Initialization failed:', error)
    } finally {
      isInitializing.value = false
    }
  }

  // Auto refresh
  const startAutoRefresh = (): void => {
    if (autoRefreshInterval.value) return
    
    autoRefreshInterval.value = setInterval(async () => {
      if (canAccess.value && isInitialized.value) {
        try {
          await adminStore.fetchStats(false)
        } catch (error) {
          console.warn('[useAdmin] Auto refresh failed:', error)
        }
      }
    }, refreshRate.value)
  }

  const stopAutoRefresh = (): void => {
    if (autoRefreshInterval.value) {
      clearInterval(autoRefreshInterval.value)
      autoRefreshInterval.value = null
    }
  }

  const setRefreshRate = (rate: number): void => {
    refreshRate.value = rate
    if (autoRefreshInterval.value) {
      stopAutoRefresh()
      startAutoRefresh()
    }
  }

  // Data operations
  const refreshStats = async (): Promise<AdminStats | null> => {
    if (!checkAccess()) return null
    return await adminStore.fetchStats(false)
  }

  const refreshAnalytics = async (params?: {
    period?: 'day' | 'week' | 'month' | 'year'
    startDate?: string
    endDate?: string
  }): Promise<AdminAnalytics | null> => {
    if (!checkAccess()) return null
    return await adminStore.fetchAnalytics(params, false)
  }

  const refreshAll = async (): Promise<void> => {
    if (!checkAccess()) return
    await adminStore.refresh()
  }

  // Error handling
  const clearError = (): void => {
    adminStore.clearError()
  }

  // Cleanup
  const cleanup = (): void => {
    stopAutoRefresh()
  }

  // Lifecycle
  onMounted(() => {
    if (canAccess.value) {
      initialize()
      startAutoRefresh()
    }
  })

  onUnmounted(() => {
    cleanup()
  })

  // Watch for auth changes
  watch(canAccess, (newValue) => {
    if (newValue) {
      initialize()
      startAutoRefresh()
    } else {
      cleanup()
    }
  })

  return {
    // State
    isInitializing,
    isAdmin,
    isModerator,
    canAccess,
    stats,
    analytics,
    isLoading,
    hasError,
    error,
    isInitialized,
    refreshRate,
    
    // Methods
    initialize,
    checkAccess,
    refreshStats,
    refreshAnalytics,
    refreshAll,
    clearError,
    startAutoRefresh,
    stopAutoRefresh,
    setRefreshRate,
    cleanup
  }
}

/**
 * Moderation composable
 * Handles item moderation functionality
 */
export function useModeration() {
  const adminStore = useAdminStore()
  const { notifySuccess, notifyError } = useNotifications()

  // Computed properties
  const items = computed(() => adminStore.getModerationItems)
  const isLoading = computed(() => adminStore.isLoadingModeration)
  const isUpdating = computed(() => adminStore.isUpdating)
  const pagination = computed(() => adminStore.getModerationPagination)
  const filters = computed(() => adminStore.getModerationFilters)
  const hasItems = computed(() => items.value.length > 0)
  const pendingCount = computed(() => 
    items.value.filter(item => item.moderationStatus === 'pending').length
  )

  // Data operations
  const fetchItems = async (options?: {
    page?: number
    limit?: number
    filters?: AdminFilters
    append?: boolean
  }): Promise<ModerationItem[]> => {
    return await adminStore.fetchModerationItems(options)
  }

  const loadMore = async (): Promise<void> => {
    if (pagination.value.page < pagination.value.pages) {
      await fetchItems({
        page: pagination.value.page + 1,
        limit: pagination.value.limit,
        filters: filters.value,
        append: true
      })
    }
  }

  const refresh = async (): Promise<void> => {
    await fetchItems({
      page: 1,
      limit: pagination.value.limit,
      filters: filters.value
    })
  }

  // Item actions
  const approveItem = async (itemId: string, notes?: string): Promise<boolean> => {
    try {
      const result = await adminStore.approveItem(itemId, notes)
      return !!result
    } catch (error) {
      notifyError('Error al aprobar el artículo')
      return false
    }
  }

  const rejectItem = async (itemId: string, reason: string, notes?: string): Promise<boolean> => {
    try {
      const result = await adminStore.rejectItem(itemId, reason, notes)
      return !!result
    } catch (error) {
      notifyError('Error al rechazar el artículo')
      return false
    }
  }

  const toggleAvailability = async (itemId: string, isAvailable: boolean): Promise<boolean> => {
    try {
      return await adminStore.toggleItemAvailability(itemId, isAvailable)
    } catch (error) {
      notifyError('Error al cambiar la disponibilidad del artículo')
      return false
    }
  }

  // Bulk operations
  const approveMultiple = async (itemIds: string[], notes?: string): Promise<number> => {
    let successCount = 0
    
    for (const itemId of itemIds) {
      const success = await approveItem(itemId, notes)
      if (success) successCount++
    }
    
    if (successCount > 0) {
      notifySuccess(`${successCount} artículos aprobados correctamente`)
    }
    
    return successCount
  }

  const rejectMultiple = async (itemIds: string[], reason: string, notes?: string): Promise<number> => {
    let successCount = 0
    
    for (const itemId of itemIds) {
      const success = await rejectItem(itemId, reason, notes)
      if (success) successCount++
    }
    
    if (successCount > 0) {
      notifySuccess(`${successCount} artículos rechazados correctamente`)
    }
    
    return successCount
  }

  // Filtering
  const setFilters = (newFilters: AdminFilters): void => {
    adminStore.setModerationFilters(newFilters)
  }

  const clearFilters = (): void => {
    adminStore.setModerationFilters({})
  }

  const setPage = (page: number): void => {
    adminStore.setModerationPage(page)
  }

  // Utilities
  const getItemById = (itemId: string): ModerationItem | undefined => {
    return items.value.find(item => (item as any).id === itemId)
  }

  const getItemsByStatus = (status: string): ModerationItem[] => {
    return items.value.filter(item => item.moderationStatus === status)
  }

  return {
    // State
    items,
    isLoading,
    isUpdating,
    pagination,
    filters,
    hasItems,
    pendingCount,
    
    // Methods
    fetchItems,
    loadMore,
    refresh,
    approveItem,
    rejectItem,
    toggleAvailability,
    approveMultiple,
    rejectMultiple,
    setFilters,
    clearFilters,
    setPage,
    getItemById,
    getItemsByStatus
  }
}

/**
 * Admin users composable
 * Handles user management functionality
 */
export function useAdminUsers() {
  const adminStore = useAdminStore()
  const { notifySuccess, notifyError, showConfirm } = useNotifications()

  // Computed properties
  const users = computed(() => adminStore.getUsers)
  const isLoading = computed(() => adminStore.isLoadingUsers)
  const isUpdating = computed(() => adminStore.isUpdating)
  const pagination = computed(() => adminStore.getUsersPagination)
  const filters = computed(() => adminStore.getUsersFilters)
  const hasUsers = computed(() => users.value.length > 0)
  const activeUsersCount = computed(() => 
    users.value.filter(user => user.isActive).length
  )
  const adminUsersCount = computed(() => 
    users.value.filter(user => user.role === 'admin').length
  )

  // Data operations
  const fetchUsers = async (options?: {
    page?: number
    limit?: number
    filters?: AdminFilters
    append?: boolean
  }): Promise<AdminUser[]> => {
    return await adminStore.fetchUsers(options)
  }

  const loadMore = async (): Promise<void> => {
    if (pagination.value.page < pagination.value.pages) {
      await fetchUsers({
        page: pagination.value.page + 1,
        limit: pagination.value.limit,
        filters: filters.value,
        append: true
      })
    }
  }

  const refresh = async (): Promise<void> => {
    await fetchUsers({
      page: 1,
      limit: pagination.value.limit,
      filters: filters.value
    })
  }

  // User actions
  const updateRole = async (userId: string, role: string): Promise<boolean> => {
    try {
      const result = await adminStore.updateUserRole(userId, role)
      return !!result
    } catch (error) {
      notifyError('Error al actualizar el rol del usuario')
      return false
    }
  }

  const toggleStatus = async (userId: string, isActive: boolean): Promise<boolean> => {
    try {
      const result = await adminStore.toggleUserStatus(userId, isActive)
      return !!result
    } catch (error) {
      notifyError('Error al cambiar el estado del usuario')
      return false
    }
  }

  const deleteUser = async (userId: string, userName?: string): Promise<boolean> => {
    try {
      const confirmed = await showConfirm(
        '¿Estás seguro?',
        `¿Deseas eliminar al usuario ${userName || 'seleccionado'}? Esta acción no se puede deshacer.`
      )
      
      if (!confirmed) return false
      
      return await adminStore.deleteUser(userId)
    } catch (error) {
      notifyError('Error al eliminar el usuario')
      return false
    }
  }

  // Bulk operations
  const updateMultipleRoles = async (userIds: string[], role: string): Promise<number> => {
    let successCount = 0
    
    for (const userId of userIds) {
      const success = await updateRole(userId, role)
      if (success) successCount++
    }
    
    if (successCount > 0) {
      notifySuccess(`${successCount} usuarios actualizados correctamente`)
    }
    
    return successCount
  }

  const toggleMultipleStatus = async (userIds: string[], isActive: boolean): Promise<number> => {
    let successCount = 0
    
    for (const userId of userIds) {
      const success = await toggleStatus(userId, isActive)
      if (success) successCount++
    }
    
    if (successCount > 0) {
      notifySuccess(`${successCount} usuarios ${isActive ? 'activados' : 'desactivados'} correctamente`)
    }
    
    return successCount
  }

  // Filtering and search
  const setFilters = (newFilters: AdminFilters): void => {
    adminStore.setUsersFilters(newFilters)
  }

  const clearFilters = (): void => {
    adminStore.setUsersFilters({})
  }

  const setPage = (page: number): void => {
    adminStore.setUsersPage(page)
  }

  const searchUsers = async (query: string): Promise<void> => {
    setFilters({ ...filters.value, search: query })
    await fetchUsers({
      page: 1,
      limit: pagination.value.limit,
      filters: { ...filters.value, search: query }
    })
  }

  // Utilities
  const getUserById = (userId: string): AdminUser | undefined => {
    return users.value.find(user => user.id === userId || user._id === userId)
  }

  const getUsersByRole = (role: string): AdminUser[] => {
    return users.value.filter(user => user.role === role)
  }

  const getUsersByStatus = (isActive: boolean): AdminUser[] => {
    return users.value.filter(user => user.isActive === isActive)
  }

  return {
    // State
    users,
    isLoading,
    isUpdating,
    pagination,
    filters,
    hasUsers,
    activeUsersCount,
    adminUsersCount,
    
    // Methods
    fetchUsers,
    loadMore,
    refresh,
    updateRole,
    toggleStatus,
    deleteUser,
    updateMultipleRoles,
    toggleMultipleStatus,
    setFilters,
    clearFilters,
    setPage,
    searchUsers,
    getUserById,
    getUsersByRole,
    getUsersByStatus
  }
}

/**
 * System logs composable
 * Handles system logs functionality
 */
export function useSystemLogs() {
  const adminStore = useAdminStore()

  // Computed properties
  const logs = computed(() => adminStore.getLogs)
  const isLoading = computed(() => adminStore.isLoadingLogs)
  const pagination = computed(() => adminStore.getLogsPagination)
  const filters = computed(() => adminStore.getLogsFilters)
  const hasLogs = computed(() => logs.value.length > 0)
  const errorLogsCount = computed(() => 
    logs.value.filter(log => log.level === 'error').length
  )
  const warningLogsCount = computed(() => 
    logs.value.filter(log => log.level === 'warn').length
  )

  // Data operations
  const fetchLogs = async (options?: {
    page?: number
    limit?: number
    filters?: AdminFilters
    append?: boolean
  }): Promise<SystemLog[]> => {
    return await adminStore.fetchLogs(options)
  }

  const loadMore = async (): Promise<void> => {
    if (pagination.value.page < pagination.value.pages) {
      await fetchLogs({
        page: pagination.value.page + 1,
        limit: pagination.value.limit,
        filters: filters.value,
        append: true
      })
    }
  }

  const refresh = async (): Promise<void> => {
    await fetchLogs({
      page: 1,
      limit: pagination.value.limit,
      filters: filters.value
    })
  }

  // Filtering
  const setFilters = (newFilters: AdminFilters): void => {
    adminStore.setLogsFilters(newFilters)
  }

  const clearFilters = (): void => {
    adminStore.setLogsFilters({})
  }

  const setPage = (page: number): void => {
    adminStore.setLogsPage(page)
  }

  const filterByLevel = async (level: 'error' | 'warn' | 'info' | 'debug'): Promise<void> => {
    setFilters({ ...filters.value, level })
    await fetchLogs({
      page: 1,
      limit: pagination.value.limit,
      filters: { ...filters.value, level }
    })
  }

  const filterByDateRange = async (startDate: string, endDate: string): Promise<void> => {
    setFilters({ ...filters.value, startDate, endDate })
    await fetchLogs({
      page: 1,
      limit: pagination.value.limit,
      filters: { ...filters.value, startDate, endDate }
    })
  }

  // Utilities
  const getLogsByLevel = (level: string): SystemLog[] => {
    return logs.value.filter(log => log.level === level)
  }

  const getLogsByAction = (action: string): SystemLog[] => {
    return logs.value.filter(log => log.action === action)
  }

  const getLogsByUser = (userId: string): SystemLog[] => {
    return logs.value.filter(log => log.userId === userId)
  }

  return {
    // State
    logs,
    isLoading,
    pagination,
    filters,
    hasLogs,
    errorLogsCount,
    warningLogsCount,
    
    // Methods
    fetchLogs,
    loadMore,
    refresh,
    setFilters,
    clearFilters,
    setPage,
    filterByLevel,
    filterByDateRange,
    getLogsByLevel,
    getLogsByAction,
    getLogsByUser
  }
}

/**
 * Admin analytics composable
 * Handles analytics functionality
 */
export function useAdminAnalytics() {
  const adminStore = useAdminStore()
  const { notifyError } = useNotifications()

  // Reactive state
  const selectedPeriod = ref<'day' | 'week' | 'month' | 'year'>('week')
  const customDateRange = ref<{ start: string; end: string } | null>(null)

  // Computed properties
  const analytics = computed(() => adminStore.getAnalytics)
  const isLoading = computed(() => adminStore.isLoadingAnalytics)
  const hasData = computed(() => !!analytics.value)

  // Data operations
  const fetchAnalytics = async (params?: {
    period?: 'day' | 'week' | 'month' | 'year'
    startDate?: string
    endDate?: string
  }): Promise<AdminAnalytics | null> => {
    try {
      return await adminStore.fetchAnalytics(params, false)
    } catch (error) {
      notifyError('Error al cargar los datos de análisis')
      return null
    }
  }

  const refreshAnalytics = async (): Promise<void> => {
    const params = customDateRange.value
      ? {
          startDate: customDateRange.value.start,
          endDate: customDateRange.value.end
        }
      : { period: selectedPeriod.value }
    
    await fetchAnalytics(params)
  }

  // Period management
  const setPeriod = async (period: 'day' | 'week' | 'month' | 'year'): Promise<void> => {
    selectedPeriod.value = period
    customDateRange.value = null
    await fetchAnalytics({ period })
  }

  const setCustomDateRange = async (startDate: string, endDate: string): Promise<void> => {
    customDateRange.value = { start: startDate, end: endDate }
    await fetchAnalytics({ startDate, endDate })
  }

  const clearCustomDateRange = async (): Promise<void> => {
    customDateRange.value = null
    await fetchAnalytics({ period: selectedPeriod.value })
  }

  // Utilities
  const getChartData = (metric: string) => {
    if (!analytics.value) return null
    return (analytics.value as any)[metric] || null
  }

  const getMetricValue = (metric: string) => {
    if (!analytics.value) return 0
    const data = (analytics.value as any)[metric]
    return Array.isArray(data) ? data.length : 0
  }

  const getGrowthRate = (metric: string) => {
    if (!analytics.value) return 0
    const data = (analytics.value as any)[metric]
    if (!Array.isArray(data) || data.length < 2) return 0
    const current = data[data.length - 1]
    const previous = data[data.length - 2]
    return current && previous ? ((current.users || current.items || 0) - (previous.users || previous.items || 0)) / (previous.users || previous.items || 1) * 100 : 0
  }

  return {
    // State
    selectedPeriod,
    customDateRange,
    analytics,
    isLoading,
    hasData,
    
    // Methods
    fetchAnalytics,
    refreshAnalytics,
    setPeriod,
    setCustomDateRange,
    clearCustomDateRange,
    getChartData,
    getMetricValue,
    getGrowthRate
  }
}