<!--
/**
 * @file ItemDetailView.vue
 * @description Vista detallada de un artículo individual en Ecommunitas
 * 
 * Este componente muestra toda la información detallada de un artículo específico,
 * incluyendo imágenes, descripción, ubicación, información del propietario y
 * opciones de contacto. Proporciona una experiencia completa para visualizar
 * y gestionar artículos individuales.
 * 
 * CARACTERÍSTICAS PRINCIPALES:
 * - 🖼️ Galería de imágenes con navegación
 * - 📍 Información de ubicación con mapa
 * - 👤 Perfil del propietario del artículo
 * - 💬 Sistema de mensajería integrado
 * - ⚡ Carga optimizada de contenido
 * - 📱 Diseño responsive y accesible
 * - 🔄 Estados de carga y error
 * 
 * FUNCIONALIDADES:
 * - Visualización completa de detalles del artículo
 * - Navegación entre múltiples imágenes
 * - Contacto directo con el propietario
 * - Compartir artículo en redes sociales
 * - Reportar contenido inapropiado
 * - Gestión de favoritos (si está autenticado)
 * - Edición del artículo (si es el propietario)
 * 
 * ESTADOS MANEJADOS:
 * - Carga inicial de datos
 * - Error en la obtención del artículo
 * - Artículo no encontrado
 * - Estados de autenticación del usuario
 * - Permisos de edición
 * 
 * INTEGRACIÓN:
 * - Store de items para gestión de datos
 * - Store de autenticación para permisos
 * - Sistema de mensajería para contacto
 * - Servicio de geolocalización para mapas
 * - APIs de redes sociales para compartir
 * 
 * TECNOLOGÍAS:
 * - Vue 3 Composition API
 * - TypeScript para tipado estático
 * - Tailwind CSS para estilos
 * - Vue Router para navegación
 * - Pinia para gestión de estado
 * 
 * @author Equipo de Desarrollo Ecommunitas
 * @version 1.0.0
 * @since 1.0.0
 */
-->
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
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto loading-spinner"></div>
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
          <!-- Imagen principal -->
          <img 
            v-if="itemImages.length > 0" 
            :key="`image-${currentImageIndex}-${itemImages[currentImageIndex]}`"
            :src="itemImages[currentImageIndex]" 
            :alt="`${item.title} - Imagen ${currentImageIndex + 1}`" 
            class="w-full h-full object-contain"
            @error="handleImageError"
          >
          <div v-else class="w-full h-full flex items-center justify-center">
            <svg class="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          
          <!-- Controles de navegación -->
          <div v-if="itemImages.length > 1" class="absolute inset-y-0 left-0 flex items-center">
            <button 
              @click="previousImage" 
              class="ml-2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all nav-button"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
          <div v-if="itemImages.length > 1" class="absolute inset-y-0 right-0 flex items-center">
            <button 
              @click="nextImage" 
              class="mr-2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all nav-button"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          <!-- Indicadores de imagen -->
          <div v-if="itemImages.length > 1" class="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            <button 
              v-for="(image, index) in itemImages" 
              :key="index"
              @click="currentImageIndex = index"
              class="w-3 h-3 rounded-full transition-all image-indicator"
              :class="currentImageIndex === index ? 'bg-white' : 'bg-white bg-opacity-50'"
            ></button>
          </div>
          
          <!-- Contador de imágenes -->
          <div v-if="itemImages.length > 1" class="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
            {{ currentImageIndex + 1 }} / {{ itemImages.length }}
          </div>
          
          <div class="absolute top-4 right-4 bg-indigo-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
            {{ translateCondition(item.condition) }}
          </div>
        </div>
        
        <!-- Miniaturas de imágenes -->
        <div v-if="itemImages.length > 1" class="p-4 bg-gray-50 border-b">
          <div class="flex space-x-2 overflow-x-auto">
            <button 
              v-for="(image, index) in itemImages" 
              :key="`thumbnail-${index}-${image}`"
              @click="currentImageIndex = index"
              class="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all thumbnail"
              :class="currentImageIndex === index ? 'border-indigo-500' : 'border-gray-300 hover:border-gray-400'"
            >
              <img 
                :key="`thumb-img-${index}-${image}`"
                :src="image" 
                :alt="`${item.title} - Imagen ${index + 1}`" 
                class="w-full h-full object-cover"
                @error="handleImageError"
              >
            </button>
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
                {{ translateCategory(item.category) }}
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
                  <p class="font-medium text-gray-800">{{ translateCategory(item.category) }}</p>
                </div>
              </div>
              <div class="flex items-center">
                <svg class="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <span class="text-sm text-gray-500">Condición</span>
                  <p class="font-medium text-gray-800">{{ translateCondition(item.condition) }}</p>
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
                  <p class="font-medium text-gray-800">{{ item.user?.name || 'Usuario' }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Botones de acción -->
          <div class="border-t border-gray-200 mt-6 pt-6 flex flex-col sm:flex-row gap-3">
            <button 
              class="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center justify-center action-button"
              @click="handleMainAction"
            >
              <svg v-if="!isOwner" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <svg v-else class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              {{ isOwner ? 'Editar Anuncio' : 'Contactar' }}
            </button>
            <button 
              class="flex-1 bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center justify-center action-button"
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
      <div v-if="showContactForm" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50 modal-overlay">
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto modal-content">
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
              :recipientId="item.user._id" 
              :recipientName="item.user.name" 
              :itemId="item._id" 
              :itemTitle="item.title" 
              @sent="handleMessageSent" 
              @cancel="closeContactForm" 
            />
          </div>
        </div>
      </div>

      <!-- Modal de edición -->
      <EditItemModal
        v-if="showEditModal"
        :item="item"
        @close="closeEditModal"
        @item-updated="handleItemUpdated"
      />

      <div v-else-if="!item" class="text-center py-8">
        <p class="text-gray-500">No se encontró el artículo</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { watch } from 'vue'
import { MessageForm } from '@/features/messages/components'
import { EditItemModal } from '@/features/items/components'
import { useItemDetail } from '../composables/useItemDetail'

// Props
const props = defineProps({
  id: {
    type: String,
    required: true
  }
})

// Usar el composable para toda la lógica del detalle del artículo
const {
  // Estado
  item,
  loading,
  error,
  currentImageIndex,
  showContactForm,
  showEditModal,
  
  // Computed
  isOwner,
  itemImages,
  
  // Métodos de datos
  getItemImages,
  formatDate,
  
  // Métodos de navegación de imágenes
  nextImage,
  prevImage: previousImage,
  
  // Manejadores de modales
  closeContactForm,
  closeEditModal,
  handleItemUpdated,
  openContactForm,
  openEditModal,
  
  // Utilidades
  translateCategory,
  translateCondition
} = useItemDetail(props.id)

// Métodos adicionales que no están en el composable
const handleImageError = (event) => {
  console.error('Error loading image:', event);
  // Mostrar imagen por defecto cuando falla la carga
  const target = event.target as HTMLImageElement;
  target.src = '/default-item.png';
  target.alt = 'Imagen no disponible';
}

const handleMainAction = () => {
  if (isOwner.value) {
    openEditModal();
  } else {
    openContactForm();
  }
};

const shareItem = () => {
  if (navigator.share && item.value) {
    navigator.share({
      title: item.value.title,
      text: item.value.description,
      url: window.location.href
    });
  } else {
    // Fallback: copiar URL al portapapeles
    navigator.clipboard.writeText(window.location.href);
    // Aquí podrías mostrar una notificación
  }
};

const handleMessageSent = () => {
  closeContactForm();
  // Aquí podrías mostrar una notificación de éxito
};

// Precargar imágenes para mejorar la experiencia del carrusel
const preloadImages = () => {
  if (itemImages.value && itemImages.value.length > 1) {
    itemImages.value.forEach((imageUrl, index) => {
      if (index !== currentImageIndex.value) {
        const img = new Image();
        img.src = imageUrl;
      }
    });
  }
};

// Precargar imágenes cuando cambie el artículo
watch(itemImages, () => {
  preloadImages();
}, { immediate: true });
</script>

<style scoped>
@import '@/assets/styles/item-detail-view.css';
</style>