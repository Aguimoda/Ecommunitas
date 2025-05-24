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
import { ref, computed, onMounted } from 'vue'
import MessageList from '../components/MessageList.vue';
import messageService from '@/services/messageService'; // Importar el servicio de mensajes

const conversations = ref([]);
const loading = ref(true);
const error = ref('');

// Cargar conversaciones
const fetchConversations = async () => {
  try {
    loading.value = true;
    error.value = ''; // Resetear error
    const response = await messageService.getConversations();
    if (response.success) {
      conversations.value = response.data;
    } else {
      throw new Error(response.message || 'Error al obtener conversaciones');
    }
  } catch (err) {
    console.error('Error al cargar conversaciones:', err);
    error.value = err.message || 'No se pudieron cargar las conversaciones. Inténtalo de nuevo más tarde.';
    conversations.value = []; // Asegurarse de que conversations esté vacío en caso de error
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchConversations()
})
</script>