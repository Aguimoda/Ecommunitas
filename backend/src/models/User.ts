/**
 * @file User.ts
 * @description Modelo de datos para usuarios del sistema Ecommunitas
 * 
 * Este archivo define el esquema de MongoDB y la interfaz TypeScript
 * para los usuarios de la aplicación. Incluye funcionalidades de:
 * - Autenticación con hash de contraseñas
 * - Generación de tokens JWT
 * - Recuperación de contraseñas
 * - Geolocalización de usuarios
 * - Validaciones de datos
 * 
 * @author Equipo de Desarrollo Ecommunitas
 * @version 1.0.0
 * @since 1.0.0
 */

// ============================================================================
// IMPORTACIONES
// ============================================================================
import mongoose, { Document, Schema } from 'mongoose'; // ODM para MongoDB
import bcrypt from 'bcryptjs';                         // Librería para hash de contraseñas
import jwt from 'jsonwebtoken';                        // Librería para tokens JWT
import crypto from 'crypto';                           // Módulo nativo para criptografía

// ============================================================================
// INTERFAZ TYPESCRIPT PARA EL USUARIO
// ============================================================================

/**
 * Interfaz que define la estructura de un usuario en TypeScript
 * Extiende Document de Mongoose para incluir métodos de MongoDB
 */
interface IUser extends Document {
  /** Nombre completo del usuario */
  name: string;
  
  /** Dirección de correo electrónico (único) */
  email: string;
  
  /** Contraseña hasheada del usuario */
  password: string;
  
  /** Biografía opcional del usuario */
  bio?: string;
  
  /** Ubicación textual del usuario */
  location?: string;
  
  /** URL del avatar del usuario */
  avatar?: string;
  
  /** Rol del usuario en el sistema (user, admin, moderator) */
  role: string;
  
  /** Estado activo/inactivo del usuario */
  isActive: boolean;
  
  /** Coordenadas geográficas del usuario para funcionalidades de proximidad */
  coordinates?: {
    type: string;                    // Tipo de geometría (Point)
    coordinates: [number, number];   // [longitud, latitud]
  };
  
  /** Token temporal para recuperación de contraseña */
  resetPasswordToken?: string;
  
  /** Fecha de expiración del token de recuperación */
  resetPasswordExpire?: Date;
  
  /** Fecha de creación del usuario */
  createdAt: Date;
  
  // ============================================================================
  // MÉTODOS DE INSTANCIA
  // ============================================================================
  
  /** Genera y retorna un token JWT firmado para el usuario */
  getSignedJwtToken(): string;
  
  /** Compara una contraseña en texto plano con la contraseña hasheada */
  matchPassword(enteredPassword: string): Promise<boolean>;
  
  /** Genera un token seguro para recuperación de contraseña */
  getResetPasswordToken(): string;
}

// ============================================================================
// ESQUEMA DE MONGODB PARA USUARIOS
// ============================================================================

/**
 * Esquema de MongoDB que define la estructura y validaciones
 * para los documentos de usuario en la base de datos
 */
const UserSchema = new Schema({
  /**
   * Nombre completo del usuario
   * - Requerido para identificación
   * - Longitud entre 2 y 50 caracteres
   * - Se elimina espacios en blanco automáticamente
   */
  name: {
    type: String,
    required: [true, 'Por favor añada un nombre'],
    trim: true,
    minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
    maxlength: [50, 'El nombre no puede tener más de 50 caracteres']
  },
  
  /**
   * Dirección de correo electrónico
   * - Requerido y único en el sistema
   * - Se convierte automáticamente a minúsculas
   * - Validación con expresión regular
   * - Indexado para búsquedas rápidas
   */
  email: {
    type: String,
    required: [true, 'Por favor añada un email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Por favor añada un email válido'
    ],
    index: true
  },
  
  /**
   * Contraseña del usuario
   * - Requerida con mínimo 8 caracteres
   * - select: false evita que se incluya en consultas por defecto
   * - Se hashea automáticamente antes de guardar
   */
  password: {
    type: String,
    required: [true, 'Por favor añada una contraseña'],
    minlength: [8, 'La contraseña debe tener al menos 8 caracteres'],
    select: false,  // No incluir en consultas por seguridad
    validate: {
      validator: function(val: string) {
        // Debe tener al menos una mayúscula, un número y un carácter especial
        return /[A-Z]/.test(val) && /[0-9]/.test(val) && /[!@#$%^&*(),.?":{}|<>]/.test(val);
      },
      message: 'La contraseña debe contener al menos una mayúscula, un número y un carácter especial'
    }
  },
  bio: {
    type: String,
    maxlength: [500, 'La biografía no puede tener más de 500 caracteres'],
    default: ''
  },
  location: {
    type: String,
    maxlength: [100, 'La ubicación no puede tener más de 100 caracteres'],
    default: ''
  },
  avatar: {
    type: String,
    default: 'default-avatar.png'
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  coordinates: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      index: '2dsphere'
    }
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id },
    process.env.JWT_SECRET as string,
    { expiresIn: process.env.JWT_EXPIRE || '30d' } as jwt.SignOptions
  );
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token
UserSchema.methods.getResetPasswordToken = function() {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

export default mongoose.model<IUser>('User', UserSchema);