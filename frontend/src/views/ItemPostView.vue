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
          <option value="ropa">Ropa</option>
          <option value="electronica">Electrónica</option>
          <option value="hogar">Hogar</option>
          <option value="libros">Libros</option>
        </select>
      </div>
      <div>
        <label for="condition">Condición:</label>
        <select id="condition" v-model="condition" required>
          <option value="">Seleccione condición</option>
          <option value="nuevo">Nuevo</option>
          <option value="bueno">Buen estado</option>
          <option value="usado">Usado</option>
        </select>
      </div>
      <div>
        <label for="location">Ubicación:</label>
        <input type="text" id="location" v-model="location" required placeholder="Ciudad o dirección aproximada">
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const title = ref('')
const description = ref('')
const category = ref('')
const condition = ref('')
const location = ref('')
const images = ref([])
const error = ref('')
const isLoading = ref(false)
const router = useRouter()

const handleImageUpload = (event) => {
  images.value = Array.from(event.target.files)
}

const handleSubmit = async () => {
  try {
    isLoading.value = true
    
    // Verificar si el usuario está autenticado
    const token = localStorage.getItem('token')
    if (!token) {
      error.value = 'Debes iniciar sesión para publicar un artículo'
      isLoading.value = false
      return
    }
    
    const formData = new FormData()
    formData.append('title', title.value)
    formData.append('description', description.value)
    formData.append('category', category.value)
    formData.append('condition', condition.value)
    formData.append('location', location.value)
    
    images.value.forEach((image) => {
      formData.append('images', image)
    })
    
    // Incluir el token de autenticación en la solicitud
    const response = await axios.post('/api/v1/items', formData, {
      headers: {
        'Authorization': `Bearer ${token}`
        // No es necesario establecer 'Content-Type' para FormData, Axios lo hace automáticamente
      }
    })
    
    console.log('Artículo publicado exitosamente:', response.data)
    router.push('/')
  } catch (err) {
    console.error('Error al publicar artículo:', err)
    error.value = err.response?.data?.error || 'Error al publicar el artículo. Por favor intente nuevamente.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.item-post {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
}

.item-post div {
  margin-bottom: 1rem;
}

.item-post label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.item-post input[type="text"],
.item-post select,
.item-post textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

textarea {
  min-height: 100px;
}

button[type="submit"] {
  background-color: #4CAF50;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

button[type="submit"]:hover {
  background-color: #45a049;
}

button[type="submit"]:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  padding: 1rem;
  margin-bottom: 1rem;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
}
</style>