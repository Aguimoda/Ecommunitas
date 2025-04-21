import axios from 'axios';

/**
 * Obtiene todos los ítems disponibles
 * @param {Object} params - Parámetros de consulta opcionales (filtros, paginación, etc.)
 * @returns {Promise} - Promesa con los datos de los ítems
 */
export const getItems = async (params = {}) => {
  try {
    const response = await axios.get('/api/items', { params });
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

/**
 * Busca ítems con filtros avanzados
 * @param {Object} filters - Filtros de búsqueda
 * @returns {Promise} - Promesa con los datos de los ítems
 */
export const searchItems = async (filters = {}) => {
  try {
    // Preparar parámetros de búsqueda
    const params = { ...filters };
    
    // Si hay coordenadas, convertirlas a formato adecuado para la API
    if (filters.coordinates) {
      params.lat = filters.coordinates.lat;
      params.lng = filters.coordinates.lng;
      delete params.coordinates;
    }
    
    const response = await axios.get('/api/items/search', { params });
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

/**
 * Obtiene un ítem específico por su ID
 * @param {string} id - ID del ítem
 * @returns {Promise} - Promesa con los datos del ítem
 */
export const getItemById = async (id) => {
  try {
    const response = await axios.get(`/api/items/${id}`);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

/**
 * Crea un nuevo ítem
 * @param {Object} itemData - Datos del ítem a crear
 * @returns {Promise} - Promesa con los datos del ítem creado
 */
export const createItem = async (itemData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Debes iniciar sesión para crear un ítem');
    
    const response = await axios.post('/api/items', itemData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

/**
 * Actualiza un ítem existente
 * @param {string} id - ID del ítem a actualizar
 * @param {Object} itemData - Nuevos datos del ítem
 * @returns {Promise} - Promesa con los datos del ítem actualizado
 */
export const updateItem = async (id, itemData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Debes iniciar sesión para actualizar un ítem');
    
    const response = await axios.put(`/api/items/${id}`, itemData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

/**
 * Elimina un ítem
 * @param {string} id - ID del ítem a eliminar
 * @returns {Promise} - Promesa con el resultado de la eliminación
 */
export const deleteItem = async (id) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Debes iniciar sesión para eliminar un ítem');
    
    const response = await axios.delete(`/api/items/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

/**
 * Actualiza la disponibilidad de un ítem
 * @param {string} id - ID del ítem
 * @param {boolean} available - Estado de disponibilidad
 * @returns {Promise} - Promesa con los datos del ítem actualizado
 */
export const toggleItemAvailability = async (id, available) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Debes iniciar sesión para actualizar un ítem');
    
    const response = await axios.patch(`/api/items/${id}/availability`, { available }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

/**
 * Maneja los errores de las peticiones
 * @param {Error} error - Error capturado
 * @returns {Error} - Error formateado
 */
const handleError = (error) => {
  if (error.response) {
    // El servidor respondió con un código de estado fuera del rango 2xx
    if (error.response.status === 401) {
      return new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
    } else if (error.response.data && error.response.data.message) {
      return new Error(error.response.data.message);
    }
    return new Error('Error en la solicitud. Por favor, intenta nuevamente.');
  } else if (error.request) {
    // La solicitud fue hecha pero no se recibió respuesta
    return new Error('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
  } else {
    // Algo ocurrió al configurar la solicitud
    return error;
  }
};