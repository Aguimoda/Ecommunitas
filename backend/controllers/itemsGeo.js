const Item = require('../models/Item');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

/**
 * @desc    Buscar ítems con filtros avanzados y geoespaciales
 * @route   GET /api/items/search
 * @access  Public
 */
exports.searchItems = asyncHandler(async (req, res, next) => {
  console.log('SearchItems called with query:', req.query);
  
  // Extraer parámetros de consulta
  const {
    q, // Consulta de texto
    category,
    condition,
    location,
    lat, // Latitud para búsqueda geoespacial
    lng, // Longitud para búsqueda geoespacial
    distance = 10, // Radio de búsqueda en km (por defecto 10km)
    sort = 'recent',
    page = 1,
    limit = 12
  } = req.query;

  // Construir el objeto de consulta
  const query = {};

  // Filtro por texto (título y descripción)
  if (q) {
    const searchText = q.trim();
    console.log('Search text:', searchText);
    
    // Usar índice de texto para la búsqueda si hay texto
    if (searchText.length > 0) {
      try {
        // Intentar usar el índice de texto
        query.$text = { $search: searchText };
      } catch (err) {
        console.error('Error al usar índice de texto:', err);
        // Fallback a búsqueda por regex si falla el índice de texto
        query.$or = [
          { title: { $regex: searchText, $options: 'i' } },
          { description: { $regex: searchText, $options: 'i' } }
        ];
      }
    }
  }

  // Filtro por categoría
  if (category) {
    query.category = category;
  }

  // Filtro por condición
  if (condition) {
    query.condition = condition;
  }

  // Filtro por ubicación (texto)
  if (location) {
    query.location = { $regex: location, $options: 'i' };
  }

  // Filtro por disponibilidad
  query.available = true;

  // Filtro geoespacial si se proporcionan coordenadas
  if (lat && lng) {
    // Verificar que el modelo Item tenga un campo de ubicación geoespacial
    // Si no existe, se debe actualizar el modelo para incluir coordenadas
    if (Item.schema.paths.coordinates) {
      query.coordinates = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(distance) * 1000 // Convertir km a metros
        }
      };
    }
  }

  console.log('Final query object:', JSON.stringify(query, null, 2));

  // Opciones de paginación
  const startIndex = (parseInt(page) - 1) * parseInt(limit);
  const endIndex = parseInt(page) * parseInt(limit);
  const total = await Item.countDocuments(query);

  console.log(`Found ${total} items matching query`);

  // Opciones de ordenación
  let sortOptions = {};
  switch (sort) {
    case 'recent':
      sortOptions = { createdAt: -1 };
      break;
    case 'oldest':
      sortOptions = { createdAt: 1 };
      break;
    case 'az':
      sortOptions = { title: 1 };
      break;
    case 'za':
      sortOptions = { title: -1 };
      break;
    case 'nearest':
      // Si se está ordenando por cercanía, asegurarse de que hay coordenadas
      if (lat && lng && Item.schema.paths.coordinates) {
        // La ordenación por cercanía ya está implícita en la consulta $near
        // No es necesario especificar opciones de ordenación adicionales
      } else {
        // Si no hay coordenadas, ordenar por fecha de creación (más recientes primero)
        sortOptions = { createdAt: -1 };
      }
      break;
    default:
      sortOptions = { createdAt: -1 }; // Por defecto, ordenar por fecha de creación (más recientes primero)
  }

  // Ejecutar la consulta con paginación y ordenación
  const items = await Item.find(query)
    .sort(sortOptions)
    .skip(startIndex)
    .limit(parseInt(limit))
    .populate({
      path: 'user',
      select: 'name email'
    });

  // Información de paginación
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: parseInt(page) + 1,
      limit: parseInt(limit)
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: parseInt(page) - 1,
      limit: parseInt(limit)
    };
  }

  res.status(200).json({
    success: true,
    count: items.length,
    total,
    pagination,
    data: items
  });
});

/**
 * @desc    Actualizar índice geoespacial
 * @route   GET /api/items/geo/update-index
 * @access  Private/Admin
 */
exports.updateGeoIndex = asyncHandler(async (req, res, next) => {
  // Esta función es para crear o actualizar el índice geoespacial en la colección de ítems
  // Solo debería ser accesible para administradores
  
  try {
    // Crear índice geoespacial en el campo 'coordinates'
    await Item.collection.createIndex({ coordinates: '2dsphere' });
    
    res.status(200).json({
      success: true,
      message: 'Índice geoespacial actualizado correctamente'
    });
  } catch (error) {
    return next(new ErrorResponse(`Error al actualizar índice geoespacial: ${error.message}`, 500));
  }
});