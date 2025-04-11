<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">Mis mensajes</h1>
      
      <!-- Contenedor principal -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <!-- Si no hay mensajes, mostrar mensaje informativo -->
        <div v-if="!hasMessages" class="p-8 text-center">
          <div class="mx-auto h-12 w-12 text-gray-400 mb-4">
            <svg class="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-1">No tienes mensajes</h3>
          <p class="text-gray-500 mb-4">Cuando contactes con otros usuarios o recibas mensajes, aparecerán aquí.</p>
          <router-link to="/search" class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <svg class="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Buscar artículos
          </router-link>
        </div>
        
        <!-- Lista de mensajes -->
        <div v-else>
          <MessageList />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import MessageList from '../components/MessageList.vue'
import axios from 'axios'

const conversations = ref([])
const loading = ref(true)
const error = ref('')

// Comprobar si hay mensajes
const hasMessages = computed(() => {
  return conversations.value.length > 0
})

// Cargar conversaciones
const fetchConversations = async () => {
  try {
    loading.value = true
    const token = localStorage.getItem('token')
    if (!token) return

    const response = await axios.get('/api/messages/conversations', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    conversations.value = response.data
  } catch (err) {
    console.error('Error al cargar conversaciones:', err)
    error.value = 'No se pudieron cargar las conversaciones'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchConversations()
})
</script>