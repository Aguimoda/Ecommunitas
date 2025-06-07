import fileUpload from 'express-fileupload';
import fs from 'fs';
import path from 'path';
import express, { Application } from 'express';

/**
 * Middleware for handling file uploads
 * Configures express-fileupload with appropriate settings
 * Creates upload directory if it doesn't exist
 */
const fileUploadMiddleware = (app: Application) => {
  // Create upload directory if it doesn't exist
  const uploadDir = process.env.FILE_UPLOAD_PATH || path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Configure file upload middleware
  app.use(fileUpload({
    createParentPath: true,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max file size
    abortOnLimit: true,
    useTempFiles: true,
    tempFileDir: uploadDir,
    debug: process.env.NODE_ENV === 'development'
  }));

  // Serve static files from the uploads directory
  app.use('/uploads', express.static(path.join(uploadDir)));

  console.log(`File upload middleware configured. Upload directory: ${uploadDir}`);
};

export default fileUploadMiddleware;