/**
 * @file items.ts
 * @description Rutas para la gestión de items en la API de Ecommunitas
 * 
 * Este archivo define todas las rutas relacionadas con la gestión de items,
 * incluyendo operaciones CRUD, búsqueda, moderación y filtrado por usuario.
 * 
 * Rutas disponibles:
 * - GET / - Obtener todos los items con paginación
 * - POST / - Crear un nuevo item (requiere autenticación)
 * - GET /search - Búsqueda avanzada de items
 * - GET /:id - Obtener un item específico
 * - PUT /:id - Actualizar un item (requiere autenticación)
 * - DELETE /:id - Eliminar un item (requiere autenticación)
 * - PATCH /:id/approve - Aprobar un item (solo administradores)
 * - PATCH /:id/reject - Rechazar un item (solo administradores)
 * - GET /user/:userId - Obtener items de un usuario específico
 * 
 * @author Equipo de Desarrollo Ecommunitas
 * @version 1.0.0
 * @since 1.0.0
 */

// ============================================================================
// IMPORTACIONES
// ============================================================================
import express from 'express';  // Framework web

// Importar controladores de items
import {
  getItems,      // Obtener lista de items con paginación
  getItem,       // Obtener un item específico por ID
  createItem,    // Crear un nuevo item
  updateItem,    // Actualizar un item existente
  deleteItem,    // Eliminar un item
  searchItems,   // Búsqueda avanzada de items
  getItemsByUser,// Obtener items de un usuario específico
  approveItem,   // Aprobar un item (moderación)
  rejectItem     // Rechazar un item (moderación)
} from '../controllers/items';

// Importar middleware de protección de rutas y resultados avanzados
import { protect, authorize } from '../middleware/auth';
import advancedResults from '../middleware/advancedResults';
import Item from '../models/Item'; // Modelo principal de items

// ============================================================================
// CONFIGURACIÓN DEL ROUTER
// ============================================================================

/**
 * Router de Express para manejar las rutas de items
 */
const router = express.Router();

// ============================================================================
// RUTAS PRINCIPALES DE ITEMS
// ============================================================================

/**
 * @route   GET /
 * @desc    Obtener todos los items con paginación y filtros avanzados
 * @access  Public
 * @query   { page?, limit?, sort?, select?, status?, category?, location? }
 * @returns { success, count, pagination, data: items[] }
 * 
 * @route   POST /
 * @desc    Crear un nuevo item
 * @access  Private
 * @body    { title, description, category, location, images?, status? }
 * @returns { success, data: item }
 */
router.route('/')
  .get(advancedResults(Item, 'user'), getItems)  // Con middleware de resultados avanzados
  .post(protect, createItem);  // Requiere autenticación

// ============================================================================
// RUTAS DE BÚSQUEDA
// ============================================================================

/**
 * @route   GET /search
 * @desc    Búsqueda avanzada de items con capacidades geoespaciales
 * @access  Public
 * @query   { q?, category?, location?, radius?, lat?, lng?, status? }
 * @returns { success, count, data: items[] }
 */
router.route('/search')
  .get(searchItems);

// ============================================================================
// RUTAS PARA ITEMS ESPECÍFICOS
// ============================================================================

/**
 * @route   GET /:id
 * @desc    Obtener un item específico por su ID
 * @access  Public
 * @params  { id: string } - ID del item
 * @returns { success, data: item }
 * 
 * @route   PUT /:id
 * @desc    Actualizar un item existente
 * @access  Private (solo el propietario o admin)
 * @params  { id: string } - ID del item
 * @body    { title?, description?, category?, location?, images?, status? }
 * @returns { success, data: item }
 * 
 * @route   DELETE /:id
 * @desc    Eliminar un item
 * @access  Private (solo el propietario o admin)
 * @params  { id: string } - ID del item
 * @returns { success, message }
 */
router.route('/:id')
  .get(getItem)
  .put(protect, updateItem)
  .delete(protect, deleteItem);

// ============================================================================
// RUTAS DE MODERACIÓN (Solo Administradores)
// ============================================================================

/**
 * @route   PATCH /:id/approve
 * @desc    Aprobar un item pendiente de moderación
 * @access  Private (solo administradores)
 * @params  { id: string } - ID del item
 * @returns { success, data: item }
 */
router.route('/:id/approve')
  .patch(protect, authorize('admin'), approveItem);

/**
 * @route   PATCH /:id/reject
 * @desc    Rechazar un item pendiente de moderación
 * @access  Private (solo administradores)
 * @params  { id: string } - ID del item
 * @body    { reason?: string } - Razón del rechazo
 * @returns { success, data: item }
 */
router.route('/:id/reject')
  .patch(protect, authorize('admin'), rejectItem);

// ============================================================================
// RUTAS DE FILTRADO POR USUARIO
// ============================================================================

/**
 * @route   GET /user/:userId
 * @desc    Obtener todos los items de un usuario específico
 * @access  Public
 * @params  { userId: string } - ID del usuario
 * @query   { status?, page?, limit? }
 * @returns { success, count, data: items[] }
 */
router.route('/user/:userId')
  .get(getItemsByUser);

// ============================================================================
// RUTAS COMENTADAS (Funcionalidades futuras)
// ============================================================================

// Ruta para moderación general de items
// router.route('/moderation')
//   .get(protect, authorize('admin'), getItemsForModeration);

// Ruta para cambiar disponibilidad de un item
// router.route('/:id/availability')
//   .patch(protect, toggleItemAvailability);

// ============================================================================
// EXPORTACIÓN
// ============================================================================

export default router;