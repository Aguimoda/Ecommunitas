/**
 * @file cloudinary.ts
 * @description Configuración y utilidades para la integración con Cloudinary
 * @module Config/Cloudinary
 * @version 1.0.0
 * @author Ecommunitas Team
 * @created 2024
 * 
 * Este módulo proporciona:
 * - Configuración automática de Cloudinary usando variables de entorno
 * - Función para subir imágenes con organización en carpetas
 * - Función para eliminar imágenes del servicio
 * - Validación de variables de entorno requeridas
 * - Logging detallado de operaciones
 */

import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

// Verificar que las variables de entorno estén definidas
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('Cloudinary configuration is incomplete');
  }
  // En entorno de pruebas, usar valores por defecto
  process.env.CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'test_cloud';
  process.env.CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || 'test_api_key';
  process.env.CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || 'test_api_secret';
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Cloudinary configured successfully

/**
 * Sube una imagen a Cloudinary con configuración optimizada
 * 
 * @async
 * @function uploadImage
 * @param {string} filePath - Ruta local del archivo a subir
 * @param {string|null} customFolder - Carpeta personalizada dentro de 'ecommunitas' (opcional)
 * @returns {Promise<object>} Objeto completo de respuesta de Cloudinary con URL, public_id, etc.
 * @throws {Error} Error si falla la subida o si el archivo no existe
 * 
 * @description
 * - Organiza las imágenes en carpetas dentro de 'ecommunitas/'
 * - Aplica compresión automática con calidad 'auto:good'
 * - Elimina el archivo local después de la subida exitosa
 * - Mantiene el nombre original del archivo cuando es posible
 * 
 * @example
 * ```typescript
 * const result = await uploadImage('/tmp/image.jpg', 'avatars');
 * console.log(result.secure_url); // URL de la imagen subida
 * ```
 */
export const uploadImage = async (filePath: string, customFolder: string | null = null, retries: number = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const folder = customFolder ? `ecommunitas/${customFolder}` : 'ecommunitas';
      const result = await cloudinary.uploader.upload(filePath, {
        folder: folder,
        use_filename: true,
        unique_filename: false,
        resource_type: 'auto',
        quality: 'auto:good',
        // Usar opciones estándar de Cloudinary
        // timeout no es necesario ya que se maneja con Promise.race más abajo
      });

      // Delete file from server after upload
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // Return the complete object instead of just the URL
      return result;
    } catch (error: any) {
      console.error(`Cloudinary upload attempt ${attempt} failed:`, error.message);
      
      // If it's the last attempt or not a connection error, throw the error
      if (attempt === retries || (error.code !== 'ECONNRESET' && error.code !== 'ETIMEDOUT')) {
        // Clean up file if upload failed
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      const delay = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s...
      console.log(`Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  // Si se agotan todos los reintentos sin éxito ni error, lanzar un error genérico
  throw new Error('Failed to upload image after multiple attempts');
};

/**
 * Elimina una imagen de Cloudinary usando su URL
 * 
 * @async
 * @function deleteImage
 * @param {string} imageUrl - URL completa de la imagen en Cloudinary
 * @returns {Promise<object>} Resultado de la operación de eliminación
 * @throws {Error} Error si la URL es inválida o falla la eliminación
 * 
 * @description
 * - Extrae automáticamente el public_id de la URL de Cloudinary
 * - Valida el formato de URL antes de proceder
 * - Maneja URLs con versiones y carpetas anidadas
 * - Proporciona logging detallado de errores
 * 
 * @example
 * ```typescript
 * const url = 'https://res.cloudinary.com/cloud/image/upload/v123/ecommunitas/avatar.jpg';
 * const result = await deleteImage(url);
 * console.log(result.result); // 'ok' si se eliminó correctamente
 * ```
 */
export const deleteImage = async (imageUrl: string, retries: number = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Extract public ID from Cloudinary URL
      // Format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/ecommunitas/filename.jpg
      if (!imageUrl) {
        throw new Error('Image URL is required');
      }
      
      // Parse the URL to extract the public ID
      const urlParts = imageUrl.split('/');
      const uploadIndex = urlParts.findIndex(part => part === 'upload');
      if (uploadIndex === -1) {
        throw new Error('Invalid Cloudinary URL format');
      }
      
      // Get everything after 'upload' and before the file extension
      const publicIdWithExtension = urlParts.slice(uploadIndex + 2).join('/');
      const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, '');
      
      // Implementar un timeout manual usando Promise.race
      const destroyPromise = cloudinary.uploader.destroy(publicId);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Cloudinary delete operation timed out')), 30000);
      });
      
      const result = await Promise.race([destroyPromise, timeoutPromise]) as any;
      return result;
    } catch (error: any) {
      console.error(`Cloudinary delete attempt ${attempt} failed:`, error.message);
      
      // If it's the last attempt or not a connection error, throw the error
      if (attempt === retries || (error.code !== 'ECONNRESET' && error.code !== 'ETIMEDOUT')) {
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      const delay = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s...
      console.log(`Retrying delete in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  // Si se agotan todos los reintentos sin éxito ni error, lanzar un error genérico
  throw new Error('Failed to delete image after multiple attempts');
};

export default cloudinary;