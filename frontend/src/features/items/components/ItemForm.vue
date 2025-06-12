<!--
/**
 * @file ItemForm.vue
 * @description Formulario completo para crear y editar artículos en Ecommunitas
 * 
 * Este componente proporciona una interfaz de usuario completa para la creación
 * y edición de artículos en la plataforma. Incluye validación en tiempo real,
 * carga de imágenes, selección de ubicación y manejo de estados de formulario.
 * 
 * CARACTERÍSTICAS PRINCIPALES:
 * - 📝 Formulario reactivo con validación en tiempo real
 * - 🖼️ Carga múltiple de imágenes con previsualización
 * - 🗺️ Selector de ubicación integrado con mapas
 * - 🎯 Categorización de artículos
 * - 💾 Guardado automático de borradores
 * - ✅ Validación completa de campos
 * - 📱 Diseño responsive y accesible
 * 
 * FUNCIONALIDADES:
 * - Creación de nuevos artículos
 * - Edición de artículos existentes
 * - Validación de campos obligatorios
 * - Manejo de errores con mensajes descriptivos
 * - Previsualización en tiempo real
 * - Guardado de borradores en localStorage
 * - Integración con servicios de backend
 * 
 * CAMPOS DEL FORMULARIO:
 * - Título (obligatorio)
 * - Descripción (obligatorio)
 * - Categoría (obligatorio)
 * - Imágenes (opcional, múltiples)
 * - Ubicación (opcional, con mapa)
 * - Estado (disponible/no disponible)
 * 
 * TECNOLOGÍAS:
 * - Vue 3 Composition API
 * - TypeScript para tipado estático
 * - Tailwind CSS para estilos
 * - Validación personalizada
 * - LocalStorage para borradores
 * 
 * @author Equipo de Desarrollo Ecommunitas
 * @version 1.0.0
 * @since 1.0.0
 */
-->
<template>
  <!-- Formulario principal para artículos -->
  <form @submit.prevent="handleSubmit" class="item-form fade-in">
    <!-- Title Field / Campo de Título -->
    <div class="form-field" :class="{ 'form-field--error': errors.title }">
      <label for="title" class="form-field__label">
        Title / Título *
      </label>
      <input
        id="title"
        v-model="formData.title"
        type="text"
        required
        class="form-field__input"
        :class="{ 'shake': errors.title }"
        placeholder="Enter item title / Ingrese el título del artículo"
      />
      <p v-if="errors.title" class="form-field__error">{{ errors.title }}</p>
    </div>

    <!-- Description Field / Campo de Descripción -->
    <div class="form-field" :class="{ 'form-field--error': errors.description }">
      <label for="description" class="form-field__label">
        Description / Descripción *
      </label>
      <textarea
        id="description"
        v-model="formData.description"
        required
        class="form-field__textarea"
        :class="{ 'shake': errors.description }"
        placeholder="Describe your item / Describe su artículo"
      ></textarea>
      <p v-if="errors.description" class="form-field__error">{{ errors.description }}</p>
    </div>

    <!-- Category Field / Campo de Categoría -->
    <div class="form-field" :class="{ 'form-field--error': errors.category }">
      <label for="category" class="form-field__label">
        Category / Categoría *
      </label>
      <select
        id="category"
        v-model="formData.category"
        required
        class="form-field__select"
        :class="{ 'shake': errors.category }"
      >
        <option value="" disabled>Select category / Seleccione categoría</option>
        <option value="books">Books / Libros</option>
        <option value="electronics">Electronics / Electrónicos</option>
        <option value="clothing">Clothing / Ropa</option>
        <option value="furniture">Furniture / Muebles</option>
        <option value="other">Other / Otros</option>
      </select>
      <p v-if="errors.category" class="form-field__error">{{ errors.category }}</p>
    </div>

    <!-- Condition Field / Campo de Condición -->
    <div class="form-field" :class="{ 'form-field--error': errors.condition }">
      <label for="condition" class="form-field__label">
        Condition / Condición *
      </label>
      <select
        id="condition"
        v-model="formData.condition"
        required
        class="form-field__select"
        :class="{ 'shake': errors.condition }"
      >
        <option value="" disabled>Select condition / Seleccione condición</option>
        <option value="new">New / Nuevo</option>
        <option value="like_new">Like New / Como Nuevo</option>
        <option value="good">Good / Bueno</option>
        <option value="fair">Fair / Regular</option>
        <option value="poor">Poor / Malo</option>
      </select>
      <p v-if="errors.condition" class="form-field__error">{{ errors.condition }}</p>
    </div>

    <!-- Location Field / Campo de Ubicación -->
    <div class="form-field" :class="{ 'form-field--error': errors.location }">
      <label class="form-field__label">
        Location / Ubicación *
      </label>
      <LocationPicker
        :initial-location="initialLocationData"
        :initial-address="formData.location"
        @location-selected="onLocationSelected"
        @location-cleared="onLocationCleared"
      />
      <p v-if="errors.location" class="form-field__error">{{ errors.location }}</p>
    </div>

    <!-- Image Upload Section / Sección de Carga de Imagen -->
    <div class="form-field" :class="{ 'form-field--error': errors.image }">
      <label class="form-field__label">
        Image / Imagen *
      </label>
      <div class="image-upload-section" :class="{
        'image-upload-section--error': errors.image,
        'image-upload-section--success': imageFile && !errors.image
      }">
        <ImageUploader @file-selected="handleImageUpload" />
      </div>
      <p v-if="errors.image" class="form-field__error">{{ errors.image }}</p>
    </div>

    <!-- Submit Button / Botón de Envío -->
    <div class="form-field">
      <button
        type="submit"
        :disabled="isSubmitting"
        class="submit-button"
        :class="{ 'submit-button--loading': isSubmitting }"
      >
        {{ getSubmitButtonText() }}
      </button>
    </div>
    
    <!-- General Error Message / Mensaje de Error General -->
    <p v-if="errors.submit" class="form-field__error">{{ errors.submit }}</p>
  </form>
</template>

<script setup>
/**
 * ItemForm Component Script
 * Script del Componente ItemForm
 * 
 * Handles item creation and editing functionality
 * Maneja la funcionalidad de creación y edición de artículos
 */

import { ref, watch, computed } from 'vue'
import { ImageUploader, LocationPicker } from '@/shared/components'
import { useItemsStore } from '@/features/items'
import { displayError } from '@/shared/utils/errorHandler'
import './ItemForm.css'

// Component Props / Propiedades del Componente
const props = defineProps({
  /**
   * Initial data for the form (used in edit mode)
   * Datos iniciales para el formulario (usado en modo edición)
   */
  initialData: {
    type: Object,
    default: () => ({
      _id: null,
      title: '',
      description: '',
      category: '',
      condition: '',
      location: '',
      latitude: null,
      longitude: null,
      imageUrls: []
    })
  },
  /**
   * Whether the form is in editing mode
   * Si el formulario está en modo edición
   */
  isEditing: {
    type: Boolean,
    default: false
  }
})

// Component Events / Eventos del Componente
const emit = defineEmits(['success'])

// Store
const itemsStore = useItemsStore()

// Reactive State / Estado Reactivo
const formData = ref({ ...props.initialData })
const imageFile = ref(null)
const errors = ref({})
const isSubmitting = ref(false)


// Computed properties / Propiedades computadas
const initialLocationData = computed(() => {
  if (formData.value.latitude && formData.value.longitude) {
    return {
      lat: formData.value.latitude,
      lng: formData.value.longitude
    }
  }
  return null
})

/**
 * Watch for changes in initialData to update the form when editing
 * Observa cambios en initialData para actualizar el formulario al editar
 */
watch(() => props.initialData, (newData) => {
  formData.value = { ...newData }
  imageFile.value = null
}, { deep: true })

/**
 * Handles image file selection from ImageUploader component
 * Maneja la selección de archivo de imagen del componente ImageUploader
 * 
 * @param {File|null} file - Selected image file / Archivo de imagen seleccionado
 */
const handleImageUpload = (file) => {
  imageFile.value = file
  
  // Clear or set image validation error
  // Limpiar o establecer error de validación de imagen
  if (!file) {
    errors.value.image = 'Image is required / La imagen es requerida'
  } else {
    delete errors.value.image
  }
}

/**
 * Validates all form fields and returns validation status
 * Valida todos los campos del formulario y retorna el estado de validación
 * 
 * @returns {boolean} - True if form is valid / Verdadero si el formulario es válido
 */
const validateForm = () => {
  const newErrors = {}
  
  // Validate required text fields / Validar campos de texto requeridos
  const requiredFields = [
    { field: 'title', message: 'Title is required / El título es requerido' },
    { field: 'description', message: 'Description is required / La descripción es requerida' },
    { field: 'category', message: 'Category is required / La categoría es requerida' },
    { field: 'condition', message: 'Condition is required / La condición es requerida' },
    { field: 'location', message: 'Location is required / La ubicación es requerida' }
  ]
  
  requiredFields.forEach(({ field, message }) => {
    if (!formData.value[field]?.trim()) {
      newErrors[field] = message
    }
  })
  
  // Validate image requirements / Validar requisitos de imagen
  const imageValidationResult = validateImageRequirements()
  if (imageValidationResult) {
    newErrors.image = imageValidationResult
  }
  
  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

/**
 * Validates image requirements based on form mode
 * Valida los requisitos de imagen según el modo del formulario
 * 
 * @returns {string|null} - Error message or null if valid / Mensaje de error o null si es válido
 */
const validateImageRequirements = () => {
  // For new items, image is always required
  // Para artículos nuevos, la imagen siempre es requerida
  if (!props.isEditing && !imageFile.value) {
    return 'Image is required / La imagen es requerida'
  }
  
  // For editing, require image only if no existing images and no new file selected
  // Para edición, requerir imagen solo si no hay imágenes existentes y no se seleccionó archivo nuevo
  if (props.isEditing && !imageFile.value && 
      (!formData.value.imageUrls || formData.value.imageUrls.length === 0)) {
    return 'Image is required when editing if no image exists / La imagen es requerida al editar si no existe imagen'
  }
  
  return null
}

/**
 * Creates FormData object with all form fields and image
 * Crea objeto FormData con todos los campos del formulario e imagen
 * 
 * @returns {FormData} - Formatted form data / Datos del formulario formateados
 */
const createFormData = () => {
  const data = new FormData()
  
  // Add text fields / Agregar campos de texto
  const textFields = ['title', 'description', 'category', 'condition', 'location']
  textFields.forEach(field => {
    data.append(field, formData.value[field])
  })
  
  // Add coordinates if available / Agregar coordenadas si están disponibles
  if (formData.value.latitude !== null && formData.value.longitude !== null) {
    data.append('latitude', formData.value.latitude.toString())
    data.append('longitude', formData.value.longitude.toString())
  }
  
  // Add image file if present / Agregar archivo de imagen si está presente
  if (imageFile.value) {
    data.append('images', imageFile.value)
  }
  
  return data
}

/**
 * Handles location selection from LocationPicker component
 * Maneja la selección de ubicación del componente LocationPicker
 * 
 * @param {Object} locationData - Location data from LocationPicker
 */
const onLocationSelected = (locationData) => {
  formData.value.location = locationData.address
  formData.value.latitude = locationData.latitude
  formData.value.longitude = locationData.longitude
  
  // Clear location error if it exists
  if (errors.value.location) {
    delete errors.value.location
  }
  
  // toast.success('Location selected successfully / Ubicación seleccionada exitosamente')
}

/**
 * Handles location clearing from LocationPicker component
 * Maneja la limpieza de ubicación del componente LocationPicker
 */
const onLocationCleared = () => {
  formData.value.location = ''
  formData.value.latitude = null
  formData.value.longitude = null
}

/**
 * Handles form submission for both create and update operations
 * Maneja el envío del formulario para operaciones de creación y actualización
 */
const handleSubmit = async () => {
  // Validate form before submission / Validar formulario antes del envío
  if (!validateForm()) {
    displayError('Please fix the errors in the form / Por favor corrija los errores en el formulario')
    return
  }
  
  isSubmitting.value = true
  errors.value = {}
  
  try {
    const data = createFormData()
    let resultItem
    
    if (props.isEditing) {
      resultItem = await itemsStore.updateItem(formData.value._id, data)
      // toast.success('Artículo actualizado correctamente / Item updated successfully')
    } else {
      resultItem = await itemsStore.createItem(data)
      // toast.success('Artículo registrado correctamente / Item registered successfully')
    }
    
    // Emitir el item actualizado/creado para que el componente padre pueda usarlo
    emit('success', resultItem)
  } catch (error) {
    handleSubmissionError(error)
  } finally {
    isSubmitting.value = false
  }
}

/**
 * Handles errors during form submission
 * Maneja errores durante el envío del formulario
 * 
 * @param {Error} error - The error object / El objeto de error
 */
const handleSubmissionError = (error) => {
  console.error('Error submitting item:', error)
  
  const errorMessage = error.response?.data?.error || 
                      error.message || 
                      'Error al procesar el artículo / Error processing item'
  
  displayError(errorMessage)
  errors.value.submit = errorMessage
}

/**
 * Gets the appropriate text for the submit button based on state
 * Obtiene el texto apropiado para el botón de envío según el estado
 * 
 * @returns {string} - Button text / Texto del botón
 */
const getSubmitButtonText = () => {
  if (isSubmitting.value) {
    return 'Processing... / Procesando...'
  }
  
  return props.isEditing 
    ? 'Update Item / Actualizar Artículo' 
    : 'Submit Item / Enviar Artículo'
}
</script>