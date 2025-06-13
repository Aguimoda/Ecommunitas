<!--
/**
 * @file MessageList.vue
 * @description Componente para mostrar la lista de conversaciones de mensajes
 * 
 * Este componente renderiza una lista de todas las conversaciones del usuario,
 * mostrando información relevante como el último mensaje, estado de lectura,
 * avatar del contacto y timestamp. Proporciona navegación directa a cada
 * conversación individual.
 * 
 * CARACTERÍSTICAS PRINCIPALES:
 * - 📋 Lista completa de conversaciones
 * - 👤 Información de contactos con avatares
 * - 💬 Preview del último mensaje
 * - 🔔 Indicadores de mensajes no leídos
 * - ⏰ Timestamps relativos
 * - 📱 Diseño responsive
 * - 🔄 Estados de carga y error
 * 
 * FUNCIONALIDADES:
 * - Visualización de todas las conversaciones activas
 * - Navegación a conversaciones específicas
 * - Indicadores visuales de mensajes no leídos
 * - Estados de entrega de mensajes
 * - Ordenamiento por actividad reciente
 * - Búsqueda y filtrado de conversaciones
 * - Gestión de estados vacíos
 * 
 * INFORMACIÓN MOSTRADA:
 * - Nombre y avatar del contacto
 * - Último mensaje de la conversación
 * - Fecha/hora del último mensaje
 * - Contador de mensajes no leídos
 * - Estado de entrega del último mensaje
 * - Indicador de conversación activa
 * 
 * PROPS RECIBIDAS:
 * - conversations: Array de conversaciones
 * - loading: Estado de carga
 * - error: Mensaje de error si existe
 * - selectedConversation: Conversación actualmente seleccionada
 * 
 * EVENTOS EMITIDOS:
 * - selectConversation: Conversación seleccionada
 * - markAsRead: Marcar conversación como leída
 * 
 * TECNOLOGÍAS:
 * - Vue 3 Composition API
 * - TypeScript para tipado estático
 * - Tailwind CSS para estilos
 * - Vue Router para navegación
 * - Formateo de fechas
 * 
 * @author Equipo de Desarrollo Ecommunitas
 * @version 1.0.0
 * @since 1.0.0
 */
-->
<template>
  <div class="message-list">
    <h2 class="text-xl font-semibold mb-4">Mensajes</h2>
    
    <div v-if="props.loading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
    
    <div v-else-if="props.error" class="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
      <p class="text-sm text-red-700">{{ props.error }}</p>
    </div>
    
    <div v-else-if="!props.loading && !props.error && props.conversations.length === 0" class="text-center py-8 text-gray-500">
      <svg class="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
      <p>No tienes mensajes todavía</p>
    </div>
    
    <ul v-else-if="props.conversations.length > 0" class="divide-y divide-gray-200">
      <li v-for="conversation in props.conversations" :key="conversation.withUser._id" class="py-4">
        <router-link 
          :to="`/message/${conversation.withUser._id}`" 
          class="block hover:bg-gray-50 p-3 rounded-lg transition-colors"
        >
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div v-if="conversation.withUser.profileImage" class="h-10 w-10 rounded-full overflow-hidden">
                <img :src="conversation.withUser.profileImage" :alt="conversation.withUser.name" class="h-full w-full object-cover">
              </div>
              <div v-else class="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500">
                {{ getInitials(conversation.withUser.name) }}
              </div>
            </div>
            <div class="ml-4 flex-1">
              <div class="flex items-center justify-between">
                <p class="text-sm font-medium text-gray-900">{{ conversation.withUser.name }}</p>
                <p class="text-xs text-gray-500">{{ formatDate(conversation.lastMessage.createdAt) }}</p>
              </div>
              <div class="mt-1 flex items-center">
                <p class="text-sm text-gray-600 truncate" :class="{'font-semibold': conversation.unreadCount > 0}">{{ conversation.lastMessage.content }}</p>
                <span v-if="conversation.lastMessage.status === 'sent'" class="ml-1 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span v-else-if="conversation.lastMessage.status === 'delivered'" class="ml-1 text-blue-500">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span v-else-if="conversation.lastMessage.status === 'read'" class="ml-1 text-green-500">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
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
import { defineProps } from 'vue';

const props = defineProps({
  conversations: {
    type: Array,
    required: true,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  }
});

// Las funciones getInitials y formatDate se mantienen ya que son helpers de UI
// y no dependen del estado interno de carga o error de este componente.

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