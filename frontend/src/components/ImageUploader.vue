<template>
  <div class="space-y-4">
    <div 
      @dragover.prevent="dragOver = true"
      @dragleave="dragOver = false"
      @drop.prevent="handleDrop"
      :class="[dragOver ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300', 'border-2 border-dashed rounded-md p-6 text-center cursor-pointer']"
    >
      <div class="flex flex-col items-center justify-center space-y-2">
        <svg class="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p class="text-sm text-gray-600">
          <span class="font-medium text-indigo-600">Sube tus imágenes</span> o arrástralas aquí
        </p>
        <p class="text-xs text-gray-500">
          JPG, PNG o WEBP (máx. 5MB cada una, mínimo 300x300px)
        </p>
      </div>
      <input 
        type="file" 
        ref="fileInput"
        @change="handleFileSelect"
        accept="image/jpeg,image/png,image/webp"
        multiple
        class="hidden"
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
import { ref } from 'vue'

type ImagePreview = {
  url: string
  file: File
}

const emit = defineEmits<{
  (e: 'update:modelValue', files: File[]): void
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const dragOver = ref(false)
const uploadProgress = ref(0)
const previews = ref<ImagePreview[]>([])
const errors = ref<string[]>([])

const MAX_FILES = 5
const MAX_SIZE = 5 * 1024 * 1024 // 5MB
const MIN_DIMENSIONS = { width: 300, height: 300 }

const triggerFileSelect = () => {
  fileInput.value?.click()
}

const handleDrop = (e: DragEvent) => {
  dragOver.value = false
  if (!e.dataTransfer?.files) return
  
  const files = Array.from(e.dataTransfer.files)
  processFiles(files)
}

const handleFileSelect = (e: Event) => {
  const input = e.target as HTMLInputElement
  if (!input.files) return
  
  const files = Array.from(input.files)
  processFiles(files)
}

const processFiles = (files: File[]) => {
  errors.value = []
  
  // Validación de cantidad
  if (files.length + previews.value.length > MAX_FILES) {
    errors.value.push(`Solo puedes subir un máximo de ${MAX_FILES} imágenes`)
    return
  }
  
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
        previews.value.push({
          url: img.src,
          file: file
        })
        emit('update:modelValue', previews.value.map(p => p.file))
      }
    }
  })
}

const removeImage = (index: number) => {
  previews.value.splice(index, 1)
  emit('update:modelValue', previews.value.map(p => p.file))
}

const moveLeft = (index: number) => {
  if (index <= 0) return
  
  const temp = previews.value[index]
  previews.value[index] = previews.value[index - 1]
  previews.value[index - 1] = temp
  
  emit('update:modelValue', previews.value.map(p => p.file))
}

const moveRight = (index: number) => {
  if (index >= previews.value.length - 1) return
  
  const temp = previews.value[index]
  previews.value[index] = previews.value[index + 1]
  previews.value[index + 1] = temp
  
  emit('update:modelValue', previews.value.map(p => p.file))
}

const simulateUpload = () => {
  uploadProgress.value = 0
  const interval = setInterval(() => {
    uploadProgress.value += 10
    if (uploadProgress.value >= 100) {
      clearInterval(interval)
      setTimeout(() => {
        uploadProgress.value = 0
      }, 2000)
    }
  }, 200)
}

defineExpose({
  triggerFileSelect
})
</script>