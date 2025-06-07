import express from 'express';
import {
  register,
  login,
  getMe,
  logout
} from '../controllers/auth';
import { protect } from '../middleware/auth';

const router = express.Router();

// Rutas públicas
router.post(['/register', '/api/v1/auth/register'], register);
router.post('/login', login);
router.get('/logout', logout);

// Rutas protegidas (requieren autenticación)
router.get('/me', protect, getMe);

export default router;