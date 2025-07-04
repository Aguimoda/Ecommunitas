/**
 * @file validators.ts
 * @description Validadores de formularios y esquemas de datos usando Zod para Ecommunitas
 * @module Utils/Validators
 * @version 1.0.0
 * @author Ecommunitas Team
 * @created 2024
 * 
 * Este módulo proporciona:
 * - Esquemas de validación con Zod para formularios
 * - Validadores específicos para items/artículos
 * - Funciones de validación con manejo de errores
 * - Expresiones regulares para formatos específicos
 * - Integración con sistema de notificaciones de errores
 */

import { z } from 'zod'
import { displayError } from '@/shared/utils/errorHandler'

// const toast = useToast()

/**
 * Expresión regular para validar formato de ubicaciones
 * @constant {RegExp} LOCATION_REGEX
 * @description
 * Valida que la ubicación tenga el formato "Ciudad, País"
 * Acepta caracteres alfanuméricos, espacios, acentos y guiones
 * 
 * @example
 * ```typescript
 * LOCATION_REGEX.test("Madrid, España") // true
 * LOCATION_REGEX.test("New York, USA") // true
 * LOCATION_REGEX.test("Ciudad inválida") // false
 * ```
 */
const LOCATION_REGEX = /^[\w\sáéíóúÁÉÍÓÚñÑ-]+,\s*[\w\sáéíóúÁÉÍÓÚñÑ-]+$/

/**
 * Esquema de validación para formularios de items/artículos
 * @constant {z.ZodObject} itemSchema
 * @description
 * Define las reglas de validación para:
 * - title: Título del artículo (3-100 caracteres)
 * - description: Descripción del artículo (10-500 caracteres)
 * - category: Categoría seleccionada (requerida)
 * - condition: Condición del artículo (requerida)
 * - location: Ubicación en formato "Ciudad, País"
 */
export const itemSchema = z.object({
  title: z.string()
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(100, 'El título no puede exceder los 100 caracteres')
    .trim(),
    
  description: z.string()
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .max(500, 'La descripción no puede exceder los 500 caracteres')
    .trim(),
    
  category: z.string()
    .nonempty('Debes seleccionar una categoría'),
    
  condition: z.string()
    .nonempty('Debes seleccionar una condición'),
    
  location: z.string()
    .regex(LOCATION_REGEX, 'Formato de ubicación inválido. Ejemplo: Ciudad, País')
    .trim()
})

/**
 * Valida los datos de un formulario de artículo usando el esquema definido
 * @param {unknown} formData - Datos del formulario a validar
 * @returns {object} Datos validados y tipados
 * @throws {z.ZodError} Error de validación con detalles específicos
 * @description Muestra automáticamente el primer error encontrado al usuario
 */
export function validateItemForm(formData: unknown) {
  try {
    return itemSchema.parse(formData)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0]
      displayError(firstError.message)
    }
    throw error
  }
}

/**
 * Crea un validador en tiempo real para cualquier esquema Zod
 * @template T - Tipo del esquema Zod
 * @param {T} schema - Esquema de validación Zod
 * @returns {Function} Función validadora que retorna estado y mensaje
 * @description Útil para validación en tiempo real en formularios
 */
export function createLiveValidator<T extends z.ZodTypeAny>(schema: T) {
  return (value: unknown) => {
    try {
      schema.parse(value)
      return { valid: true, message: '' }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { valid: false, message: error.errors[0].message }
      }
      return { valid: false, message: 'Error de validación' }
    }
  }
}

// Validadores individuales para uso en tiempo real

/** Validador en tiempo real para el título del artículo */
export const titleValidator = createLiveValidator(itemSchema.shape.title)

/** Validador en tiempo real para la descripción del artículo */
export const descriptionValidator = createLiveValidator(itemSchema.shape.description)

/** Validador en tiempo real para la ubicación del artículo */
export const locationValidator = createLiveValidator(itemSchema.shape.location)