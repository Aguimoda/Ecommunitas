/**
 * @fileoverview Clase personalizada para manejo de errores HTTP en Ecommunitas
 * 
 * Esta clase extiende la clase Error nativa de JavaScript para proporcionar
 * un manejo más específico y estructurado de errores HTTP en la aplicación.
 * Permite asociar códigos de estado HTTP con mensajes de error personalizados.
 * 
 * @description Características principales:
 * - **Herencia**: Extiende Error nativo de JavaScript
 * - **Códigos HTTP**: Asocia códigos de estado HTTP con errores
 * - **Mensajes personalizados**: Permite mensajes de error específicos
 * - **Compatibilidad**: Funciona con middleware de manejo de errores
 * - **Debugging**: Mantiene stack trace para debugging
 * - **Consistencia**: Estandariza respuestas de error en toda la API
 * 
 * @architecture
 * ```
 * ErrorResponse
 * ├── Constructor
 * │   ├── message (string) - Mensaje de error
 * │   └── statusCode (number) - Código HTTP
 * ├── Herencia de Error
 * │   ├── name
 * │   ├── message
 * │   └── stack
 * └── Propiedades adicionales
 *     └── statusCode - Para middleware
 * ```
 * 
 * @usage Ejemplos de uso:
 * ```javascript
 * // Error 404 - Recurso no encontrado
 * throw new ErrorResponse('Usuario no encontrado', 404);
 * 
 * // Error 400 - Datos inválidos
 * throw new ErrorResponse('Email ya está en uso', 400);
 * 
 * // Error 401 - No autorizado
 * throw new ErrorResponse('Token inválido', 401);
 * 
 * // Error 403 - Prohibido
 * throw new ErrorResponse('Acceso denegado', 403);
 * 
 * // Error 500 - Error interno
 * throw new ErrorResponse('Error interno del servidor', 500);
 * ```
 * 
 * @integration Integración con middleware:
 * ```javascript
 * // En controladores
 * if (!user) {
 *   return next(new ErrorResponse('Usuario no encontrado', 404));
 * }
 * 
 * // En middleware de error
 * if (err instanceof ErrorResponse) {
 *   res.status(err.statusCode).json({
 *     success: false,
 *     error: err.message
 *   });
 * }
 * ```
 * 
 * @benefits Beneficios:
 * - **Consistencia**: Respuestas de error uniformes
 * - **Debugging**: Stack traces preservados
 * - **Mantenibilidad**: Código más limpio y organizado
 * - **Flexibilidad**: Fácil extensión para nuevos tipos de error
 * - **Estándares HTTP**: Códigos de estado apropiados
 * 
 * @author Equipo Ecommunitas
 * @version 1.0.0
 * @since 2024
 */

/**
 * Clase personalizada para errores HTTP con código de estado
 * 
 * @class ErrorResponse
 * @extends {Error}
 */
class ErrorResponse extends Error {
  /**
   * Crea una nueva instancia de ErrorResponse
   * 
   * @param {string} message - Mensaje descriptivo del error
   * @param {number} statusCode - Código de estado HTTP (400, 401, 404, 500, etc.)
   * 
   * @example
   * // Error de validación
   * throw new ErrorResponse('Email es requerido', 400);
   * 
   * @example
   * // Error de autenticación
   * throw new ErrorResponse('Token inválido', 401);
   * 
   * @example
   * // Error de recurso no encontrado
   * throw new ErrorResponse('Artículo no encontrado', 404);
   */
  constructor(message, statusCode) {
    // Llamar al constructor padre (Error)
    super(message);
    
    // Asignar código de estado HTTP
    this.statusCode = statusCode;
    
    // Mantener el nombre de la clase para debugging
    this.name = this.constructor.name;
    
    // Capturar stack trace si está disponible
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

// Exportar la clase para uso en otros módulos
module.exports = ErrorResponse;