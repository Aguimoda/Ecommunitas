const express = require('express');
const {
  getUsers,
  getProfile,
  getUser,
  updateUser,
  deleteUser
} = require('../controllers/users');

const router = express.Router();

// Importar middleware de protección de rutas y resultados avanzados
const { protect, authorize } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');
const User = require('../models/User');
const fileUpload = require('express-fileupload'); // Importar express-fileupload

// Todas las rutas requieren autenticación
router.use(protect);

// Rutas para administradores
router.route('/')
  .get(authorize('admin'), advancedResults(User), getUsers);

// Ruta para obtener perfil del usuario actual
router.route('/profile').get(getProfile);

// Rutas para usuarios normales y administradores
router.route('/:id')
  .get(getUser)
  .put(fileUpload({
    createParentPath: true,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max file size
    abortOnLimit: true,
    useTempFiles: true,
    tempFileDir: process.env.FILE_UPLOAD_PATH || require('path').join(__dirname, '../uploads'), // Ensure path is correct
    debug: process.env.NODE_ENV === 'development'
  }), updateUser) // Aplicar express-fileupload directamente
  .delete(authorize('admin'), deleteUser);

module.exports = router;