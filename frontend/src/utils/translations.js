/**
 * @fileoverview Utilidades de traducción para categorías y condiciones
 * @description Sistema centralizado de traducciones para mantener consistencia
 * en la interfaz de usuario, proporcionando traducciones para categorías de artículos,
 * condiciones de estado y funciones auxiliares para la internacionalización.
 * 
 * @features
 * - Traducciones centralizadas de categorías
 * - Traducciones de condiciones de artículos
 * - Funciones de traducción con fallbacks
 * - Validación de claves de traducción
 * - Soporte para valores nulos/indefinidos
 * - Consistencia en toda la aplicación
 * 
 * @technical
 * - JavaScript ES6+ con exports
 * - Objetos de mapeo para traducciones
 * - Funciones puras para traducción
 * - Manejo de casos edge
 * - Fallbacks para valores no encontrados
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
 * Traducciones de categorías de artículos
 * @type {Object<string, string>}
 * @description Mapeo de claves de categorías a sus traducciones en español
 */
export const categoryTranslations = {
  books: 'Libros',
  electronics: 'Electrónicos',
  clothing: 'Ropa',
  furniture: 'Muebles',
  other: 'Otros'
}

/**
 * Traducciones de condiciones de artículos
 * @type {Object<string, string>}
 * @description Mapeo de claves de condiciones a sus traducciones en español
 */
export const conditionTranslations = {
  new: 'Nuevo',
  like_new: 'Como nuevo',
  good: 'Buen estado',
  fair: 'Estado aceptable',
  poor: 'Estado regular'
}

/**
 * Traduce una clave de categoría a su texto en español
 * @param {string|null|undefined} category - Clave de la categoría a traducir
 * @returns {string} Texto traducido de la categoría o fallback
 * @description Proporciona traducción segura con fallback para categorías no encontradas
 * 
 * @example
 * translateCategory('books') // 'Libros'
 * translateCategory('invalid') // 'invalid'
 * translateCategory(null) // 'Sin categoría'
 */
export const translateCategory = (category) => {
  if (!category) return 'Sin categoría'
  return categoryTranslations[category] || category
}

/**
 * Traduce una clave de condición a su texto en español
 * @param {string|null|undefined} condition - Clave de la condición a traducir
 * @returns {string} Texto traducido de la condición o fallback
 * @description Proporciona traducción segura con fallback para condiciones no encontradas
 * 
 * @example
 * translateCondition('new') // 'Nuevo'
 * translateCondition('invalid') // 'invalid'
 * translateCondition(null) // 'Sin condición'
 */
export const translateCondition = (condition) => {
  if (!condition) return 'Sin condición'
  return conditionTranslations[condition] || condition
}

// Función para obtener todas las categorías traducidas
export const getCategoriesOptions = () => {
  return Object.entries(categoryTranslations).map(([value, label]) => ({
    value,
    label
  }))
}

// Función para obtener todas las condiciones traducidas
export const getConditionsOptions = () => {
  return Object.entries(conditionTranslations).map(([value, label]) => ({
    value,
    label
  }))
}

// Función para obtener el color de badge según la condición
export const getConditionBadgeClass = (condition) => {
  const classes = {
    new: 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100',
    like_new: 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100',
    good: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100',
    fair: 'bg-orange-100 text-orange-800 dark:bg-orange-700 dark:text-orange-100',
    poor: 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100'
  }
  return classes[condition] || 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-100'
}

// Función para obtener el color de badge según la categoría
export const getCategoryBadgeClass = (category) => {
  const classes = {
    books: 'bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-100',
    electronics: 'bg-purple-100 text-purple-800 dark:bg-purple-700 dark:text-purple-100',
    clothing: 'bg-pink-100 text-pink-800 dark:bg-pink-700 dark:text-pink-100',
    furniture: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-700 dark:text-indigo-100',
    other: 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-100'
  }
  return classes[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-100'
}