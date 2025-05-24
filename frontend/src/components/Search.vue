<template>
  <div class="search-container">
    <div class="search-bar">
      <input
        v-model="searchQuery"
        @input="handleSearch"
        type="text"
        placeholder="Buscar artículos..."
        class="search-input"
      />
      <button @click="toggleFilters" class="filter-toggle">
        {{ showFilters ? 'Ocultar filtros' : 'Mostrar filtros' }}
      </button>
    </div>

    <div v-if="showFilters" class="filters-container">
      <div class="filter-group">
        <label>Categoría:</label>
        <select v-model="filters.category" class="filter-select">
          <option value="">Todas</option>
          <option v-for="category in categories" :key="category" :value="category">
            {{ category }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <label>Ubicación:</label>
        <input v-model="filters.location" type="text" class="filter-input" />
      </div>

      <div class="filter-group">
        <label>Rango de fechas:</label>
        <div class="date-range">
          <input v-model="filters.startDate" type="date" class="date-input" />
          <span>a</span>
          <input v-model="filters.endDate" type="date" class="date-input" />
        </div>
      </div>

      <button @click="applyFilters" class="apply-filters">Aplicar filtros</button>
    </div>

    <div v-if="isLoading" class="loading-indicator">Buscando...</div>

    <div v-if="results.length > 0" class="results-container">
      <div v-for="item in results" :key="item._id" class="result-item">
        <router-link :to="{ name: 'ItemDetail', params: { id: item._id } }" v-if="item._id && isValidId(item._id)">
          <img v-if="item.imageUrl || (item.imageUrls && item.imageUrls.length > 0)" :src="item.imageUrl ? item.imageUrl : item.imageUrls[0]" :alt="item.title" class="item-image">
          <div v-else class="item-image bg-gray-200 flex items-center justify-center">
            <svg class="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div class="item-details">
            <h3>{{ item.title }}</h3>
            <p>{{ item.description }}</p>
            <div class="item-meta">
              <span>{{ item.category }}</span>
              <span>{{ item.location }}</span>
              <span>{{ item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Fecha no disponible' }}</span>
            </div>
          </div>
        </router-link>
      </div>
    </div>

    <div v-if="!isLoading && results.length === 0 && searchQuery" class="no-results">
      No se encontraron resultados para "{{ searchQuery }}"
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { searchItems } from '@/services/itemService';

const searchQuery = ref('');
const showFilters = ref(false);
const isLoading = ref(false);
const results = ref([]);

const filters = ref({
  category: '',
  location: '',
  startDate: '',
  endDate: ''
});

const categories = ref([
  'Libros',
  'Electrónicos',
  'Ropa',
  'Muebles',
  'Otros'
]);

const handleSearch = () => {
  if (searchQuery.value.length > 2) {
    performSearch();
  }
};

const toggleFilters = () => {
  showFilters.value = !showFilters.value;
};

const applyFilters = () => {
  performSearch();
};

const performSearch = async () => {
  try {
    isLoading.value = true;
    const response = await searchItems({
      query: searchQuery.value,
      ...filters.value
    });
    results.value = response.data;
  } catch (error) {
    console.error('Error searching items:', error);
    results.value = [];
  } finally {
    isLoading.value = false;
  }
};

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('es-ES', options);
};

const isValidId = (id) => {
  return id && typeof id === 'string' && id !== 'search' && id.trim() !== '' && id.length >= 8;
};

watch(searchQuery, (newVal) => {
  if (newVal.length === 0) {
    results.value = [];
  }
});
</script>

<style scoped>
.search-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.search-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.search-input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.filter-toggle {
  padding: 10px 15px;
  background-color: #4f46e5;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
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
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 10px;
}

.date-input {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.apply-filters {
  padding: 8px 16px;
  background-color: #4f46e5;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
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
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
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