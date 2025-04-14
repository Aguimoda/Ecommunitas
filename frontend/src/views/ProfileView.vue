<template>
  <div class="max-w-4xl mx-auto py-8 px-4">
    <div class="bg-white rounded-lg shadow-md p-6 mb-8">
      <div class="flex flex-col md:flex-row gap-6">
        <div class="flex-shrink-0">
          <img 
            :src="profile.avatarUrl || '/default-avatar.png'" 
            alt="Avatar"
            class="w-32 h-32 rounded-full object-cover border-2 border-gray-200"
          />
        </div>
        
        <div class="flex-grow">
          <h1 class="text-2xl font-bold mb-2">{{ profile.name }}</h1>
          <p class="text-gray-600 mb-4">{{ profile.bio }}</p>
          
          <div class="flex items-center text-gray-500 mb-4">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{{ profile.location }}</span>
          </div>
          
          <button 
            @click="openEditModal"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Editar perfil
          </button>
        </div>
      </div>
    </div>
    
    <div class="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 class="text-xl font-bold mb-4">Artículos publicados</h2>
      <div v-if="itemsLoading" class="flex justify-center py-8">
        <svg class="animate-spin h-8 w-8 text-indigo-600" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
      <div v-else-if="items.length === 0" class="text-center py-8 text-gray-500">
        No hay artículos publicados
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <!-- Aquí irían los componentes de los artículos -->
      </div>
    </div>
    
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-xl font-bold mb-4">Historial de intercambios</h2>
      <div v-if="tradesLoading" class="flex justify-center py-8">
        <svg class="animate-spin h-8 w-8 text-indigo-600" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
      <div v-else-if="trades.length === 0" class="text-center py-8 text-gray-500">
        No hay historial de intercambios
      </div>
      <div v-else class="space-y-4">
        <!-- Aquí irían los componentes de los intercambios -->
      </div>
    </div>
    
    <ProfileEditor 
      v-if="showEditModal" 
      :profile="profile" 
      @close="closeEditModal" 
      @save="handleProfileUpdate" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import { useToast } from 'vue-toastification'
import ProfileEditor from '@/components/ProfileEditor.vue'

type Profile = {
  id: string
  name: string
  bio: string
  location: string
  avatarUrl: string | null
}

type Item = {
  id: string
  title: string
  description: string
  imageUrl: string
}

type Trade = {
  id: string
  itemId: string
  status: string
  createdAt: string
}

const route = useRoute()
const toast = useToast()

const profile = ref<Profile>({
  id: '',
  name: '',
  bio: '',
  location: '',
  avatarUrl: null
})

const items = ref<Item[]>([])
const trades = ref<Trade[]>([])
const itemsLoading = ref(false)
const tradesLoading = ref(false)
const showEditModal = ref(false)

const fetchProfile = async () => {
  try {
    const response = await axios.get(`/api/users/${route.params.id}`)
    profile.value = response.data
  } catch (error) {
    toast.error('Error al cargar el perfil')
  }
}

const fetchListedItems = async () => {
  try {
    itemsLoading.value = true
    const response = await axios.get(`/api/users/${route.params.id}/items`)
    items.value = response.data
  } catch (error) {
    toast.error('Error al cargar los artículos')
  } finally {
    itemsLoading.value = false
  }
}

const fetchTradeHistory = async () => {
  try {
    tradesLoading.value = true
    const response = await axios.get(`/api/users/${route.params.id}/trades`)
    trades.value = response.data
  } catch (error) {
    toast.error('Error al cargar el historial de intercambios')
  } finally {
    tradesLoading.value = false
  }
}

const openEditModal = () => {
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
}

const handleProfileUpdate = (updatedProfile: Profile) => {
  profile.value = updatedProfile
  closeEditModal()
}

onMounted(() => {
  fetchProfile()
  fetchListedItems()
  fetchTradeHistory()
})
</script>