/**
 * @file usePagination.test.ts
 * @description Test suite for usePagination composable
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { nextTick, ref } from 'vue'
import { usePagination } from '@/shared/composables/usePagination'

describe('usePagination', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic pagination functionality', () => {
    it('should initialize with default values', () => {
      const testData = ref([])
      const { currentPage, pageSize, total, totalPages } = usePagination(testData)
      
      expect(currentPage.value).toBe(1)
      expect(pageSize.value).toBe(10)
      expect(total.value).toBe(0)
      expect(totalPages.value).toBe(1)
    })

    it('should initialize with custom options', () => {
      const testData = ref(Array.from({ length: 100 }, (_, i) => ({ id: i + 1 })))
      const options = {
        initialPage: 2,
        initialPageSize: 20
      }
      
      const { currentPage, pageSize, total, totalPages } = usePagination(testData, options)
      
      expect(currentPage.value).toBe(2)
      expect(pageSize.value).toBe(20)
      expect(total.value).toBe(100)
      expect(totalPages.value).toBe(5)
    })

    it('should calculate total pages correctly', () => {
      const testData = ref(Array.from({ length: 25 }, (_, i) => ({ id: i + 1 })))
      const { setPageSize, totalPages } = usePagination(testData)
      
      setPageSize(10)
      
      expect(totalPages.value).toBe(3)
    })

    it('should handle zero total items', () => {
      const testData = ref([])
      const { totalPages } = usePagination(testData)
      
      expect(totalPages.value).toBe(1)
    })
  })

  describe('Navigation functionality', () => {
    it('should go to next page', () => {
      const testData = ref(Array.from({ length: 50 }, (_, i) => ({ id: i + 1 })))
      const { currentPage, nextPage } = usePagination(testData)
      
      nextPage()
      
      expect(currentPage.value).toBe(2)
    })

    it('should not go to next page if on last page', () => {
      const testData = ref(Array.from({ length: 50 }, (_, i) => ({ id: i + 1 })))
      const { currentPage, nextPage, goToPage } = usePagination(testData, {
        initialPage: 5
      })
      
      goToPage(5) // Go to last page
      nextPage()
      
      expect(currentPage.value).toBe(5)
    })

    it('should go to previous page', () => {
      const testData = ref(Array.from({ length: 50 }, (_, i) => ({ id: i + 1 })))
      const { currentPage, previousPage, goToPage } = usePagination(testData, {
        initialPage: 3
      })
      
      goToPage(3) // Ensure we're on page 3
      previousPage()
      
      expect(currentPage.value).toBe(2)
    })

    it('should not go below first page', () => {
      const testData = ref(Array.from({ length: 10 }, (_, i) => ({ id: i + 1 })))
      const { currentPage, previousPage } = usePagination(testData)
      
      previousPage()
      
      expect(currentPage.value).toBe(1)
    })

    it('should go to specific page', () => {
      const testData = ref(Array.from({ length: 50 }, (_, i) => ({ id: i + 1 })))
      const { currentPage, goToPage } = usePagination(testData)
      
      goToPage(3)
      
      expect(currentPage.value).toBe(3)
    })

    it('should not go to invalid page numbers', () => {
      const testData = ref(Array.from({ length: 50 }, (_, i) => ({ id: i + 1 })))
      const { currentPage, goToPage } = usePagination(testData)
      
      goToPage(0)
      expect(currentPage.value).toBe(1)
      
      goToPage(10)
      expect(currentPage.value).toBe(1)
      
      goToPage(-1)
      expect(currentPage.value).toBe(1)
    })

    it('should go to first page', () => {
      const testData = ref(Array.from({ length: 50 }, (_, i) => ({ id: i + 1 })))
      const { currentPage, firstPage, goToPage } = usePagination(testData, {
        initialPage: 3
      })
      
      goToPage(3) // Go to page 3 first
      firstPage()
      
      expect(currentPage.value).toBe(1)
    })

    it('should go to last page', () => {
      const testData = ref(Array.from({ length: 50 }, (_, i) => ({ id: i + 1 })))
      const { currentPage, lastPage } = usePagination(testData)
      
      lastPage()
      
      expect(currentPage.value).toBe(5)
    })
  })

  describe('Computed properties', () => {
    it('should calculate hasNextPage correctly', () => {
      const testData = ref(Array.from({ length: 50 }, (_, i) => ({ id: i + 1 })))
      const { hasNextPage, goToPage } = usePagination(testData)
      
      goToPage(3)
      expect(hasNextPage.value).toBe(true)
      
      goToPage(5)
      expect(hasNextPage.value).toBe(false)
    })

    it('should calculate hasPreviousPage correctly', () => {
      const testData = ref(Array.from({ length: 50 }, (_, i) => ({ id: i + 1 })))
      const { hasPreviousPage, goToPage } = usePagination(testData)
      
      expect(hasPreviousPage.value).toBe(false)
      
      goToPage(2)
      expect(hasPreviousPage.value).toBe(true)
    })

    it('should calculate start index correctly', () => {
      const testData = ref(Array.from({ length: 50 }, (_, i) => ({ id: i + 1 })))
      const { startIndex, goToPage, setPageSize } = usePagination(testData)
      
      setPageSize(10)
      goToPage(3)
      
      expect(startIndex.value).toBe(20)
    })

    it('should calculate page size correctly', () => {
      const testData = ref(Array.from({ length: 50 }, (_, i) => ({ id: i + 1 })))
      const { pageSize, setPageSize } = usePagination(testData)
      
      setPageSize(15)
      
      expect(pageSize.value).toBe(15)
    })

    it('should generate page numbers array', () => {
      const testData = ref(Array.from({ length: 50 }, (_, i) => ({ id: i + 1 })))
      const { getPageNumbers } = usePagination(testData)
      
      expect(getPageNumbers()).toEqual([1, 2, 3, 4, 5])
    })

    it('should show current page info', () => {
      const testData = ref(Array.from({ length: 25 }, (_, i) => ({ id: i + 1 })))
      const { startIndex, endIndex, total, setPageSize, goToPage } = usePagination(testData)
      
      setPageSize(10)
      goToPage(2)
      
      expect(startIndex.value).toBe(11)
      expect(endIndex.value).toBe(20)
      expect(total.value).toBe(25)
    })

    it('should handle last page info correctly', () => {
      const testData = ref(Array.from({ length: 25 }, (_, i) => ({ id: i + 1 })))
      const { startIndex, endIndex, total, setPageSize, goToPage } = usePagination(testData)
      
      setPageSize(10)
      goToPage(3) // Last page with 5 items
      
      expect(startIndex.value).toBe(21)
      expect(endIndex.value).toBe(25)
      expect(total.value).toBe(25)
    })
  })

  describe('Page size changes', () => {
    it('should reset to first page when page size changes', () => {
      const testData = ref(Array.from({ length: 100 }, (_, i) => ({ id: i + 1 })))
      const { currentPage, goToPage, setPageSize } = usePagination(testData)
      
      goToPage(5)
      setPageSize(20)
      
      expect(currentPage.value).toBe(1)
    })

    it('should recalculate total pages when page size changes', () => {
      const testData = ref(Array.from({ length: 100 }, (_, i) => ({ id: i + 1 })))
      const { totalPages, setPageSize } = usePagination(testData)
      
      setPageSize(25)
      
      expect(totalPages.value).toBe(4)
    })
  })

  describe('Edge cases', () => {
    it('should handle empty dataset', () => {
      const testData = ref([])
      const { currentPage, totalPages, hasNextPage, hasPreviousPage } = usePagination(testData)
      
      expect(currentPage.value).toBe(1)
      expect(totalPages.value).toBe(1)
      expect(hasNextPage.value).toBe(false)
      expect(hasPreviousPage.value).toBe(false)
    })

    it('should handle single item', () => {
      const testData = ref([{ id: 1 }])
      const { totalPages } = usePagination(testData)
      
      expect(totalPages.value).toBe(1)
    })

    it('should handle exact page size match', () => {
      const testData = ref(Array.from({ length: 20 }, (_, i) => ({ id: i + 1 })))
      const { totalPages, setPageSize } = usePagination(testData)
      
      setPageSize(10)
      
      expect(totalPages.value).toBe(2)
    })
  })

  describe('Reactive updates', () => {
    it('should update computed values when total items change', async () => {
      const testData = ref<{ id: number }[]>([])
      const { totalPages } = usePagination(testData)
      
      testData.value = Array.from({ length: 30 }, (_, i) => ({ id: i + 1 }))
      await nextTick()
      
      expect(totalPages.value).toBe(3)
      
      testData.value = Array.from({ length: 45 }, (_, i) => ({ id: i + 1 }))
      await nextTick()
      
      expect(totalPages.value).toBe(5)
    })

    it('should maintain current page when possible after total change', () => {
      const testData = ref(Array.from({ length: 50 }, (_, i) => ({ id: i + 1 })))
      const { currentPage, goToPage } = usePagination(testData)
      
      goToPage(3)
      
      testData.value = Array.from({ length: 60 }, (_, i) => ({ id: i + 1 })) // Still has page 3
      expect(currentPage.value).toBe(3)
      
      testData.value = Array.from({ length: 20 }, (_, i) => ({ id: i + 1 })) // Only 2 pages now
      expect(currentPage.value).toBe(2)
    })
  })
})