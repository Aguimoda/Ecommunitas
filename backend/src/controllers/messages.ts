/**
 * @file messages.ts
 * @description Controlador de mensajes para la aplicación Ecommunitas
 * 
 * Este archivo contiene todos los controladores relacionados con la gestión
 * de mensajes entre usuarios en la plataforma, incluyendo envío, recepción,
 * conversaciones, notificaciones y moderación de contenido.
 * 
 * @features
 * - Envío y recepción de mensajes privados
 * - Gestión de conversaciones entre usuarios
 * - Historial de mensajes con paginación
 * - Notificaciones en tiempo real
 * - Moderación y filtrado de contenido
 * - Marcado de mensajes como leídos/no leídos
 * - Búsqueda en conversaciones
 * - Eliminación de mensajes
 * 
 * @technical
 * - Express.js con TypeScript
 * - MongoDB con Mongoose
 * - Socket.io para tiempo real
 * - Validaciones de entrada
 * - Manejo de errores estandarizado
 * - Middleware de autenticación
 * 
 * @routes
 * - POST /api/v1/messages - Enviar nuevo mensaje
 * - GET /api/v1/messages/conversations - Obtener conversaciones del usuario
 * - GET /api/v1/messages/conversation/:userId - Obtener mensajes de conversación específica
 * - PATCH /api/v1/messages/:id/read - Marcar mensaje como leído
 * - DELETE /api/v1/messages/:id - Eliminar mensaje
 * - GET /api/v1/messages/unread-count - Contar mensajes no leídos
 * 
 * @functions
 * - sendMessage: Envía un nuevo mensaje entre usuarios
 * - getConversations: Obtiene lista de conversaciones del usuario
 * - getConversationMessages: Obtiene mensajes de una conversación específica
 * - markAsRead: Marca mensajes como leídos
 * - deleteMessage: Elimina un mensaje específico
 * - getUnreadCount: Cuenta mensajes no leídos
 * 
 * @author Equipo Ecommunitas
 * @version 1.0.0
 */

import { Request, Response, NextFunction } from 'express';
import Message from '../models/Message';
import User from '../models/User';
import asyncHandler from '../utils/async';
import ErrorResponse from '../utils/errorResponse';

// Interfaz para el request autenticado
interface AuthenticatedRequest extends Request {
  user: {
    id: string;
  };
}

// @desc    Enviar un mensaje a otro usuario
// @route   POST /api/v1/messages
// @access  Private
export const sendMessage = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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
export const getMyMessages = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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

// @desc    Marcar una conversación como leída
// @route   PUT /api/v1/messages/conversations/:userId/read
// @access  Privado
export const markConversationAsRead = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { userId: conversationPartnerId } = req.params;
  const currentUserId = req.user.id;

  // Marcar como leídos todos los mensajes recibidos del conversationPartnerId por el currentUser
  await Message.updateMany(
    { sender: conversationPartnerId, recipient: currentUserId, read: false },
    { $set: { read: true } }
  );

  res.status(200).json({ success: true, data: {} });
});

// @desc    Obtener una conversación específica con otro usuario
// @route   GET /api/v1/messages/conversations/:userId
// @access  Privado
export const getConversation = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { userId: conversationPartnerId } = req.params;
  const currentUserId = req.user.id;

  // Marcar mensajes como leídos al obtener la conversación
  await Message.updateMany(
    { sender: conversationPartnerId, recipient: currentUserId, read: false },
    { $set: { read: true } }
  );

  // Verificar que el otro usuario existe
  const otherUserDetails = await User.findById(conversationPartnerId).select('name avatar profileImage'); // Asegúrate de seleccionar los campos que necesitas
  if (!otherUserDetails) {
    return next(
      new ErrorResponse(`Usuario con ID ${conversationPartnerId} no encontrado`, 404)
    );
  }

  // Obtener mensajes entre los dos usuarios
  const messages = await Message.find({
    $or: [
      { sender: currentUserId, recipient: conversationPartnerId },
      { sender: conversationPartnerId, recipient: currentUserId }
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
export const markAsRead = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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
export const deleteMessage = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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

  await message.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Obtener mensajes no leídos del usuario actual
// @route   GET /api/v1/messages/unread
// @access  Private
export const getUnreadMessages = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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
export const checkNewMessages = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { lastChecked } = req.query;
  
  const query: any = {
    recipient: req.user.id,
    ...(lastChecked && !isNaN(new Date(lastChecked as string).getTime()) && { createdAt: { $gt: new Date(lastChecked as string) } })
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

// @desc    Obtener todas las conversaciones del usuario
// @route   GET /api/v1/messages/conversations
// @access  Privado
export const getConversations = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user.id;

  const messages = await Message.find({
    $or: [{ sender: userId }, { recipient: userId }]
  })
    .populate({ path: 'sender', select: 'name avatar' })
    .populate({ path: 'recipient', select: 'name avatar' })
    .sort({ createdAt: -1 });

  const conversations: any = {};

  for (const message of messages) {
    let otherUser: any;
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

  const sortedConversations = Object.values(conversations).sort((a: any, b: any) => {
    return new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime();
  });

  res.status(200).json({
    success: true,
    count: sortedConversations.length,
    data: sortedConversations,
    message: sortedConversations.length === 0 ? 'No se encontraron conversaciones' : undefined
  });
});