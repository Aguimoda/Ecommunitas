<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <h1 class="text-3xl font-bold text-center mb-8">Buscar Artículos</h1>
    
    <!-- Componente de filtros avanzados -->
    <SearchFilters 
      v-model:filters="searchFilters"
      @apply="fetchItems"
      @reset="fetchItems"
    />
    
    <div class="max-w-4xl mx-auto">
      <div v-if="loading" class="text-center py-8">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
        <p class="mt-2 text-gray-600">Cargando...</p>
      </div>
      
      <div v-if="error" class="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
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
      
      <div v-if="items.length === 0 && !loading" class="text-center py-8">
        <p class="text-gray-500">No se encontraron artículos</p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div 
          v-for="item in items" 
          :key="item.id" 
          class="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
        >
          <div class="relative">
            <img 
              v-if="item.imageUrl" 
              :src="item.imageUrl" 
              :alt="item.title" 
              loading="lazy"
              class="w-full h-48 object-cover"
            >
            <div v-else class="w-full h-48 bg-gray-200 flex items-center justify-center">
              <svg class="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div class="absolute top-2 right-2 bg-indigo-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {{ item.condition }}
            </div>
          </div>
          
          <div class="p-4">
            <h3 class="text-lg font-semibold text-gray-800 mb-2 line-clamp-1">{{ item.title }}</h3>
            <p class="text-gray-600 mb-3 text-sm line-clamp-2">{{ item.description }}</p>
            <div class="space-y-1 text-sm text-gray-500">
              <p class="flex items-center">
                <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                {{ item.category }}
              </p>
              <p class="flex items-center">
                <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {{ item.location }}
              </p>
              <p class="flex items-center">
                <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {{ item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Fecha no disponible' }}
              </p>
            </div>
            
            <div class="mt-4 flex justify-end">
              <button 
                class="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 text-sm font-medium"
                @click="$router.push(`/items/${item.id}`)"
                :aria-label="`Ver detalles de ${item.title}`"
              >
                Ver detalles
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="totalPages > 1" class="mt-8 flex justify-center">
        <nav class="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
          <button 
            @click="prevPage" 
            :disabled="currentPage === 1"
            aria-label="Página anterior"
            class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span class="sr-only">Anterior</span>
            <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </button>
          
          <button 
            v-for="page in visiblePages" 
            :key="page"
            @click="goToPage(page)"
            :aria-label="`Ir a página ${page}`"
            :aria-current="page === currentPage ? 'page' : undefined"
            :class="[page === currentPage ? 'bg-indigo-50 border-indigo-500 text-indigo-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50', 'relative inline-flex items-center px-4 py-2 border text-sm font-medium']"
          >
            {{ page }}
          </button>
          
          <button 
            @click="nextPage" 
            :disabled="currentPage === totalPages"
            aria-label="Página siguiente"
            class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span class="sr-only">Siguiente</span>
            <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
            </svg>
          </button>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { searchItems as searchItemsService } from '@/services/itemService';
import SearchFilters from '@/components/SearchFilters.vue';

const items = ref([]);
const loading = ref(false);
const error = ref('');
const currentPage = ref(1);
const itemsPerPage = ref(12);
const totalItems = ref(0);
const maxVisiblePages = 5;

// Estado unificado para los filtros de búsqueda
const searchFilters = ref({
  query: '',
  category: '',
  location: '',
  condition: '',
  distance: 10,
  sort: 'recent',
  coordinates: null,
  page: currentPage.value,
  limit: itemsPerPage.value
});

const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value));

const visiblePages = computed(() => {
  const pages = [];
  const half = Math.floor(maxVisiblePages / 2);
  let start = currentPage.value - half;
  let end = currentPage.value + half;

  if (start < 1) {
    start = 1;
    end = Math.min(maxVisiblePages, totalPages.value);
  }

  if (end > totalPages.value) {
    end = totalPages.value;
    start = Math.max(1, end - maxVisiblePages + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return pages;
});

// Función para validar los parámetros de búsqueda
const validateSearchParams = () => {
  // Validar longitud mínima de búsqueda
  if (searchFilters.value.query && searchFilters.value.query.length < 2) {
    error.value = 'La búsqueda debe tener al menos 2 caracteres';
    return false;
  }
  
  // Validar que no haya caracteres potencialmente peligrosos
  const dangerousChars = /[<>\{\}]/g;
  if (searchFilters.value.query && dangerousChars.test(searchFilters.value.query)) {
    error.value = 'La búsqueda contiene caracteres no permitidos';
    return false;
  }
  
  // Validar longitud máxima para prevenir ataques de denegación de servicio
  if (searchFilters.value.query && searchFilters.value.query.length > 100) {
    error.value = 'La búsqueda es demasiado larga';
    return false;
  }
  
  // Validar ubicación
  if (searchFilters.value.location && dangerousChars.test(searchFilters.value.location)) {
    error.value = 'La ubicación contiene caracteres no permitidos';
    return false;
  }
  
  if (searchFilters.value.location && searchFilters.value.location.length > 100) {
    error.value = 'La ubicación es demasiado larga';
    return false;
  }
  
  return true;
};

const fetchItems = async () => {
  if (!validateSearchParams()) {
    return;
  }
  
  try {
    loading.value = true;
    error.value = '';
    
    // Asegurarse de que la página actual esté en los filtros
    searchFilters.value.page = currentPage.value;
    
    // Establecer un timeout para la petición
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos de timeout
    
    // Usar el servicio actualizado para búsqueda avanzada
    const response = await searchItemsService(searchFilters.value);
    
    clearTimeout(timeoutId); // Limpiar el timeout si la petición fue exitosa
    
    items.value = response.items || [];
    totalItems.value = response.total || 0;
    
    // Si no hay resultados pero hay filtros aplicados, mostrar mensaje específico
    if (items.value.length === 0 && (
      searchFilters.value.query || 
      searchFilters.value.category || 
      searchFilters.value.location || 
      searchFilters.value.condition
    )) {
      error.value = 'No se encontraron artículos con los filtros aplicados';
    }
  } catch (err) {
    if (err.response) {
      error.value = `Error ${err.response.status}: ${err.response.data.message || 'Error al buscar artículos'}`;
    } else if (err.request) {
      error.value = 'No se pudo conectar con el servidor. Verifique su conexión.';
    } else {
      error.value = 'Error al buscar artículos. Por favor intente nuevamente.';
    }
    console.error('Error al buscar:', err);
    items.value = [];
    totalItems.value = 0;
  } finally {
    loading.value = false;
  }
};

// Observar cambios en la página actual para actualizar los resultados
watch(currentPage, (newPage) => {
  searchFilters.value.page = newPage;
  fetchItems();
});

// Cargar datos iniciales al montar el componente
onMounted(() => {
  fetchItems();
});

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const goToPage = (page) => {
  currentPage.value = page;
};
</script>

<style scoped>
.search {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
}

.results {
  margin-top: 2rem;
}

.item {
  border: 1px solid #ddd;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 4px;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.item:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

/* Estilos para limitar texto a un número específico de líneas */
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>