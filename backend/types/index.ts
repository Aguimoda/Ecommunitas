/**
 * @fileoverview Definiciones de tipos TypeScript para la aplicación Ecommunitas
 * 
 * Este archivo centraliza todas las interfaces y tipos TypeScript utilizados
 * en el backend de Ecommunitas. Proporciona type safety y documentación
 * para todas las estructuras de datos principales.
 * 
 * @description Tipos incluidos:
 * - **EnvironmentConfig**: Configuración de variables de entorno
 * - **AuthenticatedRequest**: Request de Express con usuario autenticado
 * - **IUser**: Interfaz para usuarios del sistema
 * - **IItem**: Interfaz para items/artículos
 * - **IMessage**: Interfaz para mensajes
 * - **Utility Types**: Tipos auxiliares para validaciones y respuestas
 * 
 * @architecture
 * ```
 * types/index.ts
 * ├── Configuración
 * │   └── EnvironmentConfig
 * ├── Autenticación
 * │   └── AuthenticatedRequest
 * ├── Modelos de Datos
 * │   ├── IUser
 * │   ├── IItem
 * │   └── IMessage
 * └── Tipos Auxiliares
 *     ├── Validaciones
 *     ├── Respuestas API
 *     └── Geolocalización
 * ```
 * 
 * @benefits
 * - **Type Safety**: Prevención de errores en tiempo de compilación
 * - **IntelliSense**: Autocompletado mejorado en IDEs
 * - **Documentación**: Tipos autodocumentados
 * - **Refactoring**: Cambios seguros en toda la aplicación
 * - **Consistencia**: Estructuras de datos uniformes
 * 
 * @example
 * ```typescript
 * import { IUser, AuthenticatedRequest } from '../types';
 * 
 * // Uso en controladores
 * const createUser = (req: AuthenticatedRequest, res: Response) => {
 *   const user: IUser = req.user;
 *   // TypeScript valida automáticamente las propiedades
 * };
 * ```
 * 
 * @author Equipo Ecommunitas
 * @version 1.0.0
 * @since 2024
 */

import { Request } from 'express';
import { Document } from 'mongoose';
import { UploadedFile } from 'express-fileupload';

// Environment configuration interface
export interface EnvironmentConfig {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  DATABASE_URI: string;
  JWT_SECRET: string;
  JWT_EXPIRE: string;
  JWT_COOKIE_EXPIRE: number;
  EMAIL_FROM: string;
  EMAIL_HOST?: string;
  EMAIL_PORT?: number;
  EMAIL_USERNAME?: string;
  EMAIL_PASSWORD?: string;
  CLOUDINARY_CLOUD_NAME?: string;
  CLOUDINARY_API_KEY?: string;
  CLOUDINARY_API_SECRET?: string;
  REDIS_URL?: string;
  FRONTEND_URL: string;
}

// Extend Express Request interface to include user
export interface AuthenticatedRequest extends Request {
  user?: IUser;
  file?: UploadedFile;
  files?: any; // Using any to avoid type conflicts with express-fileupload
}

// User interface
export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  password: string;
  bio?: string;
  location?: string;
  avatar?: string;
  role: 'user' | 'admin';
  isActive: boolean;
  coordinates?: {
    type: 'Point';
    coordinates: [number, number];
  };
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  getSignedJwtToken(): string;
  matchPassword(enteredPassword: string): Promise<boolean>;
  getResetPasswordToken(): string;
}

// Item interface
export interface IItem extends Document {
  _id: string;
  title: string;
  description: string;
  category: string;
  condition: 'nuevo' | 'como_nuevo' | 'bueno' | 'regular' | 'para_reparar';
  images: string[];
  owner: string | IUser;
  isAvailable: boolean;
  location?: string;
  coordinates?: {
    type: 'Point';
    coordinates: [number, number];
  };
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Message interface
export interface IMessage extends Document {
  _id: string;
  sender: string | IUser;
  recipient: string | IUser;
  content: string;
  itemId?: string | IItem;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// API Response interface
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Logger interface
export interface LoggerConfig {
  level: string;
  format: any;
  transports: any[];
}

// Database connection options
export interface DatabaseConfig {
  uri: string;
  options?: {
    useNewUrlParser?: boolean;
    useUnifiedTopology?: boolean;
  };
}

// File upload configuration
export interface FileUploadConfig {
  maxFileSize: number;
  allowedMimeTypes: string[];
  uploadPath: string;
}

// Cloudinary configuration
export interface CloudinaryConfig {
  cloud_name: string;
  api_key: string;
  api_secret: string;
}

// Environment variables
export interface EnvironmentVariables {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: string;
  MONGO_URI: string;
  JWT_SECRET: string;
  JWT_EXPIRE: string;
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
  MAX_FILE_UPLOAD: string;
}