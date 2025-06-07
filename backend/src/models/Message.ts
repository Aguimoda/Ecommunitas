import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  sender: mongoose.Types.ObjectId;
  recipient: mongoose.Types.ObjectId;
  content: string;
  item?: mongoose.Types.ObjectId;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

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