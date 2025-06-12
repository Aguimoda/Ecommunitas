/**
 * @file useValidation.ts
 * @description Composable para validación de formularios y campos en Ecommunitas
 * 
 * Este composable centraliza toda la lógica de validación de la aplicación,
 * proporcionando reglas de validación reutilizables, validación de formularios
 * completos, gestión de errores y estado de validación reactivo. Garantiza
 * consistencia en la validación de datos en toda la aplicación.
 * 
 * CARACTERÍSTICAS PRINCIPALES:
 * - 🛡️ Reglas de validación predefinidas y personalizables
 * - 📝 Validación de formularios completos y campos individuales
 * - ⚡ Validación asíncrona con soporte para promesas
 * - 🔄 Estado reactivo de validación en tiempo real
 * - 🎯 Gestión centralizada de errores de validación
 * - 🧹 Limpieza y reset de estados de validación
 * - 🌐 Mensajes de error localizados en español
 * - 🔧 API flexible para validaciones personalizadas
 * 
 * REGLAS DE VALIDACIÓN INCLUIDAS:
 * - required: Campo obligatorio con soporte para strings, arrays y objetos
 * - minLength/maxLength: Validación de longitud de texto
 * - email: Formato de correo electrónico válido
 * - password: Contraseña segura con requisitos específicos
 * - confirmPassword: Confirmación de contraseña
 * - numeric: Valores numéricos válidos
 * - min/max: Rangos de valores numéricos
 * - url: Formato de URL válido
 * - phone: Formato de número telefónico
 * - custom: Validaciones personalizadas
 * 
 * FUNCIONALIDADES:
 * - Validación en tiempo real de campos individuales
 * - Validación completa de formularios
 * - Gestión de estado dirty para campos modificados
 * - Limpieza selectiva y completa de errores
 * - Reset completo del estado de validación
 * - Obtención de errores para mostrar en UI
 * - Validación asíncrona para verificaciones remotas
 * - Soporte para múltiples reglas por campo
 * 
 * ESTADO REACTIVO:
 * - formValidation: Objeto con estado de validación por campo
 * - isValidating: Indicador de validación en progreso
 * - isFormValid: Estado general de validez del formulario
 * - hasErrors: Indicador de presencia de errores
 * - isDirty: Indicador de campos modificados
 * 
 * ESTRUCTURA DE VALIDACIÓN:
 * - ValidationRule: Interfaz para reglas individuales
 * - FieldValidation: Estado de validación por campo
 * - FormValidation: Colección de validaciones de formulario
 * 
 * CASOS DE USO:
 * - Formularios de registro y login
 * - Validación de perfiles de usuario
 * - Formularios de creación de artículos
 * - Validación de datos de contacto
 * - Formularios de configuración
 * - Validación de datos de pago
 * - Formularios de búsqueda avanzada
 * 
 * INTEGRACIÓN:
 * - Componentes de formulario Vue
 * - Stores de Pinia para persistencia
 * - APIs de backend para validación remota
 * - Sistemas de notificaciones
 * - Componentes de UI para mostrar errores
 * - Rutas protegidas con validación
 * 
 * TECNOLOGÍAS:
 * - Vue 3 Composition API
 * - TypeScript para tipado estático
 * - Reactive refs y computed properties
 * - Promises para validación asíncrona
 * - RegExp para validaciones de formato
 * - URL API para validación de URLs
 * 
 * @author Equipo de Desarrollo Ecommunitas
 * @version 1.0.0
 * @since 1.0.0
 * 
 * @example
 * ```typescript
 * // Uso básico en componente de formulario
 * const {
 *   rules,
 *   addField,
 *   validateField,
 *   validateForm,
 *   isFormValid,
 *   getErrors,
 *   clearAllErrors
 * } = useValidation()
 * 
 * // Configurar validación de campos
 * const setupValidation = () => {
 *   addField('email', [
 *     rules.required(),
 *     rules.email()
 *   ])
 *   
 *   addField('password', [
 *     rules.required(),
 *     rules.password()
 *   ])
 *   
 *   addField('confirmPassword', [
 *     rules.required(),
 *     rules.confirmPassword(formData.password)
 *   ])
 * }
 * 
 * // Validar campo individual
 * const handleFieldChange = async (fieldName: string, value: any) => {
 *   await validateField(fieldName, value)
 * }
 * 
 * // Validar formulario completo
 * const handleSubmit = async () => {
 *   const isValid = await validateForm(formData)
 *   if (isValid) {
 *     // Procesar formulario
 *   } else {
 *     // Mostrar errores
 *     const errors = getErrors()
 *     console.log('Errores de validación:', errors)
 *   }
 * }
 * 
 * // Limpiar errores
 * const handleClearErrors = () => {
 *   clearAllErrors()
 * }
 * 
 * // Validación personalizada
 * const customRule = rules.custom(
 *   async (value) => {
 *     // Validación asíncrona personalizada
 *     const response = await api.checkAvailability(value)
 *     return response.available
 *   },
 *   'Este valor ya está en uso'
 * )
 * ```
 */

import { ref, computed, reactive } from 'vue'

export interface ValidationRule {
  validator: (value: unknown) => boolean | Promise<boolean>
  message: string
}

export interface FieldValidation {
  rules: ValidationRule[]
  error: string | null
  isValid: boolean
  isDirty: boolean
}

export interface FormValidation {
  [fieldName: string]: FieldValidation
}

export function useValidation() {
  const formValidation = reactive<FormValidation>({})
  const isValidating = ref(false)

  // Common validation rules
  const rules = {
    /**
     * Required field validation
     */
    required: (message = 'Este campo es obligatorio'): ValidationRule => ({
      validator: (value: unknown) => {
        if (typeof value === 'string') return value.trim().length > 0
        if (Array.isArray(value)) return value.length > 0
        return value !== null && value !== undefined
      },
      message
    }),

    /**
     * Minimum length validation
     */
    minLength: (min: number, message?: string): ValidationRule => ({
      validator: (value: unknown) => !value || (typeof value === 'string' && value.length >= min),
      message: message || `Debe tener al menos ${min} caracteres`
    }),

    /**
     * Maximum length validation
     */
    maxLength: (max: number, message?: string): ValidationRule => ({
      validator: (value: unknown) => !value || (typeof value === 'string' && value.length <= max),
      message: message || `No puede exceder ${max} caracteres`
    }),

    /**
     * Email format validation
     */
    email: (message = 'Formato de email inválido'): ValidationRule => ({
      validator: (value: unknown) => {
        if (!value || typeof value !== 'string') return true
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(value)
      },
      message
    }),

    /**
     * Password strength validation
     */
    password: (message = 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número'): ValidationRule => ({
      validator: (value: unknown) => {
        if (!value || typeof value !== 'string') return true
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/
        return passwordRegex.test(value)
      },
      message
    }),

    /**
     * Confirm password validation
     */
    confirmPassword: (originalPassword: string, message = 'Las contraseñas no coinciden'): ValidationRule => ({
      validator: (value: unknown) => typeof value === 'string' && value === originalPassword,
      message
    }),

    /**
     * Numeric validation
     */
    numeric: (message = 'Debe ser un número válido'): ValidationRule => ({
      validator: (value: unknown) => {
        if (!value && value !== 0) return true
        return !isNaN(Number(value))
      },
      message
    }),

    /**
     * Minimum value validation
     */
    min: (minValue: number, message?: string): ValidationRule => ({
      validator: (value: unknown) => {
        if (!value && value !== 0) return true
        return Number(value) >= minValue
      },
      message: message || `El valor mínimo es ${minValue}`
    }),

    /**
     * Maximum value validation
     */
    max: (maxValue: number, message?: string): ValidationRule => ({
      validator: (value: unknown) => {
        if (!value && value !== 0) return true
        return Number(value) <= maxValue
      },
      message: message || `El valor máximo es ${maxValue}`
    }),

    /**
     * URL format validation
     */
    url: (message = 'Formato de URL inválido'): ValidationRule => ({
      validator: (value: unknown) => {
        if (!value || typeof value !== 'string') return true
        try {
          new URL(value)
          return true
        } catch {
          return false
        }
      },
      message
    }),

    /**
     * Phone number validation (basic format)
     */
    phone: (message = 'Formato de teléfono inválido'): ValidationRule => ({
      validator: (value: unknown) => {
        if (!value || typeof value !== 'string') return true
        const phoneRegex = /^[+]?[\d\s\-\(\)]{10,}$/
        return phoneRegex.test(value)
      },
      message
    }),

    /**
     * Custom validation rule
     */
    custom: (validator: (value: unknown) => boolean | Promise<boolean>, message: string): ValidationRule => ({
      validator,
      message
    })
  }

  /**
   * Adds validation rules for a field
   */
  const addField = (fieldName: string, validationRules: ValidationRule[]): void => {
    formValidation[fieldName] = {
      rules: validationRules,
      error: null,
      isValid: true,
      isDirty: false
    }
  }

  /**
   * Validates a single field
   */
  const validateField = async (fieldName: string, value: unknown): Promise<boolean> => {
    const field = formValidation[fieldName]
    if (!field) return true

    field.isDirty = true
    field.error = null

    for (const rule of field.rules) {
      const isValid = await rule.validator(value)
      if (!isValid) {
        field.error = rule.message
        field.isValid = false
        return false
      }
    }

    field.isValid = true
    return true
  }

  /**
   * Validates all fields in the form
   */
  const validateForm = async (formData: Record<string, any>): Promise<boolean> => {
    isValidating.value = true
    let isFormValid = true

    const validationPromises = Object.keys(formValidation).map(async (fieldName) => {
      const isFieldValid = await validateField(fieldName, formData[fieldName])
      if (!isFieldValid) {
        isFormValid = false
      }
      return isFieldValid
    })

    await Promise.all(validationPromises)
    isValidating.value = false

    return isFormValid
  }

  /**
   * Clears validation errors for a field
   */
  const clearFieldError = (fieldName: string): void => {
    const field = formValidation[fieldName]
    if (field) {
      field.error = null
      field.isValid = true
    }
  }

  /**
   * Clears all validation errors
   */
  const clearAllErrors = (): void => {
    Object.keys(formValidation).forEach(fieldName => {
      clearFieldError(fieldName)
    })
  }

  /**
   * Resets validation state for all fields
   */
  const resetValidation = (): void => {
    Object.keys(formValidation).forEach(fieldName => {
      const field = formValidation[fieldName]
      field.error = null
      field.isValid = true
      field.isDirty = false
    })
  }

  /**
   * Removes a field from validation
   */
  const removeField = (fieldName: string): void => {
    delete formValidation[fieldName]
  }

  /**
   * Gets validation errors for display
   */
  const getErrors = (): Record<string, string> => {
    const errors: Record<string, string> = {}
    Object.keys(formValidation).forEach(fieldName => {
      const field = formValidation[fieldName]
      if (field.error) {
        errors[fieldName] = field.error
      }
    })
    return errors
  }

  /**
   * Gets first validation error message
   */
  const getFirstError = (): string | null => {
    for (const fieldName of Object.keys(formValidation)) {
      const field = formValidation[fieldName]
      if (field.error) {
        return field.error
      }
    }
    return null
  }

  // Computed properties
  const isFormValid = computed(() => {
    return Object.values(formValidation).every(field => field.isValid)
  })

  const hasErrors = computed(() => {
    return Object.values(formValidation).some(field => field.error !== null)
  })

  const isDirty = computed(() => {
    return Object.values(formValidation).some(field => field.isDirty)
  })

  return {
    // State
    formValidation,
    isValidating,
    
    // Computed
    isFormValid,
    hasErrors,
    isDirty,
    
    // Rules
    rules,
    
    // Methods
    addField,
    validateField,
    validateForm,
    clearFieldError,
    clearAllErrors,
    resetValidation,
    removeField,
    getErrors,
    getFirstError
  }
}

// Export types for external use
export type UseValidation = ReturnType<typeof useValidation>