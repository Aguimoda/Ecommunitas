<!--
/**
 * @file ProfileView.vue
 * @description Vista de perfil de usuario en Ecommunitas
 * 
 * Este componente muestra la información completa del perfil de un usuario,
 * incluyendo sus datos personales, biografía, ubicación y todos los artículos
 * que ha publicado en la plataforma. Permite la edición del perfil y gestión
 * de artículos propios.
 * 
 * CARACTERÍSTICAS PRINCIPALES:
 * - 👤 Visualización completa del perfil de usuario
 * - ✏️ Edición de información personal
 * - 📝 Gestión de artículos publicados
 * - 🖼️ Manejo de avatar y fotos de perfil
 * - 📱 Diseño responsive y accesible
 * - 🔒 Validación de permisos de edición
 * - 📊 Estadísticas de usuario
 * 
 * FUNCIONALIDADES:
 * - Visualización de datos del usuario (nombre, email, bio, ubicación)
 * - Edición de perfil con modal dedicado
 * - Lista de artículos publicados por el usuario
 * - Edición y eliminación de artículos propios
 * - Carga y actualización de avatar
 * - Estadísticas de actividad del usuario
 * - Estados de carga y error bien definidos
 * 
 * SECCIONES DEL PERFIL:
 * - Información básica (avatar, nombre, email)
 * - Biografía personal
 * - Ubicación geográfica
 * - Fecha de registro
 * - Lista de artículos publicados
 * - Estadísticas de actividad
 * 
 * MODALES INTEGRADOS:
 * - ProfileEditor: Para editar información del perfil
 * - EditItemModal: Para editar artículos individuales
 * 
 * TECNOLOGÍAS:
 * - Vue 3 Composition API
 * - TypeScript para tipado estático
 * - Tailwind CSS para estilos
 * - Vue Router para navegación
 * - Composables para lógica reutilizable
 * 
 * @author Equipo de Desarrollo Ecommunitas
 * @version 1.0.0
 * @since 1.0.0
 */
-->
<template>
  <!-- Vista principal del perfil de usuario -->
  <div class="profile-view">
    <!-- Sección de información del usuario -->
    <div class="user-info-container">
      <div class="user-info">
        <h1 class="profile-title">Perfil de Usuario</h1>
        <div class="profile-content">
          <div class="avatar-container">
            <div class="avatar">
              <img :src="user.avatar || '/default-avatar.png'" alt="Avatar del usuario" />
            </div>
            <button @click="showProfileEditor = true" class="edit-btn">Editar Perfil</button>
          </div>
          <div class="details">
            <h2 class="user-name">{{ user.name }}</h2>
            <p class="user-email"><i class="fas fa-envelope"></i> {{ user.email }}</p>
            <div v-if="user.bio" class="bio-container">
              <h3 class="section-title">Sobre mí</h3>
              <p class="user-bio">{{ user.bio }}</p>
            </div>
            <p v-if="user.location" class="user-location"><i class="fas fa-map-marker-alt"></i> {{ user.location }}</p>
            <p class="user-joined"><i class="fas fa-calendar-alt"></i> Miembro desde: {{ user.joinedDate }}</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modales -->
    <ProfileEditor 
      v-if="showProfileEditor" 
      @close="showProfileEditor = false" 
      @save="handleProfileSave" 
    />
    <EditItemModal 
      v-if="showEditItemModal" 
      :item="editingItem" 
      @close="showEditItemModal = false" 
      @save="handleItemSave" 
    />

    <!-- Sección de artículos publicados -->
    <div class="user-items">
      <h2 class="section-title">Mis Artículos</h2>
      
      <!-- Estado de carga -->
      <div v-if="isLoading" class="loading-state">
        <p><i class="fas fa-spinner fa-spin"></i> Cargando artículos...</p>
      </div>
      
      <!-- Mensaje de error -->
      <div v-else-if="error" class="error-state">
        <p class="error-message"><i class="fas fa-exclamation-triangle"></i> {{ error }}</p>
        <button @click="fetchUserData" class="retry-btn">Reintentar</button>
      </div>
      
      <!-- Lista de artículos -->
      <div v-else-if="Array.isArray(items) && items.length > 0" class="items-grid">
        <div v-for="item in items" :key="item._id" class="item-card">
          <router-link :to="`/item/${item._id}`">
            <div class="item-image">
              <img 
                :src="(item.imageUrls && item.imageUrls.length > 0) ? item.imageUrls[0] : '/default-item.png'" 
                :alt="item.title" 
              />
            </div>
            <div class="item-details">
              <h3>{{ item.title }}</h3>
              <p class="item-price">{{ item.price }} €</p>
              <p class="item-location">
                <i class="fas fa-map-marker-alt"></i> 
                {{ item.location }}
              </p>
            </div>
          </router-link>
          <div class="item-actions">
            <button @click="openEditItemModal(item)" class="edit-btn">Editar</button>
            <button @click="deleteItem(item._id)" class="delete-btn">Eliminar</button>
          </div>
        </div>
      </div>
      
      <!-- Mensaje cuando no hay artículos -->
      <div v-else class="empty-state">
        <div class="empty-content">
          <i class="fas fa-box-open"></i>
          <h3>No tienes artículos publicados</h3>
          <p>¡Publica tu primer artículo para empezar a intercambiar!</p>
          <router-link to="/post-item" class="publish-btn">
            <i class="fas fa-plus"></i> Publicar Artículo
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ProfileEditor } from '@/features/users/components'
import { EditItemModal } from '@/features/items/components'
import { useProfile } from '../composables/useProfile'
import '@/assets/styles/profile-view.css'

// Usar el composable para toda la lógica del perfil
const {
  // Estado reactivo
  user,
  items,
  isLoading,
  error,
  showProfileEditor,
  showEditItemModal,
  editingItem,
  
  // Propiedades computadas
  hasItems,
  userInitials,
  
  // Métodos de acción
  fetchUserData,
  handleProfileSave,
  openEditItemModal,
  handleItemSave,
  deleteItem
} = useProfile()

</script>

<style scoped>
/* Los estilos están definidos en @/assets/styles/profile-view.css */
</style>