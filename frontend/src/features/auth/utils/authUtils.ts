/**
 * @file authUtils.ts
 * @description Authentication utility functions
 * Provides helper functions for auth-related operations
 */

import { User } from '../services/authService'

/**
 * Gets authorization header with JWT token
 * @returns Authorization header object
 */
export function getAuthHeader(): { Authorization?: string } {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/**
 * Gets authorization headers for JSON requests
 * @returns Headers object with Authorization and Content-Type
 */
export function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  }
}

/**
 * Gets authorization headers for FormData requests
 * @returns Headers object with Authorization (no Content-Type for FormData)
 */
export function getAuthHeadersFormData(): Record<string, string> {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/**
 * Checks if user is authenticated
 * @returns boolean indicating authentication status
 */
export function isAuthenticated(): boolean {
  const token = localStorage.getItem('token')
  const user = localStorage.getItem('user')
  return !!(token && user)
}

/**
 * Gets current user from localStorage
 * @returns User object or null
 */
export function getCurrentUser(): User | null {
  try {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  } catch (error) {
    // Error parsing user data - return null for invalid data
    return null
  }
}

/**
 * Gets current user ID
 * @returns User ID or null
 */
export function getCurrentUserId(): string | null {
  const user = getCurrentUser()
  return user?.id || null
}

/**
 * Gets current user role
 * @returns User role or 'user' as default
 */
export function getCurrentUserRole(): string {
  const user = getCurrentUser()
  return user?.role || 'user'
}

/**
 * Checks if current user has a specific role
 * @param role - Role to check
 * @returns boolean indicating if user has the role
 */
export function hasRole(role: string): boolean {
  return getCurrentUserRole() === role
}

/**
 * Checks if current user has any of the specified roles
 * @param roles - Array of roles to check
 * @returns boolean indicating if user has any of the roles
 */
export function hasAnyRole(roles: string[]): boolean {
  const userRole = getCurrentUserRole()
  return roles.includes(userRole)
}

/**
 * Checks if current user is admin
 * @returns boolean indicating if user is admin
 */
export function isAdmin(): boolean {
  return hasRole('admin')
}

/**
 * Checks if current user is moderator or admin
 * @returns boolean indicating if user is moderator
 */
export function isModerator(): boolean {
  return hasAnyRole(['admin', 'moderator'])
}

/**
 * Checks if current user owns a resource
 * @param resourceUserId - ID of the resource owner
 * @returns boolean indicating ownership
 */
export function isOwner(resourceUserId: string): boolean {
  const currentUserId = getCurrentUserId()
  return currentUserId === resourceUserId
}

/**
 * Checks if current user can access a resource
 * @param requiredRole - Required role for access (optional)
 * @param resourceUserId - ID of the resource owner (optional)
 * @returns boolean indicating access permission
 */
export function canAccess(requiredRole?: string, resourceUserId?: string): boolean {
  if (!isAuthenticated()) return false
  if (requiredRole && !hasRole(requiredRole)) return false
  if (resourceUserId && !isOwner(resourceUserId)) return false
  return true
}

/**
 * Validates email format
 * @param email - Email to validate
 * @returns boolean indicating if email is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validates password strength
 * @param password - Password to validate
 * @returns object with validation result and message
 */
export function validatePassword(password: string): { isValid: boolean; message: string } {
  if (password.length < 6) {
    return { isValid: false, message: 'La contraseña debe tener al menos 6 caracteres' }
  }
  
  if (password.length > 128) {
    return { isValid: false, message: 'La contraseña no puede tener más de 128 caracteres' }
  }
  
  // Check for at least one letter and one number
  const hasLetter = /[a-zA-Z]/.test(password)
  const hasNumber = /\d/.test(password)
  
  if (!hasLetter || !hasNumber) {
    return { isValid: false, message: 'La contraseña debe contener al menos una letra y un número' }
  }
  
  return { isValid: true, message: 'Contraseña válida' }
}

/**
 * Validates name format
 * @param name - Name to validate
 * @returns object with validation result and message
 */
export function validateName(name: string): { isValid: boolean; message: string } {
  if (!name || name.trim().length === 0) {
    return { isValid: false, message: 'El nombre es requerido' }
  }
  
  if (name.trim().length < 2) {
    return { isValid: false, message: 'El nombre debe tener al menos 2 caracteres' }
  }
  
  if (name.trim().length > 50) {
    return { isValid: false, message: 'El nombre no puede tener más de 50 caracteres' }
  }
  
  // Check for valid characters (letters, spaces, hyphens, apostrophes)
  const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/
  if (!nameRegex.test(name.trim())) {
    return { isValid: false, message: 'El nombre solo puede contener letras, espacios, guiones y apostrofes' }
  }
  
  return { isValid: true, message: 'Nombre válido' }
}

/**
 * Clears all authentication data from localStorage
 */
export function clearAuthData(): void {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

/**
 * Saves authentication data to localStorage
 * @param token - JWT token
 * @param user - User object
 */
export function saveAuthData(token: string, user: User): void {
  localStorage.setItem('token', token)
  localStorage.setItem('user', JSON.stringify(user))
}

/**
 * Gets token expiration time
 * @param token - JWT token
 * @returns Date object or null if invalid
 */
export function getTokenExpiration(token: string): Date | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp ? new Date(payload.exp * 1000) : null
  } catch (error) {
    // Error parsing token - return null for invalid token
    return null
  }
}

/**
 * Checks if token is expired
 * @param token - JWT token
 * @returns boolean indicating if token is expired
 */
export function isTokenExpired(token: string): boolean {
  const expiration = getTokenExpiration(token)
  return expiration ? expiration < new Date() : true
}

/**
 * Checks if current token is expired
 * @returns boolean indicating if current token is expired
 */
export function isCurrentTokenExpired(): boolean {
  const token = localStorage.getItem('token')
  return token ? isTokenExpired(token) : true
}

/**
 * Formats user display name
 * @param user - User object
 * @returns Formatted display name
 */
export function formatUserDisplayName(user: User): string {
  return user.name || user.email || 'Usuario'
}

/**
 * Gets user initials for avatar
 * @param user - User object
 * @returns User initials (max 2 characters)
 */
export function getUserInitials(user: User): string {
  const name = user.name || user.email || 'U'
  const words = name.split(' ')
  
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase()
  }
  
  return name.substring(0, 2).toUpperCase()
}

/**
 * Generates a secure random password
 * @param length - Password length (default: 12)
 * @returns Generated password
 */
export function generateSecurePassword(length = 12): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  let password = ''
  
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  
  return password
}

/**
 * Debounces authentication checks
 * @param func - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export function debounceAuthCheck<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

// Legacy support - default export for backward compatibility
export default getAuthHeader