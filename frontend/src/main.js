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
  draggable: true
}

app.use(pinia)
app.use(router)
app.use(Toast, toastOptions)

// Initialize stores after pinia is set up
app.mount('#app')

// Initialize items store
const itemsStore = useItemsStore()
itemsStore.initialize()