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
 * @param {Object} options - Opciones adicionales para la petición (como signal para AbortController)
 * @returns {Promise} - Promesa con los datos de los ítems
 */
export const searchItems = async (filters = {}, options = {}) => {
  try {
    console.log('itemService - searchItems llamado con filtros:', JSON.stringify(filters));
    
    // Preparar parámetros de búsqueda (copia profunda para evitar modificar el original)
    const params = JSON.parse(JSON.stringify(filters));
    
    // Si hay coordenadas, convertirlas a formato adecuado para la API
    if (params.coordinates) {
      console.log('itemService - Procesando coordenadas:', JSON.stringify(params.coordinates));
      params.lat = params.coordinates.lat;
      params.lng = params.coordinates.lng;
      delete params.coordinates;
    } else {
      console.log('itemService - No se proporcionaron coordenadas');
    }
    
    // Asegurarse de que los parámetros de texto no sean undefined
    if (params.query === undefined || params.query === null) {
      console.log('itemService - Query es undefined o null, estableciendo valor por defecto');
      params.query = '';
    }
    
    if (params.location === undefined || params.location === null) {
      console.log('itemService - Location es undefined o null, estableciendo valor por defecto');
      params.location = '';
    }
    
    // Renombrar query a q para el backend
    if (params.query !== undefined) {
      params.q = params.query;
      delete params.query;
      console.log('itemService - Renombrando query a q:', params.q);
    }
    
    // Verificar si hay filtros de categoría o condición
    if (params.category) {
      console.log('itemService - Filtro de categoría:', params.category);
    } else {
      console.log('itemService - No hay filtro de categoría');
    }
    
    if (params.condition) {
      console.log('itemService - Filtro de condición:', params.condition);
    } else {
      console.log('itemService - No hay filtro de condición');
    }
    
    console.log('itemService - Enviando parámetros a la API:', JSON.stringify(params));
    
    const response = await axios.get('/api/v1/items/search', { params, ...options });
    console.log('itemService - Respuesta recibida:', JSON.stringify(response.data));
    
    // Verificar la estructura de la respuesta
    if (!response.data) {
      console.error('itemService - Respuesta sin datos');
      throw new Error('Respuesta del servidor sin datos');
    }
    
    // Formatear la respuesta para el componente
    const formattedResponse = {
      data: response.data.data || [],
      total: response.data.count || response.data.total || 0,
      pagination: response.data.pagination || {}
    };
    
    console.log('itemService - Respuesta formateada:', JSON.stringify(formattedResponse));
    return formattedResponse;
  } catch (error) {
    console.error('itemService - Error en searchItems:', error);
    
    // Manejo detallado de errores
    if (error.name === 'AbortError') {
      console.error('itemService - La solicitud fue abortada');
      throw new Error('La búsqueda tardó demasiado y fue cancelada');
    } else if (error.response) {
      console.error('itemService - Error de respuesta:', error.response.status, error.response.data);
      throw new Error(`Error ${error.response.status}: ${error.response.data?.message || 'Error al buscar artículos'}`);
    } else if (error.request) {
      console.error('itemService - Error de solicitud (no se recibió respuesta)');
      throw new Error('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
    } else {
      console.error('itemService - Error al configurar la solicitud:', error.message);
      throw new Error('Error al procesar la solicitud. Por favor, intenta nuevamente.');
    }
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
  console.log('Frontend Service: Data being sent to /api/v1/items:', itemFormData); // Updated URL in log
  // Log FormData entries for debugging
  console.log('Frontend Service: FormData entries before sending:');
  for (let pair of itemFormData.entries()) {
    console.log(pair[0]+ ': ' + (pair[1] instanceof File ? pair[1].name : pair[1]));
  }
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Debes iniciar sesión para crear un ítem');
    
    // Axios automatically sets Content-Type to multipart/form-data when sending FormData
    const response = await axios.post('/api/v1/items', itemFormData, {
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
    
    const response = await axios.put(`/api/v1/items/${id}`, itemFormData, {
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
    
    const response = await axios.delete(`/api/v1/items/${id}`, {
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
    
    const response = await axios.patch(`/api/v1/items/${id}/availability`, { available }, {
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
  
  // Verificar si es un error de AbortController
  if (error.name === 'AbortError') {
    console.error('La solicitud fue abortada (timeout)');
    return new Error('La solicitud tardó demasiado y fue cancelada. Intente nuevamente.');
  }
  
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
      return new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
    }
    
    // Errores específicos según el código de estado
    if (error.response.status === 404) {
      return new Error('El recurso solicitado no existe.');
    }
    
    if (error.response.status === 400) {
      return new Error(`Error en la solicitud: ${error.response.data?.message || 'Parámetros incorrectos'}`);
    }
    
    if (error.response.status === 500) {
      return new Error('Error en el servidor. Por favor, intenta más tarde.');
    }
    
    // Error genérico con información del servidor si está disponible
    return new Error(`Error ${error.response.status}: ${error.response.data?.message || 'Error en la solicitud'}`);
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