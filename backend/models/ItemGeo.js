const mongoose = require('mongoose');

const ItemGeoSchema = new mongoose.Schema({
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
  // Campo para almacenar coordenadas geoespaciales
  coordinates: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      index: '2dsphere',
      // [longitud, latitud]
      default: [0, 0]
    }
  },
  imageUrl: {
    type: String,
    required: [true, 'Please add an image']
  },
  available: {
    type: Boolean,
    default: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Crear índices para búsqueda
ItemGeoSchema.index({ title: 'text', description: 'text' });

// Crear índice geoespacial
ItemGeoSchema.index({ 'coordinates.coordinates': '2dsphere' });

module.exports = mongoose.model('ItemGeo', ItemGeoSchema);