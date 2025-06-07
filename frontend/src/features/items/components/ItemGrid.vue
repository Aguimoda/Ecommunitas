<!--
  @file ItemGrid.vue
  @description Componente de cuadrícula para mostrar elementos/artículos
  
  Este componente es responsable de renderizar una cuadrícula de elementos con diferentes estados:
  - Estado de carga con spinner animado
  - Estado de error con opción de reintento
  - Estado vacío con mensaje personalizable
  - Cuadrícula de elementos con tarjetas interactivas
  
  Características principales:
  - Diseño responsivo (1 columna en móvil, 2 en tablet, 3 en desktop)
  - Soporte para modo oscuro
  - Animaciones de hover y transiciones suaves
  - Información de debug opcional para desarrollo
  - Manejo de estados de carga, error y vacío
  - Enlaces a páginas de detalle de elementos
  
  @author Equipo de Desarrollo
  @version 1.0.0
-->
<template>
  <!-- Contenedor principal de la cuadrícula de elementos -->
  <div class="item-grid">
    <!-- Información de debug (solo para desarrollo) -->
    <!-- Esta sección ayuda a los desarrolladores a diagnosticar problemas con los datos -->
    <div v-if="false" class="debug-info bg-yellow-100 p-2 mb-4 text-xs">
      <p>Loading: {{ loading }}</p>
      <p>Error: {{ error }}</p>
      <p>Items: {{ items ? items.length : 'null' }}</p>
      <p>Items is Array: {{ Array.isArray(items) }}</p>
      <p>Items content: {{ JSON.stringify(items?.slice(0, 2)) }}</p>
    </div>

    <!-- Estado de carga -->
    <!-- Muestra un spinner animado mientras se cargan los datos -->
    <div v-if="loading" class="text-center py-8">
      <!-- Spinner de carga con animación CSS -->
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
      <!-- Texto de carga personalizable -->
      <p class="mt-4 text-sm text-gray-600 dark:text-gray-400">{{ loadingText }}</p>
    </div>

    <!-- Estado de error -->
    <!-- Se muestra cuando hay un error en la carga de datos -->
    <div v-else-if="error" class="text-center py-8 text-red-500 dark:text-red-400">
      <!-- Mensaje de error -->
      <p>{{ error }}</p>
      <!-- Botón de reintento (opcional) -->
      <button 
        v-if="showRetry"
        @click="$emit('retry')"
        class="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
      >
        Reintentar
      </button>
    </div>

    <!-- Estado vacío -->
    <!-- Se muestra cuando no hay elementos para mostrar -->
    <div v-else-if="(!items || !Array.isArray(items) || items.length === 0) && !loading" class="text-center py-8 text-gray-500 dark:text-gray-400">
      <!-- Icono SVG para estado vacío -->
      <div class="mb-4">
        <svg class="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2m0 0V9a2 2 0 012-2h2m0 0V6a2 2 0 012-2h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V9a2 2 0 012 2v2M6 13h2m0 0v2a2 2 0 002 2h2m0 0h2" />
        </svg>
      </div>
      <!-- Texto principal del estado vacío -->
      <p class="text-lg font-medium">{{ emptyText }}</p>
      <!-- Subtexto explicativo -->
      <p class="text-sm mt-2">{{ emptySubtext }}</p>
    </div>

    <!-- Cuadrícula de elementos -->
    <!-- Se muestra cuando hay elementos disponibles para mostrar -->
    <div v-else-if="items && Array.isArray(items) && items.length > 0">
      <!-- Grid responsivo: 1 columna en móvil, 2 en tablet, 3 en desktop -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Iteración sobre cada elemento -->
        <div 
          v-for="item in items" 
          :key="item._id"
          class="bg-white dark:bg-gray-700 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
        >
          <!-- Enlace a la página de detalle del elemento -->
          <router-link 
            v-if="item._id"
            :to="{ name: 'ItemDetailView', params: { id: item._id || 'unknown' } }"
            class="block"
          >
            <!-- Image section -->
            <div class="h-48 overflow-hidden relative">
              <img 
                v-if="getItemImage(item)" 
                :src="getItemImage(item)" 
                :alt="item.title"
                class="w-full h-full object-cover"
                @error="handleImageError"
              />
              <div v-else class="w-full h-48 bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                <svg class="h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              
              <!-- Availability badge -->
              <div class="absolute top-2 right-2">
                <span class="text-xs px-2 py-1 rounded-full font-medium" 
                  :class="{
                    'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100': item.available,
                    'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100': !item.available
                  }"
                >
                  {{ item.available ? 'Disponible' : 'No disponible' }}
                </span>
              </div>
            </div>

            <!-- Content section -->
            <div class="p-4">
              <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100 truncate mb-2">
                {{ item.title }}
              </h3>
              
              <p v-if="showDescription" class="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                {{ item.description }}
              </p>
              
              <div class="flex justify-between items-center text-sm">
                <span class="text-gray-500 dark:text-gray-300 truncate flex-1 mr-2">
                  <svg class="inline h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {{ item.location || 'Sin ubicación' }}
                </span>
                
                <span class="text-gray-400 dark:text-gray-500 text-xs">
                  {{ formatDate(item.createdAt) }}
                </span>
              </div>
              
              <div v-if="showCategory" class="mt-2">
                <span :class="getCategoryBadgeClass(item.category)">
                  {{ translateCategory(item.category) }}
                </span>
              </div>
            </div>
          </router-link>
          
          <!-- Error state for invalid item -->
          <div v-else class="p-4 text-red-500 text-center">
            <p class="text-sm">Error: ID no válido</p>
            <p class="text-xs text-gray-500 mt-1">{{ item._id }}</p>
          </div>
        </div>
      </div>

      <!-- Load more button -->
      <div v-if="showLoadMore && hasNextPage && !loading" class="text-center mt-8">
        <button 
          @click="$emit('load-more')"
          :disabled="loading"
          class="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          {{ loadMoreText }}
        </button>
      </div>

      <!-- Pagination info -->
      <div v-if="showPaginationInfo && totalItems > 0" class="text-center mt-6 text-sm text-gray-500 dark:text-gray-400">
        <p>Mostrando {{ items.length }} de {{ totalItems }} artículos</p>
        <p v-if="currentPage && totalPages" class="mt-1">
          Página {{ currentPage }} de {{ totalPages }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * Configuración del script del componente ItemGrid
 * Utiliza la Composition API de Vue 3 con <script setup>
 */
import { computed } from 'vue'
import { translateCategory, getCategoryBadgeClass } from '@/utils/translations'

/**
 * Definición de props del componente
 * Estas propiedades permiten personalizar el comportamiento y apariencia del componente
 */
const props = defineProps({
  // Datos principales
  items: {
    type: Array,
    default: () => [],
    // Array de elementos a mostrar en la cuadrícula
  },
  loading: {
    type: Boolean,
    default: false,
    // Indica si los datos se están cargando
  },
  error: {
    type: String,
    default: null,
    // Mensaje de error a mostrar si hay problemas
  },
  
  // Propiedades de paginación
  hasNextPage: {
    type: Boolean,
    default: false,
    // Indica si hay más páginas disponibles
  },
  totalItems: {
    type: Number,
    default: 0,
    // Número total de elementos disponibles
  },
  currentPage: {
    type: Number,
    default: null,
    // Página actual (opcional)
  },
  totalPages: {
    type: Number,
    default: null,
    // Número total de páginas (opcional)
  },
  
  // Propiedades de personalización de funcionalidad
  showLoadMore: {
    type: Boolean,
    default: true,
    // Controla si se muestra el botón "Cargar más"
  },
  showPaginationInfo: {
    type: Boolean,
    default: true,
    // Controla si se muestra la información de paginación
  },
  showDescription: {
    type: Boolean,
    default: true,
    // Controla si se muestra la descripción de los elementos
  },
  showCategory: {
    type: Boolean,
    default: true,
    // Controla si se muestra la categoría de los elementos
  },
  showRetry: {
    type: Boolean,
    default: true,
    // Controla si se muestra el botón de reintento en caso de error
  },
  
  // Propiedades de personalización de texto
  loadingText: {
    type: String,
    default: 'Cargando artículos...',
    // Texto personalizable para el estado de carga
  },
  emptyText: {
    type: String,
    default: 'No hay artículos para mostrar',
    // Texto principal para el estado vacío
  },
  emptySubtext: {
    type: String,
    default: 'Intenta ajustar los filtros o vuelve más tarde',
    // Subtexto explicativo para el estado vacío
  },
  loadMoreText: {
    type: String,
    default: 'Cargar más artículos',
    // Texto del botón "Cargar más"
  }
})

/**
 * Definición de eventos que el componente puede emitir
 * Permite la comunicación con componentes padre
 */
const emit = defineEmits([
  'load-more', // Se emite cuando el usuario hace clic en "Cargar más"
  'retry'      // Se emite cuando el usuario hace clic en "Reintentar"
])

/**
 * Métodos del componente
 * Funciones auxiliares para el procesamiento de datos y manejo de eventos
 */

/**
 * Obtiene la URL de la imagen principal de un elemento
 * Implementa una jerarquía de prioridades para diferentes formatos de imagen
 * @param {Object} item - El elemento del cual obtener la imagen
 * @returns {string} URL de la imagen o imagen por defecto
 */
const getItemImage = (item) => {
  // Validación básica del elemento
  if (!item) return '/default-item.png';
  
  // Jerarquía de prioridades para las imágenes:
  // 1. images[0] (array de imágenes, primera imagen)
  // 2. imageUrls[0] (array de URLs de imágenes, primera URL)
  // 3. imageUrl (URL única de imagen)
  // 4. imagen por defecto
  
  if (item.images && Array.isArray(item.images) && item.images.length > 0) {
    return item.images[0];
  }
  
  if (item.imageUrls && item.imageUrls.length > 0) {
    return item.imageUrls[0];
  }
  
  if (item.imageUrl) {
    return item.imageUrl;
  }
  
  return '/default-item.png';
}

/**
 * Valida si un ID es válido
 * Verifica que el ID sea una cadena no vacía
 * @param {any} id - El ID a validar
 * @returns {boolean} true si el ID es válido, false en caso contrario
 */
const isValidId = (id) => {
  return id && typeof id === 'string' && id.trim() !== ''
}

/**
 * Formatea una fecha para mostrarla de forma legible
 * Convierte una fecha ISO a formato español legible
 * @param {string} dateString - Fecha en formato ISO
 * @returns {string} Fecha formateada en español o cadena vacía si no hay fecha
 */
const formatDate = (dateString) => {
  if (!dateString) return ''
  
  // Opciones de formato para fecha en español
  const options = { 
    year: 'numeric',  // Año completo (ej: 2024)
    month: 'short',   // Mes abreviado (ej: ene, feb, mar)
    day: 'numeric'    // Día del mes (ej: 1, 2, 15)
  }
  
  return new Date(dateString).toLocaleDateString('es-ES', options)
}

/**
 * Maneja errores de carga de imágenes
 * Oculta las imágenes que no se pueden cargar para evitar iconos rotos
 * @param {Event} event - Evento de error de la imagen
 */
const handleImageError = (event) => {
  // Oculta la imagen rota para mantener una apariencia limpia
  event.target.style.display = 'none'
}
</script>

/**
 * Estilos del componente
 * Utiliza CSS con scope para evitar conflictos con otros componentes
 */
<style scoped>
/* Importación de estilos comunes del proyecto */
@import '@/assets/styles/common.css';

/**
 * Clase para limitar texto a 2 líneas
 * Implementa truncamiento de texto con puntos suspensivos
 */
.line-clamp-2 {
  @apply text-truncate-2;
}

/**
 * Estilos para la cuadrícula de elementos
 * Asegura un espaciado consistente y responsivo
 */
.item-grid {
  /* Espaciado interno para el contenedor principal */
  @apply p-4;
}

/**
 * Estilos para las tarjetas de elementos individuales
 * Mejora la interactividad y accesibilidad
 */
.item-grid .bg-white {
  /* Transición suave para efectos hover */
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

/**
 * Efecto hover para las tarjetas
 * Proporciona feedback visual al usuario
 */
.item-grid .bg-white:hover {
  /* Elevación sutil de la tarjeta */
  transform: translateY(-2px);
  /* Sombra más pronunciada */
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

/**
 * Estilos para modo oscuro
 * Mantiene la consistencia visual en diferentes temas
 */
.dark .item-grid .bg-white {
  /* Fondo oscuro para tarjetas en modo oscuro */
  @apply bg-gray-800;
}

/**
 * Estilos responsivos para diferentes tamaños de pantalla
 * Asegura una experiencia óptima en todos los dispositivos
 */
@media (max-width: 640px) {
  .item-grid {
    /* Reducir espaciado en pantallas pequeñas */
    @apply p-2;
  }
  
  .grid {
    /* Reducir espaciado entre elementos en móviles */
    gap: 1rem;
  }
}

/**
 * Estilos para elementos de carga y estados especiales
 * Mejora la experiencia del usuario durante las transiciones
 */
.animate-spin {
  /* Asegurar que la animación sea suave */
  animation: spin 1s linear infinite;
}

/**
 * Estilos para badges de disponibilidad
 * Proporciona indicadores visuales claros del estado
 */
.badge {
  /* Espaciado interno consistente */
  @apply px-2 py-1;
  /* Bordes redondeados */
  @apply rounded-full;
  /* Texto pequeño y legible */
  @apply text-xs font-medium;
}

/**
 * Estilos para botones de acción
 * Mantiene consistencia con el sistema de diseño
 */
.btn-primary {
  /* Colores del tema principal */
  @apply bg-indigo-600 hover:bg-indigo-700;
  /* Estados de focus para accesibilidad */
  @apply focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2;
  /* Transiciones suaves */
  @apply transition-colors duration-200;
}

/**
 * Estilos para información de paginación
 * Asegura legibilidad y jerarquía visual
 */
.pagination-info {
  /* Texto secundario */
  @apply text-sm text-gray-500;
  /* Centrado */
  @apply text-center;
  /* Espaciado superior */
  @apply mt-6;
}

/* Soporte para modo oscuro en información de paginación */
.dark .pagination-info {
  @apply text-gray-400;
}
</style>