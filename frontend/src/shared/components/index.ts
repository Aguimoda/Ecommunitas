/**
 * @file index.ts
 * @description Shared Components Index
 * Centralizes exports for all shared/common components
 */

// Navigation
export { default as NavBar } from './NavBar.vue'

// Form Components
export { default as ImageUploader } from './ImageUploader.vue'
export { default as LocationPicker } from './LocationPicker.vue'

// Search Components
export { default as Search } from './Search.vue'
export { default as SearchFilters } from './SearchFilters.vue'

// Constants
export * from './searchFiltersConstants'

// TODO: Add when implemented
// export { default as LoadingSpinner } from './LoadingSpinner.vue'
// export { default as ErrorMessage } from './ErrorMessage.vue'