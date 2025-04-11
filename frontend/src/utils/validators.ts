import { z } from 'zod'
import { useToast } from 'vue-toastification'

const toast = useToast()

// Expresión regular para validar ubicaciones (ciudad, país)
const LOCATION_REGEX = /^[\w\sáéíóúÁÉÍÓÚñÑ-]+,\s*[\w\sáéíóúÁÉÍÓÚñÑ-]+$/

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

export function validateItemForm(formData: unknown) {
  try {
    return itemSchema.parse(formData)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0]
      toast.error(firstError.message)
    }
    throw error
  }
}

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

export const titleValidator = createLiveValidator(itemSchema.shape.title)
export const descriptionValidator = createLiveValidator(itemSchema.shape.description)
export const locationValidator = createLiveValidator(itemSchema.shape.location)