<template>
  <div class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-screen overflow-y-auto">
      <div class="p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-semibold text-gray-800">Editar Artículo</h2>
          <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 transition duration-150">
            <svg class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="submitForm" class="space-y-6">
          <div>
            <label for="title" class="block text-sm font-medium text-gray-700 mb-1">Título</label>
            <input type="text" id="title" v-model="form.title" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
          </div>

          <div>
            <label for="description" class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea id="description" v-model="form.description" rows="4" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
          </div>

          <div>
            <label for="price" class="block text-sm font-medium text-gray-700 mb-1">Precio (€)</label>
            <input type="number" id="price" v-model.number="form.price" required min="0" step="0.01" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
          </div>

          <div>
            <label for="location" class="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
            <input type="text" id="location" v-model="form.location" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Imagen del Artículo</label>
            <div class="mt-2 flex items-center space-x-4">
              <img :src="previewImage || form.currentImage || '/default-item-placeholder.png'" alt="Vista previa" class="w-24 h-24 rounded-md object-cover border border-gray-300">
              <div>
                <input type="file" ref="fileInput" @change="handleImageChange" accept="image/*" class="hidden">
                <button type="button" @click="triggerFileInput" class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  Cambiar Imagen
                </button>
                <p v-if="selectedFile" class="text-xs text-gray-500 mt-1">{{ selectedFile.name }}</p>
              </div>
            </div>
          </div>

          <div v-if="error" class="text-red-500 text-sm">
            {{ error }}
          </div>

          <div class="flex justify-end space-x-3 pt-4">
            <button type="button" @click="$emit('close')" class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Cancelar
            </button>
            <button type="submit" :disabled="isLoading" class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
              <span v-if="isLoading">Guardando...</span>
              <span v-else>Guardar Cambios</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import axios from 'axios';
import { useToast } from 'vue-toastification';

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['close', 'save']);
const toast = useToast();

const form = ref({
  _id: '',
  title: '',
  description: '',
  price: 0,
  location: '',
  currentImage: '', // URL de la imagen actual
});

const selectedFile = ref(null);
const previewImage = ref(null);
const fileInput = ref(null);
const isLoading = ref(false);
const error = ref('');

// Inicializar el formulario cuando el prop 'item' cambie
watch(() => props.item, (newItem) => {
  if (newItem) {
    form.value = {
      _id: newItem._id,
      title: newItem.title || '',
      description: newItem.description || '', // Asumiendo que hay un campo description
      price: newItem.price || 0,
      location: newItem.location || '',
      currentImage: newItem.image || newItem.imageUrl || '', // 'image' o 'imageUrl'
    };
    previewImage.value = form.value.currentImage;
    selectedFile.value = null; // Resetear el archivo seleccionado
    error.value = '';
  }
}, { immediate: true });

const handleImageChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    selectedFile.value = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImage.value = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

const triggerFileInput = () => {
  fileInput.value.click();
};

const submitForm = async () => {
  isLoading.value = true;
  error.value = '';
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Usuario no autenticado.');
      emit('close'); // Considerar redirigir o manejar mejor
      return;
    }

    const formData = new FormData();
    formData.append('title', form.value.title);
    formData.append('description', form.value.description);
    formData.append('price', form.value.price.toString());
    formData.append('location', form.value.location);
    // Solo añadir la imagen si se ha seleccionado una nueva
    if (selectedFile.value) {
      formData.append('image', selectedFile.value);
    }

    const response = await axios.put(`/api/v1/items/${form.value._id}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });

    if (response.data && response.data.success) {
      toast.success('Artículo actualizado correctamente!');
      emit('save', response.data.data); // Enviar el artículo actualizado
      emit('close');
    } else {
      error.value = response.data.message || 'Error al actualizar el artículo.';
      toast.error(error.value);
    }
  } catch (err) {
    console.error('Error al actualizar el artículo:', err);
    if (err.response && err.response.data && err.response.data.error) {
        error.value = err.response.data.error;
    } else if (err.response && err.response.data && err.response.data.message) {
        error.value = err.response.data.message;
    } else {
        error.value = 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.';
    }
    toast.error(error.value);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  // Si se pasa un item al montar, inicializar el formulario
  if (props.item) {
    form.value = {
      _id: props.item._id,
      title: props.item.title || '',
      description: props.item.description || '',
      price: props.item.price || 0,
      location: props.item.location || '',
      currentImage: props.item.image || props.item.imageUrl || '',
    };
    previewImage.value = form.value.currentImage;
  }
});

</script>

<style scoped>
/* Estilos adicionales si son necesarios, Tailwind CSS ya proporciona mucho */
.max-h-screen {
  max-height: 90vh; /* Ajustar para que no ocupe toda la pantalla y sea scrollable */
}
</style>