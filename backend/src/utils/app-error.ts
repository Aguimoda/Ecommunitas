export /**
 * @file app-error.ts
 * @description Clase personalizada para manejo de errores de aplicación
 * @module Utils/AppError
 * @version 1.0.0
 * @author Ecommunitas Team
 * @created 2024
 * 
 * Esta clase extiende la clase Error nativa de JavaScript para proporcionar
 * un manejo más específico de errores con códigos de estado HTTP.
 */

/**
 * Clase personalizada para errores de aplicación
 * 
 * @class AppError
 * @extends Error
 * @description
 * Extiende la clase Error nativa para incluir códigos de estado HTTP,
 * facilitando el manejo de errores en APIs REST.
 * 
 * @example
 * ```typescript
 * // Error de validación
 * throw new AppError('Email is required', 400);
 * 
 * // Error de autorización
 * throw new AppError('Access denied', 403);
 * 
 * // Error de recurso no encontrado
 * throw new AppError('User not found', 404);
 * ```
 */
class AppError extends Error {
  /**
   * Código de estado HTTP asociado al error
   * @type {number}
   */
  statusCode: number;

  /**
   * Constructor de la clase AppError
   * 
   * @param {string} message - Mensaje descriptivo del error
   * @param {number} statusCode - Código de estado HTTP (400, 401, 403, 404, 500, etc.)
   * 
   * @example
   * ```typescript
   * const error = new AppError('Invalid credentials', 401);
   * ```
   */
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}