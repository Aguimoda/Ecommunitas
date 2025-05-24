<template>
  <div class="max-w-4xl mx-auto py-8 px-4">
    <h1 class="text-2xl font-bold mb-6">Editar Artículo</h1>
    
    <form @submit.prevent="updateItem" class="space-y-4">
      <div>
        <label for="title" class="block text-sm font-medium text-gray-700">Título</label>
        <input
          id="title"
          v-model="form.title"
          type="text"
          required
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>
      
      <div>
        <label for="description" class="block text-sm font-medium text-gray-700">Descripción</label>
        <textarea
          id="description"
          v-model="form.description"
          rows="4"
          required
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        ></textarea>
      </div>
      
      <div>
        <label for="category" class="block text-sm font-medium text-gray-700">Categoría</label>
        <select
          id="category"
          v-model="form.category"
          required
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="">Selecciona una categoría</option>
          <option value="hogar">Hogar</option>
          <option value="electrónica">Electrónica</option>
          <option value="ropa">Ropa</option>
          <option value="libros">Libros</option>
          <option value="otros">Otros</option>
        </select>
      </div>
      
      <div>
        <label for="condition" class="block text-sm font-medium text-gray-700">Condición</label>
        <select
          id="condition"
          v-model="form.condition"
          required
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="">Selecciona una condición</option>
          <option value="nuevo">Nuevo</option>
          <option value="como nuevo">Como nuevo</option>
          <option value="bueno">Bueno</option>
          <option value="usado">Usado</option>
        </select>
      </div>
      
      <div>
        <label for="location" class="block text-sm font-medium text-gray-700">Ubicación</label>
        <input
          id="location"
          v-model="form.location"
          type="text"
          required
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700">Imagen</label>
        <input
          type="file"
          accept="image/*"
          @change="handleImageUpload"
          class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
        />
      </div>
      
      <div class="flex justify-end space-x-4">
        <button
          type="button"
          @click="deleteItem"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Eliminar
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
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { useToast } from 'vue-toastification'

type ItemForm = {
  title: string
  description: string
  category: string
  condition: string
  location: string
  imageUrl: string | null
}

const route = useRoute()
const props = defineProps({
  id: {
    type: String,
    required: true
  }
})
const router = useRouter()
const toast = useToast() as any

const form = ref<ItemForm>({
  title: '',
  description: '',
  category: '',
  condition: '',
  location: '',
  imageUrl: null
})

const isLoading = ref(false)
const selectedImage = ref<File | null>(null)

const fetchItem = async () => {
  console.log(`[DEBUG] Iniciando fetchItem para el ID: ${props.id}`);
  try {
    isLoading.value = true;
    console.log(`[DEBUG] Realizando petición GET a /api/v1/items/${props.id}`);
    const response = await axios.get(`/api/v1/items/${props.id}`);
    console.log('[DEBUG] Respuesta recibida de fetchItem:', response.data);
    const itemData = response.data;
    if (itemData && typeof itemData === 'object' && Object.keys(itemData).length > 0) {
      form.value.title = itemData.title !== undefined ? itemData.title : '';
      form.value.description = itemData.description !== undefined ? itemData.description : '';
      form.value.category = itemData.category !== undefined ? itemData.category : '';
      form.value.condition = itemData.condition !== undefined ? itemData.condition : '';
      form.value.location = itemData.location !== undefined ? itemData.location : '';
      form.value.imageUrl = itemData.imageUrl !== undefined ? itemData.imageUrl : null;
      console.log('[DEBUG] form.value después de la asignación:', JSON.parse(JSON.stringify(form.value)));
    } else {
      console.error('[DEBUG] Los datos del artículo recibidos no son un objeto válido o están vacíos:', itemData);
      toast.error('Los datos del artículo recibidos son inválidos o el artículo no existe.');
      router.push('/');
    }
  } catch (error) {
    console.error('[DEBUG] Error en fetchItem:', error);
    toast.error('Error al cargar el artículo');
    router.push('/');
  } finally {
    isLoading.value = false;
    console.log('[DEBUG] fetchItem finalizado.');
  }
}

const updateItem = async () => {
  console.log(`[DEBUG] Iniciando updateItem para el ID: ${props.id}`);
  try {
    isLoading.value = true;
    
    const formData = new FormData();
    formData.append('title', form.value.title);
    formData.append('description', form.value.description);
    formData.append('category', form.value.category);
    formData.append('condition', form.value.condition);
    formData.append('location', form.value.location);
    console.log('[DEBUG] FormData preparado:', {
      title: form.value.title,
      description: form.value.description,
      category: form.value.category,
      condition: form.value.condition,
      location: form.value.location,
      image_present: !!selectedImage.value
    });
    
    if (selectedImage.value) {
      formData.append('images', selectedImage.value);
      console.log('[DEBUG] Imagen añadida al FormData:', selectedImage.value.name);
    }
    
    console.log(`[DEBUG] Realizando petición PUT a /api/v1/items/${props.id}`);
    await axios.put(`/api/v1/items/${props.id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    console.log('[DEBUG] Artículo actualizado correctamente en el servidor.');
    toast.success('Artículo actualizado correctamente');
    router.push(`/items/${props.id}`);
  } catch (error) {
    console.error('[DEBUG] Error en updateItem:', error);
    toast.error('Error al actualizar el artículo');
  } finally {
    isLoading.value = false;
    console.log('[DEBUG] updateItem finalizado.');
  }
}

const deleteItem = async () => {
  console.log(`[DEBUG] Iniciando deleteItem para el ID: ${props.id}`);
  if (!confirm('¿Estás seguro de que quieres eliminar este artículo?')) {
    console.log('[DEBUG] Eliminación cancelada por el usuario.');
    return;
  }
  
  try {
    isLoading.value = true;
    console.log(`[DEBUG] Realizando petición DELETE a /api/v1/items/${props.id}`);
    await axios.delete(`/api/v1/items/${props.id}`);
    console.log('[DEBUG] Artículo eliminado correctamente del servidor.');
    toast.success('Artículo eliminado correctamente');
    router.push('/');
  } catch (error) {
    console.error('[DEBUG] Error en deleteItem:', error);
    toast.error('Error al eliminar el artículo');
  } finally {
    isLoading.value = false;
    console.log('[DEBUG] deleteItem finalizado.');
  }
}

const handleImageUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    selectedImage.value = input.files[0]
  }
}

onMounted(() => {
  fetchItem()
})
</script>