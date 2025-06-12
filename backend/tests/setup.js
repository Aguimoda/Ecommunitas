/**
 * @fileoverview Configuración inicial para el entorno de testing de Ecommunitas
 * 
 * Este archivo se ejecuta antes de cada suite de pruebas para configurar
 * el entorno de testing. Establece variables de entorno específicas para
 * pruebas, configura el sistema de logging y maneja errores no capturados
 * durante la ejecución de tests.
 * 
 * @description Características principales:
 * - **Variables de entorno**: Configuración específica para testing
 * - **Base de datos**: URI de MongoDB para pruebas aisladas
 * - **Autenticación**: JWT secrets y configuración para testing
 * - **Logging**: Silenciado durante pruebas para output limpio
 * - **Error handling**: Captura de errores no manejados
 * - **Aislamiento**: Entorno completamente separado de desarrollo/producción
 * 
 * @architecture
 * ```
 * Test Setup
 * ├── Variables de entorno
 * │   ├── NODE_ENV=test
 * │   ├── JWT_SECRET (para pruebas)
 * │   ├── JWT_EXPIRE (1 día)
 * │   └── MONGO_URI (BD de pruebas)
 * ├── Configuración de logging
 * │   ├── Winston silenciado
 * │   └── Console transport deshabilitado
 * └── Error handling
 *     ├── Unhandled rejections
 *     └── Logging de errores críticos
 * ```
 * 
 * @environment Variables configuradas:
 * - **NODE_ENV**: 'test' - Identifica entorno de testing
 * - **JWT_SECRET**: Clave específica para tokens de prueba
 * - **JWT_EXPIRE**: '1d' - Expiración de tokens de prueba
 * - **MONGO_URI**: Base de datos MongoDB separada para testing
 * 
 * @database Configuración de base de datos:
 * - **Nombre**: ecommunitas_test (separada de desarrollo)
 * - **Host**: localhost:27017 (MongoDB local)
 * - **Aislamiento**: Datos de prueba no afectan otros entornos
 * - **Limpieza**: Se puede limpiar entre pruebas sin riesgo
 * 
 * @logging Configuración de logs:
 * - **Winston**: Completamente silenciado durante pruebas
 * - **Console**: Sin output para mantener tests limpios
 * - **Errores críticos**: Solo se muestran unhandled rejections
 * - **Performance**: Reduce overhead de I/O durante testing
 * 
 * @security Consideraciones de seguridad:
 * - JWT secret diferente al de producción
 * - Base de datos aislada
 * - Variables de entorno específicas para testing
 * - No exposición de credenciales reales
 * 
 * @usage Este archivo es cargado automáticamente por Jest:
 * ```javascript
 * // En jest.config.js
 * setupFiles: ['./tests/setup.js']
 * 
 * // Se ejecuta antes de cada archivo de prueba
 * // No necesita importación manual
 * ```
 * 
 * @testing Beneficios para testing:
 * - **Consistencia**: Mismo entorno para todas las pruebas
 * - **Aislamiento**: No interferencia con otros entornos
 * - **Velocidad**: Logging silenciado mejora performance
 * - **Debugging**: Errores críticos aún se muestran
 * - **Limpieza**: Output de pruebas sin ruido
 * 
 * @maintenance Mantenimiento:
 * - Actualizar JWT_SECRET periódicamente
 * - Verificar compatibilidad con nuevas versiones de Winston
 * - Monitorear que la BD de pruebas esté disponible
 * - Revisar configuración cuando se agreguen nuevas variables
 * 
 * @author Equipo Ecommunitas
 * @version 1.0.0
 * @since 2024
 */

// ============================================================================
// CONFIGURACIÓN DE VARIABLES DE ENTORNO PARA PRUEBAS
// ============================================================================

// Establecer entorno como 'test' para activar configuraciones específicas
process.env.NODE_ENV = 'test';

// Configuración de JWT para autenticación en pruebas
// Usar un secret diferente al de producción por seguridad
process.env.JWT_SECRET = 'secret_para_pruebas_unitarias';
process.env.JWT_EXPIRE = '1d';

// Base de datos MongoDB específica para pruebas
// Usar una BD separada para evitar contaminar datos de desarrollo
process.env.MONGO_URI = 'mongodb://localhost:27017/ecommunitas_test';

// Configuración de Cloudinary para pruebas
// Usar valores de prueba para evitar usar credenciales reales
process.env.CLOUDINARY_CLOUD_NAME = 'test_cloud';
process.env.CLOUDINARY_API_KEY = 'test_api_key';
process.env.CLOUDINARY_API_SECRET = 'test_api_secret';

// Configuración adicional para el entorno de pruebas
process.env.PORT = '5000';
process.env.FRONTEND_URL = 'http://localhost:3000';

// ============================================================================
// CONFIGURACIÓN DEL SISTEMA DE LOGGING
// ============================================================================

// Silenciar logs durante las pruebas para mantener output limpio
const winston = require('winston');
winston.configure({
  transports: [
    new winston.transports.Console({
      silent: true // Desactivar output de consola durante pruebas
    })
  ]
});

// ============================================================================
// MANEJO DE ERRORES NO CAPTURADOS
// ============================================================================

// Configuración para manejar errores no capturados durante las pruebas
// Esto ayuda a identificar problemas que podrían pasar desapercibidos
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Cerrando pruebas...');
  console.error(err.name, err.message);
  // En testing, es importante ver estos errores para debugging
  console.error(err.stack);
});