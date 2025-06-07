/**
 * Shared Constants Index
 * Centralizes exports for all shared constants
 * Enables clean imports: import { CATEGORY_TRANSLATIONS, DEFAULT_SEARCH_FILTERS } from '@/shared/constants'
 */

// Translation constants
export {
  CATEGORY_TRANSLATIONS,
  CONDITION_TRANSLATIONS,
  CATEGORY_BADGE_CLASSES,
  CONDITION_BADGE_CLASSES,
  translateCategory,
  translateCondition,
  getCategoriesOptions,
  getConditionsOptions,
  getConditionBadgeClass,
  getCategoryBadgeClass,
  isValidCategory,
  isValidCondition,
  // Legacy exports for backward compatibility
  categoryTranslations,
  conditionTranslations
} from './translations'

export type { Category, Condition, SelectOption } from './translations'

// Search filter constants
export {
  DEFAULT_SEARCH_FILTERS,
  SORT_OPTIONS,
  DISTANCE_OPTIONS,
  ITEMS_PER_PAGE_OPTIONS,
  createDefaultFilters,
  isValidSortOption,
  getSortLabel,
  resetFilters,
  hasActiveFilters,
  filtersToSearchParams,
  searchParamsToFilters
} from './searchFilters'

export type { SearchFilters, SortOption } from './searchFilters'