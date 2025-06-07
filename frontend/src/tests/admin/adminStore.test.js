import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAdminStore } from '@/features/admin/stores/adminStore'
import adminService from '@/features/admin/services/adminService'

// Mock the admin service
vi.mock('@/features/admin/services/adminService', () => ({
  default: {
    getAnalytics: vi.fn(),
    getSystemLogs: vi.fn(),
    getUserManagement: vi.fn(),
    updateUserRole: vi.fn(),
    deleteUser: vi.fn(),
    approveItem: vi.fn(),
    rejectItem: vi.fn(),
    toggleItemAvailability: vi.fn(),
    getReports: vi.fn(),
    exportData: vi.fn()
  }
}))

describe('Admin Store', () => {
  let adminStore

  beforeEach(() => {
    setActivePinia(createPinia())
    adminStore = useAdminStore()
    vi.clearAllMocks()
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      expect(adminStore.analytics).toEqual({
        userGrowth: [],
        categoryDistribution: [],
        recentActivity: [],
        totalUsers: 0,
        totalItems: 0,
        activeUsers: 0
      })
      expect(adminStore.systemLogs).toEqual([])
      expect(adminStore.reports).toEqual([])
      expect(adminStore.isLoading).toBe(false)
      expect(adminStore.error).toBeNull()
    })
  })

  describe('Getters', () => {
    it('should return analytics summary', () => {
      adminStore.analytics = {
        userGrowth: [1, 2, 3],
        categoryDistribution: [{ name: 'Electronics', value: 10 }],
        recentActivity: [{ action: 'login', count: 5 }],
        totalUsers: 100,
        totalItems: 50,
        activeUsers: 80
      }

      const summary = adminStore.analyticsSummary
      
      expect(summary.totalUsers).toBe(100)
      expect(summary.totalItems).toBe(50)
      expect(summary.activeUsers).toBe(80)
      expect(summary.userGrowthTrend).toEqual([1, 2, 3])
    })

    it('should return recent logs', () => {
      adminStore.systemLogs = [
        { id: 1, timestamp: '2024-01-01', level: 'info' },
        { id: 2, timestamp: '2024-01-02', level: 'error' },
        { id: 3, timestamp: '2024-01-03', level: 'warning' }
      ]

      const recentLogs = adminStore.recentLogs
      
      expect(recentLogs).toHaveLength(3)
      expect(recentLogs[0].timestamp).toBe('2024-01-03') // Most recent first
    })

    it('should filter logs by level', () => {
      adminStore.systemLogs = [
        { id: 1, level: 'info', message: 'Info log' },
        { id: 2, level: 'error', message: 'Error log' },
        { id: 3, level: 'warning', message: 'Warning log' },
        { id: 4, level: 'error', message: 'Another error' }
      ]

      expect(adminStore.errorLogs).toHaveLength(2)
      expect(adminStore.warningLogs).toHaveLength(1)
      expect(adminStore.infoLogs).toHaveLength(1)
    })
  })

  describe('Actions', () => {
    describe('fetchAnalytics', () => {
      it('should fetch analytics successfully', async () => {
        const mockAnalytics = {
          userGrowth: [1, 2, 3, 4, 5],
          categoryDistribution: [
            { name: 'Electronics', value: 25 },
            { name: 'Books', value: 15 }
          ],
          recentActivity: [
            { action: 'login', count: 10 },
            { action: 'item_created', count: 5 }
          ],
          totalUsers: 150,
          totalItems: 75,
          activeUsers: 120
        }
        
        adminService.getAnalytics.mockResolvedValue({ data: mockAnalytics })
        
        await adminStore.fetchAnalytics()
        
        expect(adminStore.analytics).toEqual(mockAnalytics)
        expect(adminStore.isLoading).toBe(false)
        expect(adminStore.error).toBeNull()
      })

      it('should handle fetch analytics error', async () => {
        const mockError = new Error('Failed to fetch analytics')
        adminService.getAnalytics.mockRejectedValue(mockError)
        
        await adminStore.fetchAnalytics()
        
        expect(adminStore.isLoading).toBe(false)
        expect(adminStore.error).toBe('Failed to fetch analytics')
      })
    })

    describe('fetchSystemLogs', () => {
      it('should fetch system logs successfully', async () => {
        const mockLogs = [
          { id: 1, level: 'info', message: 'System started', timestamp: '2024-01-01' },
          { id: 2, level: 'error', message: 'Database error', timestamp: '2024-01-02' }
        ]
        
        adminService.getSystemLogs.mockResolvedValue({ data: mockLogs })
        
        await adminStore.fetchSystemLogs()
        
        expect(adminStore.systemLogs).toEqual(mockLogs)
        expect(adminStore.isLoading).toBe(false)
        expect(adminStore.error).toBeNull()
      })

      it('should fetch logs with filters', async () => {
        const filters = { level: 'error', startDate: '2024-01-01', endDate: '2024-01-31' }
        
        adminService.getSystemLogs.mockResolvedValue({ data: [] })
        
        await adminStore.fetchSystemLogs(filters)
        
        expect(adminService.getSystemLogs).toHaveBeenCalledWith(filters)
      })
    })

    describe('User Management', () => {
      it('should update user role successfully', async () => {
        const userId = 1
        const newRole = 'moderator'
        const mockUpdatedUser = { id: 1, role: 'moderator', name: 'Test User' }
        
        adminService.updateUserRole.mockResolvedValue({ data: mockUpdatedUser })
        
        const result = await adminStore.updateUserRole(userId, newRole)
        
        expect(result).toEqual(mockUpdatedUser)
        expect(adminService.updateUserRole).toHaveBeenCalledWith(userId, newRole)
      })

      it('should delete user successfully', async () => {
        const userId = 1
        
        adminService.deleteUser.mockResolvedValue({ data: { success: true } })
        
        const result = await adminStore.deleteUser(userId)
        
        expect(result).toEqual({ success: true })
        expect(adminService.deleteUser).toHaveBeenCalledWith(userId)
      })
    })

    describe('Item Moderation', () => {
      it('should approve item successfully', async () => {
        const itemId = 1
        const mockApprovedItem = { id: 1, status: 'approved', title: 'Test Item' }
        
        adminService.approveItem.mockResolvedValue({ data: mockApprovedItem })
        
        const result = await adminStore.approveItem(itemId)
        
        expect(result).toEqual(mockApprovedItem)
        expect(adminService.approveItem).toHaveBeenCalledWith(itemId)
      })

      it('should reject item successfully', async () => {
        const itemId = 1
        const reason = 'Inappropriate content'
        const mockRejectedItem = { id: 1, status: 'rejected', title: 'Test Item' }
        
        adminService.rejectItem.mockResolvedValue({ data: mockRejectedItem })
        
        const result = await adminStore.rejectItem(itemId, reason)
        
        expect(result).toEqual(mockRejectedItem)
        expect(adminService.rejectItem).toHaveBeenCalledWith(itemId, reason)
      })

      it('should toggle item availability successfully', async () => {
        const itemId = 1
        const available = false
        const mockUpdatedItem = { id: 1, available: false, title: 'Test Item' }
        
        adminService.toggleItemAvailability.mockResolvedValue({ data: mockUpdatedItem })
        
        const result = await adminStore.toggleItemAvailability(itemId, available)
        
        expect(result).toEqual(mockUpdatedItem)
        expect(adminService.toggleItemAvailability).toHaveBeenCalledWith(itemId, available)
      })
    })

    describe('Reports and Export', () => {
      it('should fetch reports successfully', async () => {
        const mockReports = [
          { id: 1, type: 'user_activity', data: {} },
          { id: 2, type: 'item_statistics', data: {} }
        ]
        
        adminService.getReports.mockResolvedValue({ data: mockReports })
        
        await adminStore.fetchReports()
        
        expect(adminStore.reports).toEqual(mockReports)
      })

      it('should export data successfully', async () => {
        const exportType = 'users'
        const format = 'csv'
        const mockExportData = { downloadUrl: 'https://example.com/export.csv' }
        
        adminService.exportData.mockResolvedValue({ data: mockExportData })
        
        const result = await adminStore.exportData(exportType, format)
        
        expect(result).toEqual(mockExportData)
        expect(adminService.exportData).toHaveBeenCalledWith(exportType, format)
      })
    })

    describe('Cache Management', () => {
      it('should clear analytics cache', () => {
        adminStore.analytics = {
          userGrowth: [1, 2, 3],
          categoryDistribution: [],
          recentActivity: [],
          totalUsers: 100,
          totalItems: 50,
          activeUsers: 80
        }
        
        adminStore.clearAnalyticsCache()
        
        expect(adminStore.analytics.userGrowth).toEqual([])
        expect(adminStore.analytics.totalUsers).toBe(0)
      })

      it('should refresh all data', async () => {
        const fetchAnalyticsSpy = vi.spyOn(adminStore, 'fetchAnalytics')
        const fetchSystemLogsSpy = vi.spyOn(adminStore, 'fetchSystemLogs')
        const fetchReportsSpy = vi.spyOn(adminStore, 'fetchReports')
        
        await adminStore.refreshAllData()
        
        expect(fetchAnalyticsSpy).toHaveBeenCalled()
        expect(fetchSystemLogsSpy).toHaveBeenCalled()
        expect(fetchReportsSpy).toHaveBeenCalled()
      })
    })
  })
})