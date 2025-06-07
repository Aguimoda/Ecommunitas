/**
 * Search Filters Constants
 * Defines default search filter values and types
 * Provides consistent search configuration across the application
 */

import type { Coordinates } from '../composables/useGeolocation'
import type { Category, Condition } from './translations'

// Sort options for search results
export type SortOption = 'recent' | 'oldest' | 'distance' | 'price_low' | 'price_high' | 'title'

// Search filters interface
export interface SearchFilters {
  query: string
  category: Category | ''
  location: string
  condition: Condition | ''
  distance: number
  sort: SortOption
  coordinates: Coordinates | null
  page: number
  limit: number
  minPrice?: number
  maxPrice?: number
  availability?: boolean
}

// Default search filters
export const DEFAULT_SEARCH_FILTERS: SearchFilters = {
  query: '',
  category: '',
  location: '',
  condition: '',
  distance: 10,
  sort: 'recent',
  coordinates: null,
  page: 1,
  limit: 12
} as const

// Sort options for select components
export const SORT_OPTIONS = [
  { value: 'recent', label: 'Más recientes' },
  { value: 'oldest', label: 'Más antiguos' },
  { value: 'distance', label: 'Distancia' },
  { value: 'price_low', label: 'Precio: menor a mayor' },
  { value: 'price_high', label: 'Precio: mayor a menor' },
  { value: 'title', label: 'Título A-Z' }
] as const

// Distance options for search radius
export const DISTANCE_OPTIONS = [
  { value: 1, label: '1 km' },
  { value: 5, label: '5 km' },
  { value: 10, label: '10 km' },
  { value: 25, label: '25 km' },
  { value: 50, label: '50 km' },
  { value: 100, label: '100 km' }
] as const

// Items per page options
export const ITEMS_PER_PAGE_OPTIONS = [
  { value: 6, label: '6 por página' },
  { value: 12, label: '12 por página' },
  { value: 24, label: '24 por página' },
  { value: 48, label: '48 por página' }
] as const

/**
 * Creates a copy of default search filters
 * @returns New instance of default search filters
 */
export const createDefaultFilters = (): SearchFilters => {
  return { ...DEFAULT_SEARCH_FILTERS }
}

/**
 * Validates if a sort option is valid
 * @param sort - The sort value to validate
 * @returns True if the sort option is valid
 */
export const isValidSortOption = (sort: string): sort is SortOption => {
  return SORT_OPTIONS.some(option => option.value === sort)
}

/**
 * Gets the label for a sort option
 * @param sort - The sort option
 * @returns The display label for the sort option
 */
export const getSortLabel = (sort: SortOption): string => {
  const option = SORT_OPTIONS.find(opt => opt.value === sort)
  return option?.label || sort
}

/**
 * Resets filters to default values while preserving certain fields
 * @param currentFilters - Current filter state
 * @param preserve - Fields to preserve from current filters
 * @returns Reset filters with preserved fields
 */
export const resetFilters = (
  currentFilters: SearchFilters,
  preserve: (keyof SearchFilters)[] = ['coordinates']
): SearchFilters => {
  const resetFilters = createDefaultFilters()
  
  // Preserve specified fields
  preserve.forEach(field => {
    if (currentFilters[field] !== undefined) {
      (resetFilters as any)[field] = currentFilters[field]
    }
  })
  
  return resetFilters
}

/**
 * Checks if filters have been modified from defaults
 * @param filters - Current filters to check
 * @returns True if filters are different from defaults
 */
export const hasActiveFilters = (filters: SearchFilters): boolean => {
  const defaults = DEFAULT_SEARCH_FILTERS
  
  return (
    filters.query !== defaults.query ||
    filters.category !== defaults.category ||
    filters.location !== defaults.location ||
    filters.condition !== defaults.condition ||
    filters.distance !== defaults.distance ||
    filters.sort !== defaults.sort ||
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined ||
    filters.availability !== undefined
  )
}

/**
 * Converts filters to URL search params
 * @param filters - Filters to convert
 * @returns URLSearchParams object
 */
export const filtersToSearchParams = (filters: SearchFilters): URLSearchParams => {
  const params = new URLSearchParams()
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      if (key === 'coordinates' && value) {
        params.set('lat', value.lat.toString())
        params.set('lng', value.lng.toString())
      } else if (typeof value === 'object') {
        // Skip complex objects that aren't coordinates
        return
      } else {
        params.set(key, value.toString())
      }
    }
  })
  
  return params
}

/**
 * Converts URL search params to filters
 * @param searchParams - URL search params
 * @returns Filters object
 */
export const searchParamsToFilters = (searchParams: URLSearchParams): Partial<SearchFilters> => {
  const filters: Partial<SearchFilters> = {}
  
  // Handle coordinates separately
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')
  if (lat && lng) {
    filters.coordinates = {
      lat: parseFloat(lat),
      lng: parseFloat(lng)
    }
  }
  
  // Handle other parameters
  const stringFields: (keyof SearchFilters)[] = ['query', 'category', 'location', 'condition', 'sort']
  const numberFields: (keyof SearchFilters)[] = ['distance', 'page', 'limit', 'minPrice', 'maxPrice']
  const booleanFields: (keyof SearchFilters)[] = ['availability']
  
  stringFields.forEach(field => {
    const value = searchParams.get(field)
    if (value !== null) {
      (filters as any)[field] = value
    }
  })
  
  numberFields.forEach(field => {
    const value = searchParams.get(field)
    if (value !== null) {
      const numValue = parseFloat(value)
      if (!isNaN(numValue)) {
        (filters as any)[field] = numValue
      }
    }
  })
  
  booleanFields.forEach(field => {
    const value = searchParams.get(field)
    if (value !== null) {
      (filters as any)[field] = value === 'true'
    }
  })
  
  return filters
}