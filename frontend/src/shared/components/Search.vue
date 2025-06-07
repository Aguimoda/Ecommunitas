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

<script setup>
import { ref, computed } from 'vue'
import { useItemsStore } from '@/features/items'
import { displayError } from '@/shared/utils/errorHandler'
import { ItemGrid } from '@/features/items/components'

const itemsStore = useItemsStore()


const searchQuery = ref('');
const showFilters = ref(false);

// Use computed properties from store
const isLoading = computed(() => itemsStore.loading)
const results = computed(() => itemsStore.items)
const searchError = computed(() => itemsStore.error)

const filters = ref({
  category: '',
  location: '',
  startDate: '',
  endDate: ''
});

const categories = ref([
  'books',
  'electronics',
  'clothing',
  'furniture',
  'other'
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
    await itemsStore.searchItems({
      query: searchQuery.value,
      ...filters.value
    })
  } catch (error) {
    console.error('Error searching items:', error)
    displayError('Error al buscar artículos')
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