<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <h1 class="text-3xl font-bold text-center mb-8">Buscar Artículos</h1>
    
.    <!-- Componente de filtros avanzados -->
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
      
      <div v-if="!error && (!Array.isArray(items) || items.length === 0) && !loading" class="text-center py-8">
        <p v-if="hasActiveFilters" class="text-gray-500">No se encontraron artículos con los filtros aplicados.</p>
        <p v-else class="text-gray-500">No se encontraron artículos.</p>
      </div>
      
      <div v-if="Array.isArray(items) && items.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
import { SearchFilters } from '@/shared/components'
import { useSearch } from '@/shared/composables/useSearch'

// Usar el composable para toda la lógica de búsqueda
const {
  // Estados reactivos
  searchFilters,
  currentPage,
  totalItems,
  
  // Propiedades computadas
  items,
  loading,
  error,
  hasActiveFilters,
  totalPages,
  visiblePages,
  
  // Funciones de utilidad
  translateCategory,
  translateCondition,
  
  // Funciones principales
  handleApplyFilters,
  handleResetFilters,
  
  // Funciones de navegación
  prevPage,
  nextPage,
  goToPage,
  goToItemDetail
} = useSearch()
</script>

<style scoped>
@import '@/assets/styles/search-view.css';
</style>