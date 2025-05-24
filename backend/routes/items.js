const express = require('express');
const {
  getItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
  getItemsByUser // Añadir la importación que falta
} = require('../controllers/items');

// Importar el controlador de búsqueda avanzada
const { searchItems } = require('../controllers/itemsGeo');

const router = express.Router();

// Importar middleware de protección de rutas y resultados avanzados
const { protect } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');
const Item = require('../models/Item');

// Rutas públicas
router.route('/')
  .get(advancedResults(Item, 'user'), getItems)
  .post(protect, createItem);
  // Ruta para búsqueda avanzada
router.route('/search')
  .get(searchItems);

router.route('/:id')
  .get(getItem)
  .put(protect, updateItem)
  .delete(protect, (req, res, next) => {
    console.log('RUTA DELETE /:id alcanzada. ID recibido:', req.params.id);
    console.log('Usuario autenticado:', req.user ? req.user.id : 'No autenticado');
    return deleteItem(req, res, next);
  });

// Ruta para obtener items por usuario
router.route('/user/:userId') // Esta ruta ya está correctamente prefijada por el montaje en server.js si se accede como /api/v1/items/user/:userId
  .get(getItemsByUser);



module.exports = router;

// Export alternativo para compatibilidad con frontend
module.exports.itemsRouter = router;