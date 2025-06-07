import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Simple configuration object - keeping it minimal like the original
export const config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  DATABASE_URI: process.env.DATABASE_URI || process.env.MONGO_URI || '',
  JWT_SECRET: process.env.JWT_SECRET || '',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '30d',
  JWT_COOKIE_EXPIRE: parseInt(process.env.JWT_COOKIE_EXPIRE || '30', 10),
  
  // Cloudinary (optional)
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  
  // Frontend URL
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  
  // File upload settings
  MAX_FILE_UPLOAD: parseInt(process.env.MAX_FILE_UPLOAD || '1000000', 10), // 1MB
  FILE_UPLOAD_PATH: process.env.FILE_UPLOAD_PATH || './uploads'
};

// Validate critical environment variables
if (!config.DATABASE_URI) {
  console.error('DATABASE_URI is required');
  process.exit(1);
}

if (!config.JWT_SECRET) {
  console.error('JWT_SECRET is required');
  process.exit(1);
}