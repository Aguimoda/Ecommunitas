/**
 * @fileoverview Composable para la gestión de mensajes y conversaciones
 * 
 * Este composable proporciona funcionalidades para manejar conversaciones de mensajes,
 * incluyendo la carga de conversaciones, gestión de eventos de lectura y normalización
 * de respuestas de la API.
 * 
 * @author Sistema de Gestión de Mensajes
 * @version 1.0.0
 */

import { ref, onMounted, onUnmounted } from 'vue'
import type { Ref } from 'vue'
import { messageService } from '@/features/messages'

/**
 * Interfaz que define la estructura de una conversación
 * 
 * @interface Conversation
 */
interface Conversation {
  /** Identificador único de la conversación */
  id: string
  /** Lista de participantes en la conversación */
  participants: string[]
  /** Último mensaje de la conversación */
  lastMessage?: {
    /** Contenido del mensaje */
    content: string
    /** Marca de tiempo del mensaje */
    timestamp: string
    /** Remitente del mensaje */
    sender: string
  }
  /** Número de mensajes no leídos */
  unreadCount?: number
}

/**
 * Interfaz que define el tipo de retorno del composable useMessages
 * 
 * @interface UseMessagesReturn
 */
interface UseMessagesReturn {
  /** Lista reactiva de conversaciones */
  conversations: Ref<Conversation[]>
  /** Estado de carga */
  loading: Ref<boolean>
  /** Mensaje de error */
  error: Ref<string>
  /** Función para obtener conversaciones */
  fetchConversations: () => Promise<void>
  /** Función para marcar conversación como leída */
  markConversationAsRead: (conversationId: string) => void
  /** Función para buscar conversación por ID de usuario */
  findConversationByUserId: (conversationId: string) => Conversation | undefined
}

/**
 * Composable para manejar la funcionalidad de la vista de mensajes
 * 
 * Proporciona funcionalidades para:
 * - Cargar y gestionar conversaciones
 * - Manejar eventos de lectura de mensajes
 * - Normalizar respuestas de la API
 * - Gestionar estados de carga y error
 * 
 * @returns {UseMessagesReturn} Objeto con estados reactivos y métodos para gestión de mensajes
 * 
 * @example
 * ```vue
 * <script setup>
 * import { useMessages } from '@/features/messages/composables/useMessages'
 * 
 * const {
 *   conversations,
 *   loading,
 *   error,
 *   fetchConversations,
 *   markConversationAsRead,
 *   findConversationByUserId
 * } = useMessages()
 * 
 * // Las conversaciones se cargan automáticamente al montar el componente
 * // Para marcar una conversación como leída:
 * markConversationAsRead('user123')
 * 
 * // Para buscar una conversación específica:
 * const conversation = findConversationByUserId('user123')
 * </script>
 * ```
 */
export function useMessages(): UseMessagesReturn {
  // Estados reactivos
  /** Lista de conversaciones del usuario */
  const conversations = ref<Conversation[]>([])
  /** Indicador de estado de carga */
  const loading = ref<boolean>(true)
  /** Mensaje de error en caso de fallo */
  const error = ref<string>('')

  /**
   * Valida y normaliza la respuesta de la API
   * 
   * Maneja diferentes formatos de respuesta que puede devolver la API
   * y los normaliza a un formato consistente.
   * 
   * @param {any} response - Respuesta de la API
   * @returns {Conversation[]} Array de conversaciones normalizado
   * @throws {Error} Si el formato de respuesta es inesperado
   */
  const normalizeConversationsResponse = (response: any): Conversation[] => {
    // Manejar diferentes formatos de respuesta
    if (response && response.success && response.data) {
      return response.data
    } else if (response && Array.isArray(response)) {
      return response
    } else if (response && response.data && Array.isArray(response.data)) {
      return response.data
    } else {
      throw new Error('Formato de respuesta inesperado')
    }
  }

  /**
   * Carga las conversaciones del usuario desde la API
   * 
   * Realiza una petición al servicio de mensajes para obtener todas las
   * conversaciones del usuario actual. Maneja estados de carga y error.
   * 
   * @async
   * @function fetchConversations
   * @returns {Promise<void>}
   */
  const fetchConversations = async () => {
    try {
      loading.value = true
      error.value = ''
      
      const response = await messageService.getConversations()
      conversations.value = normalizeConversationsResponse(response)
      
    } catch (err) {
      console.error('Error al cargar conversaciones:', err)
      error.value = (err as any).message || 'No se pudieron cargar las conversaciones. Inténtalo de nuevo más tarde.'
      conversations.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * Busca una conversación por ID de usuario
   * 
   * Encuentra una conversación específica basándose en el ID del usuario
   * con el que se mantiene la conversación.
   * 
   * @param {string} conversationId - ID del usuario de la conversación
   * @returns {Conversation | undefined} Conversación encontrada o undefined si no existe
   */
  const findConversationByUserId = (conversationId: string): Conversation | undefined => {
    return conversations.value.find(c => 
      (c as any).withUser && (c as any).withUser._id === conversationId
    )
  }

  /**
   * Marca una conversación como leída
   * 
   * Actualiza el contador de mensajes no leídos de una conversación específica,
   * estableciéndolo a cero para indicar que todos los mensajes han sido leídos.
   * 
   * @param {string} conversationId - ID del usuario de la conversación
   */
  const markConversationAsRead = (conversationId: string): void => {
    const conversation = findConversationByUserId(conversationId)
    if (conversation) {
      conversation.unreadCount = 0
    }
  }

  /**
   * Maneja el evento de conversación leída desde otros componentes
   * 
   * Escucha eventos personalizados que indican que una conversación ha sido
   * leída y actualiza el estado correspondiente.
   * 
   * @param {Event} event - Evento personalizado con detalles de la conversación
   */
  const handleConversationRead = (event: Event): void => {
    const customEvent = event as CustomEvent
    const { conversationId } = customEvent.detail
    if (conversationId) {
      markConversationAsRead(conversationId)
    }
  }

  /**
   * Configura los event listeners necesarios
   * 
   * Establece los listeners para eventos personalizados relacionados
   * con la lectura de conversaciones.
   */
  const setupEventListeners = () => {
    window.addEventListener('conversationRead', handleConversationRead)
  }

  /**
   * Limpia los event listeners
   * 
   * Remueve todos los event listeners configurados para evitar
   * memory leaks al desmontar el componente.
   */
  const cleanupEventListeners = () => {
    window.removeEventListener('conversationRead', handleConversationRead)
  }

  // Configurar al montar
  onMounted(() => {
    fetchConversations()
    setupEventListeners()
  })

  // Limpiar al desmontar
  onUnmounted(() => {
    cleanupEventListeners()
  })

  return {
    // Estados reactivos
    conversations,
    loading,
    error,
    
    // Funciones principales
    fetchConversations,
    markConversationAsRead,
    findConversationByUserId
  }
}