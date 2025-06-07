/**
 * Store de Artículos (Items Store)
 * 
 * Gestiona el estado global de los artículos en la aplicación utilizando Pinia.
 * Proporciona funcionalidades completas de CRUD, búsqueda avanzada, paginación,
 * caché inteligente y manejo de errores para los artículos de la plataforma.
 * 
 * Características principales:
 * - ✅ Operaciones CRUD completas (crear, leer, actualizar, eliminar)
 * - 🔍 Búsqueda avanzada con filtros múltiples
 * - 📄 Paginación automática con navegación
 * - 💾 Sistema de caché con expiración automática
 * - 🚫 Cancelación de peticiones HTTP
 * - 📊 Estadísticas del store en tiempo real
 * - 🔔 Notificaciones integradas
 * - 🛡️ Manejo robusto de errores
 * - 🔄 Actualización automática de datos
 * 
 * Tecnologías utilizadas:
 * - Pinia para gestión de estado
 * - Vue 3 Composition API
 * - TypeScript para tipado estático
 * - Axios para peticiones HTTP
 * 
 * @author Sistema Ecommunitas
 * @version 2.0.0
 * @since 1.0.0
 */

import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import * as itemService from '../services/itemService'
import type { Item, ItemsResponse, CreateItemData, UpdateItemData } from '../services/itemService'
import type { SearchFilters } from '@/shared/constants/searchFilters'
import { processError } from '@/shared/utils/errorHandler'
import { useNotifications } from '@/shared/composables/useNotifications'

// Tipos de datos

/**
 * Interfaz para la paginación de artículos
 * Controla la navegación entre páginas y metadatos de paginación
 */
interface Pagination {
  /** Página actual (base 1) */
  page: number
  /** Número de elementos por página */
  limit: number
  /** Total de páginas disponibles */
  totalPages: number
  /** Total de elementos en la base de datos */
  total: number
  /** Indica si existe una página siguiente */
  hasNextPage: boolean
  /** Indica si existe una página anterior */
  hasPrevPage: boolean
}

/**
 * Interfaz para las estadísticas del store
 * Proporciona información sobre el estado interno del store
 */
interface StoreStats {
  /** Número de artículos cargados actualmente */
  itemsCount: number
  /** Tamaño actual del caché en elementos */
  cacheSize: number
  /** Timestamp de la última actualización de datos */
  lastFetch: number | null
  /** Indica si el store ha sido inicializado */
  isInitialized: boolean
  /** Indica si hay errores activos */
  hasError: boolean
  /** Indica si hay operaciones en curso */
  isLoading: boolean
}

// Configuración del caché
/** Duración del caché en milisegundos (5 minutos) */
const CACHE_DURATION = 5 * 60 * 1000

/**
 * Store principal para la gestión de artículos
 * 
 * Este store centraliza toda la lógica relacionada con los artículos,
 * incluyendo operaciones CRUD, búsqueda, filtrado, paginación y caché.
 * 
 * @returns {Object} Objeto con estado reactivo, getters y acciones del store
 */
export const useItemsStore = defineStore('items', () => {
  // Estado reactivo del store
  
  /** Lista principal de artículos cargados */
  const items = ref<Item[]>([])
  /** Artículo individual seleccionado */
  const item = ref<Item | null>(null)
  /** Estado de carga para operaciones asíncronas */
  const loading = ref(false)
  /** Mensaje de error actual, null si no hay errores */
  const error = ref<string | null>(null)
  
  /** Configuración de paginación */
  const pagination = ref<Pagination>({
    page: 1,
    limit: 12,
    totalPages: 0,
    total: 0,
    hasNextPage: false,
    hasPrevPage: false
  })
  
  /** Filtros de búsqueda activos */
  const filters = ref<SearchFilters>({
    query: '',
    category: '',
    location: '',
    condition: '',
    distance: 10,
    sort: 'recent',
    coordinates: null,
    page: 1,
    limit: 12
  })
  
  /** Caché de artículos por ID para acceso rápido */
  const cache = ref(new Map<string, Item>())
  /** Timestamp de la última actualización de datos */
  const lastFetch = ref<number | null>(null)
  /** Indica si el store ha sido inicializado */
  const isInitialized = ref(false)
  /** Controlador para cancelar peticiones HTTP en curso */
  const searchController = ref<AbortController | null>(null)
  
  // Sistema de notificaciones
  const { notifyError, notifySuccess } = useNotifications()

  // Propiedades computadas (Getters)
  
  /** Obtiene la lista de artículos */
  const getItems = computed(() => items.value)
  /** Obtiene el artículo seleccionado */
  const getItem = computed(() => item.value)
  /** Alias para compatibilidad con versiones anteriores */
  const currentItem = computed(() => item.value)
  /** Estado de carga */
  const isLoading = computed(() => loading.value)
  /** Error actual */
  const getError = computed(() => error.value)
  /** Configuración de paginación */
  const getPagination = computed(() => pagination.value)
  /** Filtros activos */
  const getFilters = computed(() => filters.value)
  
  /** Indica si hay filtros activos aplicados */
  const hasActiveFilters = computed(() => {
    const f = filters.value
    return !!f.query || !!f.category || !!f.condition || !!f.location || !!f.coordinates
  })
  
  /** Función para obtener un artículo del caché por ID */
  const getItemFromCache = computed(() => (id: string) => cache.value.get(id))
  /** Indica si hay artículos cargados */
  const hasItems = computed(() => items.value.length > 0)
  /** Número de artículos cargados */
  const getItemsCount = computed(() => items.value.length)
  /** Total de artículos en la base de datos */
  const getTotalItems = computed(() => pagination.value.total)
  /** Indica si hay página siguiente */
  const hasNextPage = computed(() => pagination.value.hasNextPage)
  /** Indica si hay página anterior */
  const hasPrevPage = computed(() => pagination.value.hasPrevPage)
  /** Página actual */
  const getCurrentPage = computed(() => pagination.value.page)
  /** Total de páginas */
  const getTotalPages = computed(() => pagination.value.totalPages)
  
  /** Indica si los datos necesitan ser actualizados */
  const needsRefresh = computed(() => {
    if (!lastFetch.value) return true
    return Date.now() - lastFetch.value > CACHE_DURATION
  })

  // Funciones auxiliares
  
  /**
   * Manejador mejorado de errores del store
   * Procesa errores, los registra y notifica al usuario
   * 
   * @param {any} err - Error capturado
   * @param {string} context - Contexto donde ocurrió el error
   * @returns {string} Mensaje de error procesado
   */
  const handleStoreError = (err: any, context?: string): string => {
    const errorResponse = processError(err)
    const errorMessage = context ? `${context}: ${errorResponse.message}` : errorResponse.message
    
    error.value = errorMessage
    notifyError(errorMessage)
    
    console.error('Items Store Error:', {
      context,
      error: err,
      processed: errorResponse
    })
    
    return errorMessage
  }

  // Acciones del store
  
  /**
   * Inicializa el store si no ha sido inicializado previamente
   * Marca el store como listo para usar
   */
  const initialize = () => {
    if (!isInitialized.value) {
      isInitialized.value = true
      console.log('Items store initialized')
    }
  }

  /**
   * Resetea completamente el estado del store
   * Limpia todos los datos, caché, filtros y cancela peticiones en curso
   */
  const reset = () => {
    items.value = []
    item.value = null
    loading.value = false
    error.value = null
    cache.value.clear()
    lastFetch.value = null
    resetFilters()
    resetPagination()
    
    // Cancelar cualquier búsqueda en curso
    if (searchController.value) {
      searchController.value.abort()
      searchController.value = null
    }
  }

  /**
   * Establece nuevos filtros de búsqueda
   * Combina los filtros existentes con los nuevos
   * 
   * @param {Partial<SearchFilters>} newFilters - Filtros a aplicar
   */
  const setFilters = (newFilters: Partial<SearchFilters>) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  /**
   * Resetea todos los filtros a sus valores por defecto
   * Útil para limpiar búsquedas y volver al estado inicial
   */
  const resetFilters = () => {
    filters.value = {
      query: '',
      category: '',
      condition: '',
      location: '',
      coordinates: null,
      distance: 10,
      sort: 'recent',
      page: 1,
      limit: 12
    }
  }

  /**
   * Establece la página actual para la paginación
   * Actualiza tanto la paginación como los filtros
   * 
   * @param {number} page - Número de página a establecer
   */
  const setPage = (page: number) => {
    pagination.value.page = page
    filters.value.page = page
  }

  /**
   * Resetea la paginación a sus valores por defecto
   * Vuelve a la primera página con configuración inicial
   */
  const resetPagination = () => {
    pagination.value = {
      page: 1,
      limit: 12,
      totalPages: 0,
      total: 0,
      hasNextPage: false,
      hasPrevPage: false
    }
  }

  /**
   * Actualiza la información de paginación basada en la respuesta del servidor
   * Maneja tanto propiedades directas como objetos de paginación anidados
   * 
   * @param {ItemsResponse} response - Respuesta del servidor con datos de paginación
   */
  const updatePagination = (response: ItemsResponse) => {
    // Manejar tanto propiedades directas como objeto de paginación
    const paginationData = response.pagination || {
      page: response.page || 1,
      limit: 12,
      totalPages: response.totalPages || 0,
      hasNextPage: response.hasNextPage || false,
      hasPrevPage: response.hasPrevPage || false
    }
    
    pagination.value = {
      page: paginationData.page || 1,
      limit: paginationData.limit || 12,
      totalPages: paginationData.totalPages || 0,
      total: response.total || response.count || 0,
      hasNextPage: paginationData.hasNextPage || false,
      hasPrevPage: paginationData.hasPrevPage || false
    }
  }

  /**
   * Actualiza el caché con una lista de artículos
   * Almacena cada artículo por su ID para acceso rápido
   * 
   * @param {Item[]} itemsToCache - Artículos a almacenar en caché
   */
  const updateCache = (itemsToCache: Item[]) => {
    // Asegurar que itemsToCache es un array antes de usar forEach
    if (Array.isArray(itemsToCache)) {
      itemsToCache.forEach(itemToCache => {
        cache.value.set(itemToCache._id, itemToCache)
      })
    }
  }

  /**
   * Obtiene una lista de artículos del servidor
   * Implementa caché inteligente y paginación
   * 
   * @param {Record<string, any>} params - Parámetros adicionales para la consulta
   * @param {boolean} forceRefresh - Forzar actualización ignorando caché
   * @param {boolean} append - Agregar resultados a la lista existente (para paginación)
   * @returns {Promise<ItemsResponse | void>} Respuesta del servidor o void si usa caché
   */
  const fetchItems = async (
    params: Record<string, any> = {},
    forceRefresh = false,
    append = false
  ): Promise<ItemsResponse | void> => {
    // Omitir si no es necesario y no se fuerza, pero siempre obtener si no hay artículos
    if (!forceRefresh && !needsRefresh.value && hasItems.value && items.value.length > 0) {
      return
    }

    loading.value = true
    error.value = null
    
    try {
      const response = await itemService.getItems({
        page: pagination.value.page,
        limit: pagination.value.limit,
        ...params
      })
      
      // Actualizar artículos (agregar o reemplazar)
      // La API devuelve artículos en response.data (del middleware advancedResults)
      const responseItems = Array.isArray(response.data) ? response.data : []
      
      console.log('fetchItems - responseItems:', responseItems)
      console.log('fetchItems - full response:', response)
      
      if (append && pagination.value.page > 1) {
        items.value = [...items.value, ...responseItems]
      } else {
        items.value = responseItems
      }
      
      updatePagination(response)
      updateCache(responseItems)
      
      lastFetch.value = Date.now()
      
      return response
    } catch (err) {
      handleStoreError(err, 'Error al obtener items')
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Busca artículos aplicando filtros específicos
   * Incluye cancelación de búsquedas previas para evitar condiciones de carrera
   * 
   * @param {SearchFilters | null} customFilters - Filtros personalizados o null para usar los del estado
   * @returns {Promise<ItemsResponse>} Respuesta con los resultados de búsqueda
   */
  const searchItems = async (customFilters: SearchFilters | null = null): Promise<ItemsResponse> => {
    // Cancelar búsqueda anterior
    if (searchController.value) {
      searchController.value.abort()
    }
    
    // Crear nuevo controlador de cancelación
    searchController.value = new AbortController()
    
    loading.value = true
    error.value = null

    try {
      // Usar filtros personalizados o filtros del estado
      const searchFilters = customFilters || {
        ...filters.value,
        page: pagination.value.page,
        limit: pagination.value.limit
      }

      const response = await itemService.searchItems(searchFilters, {
        signal: searchController.value.signal
      })

      const responseItems = Array.isArray(response.data) ? response.data : []
      items.value = responseItems
      
      console.log('searchItems - responseItems:', responseItems)
      console.log('searchItems - full response:', response)
      updatePagination(response)
      updateCache(responseItems)
      
      lastFetch.value = Date.now()
      searchController.value = null

      return response
    } catch (err) {
      if ((err as any)?.name === 'AbortError') {
        console.log('Search aborted')
        return { items: [], total: 0, page: 1, totalPages: 0, hasNextPage: false, hasPrevPage: false }
      }
      
      handleStoreError(err, 'Error en la búsqueda')
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtiene un item específico por su ID
   * Utiliza caché para optimizar las consultas repetidas
   * 
   * @param {string} id - ID único del item a obtener
   * @param {boolean} forceRefresh - Si true, omite el caché y obtiene datos frescos del servidor
   * @returns {Promise<Item>} Item solicitado
   * @throws {Error} Si ocurre un error al obtener el item
   */
  const fetchItem = async (id: string, forceRefresh = false): Promise<Item> => {
    // Verificar caché primero si no es actualización forzada
    if (!forceRefresh && cache.value.has(id)) {
      const cachedItem = cache.value.get(id)!
      item.value = cachedItem
      return cachedItem
    }

    loading.value = true
    error.value = null
    
    try {
      const fetchedItem = await itemService.getItemById(id)
      item.value = fetchedItem
      
      // Actualizar caché
      cache.value.set(id, fetchedItem)
      
      // Actualizar item en la lista si está presente
      const itemIndex = items.value.findIndex(listItem => listItem._id === id)
      if (itemIndex !== -1) {
        items.value[itemIndex] = fetchedItem
      }
      
      return fetchedItem
    } catch (err) {
      handleStoreError(err, 'Error al obtener el item')
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Crea un nuevo item en el sistema
   * Actualiza automáticamente la lista local y el caché
   * 
   * @param {CreateItemData | FormData} itemData - Datos del nuevo item (objeto o FormData para archivos)
   * @returns {Promise<Item>} Item creado con datos del servidor
   * @throws {Error} Si ocurre un error al crear el item
   */
  const createItem = async (itemData: CreateItemData | FormData): Promise<Item> => {
    loading.value = true
    error.value = null
    
    try {
      const newItem = await itemService.createItem(itemData)
      
      // Agregar al inicio de la lista
      items.value.unshift(newItem)
      
      // Actualizar caché
      cache.value.set(newItem._id, newItem)
      
      // Actualizar total
      pagination.value.total += 1
      
      lastFetch.value = Date.now()
      
      notifySuccess('Item creado exitosamente')
      
      return newItem
    } catch (err) {
      handleStoreError(err, 'Error al crear el item')
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Actualiza un item existente
   * Sincroniza los cambios en la lista local, item actual y caché
   * 
   * @param {string} id - ID del item a actualizar
   * @param {UpdateItemData | FormData} itemData - Nuevos datos del item
   * @returns {Promise<Item>} Item actualizado con datos del servidor
   * @throws {Error} Si ocurre un error al actualizar el item
   */
  const updateItem = async (id: string, itemData: UpdateItemData | FormData): Promise<Item> => {
    loading.value = true
    error.value = null
    
    try {
      const updatedItem = await itemService.updateItem(id, itemData)
      
      // Actualizar item en la lista
      const index = items.value.findIndex(listItem => listItem._id === id)
      if (index !== -1) {
        items.value[index] = updatedItem
      }
      
      // Actualizar item actual si es el mismo
      if (item.value && item.value._id === id) {
        item.value = updatedItem
      }
      
      // Actualizar caché
      cache.value.set(id, updatedItem)
      
      lastFetch.value = Date.now()
      
      notifySuccess('Item actualizado exitosamente')
      
      return updatedItem
    } catch (err) {
      handleStoreError(err, 'Error al actualizar el item')
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Elimina un item del sistema
   * Remueve el item de la lista local, caché y actualiza contadores
   * 
   * @param {string} id - ID del item a eliminar
   * @throws {Error} Si ocurre un error al eliminar el item
   */
  const deleteItem = async (id: string): Promise<void> => {
    loading.value = true
    error.value = null
    
    try {
      await itemService.deleteItem(id)
      
      // Remover de la lista
      items.value = items.value.filter(listItem => listItem._id !== id)
      
      // Limpiar item actual si es el mismo
      if (item.value && item.value._id === id) {
        item.value = null
      }
      
      // Remover del caché
      cache.value.delete(id)
      
      // Actualizar total
      pagination.value.total = Math.max(0, pagination.value.total - 1)
      
      lastFetch.value = Date.now()
      
      notifySuccess('Item eliminado exitosamente')
    } catch (err) {
      handleStoreError(err, 'Error al eliminar el item')
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Alterna la disponibilidad de un item
   * Cambia el estado de disponible/no disponible del item
   * 
   * @param {string} id - ID del item a modificar
   * @returns {Promise<Item>} Item actualizado con el nuevo estado
   * @throws {Error} Si ocurre un error al cambiar la disponibilidad
   */
  const toggleItemAvailability = async (id: string): Promise<Item> => {
    loading.value = true
    error.value = null
    
    try {
      const updatedItem = await itemService.toggleItemAvailability(id)
      
      // Actualizar item en la lista
      const index = items.value.findIndex(listItem => listItem._id === id)
      if (index !== -1) {
        items.value[index] = updatedItem
      }
      
      // Actualizar item actual si es el mismo
      if (item.value && item.value._id === id) {
        item.value = updatedItem
      }
      
      // Actualizar caché
      cache.value.set(id, updatedItem)
      
      lastFetch.value = Date.now()
      
      const status = updatedItem.availability ? 'disponible' : 'no disponible'
      notifySuccess(`Item marcado como ${status}`)
      
      return updatedItem
    } catch (err) {
      handleStoreError(err, 'Error al cambiar la disponibilidad')
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtiene todos los items de un usuario específico
   * Carga la lista de items publicados por el usuario
   * 
   * @param {string} userId - ID del usuario propietario de los items
   * @returns {Promise<Item[]>} Lista de items del usuario
   * @throws {Error} Si ocurre un error al obtener los items
   */
  const fetchItemsByUser = async (userId: string): Promise<Item[]> => {
    loading.value = true
    error.value = null
    
    try {
      const response = await itemService.getItemsByUser(userId)
      items.value = response.items
      
      // Actualizar caché para cada item del usuario
      updateCache(response.items)
      
      // Resetear paginación para items del usuario
      pagination.value = {
        page: 1,
        limit: response.items.length,
        totalPages: 1,
        total: response.items.length,
        hasNextPage: false,
        hasPrevPage: false
      }
      
      lastFetch.value = Date.now()
      
      return response.items
    } catch (err) {
      handleStoreError(err, 'Error al obtener items del usuario')
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtiene todos los items del usuario actual
   * Carga la lista de items publicados por el usuario autenticado
   * 
   * @returns {Promise<Item[]>} Lista de items del usuario actual
   * @throws {Error} Si ocurre un error al obtener los items
   */
  const fetchMyItems = async (): Promise<Item[]> => {
    loading.value = true
    error.value = null
    
    try {
      const response = await itemService.getMyItems()
      items.value = response.items
      
      updateCache(response.items)
      updatePagination(response)
      
      lastFetch.value = Date.now()
      
      return response.items
    } catch (err) {
      handleStoreError(err, 'Error al obtener tus items')
      throw err
    } finally {
      loading.value = false
    }
  }

  // Utility actions

  /**
   * Limpia el error actual del store
   * Resetea el estado de error a null
   */
  const clearError = () => {
    error.value = null
  }

  /**
   * Limpia el item individual seleccionado
   * Resetea el item actual a null
   */
  const clearItem = () => {
    item.value = null
  }

  /**
   * Limpia el caché de items
   * Puede limpiar items específicos o todo el caché
   * 
   * @param {string[]} [itemIds] - IDs específicos a limpiar del caché (opcional)
   */
  const clearCache = (itemIds?: string[]) => {
    if (itemIds && Array.isArray(itemIds)) {
      itemIds.forEach(id => cache.value.delete(id))
    } else if (!itemIds) {
      cache.value.clear()
    }
  }

  /**
   * Cancela la búsqueda actual en progreso
   * Aborta la petición HTTP de búsqueda si está activa
   */
  const cancelSearch = () => {
    if (searchController.value) {
      searchController.value.abort()
      searchController.value = null
    }
  }

  /**
   * Obtiene estadísticas del estado actual del store
   * Proporciona información útil para debugging y monitoreo
   * 
   * @returns {StoreStats} Objeto con estadísticas del store
   */
  const getStoreStats = (): StoreStats => {
    return {
      itemsCount: items.value.length,
      cacheSize: cache.value.size,
      lastFetch: lastFetch.value,
      isInitialized: isInitialized.value,
      hasError: !!error.value,
      isLoading: loading.value
    }
  }

  // Load more items (for infinite scroll)
  /**
   * Carga más items para scroll infinito
   * Incrementa la página actual y carga items adicionales
   * Solo funciona si hay más páginas disponibles y no hay carga en progreso
   */
  const loadMore = async (): Promise<void> => {
    if (!hasNextPage.value || loading.value) return
    
    const nextPage = pagination.value.page + 1
    setPage(nextPage)
    
    await fetchItems({}, false, true)
  }

  /**
   * Refresca los datos actuales
   * Recarga los items aplicando los filtros activos o la búsqueda actual
   * Mantiene el contexto de filtros/búsqueda pero actualiza los datos
   */
  const refresh = async (): Promise<void> => {
    if (hasActiveFilters.value) {
      await searchItems()
    } else {
      await fetchItems({}, true)
    }
  }

  /**
   * Objeto de retorno del store de items
   * Expone el estado reactivo, getters y acciones del store
   */
  return {
    // Estado reactivo (solo lectura)
    items: readonly(items),
    item: readonly(item),
    loading: readonly(loading),
    error: readonly(error),
    pagination: readonly(pagination),
    filters: readonly(filters),
    isInitialized: readonly(isInitialized),
    
    // Getters computados
    getItems,
    getItem,
    currentItem,
    isLoading,
    getError,
    getPagination,
    getFilters,
    hasActiveFilters,
    getItemFromCache,
    hasItems,
    getItemsCount,
    getTotalItems,
    hasNextPage,
    hasPrevPage,
    getCurrentPage,
    getTotalPages,
    needsRefresh,
    
    // Acciones principales
    initialize,
    reset,
    setFilters,
    resetFilters,
    setPage,
    resetPagination,
    fetchItems,
    searchItems,
    fetchItem,
    createItem,
    updateItem,
    deleteItem,
    toggleItemAvailability,
    fetchItemsByUser,
    fetchMyItems,
    
    // Acciones de utilidad
    clearError,
    clearItem,
    clearCache,
    cancelSearch,
    getStoreStats,
    loadMore,
    refresh
  }
})