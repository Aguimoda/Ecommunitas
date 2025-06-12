/**
 * @file db.ts
 * @description Configuración y conexión a la base de datos MongoDB
 * @module Config/Database
 * @version 1.0.0
 * @author Ecommunitas Team
 * @created 2024
 * 
 * Este módulo proporciona:
 * - Conexión optimizada a MongoDB con pooling de conexiones
 * - Configuración de índices automática
 * - Logging detallado de operaciones de base de datos
 * - Manejo de errores de conexión y reconexión automática
 * - Configuración de timeouts y opciones de rendimiento
 */

import mongoose from 'mongoose';
import 'colors';
import { createLogger, format, transports } from 'winston';
import fs from 'fs';
import path from 'path';

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '..', '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Create logger for database operations
const dbLogger = createLogger({
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
    new transports.File({ filename: path.join(logsDir, 'db.log') })
  ]
});

// Import the setupIndexes function
import { setupIndexes } from './db-indexes';

/**
 * Establece conexión a MongoDB con configuración optimizada
 * 
 * @async
 * @function connectDB
 * @returns {Promise<void>} Promise que se resuelve cuando la conexión es exitosa
 * @throws {Error} Termina el proceso si falla la conexión
 * 
 * @description
 * Características principales:
 * - Pool de conexiones configurado (2-10 conexiones)
 * - Timeouts optimizados para producción
 * - Reconexión automática en caso de desconexión
 * - Configuración automática de índices de base de datos
 * - Logging detallado de eventos de conexión
 * - Validación y corrección automática de URI de MongoDB
 * 
 * @example
 * ```typescript
 * // En server.ts
 * await connectDB();
 * console.log('Base de datos conectada');
 * ```
 */
const connectDB = async () => {
  try {
    // Connection options for MongoDB with connection pooling
    const options = {
      maxPoolSize: 10, // Maximum number of connections in the pool
      minPoolSize: 2,  // Minimum number of connections in the pool
      serverSelectionTimeoutMS: 5000, // Timeout for server selection
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4 // Use IPv4, skip trying IPv6
    };

    // Ensure we connect to the ecommunitas database specifically
    let mongoUri = process.env.MONGO_URI!;
    if (!mongoUri.includes('/ecommunitas')) {
      mongoUri = mongoUri.replace('/?retryWrites', '/ecommunitas?retryWrites');
    }
    
    const conn = await mongoose.connect(mongoUri, options);

    dbLogger.info(`MongoDB Connected: ${conn.connection.host}`.cyan.underline.bold);
    
    // Log when connection is disconnected
    mongoose.connection.on('disconnected', () => {
      dbLogger.error('MongoDB connection disconnected');
    });

    // Log when connection is reconnected
    mongoose.connection.on('reconnected', () => {
      dbLogger.info('MongoDB connection reestablished');
    });

    // Log connection errors
    mongoose.connection.on('error', (err: any) => {
      dbLogger.error(`MongoDB connection error: ${err}`);
    });

    // Create indexes for collections that will be frequently queried
    await setupIndexes();
    dbLogger.info('Database indexes setup completed');

  } catch (err: any) {
    dbLogger.error(`Error connecting to MongoDB: ${err.message}`.red);
    // Exit process with failure only if not in test environment
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    } else {
      // In test environment, just throw the error instead of exiting
      throw err;
    }
  }
};

export default connectDB;