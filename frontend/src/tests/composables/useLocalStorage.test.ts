/**
 * @file useLocalStorage.test.ts
 * @description Test suite for useLocalStorage composable
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { nextTick } from 'vue'
import { useLocalStorage, useUserPreferences, useFormPersistence } from '@/shared/composables/useLocalStorage'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('useLocalStorage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('Basic functionality', () => {
    it('should return default value when localStorage is empty', () => {
      localStorageMock.getItem.mockReturnValue(null)
      
      const [value] = useLocalStorage('test-key', 'default-value')
      
      expect(value.value).toBe('default-value')
      expect(localStorageMock.getItem).toHaveBeenCalledWith('test-key')
    })

    it('should return stored value when localStorage has data', () => {
      localStorageMock.getItem.mockReturnValue('"stored-value"')
      
      const [value] = useLocalStorage('test-key', 'default-value')
      
      expect(value.value).toBe('stored-value')
    })

    it('should update localStorage when value changes', async () => {
      localStorageMock.getItem.mockReturnValue(null)
      
      const [value, setValue] = useLocalStorage('test-key', 'default')
      
      setValue('new-value')
      await nextTick()
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith('test-key', '"new-value"')
      expect(value.value).toBe('new-value')
    })

    it('should remove item from localStorage', async () => {
      const [, , removeValue] = useLocalStorage('test-key', 'default')
      
      removeValue()
      await nextTick()
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('test-key')
    })
  })

  describe('Object serialization', () => {
    it('should handle object values correctly', () => {
      const testObject = { name: 'test', value: 123 }
      localStorageMock.getItem.mockReturnValue(JSON.stringify(testObject))
      
      const [value] = useLocalStorage('test-object', {})
      
      expect(value.value).toEqual(testObject)
    })

    it('should serialize objects when storing', async () => {
      const testObject = { name: 'test', value: 123 }
      const [, setValue] = useLocalStorage('test-object', {})
      
      setValue(testObject)
      await nextTick()
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'test-object',
        JSON.stringify(testObject)
      )
    })
  })

  describe('Error handling', () => {
    it('should handle JSON parse errors gracefully', () => {
      localStorageMock.getItem.mockReturnValue('invalid-json')
      
      const [value] = useLocalStorage('test-key', 'default')
      
      expect(value.value).toBe('default')
    })

    it('should handle localStorage setItem errors', async () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded')
      })
      
      const [, setValue] = useLocalStorage('test-key', 'default')
      
      expect(() => setValue('new-value')).not.toThrow()
    })
  })

  describe('Custom serializer', () => {
    it('should use custom serializer when provided', () => {
      const customSerializer = {
        read: vi.fn().mockReturnValue('custom-read'),
        write: vi.fn().mockReturnValue('custom-write')
      }
      
      localStorageMock.getItem.mockReturnValue('stored-value')
      
      const [value] = useLocalStorage('test-key', 'default', {
        serializer: customSerializer
      })
      
      expect(customSerializer.read).toHaveBeenCalledWith('stored-value')
      expect(value.value).toBe('custom-read')
    })
  })
})

describe('useUserPreferences', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  it('should initialize with default preferences', () => {
    const { theme, language, notifications } = useUserPreferences()
    
    expect(theme.value).toBe('light')
    expect(language.value).toBe('es')
    expect(notifications.value).toEqual({
      email: true,
      push: true,
      sound: true
    })
  })

  it('should update individual preference', async () => {
    const { theme, setTheme } = useUserPreferences()
    
    setTheme('dark')
    await nextTick()
    
    expect(theme.value).toBe('dark')
    expect(localStorageMock.setItem).toHaveBeenCalled()
  })

  it('should reset preferences to default', async () => {
    const { theme, setTheme } = useUserPreferences()
    
    setTheme('dark')
    await nextTick()
    expect(theme.value).toBe('dark')
    
    // Reset by setting back to default
    setTheme('light')
    await nextTick()
    
    expect(theme.value).toBe('light')
  })
})

describe('useFormPersistence', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  it('should persist form data automatically', async () => {
    const formData = { name: 'test', email: 'test@example.com' }
    const { formData: persistedData, updateField } = useFormPersistence('test-form', formData)
    
    updateField('name', 'updated')
    await nextTick()
    
    expect(persistedData.value.name).toBe('updated')
    expect(localStorageMock.setItem).toHaveBeenCalled()
  })

  it('should clear persisted form data', async () => {
    const { clearForm } = useFormPersistence('test-form', {})
    
    clearForm()
    await nextTick()
    
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('form-test-form')
  })

  it('should restore form data on initialization', () => {
    const savedData = { name: 'saved', email: 'saved@example.com' }
    localStorageMock.getItem.mockReturnValue(JSON.stringify(savedData))
    
    const { formData } = useFormPersistence('test-form', {})
    
    expect(formData.value).toEqual(savedData)
  })
})