/**
 * @file index.ts
 * @description Auth Feature Index
 * Centralizes exports for all authentication-related functionality
 * Enables clean imports: import { useAuth, authService } from '@/features/auth'
 */

// Stores
export { useAuthStore } from './stores/authStore'

// Services
export { default as authService } from './services/authService'
export * from './services/authService'

// Composables
export {
  useAuth
} from './composables/useAuth'

// Components
export * from './components'

// Views
export * from './views'

// Utils
export {
  getAuthHeader,
  getAuthHeaders,
  getAuthHeadersFormData,
  isAuthenticated,
  getCurrentUser,
  getCurrentUserId,
  getCurrentUserRole,
  hasRole,
  hasAnyRole,
  isAdmin,
  isModerator,
  isOwner,
  canAccess,
  isValidEmail,
  validatePassword,
  validateName,
  clearAuthData,
  saveAuthData,
  getTokenExpiration,
  isTokenExpired,
  isCurrentTokenExpired,
  formatUserDisplayName,
  getUserInitials,
  generateSecurePassword,
  debounceAuthCheck
} from './utils/authUtils'

// Re-export types for convenience
export type {
  User,
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  UpdateProfileData,
  PasswordUpdateData,
  ForgotPasswordData,
  ResetPasswordData
} from './services/authService'

// Legacy exports for backward compatibility
export { default as authHeader } from './utils/authUtils'