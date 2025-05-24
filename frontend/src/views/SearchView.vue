<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <h1 class="text-3xl font-bold text-center mb-8">Buscar Artículos</h1>
    
    <!-- Componente de filtros avanzados -->
    <SearchFilters    v-model:filters="searchFilters"
      @apply="handleApplyFilters"
      @reset="handleResetFilters"
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
      
      <div v-if="!error && items.length === 0 && !loading" class="text-center py-8">
        <p v-if="hasActiveFilters" class="text-gray-500">No se encontraron artículos con los filtros aplicados.</p>
        <p v-else class="text-gray-500">No se encontraron artículos.</p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div 
          v-for="item in items" 
          :key="item._id" 
          class="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
        >
          <div class="relative">
            <img 
              v-if="item.imageUrl || (item.imageUrls && item.imageUrls.length > 0)" 
              :src="item.imageUrl ? item.imageUrl : item.imageUrls[0]" 
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
              {{ translateCategory(item.category) }}
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
                {{ translateCondition(item.condition) }}
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
                @click="goToItemDetail(item._id, item.title)"
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
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { searchItems as searchItemsService } from '@/services/itemService.js';
import SearchFilters from '@/components/SearchFilters.vue';

const router = useRouter();

const items = ref([]);
const loading = ref(false);
const error = ref('');
const currentPage = ref(1);
const itemsPerPage = ref(12);
const totalItems = ref(0);
const maxVisiblePages = 5;

const hasActiveFilters = computed(() => {
  return !!(searchFilters.value.query || 
         searchFilters.value.category || 
         searchFilters.value.location || 
         searchFilters.value.condition);
});

// Estado para los filtros de búsqueda (sin page y limit)
const searchFilters = ref({
  query: '',
  category: '',
  location: '',
  condition: '',
  distance: 10, // Valor por defecto, asegúrate que coincida con SearchFilters.vue si es necesario
  sort: 'recent', // Valor por defecto
  coordinates: null,
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

// Función para traducir categorías
const translateCategory = (category) => {
  const categories = {
    books: 'Libros',
    electronics: 'Electrónica',
    clothing: 'Ropa',
    furniture: 'Muebles',
    other: 'Otros'
  };
  return categories[category] || category;
};

// Función para traducir condiciones
const translateCondition = (condition) => {
  const conditions = {
    new: 'Nuevo',
    like_new: 'Como nuevo',
    good: 'Buen estado',
    fair: 'Estado aceptable',
    poor: 'Estado regular'
  };
  return conditions[condition] || condition;
};

// Función para validar los parámetros de búsqueda
const validateSearchParams = () => {
  // Permitir búsquedas con 1 carácter o más
  if (searchFilters.value.query !== undefined && searchFilters.value.query.trim().length === 0) {
    searchFilters.value.query = ''; // Limpiar espacios en blanco
    return null; // No es un error, solo limpiamos
  }
  
  const dangerousChars = /[<>{}]/g;
  if (searchFilters.value.query && dangerousChars.test(searchFilters.value.query)) {
    return 'La búsqueda contiene caracteres no permitidos';
  }
  
  if (searchFilters.value.query && searchFilters.value.query.length > 100) {
    return 'La búsqueda es demasiado larga';
  }
  
  if (searchFilters.value.location && dangerousChars.test(searchFilters.value.location)) {
    return 'La ubicación contiene caracteres no permitidos';
  }
  
  if (searchFilters.value.location && searchFilters.value.location.length > 100) {
    return 'La ubicación es demasiado larga';
  }
  
  return null; // Devuelve null si no hay errores de validación
};

const fetchItems = async () => {
  if (loading.value) {
    return; // Evitar llamadas concurrentes si ya se está cargando
  }

  loading.value = true;
  error.value = ''; // Limpiar errores previos al inicio de la carga
  items.value = []; // Limpiar items previos para evitar mostrar datos antiguos durante la carga o error
  totalItems.value = 0;

  const validationError = validateSearchParams();
  if (validationError) {
    error.value = validationError;
    loading.value = false; // Detener la carga si hay error de validación
    return;
  }
  
  try {
    // Crear una copia profunda de searchFilters para evitar mutaciones por el servicio
    const filtersCopy = JSON.parse(JSON.stringify(searchFilters.value));
    const paramsForService = {
      ...filtersCopy,
      page: currentPage.value,
      limit: itemsPerPage.value,
    };
    
    console.log('SearchView - Enviando filtros al servicio:', paramsForService);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout
    
    const response = await searchItemsService(paramsForService, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    console.log('SearchView - Respuesta del servicio:', response);
    
    if (response && response.data) {
      items.value = response.data || [];
      totalItems.value = response.total || 0;
      console.log('SearchView - Items cargados:', items.value.length, 'de', totalItems.value);
    } else {
      console.error('SearchView - Respuesta inesperada del servicio:', response);
      error.value = 'Formato de respuesta inesperado del servidor';
    }
  } catch (err) {
    console.error('SearchView - Error al buscar:', err); 

    if (err.name === 'AbortError') {
      error.value = 'La búsqueda tardó demasiado y fue cancelada. Intente nuevamente.';
    } else if (err.response) {
      error.value = `Error ${err.response.status}: ${err.response.data?.message || 'Error al buscar artículos'}`;
    } else if (err.request) {
      error.value = 'No se pudo conectar con el servidor. Verifique su conexión.';
    } else {
      error.value = 'Error al buscar artículos. Por favor intente nuevamente.';
    }
    // items.value y totalItems.value ya fueron reseteados al inicio
  } finally {
    loading.value = false;
  }
};

// Observar cambios en la página actual para actualizar los resultados
watch(currentPage, () => {
  fetchItems(); // Llamada simplificada
});

// Nuevos manejadores para los eventos de SearchFilters
const handleApplyFilters = (filters) => {
  console.log('SearchView - Filtros recibidos del componente SearchFilters:', filters);
  // Actualizar el estado local con los filtros recibidos
  searchFilters.value = { ...filters };
  
  if (currentPage.value !== 1) {
    currentPage.value = 1; // El watcher de currentPage se encargará de llamar a fetchItems
  } else {
    // Si currentPage ya es 1, el watcher no se activará.
    // Usar nextTick para asegurar que cualquier cambio de estado pendiente se procese
    // antes de llamar a fetchItems.
    nextTick(() => {
      fetchItems();
    });
  }
};

const handleResetFilters = () => {
  // Resetear los valores de searchFilters a sus defaults
  searchFilters.value.query = '';
  searchFilters.value.category = '';
  searchFilters.value.location = '';
  searchFilters.value.condition = '';
  searchFilters.value.distance = 10; // Asegúrate que este es el valor por defecto correcto
  searchFilters.value.sort = 'recent'; // Asegúrate que este es el valor por defecto correcto
  searchFilters.value.coordinates = null;
  
  if (currentPage.value !== 1) {
    currentPage.value = 1; // El watcher se encargará
  } else {
    // Si currentPage ya es 1, el watcher no se activará.
    // Usar nextTick para asegurar que cualquier cambio de estado pendiente se procese
    // antes de llamar a fetchItems.
    nextTick(() => {
      fetchItems(); // Llamar directamente si ya está en la página 1
    });
  }
};

// Cargar datos iniciales al montar el componente
onMounted(() => {
  fetchItems(); // Llamada simplificada
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

const goToItemDetail = (id, title) => {
  // Validar que el ID sea válido y no sea "search" ni vacío ni null
  if (!id || typeof id !== 'string' || id === 'search' || id.trim() === '' || id.length < 8) {
    error.value = 'ID de artículo inválido.';
    return;
  }
  router.push(`/items/${id}`);
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
  border-radius: 0.5rem;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}

.item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

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