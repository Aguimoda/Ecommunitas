<template>
  <div class="bg-white p-6 rounded-lg shadow-md mb-8">
    <h2 class="text-xl font-semibold text-gray-800 mb-4">Filtros de búsqueda</h2>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <!-- Búsqueda por texto -->
      <div>
        <label for="search" class="block text-sm font-medium text-gray-700 mb-1">Buscar:</label>
        <div class="relative">
          <input 
            type="text" 
            id="search" 
            v-model="internalFilters.query" 
            placeholder="Buscar artículos..."
            @keyup.enter="applyFilters"
            aria-label="Buscar artículos"
            autocomplete="off"
            class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>
      
      <!-- Filtro por categoría -->
      <div>
        <label for="category" class="block text-sm font-medium text-gray-700 mb-1">Categoría:</label>
        <select 
          id="category" 
          v-model="internalFilters.category"
          @change="applyFilters"
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
      
      <!-- Filtro por ubicación -->
      <div>
        <label for="location" class="block text-sm font-medium text-gray-700 mb-1">Ubicación:</label>
        <div class="relative">
          <input 
            type="text" 
            id="location" 
            v-model="internalFilters.location" 
            placeholder="Filtrar por ubicación"
            @keyup.enter="applyFilters"
            aria-label="Filtrar por ubicación"
            autocomplete="off"
            class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <!-- Filtro por condición -->
      <div>
        <label for="condition" class="block text-sm font-medium text-gray-700 mb-1">Condición:</label>
        <select 
          id="condition" 
          v-model="internalFilters.condition"
          @change="applyFilters"
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
      
      <!-- Filtro por radio de distancia -->
      <div>
        <label for="distance" class="block text-sm font-medium text-gray-700 mb-1">Radio de búsqueda:</label>
        <div class="flex items-center">
          <input 
            type="range" 
            id="distance" 
            v-model.number="internalFilters.distance" 
            @change="applyFilters"
            min="1" 
            max="50" 
            step="1"
            class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          >
          <span class="ml-2 text-sm text-gray-600 w-16">{{ internalFilters.distance }} km</span>
        </div>
      </div>
      
      <!-- Ordenar por -->
      <div>
        <label for="sort" class="block text-sm font-medium text-gray-700 mb-1">Ordenar por:</label>
        <select 
          id="sort" 
          v-model="internalFilters.sort"
          @change="applyFilters"
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
    </div>
    
    <!-- Botones de acción -->
    <div class="flex flex-col sm:flex-row justify-between items-center gap-2 mt-4">
      <button 
        @click="applyFilters"
        aria-label="Aplicar filtros"
        class="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center justify-center"
      >
        <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        Aplicar filtros
      </button>
      
      <button 
        @click="resetFilters"
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
import { useGeolocation } from '@/composables/useGeolocation';
import { componentDefaultFilters } from './searchFiltersConstants.js';

// componentDefaultFilters is imported from './searchFiltersConstants.js'

const props = defineProps({
  filters: {
    type: Object,
    required: false // Default factory removida para evitar error de compilación
  }
});

const emit = defineEmits(['update:filters', 'apply', 'reset']);

// Internal state for filters, initialized with component defaults and then overridden by props
const internalFilters = ref({
  ...componentDefaultFilters,
  ...(props.filters ? props.filters : {})
});

// Composable para obtener la geolocalización
const { coordinates, getLocation, loading: geoLoading, error: geoError } = useGeolocation();

// Watch for external changes to props.filters and update internal state
// This ensures two-way binding with v-model:filters works correctly
watch(() => props.filters, (newPropFilters) => {
  internalFilters.value = { ...componentDefaultFilters, ...(newPropFilters || {}) };
}, { deep: true });

// Observar cambios en las coordenadas geográficas y actualizar el estado interno
watch(coordinates, (newCoords) => {
  if (newCoords) {
    internalFilters.value.coordinates = newCoords;
  }
});

// Filtros activos (excluyendo valores vacíos, valores por defecto y campos específicos)
const activeFilters = computed(() => {
  const result = {};
  Object.entries(internalFilters.value).forEach(([key, value]) => {
    // Excluir coordenadas, page, y limit de los chips de filtros activos
    if (key === 'coordinates' || key === 'page' || key === 'limit') {
      return;
    }

    // Un filtro se considera activo si su valor no es una cadena vacía y es diferente de su valor por defecto
    if (value !== '' && value !== componentDefaultFilters[key]) {
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
    category: `Categoría: ${getCategoryLabel(value)}`,
    location: `Ubicación: ${value}`,
    condition: `Condición: ${getConditionLabel(value)}`,
    distance: `Radio: ${value} km`,
    sort: `Orden: ${getSortLabel(value)}`
  };
  
  return labels[key] || `${key}: ${value}`;
};

// Obtener etiqueta para categoría
const getCategoryLabel = (value) => {
  const categories = {
    books: 'Libros',
    electronics: 'Electrónica',
    clothing: 'Ropa',
    furniture: 'Muebles',
    other: 'Otros'
  };
  
  return categories[value] || value;
};

// Obtener etiqueta para condición
const getConditionLabel = (value) => {
  const conditions = {
    new: 'Nuevo',
    like_new: 'Como nuevo',
    good: 'Buen estado',
    fair: 'Estado aceptable',
    poor: 'Estado regular'
  };
  
  return conditions[value] || value;
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

// Aplicar filtros
const applyFilters = () => {
  // Si se está ordenando por cercanía y no hay coordenadas, intentar obtener la ubicación
  if (internalFilters.value.sort === 'nearest' && !internalFilters.value.coordinates) {
    getLocation();
  }
  
  // Resetear página a 1 cuando se aplican nuevos filtros
  internalFilters.value.page = 1;
  
  console.log('SearchFilters - Aplicando filtros:', internalFilters.value);
  
  // Emitir evento 'apply' con los filtros actuales.
  // El evento 'update:filters' se emite automáticamente por el watcher de `internalFilters`.
  emit('apply', { ...internalFilters.value });
};

// Resetear filtros a sus valores por defecto
const resetFilters = () => {
  internalFilters.value = { ...componentDefaultFilters };
  // El watcher de `internalFilters` se encargará de emitir 'update:filters'.
  emit('reset');
};

// Eliminar un filtro específico, restaurándolo a su valor por defecto
const removeFilter = (key) => {
  if (internalFilters.value.hasOwnProperty(key) && componentDefaultFilters.hasOwnProperty(key)) {
    internalFilters.value[key] = componentDefaultFilters[key];
  } else {
    // Fallback por si la clave no está en defaults (aunque debería estarlo)
    internalFilters.value[key] = ''; 
  }
  applyFilters(); // Reaplicar filtros después de eliminar uno
};

// Observar cambios en los filtros para actualizar el componente padre
watch(internalFilters, (newFilters) => {
  emit('update:filters', { ...newFilters });
}, { deep: true });
</script>