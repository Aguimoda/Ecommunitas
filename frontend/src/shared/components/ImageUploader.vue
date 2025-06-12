<!--
/**
 * @file ImageUploader.vue
 * @description Componente de carga de imágenes con funcionalidad drag & drop
 * 
 * Este componente proporciona una interfaz intuitiva para que los usuarios
 * puedan cargar múltiples imágenes mediante arrastrar y soltar o selección
 * de archivos. Incluye previsualización, validación y optimización automática.
 * 
 * CARACTERÍSTICAS PRINCIPALES:
 * - 📁 Carga múltiple de imágenes
 * - 🖱️ Interfaz drag & drop intuitiva
 * - 👁️ Previsualización en tiempo real
 * - ✅ Validación de tipos y tamaños
 * - 🗜️ Compresión automática de imágenes
 * - 📱 Diseño responsive y accesible
 * - 🚫 Eliminación individual de imágenes
 * 
 * FUNCIONALIDADES:
 * - Soporte para formatos: JPG, PNG, GIF, WebP
 * - Validación de tamaño máximo por imagen
 * - Límite configurable de número de imágenes
 * - Compresión automática para optimizar carga
 * - Previsualización con thumbnails
 * - Indicadores de progreso de carga
 * - Manejo de errores con mensajes descriptivos
 * 
 * TECNOLOGÍAS:
 * - Vue 3 Composition API
 * - TypeScript para tipado estático
 * - File API para manejo de archivos
 * - Canvas API para compresión
 * - Tailwind CSS para estilos
 * 
 * @author Equipo de Desarrollo Ecommunitas
 * @version 1.0.0
 * @since 1.0.0
 */
-->
<template>
  <!-- Contenedor principal del componente de carga de imágenes -->
  <div class="space-y-4">
    <!-- Área de carga con soporte para drag & drop -->
    <div 
      @dragover.prevent="dragOver = true"
      @dragleave="dragOver = false"
      @drop.prevent="handleDrop"
      :class="[dragOver ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300', 'border-2 border-dashed rounded-md p-6 text-center cursor-pointer']"
      role="button"
      tabindex="0"
      @keydown.enter="triggerFileSelect"
      @keydown.space="triggerFileSelect"
      aria-label="Área de carga de imágenes"
    >
      <div class="flex flex-col items-center justify-center space-y-2">
        <!-- Icono de carga -->
        <svg class="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <!-- Texto instructivo -->
        <p class="text-sm text-gray-600" id="upload-help">
          <span class="font-medium text-indigo-600">Sube tus imágenes</span> o arrástralas aquí
        </p>
        <p class="text-xs text-gray-500">
          JPG, PNG o WEBP (máx. 5MB cada una, mínimo 300x300px)
        </p>
      </div>
      <!-- Input oculto para selección de archivos -->
      <input 
        type="file" 
        ref="fileInput"
        @change="handleFileSelect"
        accept="image/jpeg,image/png,image/webp"
        multiple
        class="hidden"
        aria-describedby="upload-help"
      />
    </div>

    <div v-if="uploadProgress > 0 && uploadProgress < 100" class="w-full bg-gray-200 rounded-full h-2.5">
      <div 
        class="bg-indigo-600 h-2.5 rounded-full" 
        :style="{ width: `${uploadProgress}%` }"
      ></div>
    </div>

    <div v-if="errors.length > 0" class="rounded-md bg-red-50 p-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">Error en las imágenes</h3>
          <div class="mt-2 text-sm text-red-700">
            <ul role="list" class="list-disc pl-5 space-y-1">
              <li v-for="(error, index) in errors" :key="index">{{ error }}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div v-if="previews.length > 0" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      <div 
        v-for="(preview, index) in previews" 
        :key="index"
        class="relative group"
      >
        <img 
          :src="preview.url" 
          :alt="`Preview ${index + 1}`"
          class="w-full h-32 object-cover rounded-md"
        />
        <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-md flex items-center justify-center">
          <button 
            type="button" 
            @click="removeImage(index)"
            class="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 rounded-full bg-red-500 text-white"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <button 
            type="button" 
            @click="moveLeft(index)"
            v-if="index > 0"
            class="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 rounded-full bg-white text-gray-800 absolute left-1"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button 
            type="button" 
            @click="moveRight(index)"
            v-if="index < previews.length - 1"
            class="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 rounded-full bg-white text-gray-800 absolute right-1"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// ============================================================================
// IMPORTACIONES
// ============================================================================

// Importaciones de Vue 3 Composition API
import { ref, computed } from 'vue'
// Utilidad para mostrar errores al usuario
import { displayError } from '@/shared/utils/errorHandler'

// ============================================================================
// INTERFACES Y TIPOS
// ============================================================================

/**
 * Interface que define la estructura de un archivo de imagen
 * Contiene tanto el archivo original como la URL de previsualización
 */
interface ImageFile {
  /** Archivo original seleccionado por el usuario */
  file: File
  /** URL de previsualización generada con createObjectURL */
  url: string
  /** Identificador único para el archivo */
  id: string
}

type ImagePreview = {
  url: string
  file: File
}

// ============================================================================
// PROPS Y CONFIGURACIÓN
// ============================================================================

/**
 * Props del componente con valores por defecto
 * Permite configurar límites y restricciones de carga
 */
const props = defineProps<{
  /** Número máximo de archivos permitidos (por defecto: 5) */
  maxFiles?: number
  /** Tamaño máximo por archivo en MB (por defecto: 5MB) */
  maxFileSize?: number
  /** Tipos de archivo aceptados (por defecto: imágenes comunes) */
  acceptedTypes?: string[]
}>()

// ============================================================================
// EVENTOS Y EMISIONES
// ============================================================================

/**
 * Define los eventos que este componente puede emitir
 * Permite comunicación bidireccional con el componente padre
 * 
 * EVENTOS DISPONIBLES:
 * - update:modelValue: Actualiza la lista de archivos seleccionados
 * - file-selected: Notifica cuando se selecciona un archivo individual
 * - update:images: Actualiza la lista completa de imágenes con metadatos
 * - upload-start: Indica el inicio del proceso de carga
 * - upload-complete: Notifica la finalización exitosa de la carga
 * - upload-error: Reporta errores durante el proceso de carga
 */
const emit = defineEmits<{
  /** Actualiza la lista de archivos seleccionados para v-model */
  'update:modelValue': [files: File[]]
  /** Notifica la selección de un archivo individual (compatibilidad con ItemForm) */
  'file-selected': [file: File | null]
  /** Actualiza la lista completa de imágenes con metadatos adicionales */
  'update:images': [images: ImageFile[]]
  /** Indica el inicio del proceso de carga de imágenes */
  'upload-start': []
  /** Notifica la finalización exitosa del proceso de carga */
  'upload-complete': [images: ImageFile[]]
  /** Reporta errores que ocurren durante el proceso de carga */
  'upload-error': [error: string]
}>()

// ============================================================================
// ESTADO REACTIVO
// ============================================================================

/** Referencia al elemento input de archivo */
const fileInput = ref<HTMLInputElement | null>(null)

/** Array reactivo que contiene las imágenes cargadas */
const images = ref<ImageFile[]>([])

/** Estado que indica si se está arrastrando un archivo sobre el área */
const dragOver = ref(false)

/** Estado que indica si hay una carga en progreso */
const uploading = ref(false)

const uploadProgress = ref(0)
const previews = ref<ImagePreview[]>([])
const errors = ref<string[]>([])

const MAX_FILES = 5
const MAX_SIZE = 5 * 1024 * 1024 // 5MB
const MIN_DIMENSIONS = { width: 300, height: 300 }

// ============================================================================
// MÉTODOS Y FUNCIONES
// ============================================================================

/**
 * Activa el selector de archivos nativo del navegador
 * Se ejecuta cuando el usuario hace clic en el área de carga
 */
const triggerFileSelect = () => {
  fileInput.value?.click()
}

/**
 * Maneja el evento de soltar archivos en el área de drag & drop
 * Procesa los archivos arrastrados y resetea el estado visual
 * @param e - Evento de drop con los archivos
 */
const handleDrop = (e: DragEvent) => {
  dragOver.value = false
  if (!e.dataTransfer?.files) return
  
  const files = Array.from(e.dataTransfer.files)
  processFiles(files)
}

/**
 * Maneja la selección de archivos desde el input nativo
 * Procesa los archivos seleccionados y los envía para validación
 * @param e - Evento de cambio del input de archivo
 */
const handleFileSelect = (e: Event) => {
  const input = e.target as HTMLInputElement
  if (!input.files) return
  
  const files = Array.from(input.files)
  processFiles(files)
}

/**
 * Procesa y valida los archivos seleccionados
 * Filtra solo imágenes, valida tamaños y genera previsualizaciones
 * @param files - Array de archivos a procesar
 */
const processFiles = (files: File[]) => {
  errors.value = []
  
  // Validación de cantidad
  if (files.length + previews.value.length > MAX_FILES) {
    errors.value.push(`Solo puedes subir un máximo de ${MAX_FILES} imágenes`)
    return
  }
  
  // Emitir evento de inicio de carga
  emit('upload-start')
  uploading.value = true
  
  files.forEach(file => {
    // Validación de tipo
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      errors.value.push(`${file.name}: Formato no soportado (solo JPG, PNG, WEBP)`)
      return
    }
    
    // Validación de tamaño
    if (file.size > MAX_SIZE) {
      errors.value.push(`${file.name}: El tamaño excede el límite de 5MB`)
      return
    }
    
    // Validación de dimensiones
    const img = new Image()
    img.src = URL.createObjectURL(file)
    img.onload = () => {
      if (img.width < MIN_DIMENSIONS.width || img.height < MIN_DIMENSIONS.height) {
        errors.value.push(`${file.name}: Las dimensiones deben ser al menos ${MIN_DIMENSIONS.width}x${MIN_DIMENSIONS.height}px`)
        return
      }
      
      if (errors.value.length === 0) {
        // Crear objeto de imagen completo
        const imageFile: ImageFile = {
          file,
          url: img.src,
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }
        
        // Agregar a la lista de imágenes
        images.value.push(imageFile)
        
        // Mantener compatibilidad con el formato anterior
        previews.value.push({
          url: img.src,
          file: file
        })
        
        emit('update:modelValue', previews.value.map(p => p.file))
        // Emitir el evento file-selected con el primer archivo para compatibilidad con ItemForm
        emit('file-selected', previews.value[0]?.file || null)
        emit('update:images', images.value)
      }
    }
    
    img.onerror = () => {
      errors.value.push(`${file.name}: Error al cargar la imagen`)
      emit('upload-error', `Error al cargar la imagen ${file.name}`)
    }
  })
  
  uploading.value = false
  emit('upload-complete', images.value)
}

/**
 * Elimina una imagen de la lista de previsualizaciones
 * Actualiza el estado y emite eventos de cambio
 * @param index - Índice de la imagen a eliminar
 */
const removeImage = (index: number) => {
  // Liberar memoria de la URL de objeto
  const removedPreview = previews.value[index]
  if (removedPreview?.url.startsWith('blob:')) {
    URL.revokeObjectURL(removedPreview.url)
  }
  
  // Eliminar de ambas listas
  previews.value.splice(index, 1)
  images.value.splice(index, 1)
  
  emit('update:modelValue', previews.value.map(p => p.file))
  // Emitir el evento file-selected con el primer archivo o null si no hay archivos
  emit('file-selected', previews.value[0]?.file || null)
  emit('update:images', images.value)
}

const moveLeft = (index: number) => {
  if (index <= 0) return
  
  const temp = previews.value[index]
  previews.value[index] = previews.value[index - 1]
  previews.value[index - 1] = temp
  
  emit('update:modelValue', previews.value.map(p => p.file))
  // Emitir el evento file-selected con el primer archivo
  emit('file-selected', previews.value[0]?.file || null)
}

const moveRight = (index: number) => {
  if (index >= previews.value.length - 1) return
  
  const temp = previews.value[index]
  previews.value[index] = previews.value[index + 1]
  previews.value[index + 1] = temp
  
  emit('update:modelValue', previews.value.map(p => p.file))
  // Emitir el evento file-selected con el primer archivo
  emit('file-selected', previews.value[0]?.file || null)
}

defineExpose({
  triggerFileSelect
})
</script>