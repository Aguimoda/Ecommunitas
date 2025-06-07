/**
 * Composable para manejar la lógica de detalles de artículos
 * Centraliza toda la funcionalidad relacionada con la visualización y gestión de artículos individuales
 */

import { ref, computed, watch, onMounted, type Ref, type ComputedRef } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/features/auth'
import { useItemsStore } from '@/features/items'
import { translateCategory, translateCondition } from '@/utils/translations'
import { displayError } from '@/shared/utils/errorHandler'
import type { Item } from '../services/itemService'

// Types

/**
 * Interfaz de retorno del composable useItemDetail
 * @interface UseItemDetailReturn
 */
interface UseItemDetailReturn {
  // State
  /** Índice de la imagen actualmente mostrada */
  currentImageIndex: Ref<number>;
  /** Estado de visibilidad del formulario de contacto */
  showContactForm: Ref<boolean>;
  /** Estado de visibilidad del modal de edición */
  showEditModal: Ref<boolean>;
  
  // Computed
  /** Artículo actual */
  item: ComputedRef<Item | null>;
  /** Estado de carga */
  loading: ComputedRef<boolean>;
  /** Mensaje de error si existe */
  error: ComputedRef<string | null>;
  /** Indica si el usuario actual es propietario del artículo */
  isOwner: ComputedRef<boolean>;
  /** Array de URLs de imágenes del artículo */
  itemImages: ComputedRef<string[]>;
  /** Categoría traducida al español */
  translatedCategory: ComputedRef<string>;
  /** Condición traducida al español */
  translatedCondition: ComputedRef<string>;
  
  // Methods
  /** Obtiene los datos del artículo */
  fetchItem: () => Promise<void>;
  /** Elimina el artículo actual */
  deleteItem: () => Promise<void>;
  /** Navega a la siguiente imagen */
  nextImage: () => void;
  /** Navega a la imagen anterior */
  prevImage: () => void;
  /** Navega a una imagen específica por índice */
  goToImage: (index: number) => void;
  /** Abre el formulario de contacto */
  openContactForm: () => void;
  /** Cierra el formulario de contacto */
  closeContactForm: () => void;
  /** Abre el modal de edición */
  openEditModal: () => void;
  /** Cierra el modal de edición */
  closeEditModal: () => void;
  /** Obtiene las URLs de imágenes de un artículo */
  getItemImages: (itemData: Item | null) => string[];
  /** Formatea una fecha para mostrar */
  formatDate: (dateString: string) => string;
  /** Traduce una categoría al español */
  translateCategory: (category: string) => string;
  /** Traduce una condición al español */
  translateCondition: (condition: string) => string;
  /** Maneja la actualización exitosa de un artículo */
  handleItemUpdated: () => Promise<void>;
}

/**
 * Composable para manejar la lógica de detalles de artículos
 * Proporciona funcionalidad completa para visualizar, editar y gestionar artículos individuales
 * 
 * @param {string} itemId - ID del artículo a mostrar
 * @returns {UseItemDetailReturn} Objeto con estado reactivo y métodos para manejar detalles del artículo
 * 
 * @example
 * ```typescript
 * const { item, loading, isOwner, fetchItem, deleteItem } = useItemDetail('123')
 * 
 * // Cargar artículo
 * await fetchItem()
 * 
 * // Verificar propiedad
 * if (isOwner.value) {
 *   await deleteItem()
 * }
 * ```
 */
export function useItemDetail(itemId: string): UseItemDetailReturn {
  // Stores y servicios
  const router = useRouter()
  const authStore = useAuthStore()
  const itemsStore = useItemsStore()

  // Estado reactivo
  const currentImageIndex = ref<number>(0)
  const showContactForm = ref<boolean>(false)
  const showEditModal = ref<boolean>(false)

  // Computed properties del store
  const item = computed(() => itemsStore.currentItem)
  const loading = computed<boolean>(() => itemsStore.loading)
  const error = computed<string | null>(() => itemsStore.error)

  /**
   * Verifica si el usuario actual es el propietario del artículo
   * Compara el ID del usuario autenticado con el ID del propietario del artículo
   * 
   * @returns {boolean} true si el usuario actual es el propietario, false en caso contrario
   */
  const isOwner = computed<boolean>(() => {
    if (!authStore.isAuthenticated || !authStore.user || !item.value?.user) {
      return false
    }
    
    const currentUserId = authStore.user?.id
    const itemOwnerId = item.value.user?._id
    
    return currentUserId === itemOwnerId
  })

  /**
   * Obtiene todas las imágenes del artículo
   * Maneja tanto imageUrls (array) como imageUrl (legacy) para compatibilidad
   * 
   * @param {Item | null} itemData - Datos del artículo
   * @returns {string[]} Array de URLs de imágenes
   */
  const getItemImages = (itemData: Item | null): string[] => {
    if (!itemData) return []
    
    // Retornar el array de imágenes del item
    return itemData.images || []
  }

  /**
   * Obtiene los detalles del artículo desde el store
   * Maneja errores y muestra notificaciones apropiadas
   * 
   * @returns {Promise<void>}
   */
  const fetchItemDetails = async (): Promise<void> => {
    try {
      await itemsStore.fetchItem(itemId)
    } catch (err) {
      console.error('Error al cargar detalles del artículo:', err)
      displayError(err, { customMessage: 'Error al cargar los detalles del artículo' })
    }
  }

  /**
   * Formatea una fecha para mostrarla de manera legible en español
   * 
   * @param {string} dateString - Fecha en formato string
   * @returns {string} Fecha formateada en español
   */
  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }
    return new Date(dateString).toLocaleDateString('es-ES', options)
  }

  // Funciones de navegación de la galería de imágenes
  
  /**
   * Navega a la siguiente imagen en la galería
   * Utiliza navegación circular (vuelve al inicio al llegar al final)
   * 
   * @returns {void}
   */
  const nextImage = (): void => {
    const images = getItemImages(item.value)
    if (images.length > 1) {
      currentImageIndex.value = (currentImageIndex.value + 1) % images.length
    }
  }

  /**
   * Navega a la imagen anterior en la galería
   * Utiliza navegación circular (va al final al estar en el inicio)
   * 
   * @returns {void}
   */
  const previousImage = (): void => {
    const images = getItemImages(item.value)
    if (images.length > 1) {
      currentImageIndex.value = currentImageIndex.value === 0 
        ? images.length - 1 
        : currentImageIndex.value - 1
    }
  }



  // Funciones de interacción



  /**
   * Inicia el proceso de contacto con el propietario del artículo
   * Redirige a registro si el usuario no está autenticado
   * Valida que los datos del artículo estén disponibles
   * 
   * @returns {void}
   */
  const contactOwner = (): void => {
    if (!authStore.isAuthenticated) {
      // Redirigir a registro si no está autenticado
      router.push({
        path: '/register',
        query: { redirect: router.currentRoute.value.fullPath }
      })
      return
    }
    
    // Verificar que los datos del artículo estén disponibles
    if (!item.value || !item.value.user) {
      console.error('Datos del artículo o usuario no disponibles')
      displayError(new Error('Datos del artículo o usuario no disponibles'), { customMessage: 'No se pudo cargar la información del propietario' })
      return
    }

    showContactForm.value = true
  }



  // Manejadores de eventos de modales



  /**
   * Cierra el formulario de contacto
   * 
   * @returns {void}
   */
  const closeContactForm = (): void => {
    showContactForm.value = false
  }

  /**
   * Cierra el modal de edición
   * 
   * @returns {void}
   */
  const closeEditModal = (): void => {
    showEditModal.value = false
  }

  /**
   * Maneja la actualización exitosa de un artículo
   * Cierra el modal de edición y recarga los datos actualizados
   * 
   * @returns {Promise<void>}
   */
  const handleItemUpdated = async (): Promise<void> => {
    showEditModal.value = false
    // Recargar los detalles del artículo después de la edición
    await fetchItemDetails()
    // Artículo actualizado correctamente (sin notificación)
  }

  // Watchers

  // Computed properties adicionales
  /** Array reactivo de URLs de imágenes del artículo */
  const itemImages = computed<string[]>(() => getItemImages(item.value))
  
  /** Categoría del artículo traducida al español */
  const translatedCategory = computed<string>(() => 
    item.value ? translateCategory(item.value.category) : ''
  )
  
  /** Condición del artículo traducida al español */
  const translatedCondition = computed<string>(() => 
    item.value ? translateCondition(item.value.condition) : ''
  )

  /**
   * Resetea el índice de imagen cuando cambia el artículo
   * Evita mostrar índices fuera de rango al cambiar de artículo
   */
  watch(item, (): void => {
    currentImageIndex.value = 0
  })

  // Inicialización
  onMounted(() => {
    fetchItemDetails()
  })

  // API pública del composable
  return {
    // Estado
    currentImageIndex,
    showContactForm,
    showEditModal,
    
    // Computed
    item,
    loading,
    error,
    isOwner,
    itemImages,
    translatedCategory,
    translatedCondition,
    
    // Métodos
    fetchItem: fetchItemDetails,
    deleteItem: async (): Promise<void> => {
      // This would need to be implemented based on the store
      throw new Error('Delete item not implemented')
    },
    nextImage,
    prevImage: previousImage,
    goToImage: (index: number): void => {
      const images = getItemImages(item.value)
      if (index >= 0 && index < images.length) {
        currentImageIndex.value = index
      }
    },
    openContactForm: contactOwner,
    closeContactForm,
    openEditModal: (): void => {
      showEditModal.value = true
    },
    closeEditModal,
    getItemImages,
    formatDate,
    handleItemUpdated,
    
    // Utilidades de traducción
    translateCategory,
    translateCondition
  }
}