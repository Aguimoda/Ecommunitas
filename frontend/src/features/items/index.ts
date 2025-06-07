/**
 * Items Feature Index
 * Centralizes exports for all items-related functionality
 * Enables clean imports: import { useItemsStore, itemService } from '@/features/items'
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