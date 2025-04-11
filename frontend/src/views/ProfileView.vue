<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-4xl mx-auto">
      <!-- Contenedor principal -->
      <div v-if="loading" class="text-center py-8">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
        <p class="mt-2 text-gray-600">Cargando perfil...</p>
      </div>

      <div v-else-if="error" class="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-red-700">{{ error }}</p>
          </div>
        </div>
      </div>

      <div v-else class="bg-white rounded-lg shadow-md overflow-hidden">
        <!-- Perfil del usuario -->
        <div class="p-6 border-b border-gray-200">
          <div class="flex flex-col md:flex-row items-center">
            <div class="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
              <div v-if="user.profileImage" class="h-24 w-24 rounded-full overflow-hidden">
                <img :src="user.profileImage" :alt="user.name" class="h-full w-full object-cover">
              </div>
              <div v-else class="h-24 w-24 rounded-full bg-indigo-100 flex items-center justify-center">
                <span class="text-2xl font-medium text-indigo-500">{{ getInitials(user.name) }}</span>
              </div>
            </div>
            <div class="flex-1 text-center md:text-left">
              <h1 class="text-2xl font-bold text-gray-800">{{ user.name }}</h1>
              <p class="text-gray-500 mt-1">{{ user.email }}</p>
              <div class="mt-2 flex flex-wrap justify-center md:justify-start gap-2">
                <div v-if="user.location" class="flex items-center text-sm text-gray-500">
                  <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{{ user.location }}</span>
                </div>
                <div class="flex items-center text-sm text-gray-500">
                  <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Miembro desde {{ formatDate(user.createdAt) }}</span>
                </div>
              </div>
            </div>
            <div class="mt-4 md:mt-0">
              <button @click="showEditForm = true" class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <svg class="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Editar perfil
              </button>
            </div>
          </div>
          <div v-if="user.bio" class="mt-4 text-gray-600">
            <h3 class="text-sm font-medium text-gray-900 mb-2">Sobre mí</h3>
            <p class="whitespace-pre-line">{{ user.bio }}</p>
          </div>
        </div>

        <!-- Formulario de edición de perfil -->
        <div v-if="showEditForm" class="p-6 border-b border-gray-200 bg-gray-50">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Editar perfil</h2>
          <form @submit.prevent="updateProfile" class="space-y-4">
            <div>
              <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input 
                id="name" 
                type="text" 
                v-model="editForm.name" 
                required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
            </div>
            <div>
              <label for="location" class="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
              <input 
                id="location" 
                type="text" 
                v-model="editForm.location" 
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Ciudad, País"
              >
            </div>
            <div>
              <label for="bio" class="block text-sm font-medium text-gray-700 mb-1">Biografía</label>
              <textarea 
                id="bio" 
                v-model="editForm.bio" 
                rows="4"
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Cuéntanos un poco sobre ti..."
              ></textarea>
            </div>
            <div>
              <label for="profileImage" class="block text-sm font-medium text-gray-700 mb-1">Imagen de perfil</label>
              <input 
                id="profileImage" 
                type="file" 
                @change="handleImageUpload"
                accept="image/*"
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
            </div>
            <div class="flex justify-end space-x-3">
              <button 
                type="button" 
                @click="showEditForm = false"
                class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                :disabled="isUpdating"
                class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg v-if="isUpdating" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Guardar cambios
              </button>
            </div>
          </form>
        </div>

        <!-- Pestañas -->
        <div class="border-b border-gray-200">
          <nav class="-mb-px flex">
            <button 
              @click="activeTab = 'items'" 
              :class="[activeTab === 'items' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300', 'w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm']"
            >
              Mis artículos
            </button>
            <button 
              @click="activeTab = 'messages'" 
              :class="[activeTab === 'messages' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300', 'w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm']"
            >
              Mensajes
            </button>
          </nav>
        </div>

        <!-- Contenido de pestañas -->
        <div class="p-6">
          <!-- Mis artículos -->
          <div v-if="activeTab === 'items'">
            <div v-if="loadingItems" class="text-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
              <p class="mt-2 text-gray-600">Cargando artículos...</p>
            </div>
            <div v-else-if="itemsError" class="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <p class="text-sm text-red-700">{{ itemsError }}</p>
            </div>
            <div v-else-if="items.length === 0" class="text-center py-8 text-gray-500">
              <svg class="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p>No has publicado ningún artículo todavía</p>
              <router-link to="/post-item" class="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <svg class="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Publicar artículo
              </router-link>
            </div>
            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div v-for="item in items" :key="item._id" class="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div class="relative h-48 bg-gray-100">
                  <img 
                    v-if="item.imageUrl" 
                    :src="item.imageUrl" 
                    :alt="item.title" 
                    class="w-full h-full object-cover"
                  >
                  <div v-else class="w-full h-full flex items-center justify-center">
                    <svg class="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div class="absolute top-2 right-2">
                    <span :class="[item.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800', 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium']">
                      {{ item.isAvailable ? 'Disponible' : 'No disponible' }}
                    </span>
                  </div>
                </div>
                <div class="p-4">
                  <h3 class="text-lg font-medium text-gray-900 truncate">{{ item.title }}</h3>
                  <p class="mt-1 text-sm text-gray-500 truncate">{{ item.category }}</p>
                  <div class="mt-4 flex justify-between items-center">
                    <router-link :to="`/items/${item._id}`" class="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                      Ver detalles
                    </router-link>
                    <button 
                      @click="toggleItemAvailability(item)" 
                      :class="[item.isAvailable ? 'text-red-600 hover:text-red-500' : 'text-green-600 hover:text-green-500', 'text-sm font-medium']"
                    >
                      {{ item.isAvailable ? 'Marcar no disponible' : 'Marcar disponible' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Mensajes -->
          <div v-if="activeTab === 'messages'">
            <MessageList />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import MessageList from '../components/MessageList.vue'

// Estado
const user = ref({})
const items = ref([])
const loading = ref(true)
const loadingItems = ref(true)
const error = ref('')
const itemsError = ref('')
const activeTab = ref('items')
const showEditForm = ref(false)
const isUpdating = ref(false)
const router = useRouter()

// Formulario de edición
const editForm = ref({
  name: '',
  bio: '',
  location: '',
  profileImage: null
})

// Obtener perfil de usuario
const fetchUserProfile = async () => {
  try {
    loading.value = true
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    const response = await axios.get('/api/user/profile', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    user.value = response.data
    // Inicializar formulario de edición
    editForm.value.name = user.value.name || ''
    editForm.value.bio = user.value.bio || ''
    editForm.value.location = user.value.location || ''
  } catch (err) {
    console.error('Error al obtener perfil:', err)
    error.value = 'No se pudo cargar el perfil. Por favor, intenta nuevamente.'
  } finally {
    loading.value = false
  }
}

// Obtener artículos del usuario
const fetchUserItems = async () => {
  try {
    loadingItems.value = true
    const token = localStorage.getItem('token')
    if (!token) return

    const response = await axios.get('/api/user/items', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    items.value = response.data
  } catch (err) {
    console.error('Error al obtener artículos:', err)
    itemsError.value = 'No se pudieron cargar tus artículos. Por favor, intenta nuevamente.'
  } finally {
    loadingItems.value = false
  }
}

// Cambiar disponibilidad de un artículo
const toggleItemAvailability = async (item) => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return

    const response = await axios.patch(`/api/items/${item._id}/availability`, {
      isAvailable: !item.isAvailable
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    // Actualizar el artículo en la lista
    const index = items.value.findIndex(i => i._id === item._id)
    if (index !== -1) {
      items.value[index].isAvailable = !item.isAvailable
    }
  } catch (err) {
    console.error('Error al actualizar disponibilidad:', err)
    alert('No se pudo actualizar la disponibilidad del artículo. Por favor, intenta nuevamente.')
  }
}

// Manejar subida de imagen
const handleImageUpload = (event) => {
  editForm.value.profileImage = event.target.files[0] || null
}

// Actualizar perfil
const updateProfile = async () => {
  try {
    isUpdating.value = true
    const token = localStorage.getItem('token')
    if (!token) return

    const formData = new FormData()
    formData.append('name', editForm.value.name)
    if (editForm.value.bio) formData.append('bio', editForm.value.bio)
    if (editForm.value.location) formData.append('location', editForm.value.location)
    if (editForm.value.profileImage) formData.append('profileImage', editForm.value.profileImage)

    const response = await axios.patch('/api/user/profile', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    })

    // Actualizar datos del usuario
    user.value = response.data
    showEditForm.value = false
  } catch (err) {
    console.error('Error al actualizar perfil:', err)
    alert('No se pudo actualizar el perfil. Por favor, intenta nuevamente.')
  } finally {
    isUpdating.value = false
  }
}

// Formatear fecha
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
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

// Cargar datos al montar el componente
onMounted(() => {
  fetchUserProfile()
  fetchUserItems()
})
</script>