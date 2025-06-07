/**
 * @file index.ts
 * @description Users feature module exports
 * Centralizes all user-related functionality for clean imports
 */

// Services
export { userService, default as defaultUserService } from './services/userService'

// Components
export * from './components'

// Views
export * from './views'

// Stores
export { useUsersStore } from './stores/usersStore'

// Composables
export {
  useUsers,
  useCurrentUser,
  useUserSearch,
  useUserPermissions,
  useUserList
} from './composables/useUsers'

// Utils
export {
  // Display utilities
  formatUserDisplayName,
  getUserInitials,
  getUserAvatarUrl,
  
  // Role utilities
  getUserRoleLabel,
  getUserRoleColor,
  isUserRole,
  hasUserRole,
  isUserAdmin,
  isUserModerator,
  canUserModerate,
  
  // Status utilities
  getUserStatusLabel,
  getUserStatusColor,
  isUserActive,
  isUserOnline,
  
  // Validation utilities
  isValidUserName,
  isValidUserEmail,
  isValidUserPhone,
  validateUserData,
  
  // Comparison utilities
  isSameUser,
  isCurrentUser,
  
  // Sorting utilities
  sortUsersByName,
  sortUsersByRole,
  sortUsersByDate,
  
  // Filtering utilities
  filterUsersByRole,
  filterUsersByStatus,
  filterUsersBySearch,
  
  // Preferences utilities
  getDefaultUserPreferences,
  mergeUserPreferences,
  
  // Statistics utilities
  calculateUserAge,
  formatUserJoinDate,
  formatUserLastSeen,
  
  // Helper utilities
  sanitizeUserInput,
  truncateText,
  getUserDisplayInfo
} from './utils/userUtils'

// Types
export type {
  User,
  UserPreferences,
  UpdateUserData,
  UserItem,
  UserTrade,
  UsersResponse,
  UserResponse,
  UserItemsResponse,
  UserTradesResponse
} from './services/userService'

export type {
  UserFilters,
  UserPagination,
  UserCache,
  UsersState
} from './stores/usersStore'