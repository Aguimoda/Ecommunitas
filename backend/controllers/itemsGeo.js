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
    console.log('Search text:', searchText, 'length:', searchText.length, 'tipo:', typeof searchText);
    
    // Usar índice de texto para la búsqueda si hay texto
    if (searchText.length > 0) {
      try {
        // Intentar usar el índice de texto
        query.$text = { $search: searchText };
        console.log('Usando índice de texto para la búsqueda');
        
        // Agregar campo de puntuación de relevancia para ordenar resultados
        if (sort === 'relevance') {
          // Agregar campo de puntuación para ordenar por relevancia
          const textScoreProjection = { score: { $meta: 'textScore' } };
          sortOptions = { score: { $meta: 'textScore' } };
          console.log('Ordenando por relevancia de texto');
        }
      } catch (err) {
        console.error('Error al usar índice de texto:', err);
        // Fallback a búsqueda por regex si falla el índice de texto
        query.$or = [
          { title: { $regex: searchText, $options: 'i' } },
          { description: { $regex: searchText, $options: 'i' } }
        ];
        console.log('Fallback a búsqueda por regex');
      }
    } else {
      console.log('Texto de búsqueda vacío después de trim, no se aplica filtro de texto');
    }
  } else {
    console.log('No se proporcionó parámetro de búsqueda de texto');
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
    console.log(`Aplicando filtro geoespacial: lat=${lat}, lng=${lng}, distance=${distance}km`);
    // Verificar que el modelo Item tenga un campo de ubicación geoespacial
    // Si no existe, se debe actualizar el modelo para incluir coordenadas
    if (Item.schema.paths.coordinates) {
      try {
        const parsedLat = parseFloat(lat);
        const parsedLng = parseFloat(lng);
        const parsedDistance = parseInt(distance) || 10; // Valor por defecto 10km
        
        if (isNaN(parsedLat) || isNaN(parsedLng)) {
          console.error('Coordenadas inválidas:', { lat, lng });
        } else {
          query.coordinates = {
            $near: {
              $geometry: {
                type: 'Point',
                coordinates: [parsedLng, parsedLat]
              },
              $maxDistance: parsedDistance * 1000 // Convertir km a metros
            }
          };
          console.log('Filtro geoespacial aplicado correctamente');
        }
      } catch (err) {
        console.error('Error al aplicar filtro geoespacial:', err);
      }
    } else {
      console.error('El modelo no tiene campo de coordenadas para búsqueda geoespacial');
    }
  } else {
    console.log('No se proporcionaron coordenadas para búsqueda geoespacial');
  }

  console.log('Final query object:', JSON.stringify(query, null, 2));

  // Opciones de paginación
  const startIndex = (parseInt(page) - 1) * parseInt(limit);
  const endIndex = parseInt(page) * parseInt(limit);
  const total = await Item.countDocuments(query);

  console.log(`Found ${total} items matching query`);

  // Opciones de ordenación
  let sortOptions = {};
  console.log('Opción de ordenación solicitada:', sort);
  
  switch (sort) {
    case 'recent':
      sortOptions = { createdAt: -1 };
      console.log('Ordenando por más recientes');
      break;
    case 'oldest':
      sortOptions = { createdAt: 1 };
      console.log('Ordenando por más antiguos');
      break;
    case 'az':
      sortOptions = { title: 1 };
      console.log('Ordenando alfabéticamente A-Z');
      break;
    case 'za':
      sortOptions = { title: -1 };
      console.log('Ordenando alfabéticamente Z-A');
      break;
    case 'relevance':
      // La ordenación por relevancia se configura en la sección de búsqueda de texto
      // Si no hay búsqueda de texto, usar ordenación por defecto
      if (!q || q.trim().length === 0) {
        sortOptions = { createdAt: -1 };
        console.log('No hay texto para ordenar por relevancia, usando ordenación por fecha');
      } else {
        // sortOptions ya se configuró en la sección de búsqueda de texto
        console.log('Ordenando por relevancia de texto');
      }
      break;
    case 'nearest':
      // Solo aplicar ordenación por cercanía si se proporcionan coordenadas
      if (lat && lng) {
        // La ordenación por cercanía ya está implícita en la consulta $near
        sortOptions = {}; // No es necesario ordenar explícitamente
        console.log('Ordenando por cercanía (implícito en $near)');
      } else {
        // Si no hay coordenadas, ordenar por fecha de creación (más recientes primero)
        sortOptions = { createdAt: -1 };
        console.log('No hay coordenadas para ordenar por cercanía, usando ordenación por fecha');
      }
      break;
    default:
      sortOptions = { createdAt: -1 }; // Por defecto, ordenar por más recientes
      console.log('Usando ordenación por defecto (más recientes)');
  }

  // Ejecutar la consulta con paginación y ordenación
  const items = await Item.find(query)
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

  pagination.totalPages = Math.ceil(total / parseInt(limit));

  res.status(200).json({
    success: true,
    total,
    pagination,
    data: items
  });
});

/**
 * @desc    Obtener ítems cercanos a una ubicación
 * @route   GET /api/items/nearby
 * @access  Public
 */
exports.getNearbyItems = asyncHandler(async (req, res, next) => {
  const { lat, lng, distance = 10, limit = 10 } = req.query;

  // Validar que se proporcionaron coordenadas
  if (!lat || !lng) {
    return next(new ErrorResponse('Se requieren coordenadas de latitud y longitud', 400));
  }

  // Verificar que el modelo Item tenga un campo de ubicación geoespacial
  if (!Item.schema.paths.coordinates) {
    return next(new ErrorResponse('El modelo no soporta búsquedas geoespaciales', 500));
  }

  // Construir la consulta geoespacial
  const query = {
    coordinates: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [parseFloat(lng), parseFloat(lat)]
        },
        $maxDistance: parseInt(distance) * 1000 // Convertir km a metros
      }
    },
    available: true // Solo ítems disponibles
  };

  // Ejecutar la consulta
  const items = await Item.find(query).limit(parseInt(limit));

  res.status(200).json({
    success: true,
    count: items.length,
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