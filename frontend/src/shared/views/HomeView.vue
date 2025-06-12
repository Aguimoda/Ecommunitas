<!--
/**
 * @file HomeView.vue
 * @description Vista principal de la aplicación Ecommunitas
 * 
 * Este componente representa la página de inicio de la aplicación, proporcionando
 * una experiencia de bienvenida y acceso rápido a las funcionalidades principales.
 * Muestra un feed de artículos recientes y sirve como punto de entrada principal
 * para los usuarios.
 * 
 * CARACTERÍSTICAS PRINCIPALES:
 * - 🏠 Página de bienvenida atractiva
 * - 📰 Feed de artículos recientes
 * - 🎨 Diseño responsive y moderno
 * - 🌙 Soporte para modo oscuro
 * - ⚡ Carga optimizada de contenido
 * - 📱 Experiencia móvil optimizada
 * 
 * FUNCIONALIDADES:
 * - Visualización de artículos más recientes
 * - Navegación intuitiva a otras secciones
 * - Mensaje de bienvenida personalizado
 * - Transiciones suaves entre temas
 * - Acceso rápido a funciones principales
 * 
 * COMPONENTES INTEGRADOS:
 * - RecentItemsFeed: Muestra los artículos más recientes
 * 
 * ESTADOS MANEJADOS:
 * - Tema claro/oscuro
 * - Carga de contenido inicial
 * - Estados responsive para diferentes dispositivos
 * 
 * TECNOLOGÍAS:
 * - Vue 3 Composition API
 * - Tailwind CSS para estilos
 * - CSS Grid y Flexbox para layout
 * - Transiciones CSS para animaciones
 * 
 * @author Equipo de Desarrollo Ecommunitas
 * @version 1.0.0
 * @since 1.0.0
 */
-->
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