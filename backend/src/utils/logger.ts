/**
 * @file logger.ts
 * @description Configuración del sistema de logging con Winston
 * @module Utils/Logger
 * @version 1.0.0
 * @author Ecommunitas Team
 * @created 2024
 * 
 * Este archivo configura Winston para el logging de la aplicación:
 * - Logs en consola con colores para desarrollo
 * - Logs en archivos para producción
 * - Diferentes niveles de logging (debug, info, error)
 * - Formato personalizado con timestamps
 */

import winston from 'winston';
const { combine, timestamp, printf, colorize } = winston.format;

/**
 * Formato personalizado para los logs
 * 
 * @description
 * Define el formato de salida de los logs con timestamp, nivel y mensaje
 */
const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});

/**
 * Instancia principal del logger de Winston
 * 
 * @description
 * Configuración del logger con múltiples transportes:
 * - Console: Para desarrollo con colores
 * - File (combined.log): Todos los logs de nivel info y superior
 * - File (errors.log): Solo logs de error
 * 
 * @example
 * ```typescript
 * import logger from './utils/logger';
 * 
 * logger.info('Usuario autenticado correctamente');
 * logger.error('Error en la base de datos', error);
 * logger.debug('Datos de depuración', data);
 * ```
 */
const logger = winston.createLogger({
  level: 'debug',
  format: combine(
    colorize(),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ 
      filename: 'combined.log',
      level: 'info'
    }),
    new winston.transports.File({
      filename: 'errors.log',
      level: 'error'
    })
  ]
});

export default logger;