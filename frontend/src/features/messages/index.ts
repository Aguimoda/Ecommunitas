/**
 * @file index.ts
 * @description Messages Feature Index
 * Centralizes exports for all message-related functionality
 * Enables clean imports: import { messageService, useMessagesStore } from '@/features/messages'
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