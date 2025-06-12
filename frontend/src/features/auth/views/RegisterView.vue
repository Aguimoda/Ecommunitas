<!--
/**
 * @fileoverview Vista de Registro para Ecommunitas
 * 
 * Este componente Vue proporciona la interfaz de usuario para el registro de nuevos usuarios
 * en la plataforma Ecommunitas. Implementa un formulario completo de registro con validación
 * en tiempo real, confirmación de contraseña y experiencia de usuario optimizada.
 * 
 * Características principales:
 * - 📝 Formulario de registro con validación completa
 * - 👁️ Toggle de visibilidad para ambas contraseñas
 * - 🔒 Confirmación de contraseña con validación cruzada
 * - 🚨 Manejo y visualización de errores específicos
 * - ♿ Accesibilidad completa (ARIA, roles, labels)
 * - 📱 Diseño responsive y mobile-first
 * - 🎨 Interfaz moderna con Tailwind CSS
 * - ⚡ Estados de carga con feedback visual
 * - 🔄 Redirección automática post-registro
 * - 🛡️ Validación de todos los campos obligatorios
 * - 🎯 Enfoque automático en campos con error
 * 
 * Funcionalidades de UX:
 * - Validación de nombre en tiempo real
 * - Validación de email con formato correcto
 * - Validación de contraseña con requisitos de seguridad
 * - Confirmación de contraseña con coincidencia exacta
 * - Indicadores visuales de campos requeridos
 * - Mensajes de error contextuales y específicos
 * - Botón de envío con estado de carga
 * - Navegación fluida entre campos
 * - Enlace directo a login para usuarios existentes
 * 
 * Validaciones implementadas:
 * - Nombre: Longitud mínima y caracteres válidos
 * - Email: Formato válido y unicidad
 * - Contraseña: Longitud mínima, complejidad y seguridad
 * - Confirmación: Coincidencia exacta con contraseña
 * - Formulario: Validación completa antes del envío
 * - Sanitización: Limpieza de inputs para seguridad
 * 
 * Integración con el sistema:
 * - useRegister composable para lógica de registro
 * - Router para redirecciones automáticas
 * - Store de autenticación para gestión de estado
 * - API service para comunicación con backend
 * - Sistema de notificaciones para feedback
 * - Validación de email único en servidor
 * 
 * Seguridad implementada:
 * - Sanitización de inputs para prevenir XSS
 * - Validación de formato de email
 * - Requisitos de contraseña segura
 * - Confirmación de contraseña obligatoria
 * - Protección contra registros duplicados
 * - Manejo seguro de datos sensibles
 * - Limpieza de formulario en caso de error
 * 
 * Accesibilidad (WCAG 2.1):
 * - Labels asociados correctamente con inputs
 * - Roles ARIA para elementos interactivos
 * - Navegación por teclado completa
 * - Anuncios de errores con aria-live
 * - Contraste de colores adecuado
 * - Soporte para lectores de pantalla
 * - Descripción de requisitos de campos
 * 
 * Responsive Design:
 * - Mobile-first approach
 * - Breakpoints optimizados para todos los dispositivos
 * - Touch-friendly en dispositivos móviles
 * - Adaptación automática de layout
 * - Formulario optimizado para pantallas pequeñas
 * 
 * @author Equipo de Desarrollo Ecommunitas
 * @version 2.0.0
 * @since 1.0.0
 * @lastModified 2024
 */
-->

<template>
  <!-- 
    Contenedor principal de la vista de registro
    - min-h-screen: Altura mínima de pantalla completa
    - flex items-center justify-center: Centrado vertical y horizontal
    - bg-gray-50: Fondo gris claro para contraste
    - py-12 px-4: Padding responsive para diferentes dispositivos
  -->
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <!-- 
      Tarjeta del formulario de registro
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
        <h1 class="text-3xl font-extrabold text-gray-900 mb-2">Registro</h1>
        <p class="text-sm text-gray-600">Crea tu cuenta para compartir y encontrar objetos</p>
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
        Formulario principal de registro
        - @submit.prevent="handleSubmit": Manejo del envío con prevención de recarga
        - mt-8 space-y-6: Margen superior y espaciado entre elementos
      -->
      <form @submit.prevent="handleSubmit" class="mt-8 space-y-6">
        <div class="rounded-md -space-y-px">
          <!-- 
            Campo de nombre
            - Validación de longitud y caracteres
            - Autocompletado para mejor UX
            - Estados visuales para errores
          -->
          <div class="mb-4">
            <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input 
              id="name" 
              name="name" 
              type="text" 
              autocomplete="name" 
              required 
              v-model="name"
              :class="{'border-red-300 focus:ring-red-500 focus:border-red-500': nameError}"
              class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" 
              placeholder="Tu nombre completo"
              aria-required="true"
              @blur="validateName"
            >
            <!-- Mensaje de error específico del nombre -->
            <p v-if="nameError" class="mt-1 text-sm text-red-600" id="name-error">{{ nameError }}</p>
          </div>
          
          <!-- 
            Campo de email
            - Validación de formato y unicidad
            - Autocompletado para mejor UX
            - Estados visuales para errores
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
            - Validación de seguridad y complejidad
            - Icono interactivo para mostrar/ocultar
          -->
          <div class="mb-4">
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <div class="relative">
              <input 
                :type="showPassword ? 'text' : 'password'" 
                id="password" 
                name="password" 
                autocomplete="new-password" 
                required 
                v-model="password"
                :class="{'border-red-300 focus:ring-red-500 focus:border-red-500': passwordError}"
                class="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" 
                placeholder="Tu contraseña segura"
                aria-required="true"
                @blur="validatePassword"
              >
              <!-- Botón toggle para visibilidad de contraseña -->
              <button 
                type="button" 
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                @click="togglePasswordVisibility"
                aria-label="Mostrar contraseña"
              >
                <!-- Iconos de ojo abierto/cerrado -->
                <svg v-if="showPassword" class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                </svg>
                <svg v-else class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clip-rule="evenodd" />
                  <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                </svg>
              </button>
            </div>
            <!-- Mensaje de error específico de la contraseña -->
            <p v-if="passwordError" class="mt-1 text-sm text-red-600" id="password-error">{{ passwordError }}</p>
          </div>
          
          <!-- 
            Campo de confirmación de contraseña
            - Toggle de visibilidad independiente
            - Validación de coincidencia con contraseña principal
            - Icono interactivo para mostrar/ocultar
          -->
          <div class="mb-4">
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña</label>
            <div class="relative">
              <input 
                :type="showConfirmPassword ? 'text' : 'password'" 
                id="confirmPassword" 
                name="confirmPassword" 
                autocomplete="new-password" 
                required 
                v-model="confirmPassword"
                :class="{'border-red-300 focus:ring-red-500 focus:border-red-500': confirmPasswordError}"
                class="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" 
                placeholder="Confirma tu contraseña"
                aria-required="true"
                @blur="validateConfirmPassword"
              >
              <!-- Botón toggle para visibilidad de confirmación de contraseña -->
              <button 
                type="button" 
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                @click="toggleConfirmPasswordVisibility"
                aria-label="Mostrar confirmación de contraseña"
              >
                <!-- Iconos de ojo abierto/cerrado -->
                <svg v-if="showConfirmPassword" class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                </svg>
                <svg v-else class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clip-rule="evenodd" />
                  <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                </svg>
              </button>
            </div>
            <!-- Mensaje de error específico de la confirmación de contraseña -->
            <p v-if="confirmPasswordError" class="mt-1 text-sm text-red-600" id="confirm-password-error">{{ confirmPasswordError }}</p>
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
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            :disabled="isLoading"
          >
            <!-- Spinner de carga -->
            <span v-if="isLoading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            {{ isLoading ? 'Registrando...' : 'Registrarse' }}
          </button>
        </div>
        
        <!-- 
          Enlaces adicionales
          - Enlace a login para usuarios existentes
          - Navegación fluida con router-link
        -->
        <div class="text-center mt-4">
          <p class="text-sm text-gray-600">
            ¿Ya tienes cuenta? 
            <router-link to="/login" class="font-medium text-indigo-600 hover:text-indigo-500">Inicia sesión aquí</router-link>
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
/**
 * Script setup para RegisterView
 * 
 * Utiliza la Composition API de Vue 3 para una mejor organización del código
 * y reutilización de lógica. Integra el composable useRegister para toda la
 * funcionalidad de registro de usuarios.
 */

// Importación del composable de registro
import { useRegister } from '../composables/useRegister'

/**
 * Inicialización del composable useRegister
 * 
 * Este composable proporciona:
 * - Estado reactivo: name, email, password, confirmPassword, isLoading, error
 * - Validaciones: nameError, emailError, passwordError, confirmPasswordError
 * - Métodos: handleSubmit, validateName, validateEmail, validatePassword, validateConfirmPassword
 * - Utilidades: togglePasswordVisibility, toggleConfirmPasswordVisibility, showPassword, showConfirmPassword
 * 
 * Beneficios de usar composables:
 * - Separación de responsabilidades
 * - Reutilización de lógica entre componentes
 * - Testing más sencillo y aislado
 * - Mejor mantenibilidad del código
 * - Lógica de negocio centralizada
 */
const {
  // Estados del formulario
  name,
  email,
  password,
  confirmPassword,
  error,
  
  // Estados de validación
  nameError,
  emailError,
  passwordError,
  confirmPasswordError,
  isLoading,
  
  // Estados de visibilidad
  showPassword,
  showConfirmPassword,
  
  // Métodos de validación
  validateName,
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  
  // Utilidades de UI
  togglePasswordVisibility,
  toggleConfirmPasswordVisibility,
  
  // Método principal
  handleSubmit
} = useRegister()
</script>

<style scoped>
/**
 * Estilos específicos para RegisterView
 * 
 * Aunque principalmente usamos Tailwind CSS, aquí podemos añadir
 * estilos específicos que no se pueden lograr fácilmente con utilidades.
 */

/* Importación de estilos comunes */
@import '@/assets/styles/common.css';

/* Clase para el contenedor principal del registro */
.register {
  @apply main-container;
  max-width: 400px;
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
  .register input {
    border-width: 2px;
  }
  
  .register button {
    border-width: 2px;
  }
}

/* Estilos para modo oscuro (si se implementa en el futuro) */
@media (prefers-color-scheme: dark) {
  /* Estilos de modo oscuro aquí */
}

/* Estilos específicos para validación de campos */
.field-valid {
  @apply border-green-300 focus:ring-green-500 focus:border-green-500;
}

.field-invalid {
  @apply border-red-300 focus:ring-red-500 focus:border-red-500;
}

/* Animación para mensajes de error */
.error-message {
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>