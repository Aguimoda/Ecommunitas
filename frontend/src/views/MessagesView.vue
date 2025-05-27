<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">Mis mensajes</h1>
      
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <MessageList 
          :conversations="conversations" 
          :loading="loading" 
          :error="error" 
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import MessageList from '../components/MessageList.vue';
import messageService from '@/services/messageService';

const conversations = ref([]);
const loading = ref(true);
const error = ref('');

// Cargar conversaciones
const fetchConversations = async () => {
  try {
    loading.value = true;
    error.value = '';
    const response = await messageService.getConversations();
    
    // Manejar diferentes formatos de respuesta
    if (response && response.success && response.data) {
      conversations.value = response.data;
    } else if (response && Array.isArray(response)) {
      conversations.value = response;
    } else if (response && response.data && Array.isArray(response.data)) {
      conversations.value = response.data;
    } else {
      throw new Error('Formato de respuesta inesperado');
    }
  } catch (err) {
    console.error('Error al cargar conversaciones:', err);
    error.value = err.message || 'No se pudieron cargar las conversaciones. Inténtalo de nuevo más tarde.';
    conversations.value = [];
  } finally {
    loading.value = false;
  }
};

// Manejar evento de conversación leída
const handleConversationRead = (event) => {
  const { conversationId } = event.detail;
  if (conversationId) {
    const conversation = conversations.value.find(c => 
      c.withUser && c.withUser._id === conversationId
    );
    if (conversation) {
      conversation.unreadCount = 0;
    }
  }
};

onMounted(() => {
  fetchConversations();
  window.addEventListener('conversationRead', handleConversationRead);
});

onUnmounted(() => {
  window.removeEventListener('conversationRead', handleConversationRead);
});
</script>