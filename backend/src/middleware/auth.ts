/**
 * @file auth.ts
 * @description Middleware de autenticación y autorización para la API
 * @module Middleware/Auth
 * @version 1.0.0
 * @author Ecommunitas Team
 * @created 2024
 * 
 * Este middleware proporciona:
 * - Protección de rutas mediante tokens JWT
 * - Verificación de autenticación de usuarios
 * - Control de acceso basado en roles
 * - Manejo de tokens desde headers y cookies
 * - Validación de permisos específicos
 */

import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import asyncHandler from '../utils/async';
import ErrorResponse from '../utils/errorResponse';
import User from '../models/User';

/**
 * Interfaz que extiende Request para incluir información del usuario autenticado
 */
interface AuthenticatedRequest extends Request {
  /** Usuario autenticado obtenido del token JWT */
  user?: any;
}

/**
 * Middleware de protección de rutas
 * Verifica que el usuario esté autenticado mediante token JWT
 * 
 * @param {AuthenticatedRequest} req - Objeto de solicitud con usuario
 * @param {Response} res - Objeto de respuesta de Express
 * @param {NextFunction} next - Función de continuación
 * 
 * @description
 * - Extrae el token del header Authorization o cookies
 * - Verifica la validez del token JWT
 * - Obtiene la información del usuario desde la base de datos
 * - Añade el usuario al objeto request para uso posterior
 * 
 * @example
 * ```typescript
 * // Proteger una ruta
 * router.get('/protected', protect, controller);
 * ```
 */
export const protect = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  // Make sure token exists
  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    req.user = await User.findById(decoded.id);

    next();
  } catch (err) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
};

/**
 * Middleware de autorización basado en roles
 * Controla el acceso a rutas según los roles del usuario
 * 
 * @param {...string} roles - Lista de roles permitidos para acceder a la ruta
 * @returns {Function} Middleware que verifica los roles del usuario
 * 
 * @description
 * - Verifica que el usuario tenga uno de los roles especificados
 * - Debe usarse después del middleware protect
 * - Retorna error 403 si el usuario no tiene permisos
 * 
 * @example
 * ```typescript
 * // Solo administradores pueden acceder
 * router.delete('/users/:id', protect, authorize('admin'), deleteUser);
 * 
 * // Administradores y moderadores pueden acceder
 * router.put('/items/:id/moderate', protect, authorize('admin', 'moderator'), moderateItem);
 * ```
 */
export const authorize = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user?.role || 'unknown'} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};