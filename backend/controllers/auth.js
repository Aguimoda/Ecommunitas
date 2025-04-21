const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { createLogger, format, transports } = require('winston');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Configuración correcta del directorio de logs
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Configuración del transporte File corregida
const authLogger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.printf(({ level, message, timestamp }) => {
      return `${timestamp} ${level}: ${message}`;
    })
  ),
  transports: [
    new transports.Console(),
    new transports.File({ 
      filename: path.join(logsDir, 'auth.log'),
      level: 'info'
    })
  ]
});


// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  const requestId = Date.now().toString();
  authLogger.info(`[${requestId}] Intento de registro iniciado`);
  authLogger.debug(`[${requestId}] Datos de registro recibidos: ${JSON.stringify(req.body, null, 2).replace(/"password":"[^"]*"/, '"password":"[REDACTED]"')}`);
  
  const { name, email, password, role } = req.body;

  // Validaciones básicas
  if (!name || !email || !password) {
    authLogger.warn(`[${requestId}] Error de validación: Faltan campos requeridos`);
    return next(new ErrorResponse('Por favor proporcione todos los campos requeridos: nombre, email y contraseña', 400));
  }
  
  // Validar longitud del nombre
  if (name.length < 2 || name.length > 50) {
    authLogger.warn(`[${requestId}] Error de validación: Longitud de nombre inválida (${name.length} caracteres)`);
    return next(new ErrorResponse('El nombre debe tener entre 2 y 50 caracteres', 400));
  }

  try {
    // Verificar si el email ya está registrado antes de continuar
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      authLogger.warn(`[${requestId}] Error de validación: Email ya registrado (${email})`);
      return next(new ErrorResponse('El email ya está registrado. Por favor use otro email o inicie sesión', 400));
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      authLogger.warn(`[${requestId}] Error de validación: Formato de email inválido (${email})`);
      return next(new ErrorResponse('Formato de email inválido', 400));
    }

    // Validar fortaleza de contraseña
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      authLogger.warn(`[${requestId}] Error de validación: Contraseña insegura - ${passwordValidation.message}`);
      return next(new ErrorResponse(passwordValidation.message, 400));
    }

    // Crear usuario
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user'
    });

    authLogger.info(`[${requestId}] Usuario creado exitosamente: ${user._id}`);
    
    // Registrar datos de RGPD
    authLogger.info(`[${requestId}] Consentimiento RGPD registrado para usuario ${user._id} desde IP ${req.ip}`);
    
    sendTokenResponse(user, 200, res, requestId);
  } catch (err) {
    authLogger.error(`[${requestId}] Error durante el registro de usuario: ${err.message}`, {
      error: {
        message: err.message,
        code: err.code,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
      }
    });
    
    // Manejar errores específicos de MongoDB
    if (err.code === 11000) {
      return next(new ErrorResponse('El email ya está registrado. Por favor use otro email o inicie sesión', 400));
    }
    
    // Manejar otros errores de validación
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return next(new ErrorResponse(messages.join(', '), 400));
    }
    
    // Manejar errores de conexión a la base de datos
    if (err.name === 'MongoNetworkError' || err.name === 'MongoTimeoutError') {
      authLogger.error(`[${requestId}] Error de conexión a la base de datos: ${err.message}`);
      return next(new ErrorResponse('Error de conexión al servidor. Por favor intente más tarde', 500));
    }
    
    next(err);
  }
});

// Función para validar contraseña
const validatePassword = (password) => {
  // Verificar longitud mínima
  if (password.length < 8) {
    return {
      isValid: false,
      message: 'La contraseña debe tener al menos 8 caracteres'
    };
  }
  
  // Verificar mayúsculas
  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: 'La contraseña debe contener al menos una letra mayúscula'
    };
  }
  
  // Verificar números
  if (!/[0-9]/.test(password)) {
    return {
      isValid: false,
      message: 'La contraseña debe contener al menos un número'
    };
  }
  
  // Verificar caracteres especiales (opcional pero recomendado)
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return {
      isValid: false,
      message: 'La contraseña debe contener al menos un carácter especial (!@#$%^&*(),.?":{}|<>)'
    };
  }
  
  return {
    isValid: true,
    message: 'Contraseña válida'
  };
}

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const requestId = Date.now().toString();
  authLogger.info(`[${requestId}] Intento de inicio de sesión`);
  
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    authLogger.warn(`[${requestId}] Error de validación: Falta email o contraseña`);
    return next(new ErrorResponse('Por favor proporcione un email y contraseña', 400));
  }

  try {
    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      authLogger.warn(`[${requestId}] Intento de inicio de sesión fallido: Usuario no encontrado (${email})`);
      return next(new ErrorResponse('Credenciales inválidas', 401));
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      authLogger.warn(`[${requestId}] Intento de inicio de sesión fallido: Contraseña incorrecta para usuario ${user._id}`);
      return next(new ErrorResponse('Credenciales inválidas', 401));
    }

    // Actualizar fecha de último inicio de sesión
    await user.updateLastLogin();
    authLogger.info(`[${requestId}] Inicio de sesión exitoso para usuario ${user._id}`);
    sendTokenResponse(user, 200, res, requestId);
  } catch (err) {
    authLogger.error(`[${requestId}] Error durante el inicio de sesión: ${err.message}`, {
      error: {
        message: err.message,
        code: err.code,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
      }
    });
    
    // Manejar errores de conexión a la base de datos
    if (err.name === 'MongoNetworkError' || err.name === 'MongoTimeoutError') {
      return next(new ErrorResponse('Error de conexión al servidor. Por favor intente más tarde', 500));
    }
    
    next(err);
  }
});

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const requestId = Date.now().toString();
  authLogger.info(`[${requestId}] Solicitud de perfil de usuario ${req.user.id}`);
  
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      authLogger.error(`[${requestId}] Usuario no encontrado en la base de datos a pesar de tener token válido`);
      return next(new ErrorResponse('Usuario no encontrado', 404));
    }
    
    authLogger.info(`[${requestId}] Perfil de usuario recuperado exitosamente`);
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    authLogger.error(`[${requestId}] Error al recuperar perfil de usuario: ${err.message}`);
    next(err);
  }
});

// @desc    Forgot password
// @route   POST /api/v1/auth/forgotpassword
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const requestId = Date.now().toString();
  authLogger.info(`[${requestId}] Solicitud de restablecimiento de contraseña`);
  
  const { email } = req.body;
  
  if (!email) {
    authLogger.warn(`[${requestId}] Falta el email en la solicitud de restablecimiento`);
    return next(new ErrorResponse('Por favor proporcione un email', 400));
  }
  
  try {
    // Buscar usuario por email
    const user = await User.findOne({ email });
    
    if (!user) {
      authLogger.warn(`[${requestId}] Intento de restablecimiento para email no registrado: ${email}`);
      return next(new ErrorResponse('No existe un usuario con ese email', 404));
    }
    
    // Generar token de restablecimiento
    const resetToken = user.getResetPasswordToken();
    
    // Guardar el usuario con el token y la fecha de expiración
    await user.save({ validateBeforeSave: false });
    
    // Crear URL de restablecimiento
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`;
    
    // Aquí se enviaría el email con el token (implementación pendiente)
    // Por ahora, solo registramos en el log y devolvemos el token en la respuesta
    authLogger.info(`[${requestId}] Token de restablecimiento generado para usuario ${user._id}`);
    
    res.status(200).json({
      success: true,
      message: 'Email de restablecimiento enviado',
      resetUrl, // En producción, esto no se enviaría en la respuesta
      resetToken // En producción, esto no se enviaría en la respuesta
    });
  } catch (err) {
    authLogger.error(`[${requestId}] Error al procesar solicitud de restablecimiento: ${err.message}`);
    
    // Si hay un error, limpiar los campos de restablecimiento
    if (user) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
    }
    
    return next(new ErrorResponse('No se pudo enviar el email de restablecimiento', 500));
  }
});

// @desc    Reset password
// @route   PUT /api/v1/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const requestId = Date.now().toString();
  authLogger.info(`[${requestId}] Intento de restablecimiento de contraseña con token`);
  
  // Obtener token hasheado
  const resetToken = req.params.resettoken;
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  try {
    // Buscar usuario con token válido y no expirado
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });
    
    if (!user) {
      authLogger.warn(`[${requestId}] Token de restablecimiento inválido o expirado`);
      return next(new ErrorResponse('Token inválido o expirado', 400));
    }
    
    // Validar nueva contraseña
    const { password } = req.body;
    if (!password) {
      authLogger.warn(`[${requestId}] Falta la nueva contraseña en la solicitud`);
      return next(new ErrorResponse('Por favor proporcione una nueva contraseña', 400));
    }
    
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      authLogger.warn(`[${requestId}] Nueva contraseña insegura: ${passwordValidation.message}`);
      return next(new ErrorResponse(passwordValidation.message, 400));
    }
    
    // Establecer nueva contraseña y limpiar campos de restablecimiento
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    
    await user.save();
    
    authLogger.info(`[${requestId}] Contraseña restablecida exitosamente para usuario ${user._id}`);
    
    sendTokenResponse(user, 200, res, requestId);
  } catch (err) {
    authLogger.error(`[${requestId}] Error al restablecer contraseña: ${err.message}`);
    next(err);
  }
});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res, requestId) => {
  try {
    // Create token
    const token = user.getSignedJwtToken();

    const options = {
      expires: new Date(
        Date.now() + process.env.JWT_EXPIRE.replace('d', '') * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' // Protección contra CSRF
    };

    authLogger.debug(`[${requestId}] Token JWT generado para usuario ${user._id}`);

    res
      .status(statusCode)
      .cookie('token', token, options)
      .json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
  } catch (error) {
    authLogger.error(`[${requestId}] Error al generar token: ${error.message}`);
    throw error;
  }
};