/**
 * @file index.ts
 * @description Índice Central de Componentes Compartidos de Ecommunitas
 * 
 * Este archivo centraliza todas las exportaciones de componentes compartidos
 * que son utilizados a través de toda la aplicación. Proporciona un punto
 * único de importación para mantener la consistencia y facilitar el mantenimiento.
 * 
 * COMPONENTES INCLUIDOS:
 * 
 * 🧭 NAVEGACIÓN:
 * - NavBar: Barra de navegación principal con autenticación, tema y notificaciones
 * 
 * 📝 FORMULARIOS:
 * - ImageUploader: Carga de imágenes con drag & drop, validación y compresión
 * - LocationPicker: Selector de ubicación con mapas, geolocalización y búsqueda
 * 
 * 🔍 BÚSQUEDA:
 * - Search: Componente principal de búsqueda con filtros avanzados
 * - SearchFilters: Panel de filtros detallados para refinar búsquedas
 * 
 * 📊 CONSTANTES:
 * - searchFiltersConstants: Constantes y configuraciones para filtros de búsqueda
 * 
 * VENTAJAS DE ESTA ESTRUCTURA:
 * - ✅ Importaciones centralizadas y consistentes
 * - ✅ Fácil mantenimiento y refactoring
 * - ✅ Mejor tree-shaking y optimización de bundles
 * - ✅ Documentación centralizada de componentes
 * - ✅ Tipado TypeScript mejorado
 * 
 * EJEMPLO DE USO:
 * ```typescript
 * // Importación individual
 * import { NavBar, Search } from '@/shared/components'
 * 
 * // Importación múltiple
 * import { 
 *   ImageUploader, 
 *   LocationPicker, 
 *   SearchFilters 
 * } from '@/shared/components'
 * 
 * // Importación de constantes
 * import { 
 *   DEFAULT_SEARCH_FILTERS,
 *   SEARCH_CATEGORIES 
 * } from '@/shared/components'
 * ```
 * 
 * TECNOLOGÍAS:
 * - Vue 3 Composition API
 * - TypeScript para tipado estático
 * - Tailwind CSS para estilos
 * - Leaflet para mapas (LocationPicker)
 * - File API para carga de archivos
 * 
 * @author Equipo de Desarrollo Ecommunitas
 * @version 1.0.0
 * @since 1.0.0
 * @see {@link https://vuejs.org/guide/components/} Vue Components Guide
 * @see {@link https://www.typescriptlang.org/docs/} TypeScript Documentation
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