/**
 * @fileoverview Punto de entrada principal de la aplicación Ecommunitas
 * @description Configuración e inicialización de la aplicación Vue 3 con todas sus dependencias,
 * plugins y configuraciones globales necesarias para el funcionamiento del sistema.
 * 
 * @features
 * - Inicialización de Vue 3 con Composition API
 * - Configuración de Pinia para gestión de estado
 * - Configuración de Vue Router para navegación
 * - Integración de Vue Toastification para notificaciones
 * - Inicialización de stores principales
 * - Configuración de estilos globales
 * 
 * @technical
 * - Vue 3 con Composition API
 * - Pinia para gestión de estado
 * - Vue Router para enrutamiento
 * - Vue Toastification para notificaciones
 * - CSS personalizado para estilos
 * 
 * @dependencies
 * - vue: Framework principal
 * - pinia: Gestión de estado
 * - vue-router: Enrutamiento
 * - vue-toastification: Sistema de notificaciones
 * 
 * @author Equipo Ecommunitas
 * @version 1.0.0
 * @since 2024
 */

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'

// Import Toast
import Toast from 'vue-toastification'
// Import the CSS
import 'vue-toastification/dist/index.css'

// Import stores for initialization
import { useItemsStore } from '@/features/items/stores/itemsStore'

const app = createApp(App)
const pinia = createPinia()

// Toast configuration
const toastOptions = {
  position: 'top-right',
  timeout: 5000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: 'button',
  icon: true,
  rtl: false
}

app.use(pinia)
app.use(router)
app.use(Toast, toastOptions)

app.mount('#app')

// Initialize stores after mounting
const itemsStore = useItemsStore()
itemsStore.initializeStore()