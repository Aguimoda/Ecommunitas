/**
 * @file index.ts
 * @description Admin feature module exports
 * Centralizes all admin-related exports for easy importing
 */

// Components
export * from './components'

// Views
export * from './views'

// Services
export { adminService } from './services/adminService'
export type {
  AdminStats,
  AdminAnalytics,
  ModerationItem,
  AdminUser,
  SystemLog,
  AdminResponse
} from './services/adminService'

// Store
export { useAdminStore } from './stores/adminStore'
export type {
  AdminFilters,
  AdminPagination,
  AdminCache,
  AdminState
} from './stores/adminStore'

// Composables
export {
  useAdmin,
  useModeration,
  useAdminUsers,
  useSystemLogs,
  useAdminAnalytics
} from './composables/useAdmin'

// Utilities
export {
  // Constants
  ADMIN_ROLES,
  MODERATION_STATUSES,
  LOG_LEVELS,
  ITEM_CATEGORIES,
  
  // Role utilities
  getRoleLabel,
  getRoleColor,
  getRoleIcon,
  canManageRole,
  getAvailableRoles,
  
  // Status utilities
  getStatusLabel,
  getStatusColor,
  getStatusIcon,
  
  // Log level utilities
  getLogLevelLabel,
  getLogLevelColor,
  getLogLevelIcon,
  
  // Category utilities
  getCategoryLabel,
  getCategoryIcon,
  
  // Formatting utilities
  formatNumber,
  formatPercentage,
  formatCurrency,
  formatDate,
  formatRelativeTime,
  
  // Validation utilities
  isValidEmail,
  isValidRole,
  isValidStatus,
  isValidLogLevel,
  isValidCategory,
  
  // Data processing utilities
  calculateGrowthRate,
  calculatePercentage,
  groupByPeriod,
  sortByDate,
  filterByDateRange,
  
  // Statistics utilities
  calculateStats,
  generateChartData,
  
  // Search and filter utilities
  searchItems,
  filterItems,
  
  // Export utilities
  exportToCSV,
  
  // Specific admin utilities
  getModerationItemPriority,
  getUserRiskScore,
  getSystemHealthScore
} from './utils/adminUtils'

export type {
  AdminRole,
  ModerationStatus,
  LogLevel,
  ItemCategory
} from './utils/adminUtils'