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