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

// Configurar interceptores para axios
onMounted(() => {
  // No configuramos baseURL porque usamos el proxy de Vite
  // que ya está configurado en vite.config.js
  
  // Configurar interceptor para agregar el token a las solicitudes
  axios.interceptors.request.use(config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  }, error => {
    return Promise.reject(error)
  })
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