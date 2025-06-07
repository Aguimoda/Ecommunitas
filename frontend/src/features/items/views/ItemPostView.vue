<template>
  <div class="item-post">
    <h1>Publicar Artículo</h1>
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
    <form @submit.prevent="handleSubmit">
      <div>
        <label for="title">Título:</label>
        <input type="text" id="title" v-model="title" required>
      </div>
      <div>
        <label for="description">Descripción:</label>
        <textarea id="description" v-model="description" required></textarea>
      </div>
      <div>
        <label for="category">Categoría:</label>
        <select id="category" v-model="category" required>
          <option value="">Seleccione una categoría</option>
          <option value="books">Libros</option>
          <option value="electronics">Electrónicos</option>
          <option value="clothing">Ropa</option>
          <option value="furniture">Muebles</option>
          <option value="other">Otros</option>
        </select>
      </div>
      <div>
        <label for="condition">Condición:</label>
        <select id="condition" v-model="condition" required>
          <option value="">Seleccione condición</option>
          <option value="new">Nuevo</option>
          <option value="like_new">Como Nuevo</option>
          <option value="good">Buen estado</option>
          <option value="fair">Regular</option>
          <option value="poor">Malo</option>
        </select>
      </div>
      <div>
        <label>Ubicación:</label>
        <LocationPicker
          @location-selected="onLocationSelected"
          @location-cleared="onLocationCleared"
        />
        <div v-if="locationError" class="error-message">
          {{ locationError }}
        </div>
      </div>
      <div>
        <label for="images">Imágenes:</label>
        <input type="file" id="images" multiple @change="handleImageUpload">
      </div>
      <button type="submit" :disabled="isLoading">{{ isLoading ? 'Publicando...' : 'Publicar' }}</button>
    </form>
  </div>
</template>

<script setup>
import { LocationPicker } from '@/shared/components'
import { useItemPost } from '../composables/useItemPost'

// Usar el composable para toda la lógica de publicación
const {
  // Estados reactivos
  title,
  description,
  category,
  condition,
  location,
  error,
  locationError,
  
  // Propiedades computadas
  isLoading,
  
  // Funciones principales
  handleSubmit,
  handleImageUpload,
  onLocationSelected,
  onLocationCleared
} = useItemPost()
</script>

<style scoped>
@import '@/assets/styles/item-post-view.css';
</style>