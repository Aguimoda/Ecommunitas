<!--
  COMPONENTE: NavBar.vue
  PROPÓSITO: Barra de navegación principal de la aplicación Ecommunitas
  
  DESCRIPCIÓN:
  Este componente implementa la barra de navegación principal que aparece en todas las páginas
  de la aplicación. Proporciona navegación entre secciones, gestión de autenticación de usuarios,
  modo oscuro/claro, y notificaciones de mensajes no leídos.
  
  CARACTERÍSTICAS PRINCIPALES:
  - Navegación responsive (desktop y móvil)
  - Soporte para modo oscuro/claro
  - Menú de usuario con avatar y opciones
  - Contador de mensajes no leídos
  - Botones de autenticación (login/registro)
  - Accesibilidad completa (ARIA labels, roles, etc.)
  
  ESTADOS MANEJADOS:
  - Estado de autenticación del usuario
  - Visibilidad de menús (móvil y usuario)
  - Modo de tema (oscuro/claro)
  - Contador de mensajes no leídos
  
  DEPENDENCIAS:
  - useNavBar composable: Lógica de negocio del navbar
  - Vue Router: Navegación entre páginas
  - Tailwind CSS: Estilos y responsive design
-->
<template>
  <!-- Contenedor principal de la barra de navegación -->
  <nav class="bg-white dark:bg-gray-800 shadow transition-colors duration-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <!-- Sección izquierda: Logo y navegación principal -->
        <div class="flex">
          <!-- Logo de la aplicación -->
          <div class="flex-shrink-0 flex items-center">
            <router-link to="/" class="text-indigo-600 font-bold text-xl">Ecommunitas</router-link>
          </div>
          
          <!-- Enlaces de navegación principal (solo visible en desktop) -->
          <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
            <!-- Enlace a página de inicio -->
            <router-link 
              to="/" 
              class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200" 
              :class="[$route.path === '/' ? 'border-indigo-500 text-gray-900 dark:border-indigo-400 dark:text-white' : 'border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:border-gray-500 dark:hover:text-gray-200']"
              aria-current="$route.path === '/' ? 'page' : undefined"
            >
              Inicio
            </router-link>
            
            <!-- Enlace a página de búsqueda -->
            <router-link 
              to="/search" 
              class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200" 
              :class="[$route.path === '/search' ? 'border-indigo-500 text-gray-900 dark:border-indigo-400 dark:text-white' : 'border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:border-gray-500 dark:hover:text-gray-200']"
              aria-current="$route.path === '/search' ? 'page' : undefined"
            >
              Buscar
            </router-link>
          </div>
        </div>

        <!-- Sección derecha: Botones de acción y menús -->
        <div class="hidden sm:ml-6 sm:flex sm:items-center">
          <!-- Botón para alternar modo oscuro/claro -->
          <button 
            @click="toggleDarkMode" 
            class="p-2 rounded-full text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors duration-200"
            aria-label="Alternar modo oscuro"
          >
            <!-- Icono de sol (modo claro activo) -->
            <svg v-if="isDarkMode" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <!-- Icono de luna (modo oscuro activo) -->
            <svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </button>
          
          <!-- Sección para usuarios autenticados -->
          <div v-if="isAuthenticated" class="flex items-center space-x-4">
            <!-- Botón para publicar nuevo artículo -->
            <router-link 
              to="/post-item" 
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors duration-200"
            >
              <!-- Icono de más (+) -->
              <svg class="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Publicar
            </router-link>

            <!-- Menú desplegable de usuario -->
            <div class="ml-3 relative">
              <!-- Botón de avatar del usuario -->
              <div>
                <button 
                  @click="toggleUserMenu" 
                  type="button" 
                  class="bg-white dark:bg-gray-700 rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400" 
                  id="user-menu-button" 
                  :aria-expanded="showUserMenu" 
                  aria-haspopup="true"
                >
                  <span class="sr-only">Abrir menú de usuario</span>
                  <!-- Contenedor del avatar -->
                  <div class="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-500 dark:text-indigo-300 transition-colors duration-200 overflow-hidden">
                    <!-- Imagen de avatar si está disponible -->
                    <img v-if="userAvatarUrl" :src="userAvatarUrl" class="h-full w-full object-cover" alt="Avatar del usuario">
                    <!-- Iniciales del usuario como fallback -->
                    <span v-else-if="userInitials" class="text-sm font-medium">{{ userInitials }}</span>
                    <!-- Icono de usuario genérico como último fallback -->
                    <svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </button>
              </div>

              <!-- Menú desplegable del usuario (visible cuando showUserMenu es true) -->
              <div 
                v-if="showUserMenu" 
                class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 dark:ring-gray-700 focus:outline-none z-10 transition-colors duration-200" 
                role="menu" 
                aria-orientation="vertical" 
                aria-labelledby="user-menu-button" 
                tabindex="-1"
              >
                <!-- Enlace al perfil del usuario -->
                <router-link 
                  to="/profile" 
                  class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200" 
                  role="menuitem" 
                  tabindex="-1" 
                  id="user-menu-item-0"
                  @click="showUserMenu = false"
                >
                  Mi perfil
                </router-link>
                
                <!-- Enlace a mensajes con contador de no leídos -->
                <router-link 
                  to="/messages" 
                  class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 relative" 
                  role="menuitem" 
                  tabindex="-1" 
                  id="user-menu-item-1"
                  @click="showUserMenu = false"
                >
                  Mensajes
                  <!-- Badge de mensajes no leídos -->
                  <span 
                    v-if="unreadMessages > 0" 
                    class="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform bg-red-500 rounded-full"
                    aria-label="Tienes mensajes no leídos"
                  >
                    {{ unreadMessages }}
                  </span>
                </router-link>
                
                <!-- Botón para cerrar sesión -->
                <a 
                  href="#" 
                  class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200" 
                  role="menuitem" 
                  tabindex="-1" 
                  id="user-menu-item-2"
                  @click="handleLogout"
                >
                  Cerrar sesión
                </a>
              </div>
            </div>
          </div>

          <!-- Sección para usuarios no autenticados -->
          <div v-else class="flex items-center space-x-4">
            <!-- Enlace para iniciar sesión -->
            <router-link 
              to="/login" 
              class="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            >
              Iniciar sesión
            </router-link>
            
            <!-- Botón para registrarse -->
            <router-link 
              to="/register" 
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors duration-200"
            >
              Registrarse
            </router-link>
          </div>
        </div>

        <!-- Botón de menú hamburguesa para móviles -->
        <div class="-mr-2 flex items-center sm:hidden">
          <button 
            @click="toggleMobileMenu" 
            type="button" 
            class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 dark:text-gray-300 hover:text-gray-500 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors duration-200" 
            aria-controls="mobile-menu" 
            :aria-expanded="showMobileMenu"
          >
            <span class="sr-only">Abrir menú principal</span>
            <!-- Icono de hamburguesa que cambia a X cuando el menú está abierto -->
            <svg 
              class="block h-6 w-6" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              aria-hidden="true"
            >
              <!-- Icono de hamburguesa (tres líneas) -->
              <path v-if="!showMobileMenu" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              <!-- Icono de X para cerrar -->
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Menú móvil desplegable (visible solo en dispositivos móviles) -->
    <div 
      v-if="showMobileMenu" 
      class="sm:hidden" 
      id="mobile-menu"
    >
      <!-- Enlaces de navegación principal para móvil -->
      <div class="pt-2 pb-3 space-y-1">
        <!-- Enlace a inicio en móvil -->
        <router-link 
          to="/" 
          class="block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200" 
          :class="[$route.path === '/' ? 'border-indigo-500 text-indigo-700 bg-indigo-50 dark:border-indigo-400 dark:text-indigo-300 dark:bg-indigo-900/50' : 'border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-800 dark:hover:text-gray-100']"
          aria-current="$route.path === '/' ? 'page' : undefined"
          @click="showMobileMenu = false"
        >
          Inicio
        </router-link>
        
        <!-- Enlace a búsqueda en móvil -->
        <router-link 
          to="/search" 
          class="block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200" 
          :class="[$route.path === '/search' ? 'border-indigo-500 text-indigo-700 bg-indigo-50 dark:border-indigo-400 dark:text-indigo-300 dark:bg-indigo-900/50' : 'border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-800 dark:hover:text-gray-100']"
          aria-current="$route.path === '/search' ? 'page' : undefined"
          @click="showMobileMenu = false"
        >
          Buscar
        </router-link>
        
        <!-- Enlace a publicar (solo para usuarios autenticados) -->
        <router-link 
          v-if="isAuthenticated" 
          to="/post-item" 
          class="block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200" 
          :class="[$route.path === '/post-item' ? 'border-indigo-500 text-indigo-700 bg-indigo-50 dark:border-indigo-400 dark:text-indigo-300 dark:bg-indigo-900/50' : 'border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-800 dark:hover:text-gray-100']"
          aria-current="$route.path === '/post-item' ? 'page' : undefined"
          @click="showMobileMenu = false"
        >
          Publicar artículo
        </router-link>
      </div>

      <!-- Sección de usuario autenticado en móvil -->
      <div v-if="isAuthenticated" class="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <!-- Información del usuario -->
        <div class="flex items-center px-4">
          <div class="flex-shrink-0">
            <!-- Avatar del usuario en móvil -->
            <div class="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-500 dark:text-indigo-300 transition-colors duration-200">
              <span v-if="userInitials" class="text-sm font-medium">{{ userInitials }}</span>
              <svg v-else class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
          <!-- Nombre del usuario -->
          <div class="ml-3">
            <div class="text-base font-medium text-gray-800 dark:text-gray-200 transition-colors duration-200">{{ userName }}</div>
          </div>
        </div>
        
        <!-- Enlaces del menú de usuario en móvil -->
        <div class="mt-3 space-y-1">
          <!-- Enlace al perfil -->
          <router-link 
            to="/profile" 
            class="block px-4 py-2 text-base font-medium text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200" 
            @click="showMobileMenu = false"
          >
            Mi perfil
          </router-link>
          
          <!-- Enlace a mensajes con contador -->
          <router-link 
            to="/messages" 
            class="block px-4 py-2 text-base font-medium text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 relative" 
            @click="showMobileMenu = false"
          >
            Mensajes
            <!-- Badge de mensajes no leídos en móvil -->
            <span 
              v-if="unreadMessages > 0" 
              class="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform bg-red-500 rounded-full"
              aria-label="Tienes mensajes no leídos"
            >
              {{ unreadMessages }}
            </span>
          </router-link>
          
          <!-- Botón de cerrar sesión en móvil -->
          <a 
            href="#" 
            class="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
            @click="handleLogout"
          >
            Cerrar sesión
          </a>
        </div>
      </div>

      <!-- Sección para usuarios no autenticados en móvil -->
      <div v-else class="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <div class="space-y-1">
          <!-- Enlace para iniciar sesión en móvil -->
          <router-link 
            to="/login" 
            class="block px-4 py-2 text-base font-medium text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200" 
            @click="showMobileMenu = false"
          >
            Iniciar sesión
          </router-link>
          
          <!-- Enlace para registrarse en móvil -->
          <router-link 
            to="/register" 
            class="block px-4 py-2 text-base font-medium text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200" 
            @click="showMobileMenu = false"
          >
            Registrarse
          </router-link>
          
          <!-- Botón de modo oscuro en móvil -->
          <button 
            @click="toggleDarkMode" 
            class="w-full text-left block px-4 py-2 text-base font-medium text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <div class="flex items-center">
              <!-- Icono de sol para modo claro -->
              <svg v-if="isDarkMode" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <!-- Icono de luna para modo oscuro -->
              <svg v-else class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
              {{ isDarkMode ? 'Modo claro' : 'Modo oscuro' }}
            </div>
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { watch, onMounted, onUnmounted } from 'vue'
import { useNavBar } from '../composables/useNavBar'

// Usar el composable para toda la lógica del NavBar
// Este composable encapsula toda la lógica de estado y métodos
const {
  // Estados reactivos del navbar
  showMobileMenu,     // Controla la visibilidad del menú móvil
  showUserMenu,       // Controla la visibilidad del menú de usuario
  isDarkMode,         // Estado del modo oscuro/claro
  unreadMessages,     // Contador de mensajes no leídos
  
  // Propiedades computadas derivadas del estado de autenticación
  isAuthenticated,    // Indica si el usuario está autenticado
  userName,           // Nombre completo del usuario
  userInitials,       // Iniciales del usuario para el avatar
  userAvatarUrl,      // URL del avatar del usuario
  
  // Métodos para interacciones del usuario
  toggleMobileMenu,   // Alterna la visibilidad del menú móvil
  toggleUserMenu,     // Alterna la visibilidad del menú de usuario
  toggleDarkMode,     // Cambia entre modo oscuro y claro
  handleLogout,       // Maneja el proceso de cierre de sesión
  fetchUnreadMessages,// Obtiene el contador de mensajes no leídos
  startMessagePolling,// Inicia el polling de mensajes
  stopMessagePolling  // Detiene el polling de mensajes
} = useNavBar()

// Función para cerrar el menú de usuario al hacer clic fuera de él
// Mejora la experiencia de usuario al proporcionar una forma intuitiva de cerrar menús
const handleClickOutside = (event) => {
  const userMenuButton = document.getElementById('user-menu-button')
  // Solo cerrar si el menú está abierto y el clic no fue en el botón del menú
  if (showUserMenu.value && userMenuButton && !userMenuButton.contains(event.target)) {
    showUserMenu.value = false
  }
}

// Lifecycle hooks para eventos del DOM específicos del componente
onMounted(() => {
  // Agregar listener para clics fuera del menú de usuario
  document.addEventListener('click', handleClickOutside)
  
  // Escuchar el evento personalizado de conversación leída
  // Este evento se dispara cuando el usuario lee mensajes
  window.addEventListener('conversationRead', fetchUnreadMessages)
})

// Limpieza de event listeners al desmontar el componente
// Previene memory leaks y comportamientos inesperados
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('conversationRead', fetchUnreadMessages)
})

// Watcher para reaccionar a cambios en el estado de autenticación
// Gestiona automáticamente el polling de mensajes según el estado del usuario
watch(isAuthenticated, (newValue) => {
  if (newValue) {
    // Usuario autenticado: iniciar polling de mensajes
    fetchUnreadMessages()
    startMessagePolling()
  } else {
    // Usuario no autenticado: detener polling
    stopMessagePolling()
  }
}, { immediate: true }) // immediate: true ejecuta el watcher inmediatamente
</script>

<style scoped>
@import '@/assets/styles/common.css';

/* Estilos adicionales si son necesarios */
.dark .text-indigo-600 { 
  color: #818cf8; /* Un tono de índigo más claro para mejor contraste en modo oscuro */
}
.dark .hover\:text-indigo-500:hover {
  color: #a7a7f0; /* Un tono de índigo aún más claro para hover en modo oscuro */
}
</style>