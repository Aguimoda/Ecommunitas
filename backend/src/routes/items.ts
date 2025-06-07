import express from 'express';
import {
  getItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
  searchItems,
  getItemsByUser,
  approveItem,
  rejectItem
} from '../controllers/items';

const router = express.Router();

// Importar middleware de protección de rutas y resultados avanzados
import { protect, authorize } from '../middleware/auth';
import advancedResults from '../middleware/advancedResults';
import Item from '../models/Item'; // Modelo principal de items

// Rutas públicas
router.route('/')
  .get(advancedResults(Item, 'user'), getItems)
  .post(protect, createItem);

// Ruta para búsqueda avanzada con capacidades geoespaciales
router.route('/search')
  .get(searchItems);

// Ruta para moderación de items (debe ir antes de /:id)
// router.route('/moderation')
//   .get(protect, authorize('admin'), getItemsForModeration);

// Rutas para items específicos
router.route('/:id')
  .get(getItem)
  .put(protect, updateItem)
  .delete(protect, (req: any, res, next) => {
    console.log('RUTA DELETE /:id alcanzada. ID recibido:', req.params.id);
    console.log('Usuario autenticado:', req.user ? req.user.id : 'No autenticado');
    return deleteItem(req, res, next);
  });

// Ruta para cambiar disponibilidad de un item
// router.route('/:id/availability')
//   .patch(protect, toggleItemAvailability);

// Rutas para moderación de items específicos
router.route('/:id/approve')
  .patch(protect, authorize('admin'), approveItem);

router.route('/:id/reject')
  .patch(protect, authorize('admin'), rejectItem);

// Ruta para obtener items por usuario
router.route('/user/:userId')
  .get(getItemsByUser);

export default router;