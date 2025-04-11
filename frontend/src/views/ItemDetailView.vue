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
        Volver a resultados
      </button>

      <!-- Contenedor principal -->
      <div v-if="loading" class="text-center py-8">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
        <p class="mt-2 text-gray-600">Cargando detalles...</p>
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

      <div v-else-if="item" class="bg-white rounded-lg shadow-md overflow-hidden">
        <!-- Galería de imágenes -->
        <div class="relative bg-gray-100 h-64 md:h-96">
          <img 
            v-if="item.imageUrl" 
            :src="item.imageUrl" 
            :alt="item.title" 
            class="w-full h-full object-contain"
          >
          <div v-else class="w-full h-full flex items-center justify-center">
            <svg class="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div class="absolute top-4 right-4 bg-indigo-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
            {{ item.condition }}
          </div>
        </div>

        <!-- Información del artículo -->
        <div class="p-6">
          <div class="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
            <div>
              <h1 class="text-2xl font-bold text-gray-800">{{ item.title }}</h1>
              <div class="flex items-center mt-2 text-sm text-gray-500">
                <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Publicado el {{ formatDate(item.createdAt) }}</span>
              </div>
            </div>
            <div class="mt-4 md:mt-0">
              <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                {{ item.category }}
              </span>
            </div>
          </div>

          <div class="border-t border-gray-200 pt-4">
            <h2 class="text-lg font-semibold text-gray-800 mb-2">Descripción</h2>
            <p class="text-gray-600 whitespace-pre-line">{{ item.description }}</p>
          </div>

          <div class="border-t border-gray-200 mt-6 pt-4">
            <h2 class="text-lg font-semibold text-gray-800 mb-2">Detalles</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="flex items-center">
                <svg class="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <div>
                  <span class="text-sm text-gray-500">Categoría</span>
                  <p class="font-medium text-gray-800">{{ item.category }}</p>
                </div>
              </div>
              <div class="flex items-center">
                <svg class="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <span class="text-sm text-gray-500">Condición</span>
                  <p class="font-medium text-gray-800">{{ item.condition }}</p>
                </div>
              </div>
              <div class="flex items-center">
                <svg class="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <span class="text-sm text-gray-500">Ubicación</span>
                  <p class="font-medium text-gray-800">{{ item.location }}</p>
                </div>
              </div>
              <div class="flex items-center">
                <svg class="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <div>
                  <span class="text-sm text-gray-500">Publicado por</span>
                  <p class="font-medium text-gray-800">{{ item.owner?.name || 'Usuario' }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Botones de acción -->
          <div class="border-t border-gray-200 mt-6 pt-6 flex flex-col sm:flex-row gap-3">
            <button 
              class="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center justify-center"
              @click="contactOwner"
            >
              <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Contactar
            </button>
            <button 
              class="flex-1 bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center justify-center"
              @click="shareItem"
            >
              <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Compartir
            </button>
          </div>
        </div>
      </div>

      <!-- Modal de contacto -->
      <div v-if="showContactForm" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div class="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 class="text-lg font-medium text-gray-900">Contactar con el propietario</h3>
            <button @click="closeContactForm" class="text-gray-400 hover:text-gray-500">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="p-4">
            <MessageForm 
              :recipientId="item.owner._id" 
              :recipientName="item.owner.name" 
              :itemId="item._id" 
              :itemTitle="item.title" 
              @sent="handleMessageSent" 
              @cancel="closeContactForm" 
            />
          </div>
        </div>
      </div>

      <div v-else-if="!item" class="text-center py-8">
        <p class="text-gray-500">No se encontró el artículo</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import MessageForm from '../components/MessageForm.vue'

const route = useRoute()
const router = useRouter()
const item = ref(null)
const loading = ref(true)
const error = ref('')

// Formatear fecha
const formatDate = (dateString) => {
  if (!dateString) return 'Fecha no disponible'
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

// Cargar datos del artículo
const fetchItemDetails = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const response = await axios.get(`/api/items/${route.params.id}`, {
      headers: {
        'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : undefined
      }
    })
    
    item.value = response.data
  } catch (err) {
    if (err.response && err.response.status === 404) {
      error.value = 'El artículo no existe o ha sido eliminado'
    } else {
      error.value = 'Error al cargar los detalles del artículo'
    }
    console.error('Error al cargar detalles:', err)
  } finally {
    loading.value = false
  }
}

// Contactar al propietario
const showContactForm = ref(false)
const contactOwner = () => {
  if (!localStorage.getItem('token')) {
    // Redirigir a login si no está autenticado
    router.push({
      path: '/login',
      query: { redirect: route.fullPath }
    })
    return
  }
  
  // Mostrar formulario de contacto
  showContactForm.value = true
}

// Manejar mensaje enviado
const handleMessageSent = () => {
  showContactForm.value = false
  // Mostrar notificación de éxito
  alert('Mensaje enviado correctamente')
  // Aquí podríamos implementar un sistema de notificaciones más elegante
}

// Cerrar formulario de contacto
const closeContactForm = () => {
  showContactForm.value = false
}

// Compartir artículo
const shareItem = async () => {
  try {
    if (navigator.share) {
      await navigator.share({
        title: item.value.title,
        text: `Mira este artículo en Ecomunitas: ${item.value.title}`,
        url: window.location.href
      })
    } else {
      // Fallback para navegadores que no soportan Web Share API
      const url = window.location.href
      navigator.clipboard.writeText(url)
      alert('Enlace copiado al portapapeles')
    }
  } catch (err) {
    console.error('Error al compartir:', err)
  }
}

onMounted(() => {
  fetchItemDetails()
})
</script>

<style scoped>
/* Estilos adicionales si son necesarios */
</style>