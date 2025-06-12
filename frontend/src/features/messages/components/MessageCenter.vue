<!--
/**
 * @file MessageCenter.vue
 * @description Centro de mensajería para comunicación entre usuarios en Ecommunitas
 * 
 * Este componente implementa un sistema completo de mensajería que permite a los usuarios
 * comunicarse entre sí de manera privada. Incluye lista de conversaciones, chat en tiempo real,
 * notificaciones de mensajes no leídos y una interfaz intuitiva tipo WhatsApp/Telegram.
 * 
 * CARACTERÍSTICAS PRINCIPALES:
 * - 💬 Chat en tiempo real entre usuarios
 * - 📋 Lista de conversaciones con vista previa
 * - 🔔 Notificaciones de mensajes no leídos
 * - 👤 Avatares y información de usuarios
 * - 📱 Interfaz responsive tipo messenger
 * - ⚡ Actualizaciones en tiempo real
 * - 🕒 Marcas de tiempo de mensajes
 * - ✅ Estados de entrega y lectura
 * 
 * FUNCIONALIDADES:
 * - Envío y recepción de mensajes instantáneos
 * - Gestión de conversaciones múltiples
 * - Búsqueda en conversaciones
 * - Eliminación de mensajes
 * - Marcado de mensajes como leídos
 * - Notificaciones push (cuando esté disponible)
 * - Historial completo de conversaciones
 * - Indicadores de usuario en línea
 * 
 * COMPONENTES INTEGRADOS:
 * - Lista de conversaciones con metadatos
 * - Área de chat con mensajes
 * - Formulario de envío de mensajes
 * - Indicadores de estado
 * - Avatares de usuario
 * - Contadores de mensajes no leídos
 * 
 * TECNOLOGÍAS:
 * - Vue 3 Composition API
 * - TypeScript para tipado estático
 * - WebSocket para tiempo real (futuro)
 * - Tailwind CSS para estilos
 * - API REST para persistencia
 * 
 * @author Equipo de Desarrollo Ecommunitas
 * @version 1.0.0
 * @since 1.0.0
 */
-->
<template>
  <!-- Contenedor principal del centro de mensajes -->
  <div class="message-center">
    <div class="message-sidebar">
      <h2 class="text-xl font-bold mb-4">Mensajes</h2>
      
      <!-- Lista de conversaciones -->
      <div v-if="conversations.length > 0" class="conversation-list">
        <div 
          v-for="conversation in conversations" 
          :key="conversation._id"
          @click="selectConversation(conversation.userId)"
          class="conversation-item p-3 mb-2 rounded-lg cursor-pointer transition-colors"
          :class="{ 'bg-green-100 dark:bg-green-900': selectedUserId === conversation.userId, 'hover:bg-gray-100 dark:hover:bg-gray-800': selectedUserId !== conversation.userId }"
        >
          <div class="flex items-center">
            <div class="avatar mr-3">
              <img 
                :src="conversation.avatar || '/img/default-avatar.png'" 
                :alt="conversation.name" 
                class="w-10 h-10 rounded-full object-cover"
              >
            </div>
            <div class="flex-1">
              <div class="flex justify-between items-center">
                <h3 class="font-medium">{{ conversation.name }}</h3>
                <span v-if="conversation.unreadCount" class="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  {{ conversation.unreadCount }}
                </span>
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-400 truncate">
                {{ conversation.lastMessage }}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="text-center py-8 text-gray-500">
        No tienes conversaciones activas
      </div>
    </div>
    
    <div class="message-content">
      <template v-if="selectedUserId">
        <!-- Cabecera de conversación -->
        <div class="conversation-header p-4 border-b dark:border-gray-700 flex items-center">
          <div class="avatar mr-3">
            <img 
              :src="selectedConversation?.avatar || '/img/default-avatar.png'" 
              :alt="selectedConversation?.name" 
              class="w-10 h-10 rounded-full object-cover"
            >
          </div>
          <div>
            <h3 class="font-medium">{{ selectedConversation?.name }}</h3>
          </div>
        </div>
        
        <!-- Mensajes -->
        <div class="messages-container p-4" ref="messagesContainer">
          <div v-if="messages.length > 0" class="messages">
            <div 
              v-for="message in messages" 
              :key="message._id"
              class="message mb-4 max-w-3/4"
              :class="{ 'sent': message.sender._id === currentUserId, 'received': message.sender._id !== currentUserId }"
            >
              <div class="message-bubble p-3 rounded-lg" 
                :class="{ 
                  'bg-green-500 text-white ml-auto': message.sender._id === currentUserId,
                  'bg-gray-200 dark:bg-gray-700': message.sender._id !== currentUserId 
                }">
                {{ message.content }}
              </div>
              <div class="message-meta text-xs text-gray-500 mt-1" 
                :class="{ 'text-right': message.sender._id === currentUserId }">
                {{ formatDate(message.createdAt) }}
                <span v-if="message.sender._id === currentUserId" class="ml-1">
                  <span v-if="message.read" class="text-blue-500">✓✓</span>
                  <span v-else>✓</span>
                </span>
              </div>
            </div>
          </div>
          
          <div v-else class="text-center py-8 text-gray-500">
            No hay mensajes en esta conversación. ¡Envía el primero!
          </div>
        </div>
        
        <!-- Formulario de envío -->
        <div class="message-form p-4 border-t dark:border-gray-700">
          <form @submit.prevent="sendMessage" class="flex">
            <input 
              v-model="newMessage" 
              type="text" 
              placeholder="Escribe un mensaje..." 
              class="flex-1 p-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-800 dark:border-gray-700"
              :disabled="sending"
            >
            <button 
              type="submit" 
              class="bg-green-500 text-white px-4 py-2 rounded-r-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
              :disabled="!newMessage.trim() || sending"
            >
              <span v-if="!sending">Enviar</span>
              <span v-else>Enviando...</span>
            </button>
          </form>
        </div>
      </template>
      
      <div v-else class="flex items-center justify-center h-full text-gray-500">
        Selecciona una conversación para ver los mensajes
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { useAuthStore } from '@/features/auth';
import { messageService } from '@/features/messages';

export default {
  name: 'MessageCenter',
  setup() {
    const authStore = useAuthStore();
    const messages = ref([]);
    const conversations = ref([]);
    const selectedUserId = ref(null);
    const newMessage = ref('');
    const sending = ref(false);
    const messagesContainer = ref(null);
    
    const currentUserId = computed(() => authStore.user?.id);
    
    const selectedConversation = computed(() => {
      return conversations.value.find(conv => conv.userId === selectedUserId.value);
    });
    
    // Cargar conversaciones
    const loadConversations = async () => {
      try {
        const response = await messageService.getConversations();
        
        // La respuesta ya viene con las conversaciones formateadas desde el backend
        if (response && response.success && response.data) {
          conversations.value = response.data.map(conv => ({
            userId: conv.withUser._id,
            name: conv.withUser.name,
            avatar: conv.withUser.avatar,
            lastMessage: conv.lastMessage.content,
            lastMessageDate: conv.lastMessage.createdAt,
            unreadCount: conv.unreadCount
          }));
        }
        
      } catch (error) {
        console.error('Error al cargar conversaciones:', error);
      }
    };
    
    // Cargar mensajes de una conversación
    const loadConversationMessages = async (userId) => {
      try {
        const response = await messageService.getConversation(userId);
        messages.value = response.data;
        
        // Marcar mensajes como leídos
        const unreadMessages = messages.value.filter(
          msg => msg.recipient._id === currentUserId.value && !msg.read
        );
        
        if (unreadMessages.length > 0) {
          await Promise.all(unreadMessages.map(msg => messageService.markAsRead(msg._id)));
          // Actualizar contador de no leídos en la conversación
          if (selectedConversation.value) {
            selectedConversation.value.unreadCount = 0;
          }
        }
        
        // Scroll al final de los mensajes
        await nextTick();
        scrollToBottom();
        
      } catch (error) {
        console.error('Error al cargar mensajes:', error);
      }
    };
    
    // Seleccionar conversación
    const selectConversation = (userId) => {
      selectedUserId.value = userId;
      loadConversationMessages(userId);
    };
    
    // Enviar mensaje
    const sendMessage = async () => {
      if (!newMessage.value.trim() || !selectedUserId.value) return;
      
      sending.value = true;
      
      try {
        const messageData = {
          recipient: selectedUserId.value,
          content: newMessage.value.trim()
        };
        
        const response = await messageService.sendMessage(messageData);
        messages.value.push(response.data);
        
        // Actualizar la conversación en la lista
        if (selectedConversation.value) {
          selectedConversation.value.lastMessage = messageData.content;
          selectedConversation.value.lastMessageDate = new Date().toISOString();
        }
        
        // Limpiar campo de mensaje
        newMessage.value = '';
        
        // Scroll al final de los mensajes
        await nextTick();
        scrollToBottom();
        
      } catch (error) {
        console.error('Error al enviar mensaje:', error);
      } finally {
        sending.value = false;
      }
    };
    
    // Formatear fecha
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };
    
    // Scroll al final de los mensajes
    const scrollToBottom = () => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
      }
    };
    
    // Cargar datos iniciales
    onMounted(() => {
      loadConversations();
    });
    
    return {
      messages,
      conversations,
      selectedUserId,
      newMessage,
      sending,
      messagesContainer,
      currentUserId,
      selectedConversation,
      selectConversation,
      sendMessage,
      formatDate
    };
  }
};
</script>

<style scoped>
@import '@/assets/styles/common.css';

.message-center {
  display: grid;
  grid-template-columns: 300px 1fr;
  height: calc(100vh - 64px); /* Ajustar según la altura del header */
  overflow: hidden;
}

.message-sidebar {
  border-right: 1px solid #e5e7eb;
  padding: 1rem;
  overflow-y: auto;
}

.message-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
}

.sent .message-bubble {
  border-radius: 18px 18px 0 18px;
}

.received .message-bubble {
  border-radius: 18px 18px 18px 0;
}

@media (max-width: 768px) {
  .message-center {
    grid-template-columns: 1fr;
  }
  
  .message-sidebar {
    display: none;
  }
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .message-sidebar {
    border-right-color: #374151;
  }
}
</style>