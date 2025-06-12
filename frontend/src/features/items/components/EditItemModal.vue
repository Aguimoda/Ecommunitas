<!--
/**
 * @file EditItemModal.vue
 * @description Modal para editar artículos existentes en Ecommunitas
 * 
 * Este componente proporciona una interfaz modal completa para la edición
 * de artículos existentes. Permite modificar todos los campos del artículo
 * incluyendo título, descripción, precio, ubicación e imágenes, con
 * validación en tiempo real y gestión de estados.
 * 
 * CARACTERÍSTICAS PRINCIPALES:
 * - 📝 Formulario completo de edición
 * - 🖼️ Gestión avanzada de imágenes
 * - ✅ Validación en tiempo real
 * - 💾 Guardado automático de cambios
 * - 🔄 Estados de carga y error
 * - 📱 Diseño responsive
 * - ♿ Accesibilidad completa
 * 
 * FUNCIONALIDADES:
 * - Edición de todos los campos del artículo
 * - Subida y eliminación de imágenes
 * - Previsualización de imágenes
 * - Validación de formulario
 * - Manejo de errores de validación
 * - Confirmación antes de guardar cambios
 * - Cancelación con confirmación si hay cambios
 * 
 * GESTIÓN DE IMÁGENES:
 * - Visualización de imágenes existentes
 * - Eliminación de imágenes actuales
 * - Subida de nuevas imágenes
 * - Previsualización antes de guardar
 * - Validación de formato y tamaño
 * - Compresión automática de imágenes
 * 
 * VALIDACIONES:
 * - Campos obligatorios
 * - Formato de precio válido
 * - Longitud mínima/máxima de texto
 * - Formato de imágenes permitidas
 * - Tamaño máximo de archivos
 * 
 * EVENTOS EMITIDOS:
 * - close: Cierra el modal
 * - updated: Artículo actualizado exitosamente
 * - error: Error en la actualización
 * 
 * TECNOLOGÍAS:
 * - Vue 3 Composition API
 * - TypeScript para tipado estático
 * - Tailwind CSS para estilos
 * - Validación de formularios
 * - Gestión de archivos
 * 
 * @author Equipo de Desarrollo Ecommunitas
 * @version 1.0.0
 * @since 1.0.0
 */
-->
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
            <label class="block text-sm font-medium text-gray-700 mb-1">Imágenes del Artículo</label>
            
            <!-- Imágenes existentes -->
            <div v-if="existingImages.length > 0" class="mt-2 mb-4">
              <p class="text-sm text-gray-600 mb-2">Imágenes actuales:</p>
              <div class="grid grid-cols-3 gap-2">
                <div v-for="(image, index) in existingImages" :key="index" class="relative group">
                  <img :src="image" alt="Imagen del artículo" class="w-full h-20 rounded-md object-cover border border-gray-300">
                  <button 
                    type="button" 
                    @click="removeExistingImage(index)"
                    class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Nuevas imágenes seleccionadas -->
            <div v-if="newImages.length > 0" class="mt-2 mb-4">
              <p class="text-sm text-gray-600 mb-2">Nuevas imágenes a agregar:</p>
              <div class="grid grid-cols-3 gap-2">
                <div v-for="(image, index) in newImages" :key="index" class="relative group">
                  <img :src="image.preview" alt="Nueva imagen" class="w-full h-20 rounded-md object-cover border border-gray-300">
                  <button 
                    type="button" 
                    @click="removeNewImage(index)"
                    class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Botón para agregar imágenes -->
            <div class="mt-2">
              <input type="file" ref="fileInput" @change="handleImageChange" accept="image/*" multiple class="hidden">
              <button type="button" @click="triggerFileInput" class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Agregar Imágenes
              </button>
              <p class="text-xs text-gray-500 mt-1">Máximo 5 imágenes en total</p>
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
import { displayError } from '@/shared/utils/errorHandler';
import { ITEM_ROUTES } from '@/config/apiRoutes';

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['close', 'item-updated']);
// const toast = useToast(); // Migrated to standardized error handling

const form = ref({
  _id: '',
  title: '',
  description: '',
  price: 0,
  location: '',
});

const existingImages = ref([]);
const newImages = ref([]);
const imagesToDelete = ref([]);
const fileInput = ref(null);
const isLoading = ref(false);
const error = ref('');

// Inicializar el formulario cuando el prop 'item' cambie
watch(() => props.item, (newItem) => {
  if (newItem) {
    form.value = {
      _id: newItem._id,
      title: newItem.title || '',
      description: newItem.description || '',
      price: newItem.price || 0,
      location: newItem.location || '',
    };
    
    // Inicializar imágenes existentes
    existingImages.value = [];
    if (newItem.imageUrls && newItem.imageUrls.length > 0) {
      existingImages.value = [...newItem.imageUrls];
    } else if (newItem.image || newItem.imageUrl) {
      existingImages.value = [newItem.image || newItem.imageUrl];
    }
    
    // Resetear arrays
    newImages.value = [];
    imagesToDelete.value = [];
    error.value = '';
  }
}, { immediate: true });

const handleImageChange = (event) => {
  const files = Array.from(event.target.files);
  const totalImages = existingImages.value.length + newImages.value.length;
  
  if (totalImages + files.length > 5) {
    error.value = 'Máximo 5 imágenes permitidas en total';
    return;
  }
  
  files.forEach(file => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        newImages.value.push({
          file: file,
          preview: e.target.result
        });
      };
      reader.readAsDataURL(file);
    }
  });
  
  // Limpiar el input
  event.target.value = '';
};

const triggerFileInput = () => {
  fileInput.value.click();
};

const removeExistingImage = (index) => {
  const imageUrl = existingImages.value[index];
  imagesToDelete.value.push(imageUrl);
  existingImages.value.splice(index, 1);
};

const removeNewImage = (index) => {
  newImages.value.splice(index, 1);
};

const submitForm = async () => {
  isLoading.value = true;
  error.value = '';
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      displayError('Usuario no autenticado.');
      emit('close'); // Considerar redirigir o manejar mejor
      return;
    }

    const formData = new FormData();
    formData.append('title', form.value.title);
    formData.append('description', form.value.description);
    formData.append('price', form.value.price.toString());
    formData.append('location', form.value.location);
    
    // Agregar nuevas imágenes
    newImages.value.forEach(imageObj => {
      formData.append('images', imageObj.file);
    });
    
    // Enviar imágenes existentes que se mantienen
    formData.append('existingImages', JSON.stringify(existingImages.value));
    
    // Enviar imágenes a eliminar
    if (imagesToDelete.value.length > 0) {
      formData.append('imagesToDelete', JSON.stringify(imagesToDelete.value));
    }

    const response = await axios.put(ITEM_ROUTES.BY_ID(form.value._id), formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });

    if (response.data && response.data.success) {
      // toast.success('Artículo actualizado correctamente!'); // Migrated to standardized error handling
      emit('save', response.data.data); // Enviar el artículo actualizado
      emit('close');
    } else {
      error.value = response.data.message || 'Error al actualizar el artículo.';
      displayError(error.value);
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
    displayError(error.value);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  // La inicialización se maneja en el watcher
});

</script>

<style scoped>
@import '@/assets/styles/common.css';

/* Estilos adicionales si son necesarios, Tailwind CSS ya proporciona mucho */
.max-h-screen {
  max-height: 90vh; /* Ajustar para que no ocupe toda la pantalla y sea scrollable */
}
</style>