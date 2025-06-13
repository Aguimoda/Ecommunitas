/**
 * @file usePagination.ts
 * @description Composable para manejo de paginación en Ecommunitas
 * 
 * Este composable proporciona una solución completa y reutilizable para
 * implementar paginación tanto del lado del cliente como del servidor.
 * Incluye navegación intuitiva, gestión de estado reactivo, validaciones
 * robustas y utilidades para generar interfaces de paginación.
 * 
 * CARACTERÍSTICAS PRINCIPALES:
 * - 📄 Paginación del lado del cliente y servidor
 * - 🔄 Estado reactivo con Vue 3 Composition API
 * - 🧭 Navegación intuitiva entre páginas
 * - ⚙️ Configuración flexible de tamaño de página
 * - 🎯 Validaciones automáticas de rangos
 * - 📊 Metadatos completos de paginación
 * - 🔢 Generación automática de números de página
 * - 🚨 Manejo de errores con notificaciones
 * 
 * FUNCIONALIDADES:
 * - Navegación: primera, anterior, siguiente, última página
 * - Salto directo a página específica
 * - Cambio dinámico de tamaño de página
 * - Cálculo automático de índices y rangos
 * - Generación de arrays de datos paginados
 * - Metadatos para integración con APIs
 * - Reset automático en cambios de datos
 * - Números de página para UI de navegación
 * 
 * TIPOS DE PAGINACIÓN:
 * - Cliente: Para arrays de datos locales
 * - Servidor: Para APIs con paginación backend
 * - Híbrida: Combinación de ambos enfoques
 * 
 * CONFIGURACIÓN:
 * - initialPage: Página inicial (default: 1)
 * - initialPageSize: Tamaño inicial de página (default: 10)
 * - pageSizeOptions: Opciones de tamaño disponibles
 * - showNotifications: Mostrar notificaciones de error
 * - autoReset: Reset automático en cambios de datos
 * 
 * ESTADO REACTIVO:
 * - currentPage: Página actual
 * - pageSize: Elementos por página
 * - total: Total de elementos
 * - totalPages: Total de páginas
 * - hasNextPage/hasPreviousPage: Navegación disponible
 * - startIndex/endIndex: Índices de rango actual
 * - paginatedData: Datos de la página actual
 * 
 * CASOS DE USO:
 * - Listados de artículos del marketplace
 * - Resultados de búsqueda
 * - Tablas de datos administrativos
 * - Galerías de imágenes
 * - Listas de usuarios y mensajes
 * - Historial de transacciones
 * - Catálogos de productos
 * - Feeds de actividad
 * 
 * INTEGRACIÓN:
 * - APIs REST con parámetros de paginación
 * - Componentes de UI de paginación
 * - Sistemas de búsqueda y filtrado
 * - Stores de Pinia para estado global
 * - Rutas con query parameters
 * 
 * TECNOLOGÍAS:
 * - Vue 3 Composition API
 * - TypeScript para tipado estático
 * - Reactive refs y computed properties
 * - Watchers para sincronización automática
 * - Sistema de notificaciones integrado
 * 
 * @author Equipo de Desarrollo Ecommunitas
 * @version 1.0.0
 * @since 1.0.0
 * 
 * @example
 * ```typescript
 * // Paginación del lado del cliente
 * const items = ref([...]) // Array de datos
 * const {
 *   paginatedData,
 *   currentPage,
 *   totalPages,
 *   nextPage,
 *   previousPage,
 *   goToPage,
 *   setPageSize
 * } = usePagination(items, {
 *   initialPageSize: 20,
 *   showNotifications: true
 * })
 * 
 * // Paginación del lado del servidor
 * const fetchItems = async (page: number, pageSize: number) => {
 *   const response = await api.get('/items', {
 *     params: { page, pageSize }
 *   })
 *   return {
 *     data: response.data.items,
 *     total: response.data.total
 *   }
 * }
 * 
 * const {
 *   data,
 *   isLoading,
 *   refresh,
 *   currentPage,
 *   totalPages
 * } = useServerPagination(fetchItems)
 * 
 * // Navegación programática
 * const handlePageChange = (page: number) => {
 *   goToPage(page)
 * }
 * 
 * // Cambio de tamaño de página
 * const handlePageSizeChange = (size: number) => {
 *   setPageSize(size)
 * }
 * 
 * // Generar números para UI
 * const pageNumbers = getPageNumbers(5) // Máximo 5 números visibles
 * ```
 */

import { ref, computed, watch, Ref } from 'vue'
import { useNotifications } from './useNotifications'

export interface PaginationOptions {
  initialPage?: number
  initialPageSize?: number
  pageSizeOptions?: number[]
  showNotifications?: boolean
  autoReset?: boolean
}

export interface PaginationState {
  currentPage: number
  pageSize: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  startIndex: number
  endIndex: number
}

export interface PaginationMeta {
  page: number
  pageSize: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export function usePagination<T = any>(
  data: Ref<T[]> | T[],
  options: PaginationOptions = {}
) {
  const { notifyError } = useNotifications()
  
  // Default options
  const {
    initialPage = 1,
    initialPageSize = 10,
    pageSizeOptions = [5, 10, 20, 50, 100],
    showNotifications = false,
    autoReset = true
  } = options

  // Reactive state
  const currentPage = ref(initialPage)
  const pageSize = ref(initialPageSize)
  const total = ref(0)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Get reactive data array
  const dataArray = computed(() => {
    return Array.isArray(data) ? data : data.value
  })

  // Computed properties
  const totalPages = computed(() => {
    return Math.ceil(total.value / pageSize.value) || 1
  })

  // Update total when data changes
  watch(
    dataArray,
    (newData) => {
      total.value = newData.length
      if (autoReset && currentPage.value > totalPages.value && totalPages.value > 0) {
        currentPage.value = 1
      }
    },
    { immediate: true }
  )

  const hasNextPage = computed(() => {
    return currentPage.value < totalPages.value
  })

  const hasPreviousPage = computed(() => {
    return currentPage.value > 1
  })

  const startIndex = computed(() => {
    return (currentPage.value - 1) * pageSize.value
  })

  const endIndex = computed(() => {
    return Math.min(startIndex.value + pageSize.value - 1, total.value - 1)
  })

  const paginatedData = computed(() => {
    const start = startIndex.value
    const end = start + pageSize.value
    return dataArray.value.slice(start, end)
  })

  const paginationState = computed<PaginationState>(() => ({
    currentPage: currentPage.value,
    pageSize: pageSize.value,
    total: total.value,
    totalPages: totalPages.value,
    hasNextPage: hasNextPage.value,
    hasPreviousPage: hasPreviousPage.value,
    startIndex: startIndex.value,
    endIndex: endIndex.value
  }))

  // Navigation functions
  const goToPage = (page: number): boolean => {
    if (page < 1 || page > totalPages.value) {
      if (showNotifications) {
        notifyError(`Página ${page} no válida. Debe estar entre 1 y ${totalPages.value}`)
      }
      return false
    }
    
    currentPage.value = page
    error.value = null
    return true
  }

  const nextPage = (): boolean => {
    if (!hasNextPage.value) {
      if (showNotifications) {
        notifyError('No hay más páginas disponibles')
      }
      return false
    }
    
    return goToPage(currentPage.value + 1)
  }

  const previousPage = (): boolean => {
    if (!hasPreviousPage.value) {
      if (showNotifications) {
        notifyError('Ya estás en la primera página')
      }
      return false
    }
    
    return goToPage(currentPage.value - 1)
  }

  const firstPage = (): boolean => {
    return goToPage(1)
  }

  const lastPage = (): boolean => {
    return goToPage(totalPages.value)
  }

  const setPageSize = (size: number): void => {
    if (size < 1) {
      if (showNotifications) {
        notifyError('El tamaño de página debe ser mayor a 0')
      }
      return
    }
    
    pageSize.value = size
    
    // Adjust current page if necessary
    if (currentPage.value > totalPages.value && totalPages.value > 0) {
      currentPage.value = totalPages.value
    }
  }

  const reset = (): void => {
    currentPage.value = initialPage
    pageSize.value = initialPageSize
    error.value = null
  }

  // Generate page numbers for pagination UI
  const getPageNumbers = (maxVisible: number = 5): number[] => {
    const pages: number[] = []
    const total = totalPages.value
    const current = currentPage.value
    
    if (total <= maxVisible) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= total; i++) {
        pages.push(i)
      }
    } else {
      // Calculate range around current page
      const half = Math.floor(maxVisible / 2)
      let start = Math.max(1, current - half)
      let end = Math.min(total, start + maxVisible - 1)
      
      // Adjust start if we're near the end
      if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1)
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
    }
    
    return pages
  }

  // Get pagination metadata for API calls
  const getPaginationMeta = (): PaginationMeta => ({
    page: currentPage.value,
    pageSize: pageSize.value,
    total: total.value,
    totalPages: totalPages.value,
    hasNext: hasNextPage.value,
    hasPrev: hasPreviousPage.value
  })

  // Set total for server-side pagination
  const setTotal = (newTotal: number): void => {
    total.value = newTotal
  }

  return {
    // State
    currentPage,
    pageSize,
    total,
    isLoading,
    error,
    
    // Computed
    totalPages,
    hasNextPage,
    hasPreviousPage,
    startIndex,
    endIndex,
    paginatedData,
    paginationState,
    
    // Navigation
    goToPage,
    nextPage,
    previousPage,
    firstPage,
    lastPage,
    setPageSize,
    reset,
    
    // Utilities
    getPageNumbers,
    getPaginationMeta,
    setTotal,
    
    // Options
    pageSizeOptions
  }
}

/**
 * Server-side pagination composable
 * For use with API endpoints that handle pagination server-side
 */
export function useServerPagination<T = any>(
  fetchFunction: (page: number, pageSize: number) => Promise<{ data: T[], total: number }>,
  options: PaginationOptions = {}
) {
  const { notifyError } = useNotifications()
  
  const data = ref<T[]>([])
  const pagination = usePagination(data, options)
  const { isLoading, error } = pagination

  // Fetch data function
  const fetchData = async (): Promise<void> => {
    try {
      isLoading.value = true
      error.value = null
      
      const result = await fetchFunction(pagination.currentPage.value, pagination.pageSize.value)
      
      data.value = result.data
      pagination.setTotal(result.total)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar datos'
      error.value = errorMessage
      
      if (options.showNotifications) {
        notifyError(errorMessage)
      }
      
      console.error('Server pagination error:', err)
    } finally {
      isLoading.value = false
    }
  }

  // Haer fetch de nuevo en caso de que hay nuevos resultados
  watch(
    [pagination.currentPage, pagination.pageSize],
    () => {
      fetchData()
    },
    { immediate: true }
  )

  // Funcion refrerscar
  const refresh = (): Promise<void> => {
    return fetchData()
  }

  return {
    ...pagination,
    data,
    fetchData,
    refresh
  }
}