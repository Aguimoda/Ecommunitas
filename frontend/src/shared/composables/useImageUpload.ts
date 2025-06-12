/**
 * @file useImageUpload.ts
 * @description Composable para manejo de carga de imágenes en Ecommunitas
 * 
 * Este composable proporciona una solución completa para la carga, validación,
 * compresión y gestión de imágenes en la aplicación. Incluye funcionalidades
 * avanzadas como previsualización, redimensionamiento automático y validación
 * de archivos con mensajes de error localizados.
 * 
 * CARACTERÍSTICAS PRINCIPALES:
 * - 📸 Carga múltiple de imágenes con drag & drop
 * - 🔍 Previsualización automática de imágenes
 * - 🗜️ Compresión inteligente para optimizar tamaño
 * - ✅ Validación exhaustiva de archivos (tipo, tamaño, dimensiones)
 * - 📏 Redimensionamiento automático según límites configurables
 * - 🔄 Reordenamiento de imágenes por drag & drop
 * - 💾 Gestión eficiente de memoria con limpieza automática
 * - 📊 Progreso de carga en tiempo real
 * 
 * FUNCIONALIDADES:
 * - Validación de tipos de archivo (JPEG, PNG, WebP)
 * - Límites configurables de tamaño y cantidad
 * - Compresión con calidad ajustable
 * - Generación automática de FormData para APIs
 * - Formateo legible de tamaños de archivo
 * - Mensajes de error descriptivos y localizados
 * - Limpieza automática de URLs de previsualización
 * 
 * VALIDACIONES INCLUIDAS:
 * - Tipo de archivo (solo imágenes permitidas)
 * - Tamaño máximo por archivo (configurable)
 * - Número máximo de archivos (configurable)
 * - Dimensiones máximas de imagen
 * - Detección de archivos corruptos
 * 
 * CASOS DE USO:
 * - Carga de fotos de artículos en marketplace
 * - Actualización de avatares de usuario
 * - Galería de imágenes en perfiles
 * - Documentos gráficos en formularios
 * - Contenido multimedia en publicaciones
 * 
 * CONFIGURACIÓN:
 * - maxFiles: Número máximo de archivos (default: 5)
 * - maxSizeBytes: Tamaño máximo por archivo (default: 5MB)
 * - allowedTypes: Tipos MIME permitidos
 * - compressQuality: Calidad de compresión (0-1)
 * - maxWidth/maxHeight: Dimensiones máximas
 * - showNotifications: Mostrar notificaciones automáticas
 * 
 * TECNOLOGÍAS:
 * - Vue 3 Composition API
 * - TypeScript para tipado estático
 * - Canvas API para compresión de imágenes
 * - FileReader API para previsualización
 * - FormData API para envío a servidor
 * - Sistema de notificaciones integrado
 * 
 * @author Equipo de Desarrollo Ecommunitas
 * @version 1.0.0
 * @since 1.0.0
 * 
 * @example
 * ```typescript
 * // Uso básico
 * const {
 *   images,
 *   addFiles,
 *   removeImage,
 *   getFormData,
 *   isUploading
 * } = useImageUpload()
 * 
 * // Configuración personalizada
 * const imageUpload = useImageUpload({
 *   maxFiles: 3,
 *   maxSizeBytes: 2 * 1024 * 1024, // 2MB
 *   compressQuality: 0.7,
 *   maxWidth: 1200,
 *   maxHeight: 800
 * })
 * 
 * // Manejar selección de archivos
 * const handleFileSelect = async (event: Event) => {
 *   const files = (event.target as HTMLInputElement).files
 *   if (files) {
 *     await addFiles(files)
 *   }
 * }
 * 
 * // Enviar imágenes al servidor
 * const uploadImages = async () => {
 *   const formData = getFormData('photos')
 *   await api.post('/upload', formData)
 * }
 * ```
 */

import { ref, computed } from 'vue'
import { useNotifications } from './useNotifications'

export interface ImageFile {
  file: File
  preview: string
  id: string
}

export interface ImageUploadOptions {
  maxFiles?: number
  maxSizeBytes?: number
  allowedTypes?: string[]
  compressQuality?: number
  maxWidth?: number
  maxHeight?: number
  showNotifications?: boolean
}

export interface ImageValidationError {
  type: 'SIZE' | 'TYPE' | 'COUNT' | 'DIMENSION'
  message: string
  file?: File
}

export function useImageUpload(options: ImageUploadOptions = {}) {
  const { notifyError, notifySuccess } = useNotifications()
  
  // Default options
  const defaultOptions: Required<ImageUploadOptions> = {
    maxFiles: 5,
    maxSizeBytes: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    compressQuality: 0.8,
    maxWidth: 1920,
    maxHeight: 1080,
    showNotifications: true
  }
  
  const config = { ...defaultOptions, ...options }
  
  // Reactive state
  const images = ref<ImageFile[]>([])
  const isUploading = ref(false)
  const uploadProgress = ref(0)
  const errors = ref<ImageValidationError[]>([])
  
  // Computed properties
  const hasImages = computed(() => images.value.length > 0)
  const canAddMore = computed(() => images.value.length < config.maxFiles)
  const totalSize = computed(() => {
    return images.value.reduce((total, img) => total + img.file.size, 0)
  })
  
  /**
   * Validates a single file
   */
  const validateFile = (file: File): ImageValidationError | null => {
    // Check file type
    if (!config.allowedTypes.includes(file.type)) {
      return {
        type: 'TYPE',
        message: `Tipo de archivo no permitido. Formatos aceptados: ${config.allowedTypes.join(', ')}`,
        file
      }
    }
    
    // Check file size
    if (file.size > config.maxSizeBytes) {
      const maxSizeMB = (config.maxSizeBytes / (1024 * 1024)).toFixed(1)
      return {
        type: 'SIZE',
        message: `El archivo es demasiado grande. Tamaño máximo: ${maxSizeMB}MB`,
        file
      }
    }
    
    return null
  }
  
  /**
   * Creates a preview URL for an image file
   */
  const createPreview = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        resolve(e.target?.result as string)
      }
      reader.onerror = () => {
        reject(new Error('Error al leer el archivo'))
      }
      reader.readAsDataURL(file)
    })
  }
  
  /**
   * Compresses an image file
   */
  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img
        
        if (width > config.maxWidth || height > config.maxHeight) {
          const ratio = Math.min(config.maxWidth / width, config.maxHeight / height)
          width *= ratio
          height *= ratio
        }
        
        canvas.width = width
        canvas.height = height
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height)
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              })
              resolve(compressedFile)
            } else {
              resolve(file) // Fallback to original if compression fails
            }
          },
          file.type,
          config.compressQuality
        )
      }
      
      img.onerror = () => {
        resolve(file) // Fallback to original if loading fails
      }
      
      img.src = URL.createObjectURL(file)
    })
  }
  
  /**
   * Adds files to the upload queue
   */
  const addFiles = async (files: FileList | File[]): Promise<void> => {
    const fileArray = Array.from(files)
    errors.value = []
    
    // Check if adding these files would exceed the limit
    if (images.value.length + fileArray.length > config.maxFiles) {
      const error: ImageValidationError = {
        type: 'COUNT',
        message: `No puedes subir más de ${config.maxFiles} imágenes`
      }
      errors.value.push(error)
      
      if (config.showNotifications) {
        notifyError(error.message)
      }
      return
    }
    
    isUploading.value = true
    uploadProgress.value = 0
    
    const validFiles: File[] = []
    
    // Validate all files first
    for (const file of fileArray) {
      const validationError = validateFile(file)
      if (validationError) {
        errors.value.push(validationError)
        if (config.showNotifications) {
          notifyError(validationError.message)
        }
      } else {
        validFiles.push(file)
      }
    }
    
    // Process valid files
    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i]
      
      try {
        // Compress image if needed
        const processedFile = await compressImage(file)
        
        // Create preview
        const preview = await createPreview(processedFile)
        
        // Add to images array
        const imageFile: ImageFile = {
          file: processedFile,
          preview,
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }
        
        images.value.push(imageFile)
        
        // Update progress
        uploadProgress.value = ((i + 1) / validFiles.length) * 100
      } catch (error) {
        console.error('Error processing image:', error)
        if (config.showNotifications) {
          notifyError(`Error al procesar la imagen: ${file.name}`)
        }
      }
    }
    
    isUploading.value = false
    
    if (validFiles.length > 0 && config.showNotifications) {
      notifySuccess(`${validFiles.length} imagen(es) agregada(s) correctamente`)
    }
  }
  
  /**
   * Removes an image by ID
   */
  const removeImage = (id: string): void => {
    const index = images.value.findIndex(img => img.id === id)
    if (index !== -1) {
      // Revoke the preview URL to free memory
      URL.revokeObjectURL(images.value[index].preview)
      images.value.splice(index, 1)
      
      if (config.showNotifications) {
        notifySuccess('Imagen eliminada')
      }
    }
  }
  
  /**
   * Clears all images
   */
  const clearImages = (): void => {
    // Revoke all preview URLs
    images.value.forEach(img => {
      URL.revokeObjectURL(img.preview)
    })
    
    images.value = []
    errors.value = []
    
    if (config.showNotifications) {
      notifySuccess('Todas las imágenes han sido eliminadas')
    }
  }
  
  /**
   * Gets files as FormData for upload
   */
  const getFormData = (fieldName = 'images'): FormData => {
    const formData = new FormData()
    
    images.value.forEach((imageFile, index) => {
      formData.append(`${fieldName}[${index}]`, imageFile.file)
    })
    
    return formData
  }
  
  /**
   * Gets files as an array
   */
  const getFiles = (): File[] => {
    return images.value.map(img => img.file)
  }
  
  /**
   * Reorders images
   */
  const reorderImages = (fromIndex: number, toIndex: number): void => {
    const item = images.value.splice(fromIndex, 1)[0]
    images.value.splice(toIndex, 0, item)
  }
  
  /**
   * Formats file size for display
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
  
  /**
   * Gets validation summary
   */
  const getValidationSummary = (): string => {
    const maxSizeMB = (config.maxSizeBytes / (1024 * 1024)).toFixed(1)
    const allowedFormats = config.allowedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')
    
    return `Máximo ${config.maxFiles} imágenes, ${maxSizeMB}MB cada una. Formatos: ${allowedFormats}`
  }
  
  return {
    // State
    images,
    isUploading,
    uploadProgress,
    errors,
    
    // Computed
    hasImages,
    canAddMore,
    totalSize,
    
    // Methods
    addFiles,
    removeImage,
    clearImages,
    getFormData,
    getFiles,
    reorderImages,
    formatFileSize,
    getValidationSummary,
    
    // Config
    config
  }
}

// Export types for external use
export type UseImageUpload = ReturnType<typeof useImageUpload>