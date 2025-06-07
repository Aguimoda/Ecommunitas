/**
 * Shared Module Index
 * Centralizes exports for all shared functionality
 * Enables clean imports: import { useNotifications, DEFAULT_SEARCH_FILTERS, displayError } from '@/shared'
 */

// Composables
export * from './composables'

// Constants
export * from './constants'

// Utilities
export * from './utils'

// Types (re-export commonly used types)
export type {
  // Geolocation types
  Coordinates,
  GeolocationError,
  GeolocationOptions,
  
  // Validation types
  ValidationRule,
  FieldValidation,
  FormValidation,
  
  // Image upload types
  ImageFile,
  ImageUploadOptions,
  ImageValidationError,
  
  // Additional composable types
  UseGeolocation,
  UseValidation,
  UseImageUpload,
  UseErrorHandler,
  UseNotifications
} from './composables'

// Re-export constants for convenience
export {
  DEFAULT_SEARCH_FILTERS,
  CATEGORY_TRANSLATIONS,
  CONDITION_TRANSLATIONS
} from './constants'