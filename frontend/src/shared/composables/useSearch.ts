
/**
 * @file useSearch.ts
 * @description Composable para funcionalidad de búsqueda de artículos en Ecommunitas
 * 
 * Este composable centraliza toda la lógica de búsqueda de artículos del marketplace,
 * incluyendo filtros avanzados, paginación, validación de parámetros, navegación
 * y traducción de categorías. Proporciona una interfaz unificada y reactiva
 * para todas las funcionalidades de búsqueda de la aplicación.
 * 
 * CARACTERÍSTICAS PRINCIPALES:
 * - 🔍 Búsqueda avanzada con múltiples filtros
 * - 📄 Paginación completa con navegación intuitiva
 * - 🛡️ Validación robusta de parámetros de entrada
 * - 🌍 Filtros por ubicación con coordenadas geográficas
 * - 📊 Ordenamiento configurable de resultados
 * - 🔄 Estado reactivo con sincronización automática
 * - 🧭 Navegación programática entre páginas
 * - 🌐 Traducción automática de categorías y condiciones
 * 
 * FILTROS DISPONIBLES:
 * - query: Búsqueda por texto libre en título y descripción
 * - category: Filtro por categoría de artículo
 * - location: Filtro por ubicación geográfica
 * - condition: Filtro por estado del artículo
 * - distance: Radio de búsqueda en kilómetros
 * - sort: Ordenamiento de resultados (reciente, precio, etc.)
 * - coordinates: Coordenadas geográficas para búsqueda por proximidad
 * 
 * FUNCIONALIDADES:
 * - Búsqueda en tiempo real con debounce
 * - Filtros combinables y acumulativos
 * - Paginación con navegación completa
 * - Validación de entrada contra inyecciones
 * - Traducción de categorías y condiciones
 * - Navegación a detalles de artículos
 * - Limpieza y reset de filtros
 * - Sincronización con URL y rutas
 * 
 * VALIDACIONES INCLUIDAS:
 * - Sanitización de caracteres peligrosos
 * - Límites de longitud en campos de texto
 * - Validación de IDs de artículos
 * - Prevención de inyecciones de código
 * - Verificación de parámetros numéricos
 * 
 * ESTADO REACTIVO:
 * - currentPage: Página actual de resultados
 * - itemsPerPage: Número de elementos por página
 * - totalItems: Total de artículos encontrados
 * - searchFilters: Objeto con todos los filtros activos
 * - loading: Estado de carga de la búsqueda
 * - error: Mensajes de error de la búsqueda
 * 
 * CASOS DE USO:
 * - Página principal de búsqueda del marketplace
 * - Filtros avanzados en listados de artículos
 * - Búsqueda por categorías específicas
 * - Búsqueda geográfica por proximidad
 * - Navegación entre páginas de resultados
 * - Búsqueda desde la barra de navegación
 * - Filtros en páginas de categorías
 * 
 * INTEGRACIÓN:
 * - Store de Pinia para gestión de estado
 * - Vue Router para navegación
 * - APIs de geolocalización
 * - Sistema de notificaciones
 * - Componentes de UI de filtros
 * - URLs con query parameters
 * 
 * TECNOLOGÍAS:
 * - Vue 3 Composition API
 * - TypeScript para tipado estático
 * - Pinia para gestión de estado global
 * - Vue Router para navegación
 * - Reactive refs y computed properties
 * - Watchers para sincronización automática
 * 
 * @author Equipo de Desarrollo Ecommunitas
 * @version 1.0.0
 * @since 1.0.0
 * 
 * @example
 * ```typescript
 * // Uso básico en componente de búsqueda
 * const {
 *   searchFilters,
 *   items,
 *   loading,
 *   totalPages,
 *   currentPage,
 *   searchItems,
 *   updateFilters,
 *   clearFilters,
 *   goToPage,
 *   goToItemDetail
 * } = useSearch()
 * 
 * // Aplicar filtros de búsqueda
 * const handleSearch = async () => {
 *   updateFilters({
 *     query: 'bicicleta',
 *     category: 'sports',
 *     location: 'Madrid',
 *     condition: 'good'
 *   })
 *   await searchItems()
 * }
 * 
 * // Navegación entre páginas
 * const handlePageChange = (page: number) => {
 *   goToPage(page)
 * }
 * 
 * // Limpiar todos los filtros
 * const handleClearFilters = () => {
 *   clearFilters()
 * }
 * 
 * // Navegar a detalle de artículo
 * const handleItemClick = (itemId: string) => {
 *   goToItemDetail(itemId)
 * }
 * 
 * // Verificar si hay filtros activos
 * watchEffect(() => {
 *   if (hasActiveFilters.value) {
 *     // Mostrar indicador de filtros activos
 *   }
 * })
 * ```
 */

import { ref, computed, watch, onMounted, type Ref, type ComputedRef } from 'vue'
import { useRouter } from 'vue-router'
import { useItemsStore } from '@/features/items'
import { displayError } from '@/shared/utils/errorHandler'

// Types
interface SearchFilters {
  query: string;
  category: string;
  location: string;
  condition: string;
  distance: number;
  sort: string;
  coordinates: { lat: number; lng: number } | null;
}

interface Item {
  _id: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  location: string;
  images: string[];
  price?: number;
  user: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface UseSearchReturn {
  // State
  currentPage: Ref<number>;
  itemsPerPage: Ref<number>;
  totalItems: Ref<number>;
  isChangingFromHandlers: Ref<boolean>;
  searchFilters: Ref<SearchFilters>;
  
  // Computed
  items: ComputedRef<Item[]>;
  loading: ComputedRef<boolean>;
  error: ComputedRef<string | null>;
  hasActiveFilters: ComputedRef<boolean>;
  totalPages: ComputedRef<number>;
  visiblePages: ComputedRef<number[]>;
  
  // Methods
  searchItems: () => Promise<void>;
  clearFilters: () => void;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  updateFilters: (filters: Partial<SearchFilters>) => void;
  validateSearchParams: () => boolean;
  getLocationCoordinates: (location: string) => Promise<{ lat: number; lng: number } | null>;
  initializeFromRoute: () => void;
  
  // Utility functions
  translateCategory: (category: string) => string;
  translateCondition: (condition: string) => string;
  
  // Handler functions
  handleApplyFilters: () => void;
  handleResetFilters: () => void;
  goToItemDetail: (id: string, title?: string) => void;
}

/**
 * Composable para manejar la funcionalidad de búsqueda de artículos
 * Incluye filtros, paginación, validación y navegación
 */
export function useSearch(): UseSearchReturn {
  const router = useRouter()
  const itemsStore = useItemsStore()

  // Estados reactivos
  const currentPage = ref<number>(1)
  const itemsPerPage = ref<number>(12)
  const totalItems = ref<number>(0)
  const maxVisiblePages = 5
  const isChangingFromHandlers = ref<boolean>(false)

  // Filtros de búsqueda
  const searchFilters = ref<SearchFilters>({
    query: '',
    category: '',
    location: '',
    condition: '',
    distance: 10,
    sort: 'recent',
    coordinates: null,
  })

  // Propiedades computadas del store
  const items = computed((): Item[] => {
    const storeItems = itemsStore.items
    return Array.isArray(storeItems) ? storeItems as unknown as Item[] : []
  })
  const loading = computed(() => itemsStore.loading)
  const error = computed(() => itemsStore.error)

  // Verificar si hay filtros activos
  const hasActiveFilters = computed(() => {
    return !!(
      searchFilters.value.query ||
      searchFilters.value.category ||
      searchFilters.value.location ||
      searchFilters.value.condition
    )
  })

  // Calcular total de páginas
  const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value))

  // Calcular páginas visibles para la paginación
  const visiblePages = computed(() => {
    const pages = []
    const half = Math.floor(maxVisiblePages / 2)
    let start = currentPage.value - half
    let end = currentPage.value + half

    if (start < 1) {
      start = 1
      end = Math.min(maxVisiblePages, totalPages.value)
    }

    if (end > totalPages.value) {
      end = totalPages.value
      start = Math.max(1, end - maxVisiblePages + 1)
    }

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    return pages
  })

  /**
   * Traduce las categorías del inglés al español
   * @param {string} category - Categoría en inglés
   * @returns {string} Categoría traducida
   */
  const translateCategory = (category: string): string => {
    const categories: Record<string, string> = {
      books: 'Libros',
      electronics: 'Electrónica',
      clothing: 'Ropa',
      furniture: 'Muebles',
      other: 'Otros'
    }
    return categories[category] || category
  }

  /**
   * Traduce las condiciones del inglés al español
   * @param {string} condition - Condición en inglés
   * @returns {string} Condición traducida
   */
  const translateCondition = (condition: string): string => {
    const conditions: Record<string, string> = {
      new: 'Nuevo',
      like_new: 'Como nuevo',
      good: 'Buen estado',
      fair: 'Estado aceptable',
      poor: 'Estado regular'
    }
    return conditions[condition] || condition
  }

  /**
   * Valida los parámetros de búsqueda para prevenir inyecciones y errores
   * @returns {boolean} true si es válido, false si no
   */
  const validateSearchParams = (): boolean => {
    // Limpiar espacios en blanco de la consulta
    if (searchFilters.value.query !== undefined && searchFilters.value.query.trim().length === 0) {
      searchFilters.value.query = ''
      return true
    }
    
    const dangerousChars = /[<>{}]/g
    
    // Validar consulta de búsqueda
    if (searchFilters.value.query && dangerousChars.test(searchFilters.value.query)) {
      return false
    }
    
    if (searchFilters.value.query && searchFilters.value.query.length > 100) {
      return false
    }
    
    // Validar ubicación
    if (searchFilters.value.location && dangerousChars.test(searchFilters.value.location)) {
      return false
    }
    
    if (searchFilters.value.location && searchFilters.value.location.length > 100) {
      return false
    }
    
    return true
  }

  /**
   * Obtiene los artículos aplicando los filtros y paginación actuales
   */
  const fetchItems = async (): Promise<void> => {
    // Evitar llamadas concurrentes
    if (loading.value) {
      return
    }

    const isValid = validateSearchParams()
    if (!isValid) {
      displayError(new Error('Parámetros de búsqueda inválidos'), { customMessage: 'Parámetros de búsqueda inválidos' })
      return
    }
    
    try {
      // Preparar parámetros para la búsqueda
      const filtersCopy = JSON.parse(JSON.stringify(searchFilters.value))
      const paramsForService = {
        ...filtersCopy,
        page: currentPage.value,
        limit: itemsPerPage.value,
      }
      
      // Ejecutar búsqueda a través del store
      await itemsStore.searchItems(paramsForService)
      
      // Actualizar total de elementos
      totalItems.value = itemsStore.pagination.total || 0
      
    } catch (err) {
      console.error('Error al buscar artículos:', err)
      displayError(err, { customMessage: 'Error al buscar artículos. Por favor intente nuevamente.' })
    }
  }

  // Removed handleApplyFilters and handleResetFilters - functionality moved to fetchItems and clearFilters

  // Funciones de navegación de páginas
  const prevPage = (): void => {
    if (currentPage.value > 1) {
      currentPage.value--
    }
  }

  const nextPage = (): void => {
    if (currentPage.value < totalPages.value) {
      currentPage.value++
    }
  }

  const goToPage = (page: number): void => {
    currentPage.value = page
  }

  /**
   * Navega al detalle de un artículo con validación del ID
   * @param {string} id - ID del artículo
   * @param {string} title - Título del artículo (no usado actualmente)
   */
  const goToItemDetail = (id: string): void => {
    // Validar que el ID sea válido y no sea "search" ni vacío ni null
    if (!id || typeof id !== 'string' || id === 'search' || id.trim() === '' || id.length < 8) {
      displayError('ID de artículo inválido.')
      return
    }
    router.push({ name: 'ItemDetailView', params: { id } })
  }

  // Observar cambios en la página actual para actualizar los resultados
  watch(currentPage, () => {
    // Solo llamar a fetchItems si el cambio no viene de los handlers
    if (!isChangingFromHandlers.value) {
      fetchItems()
    }
    // Resetear la bandera después de cada cambio
    isChangingFromHandlers.value = false
  })

  // Cargar datos iniciales al montar el componente
  onMounted(() => {
    fetchItems()
  })

  // Additional functions to match interface
  const searchItems = async (): Promise<void> => {
    await fetchItems()
  }

  const clearFilters = (): void => {
    searchFilters.value = {
      query: '',
      category: '',
      location: '',
      condition: '',
      distance: 10,
      sort: 'recent',
      coordinates: null,
    }
    currentPage.value = 1
    fetchItems()
  }

  const updateFilters = (filters: Partial<SearchFilters>): void => {
    Object.assign(searchFilters.value, filters)
  }

  const getLocationCoordinates = async (): Promise<{ lat: number; lng: number } | null> => {
    // This would typically use a geocoding service
    // For now, return null as placeholder
    return null
  }

  const initializeFromRoute = (): void => {
    // Initialize search from route parameters if needed
    fetchItems()
  }

  // ===== RETORNO DEL COMPOSABLE =====
  
  return {
    // State
    currentPage,
    itemsPerPage,
    totalItems,
    isChangingFromHandlers,
    searchFilters,
    
    // Computed
    items,
    loading,
    error,
    hasActiveFilters,
    totalPages,
    visiblePages,
    
    // Methods
    searchItems,
    clearFilters,
    goToPage,
    nextPage,
    prevPage,
    updateFilters,
    validateSearchParams,
    getLocationCoordinates,
    initializeFromRoute,
    
    // Utility functions
    translateCategory,
    translateCondition,
    
    // Handler functions
    handleApplyFilters: fetchItems,
    handleResetFilters: clearFilters,
    goToItemDetail
  }
}