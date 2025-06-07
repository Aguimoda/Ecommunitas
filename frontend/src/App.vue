<!--
/**
 * @file App.vue
 * @description Componente raíz de la aplicación Ecommunitas
 * 
 * Este es el componente principal que actúa como punto de entrada de toda la aplicación.
 * Se encarga de:
 * - Configurar la estructura básica del layout
 * - Inicializar el sistema de autenticación
 * - Configurar interceptores de Axios para manejo de tokens
 * - Proporcionar el contenedor para todas las vistas de la aplicación
 * - Aplicar estilos globales y soporte para modo oscuro
 * 
 * Características principales:
 * - Layout responsivo con navegación superior
 * - Inicialización automática del estado de autenticación
 * - Configuración de interceptores HTTP para autenticación automática
 * - Soporte completo para modo oscuro
 * - Transiciones suaves entre temas
 * 
 * @author Equipo de Desarrollo Ecommunitas
 * @version 1.0.0
 */
-->
<template>
  <!-- Contenedor principal de la aplicación -->
  <!-- Utiliza clases de Tailwind CSS para layout responsivo y soporte de modo oscuro -->
  <div id="app" class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
    <!-- Barra de navegación superior -->
    <!-- Componente reutilizable que se muestra en todas las páginas -->
    <NavBar />
    
    <!-- Contenedor principal para el contenido de las páginas -->
    <!-- Aquí se renderizan todas las vistas de la aplicación mediante Vue Router -->
    <main>
      <!-- Vue Router outlet - aquí se cargan dinámicamente las diferentes vistas -->
      <router-view />
    </main>
  </div>
</template>

<!--
/**
 * Script del componente principal
 * Utiliza la Composition API de Vue 3 con <script setup>
 * Maneja la inicialización de la aplicación y configuración global
 */
-->
<script setup>
// Importaciones de Vue y librerías externas
import { onMounted } from 'vue'
import axios from 'axios'

// Importaciones de componentes locales
import { NavBar } from '@/shared/components'

// Importaciones de stores (gestión de estado)
import { useAuthStore } from '@/features/auth'

/**
 * Inicialización del store de autenticación
 * Este store maneja todo el estado relacionado con la autenticación del usuario
 */
const authStore = useAuthStore()

/**
 * Hook de ciclo de vida - se ejecuta cuando el componente se monta
 * Configura la aplicación y inicializa servicios críticos
 */
onMounted(async () => {
  /**
   * Configuración de Axios
   * No configuramos baseURL porque usamos el proxy de Vite
   * que ya está configurado en vite.config.js para redirigir
   * las peticiones al backend en desarrollo
   */
  
  /**
   * Inicialización del sistema de autenticación
   * Verifica si hay un token válido almacenado y restaura la sesión del usuario
   */
  await authStore.initialize()
  
  /**
   * Configuración de interceptor de Axios para peticiones
   * Agrega automáticamente el token de autenticación a todas las peticiones HTTP
   * Esto evita tener que agregar manualmente el token en cada llamada a la API
   */
  axios.interceptors.request.use(
    config => {
      console.log('🌐 [DEBUG] Axios Request Interceptor:')
      console.log('🌐 [DEBUG] URL:', config.url)
      console.log('🌐 [DEBUG] Method:', config.method)
      console.log('🌐 [DEBUG] BaseURL:', config.baseURL)
      console.log('🌐 [DEBUG] Data:', config.data)
      
      // Obtener el token del localStorage
      const token = localStorage.getItem('token')
      console.log('🌐 [DEBUG] Token from localStorage:', !!token)
      
      // Si existe un token, agregarlo al header Authorization
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
        console.log('🌐 [DEBUG] Authorization header added')
      }
      
      console.log('🌐 [DEBUG] Final headers:', config.headers)
      return config
    }, 
    error => {
      console.error('💥 [DEBUG] Axios Request Error:', error)
      // Manejar errores en la configuración de la petición
      return Promise.reject(error)
    }
  )
  
  /**
   * Opcional: Configurar interceptor para respuestas
   * Podría usarse para manejar errores globales como tokens expirados
   */
  axios.interceptors.response.use(
    response => {
      console.log('✅ [DEBUG] Axios Response Interceptor:')
      console.log('✅ [DEBUG] Status:', response.status)
      console.log('✅ [DEBUG] URL:', response.config.url)
      console.log('✅ [DEBUG] Data:', response.data)
      // Retornar la respuesta sin modificaciones si es exitosa
      return response
    },
    error => {
      console.error('💥 [DEBUG] Axios Response Error:')
      console.error('💥 [DEBUG] Status:', error.response?.status)
      console.error('💥 [DEBUG] URL:', error.config?.url)
      console.error('💥 [DEBUG] Error data:', error.response?.data)
      console.error('💥 [DEBUG] Full error:', error)
      
      // Manejar errores de respuesta globalmente
      if (error.response?.status === 401) {
        console.log('🔒 [DEBUG] 401 Error - Logging out user')
        // Token expirado o inválido - limpiar sesión
        authStore.logout()
      }
      
      return Promise.reject(error)
    }
  )
})
</script>

<!--
/**
 * Estilos globales de la aplicación
 * Define la apariencia base y variables CSS para toda la aplicación
 */
-->
<style>
/**
 * Estilos para el contenedor principal de la aplicación
 * Establece la tipografía base y propiedades de renderizado
 */
#app {
  /* Pila de fuentes optimizada para legibilidad y compatibilidad */
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  
  /* Suavizado de fuentes para mejor renderizado */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  
  /* Color de texto base para modo claro */
  color: #2c3e50;
}

/**
 * Estilos para modo oscuro
 * Ajusta los colores cuando el usuario prefiere el tema oscuro
 */
.dark #app {
  /* Color de texto optimizado para fondos oscuros */
  color: #e2e8f0;
}

/**
 * Variables CSS personalizadas para el sistema de diseño
 * Facilita el mantenimiento y consistencia visual
 */
:root {
  /* Colores primarios */
  --color-primary: #4f46e5;
  --color-primary-dark: #3730a3;
  
  /* Colores de estado */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  
  /* Espaciado base */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  
  /* Bordes redondeados */
  --border-radius-sm: 0.25rem;
  --border-radius-md: 0.375rem;
  --border-radius-lg: 0.5rem;
  
  /* Sombras */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  
  /* Transiciones */
  --transition-fast: 150ms ease-in-out;
  --transition-normal: 200ms ease-in-out;
  --transition-slow: 300ms ease-in-out;
}

/**
 * Variables para modo oscuro
 * Redefine colores para mejor contraste en temas oscuros
 */
.dark {
  --color-primary: #6366f1;
  --color-primary-dark: #4338ca;
}

/**
 * Estilos de reset y normalización
 * Asegura consistencia entre navegadores
 */
*, *::before, *::after {
  box-sizing: border-box;
}

/**
 * Estilos para elementos de formulario
 * Mejora la accesibilidad y experiencia de usuario
 */
input, textarea, select {
  /* Hereda la fuente del contenedor padre */
  font-family: inherit;
}

/**
 * Estilos para elementos de enfoque
 * Mejora la accesibilidad para navegación por teclado
 */
:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/**
 * Estilos para elementos deshabilitados
 * Proporciona feedback visual claro
 */
:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/**
 * Estilos para scrollbars personalizados (Webkit)
 * Mejora la apariencia en navegadores compatibles
 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Scrollbars para modo oscuro */
.dark ::-webkit-scrollbar-track {
  background: #1e293b;
}

.dark ::-webkit-scrollbar-thumb {
  background: #475569;
}

.dark ::-webkit-scrollbar-thumb:hover {
  background: #64748b;
}

/**
 * Clases utilitarias personalizadas
 * Complementan las clases de Tailwind CSS
 */
.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.text-truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.text-truncate-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/**
 * Animaciones personalizadas
 * Mejora la experiencia visual de la aplicación
 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideIn {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}

.fade-in {
  animation: fadeIn var(--transition-normal) ease-out;
}

.slide-in {
  animation: slideIn var(--transition-normal) ease-out;
}

/**
 * Estilos para impresión
 * Optimiza la apariencia cuando se imprime la página
 */
@media print {
  #app {
    color: black !important;
    background: white !important;
  }
  
  /* Ocultar elementos no necesarios en impresión */
  nav, .no-print {
    display: none !important;
  }
}
</style>