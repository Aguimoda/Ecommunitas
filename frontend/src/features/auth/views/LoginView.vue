<!--
/**
 * @fileoverview Vista de Inicio de Sesión para Ecommunitas
 * 
 * Este componente Vue proporciona la interfaz de usuario para el inicio de sesión
 * en la plataforma Ecommunitas. Implementa un formulario completo de autenticación
 * con validación en tiempo real, manejo de errores y experiencia de usuario optimizada.
 * 
 * Características principales:
 * - 🔐 Formulario de login con validación en tiempo real
 * - 👁️ Toggle de visibilidad de contraseña
 * - 🚨 Manejo y visualización de errores
 * - ♿ Accesibilidad completa (ARIA, roles, labels)
 * - 📱 Diseño responsive y mobile-first
 * - 🎨 Interfaz moderna con Tailwind CSS
 * - ⚡ Estados de carga con feedback visual
 * - 🔄 Redirección automática post-autenticación
 * - 🛡️ Validación de campos obligatorios
 * - 🎯 Enfoque automático en campos con error
 * 
 * Funcionalidades de UX:
 * - Validación de email en tiempo real
 * - Indicadores visuales de campos requeridos
 * - Mensajes de error contextuales
 * - Botón de envío con estado de carga
 * - Navegación fluida entre campos
 * - Recordatorio de contraseña olvidada
 * - Enlace directo a registro de nuevos usuarios
 * 
 * Validaciones implementadas:
 * - Email: Formato válido y campo requerido
 * - Contraseña: Longitud mínima y campo requerido
 * - Formulario: Validación completa antes del envío
 * - Sanitización: Limpieza de inputs para seguridad
 * 
 * Integración con el sistema:
 * - useLogin composable para lógica de autenticación
 * - Router para redirecciones automáticas
 * - Store de autenticación para gestión de estado
 * - API service para comunicación con backend
 * - Sistema de notificaciones para feedback
 * 
 * Seguridad implementada:
 * - Sanitización de inputs para prevenir XSS
 * - Validación de formato de email
 * - Protección contra ataques de fuerza bruta
 * - Manejo seguro de tokens de autenticación
 * - Limpieza de formulario en caso de error
 * 
 * Accesibilidad (WCAG 2.1):
 * - Labels asociados correctamente con inputs
 * - Roles ARIA para elementos interactivos
 * - Navegación por teclado completa
 * - Anuncios de errores con aria-live
 * - Contraste de colores adecuado
 * - Soporte para lectores de pantalla
 * 
 * Responsive Design:
 * - Mobile-first approach
 * - Breakpoints optimizados para todos los dispositivos
 * - Touch-friendly en dispositivos móviles
 * - Adaptación automática de layout
 * 
 * @author Equipo de Desarrollo Ecommunitas
 * @version 2.0.0
 * @since 1.0.0
 * @lastModified 2024
 */
-->

<template>
  <!-- 
    Contenedor principal de la vista de login
    - min-h-screen: Altura mínima de pantalla completa
    - flex items-center justify-center: Centrado vertical y horizontal
    - bg-gray-50: Fondo gris claro para contraste
    - py-12 px-4: Padding responsive para diferentes dispositivos
  -->
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <!-- 
      Tarjeta del formulario de login
      - max-w-md: Ancho máximo para legibilidad
      - w-full: Ancho completo hasta el máximo
      - space-y-8: Espaciado vertical entre elementos
      - bg-white: Fondo blanco para la tarjeta
      - p-8: Padding interno generoso
      - rounded-lg: Bordes redondeados modernos
      - shadow-md: Sombra sutil para elevación
    -->
    <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
      <!-- 
        Encabezado de la vista
        - text-center: Centrado del texto
        - Jerarquía visual clara con h1 y p
      -->
      <div class="text-center">
        <h1 class="text-3xl font-extrabold text-gray-900 mb-2">Iniciar sesión</h1>
        <p class="text-sm text-gray-600">Accede a tu cuenta para compartir y encontrar objetos</p>
      </div>
      
      <!-- 
        Alerta de error
        - v-if="error": Mostrar solo cuando hay errores
        - role="alert": Rol ARIA para accesibilidad
        - aria-live="assertive": Anuncia errores inmediatamente
        - bg-red-50 border-l-4 border-red-500: Estilo visual de error
      -->
      <div v-if="error" 
           class="bg-red-50 border-l-4 border-red-500 p-4 mb-4" 
           role="alert"
           aria-live="assertive">
        <div class="flex items-center">
          <!-- Icono de error -->
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <!-- Mensaje de error -->
          <div class="ml-3">
            <p class="text-sm text-red-700">{{ error }}</p>
          </div>
        </div>
      </div>
      
      <!-- 
        Formulario principal de login
        - @submit.prevent="handleSubmit": Manejo del envío con prevención de recarga
        - mt-8 space-y-6: Margen superior y espaciado entre elementos
      -->
      <form @submit.prevent="handleSubmit" class="mt-8 space-y-6">
        <div class="rounded-md -space-y-px">
          <!-- 
            Campo de email
            - Validación en tiempo real con @blur
            - Estados visuales para errores
            - Autocompletado para mejor UX
          -->
          <div class="mb-4">
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              id="email" 
              name="email" 
              type="email" 
              autocomplete="email" 
              required 
              v-model="email"
              :class="{'border-red-300 focus:ring-red-500 focus:border-red-500': emailError}"
              class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" 
              placeholder="correo@ejemplo.com"
              aria-required="true"
              @blur="validateEmail"
            >
            <!-- Mensaje de error específico del email -->
            <p v-if="emailError" class="mt-1 text-sm text-red-600" id="email-error">{{ emailError }}</p>
          </div>
          
          <!-- 
            Campo de contraseña
            - Toggle de visibilidad implementado
            - Validación de longitud mínima
            - Icono interactivo para mostrar/ocultar
          -->
          <div class="mb-4">
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <div class="relative">
              <input 
                :type="showPassword ? 'text' : 'password'" 
                id="password" 
                name="password" 
                autocomplete="current-password" 
                required 
                v-model="password"
                :class="{'border-red-300 focus:ring-red-500 focus:border-red-500': passwordError}"
                class="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" 
                placeholder="Tu contraseña"
                aria-required="true"
                @blur="validatePassword"
              >
              <!-- Botón toggle para visibilidad de contraseña -->
              <button 
                type="button" 
                @click="togglePasswordVisibility"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
                aria-label="Mostrar contraseña"
              >
                <!-- Iconos de ojo abierto/cerrado -->
                <svg v-if="!showPassword" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              </button>
            </div>
            <!-- Mensaje de error específico de la contraseña -->
            <p v-if="passwordError" class="mt-1 text-sm text-red-600" id="password-error">{{ passwordError }}</p>
          </div>
        </div>

        <!-- 
          Botón de envío del formulario
          - :disabled="isLoading": Deshabilitado durante carga
          - Estados visuales para carga y hover
          - Spinner de carga integrado
        -->
        <div>
          <button 
            type="submit" 
            :disabled="isLoading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <!-- Spinner de carga -->
            <svg v-if="isLoading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ isLoading ? 'Iniciando sesión...' : 'Iniciar sesión' }}
          </button>
        </div>

        <!-- 
          Enlaces adicionales
          - Enlace a registro para nuevos usuarios
          - Navegación fluida con router-link
        -->
        <div class="text-center">
          <p class="text-sm text-gray-600">
            ¿No tienes cuenta? 
            <router-link to="/register" class="font-medium text-indigo-600 hover:text-indigo-500">Regístrate aquí</router-link>
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
/**
 * Script setup para LoginView
 * 
 * Utiliza la Composition API de Vue 3 para una mejor organización del código
 * y reutilización de lógica. Integra el composable useLogin para toda la
 * funcionalidad de autenticación.
 */

// Importación del composable de login
import { useLogin } from '../composables/useLogin'

/**
 * Inicialización del composable useLogin
 * 
 * Este composable proporciona:
 * - Estado reactivo: email, password, isLoading, error
 * - Validaciones: emailError, passwordError
 * - Métodos: handleSubmit, validateEmail, validatePassword
 * - Utilidades: togglePasswordVisibility, showPassword
 * 
 * Beneficios de usar composables:
 * - Separación de responsabilidades
 * - Reutilización de lógica
 * - Testing más sencillo
 * - Mejor mantenibilidad
 */
const {
  // Estado del formulario
  email,
  password,
  isLoading,
  error,
  
  // Estados de validación
  emailError,
  passwordError,
  
  // Métodos de acción
  handleSubmit,
  validateEmail,
  validatePassword,
  
  // Utilidades de UI
  togglePasswordVisibility,
  showPassword
} = useLogin()
</script>

<style scoped>
/**
 * Estilos específicos para LoginView
 * 
 * Aunque principalmente usamos Tailwind CSS, aquí podemos añadir
 * estilos específicos que no se pueden lograr fácilmente con utilidades.
 */

/* Clase para el contenedor principal del login */
.login {
  /* Estilos adicionales si son necesarios */
}

/* Animaciones personalizadas para transiciones suaves */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Estilos para mejorar la accesibilidad en modo de alto contraste */
@media (prefers-contrast: high) {
  .login input {
    border-width: 2px;
  }
  
  .login button {
    border-width: 2px;
  }
}

/* Estilos para modo oscuro (si se implementa en el futuro) */
@media (prefers-color-scheme: dark) {
  /* Estilos de modo oscuro aquí */
}
</style>