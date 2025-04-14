import axios from 'axios'
import { useToast } from 'vue-toastification'

type Profile = {
  id: string
  name: string
  bio: string
  location: string
  avatarUrl: string | null
}

type Item = {
  id: string
  title: string
  description: string
  imageUrl: string
}

type Trade = {
  id: string
  itemId: string
  status: string
  createdAt: string
}

export const getProfile = async (userId: string): Promise<Profile> => {
  try {
    const response = await axios.get(`/api/users/${userId}`)
    return response.data
  } catch (error) {
    const toast = useToast()
    toast.error('Error al cargar el perfil')
    throw error
  }
}

export const updateProfile = async (userId: string, profileData: FormData): Promise<Profile> => {
  try {
    const response = await axios.put(`/api/users/${userId}`, profileData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  } catch (error) {
    const toast = useToast()
    toast.error('Error al actualizar el perfil')
    throw error
  }
}

export const getListedItems = async (userId: string): Promise<Item[]> => {
  try {
    const response = await axios.get(`/api/users/${userId}/items`)
    return response.data
  } catch (error) {
    const toast = useToast()
    toast.error('Error al cargar los artículos')
    throw error
  }
}

export const getTradeHistory = async (userId: string): Promise<Trade[]> => {
  try {
    const response = await axios.get(`/api/users/${userId}/trades`)
    return response.data
  } catch (error) {
    const toast = useToast()
    toast.error('Error al cargar el historial de intercambios')
    throw error
  }
}