/**
 * @file useEditItem.ts
 * @description Composable para manejar la edición de artículos en Ecommunitas
 * 
 * Este composable proporciona una interfaz completa para editar artículos existentes,
 * incluyendo la carga de datos, actualización de campos y manejo de imágenes.
 * 
 * Funcionalidades principales:
 * - Carga de datos del artículo para edición
 * - Actualización de campos del artículo
 * - Manejo de carga de nuevas imágenes
 * - Eliminación de artículos con confirmación
 * - Validación y manejo de errores
 * 
 * @author Equipo de Desarrollo Ecommunitas
 * @version 1.0.0
 */

import { ref, computed, onMounted, type Ref, type ComputedRef } from 'vue'
import { useRouter } from 'vue-router'
import { displayError } from '@/shared/utils/errorHandler'
import { useItemsStore } from '@/features/items'
import type { Item } from '../services/itemService'

/**
 * Interfaz para los datos del formulario de edición
 * @interface ItemForm
 */
interface ItemForm {
  /** Título del artículo */
  title: string;
  /** Descripción del artículo */
  description: string;
  /** Categoría del artículo */
  category: string;
  /** Condición del artículo */
  condition: string;
  /** Ubicación del artículo */
  location: string;
  /** URL de imagen (legacy, se mantiene por compatibilidad) */
  imageUrl: string | null;
}

/**
 * Interfaz de retorno del composable useEditItem
 * @interface UseEditItemReturn
 */
interface UseEditItemReturn {
  /** Formulario reactivo con los datos del artículo */
  form: Ref<ItemForm>;
  /** Imagen seleccionada para actualizar */
  selectedImage: Ref<File | null>;
  /** Estado de carga durante operaciones */
  isLoading: ComputedRef<boolean>;
  /** Función para cargar datos del artículo */
  fetchItem: () => Promise<void>;
  /** Función para actualizar el artículo */
  updateItem: () => Promise<void>;
  /** Función para eliminar el artículo */
  deleteItem: () => Promise<void>;
  /** Función para manejar la carga de imágenes */
  handleImageUpload: (event: Event) => void;
}

/**
 * Composable para manejar la edición de artículos
 * 
 * Proporciona funcionalidad completa para editar artículos existentes,
 * incluyendo carga de datos, actualización y eliminación.
 * 
 * @param {string} itemId - ID del artículo a editar
 * @returns {UseEditItemReturn} Objeto con estados reactivos y funciones para la edición
 * 
 * @example
 * ```typescript
 * const { form, updateItem, deleteItem, handleImageUpload } = useEditItem('123')
 * 
 * // Actualizar título
 * form.value.title = 'Nuevo título'
 * 
 * // Guardar cambios
 * await updateItem()
 * 
 * // Eliminar artículo
 * await deleteItem()
 * ```
 */
export function useEditItem(itemId: string): UseEditItemReturn {
  const router = useRouter()
  const itemsStore = useItemsStore()

  // ===== ESTADO REACTIVO =====
  
  /** 
   * Formulario reactivo con los datos del artículo
   * Contiene todos los campos editables del artículo
   */
  const form = ref<ItemForm>({
    title: '',
    description: '',
    category: '',
    condition: '',
    location: '',
    imageUrl: null
  })

  /** 
   * Imagen seleccionada para subir
   * Se utiliza cuando el usuario quiere cambiar la imagen del artículo
   */
  const selectedImage = ref<File | null>(null)

  // ===== PROPIEDADES COMPUTADAS =====
  
  /** 
   * Estado de carga desde el store
   * Indica si hay operaciones en progreso (carga, actualización, eliminación)
   */
  const isLoading = computed(() => itemsStore.loading)

  // ===== FUNCIONES PRINCIPALES =====
  
  /**
   * Obtiene los datos del artículo desde el servidor
   * 
   * Carga los datos del artículo especificado y los asigna al formulario
   * para permitir su edición. Maneja errores y redirige si el artículo no existe.
   * 
   * @returns {Promise<void>}
   * @throws {Error} Si el artículo no existe o hay problemas de conectividad
   */
  const fetchItem = async (): Promise<void> => {
    try {
      const itemData = await itemsStore.fetchItem(itemId) as Item
      
      if (itemData && typeof itemData === 'object' && Object.keys(itemData).length > 0) {
        // Asignar datos del artículo al formulario de forma segura
        form.value = {
          title: itemData.title || '',
          description: itemData.description || '',
          category: itemData.category || '',
          condition: itemData.condition || '',
          location: itemData.location || '',
          imageUrl: null // Las imágenes se manejan por separado
        }
      } else {
        displayError(new Error('Los datos del artículo no son válidos o el artículo no existe'), { customMessage: 'Los datos del artículo no son válidos o el artículo no existe' })
        router.push('/')
      }
    } catch (error) {
      console.error('Error al cargar el artículo:', error)
      displayError(error, { customMessage: 'Error al cargar el artículo' })
      router.push('/')
    }
  }

  /**
   * Actualiza el artículo con los datos del formulario
   * 
   * Prepara los datos del formulario en formato FormData y los envía al servidor
   * para actualizar el artículo. Incluye la nueva imagen si se seleccionó una.
   * 
   * @returns {Promise<void>}
   * @throws {Error} Si hay problemas durante la actualización
   */
  const updateItem = async (): Promise<void> => {
    try {
      const formData = new FormData()
      
      // Agregar campos del formulario
      formData.append('title', form.value.title)
      formData.append('description', form.value.description)
      formData.append('category', form.value.category)
      formData.append('condition', form.value.condition)
      formData.append('location', form.value.location)
      
      // Agregar imagen si se seleccionó una nueva
      if (selectedImage.value) {
        formData.append('images', selectedImage.value)
      }
      
      await itemsStore.updateItem(itemId, formData)
      // Artículo actualizado correctamente (sin notificación)
      router.push(`/item/${itemId}`)
    } catch (error) {
      console.error('Error al actualizar el artículo:', error)
      displayError(error, { customMessage: 'Error al actualizar el artículo' })
    }
  }

  /**
   * Elimina el artículo después de confirmar con el usuario
   * 
   * Muestra un diálogo de confirmación antes de proceder con la eliminación.
   * Si el usuario confirma, elimina el artículo y redirige a la página principal.
   * 
   * @returns {Promise<void>}
   * @throws {Error} Si hay problemas durante la eliminación
   */
  const deleteItem = async (): Promise<void> => {
    if (!confirm('¿Estás seguro de que quieres eliminar este artículo?')) {
      return
    }
    
    try {
      await itemsStore.deleteItem(itemId)
      // Artículo eliminado correctamente (sin notificación)
      router.push('/')
    } catch (error) {
      console.error('Error al eliminar el artículo:', error)
      displayError(error, { customMessage: 'Error al eliminar el artículo' })
    }
  }

  /**
   * Maneja la selección de una nueva imagen
   * 
   * Procesa el evento del input file y almacena la imagen seleccionada
   * para su posterior carga durante la actualización del artículo.
   * 
   * @param {Event} event - Evento del input file que contiene la imagen seleccionada
   * @returns {void}
   */
  const handleImageUpload = (event: Event): void => {
    const input = event.target as HTMLInputElement
    if (input.files && input.files[0]) {
      selectedImage.value = input.files[0]
    }
  }

  // ===== INICIALIZACIÓN =====
  
  /** 
   * Cargar datos del artículo al montar el componente
   * Se ejecuta automáticamente cuando se inicializa el composable
   */
  onMounted(() => {
    fetchItem()
  })

  // ===== RETORNO DEL COMPOSABLE =====
  
  return {
    // Estado reactivo del formulario
    form,                    // Datos del formulario de edición
    selectedImage,           // Imagen seleccionada para actualizar
    
    // Estados computados
    isLoading,              // Estado de carga durante operaciones
    
    // Métodos públicos
    fetchItem,              // Cargar datos del artículo
    updateItem,             // Actualizar artículo existente
    deleteItem,             // Eliminar artículo
    handleImageUpload       // Manejar selección de imagen
  }
}