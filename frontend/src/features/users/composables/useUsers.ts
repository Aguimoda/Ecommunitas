/**
 * @file useUsers.ts
 * @description Composables for user management functionality
 * Provides reactive user operations and state management
 */

import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { useUsersStore } from '../stores/usersStore'
import { useAuthStore } from '@/features/auth/stores/authStore'
import { useNotifications } from '@/shared/composables/useNotifications'
import type { User, UpdateUserData } from '../services/userService'
import type { UserFilters } from '../stores/usersStore'

/**
 * Main users composable
 * Provides comprehensive user management functionality
 */
export function useUsers() {
  const usersStore = useUsersStore()
  const authStore = useAuthStore()
  const { notifyError, showConfirm } = useNotifications()

  // Reactive state
  const isInitializing = ref(false)

  // Computed properties
  const users = computed(() => usersStore.getUsers)
  const currentUser = computed(() => usersStore.getCurrentUser)
  const isLoading = computed(() => usersStore.isLoading)
  const isLoadingUser = computed(() => usersStore.isLoadingUser)
  const isUpdating = computed(() => usersStore.isUpdating)
  const error = computed(() => usersStore.getError)
  const pagination = computed(() => usersStore.getPagination)
  const filters = computed(() => usersStore.getFilters)
  const hasActiveFilters = computed(() => usersStore.hasActiveFilters)
  const hasMorePages = computed(() => usersStore.hasMorePages)
  const totalUsers = computed(() => usersStore.totalUsers)
  const isInitialized = computed(() => usersStore.isInitialized)

  // Permission checks
  const canManageUsers = computed(() => authStore.isAdmin)
  const canEditUser = (user: User) => {
    if (!authStore.isAuthenticated) return false
    if (authStore.isAdmin) return true
    return authStore.user?.id === user.id
  }
  const canDeleteUser = (user: User) => {
    if (!authStore.isAdmin) return false
    // Prevent self-deletion
    return authStore.user?.id !== user.id
  }

  // Initialize
  const initialize = async () => {
    if (isInitializing.value || usersStore.isInitialized) return
    
    isInitializing.value = true
    try {
      await usersStore.initialize()
    } finally {
      isInitializing.value = false
    }
  }

  // Fetch operations
  const fetchUsers = async (options?: {
    page?: number
    limit?: number
    filters?: UserFilters
    append?: boolean
  }) => {
    return await usersStore.fetchUsers(options)
  }

  const fetchUser = async (userId: string, useCache: boolean = true) => {
    return await usersStore.fetchUser(userId, useCache)
  }

  const searchUsers = async (query: string, options?: {
    page?: number
    limit?: number
    filters?: Omit<UserFilters, 'search'>
  }) => {
    return await usersStore.searchUsers(query, options)
  }

  const loadMore = async () => {
    return await usersStore.loadMore()
  }

  const refresh = async () => {
    await usersStore.refresh()
  }

  // Update operations
  const updateUser = async (userId: string, userData: UpdateUserData) => {
    return await usersStore.updateUser(userId, userData)
  }

  const updateUserRole = async (userId: string, role: string) => {
    if (!canManageUsers.value) {
      notifyError('No tienes permisos para cambiar roles de usuario')
      return null
    }
    
    const confirmed = await showConfirm(
      'Cambiar rol de usuario',
      '¿Estás seguro de que quieres cambiar el rol de este usuario?'
    )
    
    if (!confirmed) return null
    
    return await usersStore.updateUserRole(userId, role)
  }

  const toggleUserStatus = async (user: User) => {
    if (!canManageUsers.value) {
      notifyError('No tienes permisos para cambiar el estado de usuarios')
      return null
    }
    
    const action = user.isActive ? 'desactivar' : 'activar'
    const confirmed = await showConfirm(
      `${action.charAt(0).toUpperCase() + action.slice(1)} usuario`,
      `¿Estás seguro de que quieres ${action} a este usuario?`
    )
    
    if (!confirmed) return null
    
    const userId = user.id
    if (!userId) {
      notifyError('ID de usuario no válido')
      return null
    }
    
    return await usersStore.toggleUserStatus(userId, !user.isActive)
  }

  // Delete operations
  const deleteUser = async (user: User) => {
    if (!canDeleteUser(user)) {
      notifyError('No tienes permisos para eliminar este usuario')
      return false
    }
    
    const confirmed = await showConfirm(
      'Eliminar usuario',
      `¿Estás seguro de que quieres eliminar al usuario "${user.name}"? Esta acción no se puede deshacer.`
    )
    
    if (!confirmed) return false
    
    const userId = user.id
    if (!userId) {
      notifyError('ID de usuario no válido')
      return false
    }
    
    return await usersStore.deleteUser(userId)
  }

  // Filter operations
  const setFilters = (newFilters: UserFilters) => {
    usersStore.setFilters(newFilters)
  }

  const resetFilters = () => {
    usersStore.resetFilters()
  }

  const setPage = (page: number) => {
    usersStore.setPage(page)
  }

  // Utility functions
  const clearError = () => {
    usersStore.clearError()
  }

  const clearUser = () => {
    usersStore.clearUser()
  }

  const reset = () => {
    usersStore.reset()
  }

  const getStoreStats = () => {
    return usersStore.getStoreStats()
  }

  // Auto-initialize on mount
  onMounted(() => {
    initialize()
  })

  return {
    // State
    users,
    currentUser,
    isLoading,
    isLoadingUser,
    isUpdating,
    error,
    pagination,
    filters,
    hasActiveFilters,
    hasMorePages,
    totalUsers,
    isInitialized,
    isInitializing,
    
    // Permissions
    canManageUsers,
    canEditUser,
    canDeleteUser,
    
    // Operations
    initialize,
    fetchUsers,
    fetchUser,
    searchUsers,
    loadMore,
    refresh,
    updateUser,
    updateUserRole,
    toggleUserStatus,
    deleteUser,
    setFilters,
    resetFilters,
    setPage,
    clearError,
    clearUser,
    reset,
    getStoreStats
  }
}

/**
 * Current user composable
 * Simplified access to current user data and operations
 */
export function useCurrentUser() {
  const usersStore = useUsersStore()
  const authStore = useAuthStore()
  const { notifyError } = useNotifications()

  // Computed properties
  const user = computed(() => usersStore.getCurrentUser || authStore.user)
  const isLoading = computed(() => usersStore.isLoadingUser)
  const isUpdating = computed(() => usersStore.isUpdating)
  const error = computed(() => usersStore.getError)

  // Operations
  const fetchProfile = async () => {
    return await usersStore.fetchCurrentUser()
  }

  const updateProfile = async (userData: UpdateUserData) => {
    if (!user.value) {
      notifyError('Usuario no autenticado')
      return null
    }
    
    const userId = user.value.id
    if (!userId) {
      notifyError('ID de usuario no válido')
      return null
    }
    
    const result = await usersStore.updateUser(userId, userData)
    
    // Update auth store if successful
    if (result && authStore.user) {
      authStore.user = { ...authStore.user, ...result }
    }
    
    return result
  }

  const refresh = async () => {
    await fetchProfile()
  }

  const clearError = () => {
    usersStore.clearError()
  }

  return {
    user,
    isLoading,
    isUpdating,
    error,
    fetchProfile,
    updateProfile,
    refresh,
    clearError
  }
}

/**
 * User search composable
 * Specialized composable for user search functionality
 */
export function useUserSearch() {
  const usersStore = useUsersStore()
  
  // Local state
  const searchQuery = ref('')
  const searchResults = ref<User[]>([])
  const isSearching = ref(false)
  const searchError = ref<string | null>(null)
  const searchFilters = ref<Omit<UserFilters, 'search'>>({})
  
  // Debounced search
  let searchTimeout: NodeJS.Timeout | null = null
  
  const performSearch = async (query: string, filters?: Omit<UserFilters, 'search'>) => {
    if (!query.trim()) {
      searchResults.value = []
      return
    }
    
    isSearching.value = true
    searchError.value = null
    
    try {
      const results = await usersStore.searchUsers(query, {
        page: 1,
        limit: 20,
        filters
      })
      searchResults.value = results
    } catch (error) {
      searchError.value = 'Error al buscar usuarios'
      console.error('Search error:', error)
    } finally {
      isSearching.value = false
    }
  }
  
  const debouncedSearch = (query: string, filters?: Omit<UserFilters, 'search'>, delay: number = 300) => {
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }
    
    searchTimeout = setTimeout(() => {
      performSearch(query, filters)
    }, delay)
  }
  
  const search = (query: string, filters?: Omit<UserFilters, 'search'>) => {
    searchQuery.value = query
    searchFilters.value = filters || {}
    debouncedSearch(query, filters)
  }
  
  const clearSearch = () => {
    searchQuery.value = ''
    searchResults.value = []
    searchError.value = null
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }
  }
  
  const setFilters = (filters: Omit<UserFilters, 'search'>) => {
    searchFilters.value = filters
    if (searchQuery.value) {
      debouncedSearch(searchQuery.value, filters)
    }
  }
  
  // Watch for query changes
  watch(searchQuery, (newQuery) => {
    if (newQuery) {
      debouncedSearch(newQuery, searchFilters.value)
    } else {
      searchResults.value = []
    }
  })
  
  // Cleanup on unmount
  onUnmounted(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }
  })
  
  return {
    searchQuery,
    searchResults,
    isSearching,
    searchError,
    searchFilters,
    search,
    clearSearch,
    setFilters,
    performSearch
  }
}

/**
 * User permissions composable
 * Handles user permission checks and role-based access
 */
export function useUserPermissions() {
  const authStore = useAuthStore()
  
  // Permission checks
  const isAdmin = computed(() => authStore.isAdmin)
  const isModerator = computed(() => authStore.isModerator)
  const isAuthenticated = computed(() => authStore.isAuthenticated)
  
  const canViewUsers = computed(() => isAuthenticated.value)
  const canManageUsers = computed(() => isAdmin.value)
  const canEditUser = (user: User) => {
    if (!isAuthenticated.value) return false
    if (isAdmin.value) return true
    return authStore.user?.id === user.id
  }
  const canDeleteUser = (user: User) => {
    if (!isAdmin.value) return false
    // Prevent self-deletion
    return authStore.user?.id !== user.id
  }
  const canChangeRole = (user: User) => {
    if (!isAdmin.value) return false
    // Prevent changing own role
    return authStore.user?.id !== user.id
  }
  const canToggleStatus = (user: User) => {
    if (!isAdmin.value) return false
    // Prevent changing own status
    return authStore.user?.id !== user.id
  }
  
  const hasRole = (role: string) => authStore.hasRole(role)
  const hasAnyRole = (roles: string[]) => authStore.hasAnyRole(roles)
  
  return {
    isAdmin,
    isModerator,
    isAuthenticated,
    canViewUsers,
    canManageUsers,
    canEditUser,
    canDeleteUser,
    canChangeRole,
    canToggleStatus,
    hasRole,
    hasAnyRole
  }
}

/**
 * User list composable
 * Specialized composable for user list management with pagination and filtering
 */
export function useUserList(options?: {
  autoFetch?: boolean
  pageSize?: number
  defaultFilters?: UserFilters
}) {
  const {
    autoFetch = true,
    pageSize = 10,
    defaultFilters = {}
  } = options || {}
  
  const usersStore = useUsersStore()
  
  // Local state
  const localFilters = ref<UserFilters>({ ...defaultFilters })
  const isRefreshing = ref(false)
  
  // Computed properties
  const users = computed(() => usersStore.getUsers)
  const isLoading = computed(() => usersStore.isLoading)
  const pagination = computed(() => usersStore.getPagination)
  const hasMorePages = computed(() => usersStore.hasMorePages)
  const totalUsers = computed(() => usersStore.totalUsers)
  
  // Operations
  const fetchUsers = async (page: number = 1, append: boolean = false) => {
    return await usersStore.fetchUsers({
      page,
      limit: pageSize,
      filters: localFilters.value,
      append
    })
  }
  
  const loadMore = async () => {
    if (!hasMorePages.value || isLoading.value) return []
    return await usersStore.loadMore()
  }
  
  const refresh = async () => {
    isRefreshing.value = true
    try {
      await fetchUsers(1, false)
    } finally {
      isRefreshing.value = false
    }
  }
  
  const setFilters = (filters: UserFilters) => {
    localFilters.value = { ...filters }
    usersStore.setFilters(filters)
    // Fetch with new filters
    fetchUsers(1, false)
  }
  
  const resetFilters = () => {
    localFilters.value = { ...defaultFilters }
    usersStore.resetFilters()
    // Fetch with reset filters
    fetchUsers(1, false)
  }
  
  const goToPage = (page: number) => {
    usersStore.setPage(page)
    fetchUsers(page, false)
  }
  
  // Auto-fetch on mount
  onMounted(() => {
    if (autoFetch && !usersStore.isInitialized) {
      fetchUsers()
    }
  })
  
  // Watch for filter changes
  watch(localFilters, (newFilters) => {
    usersStore.setFilters(newFilters)
  }, { deep: true })
  
  return {
    users,
    isLoading,
    isRefreshing,
    pagination,
    hasMorePages,
    totalUsers,
    localFilters,
    fetchUsers,
    loadMore,
    refresh,
    setFilters,
    resetFilters,
    goToPage
  }
}