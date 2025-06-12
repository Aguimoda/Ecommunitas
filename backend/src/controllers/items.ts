/**
 * @fileoverview Controladores para la gestión de artículos en el marketplace
 * 
 * Este archivo contiene todos los controladores relacionados con la gestión de artículos,
 * incluyendo operaciones CRUD, búsqueda avanzada, filtrado geoespacial, moderación
 * y gestión de imágenes con Cloudinary.
 * 
 * @features
 * - Operaciones CRUD completas para artículos
 * - Búsqueda avanzada con filtros múltiples
 * - Búsqueda geoespacial por proximidad
 * - Sistema de moderación de contenido
 * - Gestión de imágenes con Cloudinary
 * - Paginación y ordenamiento avanzado
 * - Validación robusta de datos
 * - Manejo estandarizado de errores
 * 
 * @author Equipo de Desarrollo Ecommunitas
 * @version 1.0.0
 * @since 2024
 */

// ========================================================================
// IMPORTACIONES
// ========================================================================

import { Request, Response, NextFunction } from 'express';
import Item, { IItem } from '../models/Item';
import { AppError } from '../utils/app-error';
import asyncHandler from '../utils/async';
import { uploadImage, deleteImage } from '../config/cloudinary';
import path from 'path';
import mongoose from 'mongoose';

// ========================================================================
// FUNCIONES AUXILIARES
// ========================================================================

/**
 * @desc    Función auxiliar para manejo estandarizado de errores
 * @param   {any} error - Objeto de error capturado
 * @param   {string} defaultMessage - Mensaje por defecto si no se puede determinar el error
 * @returns {AppError} Instancia de AppError con mensaje y código apropiados
 */
const handleError = (error: any, defaultMessage = 'Error interno del servidor') => {
  
  /**
   * Error de validación de Mongoose
   * Combina todos los mensajes de validación en uno solo
   */
  if (error.name === 'ValidationError') {
    const message = Object.values(error.errors).map((val: any) => val.message).join(', ');
    return new AppError(message, 400);
  }
  
  /**
   * Error de casting de Mongoose (ID inválido)
   * Indica que el recurso no fue encontrado
   */
  if (error.name === 'CastError') {
    return new AppError('Recurso no encontrado', 404);
  }
  
  /**
   * Error de duplicación de MongoDB
   * Indica violación de índice único
   */
  if (error.code === 11000) {
    return new AppError('Recurso duplicado', 400);
  }
  
  /**
   * Error genérico
   * Utiliza el mensaje del error o el mensaje por defecto
   */
  return new AppError(error.message || defaultMessage, error.statusCode || 500);
};

// ========================================================================
// CONTROLADORES PRINCIPALES
// ========================================================================

/**
 * @desc    Obtener todos los artículos con filtrado básico
 * @route   GET /api/v1/items
 * @access  Public
 * @param   {Request} req - Objeto de petición de Express
 * @param   {Response} res - Objeto de respuesta de Express
 * @param   {NextFunction} next - Función para pasar al siguiente middleware
 * @query   {string} [select] - Campos a incluir en la respuesta
 * @query   {string} [sort] - Campo por el cual ordenar
 * @query   {number} [page] - Número de página para paginación
 * @query   {number} [limit] - Límite de resultados por página
 * @returns {Response} Lista paginada de artículos con metadatos
 */
export const getItems = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    /**
     * El middleware advancedResults ya ha procesado la consulta
     * Incluye paginación, filtrado, ordenamiento y selección de campos
     * Los resultados están disponibles en res.advancedResults
     */
    res.status(200).json((res as any).advancedResults);
  } catch (error) {
    return next(handleError(error, 'Error al obtener los artículos'));
  }
});

/**
 * @desc    Buscar artículos con filtros avanzados y capacidades geoespaciales
 * @route   GET /api/v1/items/search
 * @access  Public
 * @param   {Request} req - Objeto de petición de Express
 * @param   {Response} res - Objeto de respuesta de Express
 * @param   {NextFunction} next - Función para pasar al siguiente middleware
 * @query   {string} [q] - Término de búsqueda de texto
 * @query   {string} [category] - Categoría del artículo
 * @query   {string} [condition] - Condición del artículo
 * @query   {number} [minPrice] - Precio mínimo
 * @query   {number} [maxPrice] - Precio máximo
 * @query   {number} [lat] - Latitud para búsqueda geoespacial
 * @query   {number} [lng] - Longitud para búsqueda geoespacial
 * @query   {number} [radius] - Radio de búsqueda en kilómetros
 * @query   {string} [sort] - Campo de ordenamiento
 * @query   {number} [page] - Número de página
 * @query   {number} [limit] - Límite de resultados por página
 * @returns {Response} Resultados de búsqueda con metadatos y distancias
 */
export const searchItems = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    // SearchItems endpoint called
    
    // ========================================================================
    // EXTRACCIÓN DE PARÁMETROS
    // ========================================================================
    
    /**
     * Extraer parámetros de consulta de la URL
     * Incluye filtros de texto, categoría, precio y ubicación
     */
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

    // ========================================================================
    // CONSTRUCCIÓN DE CONSULTA
    // ========================================================================

    /**
     * Inicializar objetos de consulta y ordenamiento
     * query: Filtros de MongoDB
     * sortOptions: Opciones de ordenamiento
     */
    const query: any = {};
    let sortOptions: any = {};

    /**
     * FILTRO DE BÚSQUEDA DE TEXTO
     * Utiliza índice de texto de MongoDB para búsqueda eficiente
     * Fallback a regex si el índice no está disponible
     */
    if (q) {
      const searchText = (q as string).trim();
      // Processing search text
      
      if (searchText.length > 0) {
        try {
          /**
           * Búsqueda usando índice de texto de MongoDB
           * Más eficiente y con mejor relevancia que regex
           */
          query.$text = { $search: searchText };
          // Using text index for search
          
          /**
           * Ordenamiento por relevancia de texto
           * Utiliza el score de MongoDB para ordenar por relevancia
           */
          if (sort === 'relevance') {
            sortOptions = { score: { $meta: 'textScore' } };
            // Sorting by text relevance
          }
        } catch (err) {
          // Text index error - falling back to regex search
          /**
           * Fallback a búsqueda por expresiones regulares
           * Busca en título y descripción con insensibilidad a mayúsculas
           */
          query.$or = [
            { title: { $regex: searchText, $options: 'i' } },
            { description: { $regex: searchText, $options: 'i' } }
          ];
          // Using regex fallback search
        }
      }
    }

    /**
     * FILTRO POR CATEGORÍA
     * Coincidencia exacta con la categoría especificada
     */
    if (category) {
      query.category = category;
    }

    /**
     * FILTRO POR CONDICIÓN
     * Coincidencia exacta con la condición del artículo
     */
    if (condition) {
      query.condition = condition;
    }

    /**
     * FILTRO POR UBICACIÓN (TEXTO)
     * Búsqueda parcial en el campo de ubicación
     */
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    /**
     * FILTRO POR DISPONIBILIDAD
     * Solo mostrar artículos disponibles para intercambio
     */
    query.available = true;

    // ========================================================================
    // BÚSQUEDA GEOESPACIAL
    // ========================================================================

    /**
     * Variables para control de búsqueda geoespacial
     * Permiten optimizar consultas y calcular distancias
     */
    let useGeospatialQuery = false;
    let geospatialCoords = null;
    let geospatialDistance = null;

    /**
     * FILTRO GEOESPACIAL POR PROXIMIDAD
     * Utiliza índices 2dsphere de MongoDB para búsqueda eficiente
     */
    if (lat && lng) {
      // Applying geospatial filter
      
      try {
        /**
         * Parsear y validar coordenadas de entrada
         * Asegurar que sean números válidos
         */
        const parsedLat = parseFloat(lat as string);
        const parsedLng = parseFloat(lng as string);
        const parsedDistance = parseInt(distance as string) || 10;
        
        if (isNaN(parsedLat) || isNaN(parsedLng)) {
          // Invalid coordinates provided
        } else {
          /**
           * Validar rangos de coordenadas geográficas
           * Latitud: -90 a 90, Longitud: -180 a 180
           */
          if (parsedLat < -90 || parsedLat > 90 || parsedLng < -180 || parsedLng > 180) {
            console.error('Coordenadas fuera de rango válido:', { lat: parsedLat, lng: parsedLng });
          } else {
            /**
             * Filtrar solo artículos con geolocalización habilitada
             * Evita errores en artículos sin coordenadas
             */
            query['coordinates.enabled'] = true;
            
            /**
             * Configurar búsqueda geoespacial con $near
             * - Ordena automáticamente por distancia (más eficiente)
             * - Utiliza índice 2dsphere para optimización
             * - Convierte kilómetros a metros para MongoDB
             */
            query['coordinates.coordinates'] = {
              $near: {
                $geometry: {
                  type: 'Point',
                  coordinates: [parsedLng, parsedLat] // GeoJSON: [lng, lat]
                },
                $maxDistance: parsedDistance * 1000 // Convertir km a metros
              }
            };
            
            /**
             * Marcar uso de consulta geoespacial
             * Permite cálculo posterior de distancias exactas
             */
            useGeospatialQuery = true;
            geospatialCoords = [parsedLng, parsedLat];
            geospatialDistance = parsedDistance;
            
            // Geospatial filter configured successfully
          }
        }
      } catch (err) {
        // Error processing coordinates
      }
    }

    // ========================================================================
    // CONFIGURACIÓN DE ORDENAMIENTO
    // ========================================================================

    /**
     * Configurar ordenamiento según parámetros
     * Nota: $near ordena automáticamente por distancia, no requiere sort manual
     */
    if (!useGeospatialQuery) {
      /**
       * Aplicar ordenamiento manual solo si no hay búsqueda geoespacial
       * $near ya proporciona ordenamiento automático por distancia
       */
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
          /**
           * Ordenamiento por relevancia de texto
           * Ya configurado si hay búsqueda de texto activa
           */
          if (!sortOptions.score) {
            sortOptions = { createdAt: -1 }; // Fallback
          }
          break;
        default:
          sortOptions = { createdAt: -1 };
      }
    }

    // Query and sort options configured

    // ========================================================================
    // CONFIGURACIÓN DE PAGINACIÓN
    // ========================================================================

    /**
     * Configurar parámetros de paginación
     * Calcular índice de inicio para skip de MongoDB
     */
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 12;
    const startIndex = (pageNum - 1) * limitNum;

    // ========================================================================
    // EJECUCIÓN DE CONSULTA
    // ========================================================================

    /**
     * Construir consulta de MongoDB con población de datos relacionados
     * Incluye información básica del usuario propietario
     */
    let itemsQuery = Item.find(query)
      .populate('user', 'name email')
      .skip(startIndex)
      .limit(limitNum);

    /**
     * Aplicar ordenamiento manual solo si no hay búsqueda geoespacial
     * $near ya proporciona ordenamiento automático por distancia
     */
    if (!useGeospatialQuery && Object.keys(sortOptions).length > 0) {
      itemsQuery = itemsQuery.sort(sortOptions);
    }

    /**
     * Ejecutar consulta y obtener resultados
     */
    const items = await itemsQuery;
    
    // ========================================================================
    // CÁLCULO DE DISTANCIAS
    // ========================================================================

    /**
     * Calcular distancias exactas para búsquedas geoespaciales
     * Utiliza fórmula de Haversine para precisión
     */
    let itemsWithDistance = items;
    if (useGeospatialQuery && geospatialCoords) {
      itemsWithDistance = items.map(item => {
        const itemObj: any = item.toObject();
        if (item.coordinates && item.coordinates.coordinates) {
          /**
           * Calcular distancia usando fórmula de Haversine
           * Proporciona distancia exacta entre dos puntos en la Tierra
           */
          const [itemLng, itemLat] = item.coordinates.coordinates;
          const [searchLng, searchLat] = geospatialCoords;
          
          const R = 6371; // Radio de la Tierra en kilómetros
          const dLat = (itemLat - searchLat) * Math.PI / 180;
          const dLng = (itemLng - searchLng) * Math.PI / 180;
          const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                   Math.cos(searchLat * Math.PI / 180) * Math.cos(itemLat * Math.PI / 180) *
                   Math.sin(dLng/2) * Math.sin(dLng/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          const distance = R * c;
          
          /**
           * Agregar distancia redondeada al objeto del artículo
           * Redondeo a 2 decimales para mejor presentación
           */
          itemObj.distance = Math.round(distance * 100) / 100;
        }
        return itemObj;
      });
    }

    // ========================================================================
    // METADATOS DE PAGINACIÓN
    // ========================================================================

    /**
     * Contar total de documentos que coinciden con la consulta
     * Necesario para calcular información de paginación
     */
    const total = await Item.countDocuments(query);
    
    /**
     * Calcular metadatos de paginación
     * Incluye información sobre páginas disponibles
     */
    const totalPages = Math.ceil(total / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    // Search completed successfully

    // ========================================================================
    // RESPUESTA FINAL
    // ========================================================================

    /**
     * Enviar respuesta estructurada con resultados y metadatos
     * Incluye información de paginación y búsqueda geoespacial
     */
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
    return next(handleError(error, 'Error al buscar artículos'));
  }
});

/**
 * @desc    Obtener un artículo específico por su ID
 * @route   GET /api/v1/items/:id
 * @access  Public
 * @param   {Request} req - Objeto de petición de Express
 * @param   {Response} res - Objeto de respuesta de Express
 * @param   {NextFunction} next - Función para pasar al siguiente middleware
 * @params  {string} id - ID del artículo a obtener
 * @returns {Response} Datos completos del artículo con información del usuario
 */
export const getItem = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    /**
     * Buscar artículo por ID e incluir información del usuario propietario
     * Población limitada a campos públicos del usuario
     */
    const item = await Item.findById(req.params.id).populate('user', 'name email');

    /**
     * Verificar si el artículo existe
     * Retornar error 404 si no se encuentra
     */
    if (!item) {
      return next(new AppError('Artículo no encontrado', 404));
    }

    /**
     * Enviar respuesta exitosa con datos del artículo
     */
    res.status(200).json({
      success: true,
      data: item
    });
  } catch (error) {
    return next(handleError(error, 'Error al obtener el artículo'));
  }
});

/**
 * @desc    Crear un nuevo artículo en el marketplace
 * @route   POST /api/v1/items
 * @access  Private
 * @param   {Request} req - Objeto de petición de Express
 * @param   {Response} res - Objeto de respuesta de Express
 * @param   {NextFunction} next - Función para pasar al siguiente middleware
 * @body    { title, description, category, condition, location, coordinates?, imageUrls? }
 * @returns {Response} Artículo creado con datos completos
 */
export const createItem = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    // ========================================================================
    // PREPARACIÓN DE DATOS
    // ========================================================================

    /**
     * Agregar ID del usuario autenticado al artículo
     * El usuario se obtiene del middleware de autenticación
     */
    req.body.user = (req as any).user.id;

    // ========================================================================
    // PROCESAMIENTO DE COORDENADAS
    // ========================================================================

    /**
     * Procesar y validar coordenadas geográficas si se proporcionan
     * Permite geolocalización opcional del artículo
     */
    if (req.body.coordinates) {
      const { lat, lng, enabled } = req.body.coordinates;
      
      if (enabled && lat && lng) {
        const parsedLat = parseFloat(lat);
        const parsedLng = parseFloat(lng);
        
        /**
         * Validar que las coordenadas sean números válidos
         * Prevenir errores de formato en la base de datos
         */
        if (isNaN(parsedLat) || isNaN(parsedLng)) {
          return next(new AppError('Coordenadas inválidas', 400));
        }
        
        /**
         * Validar que las coordenadas estén dentro del rango geográfico válido
         * Latitud: -90 a 90 grados, Longitud: -180 a 180 grados
         */
        if (parsedLat < -90 || parsedLat > 90 || parsedLng < -180 || parsedLng > 180) {
          return next(new AppError('Coordenadas fuera de rango válido', 400));
        }
        
        /**
         * Crear objeto de coordenadas en formato GeoJSON
         * MongoDB requiere formato [longitud, latitud] para índices geoespaciales
         */
        req.body.coordinates = {
          type: 'Point',
          coordinates: [parsedLng, parsedLat],
          enabled: true
        };
      } else {
        /**
         * Deshabilitar coordenadas si no se proporcionan o están deshabilitadas
         */
        req.body.coordinates = {
          type: 'Point',
          coordinates: null,
          enabled: false
        };
      }
    }

    // ========================================================================
    // PROCESAMIENTO DE IMÁGENES
    // ========================================================================

    /**
     * Inicializar arrays para almacenar URLs e IDs públicos de imágenes subidas
     * Necesarios para el rollback en caso de error
     */
    const uploadedImages = [];
    const uploadedPublicIds = [];

    /**
     * Procesar archivos de imagen si se proporcionan en la petición
     * Soporte para múltiples imágenes por artículo
     */
    if ((req as any).files && (req as any).files.images) {
      /**
       * Normalizar archivos a array para procesamiento uniforme
       * express-fileupload puede enviar un solo archivo o array
       */
      const files = Array.isArray((req as any).files.images) ? (req as any).files.images : [(req as any).files.images];
      const maxFiles = 5;
      
      /**
       * Validar límite de archivos por artículo
       * Prevenir abuso de almacenamiento
       */
      if (files.length > maxFiles) {
        return next(new AppError(`Máximo ${maxFiles} archivos permitidos`, 400));
      }

      try {
        /**
         * Procesar cada archivo individualmente
         * Validar formato y tamaño antes de subir
         */
        for (const file of files) {
          /**
           * Verificar que el archivo sea una imagen válida
           * Prevenir subida de archivos maliciosos
           */
          if (!file.mimetype.startsWith('image')) {
            return next(new AppError('El archivo debe ser una imagen', 400));
          }

          /**
           * Validar tamaño del archivo contra límite configurado
           * Prevenir archivos excesivamente grandes
           */
          const maxFileUpload = parseInt(process.env.MAX_FILE_UPLOAD || '5000000');
          if (file.size > maxFileUpload) {
            return next(new AppError(`Por favor sube una imagen menor a ${maxFileUpload} bytes`, 400));
          }

          /**
           * Subir imagen a Cloudinary con carpeta específica
           * Obtener URL segura y ID público para gestión posterior
           */
          const result = await uploadImage(file.tempFilePath, 'items');

          // Verificar que result no sea undefined antes de acceder a sus propiedades
          if (result && result.secure_url && result.public_id) {
            uploadedImages.push(result.secure_url);
            uploadedPublicIds.push(result.public_id);
          } else {
            return next(new AppError('Error al procesar la imagen subida', 500));
          }
        }
      } catch (uploadError) {
        return next(new AppError('Error al subir las imágenes', 500));
      }
    }

    /**
     * Agregar URLs de imágenes subidas al cuerpo de la petición
     * Preparar datos para creación del artículo
     */
    if (uploadedImages.length > 0) {
      req.body.imageUrls = uploadedImages;
      req.body.imagePublicIds = uploadedPublicIds;
    }

    // ========================================================================
    // CREACIÓN DEL ARTÍCULO
    // ========================================================================

    /**
     * Crear nuevo artículo en la base de datos
     * Mongoose validará automáticamente los campos requeridos
     */
    const item = await Item.create(req.body);
    
    /**
     * Poblar información del usuario propietario en la respuesta
     * Incluir solo campos públicos del usuario
     */
    await item.populate('user', 'name email');

    /**
     * Enviar respuesta exitosa con el artículo creado
     * Status 201 indica recurso creado exitosamente
     */
    res.status(201).json({
      success: true,
      data: item
    });
  } catch (error) {
    return next(handleError(error, 'Error al crear el artículo'));
  }
});

/**
 * @desc    Actualizar un artículo existente
 * @route   PUT /api/v1/items/:id
 * @access  Private
 * @param   {Request} req - Objeto de petición de Express
 * @param   {Response} res - Objeto de respuesta de Express
 * @param   {NextFunction} next - Función para pasar al siguiente middleware
 * @params  {string} id - ID del artículo a actualizar
 * @body    { title?, description?, category?, condition?, location?, coordinates?, existingImages?, newImages? }
 * @returns {Response} Artículo actualizado con datos completos
 */
export const updateItem = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    // ========================================================================
    // VALIDACIÓN Y AUTORIZACIÓN
    // ========================================================================

    /**
     * Buscar artículo por ID para verificar existencia
     */
    let item = await Item.findById(req.params.id);

    /**
     * Verificar que el artículo existe
     */
    if (!item) {
      return next(new AppError('Artículo no encontrado', 404));
    }

    /**
     * Verificar autorización del usuario
     * Solo el propietario o administradores pueden actualizar
     */
    if (item.user.toString() !== (req as any).user.id && (req as any).user.role !== 'admin') {
      return next(new AppError('No autorizado para actualizar este artículo', 401));
    }

    // ========================================================================
    // PROCESAMIENTO DE IMÁGENES EXISTENTES
    // ========================================================================

    /**
     * Inicializar arrays para gestión de imágenes
     * Separar imágenes existentes de nuevas imágenes
     */
    let finalImageUrls = [];
    let finalImagePublicIds = [];
    
    /**
     * Procesar imágenes existentes que se mantienen
     * Parsear JSON enviado desde el frontend
     */
    if (req.body.existingImages) {
      try {
        finalImageUrls = JSON.parse(req.body.existingImages);
      } catch (e) {
        finalImageUrls = [];
      }
    }
    
    /**
     * Procesar IDs públicos de imágenes existentes
     * Necesarios para gestión en Cloudinary
     */
    if (req.body.existingImagePublicIds) {
      try {
        finalImagePublicIds = JSON.parse(req.body.existingImagePublicIds);
      } catch (e) {
        finalImagePublicIds = [];
      }
    }

    // ========================================================================
    // PROCESAMIENTO DE NUEVAS IMÁGENES
    // ========================================================================

    /**
     * Inicializar arrays para nuevas imágenes subidas
     * Separar de imágenes existentes para mejor gestión
     */
    const uploadedImages: string[] = [];
    const uploadedPublicIds: string[] = [];

    /**
     * Procesar nuevas imágenes si se proporcionan en la petición
     * Validar límites y formatos antes de subir
     */
    if (req.files && req.files.images) {
      try {
        /**
         * Normalizar archivos a array para procesamiento uniforme
         */
        const files = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
        
        /**
         * Validar límite total de imágenes (existentes + nuevas)
         * Prevenir exceso de almacenamiento por artículo
         */
        if (finalImageUrls.length + files.length > 5) {
          return next(new AppError('Máximo 5 imágenes permitidas en total', 400));
        }

        /**
         * Procesar cada nueva imagen individualmente
         * Validar formato y tamaño antes de subir
         */
        for (const file of files) {
          /**
           * Validar que el archivo sea una imagen
           * Prevenir subida de archivos maliciosos
           */
          if (!file.mimetype.startsWith('image/')) {
            return next(new AppError('Solo se permiten archivos de imagen', 400));
          }

          /**
           * Validar tamaño del archivo (5MB máximo)
           * Prevenir archivos excesivamente grandes
           */
          if (file.size > 5 * 1024 * 1024) {
            return next(new AppError('El archivo es demasiado grande. Máximo 5MB', 400));
          }

          /**
           * Subir nueva imagen a Cloudinary
           * Obtener URL segura y ID público
           */
          const result = await uploadImage(file.tempFilePath, 'items');

          // Verificar que result no sea undefined antes de acceder a sus propiedades
          if (result && result.secure_url && result.public_id) {
            uploadedImages.push(result.secure_url);
            uploadedPublicIds.push(result.public_id);
          } else {
            return next(new AppError('Error al procesar la imagen subida', 500));
          }
        }
        
        /**
         * Combinar imágenes existentes con nuevas imágenes
         * Mantener orden de imágenes para la interfaz
         */
        finalImageUrls = [...finalImageUrls, ...uploadedImages];
        finalImagePublicIds = [...finalImagePublicIds, ...uploadedPublicIds];
      } catch (uploadError) {
        return next(new AppError('Error al subir las imágenes', 500));
      }
    }

    // ========================================================================
    // ELIMINACIÓN DE IMÁGENES
    // ========================================================================

    /**
     * Eliminar imágenes de Cloudinary si se especificaron para eliminación
     * Liberar espacio de almacenamiento y mantener consistencia
     */
     if (req.body.imagesToDelete) {
       try {
         /**
          * Parsear array de URLs de imágenes a eliminar
          * Enviado desde el frontend como JSON string
          */
         const imagesToDeleteArray = JSON.parse(req.body.imagesToDelete);
         
         /**
          * Eliminar cada imagen de Cloudinary individualmente
          * La función deleteImage extrae automáticamente el public_id de la URL
          */
         for (const imageUrl of imagesToDeleteArray) {
           await deleteImage(imageUrl);
         }
       } catch (e) {
         // Error deleting images from Cloudinary
       }
     }

    // ========================================================================
    // PROCESAMIENTO DE COORDENADAS
    // ========================================================================

    /**
     * Procesar y validar coordenadas geográficas si se proporcionan
     * Permite actualizar la ubicación del artículo
     */
    if (req.body.coordinates) {
      const { lat, lng, enabled } = req.body.coordinates;
      
      if (enabled && lat && lng) {
        const parsedLat = parseFloat(lat);
        const parsedLng = parseFloat(lng);
        
        /**
         * Validar que las coordenadas sean números válidos
         */
        if (isNaN(parsedLat) || isNaN(parsedLng)) {
          return next(new AppError('Coordenadas inválidas', 400));
        }
        
        /**
         * Validar rango geográfico válido
         * Latitud: -90 a 90, Longitud: -180 a 180
         */
        if (parsedLat < -90 || parsedLat > 90 || parsedLng < -180 || parsedLng > 180) {
          return next(new AppError('Coordenadas fuera de rango válido', 400));
        }
        
        /**
         * Crear objeto de coordenadas en formato GeoJSON
         * MongoDB requiere [longitud, latitud] para índices geoespaciales
         */
        req.body.coordinates = {
          type: 'Point',
          coordinates: [parsedLng, parsedLat],
          enabled: true
        };
      } else {
        /**
         * Deshabilitar coordenadas si no se proporcionan
         */
        req.body.coordinates = {
          type: 'Point',
          coordinates: null,
          enabled: false
        };
      }
    }

    // ========================================================================
    // ACTUALIZACIÓN DEL ARTÍCULO
    // ========================================================================

    /**
     * Actualizar arrays de imágenes en el cuerpo de la petición
     * Incluir tanto URLs como IDs públicos para gestión completa
     */
    req.body.imageUrls = finalImageUrls;
    req.body.imagePublicIds = finalImagePublicIds;

    /**
     * Actualizar artículo en la base de datos
     * new: true retorna el documento actualizado
     * runValidators: true ejecuta validaciones del esquema
     */
    item = await Item.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('user', 'name email');

    /**
     * Enviar respuesta exitosa con artículo actualizado
     */
    res.status(200).json({
      success: true,
      data: item
    });
  } catch (error) {
    return next(handleError(error, 'Error al actualizar el artículo'));
  }
});

/**
 * @desc    Eliminar un artículo del marketplace
 * @route   DELETE /api/v1/items/:id
 * @access  Private
 * @param   {Request} req - Objeto de petición de Express
 * @param   {Response} res - Objeto de respuesta de Express
 * @param   {NextFunction} next - Función para pasar al siguiente middleware
 * @params  {string} id - ID del artículo a eliminar
 * @returns {Response} Confirmación de eliminación exitosa
 */
export const deleteItem = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    // ========================================================================
    // VALIDACIÓN Y AUTORIZACIÓN
    // ========================================================================

    /**
     * Buscar artículo por ID para verificar existencia
     */
    const item = await Item.findById(req.params.id);

    /**
     * Verificar que el artículo existe
     */
    if (!item) {
      return next(new AppError('Artículo no encontrado', 404));
    }

    /**
     * Verificar autorización del usuario
     * Solo el propietario o administradores pueden eliminar
     */
    if (item.user.toString() !== (req as any).user.id && (req as any).user.role !== 'admin') {
      return next(new AppError('No autorizado para eliminar este artículo', 401));
    }

    // ========================================================================
    // LIMPIEZA DE RECURSOS
    // ========================================================================

    /**
     * Eliminar imágenes asociadas de Cloudinary
     * Liberar espacio de almacenamiento y evitar archivos huérfanos
     */
    if (item.imagePublicIds && item.imagePublicIds.length > 0) {
      try {
        /**
         * Eliminar cada imagen individualmente usando su ID público
         * Cloudinary requiere el public_id para eliminación
         */
        for (const publicId of item.imagePublicIds) {
          await deleteImage(publicId);
        }
        // Images deleted from Cloudinary
      } catch (cloudinaryError) {
        // Error deleting images from Cloudinary - continuing with item deletion
        /**
         * Continuar con la eliminación del artículo aunque falle Cloudinary
         * Prevenir que errores de terceros bloqueen la operación
         */
      }
    }

    // ========================================================================
    // ELIMINACIÓN DEL ARTÍCULO
    // ========================================================================

    /**
     * Eliminar artículo de la base de datos
     * Operación irreversible
     */
    await Item.findByIdAndDelete(req.params.id);

    /**
     * Enviar confirmación de eliminación exitosa
     * Objeto vacío indica que el recurso ya no existe
     */
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    return next(handleError(error, 'Error al eliminar el artículo'));
  }
});

/**
 * @desc    Subir fotos adicionales para un artículo existente
 * @route   PUT /api/v1/items/:id/photo
 * @access  Private
 * @param   {Request} req - Objeto de petición de Express
 * @param   {Response} res - Objeto de respuesta de Express
 * @param   {NextFunction} next - Función para pasar al siguiente middleware
 * @params  {string} id - ID del artículo al que subir fotos
 * @files   {File[]} file - Archivos de imagen a subir (máximo 5)
 * @returns {Response} URLs de las imágenes subidas
 */
export const itemPhotoUpload = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    // ========================================================================
    // VALIDACIÓN Y AUTORIZACIÓN
    // ========================================================================

    /**
     * Buscar artículo por ID para verificar existencia
     */
    const item = await Item.findById(req.params.id);

    /**
     * Verificar que el artículo existe
     */
    if (!item) {
      return next(new AppError('Artículo no encontrado', 404));
    }

    /**
     * Verificar autorización del usuario
     * Solo el propietario o administradores pueden subir fotos
     */
    if (item.user.toString() !== (req as any).user.id && (req as any).user.role !== 'admin') {
      return next(new AppError('No autorizado para subir foto a este artículo', 401));
    }

    /**
     * Verificar que se proporcionaron archivos
     */
    if (!(req as any).files) {
      return next(new AppError('Por favor sube un archivo', 400));
    }

    // ========================================================================
    // VALIDACIÓN DE ARCHIVOS
    // ========================================================================

    /**
     * Normalizar archivos a array para procesamiento uniforme
     * express-fileupload puede enviar un solo archivo o array
     */
    const files = Array.isArray((req as any).files.file) ? (req as any).files.file : [(req as any).files.file];
    const maxFiles = 5;
    
    /**
     * Validar límite de archivos por operación
     * Prevenir abuso de almacenamiento
     */
    if (files.length > maxFiles) {
      return next(new AppError(`Máximo ${maxFiles} archivos permitidos`, 400));
    }

    // ========================================================================
    // PROCESAMIENTO DE IMÁGENES
    // ========================================================================

    /**
     * Inicializar arrays para almacenar resultados de subida
     */
    const uploadedImages = [];
    const uploadedPublicIds = [];

    try {
      /**
       * Procesar cada archivo individualmente
       * Validar formato y tamaño antes de subir
       */
      for (const file of files) {
        /**
         * Verificar que el archivo sea una imagen válida
         * Prevenir subida de archivos maliciosos
         */
        if (!file.mimetype.startsWith('image')) {
          return next(new AppError('El archivo debe ser una imagen', 400));
        }

        /**
         * Validar tamaño del archivo contra límite configurado
         * Prevenir archivos excesivamente grandes (5MB máximo por defecto)
         */
        const maxFileUpload = parseInt(process.env.MAX_FILE_UPLOAD || '5000000');
        if (file.size > maxFileUpload) {
          return next(new AppError(`Por favor sube una imagen menor a ${maxFileUpload} bytes`, 400));
        }

        /**
         * Subir imagen a Cloudinary con carpeta específica
         * Obtener URL segura y ID público para gestión posterior
         */
        const result = await uploadImage(file.tempFilePath, 'items');

        // Verificar que result no sea undefined antes de acceder a sus propiedades
        if (result && result.secure_url && result.public_id) {
          uploadedImages.push(result.secure_url);
          uploadedPublicIds.push(result.public_id);
        } else {
          return next(new AppError('Error al procesar la imagen subida', 500));
        }
      }

      // ========================================================================
      // ACTUALIZACIÓN DEL ARTÍCULO
      // ========================================================================

      /**
       * Actualizar artículo agregando nuevas imágenes a las existentes
       * Usar $push con $each para agregar múltiples elementos al array
       */
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

      /**
       * Enviar respuesta exitosa con artículo actualizado
       * Incluir todas las imágenes (existentes + nuevas)
       */
      res.status(200).json({
        success: true,
        data: updatedItem
      });

    } catch (uploadError) {
      return next(new AppError('Error al subir las imágenes', 500));
    }
  } catch (error) {
    return next(handleError(error, 'Error al subir la foto'));
  }
});

/**
 * @desc    Obtener artículos publicados por un usuario específico
 * @route   GET /api/v1/items/user/:userId
 * @access  Public
 * @param   {Request} req - Objeto de petición de Express
 * @param   {Response} res - Objeto de respuesta de Express
 * @param   {NextFunction} next - Función para pasar al siguiente middleware
 * @params  {string} userId - ID del usuario cuyos artículos se quieren obtener
 * @query   {number} page - Número de página para paginación (default: 1)
 * @query   {number} limit - Límite de artículos por página (default: 12)
 * @returns {Response} Lista paginada de artículos del usuario
 */
export const getItemsByUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    // ========================================================================
    // CONFIGURACIÓN DE PAGINACIÓN
    // ========================================================================

    /**
     * Extraer parámetros de paginación de la query string
     * Valores por defecto: página 1, límite 12 artículos
     */
    const { page = 1, limit = 12 } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const startIndex = (pageNum - 1) * limitNum;

    // getItemsByUser endpoint called

    // ========================================================================
    // CONSTRUCCIÓN DE CONSULTA
    // ========================================================================

    /**
     * Construir consulta para artículos del usuario
     * Incluir artículos pendientes y aprobados, excluir rechazados
     * Solo mostrar artículos disponibles (no eliminados)
     */
    const query = {
      user: req.params.userId,
      available: true,
      moderationStatus: { $in: ['pending', 'approved'] }
    };

    // Query object constructed

    // ========================================================================
    // EJECUCIÓN DE CONSULTA
    // ========================================================================

    /**
     * Ejecutar consulta con paginación y población de usuario
     * Ordenar por fecha de creación (más recientes primero)
     */
    const items = await Item.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limitNum);

    // Items retrieved from database

    // ========================================================================
    // CÁLCULO DE PAGINACIÓN
    // ========================================================================

    /**
     * Contar el total de artículos que coinciden con la consulta
     * Calcular el número total de páginas basado en el límite
     */
    const total = await Item.countDocuments(query);
    const totalPages = Math.ceil(total / limitNum);

    // Total count calculated

    // ========================================================================
    // RESPUESTA JSON
    // ========================================================================

    /**
     * Enviar respuesta con artículos paginados e información de paginación
     * Incluir metadatos de navegación (página anterior/siguiente)
     */
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
    // ========================================================================
    // MANEJO DE ERRORES
    // ========================================================================

    /**
     * Capturar y manejar cualquier error durante la obtención de artículos
     * Registrar el error y pasar al middleware de manejo de errores
     */
    return next(handleError(error, 'Error al obtener los artículos del usuario'));
  }
});

/**
 * @desc    Obtener artículos del usuario autenticado (mis artículos)
 * @route   GET /api/v1/items/me
 * @access  Private
 * @param   {Request} req - Objeto de petición de Express (con usuario autenticado)
 * @param   {Response} res - Objeto de respuesta de Express
 * @param   {NextFunction} next - Función para pasar al siguiente middleware
 * @query   {number} page - Número de página para paginación (default: 1)
 * @query   {number} limit - Límite de artículos por página (default: 12)
 * @query   {string} status - Filtro por estado: 'all', 'available', 'unavailable', 'pending', 'approved', 'rejected' (default: 'all')
 * @returns {Response} Lista paginada de artículos del usuario autenticado
 */
export const getMyItems = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    // ========================================================================
    // CONFIGURACIÓN DE PAGINACIÓN Y FILTROS
    // ========================================================================

    /**
     * Extraer parámetros de paginación y filtro de estado
     * Valores por defecto: página 1, límite 12, mostrar todos los estados
     */
    const { page = 1, limit = 12, status = 'all' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const startIndex = (pageNum - 1) * limitNum;

    // ========================================================================
    // CONSTRUCCIÓN DE CONSULTA BASE
    // ========================================================================

    /**
     * Construir consulta base para artículos del usuario autenticado
     * El ID del usuario se obtiene del token JWT decodificado
     */
    const query: any = {
      user: (req as any).user.id
    };

    // ========================================================================
    // APLICACIÓN DE FILTROS DE ESTADO
    // ========================================================================

    /**
     * Aplicar filtros adicionales basados en el parámetro 'status'
     * Permite filtrar por disponibilidad o estado de moderación
     */
    if (status !== 'all') {
      if (status === 'available') {
        query.available = true;
      } else if (status === 'unavailable') {
        query.available = false;
      } else if (['pending', 'approved', 'rejected'].includes(status as string)) {
        query.moderationStatus = status;
      }
    }

    // ========================================================================
    // EJECUCIÓN DE CONSULTA
    // ========================================================================

    /**
     * Ejecutar consulta con paginación y población de usuario
     * Ordenar por fecha de creación (más recientes primero)
     */
    const items = await Item.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limitNum);

    // ========================================================================
    // CÁLCULO DE PAGINACIÓN
    // ========================================================================

    /**
     * Contar el total de artículos y calcular páginas
     */
    const total = await Item.countDocuments(query);
    const totalPages = Math.ceil(total / limitNum);

    // ========================================================================
    // RESPUESTA JSON
    // ========================================================================

    /**
     * Enviar respuesta con artículos del usuario e información de paginación
     */
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
    // ========================================================================
    // MANEJO DE ERRORES
    // ========================================================================

    /**
     * Capturar y manejar errores durante la obtención de artículos del usuario
     */
    return next(handleError(error, 'Error al obtener tus artículos'));
  }
});

/**
 * @desc    Aprobar un artículo (función de moderación)
 * @route   PATCH /api/v1/items/:id/approve
 * @access  Private/Admin
 * @param   {Request} req - Objeto de petición de Express (con usuario admin autenticado)
 * @param   {Response} res - Objeto de respuesta de Express
 * @param   {NextFunction} next - Función para pasar al siguiente middleware
 * @params  {string} id - ID del artículo a aprobar
 * @returns {Response} Artículo aprobado con estado actualizado
 */
export const approveItem = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    // ========================================================================
    // BÚSQUEDA Y VALIDACIÓN DEL ARTÍCULO
    // ========================================================================

    /**
     * Buscar el artículo por ID
     * Verificar que existe antes de proceder con la aprobación
     */
    const item = await Item.findById(req.params.id);

    if (!item) {
      return next(new AppError('Artículo no encontrado', 404));
    }

    // ========================================================================
    // ACTUALIZACIÓN DEL ESTADO DE MODERACIÓN
    // ========================================================================

    /**
     * Actualizar el estado del artículo a 'aprobado'
     * Registrar la fecha y el moderador que realizó la acción
     * Hacer el artículo disponible para visualización pública
     */
    item.moderationStatus = 'approved';
    item.moderatedAt = new Date();
    item.moderatedBy = (req as any).user.id;
    item.available = true;

    await item.save();

    // ========================================================================
    // RESPUESTA JSON
    // ========================================================================

    /**
     * Enviar respuesta con el artículo aprobado
     */
    res.status(200).json({
      success: true,
      data: item
    });
  } catch (error) {
    // ========================================================================
    // MANEJO DE ERRORES
    // ========================================================================

    /**
     * Capturar y manejar errores durante la aprobación del artículo
     */
    return next(handleError(error, 'Error al aprobar el artículo'));
  }
});

/**
 * @desc    Rechazar un artículo (función de moderación)
 * @route   PATCH /api/v1/items/:id/reject
 * @access  Private/Admin
 * @param   {Request} req - Objeto de petición de Express (con usuario admin autenticado)
 * @param   {Response} res - Objeto de respuesta de Express
 * @param   {NextFunction} next - Función para pasar al siguiente middleware
 * @params  {string} id - ID del artículo a rechazar
 * @body    {string} reason - Razón del rechazo (opcional)
 * @returns {Response} Artículo rechazado con estado actualizado
 */
export const rejectItem = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    // ========================================================================
    // EXTRACCIÓN DE DATOS Y VALIDACIÓN
    // ========================================================================

    /**
     * Extraer la razón del rechazo del cuerpo de la petición
     * Buscar el artículo por ID y verificar que existe
     */
    const { reason } = req.body;
    const item = await Item.findById(req.params.id);

    if (!item) {
      return next(new AppError('Artículo no encontrado', 404));
    }

    // ========================================================================
    // ACTUALIZACIÓN DEL ESTADO DE MODERACIÓN
    // ========================================================================

    /**
     * Actualizar el estado del artículo a 'rechazado'
     * Registrar la fecha, el moderador y la razón del rechazo
     * Hacer el artículo no disponible para visualización pública
     */
    item.moderationStatus = 'rejected';
    item.moderatedAt = new Date();
    item.moderatedBy = (req as any).user.id;
    item.rejectionReason = reason || 'No especificado';
    item.available = false;

    await item.save();

    // ========================================================================
    // RESPUESTA JSON
    // ========================================================================

    /**
     * Enviar respuesta con el artículo rechazado
     */
    res.status(200).json({
      success: true,
      data: item
    });
  } catch (error) {
    // ========================================================================
    // MANEJO DE ERRORES
    // ========================================================================

    /**
     * Capturar y manejar errores durante el rechazo del artículo
     */
    return next(handleError(error, 'Error al rechazar el artículo'));
  }
});