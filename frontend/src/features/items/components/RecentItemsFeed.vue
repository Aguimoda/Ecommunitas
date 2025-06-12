<!--
/**
 * @file RecentItemsFeed.vue
 * @description Componente para mostrar un feed de artículos recientes en Ecommunitas
 * 
 * Este componente renderiza una lista de los artículos más recientemente añadidos
 * a la plataforma, proporcionando una vista actualizada de la actividad reciente.
 * Utiliza el componente ItemGrid para mostrar los artículos con paginación
 * y funcionalidades de carga.
 * 
 * CARACTERÍSTICAS PRINCIPALES:
 * - 📰 Feed de artículos más recientes
 * - 🔄 Carga automática al montar el componente
 * - 📄 Paginación con "cargar más"
 * - ⚡ Integración con el store de items
 * - 🎨 Diseño responsive y moderno
 * - 🌙 Soporte para modo oscuro
 * - 🔄 Estados de carga y error
 * 
 * FUNCIONALIDADES:
 * - Obtención automática de artículos recientes
 * - Carga incremental de más artículos
 * - Manejo de estados de carga y error
 * - Reintento automático en caso de error
 * - Ordenamiento por fecha de creación
 * - Límite configurable de artículos por página
 * 
 * CONFIGURACIÓN:
 * - Límite por defecto: 25 artículos
 * - Ordenamiento: Por fecha reciente
 * - Muestra categoría pero no descripción
 * - Paginación habilitada
 * - Retry automático en errores
 * 
 * INTEGRACIÓN:
 * - Utiliza ItemGrid para renderizado
 * - Conectado al store de items (Pinia)
 * - Gestión de estado reactiva
 * - Manejo de errores centralizado
 * 
 * ESTADOS MANEJADOS:
 * - Carga inicial de artículos
 * - Carga de páginas adicionales
 * - Estados de error con retry
 * - Estado vacío (sin artículos)
 * - Paginación y navegación
 * 
 * TECNOLOGÍAS:
 * - Vue 3 Composition API
 * - Pinia para gestión de estado
 * - Tailwind CSS para estilos
 * - Componente ItemGrid reutilizable
 * 
 * @author Equipo de Desarrollo Ecommunitas
 * @version 1.0.0
 * @since 1.0.0
 */
-->
<template>
  <div class="recent-items-feed bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow">
    <h2 class="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-200">Últimos Artículos Añadidos</h2>
    
    <ItemGrid
      :items="items"
      :loading="loading"
      :error="error"
      :has-next-page="hasNextPage"
      :total-items="totalItems"
      :current-page="currentPage"
      :total-pages="totalPages"
      :show-description="false"
      :show-category="true"
      :loading-text="'Cargando artículos recientes...'"
      :empty-text="'No hay artículos recientes'"
      :empty-subtext="'Los nuevos artículos aparecerán aquí cuando se publiquen'"
      :load-more-text="'Cargar más artículos'"
      @load-more="loadMoreItems"
      @retry="fetchRecentItems"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { useItemsStore } from '@/features/items'
import { ItemGrid } from '@/features/items/components'

const itemsStore = useItemsStore()

// Computed properties from store
const items = computed(() => {
  return Array.isArray(itemsStore.items) ? itemsStore.items : []
})
const loading = computed(() => itemsStore.loading)
const error = computed(() => itemsStore.error)
const hasNextPage = computed(() => itemsStore.hasNextPage)
const currentPage = computed(() => itemsStore.getCurrentPage)
const totalItems = computed(() => itemsStore.getTotalItems)
const totalPages = computed(() => itemsStore.getTotalPages)

// Methods
const fetchRecentItems = async () => {
  try {
    itemsStore.resetPagination()
    await itemsStore.fetchItems({ limit: 25, sort: 'recent' }, true)
  } catch (err) {
    console.error('Error fetching recent items:', err)
  }
}

const loadMoreItems = async () => {
  if (!hasNextPage.value || loading.value) return
  
  try {
    const nextPage = currentPage.value + 1
    await itemsStore.setPage(nextPage)
    await itemsStore.fetchItems({ limit: 25, sort: 'recent' }, false, true)
  } catch (err) {
    console.error('Error loading more items:', err)
  }
}

// Initialize on mount
onMounted(() => {
  fetchRecentItems()
})
</script>

<style scoped>
@import '@/assets/styles/common.css';

.recent-items-feed {
  @apply w-full;
}
</style>