/**
 * @file users.ts
 * @description Rutas para la gestión de usuarios en la API de Ecommunitas
 * @module Routes/Users
 * @version 1.0.0
 * @author Ecommunitas Team
 * @created 2024
 * 
 * Este archivo define las rutas para la gestión de usuarios:
 * - Obtener lista de usuarios (solo administradores)
 * - Obtener perfil del usuario actual
 * - Obtener perfil de usuario específico
 * - Actualizar perfil de usuario
 * - Eliminar usuario (solo administradores)
 * 
 * Rutas disponibles:
 * - GET / - Obtener todos los usuarios (admin)
 * - GET /profile - Obtener perfil del usuario actual
 * - GET /:id - Obtener usuario específico
 * - PUT /:id - Actualizar usuario
 * - DELETE /:id - Eliminar usuario (admin)
 */

import express from 'express';
import {
  getUsers,
  getProfile,
  getUser,
  updateUser,
  deleteUser
} from '../controllers/users';

const router = express.Router();

// Importar middleware de protección de rutas y resultados avanzados
import { protect, authorize } from '../middleware/auth';
import advancedResults from '../middleware/advancedResults';
import User from '../models/User';
// Removed express-fileupload import - using global middleware instead

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
  .put(updateUser) // Using global fileUpload middleware
  .delete(authorize('admin'), deleteUser);

export default router;