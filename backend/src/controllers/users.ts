/**
 * @file users.ts
 * @description Controlador de usuarios para la aplicación Ecommunitas
 * 
 * Este archivo contiene todos los controladores relacionados con la gestión
 * de usuarios en la plataforma, incluyendo perfiles, configuraciones,
 * búsqueda de usuarios, estadísticas y administración.
 * 
 * @features
 * - Gestión de perfiles de usuario
 * - Búsqueda y filtrado de usuarios
 * - Actualización de información personal
 * - Gestión de avatares y fotos de perfil
 * - Configuraciones de privacidad
 * - Estadísticas de usuario
 * - Administración de usuarios (roles, suspensiones)
 * - Geolocalización de usuarios
 * 
 * @technical
 * - Express.js con TypeScript
 * - MongoDB con Mongoose
 * - Cloudinary para gestión de imágenes
 * - Validaciones de entrada
 * - Middleware de autenticación y autorización
 * - Paginación avanzada
 * - Búsqueda geográfica
 * 
 * @routes
 * - GET /api/v1/users - Obtener todos los usuarios (admin)
 * - GET /api/v1/users/me - Obtener perfil del usuario actual
 * - PUT /api/v1/users/me - Actualizar perfil del usuario actual
 * - GET /api/v1/users/:id - Obtener perfil de usuario específico
 * - PUT /api/v1/users/:id - Actualizar usuario específico (admin)
 * - DELETE /api/v1/users/:id - Eliminar usuario (admin)
 * - GET /api/v1/users/search - Buscar usuarios
 * - GET /api/v1/users/nearby - Usuarios cercanos
 * 
 * @functions
 * - getUsers: Lista todos los usuarios con filtros y paginación
 * - getProfile: Obtiene perfil del usuario autenticado
 * - updateProfile: Actualiza perfil del usuario autenticado
 * - getUser: Obtiene perfil de usuario específico
 * - updateUser: Actualiza usuario específico (admin)
 * - deleteUser: Elimina usuario (admin)
 * - searchUsers: Búsqueda avanzada de usuarios
 * - getNearbyUsers: Usuarios cercanos por geolocalización
 * 
 * @author Equipo Ecommunitas
 * @version 1.0.0
 */

import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import asyncHandler from '../utils/async';
import { AppError } from '../utils/app-error';
import { uploadImage, deleteImage } from '../config/cloudinary';
import bcrypt from 'bcrypt';
import path from 'path';
import { UploadedFile } from 'express-fileupload';

// Interfaz para el request autenticado
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
  files?: {
    [key: string]: UploadedFile | UploadedFile[];
  };
}

// Clase para respuestas de error
class ErrorResponse extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

// Interfaz para la respuesta de resultados avanzados
interface AdvancedResultsResponse extends Response {
  advancedResults?: any;
}

// @desc    Get all users
// @route   GET /api/v1/users
// @access  Private/Admin
export const getUsers = asyncHandler(async (req: Request, res: AdvancedResultsResponse, next: NextFunction) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get user profile
// @route   GET /api/v1/user/profile
// @access  Private
export const getProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError('User not authenticated', 401));
  }
  
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Get single user
// @route   GET /api/v1/users/:id
// @access  Private
export const getUser = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new AppError(`User not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is requesting their own profile or is admin
  if (!req.user || req.user.id !== user.id && req.user.role !== 'admin') {
    return next(
      new AppError(
          `User ${req.user?.id} is not authorized to access this profile`,
          401
        )
    );
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Update user details (including profile picture)
// @route   PUT /api/v1/users/:id
// @access  Private
export const updateUser = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    let user = await User.findById(req.params.id);

    if (!user) {
      return next(
        new AppError(`User not found with id of ${req.params.id}`, 404)
      );
    }

    // Make sure user is updating their own profile or is admin
    if (!req.user || req.user.id !== user.id.toString() && req.user.role !== 'admin') {
      return next(
        new AppError(
          `User ${req.user?.id} is not authorized to update this profile`,
          401
        )
      );
    }

    const { name, bio, location, password } = req.body;
    const updateData: any = {};

    // Only update fields that are provided
    if (name !== undefined && name !== '') updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (location !== undefined) updateData.location = location;

    // Handle password update
    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    // Handle avatar upload
    if (req.files && req.files.avatar) {
      const file = Array.isArray(req.files.avatar) ? req.files.avatar[0] : req.files.avatar;

      // Validate image type
      if (!file.mimetype.startsWith('image')) {
        return next(new ErrorResponse('Please upload an image file', 400));
      }

      // Validate image size (default to 5MB if not set)
      const maxSize = (parseInt(process.env.MAX_FILE_UPLOAD_SIZE || '5')) * 1024 * 1024;
      if (file.size > maxSize) {
        return next(
          new ErrorResponse(
            `Please upload an image less than ${process.env.MAX_FILE_UPLOAD_SIZE || 5}MB`,
            400
          )
        );
      }

      try {
        // Delete old avatar if exists and is a Cloudinary URL
        if (user.avatar && user.avatar.startsWith('http')) {
          try {
            await deleteImage(user.avatar);
          } catch (deleteErr) {
            console.warn('Warning: Could not delete old avatar:', deleteErr);
            // Continue with upload even if delete fails
          }
        }

        // Upload new avatar
        const result = await uploadImage(file.tempFilePath, `avatars/${user._id}`);
        updateData.avatar = result.secure_url;
      } catch (err: any) {
        console.error('Cloudinary error:', err);
        
        // Provide more specific error messages
        if (err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT') {
          return next(new ErrorResponse('Connection error with image service. Please try again.', 503));
        } else if (err.message && err.message.includes('timeout')) {
          return next(new ErrorResponse('Image upload timeout. Please try with a smaller image.', 408));
        } else if (err.message && err.message.includes('Invalid image')) {
          return next(new ErrorResponse('Invalid image format. Please upload a valid image file.', 400));
        } else {
          return next(new ErrorResponse('Error uploading image. Please try again later.', 500));
        }
      }
    }

    // Update user with new data
    user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    // Remove password from response
    const userResponse: any = user!.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      data: userResponse
    });
  } catch (error) {
      console.error('Error in updateUser:', error);
      return next(new AppError('Error updating user profile', 500));
    }
});

// @desc    Update user profile
// @route   PUT /api/v1/users/me
// @access  Private
export const updateProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new AppError('User not authenticated', 401));
    }

    const { name, bio, location } = req.body;
    const updateData: any = {};

    // Only update fields that are provided
    if (name !== undefined && name !== '') updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (location !== undefined) updateData.location = location;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    );

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error in updateProfile:', error);
    return next(new AppError('Error updating profile', 500));
  }
});

// @desc    Upload user avatar
// @route   PUT /api/v1/users/avatar
// @access  Private
export const uploadAvatar = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new AppError('User not authenticated', 401));
    }

    if (!req.files || !req.files.avatar) {
      return next(new AppError('Please upload a file', 400));
    }

    const file = Array.isArray(req.files.avatar) ? req.files.avatar[0] : req.files.avatar;
    
    try {
      // Upload image to Cloudinary
      const result = await uploadImage(file.tempFilePath, 'avatars');

      // Update user with new avatar URL
      const user = await User.findByIdAndUpdate(
        req.user.id,
        { avatar: result.secure_url },
        { new: true, runValidators: true }
      );

      if (!user) {
        return next(new AppError('User not found', 404));
      }

      res.status(200).json({
        success: true,
        data: {
          avatar: user.avatar
        }
      });
    } catch (uploadError: any) {
      console.error('Error uploading avatar:', uploadError);
      
      // Provide more specific error messages
      if (uploadError.code === 'ECONNRESET' || uploadError.code === 'ETIMEDOUT') {
        return next(new AppError('Connection error with image service. Please try again.', 503));
      } else if (uploadError.message && uploadError.message.includes('timeout')) {
        return next(new AppError('Image upload timeout. Please try with a smaller image.', 408));
      } else if (uploadError.message && uploadError.message.includes('Invalid image')) {
        return next(new AppError('Invalid image format. Please upload a valid image file.', 400));
      } else {
        return next(new AppError('Error uploading avatar. Please try again later.', 500));
      }
    }
  } catch (error) {
    console.error('Error in uploadAvatar:', error);
    return next(new AppError('Error processing avatar upload', 500));
  }
});

// @desc    Delete user avatar
// @route   DELETE /api/v1/users/avatar
// @access  Private
export const deleteAvatar = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new AppError('User not authenticated', 401));
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $unset: { avatar: 1 } },
      { new: true }
    );

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Avatar deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteAvatar:', error);
    return next(new AppError('Error deleting avatar', 500));
  }
});

// @desc    Search users
// @route   GET /api/v1/users/search
// @access  Private
export const searchUsers = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { q, location, radius } = req.query;
    let query: any = {};

    // Text search
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { bio: { $regex: q, $options: 'i' } }
      ];
    }

    // Location-based search
    if (location && radius) {
      // This would require geospatial indexing in MongoDB
      // For now, we'll do a simple location text match
      query.location = { $regex: location, $options: 'i' };
    }

    const users = await User.find(query)
      .select('name bio location avatar createdAt')
      .limit(20);

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Error in searchUsers:', error);
    return next(new AppError('Error searching users', 500));
  }
});

// @desc    Delete user
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin
export const deleteUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new AppError(`User not found with id of ${req.params.id}`, 404)
    );
  }

  await user.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});