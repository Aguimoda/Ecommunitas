<template>
  <div id="app" class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
    <NavBar />
    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup>
import NavBar from './components/NavBar.vue'
import { onMounted } from 'vue'
import axios from 'axios'

// Configurar URL base para axios
onMounted(() => {
  axios.defaults.baseURL = 'http://localhost:3000'
})
</script>

<style>
/* Estilos globales */
#app {
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

.dark #app {
  color: #e2e8f0;
}
</style>