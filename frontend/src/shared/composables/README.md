# Shared Composables Documentation

## Descripción General

Esta carpeta contiene composables reutilizables que proporcionan funcionalidad común a través de toda la aplicación. Todos los composables están escritos en TypeScript y siguen las mejores prácticas de Vue 3 Composition API.

## Composables Disponibles

### 🔐 useErrorHandler
**Archivo:** `useErrorHandler.ts`
**Propósito:** Manejo centralizado de errores con notificaciones automáticas
**Características:**
- Procesamiento de errores de API
- Notificaciones automáticas al usuario
- Logging de errores para debugging
- Manejo de errores de autenticación

**Uso básico:**
```typescript
import { useErrorHandler } from '@/shared/composables'

const { handleError, processError } = useErrorHandler()

try {
  await apiCall()
} catch (error) {
  handleError(error, 'Error al realizar la operación')
}
```

### 📍 useGeolocation
**Archivo:** `useGeolocation.ts`
**Propósito:** Acceso a la geolocalización del usuario con manejo de errores
**Características:**
- Obtención de coordenadas actuales
- Seguimiento de posición en tiempo real
- Manejo de permisos y errores
- Configuración de precisión y timeout

**Uso básico:**
```typescript
import { useGeolocation } from '@/shared/composables'

const { getCurrentPosition, watchPosition, isSupported } = useGeolocation()

const position = await getCurrentPosition()
console.log(position.coords.latitude, position.coords.longitude)
```

### 🖼️ useImageUpload
**Archivo:** `useImageUpload.ts`
**Propósito:** Subida y validación de imágenes con preview
**Características:**
- Validación de tipo y tamaño de archivo
- Preview de imágenes antes de subir
- Compresión automática de imágenes
- Manejo de múltiples archivos

**Uso básico:**
```typescript
import { useImageUpload } from '@/shared/composables'

const { uploadImages, previewUrls, isUploading } = useImageUpload({
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png']
})

const handleFileSelect = async (files: FileList) => {
  const urls = await uploadImages(files)
  console.log('URLs subidas:', urls)
}
```

### 💾 useLocalStorage
**Archivo:** `useLocalStorage.ts`
**Propósito:** Manejo reactivo de localStorage con sincronización
**Características:**
- Sincronización automática con localStorage
- Reactividad con Vue
- Serialización automática de objetos
- Sincronización entre pestañas
- Funciones auxiliares para preferencias de usuario

**Uso básico:**
```typescript
import { useLocalStorage, useUserPreferences } from '@/shared/composables'

// Uso general
const [theme, setTheme] = useLocalStorage('theme', 'light')
setTheme('dark')

// Preferencias de usuario
const { preferences, updatePreference } = useUserPreferences()
updatePreference('language', 'es')
```

### 🔔 useNotifications
**Archivo:** `useNotifications.ts`
**Propósito:** Sistema de notificaciones toast centralizado
**Características:**
- Diferentes tipos de notificación (success, error, warning, info)
- Configuración de duración y posición
- Queue de notificaciones
- Notificaciones persistentes

**Uso básico:**
```typescript
import { useNotifications } from '@/shared/composables'

const { notifySuccess, notifyError, notifyWarning, notifyInfo } = useNotifications()

notifySuccess('Operación completada exitosamente')
notifyError('Error al procesar la solicitud')
```

### 📄 usePagination
**Archivo:** `usePagination.ts`
**Propósito:** Lógica de paginación reutilizable para listas y tablas
**Características:**
- Paginación client-side y server-side
- Navegación completa (primera, anterior, siguiente, última)
- Configuración de tamaño de página
- Cálculos automáticos de índices
- Función auxiliar para paginación de servidor

**Uso básico:**
```typescript
import { usePagination, useServerPagination } from '@/shared/composables'

// Paginación client-side
const items = ref([/* array de datos */])
const {
  paginatedData,
  currentPage,
  totalPages,
  goToPage,
  nextPage,
  previousPage
} = usePagination(items, { pageSize: 10 })

// Paginación server-side
const {
  currentPage,
  pageSize,
  goToPage,
  buildPaginationQuery
} = useServerPagination()

const query = buildPaginationQuery() // { page: 1, limit: 10 }
```

### ✅ useValidation
**Archivo:** `useValidation.ts`
**Propósito:** Validación de formularios con reglas personalizables
**Características:**
- Validación en tiempo real
- Reglas de validación predefinidas
- Validación de campos individuales y formularios completos
- Mensajes de error personalizables

**Uso básico:**
```typescript
import { useValidation } from '@/shared/composables'

const { validateField, validateForm, errors } = useValidation()

// Validar campo individual
const emailValid = validateField('email', 'test@example.com', [
  { rule: 'required', message: 'Email es requerido' },
  { rule: 'email', message: 'Email inválido' }
])

// Validar formulario completo
const formData = { email: 'test@example.com', password: '123456' }
const isValid = validateForm(formData, {
  email: [{ rule: 'required' }, { rule: 'email' }],
  password: [{ rule: 'required' }, { rule: 'minLength', value: 6 }]
})
```

## Importación Centralizada

Todos los composables pueden importarse desde el index principal:

```typescript
import {
  useErrorHandler,
  useGeolocation,
  useImageUpload,
  useLocalStorage,
  useNotifications,
  usePagination,
  useValidation
} from '@/shared/composables'
```

## Convenciones de Desarrollo

### Nomenclatura
- Todos los composables siguen el patrón `useCamelCase`
- Los archivos están en TypeScript (`.ts`)
- Interfaces y tipos están exportados junto con los composables

### Estructura de Composables
```typescript
/**
 * JSDoc documentation
 */
import { ref, computed } from 'vue'

export interface ComposableOptions {
  // Opciones del composable
}

export interface ComposableReturn {
  // Tipo de retorno
}

export function useComposable(options: ComposableOptions = {}): ComposableReturn {
  // Implementación
  
  return {
    // Valores reactivos y funciones
  }
}
```

### Mejores Prácticas
1. **Reactividad:** Usar `ref` y `computed` apropiadamente
2. **TypeScript:** Definir interfaces para opciones y valores de retorno
3. **Documentación:** JSDoc completo para todas las funciones públicas
4. **Manejo de Errores:** Usar `useErrorHandler` para errores consistentes
5. **Notificaciones:** Usar `useNotifications` para feedback al usuario
6. **Cleanup:** Limpiar listeners y watchers en `onUnmounted`

## Testing

Cada composable debe tener tests unitarios correspondientes en la carpeta `tests/composables/`.

```typescript
// Ejemplo de test
import { describe, it, expect } from 'vitest'
import { useComposable } from '@/shared/composables/useComposable'

describe('useComposable', () => {
  it('should work correctly', () => {
    const { value, setValue } = useComposable()
    expect(value.value).toBe(null)
    
    setValue('test')
    expect(value.value).toBe('test')
  })
})
```