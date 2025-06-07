import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
// import { useToast } from 'vue-toastification' // Migrated to standardized error handling
import { useItemsStore } from '@/features/items'

// Types
/**
 * Interfaz para un artículo en el sistema de gestión
 * @interface Item
 */
interface Item {
  /** ID único del artículo */
  _id: string;
  /** Título del artículo */
  title: string;
  /** Descripción del artículo */
  description: string;
  /** Categoría del artículo */
  category: string;
  /** Ubicación geográfica del artículo */
  location: {
    /** Latitud de la ubicación */
    latitude: number;
    /** Longitud de la ubicación */
    longitude: number;
    /** Dirección legible de la ubicación */
    address: string;
  };
  /** Array de URLs de imágenes del artículo */
  images: string[];
  /** ID del propietario del artículo */
  owner: string;
  /** Fecha de creación */
  createdAt: string;
  /** Fecha de última actualización */
  updatedAt: string;
}

/**
 * Interfaz de retorno del composable useItemManagement
 * @interface UseItemManagementReturn
 */
interface UseItemManagementReturn {
  /** Maneja la actualización exitosa de un artículo */
  handleItemUpdated: (updatedItem: Item) => void;
  /** Maneja la eliminación exitosa de un artículo */
  handleItemDeleted: (deletedItem: Item) => void;
  /** Inicializa el componente y carga los datos necesarios */
  initializeComponent: () => Promise<void>;
}

/**
 * Composable para gestión de artículos
 * Maneja la lógica de inicialización y eventos del componente ItemManagement
 * Proporciona handlers para actualización y eliminación de artículos
 * 
 * @returns {UseItemManagementReturn} Objeto con métodos para gestionar artículos
 * 
 * @example
 * ```typescript
 * const { handleItemUpdated, handleItemDeleted, initializeComponent } = useItemManagement()
 * 
 * // Inicializar componente
 * await initializeComponent()
 * 
 * // Manejar eventos de artículos
 * handleItemUpdated(updatedItem)
 * handleItemDeleted(deletedItem)
 * ```
 */
export function useItemManagement(): UseItemManagementReturn {
  const router = useRouter()
  // const toast = useToast() // Migrated to standardized error handling
  const itemsStore = useItemsStore()

  /**
   * Maneja la actualización exitosa de un artículo
   * Ejecuta lógica adicional después de que un artículo ha sido actualizado
   * Las notificaciones se manejan en los componentes hijos
   * 
   * @param {Item} updatedItem - Artículo que ha sido actualizado
   * @returns {void}
   */
  const handleItemUpdated = (_updatedItem: Item): void => {
    // Lógica adicional post-actualización si es necesaria
    // Los toasts se manejan en los componentes hijos
  }

  /**
   * Maneja la eliminación exitosa de un artículo
   * Ejecuta lógica adicional después de que un artículo ha sido eliminado
   * Las notificaciones se manejan en los componentes hijos
   * 
   * @param {Item} deletedItem - Artículo que ha sido eliminado
   * @returns {void}
   */
  const handleItemDeleted = (_deletedItem: Item): void => {
    // Lógica adicional post-eliminación si es necesaria
    // Los toasts se manejan en los componentes hijos
  }

  /**
   * Inicializa el componente verificando autenticación y cargando datos
   * Verifica que el usuario esté autenticado y redirige al login si no lo está
   * Inicializa el store de artículos si es necesario
   * 
   * @returns {Promise<void>}
   */
  const initializeComponent = async (): Promise<void> => {
    // Verificar que el usuario esté autenticado
    const token = localStorage.getItem('token')
    if (!token) {
      router.push({ name: 'LoginView', query: { redirect: '/items/manage' } })
      return
    }
    
    // Inicializar el store de artículos si es necesario
    if (!itemsStore.isInitialized) {
      await itemsStore.initialize()
    }
  }

  // ===== INICIALIZACIÓN =====
  
  /** Ejecutar inicialización al montar el componente */
  onMounted(() => {
    initializeComponent()
  })

  // ===== RETORNO DEL COMPOSABLE =====
  
  return {
    // Manejadores de eventos
    handleItemUpdated,      // Callback para actualización de artículo
    handleItemDeleted,      // Callback para eliminación de artículo
    
    // Métodos de inicialización
    initializeComponent     // Inicializar componente y verificar auth
  }
}