<template>
  <nav class="bg-white dark:bg-gray-800 shadow transition-colors duration-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <!-- Logo y navegación principal -->
        <div class="flex">
          <div class="flex-shrink-0 flex items-center">
            <router-link to="/" class="text-indigo-600 font-bold text-xl">Ecommunitas</router-link>
          </div>
          <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
            <router-link 
              to="/" 
              class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200" 
              :class="[$route.path === '/' ? 'border-indigo-500 text-gray-900 dark:border-indigo-400 dark:text-white' : 'border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:border-gray-500 dark:hover:text-gray-200']"
              aria-current="$route.path === '/' ? 'page' : undefined"
            >
              Inicio
            </router-link>
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

        <!-- Botones de acción -->
        <div class="hidden sm:ml-6 sm:flex sm:items-center">
          <!-- Botón de modo oscuro -->
          <button 
            @click="toggleDarkMode" 
            class="p-2 rounded-full text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors duration-200"
            aria-label="Alternar modo oscuro"
          >
            <svg v-if="isDarkMode" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </button>
          
          <div v-if="isAuthenticated" class="flex items-center space-x-4">
            <router-link 
              to="/post-item" 
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors duration-200"
            >
              <svg class="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Publicar
            </router-link>

            <!-- Menú de usuario -->
            <div class="ml-3 relative">
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
                  <div class="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-500 dark:text-indigo-300 transition-colors duration-200">
                    <span v-if="userInitials" class="text-sm font-medium">{{ userInitials }}</span>
                    <svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </button>
              </div>

              <div 
                v-if="showUserMenu" 
                class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 dark:ring-gray-700 focus:outline-none z-10 transition-colors duration-200" 
                role="menu" 
                aria-orientation="vertical" 
                aria-labelledby="user-menu-button" 
                tabindex="-1"
              >
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
                <router-link 
                  to="/messages" 
                  class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 relative" 
                  role="menuitem" 
                  tabindex="-1" 
                  id="user-menu-item-1"
                  @click="showUserMenu = false"
                >
                  Mensajes
                  <span 
                    v-if="unreadMessages > 0" 
                    class="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform bg-red-500 rounded-full"
                    aria-label="Tienes mensajes no leídos"
                  >
                    {{ unreadMessages }}
                  </span>
                </router-link>
                <a 
                  href="#" 
                  class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200" 
                  role="menuitem" 
                  tabindex="-1" 
                  id="user-menu-item-2"
                  @click="logout"
                >
                  Cerrar sesión
                </a>
              </div>
            </div>
          </div>

          <div v-else class="flex items-center space-x-4">
            <router-link 
              to="/login" 
              class="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            >
              Iniciar sesión
            </router-link>
            <router-link 
              to="/register" 
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors duration-200"
            >
              Registrarse
            </router-link>
          </div>
        </div>

        <!-- Botón de menú móvil -->
        <div class="-mr-2 flex items-center sm:hidden">
          <button 
            @click="toggleMobileMenu" 
            type="button" 
            class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 dark:text-gray-300 hover:text-gray-500 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors duration-200" 
            aria-controls="mobile-menu" 
            :aria-expanded="showMobileMenu"
          >
            <span class="sr-only">Abrir menú principal</span>
            <svg 
              class="block h-6 w-6" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              aria-hidden="true"
            >
              <path v-if="!showMobileMenu" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Menú móvil -->
    <div 
      v-if="showMobileMenu" 
      class="sm:hidden" 
      id="mobile-menu"
    >
      <div class="pt-2 pb-3 space-y-1">
        <router-link 
          to="/" 
          class="block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200" 
          :class="[$route.path === '/' ? 'border-indigo-500 text-indigo-700 bg-indigo-50 dark:border-indigo-400 dark:text-indigo-300 dark:bg-indigo-900/50' : 'border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-800 dark:hover:text-gray-100']"
          aria-current="$route.path === '/' ? 'page' : undefined"
          @click="showMobileMenu = false"
        >
          Inicio
        </router-link>
        <router-link 
          to="/search" 
          class="block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200" 
          :class="[$route.path === '/search' ? 'border-indigo-500 text-indigo-700 bg-indigo-50 dark:border-indigo-400 dark:text-indigo-300 dark:bg-indigo-900/50' : 'border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-800 dark:hover:text-gray-100']"
          aria-current="$route.path === '/search' ? 'page' : undefined"
          @click="showMobileMenu = false"
        >
          Buscar
        </router-link>
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

      <div v-if="isAuthenticated" class="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <div class="flex items-center px-4">
          <div class="flex-shrink-0">
            <div class="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-500 dark:text-indigo-300 transition-colors duration-200">
              <span v-if="userInitials" class="text-sm font-medium">{{ userInitials }}</span>
              <svg v-else class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
          <div class="ml-3">
            <div class="text-base font-medium text-gray-800 dark:text-gray-200 transition-colors duration-200">{{ userName }}</div>
          </div>
        </div>
        <div class="mt-3 space-y-1">
          <router-link 
            to="/profile" 
            class="block px-4 py-2 text-base font-medium text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200" 
            @click="showMobileMenu = false"
          >
            Mi perfil
          </router-link>
          <router-link 
            to="/messages" 
            class="block px-4 py-2 text-base font-medium text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 relative" 
            @click="showMobileMenu = false"
          >
            Mensajes
            <span 
              v-if="unreadMessages > 0" 
              class="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform bg-red-500 rounded-full"
              aria-label="Tienes mensajes no leídos"
            >
              {{ unreadMessages }}
            </span>
          </router-link>
          <a 
            href="#" 
            class="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
            @click="logout"
          >
            Cerrar sesión
          </a>
        </div>
      </div>

      <div v-else class="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <div class="space-y-1">
          <router-link 
            to="/login" 
            class="block px-4 py-2 text-base font-medium text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200" 
            @click="showMobileMenu = false"
          >
            Iniciar sesión
          </router-link>
          <router-link 
            to="/register" 
            class="block px-4 py-2 text-base font-medium text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200" 
            @click="showMobileMenu = false"
          >
            Registrarse
          </router-link>
          <button 
            @click="toggleDarkMode" 
            class="w-full text-left block px-4 py-2 text-base font-medium text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <div class="flex items-center">
              <svg v-if="isDarkMode" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const showMobileMenu = ref(false)
const showUserMenu = ref(false)
const isDarkMode = ref(false)
const userName = ref('Usuario')
const unreadMessages = ref(0)
const userInitials = ref('')

// Comprobar si el usuario está autenticado
const isAuthenticated = computed(() => {
  return !!localStorage.getItem('token')
})

// Obtener información del usuario actual
const fetchUserInfo = async () => {
  if (!isAuthenticated.value) return
  
  try {
    const token = localStorage.getItem('token')
    const response = await axios.get('/api/user/profile', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    
    if (response.data && response.data.name) {
      userName.value = response.data.name
      // Obtener iniciales para el avatar
      userInitials.value = getInitials(response.data.name)
    }
  } catch (err) {
    console.error('Error al obtener información del usuario:', err)
  }
}

// Obtener cantidad de mensajes no leídos
const fetchUnreadMessages = async () => {
  if (!isAuthenticated.value) return
  
  try {
    const token = localStorage.getItem('token')
    const response = await axios.get('/api/messages/unread', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    
    if (response.data && response.data.count !== undefined) {
      unreadMessages.value = response.data.count
    }
  } catch (err) {
    console.error('Error al obtener mensajes no leídos:', err)
  }
}

// Obtener iniciales del nombre
const getInitials = (name) => {
  if (!name) return ''
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

// Alternar menú móvil
const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
  if (showMobileMenu.value) {
    showUserMenu.value = false
  }
}

// Alternar menú de usuario
const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

// Alternar modo oscuro
const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark')
    localStorage.setItem('darkMode', 'true')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('darkMode', 'false')
  }
}

// Cerrar sesión
const logout = () => {
  localStorage.removeItem('token')
  showUserMenu.value = false
  showMobileMenu.value = false
  router.push('/login')
}

// Cerrar menú de usuario al hacer clic fuera
const handleClickOutside = (event) => {
  const userMenuButton = document.getElementById('user-menu-button')
  if (showUserMenu.value && userMenuButton && !userMenuButton.contains(event.target)) {
    showUserMenu.value = false
  }
}

// Observar cambios en la autenticación
watch(isAuthenticated, (newValue) => {
  if (newValue) {
    fetchUserInfo()
    fetchUnreadMessages()
  } else {
    userName.value = 'Usuario'
    unreadMessages.value = 0
  }
})

// Inicializar el modo oscuro según la preferencia guardada
onMounted(() => {
  const savedDarkMode = localStorage.getItem('darkMode')
  if (savedDarkMode === 'true') {
    isDarkMode.value = true
    document.documentElement.classList.add('dark')
  } else if (savedDarkMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    // Si no hay preferencia guardada, usar la preferencia del sistema
    isDarkMode.value = true
    document.documentElement.classList.add('dark')
    localStorage.setItem('darkMode', 'true')
  }
  
  // Cargar información del usuario si está autenticado
  if (isAuthenticated.value) {
    fetchUserInfo()
    fetchUnreadMessages()
    
    // Configurar intervalo para verificar mensajes no leídos cada minuto
    const messageInterval = setInterval(() => {
      if (isAuthenticated.value) {
        fetchUnreadMessages()
      } else {
        clearInterval(messageInterval)
      }
    }, 60000) // 60 segundos
    
    // Limpiar intervalo al desmontar
    onUnmounted(() => {
      clearInterval(messageInterval)
    })
  }
})

// Añadir event listener al montar el componente
document.addEventListener('click', handleClickOutside)

// Limpiar event listener al desmontar el componente
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>