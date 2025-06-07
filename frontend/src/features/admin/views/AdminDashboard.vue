<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <h1 class="text-3xl font-bold text-center mb-8">Admin Dashboard</h1>
    
    <div class="max-w-7xl mx-auto">
      <!-- Tabs for different admin sections -->
      <nav class="flex space-x-4 mb-6 border-b border-gray-200">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[activeTab === tab.id ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300', 'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm']"
        >
          {{ tab.name }}
        </button>
      </nav>
      
      <!-- User Management Section -->
      <div v-if="activeTab === 'users'" class="bg-white shadow rounded-lg p-4">
        <h2 class="text-xl font-semibold mb-4">User Management</h2>
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="user in users" :key="user.id">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                      <img class="h-10 w-10 rounded-full" :src="user.avatar || 'https://via.placeholder.com/40'" alt="">
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">{{ user.name }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ user.email }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="[user.role === 'admin' ? 'bg-indigo-100 text-indigo-800' : 'bg-green-100 text-green-800', 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full']">
                    {{ user.role }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="[user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800', 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full']">
                    {{ user.active ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button @click="editUser(user)" class="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                  <button @click="confirmDeleteUser(user)" class="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="mt-4 flex justify-between items-center">
          <div class="text-sm text-gray-500">
            Showing {{ users.length }} of {{ totalUsers }} users
          </div>
          <div class="flex space-x-2">
            <button 
              @click="prevPage" 
              :disabled="currentPage === 1"
              class="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button 
              @click="nextPage" 
              :disabled="currentPage === totalPages"
              class="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
      
      <!-- Item Moderation Section -->
      <div v-if="activeTab === 'items'" class="bg-white shadow rounded-lg p-4">
        <h2 class="text-xl font-semibold mb-4">Item Moderation</h2>
        
        <div class="mb-4 flex flex-wrap gap-2">
          <select v-model="filterStatus" class="px-3 py-2 border border-gray-300 rounded-md text-sm">
            <option value="all">All Statuses</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
          </select>
          
          <select v-model="filterCategory" class="px-3 py-2 border border-gray-300 rounded-md text-sm">
            <option value="all">All Categories</option>
            <option v-for="category in uniqueCategories" :value="category">{{ category }}</option>
          </select>
          
          <select v-model="filterAvailability" class="px-3 py-2 border border-gray-300 rounded-md text-sm">
            <option value="all">All Availability</option>
            <option value="available">Available</option>
            <option value="unavailable">Unavailable</option>
          </select>
          
          <button 
            @click="resetFilters"
            class="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Reset Filters
          </button>
        </div>
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="item in filteredItems" :key="item.id">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                      <img class="h-10 w-10 rounded-full" :src="item.image || 'https://via.placeholder.com/40'" alt="">
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">{{ item.title }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ item.owner.name }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ item.category }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="[item.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800', 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full']">
                    {{ item.approved ? 'Approved' : 'Pending' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button @click="handleToggleItemAvailability(item)" :class="[item.available ? 'bg-gray-100 text-gray-800' : 'bg-blue-100 text-blue-800', 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full mr-3']">
                  {{ item.available ? 'Available' : 'Unavailable' }}
                </button>
                <button @click="handleApproveItem(item)" class="text-green-600 hover:text-green-900 mr-3">Approve</button>
                <button @click="handleRejectItem(item)" class="text-red-600 hover:text-red-900">Reject</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Analytics Section -->
      <div v-if="activeTab === 'analytics'" class="bg-white shadow rounded-lg p-4">
        <h2 class="text-xl font-semibold mb-4">Analytics</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div class="bg-gray-50 p-4 rounded-lg">
            <h3 class="text-lg font-medium mb-2">User Growth</h3>
            <div class="h-64">
              <LineChart :data="analytics.userGrowth" />
            </div>
          </div>
          
          <div class="bg-gray-50 p-4 rounded-lg">
            <h3 class="text-lg font-medium mb-2">Item Categories</h3>
            <div class="h-64">
              <PieChart :data="analytics.categoryDistribution" />
            </div>
          </div>
        </div>
        
        <div class="grid grid-cols-1 gap-4">
          <div class="bg-gray-50 p-4 rounded-lg">
            <h3 class="text-lg font-medium mb-2">Recent Activity</h3>
            <div class="h-64">
              <BarChart :data="analytics.recentActivity" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAdminDashboard } from '../composables/useAdminDashboard'

// Usar el composable para toda la lógica del dashboard de administración
const {
  // Estado reactivo
  activeTab,
  filterStatus,
  filterCategory,
  filterAvailability,
  
  // Datos de admin composables
  analytics,
  users,
  loading,
  error,
  currentPage,
  itemsPerPage,
  totalUsers,
  totalPages,
  
  // Propiedades computadas
  items,
  uniqueCategories,
  filteredItems,
  
  // Configuración
  tabs,
  
  // Funciones de filtros
  resetFilters,
  
  // Funciones de gestión de usuarios
  editUser,
  confirmDeleteUser,
  prevPage,
  nextPage,
  
  // Funciones de gestión de ítems
  fetchItems,
  handleApproveItem,
  handleToggleItemAvailability,
  handleRejectItem,
  
  // Función de inicialización
  initializeDashboard
} = useAdminDashboard()
</script>

<style scoped>
@import '@/assets/styles/common.css';

/* Add any custom styles here */
</style>