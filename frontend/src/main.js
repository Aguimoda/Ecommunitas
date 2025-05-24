import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'

// Import Toast
import Toast from 'vue-toastification'
// Import the CSS
import 'vue-toastification/dist/index.css'

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
app.mount('#app')