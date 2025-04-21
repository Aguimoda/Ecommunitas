const express = require('express');
const {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword
} = require('../controllers/auth');
const crypto = require('crypto');

const router = express.Router();

const { protect } = require('../middleware/auth');

// Rutas públicas
router.post(['/register', '/api/v1/auth/register'], register);
router.post('/login', login);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

// Rutas protegidas (requieren autenticación)
router.get('/me', protect, getMe);

module.exports = router;