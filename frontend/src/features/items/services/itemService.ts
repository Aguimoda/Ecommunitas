/**
 * Servicio de Items
 * Maneja todas las operaciones de API relacionadas con items
 * Proporciona operaciones CRUD y funcionalidad de búsqueda para items
 */

import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { ITEM_ROUTES } from '@/config/apiRoutes'
import { handleAuthError, processError } from '@/shared/utils/errorHandler'
import type { SearchFilters } from '@/shared/constants/searchFilters'

/**
 * Interfaz que define la estructura de un item
 * @interface Item
 * @property {string} _id - Identificador único del item
 * @property {string} title - Título del item
 * @property {string} description - Descripción detallada del item
 * @property {string} category - Categoría del item
 * @property {string} condition - Estado/condición del item
 * @property {string} location - Ubicación del item
 * @property {Object} coordinates - Coordenadas geográficas opcionales
 * @property {number} coordinates.lat - Latitud
 * @property {number} coordinates.lng - Longitud
 * @property {string[]} images - Array de URLs de imágenes
 * @property {boolean} availability - Disponibilidad del item
 * @property {string} userId - ID del usuario propietario
 * @property {Object} user - Información del usuario (opcional)
 * @property {string} user._id - ID del usuario
 * @property {string} user.name - Nombre del usuario
 * @property {string} user.email - Email del usuario
 * @property {string} createdAt - Fecha de creación
 * @property {string} updatedAt - Fecha de última actualización
 * @property {number} distance - Distancia calculada (opcional)
 */
export interface Item {
  _id: string
  title: string
  description: string
  category: string
  condition: string
  location: string
  coordinates?: {
    lat: number
    lng: number
  }
  images: string[]
  imageUrls: string[]  // Campo del backend
  availability: boolean
  userId: string
  user?: {
    _id: string
    name: string
    email: string
  }
  createdAt: string
  updatedAt: string
  distance?: number
}

/**
 * Interfaz para la respuesta de la API al obtener items
 * @interface ItemsResponse
 * @property {boolean} success - Indica si la operación fue exitosa
 * @property {number} count - Número de items en la respuesta actual
 * @property {Item[]} data - Array de items
 * @property {number} total - Total de items disponibles (opcional)
 * @property {number} page - Página actual (opcional)
 * @property {number} totalPages - Total de páginas (opcional)
 * @property {boolean} hasNextPage - Indica si hay página siguiente (opcional)
 * @property {boolean} hasPrevPage - Indica si hay página anterior (opcional)
 * @property {Object} pagination - Información de paginación detallada (opcional)
 */
export interface ItemsResponse {
  success: boolean
  count: number
  data: Item[]
  total?: number
  page?: number
  totalPages?: number
  hasNextPage?: boolean
  hasPrevPage?: boolean
  pagination?: {
    page: number
    limit: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
    prev?: { page: number; limit: number }
    next?: { page: number; limit: number }
  }
}

/**
 * Interfaz para los datos necesarios para crear un nuevo item
 * @interface CreateItemData
 * @property {string} title - Título del item
 * @property {string} description - Descripción del item
 * @property {string} category - Categoría del item
 * @property {string} condition - Condición del item
 * @property {string} location - Ubicación del item
 * @property {Object} coordinates - Coordenadas geográficas (opcional)
 * @property {File[]} images - Archivos de imagen (opcional)
 */
export interface CreateItemData {
  title: string
  description: string
  category: string
  condition: string
  location: string
  coordinates?: {
    lat: number
    lng: number
  }
  images?: File[]
}

/**
 * Interfaz para los datos de actualización de un item
 * Extiende CreateItemData pero hace todos los campos opcionales
 * @interface UpdateItemData
 * @property {boolean} availability - Disponibilidad del item (opcional)
 */
export interface UpdateItemData extends Partial<CreateItemData> {
  availability?: boolean
}

/**
 * Interfaz para los parámetros de búsqueda
 * @interface SearchParams
 * @property {string} q - Consulta de búsqueda (opcional)
 * @property {number} lat - Latitud para búsqueda por ubicación (opcional)
 * @property {number} lng - Longitud para búsqueda por ubicación (opcional)
 */
export interface SearchParams extends Partial<SearchFilters> {
  q?: string
  lat?: number
  lng?: number
}

// URL base de la API
const API_URL = ITEM_ROUTES.BASE

// Timeout para las peticiones (30 segundos)
const REQUEST_TIMEOUT = 30000

/**
 * Manejador de errores mejorado para el servicio de items
 * Procesa y formatea errores específicos del contexto de items
 * @param {any} error - El error a manejar
 * @param {string} context - Contexto adicional para el error (opcional)
 * @throws {Error} Lanza un error formateado con mensaje descriptivo
 */
const handleItemError = (error: unknown, context?: string): never => {
  const errorResponse = processError(error)
  
  // Maneja errores específicos relacionados con items
  if (errorResponse.statusCode === 401) {
    handleAuthError(error, true)
    throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente')
  }
  
  // Agrega contexto al mensaje de error
  const contextMessage = context ? `${context}: ` : ''
  throw new Error(`${contextMessage}${errorResponse.message}`)
}

/**
 * Verifica si el usuario está autenticado
 * @returns {string} Token de autenticación
 * @throws {Error} Si no hay token de autenticación
 */
const checkAuth = (): string => {
  const token = localStorage.getItem('token')
  if (!token) {
    throw new Error('No estás autenticado. Por favor, inicia sesión')
  }
  return token
}

/**
 * Crea headers con autenticación para peticiones JSON
 * @returns {Object} Objeto con headers de autenticación y content-type
 */
const getAuthHeaders = () => {
  const token = checkAuth()
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
}

/**
 * Crea headers con autenticación para peticiones FormData
 * @returns {Object} Objeto con headers de autenticación
 * @note Content-Type se establece automáticamente por axios para FormData
 */
const getAuthHeadersFormData = () => {
  const token = checkAuth()
  return {
    'Authorization': `Bearer ${token}`
    // Content-Type se establece automáticamente por axios para FormData
  }
}

/**
 * Convierte datos de item a FormData para envío multipart
 * @param {CreateItemData | UpdateItemData} itemData - Datos del item a convertir
 * @returns {FormData} Objeto FormData listo para envío
 */
const createFormData = (itemData: CreateItemData | UpdateItemData): FormData => {
  const formData = new FormData()
  
  Object.entries(itemData).forEach(([key, value]) => {
    if (key === 'images' && value) {
      // Maneja archivos de imagen
      Array.from(value as File[]).forEach(file => {
        formData.append('images', file)
      })
    } else if (key === 'coordinates' && value) {
      // Maneja objeto de coordenadas
      formData.append('coordinates', JSON.stringify(value))
    } else if (value !== null && value !== undefined) {
      formData.append(key, String(value))
    }
  })
  
  return formData
}

/**
 * Convierte filtros de búsqueda a parámetros de API
 * @param {SearchFilters} filters - Filtros de búsqueda
 * @returns {SearchParams} Parámetros formateados para la API
 */
const convertFiltersToParams = (filters: SearchFilters): SearchParams => {
  const params: SearchParams = { ...filters }
  
  // Convierte coordenadas si están presentes
  if (params.coordinates) {
    params.lat = params.coordinates.lat
    params.lng = params.coordinates.lng
    delete params.coordinates
  }
  
  // Renombra parámetro de consulta
  if (params.query) {
    params.q = params.query
    delete params.query
  }
  
  return params
}

/**
 * Obtiene todos los items (público, no requiere autenticación)
 * @param {Partial<SearchParams>} params - Parámetros de consulta para filtrado y paginación
 * @returns {Promise<ItemsResponse>} Promesa con datos de items
 * @throws {Error} Si ocurre un error en la petición
 */
export const getItems = async (params: Partial<SearchParams> = {}): Promise<ItemsResponse> => {
  try {
    const config: AxiosRequestConfig = {
      params,
      timeout: REQUEST_TIMEOUT,
      headers: {
        'Content-Type': 'application/json'
      }
    }
    
    const response: AxiosResponse<ItemsResponse> = await axios.get(API_URL, config)
    
    return response.data
  } catch (error) {
    console.error('getItems error:', error)
    handleItemError(error, 'Error al obtener items')
    throw error // Esta línea nunca se alcanzará pero satisface TypeScript
  }
}

/**
 * Busca items con filtros avanzados
 * @param {SearchFilters} filters - Filtros de búsqueda
 * @param {AxiosRequestConfig} options - Opciones adicionales de petición (como signal de AbortController)
 * @returns {Promise<ItemsResponse>} Promesa con resultados de búsqueda
 * @throws {Error} Si ocurre un error en la búsqueda o si es cancelada
 */
export const searchItems = async (
  filters: SearchFilters = {} as SearchFilters,
  options: AxiosRequestConfig = {}
): Promise<ItemsResponse> => {
  try {
    const params = convertFiltersToParams(filters)
    
    const config: AxiosRequestConfig = {
      params,
      timeout: REQUEST_TIMEOUT,
      ...options
    }
    
    const response: AxiosResponse<ItemsResponse> = await axios.get(ITEM_ROUTES.SEARCH, config)
    return response.data
  } catch (error: unknown) {
    if ((error as any)?.name === 'AbortError') {
      throw new Error('Búsqueda cancelada')
    }
    handleItemError(error, 'Error en la búsqueda')
    throw error // Esta línea nunca se alcanzará pero satisface TypeScript
  }
}

/**
 * Obtiene un item específico por su ID
 * @param {string} id - ID del item
 * @returns {Promise<Item>} Promesa con datos del item
 * @throws {Error} Si ocurre un error al obtener el item
 */
export const getItemById = async (id: string): Promise<Item> => {
  try {
    const response: AxiosResponse<Item> = await axios.get(ITEM_ROUTES.BY_ID(id))
    return response.data
  } catch (error) {
    handleItemError(error, 'Error al obtener el item')
    throw error // Esta línea nunca se alcanzará pero satisface TypeScript
  }
}

/**
 * Crea un nuevo item
 * @param {CreateItemData | FormData} itemData - Datos del item (puede ser objeto o FormData)
 * @returns {Promise<Item>} Promesa con datos del item creado
 * @throws {Error} Si ocurre un error al crear el item
 */
export const createItem = async (itemData: CreateItemData | FormData): Promise<Item> => {
  try {
    let formData: FormData
    
    if (itemData instanceof FormData) {
      formData = itemData
    } else {
      formData = createFormData(itemData)
    }
    
    const response: AxiosResponse<Item> = await axios.post(API_URL, formData, {
      headers: getAuthHeadersFormData(),
      timeout: REQUEST_TIMEOUT
    })
    
    return response.data
  } catch (error) {
    console.error('itemService.createItem: Error:', error)
    handleItemError(error, 'Error al crear el item')
    throw error
  }
}

/**
 * Actualiza un item existente
 * @param {string} id - ID del item
 * @param {UpdateItemData | FormData} itemData - Datos actualizados del item (puede ser objeto o FormData)
 * @returns {Promise<Item>} Promesa con datos del item actualizado
 * @throws {Error} Si ocurre un error al actualizar el item
 */
export const updateItem = async (id: string, itemData: UpdateItemData | FormData): Promise<Item> => {
  try {
    let formData: FormData
    
    if (itemData instanceof FormData) {
      formData = itemData
    } else {
      formData = createFormData(itemData)
    }
    
    const response: AxiosResponse<Item> = await axios.put(ITEM_ROUTES.BY_ID(id), formData, {
      headers: getAuthHeadersFormData(),
      timeout: REQUEST_TIMEOUT
    })
    
    return response.data
  } catch (error) {
    handleItemError(error, 'Error al actualizar el item')
    throw error
  }
}

/**
 * Elimina un item
 * @param {string} id - ID del item
 * @returns {Promise<{message: string}>} Promesa con confirmación de eliminación
 * @throws {Error} Si ocurre un error al eliminar el item
 */
export const deleteItem = async (id: string): Promise<{ message: string }> => {
  try {
    const response: AxiosResponse<{ message: string }> = await axios.delete(ITEM_ROUTES.BY_ID(id), {
      headers: getAuthHeaders(),
      timeout: REQUEST_TIMEOUT
    })
    
    return response.data
  } catch (error) {
    handleItemError(error, 'Error al eliminar el item')
    throw error
  }
}

/**
 * Alterna la disponibilidad de un item
 * @param {string} id - ID del item
 * @returns {Promise<Item>} Promesa con datos del item actualizado
 * @throws {Error} Si ocurre un error al cambiar la disponibilidad
 */
export const toggleItemAvailability = async (id: string): Promise<Item> => {
  try {
    const response: AxiosResponse<Item> = await axios.patch(ITEM_ROUTES.AVAILABILITY(id), {}, {
      headers: getAuthHeaders(),
      timeout: REQUEST_TIMEOUT
    })
    
    return response.data
  } catch (error) {
    handleItemError(error, 'Error al cambiar la disponibilidad')
    throw error
  }
}

/**
 * Obtiene items por ID de usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise<ItemsResponse>} Promesa con items del usuario
 * @throws {Error} Si ocurre un error al obtener los items del usuario
 */
export const getItemsByUser = async (userId: string): Promise<ItemsResponse> => {
  try {
    const response: AxiosResponse<ItemsResponse> = await axios.get(ITEM_ROUTES.BY_USER(userId), {
      timeout: REQUEST_TIMEOUT
    })
    
    return response.data
  } catch (error) {
    handleItemError(error, 'Error al obtener items del usuario')
    throw error
  }
}

/**
 * Obtiene los items del usuario actual (requiere autenticación)
 * @returns {Promise<ItemsResponse>} Promesa con items del usuario actual
 * @throws {Error} Si ocurre un error al obtener los items del usuario
 */
export const getMyItems = async (): Promise<ItemsResponse> => {
  try {
    const response: AxiosResponse<ItemsResponse> = await axios.get(ITEM_ROUTES.BASE, {
      headers: getAuthHeaders(),
      timeout: REQUEST_TIMEOUT
    })
    
    return response.data
  } catch (error) {
    handleItemError(error, 'Error al obtener tus items')
    throw error
  }
}

/**
 * Sube imágenes adicionales a un item existente
 * @param {string} id - ID del item
 * @param {File[]} images - Archivos de imagen a subir
 * @returns {Promise<Item>} Promesa con datos del item actualizado
 * @throws {Error} Si ocurre un error al subir las imágenes
 */
export const uploadItemImages = async (id: string, images: File[]): Promise<Item> => {
  try {
    const formData = new FormData()
    images.forEach(image => {
      formData.append('images', image)
    })
    
    const response: AxiosResponse<Item> = await axios.post(
      `${ITEM_ROUTES.BY_ID(id)}/images`,
      formData,
      {
        headers: getAuthHeadersFormData(),
        timeout: REQUEST_TIMEOUT
      }
    )
    
    return response.data
  } catch (error) {
    handleItemError(error, 'Error al subir imágenes')
    throw error
  }
}

/**
 * Elimina una imagen de un item
 * @param {string} id - ID del item
 * @param {string} imageUrl - URL de la imagen a eliminar
 * @returns {Promise<Item>} Promesa con datos del item actualizado
 * @throws {Error} Si ocurre un error al eliminar la imagen
 */
export const deleteItemImage = async (id: string, imageUrl: string): Promise<Item> => {
  try {
    const response: AxiosResponse<Item> = await axios.delete(
      `${ITEM_ROUTES.BY_ID(id)}/images`,
      {
        headers: getAuthHeaders(),
        data: { imageUrl },
        timeout: REQUEST_TIMEOUT
      }
    )
    
    return response.data
  } catch (error) {
    handleItemError(error, 'Error al eliminar imagen')
    throw error
  }
}

/**
 * Objeto de servicio por defecto con todas las funciones
 * Exporta una instancia única del servicio para uso consistente en toda la aplicación
 */
const itemService = {
  getItems,
  searchItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  toggleItemAvailability,
  getItemsByUser,
  getMyItems,
  uploadItemImages,
  deleteItemImage
}

export default itemService