<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-6">
        <div class="flex items-center justify-between">
          <button 
            @click="$router.go(-1)" 
            class="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
          >
            <svg class="-ml-0.5 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver
          </button>
        </div>
      </div>

      <!-- Contenedor principal -->
      <div v-if="loading" class="text-center py-8">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
        <p class="mt-2 text-gray-600">Cargando conversación...</p>
      </div>

      <div v-else-if="error" class="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-red-700">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Conversación -->
      <div class="bg-white dark:bg-gray-800 shadow rounded-lg">
        <!-- Header de la conversación -->
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <!-- Usuario con el que conversamos -->
            <div class="flex items-center">
              <div class="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-500 dark:text-indigo-300 overflow-hidden">
                <img v-if="otherUser && getUserAvatarUrl(otherUser)" :src="getUserAvatarUrl(otherUser)" class="h-full w-full object-cover" alt="Foto de perfil">
                <span v-else-if="otherUser && otherUser.name" class="text-sm font-medium">{{ getInitials(otherUser.name) }}</span>
                <svg v-else class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-lg font-medium text-gray-900 dark:text-white">{{ (otherUser && otherUser.name) || 'Usuario' }}</h3>
                <p v-if="item" class="text-sm text-gray-500 dark:text-gray-400">Conversación sobre: {{ item.title }}</p>
              </div>
            </div>
            
            <!-- Información del ítem -->
            <div v-if="item" class="flex items-center space-x-3">
              <div class="text-right">
                <h4 class="text-sm font-medium text-gray-900 dark:text-white">{{ item.title }}</h4>
                <p v-if="item.price" class="text-sm text-green-600 dark:text-green-400 font-semibold">{{ formatPrice(item.price) }}</p>
              </div>
              <div class="h-12 w-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                <img v-if="item.images && item.images.length > 0" 
                     :src="item.images[0]" 
                     :alt="item.title" 
                     class="h-full w-full object-cover">
                <div v-else class="h-full w-full flex items-center justify-center">
                  <svg class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Mensajes -->
        <div class="p-4 h-96 overflow-y-auto" ref="messagesContainer">
          <div v-if="messages.length === 0" class="text-center py-8 text-gray-500">
            <p>No hay mensajes en esta conversación</p>
          </div>
          <div v-else class="space-y-4">
            <div v-for="message in messages" :key="message._id" class="flex" :class="message.sender._id === userId ? 'justify-end' : 'justify-start'">
              <!-- Mensaje del otro usuario -->
              <div v-if="message.sender._id !== userId" class="flex items-start space-x-3 max-w-xs md:max-w-md">
                <div class="flex items-start space-x-3">
                  <div class="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 overflow-hidden flex-shrink-0">
                    <img v-if="message.sender && getUserAvatarUrl(message.sender)" :src="getUserAvatarUrl(message.sender)" class="h-full w-full object-cover" alt="Foto de perfil">
                    <span v-else-if="message.sender && message.sender.name" class="text-xs font-medium">{{ getInitials(message.sender.name) }}</span>
                    <svg v-else class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <div class="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-2">
                      <p class="whitespace-pre-line">{{ message.content }}</p>
                    </div>
                    <div class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {{ formatDate(message.createdAt) }}
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Mensaje propio -->
              <div v-else class="max-w-xs md:max-w-md">
                <div class="bg-indigo-600 text-white rounded-lg px-4 py-2">
                  <p class="whitespace-pre-line">{{ message.content }}</p>
                </div>
                <div class="mt-1 text-xs text-gray-500 dark:text-gray-400 text-right">
                  {{ formatDate(message.createdAt) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Formulario para enviar mensaje -->
        <div class="p-4 border-t border-gray-200">
          <form @submit.prevent="sendMessage" class="flex items-end space-x-2">
            <div class="flex-1">
              <label for="message" class="sr-only">Mensaje</label>
              <textarea 
                id="message" 
                v-model="newMessage" 
                rows="3"
                required
                :disabled="sending"
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Escribe tu mensaje..."
                @keydown.enter.prevent="sendMessage"
              ></textarea>
            </div>
            <button 
              type="submit"
              :disabled="sending || !newMessage.trim() || !otherUser || !otherUser?._id"
              class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg v-if="sending" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <svg v-else class="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Enviar
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useMessageDetail } from '@/features/messages/composables/useMessageDetail'

const {
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
  getInitials,
  formatPrice,
  getUserAvatarUrl,
  
  // Funciones principales
  sendMessage,
  scrollToBottom,
  fetchMessages
} = useMessageDetail()
</script>