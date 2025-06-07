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
  console.log('RecentItemsFeed - items computed - store items:', itemsStore.items)
  console.log('RecentItemsFeed - items computed - store items length:', itemsStore.items?.length)
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
    console.log('RecentItemsFeed - fetchRecentItems called')
    itemsStore.resetPagination()
    await itemsStore.fetchItems({ limit: 25, sort: 'recent' }, true)
    console.log('RecentItemsFeed - fetchRecentItems completed')
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