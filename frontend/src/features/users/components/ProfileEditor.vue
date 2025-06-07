<template>
  <div class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full max-h-screen overflow-y-auto">
      <div class="p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold">Editar perfil</h2>
          <button @click="$emit('close')" class="text-gray-400 hover:text-gray-500">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form @submit.prevent="submitForm" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Foto de perfil</label>
            <div class="flex items-center space-x-4">
              <img 
                :src="previewImage || (fetchedProfile && fetchedProfile.avatarUrl) || '/default-avatar.png'" 
                alt="Preview"
                class="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
              />
              <div>
                <input 
                  type="file" 
                  ref="fileInput" 
                  @change="handleImageChange" 
                  accept="image/*" 
                  class="hidden"
                />
                <button 
                  type="button" 
                  @click="$refs.fileInput.click()"
                  class="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cambiar imagen
                </button>
              </div>
            </div>
          </div>
          
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input 
              id="name" 
              v-model="form.name" 
              type="text" 
              required
              class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label for="bio" class="block text-sm font-medium text-gray-700 mb-1">Biografía</label>
            <textarea 
              id="bio" 
              v-model="form.bio" 
              rows="3" 
              class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            ></textarea>
          </div>
          
          <div>
            <label for="location" class="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
            <input 
              id="location" 
              v-model="form.location" 
              type="text" 
              class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          
          <div class="flex justify-end space-x-3 pt-4">
            <button 
              type="button" 
              @click="$emit('close')"
              class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              :disabled="isLoading"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="isLoading">Guardando...</span>
              <span v-else>Guardar cambios</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { USER_ROUTES } from '@/config/apiRoutes'
import { displayError } from '@/shared/utils/errorHandler'
import { userService } from '@/features/users'

type Profile = {
  id: string
  name: string
  bio: string
  location: string
  avatarUrl: string | null
}

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', profile: Profile): void
}>()


const fileInput = ref<HTMLInputElement | null>(null)
const isLoading = ref(false)
const previewImage = ref<string | null>(null)
const selectedFile = ref<File | null>(null)
const fetchedProfile = ref<Profile | null>(null)

const form = ref({
  name: '',
  bio: '',
  location: '',
})

function mapUserToProfile(user: any): Profile {
  return {
    id: user.id || user._id, // Use id first, fallback to _id for compatibility
    name: user.name || '',
    bio: user.bio || '',
    location: user.location || '',
    avatarUrl: user.avatar || null // Use avatar field from backend
  };
}

onMounted(async () => {
  try {
    isLoading.value = true;
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await userService.getCurrentUserProfile();

     if (response && response.success) {
       const user = response.data;
      fetchedProfile.value = mapUserToProfile(user);
      
      form.value = {
        name: fetchedProfile.value.name,
        bio: fetchedProfile.value.bio,
        location: fetchedProfile.value.location,
      };
      // Use avatarUrl from fetchedProfile for preview
      previewImage.value = fetchedProfile.value.avatarUrl;
    } else {
      displayError(response.error || 'Error al cargar el perfil');
    }
  } catch (error: any) {
    console.error("Error fetching profile:", error);
    const errorMessage = error.response?.data?.error || 'Error al cargar el perfil. Inténtalo de nuevo.';
    displayError(errorMessage);
  } finally {
    isLoading.value = false;
  }
});

const handleImageChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    selectedFile.value = input.files[0]
    
    const reader = new FileReader()
    reader.onload = (e) => {
      previewImage.value = e.target?.result as string
    }
    reader.readAsDataURL(input.files[0])
  }
}

const submitForm = async () => {
  if (!fetchedProfile.value || !fetchedProfile.value.id) {
    displayError('No se pudo identificar el perfil del usuario.');
    return;
  }
  try {
    isLoading.value = true
    
    const formData = new FormData()
    formData.append('name', form.value.name)
    formData.append('bio', form.value.bio)
    formData.append('location', form.value.location)
    
    if (selectedFile.value) {
      formData.append('avatar', selectedFile.value) // Ensure key is 'avatar'
    }
    
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await userService.updateUserProfile(fetchedProfile.value.id, formData);
     
     if (response && response.success) {
      emit('save', mapUserToProfile(response.data))
      emit('close'); // Close modal on success
    } else {
      // El error ya se maneja en el servicio
      console.error('Error al actualizar el perfil:', response);
    }
  } catch (error: any) {
    // Los errores ya se manejan en el servicio con toast
    console.error("Error updating profile:", error);
  } finally {
    isLoading.value = false
  }
}
</script>