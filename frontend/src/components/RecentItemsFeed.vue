<template>
  <div class="recent-items-feed bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow">
    <h2 class="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Últimos Artículos Añadidos</h2>
    <div v-if="loading" class="text-center py-4">
      <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
      <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">Cargando artículos...</p>
    </div>
    <div v-else-if="error" class="text-center py-4 text-red-500 dark:text-red-400">
      <p>{{ error }}</p>
    </div>
    <div v-else-if="items.length === 0" class="text-center py-4 text-gray-500 dark:text-gray-400">
      <p>No hay artículos recientes para mostrar.</p>
    </div>
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="item in items" :key="item._id" 

           class="bg-white dark:bg-gray-700 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">

        <router-link 
          :to="{ name: 'ItemDetail', params: { id: item._id } }"
          v-if="item._id && isValidId(item._id)"
        >
          <img v-if="item.imageUrl || (item.imageUrls && item.imageUrls.length > 0)" :src="item.imageUrl ? item.imageUrl : item.imageUrls[0]" :alt="item.title" class="w-full h-48 object-cover">
          <div v-else class="w-full h-48 bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
            <svg class="h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div class="p-4">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100 truncate">{{ item.title }}</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 truncate">{{ item.category }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-300 mt-1">{{ formatDate(item.createdAt) }}</p>
          </div>
        </router-link>
        <div v-else class="text-red-500">
          {{item._id}}
          Error: ID no disponible
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const items  = ref([]);
const loading = ref(true);
const error = ref('');

const fetchRecentItems = async () => {
  try {
    loading.value = true;
    error.value = '';
    // Asumimos que tienes un endpoint /api/items/recent o similar
    // Ajusta el endpoint y los parámetros según tu API
    const response = await axios.get('/api/v1/items', {
      headers: {
        'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : undefined
      }
    });
    console.log(response.data.data

    );
    items.value = response.data.data; // Ajusta según la estructura de tu respuesta
  } catch (err) {
    console.error('Error fetching recent items:', err);
    error.value = 'No se pudieron cargar los artículos recientes.';
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const isValidId = (id) => {
  return id && typeof id === 'string' && id !== 'search' && id.trim() !== '' && id.length >= 8;
};

onMounted(() => {
  fetchRecentItems();
});
</script>

<style scoped>
/* Estilos adicionales si son necesarios */
</style>