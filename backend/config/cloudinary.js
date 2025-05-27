const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload image to Cloudinary
exports.uploadImage = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'ecommunitas',
      use_filename: true,
      unique_filename: false,
      resource_type: 'auto',
      quality: 'auto:good'
    });

    // Delete file from server after upload
    fs.unlinkSync(filePath);

    // Devolver el objeto completo en lugar de solo la URL
    return result;
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    throw error;
  }
};

// Delete image from Cloudinary
exports.deleteImage = async (imageUrl) => {
  try {
    // Extract public ID from Cloudinary URL
    // Format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/ecommunitas/filename.jpg
    if (!imageUrl) {
      throw new Error('Image URL is required');
    }
    
    // Parse the URL to extract the public ID
    const urlParts = imageUrl.split('/');
    const filenameWithExtension = urlParts[urlParts.length - 1];
    const publicId = `ecommunitas/${filenameWithExtension.split('.')[0]}`;
    
    // Delete the image
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw error;
  }
};