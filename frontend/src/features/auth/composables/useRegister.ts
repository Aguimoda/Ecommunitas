import { ref, computed, type Ref, type ComputedRef } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/features/auth'
import { useNotifications } from '@/shared/composables/useNotifications'

// Types
/**
 * Interfaz de retorno del composable useRegister
 * @interface UseRegisterReturn
 */
interface UseRegisterReturn {
  // Form states
  /** Nombre del usuario */
  name: Ref<string>;
  /** Email del usuario */
  email: Ref<string>;
  /** Contraseña del usuario */
  password: Ref<string>;
  /** Confirmación de contraseña */
  confirmPassword: Ref<string>;
  /** Mensaje de error general */
  error: Ref<string>;
  /** Mensaje de error específico del nombre */
  nameError: Ref<string>;
  /** Mensaje de error específico del email */
  emailError: Ref<string>;
  /** Mensaje de error específico de la contraseña */
  passwordError: Ref<string>;
  /** Mensaje de error específico de la confirmación de contraseña */
  confirmPasswordError: Ref<string>;
  /** Estado de carga del formulario */
  isLoading: Ref<boolean>;
  /** Visibilidad de la contraseña */
  showPassword: Ref<boolean>;
  /** Visibilidad de la confirmación de contraseña */
  showConfirmPassword: Ref<boolean>;
  
  // Computed properties
  /** Indica si el formulario es válido */
  isFormValid: ComputedRef<boolean>;
  
  // Methods
  /** Valida el nombre del usuario */
  validateName: () => boolean;
  /** Valida el formato del email */
  validateEmail: () => boolean;
  /** Valida la contraseña */
  validatePassword: () => boolean;
  /** Valida la confirmación de contraseña */
  validateConfirmPassword: () => boolean;
  /** Valida todo el formulario */
  validateForm: () => boolean;
  /** Maneja el envío del formulario */
  handleSubmit: () => Promise<void>;
  /** Alterna la visibilidad de la contraseña */
  togglePasswordVisibility: () => void;
  /** Alterna la visibilidad de la confirmación de contraseña */
  toggleConfirmPasswordVisibility: () => void;
  /** Limpia todos los errores */
  clearErrors: () => void;
  /** Resetea el formulario */
  resetForm: () => void;
}

/**
 * Composable para manejar la funcionalidad de registro
 * Incluye validación completa de formulario, manejo de estado y autenticación
 * Proporciona estado reactivo y métodos para el proceso de registro de usuarios
 * 
 * @returns {UseRegisterReturn} Objeto con estado reactivo y métodos para el registro
 * 
 * @example
 * ```typescript
 * const {
 *   name, email, password, confirmPassword,
 *   isFormValid, handleSubmit, togglePasswordVisibility
 * } = useRegister()
 * 
 * // Configurar datos del usuario
 * name.value = 'Juan Pérez'
 * email.value = 'juan@ejemplo.com'
 * password.value = 'miContraseña123'
 * confirmPassword.value = 'miContraseña123'
 * 
 * // Enviar formulario
 * await handleSubmit()
 * ```
 */
export function useRegister(): UseRegisterReturn {
  const router = useRouter()
  const { register, error: authError } = useAuth()
  const { notifySuccess } = useNotifications()

  // Estados reactivos del formulario
  const name = ref<string>('')
  const email = ref<string>('')
  const password = ref<string>('')
  const confirmPassword = ref<string>('')
  const error = ref<string>('')
  const nameError = ref<string>('')
  const emailError = ref<string>('')
  const passwordError = ref<string>('')
  const confirmPasswordError = ref<string>('')
  const isLoading = ref<boolean>(false)
  const showPassword = ref<boolean>(false)
  const showConfirmPassword = ref<boolean>(false)

  // Computed properties
  const isFormValid = computed<boolean>(() => {
    return name.value.trim() !== '' && email.value.trim() !== '' && 
           password.value !== '' && confirmPassword.value !== '' &&
           nameError.value === '' && emailError.value === '' && 
           passwordError.value === '' && confirmPasswordError.value === ''
  })

  /**
   * Valida el nombre del usuario
   * Verifica que el nombre no esté vacío y tenga una longitud apropiada (2-50 caracteres)
   * Actualiza el mensaje de error específico del nombre
   * 
   * @returns {boolean} true si el nombre es válido, false en caso contrario
   */
  const validateName = (): boolean => {
    nameError.value = ''
    
    if (!name.value.trim()) {
      nameError.value = 'El nombre es requerido.'
      return false
    }
    
    if (name.value.trim().length < 2) {
      nameError.value = 'El nombre debe tener al menos 2 caracteres.'
      return false
    }
    
    if (name.value.trim().length > 50) {
      nameError.value = 'El nombre no puede tener más de 50 caracteres.'
      return false
    }
    
    return true
  }

  /**
   * Valida el formato del email
   * Verifica que el email no esté vacío y tenga un formato válido
   * Actualiza el mensaje de error específico del email
   * 
   * @returns {boolean} true si el email es válido, false en caso contrario
   */
  const validateEmail = (): boolean => {
    emailError.value = ''
    
    if (!email.value.trim()) {
      emailError.value = 'El email es requerido.'
      return false
    }
    
    // Regex mejorada para emails
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g
    if (!emailRegex.test(email.value.trim())) {
      emailError.value = 'Por favor, introduce un formato de email válido (ej: correo@dominio.com).'
      return false
    }
    
    return true
  }

  /**
   * Valida la contraseña con criterios de seguridad
   * Verifica que la contraseña cumpla con los requisitos de seguridad:
   * - Al menos 8 caracteres
   * - Al menos una letra mayúscula
   * - Al menos un número
   * - Al menos un carácter especial
   * 
   * @returns {boolean} true si la contraseña es válida, false en caso contrario
   */
  /**
   * Valida la contraseña según los criterios establecidos
   * Verifica longitud mínima, mayúsculas, números y caracteres especiales
   * 
   * @returns {boolean} true si la contraseña es válida, false en caso contrario
   */
  const validatePassword = (): boolean => {
    passwordError.value = ''
    
    if (!password.value) {
      passwordError.value = 'La contraseña es requerida.'
      return false
    }
    
    if (password.value.length < 8) {
      passwordError.value = 'La contraseña debe tener al menos 8 caracteres.'
      return false
    }
    
    if (!/[A-Z]/.test(password.value)) {
      passwordError.value = 'La contraseña debe contener al menos una letra mayúscula.'
      return false
    }
    
    if (!/[0-9]/.test(password.value)) {
      passwordError.value = 'La contraseña debe contener al menos un número.'
      return false
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password.value)) {
      passwordError.value = 'La contraseña debe contener al menos un carácter especial (ej: !@#$%^&*).'
      return false
    }
    
    return true
  }

  /**
   * Valida que la confirmación de contraseña coincida con la contraseña
   * Solo valida si la contraseña principal es válida y no está vacía
   * 
   * @returns {boolean} true si la confirmación es válida o no debe validarse aún, false si hay error
   */
  const validateConfirmPassword = (): boolean => {
    confirmPasswordError.value = ''
    
    // Si la contraseña principal está vacía, no validar confirmación aún
    if (!password.value) {
      return true
    }
    
    // Si la contraseña principal tiene errores, no validar confirmación aún
    if (passwordError.value) {
      return true
    }

    if (!confirmPassword.value) {
      confirmPasswordError.value = 'Por favor, confirma tu contraseña.'
      return false
    }
    
    if (password.value !== confirmPassword.value) {
      confirmPasswordError.value = 'Las contraseñas no coinciden.'
      return false
    }
    
    return true
  }

  /**
   * Valida todo el formulario
   * Ejecuta todas las validaciones individuales en el orden correcto
   * Solo valida la confirmación de contraseña si la contraseña principal es válida
   * 
   * @returns {boolean} true si el formulario es válido, false en caso contrario
   */
  const validateForm = (): boolean => {
    const isNameValid = validateName()
    const isEmailValid = validateEmail()
    const isPasswordValid = validatePassword()
    const isConfirmPasswordValid = validateConfirmPassword()
    
    return isNameValid && isEmailValid && isPasswordValid && isConfirmPasswordValid
  }

  /**
   * Fuerza la validación de campos vacíos al enviar
   * Ejecuta validaciones específicas para campos que están vacíos
   * Útil para mostrar errores cuando el usuario intenta enviar sin completar campos
   * 
   * @returns {void}
   */
  const forceValidationOnSubmit = (): void => {
    if (!name.value.trim()) validateName()
    if (!email.value.trim()) validateEmail()
    if (!password.value) validatePassword()
    if (password.value && !confirmPassword.value) validateConfirmPassword()
  }

  /**
   * Limpia todos los errores del formulario
   * Resetea todos los mensajes de error a cadenas vacías
   * 
   * @returns {void}
   */
  const clearErrors = (): void => {
    error.value = ''
    nameError.value = ''
    emailError.value = ''
    passwordError.value = ''
    confirmPasswordError.value = ''
  }

  /**
   * Resetea el formulario a su estado inicial
   * Limpia todos los campos, oculta las contraseñas y elimina errores
   * 
   * @returns {void}
   */
  const resetForm = (): void => {
    name.value = ''
    email.value = ''
    password.value = ''
    confirmPassword.value = ''
    showPassword.value = false
    showConfirmPassword.value = false
    clearErrors()
  }

  /**
   * Alterna la visibilidad de la contraseña
   * Cambia entre mostrar y ocultar la contraseña en el campo de entrada
   * 
   * @returns {void}
   */
  const togglePasswordVisibility = (): void => {
    showPassword.value = !showPassword.value
  }

  /**
   * Alterna la visibilidad de la confirmación de contraseña
   * Cambia entre mostrar y ocultar la confirmación de contraseña en el campo de entrada
   * 
   * @returns {void}
   */
  const toggleConfirmPasswordVisibility = (): void => {
    showConfirmPassword.value = !showConfirmPassword.value
  }

  /**
   * Maneja el envío del formulario de registro
   * Valida el formulario, ejecuta el registro y maneja la respuesta
   * 
   * @returns {Promise<void>}
   */
  const handleSubmit = async (): Promise<void> => {
    console.log('🚀 [DEBUG] Iniciando proceso de registro...')
    console.log('📝 [DEBUG] Datos del formulario:', {
      name: name.value,
      email: email.value,
      password: '***',
      confirmPassword: '***'
    })
    
    // Forzar validación de campos vacíos
    forceValidationOnSubmit()
    
    // Validar formulario
    if (!validateForm()) {
      console.log('❌ [DEBUG] Validación del formulario falló')
      return
    }
    
    console.log('✅ [DEBUG] Validación del formulario exitosa')
    
    try {
      isLoading.value = true
      error.value = ''
      
      console.log('📡 [DEBUG] Enviando petición de registro al store...')
      const success = await register({
        name: name.value,
        email: email.value,
        password: password.value,
        confirmPassword: confirmPassword.value
      })
      
      console.log('📥 [DEBUG] Respuesta del registro recibida:', {
        success: success,
        type: typeof success
      })
      
      if (success) {
        console.log('✅ [DEBUG] Registro exitoso, limpiando formulario...')
        // Limpiar formulario
        resetForm()
        
        // Mostrar mensaje de éxito
        notifySuccess('¡Registro exitoso! Bienvenido a Ecommunitas.')
        
        console.log('🔄 [DEBUG] Registro completado, useAuth manejará la redirección...')
        // No necesitamos redirigir aquí, useAuth ya lo hace
      } else {
        console.log('❌ [DEBUG] Registro falló - respuesta no exitosa')
        error.value = 'Error en el registro. Por favor, verifica tus datos e intenta nuevamente.'
      }
      
    } catch (err: any) {
      console.error('💥 [DEBUG] Error capturado en handleSubmit:', err)
      console.error('💥 [DEBUG] Error stack:', err.stack)
      console.error('💥 [DEBUG] Error message:', err.message)
      error.value = err.message || 'Error al registrar usuario'
    } finally {
      console.log('🏁 [DEBUG] Finalizando proceso de registro')
      isLoading.value = false
    }
  }

  return {
    // Estados reactivos
    name,
    email,
    password,
    confirmPassword,
    error,
    nameError,
    emailError,
    passwordError,
    confirmPasswordError,
    isLoading,
    showPassword,
    showConfirmPassword,
    
    // Computed properties
    isFormValid,
    
    // Funciones de validación
    validateName,
    validateEmail,
    validatePassword,
    validateConfirmPassword,
    validateForm,
    
    // Funciones de utilidad
    clearErrors,
    resetForm,
    togglePasswordVisibility,
    toggleConfirmPasswordVisibility,
    
    // Función principal
    handleSubmit
  }
}