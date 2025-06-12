/**
 * @fileoverview Servicio de Mensajes para comunicación con la API
 * 
 * Este servicio maneja todas las peticiones HTTP relacionadas con mensajes,
 * proporcionando una interfaz completa para la gestión de conversaciones,
 * mensajes individuales, estados de lectura y notificaciones.
 * 
 * Características principales:
 * - Gestión completa de conversaciones y mensajes
 * - Operaciones CRUD para mensajes
 * - Manejo de mensajes no leídos
 * - Paginación de conversaciones y mensajes
 * - Integración con artículos (mensajes contextuales)
 * - Manejo robusto de errores
 * 
 * Tecnologías utilizadas:
 * - Axios para peticiones HTTP
 * - TypeScript para tipado estático
 * - Manejo centralizado de errores
 * 
 * @author Sistema de Gestión de Mensajes
 * @version 1.0.0
 */

import axios, { AxiosResponse } from 'axios'
import { MESSAGE_ROUTES } from '@/config/apiRoutes'
import { processError } from '@/shared/utils/errorHandler'

/**
 * Interfaz para representar un usuario en el contexto de mensajes
 * 
 * Contiene la información básica necesaria para mostrar participantes
 * en conversaciones y mensajes.
 * 
 * @interface User
 */
export interface User {
  /** Identificador único del usuario */
  _id: string
  /** Nombre completo del usuario */
  name: string
  /** Dirección de correo electrónico del usuario */
  email: string
  /** URL del avatar del usuario (opcional) */
  avatar?: string
}

/**
 * Interfaz para representar un mensaje individual
 * 
 * Contiene toda la información de un mensaje entre usuarios,
 * incluyendo metadatos de conversación y artículo relacionado.
 * 
 * @interface Message
 */
export interface Message {
  /** Identificador único del mensaje */
  _id: string
  /** Contenido del mensaje */
  content: string
  /** Usuario que envía el mensaje */
  sender: User
  /** Usuario que recibe el mensaje */
  recipient: User
  /** ID del artículo relacionado (opcional) */
  itemId?: string
  /** Información del artículo relacionado (opcional) */
  item?: {
    /** ID del artículo */
    _id: string
    /** Título del artículo */
    title: string
    /** Array de URLs de imágenes del artículo */
    images: string[]
  }
  /** ID de la conversación a la que pertenece */
  conversationId: string
  /** Estado de lectura del mensaje */
  isRead: boolean
  /** Fecha de creación del mensaje */
  createdAt: string
  /** Fecha de última actualización del mensaje */
  updatedAt: string
}

/**
 * Interfaz para representar una conversación
 * 
 * Agrupa mensajes entre usuarios con metadatos útiles como
 * participantes, último mensaje y contadores de mensajes no leídos.
 * 
 * @interface Conversation
 */
export interface Conversation {
  /** Identificador único de la conversación */
  _id: string
  /** Lista de usuarios participantes en la conversación */
  participants: User[]
  /** Último mensaje enviado en la conversación */
  lastMessage: Message
  /** Número de mensajes no leídos en la conversación */
  unreadCount: number
  /** ID del artículo relacionado (opcional) */
  itemId?: string
  /** Información del artículo relacionado (opcional) */
  item?: {
    /** ID del artículo */
    _id: string
    /** Título del artículo */
    title: string
    /** Array de URLs de imágenes del artículo */
    images: string[]
  }
  /** Fecha de creación de la conversación */
  createdAt: string
  /** Fecha de última actualización de la conversación */
  updatedAt: string
}

/**
 * Interfaz para datos de creación de mensaje
 * 
 * Define los campos requeridos y opcionales para enviar un nuevo mensaje
 * a través de la API.
 * 
 * @interface CreateMessageData
 */
export interface CreateMessageData {
  /** Contenido del mensaje a enviar */
  content: string
  /** ID del usuario destinatario */
  recipientId: string
  /** ID del artículo relacionado (opcional) */
  itemId?: string
}

/**
 * Interfaz para respuesta paginada de mensajes
 * 
 * Incluye metadatos de paginación para manejar grandes volúmenes
 * de mensajes de manera eficiente.
 * 
 * @interface MessagesResponse
 */
export interface MessagesResponse {
  /** Lista de mensajes de la página actual */
  messages: Message[]
  /** Número total de mensajes */
  total: number
  /** Número de página actual */
  page: number
  /** Número total de páginas disponibles */
  totalPages: number
  /** Indica si existe una página siguiente */
  hasNextPage: boolean
  /** Indica si existe una página anterior */
  hasPrevPage: boolean
}

/**
 * Interfaz para respuesta de conversaciones
 * 
 * Formato estándar de respuesta del API para operaciones
 * relacionadas con conversaciones.
 * 
 * @interface ConversationsResponse
 */
export interface ConversationsResponse {
  /** Estado de éxito de la operación */
  success: boolean
  /** Número de conversaciones devueltas */
  count: number
  /** Lista de conversaciones */
  data: Conversation[]
  /** Mensaje opcional del servidor */
  message?: string
}

/**
 * Clase de Servicio de Mensajes
 * 
 * Maneja todas las operaciones de API relacionadas con mensajes,
 * proporcionando una interfaz unificada para la gestión de comunicaciones
 * entre usuarios.
 * 
 * Proporciona métodos para:
 * - Obtener y gestionar conversaciones
 * - Enviar y recibir mensajes
 * - Marcar mensajes como leídos
 * - Contar mensajes no leídos
 * - Iniciar conversaciones contextuales
 * 
 * @class MessageService
 */
class MessageService {
  /**
   * Obtiene todas las conversaciones del usuario actual
   * 
   * Recupera una lista paginada de conversaciones del usuario autenticado,
   * incluyendo información del último mensaje y contadores de mensajes no leídos.
   * 
   * @param {number} page - Número de página (por defecto 1)
   * @param {number} limit - Límite de resultados por página (por defecto 20)
   * @returns {Promise<ConversationsResponse>} Lista paginada de conversaciones
   * @throws {Error} Si ocurre un error al obtener las conversaciones
   * 
   * @example
   * ```typescript
   * // Obtener primera página de conversaciones
   * const conversations = await messageService.getConversations()
   * 
   * // Obtener página específica con límite personalizado
   * const page2 = await messageService.getConversations(2, 10)
   * ```
   */
  async getConversations(page: number = 1, limit: number = 20): Promise<ConversationsResponse> {
    try {
      const response: AxiosResponse<ConversationsResponse> = await axios.get(
        MESSAGE_ROUTES.CONVERSATIONS,
        {
          params: { page, limit }
        }
      )
      return response.data
    } catch (error: any) {
      throw processError(error, 'Error al obtener conversaciones')
    }
  }

  /**
   * Obtiene mensajes de una conversación específica
   * 
   * Recupera una lista paginada de mensajes de una conversación,
   * ordenados cronológicamente para mostrar el historial completo.
   * 
   * @param {string} conversationId - ID de la conversación
   * @param {number} page - Número de página (por defecto 1)
   * @param {number} limit - Límite de resultados por página (por defecto 50)
   * @returns {Promise<MessagesResponse>} Lista paginada de mensajes
   * @throws {Error} Si ocurre un error al obtener los mensajes
   * 
   * @example
   * ```typescript
   * // Obtener mensajes de una conversación
   * const messages = await messageService.getMessages('conv123')
   * 
   * // Obtener página específica
   * const oldMessages = await messageService.getMessages('conv123', 2)
   * ```
   */
  async getMessages(
    conversationId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<MessagesResponse> {
    try {
      const response: AxiosResponse<MessagesResponse> = await axios.get(
        MESSAGE_ROUTES.MESSAGES.replace(':conversationId', conversationId),
        {
          params: { page, limit }
        }
      )
      return response.data
    } catch (error: any) {
      throw processError(error, 'Error al obtener mensajes')
    }
  }

  /**
   * Obtiene una conversación con un usuario específico
   * 
   * Busca y devuelve la conversación existente entre el usuario actual
   * y el usuario especificado, o crea una nueva si no existe.
   * 
   * @param {string} userId - ID del usuario con quien se busca la conversación
   * @returns {Promise<MessagesResponse>} Conversación con el usuario especificado
   * @throws {Error} Si ocurre un error al obtener la conversación
   * 
   * @example
   * ```typescript
   * // Obtener conversación con un usuario específico
   * const conversation = await messageService.getConversation('user123')
   * ```
   */
  async getConversation(userId: string): Promise<MessagesResponse> {
    try {
      const response: AxiosResponse<MessagesResponse> = await axios.get(
        MESSAGE_ROUTES.CONVERSATION_BY_USER(userId)
      )
      return response.data
    } catch (error: any) {
      throw processError(error, 'Error al obtener conversación')
    }
  }

  /**
   * Envía un nuevo mensaje
   * 
   * Crea y envía un mensaje a un destinatario específico, opcionalmente
   * relacionado con un artículo para proporcionar contexto.
   * 
   * @param {CreateMessageData} messageData - Datos del mensaje a enviar
   * @returns {Promise<Message>} El mensaje creado y enviado
   * @throws {Error} Si ocurre un error al enviar el mensaje
   * 
   * @example
   * ```typescript
   * // Enviar mensaje simple
   * const message = await messageService.sendMessage({
   *   content: 'Hola, ¿está disponible este artículo?',
   *   recipientId: 'user123'
   * })
   * 
   * // Enviar mensaje relacionado con un artículo
   * const contextualMessage = await messageService.sendMessage({
   *   content: 'Me interesa este artículo',
   *   recipientId: 'user123',
   *   itemId: 'item456'
   * })
   * ```
   */
  async sendMessage(messageData: CreateMessageData): Promise<Message> {
    try {
      const response: AxiosResponse<{ message: Message }> = await axios.post(
        MESSAGE_ROUTES.SEND,
        messageData
      )
      return response.data.message
    } catch (error: any) {
      throw processError(error, 'Error al enviar mensaje')
    }
  }

  /**
   * Marca un mensaje como leído
   * 
   * Actualiza el estado de lectura de un mensaje específico,
   * indicando que ha sido visto por el destinatario.
   * 
   * @param {string} messageId - ID del mensaje a marcar como leído
   * @returns {Promise<void>} Promesa que se resuelve cuando se marca como leído
   * @throws {Error} Si ocurre un error al marcar el mensaje como leído
   * 
   * @example
   * ```typescript
   * // Marcar un mensaje específico como leído
   * await messageService.markAsRead('msg123')
   * ```
   */
  async markAsRead(messageId: string): Promise<void> {
    try {
      await axios.patch(MESSAGE_ROUTES.MARK_READ(messageId))
    } catch (error: any) {
      throw processError(error, 'Error al marcar mensaje como leído')
    }
  }

  /**
   * Marca todos los mensajes de una conversación como leídos
   * 
   * Actualiza el estado de lectura de todos los mensajes no leídos
   * en una conversación específica, útil para limpiar notificaciones.
   * 
   * @param {string} conversationId - ID de la conversación a marcar como leída
   * @returns {Promise<void>} Promesa que se resuelve cuando se marca la conversación como leída
   * @throws {Error} Si ocurre un error al marcar la conversación como leída
   * 
   * @example
   * ```typescript
   * // Marcar toda una conversación como leída
   * await messageService.markConversationAsRead('conv123')
   * ```
   */
  async markConversationAsRead(conversationId: string): Promise<void> {
    try {
      await axios.put(
        MESSAGE_ROUTES.MARK_CONVERSATION_READ(conversationId)
      )
    } catch (error: any) {
      throw processError(error, 'Error al marcar conversación como leída')
    }
  }

  /**
   * Elimina un mensaje
   * 
   * Borra permanentemente un mensaje del sistema. Esta acción
   * es irreversible y debe usarse con precaución.
   * 
   * @param {string} messageId - ID del mensaje a eliminar
   * @returns {Promise<void>} Promesa que se resuelve cuando se elimina el mensaje
   * @throws {Error} Si ocurre un error al eliminar el mensaje
   * 
   * @example
   * ```typescript
   * // Eliminar un mensaje específico
   * await messageService.deleteMessage('msg123')
   * ```
   */
  async deleteMessage(messageId: string): Promise<void> {
    try {
      await axios.delete(MESSAGE_ROUTES.DELETE(messageId))
    } catch (error: any) {
      throw processError(error, 'Error al eliminar mensaje')
    }
  }

  /**
   * Obtiene el contador de mensajes no leídos
   * 
   * Devuelve el número total de mensajes no leídos del usuario actual,
   * útil para mostrar badges de notificación en la interfaz.
   * 
   * @returns {Promise<number>} Número de mensajes no leídos
   * @throws {Error} Si ocurre un error al obtener el contador
   * 
   * @example
   * ```typescript
   * // Obtener contador de mensajes no leídos
   * const unreadCount = await messageService.getUnreadCount()
   * console.log(`Tienes ${unreadCount} mensajes no leídos`)
   * ```
   */
  async getUnreadCount(): Promise<number> {
    try {
      const response: AxiosResponse<{ count: number }> = await axios.get(
        MESSAGE_ROUTES.UNREAD_COUNT
      )
      return response.data.count
    } catch (error: any) {
      throw processError(error, 'Error al obtener contador de mensajes no leídos')
    }
  }

  /**
   * Obtiene todos los mensajes no leídos
   * 
   * Devuelve una lista completa de todos los mensajes no leídos
   * del usuario actual, útil para mostrar notificaciones detalladas.
   * 
   * @returns {Promise<{success: boolean, count: number, data: Message[]}>} Lista de mensajes no leídos
   * @throws {Error} Si ocurre un error al obtener los mensajes no leídos
   * 
   * @example
   * ```typescript
   * // Obtener todos los mensajes no leídos
   * const unreadMessages = await messageService.getUnreadMessages()
   * console.log(`Tienes ${unreadMessages.count} mensajes no leídos`)
   * ```
   */
  async getUnreadMessages(): Promise<{ success: boolean; count: number; data: Message[] }> {
    try {
      const response: AxiosResponse<{ success: boolean; count: number; data: Message[] }> = await axios.get(
        MESSAGE_ROUTES.UNREAD
      )
      return response.data
    } catch (error: any) {
      throw processError(error, 'Error al obtener mensajes no leídos')
    }
  }

  /**
   * Inicia una conversación con un usuario sobre un artículo
   * 
   * Crea una nueva conversación contextual relacionada con un artículo específico,
   * facilitando la comunicación entre usuarios interesados en el mismo artículo.
   * 
   * @param {string} recipientId - ID del usuario destinatario
   * @param {string} itemId - ID del artículo sobre el que se inicia la conversación
   * @param {string} initialMessage - Mensaje inicial de la conversación
   * @returns {Promise<Conversation>} La conversación creada
   * @throws {Error} Si ocurre un error al iniciar la conversación
   * 
   * @example
   * ```typescript
   * // Iniciar conversación sobre un artículo
   * const conversation = await messageService.startConversation(
   *   'user123',
   *   'item456',
   *   '¿Está disponible este artículo?'
   * )
   * ```
   */
  async startConversation(recipientId: string, itemId: string, initialMessage: string): Promise<Conversation> {
    try {
      const response: AxiosResponse<{ conversation: Conversation }> = await axios.post(
        MESSAGE_ROUTES.START_CONVERSATION,
        {
          recipientId,
          itemId,
          content: initialMessage
        }
      )
      return response.data.conversation
    } catch (error: any) {
      throw processError(error, 'Error al iniciar conversación')
    }
  }
}

/**
 * Instancia singleton del servicio de mensajes
 * 
 * Se exporta una instancia única para uso en toda la aplicación.
 * Esto garantiza consistencia en el manejo del estado y configuración,
 * evitando la creación de múltiples instancias innecesarias.
 * 
 * @example
 * ```typescript
 * import { messageService } from '@/features/messages/services/messageService'
 * 
 * // Usar el servicio en cualquier parte de la aplicación
 * const conversations = await messageService.getConversations()
 * ```
 */
export const messageService = new MessageService()
export default messageService