/**
 * @file error.ts
 * @description Middleware centralizado para manejo de errores
 * @module Middleware/ErrorHandler
 * @version 1.0.0
 * @author Ecommunitas Team
 * @created 2024
 * 
 * Este middleware proporciona:
 * - Manejo centralizado de todos los errores de la aplicación
 * - Transformación de errores de Mongoose a formato estándar
 * - Respuestas de error consistentes
 * - Logging de errores para debugging
 * - Ocultación de detalles sensibles en producción
 */

import { Request, Response, NextFunction } from 'express';
import ErrorResponse from '../utils/errorResponse';

/**
 * Middleware de manejo centralizado de errores
 * 
 * @function errorHandler
 * @param {any} err - Error capturado
 * @param {Request} req - Objeto de solicitud de Express
 * @param {Response} res - Objeto de respuesta de Express
 * @param {NextFunction} next - Función next de Express
 * 
 * @description
 * Maneja diferentes tipos de errores:
 * - CastError de Mongoose (ID inválido)
 * - Errores de duplicación (código 11000)
 * - Errores de validación de Mongoose
 * - Errores personalizados de ErrorResponse
 * - Errores genéricos del servidor
 * 
 * @example
 * ```typescript
 * // En app.ts
 * app.use(errorHandler);
 * 
 * // Los errores se capturan automáticamente:
 * throw new ErrorResponse('Usuario no encontrado', 404);
 * ```
 */
const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console for dev (keeping original behavior)
  if (process.env.NODE_ENV === 'development') {
    console.log(err.stack);
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    error = new ErrorResponse(message, 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = new ErrorResponse(message, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val: any) => val.message);
    error = new ErrorResponse(message.join(', '), 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error'
  });
};

// Handle unhandled promise rejections
export const handleUnhandledRejection = (): void => {
  process.on('unhandledRejection', (err: Error, promise: Promise<any>) => {
    console.error('Unhandled Promise Rejection:', err.message);
    console.error('Promise:', promise);
    
    // Close server & exit process
    process.exit(1);
  });
};

// Handle uncaught exceptions
export const handleUncaughtException = (): void => {
  process.on('uncaughtException', (err: Error) => {
    console.error('Uncaught Exception:', err.message);
    console.error('Stack:', err.stack);
    
    // Close server & exit process
    process.exit(1);
  });
};

/**
 * Handle undefined routes
 */
export const handleUndefinedRoutes = (req: Request, res: Response, next: NextFunction): void => {
  const message = `Can't find ${req.originalUrl} on this server!`;
  next(new ErrorResponse(message, 404));
};

// Async error wrapper
export const asyncErrorHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Validation error formatter
export const formatValidationErrors = (errors: any[]): string[] => {
  return errors.map(error => {
    if (typeof error === 'string') {
      return error;
    }
    if (error.message) {
      return error.message;
    }
    if (error.msg) {
      return error.msg;
    }
    return 'Validation error';
  });
};

// Database connection error handler
export const handleDatabaseError = (err: any): void => {
  console.error('Database connection error:', err.message);
  
  if (err.name === 'MongoNetworkError') {
    console.error('MongoDB network error - check your connection');
  } else if (err.name === 'MongooseServerSelectionError') {
    console.error('MongoDB server selection error - check if MongoDB is running');
  } else if (err.name === 'MongoParseError') {
    console.error('MongoDB parse error - check your connection string');
  }
  
  process.exit(1);
};

// Rate limit error handler
export const handleRateLimitError = (req: Request, res: Response): void => {
  const errorResponse = {
    success: false,
    error: 'Too many requests, please try again later',
    message: 'Rate limit exceeded'
  };
  
  res.status(429).json(errorResponse);
};

// CORS error handler
export const handleCORSError = (req: Request, res: Response): void => {
  const errorResponse = {
    success: false,
    error: 'CORS policy violation',
    message: 'Origin not allowed'
  };
  
  res.status(403).json(errorResponse);
};

export default {
  errorHandler,
  notFound: handleUndefinedRoutes,
  asyncErrorHandler,
  handleUnhandledRejection,
  handleUncaughtException,
  formatValidationErrors,
  handleDatabaseError,
  handleRateLimitError,
  handleCORSError
};