/**
 * @fileoverview Servidor principal de la aplicación Ecommunitas
 * 
 * Este archivo configura y ejecuta el servidor Express para la aplicación Ecommunitas,
 * una plataforma de intercambio comunitario. Incluye configuración de middleware,
 * rutas de API, manejo de errores, seguridad CSP y logging.
 * 
 * @description Características principales:
 * - **Configuración Express**: Servidor web con middleware esencial
 * - **Seguridad**: CORS, rate limiting, CSP reporting
 * - **Base de Datos**: Conexión automática a MongoDB
 * - **Logging**: Sistema de logs con Winston para desarrollo y producción
 * - **Carga de Archivos**: Middleware para manejo de uploads
 * - **API RESTful**: Rutas organizadas por módulos (auth, users, items, messages)
 * - **Manejo de Errores**: Middleware centralizado para errores
 * - **CSP Reports**: Endpoint especializado para reportes de Content Security Policy
 * 
 * @architecture
 * ```
 * server.js
 * ├── Configuración inicial
 * │   ├── Variables de entorno
 * │   ├── Conexión a base de datos
 * │   └── Inicialización Express
 * ├── Middleware
 * │   ├── Body parser (JSON)
 * │   ├── CORS
 * │   ├── Morgan (logging desarrollo)
 * │   ├── File upload
 * │   └── Rate limiting
 * ├── Logging
 * │   ├── CSP logger (Winston)
 * │   └── Archivos de log
 * ├── Rutas API
 * │   ├── /api/v1/auth
 * │   ├── /api/v1/users
 * │   ├── /api/v1/items
 * │   └── /api/v1/messages
 * ├── Manejo de errores
 * └── Configuración del servidor
 * ```
 * 
 * @security
 * - Rate limiting para CSP reports (10 req/min por IP)
 * - Validación de Content-Type para CSP reports
 * - CORS habilitado para requests cross-origin
 * - Logging de violaciones CSP con detalles de seguridad
 * 
 * @performance
 * - Logging condicional en desarrollo
 * - Rate limiting para prevenir spam
 * - Manejo eficiente de errores
 * - Logs estructurados en JSON
 * 
 * @example
 * ```bash
 * # Desarrollo
 * NODE_ENV=development npm start
 * 
 * # Producción
 * NODE_ENV=production npm start
 * ```
 * 
 * @requires express - Framework web para Node.js
 * @requires dotenv - Carga variables de entorno
 * @requires morgan - HTTP request logger
 * @requires colors - Colores para terminal
 * @requires cors - Cross-Origin Resource Sharing
 * @requires express-rate-limit - Rate limiting middleware
 * @requires winston - Logger profesional
 * @requires uuid - Generador de UUIDs
 * 
 * @author Equipo Ecommunitas
 * @version 1.0.0
 * @since 2024
 */

const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { createLogger, transports, format } = require('winston');
const { v4: uuidv4 } = require('uuid');
const connectDB = require('./src/config/db');
const errorHandler = require('./src/middleware/error');
const fileUploadMiddleware = require('./src/middleware/fileUpload');

// Cargar variables de entorno
dotenv.config();

// Conectar a la base de datos
connectDB();

// Inicializar la aplicación Express
const app = express();

// Middleware para body parser
app.use(express.json());

// Middleware para CORS
app.use(cors());

// Middleware para logging en desarrollo
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Middleware para carga de archivos
fileUploadMiddleware(app); // Habilitando el middleware de fileUpload

// Configure CSP report logger
const cspLogger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.File({ filename: 'csp-reports.log' })
  ]
});

// Rate limiter for CSP reports (10 requests/minute per IP)
const cspRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: 'Too many CSP reports from this IP, please try again later',
  skipSuccessfulRequests: true
});

/**
 * CSP Report Endpoint
 * @route POST /csp-report
 * @desc Handle Content Security Policy violation reports
 * @access Public
 * @headers Content-Type: application/csp-report
 * @returns HTTP 204 on success
 */
app.post('/csp-report', cspRateLimiter, (req, res) => {
  // Validate Content-Type
  if (!req.is('application/csp-report')) {
    return res.status(415).send('Unsupported Media Type');
  }

  try {
    const reportId = uuidv4();
    const { 'csp-report': report } = req.body;

    // Log violation with essential details
    cspLogger.info({
      id: reportId,
      timestamp: new Date().toISOString(),
      violatedDirective: report['violated-directive'],
      documentUri: report['document-uri'],
      referrer: report.referrer,
      blockedUri: report['blocked-uri'],
      userAgent: req.headers['user-agent'],
      sourceIp: req.ip
    });

    return res.status(204).send();
  } catch (error) {
    cspLogger.error({
      message: 'Error processing CSP report',
      error: error.message,
      stack: error.stack
    });
    return res.status(400).send('Bad Request');
  }
});

// Route files
const auth = require('./src/routes/auth');
const users = require('./src/routes/users');
const items = require('./src/routes/items'); // Controlador principal de items
const messages = require('./src/routes/messages');

// Mount routers
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/items', items); // Ahora apunta al controlador unificado
app.use('/api/v1/messages', messages);

// Middleware para manejo de errores
app.use(errorHandler);

// Configurar el puerto del servidor
const PORT = process.env.PORT || 3000;

// Iniciar el servidor
const server = app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en modo ${process.env.NODE_ENV} en el puerto ${PORT}`.yellow.bold);
});

// Manejar rechazos de promesas no capturados
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Cerrar el servidor y salir del proceso
  server.close(() => process.exit(1));
});

module.exports = app;