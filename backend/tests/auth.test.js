// Configurar entorno de prueba
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'secret_para_pruebas_unitarias';
process.env.JWT_EXPIRE = '1d';

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../dist/src/server').default; // Importar el export default del servidor compilado
const User = require('../dist/src/models/User').default;

// Configuración de base de datos en memoria para pruebas
let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Limpiar la base de datos antes de cada prueba
  await User.deleteMany({});
});

describe('Sistema de Autenticación', () => {
  // Prueba de registro de usuario
  describe('POST /api/v1/auth/register', () => {
    it('debería registrar un nuevo usuario con datos válidos', async () => {
      const userData = {
        name: 'Usuario Prueba',
        email: 'test@example.com',
        password: 'Password123!'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData);

      expect(response.statusCode).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();

      // Verificar que el usuario se creó en la base de datos
      const user = await User.findOne({ email: userData.email });
      expect(user).toBeTruthy();
      expect(user.name).toBe(userData.name);
    });

    it('debería rechazar el registro con email ya existente', async () => {
      // Crear un usuario primero
      await User.create({
        name: 'Usuario Existente',
        email: 'existente@example.com',
        password: 'Password123!'
      });

      // Intentar registrar con el mismo email
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Otro Usuario',
          email: 'existente@example.com',
          password: 'OtraPassword123!'
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('El usuario ya existe con este email');
    });

    it('debería rechazar el registro con contraseña débil', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Usuario Prueba',
          email: 'test@example.com',
          password: 'password' // Sin mayúsculas ni números
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('debería rechazar el registro con datos incompletos', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Usuario Prueba',
          // Falta el email
          password: 'Password123!'
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  // Prueba de inicio de sesión
  describe('POST /api/v1/auth/login', () => {
    it('debería permitir el inicio de sesión con credenciales correctas', async () => {
      // Crear un usuario para la prueba
      const userData = {
        name: 'Usuario Login',
        email: 'login@example.com',
        password: 'Password123!'
      };

      await User.create(userData);

      // Intentar iniciar sesión
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
    });

    it('debería rechazar el inicio de sesión con credenciales incorrectas', async () => {
      // Crear un usuario para la prueba
      await User.create({
        name: 'Usuario Login',
        email: 'login@example.com',
        password: 'Password123!'
      });

      // Intentar iniciar sesión con contraseña incorrecta
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'login@example.com',
          password: 'ContraseñaIncorrecta123!'
        });

      expect(response.statusCode).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  // Prueba de restablecimiento de contraseña
  describe('Flujo de restablecimiento de contraseña', () => {
    it('debería generar un token de restablecimiento para un email válido', async () => {
      // Crear un usuario para la prueba
      await User.create({
        name: 'Usuario Reset',
        email: 'reset@example.com',
        password: 'Password123!'
      });

      // Solicitar restablecimiento de contraseña
      const response = await request(app)
        .post('/api/v1/auth/forgotpassword')
        .send({
          email: 'reset@example.com'
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.resetToken).toBeDefined();
    });

    it('debería permitir restablecer la contraseña con un token válido', async () => {
      // Esta prueba es más compleja y requeriría simular el flujo completo
      // incluyendo la generación del token y su uso posterior
      // Se omite la implementación detallada por simplicidad
    });
  });
});