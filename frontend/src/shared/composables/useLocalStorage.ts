/**
 * Shared Local Storage Composable
 * Provides reactive local storage functionality with type safety
 * Automatically syncs with localStorage and handles serialization
 */

import { ref, watch, Ref } from 'vue'
import { useNotifications } from './useNotifications'

export interface LocalStorageOptions {
  serializer?: {
    read: (value: string) => any
    write: (value: any) => string
  }
  syncAcrossTabs?: boolean
  showNotifications?: boolean
}

export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
  options: LocalStorageOptions = {}
): [Ref<T>, (value: T) => void, () => void] {
  const { notifyError } = useNotifications()
  
  // Default options
  const {
    serializer = {
      read: JSON.parse,
      write: JSON.stringify
    },
    syncAcrossTabs = true,
    showNotifications = false
  } = options

  // Read initial value from localStorage
  const read = (): T => {
    try {
      const item = localStorage.getItem(key)
      if (item === null) return defaultValue
      return serializer.read(item)
    } catch (error) {
      if (showNotifications) {
        notifyError(`Error reading from localStorage: ${key}`)
      }
      console.error(`Error reading localStorage key "${key}":`, error)
      return defaultValue
    }
  }

  // Write value to localStorage
  const write = (value: T): void => {
    try {
      if (value === null || value === undefined) {
        localStorage.removeItem(key)
      } else {
        localStorage.setItem(key, serializer.write(value))
      }
    } catch (error) {
      if (showNotifications) {
        notifyError(`Error writing to localStorage: ${key}`)
      }
      console.error(`Error writing localStorage key "${key}":`, error)
    }
  }

  // Remove value from localStorage
  const remove = (): void => {
    try {
      localStorage.removeItem(key)
      storedValue.value = defaultValue
    } catch (error) {
      if (showNotifications) {
        notifyError(`Error removing from localStorage: ${key}`)
      }
      console.error(`Error removing localStorage key "${key}":`, error)
    }
  }

  // Create reactive reference
  const storedValue = ref<T>(read())

  // Watch for changes and sync to localStorage
  watch(
    storedValue,
    (newValue) => {
      write(newValue)
    },
    { deep: true }
  )

  // Listen for storage events (changes from other tabs)
  if (syncAcrossTabs && typeof window !== 'undefined') {
    window.addEventListener('storage', (event) => {
      if (event.key === key && event.newValue !== null) {
        try {
          storedValue.value = serializer.read(event.newValue)
        } catch (error) {
          console.error(`Error syncing localStorage key "${key}" from storage event:`, error)
        }
      }
    })
  }

  // Update function
  const setValue = (value: T): void => {
    storedValue.value = value
  }

  return [storedValue as Ref<T>, setValue, remove]
}

/**
 * Composable for managing user preferences in localStorage
 */
export function useUserPreferences() {
  const [theme, setTheme] = useLocalStorage('user-theme', 'light')
  const [language, setLanguage] = useLocalStorage('user-language', 'es')
  const [notifications, setNotifications] = useLocalStorage('user-notifications', {
    email: true,
    push: true,
    sound: true
  })
  const [searchHistory, setSearchHistory] = useLocalStorage<string[]>('search-history', [])
  const [recentItems, setRecentItems] = useLocalStorage<string[]>('recent-items', [])

  // Helper functions
  const addToSearchHistory = (query: string): void => {
    const history = [...searchHistory.value]
    const index = history.indexOf(query)
    
    if (index > -1) {
      history.splice(index, 1)
    }
    
    history.unshift(query)
    
    // Keep only last 10 searches
    if (history.length > 10) {
      history.splice(10)
    }
    
    setSearchHistory(history)
  }

  const addToRecentItems = (itemId: string): void => {
    const recent = [...recentItems.value]
    const index = recent.indexOf(itemId)
    
    if (index > -1) {
      recent.splice(index, 1)
    }
    
    recent.unshift(itemId)
    
    // Keep only last 20 items
    if (recent.length > 20) {
      recent.splice(20)
    }
    
    setRecentItems(recent)
  }

  const clearSearchHistory = (): void => {
    setSearchHistory([])
  }

  const clearRecentItems = (): void => {
    setRecentItems([])
  }

  return {
    // Theme
    theme,
    setTheme,
    
    // Language
    language,
    setLanguage,
    
    // Notifications
    notifications,
    setNotifications,
    
    // Search History
    searchHistory,
    addToSearchHistory,
    clearSearchHistory,
    
    // Recent Items
    recentItems,
    addToRecentItems,
    clearRecentItems
  }
}

/**
 * Composable for managing form data persistence
 */
export function useFormPersistence<T extends Record<string, any>>(
  formKey: string,
  initialData: T
) {
  const [formData, setFormData] = useLocalStorage(`form-${formKey}`, initialData)
  
  const updateField = (field: keyof T, value: any): void => {
    setFormData({
      ...formData.value,
      [field]: value
    })
  }
  
  const resetForm = (): void => {
    setFormData(initialData)
  }
  
  const clearForm = (): void => {
    localStorage.removeItem(`form-${formKey}`)
    setFormData(initialData)
  }
  
  return {
    formData,
    updateField,
    resetForm,
    clearForm
  }
}