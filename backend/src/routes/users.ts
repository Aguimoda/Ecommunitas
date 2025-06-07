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