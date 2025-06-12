/**
 * @file index.ts
 * @description Índice centralizado de composables compartidos en Ecommunitas
 * 
 * Este archivo centraliza todas las exportaciones de composables compartidos
 * para facilitar las importaciones limpias y organizadas en toda la aplicación.
 * Proporciona un punto único de acceso a toda la funcionalidad de composables.
 * 
 * COMPOSABLES INCLUIDOS:
 * - useErrorHandler: Manejo centralizado de errores y notificaciones
 * - useNotifications: Sistema de notificaciones toast
 * - useGeolocation: Funcionalidad de geolocalización
 * - useValidation: Validación de formularios y campos
 * - useLocalStorage: Almacenamiento local reactivo
 * - usePagination: Paginación de datos
 * - useImageUpload: Carga y gestión de imágenes
 * - useSearch: Búsqueda avanzada de artículos
 * - useNavBar: Gestión de la barra de navegación
 * 
 * VENTAJAS:
 * - Importaciones limpias y organizadas
 * - Tipado TypeScript completo exportado
 * - Punto único de acceso a composables
 * - Facilita el mantenimiento y refactoring
 * - Mejora la experiencia de desarrollo
 * 
 * @author Equipo de Desarrollo Ecommunitas
 * @version 1.0.0
 * @since 1.0.0
 * 
 * @example
 * ```typescript
 * // Importación limpia de múltiples composables
 * import { 
 *   useErrorHandler, 
 *   useNotifications, 
 *   useValidation 
 * } from '@/shared/composables'
 * 
 * // Importación de tipos
 * import type { 
 *   ErrorDetails, 
 *   ValidationRule, 
 *   NotificationOptions 
 * } from '@/shared/composables'
 * ```
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