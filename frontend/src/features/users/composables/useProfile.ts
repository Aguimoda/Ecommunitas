/**
 * @fileoverview Composable para la gestión del perfil de usuario
 * 
 * Este composable proporciona funcionalidades completas para la gestión del perfil
 * de usuario, incluyendo la carga de datos del perfil, actualización de información
 * personal, gestión de artículos publicados y manejo de estados de UI.
 * 
 * @author Sistema de Gestión de Usuarios
 * @version 1.0.0
 */

import { ref, computed, onMounted, type Ref, type ComputedRef } from 'vue'
import { useRouter } from 'vue-router'
import { displayError } from '@/shared/utils/errorHandler'
import axios from 'axios'
import { userService } from '@/features/users'
import { ITEM_ROUTES } from '@/config/apiRoutes'

/**
 * Interfaz que define la estructura de un usuario
 * 
 * @interface User
 */
interface User {
  /** Nombre completo del usuario */
  name: string;
  /** Dirección de correo electrónico */
  email: string;
  /** URL del avatar del usuario */
  avatar: string;
  /** Biografía o descripción personal */
  bio: string;
  /** Ubicación del usuario */
  location: string;
  /** Fecha de registro en el sistema */
  joinedDate: string;
}

/**
 * Interfaz que define la estructura de un artículo
 * 
 * @interface Item
 */
interface Item {
  /** Identificador único del artículo */
  _id: string;
  /** Título del artículo */
  title: string;
  /** Descripción detallada del artículo */
  description: string;
  /** Categoría del artículo */
  category: string;
  /** Condición del artículo */
  condition: string;
  /** Ubicación del artículo */
  location: string;
  /** Array de URLs de imágenes */
  images: string[];
  /** Fecha de creación */
  createdAt: string;
  /** Fecha de última actualización */
  updatedAt: string;
}

/**
 * Interfaz que define el tipo de retorno del composable useProfile
 * 
 * @interface UseProfileReturn
 */
interface UseProfileReturn {
  // Estado reactivo
  /** Datos del perfil del usuario */
  user: Ref<User>;
  /** Lista de artículos del usuario */
  items: Ref<Item[]>;
  /** Estado de carga */
  isLoading: Ref<boolean>;
  /** Mensaje de error */
  error: Ref<string>;
  /** Control de visibilidad del editor de perfil */
  showProfileEditor: Ref<boolean>;
  /** Control de visibilidad del modal de edición de artículo */
  showEditItemModal: Ref<boolean>;
  /** Artículo actualmente siendo editado */
  editingItem: Ref<Item | null>;
  
  // Propiedades computadas
  /** Indica si el usuario tiene artículos */
  hasItems: ComputedRef<boolean>;
  /** Iniciales del nombre del usuario */
  userInitials: ComputedRef<string>;
  
  // Métodos
  /** Función para cargar datos del usuario */
  fetchUserData: () => Promise<void>;
  /** Función para cargar artículos del usuario */
  fetchUserItems: () => Promise<void>;
  /** Función para guardar cambios del perfil */
  handleProfileSave: (profileData: Partial<User>) => Promise<void>;
  /** Función para abrir modal de edición de artículo */
  openEditItemModal: (item: Item) => void;
  /** Función para guardar cambios de artículo */
  handleItemSave: (updatedItem: Item) => Promise<void>;
  /** Función para eliminar artículo */
  deleteItem: (itemId: number) => Promise<void>;
  /** Función para manejo de errores */
  handleError: (err: any, defaultMessage: string) => void;
}

/**
 * Composable para la gestión del perfil de usuario
 * 
 * Proporciona funcionalidades para:
 * - Cargar y actualizar datos del perfil de usuario
 * - Gestionar artículos publicados por el usuario
 * - Manejar estados de carga y error
 * - Controlar modales y estados de UI
 * - Validar autenticación y permisos
 * 
 * @returns {UseProfileReturn} Objeto con estados reactivos y métodos para gestión del perfil
 * 
 * @example
 * ```vue
 * <script setup>
 * import { useProfile } from '@/features/users/composables/useProfile'
 * 
 * const {
 *   user,
 *   items,
 *   isLoading,
 *   error,
 *   showProfileEditor,
 *   hasItems,
 *   userInitials,
 *   fetchUserData,
 *   handleProfileSave,
 *   deleteItem
 * } = useProfile()
 * 
 * // Los datos se cargan automáticamente al montar el componente
 * // Para actualizar el perfil:
 * await handleProfileSave({ name: 'Nuevo Nombre', bio: 'Nueva biografía' })
 * 
 * // Para eliminar un artículo:
 * await deleteItem(123)
 * </script>
 * ```
 */
export function useProfile(): UseProfileReturn {
  // Estado reactivo
  /** Datos del perfil del usuario */
  const user = ref<User>({
    name: '',
    email: '',
    avatar: 'https://via.placeholder.com/150',
    bio: '',
    location: '',
    joinedDate: ''
  })
  
  /** Lista de artículos publicados por el usuario */
  const items = ref<Item[]>([])
  /** Indicador de estado de carga */
  const isLoading = ref<boolean>(false)
  /** Mensaje de error en caso de fallo */
  const error = ref<string>('')
  /** Control de visibilidad del editor de perfil */
  const showProfileEditor = ref<boolean>(false)
  /** Control de visibilidad del modal de edición de artículo */
  const showEditItemModal = ref<boolean>(false)
  /** Artículo actualmente siendo editado */
  const editingItem = ref<Item | null>(null)
  
  // Dependencias
  const router = useRouter()
  
  // Propiedades computadas
  /**
   * Indica si el usuario tiene artículos publicados
   * 
   * @returns {boolean} True si el usuario tiene al menos un artículo
   */
  const hasItems = computed<boolean>(() => {
    return Array.isArray(items.value) && items.value.length > 0
  })
  
  /**
   * Genera las iniciales del nombre del usuario
   * 
   * @returns {string} Iniciales del usuario (máximo 2 caracteres)
   */
  const userInitials = computed<string>(() => {
    if (!user.value.name) return ''
    return user.value.name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  })
  
  /**
   * Obtiene los datos del usuario desde el backend
   * 
   * Carga tanto la información del perfil como los artículos publicados
   * por el usuario. Maneja la autenticación y redirecciona al login si
   * no hay token válido.
   * 
   * @async
   * @function fetchUserData
   * @returns {Promise<void>}
   */
  const fetchUserData = async (): Promise<void> => {
    try {
      isLoading.value = true
      error.value = ''
      
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }
      
      // Obtener datos del usuario
      const userResponse = await userService.getCurrentUserProfile()
      if (userResponse && userResponse.success && userResponse.data) {
        // El backend devuelve { success: true, data: user }, y userService lo envuelve como { success: true, data: response.data }
        const backendUser = (userResponse.data as any).data || userResponse.data
        user.value = {
          name: backendUser.name || user.value.name,
          email: backendUser.email || user.value.email,
          avatar: backendUser.avatar || user.value.avatar,
          bio: backendUser.bio || '',
          location: backendUser.location || '',
          joinedDate: backendUser.createdAt ? 
            new Date(backendUser.createdAt).toLocaleDateString('es-ES') : 
            new Date().toLocaleDateString('es-ES')
        }
      }
      
      // Obtener artículos del usuario
      await fetchUserItems()
      
    } catch (err) {
      console.error('Error al cargar datos del usuario:', err)
      handleError(err, 'Error al cargar el perfil')
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * Obtiene los artículos publicados por el usuario
   * 
   * Realiza una petición para obtener todos los artículos que ha publicado
   * el usuario actual. Requiere autenticación válida.
   * 
   * @async
   * @function fetchUserItems
   * @returns {Promise<void>}
   */
  const fetchUserItems = async (): Promise<void> => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return
      
      // Primero obtener el perfil del usuario para conseguir su ID
      const userResponse = await userService.getCurrentUserProfile()
      if (!userResponse || !userResponse.success || !userResponse.data) {
        console.error('No se pudo obtener el perfil del usuario')
        return
      }
      
      // El backend devuelve { success: true, data: user }, y userService lo envuelve como { success: true, data: response.data }
      // Por lo tanto, los datos del usuario están en userResponse.data.data
      const userData = (userResponse.data as any).data || userResponse.data
      const userId = userData._id || userData.id
      if (!userId) {
        console.error('No se pudo obtener el ID del usuario')
        return
      }
      
      // Usar la ruta correcta para obtener artículos del usuario
      const response = await axios.get(ITEM_ROUTES.BY_USER(userId), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.data && response.data.success) {
        items.value = response.data.data || []
      } else {
        items.value = []
      }
      
    } catch (err) {
      console.error('Error al cargar artículos del usuario:', err)
      items.value = []
      handleError(err, 'Error al cargar los artículos')
    }
  }
  
  /**
   * Maneja la actualización del perfil del usuario
   * 
   * Actualiza los datos del perfil con la información proporcionada
   * y cierra el editor de perfil al completarse exitosamente.
   * 
   * @param {Partial<User>} updatedProfile - Datos actualizados del perfil
   * @returns {Promise<void>}
   */
  const handleProfileSave = async (updatedProfile: Partial<User>): Promise<void> => {
    try {
      user.value = {
        ...user.value,
        name: updatedProfile.name || user.value.name,
        email: updatedProfile.email || user.value.email,
        bio: updatedProfile.bio || user.value.bio,
        location: updatedProfile.location || user.value.location,
        avatar: (updatedProfile as any).avatarUrl || user.value.avatar
      }
      
      showProfileEditor.value = false
      
    } catch (err) {
      console.error('Error al actualizar perfil:', err)
      displayError(err, { customMessage: 'Error al actualizar el perfil' })
    }
  }
  
  /**
   * Abre el modal de edición de artículo
   * 
   * Establece el artículo a editar y muestra el modal correspondiente.
   * 
   * @param {Item} item - Artículo a editar
   */
  const openEditItemModal = (item: Item): void => {
    editingItem.value = item
    showEditItemModal.value = true
  }
  
  /**
   * Maneja la actualización de un artículo
   * 
   * Actualiza un artículo existente en la lista local y cierra el modal
   * de edición al completarse exitosamente.
   * 
   * @param {Item} updatedItem - Datos actualizados del artículo
   * @returns {Promise<void>}
   */
  const handleItemSave = async (updatedItem: Item): Promise<void> => {
    try {
      const index = items.value.findIndex(item => item._id === updatedItem._id)
      if (index !== -1) {
        items.value[index] = updatedItem
      }
      
      showEditItemModal.value = false
      editingItem.value = null
      
    } catch (err) {
      console.error('Error al actualizar artículo:', err)
      displayError(err, { customMessage: 'Error al actualizar el artículo' })
    }
  }
  
  /**
   * Elimina un artículo del usuario
   * 
   * Solicita confirmación del usuario antes de proceder con la eliminación.
   * Realiza la petición al backend y actualiza la lista local.
   * 
   * @param {number} itemId - ID del artículo a eliminar
   * @returns {Promise<void>}
   */
  const deleteItem = async (itemId: number): Promise<void> => {
    if (!confirm('¿Estás seguro de que quieres eliminar este artículo?')) {
      return
    }
    
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }
      
      await axios.delete(ITEM_ROUTES.BY_ID(itemId.toString()), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      // Remover el artículo de la lista local
      items.value = items.value.filter(item => item._id !== itemId.toString())
      
    } catch (err) {
      console.error('Error al eliminar artículo:', err)
      handleError(err, 'Error al eliminar el artículo')
    }
  }
  
  /**
   * Maneja errores de manera consistente
   * 
   * Procesa diferentes tipos de errores y proporciona mensajes apropiados.
   * Maneja casos especiales como errores de autenticación (401).
   * 
   * @param {any} err - Error capturado
   * @param {string} defaultMessage - Mensaje por defecto si no se puede extraer uno específico
   */
  const handleError = (err: any, defaultMessage: string): void => {
    let errorMessage = defaultMessage
    
    if (err.response) {
      if (err.response.status === 401) {
        router.push('/login')
        return
      }
      
      if (err.response.data && err.response.data.error) {
        errorMessage = err.response.data.error
      } else if (err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message
      }
    }
    
    error.value = errorMessage
    displayError(new Error(errorMessage), { customMessage: errorMessage })
  }
  
  // Inicialización
  onMounted(() => {
    fetchUserData()
  })
  
  return {
    // Estado reactivo del usuario
    user,                    // Datos del perfil del usuario
    items,                   // Artículos publicados por el usuario
    isLoading,              // Estado de carga
    error,                  // Mensajes de error
    
    // Estados de UI
    showProfileEditor,      // Mostrar/ocultar editor de perfil
    showEditItemModal,      // Mostrar/ocultar modal de edición
    editingItem,            // Artículo siendo editado
    
    // Propiedades computadas
    hasItems,               // Indica si el usuario tiene artículos
    userInitials,           // Iniciales del nombre del usuario
    
    // Métodos de datos
    fetchUserData,          // Cargar datos del usuario y artículos
    fetchUserItems,         // Cargar solo artículos del usuario
    
    // Métodos de gestión
    handleProfileSave,      // Guardar cambios del perfil
    openEditItemModal,      // Abrir modal de edición de artículo
    handleItemSave,         // Guardar cambios de artículo
    deleteItem,             // Eliminar artículo
    
    // Utilidades
    handleError             // Manejo centralizado de errores
  }
}