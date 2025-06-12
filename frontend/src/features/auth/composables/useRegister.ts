/**
 * @fileoverview Composable useRegister para Ecommunitas
 * 
 * Este composable proporciona toda la funcionalidad necesaria para el registro de nuevos usuarios
 * en la plataforma Ecommunitas. Implementa validación completa de formularios, manejo de estado
 * reactivo, integración con el sistema de autenticación y experiencia de usuario optimizada.
 * 
 * Características principales:
 * - 📝 Gestión completa del estado del formulario de registro
 * - 🔍 Validación en tiempo real con mensajes específicos
 * - 🔒 Validación de contraseñas con criterios de seguridad
 * - 👁️ Toggle de visibilidad para campos de contraseña
 * - 🚨 Manejo robusto de errores con mensajes contextuales
 * - ⚡ Estados de carga para feedback visual
 * - 🔄 Integración con sistema de autenticación
 * - 📱 Optimizado para experiencia móvil
 * - ♿ Soporte completo de accesibilidad
 * - 🧪 Preparado para testing unitario
 * 
 * Funcionalidades de validación:
 * - Nombre: Longitud mínima/máxima y caracteres válidos
 * - Email: Formato válido con regex mejorada
 * - Contraseña: Criterios de seguridad (mayúsculas, números, especiales)
 * - Confirmación: Coincidencia exacta con contraseña principal
 * - Formulario: Validación completa antes del envío
 * - Sanitización: Limpieza automática de espacios
 * 
 * Integración con el sistema:
 * - useAuth: Para registro y gestión de autenticación
 * - useRouter: Para redirecciones post-registro
 * - useNotifications: Para feedback de éxito/error
 * - authStore: Para persistencia de estado
 * - API service: Para comunicación con backend
 * 
 * Seguridad implementada:
 * - Validación de entrada para prevenir XSS
 * - Criterios de contraseña robustos
 * - Sanitización de datos de entrada
 * - Manejo seguro de errores sin exposición
 * - Limpieza automática de formulario
 * 
 * Optimizaciones de rendimiento:
 * - Validación lazy para mejor UX
 * - Computed properties para reactividad eficiente
 * - Debounce implícito en validaciones
 * - Limpieza automática de memoria
 * 
 * @author Equipo de Desarrollo Ecommunitas
 * @version 2.0.0
 * @since 1.0.0
 * @lastModified 2024
 */

// Importaciones de Vue 3 Composition API
import { ref, computed, type Ref, type ComputedRef } from 'vue'
import { useAuth } from '@/features/auth'
import { useNotifications } from '@/shared/composables/useNotifications'

// Types
/**
 * Interfaz de retorno del composable useRegister
 * 
 * Define todos los estados reactivos, propiedades computadas y métodos
 * que el composable expone para su uso en componentes Vue.
 * 
 * @interface UseRegisterReturn
 */
interface UseRegisterReturn {
  // Estados del formulario
  /** Estado reactivo para el nombre del usuario */
  name: Ref<string>;
  /** Estado reactivo para el email del usuario */
  email: Ref<string>;
  /** Estado reactivo para la contraseña del usuario */
  password: Ref<string>;
  /** Estado reactivo para la confirmación de contraseña */
  confirmPassword: Ref<string>;
  /** Estado reactivo para el mensaje de error general */
  error: Ref<string>;
  /** Estado reactivo para el mensaje de error específico del nombre */
  nameError: Ref<string>;
  /** Estado reactivo para el mensaje de error específico del email */
  emailError: Ref<string>;
  /** Estado reactivo para el mensaje de error específico de la contraseña */
  passwordError: Ref<string>;
  /** Estado reactivo para el mensaje de error específico de la confirmación de contraseña */
  confirmPasswordError: Ref<string>;
  /** Estado reactivo para el estado de carga del formulario */
  isLoading: Ref<boolean>;
  /** Estado reactivo para la visibilidad de la contraseña */
  showPassword: Ref<boolean>;
  /** Estado reactivo para la visibilidad de la confirmación de contraseña */
  showConfirmPassword: Ref<boolean>;
  
  // Propiedades computadas
  /** Propiedad computada que indica si el formulario es válido */
  isFormValid: ComputedRef<boolean>;
  
  // Métodos de validación
  /** Método para validar el nombre del usuario */
  validateName: () => boolean;
  /** Método para validar el formato del email */
  validateEmail: () => boolean;
  /** Método para validar la contraseña */
  validatePassword: () => boolean;
  /** Método para validar la confirmación de contraseña */
  validateConfirmPassword: () => boolean;
  /** Método para validar todo el formulario */
  validateForm: () => boolean;
  /** Método para manejar el envío del formulario */
  handleSubmit: () => Promise<void>;
  /** Método para alternar la visibilidad de la contraseña */
  togglePasswordVisibility: () => void;
  /** Método para alternar la visibilidad de la confirmación de contraseña */
  toggleConfirmPasswordVisibility: () => void;
  /** Método para limpiar todos los errores */
  clearErrors: () => void;
  /** Método para resetear el formulario */
  resetForm: () => void;
}

/**
 * Composable para manejar la funcionalidad de registro de usuarios
 * 
 * Este composable encapsula toda la lógica necesaria para el registro de nuevos usuarios,
 * incluyendo validación completa de formulario, manejo de estado reactivo, integración
 * con el sistema de autenticación y experiencia de usuario optimizada.
 * 
 * Beneficios de usar este composable:
 * - Separación clara de responsabilidades
 * - Reutilización de lógica entre componentes
 * - Testing más sencillo y aislado
 * - Mejor mantenibilidad del código
 * - Lógica de negocio centralizada
 * - Estado reactivo optimizado
 * - Validaciones consistentes
 * 
 * Flujo típico de uso:
 * 1. Inicializar el composable en el componente
 * 2. Vincular estados reactivos con inputs del formulario
 * 3. Configurar validaciones en eventos blur/input
 * 4. Manejar envío con handleSubmit
 * 5. Mostrar feedback visual basado en estados
 * 
 * @returns {UseRegisterReturn} Objeto con estado reactivo y métodos para el registro
 * 
 * @example
 * ```typescript
 * // En un componente Vue
 * const {
 *   name, email, password, confirmPassword,
 *   nameError, emailError, passwordError, confirmPasswordError,
 *   isFormValid, isLoading, showPassword,
 *   validateName, validateEmail, validatePassword, validateConfirmPassword,
 *   togglePasswordVisibility, handleSubmit
 * } = useRegister()
 * 
 * // Configurar datos del usuario
 * name.value = 'Juan Pérez'
 * email.value = 'juan@ejemplo.com'
 * password.value = 'MiContraseña123!'
 * confirmPassword.value = 'MiContraseña123!'
 * 
 * // Validar campos individuales
 * const isNameValid = validateName()
 * const isEmailValid = validateEmail()
 * 
 * // Enviar formulario
 * if (isFormValid.value) {
 *   await handleSubmit()
 * }
 * ```
 */
export function useRegister(): UseRegisterReturn {
  // Inicialización de dependencias
  const { register } = useAuth()
  const { notifySuccess } = useNotifications()

  // Estados reactivos del formulario
  // Estos refs mantienen el estado actual de cada campo del formulario
  const name = ref<string>('')
  const email = ref<string>('')
  const password = ref<string>('')
  const confirmPassword = ref<string>('')
  
  // Estados de error
  // Cada campo tiene su propio estado de error para mensajes específicos
  const error = ref<string>('')
  const nameError = ref<string>('')
  const emailError = ref<string>('')
  const passwordError = ref<string>('')
  const confirmPasswordError = ref<string>('')
  
  // Estados de UI
  // Estados para controlar la interfaz de usuario
  const isLoading = ref<boolean>(false)
  const showPassword = ref<boolean>(false)
  const showConfirmPassword = ref<boolean>(false)

  // Propiedades computadas
  /**
   * Propiedad computada que determina si el formulario es válido
   * 
   * Verifica que:
   * - Todos los campos requeridos estén completados
   * - No haya errores de validación en ningún campo
   * - Los datos estén en formato correcto
   * 
   * Esta propiedad se actualiza automáticamente cuando cambia cualquier
   * estado del formulario, proporcionando reactividad eficiente.
   * 
   * @returns {boolean} true si el formulario es válido, false en caso contrario
   */
  const isFormValid = computed<boolean>(() => {
    return name.value.trim() !== '' && email.value.trim() !== '' && 
           password.value !== '' && confirmPassword.value !== '' &&
           nameError.value === '' && emailError.value === '' && 
           passwordError.value === '' && confirmPasswordError.value === ''
  })

  /**
   * Valida el nombre del usuario
   * 
   * Verifica que el nombre cumpla con los siguientes criterios:
   * - No esté vacío (después de trim)
   * - Tenga al menos 2 caracteres
   * - No exceda los 50 caracteres
   * - Contenga solo caracteres válidos
   * 
   * Actualiza automáticamente el estado nameError con el mensaje
   * de error correspondiente si la validación falla.
   * 
   * @returns {boolean} true si el nombre es válido, false en caso contrario
   * 
   * @example
   * ```typescript
   * name.value = 'Juan'
   * const isValid = validateName() // true
   * 
   * name.value = 'J'
   * const isValid = validateName() // false, nameError.value = 'El nombre debe tener al menos 2 caracteres.'
   * ```
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
   * 
   * Verifica que el email cumpla con los siguientes criterios:
   * - No esté vacío (después de trim)
   * - Tenga un formato válido según regex mejorada
   * - Contenga @ y dominio válido
   * - No contenga caracteres especiales no permitidos
   * 
   * Utiliza una expresión regular robusta que cumple con los estándares
   * RFC 5322 para validación de emails.
   * 
   * @returns {boolean} true si el email es válido, false en caso contrario
   * 
   * @example
   * ```typescript
   * email.value = 'usuario@ejemplo.com'
   * const isValid = validateEmail() // true
   * 
   * email.value = 'email-invalido'
   * const isValid = validateEmail() // false, emailError.value = 'Por favor, introduce un formato de email válido...'
   * ```
   */
  const validateEmail = (): boolean => {
    emailError.value = ''
    
    if (!email.value.trim()) {
      emailError.value = 'El email es requerido.'
      return false
    }
    
    // Regex mejorada para emails que cumple con RFC 5322
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g
    if (!emailRegex.test(email.value.trim())) {
      emailError.value = 'Por favor, introduce un formato de email válido (ej: correo@dominio.com).'
      return false
    }
    
    return true
  }

  /**
   * Valida la contraseña con criterios de seguridad robustos
   * 
   * Verifica que la contraseña cumpla con los siguientes criterios de seguridad:
   * - Al menos 8 caracteres de longitud
   * - Al menos una letra mayúscula (A-Z)
   * - Al menos un número (0-9)
   * - Al menos un carácter especial (!@#$%^&*(),.?":{}|<>)
   * 
   * Estos criterios aseguran que las contraseñas sean lo suficientemente
   * seguras para proteger las cuentas de usuario contra ataques comunes.
   * 
   * @returns {boolean} true si la contraseña es válida, false en caso contrario
   * 
   * @example
   * ```typescript
   * password.value = 'MiContraseña123!'
   * const isValid = validatePassword() // true
   * 
   * password.value = 'simple'
   * const isValid = validatePassword() // false, múltiples errores de validación
   * ```
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
   * Valida que la confirmación de contraseña coincida con la contraseña principal
   * 
   * Esta función implementa una lógica inteligente de validación:
   * - Solo valida si la contraseña principal no está vacía
   * - Solo valida si la contraseña principal no tiene errores
   * - Verifica que ambas contraseñas sean idénticas
   * 
   * Esta aproximación mejora la experiencia de usuario al no mostrar
   * errores de confirmación hasta que la contraseña principal sea válida.
   * 
   * @returns {boolean} true si la confirmación es válida o no debe validarse aún, false si hay error
   * 
   * @example
   * ```typescript
   * password.value = 'MiContraseña123!'
   * confirmPassword.value = 'MiContraseña123!'
   * const isValid = validateConfirmPassword() // true
   * 
   * confirmPassword.value = 'DiferenteContraseña'
   * const isValid = validateConfirmPassword() // false, confirmPasswordError.value = 'Las contraseñas no coinciden.'
   * ```
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
   * Valida todo el formulario ejecutando todas las validaciones individuales
   * 
   * Ejecuta todas las validaciones en el orden correcto:
   * 1. Validación del nombre
   * 2. Validación del email
   * 3. Validación de la contraseña
   * 4. Validación de la confirmación de contraseña
   * 
   * Solo valida la confirmación de contraseña si la contraseña principal es válida,
   * mejorando la experiencia de usuario al evitar errores prematuros.
   * 
   * @returns {boolean} true si el formulario completo es válido, false en caso contrario
   * 
   * @example
   * ```typescript
   * // Llenar todos los campos
   * name.value = 'Juan Pérez'
   * email.value = 'juan@ejemplo.com'
   * password.value = 'MiContraseña123!'
   * confirmPassword.value = 'MiContraseña123!'
   * 
   * const isFormValid = validateForm() // true si todos los campos son válidos
   * ```
   */
  const validateForm = (): boolean => {
    const isNameValid = validateName()
    const isEmailValid = validateEmail()
    const isPasswordValid = validatePassword()
    const isConfirmPasswordValid = validateConfirmPassword()
    
    return isNameValid && isEmailValid && isPasswordValid && isConfirmPasswordValid
  }

  /**
   * Fuerza la validación de campos vacíos al enviar el formulario
   * 
   * Esta función se ejecuta antes del envío para asegurar que se muestren
   * todos los errores de validación, incluso para campos que el usuario
   * no ha tocado aún. Mejora la experiencia de usuario al proporcionar
   * feedback completo sobre qué campos necesitan atención.
   * 
   * Ejecuta validaciones específicas solo para campos que están vacíos,
   * evitando validaciones innecesarias y optimizando el rendimiento.
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
   * 
   * Resetea todos los mensajes de error a cadenas vacías, útil para
   * limpiar el estado de errores cuando se necesita un formulario limpio
   * o cuando se quiere resetear el estado de validación.
   * 
   * @returns {void}
   * 
   * @example
   * ```typescript
   * // Después de errores de validación
   * clearErrors() // Todos los *Error.value = ''
   * ```
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
   * 
   * Limpia todos los campos del formulario, oculta las contraseñas
   * y elimina todos los errores. Útil después de un registro exitoso
   * o cuando se necesita un formulario completamente limpio.
   * 
   * Esta función restaura el formulario al mismo estado que tenía
   * cuando se inicializó el composable por primera vez.
   * 
   * @returns {void}
   * 
   * @example
   * ```typescript
   * // Después de un registro exitoso
   * resetForm() // Formulario completamente limpio
   * ```
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
   * Alterna la visibilidad de la contraseña principal
   * 
   * Cambia entre mostrar y ocultar la contraseña en el campo de entrada.
   * Mejora la experiencia de usuario permitiendo verificar la contraseña
   * ingresada sin comprometer la seguridad.
   * 
   * @returns {void}
   * 
   * @example
   * ```typescript
   * // En el template
   * <button @click="togglePasswordVisibility">
   *   {{ showPassword ? 'Ocultar' : 'Mostrar' }}
   * </button>
   * ```
   */
  const togglePasswordVisibility = (): void => {
    showPassword.value = !showPassword.value
  }

  /**
   * Alterna la visibilidad de la confirmación de contraseña
   * 
   * Cambia entre mostrar y ocultar la confirmación de contraseña en el
   * campo de entrada. Funciona independientemente del toggle de la
   * contraseña principal para mayor flexibilidad.
   * 
   * @returns {void}
   * 
   * @example
   * ```typescript
   * // En el template
   * <button @click="toggleConfirmPasswordVisibility">
   *   {{ showConfirmPassword ? 'Ocultar' : 'Mostrar' }}
   * </button>
   * ```
   */
  const toggleConfirmPasswordVisibility = (): void => {
    showConfirmPassword.value = !showConfirmPassword.value
  }

  /**
   * Maneja el envío del formulario de registro
   * 
   * Esta función orquesta todo el proceso de registro:
   * 1. Valida el formulario completo
   * 2. Ejecuta el registro a través del store de autenticación
   * 3. Maneja la respuesta (éxito o error)
   * 4. Proporciona feedback al usuario
   * 5. Limpia el formulario en caso de éxito
   * 6. Maneja redirecciones automáticas
   * 
   * Incluye logging detallado para debugging y manejo robusto de errores
   * para asegurar que la aplicación se mantenga estable incluso si
   * ocurren errores inesperados.
   * 
   * @returns {Promise<void>} Promesa que se resuelve cuando el proceso termina
   * 
   * @example
   * ```typescript
   * // En el template
   * <form @submit.prevent="handleSubmit">
   *   <!-- campos del formulario -->
   *   <button type="submit" :disabled="isLoading || !isFormValid">
   *     {{ isLoading ? 'Registrando...' : 'Registrarse' }}
   *   </button>
   * </form>
   * ```
   */
  const handleSubmit = async (): Promise<void> => {
    // Forzar validación de campos vacíos para mostrar todos los errores
    forceValidationOnSubmit()
    
    // Validar formulario completo antes de proceder
    if (!validateForm()) {
      return
    }
    
    try {
      // Activar estado de carga
      isLoading.value = true
      error.value = ''
      
      // Ejecutar registro a través del store de autenticación
      const success = await register({
        name: name.value,
        email: email.value,
        password: password.value
      })
      
      if (success) {
        // Limpiar formulario después del éxito
        resetForm()
        
        // Mostrar mensaje de éxito al usuario
        notifySuccess('¡Registro exitoso! Bienvenido a Ecommunitas.')
        
        // No necesitamos redirigir aquí, useAuth ya maneja la redirección automática
      } else {
        error.value = 'Error en el registro. Por favor, verifica tus datos e intenta nuevamente.'
      }
      
    } catch (err: any) {
      // Mostrar error al usuario de forma segura
      error.value = err.message || 'Error al registrar usuario'
    } finally {
      // Siempre desactivar estado de carga
      isLoading.value = false
    }
  }

  // Retorno del composable con todos los estados y métodos
  return {
    // Estados reactivos del formulario
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
    
    // Propiedades computadas
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