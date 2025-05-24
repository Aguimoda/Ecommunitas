<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
      <div class="text-center">
        <h1 class="text-3xl font-extrabold text-gray-900 mb-2">Registro</h1>
        <p class="text-sm text-gray-600">Crea tu cuenta para compartir y encontrar objetos</p>
      </div>
      
      <!-- Alerta de error -->
      <div v-if="error" 
           class="bg-red-50 border-l-4 border-red-500 p-4 mb-4" 
           role="alert"
           aria-live="assertive">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-red-700">{{ error }}</p>
          </div>
        </div>
      </div>
      
      <form @submit.prevent="handleSubmit" class="mt-8 space-y-6">
        <div class="rounded-md -space-y-px">
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
            <p v-if="nameError" class="mt-1 text-sm text-red-600" id="name-error">{{ nameError }}</p>
          </div>
          
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
            <p v-if="emailError" class="mt-1 text-sm text-red-600" id="email-error">{{ emailError }}</p>
          </div>
          
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
                class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" 
                placeholder="Contraseña"
                aria-required="true"
                @blur="validatePassword"
              >
              <button 
                type="button" 
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                @click="showPassword = !showPassword"
                aria-label="Mostrar contraseña"
              >
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
            <p v-if="passwordError" class="mt-1 text-sm text-red-600" id="password-error">{{ passwordError }}</p>
          </div>
          
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
                class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" 
                placeholder="Confirma tu contraseña"
                aria-required="true"
                @blur="validateConfirmPassword"
              >
              <button 
                type="button" 
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                @click="showConfirmPassword = !showConfirmPassword"
                aria-label="Mostrar contraseña"
              >
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
            <p v-if="confirmPasswordError" class="mt-1 text-sm text-red-600" id="confirm-password-error">{{ confirmPasswordError }}</p>
          </div>
        </div>

        <div>
          <button 
            type="submit" 
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            :disabled="isLoading"
          >
            <span v-if="isLoading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            {{ isLoading ? 'Registrando...' : 'Registrarse' }}
          </button>
        </div>
        
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const nameError = ref('')
const emailError = ref('')
const passwordError = ref('')
const confirmPasswordError = ref('')
const isLoading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const router = useRouter()

// Validación de nombre
const validateName = () => {
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';  nameError.value = ''
  if (!name.value.trim()) {
    nameError.value = 'El nombre es requerido.'
    return false
  }
  if (name.value.trim().length < 2) {
    nameError.value = 'El nombre debe tener al menos 2 caracteres.'
    return false
  }
  if (name.value.trim().length > 50) {
    nameError.value = 'El nombre no puede tener más de 50 caracteres.'
    return false
  }
  return true
}

// Validación de email
const validateEmail = () => {
  emailError.value = ''
  if (!email.value.trim()) {
    emailError.value = 'El email es requerido.'
    return false
  }
  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g; // Regex mejorada para emails
  if (!emailRegex.test(email.value.trim())) {
    emailError.value = 'Por favor, introduce un formato de email válido (ej: correo@dominio.com).'
    return false
  }
  return true
}

// Validación de contraseña
const validatePassword = () => {
  passwordError.value = ''
  if (!password.value) {
    passwordError.value = 'La contraseña es requerida.'
    return false
  }
  if (password.value.length < 8) {
    passwordError.value = 'La contraseña debe tener al menos 8 caracteres.'
    return false
  }
  if (!/[A-Z]/.test(password.value)) {
    passwordError.value = 'La contraseña debe contener al menos una letra mayúscula.'
    return false
  }
  if (!/[0-9]/.test(password.value)) {
    passwordError.value = 'La contraseña debe contener al menos un número.'
    return false
  }
  if (!/[!@#$%^&*(),.?\":{}|<>]/.test(password.value)) {
    passwordError.value = 'La contraseña debe contener al menos un carácter especial (ej: !@#$%^&*).'
    return false
  }
  return true
}

// Validación de confirmación de contraseña
const validateConfirmPassword = () => {
  confirmPasswordError.value = ''
  // No es necesario validar si está vacío si la contraseña principal ya tiene errores o está vacía
  if (passwordError.value || !password.value) {
      // Si la contraseña principal está vacía y se intenta validar la confirmación (ej. en submit),
      // se muestra el error de confirmación solo si el campo de confirmación también está vacío.
      if (!password.value && !confirmPassword.value) {
          confirmPasswordError.value = 'Por favor, confirma tu contraseña.'
          return false;
      }
      return true; 
  }

  if (!confirmPassword.value) {
    confirmPasswordError.value = 'Por favor, confirma tu contraseña.'
    return false
  }
  if (password.value !== confirmPassword.value) {
    confirmPasswordError.value = 'Las contraseñas no coinciden.'
    return false
  }
  return true
}

const handleSubmit = async () => {
  error.value = '' // Limpiar errores previos generales

  // Validar todos los campos y guardar su estado
  const isNameValid = validateName();
  const isEmailValid = validateEmail();
  const isPasswordValid = validatePassword();
  // Validar confirmación de contraseña solo si la contraseña principal es válida
  const isConfirmPasswordValid = isPasswordValid ? validateConfirmPassword() : false;

  // Si alguna validación individual falla, no continuar con el envío
  if (!isNameValid || !isEmailValid || !isPasswordValid || !isConfirmPasswordValid) {
    // Forzar la visualización de errores si los campos están vacíos al intentar enviar
    if (!name.value.trim()) validateName();
    if (!email.value.trim()) validateEmail();
    if (!password.value) validatePassword();
    if (password.value && !confirmPassword.value) validateConfirmPassword();
    return;
  }

  isLoading.value = true;
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
    const response = await axios.post(`${apiUrl}/auth/register`, {
      name: name.value.trim(),
      email: email.value.trim(),
      password: password.value,
      // No es necesario enviar confirmPassword al backend, ya se validó en el frontend
    });

    if (response.data && response.data.token) {
      // Idealmente, usarías Vuex o Pinia para gestionar el estado de autenticación
      localStorage.setItem('token', response.data.token);
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      router.push({ name: 'Home' }); // O a la vista que consideres apropiada post-registro
    } else {
      // Esto podría indicar un problema con la respuesta del backend si no hay token
      error.value = 'Registro completado, pero hubo un problema al iniciar sesión automáticamente. Intenta iniciar sesión manualmente.';
    }
  } catch (err) {
    if (err.response && err.response.data && err.response.data.error) {
      // Mensaje de error específico del backend
      error.value = err.response.data.error;
    } else if (err.request) {
      // La solicitud se hizo pero no se recibió respuesta (problema de red, servidor caído)
      error.value = 'No se pudo conectar con el servidor. Verifica tu conexión o inténtalo más tarde.';
    } else {
      // Otro tipo de error durante la configuración de la solicitud
      error.value = 'Ocurrió un error inesperado durante el registro. Por favor, inténtalo de nuevo.';
    }
    console.error('Error de registro:', err);
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.register {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
}
</style>