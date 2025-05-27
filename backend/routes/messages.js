const express = require('express');
const {
  sendMessage,
  getMyMessages,
  getConversation,
  markAsRead,
  deleteMessage,
  getUnreadMessages,
  checkNewMessages,
  getConversations,
  markConversationAsRead
} = require('../controllers/messages');

const router = express.Router();

// Importar middleware de protección de rutas
const { protect } = require('../middleware/auth');

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

module.exports = router;

