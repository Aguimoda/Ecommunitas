import { ref, onMounted, watch, nextTick, type Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { displayError } from '@/shared/utils/errorHandler'
import { jwtDecode } from 'jwt-decode'
import { messageService } from '@/features/messages'
import { getUserAvatarUrl } from '@/features/users'

// Types
interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  avatar?: string;
}

interface Item {
  _id: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  location: string;
  images: string[];
  user: User;
  createdAt: string;
  updatedAt: string;
}

interface Message {
  _id: string;
  sender: User;
  receiver: User;
  content: string;
  item?: Item;
  createdAt: string;
  updatedAt: string;
  read: boolean;
}

interface UseMessageDetailReturn {
  // State
  messages: Ref<Message[]>;
  otherUser: Ref<User | null>;
  item: Ref<Item | null>;
  loading: Ref<boolean>;
  error: Ref<string>;
  newMessage: Ref<string>;
  sending: Ref<boolean>;
  messagesContainer: Ref<HTMLElement | null>;
  userId: Ref<string>;
  
  // Methods
  getUserIdFromToken: () => string | null;
  scrollToBottom: () => void;
  fetchMessages: () => Promise<void>;
  sendMessage: () => Promise<void>;
  formatDate: (dateString: string) => string;
  formatTime: (dateString: string) => string;
  getUserAvatarUrl: (user: User, size?: number) => string;
  getInitials: (name: string) => string;
  formatPrice: (price: number) => string;
}

/**
 * Composable para manejar la funcionalidad de detalle de mensajes
 * Incluye carga de conversaciones, envío de mensajes y gestión de estado
 */
export function useMessageDetail(): UseMessageDetailReturn {
  const route = useRoute()
  const router = useRouter()

  // Estados reactivos
  const messages = ref<Message[]>([])
  const otherUser = ref<User | null>(null)
  const item = ref<Item | null>(null)
  const loading = ref<boolean>(true)
  const error = ref<string>('')
  const newMessage = ref<string>('')
  const sending = ref<boolean>(false)
  const messagesContainer = ref<HTMLElement | null>(null)
  const userId = ref<string>('')

  /**
   * Obtiene el ID del usuario actual desde el token JWT
   * @returns {string|null} ID del usuario o null si hay error
   */
  const getUserIdFromToken = (): string | null => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return null
    }
    try {
      const decoded = jwtDecode(token)
      return (decoded as any).id
    } catch (err) {
      console.error('Error al decodificar token:', err)
      router.push('/login')
      return null
    }
  }

  /**
   * Desplaza el contenedor de mensajes hacia abajo
   */
  const scrollToBottom = (): void => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  }

  /**
   * Formatea una fecha para mostrar en los mensajes
   * @param {string} dateString - Fecha en formato ISO
   * @returns {string} Fecha formateada
   */
  const formatDate = (dateString: string): string => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString('es-ES', { 
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit'
      })
    } else {
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    }
  }

  /**
   * Formatea solo la hora de una fecha
   * @param dateString - Fecha en formato string
   * @returns Hora formateada
   */
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  /**
   * Obtiene las iniciales de un nombre
   * @param {string} name - Nombre completo
   * @returns {string} Iniciales en mayúsculas
   */
  const getInitials = (name: string): string => {
    if (!name) return ''
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  /**
   * Formatea un precio en euros
   * @param {number} price - Precio numérico
   * @returns {string} Precio formateado
   */
  const formatPrice = (price: number): string => {
    if (!price) return ''
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(price)
  }

  /**
   * Valida los datos de la conversación recibidos de la API
   * @param {Object} response - Respuesta de la API
   * @returns {boolean} true si los datos son válidos
   */
  const validateConversationData = (response: any): boolean => {
    if (!response || !response.otherUser || !response.otherUser._id) {
      console.error('Datos del destinatario incompletos o no encontrados en la respuesta de la API:', response)
      error.value = 'No se pudo cargar la información del destinatario. La conversación no puede mostrarse correctamente.'
      displayError(new Error('Información del destinatario incompleta'), { customMessage: 'Error: Información del destinatario incompleta.' })
      
      // Limpiar datos si la información del destinatario es incorrecta
      messages.value = []
      otherUser.value = null
      item.value = null
      
      return false
    }
    return true
  }

  /**
   * Marca la conversación como leída en el backend
   */
  const markConversationAsRead = async (): Promise<void> => {
    if (otherUser.value && otherUser.value?._id) {
      try {
        await messageService.markConversationAsRead(otherUser.value._id)
        console.log('Conversación marcada como leída en el backend')
        
        // Emitir evento para actualizar UI en otros componentes
        window.dispatchEvent(new CustomEvent('conversationRead', { 
          detail: { conversationId: otherUser.value._id } 
        }))
      } catch (readError) {
        console.error('Error al marcar la conversación como leída:', readError)
        displayError(readError, { customMessage: 'No se pudo actualizar el estado de lectura de los mensajes.' })
      }
    }
  }

  /**
   * Carga los mensajes de la conversación
   */
  const fetchMessages = async (): Promise<void> => {
    try {
      loading.value = true
      error.value = ''
      
      userId.value = getUserIdFromToken() || ''
      if (!userId.value) {
        loading.value = false
        return
      }

      // Cargando conversación... (sin notificación)
      
      const response = await messageService.getConversation(route.params.id as string)
      console.log('API Response from getConversation:', response)

      // Validar datos de la respuesta
      if (!validateConversationData(response)) {
        loading.value = false
        return
      }

      // Asignar datos válidos
      messages.value = (response as any).conversation || []
      otherUser.value = (response as any).otherUser
      item.value = (response as any).item

      // Marcar conversación como leída
      await markConversationAsRead()

      // Desplazar hacia abajo después de cargar
      await nextTick()
      scrollToBottom()

    } catch (err) {
      console.error('Error al cargar la conversación:', err)
      
      // Manejar diferentes tipos de errores
      let detailedError = 'No se pudo cargar la conversación. Por favor, intenta nuevamente más tarde.'
      
      if ((err as any).response && (err as any).response.data && (err as any).response.data.error) {
        detailedError = `Error del servidor: ${(err as any).response.data.error}`
      } else if ((err as any).message) {
        detailedError = (err as any).message
      }
      
      error.value = detailedError
      displayError(err, { customMessage: detailedError })
      
      // Limpiar datos en caso de error
      messages.value = []
      otherUser.value = null
      item.value = null
    } finally {
      loading.value = false
    }
  }

  /**
   * Valida el mensaje antes de enviarlo
   * @returns {boolean} true si el mensaje es válido
   */
  const validateMessage = (): boolean => {
    if (!newMessage.value.trim()) {
      return false
    }
    
    if (!otherUser.value || !otherUser.value?._id) {
      displayError(new Error('No se ha podido identificar al destinatario'), { customMessage: 'No se ha podido identificar al destinatario. Por favor, recarga la página.' })
      return false
    }
    
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return false
    }
    
    return true
  }

  /**
   * Crea el objeto de mensaje para enviar
   * @returns {Object} Datos del mensaje
   */
  const createMessageData = (): { recipientId: string; content: string; itemId?: string } => {
    return {
      recipientId: otherUser.value?._id || '',
      content: newMessage.value.trim(),
      itemId: item.value ? item.value._id : undefined
    }
  }

  /**
   * Añade el mensaje enviado a la lista local
   * @param {Object} response - Respuesta del servidor
   */
  const addMessageToList = (response: any): void => {
    const currentUser = {
      _id: userId.value,
      name: 'Tú'
    }

    messages.value.push({
      ...response.data,
      sender: currentUser,
      receiver: otherUser.value,
      createdAt: new Date().toISOString()
    })
  }

  /**
   * Envía un nuevo mensaje
   */
  const sendMessage = async (): Promise<void> => {
    if (sending.value) return
    
    // Validar mensaje
    if (!validateMessage()) {
      return
    }
    
    sending.value = true
    // Enviando mensaje... (sin notificación)

    try {
      const messageData = createMessageData()
      const response = await messageService.sendMessage(messageData)

      // Añadir mensaje a la lista local
      addMessageToList(response)

      // Limpiar campo y desplazar hacia abajo
      newMessage.value = ''
      // Mensaje enviado correctamente (sin notificación)
      
      await nextTick()
      scrollToBottom()
      
    } catch (err) {
      console.error('Error al enviar mensaje:', err)
      
      let errorMessage = 'Error al enviar el mensaje. Inténtalo de nuevo.'
      
      if ((err as any).response?.status === 401) {
        errorMessage = 'Su sesión ha expirado. Por favor inicie sesión nuevamente.'
        router.push('/login')
      } else if ((err as any).response?.data?.error) {
        errorMessage = (err as any).response.data.error
      }
      
      displayError(err, { customMessage: errorMessage })
    } finally {
      sending.value = false
    }
  }

  // Cargar datos al montar el componente
  onMounted(() => {
    fetchMessages()
  })

  // Actualizar cuando cambie el ID de la conversación
  watch(() => route.params.id, () => {
    fetchMessages()
  })

  return {
    // Estados reactivos
    messages,
    otherUser,
    item,
    loading,
    error,
    newMessage,
    sending,
    messagesContainer,
    userId,
    
    // Funciones de utilidad
    formatDate,
    formatTime,
    getInitials,
    formatPrice,
    getUserAvatarUrl,
    getUserIdFromToken,
    
    // Funciones principales
    sendMessage,
    scrollToBottom,
    fetchMessages
  }
}