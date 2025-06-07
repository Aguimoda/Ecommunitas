/**
 * @file adminUtils.ts
 * @description Utility functions for admin operations
 * Provides helper functions for admin data processing, formatting, and validation
 */

import type {
  AdminStats,
  AdminUser,
  ModerationItem
} from '../services/adminService'

// Constants
export const ADMIN_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  USER: 'user'
} as const

export const MODERATION_STATUSES = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  UNDER_REVIEW: 'under_review'
} as const

export const LOG_LEVELS = {
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  DEBUG: 'debug'
} as const

export const ITEM_CATEGORIES = {
  ELECTRONICS: 'electronics',
  CLOTHING: 'clothing',
  BOOKS: 'books',
  SPORTS: 'sports',
  HOME: 'home',
  OTHER: 'other'
} as const

// Type definitions
export type AdminRole = typeof ADMIN_ROLES[keyof typeof ADMIN_ROLES]
export type ModerationStatus = typeof MODERATION_STATUSES[keyof typeof MODERATION_STATUSES]
export type LogLevel = typeof LOG_LEVELS[keyof typeof LOG_LEVELS]
export type ItemCategory = typeof ITEM_CATEGORIES[keyof typeof ITEM_CATEGORIES]

// Role utilities
export const getRoleLabel = (role: string): string => {
  const roleLabels: Record<string, string> = {
    [ADMIN_ROLES.SUPER_ADMIN]: 'Super Administrador',
    [ADMIN_ROLES.ADMIN]: 'Administrador',
    [ADMIN_ROLES.MODERATOR]: 'Moderador',
    [ADMIN_ROLES.USER]: 'Usuario'
  }
  return roleLabels[role] || 'Desconocido'
}

export const getRoleColor = (role: string): string => {
  const roleColors: Record<string, string> = {
    [ADMIN_ROLES.SUPER_ADMIN]: 'purple',
    [ADMIN_ROLES.ADMIN]: 'red',
    [ADMIN_ROLES.MODERATOR]: 'orange',
    [ADMIN_ROLES.USER]: 'blue'
  }
  return roleColors[role] || 'gray'
}

export const getRoleIcon = (role: string): string => {
  const roleIcons: Record<string, string> = {
    [ADMIN_ROLES.SUPER_ADMIN]: 'crown',
    [ADMIN_ROLES.ADMIN]: 'shield-check',
    [ADMIN_ROLES.MODERATOR]: 'user-check',
    [ADMIN_ROLES.USER]: 'user'
  }
  return roleIcons[role] || 'user'
}

export const canManageRole = (currentRole: string, targetRole: string): boolean => {
  const roleHierarchy: { [key: string]: number } = {
    [ADMIN_ROLES.SUPER_ADMIN]: 4,
    [ADMIN_ROLES.ADMIN]: 3,
    [ADMIN_ROLES.MODERATOR]: 2,
    [ADMIN_ROLES.USER]: 1
  }
  
  const currentLevel = roleHierarchy[currentRole] || 0
  const targetLevel = roleHierarchy[targetRole] || 0
  
  return currentLevel > targetLevel
}

export const getAvailableRoles = (currentRole: string): Array<{ value: string; label: string }> => {
  const allRoles = [
    { value: ADMIN_ROLES.USER, label: getRoleLabel(ADMIN_ROLES.USER) },
    { value: ADMIN_ROLES.MODERATOR, label: getRoleLabel(ADMIN_ROLES.MODERATOR) },
    { value: ADMIN_ROLES.ADMIN, label: getRoleLabel(ADMIN_ROLES.ADMIN) },
    { value: ADMIN_ROLES.SUPER_ADMIN, label: getRoleLabel(ADMIN_ROLES.SUPER_ADMIN) }
  ]
  
  return allRoles.filter(role => canManageRole(currentRole, role.value))
}

// Status utilities
export const getStatusLabel = (status: string): string => {
  const statusLabels: Record<string, string> = {
    [MODERATION_STATUSES.PENDING]: 'Pendiente',
    [MODERATION_STATUSES.APPROVED]: 'Aprobado',
    [MODERATION_STATUSES.REJECTED]: 'Rechazado',
    [MODERATION_STATUSES.UNDER_REVIEW]: 'En Revisión'
  }
  return statusLabels[status] || 'Desconocido'
}

export const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    [MODERATION_STATUSES.PENDING]: 'yellow',
    [MODERATION_STATUSES.APPROVED]: 'green',
    [MODERATION_STATUSES.REJECTED]: 'red',
    [MODERATION_STATUSES.UNDER_REVIEW]: 'blue'
  }
  return statusColors[status] || 'gray'
}

export const getStatusIcon = (status: string): string => {
  const statusIcons: Record<string, string> = {
    [MODERATION_STATUSES.PENDING]: 'clock',
    [MODERATION_STATUSES.APPROVED]: 'check-circle',
    [MODERATION_STATUSES.REJECTED]: 'x-circle',
    [MODERATION_STATUSES.UNDER_REVIEW]: 'eye'
  }
  return statusIcons[status] || 'help-circle'
}

// Log level utilities
export const getLogLevelLabel = (level: string): string => {
  const levelLabels: Record<string, string> = {
    [LOG_LEVELS.ERROR]: 'Error',
    [LOG_LEVELS.WARNING]: 'Advertencia',
    [LOG_LEVELS.INFO]: 'Información',
    [LOG_LEVELS.DEBUG]: 'Debug'
  }
  return levelLabels[level] || 'Desconocido'
}

export const getLogLevelColor = (level: string): string => {
  const levelColors: Record<string, string> = {
    [LOG_LEVELS.ERROR]: 'red',
    [LOG_LEVELS.WARNING]: 'yellow',
    [LOG_LEVELS.INFO]: 'blue',
    [LOG_LEVELS.DEBUG]: 'gray'
  }
  return levelColors[level] || 'gray'
}

export const getLogLevelIcon = (level: string): string => {
  const levelIcons: Record<string, string> = {
    [LOG_LEVELS.ERROR]: 'alert-circle',
    [LOG_LEVELS.WARNING]: 'alert-triangle',
    [LOG_LEVELS.INFO]: 'info',
    [LOG_LEVELS.DEBUG]: 'bug'
  }
  return levelIcons[level] || 'help-circle'
}

// Category utilities
export const getCategoryLabel = (category: string): string => {
  const categoryLabels: Record<string, string> = {
    [ITEM_CATEGORIES.ELECTRONICS]: 'Electrónicos',
    [ITEM_CATEGORIES.CLOTHING]: 'Ropa',
    [ITEM_CATEGORIES.BOOKS]: 'Libros',
    [ITEM_CATEGORIES.SPORTS]: 'Deportes',
    [ITEM_CATEGORIES.HOME]: 'Hogar',
    [ITEM_CATEGORIES.OTHER]: 'Otros'
  }
  return categoryLabels[category] || 'Otros'
}

export const getCategoryIcon = (category: string): string => {
  const categoryIcons: Record<string, string> = {
    [ITEM_CATEGORIES.ELECTRONICS]: 'smartphone',
    [ITEM_CATEGORIES.CLOTHING]: 'shirt',
    [ITEM_CATEGORIES.BOOKS]: 'book',
    [ITEM_CATEGORIES.SPORTS]: 'activity',
    [ITEM_CATEGORIES.HOME]: 'home',
    [ITEM_CATEGORIES.OTHER]: 'package'
  }
  return categoryIcons[category] || 'package'
}

// Formatting utilities
export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`
}

export const formatCurrency = (amount: number, currency: string = 'EUR'): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency
  }).format(amount)
}

export const formatDate = (date: string | Date, format: 'short' | 'long' | 'time' = 'short'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (format === 'time') {
    return dateObj.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  if (format === 'long') {
    return dateObj.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  return dateObj.toLocaleDateString('es-ES')
}

export const formatRelativeTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - dateObj.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffMinutes < 1) {
    return 'Ahora mismo'
  }
  if (diffMinutes < 60) {
    return `Hace ${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''}`
  }
  if (diffHours < 24) {
    return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`
  }
  if (diffDays < 7) {
    return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`
  }
  
  return formatDate(dateObj)
}

// Validation utilities
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const isValidRole = (role: string): boolean => {
  return Object.values(ADMIN_ROLES).includes(role as AdminRole)
}

export const isValidStatus = (status: string): boolean => {
  return Object.values(MODERATION_STATUSES).includes(status as ModerationStatus)
}

export const isValidLogLevel = (level: string): boolean => {
  return Object.values(LOG_LEVELS).includes(level as LogLevel)
}

export const isValidCategory = (category: string): boolean => {
  return Object.values(ITEM_CATEGORIES).includes(category as ItemCategory)
}

// Data processing utilities
export const calculateGrowthRate = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

export const calculatePercentage = (part: number, total: number): number => {
  if (total === 0) return 0
  return (part / total) * 100
}

export const groupByPeriod = <T extends { createdAt: string }>(
  items: T[],
  period: 'day' | 'week' | 'month' | 'year'
): Record<string, T[]> => {
  const groups: Record<string, T[]> = {}
  
  // Ensure items is an array before using forEach
  if (!Array.isArray(items)) {
    return groups
  }
  
  items.forEach(item => {
    const date = new Date(item.createdAt)
    let key: string
    
    switch (period) {
      case 'day':
        key = date.toISOString().split('T')[0]
        break
      case 'week':
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        key = weekStart.toISOString().split('T')[0]
        break
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        break
      case 'year':
        key = String(date.getFullYear())
        break
      default:
        key = date.toISOString().split('T')[0]
    }
    
    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(item)
  })
  
  return groups
}

export const sortByDate = <T extends { createdAt: string }>(
  items: T[],
  order: 'asc' | 'desc' = 'desc'
): T[] => {
  return [...items].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime()
    const dateB = new Date(b.createdAt).getTime()
    return order === 'asc' ? dateA - dateB : dateB - dateA
  })
}

export const filterByDateRange = <T extends { createdAt: string }>(
  items: T[],
  startDate: string,
  endDate: string
): T[] => {
  const start = new Date(startDate).getTime()
  const end = new Date(endDate).getTime()
  
  return items.filter(item => {
    const itemDate = new Date(item.createdAt).getTime()
    return itemDate >= start && itemDate <= end
  })
}

// Statistics utilities
export const calculateStats = (numbers: number[]): {
  min: number
  max: number
  avg: number
  sum: number
  count: number
} => {
  if (numbers.length === 0) {
    return { min: 0, max: 0, avg: 0, sum: 0, count: 0 }
  }
  
  const sum = numbers.reduce((acc, num) => acc + num, 0)
  const min = Math.min(...numbers)
  const max = Math.max(...numbers)
  const avg = sum / numbers.length
  
  return { min, max, avg, sum, count: numbers.length }
}

export const generateChartData = (
  data: Record<string, number>,
  labels?: Record<string, string>
): { labels: string[]; values: number[] } => {
  const entries = Object.entries(data)
  const chartLabels = entries.map(([key]) => labels?.[key] || key)
  const values = entries.map(([, value]) => value)
  
  return { labels: chartLabels, values }
}

// Search and filter utilities
export const searchItems = <T extends Record<string, any>>(
  items: T[],
  query: string,
  searchFields: (keyof T)[]
): T[] => {
  if (!query.trim()) return items
  
  const lowerQuery = query.toLowerCase()
  
  return items.filter(item =>
    searchFields.some(field => {
      const value = item[field]
      if (typeof value === 'string') {
        return value.toLowerCase().includes(lowerQuery)
      }
      if (typeof value === 'number') {
        return value.toString().includes(lowerQuery)
      }
      return false
    })
  )
}

export const filterItems = <T extends Record<string, any>>(
  items: T[],
  filters: Record<string, any>
): T[] => {
  return items.filter(item =>
    Object.entries(filters).every(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        return true
      }
      
      const itemValue = item[key]
      
      if (Array.isArray(value)) {
        return value.includes(itemValue)
      }
      
      return itemValue === value
    })
  )
}

// Export utilities
export const exportToCSV = <T extends Record<string, any>>(
  data: T[],
  filename: string,
  columns?: { key: keyof T; label: string }[]
): void => {
  if (data.length === 0) return
  
  const headers = columns
    ? columns.map(col => col.label)
    : Object.keys(data[0])
  
  const rows = data.map(item => {
    const values = columns
      ? columns.map(col => item[col.key])
      : Object.values(item)
    
    return values.map(value => {
      if (typeof value === 'string' && value.includes(',')) {
        return `"${value}"`
      }
      return value
    }).join(',')
  })
  
  const csvContent = [headers.join(','), ...rows].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

// Utility functions for specific admin data types
export const getModerationItemPriority = (item: ModerationItem): number => {
  let priority = 0
  
  // Higher priority for older items
  const daysSinceCreation = Math.floor(
    (Date.now() - new Date(item.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  )
  priority += daysSinceCreation
  
  // Higher priority for reported items
  if (item.reportCount && item.reportCount > 0) {
    priority += item.reportCount * 10
  }
  
  // Higher priority for certain categories
  if (item.category === ITEM_CATEGORIES.ELECTRONICS) {
    priority += 5
  }
  
  return priority
}

export const getUserRiskScore = (user: AdminUser): number => {
  let riskScore = 0
  
  // Account age (newer accounts are riskier)
  const accountAgeInDays = user.createdAt ? Math.floor(
    (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  ) : 0
  if (accountAgeInDays < 30) {
    riskScore += 20
  } else if (accountAgeInDays < 90) {
    riskScore += 10
  }
  
  // Report count
  if (user.reportsCount && user.reportsCount > 0) {
    riskScore += user.reportsCount * 15
  }
  
  // Inactive status
  if (!user.isActive) {
    riskScore += 30
  }
  
  // Email verification
  if (!user.isEmailVerified) {
    riskScore += 25
  }
  
  return Math.min(riskScore, 100) // Cap at 100
}

export const getSystemHealthScore = (stats: AdminStats): number => {
  let healthScore = 100
  
  // Error rate impact
  const errorRate = (stats.errors || 0) / Math.max(stats.totalRequests || 1, 1)
  healthScore -= errorRate * 50
  
  // Pending moderation impact
  if ((stats.pendingModerations || 0) > 50) {
    healthScore -= 10
  } else if ((stats.pendingModerations || 0) > 20) {
    healthScore -= 5
  }
  
  // Active users ratio
  const activeUserRatio = (stats.activeUsers || 0) / Math.max(stats.totalUsers || 1, 1)
  if (activeUserRatio < 0.5) {
    healthScore -= 15
  } else if (activeUserRatio < 0.7) {
    healthScore -= 5
  }
  
  return Math.max(healthScore, 0) // Don't go below 0
}