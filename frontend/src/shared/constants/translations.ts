/**
 * Translation Constants
 * Centralizes all translations for categories, conditions, and UI elements
 * Provides consistent translation utilities across the application
 */

// Types for better type safety
export type Category = 'books' | 'electronics' | 'clothing' | 'furniture' | 'other'
export type Condition = 'new' | 'like_new' | 'good' | 'fair' | 'poor'

export interface SelectOption {
  value: string
  label: string
}

// Category translations
export const CATEGORY_TRANSLATIONS: Record<Category, string> = {
  books: 'Libros',
  electronics: 'Electrónicos',
  clothing: 'Ropa',
  furniture: 'Muebles',
  other: 'Otros'
} as const

// Condition translations
export const CONDITION_TRANSLATIONS: Record<Condition, string> = {
  new: 'Nuevo',
  like_new: 'Como nuevo',
  good: 'Buen estado',
  fair: 'Estado aceptable',
  poor: 'Estado regular'
} as const

// Badge classes for conditions
export const CONDITION_BADGE_CLASSES: Record<Condition, string> = {
  new: 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100',
  like_new: 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100',
  good: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100',
  fair: 'bg-orange-100 text-orange-800 dark:bg-orange-700 dark:text-orange-100',
  poor: 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100'
} as const

// Badge classes for categories
export const CATEGORY_BADGE_CLASSES: Record<Category, string> = {
  books: 'bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-100',
  electronics: 'bg-purple-100 text-purple-800 dark:bg-purple-700 dark:text-purple-100',
  clothing: 'bg-pink-100 text-pink-800 dark:bg-pink-700 dark:text-pink-100',
  furniture: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-700 dark:text-indigo-100',
  other: 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-100'
} as const

// Default badge class for unknown values
const DEFAULT_BADGE_CLASS = 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-100'

/**
 * Translates a category key to its display name
 * @param category - The category key
 * @returns Translated category name or fallback
 */
export const translateCategory = (category: string | null | undefined): string => {
  if (!category) return 'Sin categoría'
  return CATEGORY_TRANSLATIONS[category as Category] || category
}

/**
 * Translates a condition key to its display name
 * @param condition - The condition key
 * @returns Translated condition name or fallback
 */
export const translateCondition = (condition: string | null | undefined): string => {
  if (!condition) return 'Sin condición'
  return CONDITION_TRANSLATIONS[condition as Condition] || condition
}

/**
 * Gets all category options for select components
 * @returns Array of category options
 */
export const getCategoriesOptions = (): SelectOption[] => {
  return Object.entries(CATEGORY_TRANSLATIONS).map(([value, label]) => ({
    value,
    label
  }))
}

/**
 * Gets all condition options for select components
 * @returns Array of condition options
 */
export const getConditionsOptions = (): SelectOption[] => {
  return Object.entries(CONDITION_TRANSLATIONS).map(([value, label]) => ({
    value,
    label
  }))
}

/**
 * Gets the badge CSS class for a condition
 * @param condition - The condition key
 * @returns CSS class string for the condition badge
 */
export const getConditionBadgeClass = (condition: string | null | undefined): string => {
  if (!condition) return DEFAULT_BADGE_CLASS
  return CONDITION_BADGE_CLASSES[condition as Condition] || DEFAULT_BADGE_CLASS
}

/**
 * Gets the badge CSS class for a category
 * @param category - The category key
 * @returns CSS class string for the category badge
 */
export const getCategoryBadgeClass = (category: string | null | undefined): string => {
  if (!category) return DEFAULT_BADGE_CLASS
  return CATEGORY_BADGE_CLASSES[category as Category] || DEFAULT_BADGE_CLASS
}

/**
 * Checks if a string is a valid category
 * @param value - The value to check
 * @returns True if the value is a valid category
 */
export const isValidCategory = (value: string): value is Category => {
  return Object.keys(CATEGORY_TRANSLATIONS).includes(value)
}

/**
 * Checks if a string is a valid condition
 * @param value - The value to check
 * @returns True if the value is a valid condition
 */
export const isValidCondition = (value: string): value is Condition => {
  return Object.keys(CONDITION_TRANSLATIONS).includes(value)
}

// Export legacy names for backward compatibility
export const categoryTranslations = CATEGORY_TRANSLATIONS
export const conditionTranslations = CONDITION_TRANSLATIONS