/**
 * Shared Composables Index
 * Centralizes exports for all shared composables
 * Enables clean imports: import { useErrorHandler, useNotifications } from '@/shared/composables'
 */

// Error handling
export { useErrorHandler } from './useErrorHandler'
export type { ErrorDetails, UseErrorHandler } from './useErrorHandler'

// Notifications
export { useNotifications } from './useNotifications'
export type { NotificationOptions, UseNotifications } from './useNotifications'

// Geolocation
export { useGeolocation } from './useGeolocation'
export type { 
  Coordinates, 
  GeolocationOptions, 
  GeolocationError, 
  UseGeolocation 
} from './useGeolocation'

// Validation
export { useValidation } from './useValidation'
export type { 
  ValidationRule, 
  FieldValidation, 
  FormValidation, 
  UseValidation 
} from './useValidation'

// Local Storage
export { useLocalStorage, useUserPreferences, useFormPersistence } from './useLocalStorage'
export type { LocalStorageOptions } from './useLocalStorage'

// Pagination
export { usePagination, useServerPagination } from './usePagination'
export type { 
  PaginationOptions, 
  PaginationState, 
  PaginationMeta 
} from './usePagination'

// Image upload
export { useImageUpload } from './useImageUpload'
export type { 
  ImageFile, 
  ImageUploadOptions, 
  ImageValidationError, 
  UseImageUpload 
} from './useImageUpload'

// Search composable
export { useSearch } from './useSearch'