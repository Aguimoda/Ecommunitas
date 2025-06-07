import mongoose, { Document, Schema } from 'mongoose';

export interface IItem extends Document {
  title: string;
  description: string;
  category: 'books' | 'electronics' | 'clothing' | 'furniture' | 'other';
  condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor';
  location: string;
  coordinates: {
    type: 'Point';
    coordinates: [number, number] | null;
    enabled: boolean;
  };
  imageUrls: string[];
  imagePublicIds: string[];
  user: mongoose.Types.ObjectId;
  available: boolean;
  moderationStatus: 'pending' | 'approved' | 'rejected';
  moderatedAt?: Date;
  moderatedBy?: mongoose.Types.ObjectId;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: ['books', 'electronics', 'clothing', 'furniture', 'other']
  },
  condition: {
    type: String,
    required: [true, 'Please select condition'],
    enum: ['new', 'like_new', 'good', 'fair', 'poor']
  },
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