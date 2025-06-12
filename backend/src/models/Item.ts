/**
 * @file Item.ts
 * @description Modelo de datos para items en la plataforma Ecommunitas
 * 
 * Este archivo define la estructura de datos para los items que los usuarios
 * pueden compartir en la plataforma, incluyendo validaciones, índices y
 * funcionalidades geoespaciales para búsquedas por ubicación.
 * 
 * Características principales:
 * - Soporte para múltiples categorías y condiciones
 * - Geolocalización opcional con búsquedas por proximidad
 * - Sistema de moderación con estados de aprobación
 * - Soporte para múltiples imágenes con Cloudinary
 * - Índices optimizados para búsquedas eficientes
 * 
 * @author Equipo de Desarrollo Ecommunitas
 * @version 1.0.0
 * @since 1.0.0
 */

// ============================================================================
// IMPORTACIONES
// ============================================================================
import mongoose, { Document } from 'mongoose';

// ============================================================================
// INTERFAZ TYPESCRIPT PARA ITEMS
// ============================================================================

/**
 * Interfaz que define la estructura de un item en TypeScript
 * Extiende Document de Mongoose para incluir métodos de MongoDB
 */
export interface IItem extends Document {
  /** Título del item (máximo 100 caracteres) */
  title: string;
  
  /** Descripción detallada del item (máximo 1000 caracteres) */
  description: string;
  
  /** Categoría del item - valores predefinidos */
  category: 'books' | 'electronics' | 'clothing' | 'furniture' | 'other';
  
  /** Condición física del item */
  condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor';
  
  /** Ubicación textual del item */
  location: string;
  
  /** 
   * Coordenadas geoespaciales para búsquedas por proximidad
   * Formato GeoJSON Point con longitud y latitud
   */
  coordinates: {
    type: 'Point';
    coordinates: [number, number] | null;  // [longitud, latitud]
    enabled: boolean;  // Si la geolocalización está activa
  };
  
  /** URLs de las imágenes del item almacenadas en Cloudinary */
  imageUrls: string[];
  
  /** IDs públicos de Cloudinary para gestión de imágenes */
  imagePublicIds: string[];
  
  /** Referencia al usuario propietario del item */
  user: mongoose.Types.ObjectId;
  
  /** Si el item está disponible para intercambio */
  available: boolean;
  
  /** Estado de moderación del item */
  moderationStatus: 'pending' | 'approved' | 'rejected';
  
  /** Fecha de moderación (opcional) */
  moderatedAt?: Date;
  
  /** Usuario que moderó el item (opcional) */
  moderatedBy?: mongoose.Types.ObjectId;
  
  /** Razón del rechazo en caso de moderación negativa (opcional) */
  rejectionReason?: string;
  
  /** Fecha de creación (automática) */
  createdAt: Date;
  
  /** Fecha de última actualización (automática) */
  updatedAt: Date;
}

// ============================================================================
// ESQUEMA DE MONGODB PARA ITEMS
// ============================================================================

/**
 * Esquema de MongoDB que define la estructura, validaciones e índices
 * para los documentos de items en la base de datos
 */
const ItemSchema = new mongoose.Schema({
  /**
   * Título del item
   * - Requerido para identificación
   * - Máximo 100 caracteres
   * - Se eliminan espacios en blanco automáticamente
   */
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  
  /**
   * Descripción detallada del item
   * - Requerida para proporcionar información completa
   * - Máximo 1000 caracteres
   */
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  
  /**
   * Categoría del item
   * - Requerida para clasificación
   * - Valores predefinidos para consistencia
   */
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: ['books', 'electronics', 'clothing', 'furniture', 'other']
  },
  
  /**
   * Condición física del item
   * - Requerida para evaluar el estado
   * - Escala de nuevo a pobre condición
   */
  condition: {
    type: String,
    required: [true, 'Please select condition'],
    enum: ['new', 'like_new', 'good', 'fair', 'poor']
  },
  
  /**
   * Ubicación textual del item
   * - Requerida para contexto geográfico
   * - Complementa las coordenadas geoespaciales
   */
  location: {
    type: String,
    required: [true, 'Please add location']
  },
  // Campo para almacenar coordenadas geoespaciales (opcional)
  coordinates: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      // [longitud, latitud]
      default: null
    },
    // Indica si las coordenadas están activas/disponibles
    enabled: {
      type: Boolean,
      default: false
    }
  },
  // Soporte para múltiples imágenes
  imageUrls: {
    type: [String],
    default: [] // Array vacío por defecto
  },
  // IDs públicos de Cloudinary para poder eliminar imágenes
  imagePublicIds: {
    type: [String],
    default: [] // Array vacío por defecto
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  available: {
    type: Boolean,
    default: true
  },
  // Campos para moderación
  moderationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  moderatedAt: {
    type: Date
  },
  moderatedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  rejectionReason: {
    type: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Crear índice geoespacial 2dsphere para búsquedas por ubicación
ItemSchema.index({ 'coordinates.coordinates': '2dsphere' });

// Crear índice de texto para búsquedas por título y descripción
ItemSchema.index({
  title: 'text',
  description: 'text'
}, {
  weights: {
    title: 10,
    description: 5
  },
  name: 'item_text_index'
});

// Índices adicionales para mejorar el rendimiento
ItemSchema.index({ user: 1 });
ItemSchema.index({ category: 1 });
ItemSchema.index({ condition: 1 });
ItemSchema.index({ available: 1 });
ItemSchema.index({ moderationStatus: 1 });
ItemSchema.index({ createdAt: -1 });
ItemSchema.index({ location: 1 });

// Índice compuesto para búsquedas comunes
ItemSchema.index({ available: 1, moderationStatus: 1, createdAt: -1 });
ItemSchema.index({ category: 1, available: 1, moderationStatus: 1 });
ItemSchema.index({ user: 1, available: 1 });

// Virtual para calcular la distancia (se usa en búsquedas geoespaciales)
ItemSchema.virtual('distance');

// Middleware pre-save para validaciones adicionales
ItemSchema.pre('save', function(next) {
  // Validar que si coordinates.enabled es true, coordinates.coordinates debe existir
  if (this.coordinates && (this.coordinates as any).enabled && (!(this.coordinates as any).coordinates || (this.coordinates as any).coordinates.length !== 2)) {
    const error = new Error('Las coordenadas son requeridas cuando la geolocalización está habilitada');
    return next(error);
  }
  
  // Validar que las coordenadas estén en rangos válidos
  if (this.coordinates && (this.coordinates as any).coordinates && (this.coordinates as any).coordinates.length === 2) {
    const [lng, lat] = (this.coordinates as any).coordinates;
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      const error = new Error('Las coordenadas están fuera del rango válido');
      return next(error);
    }
  }
  
  next();
});

export default mongoose.model<IItem>('Item', ItemSchema);