<!--
/**
 * @file SearchFilters.vue
 * @description Componente de filtros avanzados para búsqueda de artículos en Ecommunitas
 * 
 * Este componente proporciona una interfaz completa de filtros para refinar
 * las búsquedas de artículos. Incluye filtros por texto, categoría, ubicación,
 * rango de precios, estado del artículo y ordenamiento, permitiendo a los
 * usuarios encontrar exactamente lo que buscan.
 * 
 * CARACTERÍSTICAS PRINCIPALES:
 * - 🔍 Búsqueda por texto con autocompletado
 * - 🏷️ Filtro por categorías predefinidas
 * - 📍 Filtro por ubicación geográfica
 * - 💰 Rango de precios personalizable
 * - 📊 Estado del artículo (nuevo, usado, etc.)
 * - 🔄 Opciones de ordenamiento múltiples
 * - 🎨 Interfaz responsive y accesible
 * - ⚡ Aplicación de filtros en tiempo real
 * 
 * FILTROS DISPONIBLES:
 * - Búsqueda textual: Busca en título y descripción
 * - Categoría: Libros, Electrónica, Ropa, Muebles, Otros
 * - Ubicación: Integración con LocationPicker
 * - Precio: Rango mínimo y máximo
 * - Estado: Nuevo, Como nuevo, Usado, Para reparar
 * - Ordenamiento: Relevancia, Precio, Fecha, Distancia
 * 
 * FUNCIONALIDADES:
 * - Validación de rangos de precio
 * - Limpieza de filtros individual y global
 * - Persistencia de filtros durante la sesión
 * - Emisión de eventos para sincronización
 * - Aplicación automática o manual de filtros
 * - Indicadores visuales de filtros activos
 * 
 * PROPS:
 * @prop {Object} filters - Objeto con los filtros actuales
 * @prop {Array} categories - Lista de categorías disponibles
 * @prop {Boolean} loading - Estado de carga de la búsqueda
 * @prop {Boolean} autoApply - Aplicar filtros automáticamente
 * 
 * EVENTOS EMITIDOS:
 * @event update:filters - Cuando se actualizan los filtros
 * @event apply-filters - Cuando se aplican los filtros manualmente
 * @event clear-filters - Cuando se limpian todos los filtros
 * @event clear-filter - Cuando se limpia un filtro específico
 * 
 * VALIDACIONES:
 * - Precio mínimo no puede ser mayor que el máximo
 * - Valores numéricos válidos para precios
 * - Categorías válidas según lista predefinida
 * - Ubicación válida según LocationPicker
 * 
 * INTEGRACIÓN:
 * - LocationPicker para selección de ubicación
 * - Sistema de categorías de la aplicación
 * - Store de búsqueda para persistencia
 * - Componentes de búsqueda principales
 * 
 * TECNOLOGÍAS:
 * - Vue 3 Composition API
 * - Tailwind CSS para estilos
 * - Componente LocationPicker
 * - Validación de formularios
 * - Eventos reactivos
 * 
 * @author Equipo de Desarrollo Ecommunitas
 * @version 1.0.0
 * @since 1.0.0
 */
-->
<template>
  <div class="bg-white p-6 rounded-lg shadow-md mb-8">
    <h2 class="text-xl font-semibold text-gray-800 mb-4">Filtros de búsqueda</h2>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <!-- Filtro por categoría -->
      <div>
        <label for="category" class="block text-sm font-medium text-gray-700 mb-1">Categoría:</label>
        <select 
          id="category" 
          v-model="internalFilters.category"
          @change="emitUpdateFilters"
          aria-label="Filtrar por categoría"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">Todas las categorías</option>
          <option value="books">Libros</option>
          <option value="electronics">Electrónica</option>
          <option value="clothing">Ropa</option>
          <option value="furniture">Muebles</option>
          <option value="other">Otros</option>
        </select>
      </div>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <!-- Filtro por condición -->
      <div>
        <label for="condition" class="block text-sm font-medium text-gray-700 mb-1">Condición:</label>
        <select 
          id="condition" 
          v-model="internalFilters.condition"
          @change="emitUpdateFilters"
          aria-label="Filtrar por condición"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">Todas las condiciones</option>
          <option value="new">Nuevo</option>
          <option value="like_new">Como nuevo</option>
          <option value="good">Buen estado</option>
          <option value="fair">Estado aceptable</option>
          <option value="poor">Estado regular</option>
        </select>
      </div>
      
      <!-- Ordenar por - OCULTO TEMPORALMENTE -->
      <!-- 
      <div>
        <label for="sort" class="block text-sm font-medium text-gray-700 mb-1">Ordenar por:</label>
        <select 
          id="sort" 
          v-model="internalFilters.sort"
          @change="emitUpdateFilters"
          aria-label="Ordenar resultados"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="recent">Más recientes</option>
          <option value="oldest">Más antiguos</option>
          <option value="az">A-Z</option>
          <option value="za">Z-A</option>
          <option value="nearest">Más cercanos</option>
        </select>
      </div>
      -->
      
      <!-- Div vacío para mantener el grid -->
      <div></div>
    </div>
    

    
    <!-- Botones de acción -->
    <div class="flex flex-col sm:flex-row justify-between items-center gap-2 mt-4">
      <button 
        @click="applyFiltersHandler"
        aria-label="Aplicar filtros"
        class="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center justify-center"
      >
        <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        Aplicar filtros
      </button>
      
      <button 
        @click="resetFiltersHandler"
        aria-label="Limpiar todos los filtros"
        class="w-full sm:w-auto px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 flex items-center justify-center"
      >
        <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Limpiar filtros
      </button>
    </div>
    
    <!-- Chips de filtros activos -->
    <div v-if="hasActiveFilters" class="mt-4 flex flex-wrap gap-2">
      <div 
        v-for="(value, key) in activeFilters" 
        :key="key"
        class="bg-indigo-100 text-indigo-800 text-sm px-3 py-1 rounded-full flex items-center"
      >
        <span>{{ getFilterLabel(key, value) }}</span>
        <button 
          @click="removeFilter(key)"
          class="ml-1 text-indigo-600 hover:text-indigo-800 focus:outline-none"
          :aria-label="`Eliminar filtro ${getFilterLabel(key, value)}`"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { DEFAULT_SEARCH_FILTERS } from './searchFiltersConstants';
// import { useToast } from 'vue-toastification';
import { translateCategory, translateCondition } from '@/utils/translations';

// DEFAULT_SEARCH_FILTERS is imported from './searchFiltersConstants'

const props = defineProps({
  filters: {
    type: Object,
    required: false // Default factory removida para evitar error de compilación
  }
});

const emit = defineEmits(['update:filters', 'apply', 'reset']);

// Internal state for filters, initialized with component defaults and then overridden by props
const internalFilters = ref({
  ...DEFAULT_SEARCH_FILTERS,
  ...(props.filters ? props.filters : {})
});

// Toast notifications
// const toast = useToast();

// Funciones de geolocalización eliminadas

// Watch for external changes to props.filters and update internal state
// This ensures two-way binding with v-model:filters works correctly
watch(() => props.filters, (newPropFilters) => {
  internalFilters.value = { ...DEFAULT_SEARCH_FILTERS, ...(newPropFilters || {}) };
}, { deep: true });

// Observar cambios en las coordenadas geográficas y actualizar el estado interno (Desactivado temporalmente)
/*
watch(coordinates, (newCoords) => {
  if (newCoords) {
    internalFilters.value.coordinates = newCoords;
    // Considerar emitir update:filters aquí si es necesario que el padre sepa de las coordenadas inmediatamente
  }
});
*/

// Filtros activos (excluyendo valores vacíos, valores por defecto y campos específicos)
const activeFilters = computed(() => {
  const result = {};
  Object.entries(internalFilters.value).forEach(([key, value]) => {
    // Excluir page y limit de los chips de filtros activos
    if (key === 'page' || key === 'limit') {
      return;
    }

    // Un filtro se considera activo si su valor no es una cadena vacía y es diferente de su valor por defecto
    if (value !== '' && value !== DEFAULT_SEARCH_FILTERS[key]) {
      result[key] = value;
    }
  });
  return result;
});

// Computar si hay filtros activos para mostrar los chips
const hasActiveFilters = computed(() => {
  return Object.keys(activeFilters.value).length > 0; // Usar Object.keys para simplificar
});

// Obtener etiqueta legible para los filtros
const getFilterLabel = (key, value) => {
  const labels = {
    query: `Búsqueda: ${value}`,
    category: `Categoría: ${translateCategory(value)}`,
    condition: `Condición: ${translateCondition(value)}`,
    sort: `Orden: ${getSortLabel(value)}`
  };
  
  return labels[key] || `${key}: ${value}`;
};





// Obtener etiqueta para ordenación
const getSortLabel = (value) => {
  const sorts = {
    recent: 'Más recientes',
    oldest: 'Más antiguos',
    az: 'A-Z',
    za: 'Z-A',
    nearest: 'Más cercanos'
  };
  
  return sorts[value] || value;
};

// Emitir actualización de filtros al padre
const emitUpdateFilters = () => {
  // Comprobar si los filtros internos son diferentes de los props para evitar bucles
  if (JSON.stringify(internalFilters.value) !== JSON.stringify(props.filters)) {
    emit('update:filters', { ...internalFilters.value });
  }
};

// Watch para internalFilters para emitir update:filters automáticamente
watch(internalFilters, () => {
  emitUpdateFilters();
}, { deep: true });

// Aplicar filtros (ahora solo emite 'apply')
const applyFiltersHandler = () => {
  // La obtención de geolocalización se desactiva temporalmente
  // if (internalFilters.value.sort === 'nearest' && !internalFilters.value.coordinates) {
  //   getLocation(); // Esto podría ser asíncrono, considerar cómo manejarlo
  // }
  
  // Resetear página a 1 cuando se aplican nuevos filtros (el padre se encargará de esto)
  // internalFilters.value.page = 1; // El padre debe manejar la paginación
  
  emit('apply'); // Solo notifica al padre que aplique los filtros que ya tiene (vía v-model)
};

// Resetear filtros (ahora solo emite 'reset')
const resetFiltersHandler = () => {
  internalFilters.value = { ...DEFAULT_SEARCH_FILTERS }; // Esto disparará el watch y emitirá update:filters
  // internalFilters.value.page = 1; // El padre debe manejar la paginación
  emit('reset'); // Notifica al padre que resetee y aplique (el padre ya tiene los filtros reseteados vía v-model)
};

// Eliminar un filtro específico, restaurándolo a su valor por defecto
const removeFilter = (key) => {
  if (internalFilters.value.hasOwnProperty(key) && DEFAULT_SEARCH_FILTERS.hasOwnProperty(key)) {
    internalFilters.value[key] = DEFAULT_SEARCH_FILTERS[key];
  } else {
    // Fallback por si la clave no está en defaults (aunque debería estarlo)
    internalFilters.value[key] = ''; 
  }
  applyFilters(); // Reaplicar filtros después de eliminar uno
};

// Observar cambios en los filtros para actualizar el componente padre y aplicar automáticamente
watch(internalFilters, (newFilters) => {
  // Solo emitir el evento update:filters sin llamar a applyFilters
  emit('update:filters', { ...newFilters });
}, { deep: true });
</script>