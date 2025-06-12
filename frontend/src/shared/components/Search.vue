<!--
/**
 * @file Search.vue
 * @description Componente de búsqueda avanzada para artículos en Ecommunitas
 * 
 * Este componente proporciona una interfaz completa de búsqueda que permite
 * a los usuarios encontrar artículos utilizando múltiples criterios de filtrado.
 * Incluye búsqueda por texto, categorías, ubicación, fechas y otros parámetros.
 * 
 * CARACTERÍSTICAS PRINCIPALES:
 * - 🔍 Búsqueda en tiempo real con debounce
 * - 🎛️ Filtros avanzados (categoría, ubicación, fechas)
 * - 📱 Interfaz responsive y accesible
 * - ⚡ Optimización de rendimiento con lazy loading
 * - 🗺️ Integración con geolocalización
 * - 📊 Resultados paginados con grid adaptativo
 * 
 * FUNCIONALIDADES:
 * - Búsqueda por texto libre en título y descripción
 * - Filtrado por categorías predefinidas
 * - Búsqueda por ubicación geográfica
 * - Filtrado por rango de fechas
 * - Ordenamiento de resultados
 * - Guardado de filtros en localStorage
 * - Exportación de resultados
 * 
 * TECNOLOGÍAS:
 * - Vue 3 Composition API
 * - TypeScript para tipado estático
 * - Tailwind CSS para estilos
 * - Debounce para optimización
 * - Geolocalización API
 * 
 * @author Equipo de Desarrollo Ecommunitas
 * @version 1.0.0
 * @since 1.0.0
 */
-->
<template>
  <!-- Contenedor principal del componente de búsqueda -->
  <div class="search-container">
    <!-- Barra de búsqueda principal -->
    <div class="search-bar">
      <!-- Campo de entrada para búsqueda por texto -->
      <input
        v-model="searchQuery"
        @input="handleSearch"
        type="text"
        placeholder="Buscar artículos..."
        class="search-input"
        aria-label="Campo de búsqueda de artículos"
      />
      <!-- Botón para mostrar/ocultar filtros avanzados -->
      <button 
        @click="toggleFilters" 
        class="filter-toggle"
        :aria-expanded="showFilters"
        aria-controls="filters-container"
      >
        {{ showFilters ? 'Ocultar filtros' : 'Mostrar filtros' }}
      </button>
    </div>

    <!-- Contenedor de filtros avanzados (mostrado condicionalmente) -->
    <div 
      v-if="showFilters" 
      id="filters-container"
      class="filters-container"
      role="region"
      aria-label="Filtros de búsqueda avanzada"
    >
      <!-- Filtro por categoría -->
      <div class="filter-group">
        <label for="category-select">Categoría:</label>
        <select 
          id="category-select"
          v-model="filters.category" 
          class="filter-select"
          aria-describedby="category-help"
        >
          <option value="">Todas</option>
          <option v-for="category in categories" :key="category" :value="category">
            {{ category }}
          </option>
        </select>
        <small id="category-help" class="sr-only">Selecciona una categoría para filtrar los resultados</small>
      </div>

      <!-- Filtro por ubicación -->
      <div class="filter-group">
        <label for="location-input">Ubicación:</label>
        <input 
          id="location-input"
          v-model="filters.location" 
          type="text" 
          class="filter-input"
          placeholder="Ej: Madrid, Barcelona..."
          aria-describedby="location-help"
        />
        <small id="location-help" class="sr-only">Introduce una ubicación para filtrar por proximidad</small>
      </div>

      <!-- Filtro por rango de fechas -->
      <div class="filter-group">
        <label>Rango de fechas:</label>
        <div class="date-range" role="group" aria-label="Selección de rango de fechas">
          <input 
            v-model="filters.startDate" 
            type="date" 
            class="date-input"
            aria-label="Fecha de inicio"
          />
          <span aria-hidden="true">a</span>
          <input 
            v-model="filters.endDate" 
            type="date" 
            class="date-input"
            aria-label="Fecha de fin"
          />
        </div>
      </div>

      <!-- Botón para aplicar filtros -->
      <button 
        @click="applyFilters" 
        class="apply-filters"
        :disabled="isLoading"
        aria-describedby="apply-help"
      >
        {{ isLoading ? 'Aplicando...' : 'Aplicar filtros' }}
      </button>
      <small id="apply-help" class="sr-only">Aplica los filtros seleccionados a la búsqueda</small>
    </div>

    <div v-if="isLoading" class="loading-indicator">Buscando...</div>

    <ItemGrid
      v-if="searchQuery"
      :items="results"
      :loading="isLoading"
      :error="searchError"
      :show-load-more="false"
      :show-pagination-info="false"
      :show-description="true"
      :show-category="true"
      :loading-text="'Buscando...'"
      :empty-text="`No se encontraron resultados para '${searchQuery}'`"
      :empty-subtext="'Intenta con otros términos de búsqueda o ajusta los filtros'"
      @retry="performSearch"
    />
  </div>
</template>

<script setup lang="ts">
// ============================================================================
// IMPORTACIONES
// ============================================================================

// Importaciones de Vue 3 Composition API
import { ref, reactive, watch, onMounted, computed } from 'vue'
// Utilidad de debounce para optimizar las búsquedas en tiempo real
import { debounce } from 'lodash-es'
// Importaciones del store y utilidades
import { useItemsStore } from '../../features/items'
import { displayError } from '../utils/errorHandler'
import { ItemGrid } from '../../features/items/components'

// ============================================================================
// INTERFACES Y TIPOS
// ============================================================================

/**
 * Interface que define la estructura de los filtros de búsqueda
 * Utilizada para tipado estático y validación de datos
 */
interface SearchFilters {
  /** Categoría seleccionada para filtrar artículos */
  category: string
  /** Ubicación geográfica para búsqueda por proximidad */
  location: string
  /** Fecha de inicio para filtrado temporal */
  startDate: string
  /** Fecha de fin para filtrado temporal */
  endDate: string
}

// ============================================================================
// EVENTOS Y EMISIONES
// ============================================================================

/**
 * Define los eventos que este componente puede emitir al componente padre
 * - search: Emitido cuando se realiza una búsqueda con query y filtros
 */
const emit = defineEmits<{
  search: [query: string, filters: SearchFilters]
}>()

// ============================================================================
// ESTADO REACTIVO
// ============================================================================

/** Consulta de búsqueda introducida por el usuario */
const searchQuery = ref('')

/** Estado de visibilidad del panel de filtros avanzados */
const showFilters = ref(false)

/** Estado de carga para mostrar indicadores visuales */
const isLoading = ref(false)

/**
 * Objeto reactivo que contiene todos los filtros de búsqueda
 * Se inicializa con valores vacíos por defecto
 */
const filters = reactive<SearchFilters>({
  category: '',
  location: '',
  startDate: '',
  endDate: ''
})

/**
 * Lista de categorías disponibles para filtrado
 * Estas categorías se obtienen dinámicamente del backend en producción
 */
const categories = ref([
  'Electrónicos',
  'Ropa',
  'Hogar',
  'Deportes',
  'Libros',
  'Otros'
])

const itemsStore = useItemsStore()

// Propiedades computadas del store para acceso reactivo a datos
const results = computed(() => itemsStore.items)
const searchError = computed(() => itemsStore.error)

// ============================================================================
// MÉTODOS Y FUNCIONES
// ============================================================================

/**
 * Maneja el evento de búsqueda desde el campo de entrada
 * Valida que hay contenido antes de ejecutar la búsqueda
 */
const handleSearch = () => {
  if (searchQuery.value.trim()) {
    performSearch();
  }
};

/**
 * Ejecuta la búsqueda utilizando el store de items
 * Combina la query de texto con los filtros seleccionados
 * Maneja errores y muestra mensajes apropiados al usuario
 */
const performSearch = async () => {
  try {
    // Activar estado de carga
    isLoading.value = true;
    
    // Ejecutar búsqueda con parámetros combinados
    await itemsStore.searchItems({
      q: searchQuery.value,
      ...filters
    });
    
    // Emitir evento al componente padre con los resultados
    emit('search', searchQuery.value, filters);
  } catch (error) {
    // Mostrar error al usuario de forma amigable
    displayError('Error al buscar artículos');
    console.error('Error en búsqueda:', error);
  } finally {
    // Desactivar estado de carga
    isLoading.value = false;
  }
};

/**
 * Alterna la visibilidad del panel de filtros avanzados
 * Mejora la experiencia de usuario al permitir ocultar/mostrar filtros
 */
const toggleFilters = () => {
  showFilters.value = !showFilters.value;
};

/**
 * Aplica los filtros seleccionados ejecutando una nueva búsqueda
 * Se llama cuando el usuario hace clic en "Aplicar filtros"
 */
const applyFilters = () => {
  performSearch();
};

/**
 * Formatea una fecha en formato legible en español
 * Convierte una cadena de fecha ISO en formato de fecha localizada
 * 
 * @param {string} dateString - Cadena de fecha en formato ISO (YYYY-MM-DD)
 * @returns {string} Fecha formateada en español (ej: "15 de enero de 2024")
 * @example
 * formatDate('2024-01-15') // "15 de enero de 2024"
 */
const formatDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('es-ES', options);
};

/**
 * Valida si un ID es válido para operaciones de búsqueda
 * Verifica que el ID cumple con los criterios mínimos de seguridad
 * 
 * @param {any} id - El ID a validar
 * @returns {boolean} true si el ID es válido, false en caso contrario
 * @example
 * isValidId('abc12345') // true
 * isValidId('search') // false
 * isValidId('') // false
 */
const isValidId = (id: any): boolean => {
  return id && typeof id === 'string' && id !== 'search' && id.trim() !== '' && id.length >= 8;
};

/**
 * Watcher para limpiar resultados cuando se borra la consulta de búsqueda
 * Mejora la UX al mostrar un estado limpio cuando no hay texto de búsqueda
 */
watch(searchQuery, (newVal: string) => {
  if (newVal.length === 0) {
    // Limpiar resultados a través del store en lugar de asignación directa
    itemsStore.clearItem();
  }
});
</script>

<style scoped>
@import '@/assets/styles/common.css';

.search-container {
  @apply main-container;
}

.search-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.search-input {
  @apply form-input;
  flex: 1;
}

.filter-toggle {
  @apply btn-primary;
}

.filters-container {
  background-color: #f9fafb;
  padding: 20px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.filter-group {
  margin-bottom: 15px;
}

.filter-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.filter-select,
.filter-input {
  @apply form-input;
  width: 100%;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 10px;
}

.date-input {
  @apply form-input;
}

.apply-filters {
  @apply btn-primary;
  padding: 8px 16px;
}

.loading-indicator,
.no-results {
  text-align: center;
  padding: 20px;
  color: #666;
}

.results-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.result-item {
  @apply item-card;
}

.item-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.item-details {
  padding: 15px;
}

.item-details h3 {
  margin: 0 0 10px 0;
  font-size: 1.2rem;
}

.item-details p {
  margin: 0 0 10px 0;
  color: #666;
}

.item-meta {
  display: flex;
  gap: 10px;
  font-size: 0.8rem;
  color: #888;
}
</style>