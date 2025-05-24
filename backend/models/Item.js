const mongoose = require('mongoose');

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
    enum: ['books', 'electronics', 'clothing', 'furniture', 'other', 'ropa', 'electronica', 'hogar', 'libros']
  },
  condition: {
    type: String,
    required: [true, 'Please select condition'],
    enum: ['new', 'like_new', 'good', 'fair', 'poor', 'nuevo', 'bueno', 'usado']
  },
  location: {
    type: String,
    required: [true, 'Please add location']
  },
  imageUrls: {
    type: [String],
    // required: [true, 'Please add at least one image'] // Made optional
    default: [] // Provide a default empty array
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

// Create text index for search
ItemSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Item', ItemSchema);