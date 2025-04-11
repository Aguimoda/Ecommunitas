<template>
  <div class="message-list">
    <h2 class="text-xl font-semibold mb-4">Mensajes</h2>
    
    <div v-if="loading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
    
    <div v-else-if="error" class="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
      <p class="text-sm text-red-700">{{ error }}</p>
    </div>
    
    <div v-else-if="conversations.length === 0" class="text-center py-8 text-gray-500">
      <svg class="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
      <p>No tienes mensajes todavía</p>
    </div>
    
    <ul v-else class="divide-y divide-gray-200">
      <li v-for="conversation in conversations" :key="conversation._id" class="py-4">
        <router-link 
          :to="`/messages/${conversation.otherUser._id}`" 
          class="block hover:bg-gray-50 p-3 rounded-lg transition-colors"
        >
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div v-if="conversation.otherUser.profileImage" class="h-10 w-10 rounded-full overflow-hidden">
                <img :src="conversation.otherUser.profileImage" :alt="conversation.otherUser.name" class="h-full w-full object-cover">
              </div>
              <div v-else class="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500">
                {{ getInitials(conversation.otherUser.name) }}
              </div>
            </div>
            <div class="ml-4 flex-1">
              <div class="flex items-center justify-between">
                <p class="text-sm font-medium text-gray-900">{{ conversation.otherUser.name }}</p>
                <p class="text-xs text-gray-500">{{ formatDate(conversation.lastMessage.createdAt) }}</p>
              </div>
              <div class="mt-1">
                <p class="text-sm text-gray-600 truncate">{{ conversation.lastMessage.content }}</p>
              </div>
            </div>
            <div v-if="conversation.unreadCount > 0" class="ml-2 flex-shrink-0">
              <span class="inline-flex items-center justify-center h-6 w-6 rounded-full bg-indigo-500 text-white text-xs">
                {{ conversation.unreadCount }}
              </span>
            </div>
          </div>
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const conversations = ref([])
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    loading.value = true
    const response = await axios.get('/api/messages/conversations', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
    conversations.value = response.data
  } catch (err) {
    console.error('Error al cargar mensajes:', err)
    error.value = 'No se pudieron cargar los mensajes. Por favor, intenta nuevamente.'
  } finally {
    loading.value = false
  }
})

const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  
  // Si es hoy, mostrar la hora
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  }
  
  // Si es esta semana, mostrar el día
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))
  if (diffDays < 7) {
    return date.toLocaleDateString('es-ES', { weekday: 'short' })
  }
  
  // Si es este año, mostrar día y mes
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
  }
  
  // Si es otro año, mostrar día, mes y año
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>