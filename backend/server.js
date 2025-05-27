const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { createLogger, transports, format } = require('winston');
const { v4: uuidv4 } = require('uuid');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');
const fileUploadMiddleware = require('./middleware/fileUpload');

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

// Importar rutas
const auth = require('./routes/auth');
const users = require('./routes/users');
const items = require('./routes/items');
const messages = require('./routes/messages');

// Montar rutas
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/items', items);
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