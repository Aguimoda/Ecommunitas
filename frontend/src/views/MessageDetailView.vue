<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-4xl mx-auto">
      <!-- Botón de regreso -->
      <button 
        @click="$router.back()" 
        class="mb-4 flex items-center text-gray-600 hover:text-indigo-600 transition-colors"
      >
        <svg class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Volver a mensajes
      </button>

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

      <div v-else class="bg-white rounded-lg shadow-md overflow-hidden">
        <!-- Cabecera de la conversación -->
        <div class="p-4 bg-gray-50 border-b border-gray-200">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div v-if="otherUser && otherUser.profileImage" class="h-10 w-10 rounded-full overflow-hidden">
                <img :src="otherUser.profileImage" :alt="otherUser.name || 'Avatar'" class="h-full w-full object-cover">
              </div>
              <div v-else-if="otherUser && otherUser.name" class="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <span class="text-sm font-medium text-indigo-500">{{ getInitials(otherUser.name) }}</span>
              </div>
              <div v-else class="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                <svg class="h-6 w-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
            <div class="ml-3">
              <h2 v-if="otherUser && otherUser.name" class="text-lg font-medium text-gray-900">{{ otherUser.name }}</h2>
              <h2 v-else class="text-lg font-medium text-gray-900">Usuario desconocido</h2>
              <p v-if="item" class="text-sm text-gray-500">
                Conversación sobre: <router-link :to="`/items/${item._id}`" class="text-indigo-600 hover:text-indigo-500">{{ item.title }}</router-link>
              </p>
            </div>
          </div>
        </div>

        <!-- Mensajes -->
        <div class="p-4 h-96 overflow-y-auto" ref="messagesContainer">
          <div v-if="messages.length === 0" class="text-center py-8 text-gray-500">
            <p>No hay mensajes en esta conversación</p>
          </div>
          <div v-else class="space-y-4">
            <div v-for="message in messages" :key="message._id" :class="[message.sender._id === userId ? 'ml-auto' : '', 'max-w-xs md:max-w-md']">
              <div :class="[message.sender._id === userId ? 'bg-indigo-100 text-gray-800' : 'bg-gray-100 text-gray-800', 'rounded-lg px-4 py-2 inline-block']">
                <p class="whitespace-pre-line">{{ message.content }}</p>
              </div>
              <div :class="[message.sender._id === userId ? 'text-right' : '', 'mt-1 text-xs text-gray-500']">
                {{ formatDate(message.createdAt) }}
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
              :disabled="sending || !newMessage.trim() || !otherUser || !otherUser._id"
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
import { ref, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import messageService from '@/services/messageService'
import { jwtDecode } from 'jwt-decode'
import { useToast } from 'vue-toastification'

// Estado
const route = useRoute()
const router = useRouter()
const toast = useToast()
const messages = ref([])
const otherUser = ref({})
const item = ref(null)
const loading = ref(true)
const error = ref('')
const newMessage = ref('')
const sending = ref(false)
const messagesContainer = ref(null)
const userId = ref('')

// Obtener ID del usuario actual del token
const getUserIdFromToken = () => {
  const token = localStorage.getItem('token')
  if (!token) {
    router.push('/login')
    return null
  }
  try {
    const decoded = jwtDecode(token)
    return decoded.id
  } catch (err) {
    console.error('Error al decodificar token:', err)
    router.push('/login')
    return null
  }
}

// Cargar mensajes
const fetchMessages = async () => {
  try {
    loading.value = true
    error.value = '' // Reset error at the start
    
    userId.value = getUserIdFromToken()
    if (!userId.value) {
      // getUserIdFromToken already handles redirect to login if token is bad/missing
      loading.value = false; // Stop loading if we can't get current user ID
      return
    }

    toast.info('Cargando conversación...', { timeout: 2000 })
    
    const response = await messageService.getConversation(route.params.id)
    console.log('API Response from getConversation:', response); // For debugging

    if (!response || !response.otherUser || !response.otherUser._id) {
      console.error('Datos del destinatario incompletos o no encontrados en la respuesta de la API:', response);
      error.value = 'No se pudo cargar la información del destinatario. La conversación no puede mostrarse correctamente.';
      toast.error('Error: Información del destinatario incompleta.');
      messages.value = []; // Clear messages if recipient info is bad
      otherUser.value = {};
      item.value = null;
      loading.value = false;
      return; // Exit early
    }

    // If we reach here, response.otherUser and response.otherUser._id are presumed valid
    messages.value = response.conversation || []
    otherUser.value = response.otherUser // No || {} needed due to check above
    item.value = response.item

    // Emitir evento de que la conversación ha sido leída
    window.dispatchEvent(new CustomEvent('conversationRead'));

    await nextTick()
    scrollToBottom()

  } catch (err) {
    console.error('Error al cargar la conversación:', err)
    // This catch block handles network errors or errors thrown by messageService
    let detailedError = 'No se pudo cargar la conversación. Por favor, intenta nuevamente más tarde.'
    if (err.response && err.response.data && err.response.data.error) {
        detailedError = `Error del servidor: ${err.response.data.error}`;
    } else if (err.message) {
        detailedError = err.message;
    }
    error.value = detailedError;
    toast.error(detailedError)
    messages.value = []; // Clear data on error
    otherUser.value = {};
    item.value = null;
  } finally {
    loading.value = false
  }
}

// Enviar un nuevo mensaje
const sendMessage = async () => {
  if (!newMessage.value.trim() || sending.value) return

  if (!otherUser.value || !otherUser.value._id) {
    toast.error('No se ha podido identificar al destinatario. Por favor, recarga la página.')
    sending.value = false // Asegurarse de que sending se restablezca
    return
  }
  
  sending.value = true
  toast.info('Enviando mensaje...', {
    timeout: 1000
  })

  try {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    const response = await messageService.sendMessage({
      recipient: otherUser.value._id,
      content: newMessage.value,
      item: item.value ? item.value._id : null
    })

    // Añadir mensaje a la lista
    const currentUser = {
      _id: userId.value,
      name: 'Tú' // Podríamos obtener el nombre real del usuario si es necesario
    }

    messages.value.push({
      ...response.data,
      sender: currentUser,
      receiver: otherUser.value,
      createdAt: new Date().toISOString()
    })

    // Limpiar el campo de mensaje y desplazarse hacia abajo
    newMessage.value = ''
    sending.value = false
    toast.success('Mensaje enviado correctamente')
    await nextTick()
    scrollToBottom()
  } catch (err) {
    console.error('Error al enviar mensaje:', err)
    sending.value = false
    toast.error('Error al enviar el mensaje. Inténtalo de nuevo.')
  }
}

// Desplazar al final de los mensajes
const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// Formatear fecha
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

// Obtener iniciales del nombre
const getInitials = (name) => {
  if (!name) return ''
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

// Cargar datos al montar el componente
onMounted(() => {
  fetchMessages()
})

// Actualizar cuando cambie el ID de la conversación
watch(() => route.params.id, () => {
  fetchMessages()
})
</script>