<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <div 
      v-for="item in items" 
      :key="item._id"
      class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
    >
      <div class="h-48 overflow-hidden">
        <img 
          :src="item.imageUrl" 
          :alt="item.title"
          class="w-full h-full object-cover"
        />
      </div>
      <div class="p-4">
        <h3 class="text-lg font-semibold mb-2">{{ item.title }}</h3>
        <p class="text-gray-600 mb-2">{{ item.description }}</p>
        <div class="flex justify-between items-center">
          <span class="text-sm text-gray-500">{{ item.location }}</span>
          <span class="text-sm px-2 py-1 rounded-full" 
            :class="{
              'bg-green-100 text-green-800': item.available,
              'bg-red-100 text-red-800': !item.available
            }"
          >
            {{ item.available ? 'Available' : 'Unavailable' }}
          </span>
        </div>
      </div>
    </div>
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