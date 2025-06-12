import { ref, computed, onMounted, onUnmounted, type Ref, type ComputedRef } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth, useAuthStore } from '@/features/auth'
import { getUserInitials, getUserAvatarUrl } from '@/features/users'
import { messageService } from '@/features/messages'
import { displayError } from '@/shared/utils/errorHandler'

/**
 * @file useNavBar.ts
 * @description Composable para manejo de la barra de navegación en Ecommunitas
 * 
 * Este composable centraliza toda la lógica de la barra de navegación principal,
 * incluyendo autenticación de usuarios, gestión de mensajes no leídos, menús
 * móviles responsivos, modo oscuro y navegación entre páginas. Proporciona
 * una interfaz reactiva y consistente para todos los componentes de navegación.
 * 
 * CARACTERÍSTICAS PRINCIPALES:
 * - 🔐 Gestión completa de estado de autenticación
 * - 📱 Menús responsivos para dispositivos móviles
 * - 💬 Polling automático de mensajes no leídos
 * - 🌙 Modo oscuro con persistencia en localStorage
 * - 🧭 Navegación programática entre rutas
 * - 👤 Información de usuario con avatar e iniciales
 * - 🔄 Sincronización automática de estado
 * - 📊 Contadores en tiempo real
 * 
 * FUNCIONALIDADES:
 * - Control de visibilidad de menús móviles
 * - Gestión de menú desplegable de usuario
 * - Alternancia de modo oscuro con persistencia
 * - Polling automático de mensajes cada 30 segundos
 * - Navegación a perfil, mensajes, configuración y admin
 * - Cierre de sesión con limpieza de estado
 * - Inicialización automática de preferencias
 * - Manejo de errores con notificaciones
 * 
 * ESTADOS REACTIVOS:
 * - showMobileMenu: Visibilidad del menú móvil
 * - showUserMenu: Visibilidad del menú de usuario
 * - isDarkMode: Estado del modo oscuro
 * - unreadMessages: Contador de mensajes no leídos
 * - messageInterval: Control del polling automático
 * 
 * PROPIEDADES COMPUTADAS:
 * - isAuthenticated: Estado de autenticación
 * - userName: Nombre del usuario actual
 * - userInitials: Iniciales del nombre
 * - userAvatarUrl: URL del avatar del usuario
 * 
 * CASOS DE USO:
 * - Barra de navegación principal de la aplicación
 * - Menús de navegación móvil
 * - Indicadores de mensajes no leídos
 * - Controles de tema y modo oscuro
 * - Menús desplegables de usuario
 * - Navegación entre secciones de la app
 * - Gestión de sesión de usuario
 * 
 * INTEGRACIÓN:
 * - Vue Router para navegación
 * - Pinia stores para estado global
 * - Sistema de autenticación
 * - Servicio de mensajes
 * - Utilidades de manejo de errores
 * - localStorage para persistencia
 * 
 * TECNOLOGÍAS:
 * - Vue 3 Composition API
 * - TypeScript para tipado estático
 * - Vue Router para navegación
 * - Pinia para gestión de estado
 * - Web Storage API para persistencia
 * - Polling automático con setInterval
 * 
 * @author Equipo de Desarrollo Ecommunitas
 * @version 1.0.0
 * @since 1.0.0
 * 
 * @example
 * ```typescript
 * // Uso básico en componente NavBar
 * const {
 *   showMobileMenu,
 *   showUserMenu,
 *   isAuthenticated,
 *   userName,
 *   unreadMessages,
 *   toggleMobileMenu,
 *   toggleUserMenu,
 *   handleLogout,
 *   navigateToProfile
 * } = useNavBar()
 * 
 * // Control de menú móvil
 * const handleMobileMenuClick = () => {
 *   toggleMobileMenu()
 * }
 * 
 * // Navegación con cierre automático de menús
 * const goToProfile = () => {
 *   navigateToProfile() // Navega y cierra menús automáticamente
 * }
 * 
 * // Verificar mensajes no leídos
 * watchEffect(() => {
 *   if (unreadMessages.value > 0) {
 *     // Mostrar badge de notificación
 *   }
 * })
 * ```
 */

/**
 * Valor de retorno del composable useNavBar
 * @interface UseNavBarReturn
 */
interface UseNavBarReturn {
  // Estados reactivos
  /** Estado de visibilidad del menú móvil */
  showMobileMenu: Ref<boolean>;
  /** Estado de visibilidad del menú de usuario */
  showUserMenu: Ref<boolean>;
  /** Estado del modo oscuro */
  isDarkMode: Ref<boolean>;
  /** Número de mensajes no leídos */
  unreadMessages: Ref<number>;
  /** Intervalo para polling de mensajes */
  messageInterval: Ref<NodeJS.Timeout | null>;
  
  // Propiedades computadas
  /** Estado de autenticación del usuario */
  isAuthenticated: ComputedRef<boolean>;
  /** Nombre del usuario autenticado */
  userName: ComputedRef<string>;
  /** Iniciales del nombre del usuario */
  userInitials: ComputedRef<string>;
  /** URL del avatar del usuario */
  userAvatarUrl: ComputedRef<string | null>;
  
  // Métodos
  /** Obtiene el número de mensajes no leídos */
  fetchUnreadMessages: () => Promise<void>;
  /** Inicia el polling automático de mensajes */
  startMessagePolling: () => void;
  /** Detiene el polling automático de mensajes */
  stopMessagePolling: () => void;
  /** Alterna la visibilidad del menú móvil */
  toggleMobileMenu: () => void;
  /** Alterna la visibilidad del menú de usuario */
  toggleUserMenu: () => void;
  /** Alterna el modo oscuro */
  toggleDarkMode: () => void;
  /** Maneja el cierre de sesión */
  handleLogout: () => Promise<void>;
  /** Navega al perfil del usuario */
  navigateToProfile: () => void;
  /** Navega a la página de mensajes */
  navigateToMessages: () => void;
  /** Navega a la configuración */
  navigateToSettings: () => void;
  /** Navega al panel de administración */
  navigateToAdmin: () => void;
  /** Cierra el menú móvil */
  closeMobileMenu: () => void;
  /** Cierra el menú de usuario */
  closeUserMenu: () => void;
}

/**
 * Composable para la lógica del NavBar
 * Maneja autenticación, mensajes, menús móviles, modo oscuro y navegación
 * Incluye polling automático de mensajes no leídos para usuarios autenticados
 * 
 * @returns {UseNavBarReturn} Objeto con estados, propiedades computadas y métodos del NavBar
 * 
 * @example
 * ```typescript
 * const {
 *   showMobileMenu,
 *   isAuthenticated,
 *   unreadMessages,
 *   toggleMobileMenu,
 *   handleLogout,
 *   navigateToProfile
 * } = useNavBar()
 * 
 * // Alternar menú móvil
 * toggleMobileMenu()
 * 
 * // Verificar autenticación
 * if (isAuthenticated.value) {
 *   // Mensajes no leídos disponibles en unreadMessages.value
 * }
 * 
 * // Cerrar sesión
 * await handleLogout()
 * ```
 */
export function useNavBar(): UseNavBarReturn {
  const router = useRouter()
  const authStore = useAuthStore()
  const { logout } = useAuth()
  
  // Estados reactivos
  const showMobileMenu = ref<boolean>(false)
  const showUserMenu = ref<boolean>(false)
  const isDarkMode = ref<boolean>(false)
  const unreadMessages = ref<number>(0)
  const messageInterval = ref<NodeJS.Timeout | null>(null)
  
  // Propiedades computadas
  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const userName = computed(() => authStore.user?.name || 'Usuario')
  const userInitials = computed(() => {
    if (!authStore.user) return ''
    return getUserInitials(authStore.user)
  })
  const userAvatarUrl = computed(() => {
    if (!authStore.user) return null
    return getUserAvatarUrl(authStore.user)
  })
  
  // Funciones de utilidad
  const fetchUnreadMessages = async (): Promise<void> => {
    if (!isAuthenticated.value) return
    
    try {
      const response = await messageService.getUnreadMessages()
      
      if (response && response.count !== undefined) {
        unreadMessages.value = response.count
      } else if (response && response.data && Array.isArray(response.data)) {
        unreadMessages.value = response.data.length
      }
    } catch (err) {
      displayError(err, { customMessage: 'Error al obtener mensajes no leídos' })
    }
  }
  
  const toggleMobileMenu = (): void => {
    showMobileMenu.value = !showMobileMenu.value
    if (showMobileMenu.value) {
      showUserMenu.value = false
    }
  }
  
  const toggleUserMenu = (): void => {
    showUserMenu.value = !showUserMenu.value
  }
  
  const toggleDarkMode = (): void => {
    isDarkMode.value = !isDarkMode.value
    if (isDarkMode.value) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('darkMode', 'true')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('darkMode', 'false')
    }
  }
  
  const handleLogout = async (): Promise<void> => {
    try {
      await logout()
      showUserMenu.value = false
      showMobileMenu.value = false
      router.push('/')
    } catch (err) {
      displayError(err, { customMessage: 'Error al cerrar sesión' })
    }
  }
  
  const initializeDarkMode = (): void => {
    const savedDarkMode = localStorage.getItem('darkMode')
    if (savedDarkMode === 'true') {
      isDarkMode.value = true
      document.documentElement.classList.add('dark')
    }
  }
  
  const startMessagePolling = (): void => {
    if (messageInterval.value) return
    
    messageInterval.value = setInterval(() => {
      fetchUnreadMessages()
    }, 30000) // Cada 30 segundos
  }
  
  const stopMessagePolling = (): void => {
    if (messageInterval.value) {
      clearInterval(messageInterval.value)
      messageInterval.value = null
    }
  }
  
  // Lifecycle hooks
  onMounted(() => {
    initializeDarkMode()
    if (isAuthenticated.value) {
      fetchUnreadMessages()
      startMessagePolling()
    }
  })
  
  onUnmounted(() => {
    stopMessagePolling()
  })
  
  // Funciones de navegación
  /**
   * Navega al perfil del usuario
   * Cierra todos los menús abiertos después de la navegación
   */
  const navigateToProfile = (): void => {
    router.push('/profile')
    showUserMenu.value = false
    showMobileMenu.value = false
  }

  /**
   * Navega a la página de mensajes
   * Cierra todos los menús abiertos después de la navegación
   */
  const navigateToMessages = (): void => {
    router.push('/messages')
    showUserMenu.value = false
    showMobileMenu.value = false
  }

  /**
   * Navega a la página de configuración
   * Cierra todos los menús abiertos después de la navegación
   */
  const navigateToSettings = (): void => {
    router.push('/settings')
    showUserMenu.value = false
    showMobileMenu.value = false
  }

  /**
   * Navega al panel de administración
   * Cierra todos los menús abiertos después de la navegación
   * Solo disponible para usuarios con permisos de administrador
   */
  const navigateToAdmin = (): void => {
    router.push('/admin')
    showUserMenu.value = false
    showMobileMenu.value = false
  }

  /**
   * Cierra el menú móvil
   * Utilizado principalmente para cerrar el menú al hacer clic fuera de él
   */
  const closeMobileMenu = (): void => {
    showMobileMenu.value = false
  }

  /**
   * Cierra el menú de usuario
   * Utilizado principalmente para cerrar el menú al hacer clic fuera de él
   */
  const closeUserMenu = (): void => {
    showUserMenu.value = false
  }

  // Retorno del composable con todos los estados, propiedades computadas y métodos
  return {
    // Estados reactivos - Controlan la visibilidad de elementos UI y datos dinámicos
    showMobileMenu,      // Visibilidad del menú móvil
    showUserMenu,        // Visibilidad del menú desplegable de usuario
    isDarkMode,          // Estado del modo oscuro
    unreadMessages,      // Contador de mensajes no leídos
    messageInterval,     // Referencia al intervalo de polling de mensajes
    
    // Propiedades computadas - Valores derivados del estado de autenticación
    isAuthenticated,     // Estado de autenticación del usuario
    userName,            // Nombre del usuario autenticado
    userInitials,        // Iniciales del nombre del usuario
    userAvatarUrl,       // URL del avatar del usuario
    
    // Métodos - Funciones para interactuar con la UI y manejar eventos
    toggleMobileMenu,    // Alternar visibilidad del menú móvil
    toggleUserMenu,      // Alternar visibilidad del menú de usuario
    toggleDarkMode,      // Alternar modo oscuro
    handleLogout,        // Manejar cierre de sesión
    fetchUnreadMessages, // Obtener mensajes no leídos
    startMessagePolling, // Iniciar polling automático de mensajes
    stopMessagePolling,  // Detener polling automático de mensajes
    navigateToProfile,   // Navegar al perfil del usuario
    navigateToMessages,  // Navegar a mensajes
    navigateToSettings,  // Navegar a configuración
    navigateToAdmin,     // Navegar al panel de administración
    closeMobileMenu,     // Cerrar menú móvil
    closeUserMenu        // Cerrar menú de usuario
  }
}