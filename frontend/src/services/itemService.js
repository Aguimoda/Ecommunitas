import axios from 'axios';

/**
 * Obtiene todos los ítems disponibles
 * @param {Object} params - Parámetros de consulta opcionales (filtros, paginación, etc.)
 * @returns {Promise} - Promesa con los datos de los ítems
 */
export const getItems = async (params = {}) => {
  try {
    const response = await axios.get('/api/v1/items', { params });
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
export const searchItems = async (filters = {}, options = {}) => {
  try {
    console.log('itemService - searchItems llamado con filtros:', filters);
    
    // Preparar parámetros de búsqueda
    const params = { ...filters };
    
    // Si hay coordenadas, convertirlas a formato adecuado para la API
    if (filters.coordinates) {
      params.lat = filters.coordinates.lat;
      params.lng = filters.coordinates.lng;
      delete params.coordinates;
    }
    
    // Asegurarse de que los parámetros de texto no sean undefined
    if (params.query === undefined) params.query = '';
    if (params.location === undefined) params.location = '';
    
    // Renombrar query a q para el backend
    if (params.query !== undefined) {
      params.q = params.query;
      delete params.query;
    }
    
    console.log('itemService - Enviando parámetros a la API:', params);
    
    const response = await axios.get('/api/v1/items/search', { params, ...options });
    console.log('itemService - Respuesta recibida:', response.data);
    
    // Formatear la respuesta para el componente
    return {
      data: response.data.data || [],
      total: response.data.total || 0,
      pagination: response.data.pagination || {}
    };
  } catch (error) {
    console.error('itemService - Error en searchItems:', error);
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
    const response = await axios.get(`/api/v1/items/${id}`);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

/**
 * Crea un nuevo ítem
 * @param {FormData} itemFormData - Datos del ítem a crear (incluyendo archivo de imagen)
 * @returns {Promise} - Promesa con los datos del ítem creado
 */
export const createItem = async (itemFormData) => { // Changed parameter name for clarity
  console.log('Frontend Service: Data being sent to /api/items:', itemFormData); // Added console.log
  // Log FormData entries for debugging
  console.log('Frontend Service: FormData entries before sending:');
  for (let pair of itemFormData.entries()) {
    console.log(pair[0]+ ': ' + (pair[1] instanceof File ? pair[1].name : pair[1]));
  }
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Debes iniciar sesión para crear un ítem');
    
    // Axios automatically sets Content-Type to multipart/form-data when sending FormData
    const response = await axios.post('/api/items', itemFormData, {
      headers: {
        'Authorization': `Bearer ${token}`
        // 'Content-Type': 'multipart/form-data' // No need to set manually for FormData
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
 * @param {FormData} itemFormData - Datos actualizados del ítem
 * @returns {Promise} - Promesa con los datos del ítem actualizado
 */
export const updateItem = async (id, itemFormData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Debes iniciar sesión para actualizar un ítem');
    
    const response = await axios.put(`/api/items/${id}`, itemFormData, {
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
 * Marca un ítem como disponible o no disponible
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
 * Maneja errores de las peticiones HTTP
 * @param {Error} error - Error de la petición
 * @returns {Error} - Error formateado
 */
const handleError = (error) => {
  console.error('Error en la petición HTTP:', error);
  
  if (error.response) {
    // El servidor respondió con un código de estado fuera del rango 2xx
    console.error('Respuesta del servidor:', error.response.data);
    console.error('Código de estado:', error.response.status);
    
    // Si el error es de autenticación, redirigir al login
    if (error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Si estamos en un entorno con Vue Router, podríamos redirigir aquí
      // router.push('/login');
    }
    
    return error;
  } else if (error.request) {
    // La petición fue hecha pero no se recibió respuesta
    console.error('No se recibió respuesta del servidor');
    return new Error('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
  } else {
    // Algo ocurrió al configurar la petición
    console.error('Error al configurar la petición:', error.message);
    return new Error('Error al procesar la solicitud. Por favor, intenta nuevamente.');
  }
};