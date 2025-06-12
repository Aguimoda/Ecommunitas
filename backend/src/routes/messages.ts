/**
 * @file messages.ts
 * @description Rutas para el sistema de mensajería en la API de Ecommunitas
 * @module Routes/Messages
 * @version 1.0.0
 * @author Ecommunitas Team
 * @created 2024
 * 
 * Este archivo define las rutas para el sistema de mensajería:
 * - Envío y recepción de mensajes privados
 * - Gestión de conversaciones entre usuarios
 * - Control de estado de lectura
 * - Notificaciones de mensajes no leídos
 * 
 * Rutas disponibles:
 * - GET / - Obtener mensajes del usuario actual
 * - POST / - Enviar un nuevo mensaje
 * - GET /unread - Obtener mensajes no leídos
 * - GET /conversations - Obtener lista de conversaciones
 * - GET /conversations/:userId - Obtener conversación específica
 * - PUT /conversations/:userId/read - Marcar conversación como leída
 * - PUT /:id/read - Marcar mensaje como leído
 * - DELETE /:id - Eliminar mensaje
 */

import express from 'express';
import {
  sendMessage,
  getMyMessages,
  getConversation,
  markAsRead,
  deleteMessage,
  getUnreadMessages,
  checkNewMessages,
  getConversations,
  markConversationAsRead
} from '../controllers/messages';

const router = express.Router();

// Importar middleware de protección de rutas
import { protect } from '../middleware/auth';

// Rutas protegidas (requieren autenticación)
router.use(protect);

// Rutas para mensajes
router.route('/')
  .get(getMyMessages)
  .post(sendMessage);

router.route('/unread').get(getUnreadMessages);
router.route('/conversations').get(getConversations);
router.route('/conversations/:userId').get(getConversation);
router.route('/conversations/:userId/read').put(markConversationAsRead);
router.route('/:id/read').put(markAsRead);
router.route('/:id').delete(deleteMessage);

export default router;