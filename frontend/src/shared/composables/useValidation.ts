/**
 * Shared Validation Composable
 * Provides reusable validation rules and form validation utilities
 * Centralizes validation logic for consistent behavior across the application
 */

import { ref, computed, reactive } from 'vue'

export interface ValidationRule {
  validator: (value: any) => boolean | Promise<boolean>
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
      validator: (value: any) => {
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
      validator: (value: string) => !value || value.length >= min,
      message: message || `Debe tener al menos ${min} caracteres`
    }),

    /**
     * Maximum length validation
     */
    maxLength: (max: number, message?: string): ValidationRule => ({
      validator: (value: string) => !value || value.length <= max,
      message: message || `No puede exceder ${max} caracteres`
    }),

    /**
     * Email format validation
     */
    email: (message = 'Formato de email inválido'): ValidationRule => ({
      validator: (value: string) => {
        if (!value) return true
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(value)
      },
      message
    }),

    /**
     * Password strength validation
     */
    password: (message = 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número'): ValidationRule => ({
      validator: (value: string) => {
        if (!value) return true
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/
        return passwordRegex.test(value)
      },
      message
    }),

    /**
     * Confirm password validation
     */
    confirmPassword: (originalPassword: string, message = 'Las contraseñas no coinciden'): ValidationRule => ({
      validator: (value: string) => value === originalPassword,
      message
    }),

    /**
     * Numeric validation
     */
    numeric: (message = 'Debe ser un número válido'): ValidationRule => ({
      validator: (value: any) => {
        if (!value && value !== 0) return true
        return !isNaN(Number(value))
      },
      message
    }),

    /**
     * Minimum value validation
     */
    min: (minValue: number, message?: string): ValidationRule => ({
      validator: (value: any) => {
        if (!value && value !== 0) return true
        return Number(value) >= minValue
      },
      message: message || `El valor mínimo es ${minValue}`
    }),

    /**
     * Maximum value validation
     */
    max: (maxValue: number, message?: string): ValidationRule => ({
      validator: (value: any) => {
        if (!value && value !== 0) return true
        return Number(value) <= maxValue
      },
      message: message || `El valor máximo es ${maxValue}`
    }),

    /**
     * URL format validation
     */
    url: (message = 'Formato de URL inválido'): ValidationRule => ({
      validator: (value: string) => {
        if (!value) return true
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
      validator: (value: string) => {
        if (!value) return true
        const phoneRegex = /^[+]?[\d\s\-\(\)]{10,}$/
        return phoneRegex.test(value)
      },
      message
    }),

    /**
     * Custom validation rule
     */
    custom: (validator: (value: any) => boolean | Promise<boolean>, message: string): ValidationRule => ({
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
  const validateField = async (fieldName: string, value: any): Promise<boolean> => {
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