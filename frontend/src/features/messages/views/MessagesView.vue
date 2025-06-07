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
import { MessageList } from '@/features/messages/components'
import { useMessages } from '../composables/useMessages'

const {
  // Estados reactivos
  conversations,
  loading,
  error,
  
  // Funciones principales
  fetchConversations,
  markConversationAsRead,
  findConversationByUserId
} = useMessages()
</script>