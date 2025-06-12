/**
 * @fileoverview Tests de integración para el módulo de Items
 * 
 * Estos tests verifican el funcionamiento completo de los endpoints
 * de items incluyendo autenticación, base de datos y validaciones.
 * Utilizan MongoDB en memoria para aislamiento completo.
 */

// Configurar entorno de pruebas
process.env.NODE_ENV = 'test';

const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const app = require('../dist/src/server').default;
const User = require('../dist/src/models/User').default;
const Item = require('../dist/src/models/Item').default;

// Configuración de base de datos en memoria
let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
  
  // Ensure indexes are created for the in-memory database
  await Item.createIndexes();
  await User.createIndexes();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Limpiar colecciones antes de cada test
  await User.deleteMany({});
  await Item.deleteMany({});
});

describe('Items Integration Tests', () => {
  let authToken;
  let testUser;
  let testItem;

  beforeEach(async () => {
    // Crear usuario de prueba
    testUser = {
      name: 'Usuario Test',
      email: 'test@example.com',
      password: 'Password123!',
      location: {
        type: 'Point',
        coordinates: [-3.7038, 40.4168] // Madrid
      }
    };

    // Registrar usuario y obtener token
    const userResponse = await request(app)
      .post('/api/v1/auth/register')
      .send(testUser);

    authToken = userResponse.body.token;

    // Datos de artículo de prueba
    testItem = {
      title: 'Libro de Programación',
      description: 'Libro sobre JavaScript y Node.js en excelente estado',
      category: 'books',
      condition: 'good',
      location: 'Madrid, Spain',
      coordinates: {
        type: 'Point',
        coordinates: [-3.7038, 40.4168],
        enabled: true
      },
      images: ['https://example.com/image1.jpg']
    };
  });

  describe('POST /api/v1/items', () => {
    it('should create item with valid authentication', async () => {
      const response = await request(app)
        .post('/api/v1/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testItem);

      expect(response.statusCode).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(testItem.title);
      expect(response.body.data.user).toBeDefined();

      // Verificar en base de datos
      const savedItem = await Item.findById(response.body.data._id);
      expect(savedItem.title).toBe(testItem.title);
      expect(savedItem.description).toBe(testItem.description);
    });

    it('should reject item creation without authentication', async () => {
      const response = await request(app)
        .post('/api/v1/items')
        .send(testItem);

      expect(response.statusCode).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should validate required fields', async () => {
      const invalidItem = {
        description: 'Solo descripción sin título'
      };

      const response = await request(app)
        .post('/api/v1/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidItem);

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/items', () => {
    beforeEach(async () => {
      // Crear varios items de prueba
      const items = [
        { ...testItem, title: 'Item 1' },
        { ...testItem, title: 'Item 2', category: 'electronica' },
        { ...testItem, title: 'Item 3', condition: 'excelente' }
      ];

      for (const item of items) {
        await request(app)
          .post('/api/v1/items')
          .set('Authorization', `Bearer ${authToken}`)
          .send(item);
      }
    });

    it('should get all items with pagination', async () => {
      const response = await request(app)
        .get('/api/v1/items?page=1&limit=2');

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(2);
      expect(response.body.pagination.total).toBe(3);
    });

    it('should filter items by category', async () => {
      const response = await request(app)
        .get('/api/v1/items?category=electronica');

      expect(response.statusCode).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].category).toBe('electronica');
    });

    it('should sort items by creation date', async () => {
      const response = await request(app)
        .get('/api/v1/items?sort=recent');

      expect(response.statusCode).toBe(200);
      expect(response.body.data).toHaveLength(3);
      
      // Verificar orden descendente por fecha
      const dates = response.body.data.map(item => new Date(item.createdAt));
      for (let i = 1; i < dates.length; i++) {
        expect(dates[i-1].getTime()).toBeGreaterThanOrEqual(dates[i].getTime());
      }
    });
  });

  describe('GET /api/v1/items/:id', () => {
    let itemId;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/v1/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testItem);
      
      itemId = response.body.data._id;
    });

    it('should get item by valid ID', async () => {
      const response = await request(app)
        .get(`/api/v1/items/${itemId}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(itemId);
      expect(response.body.data.user.name).toBe(testUser.name);
    });

    it('should return 404 for non-existent item', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/v1/items/${fakeId}`);

      expect(response.statusCode).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/items/:id', () => {
    let itemId;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/v1/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testItem);
      
      itemId = response.body.data._id;
    });

    it('should update own item', async () => {
      const updateData = {
        title: 'Título Actualizado',
        description: 'Descripción actualizada'
      };

      const response = await request(app)
        .put(`/api/v1/items/${itemId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(updateData.title);
      expect(response.body.data.description).toBe(updateData.description);

      // Verificar en base de datos
      const updatedItem = await Item.findById(itemId);
      expect(updatedItem.title).toBe(updateData.title);
    });

    it('should reject update without authentication', async () => {
      const updateData = { title: 'Título Actualizado' };

      const response = await request(app)
        .put(`/api/v1/items/${itemId}`)
        .send(updateData);

      expect(response.statusCode).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/v1/items/:id', () => {
    let itemId;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/v1/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testItem);
      
      itemId = response.body.data._id;
    });

    it('should delete own item', async () => {
      const response = await request(app)
        .delete(`/api/v1/items/${itemId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);

      // Verificar eliminación en base de datos
      const deletedItem = await Item.findById(itemId);
      expect(deletedItem).toBeNull();
    });

    it('should reject deletion without authentication', async () => {
      const response = await request(app)
        .delete(`/api/v1/items/${itemId}`);

      expect(response.statusCode).toBe(401);
      expect(response.body.success).toBe(false);

      // Verificar que el item sigue existiendo
      const item = await Item.findById(itemId);
      expect(item).toBeTruthy();
    });
  });

  describe('GET /api/v1/items/search', () => {
    beforeEach(async () => {
      // Crear items con diferentes títulos para búsqueda
      const searchItems = [
        { ...testItem, title: 'Libro de JavaScript', description: 'Programación web' },
      { ...testItem, title: 'Curso de Python', description: 'Aprendizaje automático' },
      { ...testItem, title: 'Manual de React', description: 'Frontend moderno' }
      ];

      for (const item of searchItems) {
        await request(app)
          .post('/api/v1/items')
          .set('Authorization', `Bearer ${authToken}`)
          .send(item);
      }
    });

    it('should search items by title', async () => {
      const response = await request(app)
        .get('/api/v1/items/search?q=JavaScript');

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].title).toContain('JavaScript');
    });

    it('should search items by description', async () => {
      const response = await request(app)
        .get('/api/v1/items/search?q=programación');

      expect(response.statusCode).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should return empty results for non-matching search', async () => {
      const response = await request(app)
        .get('/api/v1/items/search?q=inexistente');

      expect(response.statusCode).toBe(200);
      expect(response.body.data).toHaveLength(0);
    });
  });
});