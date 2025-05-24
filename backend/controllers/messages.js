const Message = require('../models/Message');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Enviar un mensaje a otro usuario
// @route   POST /api/v1/messages
// @access  Private
exports.sendMessage = asyncHandler(async (req, res, next) => {
  // Añadir el usuario actual como remitente
  req.body.sender = req.user.id;

  // Verificar que el destinatario existe
  const recipient = await User.findById(req.body.recipient);
  if (!recipient) {
    return next(
      new ErrorResponse(`Usuario con ID ${req.body.recipient} no encontrado`, 404)
    );
  }

  // Crear el mensaje
  const message = await Message.create(req.body);

  // Poblar el mensaje con información del remitente y destinatario
  const populatedMessage = await Message.findById(message._id)
    .populate({
      path: 'sender',
      select: 'name avatar'
    })
    .populate({
      path: 'recipient',
      select: 'name avatar'
    });

  res.status(201).json({
    success: true,
    data: populatedMessage
  });
});

// @desc    Obtener todos los mensajes del usuario actual
// @route   GET /api/v1/messages
// @access  Private
exports.getMyMessages = asyncHandler(async (req, res, next) => {
  const messages = await Message.find({
    $or: [
      { sender: req.user.id },
      { recipient: req.user.id }
    ]
  })
    .populate({
      path: 'sender',
      select: 'name avatar'
    })
    .populate({
      path: 'recipient',
      select: 'name avatar'
    })
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: messages.length,
    data: messages,
    message: messages.length === 0 ? 'No se encontraron mensajes' : undefined
  });
});

// @desc    Obtener conversación con un usuario específico
// @route   GET /api/v1/messages/conversation/:userId
// @access  Private
exports.getConversation = asyncHandler(async (req, res, next) => {
  const otherUserId = req.params.userId;
  const currentUserId = req.user.id;

  // Verificar que el otro usuario existe
  const otherUserDetails = await User.findById(otherUserId).select('name avatar profileImage'); // Asegúrate de seleccionar los campos que necesitas
  if (!otherUserDetails) {
    return next(
      new ErrorResponse(`Usuario con ID ${otherUserId} no encontrado`, 404)
    );
  }

  // Obtener mensajes entre los dos usuarios
  const messages = await Message.find({
    $or: [
      { sender: currentUserId, recipient: otherUserId },
      { sender: otherUserId, recipient: currentUserId }
    ]
  })
    .populate({
      path: 'sender',
      select: 'name avatar profileImage'
    })
    .populate({
      path: 'recipient',
      select: 'name avatar profileImage'
    })
    .populate('item', 'title') // Asumiendo que quieres el título del item
    .sort({ createdAt: 1 });

  // Determinar el item de la conversación (si existe y es relevante)
  // Esto es una simplificación, podrías necesitar una lógica más compleja
  // si varios items pueden estar asociados a una conversación.
  const item = messages.length > 0 && messages[0].item ? messages[0].item : null;

  res.status(200).json({
    success: true,
    conversation: messages,
    otherUser: otherUserDetails,
    item: item, // Añadir el item a la respuesta
    message: messages.length === 0 ? 'No se encontraron mensajes en esta conversación.' : undefined
  });
});

// @desc    Marcar mensaje como leído
// @route   PUT /api/v1/messages/:id/read
// @access  Private
exports.markAsRead = asyncHandler(async (req, res, next) => {
  let message = await Message.findById(req.params.id);

  if (!message) {
    return next(
      new ErrorResponse(`Mensaje con ID ${req.params.id} no encontrado`, 404)
    );
  }

  // Verificar que el usuario actual es el destinatario del mensaje
  if (message.recipient.toString() !== req.user.id) {
    return next(
      new ErrorResponse('No autorizado para marcar este mensaje como leído', 401)
    );
  }

  // Actualizar el estado de lectura
  message = await Message.findByIdAndUpdate(
    req.params.id,
    { read: true },
    { new: true, runValidators: true }
  )
    .populate({
      path: 'sender',
      select: 'name avatar'
    })
    .populate({
      path: 'recipient',
      select: 'name avatar'
    });

  res.status(200).json({
    success: true,
    data: message
  });
});

// @desc    Eliminar un mensaje
// @route   DELETE /api/v1/messages/:id
// @access  Private
exports.deleteMessage = asyncHandler(async (req, res, next) => {
  const message = await Message.findById(req.params.id);

  if (!message) {
    return next(
      new ErrorResponse(`Mensaje con ID ${req.params.id} no encontrado`, 404)
    );
  }

  // Verificar que el usuario actual es el remitente o destinatario del mensaje
  if (
    message.sender.toString() !== req.user.id &&
    message.recipient.toString() !== req.user.id
  ) {
    return next(
      new ErrorResponse('No autorizado para eliminar este mensaje', 401)
    );
  }

  await message.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Obtener mensajes no leídos del usuario actual
// @route   GET /api/v1/messages/unread
// @access  Private
exports.getUnreadMessages = asyncHandler(async (req, res, next) => {
  const messages = await Message.find({
    recipient: req.user.id,
    read: false
  })
    .populate({
      path: 'sender',
      select: 'name avatar'
    })
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: messages.length,
    data: messages,
    message: messages.length === 0 ? 'No se encontraron mensajes no leídos' : undefined
  });
});

// @desc    Verificar nuevos mensajes (para polling)
// @route   GET /api/v1/messages/check-new
// @access  Private
exports.checkNewMessages = asyncHandler(async (req, res, next) => {
  const { lastChecked } = req.query;
  
  const query = {
    recipient: req.user.id,
    ...(lastChecked && !isNaN(new Date(lastChecked)) && { createdAt: { $gt: new Date(lastChecked) } })
  };
  
  const newMessages = await Message.find(query)
    .populate({
      path: 'sender',
      select: 'name avatar'
    })
    .sort({ createdAt: -1 });
    
  res.status(200).json({
    success: true,
    count: newMessages.length,
    data: newMessages,
    lastChecked: new Date()
  });
});

// @desc    Obtener todas las conversaciones del usuario actual
// @route   GET /api/v1/messages/conversations
// @access  Private
exports.getConversations = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;

  const messages = await Message.find({
    $or: [{ sender: userId }, { recipient: userId }]
  })
    .populate({ path: 'sender', select: 'name avatar' })
    .populate({ path: 'recipient', select: 'name avatar' })
    .sort({ createdAt: -1 });

  const conversations = {};

  for (const message of messages) {
    let otherUser;
    if (message.sender && message.sender._id.toString() === userId.toString()) {
      otherUser = message.recipient;
    } else if (message.recipient && message.recipient._id.toString() === userId.toString()) {
      otherUser = message.sender;
    } else {
      continue;
    }
    
    if (!otherUser || !otherUser._id) {
        continue;
    }
    const otherUserId = otherUser._id.toString();

    if (!conversations[otherUserId]) {
      conversations[otherUserId] = {
        withUser: otherUser,
        lastMessage: message,
        unreadCount: 0,
      };
    }
    
    // Actualizar el último mensaje si el actual es más reciente (ya que están ordenados por -createdAt, el primero encontrado para un otherUser es el más reciente)
    // No es necesario este if si se procesan en orden de más reciente a más antiguo y se toma el primero.
    // Sin embargo, para ser explícito y si el orden cambiara:
    if (new Date(message.createdAt) > new Date(conversations[otherUserId].lastMessage.createdAt)) {
       conversations[otherUserId].lastMessage = message;
    }

    if (message.recipient && message.recipient._id.toString() === userId.toString() && !message.read) {
      conversations[otherUserId].unreadCount++;
    }
  }

  const sortedConversations = Object.values(conversations).sort((a, b) => {
    return new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt);
  });

  res.status(200).json({
    success: true,
    count: sortedConversations.length,
    data: sortedConversations,
    message: sortedConversations.length === 0 ? 'No se encontraron conversaciones' : undefined
  });
});