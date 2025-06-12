/**
 * @file index.ts
 * @description Índice del módulo de gestión de artículos de Ecommunitas
 * @module Features/Items
 * @version 1.0.0
 * @author Equipo de Desarrollo Ecommunitas
 * @created 2024
 * 
 * Este archivo centraliza todas las exportaciones relacionadas con la funcionalidad
 * de gestión de artículos/items del marketplace. Proporciona un punto único de
 * acceso a todos los componentes, servicios, stores y tipos relacionados con
 * la publicación, búsqueda y gestión de artículos.
 * 
 * ARQUITECTURA DEL MÓDULO:
 * ========================
 * 
 * 🏪 STORES (Estado Global):
 * - useItemsStore: Store principal de Pinia para gestión de estado de artículos
 * - Cache inteligente de artículos con invalidación automática
 * - Estado de búsqueda, filtros y paginación
 * - Gestión de artículo seleccionado y favoritos
 * - Optimización de rendimiento con lazy loading
 * 
 * 🔧 SERVICIOS (API):
 * - itemService: Cliente HTTP para operaciones CRUD de artículos
 * - Búsqueda avanzada con filtros geográficos y categorías
 * - Carga de imágenes con compresión automática
 * - Moderación y reportes de contenido
 * - Estadísticas y analytics de artículos
 * 
 * 🧩 COMPONENTES (UI):
 * - ItemGrid: Grilla responsiva de artículos
 * - ItemCard: Tarjeta individual de artículo
 * - ItemForm: Formulario de creación/edición
 * - ItemDetails: Vista detallada de artículo
 * - SearchFilters: Filtros avanzados de búsqueda
 * - ImageGallery: Galería de imágenes con zoom
 * 
 * 📄 VISTAS (Páginas):
 * - Lista de artículos con búsqueda y filtros
 * - Detalle de artículo individual
 * - Formulario de publicación/edición
 * - Mis artículos publicados
 * - Artículos favoritos
 * 
 * 📊 TIPOS (TypeScript):
 * - Item: Interfaz principal de artículo
 * - ItemsResponse: Respuesta paginada de la API
 * - CreateItemData: Datos para crear artículo
 * - UpdateItemData: Datos para actualizar artículo
 * - SearchParams: Parámetros de búsqueda avanzada
 * 
 * FUNCIONALIDADES PRINCIPALES:
 * ============================
 * 
 * 📝 GESTIÓN DE ARTÍCULOS:
 * - Publicación de nuevos artículos con imágenes
 * - Edición de artículos existentes
 * - Eliminación con confirmación
 * - Duplicación de artículos similares
 * - Gestión de estado (activo, pausado, vendido)
 * 
 * 🔍 BÚSQUEDA Y FILTRADO:
 * - Búsqueda por texto libre
 * - Filtros por categoría, condición, ubicación
 * - Búsqueda geográfica por proximidad
 * - Ordenamiento por relevancia, fecha, precio
 * - Filtros de rango de precios
 * 
 * 🖼️ GESTIÓN DE IMÁGENES:
 * - Carga múltiple con drag & drop
 * - Compresión automática para optimizar tamaño
 * - Reordenamiento de imágenes
 * - Previsualización antes de publicar
 * - Eliminación individual de imágenes
 * 
 * 📍 FUNCIONALIDADES GEOGRÁFICAS:
 * - Ubicación automática por GPS
 * - Búsqueda por radio de distancia
 * - Integración con mapas interactivos
 * - Sugerencias de ubicación
 * 
 * 💬 INTERACCIÓN SOCIAL:
 * - Sistema de favoritos
 * - Compartir artículos
 * - Reportar contenido inapropiado
 * - Contactar al vendedor
 * 
 * VENTAJAS DE LA ARQUITECTURA:
 * ============================
 * 
 * ✅ **Importaciones Limpias**: 
 *    `import { useItemsStore, itemService } from '@/features/items'`
 * 
 * ✅ **Cache Inteligente**: 
 *    Optimización automática de rendimiento con cache
 * 
 * ✅ **Búsqueda Avanzada**: 
 *    Filtros potentes y búsqueda geográfica
 * 
 * ✅ **Gestión de Estado**: 
 *    Estado reactivo y persistente
 * 
 * ✅ **Componentes Reutilizables**: 
 *    UI consistente en toda la aplicación
 * 
 * ✅ **Tipado Fuerte**: 
 *    TypeScript para mayor seguridad
 * 
 * @example
 * ```typescript
 * // Uso básico del módulo de artículos
 * import { 
 *   useItemsStore, 
 *   itemService,
 *   type Item,
 *   type SearchParams 
 * } from '@/features/items'
 * 
 * // En un componente Vue
 * const itemsStore = useItemsStore()
 * 
 * // Buscar artículos
 * const searchParams: SearchParams = {
 *   query: 'laptop',
 *   category: 'electronics',
 *   location: 'Madrid, España',
 *   distance: 10
 * }
 * 
 * await itemsStore.searchItems(searchParams)
 * 
 * // Crear nuevo artículo
 * const newItem = await itemService.createItem({
 *   title: 'Laptop Gaming',
 *   description: 'Excelente estado',
 *   category: 'electronics',
 *   condition: 'like_new',
 *   location: 'Madrid, España'
 * })
 * ```
 */

// Services
export { default as itemService } from './services/itemService'
export * from './services/itemService'

// Stores
export { useItemsStore } from './stores/itemsStore'

// Components
export * from './components'

// Views
export * from './views'

// Types (re-export for convenience)
export type {
  Item,
  ItemsResponse,
  CreateItemData,
  UpdateItemData,
  SearchParams
} from './services/itemService'