/**
 * Utilidades de traducción para categorías y condiciones
 * Este archivo centraliza todas las traducciones para mantener consistencia
 */

// Tipos para las traducciones
type CategoryKey = 'books' | 'electronics' | 'clothing' | 'furniture' | 'other'
type ConditionKey = 'new' | 'like_new' | 'good' | 'fair' | 'poor'

// Traducciones de categorías
export const categoryTranslations: Record<CategoryKey, string> = {
  books: 'Libros',
  electronics: 'Electrónicos',
  clothing: 'Ropa',
  furniture: 'Muebles',
  other: 'Otros'
}

// Traducciones de condiciones
export const conditionTranslations: Record<ConditionKey, string> = {
  new: 'Nuevo',
  like_new: 'Como nuevo',
  good: 'Buen estado',
  fair: 'Estado aceptable',
  poor: 'Estado regular'
}

// Función para traducir categorías
export const translateCategory = (category: string | null | undefined): string => {
  if (!category) return 'Sin categoría'
  return categoryTranslations[category as CategoryKey] || category
}

// Función para traducir condiciones
export const translateCondition = (condition: string | null | undefined): string => {
  if (!condition) return 'Sin condición'
  return conditionTranslations[condition as ConditionKey] || condition
}

// Tipo para las opciones
type Option = {
  value: string
  label: string
}

// Función para obtener todas las categorías traducidas
export const getCategoriesOptions = (): Option[] => {
  return Object.entries(categoryTranslations).map(([value, label]) => ({
    value,
    label
  }))
}

// Función para obtener todas las condiciones traducidas
export const getConditionsOptions = (): Option[] => {
  return Object.entries(conditionTranslations).map(([value, label]) => ({
    value,
    label
  }))
}

// Función para obtener el color de badge según la condición
export const getConditionBadgeClass = (condition: string): string => {
  const classes: Record<string, string> = {
    new: 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100',
    like_new: 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100',
    good: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100',
    fair: 'bg-orange-100 text-orange-800 dark:bg-orange-700 dark:text-orange-100',
    poor: 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100'
  }
  return classes[condition] || 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-100'
}

// Función para obtener el color de badge según la categoría
export const getCategoryBadgeClass = (category: string): string => {
  const classes: Record<string, string> = {
    books: 'bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-100',
    electronics: 'bg-purple-100 text-purple-800 dark:bg-purple-700 dark:text-purple-100',
    clothing: 'bg-pink-100 text-pink-800 dark:bg-pink-700 dark:text-pink-100',
    furniture: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-700 dark:text-indigo-100',
    other: 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-100'
  }
  return classes[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-100'
}