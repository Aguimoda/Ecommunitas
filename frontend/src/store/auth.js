import { defineStore } from 'pinia'
import axios from 'axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isAuthenticated: false
  }),

  getters: {
    getUser: (state) => state.user,
    getIsAuthenticated: (state) => state.isAuthenticated
  },

  actions: {
    setUser(user) {
      this.user = user
      this.isAuthenticated = !!user
      // Emitir evento de cambio de autenticación
      window.dispatchEvent(new CustomEvent('auth-state-changed', {
        detail: { isAuthenticated: this.isAuthenticated }
      }))
    },

    async login(credentials) {
      try {
        const response = await axios.post('/api/v1/auth/login', credentials)
        this.setUser(response.data.user)
        return response.data
      } catch (error) {
        throw error
      }
    },

    async logout() {
      try {
        await axios.post('/api/v1/auth/logout')
        this.setUser(null)
      } catch (error) {
        console.error('Error durante el logout:', error)
      }
    },

    async checkAuth() {
      try {
        const response = await axios.get('/api/v1/auth/check')
        this.setUser(response.data.user)
        return response.data
      } catch (error) {
        this.setUser(null)
        throw error
      }
    }
  }
})