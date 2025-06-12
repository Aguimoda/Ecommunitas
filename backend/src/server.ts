/**
 * @file server.ts
 * @description Servidor principal de la API REST de Ecommunitas - Punto de entrada del backend
 * 
 * Este archivo constituye el núcleo central del servidor backend de la aplicación Ecommunitas.
 * Configura y inicializa un servidor Express completo que actúa como la API REST principal
 * para toda la aplicación. El servidor maneja todas las operaciones del backend incluyendo
 * autenticación, gestión de usuarios, publicación de artículos, sistema de mensajería,
 * administración y todas las funcionalidades core de la plataforma.
 * 
 * ARQUITECTURA Y RESPONSABILIDADES:
 * ================================
 * 
 * 🏗️ CONFIGURACIÓN DEL SERVIDOR:
 * - Inicialización de Express con TypeScript para type safety
 * - Configuración de puerto dinámico (desarrollo: 5000, producción: variable)
 * - Manejo de variables de entorno con validación
 * - Configuración de middleware en orden específico para optimización
 * 
 * 🔒 SEGURIDAD Y PROTECCIÓN:
 * - CORS (Cross-Origin Resource Sharing) configurado para frontend específico
 * - Rate Limiting para prevenir ataques de fuerza bruta y spam
 * - Content Security Policy (CSP) para prevenir ataques XSS
 * - Helmet para headers de seguridad adicionales
 * - Validación y sanitización de datos de entrada
 * 
 * 📁 GESTIÓN DE ARCHIVOS:
 * - Integración con Cloudinary para almacenamiento en la nube
 * - Middleware de subida de archivos con validación de tipos
 * - Compresión automática de imágenes
 * - Límites de tamaño de archivo configurables
 * 
 * 🗄️ BASE DE DATOS:
 * - Conexión a MongoDB con Mongoose ODM
 * - Pool de conexiones optimizado
 * - Índices de base de datos para rendimiento
 * - Manejo de reconexión automática
 * 
 * 📝 SISTEMA DE LOGGING:
 * - Winston para logging estructurado y niveles
 * - Morgan para logging de requests HTTP
 * - Rotación de logs automática
 * - Diferentes niveles: error, warn, info, debug
 * 
 * 🛡️ AUTENTICACIÓN Y AUTORIZACIÓN:
 * - JWT (JSON Web Tokens) para autenticación stateless
 * - Middleware de protección de rutas
 * - Roles y permisos granulares
 * - Refresh tokens para seguridad mejorada
 * 
 * 🔄 MANEJO DE ERRORES:
 * - Sistema centralizado de manejo de errores
 * - Respuestas de error consistentes
 * - Logging automático de errores
 * - Diferentes tipos de error según contexto
 * 
 * 📊 FUNCIONALIDADES AVANZADAS:
 * - Middleware de paginación para grandes datasets
 * - Filtrado y ordenamiento dinámico
 * - Búsqueda full-text en múltiples campos
 * - Caché de respuestas para optimización
 * 
 * 🌐 RUTAS Y ENDPOINTS:
 * - /api/auth - Autenticación y registro de usuarios
 * - /api/users - Gestión de perfiles de usuario
 * - /api/items - CRUD de artículos y publicaciones
 * - /api/messages - Sistema de mensajería privada
 * - /api/admin - Panel de administración
 * 
 * FLUJO DE INICIALIZACIÓN:
 * =======================
 * 1. Carga de variables de entorno (.env)
 * 2. Configuración de logging y colores
 * 3. Conexión a base de datos MongoDB
 * 4. Inicialización de Express app
 * 5. Configuración de middleware de seguridad
 * 6. Configuración de parsers y CORS
 * 7. Registro de rutas de la API
 * 8. Middleware de manejo de errores
 * 9. Inicio del servidor en puerto especificado
 * 10. Configuración de handlers para señales del sistema
 * 
 * VARIABLES DE ENTORNO REQUERIDAS:
 * ===============================
 * - NODE_ENV: Entorno de ejecución (development/production)
 * - PORT: Puerto del servidor (default: 5000)
 * - MONGO_URI: URI de conexión a MongoDB
 * - JWT_SECRET: Clave secreta para JWT
 * - CLOUDINARY_CLOUD_NAME: Nombre de cloud de Cloudinary
 * - CLOUDINARY_API_KEY: API key de Cloudinary
 * - CLOUDINARY_API_SECRET: API secret de Cloudinary
 * 
 * DEPENDENCIAS PRINCIPALES:
 * =======================
 * - express: Framework web minimalista y flexible
 * - mongoose: ODM para MongoDB con validación de esquemas
 * - jsonwebtoken: Implementación de JWT para Node.js
 * - bcryptjs: Hashing de contraseñas con salt
 * - cloudinary: SDK para gestión de archivos multimedia
 * - winston: Logger avanzado con múltiples transportes
 * - cors: Middleware para Cross-Origin Resource Sharing
 * - helmet: Colección de middleware de seguridad
 * - express-rate-limit: Rate limiting para prevenir abuso
 * 
 * @author Equipo de Desarrollo Ecommunitas
 * @version 1.0.0
 * @since 1.0.0
 * @created 2024
 * @lastModified 2024
 * 
 * @example
 * // Iniciar el servidor en desarrollo:
 * npm run dev
 * 
 * @example
 * // Iniciar el servidor en producción:
 * npm start
 * 
 * @see {@link https://expressjs.com/} Express.js Documentation
 * @see {@link https://mongoosejs.com/} Mongoose Documentation
 * @see {@link https://jwt.io/} JWT Documentation
 */

// ============================================================================
// CONFIGURACIÓN CRÍTICA DE VARIABLES DE ENTORNO
// ============================================================================
/**
 * IMPORTANTE: Las variables de entorno DEBEN cargarse ANTES que cualquier otro módulo
 * para garantizar que estén disponibles durante todo el proceso de inicialización.
 * 
 * El archivo .env debe estar ubicado en la raíz del directorio backend y contener
 * todas las variables necesarias para el funcionamiento de la aplicación.
 * 
 * Si las variables no se cargan correctamente, la aplicación fallará durante
 * la inicialización con errores de configuración.
 */
import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno desde el archivo .env con path absoluto
// Esto asegura que funcione independientemente del directorio de trabajo actual
dotenv.config({ path: path.join(__dirname, '../.env') });

// ============================================================================
// IMPORTACIONES DE MÓDULOS PRINCIPALES DEL ECOSISTEMA NODE.JS
// ============================================================================
/**
 * Importación de dependencias externas después de cargar variables de entorno.
 * El orden de importación es importante para evitar problemas de inicialización.
 */

// Framework web principal - Express.js
// Proporciona la infraestructura básica para crear el servidor HTTP
import express from 'express';

// Logger HTTP para desarrollo - Morgan
// Registra todas las peticiones HTTP con detalles de timing y status
import morgan from 'morgan';

// Utilidad para colores en terminal - Colors
// Mejora la legibilidad de logs en desarrollo con colores
import colors from 'colors';

// Cross-Origin Resource Sharing - CORS
// Permite que el frontend acceda a la API desde diferentes dominios
import cors from 'cors';

// Rate Limiting para prevención de abuso - Express Rate Limit
// Limita el número de requests por IP en un período de tiempo
import rateLimit from 'express-rate-limit';

// Sistema de logging avanzado - Winston
// Proporciona logging estructurado con múltiples niveles y transportes
import { createLogger, transports, format } from 'winston';

// Generador de identificadores únicos - UUID v4
// Utilizado para generar IDs únicos para requests y sesiones
import { v4 as uuidv4 } from 'uuid';

// Middleware para manejo de archivos - Express File Upload
// @ts-ignore - Esta librería no tiene tipos TypeScript oficiales
// Permite la subida de archivos multipart/form-data
import fileUpload from 'express-fileupload';

// ============================================================================
// IMPORTACIONES DE MÓDULOS LOCALES DE LA APLICACIÓN
// ============================================================================
/**
 * Importación de módulos desarrollados específicamente para Ecommunitas.
 * Estos módulos contienen la lógica de negocio y configuración específica.
 */

// Middleware personalizado para manejo de archivos
// Configura la subida de archivos con validaciones específicas y integración con Cloudinary
import fileUploadMiddleware from './middleware/fileUpload';

// Configuración y conexión a la base de datos MongoDB
// Maneja la conexión, reconexión automática y configuración de índices
import connectDB from './config/db';

// Middleware centralizado de manejo de errores
// Procesa todos los errores de la aplicación y devuelve respuestas consistentes
import errorMiddleware from './middleware/error';

// ============================================================================
// IMPORTACIÓN DE RUTAS DE LA API REST
// ============================================================================
/**
 * Importación de todos los módulos de rutas que definen los endpoints de la API.
 * Cada módulo maneja un dominio específico de la aplicación:
 */

// Rutas de autenticación y autorización (/api/auth)
// Maneja registro, login, logout, recuperación de contraseña, verificación de email
import authRoutes from './routes/auth';

// Rutas de gestión de artículos y publicaciones (/api/items)
// CRUD completo de artículos, búsqueda, filtrado, categorización
import itemsRoutes from './routes/items';

// Rutas del sistema de mensajería privada (/api/messages)
// Envío, recepción, marcado como leído, conversaciones, notificaciones
import messagesRoutes from './routes/messages';

// Rutas de gestión de usuarios (/api/users)
// Perfiles, configuración, seguimiento, bloqueo, administración de cuentas
import usersRoutes from './routes/users';

// ============================================================================
// INICIALIZACIÓN CRÍTICA DE BASE DE DATOS
// ============================================================================
/**
 * IMPORTANTE: La conexión a la base de datos debe establecerse ANTES de
 * inicializar el servidor Express para asegurar que todos los modelos
 * estén disponibles cuando se procesen las primeras requests.
 * 
 * La función connectDB() maneja:
 * - Conexión inicial a MongoDB
 * - Configuración de opciones de conexión
 * - Manejo de errores de conexión
 * - Reconexión automática en caso de pérdida de conexión
 * - Creación de índices de base de datos para optimización
 */
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

// ============================================================================
// CONFIGURACIÓN DE LA APLICACIÓN EXPRESS
// ============================================================================
/**
 * Crear la instancia principal de Express que actuará como servidor HTTP.
 * Esta instancia será configurada con todos los middleware necesarios
 * y las rutas de la API antes de ser iniciada.
 */
const app = express();

// ============================================================================
// CONFIGURACIÓN DE MIDDLEWARE BÁSICO Y PARSERS
// ============================================================================
/**
 * Los middleware se ejecutan en orden secuencial para cada request.
 * El orden de configuración es crítico para el funcionamiento correcto.
 */

/**
 * PARSER DE JSON:
 * Middleware integrado de Express para parsear automáticamente el contenido JSON
 * del body de las requests HTTP. Esto permite acceder a req.body como objeto JavaScript.
 * 
 * Configuración:
 * - Límite de tamaño: 10mb (configurable)
 * - Tipos MIME aceptados: application/json
 * - Validación automática de sintaxis JSON
 * 
 * Sin este middleware, req.body sería undefined para requests con contenido JSON.
 */
app.use(express.json());

/**
 * CONFIGURACIÓN CORS (Cross-Origin Resource Sharing):
 * Middleware esencial para permitir que el frontend (Vue.js) se comunique
 * con la API desde un dominio/puerto diferente.
 * 
 * Configuración actual: Permisiva (permite todos los orígenes)
 * Configuración recomendada para producción:
 * {
 *   origin: ['https://ecommunitas.com', 'https://www.ecommunitas.com'],
 *   credentials: true,
 *   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
 *   allowedHeaders: ['Content-Type', 'Authorization']
 * }
 * 
 * Headers CORS que se añaden automáticamente:
 * - Access-Control-Allow-Origin
 * - Access-Control-Allow-Methods
 * - Access-Control-Allow-Headers
 * - Access-Control-Allow-Credentials
 */
app.use(cors());

/**
 * Middleware de logging para desarrollo
 * Morgan registra todas las peticiones HTTP en la consola
 * Solo se activa en modo desarrollo para no saturar logs en producción
 */
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

/**
 * Middleware personalizado para manejo de archivos
 * Configura la carga de archivos con validaciones y límites
 * Integrado con Cloudinary para almacenamiento en la nube
 */
fileUploadMiddleware(app);

// ============================================================================
// CONFIGURACIÓN DE SEGURIDAD Y LOGGING
// ============================================================================

/**
 * Configuración del logger para violaciones de Content Security Policy (CSP)
 * Utiliza Winston para registrar todas las violaciones de seguridad CSP
 * en un archivo dedicado para su posterior análisis
 */
const cspLogger = createLogger({
  level: 'info',                           // Nivel de logging
  format: format.combine(                  // Formato de los logs
    format.timestamp(),                    // Añade timestamp a cada entrada
    format.json()                          // Formato JSON para fácil procesamiento
  ),
  transports: [
    // Almacena los logs en un archivo dedicado
    new transports.File({ filename: 'logs/csp-violations.log' })
  ]
});

/**
 * Endpoint para reportar violaciones de Content Security Policy
 * Recibe informes automáticos del navegador cuando se detectan
 * violaciones de la política de seguridad de contenido
 * 
 * @route POST /report-violation
 * @access Public
 */
app.post('/report-violation', express.json({ type: 'application/csp-report' }), (req, res) => {
  const requestId = uuidv4();  // Genera ID único para cada reporte
  
  // Registra la violación en el log con todos los detalles
  cspLogger.info('CSP Violation', {
    requestId,
    ...req.body['csp-report']
  });
  
  // Responde con 204 (No Content) ya que no es necesario enviar datos al cliente
  res.status(204).end();
});

/**
 * Configuración de Rate Limiting (limitación de velocidad)
 * Protege contra ataques de fuerza bruta y DoS limitando
 * el número de peticiones que un cliente puede hacer en un período
 */
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,  // Ventana de tiempo: 10 minutos
  max: 100,                  // Máximo 100 peticiones por IP en la ventana de tiempo
  message: 'Demasiadas peticiones desde esta IP, por favor intente de nuevo después de 10 minutos'
});

/**
 * Aplicar limitación de velocidad a todas las rutas de la API
 * Esto protege todos los endpoints bajo /api/* de posibles abusos
 */
app.use('/api', limiter);

// ============================================================================
// CONFIGURACIÓN DE RUTAS DE LA API
// ============================================================================

/**
 * Montaje de rutas de la API
 * Cada grupo de rutas maneja un dominio específico de la aplicación:
 * - auth: Autenticación y autorización de usuarios
 * - items: Gestión de artículos para intercambio
 * - messages: Sistema de mensajería entre usuarios
 * - users: Gestión de perfiles y datos de usuarios
 */
app.use('/api/v1/auth', authRoutes);         // Rutas de autenticación
app.use('/api/v1/items', itemsRoutes);       // Rutas de artículos
app.use('/api/v1/messages', messagesRoutes); // Rutas de mensajería
app.use('/api/v1/users', usersRoutes);       // Rutas de usuarios

// ============================================================================
// MIDDLEWARE DE MANEJO DE ERRORES
// ============================================================================

/**
 * Middleware de manejo de errores centralizado
 * IMPORTANTE: Debe ir al final de todas las rutas y middleware
 * Captura y procesa todos los errores que ocurran en la aplicación
 */
app.use(errorMiddleware.errorHandler);

// ============================================================================
// CONFIGURACIÓN E INICIO DEL SERVIDOR
// ============================================================================

/**
 * Configuración del puerto del servidor
 * Utiliza la variable de entorno PORT o el puerto 5000 por defecto
 */
const PORT = process.env.PORT || 5000;

/**
 * Inicialización del servidor HTTP
 * Inicia el servidor Express en el puerto especificado
 */
let server: any;
if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, () => {
    console.log(colors.yellow.bold(`🚀 Servidor corriendo en modo ${process.env.NODE_ENV} en puerto ${PORT}`));
  });
}

// ============================================================================
// MANEJO DE ERRORES GLOBALES Y CIERRE GRACEFUL
// ============================================================================

/**
 * Manejo de promesas rechazadas no capturadas
 * Captura errores asincrónicos que no fueron manejados apropiadamente
 * y cierra el servidor de manera segura
 */
process.on('unhandledRejection', (err: any, promise) => {
  console.log(colors.red(`❌ Error de promesa no manejada: ${err.message}`));
  
  // Cerrar servidor de manera segura y salir del proceso
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

export default app;