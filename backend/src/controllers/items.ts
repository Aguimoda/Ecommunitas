import { Request, Response, NextFunction } from 'express';
import Item, { IItem } from '../models/Item';
import { AppError } from '../utils/app-error';
import asyncHandler from '../utils/async';
import { uploadImage, deleteImage } from '../config/cloudinary';
import path from 'path';
import mongoose from 'mongoose';

// Función auxiliar para manejo estandarizado de errores
const handleError = (error: any, defaultMessage = 'Error interno del servidor') => {
  console.error('Error details:', error);
  
  if (error.name === 'ValidationError') {
    const message = Object.values(error.errors).map((val: any) => val.message).join(', ');
    return new AppError(message, 400);
  }
  
  if (error.name === 'CastError') {
    return new AppError('Recurso no encontrado', 404);
  }
  
  if (error.code === 11000) {
    return new AppError('Recurso duplicado', 400);
  }
  
  return new AppError(error.message || defaultMessage, error.statusCode || 500);
};

// @desc    Get all items with basic filtering
// @route   GET /api/v1/items
// @access  Public
export const getItems = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    // El middleware advancedResults ya ha procesado la consulta
    // No necesitamos modificar req.query aquí
    res.status(200).json((res as any).advancedResults);
  } catch (error) {
    return next(handleError(error, 'Error al obtener los artículos'));
  }
});

// @desc    Search items with advanced filters and geospatial capabilities
// @route   GET /api/v1/items/search
// @access  Public
export const searchItems = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
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
    const query: any = {};
    let sortOptions: any = {};

    // Filtro por texto (título y descripción)
    if (q) {
      const searchText = (q as string).trim();
      console.log('Search text:', searchText, 'length:', searchText.length);
      
      if (searchText.length > 0) {
        try {
          // Usar índice de texto para la búsqueda
          query.$text = { $search: searchText };
          console.log('Usando índice de texto para la búsqueda');
          
          // Agregar campo de puntuación de relevancia para ordenar resultados
          if (sort === 'relevance') {
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

    // Variable para indicar si se usa filtro geoespacial
    let useGeospatialQuery = false;
    let geospatialCoords = null;
    let geospatialDistance = null;

    // Filtro geoespacial si se proporcionan coordenadas
    if (lat && lng) {
      console.log(`Aplicando filtro geoespacial: lat=${lat}, lng=${lng}, distance=${distance}km`);
      
      try {
        const parsedLat = parseFloat(lat as string);
        const parsedLng = parseFloat(lng as string);
        const parsedDistance = parseInt(distance as string) || 10;
        
        if (isNaN(parsedLat) || isNaN(parsedLng)) {
          console.error('Coordenadas inválidas:', { lat, lng });
        } else {
          // Validar que las coordenadas estén en rangos válidos
          if (parsedLat < -90 || parsedLat > 90 || parsedLng < -180 || parsedLng > 180) {
            console.error('Coordenadas fuera de rango válido:', { lat: parsedLat, lng: parsedLng });
          } else {
            // Agregar filtro para items con geolocalización habilitada
            query['coordinates.enabled'] = true;
            
            // Usar $near para búsqueda geoespacial optimizada
            // $near ordena automáticamente por distancia y es más eficiente
            query['coordinates.coordinates'] = {
              $near: {
                $geometry: {
                  type: 'Point',
                  coordinates: [parsedLng, parsedLat]
                },
                $maxDistance: parsedDistance * 1000 // Convertir km a metros
              }
            };
            
            // Marcar que tenemos una consulta geoespacial para calcular distancias
            useGeospatialQuery = true;
            geospatialCoords = [parsedLng, parsedLat];
            geospatialDistance = parsedDistance;
            
            console.log('Filtro geoespacial configurado correctamente');
          }
        }
      } catch (err) {
        console.error('Error al procesar coordenadas:', err);
      }
    }

    // Configurar ordenamiento
    if (!useGeospatialQuery) {
      // Solo aplicar ordenamiento manual si no usamos geoespacial
      // (porque $near ya ordena por distancia automáticamente)
      switch (sort) {
        case 'recent':
          sortOptions = { createdAt: -1 };
          break;
        case 'oldest':
          sortOptions = { createdAt: 1 };
          break;
        case 'title':
          sortOptions = { title: 1 };
          break;
        case 'relevance':
          // Ya configurado arriba si hay búsqueda de texto
          if (!sortOptions.score) {
            sortOptions = { createdAt: -1 }; // Fallback
          }
          break;
        default:
          sortOptions = { createdAt: -1 };
      }
    }

    console.log('Query final:', JSON.stringify(query, null, 2));
    console.log('Sort options:', sortOptions);

    // Configurar paginación
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 12;
    const startIndex = (pageNum - 1) * limitNum;

    // Ejecutar consulta
    let itemsQuery = Item.find(query)
      .populate('user', 'name email')
      .skip(startIndex)
      .limit(limitNum);

    // Aplicar ordenamiento solo si no es geoespacial
    if (!useGeospatialQuery && Object.keys(sortOptions).length > 0) {
      itemsQuery = itemsQuery.sort(sortOptions);
    }

    const items = await itemsQuery;
    
    // Calcular distancias si es búsqueda geoespacial
    let itemsWithDistance = items;
    if (useGeospatialQuery && geospatialCoords) {
      itemsWithDistance = items.map(item => {
        const itemObj: any = item.toObject();
        if (item.coordinates && item.coordinates.coordinates) {
          // Calcular distancia usando fórmula de Haversine
          const [itemLng, itemLat] = item.coordinates.coordinates;
          const [searchLng, searchLat] = geospatialCoords;
          
          const R = 6371; // Radio de la Tierra en km
          const dLat = (itemLat - searchLat) * Math.PI / 180;
          const dLng = (itemLng - searchLng) * Math.PI / 180;
          const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                   Math.cos(searchLat * Math.PI / 180) * Math.cos(itemLat * Math.PI / 180) *
                   Math.sin(dLng/2) * Math.sin(dLng/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          const distance = R * c;
          
          itemObj.distance = Math.round(distance * 100) / 100; // Redondear a 2 decimales
        }
        return itemObj;
      });
    }

    // Contar total de documentos para paginación
    const total = await Item.countDocuments(query);
    
    // Calcular información de paginación
    const totalPages = Math.ceil(total / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    console.log(`Búsqueda completada: ${items.length} items encontrados de ${total} total`);

    res.status(200).json({
      success: true,
      count: items.length,
      total,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasNextPage,
        hasPrevPage
      },
      geospatial: useGeospatialQuery ? {
        center: geospatialCoords,
        radius: geospatialDistance
      } : null,
      data: itemsWithDistance
    });
  } catch (error) {
    console.error('Error en searchItems:', error);
    return next(handleError(error, 'Error al buscar artículos'));
  }
});

// @desc    Get single item
// @route   GET /api/v1/items/:id
// @access  Public
export const getItem = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await Item.findById(req.params.id).populate('user', 'name email');

    if (!item) {
      return next(new AppError('Artículo no encontrado', 404));
    }

    res.status(200).json({
      success: true,
      data: item
    });
  } catch (error) {
    return next(handleError(error, 'Error al obtener el artículo'));
  }
});

// @desc    Create new item
// @route   POST /api/v1/items
// @access  Private
export const createItem = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Agregar usuario al cuerpo de la petición
    req.body.user = (req as any).user.id;

    // Procesar coordenadas si se proporcionan
    if (req.body.coordinates) {
      const { lat, lng, enabled } = req.body.coordinates;
      
      if (enabled && lat && lng) {
        const parsedLat = parseFloat(lat);
        const parsedLng = parseFloat(lng);
        
        // Validar coordenadas
        if (isNaN(parsedLat) || isNaN(parsedLng)) {
          return next(new AppError('Coordenadas inválidas', 400));
        }
        
        if (parsedLat < -90 || parsedLat > 90 || parsedLng < -180 || parsedLng > 180) {
          return next(new AppError('Coordenadas fuera de rango válido', 400));
        }
        
        req.body.coordinates = {
          type: 'Point',
          coordinates: [parsedLng, parsedLat],
          enabled: true
        };
      } else {
        req.body.coordinates = {
          type: 'Point',
          coordinates: null,
          enabled: false
        };
      }
    }

    // Procesar imágenes si se proporcionan
    const uploadedImages = [];
    const uploadedPublicIds = [];

    if ((req as any).files && (req as any).files.images) {
      const files = Array.isArray((req as any).files.images) ? (req as any).files.images : [(req as any).files.images];
      const maxFiles = 5;
      
      if (files.length > maxFiles) {
        return next(new AppError(`Máximo ${maxFiles} archivos permitidos`, 400));
      }

      try {
        for (const file of files) {
          // Verificar que el archivo es una imagen
          if (!file.mimetype.startsWith('image')) {
            return next(new AppError('El archivo debe ser una imagen', 400));
          }

          // Verificar tamaño del archivo (5MB máximo)
          const maxFileUpload = parseInt(process.env.MAX_FILE_UPLOAD || '5000000');
          if (file.size > maxFileUpload) {
            return next(new AppError(`Por favor sube una imagen menor a ${maxFileUpload} bytes`, 400));
          }

          // Subir a Cloudinary
          const result = await uploadImage(file.tempFilePath, 'items');

          uploadedImages.push(result.secure_url);
          uploadedPublicIds.push(result.public_id);
        }
      } catch (uploadError) {
        console.error('Error al subir imágenes durante la creación:', uploadError);
        return next(new AppError('Error al subir las imágenes', 500));
      }
    }

    // Agregar URLs de imágenes al cuerpo de la petición
    if (uploadedImages.length > 0) {
      req.body.imageUrls = uploadedImages;
      req.body.imagePublicIds = uploadedPublicIds;
    }

    const item = await Item.create(req.body);
    
    // Poblar el usuario en la respuesta
    await item.populate('user', 'name email');

    res.status(201).json({
      success: true,
      data: item
    });
  } catch (error) {
    return next(handleError(error, 'Error al crear el artículo'));
  }
});

// @desc    Update item
// @route   PUT /api/v1/items/:id
// @access  Private
export const updateItem = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    let item = await Item.findById(req.params.id);

    if (!item) {
      return next(new AppError('Artículo no encontrado', 404));
    }

    // Asegurar que el usuario es el propietario del artículo
    if (item.user.toString() !== (req as any).user.id && (req as any).user.role !== 'admin') {
      return next(new AppError('No autorizado para actualizar este artículo', 401));
    }

    // Procesar imágenes existentes
    let finalImageUrls = [];
    let finalImagePublicIds = [];
    
    if (req.body.existingImages) {
      try {
        finalImageUrls = JSON.parse(req.body.existingImages);
      } catch (e) {
        finalImageUrls = [];
      }
    }
    
    if (req.body.existingImagePublicIds) {
      try {
        finalImagePublicIds = JSON.parse(req.body.existingImagePublicIds);
      } catch (e) {
        finalImagePublicIds = [];
      }
    }

    // Procesar nuevas imágenes si se proporcionan
    const uploadedImages: string[] = [];
    const uploadedPublicIds: string[] = [];

    if (req.files && req.files.images) {
      try {
        const files = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
        
        // Validar que el total no exceda 5 imágenes
        if (finalImageUrls.length + files.length > 5) {
          return next(new AppError('Máximo 5 imágenes permitidas en total', 400));
        }

        for (const file of files) {
          // Validar tipo de archivo
          if (!file.mimetype.startsWith('image/')) {
            return next(new AppError('Solo se permiten archivos de imagen', 400));
          }

          // Validar tamaño de archivo (5MB máximo)
          if (file.size > 5 * 1024 * 1024) {
            return next(new AppError('El archivo es demasiado grande. Máximo 5MB', 400));
          }

          const result = await uploadImage(file.tempFilePath, 'items');

          uploadedImages.push(result.secure_url);
          uploadedPublicIds.push(result.public_id);
        }
        
        // Agregar nuevas imágenes a las existentes
        finalImageUrls = [...finalImageUrls, ...uploadedImages];
        finalImagePublicIds = [...finalImagePublicIds, ...uploadedPublicIds];
      } catch (uploadError) {
        console.error('Error al subir imágenes durante la actualización:', uploadError);
        return next(new AppError('Error al subir las imágenes', 500));
      }
    }

    // Eliminar imágenes de Cloudinary si se especificaron
     if (req.body.imagesToDelete) {
       try {
         const imagesToDeleteArray = JSON.parse(req.body.imagesToDelete);
         for (const imageUrl of imagesToDeleteArray) {
           // Usar directamente la función deleteImage que ya maneja la extracción del public_id
           await deleteImage(imageUrl);
         }
       } catch (e) {
         console.error('Error deleting images from Cloudinary:', e);
       }
     }

    // Procesar coordenadas si se proporcionan
    if (req.body.coordinates) {
      const { lat, lng, enabled } = req.body.coordinates;
      
      if (enabled && lat && lng) {
        const parsedLat = parseFloat(lat);
        const parsedLng = parseFloat(lng);
        
        // Validar coordenadas
        if (isNaN(parsedLat) || isNaN(parsedLng)) {
          return next(new AppError('Coordenadas inválidas', 400));
        }
        
        if (parsedLat < -90 || parsedLat > 90 || parsedLng < -180 || parsedLng > 180) {
          return next(new AppError('Coordenadas fuera de rango válido', 400));
        }
        
        req.body.coordinates = {
          type: 'Point',
          coordinates: [parsedLng, parsedLat],
          enabled: true
        };
      } else {
        req.body.coordinates = {
          type: 'Point',
          coordinates: null,
          enabled: false
        };
      }
    }

    // Actualizar las URLs de imágenes
    req.body.imageUrls = finalImageUrls;
    req.body.imagePublicIds = finalImagePublicIds;

    item = await Item.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('user', 'name email');

    res.status(200).json({
      success: true,
      data: item
    });
  } catch (error) {
    return next(handleError(error, 'Error al actualizar el artículo'));
  }
});

// @desc    Delete item
// @route   DELETE /api/v1/items/:id
// @access  Private
export const deleteItem = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return next(new AppError('Artículo no encontrado', 404));
    }

    // Asegurar que el usuario es el propietario del artículo
    if (item.user.toString() !== (req as any).user.id && (req as any).user.role !== 'admin') {
      return next(new AppError('No autorizado para eliminar este artículo', 401));
    }

    // Eliminar imágenes de Cloudinary si existen
    if (item.imagePublicIds && item.imagePublicIds.length > 0) {
      try {
        for (const publicId of item.imagePublicIds) {
          await deleteImage(publicId);
        }
        console.log('Imágenes eliminadas de Cloudinary');
      } catch (cloudinaryError) {
        console.error('Error al eliminar imágenes de Cloudinary:', cloudinaryError);
        // Continuar con la eliminación del item aunque falle Cloudinary
      }
    }

    await Item.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    return next(handleError(error, 'Error al eliminar el artículo'));
  }
});

// @desc    Upload photo for item
// @route   PUT /api/v1/items/:id/photo
// @access  Private
export const itemPhotoUpload = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return next(new AppError('Artículo no encontrado', 404));
    }

    // Asegurar que el usuario es el propietario del artículo
    if (item.user.toString() !== (req as any).user.id && (req as any).user.role !== 'admin') {
      return next(new AppError('No autorizado para subir foto a este artículo', 401));
    }

    if (!(req as any).files) {
      return next(new AppError('Por favor sube un archivo', 400));
    }

    const files = Array.isArray((req as any).files.file) ? (req as any).files.file : [(req as any).files.file];
    const maxFiles = 5;
    
    if (files.length > maxFiles) {
      return next(new AppError(`Máximo ${maxFiles} archivos permitidos`, 400));
    }

    const uploadedImages = [];
    const uploadedPublicIds = [];

    try {
      for (const file of files) {
        // Verificar que el archivo es una imagen
        if (!file.mimetype.startsWith('image')) {
          return next(new AppError('El archivo debe ser una imagen', 400));
        }

        // Verificar tamaño del archivo (5MB máximo)
        const maxFileUpload = parseInt(process.env.MAX_FILE_UPLOAD || '5000000');
        if (file.size > maxFileUpload) {
          return next(new AppError(`Por favor sube una imagen menor a ${maxFileUpload} bytes`, 400));
        }

        // Subir a Cloudinary
        const result = await uploadImage(file.tempFilePath, 'items');

        uploadedImages.push(result.secure_url);
        uploadedPublicIds.push(result.public_id);
      }

      // Actualizar el item con las nuevas URLs e IDs
      const updatedItem = await Item.findByIdAndUpdate(
        req.params.id,
        {
          $push: {
            imageUrls: { $each: uploadedImages },
            imagePublicIds: { $each: uploadedPublicIds }
          }
        },
        {
          new: true,
          runValidators: true
        }
      ).populate('user', 'name email');

      res.status(200).json({
        success: true,
        data: updatedItem
      });

    } catch (uploadError) {
      console.error('Error al subir imágenes:', uploadError);
      return next(new AppError('Error al subir las imágenes', 500));
    }
  } catch (error) {
    return next(handleError(error, 'Error al subir la foto'));
  }
});

// @desc    Get items by user
// @route   GET /api/v1/items/user/:userId
// @access  Public
export const getItemsByUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const startIndex = (pageNum - 1) * limitNum;

    console.log('[DEBUG] getItemsByUser called with userId:', req.params.userId);
    console.log('[DEBUG] Query params:', { page, limit });

    // Consulta para mostrar artículos del usuario (incluyendo pending y approved)
    const query = {
      user: req.params.userId,
      available: true,
      moderationStatus: { $in: ['pending', 'approved'] }
    };

    console.log('[DEBUG] Query object:', query);

    const items = await Item.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limitNum);

    console.log('[DEBUG] Items found:', items.length);
    console.log('[DEBUG] First item (if exists):', items[0] ? { id: items[0]._id, title: items[0].title, user: items[0].user } : 'No items');

    const total = await Item.countDocuments(query);
    const totalPages = Math.ceil(total / limitNum);

    console.log('[DEBUG] Total items for user:', total);

    res.status(200).json({
      success: true,
      count: items.length,
      total,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      },
      data: items
    });
  } catch (error) {
    console.error('[ERROR] getItemsByUser error:', error);
    return next(handleError(error, 'Error al obtener los artículos del usuario'));
  }
});

// @desc    Get my items
// @route   GET /api/v1/items/me
// @access  Private
export const getMyItems = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 12, status = 'all' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const startIndex = (pageNum - 1) * limitNum;

    const query: any = {
      user: (req as any).user.id
    };

    // Filtrar por estado si se especifica
    if (status !== 'all') {
      if (status === 'available') {
        query.available = true;
      } else if (status === 'unavailable') {
        query.available = false;
      } else if (['pending', 'approved', 'rejected'].includes(status as string)) {
        query.moderationStatus = status;
      }
    }

    const items = await Item.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limitNum);

    const total = await Item.countDocuments(query);
    const totalPages = Math.ceil(total / limitNum);

    res.status(200).json({
      success: true,
      count: items.length,
      total,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      },
      data: items
    });
  } catch (error) {
    return next(handleError(error, 'Error al obtener tus artículos'));
  }
});

// @desc    Approve an item
// @route   PATCH /api/v1/items/:id/approve
// @access  Private/Admin
export const approveItem = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return next(new AppError('Artículo no encontrado', 404));
    }

    item.moderationStatus = 'approved';
    item.moderatedAt = new Date();
    item.moderatedBy = (req as any).user.id;
    item.available = true;

    await item.save();

    res.status(200).json({
      success: true,
      data: item
    });
  } catch (error) {
    return next(handleError(error, 'Error al aprobar el artículo'));
  }
});

// @desc    Reject an item
// @route   PATCH /api/v1/items/:id/reject
// @access  Private/Admin
export const rejectItem = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { reason } = req.body;
    const item = await Item.findById(req.params.id);

    if (!item) {
      return next(new AppError('Artículo no encontrado', 404));
    }

    item.moderationStatus = 'rejected';
    item.moderatedAt = new Date();
    item.moderatedBy = (req as any).user.id;
    item.rejectionReason = reason || 'No especificado';
    item.available = false;

    await item.save();

    res.status(200).json({
      success: true,
      data: item
    });
  } catch (error) {
    return next(handleError(error, 'Error al rechazar el artículo'));
  }
});