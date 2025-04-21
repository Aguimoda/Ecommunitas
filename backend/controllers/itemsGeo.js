const Item = require('../models/Item');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

/**
 * @desc    Buscar ítems con filtros avanzados y geoespaciales
 * @route   GET /api/items/search
 * @access  Public
 */
exports.searchItems = asyncHandler(async (req, res, next) => {
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
    query.$text = { $search: q };
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

  // Opciones de paginación
  const startIndex = (parseInt(page) - 1) * parseInt(limit);
  const endIndex = parseInt(page) * parseInt(limit);
  const total = await Item.countDocuments(query);

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
      // La ordenación por cercanía se maneja automáticamente con $near
      if (!lat || !lng) {
        sortOptions = { createdAt: -1 }; // Default si no hay coordenadas
      }
      break;
    default:
      sortOptions = { createdAt: -1 };
  }

  // Ejecutar la consulta
  const items = await Item.find(query)
    .populate('user', 'name')
    .sort(sortOptions)
    .skip(startIndex)
    .limit(parseInt(limit));

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

  // Respuesta
  res.status(200).json({
    success: true,
    count: items.length,
    pagination,
    total,
    items
  });
});

/**
 * @desc    Actualizar el modelo Item para soportar consultas geoespaciales
 * @route   POST /api/items/update-geo-index
 * @access  Private/Admin
 */
exports.updateGeoIndex = asyncHandler(async (req, res, next) => {
  // Esta función debe ser ejecutada por un administrador para actualizar el esquema
  // y añadir índices geoespaciales si no existen
  
  // Verificar si el usuario es administrador
  if (req.user.role !== 'admin') {
    return next(new ErrorResponse('No autorizado para realizar esta acción', 403));
  }

  // Crear índice geoespacial si no existe
  try {
    await Item.collection.createIndex({ coordinates: '2dsphere' });
    
    res.status(200).json({
      success: true,
      message: 'Índice geoespacial creado correctamente'
    });
  } catch (error) {
    return next(new ErrorResponse('Error al crear índice geoespacial', 500));
  }
});