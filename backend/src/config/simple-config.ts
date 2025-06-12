/**
 * @file simple-config.ts
 * @description Configuración simplificada de variables de entorno
 * @module Config/SimpleConfig
 * @version 1.0.0
 * @author Ecommunitas Team
 * @created 2024
 * 
 * Este módulo proporciona:
 * - Carga y validación de variables de entorno críticas
 * - Configuración centralizada con valores por defecto
 * - Validación automática de variables requeridas
 * - Tipado seguro para todas las configuraciones
 * - Configuración para desarrollo y producción
 */

import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Objeto de configuración principal de la aplicación
 * 
 * @constant {object} config
 * @description Contiene todas las variables de entorno necesarias para la aplicación
 * con valores por defecto seguros para desarrollo
 * 
 * @property {string} NODE_ENV - Entorno de ejecución (development/production)
 * @property {number} PORT - Puerto del servidor
 * @property {string} DATABASE_URI - URI de conexión a MongoDB
 * @property {string} JWT_SECRET - Clave secreta para JWT
 * @property {string} JWT_EXPIRE - Tiempo de expiración del JWT
 * @property {number} JWT_COOKIE_EXPIRE - Días de expiración de cookies JWT
 * @property {string} CLOUDINARY_CLOUD_NAME - Nombre del cloud de Cloudinary
 * @property {string} CLOUDINARY_API_KEY - API key de Cloudinary
 * @property {string} CLOUDINARY_API_SECRET - API secret de Cloudinary
 * @property {string} FRONTEND_URL - URL del frontend para CORS
 * @property {number} MAX_FILE_UPLOAD - Tamaño máximo de archivos en bytes
 * @property {string} FILE_UPLOAD_PATH - Ruta para archivos temporales
 */
export const config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  DATABASE_URI: process.env.DATABASE_URI || process.env.MONGO_URI || '',
  JWT_SECRET: process.env.JWT_SECRET || '',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '30d',
  JWT_COOKIE_EXPIRE: parseInt(process.env.JWT_COOKIE_EXPIRE || '30', 10),
  
  // Cloudinary (optional)
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  
  // Frontend URL
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  
  // File upload settings
  MAX_FILE_UPLOAD: parseInt(process.env.MAX_FILE_UPLOAD || '1000000', 10), // 1MB
  FILE_UPLOAD_PATH: process.env.FILE_UPLOAD_PATH || './uploads'
};

// Validate critical environment variables
if (!config.DATABASE_URI) {
  console.error('DATABASE_URI is required');
  process.exit(1);
}

if (!config.JWT_SECRET) {
  console.error('JWT_SECRET is required');
  process.exit(1);
}