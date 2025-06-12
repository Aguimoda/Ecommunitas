/**
 * @file index.ts
 * @description Índice del módulo de mensajería de Ecommunitas
 * @module Features/Messages
 * @version 1.0.0
 * @author Equipo de Desarrollo Ecommunitas
 * @created 2024
 * 
 * Este archivo centraliza todas las exportaciones relacionadas con la funcionalidad
 * de mensajería del sistema. Proporciona un punto único de acceso a todos los
 * componentes, servicios, stores, composables y tipos relacionados con el
 * sistema de comunicación entre usuarios.
 * 
 * ARQUITECTURA DEL MÓDULO:
 * ========================
 * 
 * 🔧 SERVICIOS (API):
 * - messageService: Cliente HTTP para operaciones de mensajería
 * - Gestión de conversaciones y mensajes
 * - Envío y recepción de mensajes en tiempo real
 * - Búsqueda en historial de conversaciones
 * - Gestión de archivos adjuntos
 * - Notificaciones push de nuevos mensajes
 * 
 * 🧩 COMPONENTES (UI):
 * - MessageList: Lista de mensajes en conversación
 * - ConversationList: Lista de conversaciones activas
 * - MessageInput: Campo de entrada de mensajes
 * - MessageBubble: Burbuja individual de mensaje
 * - FileUpload: Carga de archivos adjuntos
 * - EmojiPicker: Selector de emojis
 * - TypingIndicator: Indicador de escritura
 * 
 * 📄 VISTAS (Páginas):
 * - Lista de conversaciones
 * - Vista de conversación individual
 * - Búsqueda en mensajes
 * - Configuración de mensajería
 * 
 * 🏪 STORES (Estado Global) - EN DESARROLLO:
 * - useMessagesStore: Store principal para gestión de mensajes
 * - Cache de conversaciones activas
 * - Estado de conexión en tiempo real
 * - Gestión de mensajes no leídos
 * - Sincronización automática
 * 
 * 🎯 COMPOSABLES (Lógica Reutilizable) - EN DESARROLLO:
 * - useMessages: Gestión general de mensajes
 * - useConversations: Gestión de conversaciones
 * - useRealTimeMessages: Conexión WebSocket
 * - useMessageSearch: Búsqueda en mensajes
 * - useTypingIndicator: Indicador de escritura
 * 
 * 📊 TIPOS (TypeScript):
 * - Message: Interfaz principal de mensaje
 * - Conversation: Interfaz de conversación
 * - User: Información de usuario en mensajes
 * - CreateMessageData: Datos para crear mensaje
 * - MessagesResponse: Respuesta paginada de mensajes
 * - ConversationsResponse: Respuesta de conversaciones
 * 
 * FUNCIONALIDADES PRINCIPALES:
 * ============================
 * 
 * 💬 MENSAJERÍA BÁSICA:
 * - Envío y recepción de mensajes de texto
 * - Conversaciones uno a uno
 * - Historial completo de mensajes
 * - Indicadores de entrega y lectura
 * - Timestamps precisos
 * 
 * 📎 ARCHIVOS Y MULTIMEDIA:
 * - Envío de imágenes y documentos
 * - Previsualización de archivos
 * - Compresión automática de imágenes
 * - Validación de tipos de archivo
 * - Gestión de tamaño de archivos
 * 
 * 🔍 BÚSQUEDA Y FILTRADO:
 * - Búsqueda en texto de mensajes
 * - Filtros por fecha y usuario
 * - Búsqueda en archivos adjuntos
 * - Navegación rápida por resultados
 * 
 * ⚡ TIEMPO REAL:
 * - Conexión WebSocket para mensajes instantáneos
 * - Indicadores de usuario escribiendo
 * - Notificaciones push automáticas
 * - Sincronización entre dispositivos
 * - Reconexión automática
 * 
 * 🔔 NOTIFICACIONES:
 * - Notificaciones de nuevos mensajes
 * - Contador de mensajes no leídos
 * - Sonidos de notificación personalizables
 * - Configuración de privacidad
 * 
 * 🛡️ MODERACIÓN Y SEGURIDAD:
 * - Filtrado de contenido inapropiado
 * - Reportes de mensajes
 * - Bloqueo de usuarios
 * - Encriptación de mensajes
 * - Eliminación de mensajes
 * 
 * ESTADO DE DESARROLLO:
 * ====================
 * 
 * ✅ **IMPLEMENTADO**:
 * - Servicios de API básicos
 * - Tipos TypeScript
 * - Componentes base de UI
 * - Vistas principales
 * 
 * 🚧 **EN DESARROLLO**:
 * - Store de Pinia para estado global
 * - Composables reutilizables
 * - Funcionalidad en tiempo real
 * - Sistema de notificaciones
 * 
 * 📋 **PENDIENTE**:
 * - Mensajería grupal
 * - Llamadas de voz/video
 * - Mensajes programados
 * - Integración con bots
 * 
 * VENTAJAS DE LA ARQUITECTURA:
 * ============================
 * 
 * ✅ **Importaciones Limpias**: 
 *    `import { messageService, useMessagesStore } from '@/features/messages'`
 * 
 * ✅ **Escalabilidad**: 
 *    Preparado para funcionalidades avanzadas
 * 
 * ✅ **Tiempo Real**: 
 *    Arquitectura optimizada para WebSockets
 * 
 * ✅ **Tipado Fuerte**: 
 *    TypeScript para mayor seguridad
 * 
 * ✅ **Modularidad**: 
 *    Componentes independientes y reutilizables
 * 
 * ✅ **Performance**: 
 *    Cache inteligente y lazy loading
 * 
 * @example
 * ```typescript
 * // Uso básico del módulo de mensajería
 * import { 
 *   messageService,
 *   type Message,
 *   type Conversation 
 * } from '@/features/messages'
 * 
 * // Obtener conversaciones del usuario
 * const conversations = await messageService.getConversations()
 * 
 * // Enviar un mensaje
 * const newMessage = await messageService.sendMessage({
 *   conversationId: '123',
 *   content: 'Hola, ¿está disponible el artículo?',
 *   type: 'text'
 * })
 * 
 * // Obtener mensajes de una conversación
 * const messages = await messageService.getMessages('123', {
 *   page: 1,
 *   limit: 50
 * })
 * ```
 * 
 * @todo Implementar stores y composables cuando estén listos
 * @todo Agregar funcionalidad de tiempo real con WebSockets
 * @todo Implementar sistema de notificaciones push
 */

// Services
export { messageService, default as defaultMessageService } from './services/messageService'
export type {
  Message,
  Conversation,
  User,
  CreateMessageData,
  MessagesResponse,
  ConversationsResponse
} from './services/messageService'

// Components
export * from './components'

// Views
export * from './views'

// TODO: Add when implemented
// Stores
// export { useMessagesStore } from './stores/messagesStore'

// Composables
// export { useMessages, useConversations } from './composables/useMessages'