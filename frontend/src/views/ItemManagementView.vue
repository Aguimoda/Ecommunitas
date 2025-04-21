<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">Gestión de Ítems</h1>
      <p class="mt-2 text-gray-600">Administra tus ítems publicados, edita su información o cambia su disponibilidad.</p>
    </div>
    
    <!-- Botón para crear nuevo ítem -->
    <div class="mb-6">
      <router-link 
        to="/items/new" 
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
        </svg>
        Crear nuevo ítem
      </router-link>
    </div>
    
    <!-- Componente de gestión de ítems -->
    <ItemManagement />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import ItemManagement from '@/components/ItemManagement.vue';
import { useRouter } from 'vue-router';

const router = useRouter();

onMounted(() => {
  // Verificar si el usuario está autenticado
  const token = localStorage.getItem('token');
  if (!token) {
    // Redirigir al login si no está autenticado
    router.push({ name: 'login', query: { redirect: '/items/manage' } });
  }
});
</script>