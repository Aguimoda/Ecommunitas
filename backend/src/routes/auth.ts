/**
 * @file auth.ts
 * @description Rutas de autenticación para la API de Ecommunitas
 * 
 * Este archivo define todas las rutas relacionadas con la autenticación
 * de usuarios, incluyendo registro, login, logout y obtención de perfil.
 * 
 * Rutas disponibles:
 * - POST /register - Registro de nuevos usuarios
 * - POST /login - Inicio de sesión
 * - GET /logout - Cierre de sesión
 * - GET /me - Obtener perfil del usuario autenticado
 * 
 * @author Equipo de Desarrollo Ecommunitas
 * @version 1.0.0
 * @since 1.0.0
 */

// ============================================================================
// IMPORTACIONES
// ============================================================================
import express from 'express';  // Framework web

// Importar controladores de autenticación
import {
  register,        // Controlador para registro de usuarios
  login,           // Controlador para inicio de sesión
  getMe,           // Controlador para obtener perfil del usuario
  logout,          // Controlador para cierre de sesión
  forgotPassword,  // Controlador para solicitar reset de contraseña
  resetPassword    // Controlador para resetear contraseña
} from '../controllers/auth';

// Importar middleware de protección de rutas
import { protect } from '../middleware/auth';

// ============================================================================
// CONFIGURACIÓN DEL ROUTER
// ============================================================================

/**
 * Router de Express para manejar las rutas de autenticación
 */
const router = express.Router();

// ============================================================================
// RUTAS PÚBLICAS (No requieren autenticación)
// ============================================================================

/**
 * @route   POST /register
 * @desc    Registrar un nuevo usuario en el sistema
 * @access  Public
 * @body    { name, email, password, role? }
 * @returns { success, token, data: user }
 */
router.post('/register', register);

/**
 * @route   POST /login
 * @desc    Iniciar sesión con email y contraseña
 * @access  Public
 * @body    { email, password }
 * @returns { success, token, data: user }
 */
router.post('/login', login);

/**
 * @route   GET /logout
 * @desc    Cerrar sesión del usuario (limpiar cookies)
 * @access  Public
 * @returns { success, message }
 */
router.get('/logout', logout);

/**
 * @route   POST /forgotpassword
 * @desc    Solicitar token para resetear contraseña
 * @access  Public
 * @body    { email }
 * @returns { success, message, resetToken }
 */
router.post('/forgotpassword', forgotPassword);

/**
 * @route   PUT /resetpassword/:resettoken
 * @desc    Resetear contraseña usando token
 * @access  Public
 * @params  { resettoken }
 * @body    { password }
 * @returns { success, token, data: user }
 */
router.put('/resetpassword/:resettoken', resetPassword);

// ============================================================================
// RUTAS PROTEGIDAS (Requieren autenticación)
// ============================================================================

/**
 * @route   GET /me
 * @desc    Obtener información del usuario autenticado
 * @access  Private
 * @headers Authorization: Bearer <token>
 * @returns { success, data: user }
 */
router.get('/me', protect, getMe);

// ============================================================================
// EXPORTACIÓN
// ============================================================================

export default router;