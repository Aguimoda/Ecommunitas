import { ref, computed, type Ref, type ComputedRef } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/features/auth'

// Types
/**
 * Interfaz de retorno del composable useLogin
 * @interface UseLoginReturn
 */
interface UseLoginReturn {
  // Form states
  /** Email del usuario */
  email: Ref<string>;
  /** Contraseña del usuario */
  password: Ref<string>;
  /** Mensaje de error general */
  error: Ref<string>;
  /** Mensaje de error específico del email */
  emailError: Ref<string>;
  /** Mensaje de error específico de la contraseña */
  passwordError: Ref<string>;
  /** Estado de carga del formulario */
  isLoading: Ref<boolean>;
  /** Visibilidad de la contraseña */
  showPassword: Ref<boolean>;
  
  // Computed properties
  /** Indica si el formulario es válido */
  isFormValid: ComputedRef<boolean>;
  
  // Methods
  /** Valida el formato del email */
  validateEmail: () => boolean;
  /** Valida la contraseña */
  validatePassword: () => boolean;
  /** Valida todo el formulario */
  validateForm: () => boolean;
  /** Maneja el envío del formulario */
  handleSubmit: () => Promise<void>;
  /** Alterna la visibilidad de la contraseña */
  togglePasswordVisibility: () => void;
  /** Limpia todos los errores */
  clearErrors: () => void;
  /** Resetea el formulario */
  resetForm: () => void;
}

/**
 * Composable para manejar la funcionalidad de inicio de sesión
 * Incluye validación de formulario, manejo de estado y autenticación
 * Proporciona estado reactivo y métodos para el proceso de login
 * 
 * @returns {UseLoginReturn} Objeto con estado reactivo y métodos para el login
 * 
 * @example
 * ```typescript
 * const {
 *   email, password, error,
 *   isFormValid, handleSubmit, togglePasswordVisibility
 * } = useLogin()
 * 
 * // Configurar credenciales
 * email.value = 'usuario@ejemplo.com'
 * password.value = 'miContraseña'
 * 
 * // Enviar formulario
 * await handleSubmit()
 * ```
 */
export function useLogin(): UseLoginReturn {
  const router = useRouter()
  const route = useRoute()
  const { login, error: authError } = useAuth()

  // Estados reactivos del formulario
  const email = ref<string>('')
  const password = ref<string>('')
  const error = ref<string>('')
  const emailError = ref<string>('')
  const passwordError = ref<string>('')
  const isLoading = ref<boolean>(false)
  const showPassword = ref<boolean>(false)

  // Computed properties
  const isFormValid = computed<boolean>(() => {
    return email.value.trim() !== '' && password.value.trim() !== '' && 
           emailError.value === '' && passwordError.value === ''
  })

  /**
   * Valida el formato del email
   * Verifica que el email no esté vacío y tenga un formato válido
   * Actualiza el mensaje de error específico del email
   * 
   * @returns {boolean} true si el email es válido, false en caso contrario
   */
  const validateEmail = (): boolean => {
    emailError.value = ''
    
    if (!email.value) {
      emailError.value = 'El email es requerido'
      return false
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.value)) {
      emailError.value = 'Por favor, introduce un email válido'
      return false
    }
    
    return true
  }

  /**
   * Valida la contraseña
   * Verifica que la contraseña no esté vacía
   * Actualiza el mensaje de error específico de la contraseña
   * 
   * @returns {boolean} true si la contraseña es válida, false en caso contrario
   */
  const validatePassword = (): boolean => {
    passwordError.value = ''
    
    if (!password.value) {
      passwordError.value = 'La contraseña es requerida'
      return false
    }
    
    if (password.value.length < 6) {
      passwordError.value = 'La contraseña debe tener al menos 6 caracteres'
      return false
    }
    
    return true
  }

  /**
   * Valida todo el formulario
   * Ejecuta las validaciones de email y contraseña
   * 
   * @returns {boolean} true si el formulario es válido, false en caso contrario
   */
  const validateForm = (): boolean => {
    const isEmailValid = validateEmail()
    const isPasswordValid = validatePassword()
    return isEmailValid && isPasswordValid
  }

  /**
   * Limpia todos los errores del formulario
   * Resetea todos los mensajes de error a cadenas vacías
   * 
   * @returns {void}
   */
  const clearErrors = (): void => {
    error.value = ''
    emailError.value = ''
    passwordError.value = ''
  }

  /**
   * Resetea el formulario a su estado inicial
   * Limpia todos los campos y errores, y oculta la contraseña
   * 
   * @returns {void}
   */
  const resetForm = (): void => {
    email.value = ''
    password.value = ''
    showPassword.value = false
    clearErrors()
  }

  /**
   * Maneja el envío del formulario de inicio de sesión
   * Valida el formulario, realiza la autenticación y redirige al usuario
   * Maneja errores y estados de carga apropiadamente
   * 
   * @returns {Promise<void>}
   */
  const handleSubmit = async (): Promise<void> => {
    // Validar formulario antes de enviar
    if (!validateForm()) {
      return
    }
    
    isLoading.value = true
    error.value = ''
    
    try {
      const success = await login({
        email: email.value,
        password: password.value
      })
      
      if (success) {
        // Si hay una redirección pendiente, ir a esa página
        const redirectPath = (Array.isArray(route.query.redirect) ? route.query.redirect[0] : route.query.redirect) || '/'
        router.push(redirectPath)
      } else {
        // El error se maneja automáticamente en el composable
        error.value = authError.value || 'Error al iniciar sesión'
      }
    } catch (err) {
      // Manejo de errores adicionales (por si acaso)
      console.error('Error inesperado de autenticación:', err)
      error.value = 'Error inesperado al iniciar sesión. Por favor, intenta nuevamente.'
    } finally {
      isLoading.value = false
    }
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

  return {
    // Estados reactivos
    email,
    password,
    error,
    emailError,
    passwordError,
    isLoading,
    showPassword,
    
    // Computed properties
    isFormValid,
    
    // Funciones de validación
    validateEmail,
    validatePassword,
    validateForm,
    
    // Funciones de utilidad
    clearErrors,
    resetForm,
    togglePasswordVisibility,
    
    // Función principal
    handleSubmit
  }
}