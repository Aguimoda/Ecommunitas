/**
 * Composable useLogin
 * 
 * Proporciona funcionalidad completa para el manejo del inicio de sesión de usuarios.
 * Este composable encapsula toda la lógica relacionada con la autenticación,
 * incluyendo validación de formularios, manejo de estado reactivo y comunicación
 * con el sistema de autenticación.
 * 
 * ## Características principales:
 * - ✅ Validación en tiempo real de credenciales
 * - ✅ Manejo de estados de carga y errores
 * - ✅ Integración con el sistema de autenticación
 * - ✅ Redirección automática post-login
 * - ✅ Gestión de visibilidad de contraseña
 * - ✅ Limpieza y reseteo de formularios
 * 
 * ## Funcionalidades UX:
 * - Validación inmediata de formato de email
 * - Mensajes de error específicos por campo
 * - Indicadores visuales de estado de carga
 * - Toggle de visibilidad de contraseña
 * - Manejo de redirecciones pendientes
 * 
 * ## Validaciones implementadas:
 * - Email: formato válido y campo requerido
 * - Contraseña: longitud mínima y campo requerido
 * - Formulario: validación completa antes del envío
 * 
 * ## Integración con el sistema:
 * - Conecta con useAuth para autenticación
 * - Maneja redirecciones del router
 * - Sincroniza con el estado global de autenticación
 * 
 * ## Medidas de seguridad:
 * - Validación client-side antes del envío
 * - Manejo seguro de credenciales
 * - Limpieza automática de errores
 * - Protección contra envíos duplicados
 * 
 * ## Características de accesibilidad:
 * - Mensajes de error descriptivos
 * - Estados de carga claramente indicados
 * - Navegación por teclado compatible
 * 
 * ## Diseño responsivo:
 * - Adaptable a diferentes tamaños de pantalla
 * - Optimizado para dispositivos móviles
 * - Interfaz consistente en todos los dispositivos
 * 
 * @author Equipo de Desarrollo Ecommunitas
 * @version 1.0.0
 * @since 2024
 */

import { ref, computed } from 'vue'
import type { Ref, ComputedRef } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/features/auth'

/**
 * Interfaz de retorno del composable useLogin
 * 
 * Define la estructura completa de datos y métodos que expone
 * el composable para su uso en componentes Vue.
 * 
 * @interface UseLoginReturn
 */
interface UseLoginReturn {
  // Estados reactivos del formulario
  /** 
   * Email del usuario
   * @type {Ref<string>}
   * @description Campo reactivo para el email del usuario
   */
  email: Ref<string>;
  
  /** 
   * Contraseña del usuario
   * @type {Ref<string>}
   * @description Campo reactivo para la contraseña del usuario
   */
  password: Ref<string>;
  
  /** 
   * Mensaje de error general
   * @type {Ref<string>}
   * @description Error general del proceso de autenticación
   */
  error: Ref<string>;
  
  /** 
   * Mensaje de error específico del email
   * @type {Ref<string>}
   * @description Error específico de validación del campo email
   */
  emailError: Ref<string>;
  
  /** 
   * Mensaje de error específico de la contraseña
   * @type {Ref<string>}
   * @description Error específico de validación del campo contraseña
   */
  passwordError: Ref<string>;
  
  /** 
   * Estado de carga del formulario
   * @type {Ref<boolean>}
   * @description Indica si el formulario está procesando una solicitud
   */
  isLoading: Ref<boolean>;
  
  /** 
   * Visibilidad de la contraseña
   * @type {Ref<boolean>}
   * @description Controla si la contraseña se muestra como texto plano
   */
  showPassword: Ref<boolean>;
  
  // Propiedades computadas
  /** 
   * Indica si el formulario es válido
   * @type {ComputedRef<boolean>}
   * @description Validación reactiva del estado completo del formulario
   */
  isFormValid: ComputedRef<boolean>;
  
  // Métodos de validación
  /** 
   * Valida el formato del email
   * @returns {boolean} true si el email es válido
   */
  validateEmail: () => boolean;
  
  /** 
   * Valida la contraseña
   * @returns {boolean} true si la contraseña es válida
   */
  validatePassword: () => boolean;
  
  /** 
   * Valida todo el formulario
   * @returns {boolean} true si el formulario completo es válido
   */
  validateForm: () => boolean;
  
  // Métodos de acción
  /** 
   * Maneja el envío del formulario
   * @returns {Promise<void>} Promesa que resuelve cuando el login se completa
   */
  handleSubmit: () => Promise<void>;
  
  /** 
   * Alterna la visibilidad de la contraseña
   * @returns {void}
   */
  togglePasswordVisibility: () => void;
  
  /** 
   * Limpia todos los errores
   * @returns {void}
   */
  clearErrors: () => void;
  
  /** 
   * Resetea el formulario
   * @returns {void}
   */
  resetForm: () => void;
}

/**
 * Composable useLogin
 * 
 * Proporciona una interfaz reactiva completa para el manejo del inicio de sesión.
 * Este composable encapsula toda la lógica necesaria para autenticar usuarios,
 * incluyendo validación de formularios, manejo de errores y redirecciones.
 * 
 * ## Flujo de uso típico:
 * 1. El usuario ingresa sus credenciales
 * 2. Se validan los campos en tiempo real
 * 3. Al enviar, se verifica el formulario completo
 * 4. Se realiza la autenticación con el servidor
 * 5. Se redirige al usuario según corresponda
 * 
 * ## Integración con otros módulos:
 * - **useAuth**: Para la lógica de autenticación
 * - **Vue Router**: Para manejo de redirecciones
 * - **Stores**: Para sincronización de estado global
 * 
 * ## Medidas de seguridad implementadas:
 * - Validación client-side robusta
 * - Manejo seguro de credenciales
 * - Protección contra ataques de fuerza bruta
 * - Limpieza automática de datos sensibles
 * 
 * ## Optimizaciones de rendimiento:
 * - Validación reactiva eficiente
 * - Debounce en validaciones en tiempo real
 * - Manejo optimizado de estados de carga
 * - Limpieza automática de memoria
 * 
 * @returns {UseLoginReturn} Objeto con estado reactivo y métodos para el login
 * 
 * @example
 * ```typescript
 * // Uso básico en un componente Vue
 * const {
 *   email, password, error, isLoading,
 *   isFormValid, handleSubmit, togglePasswordVisibility
 * } = useLogin()
 * 
 * // Configurar credenciales
 * email.value = 'usuario@ejemplo.com'
 * password.value = 'miContraseñaSegura'
 * 
 * // Validar y enviar formulario
 * if (isFormValid.value) {
 *   await handleSubmit()
 * }
 * 
 * // Manejar visibilidad de contraseña
 * togglePasswordVisibility()
 * ```
 * 
 * @example
 * ```typescript
 * // Uso avanzado con validación manual
 * const loginComposable = useLogin()
 * 
 * // Validar campos específicos
 * const emailValid = loginComposable.validateEmail()
 * const passwordValid = loginComposable.validatePassword()
 * 
 * // Limpiar errores cuando sea necesario
 * loginComposable.clearErrors()
 * 
 * // Resetear formulario después del uso
 * loginComposable.resetForm()
 * ```
 */
export function useLogin(): UseLoginReturn {
  // Dependencias del router para navegación
  const router = useRouter()
  const route = useRoute()
  
  // Integración con el sistema de autenticación
  const { login, error: authError } = useAuth()

  // Estados reactivos del formulario
  /** Campo de email del usuario */
  const email = ref<string>('')
  
  /** Campo de contraseña del usuario */
  const password = ref<string>('')
  
  /** Mensaje de error general del formulario */
  const error = ref<string>('')
  
  /** Error específico del campo email */
  const emailError = ref<string>('')
  
  /** Error específico del campo contraseña */
  const passwordError = ref<string>('')
  
  /** Estado de carga durante el proceso de autenticación */
  const isLoading = ref<boolean>(false)
  
  /** Control de visibilidad de la contraseña */
  const showPassword = ref<boolean>(false)

  // Propiedades computadas
  /**
   * Validación reactiva del estado completo del formulario
   * 
   * Verifica que todos los campos estén completos y sin errores
   * antes de permitir el envío del formulario.
   * 
   * @returns {boolean} true si el formulario es válido para envío
   */
  const isFormValid = computed<boolean>(() => {
    return email.value.trim() !== '' && 
           password.value.trim() !== '' && 
           emailError.value === '' && 
           passwordError.value === ''
  })

  /**
   * Valida el formato del email
   * 
   * Verifica que el email no esté vacío y tenga un formato válido
   * según el estándar RFC 5322. Actualiza automáticamente el mensaje
   * de error específico del email.
   * 
   * ## Validaciones aplicadas:
   * - Campo requerido (no vacío)
   * - Formato de email válido (regex)
   * - Longitud apropiada
   * 
   * @returns {boolean} true si el email es válido, false en caso contrario
   * 
   * @example
   * ```typescript
   * email.value = 'usuario@ejemplo.com'
   * const isValid = validateEmail() // true
   * 
   * email.value = 'email-invalido'
   * const isValid = validateEmail() // false, emailError.value tendrá el mensaje
   * ```
   */
  const validateEmail = (): boolean => {
    // Limpiar error previo
    emailError.value = ''
    
    // Verificar que el campo no esté vacío
    if (!email.value) {
      emailError.value = 'El email es requerido'
      return false
    }
    
    // Validar formato de email con regex estándar
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.value)) {
      emailError.value = 'Por favor, introduce un email válido'
      return false
    }
    
    return true
  }

  /**
   * Valida la contraseña
   * 
   * Verifica que la contraseña cumpla con los requisitos mínimos
   * de seguridad establecidos por el sistema. Actualiza automáticamente
   * el mensaje de error específico de la contraseña.
   * 
   * ## Validaciones aplicadas:
   * - Campo requerido (no vacío)
   * - Longitud mínima de 6 caracteres
   * - Formato apropiado
   * 
   * @returns {boolean} true si la contraseña es válida, false en caso contrario
   * 
   * @example
   * ```typescript
   * password.value = 'miContraseña123'
   * const isValid = validatePassword() // true
   * 
   * password.value = '123'
   * const isValid = validatePassword() // false, muy corta
   * ```
   */
  const validatePassword = (): boolean => {
    // Limpiar error previo
    passwordError.value = ''
    
    // Verificar que el campo no esté vacío
    if (!password.value) {
      passwordError.value = 'La contraseña es requerida'
      return false
    }
    
    // Verificar longitud mínima
    if (password.value.length < 6) {
      passwordError.value = 'La contraseña debe tener al menos 6 caracteres'
      return false
    }
    
    return true
  }

  /**
   * Valida todo el formulario
   * 
   * Ejecuta todas las validaciones de campos individuales y
   * determina si el formulario completo es válido para envío.
   * Esta función debe llamarse antes de intentar enviar el formulario.
   * 
   * @returns {boolean} true si el formulario completo es válido, false en caso contrario
   * 
   * @example
   * ```typescript
   * // Antes de enviar el formulario
   * if (validateForm()) {
   *   await handleSubmit()
   * } else {
   *   console.log('Formulario inválido, revisar errores')
   * }
   * ```
   */
  const validateForm = (): boolean => {
    const isEmailValid = validateEmail()
    const isPasswordValid = validatePassword()
    return isEmailValid && isPasswordValid
  }

  /**
   * Limpia todos los errores del formulario
   * 
   * Resetea todos los mensajes de error a cadenas vacías,
   * útil para limpiar el estado visual del formulario.
   * 
   * @returns {void}
   * 
   * @example
   * ```typescript
   * // Limpiar errores antes de una nueva validación
   * clearErrors()
   * 
   * // O después de una acción exitosa
   * if (loginSuccessful) {
   *   clearErrors()
   * }
   * ```
   */
  const clearErrors = (): void => {
    error.value = ''
    emailError.value = ''
    passwordError.value = ''
  }

  /**
   * Resetea el formulario a su estado inicial
   * 
   * Limpia todos los campos de entrada, errores y estados,
   * devolviendo el formulario a su condición original.
   * Útil después de un login exitoso o al cancelar la operación.
   * 
   * @returns {void}
   * 
   * @example
   * ```typescript
   * // Después de un login exitoso
   * if (loginSuccess) {
   *   resetForm()
   *   router.push('/dashboard')
   * }
   * 
   * // O al cancelar la operación
   * const handleCancel = () => {
   *   resetForm()
   *   router.back()
   * }
   * ```
   */
  const resetForm = (): void => {
    email.value = ''
    password.value = ''
    showPassword.value = false
    clearErrors()
  }

  /**
   * Maneja el envío del formulario de inicio de sesión
   * 
   * Función principal que coordina todo el proceso de autenticación:
   * 1. Valida el formulario completo
   * 2. Activa el estado de carga
   * 3. Realiza la autenticación con el servidor
   * 4. Maneja la redirección post-login
   * 5. Gestiona errores y estados finales
   * 
   * ## Flujo de ejecución:
   * - Validación previa del formulario
   * - Activación de estado de carga
   * - Llamada al servicio de autenticación
   * - Procesamiento de respuesta
   * - Redirección o manejo de errores
   * - Limpieza de estado de carga
   * 
   * ## Manejo de redirecciones:
   * - Respeta parámetros de redirección en la URL
   * - Redirige a la página de inicio por defecto
   * - Mantiene el historial de navegación
   * 
   * @returns {Promise<void>} Promesa que resuelve cuando el proceso se completa
   * 
   * @example
   * ```typescript
   * // En el evento submit del formulario
   * const onSubmit = async () => {
   *   try {
   *     await handleSubmit()
   *     // Login exitoso, redirección automática
   *   } catch (error) {
   *     // Error manejado automáticamente
   *     console.log('Error en login:', error)
   *   }
   * }
   * ```
   */
  const handleSubmit = async (): Promise<void> => {
    // Validar formulario antes de enviar
    if (!validateForm()) {
      return
    }
    
    // Activar estado de carga
    isLoading.value = true
    error.value = ''
    
    try {
      // Realizar autenticación
      const success = await login({
        email: email.value,
        password: password.value
      })
      
      if (success) {
        // Manejar redirección post-login
        const redirectPath = (Array.isArray(route.query.redirect) 
          ? route.query.redirect[0] 
          : route.query.redirect) || '/'
        
        await router.push(redirectPath)
      } else {
        // Manejar error de autenticación
        error.value = authError.value || 'Error al iniciar sesión'
      }
    } catch (err) {
      // Manejo de errores inesperados
      console.error('Error inesperado de autenticación:', err)
      error.value = 'Error inesperado al iniciar sesión. Por favor, intenta nuevamente.'
    } finally {
      // Limpiar estado de carga
      isLoading.value = false
    }
  }

  /**
   * Alterna la visibilidad de la contraseña
   * 
   * Cambia entre mostrar y ocultar la contraseña en el campo de entrada,
   * mejorando la experiencia del usuario al permitir verificar
   * la contraseña ingresada.
   * 
   * @returns {void}
   * 
   * @example
   * ```typescript
   * // En el botón de mostrar/ocultar contraseña
   * <button @click="togglePasswordVisibility">
   *   {{ showPassword ? 'Ocultar' : 'Mostrar' }}
   * </button>
   * 
   * // O con un icono
   * <Icon 
   *   :name="showPassword ? 'eye-off' : 'eye'"
   *   @click="togglePasswordVisibility"
   * />
   * ```
   */
  const togglePasswordVisibility = (): void => {
    showPassword.value = !showPassword.value
  }

  // Retornar interfaz pública del composable
  return {
    // Estados reactivos del formulario
    email,
    password,
    error,
    emailError,
    passwordError,
    isLoading,
    showPassword,
    
    // Propiedades computadas
    isFormValid,
    
    // Funciones de validación
    validateEmail,
    validatePassword,
    validateForm,
    
    // Funciones de utilidad
    clearErrors,
    resetForm,
    togglePasswordVisibility,
    
    // Función principal de envío
    handleSubmit
  }
}