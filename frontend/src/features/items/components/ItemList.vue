<template>
  <ItemGrid
    :items="items"
    :loading="isLoading"
    :error="error"
    :show-load-more="false"
    :show-pagination-info="false"
    :show-description="true"
    :show-category="true"
    :loading-text="'Cargando artículos...'"
    :empty-text="'No hay artículos disponibles'"
    :empty-subtext="'Intenta ajustar los filtros o vuelve más tarde'"
    @retry="fetchItems"
  />
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useItemsStore } from '@/features/items'
import { ItemGrid } from '@/features/items/components'

const itemsStore = useItemsStore()

// Usar computed properties del store
const items = computed(() => itemsStore.items)
const isLoading = computed(() => itemsStore.loading)
const error = computed(() => itemsStore.error)

const fetchItems = async () => {
  await itemsStore.fetchItems()
}

onMounted(() => {
  fetchItems()
})
</script>