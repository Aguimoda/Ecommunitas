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
          <option value="books">Libros</option>
          <option value="electronics">Electrónicos</option>
          <option value="clothing">Ropa</option>
          <option value="furniture">Muebles</option>
          <option value="other">Otros</option>
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
          <option value="new">Nuevo</option>
          <option value="like_new">Como Nuevo</option>
          <option value="good">Buen estado</option>
          <option value="fair">Regular</option>
          <option value="poor">Malo</option>
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

<script setup>
import { useEditItem } from '../composables/useEditItem'

// Props
const props = defineProps({
  id: {
    type: String,
    required: true
  }
})

// Usar el composable para toda la lógica de edición
const {
  // Estado reactivo
  form,
  selectedImage,
  
  // Propiedades computadas
  isLoading,
  
  // Funciones
  fetchItem,
  updateItem,
  deleteItem,
  handleImageUpload
} = useEditItem(props.id)
</script>