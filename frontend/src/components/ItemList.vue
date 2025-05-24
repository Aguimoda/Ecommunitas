<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <router-link 
      v-for="item in items" 
      :key="item._id"
      :to="{ name: 'ItemDetail', params: { id: item._id } }"
      class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 block"
    >
      <div class="h-48 overflow-hidden">
        <img 
          v-if="item.imageUrl" 
          :src="item.imageUrl" 
          :alt="item.title"
          class="w-full h-full object-cover"
        />
        <div v-else class="w-full h-48 bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
          <svg class="h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>
      <div class="p-4">
        <h3 class="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100 truncate">{{ item.title }}</h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-2 truncate">{{ item.description }}</p>
        <div class="flex justify-between items-center">
          <span class="text-sm text-gray-500 dark:text-gray-300">{{ item.location }}</span>
          <span class="text-sm px-2 py-1 rounded-full" 
            :class="{
              'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100': item.available,
              'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100': !item.available
            }"
          >
            {{ item.available ? 'Disponible' : 'No disponible' }}
          </span>
        </div>
      </div>
    </router-link>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getItems } from '@/services/itemService';

const items = ref([]);
const isLoading = ref(false);
const error = ref(null);

const fetchItems = async () => {
  try {
    isLoading.value = true;
    const response = await getItems();
    items.value = response.data;
  } catch (err) {
    error.value = err.message;
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchItems();
});
</script>