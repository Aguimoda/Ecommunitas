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
  .put(updateUser)
  .delete(authorize('admin'), deleteUser);

module.exports = router;