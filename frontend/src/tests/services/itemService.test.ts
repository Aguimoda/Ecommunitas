/**
 * @file itemService.test.ts
 * @description Test suite for itemService
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import itemService from '@/features/items/services/itemService'
import type { Item, CreateItemData, UpdateItemData, ItemsResponse } from '@/features/items/services/itemService'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock data
const mockItem: Item = {
  _id: '1',
  title: 'Test Item',
  description: 'Test description',
  category: 'electronics',
  condition: 'good',
  location: 'Test Address',
  coordinates: { lat: 40.7128, lng: -74.0060 },
  images: ['image1.jpg', 'image2.jpg'],
  availability: true,
  userId: 'user1',
  user: {
    _id: 'user1',
    name: 'Test User',
    email: 'test@example.com'
  },
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
}

const mockCreateItemData: CreateItemData = {
  title: 'New Item',
  description: 'New description',
  category: 'books',
  condition: 'excellent',
  location: {
    address: 'New Address',
    coordinates: { lat: 41.8781, lng: -87.6298 }
  },
  images: ['new-image.jpg']
}

const mockUpdateItemData: UpdateItemData = {
  title: 'Updated Item',
  description: 'Updated description',
  condition: 'fair'
}

const mockItemsResponse: ItemsResponse = {
  items: [mockItem],
  total: 1,
  page: 1,
  limit: 10,
  totalPages: 1
}

describe('itemService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockClear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getItems', () => {
    it('should fetch items successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockItemsResponse
      })

      const result = await itemService.getItems()

      expect(mockFetch).toHaveBeenCalledWith('/api/items?page=1&limit=10')
      expect(result).toEqual(mockItemsResponse)
    })

    it('should fetch items with filters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockItemsResponse
      })

      const filters = {
        category: 'electronics',
        condition: 'good',
        search: 'test',
        location: 'New York'
      }

      await itemService.getItems({ page: 2, limit: 20, filters })

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/items?page=2&limit=20&category=electronics&condition=good&search=test&location=New York'
      )
    })

    it('should handle fetch error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      })

      await expect(itemService.getItems()).rejects.toThrow('Failed to fetch items: 500 Internal Server Error')
    })

    it('should handle network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(itemService.getItems()).rejects.toThrow('Network error')
    })
  })

  describe('getItemById', () => {
    it('should fetch item by id successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockItem
      })

      const result = await itemService.getItemById('1')

      expect(mockFetch).toHaveBeenCalledWith('/api/items/1')
      expect(result).toEqual(mockItem)
    })

    it('should handle item not found', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      })

      await expect(itemService.getItemById('999')).rejects.toThrow('Failed to fetch item: 404 Not Found')
    })
  })

  describe('createItem', () => {
    it('should create item successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockItem
      })

      const result = await itemService.createItem(mockCreateItemData)

      expect(mockFetch).toHaveBeenCalledWith('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(mockCreateItemData)
      })
      expect(result).toEqual(mockItem)
    })

    it('should handle validation errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({
          message: 'Validation failed',
          errors: ['Title is required', 'Category is required']
        })
      })

      await expect(itemService.createItem(mockCreateItemData)).rejects.toThrow('Failed to create item: 400 Bad Request')
    })

    it('should handle unauthorized access', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized'
      })

      await expect(itemService.createItem(mockCreateItemData)).rejects.toThrow('Failed to create item: 401 Unauthorized')
    })
  })

  describe('updateItem', () => {
    it('should update item successfully', async () => {
      const updatedItem = { ...mockItem, ...mockUpdateItemData }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => updatedItem
      })

      const result = await itemService.updateItem('1', mockUpdateItemData)

      expect(mockFetch).toHaveBeenCalledWith('/api/items/1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(mockUpdateItemData)
      })
      expect(result).toEqual(updatedItem)
    })

    it('should handle item not found during update', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      })

      await expect(itemService.updateItem('999', mockUpdateItemData)).rejects.toThrow('Failed to update item: 404 Not Found')
    })

    it('should handle forbidden update', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden'
      })

      await expect(itemService.updateItem('1', mockUpdateItemData)).rejects.toThrow('Failed to update item: 403 Forbidden')
    })
  })

  describe('deleteItem', () => {
    it('should delete item successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Item deleted successfully' })
      })

      await itemService.deleteItem('1')

      expect(mockFetch).toHaveBeenCalledWith('/api/items/1', {
        method: 'DELETE'
      })
    })

    it('should handle item not found during deletion', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      })

      await expect(itemService.deleteItem('999')).rejects.toThrow('Failed to delete item: 404 Not Found')
    })

    it('should handle forbidden deletion', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden'
      })

      await expect(itemService.deleteItem('1')).rejects.toThrow('Failed to delete item: 403 Forbidden')
    })
  })

  describe('getUserItems', () => {
    it('should fetch user items successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockItemsResponse
      })

      const result = await itemService.getItemsByUser('user1')

      expect(mockFetch).toHaveBeenCalledWith('/api/users/user1/items?page=1&limit=10')
      expect(result).toEqual(mockItemsResponse)
    })

    it('should fetch user items with pagination', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockItemsResponse
      })

      await itemService.getItemsByUser('user1', { page: 2, limit: 5 })

      expect(mockFetch).toHaveBeenCalledWith('/api/users/user1/items?page=2&limit=5')
    })
  })

  describe('searchItems', () => {
    it('should search items successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockItemsResponse
      })

      const result = await itemService.searchItems('laptop')

      expect(mockFetch).toHaveBeenCalledWith('/api/items/search?q=laptop&page=1&limit=10')
      expect(result).toEqual(mockItemsResponse)
    })

    it('should search items with filters and pagination', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockItemsResponse
      })

      const filters = {
        category: 'electronics',
        condition: 'excellent'
      }

      await itemService.searchItems('laptop', { page: 2, limit: 20, filters })

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/items/search?q=laptop&page=2&limit=20&category=electronics&condition=excellent'
      )
    })

    it('should handle empty search query', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...mockItemsResponse, items: [] })
      })

      const result = await itemService.searchItems('')

      expect(result.items).toEqual([])
    })
  })

  describe('getItemsByCategory', () => {
    it('should fetch items by category successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockItemsResponse
      })

      const result = await itemService.getItemsByCategory('electronics')

      expect(mockFetch).toHaveBeenCalledWith('/api/items/category/electronics?page=1&limit=10')
      expect(result).toEqual(mockItemsResponse)
    })

    it('should handle invalid category', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request'
      })

      await expect(itemService.getItemsByCategory('invalid-category')).rejects.toThrow(
        'Failed to fetch items by category: 400 Bad Request'
      )
    })
  })

  describe('uploadItemImages', () => {
    it('should upload images successfully', async () => {
      const mockFiles = [new File([''], 'image1.jpg'), new File([''], 'image2.jpg')]
      const mockResponse = {
        urls: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg']
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const result = await itemService.uploadItemImages(mockFiles)

      expect(mockFetch).toHaveBeenCalledWith('/api/items/upload-images', {
        method: 'POST',
        body: expect.any(FormData)
      })
      expect(result).toEqual(mockResponse)
    })

    it('should handle upload failure', async () => {
      const mockFiles = [new File([''], 'image1.jpg')]
      
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 413,
        statusText: 'Payload Too Large'
      })

      await expect(itemService.uploadItemImages(mockFiles)).rejects.toThrow(
        'Failed to upload images: 413 Payload Too Large'
      )
    })

    it('should handle empty file array', async () => {
      await expect(itemService.uploadItemImages([])).rejects.toThrow('No files provided for upload')
    })
  })
})