const express = require('express');
const {
  getItems,
  getItem,
  createItem,
  updateItem,
  deleteItem
} = require('../controllers/items');

const router = express.Router();

// Importar middleware de protección de rutas y resultados avanzados
const { protect } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');
const Item = require('../models/Item');

// Rutas públicas
router.route('/')
  .get(advancedResults(Item, 'user'), getItems);

router.route('/:id')
  .get(getItem);

// Rutas protegidas (requieren autenticación)
router.use(protect);

router.route('/')
  .post(createItem);

router.route('/:id')
  .put(updateItem)
  .delete(deleteItem);

module.exports = router;