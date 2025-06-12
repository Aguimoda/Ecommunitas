/**
 * @file errorResponse.ts
 * @description Clase personalizada para manejo de errores con códigos de estado HTTP
 * @module Utils/ErrorResponse
 * @version 1.0.0
 * @author Ecommunitas Team
 * @created 2024
 * 
 * Esta clase extiende la clase Error nativa de JavaScript para incluir
 * códigos de estado HTTP, facilitando el manejo consistente de errores
 * en toda la aplicación.
 */

/**
 * Clase personalizada para errores con código de estado HTTP
 * 
 * @class ErrorResponse
 * @extends Error
 * 
 * @description
 * Permite crear errores personalizados que incluyen un código de estado HTTP,
 * facilitando el manejo de errores en el middleware de error handling.
 * 
 * @example
 * ```typescript
 * // Crear un error 404
 * throw new ErrorResponse('Usuario no encontrado', 404);
 * 
 * // Crear un error 400
 * throw new ErrorResponse('Datos inválidos', 400);
 * 
 * // Crear un error 500
 * throw new ErrorResponse('Error interno del servidor', 500);
 * ```
 */
class ErrorResponse extends Error {
  /** Código de estado HTTP asociado al error */
  statusCode: number;

  /**
   * Constructor de la clase ErrorResponse
   * 
   * @param {string} message - Mensaje descriptivo del error
   * @param {number} statusCode - Código de estado HTTP (400, 404, 500, etc.)
   */
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export default ErrorResponse;