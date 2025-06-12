/**
 * @file Message.ts
 * @description Modelo de datos para mensajes entre usuarios en Ecommunitas
 * @module Models/Message
 * @version 1.0.0
 * @author Ecommunitas Team
 * @created 2024
 * 
 * Este modelo define la estructura para el sistema de mensajería:
 * - Mensajes privados entre usuarios
 * - Asociación opcional con items específicos
 * - Estado de lectura para notificaciones
 * - Índices optimizados para conversaciones
 * - Timestamps automáticos
 */

import mongoose, { Document } from 'mongoose';

/**
 * Interfaz TypeScript para el modelo Message
 * 
 * @interface IMessage
 * @extends Document
 */
export interface IMessage extends Document {
  /** ID del usuario que envía el mensaje */
  sender: mongoose.Types.ObjectId;
  /** ID del usuario que recibe el mensaje */
  recipient: mongoose.Types.ObjectId;
  /** Contenido del mensaje (máximo 1000 caracteres) */
  content: string;
  /** ID del item asociado al mensaje (opcional) */
  item?: mongoose.Types.ObjectId;
  /** Estado de lectura del mensaje */
  read: boolean;
  /** Fecha de creación del mensaje */
  createdAt: Date;
  /** Fecha de última actualización */
  updatedAt: Date;
}

/**
 * Esquema de Mongoose para mensajes
 * 
 * @description
 * Define la estructura de datos para mensajes con:
 * - Referencias a usuarios (sender/recipient)
 * - Contenido con validación de longitud
 * - Asociación opcional con items
 * - Estado de lectura para notificaciones
 * - Timestamps automáticos
 * - Índices para búsquedas eficientes
 */
const MessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'El mensaje no puede estar vacío'],
    maxlength: [1000, 'El mensaje no puede tener más de 1000 caracteres']
  },
  item: {
    type: mongoose.Schema.ObjectId,
    ref: 'Item',
    required: false // Un mensaje no siempre está asociado a un item
  },
  read: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true, // Añade createdAt y updatedAt automáticamente, aunque ya tienes createdAt manual.
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índice compuesto para búsquedas eficientes de conversaciones
MessageSchema.index({ sender: 1, recipient: 1, createdAt: -1 });

export default mongoose.model<IMessage>('Message', MessageSchema);