module.exports = {
  // Directorio raíz donde Jest buscará los archivos
  rootDir: '../',
  
  // Patrón para encontrar archivos de prueba
  testMatch: ['**/tests/**/*.test.js'],
  
  // Ignorar ciertos directorios
  testPathIgnorePatterns: ['/node_modules/'],
  
  // Configuración de cobertura
  collectCoverage: true,
  coverageDirectory: './tests/coverage',
  collectCoverageFrom: [
    'controllers/**/*.js',
    'models/**/*.js',
    'middleware/**/*.js',
    '!**/node_modules/**'
  ],
  
  // Configuración de entorno
  testEnvironment: 'node',
  
  // Configuración de timeout para pruebas (en milisegundos)
  testTimeout: 10000,
  
  // Configuración para variables de entorno durante pruebas
  setupFiles: ['./tests/setup.js'],
  
  // Mostrar información detallada
  verbose: true
};