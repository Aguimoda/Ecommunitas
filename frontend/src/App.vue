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
// ============================================================================
// IMPORTACIONES DE DEPENDENCIAS EXTERNAS
// ============================================================================

/**
 * Importaciones de Vue y librerías externas
 * - onMounted: Hook de ciclo de vida para ejecutar código al montar el componente
 * - axios: Cliente HTTP para comunicación con la API
 */
import { onMounted } from 'vue'
import axios from 'axios'

// ============================================================================
// IMPORTACIONES DE COMPONENTES LOCALES
// ============================================================================

/**
 * Importación del componente de navegación
 * NavBar es el componente que se muestra en la parte superior de todas las páginas
 */
import { NavBar } from '@/shared/components'

// ============================================================================
// IMPORTACIONES DE STORES (GESTIÓN DE ESTADO)
// ============================================================================

/**
 * Importación del store de autenticación
 * Maneja todo el estado relacionado con la sesión del usuario
 */
import { useAuthStore } from '@/features/auth'

// ============================================================================
// INICIALIZACIÓN DE STORES
// ============================================================================

/**
 * Inicialización del store de autenticación
 * Este store maneja todo el estado relacionado con la autenticación del usuario:
 * - Estado de login/logout
 * - Información del usuario actual
 * - Tokens de autenticación
 * - Permisos y roles
 */
const authStore = useAuthStore()

// ============================================================================
// CONFIGURACIÓN DE CICLO DE VIDA
// ============================================================================

/**
 * Hook de ciclo de vida - se ejecuta cuando el componente se monta
 * 
 * Esta función es crítica para la inicialización de la aplicación y se encarga de:
 * 1. Configurar interceptores de Axios para autenticación automática
 * 2. Inicializar el sistema de autenticación
 * 3. Configurar manejo global de errores HTTP
 * 4. Establecer configuraciones base para la comunicación con la API
 * 
 * @async
 * @throws {Error} Si falla la inicialización de algún servicio crítico
 */
onMounted(async () => {
  // ==========================================================================
  // CONFIGURACIÓN DE AXIOS
  // ==========================================================================
  
  /**
   * Configuración de Axios
   * 
   * NOTA IMPORTANTE: No configuramos baseURL porque usamos el proxy de Vite
   * que ya está configurado en vite.config.js para redirigir automáticamente
   * las peticiones al backend en desarrollo.
   * 
   * En producción, las peticiones se realizan al mismo dominio donde está
   * desplegado el frontend, asumiendo que el backend está en el mismo servidor.
   */
  
  // ==========================================================================
  // INICIALIZACIÓN DEL SISTEMA DE AUTENTICACIÓN
  // ==========================================================================
  
  /**
   * Inicialización del sistema de autenticación
   * 
   * Esta función verifica si hay un token válido almacenado en localStorage
   * y restaura la sesión del usuario si es válido. Incluye:
   * - Verificación de token en localStorage
   * - Validación del token con el backend
   * - Carga de información del usuario
   * - Configuración de estado de autenticación
   * 
   * @async
   * @throws {Error} Si falla la validación del token
   */
  await authStore.initialize()
  
  // ==========================================================================
  // CONFIGURACIÓN DE INTERCEPTORES DE AXIOS
  // ==========================================================================
  
  /**
   * Configuración de interceptor de Axios para peticiones
   * 
   * Este interceptor se ejecuta antes de cada petición HTTP y se encarga de:
   * - Agregar automáticamente el token de autenticación
   * - Registrar información de debug en desarrollo
   * - Configurar headers necesarios
   * 
   * Esto evita tener que agregar manualmente el token en cada llamada a la API
   * y centraliza la lógica de autenticación.
   * 
   * @param {Object} config - Configuración de la petición Axios
   * @returns {Object} Configuración modificada con headers de autenticación
   */
  axios.interceptors.request.use(
    config => {
      // Obtener el token del localStorage
      const token = localStorage.getItem('token')
      
      // Si existe un token, agregarlo al header Authorization
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      
      return config
    }, 
    error => {
      // Manejar errores en la configuración de la petición
      return Promise.reject(error)
    }
  )
  
  /**
   * Configuración de interceptor para respuestas HTTP
   * 
   * Este interceptor se ejecuta después de cada respuesta HTTP y maneja:
   * - Logging de respuestas exitosas en desarrollo
   * - Manejo global de errores de autenticación (401)
   * - Logout automático cuando el token expira
   * - Logging de errores para debugging
   * 
   * @param {Object} response - Respuesta exitosa de Axios
   * @returns {Object} Respuesta sin modificaciones
   * 
   * @param {Object} error - Error de respuesta HTTP
   * @throws {Error} Re-lanza el error después del manejo
   */
  axios.interceptors.response.use(
    response => {
      // Retornar la respuesta sin modificaciones si es exitosa
      return response
    },
    error => {
      // Manejar errores de autenticación globalmente
      if (error.response?.status === 401) {
        
        /**
         * Token expirado o inválido - limpiar sesión
         * 
         * Cuando recibimos un error 401, significa que:
         * - El token ha expirado
         * - El token es inválido
         * - El usuario no tiene permisos
         * 
         * En todos estos casos, la mejor práctica es hacer logout
         * automático para limpiar el estado y redirigir al login.
         */
        authStore.logout()
      }
      
      // Re-lanzar el error para que los componentes puedan manejarlo
      return Promise.reject(error)
    }
  )
  
  /**
   * NOTAS DE DESARROLLO:
   * 
   * 1. INTERCEPTORES DE AXIOS:
   *    - Los interceptores se configuran una sola vez al inicializar la app
   *    - Se aplican automáticamente a todas las peticiones HTTP
   *    - Centralizan la lógica de autenticación y manejo de errores
   * 
   * 2. MANEJO DE TOKENS:
   *    - Los tokens se almacenan en localStorage
   *    - Se agregan automáticamente a cada petición
   *    - Se validan en cada respuesta 401
   * 
   * 3. DEBUGGING:
   *    - Los console.log se pueden remover en producción
   *    - Ayudan a debuggear problemas de comunicación con la API
   *    - Muestran el flujo completo de peticiones y respuestas
   * 
   * 4. SEGURIDAD:
   *    - Los tokens nunca se exponen en URLs
   *    - Se usan headers Authorization estándar
   *    - Se limpian automáticamente en caso de expiración
   */
})
</script>

<!--
/**
 * @section Estilos Globales de la Aplicación
 * @description Define la apariencia base, variables CSS y estilos globales para toda la aplicación
 * 
 * Este archivo contiene:
 * - Tipografía base y renderizado de fuentes
 * - Variables CSS del sistema de diseño
 * - Estilos para modo oscuro/claro
 * - Reset y normalización de estilos
 * - Clases utilitarias personalizadas
 * - Animaciones y transiciones
 * - Estilos para impresión
 */
-->
<style>
/* ============================================================================
 * ESTILOS BASE DE LA APLICACIÓN
 * ============================================================================ */

/**
 * Contenedor principal de la aplicación
 * Establece la tipografía base y propiedades de renderizado optimizadas
 */
#app {
  /* Pila de fuentes optimizada para legibilidad y compatibilidad cross-platform */
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  
  /* Suavizado de fuentes para mejor renderizado en pantallas de alta densidad */
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
  /* Color de texto optimizado para fondos oscuros con buen contraste */
  color: #e2e8f0;
}

/* ============================================================================
 * VARIABLES CSS DEL SISTEMA DE DISEÑO
 * ============================================================================ */

/**
 * Variables CSS personalizadas para el sistema de diseño
 * Facilita el mantenimiento, consistencia visual y escalabilidad
 * 
 * Estas variables se usan en toda la aplicación para mantener
 * coherencia en colores, espaciado, sombras y transiciones
 */
:root {
  /* === PALETA DE COLORES === */
  /* Colores primarios de la marca */
  --color-primary: #4f46e5;        /* Índigo principal */
  --color-primary-dark: #3730a3;   /* Índigo oscuro para hover/active */
  
  /* Colores de estado para feedback visual */
  --color-success: #10b981;        /* Verde para éxito */
  --color-warning: #f59e0b;        /* Amarillo para advertencias */
  --color-error: #ef4444;          /* Rojo para errores */
  
  /* === SISTEMA DE ESPACIADO === */
  /* Basado en múltiplos de 0.25rem (4px) para consistencia */
  --spacing-xs: 0.25rem;   /* 4px */
  --spacing-sm: 0.5rem;    /* 8px */
  --spacing-md: 1rem;      /* 16px */
  --spacing-lg: 1.5rem;    /* 24px */
  --spacing-xl: 2rem;      /* 32px */
  
  /* === BORDES REDONDEADOS === */
  /* Progresión suave para diferentes elementos */
  --border-radius-sm: 0.25rem;  /* 4px - botones pequeños */
  --border-radius-md: 0.375rem; /* 6px - inputs, cards */
  --border-radius-lg: 0.5rem;   /* 8px - modales, containers */
  
  /* === SISTEMA DE SOMBRAS === */
  /* Elevación progresiva para jerarquía visual */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);      /* Sombra sutil */
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);     /* Sombra media */
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);   /* Sombra pronunciada */
  
  /* === TRANSICIONES === */
  /* Duraciones estándar para animaciones fluidas */
  --transition-fast: 150ms ease-in-out;    /* Micro-interacciones */
  --transition-normal: 200ms ease-in-out;  /* Transiciones estándar */
  --transition-slow: 300ms ease-in-out;    /* Animaciones complejas */
}

/**
 * Variables específicas para modo oscuro
 * Redefine colores para mejor contraste y legibilidad en temas oscuros
 */
.dark {
  /* Ajuste de colores primarios para mejor visibilidad en fondos oscuros */
  --color-primary: #6366f1;        /* Índigo más claro */
  --color-primary-dark: #4338ca;   /* Índigo medio para contraste */
}

/* ============================================================================
 * RESET Y NORMALIZACIÓN DE ESTILOS
 * ============================================================================ */

/**
 * Reset universal para box-sizing
 * Asegura que padding y border se incluyan en el ancho/alto total
 * Mejora la predictibilidad del layout
 */
*, *::before, *::after {
  box-sizing: border-box;
}

/* ============================================================================
 * ESTILOS PARA FORMULARIOS Y ACCESIBILIDAD
 * ============================================================================ */

/**
 * Normalización de elementos de formulario
 * Asegura herencia de tipografía y comportamiento consistente
 */
input, textarea, select {
  /* Hereda la fuente del contenedor padre para consistencia visual */
  font-family: inherit;
}

/**
 * Estilos de enfoque para accesibilidad
 * Proporciona indicadores visuales claros para navegación por teclado
 * Cumple con las pautas WCAG para contraste y visibilidad
 */
:focus {
  /* Outline visible con color de marca y separación adecuada */
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/**
 * Estilos para elementos deshabilitados
 * Proporciona feedback visual claro sobre la interactividad
 */
:disabled {
  /* Reduce opacidad para indicar estado inactivo */
  opacity: 0.6;
  /* Cursor que indica que el elemento no es interactivo */
  cursor: not-allowed;
}

/* ============================================================================
 * SCROLLBARS PERSONALIZADOS
 * ============================================================================ */

/**
 * Scrollbars personalizados para navegadores Webkit (Chrome, Safari, Edge)
 * Mejora la apariencia visual y mantiene consistencia con el diseño
 */
::-webkit-scrollbar {
  /* Tamaño compacto para no interferir con el contenido */
  width: 8px;
  height: 8px;
}

/**
 * Track (fondo) del scrollbar para modo claro
 */
::-webkit-scrollbar-track {
  background: #f1f5f9;  /* Gris muy claro */
}

/**
 * Thumb (indicador) del scrollbar para modo claro
 */
::-webkit-scrollbar-thumb {
  background: #cbd5e1;   /* Gris medio */
  border-radius: 4px;    /* Bordes redondeados */
}

/**
 * Estado hover del thumb para mejor interactividad
 */
::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;   /* Gris más oscuro en hover */
}

/**
 * Scrollbars para modo oscuro
 * Colores adaptados para mejor contraste en fondos oscuros
 */
.dark ::-webkit-scrollbar-track {
  background: #1e293b;   /* Gris oscuro */
}

.dark ::-webkit-scrollbar-thumb {
  background: #475569;   /* Gris medio oscuro */
}

.dark ::-webkit-scrollbar-thumb:hover {
  background: #64748b;   /* Gris claro en hover */
}

/* ============================================================================
 * CLASES UTILITARIAS PERSONALIZADAS
 * ============================================================================ */

/**
 * Clases utilitarias para truncamiento de texto
 * Complementan las clases de Tailwind CSS con funcionalidades específicas
 * Útiles para mantener layouts consistentes con contenido variable
 */

/* Truncamiento en una sola línea con puntos suspensivos */
.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Truncamiento a 2 líneas usando line-clamp */
.text-truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Truncamiento a 3 líneas usando line-clamp */
.text-truncate-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ============================================================================
 * ANIMACIONES Y TRANSICIONES PERSONALIZADAS
 * ============================================================================ */

/**
 * Animación de aparición suave (fade in)
 * Útil para elementos que aparecen dinámicamente
 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);  /* Ligero movimiento vertical */
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/**
 * Animación de deslizamiento horizontal
 * Ideal para menús laterales y elementos que entran desde el lado
 */
@keyframes slideIn {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}

/**
 * Clases para aplicar animaciones
 * Usan las variables CSS de transición para consistencia
 */
.fade-in {
  animation: fadeIn var(--transition-normal) ease-out;
}

.slide-in {
  animation: slideIn var(--transition-normal) ease-out;
}

/* ============================================================================
 * ESTILOS PARA IMPRESIÓN
 * ============================================================================ */

/**
 * Media query para optimizar la apariencia en impresión
 * Asegura legibilidad y ahorra tinta al imprimir
 */
@media print {
  /* Forzar colores de alto contraste para impresión */
  #app {
    color: black !important;
    background: white !important;
  }
  
  /* Ocultar elementos de navegación y elementos marcados como no imprimibles */
  nav, .no-print {
    display: none !important;
  }
  
  /* Optimizaciones adicionales para impresión */
  * {
    /* Evitar que los elementos se rompan entre páginas */
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
</style>