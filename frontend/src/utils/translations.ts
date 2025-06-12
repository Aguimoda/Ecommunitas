/**
 * @fileoverview Utilidades de traducción tipadas para categorías y condiciones
 * @description Sistema centralizado de traducciones con TypeScript para mantener consistencia
 * en la interfaz de usuario, proporcionando traducciones tipadas para categorías de artículos,
 * condiciones de estado y funciones auxiliares para la internacionalización.
 * 
 * @features
 * - Traducciones centralizadas con tipos TypeScript
 * - Traducciones de condiciones de artículos
 * - Funciones de traducción con fallbacks tipados
 * - Validación de claves de traducción en tiempo de compilación
 * - Soporte para valores nulos/indefinidos
 * - Consistencia y seguridad de tipos
 * 
 * @technical
 * - TypeScript con tipos estrictos
 * - Record types para mapeos
 * - Union types para claves válidas
 * - Funciones puras con tipado
 * - Manejo de casos edge tipado
 * - Fallbacks seguros
 * 
 * @types
 * - CategoryKey: Claves válidas para categorías
 * - ConditionKey: Claves válidas para condiciones
 * 
 * @categories
 * - books: Libros
 * - electronics: Electrónicos
 * - clothing: Ropa
 * - furniture: Muebles
 * - other: Otros
 * 
 * @conditions
 * - new: Nuevo
 * - like_new: Como nuevo
 * - good: Buen estado
 * - fair: Estado aceptable
 * - poor: Estado regular
 * 
 * @author Equipo Ecommunitas
 * @version 1.0.0
 * @since 2024
 */

/**
 * Claves válidas para categorías de artículos
 * @typedef {('books'|'electronics'|'clothing'|'furniture'|'other')} CategoryKey
 */
type CategoryKey = 'books' | 'electronics' | 'clothing' | 'furniture' | 'other'

/**
 * Claves válidas para condiciones de artículos
 * @typedef {('new'|'like_new'|'good'|'fair'|'poor')} ConditionKey
 */
type ConditionKey = 'new' | 'like_new' | 'good' | 'fair' | 'poor'

/**
 * Traducciones tipadas de categorías de artículos
 * @type {Record<CategoryKey, string>}
 * @description Mapeo tipado de claves de categorías a sus traducciones en español
 */
export const categoryTranslations: Record<CategoryKey, string> = {
  books: 'Libros',
  electronics: 'Electrónicos',
  clothing: 'Ropa',
  furniture: 'Muebles',
  other: 'Otros'
}

/**
 * Traducciones tipadas de condiciones de artículos
 * @type {Record<ConditionKey, string>}
 * @description Mapeo tipado de claves de condiciones a sus traducciones en español
 */
export const conditionTranslations: Record<ConditionKey, string> = {
  new: 'Nuevo',
  like_new: 'Como nuevo',
  good: 'Buen estado',
  fair: 'Estado aceptable',
  poor: 'Estado regular'
}

/**
 * Traduce una clave de categoría a su texto en español con tipado
 * @param {string|null|undefined} category - Clave de la categoría a traducir
 * @returns {string} Texto traducido de la categoría o fallback
 * @description Proporciona traducción segura con fallback para categorías no encontradas
 * 
 * @example
 * translateCategory('books') // 'Libros'
 * translateCategory('invalid') // 'invalid'
 * translateCategory(null) // 'Sin categoría'
 */
export const translateCategory = (category: string | null | undefined): string => {
  if (!category) return 'Sin categoría'
  return categoryTranslations[category as CategoryKey] || category
}

/**
 * Traduce una clave de condición a su texto en español con tipado
 * @param {string|null|undefined} condition - Clave de la condición a traducir
 * @returns {string} Texto traducido de la condición o fallback
 * @description Proporciona traducción segura con fallback para condiciones no encontradas
 * 
 * @example
 * translateCondition('new') // 'Nuevo'
 * translateCondition('invalid') // 'invalid'
 * translateCondition(null) // 'Sin condición'
 */
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