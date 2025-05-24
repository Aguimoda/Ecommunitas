const Item = require('../models/Item');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { uploadImage, deleteImage } = require('../config/cloudinary');
const path = require('path');
const mongoose = require('mongoose');

// @desc    Get all items
// @route   GET /items
// @access  Public
exports.getItems = asyncHandler(async (req, res, next) => {
  // Filtrar por categoría si se proporciona
  if (req.query.category) {
    req.query.category = { $regex: req.query.category, $options: 'i' };
  }
  
  // Filtrar por ubicación si se proporciona
  if (req.query.location) {
    req.query.location = { $regex: req.query.location, $options: 'i' };
  }
  
  res.status(200).json(res.advancedResults);
});

// @desc    Get single item
// @route   GET /items/:id
// @access  Public
exports.getItem = asyncHandler(async (req, res, next) => {
  const item = await Item.findById(req.params.id).populate('user');

  if (!item) {
    return next(
      new ErrorResponse(`Item not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: item
  });
});

// @desc    Create new item
// @route   POST /items
// @access  Private
exports.createItem = asyncHandler(async (req, res, next) => {
  console.log('Backend Controller: Received request to createItem. Initial req.body:', JSON.stringify(req.body, null, 2));
  console.log('Backend Controller: Received request to createItem. Initial req.files:', req.files);
  console.log('Headers recibidos:', JSON.stringify(req.headers, null, 2));
  console.log('Token de autenticación:', req.headers.authorization);
             try {
    // Add user to req.body
    req.body.user = req.user.id;

    // Validación de campos requeridos
    const { title, description, category, condition, location } = req.body;
    if (!title || !description || !category || !condition || !location) {
      return next(new ErrorResponse('Por favor proporcione todos los campos requeridos', 400));
    }

    // Handle file upload for multiple images (optional)
    let imageUrls = [];
    if (req.files && req.files.images) {
      let files = req.files.images;
      // Ensure files is always an array
      if (!Array.isArray(files)) {
        files = [files];
      }

      // Validate and upload each image
      for (const file of files) {
        // Validar tipo de imagen
        if (!file.mimetype.startsWith('image')) {
          return next(new ErrorResponse('Por favor suba solo archivos de imagen válidos', 400));
        }

        // Validar tamaño de imagen (max 2MB)
        if (file.size > process.env.MAX_FILE_UPLOAD) {
          return next(
            new ErrorResponse(
              `Cada imagen debe ser menor a ${process.env.MAX_FILE_UPLOAD / 1000000}MB`,
              400
            )
          );
        }

        // Subir imagen a Cloudinary
        try {
          const result = await uploadImage(file.tempFilePath);
          imageUrls.push(result.secure_url);
        } catch (err) {
          console.error('Error uploading image to Cloudinary:', err);
          return next(new ErrorResponse('Error al subir una de las imágenes', 500));
        }
      }

      // imageUrls will be populated here if images were processed
    }
    // Ensure imageUrls is always part of req.body, even if empty
    req.body.imageUrls = imageUrls;

    // Log req.body before creating item for debugging
    console.log('Data to be saved (req.body):', JSON.stringify(req.body, null, 2));

    // Crear ítem
    console.log('Datos finales antes de crear el ítem:', JSON.stringify(req.body, null, 2));
    const item = await Item.create(req.body);
    console.log('Ítem creado exitosamente:', JSON.stringify(item, null, 2));
    res.status(201).json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('Error creating item:', error);
    console.error('Stack trace completo:', error.stack);
    // Consider deleting uploaded images if item creation fails
    if (imageUrls && imageUrls.length > 0) {
      for (const url of imageUrls) {
        try {
          await deleteImage(url);
        } catch (deleteErr) {
          console.error('Error deleting uploaded image after failed item creation:', deleteErr);
        }
      }
    }
    return next(new ErrorResponse('Error al crear el artículo en la base de datos', 500));
  }
});

// @desc    Update item
// @route   PUT /items/:id
// @access  Private
exports.updateItem = asyncHandler(async (req, res, next) => {
  try {
    let item = await Item.findById(req.params.id);

    if (!item) {
      return next(
        new ErrorResponse(`Ítem no encontrado con id ${req.params.id}`, 404)
      );
    }

    // Verificar que el usuario es el propietario
    if (item.user.toString() !== req.user.id) {
      return next(
        new ErrorResponse('No autorizado para actualizar este ítem', 401)
      );
    }

    let newImageUrls = [];
    // Manejo de carga de múltiples imágenes si se proporcionan
    if (req.files && req.files.images) {
      let files = req.files.images;
      // Asegurar que files sea siempre un array
      if (!Array.isArray(files)) {
        files = [files];
      }

      // Validar y subir cada nueva imagen
      for (const file of files) {
        // Validar tipo de imagen
        if (!file.mimetype.startsWith('image')) {
          return next(new ErrorResponse('Por favor suba solo archivos de imagen válidos', 400));
        }

        // Validar tamaño de imagen
        if (file.size > process.env.MAX_FILE_UPLOAD) {
          return next(
            new ErrorResponse(
              `Cada imagen debe ser menor a ${process.env.MAX_FILE_UPLOAD / 1000000}MB`,
              400
            )
          );
        }

        // Subir nueva imagen a Cloudinary
        try {
          const result = await uploadImage(file.tempFilePath);
          newImageUrls.push(result.secure_url);
        } catch (err) {
          console.error('Error uploading image during update:', err);
          // Limpiar las imágenes que se hayan subido antes del error
          for (const url of newImageUrls) {
            try {
              await deleteImage(url);
            } catch (deleteErr) {
              console.error('Error cleaning up uploaded images after failure:', deleteErr);
            }
          }
          return next(new ErrorResponse('Error al subir una de las nuevas imágenes', 500));
        }
      }

      // Si se subieron nuevas imágenes exitosamente, eliminar las antiguas de Cloudinary
      if (newImageUrls.length > 0 && item.imageUrls && item.imageUrls.length > 0) {
        for (const oldUrl of item.imageUrls) {
          try {
            await deleteImage(oldUrl);
          } catch (deleteErr) {
            console.error('Error deleting old image during update:', deleteErr);
            // Continuar aunque falle la eliminación de una imagen antigua
          }
        }
        // Actualizar las URLs en el body de la petición
        req.body.imageUrls = newImageUrls;
      }
    } else {
      // Si no se suben nuevas imágenes, mantener las existentes
      delete req.body.imageUrls;
    }

    // Actualizar el ítem
    Object.assign(item, req.body);
    await item.save();

    res.status(200).json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('Error updating item:', error);
    // Si hubo un error y se subieron nuevas imágenes, eliminarlas
    if (newImageUrls && newImageUrls.length > 0) {
      for (const url of newImageUrls) {
        try {
          await deleteImage(url);
        } catch (deleteErr) {
          console.error('Error cleaning up images after update failure:', deleteErr);
        }
      }
    }
    return next(new ErrorResponse('Error al actualizar el artículo', 500));
  }
});

// @desc    Delete item
// @route   DELETE /api/v1/items/:id
// @access  Private
exports.deleteItem = asyncHandler(async (req, res, next) => {
  console.log('CONTROLADOR deleteItem llamado. ID recibido:', req.params.id);
  console.log('Usuario autenticado:', req.user ? req.user.id : 'No autenticado');
  try {
    const item = await Item.findById(req.params.id);
    console.log('Resultado de búsqueda de Item:', item);
    if (!item) {
      console.log('Ítem no encontrado. Lanzando error 404.');
      return next(
        new ErrorResponse(`Ítem no encontrado con id ${req.params.id}`, 404)
      );
    }
    // Verificar que el usuario es el propietario o es admin
    console.log('Propietario del ítem:', item.user ? item.user.toString() : 'Sin usuario');
    console.log('Rol del usuario autenticado:', req.user && req.user.role);
    if (item.user.toString() !== req.user.id && req.user.role !== 'admin') {
      console.log('No autorizado para eliminar este ítem.');
      return next(
        new ErrorResponse('No autorizado para eliminar este ítem', 401)
      );
    }
    // Eliminar imágenes de Cloudinary si existen
    if (item.imageUrls && item.imageUrls.length > 0) {
      for (const imageUrl of item.imageUrls) {
        try {
          await deleteImage(imageUrl);
        } catch (deleteErr) {
          console.error('Error deleting image from Cloudinary:', deleteErr);
        }
      }
    }
    // Eliminar el ítem de la base de datos
    await Item.findByIdAndDelete(req.params.id);
    console.log('Ítem eliminado correctamente.');
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error deleting item:', error);
    return next(new ErrorResponse('Error al eliminar el ítem', 500));
  }
});

// @desc    Get items by user
// @route   GET /items/user/:userId
// @access  Public
exports.getItemsByUser = asyncHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
    return next(new ErrorResponse('ID de usuario no válido', 400));
  }
  
  const items = await Item.find({ user: req.params.userId })
    .sort({ createdAt: -1 })
    .populate('user', 'name avatar');

  res.status(200).json({
    success: true,
    count: items.length,
    data: items
  });
});