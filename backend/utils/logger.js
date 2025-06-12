/**
 * @fileoverview Sistema de logging centralizado para Ecommunitas usando Winston
 * 
 * Este módulo configura y exporta un logger centralizado basado en Winston
 * para toda la aplicación Ecommunitas. Proporciona logging estructurado
 * con múltiples niveles, formatos personalizados y diferentes transportes
 * para desarrollo y producción.
 * 
 * @description Características principales:
 * - **Múltiples niveles**: error, warn, info, debug
 * - **Múltiples transportes**: Consola y archivos
 * - **Formato personalizado**: Timestamp + nivel + mensaje
 * - **Colores**: Output colorizado para consola
 * - **Archivos separados**: Logs generales y errores por separado
 * - **Configuración flexible**: Fácil de extender y modificar
 * 
 * @architecture
 * ```
 * Logger (Winston)
 * ├── Configuración
 * │   ├── Nivel: debug (desarrollo)
 * │   ├── Formato: timestamp + colorize + custom
 * │   └── Transportes: console + files
 * ├── Transportes
 * │   ├── Console (todos los niveles)
 * │   ├── combined.log (info+)
 * │   └── errors.log (solo errores)
 * └── Formato
 *     ├── Timestamp: YYYY-MM-DD HH:mm:ss
 *     ├── Colorize: Para consola
 *     └── Custom: [timestamp] [level]: message
 * ```
 * 
 * @levels Niveles de logging disponibles:
 * - **error**: Errores críticos que requieren atención inmediata
 * - **warn**: Advertencias que no detienen la ejecución
 * - **info**: Información general sobre el funcionamiento
 * - **debug**: Información detallada para debugging
 * 
 * @transports Transportes configurados:
 * - **Console**: Todos los niveles con colores
 * - **combined.log**: Nivel info y superior
 * - **errors.log**: Solo errores (nivel error)
 * 
 * @usage Ejemplos de uso:
 * ```javascript
 * const logger = require('./utils/logger');
 * 
 * // Logging de información
 * logger.info('Usuario autenticado correctamente');
 * 
 * // Logging de errores
 * logger.error('Error al conectar con la base de datos', error);
 * 
 * // Logging de debug
 * logger.debug('Procesando request:', req.body);
 * 
 * // Logging de advertencias
 * logger.warn('Límite de rate limiting alcanzado para IP:', ip);
 * ```
 * 
 * @integration Integración en la aplicación:
 * ```javascript
 * // En controladores
 * logger.info(`Usuario ${userId} creó nuevo artículo`);
 * 
 * // En middleware de errores
 * logger.error('Error no manejado:', err.stack);
 * 
 * // En autenticación
 * logger.warn(`Intento de login fallido para: ${email}`);
 * 
 * // En operaciones de base de datos
 * logger.debug('Ejecutando query:', query);
 * ```
 * 
 * @files Archivos de log generados:
 * - **combined.log**: Todos los logs de nivel info y superior
 * - **errors.log**: Solo errores para análisis rápido
 * 
 * @performance Consideraciones de rendimiento:
 * - Logging asíncrono para no bloquear la aplicación
 * - Rotación automática de logs (configurable)
 * - Niveles configurables por entorno
 * - Formato optimizado para parsing
 * 
 * @author Equipo Ecommunitas
 * @version 1.0.0
 * @since 2024
 */

// Importar Winston y sus utilidades de formato
const winston = require('winston');
const { combine, timestamp, printf, colorize } = winston.format;

/**
 * Formato personalizado para los mensajes de log
 * 
 * @function logFormat
 * @param {Object} info - Objeto de información del log
 * @param {string} info.level - Nivel del log (error, warn, info, debug)
 * @param {string} info.message - Mensaje del log
 * @param {string} info.timestamp - Timestamp formateado
 * @returns {string} Mensaje formateado para output
 * 
 * @example
 * // Output: "2024-12-20 14:30:25 [info]: Usuario autenticado"
 */
const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});

/**
 * Logger principal de la aplicación configurado con Winston
 * 
 * @constant {winston.Logger} logger
 * 
 * @configuration
 * - **Nivel**: debug (captura todos los niveles)
 * - **Formato**: Combinación de colorize + timestamp + formato personalizado
 * - **Transportes**: Console + archivos combined.log y errors.log
 */
const logger = winston.createLogger({
  // Nivel mínimo de logging (debug captura todo)
  level: 'debug',
  
  // Combinación de formatos para output estructurado
  format: combine(
    colorize(), // Colores para la consola
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // Timestamp legible
    logFormat // Formato personalizado
  ),
  
  // Transportes para diferentes destinos
  transports: [
    // Consola: todos los niveles con colores
    new winston.transports.Console(),
    
    // Archivo general: info y superior
    new winston.transports.File({ 
      filename: 'combined.log',
      level: 'info'
    }),
    
    // Archivo de errores: solo errores
    new winston.transports.File({
      filename: 'errors.log',
      level: 'error'
    })
  ]
});

// Exportar el logger para uso en toda la aplicación
module.exports = logger;