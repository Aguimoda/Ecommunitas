import { ref, computed, onMounted, type Ref, type ComputedRef } from 'vue'
import { useModeration, useAdminUsers, useAdminAnalytics } from '@/features/admin'
import { displayError } from '@/shared/utils/errorHandler'
import { useItemsStore } from '@/features/items'
import type { ModerationItem } from '@/features/admin/services/adminService'

// Types
interface Tab {
  id: string;
  name: string;
}

interface UseAdminDashboardReturn {
  // State
  activeTab: Ref<string>;
  filterStatus: Ref<string>;
  filterCategory: Ref<string>;
  filterAvailability: Ref<string>;
  tabs: Tab[];
  
  // Computed
  items: ComputedRef<ModerationItem[]>;
  uniqueCategories: ComputedRef<string[]>;
  filteredItems: ComputedRef<ModerationItem[]>;
  
  // Methods
  setActiveTab: (tab: string) => void;
  setFilterStatus: (status: string) => void;
  setFilterCategory: (category: string) => void;
  setFilterAvailability: (availability: string) => void;
  handleApproveItem: (itemId: string) => Promise<void>;
  handleRejectItem: (itemId: string) => Promise<void>;
  handleToggleAvailability: (itemId: string) => Promise<void>;
  refreshData: () => Promise<void>;
  
  // From admin composables
  analytics: any;
  fetchAnalytics: () => Promise<void>;
  users: any;
  isLoading: ComputedRef<boolean>;
  pagination: any;
  fetchUsers: () => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
}

export function useAdminDashboard(): UseAdminDashboardReturn {
  const itemsStore = useItemsStore()

  // Use admin composables
  const { approveItem, rejectItem, toggleAvailability } = useModeration()
  const { 
    users, 
    isLoading, 
    pagination, 
    fetchUsers: fetchUsersOriginal, 
    deleteUser: deleteUserOriginal 
  } = useAdminUsers()
  const { analytics, fetchAnalytics: fetchAnalyticsOriginal } = useAdminAnalytics()

  // Wrapper functions to match expected return types
  const fetchUsers = async (): Promise<void> => {
    await fetchUsersOriginal()
  }

  const deleteUser = async (userId: string): Promise<void> => {
    await deleteUserOriginal(userId)
  }

  const fetchAnalytics = async (): Promise<void> => {
    await fetchAnalyticsOriginal()
  }

  // Tabs for admin sections
  const tabs: Tab[] = [
    { id: 'users', name: 'User Management' },
    { id: 'items', name: 'Item Moderation' },
    { id: 'analytics', name: 'Analytics' }
  ]

  // Estado reactivo
  const activeTab = ref<string>('users')
  const filterStatus = ref<string>('all')
  const filterCategory = ref<string>('all')
  const filterAvailability = ref<string>('all')

  // Propiedades computadas
  const items = computed(() => {
    const storeItems = itemsStore.items
    return Array.isArray(storeItems) ? storeItems as ModerationItem[] : []
  })
  
  const uniqueCategories = computed<string[]>(() => {
    const categories = new Set<string>()
    if (Array.isArray(items.value)) {
      items.value.forEach(item => categories.add(item.category))
    }
    return Array.from(categories)
  })

  const filteredItems = computed<ModerationItem[]>(() => {
    if (!Array.isArray(items.value)) return []
    return items.value.filter(item => {
      const statusMatch = filterStatus.value === 'all' || 
        (filterStatus.value === 'approved' && item.moderationStatus === 'approved') || 
        (filterStatus.value === 'pending' && item.moderationStatus === 'pending')
      
      const categoryMatch = filterCategory.value === 'all' || 
        item.category === filterCategory.value
        
      const availabilityMatch = filterAvailability.value === 'all' || 
        (filterAvailability.value === 'available' && item.availability) || 
        (filterAvailability.value === 'unavailable' && !item.availability)
      
      return statusMatch && categoryMatch && availabilityMatch
    })
  })

  // Funciones de gestión de usuarios

  // Funciones de gestión de ítems
  const fetchItems = async (): Promise<void> => {
    try {
      await itemsStore.fetchItems()
    } catch (err) {
      console.error('Error fetching items:', err)
      displayError(err, { customMessage: 'Error al cargar los items' })
    }
  }

  const handleApproveItem = async (item: ModerationItem): Promise<void> => {
    try {
      await approveItem(item._id)
      await itemsStore.updateItem(item._id, { availability: true })
      // Item aprobado correctamente (sin notificación)
    } catch (err) {
      console.error('Error approving item:', err)
      displayError(err, { customMessage: 'Error al aprobar el item' })
    }
  }

  const handleToggleItemAvailability = async (item: ModerationItem): Promise<void> => {
    try {
      const newAvailability = !item.availability
      await toggleAvailability(item._id, newAvailability)
      await itemsStore.updateItem(item._id, { availability: newAvailability })
      // Item disponibilidad cambiada (sin notificación)
    } catch (err) {
      console.error('Error toggling item availability:', err)
      displayError(err, { customMessage: 'Error al cambiar la disponibilidad del item' })
    }
  }

  const handleRejectItem = async (item: ModerationItem): Promise<void> => {
    try {
      await rejectItem(item._id, 'Rechazado por administrador')
      await itemsStore.updateItem(item._id, { availability: false })
      // Item rechazado correctamente (sin notificación)
    } catch (err) {
      console.error('Error rejecting item:', err)
      displayError(err, { customMessage: 'Error al rechazar el item' })
    }
  }

  // Inicialización
  const initializeDashboard = (): void => {
    fetchUsers()
    fetchItems()
  }

  // Configurar hooks del ciclo de vida
  onMounted(() => {
    initializeDashboard()
  })

  return {
    // State
    activeTab,
    filterStatus,
    filterCategory,
    filterAvailability,
    tabs,
    
    // Computed
    items,
    uniqueCategories,
    filteredItems,
    
    // Methods
    setActiveTab: (tab: string): void => {
      activeTab.value = tab
    },
    setFilterStatus: (status: string): void => {
      filterStatus.value = status
    },
    setFilterCategory: (category: string): void => {
      filterCategory.value = category
    },
    setFilterAvailability: (availability: string): void => {
      filterAvailability.value = availability
    },
    handleApproveItem: (itemId: string): Promise<void> => {
      const item = items.value.find(i => i._id === itemId)
      return item ? handleApproveItem(item) : Promise.resolve()
    },
    handleRejectItem: (itemId: string): Promise<void> => {
      const item = items.value.find(i => i._id === itemId)
      return item ? handleRejectItem(item) : Promise.resolve()
    },
    handleToggleAvailability: (itemId: string): Promise<void> => {
      const item = items.value.find(i => i._id === itemId)
      return item ? handleToggleItemAvailability(item) : Promise.resolve()
    },
    refreshData: async (): Promise<void> => {
      await Promise.all([
        fetchUsers(),
        fetchItems(),
        fetchAnalytics()
      ])
    },
    
    // From admin composables
    analytics,
    fetchAnalytics,
    users,
    isLoading,
    pagination,
    fetchUsers,
    deleteUser
  }
}