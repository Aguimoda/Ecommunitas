/**
 * @file fileUpload.ts
 * @description Middleware para manejo de subida de archivos
 * @module Middleware/FileUpload
 * @version 1.0.0
 * @author Ecommunitas Team
 * @created 2024
 * 
 * Este middleware proporciona:
 * - Configuración de express-fileupload
 * - Creación automática de directorios de subida
 * - Límites de tamaño de archivo
 * - Servicio de archivos estáticos
 * - Manejo de archivos temporales
 * - Configuración de debug para desarrollo
 */

import fileUpload from 'express-fileupload';
import fs from 'fs';
import path from 'path';
import express, { Application } from 'express';

/**
 * Middleware para configurar la subida de archivos
 * 
 * @function fileUploadMiddleware
 * @param {Application} app - Instancia de la aplicación Express
 * 
 * @description
 * Configura express-fileupload con las siguientes características:
 * - Límite de 5MB por archivo
 * - Creación automática de directorios padre
 * - Uso de archivos temporales para mejor rendimiento
 * - Servicio de archivos estáticos desde el directorio de subidas
 * - Debug habilitado en modo desarrollo
 * 
 * @example
 * ```typescript
 * // En server.ts
 * import fileUploadMiddleware from './middleware/fileUpload';
 * fileUploadMiddleware(app);
 * ```
 */
const fileUploadMiddleware = (app: Application) => {
  // Se crea el directorio /uploads si no existe
  const uploadDir = process.env.FILE_UPLOAD_PATH || path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Configura el midlleware "file upload"
  app.use(fileUpload({
    createParentPath: true,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB es el tamaño máximo
    abortOnLimit: true,
    useTempFiles: true,
    tempFileDir: uploadDir,
    debug: process.env.NODE_ENV === 'development'
  }));

  // Se sirven los archivos desde el directorio /uploads
  app.use('/uploads', express.static(path.join(uploadDir)));

  console.log(`File upload middleware configured. Upload directory: ${uploadDir}`);
};

export default fileUploadMiddleware;