/**
 * @fileoverview Configuración de Jest para testing del backend de Ecommunitas
 * 
 * Este archivo configura Jest como framework de testing para el backend
 * de la aplicación Ecommunitas. Define patrones de archivos de prueba,
 * configuración de cobertura, entorno de ejecución y opciones específicas
 * para testing de APIs Node.js.
 * 
 * @description Características principales:
 * - **Framework**: Jest para testing unitario e integración
 * - **Entorno**: Node.js para testing de backend
 * - **Cobertura**: Análisis automático de cobertura de código
 * - **Timeout**: Configurado para operaciones asíncronas
 * - **Setup**: Configuración inicial para cada test
 * - **Patrones**: Búsqueda automática de archivos .test.js
 * 
 * @architecture
 * ```
 * Jest Configuration
 * ├── Archivos de prueba
 * │   ├── Patrón: **/tests/**/*.test.js
 * │   ├── Directorio raíz: ../
 * │   └── Ignorados: node_modules
 * ├── Cobertura
 * │   ├── Directorio: ./tests/coverage
 * │   ├── Incluye: controllers, models, middleware
 * │   └── Excluye: node_modules
 * ├── Entorno
 * │   ├── Tipo: node
 * │   ├── Timeout: 10 segundos
 * │   └── Setup: ./tests/setup.js
 * └── Output
 *     └── Verbose: información detallada
 * ```
 * 
 * @coverage Configuración de cobertura:
 * - **Directorios incluidos**: controllers, models, middleware
 * - **Formato**: HTML, texto y JSON
 * - **Umbral**: Configurable por tipo de archivo
 * - **Reportes**: Generados en ./tests/coverage
 * 
 * @testing Tipos de pruebas soportadas:
 * - **Unitarias**: Funciones y métodos individuales
 * - **Integración**: APIs y endpoints completos
 * - **Middleware**: Autenticación, validación, errores
 * - **Modelos**: Operaciones de base de datos
 * - **Controladores**: Lógica de negocio
 * 
 * @usage Comandos de testing:
 * ```bash
 * # Ejecutar todas las pruebas
 * npm test
 * 
 * # Ejecutar con cobertura
 * npm run test:coverage
 * 
 * # Ejecutar en modo watch
 * npm run test:watch
 * 
 * # Ejecutar pruebas específicas
 * npm test -- auth.test.js
 * ```
 * 
 * @structure Estructura de archivos de prueba:
 * ```
 * tests/
 * ├── setup.js (configuración inicial)
 * ├── auth.test.js (pruebas de autenticación)
 * ├── users.test.js (pruebas de usuarios)
 * ├── items.test.js (pruebas de artículos)
 * └── coverage/ (reportes de cobertura)
 * ```
 * 
 * @environment Variables de entorno para testing:
 * - **NODE_ENV**: test
 * - **MONGODB_URI**: Base de datos de prueba
 * - **JWT_SECRET**: Clave para tokens de prueba
 * - **PORT**: Puerto alternativo para testing
 * 
 * @performance Optimizaciones:
 * - Timeout de 10 segundos para operaciones de BD
 * - Ejecución paralela de pruebas
 * - Cache de módulos para velocidad
 * - Setup único por archivo de prueba
 * 
 * @author Equipo Ecommunitas
 * @version 1.0.0
 * @since 2024
 */

module.exports = {
  // Preset para manejar TypeScript
  preset: 'ts-jest',
  
  // Directorio raíz donde Jest buscará los archivos
  // Se establece en el directorio padre para acceder a todo el proyecto
  rootDir: '../',
  
  // Patrón para encontrar archivos de prueba
  // Busca archivos .test.js en cualquier subdirectorio de tests/
  testMatch: ['**/tests/**/*.test.js'],
  
  // Ignorar ciertos directorios durante la búsqueda de pruebas
  // Excluye node_modules para mejorar rendimiento
  testPathIgnorePatterns: ['/node_modules/'],
  
  // Configuración de cobertura de código
  collectCoverage: true,
  coverageDirectory: './tests/coverage',
  
  // Archivos incluidos en el análisis de cobertura
  // Incluye solo archivos de lógica de negocio, excluye dependencias
  collectCoverageFrom: [
    'controllers/**/*.js',  // Controladores de API
    'models/**/*.js',       // Modelos de base de datos
    'middleware/**/*.js',   // Middleware personalizado
    '!**/node_modules/**'   // Excluir dependencias
  ],
  
  // Configuración de entorno de ejecución
  // 'node' es apropiado para testing de backend/APIs
  testEnvironment: 'node',
  
  // Transformaciones para archivos TypeScript
  transform: {
    '^.+\.ts$': 'ts-jest',
    '^.+\.js$': 'babel-jest'
  },
  
  // Extensiones de archivos a procesar
  moduleFileExtensions: ['ts', 'js', 'json'],
  
  // Configuración de timeout para pruebas (en milisegundos)
  // 10 segundos permite operaciones de base de datos y requests HTTP
  testTimeout: 10000,
  
  // Configuración para variables de entorno durante pruebas
  // setup.js configura variables de entorno y mocks globales
  setupFiles: ['./tests/setup.js'],
  
  // Mostrar información detallada durante la ejecución
  // Útil para debugging y seguimiento de pruebas
  verbose: true
};