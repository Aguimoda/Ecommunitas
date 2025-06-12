<!--
/**
 * @file NotFoundView.vue
 * @description Vista de error 404 para páginas no encontradas en Ecommunitas
 * 
 * Este componente renderiza una página de error 404 elegante y funcional
 * cuando los usuarios intentan acceder a rutas que no existen en la aplicación.
 * Proporciona opciones de navegación para ayudar a los usuarios a regresar
 * a contenido válido.
 * 
 * CARACTERÍSTICAS PRINCIPALES:
 * - 🚫 Página de error 404 elegante
 * - 🏠 Botón para volver al inicio
 * - ⬅️ Botón para volver atrás
 * - 🎨 Diseño centrado y responsive
 * - 🌙 Soporte para modo oscuro
 * - 📱 Optimizado para móviles
 * - ♿ Accesible y semántico
 * 
 * FUNCIONALIDADES:
 * - Navegación inteligente hacia atrás
 * - Redirección al inicio como fallback
 * - Detección del historial del navegador
 * - Mensajes informativos claros
 * - Botones de acción prominentes
 * - Transiciones suaves
 * 
 * NAVEGACIÓN:
 * - Botón "Volver al inicio": Redirige a la página principal
 * - Botón "Volver atrás": Usa historial del navegador o va al inicio
 * - Lógica inteligente para manejar casos sin historial
 * - Integración completa con Vue Router
 * 
 * DISEÑO:
 * - Layout centrado verticalmente
 * - Número 404 prominente
 * - Título y descripción informativos
 * - Botones de acción claros
 * - Espaciado consistente
 * - Colores temáticos
 * 
 * ESTADOS MANEJADOS:
 * - Historial de navegación disponible
 * - Sin historial previo (fallback a inicio)
 * - Modo claro y oscuro
 * - Diferentes tamaños de pantalla
 * 
 * INTEGRACIÓN:
 * - Vue Router para navegación
 * - Tailwind CSS para estilos
 * - Composables de Vue 3
 * - Sistema de rutas de la aplicación
 * 
 * TECNOLOGÍAS:
 * - Vue 3 Composition API
 * - Vue Router 4
 * - Tailwind CSS
 * - Responsive Design
 * 
 * @author Equipo de Desarrollo Ecommunitas
 * @version 1.0.0
 * @since 1.0.0
 */
-->
<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div class="max-w-md w-full space-y-8 text-center">
      <div>
        <h1 class="text-9xl font-bold text-gray-300 dark:text-gray-600">404</h1>
        <h2 class="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
          Página no encontrada
        </h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          La página que buscas no existe o ha sido movida.
        </p>
      </div>
      
      <div class="space-y-4">
        <router-link
          to="/"
          class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          Volver al inicio
        </router-link>
        
        <button
          @click="goBack"
          class="group relative w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          Volver atrás
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/')
  }
}
</script>