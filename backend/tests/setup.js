// Configuración de variables de entorno para pruebas
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'secret_para_pruebas_unitarias';
process.env.JWT_EXPIRE = '1d';
process.env.MONGO_URI = 'mongodb://localhost:27017/ecommunitas_test';

// Silenciar logs durante las pruebas
const winston = require('winston');
winston.configure({
  transports: [
    new winston.transports.Console({
      silent: true
    })
  ]
});

// Configuración para manejar errores no capturados durante las pruebas
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Cerrando pruebas...');
  console.error(err.name, err.message);
});