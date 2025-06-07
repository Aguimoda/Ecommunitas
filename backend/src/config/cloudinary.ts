import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

// Verificar que las variables de entorno estén definidas
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error('❌ Error: Variables de entorno de Cloudinary no están definidas');
  console.error('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? '✅' : '❌');
  console.error('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? '✅' : '❌');
  console.error('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '✅' : '❌');
  throw new Error('Cloudinary configuration is incomplete');
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('✅ Cloudinary configurado correctamente con cloud_name:', process.env.CLOUDINARY_CLOUD_NAME);

// Upload image to Cloudinary
export const uploadImage = async (filePath: string, customFolder: string | null = null) => {
  try {
    const folder = customFolder ? `ecommunitas/${customFolder}` : 'ecommunitas';
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      use_filename: true,
      unique_filename: false,
      resource_type: 'auto',
      quality: 'auto:good'
    });

    // Delete file from server after upload
    fs.unlinkSync(filePath);

    // Return the complete object instead of just the URL
    return result;
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    throw error;
  }
};

// Delete image from Cloudinary
export const deleteImage = async (imageUrl: string) => {
  try {
    // Extract public ID from Cloudinary URL
    // Format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/ecommunitas/filename.jpg
    if (!imageUrl) {
      throw new Error('Image URL is required');
    }
    
    // Parse the URL to extract the public ID
    const urlParts = imageUrl.split('/');
    const uploadIndex = urlParts.findIndex(part => part === 'upload');
    if (uploadIndex === -1) {
      throw new Error('Invalid Cloudinary URL format');
    }
    
    // Get everything after 'upload' and before the file extension
    const publicIdWithExtension = urlParts.slice(uploadIndex + 2).join('/');
    const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, '');
    
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw error;
  }
};

export default cloudinary;