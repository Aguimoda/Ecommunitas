/**
 * @file searchFiltersConstants.ts
 * @description Constantes y configuraciones por defecto para filtros de búsqueda
 * 
 * Este archivo define las constantes utilizadas en los componentes de búsqueda
 * y filtrado de artículos. Centraliza los valores por defecto y configuraciones
 * para mantener consistencia en toda la aplicación.
 * 
 * CONSTANTES INCLUIDAS:
 * - DEFAULT_SEARCH_FILTERS: Configuración inicial de filtros de búsqueda
 * - Valores por defecto para paginación y ordenamiento
 * - Configuraciones de distancia y ubicación
 * 
 * PROPÓSITO:
 * - ✅ Centralizar configuraciones de búsqueda
 * - ✅ Mantener consistencia entre componentes
 * - ✅ Facilitar modificaciones globales
 * - ✅ Proporcionar valores seguros por defecto
 * 
 * @author Equipo de Desarrollo Ecommunitas
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * Configuración por defecto para filtros de búsqueda de artículos
 * 
 * Esta constante define los valores iniciales que se utilizan cuando
 * se inicializa un componente de búsqueda o cuando se resetean los filtros.
 * 
 * @constant {Object} DEFAULT_SEARCH_FILTERS
 * @property {string} query - Texto de búsqueda libre (vacío por defecto)
 * @property {string} category - Categoría seleccionada (todas por defecto)
 * @property {string} condition - Estado del artículo (todos por defecto)
 * @property {string} sort - Criterio de ordenamiento ('recent' por defecto)
 * @property {number} page - Página actual de resultados (1 por defecto)
 * @property {number} limit - Número de resultados por página (12 por defecto)
 * 
 * @example
 * ```typescript
 * import { DEFAULT_SEARCH_FILTERS } from '@/shared/components'
 * 
 * // Inicializar filtros con valores por defecto
 * const filters = ref({ ...DEFAULT_SEARCH_FILTERS })
 * 
 * // Resetear filtros a valores por defecto
 * const resetFilters = () => {
 *   Object.assign(filters.value, DEFAULT_SEARCH_FILTERS)
 * }
 * ```
 */
export const DEFAULT_SEARCH_FILTERS = {
  /** Texto de búsqueda libre */
  query: '',
  /** Categoría de artículo seleccionada */
  category: '',
  /** Estado/condición del artículo */
  condition: '',
  /** Criterio de ordenamiento de resultados */
  sort: 'recent',
  /** Página actual de resultados */
  page: 1,
  /** Número de artículos por página */
  limit: 12
};