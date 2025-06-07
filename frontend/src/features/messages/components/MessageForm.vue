<template>
  <div class="message-form bg-white p-6 rounded-lg shadow-md">
    <h3 class="text-lg font-medium text-gray-900 mb-4">Contactar con {{ recipientName }}</h3>
    
    <!-- Alerta de error -->
    <div v-if="error" 
         class="bg-red-50 border-l-4 border-red-500 p-4 mb-4" 
         role="alert"
         aria-live="assertive">
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-red-700">{{ error }}</p>
        </div>
      </div>
    </div>
    
    <!-- Alerta de éxito -->
    <div v-if="success" 
         class="bg-green-50 border-l-4 border-green-500 p-4 mb-4" 
         role="alert"
         aria-live="assertive">
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-green-700">{{ success }}</p>
        </div>
      </div>
    </div>
    
    <form @submit.prevent="sendMessage" class="space-y-4">
      <div>
        <label for="subject" class="block text-sm font-medium text-gray-700 mb-1">Asunto</label>
        <input 
          id="subject" 
          type="text" 
          v-model="subject" 
          required
          class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Estoy interesado en tu artículo"
          :disabled="isLoading"
          aria-required="true"
        >
      </div>
      
      <div>
        <label for="message" class="block text-sm font-medium text-gray-700 mb-1">Mensaje</label>
        <textarea 
          id="message" 
          v-model="message" 
          rows="4" 
          required
          class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Me gustaría obtener más información sobre este artículo..."
          :disabled="isLoading"
          aria-required="true"
        ></textarea>
      </div>
      
      <div class="flex justify-end">
        <button 
          type="button" 
          class="mr-3 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          @click="$emit('cancel')"
          :disabled="isLoading"
        >
          Cancelar
        </button>
        <button 
          type="submit" 
          class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          :disabled="isLoading"
        >
          <span v-if="isLoading" class="mr-2">
            <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </span>
          {{ isLoading ? 'Enviando...' : 'Enviar mensaje' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue'
import { MESSAGE_ROUTES } from '@/config/apiRoutes'
import { messageService } from '@/features/messages'

const props = defineProps({
  recipientId: {
    type: String,
    required: true
  },
  recipientName: {
    type: String,
    required: true
  },
  itemId: {
    type: String,
    default: null
  },
  itemTitle: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['sent', 'cancel'])

const subject = ref(props.itemTitle ? `Interesado en: ${props.itemTitle}` : '')
const message = ref('')
const error = ref('')
const success = ref('')
const isLoading = ref(false)

const sendMessage = async () => {
  try {
    isLoading.value = true
    error.value = ''
    success.value = ''
    
    // Verificar token
    const token = localStorage.getItem('token')
    if (!token) {
      error.value = 'Debes iniciar sesión para enviar mensajes'
      return
    }
    
    // Verificar recipientId
    if (!props.recipientId) {
      error.value = 'ID de destinatario no definido.'
      isLoading.value = false;
      return;
    }
    
    // Enviar mensaje
    const response = await messageService.sendMessage({
      recipient: props.recipientId,
      subject: subject.value,
      content: message.value,
      itemId: props.itemId
    })
    
    // Mostrar mensaje de éxito
    success.value = 'Mensaje enviado correctamente'
    message.value = ''
    
    // Emitir evento de mensaje enviado
    setTimeout(() => {
      emit('sent', response.data)
    }, 1500)
    
  } catch (err) {
    if (err.response) {
      if (err.response.status === 401) {
        error.value = 'Sesión expirada. Por favor, inicia sesión nuevamente.'
      } else if (err.response.data && err.response.data.message) {
        error.value = err.response.data.message
      } else {
        error.value = 'Error al enviar el mensaje. Por favor, intenta nuevamente.'
      }
    } else if (err.request) {
      error.value = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.'
    } else {
      error.value = 'Error al enviar el mensaje. Por favor, intenta nuevamente.'
    }
    console.error('Error al enviar mensaje:', err)
  } finally {
    isLoading.value = false
  }
}
</script>