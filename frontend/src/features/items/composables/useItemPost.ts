import { ref, computed, type Ref, type ComputedRef } from 'vue'
import { useRouter } from 'vue-router'
import { displayError } from '@/shared/utils/errorHandler'
import { useItemsStore } from '@/features/items'

// Types


/**
 * Interfaz de retorno del composable useItemPost
 * @interface UseItemPostReturn
 */
interface UseItemPostReturn {
  // Form states
  /** Título del artículo */
  title: Ref<string>;
  /** Descripción del artículo */
  description: Ref<string>;
  /** Categoría del artículo */
  category: Ref<string>;
  /** Condición del artículo */
  condition: Ref<string>;
  /** Dirección de ubicación del artículo */
  location: Ref<string>;
  /** Latitud de la ubicación */
  latitude: Ref<number | null>;
  /** Longitud de la ubicación */
  longitude: Ref<number | null>;
  /** Array de archivos de imágenes */
  images: Ref<File[]>;
  /** Mensaje de error general */
  error: Ref<string>;
  /** Mensaje de error específico de ubicación */
  locationError: Ref<string>;
  
  // Computed properties
  /** Estado de carga del formulario */
  isLoading: ComputedRef<boolean>;
  
  // Methods
  /** Maneja la carga de imágenes */
  handleImageUpload: (event: Event) => void;
  /** Maneja la selección de ubicación */
  onLocationSelected: (locationData: { address: string; latitude: number; longitude: number }) => void;
  /** Limpia la ubicación seleccionada */
  onLocationCleared: () => void;
  /** Envía el formulario para crear el artículo */
  handleSubmit: () => Promise<void>;
  /** Resetea todos los campos del formulario */
  resetForm: () => void;
}

/**
 * Composable para manejar la funcionalidad de publicación de artículos
 * Incluye validación de formularios, manejo de ubicación e imágenes
 * Proporciona estado reactivo y métodos para crear nuevos artículos
 * 
 * @returns {UseItemPostReturn} Objeto con estado reactivo y métodos para publicar artículos
 * 
 * @example
 * ```typescript
 * const {
 *   title, description, category, condition,
 *   handleImageUpload, onLocationSelected, handleSubmit
 * } = useItemPost()
 * 
 * // Configurar datos del formulario
 * title.value = 'Mi artículo'
 * description.value = 'Descripción del artículo'
 * 
 * // Enviar formulario
 * await handleSubmit()
 * ```
 */
export function useItemPost(): UseItemPostReturn {
  const router = useRouter()
  const itemsStore = useItemsStore()

  // Estados reactivos del formulario
  const title = ref<string>('')
  const description = ref<string>('')
  const category = ref<string>('')
  const condition = ref<string>('')
  const location = ref<string>('')
  const latitude = ref<number | null>(null)
  const longitude = ref<number | null>(null)
  const images = ref<File[]>([])
  const error = ref<string>('')
  const locationError = ref<string>('')

  // Propiedades computadas
  const isLoading = computed(() => itemsStore.loading)

  /**
   * Maneja la carga de imágenes desde el input file
   * Valida el número máximo de imágenes (5) y el tamaño máximo por imagen (5MB)
   * Filtra solo archivos de imagen válidos y actualiza el estado reactivo
   * 
   * @param {Event} event - Evento del input file que contiene los archivos seleccionados
   * @returns {void}
   */
  const handleImageUpload = (event: Event): void => {
    const input = event.target as HTMLInputElement
    if (!input.files) return
    
    const files = Array.from(input.files)
    
    // Validar número máximo de imágenes
    if (files.length > 5) {
      displayError(new Error('Máximo 5 imágenes permitidas'), { customMessage: 'Máximo 5 imágenes permitidas' })
      return
    }
    
    // Validar tamaño de archivos (máximo 5MB por imagen)
    const maxSize = 5 * 1024 * 1024 // 5MB
    const oversizedFiles = files.filter(file => file.size > maxSize)
    
    if (oversizedFiles.length > 0) {
      displayError(new Error('Algunas imágenes son demasiado grandes'), { customMessage: 'Algunas imágenes son demasiado grandes (máximo 5MB por imagen)' })
      return
    }
    
    // Validar tipos de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const invalidFiles = files.filter(file => !allowedTypes.includes(file.type))
    
    if (invalidFiles.length > 0) {
      displayError(new Error('Tipo de archivo no válido'), { customMessage: 'Solo se permiten archivos JPG, PNG y WebP' })
      return
    }
    
    images.value = files
    console.log('Imágenes cargadas:', files.length)
  }

  /**
   * Maneja la selección de ubicación desde LocationPicker
   * Actualiza los campos de ubicación y coordenadas con los datos seleccionados
   * Limpia cualquier error de ubicación previo
   * 
   * @param {Object} locationData - Datos de ubicación seleccionada
   * @param {string} locationData.address - Dirección legible de la ubicación
   * @param {number} locationData.latitude - Latitud de la ubicación
   * @param {number} locationData.longitude - Longitud de la ubicación
   * @returns {void}
   */
  const onLocationSelected = (locationData: { address: string; latitude: number; longitude: number }): void => {
    location.value = locationData.address
    latitude.value = locationData.latitude
    longitude.value = locationData.longitude
    locationError.value = ''
    // Ubicación seleccionada exitosamente (sin notificación)
    console.log('Ubicación seleccionada:', locationData)
  }

  /**
   * Limpia la ubicación seleccionada
   * Resetea todos los campos relacionados con la ubicación
   * 
   * @returns {void}
   */
  const onLocationCleared = (): void => {
    location.value = ''
    latitude.value = null
    longitude.value = null
    locationError.value = ''
    console.log('Ubicación limpiada')
  }

  /**
   * Valida todos los campos del formulario
   * Verifica que todos los campos requeridos estén completos y sean válidos
   * Actualiza los mensajes de error correspondientes
   * 
   * @returns {boolean} true si todos los campos son válidos, false en caso contrario
   */
  const validateForm = (): boolean => {
    error.value = ''
    locationError.value = ''
    
    // Validar título
    if (!title.value.trim()) {
      error.value = 'El título es requerido'
      return false
    }
    
    if (title.value.trim().length < 3) {
      error.value = 'El título debe tener al menos 3 caracteres'
      return false
    }
    
    if (title.value.trim().length > 100) {
      error.value = 'El título no puede exceder 100 caracteres'
      return false
    }
    
    // Validar descripción
    if (!description.value.trim()) {
      error.value = 'La descripción es requerida'
      return false
    }
    
    if (description.value.trim().length < 10) {
      error.value = 'La descripción debe tener al menos 10 caracteres'
      return false
    }
    
    if (description.value.trim().length > 1000) {
      error.value = 'La descripción no puede exceder 1000 caracteres'
      return false
    }
    
    // Validar categoría
    if (!category.value) {
      error.value = 'La categoría es requerida'
      return false
    }
    
    // Validar condición
    if (!condition.value) {
      error.value = 'La condición es requerida'
      return false
    }
    
    // Validar ubicación
    if (!location.value) {
      locationError.value = 'La ubicación es requerida'
      return false
    }
    
    // Validar imágenes
    if (images.value.length === 0) {
      error.value = 'Al menos una imagen es requerida'
      return false
    }
    
    return true
  }

  /**
   * Verifica la autenticación del usuario
   * Comprueba si existe un token de autenticación en localStorage
   * Actualiza el mensaje de error si no está autenticado
   * 
   * @returns {boolean} true si el usuario está autenticado, false en caso contrario
   */
  const checkAuthentication = (): boolean => {
    const token = localStorage.getItem('token')
    if (!token) {
      error.value = 'Debes iniciar sesión para publicar un artículo'
      return false
    }
    return true
  }

  /**
   * Crea el FormData con todos los datos del artículo
   * Prepara los datos del formulario en formato FormData para envío multipart
   * Incluye texto, coordenadas e imágenes
   * 
   * @returns {FormData} Datos del formulario listos para enviar al servidor
   */
  const createFormData = (): FormData => {
    const formData = new FormData()
    
    formData.append('title', title.value.trim())
    formData.append('description', description.value.trim())
    formData.append('category', category.value)
    formData.append('condition', condition.value)
    formData.append('location', location.value)
    
    // Agregar coordenadas si están disponibles
    if (latitude.value !== null && longitude.value !== null) {
      formData.append('latitude', latitude.value.toString())
      formData.append('longitude', longitude.value.toString())
    }
    
    // Agregar imágenes
    images.value.forEach((image) => {
      formData.append('images', image)
    })
    
    return formData
  }

  /**
   * Resetea todos los campos del formulario
   * Limpia todos los valores reactivos y los devuelve a su estado inicial
   * Útil después de enviar exitosamente o para limpiar el formulario
   * 
   * @returns {void}
   */
  const resetForm = (): void => {
    title.value = ''
    description.value = ''
    category.value = ''
    condition.value = ''
    location.value = ''
    latitude.value = null
    longitude.value = null
    images.value = []
    error.value = ''
    locationError.value = ''
  }

  /**
   * Maneja el envío del formulario
   * Valida la autenticación, los datos del formulario y envía la información al servidor
   * Redirige al usuario después del envío exitoso y maneja errores apropiadamente
   * 
   * @returns {Promise<void>}
   */
  const handleSubmit = async (): Promise<void> => {
    try {
      console.log('Iniciando envío del formulario...')
      
      // Validar autenticación
      if (!checkAuthentication()) {
        return
      }
      
      // Validar formulario
      if (!validateForm()) {
        return
      }
      
      // Crear FormData
      const formData = createFormData()
      
      console.log('Datos del formulario preparados, enviando al store...')
      
      // Crear el artículo usando el store
      const response = await itemsStore.createItem(formData)
      
      console.log('Artículo publicado exitosamente:', response)
      // Artículo publicado exitosamente (sin notificación)
      
      // Resetear formulario y navegar
      resetForm()
      router.push('/')
      
    } catch (err) {
      console.error('Error al publicar artículo:', err)
      
      // Manejar diferentes tipos de errores
      let errorMessage = 'Error al publicar el artículo. Por favor intente nuevamente.'
      
      if ((err as any).response?.status === 401) {
        errorMessage = 'Su sesión ha expirado. Por favor inicie sesión nuevamente.'
      } else if ((err as any).response?.status === 413) {
        errorMessage = 'Las imágenes son demasiado grandes. Reduzca el tamaño e intente nuevamente.'
      } else if ((err as any).response?.data?.error) {
        errorMessage = (err as any).response.data.error
      }
      
      error.value = errorMessage
      displayError(err, { customMessage: errorMessage })
    }
  }

  return {
    // Estados reactivos
    title,
    description,
    category,
    condition,
    location,
    latitude,
    longitude,
    images,
    error,
    locationError,
    
    // Propiedades computadas
    isLoading,
    
    // Funciones principales
    handleSubmit,
    handleImageUpload,
    onLocationSelected,
    onLocationCleared,
    resetForm
  }
}