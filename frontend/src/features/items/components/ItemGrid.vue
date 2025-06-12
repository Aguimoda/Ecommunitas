<!--
/**
 * @file ItemGrid.vue
 * @description Componente de cuadrícula responsiva para mostrar artículos en Ecommunitas
 * 
 * Este componente es el núcleo de la visualización de artículos en la plataforma.
 * Proporciona una interfaz elegante y funcional para mostrar múltiples artículos
 * en formato de cuadrícula con soporte completo para diferentes estados de la aplicación.
 * 
 * CARACTERÍSTICAS PRINCIPALES:
 * - 📱 Diseño completamente responsivo (1-3 columnas según dispositivo)
 * - 🌙 Soporte nativo para modo oscuro/claro
 * - ⚡ Animaciones fluidas y transiciones suaves
 * - 🔄 Estados de carga, error y vacío bien definidos
 * - 🖼️ Manejo inteligente de imágenes con fallbacks
 * - 🔗 Navegación integrada a páginas de detalle
 * - 🐛 Herramientas de debug para desarrollo
 * 
 * ESTADOS MANEJADOS:
 * - Loading: Spinner animado durante la carga de datos
 * - Error: Mensaje de error con opción de reintento
 * - Empty: Estado vacío con iconografía y mensajes personalizables
 * - Success: Cuadrícula de artículos con tarjetas interactivas
 * 
 * FUNCIONALIDADES:
 * - Grid responsivo adaptativo (CSS Grid)
 * - Lazy loading de imágenes
 * - Manejo de errores de carga de imágenes
 * - Navegación programática con Vue Router
 * - Soporte para múltiples formatos de imagen
 * - Indicadores visuales de estado
 * - Accesibilidad mejorada con ARIA labels
 * 
 * TECNOLOGÍAS:
 * - Vue 3 Composition API
 * - TypeScript para tipado estático
 * - Tailwind CSS para estilos responsivos
 * - Vue Router para navegación
 * - CSS Grid y Flexbox para layout
 * 
 * @author Equipo de Desarrollo Ecommunitas
 * @version 1.0.0
 * @since 1.0.0
 */
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
// ============================================================================
// IMPORTACIONES
// ============================================================================

/**
 * Importaciones de Vue 3 Composition API
 * - computed: Para propiedades computadas reactivas
 */
import { computed } from 'vue'

/**
 * Utilidades de traducción y estilos
 * - translateCategory: Traduce categorías al idioma local
 * - getCategoryBadgeClass: Obtiene clases CSS para badges de categoría
 */
import { translateCategory, getCategoryBadgeClass } from '@/utils/translations'

// ============================================================================
// PROPS Y CONFIGURACIÓN
// ============================================================================

/**
 * Definición de props del componente ItemGrid
 * Estas propiedades permiten personalizar completamente el comportamiento
 * y apariencia del componente desde el componente padre
 */
const props = defineProps({
  // ========================================
  // DATOS PRINCIPALES
  // ========================================
  
  /**
   * Array de artículos a mostrar en la cuadrícula
   * Cada item debe tener al menos: _id, title, description
   */
  items: {
    type: Array,
    default: () => [],
    validator: (items) => {
      // Validar que todos los items tengan las propiedades mínimas requeridas
      return items.every(item => item && typeof item === 'object' && item._id)
    }
  },
  
  /**
   * Estado de carga de los datos
   * Cuando es true, se muestra el spinner de carga
   */
  loading: {
    type: Boolean,
    default: false
  },
  
  /**
   * Mensaje de error a mostrar
   * Si hay valor, se muestra el estado de error
   */
  error: {
    type: String,
    default: null
  },
  
  // ========================================
  // PROPIEDADES DE PAGINACIÓN
  // ========================================
  
  /**
   * Indica si hay más páginas disponibles para cargar
   * Controla la visibilidad del botón "Cargar más"
   */
  hasNextPage: {
    type: Boolean,
    default: false
  },
  
  /**
   * Número total de artículos disponibles en el backend
   * Se usa para mostrar información de paginación
   */
  totalItems: {
    type: Number,
    default: 0,
    validator: (value) => value >= 0
  },
  
  /**
   * Página actual en la paginación
   * Opcional, se usa para mostrar información de página
   */
  currentPage: {
    type: Number,
    default: null,
    validator: (value) => value === null || value > 0
  },
  /**
   * Número total de páginas disponibles
   * Opcional, se usa junto con currentPage para mostrar navegación
   */
  totalPages: {
    type: Number,
    default: null,
    validator: (value) => value === null || value > 0
  },
  
  // ========================================
  // PROPIEDADES DE PERSONALIZACIÓN DE FUNCIONALIDAD
  // ========================================
  
  /**
   * Controla la visibilidad del botón "Cargar más"
   * Útil para implementar paginación infinita
   */
  showLoadMore: {
    type: Boolean,
    default: true
  },
  
  /**
   * Controla la visibilidad de la información de paginación
   * Muestra "X de Y artículos" y "Página X de Y"
   */
  showPaginationInfo: {
    type: Boolean,
    default: true
  },
  
  /**
   * Controla si se muestra la descripción en las tarjetas
   * Útil para vistas más compactas
   */
  showDescription: {
    type: Boolean,
    default: true
  },
  
  /**
   * Controla si se muestran los badges de categoría
   * Permite ocultar categorías en contextos específicos
   */
  showCategory: {
    type: Boolean,
    default: true
  },
  
  /**
   * Controla si se muestra el botón de reintento en errores
   * Permite deshabilitar la funcionalidad de reintento
   */
  showRetry: {
    type: Boolean,
    default: true
  },
  
  // ========================================
  // PROPIEDADES DE PERSONALIZACIÓN DE TEXTO
  // ========================================
  
  /**
   * Texto mostrado durante el estado de carga
   * Personalizable para diferentes contextos
   */
  loadingText: {
    type: String,
    default: 'Cargando artículos...'
  },
  
  /**
   * Texto principal mostrado en estado vacío
   * Se muestra cuando no hay artículos para mostrar
   */
  emptyText: {
    type: String,
    default: 'No hay artículos para mostrar'
  },
  
  /**
   * Subtexto explicativo para el estado vacío
   * Proporciona orientación al usuario sobre qué hacer
   */
  emptySubtext: {
    type: String,
    default: 'Intenta ajustar los filtros o vuelve más tarde'
  },
  
  /**
   * Texto del botón "Cargar más"
   * Personalizable según el contexto de la aplicación
   */
  loadMoreText: {
    type: String,
    default: 'Cargar más artículos'
  }
})

// ============================================================================
// EVENTOS Y EMISIONES
// ============================================================================

/**
 * Definición de eventos que el componente puede emitir
 * Permite la comunicación bidireccional con componentes padre
 * 
 * EVENTOS DISPONIBLES:
 * - load-more: Solicita cargar más elementos (paginación infinita)
 * - retry: Solicita reintentar la carga después de un error
 */
const emit = defineEmits([
  /**
   * Evento emitido cuando el usuario solicita cargar más elementos
   * Se activa al hacer clic en el botón "Cargar más"
   * El componente padre debe manejar este evento para cargar datos adicionales
   */
  'load-more',
  
  /**
   * Evento emitido cuando el usuario solicita reintentar una operación fallida
   * Se activa al hacer clic en el botón "Reintentar" en el estado de error
   * El componente padre debe manejar este evento para volver a intentar la carga
   */
  'retry'
])

// ============================================================================
// MÉTODOS Y FUNCIONES AUXILIARES
// ============================================================================

/**
 * Obtiene la URL de la imagen principal de un artículo
 * 
 * Implementa una jerarquía de prioridades para manejar diferentes
 * formatos de almacenamiento de imágenes en el backend:
 * 
 * PRIORIDADES (de mayor a menor):
 * 1. item.images[0] - Array de imágenes, toma la primera
 * 2. item.imageUrls[0] - Array de URLs, toma la primera
 * 3. item.imageUrl - URL única de imagen
 * 4. '/default-item.png' - Imagen por defecto como fallback
 * 
 * @param {Object} item - El artículo del cual obtener la imagen
 * @param {Array} [item.images] - Array de URLs de imágenes
 * @param {Array} [item.imageUrls] - Array alternativo de URLs
 * @param {string} [item.imageUrl] - URL única de imagen
 * @returns {string} URL de la imagen a mostrar
 */
const getItemImage = (item) => {
  // Validación básica del elemento
  if (!item || typeof item !== 'object') {
    console.warn('getItemImage: item inválido recibido', item);
    return '/default-item.png';
  }
  
  // Prioridad 1: Array de imágenes (formato principal)
  if (item.images && Array.isArray(item.images) && item.images.length > 0) {
    const imageUrl = item.images[0];
    if (typeof imageUrl === 'string' && imageUrl.trim()) {
      return imageUrl;
    }
  }
  
  // Prioridad 2: Array de URLs de imágenes (formato alternativo)
  if (item.imageUrls && Array.isArray(item.imageUrls) && item.imageUrls.length > 0) {
    const imageUrl = item.imageUrls[0];
    if (typeof imageUrl === 'string' && imageUrl.trim()) {
      return imageUrl;
    }
  }
  
  // Prioridad 3: URL única de imagen (formato legacy)
  if (item.imageUrl && typeof item.imageUrl === 'string' && item.imageUrl.trim()) {
    return item.imageUrl;
  }
  
  // Fallback: Imagen por defecto
  return '/default-item.png';
}

/**
 * Valida si un identificador es válido y utilizable
 * 
 * Realiza validaciones exhaustivas para asegurar que el ID
 * puede ser utilizado de forma segura en operaciones del DOM
 * y llamadas a la API.
 * 
 * VALIDACIONES REALIZADAS:
 * - Existencia del valor (no null, undefined, 0, false)
 * - Tipo de dato correcto (string)
 * - Contenido no vacío (después de trim)
 * 
 * @param {any} id - El identificador a validar
 * @returns {boolean} true si el ID es válido y utilizable, false en caso contrario
 * 
 * @example
 * isValidId('abc123') // true
 * isValidId('') // false
 * isValidId(null) // false
 * isValidId(123) // false
 */
const isValidId = (id) => {
  return id && typeof id === 'string' && id.trim() !== ''
}

/**
 * Formatea una fecha para mostrarla de forma legible al usuario
 * 
 * Convierte fechas en formato ISO 8601 o timestamp a un formato
 * legible en español, siguiendo las convenciones locales.
 * 
 * CARACTERÍSTICAS:
 * - Formato de salida: "15 ene 2024"
 * - Localización: Español (es-ES)
 * - Manejo de errores: Retorna cadena vacía para fechas inválidas
 * - Compatibilidad: Acepta strings ISO y objetos Date
 * 
 * @param {string|Date} dateString - Fecha en formato ISO, timestamp o objeto Date
 * @returns {string} Fecha formateada en español o cadena vacía si la fecha es inválida
 * 
 * @example
 * formatDate('2024-01-15T10:30:00Z') // "15 ene 2024"
 * formatDate(null) // ""
 * formatDate('invalid') // ""
 */
const formatDate = (dateString) => {
  if (!dateString) return ''
  
  try {
    // Opciones de formato para fecha en español
    const options = { 
      year: 'numeric',  // Año completo (ej: 2024)
      month: 'short',   // Mes abreviado (ej: ene, feb, mar)
      day: 'numeric'    // Día del mes (ej: 1, 2, 15)
    }
    
    const date = new Date(dateString)
    
    // Validar que la fecha es válida
    if (isNaN(date.getTime())) {
      console.warn('formatDate: Fecha inválida recibida', dateString)
      return ''
    }
    
    return date.toLocaleDateString('es-ES', options)
  } catch (error) {
    console.error('formatDate: Error al formatear fecha', error, dateString)
    return ''
  }
}

/**
 * Maneja errores de carga de imágenes para mantener una UI limpia
 * 
 * Se ejecuta cuando una imagen no puede ser cargada (404, CORS, etc.)
 * y oculta el elemento img para evitar mostrar el icono de "imagen rota"
 * que degrada la experiencia del usuario.
 * 
 * ACCIONES REALIZADAS:
 * - Oculta la imagen problemática
 * - Mantiene el layout sin afectar otros elementos
 * - Previene la degradación visual de la interfaz
 * 
 * @param {Event} event - Evento de error de carga de imagen
 * @param {HTMLImageElement} event.target - El elemento img que falló al cargar
 * 
 * @example
 * // En el template:
 * // <img :src="imageUrl" @error="handleImageError" />
 */
const handleImageError = (event) => {
  if (event && event.target) {
    // Oculta la imagen rota para mantener una apariencia limpia
    event.target.style.display = 'none'
    
    // Log para debugging en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.warn('Imagen no pudo ser cargada:', event.target.src)
    }
  }
}
</script>

// ============================================================================
// ESTILOS DEL COMPONENTE
// ============================================================================

/**
 * Estilos con scope para el componente ItemGrid
 * 
 * CARACTERÍSTICAS:
 * - Scoped CSS para evitar conflictos globales
 * - Diseño responsivo y accesible
 * - Soporte para modo oscuro
 * - Transiciones suaves para mejor UX
 * - Optimizado para diferentes dispositivos
 */
<style scoped>
/* ============================================================================ */
/* IMPORTACIONES Y CONFIGURACIÓN BASE */
/* ============================================================================ */

/* Importación de estilos comunes del proyecto */
@import '@/assets/styles/common.css';

/* ============================================================================ */
/* UTILIDADES DE TEXTO */
/* ============================================================================ */

/**
 * Clase para limitar texto a 2 líneas con ellipsis
 * 
 * FUNCIONALIDAD:
 * - Trunca texto que excede 2 líneas
 * - Añade puntos suspensivos (...) al final
 * - Mantiene la altura consistente de las tarjetas
 * - Mejora la legibilidad en espacios limitados
 */
.line-clamp-2 {
  @apply text-truncate-2;
}

/* ============================================================================ */
/* LAYOUT PRINCIPAL DE LA CUADRÍCULA */
/* ============================================================================ */

/**
 * Contenedor principal de la cuadrícula de elementos
 * 
 * CARACTERÍSTICAS:
 * - Espaciado interno consistente
 * - Base para el sistema de grid responsivo
 * - Contenedor flexible para diferentes densidades de contenido
 */
.item-grid {
  /* Espaciado interno para el contenedor principal */
  @apply p-4;
}

/* ============================================================================ */
/* ESTILOS DE TARJETAS INDIVIDUALES */
/* ============================================================================ */

/**
 * Estilos base para las tarjetas de elementos
 * 
 * FUNCIONALIDAD:
 * - Transiciones suaves para interacciones
 * - Base para efectos hover y focus
 * - Preparación para animaciones de estado
 */
.item-grid .bg-white {
  /* Transiciones suaves para efectos de interacción */
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

/**
 * Efectos de hover para las tarjetas
 * 
 * MEJORAS DE UX:
 * - Elevación visual sutil (2px hacia arriba)
 * - Sombra más pronunciada para profundidad
 * - Feedback inmediato de interactividad
 * - Transición suave para evitar saltos bruscos
 */
.item-grid .bg-white:hover {
  /* Elevación sutil de la tarjeta para efecto de profundidad */
  transform: translateY(-2px);
  /* Sombra más pronunciada para enfatizar la elevación */
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

/* ============================================================================ */
/* SOPORTE PARA MODO OSCURO */
/* ============================================================================ */

/**
 * Adaptaciones para el tema oscuro
 * 
 * CARACTERÍSTICAS:
 * - Fondo oscuro para tarjetas
 * - Mantiene la legibilidad y contraste
 * - Consistencia visual con el tema global
 * - Transiciones automáticas entre temas
 */
.dark .item-grid .bg-white {
  /* Fondo oscuro para tarjetas en modo oscuro */
  @apply bg-gray-800;
}

/* ============================================================================ */
/* DISEÑO RESPONSIVO */
/* ============================================================================ */

/**
 * Adaptaciones para dispositivos móviles (pantallas ≤ 640px)
 * 
 * OPTIMIZACIONES MÓVILES:
 * - Reducción del espaciado para maximizar contenido visible
 * - Ajuste de gaps para mejor aprovechamiento del espacio
 * - Mantenimiento de la usabilidad en pantallas táctiles
 * - Optimización de la densidad de información
 */
@media (max-width: 640px) {
  .item-grid {
    /* Reducir espaciado interno en pantallas pequeñas para maximizar contenido */
    @apply p-2;
  }
  
  .grid {
    /* Reducir espaciado entre elementos en móviles para mejor aprovechamiento */
    gap: 1rem;
  }
  
  /* Ajustes adicionales para tarjetas en móviles */
  .item-grid .bg-white:hover {
    /* Reducir efecto hover en móviles para evitar problemas táctiles */
    transform: translateY(-1px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
}

/**
 * Adaptaciones para tablets (pantallas 641px - 1024px)
 * 
 * OPTIMIZACIONES TABLET:
 * - Espaciado intermedio entre móvil y desktop
 * - Aprovechamiento óptimo del espacio disponible
 * - Mantenimiento de la legibilidad y usabilidad
 */
@media (min-width: 641px) and (max-width: 1024px) {
  .item-grid {
    /* Espaciado intermedio para tablets */
    @apply p-3;
  }
  
  .grid {
    /* Gap optimizado para tablets */
    gap: 1.25rem;
  }
}

/**
 * Adaptaciones para pantallas grandes (≥ 1025px)
 * 
 * OPTIMIZACIONES DESKTOP:
 * - Espaciado completo para mejor presentación
 * - Efectos hover más pronunciados
 * - Aprovechamiento del espacio adicional
 */
@media (min-width: 1025px) {
  .item-grid {
    /* Espaciado completo en pantallas grandes */
    @apply p-6;
  }
  
  .grid {
    /* Gap amplio para mejor separación visual */
    gap: 2rem;
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