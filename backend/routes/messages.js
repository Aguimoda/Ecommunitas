const express = require('express');
const {
  sendMessage,
  getMyMessages,
  getConversation,
  markAsRead,
  deleteMessage,
  getUnreadMessages
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
router.route('/conversation/:userId').get(getConversation);
router.route('/:id/read').put(markAsRead);
router.route('/:id').delete(deleteMessage);

module.exports = router;