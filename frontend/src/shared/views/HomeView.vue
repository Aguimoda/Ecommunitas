<template>
  <div class="home-view p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
    <header class="mb-8 text-center">
      <h1 class="text-4xl font-bold text-indigo-600 dark:text-indigo-400">Bienvenido a Ecommunitas</h1>
      <p class="text-lg text-gray-600 dark:text-gray-300 mt-2">Encuentra y comparte artículos en tu comunidad.</p>
    </header>

    <!-- Feed de Artículos Recientes -->
    <div class="mb-8">
      <RecentItemsFeed />
    </div>

    <!-- Aquí podrías añadir más secciones como búsqueda, etc. -->

  </div>
</template>

<script setup>
import { RecentItemsFeed } from '@/features/items/components';
// Lógica de la vista principal, si es necesaria
</script>

<style scoped>
@import '@/assets/styles/common.css';

.home {
  @apply wide-container;
}
</style>