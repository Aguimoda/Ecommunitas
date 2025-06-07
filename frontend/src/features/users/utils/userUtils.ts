/**
 * @file userUtils.ts
 * @description Utility functions for user management
 * Provides helper functions for user data manipulation and validation
 */

import type { User, UserPreferences } from '../services/userService'

/**
 * User display utilities
 */
export const formatUserDisplayName = (user: User): string => {
  if (!user) return 'Usuario desconocido'
  return user.name || user.email || 'Usuario sin nombre'
}

export const getUserInitials = (user: User): string => {
  if (!user || !user.name) return 'U'
  
  const names = user.name.trim().split(' ')
  if (names.length === 1) {
    return names[0].charAt(0).toUpperCase()
  }
  
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase()
}

export const getUserAvatarUrl = (user: User, size: number = 40): string => {
  if (user.avatar) {
    return user.avatar
  }
  
  // Generate a placeholder avatar URL (you can customize this)
  const initials = getUserInitials(user)
  const backgroundColor = generateColorFromString(user.name || user.email || 'user')
  
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&size=${size}&background=${backgroundColor}&color=ffffff&bold=true`
}

/**
 * User role utilities
 */
export const getUserRoleLabel = (role?: string): string => {
  const roleLabels: Record<string, string> = {
    admin: 'Administrador',
    moderator: 'Moderador',
    user: 'Usuario',
    premium: 'Usuario Premium'
  }
  
  return roleLabels[role || 'user'] || 'Usuario'
}

export const getUserRoleColor = (role?: string): string => {
  const roleColors: Record<string, string> = {
    admin: 'red',
    moderator: 'orange',
    premium: 'purple',
    user: 'blue'
  }
  
  return roleColors[role || 'user'] || 'blue'
}

export const isUserRole = (user: User, role: string): boolean => {
  return user.role === role
}

export const hasUserRole = (user: User, roles: string[]): boolean => {
  return roles.includes(user.role || 'user')
}

export const isUserAdmin = (user: User): boolean => {
  return isUserRole(user, 'admin')
}

export const isUserModerator = (user: User): boolean => {
  return isUserRole(user, 'moderator')
}

export const canUserModerate = (user: User): boolean => {
  return hasUserRole(user, ['admin', 'moderator'])
}

/**
 * User status utilities
 */
export const getUserStatusLabel = (user: User): string => {
  if (user.isActive === false) return 'Inactivo'
  if (user.lastLogin) {
    const lastLogin = new Date(user.lastLogin)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return 'Activo hoy'
    if (diffInDays === 1) return 'Activo ayer'
    if (diffInDays <= 7) return `Activo hace ${diffInDays} días`
    if (diffInDays <= 30) return 'Activo este mes'
    return 'Inactivo'
  }
  return 'Activo'
}

export const getUserStatusColor = (user: User): string => {
  if (user.isActive === false) return 'red'
  if (user.lastLogin) {
    const lastLogin = new Date(user.lastLogin)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffInDays <= 1) return 'green'
    if (diffInDays <= 7) return 'yellow'
    if (diffInDays <= 30) return 'orange'
    return 'red'
  }
  return 'green'
}

export const isUserActive = (user: User): boolean => {
  return user.isActive !== false
}

export const isUserOnline = (user: User): boolean => {
  if (!user.lastLogin) return false
  
  const lastLogin = new Date(user.lastLogin)
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60))
  
  return diffInMinutes <= 5 // Consider online if active in last 5 minutes
}

/**
 * User validation utilities
 */
export const isValidUserName = (name: string): boolean => {
  if (!name || typeof name !== 'string') return false
  const trimmed = name.trim()
  return trimmed.length >= 2 && trimmed.length <= 50
}

export const isValidUserEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const isValidUserPhone = (phone: string): boolean => {
  if (!phone || typeof phone !== 'string') return false
  const phoneRegex = /^[+]?[\d\s\-\(\)]{10,}$/
  return phoneRegex.test(phone.trim())
}

export const validateUserData = (userData: Partial<User>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  if (userData.name !== undefined && !isValidUserName(userData.name)) {
    errors.push('El nombre debe tener entre 2 y 50 caracteres')
  }
  
  if (userData.email !== undefined && !isValidUserEmail(userData.email)) {
    errors.push('El email no tiene un formato válido')
  }
  
  if (userData.phone !== undefined && userData.phone && !isValidUserPhone(userData.phone)) {
    errors.push('El teléfono no tiene un formato válido')
  }
  
  if (userData.bio !== undefined && userData.bio && userData.bio.length > 500) {
    errors.push('La biografía no puede exceder los 500 caracteres')
  }
  
  if (userData.location !== undefined && userData.location && userData.location.length > 100) {
    errors.push('La ubicación no puede exceder los 100 caracteres')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * User comparison utilities
 */
export const isSameUser = (user1: User | null, user2: User | null): boolean => {
  if (!user1 || !user2) return false
  return Boolean((user1.id && user1.id === user2.id) || (user1._id && user1._id === user2._id))
}

export const isCurrentUser = (user: User, currentUser: User | null): boolean => {
  return isSameUser(user, currentUser)
}

/**
 * User sorting utilities
 */
export const sortUsersByName = (users: User[], ascending: boolean = true): User[] => {
  return [...users].sort((a, b) => {
    const nameA = (a.name || '').toLowerCase()
    const nameB = (b.name || '').toLowerCase()
    return ascending ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA)
  })
}

export const sortUsersByRole = (users: User[], ascending: boolean = true): User[] => {
  const roleOrder = ['admin', 'moderator', 'premium', 'user']
  
  return [...users].sort((a, b) => {
    const roleA = roleOrder.indexOf(a.role || 'user')
    const roleB = roleOrder.indexOf(b.role || 'user')
    return ascending ? roleA - roleB : roleB - roleA
  })
}

export const sortUsersByDate = (users: User[], field: 'createdAt' | 'updatedAt' | 'lastLogin', ascending: boolean = false): User[] => {
  return [...users].sort((a, b) => {
    const dateA = a[field] ? new Date(a[field]!).getTime() : 0
    const dateB = b[field] ? new Date(b[field]!).getTime() : 0
    return ascending ? dateA - dateB : dateB - dateA
  })
}

/**
 * User filtering utilities
 */
export const filterUsersByRole = (users: User[], roles: string[]): User[] => {
  return users.filter(user => roles.includes(user.role || 'user'))
}

export const filterUsersByStatus = (users: User[], isActive: boolean): User[] => {
  return users.filter(user => isUserActive(user) === isActive)
}

export const filterUsersBySearch = (users: User[], query: string): User[] => {
  if (!query.trim()) return users
  
  const searchTerm = query.toLowerCase().trim()
  return users.filter(user => {
    const name = (user.name || '').toLowerCase()
    const email = (user.email || '').toLowerCase()
    const location = (user.location || '').toLowerCase()
    
    return name.includes(searchTerm) || 
           email.includes(searchTerm) || 
           location.includes(searchTerm)
  })
}

/**
 * User preferences utilities
 */
export const getDefaultUserPreferences = (): UserPreferences => {
  return {
    notifications: {
      email: true,
      push: true,
      trades: true,
      messages: true
    },
    privacy: {
      showEmail: false,
      showPhone: false,
      showLocation: true
    },
    language: 'es',
    theme: 'auto'
  }
}

export const mergeUserPreferences = (current: UserPreferences | undefined, updates: Partial<UserPreferences>): UserPreferences => {
  const defaults = getDefaultUserPreferences()
  const merged = { ...defaults, ...current }
  
  if (updates.notifications) {
    merged.notifications = { ...merged.notifications, ...updates.notifications }
  }
  
  if (updates.privacy) {
    merged.privacy = { ...merged.privacy, ...updates.privacy }
  }
  
  if (updates.language) {
    merged.language = updates.language
  }
  
  if (updates.theme) {
    merged.theme = updates.theme
  }
  
  return merged
}

/**
 * User statistics utilities
 */
export const calculateUserAge = (createdAt: string): string => {
  const created = new Date(createdAt)
  const now = new Date()
  const diffInMs = now.getTime() - created.getTime()
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
  
  if (diffInDays < 1) return 'Hoy'
  if (diffInDays === 1) return '1 día'
  if (diffInDays < 30) return `${diffInDays} días`
  
  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths === 1) return '1 mes'
  if (diffInMonths < 12) return `${diffInMonths} meses`
  
  const diffInYears = Math.floor(diffInMonths / 12)
  if (diffInYears === 1) return '1 año'
  return `${diffInYears} años`
}

export const formatUserJoinDate = (createdAt: string): string => {
  const date = new Date(createdAt)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export const formatUserLastSeen = (lastLogin?: string): string => {
  if (!lastLogin) return 'Nunca'
  
  const date = new Date(lastLogin)
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMinutes / 60)
  const diffInDays = Math.floor(diffInHours / 24)
  
  if (diffInMinutes < 1) return 'Ahora'
  if (diffInMinutes < 60) return `Hace ${diffInMinutes} minuto${diffInMinutes !== 1 ? 's' : ''}`
  if (diffInHours < 24) return `Hace ${diffInHours} hora${diffInHours !== 1 ? 's' : ''}`
  if (diffInDays < 7) return `Hace ${diffInDays} día${diffInDays !== 1 ? 's' : ''}`
  
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

/**
 * Helper utilities
 */
const generateColorFromString = (str: string): string => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  const color = Math.abs(hash).toString(16).substring(0, 6)
  return color.padEnd(6, '0')
}

export const sanitizeUserInput = (input: string): string => {
  return input.trim().replace(/[<>"'&]/g, '')
}

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength - 3) + '...'
}

export const getUserDisplayInfo = (user: User) => {
  return {
    name: formatUserDisplayName(user),
    initials: getUserInitials(user),
    avatar: getUserAvatarUrl(user),
    role: getUserRoleLabel(user.role),
    roleColor: getUserRoleColor(user.role),
    status: getUserStatusLabel(user),
    statusColor: getUserStatusColor(user),
    isActive: isUserActive(user),
    isOnline: isUserOnline(user),
    joinDate: user.createdAt ? formatUserJoinDate(user.createdAt) : 'Desconocido',
    lastSeen: formatUserLastSeen(user.lastLogin),
    age: user.createdAt ? calculateUserAge(user.createdAt) : 'Desconocido'
  }
}