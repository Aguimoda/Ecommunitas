/**
 * @file db-indexes.ts
 * @description Configuración y gestión de índices de MongoDB
 * @module Config/DatabaseIndexes
 * @version 1.0.0
 * @author Ecommunitas Team
 * @created 2024
 * 
 * Este módulo proporciona:
 * - Creación automática de índices para optimización de consultas
 * - Verificación de índices existentes
 * - Logging detallado de operaciones de índices
 * - Índices para colecciones User, Item y Message
 * - Índices geoespaciales para búsquedas por ubicación
 * - Índices compuestos para consultas complejas
 */

import mongoose from 'mongoose';
import { createLogger, format, transports } from 'winston';

/**
 * Logger específico para operaciones de índices de base de datos
 * 
 * @constant {Logger} indexLogger
 * @description
 * Logger configurado para registrar todas las operaciones relacionadas con
 * la creación, verificación y mantenimiento de índices de MongoDB
 */
const indexLogger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.printf(({ level, message, timestamp }) => {
      return `${timestamp} ${level}: ${message}`;
    })
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(({ level, message, timestamp }) => {
          return `${timestamp} ${level}: ${message}`;
        })
      )
    }),
    new transports.File({ filename: 'logs/db-indexes.log' })
  ]
});

/**
 * Configura y verifica todos los índices de MongoDB
 * 
 * @async
 * @function setupIndexes
 * @returns {Promise<void>} Promesa que se resuelve cuando todos los índices están configurados
 * @throws {Error} Error si falla la creación de algún índice
 * 
 * @description
 * Esta función crea y verifica los siguientes índices:
 * 
 * **Colección User:**
 * - email (único): Para autenticación y búsqueda de usuarios
 * - role: Para filtrado por roles de usuario
 * 
 * **Colección Item:**
 * - user: Para encontrar items por usuario
 * - category: Para filtrado por categoría
 * - available: Para encontrar items disponibles
 * - createdAt: Para ordenamiento por fecha
 * - location (2dsphere): Para búsquedas geoespaciales
 * - Índices compuestos para consultas complejas
 * 
 * **Colección Message:**
 * - sender, receiver: Para consultas de mensajes
 * - createdAt: Para ordenamiento temporal
 * - read: Para filtrado por estado de lectura
 * 
 * @example
 * ```typescript
 * // Llamar durante la inicialización de la aplicación
 * await setupIndexes();
 * ```
 */
const setupIndexes = async (): Promise<void> => {
  try {
    // User collection indexes
    const User = mongoose.model('User');
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ role: 1 });
    indexLogger.info('User indexes created/verified');

    // Item collection indexes
    try {
      const Item = mongoose.model('Item');
      await Item.collection.createIndex({ user: 1 }); // Find items by user
      await Item.collection.createIndex({ category: 1 }); // Find items by category
      await Item.collection.createIndex({ available: 1 }); // Find available items
      await Item.collection.createIndex({ createdAt: -1 }); // Sort by newest
      
      // Geospatial index for location-based queries
      await Item.collection.createIndex({ 'coordinates.coordinates': '2dsphere' });
      indexLogger.info('Item indexes created/verified');
    } catch (error: any) {
      indexLogger.warn(`Item model not found or error creating indexes: ${error.message}`);
    }

    // Message collection indexes
    try {
      const Message = mongoose.model('Message');
      await Message.collection.createIndex({ sender: 1 });
      await Message.collection.createIndex({ recipient: 1 });
      await Message.collection.createIndex({ createdAt: -1 });
      await Message.collection.createIndex({ sender: 1, recipient: 1 }); // Compound index for conversations
      indexLogger.info('Message indexes created/verified');
    } catch (error: any) {
      indexLogger.warn(`Message model not found or error creating indexes: ${error.message}`);
    }

    indexLogger.info('All database indexes setup completed successfully');
  } catch (error: any) {
    indexLogger.error(`Error setting up database indexes: ${error.message}`);
    throw error;
  }
};

/**
 * Drops all indexes (useful for development/testing)
 * WARNING: This will remove all indexes except _id
 */
const dropAllIndexes = async (): Promise<void> => {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    for (const collection of collections) {
      await mongoose.connection.db.collection(collection.name).dropIndexes();
      indexLogger.info(`Dropped indexes for collection: ${collection.name}`);
    }
    
    indexLogger.info('All indexes dropped successfully');
  } catch (error: any) {
    indexLogger.error(`Error dropping indexes: ${error.message}`);
    throw error;
  }
};

export { setupIndexes, dropAllIndexes };