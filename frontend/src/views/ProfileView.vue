<template>
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
    
    <!-- Modal del editor de perfil -->
    <ProfileEditor v-if="showProfileEditor" @close="showProfileEditor = false" @save="handleProfileSave" />
    <EditItemModal v-if="showEditItemModal" :item="editingItem" @close="showEditItemModal = false" @save="handleItemSave" />

    <!-- Sección de artículos publicados -->
    <div class="user-items">
      <h2 class="section-title">Mis Artículos</h2>
      <div class="items-grid">
        <div v-for="item in items" :key="item._id" class="item-card">
          <router-link :to="`/items/${item._id}`">
            <div class="item-image">
              <img :src="(item.imageUrls && item.imageUrls.length > 0) ? item.imageUrls[0] : '/default-item.png'" :alt="item.title" />
            </div>
            <div class="item-details">
              <h3>{{ item.title }}</h3>
              <p class="item-price">{{ item.price }} €</p>
              <p class="item-location"><i class="fas fa-map-marker-alt"></i> {{ item.location }}</p>
            </div>
          </router-link>
          <div class="item-actions">
            <button @click="openEditItemModal(item)" class="edit-btn">Editar</button>
            <button @click="deleteItem(item._id)" class="delete-btn">Eliminar</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import ProfileEditor from '../components/ProfileEditor.vue'
import EditItemModal from '../components/EditItemModal.vue' // Importar el nuevo modal

const router = useRouter()
const showEditItemModal = ref(false)
const editingItem = ref(null)
const showProfileEditor = ref(false)
const user = ref({
  name: '',
  email: '',
  avatar: 'https://via.placeholder.com/150', // Default placeholder
  bio: '',
  location: '',
  joinedDate: '',
  _id: null
});

const items = ref([])
const isLoading = ref(false)
const error = ref('')

// Obtener datos del usuario y sus artículos
const fetchUserData = async () => {
  console.log('[DEBUG] Iniciando fetchUserData');
  isLoading.value = true;
  error.value = '';
  try {
    const token = localStorage.getItem('token');
    console.log('[DEBUG] Token recuperado:', token);
    if (!token) {
      error.value = 'Usuario no autenticado. Redirigiendo al login...';
      console.warn('[DEBUG] Usuario no autenticado, redirigiendo...');
      router.push('/login');
      isLoading.value = false;
      return;
    }

    // 1. Obtener datos del perfil del usuario
    const userProfileResponse = await axios.get('/api/v1/users/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('[DEBUG] Respuesta perfil usuario:', userProfileResponse.data);

    if (userProfileResponse.data && userProfileResponse.data.success) {
      const backendUser = userProfileResponse.data.data;
      user.value = {
        name: backendUser.name || user.value.name,
        email: backendUser.email || user.value.email,
        avatar: backendUser.avatar || user.value.avatar || 'https://via.placeholder.com/150',
        bio: backendUser.bio || user.value.bio,
        location: backendUser.location || user.value.location,
        joinedDate: backendUser.joinedDate || backendUser.createdAt || user.value.joinedDate,
        _id: backendUser._id
      };
      console.log('[DEBUG] Usuario cargado:', user.value);
      // 2. Obtener artículos del usuario (solo si el perfil se cargó y tenemos _id)
      if (user.value && user.value._id) {
        const itemsResponse = await axios.get(`/api/v1/items/user/${user.value._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('[DEBUG] Respuesta artículos usuario:', itemsResponse.data);
        if (itemsResponse.data) {
            if (typeof itemsResponse.data.success === 'boolean' && !itemsResponse.data.success) {
                console.warn('[DEBUG] La API de artículos indicó un fallo:', itemsResponse.data.message || 'Error no especificado');
                items.value = [];
            } else {
                items.value = itemsResponse.data.data || [];
                console.log('[DEBUG] Artículos cargados:', items.value);
            }
        } else {
          console.warn('[DEBUG] No se recibieron datos de la API de artículos.');
          items.value = [];
        }
      } else {
        error.value = 'No se pudo obtener el ID del usuario para cargar sus artículos.';
        console.error('[DEBUG] Error: User ID (_id) no disponible después de cargar el perfil.');
        items.value = [];
      }
    } else {
      error.value = `Error al cargar los datos del perfil: ${userProfileResponse.data.message || 'Respuesta no exitosa o formato inesperado.'}`;
      console.error('[DEBUG] Error fetching user profile data:', userProfileResponse);
      if (userProfileResponse.status === 401 || (userProfileResponse.data && userProfileResponse.data.error && (userProfileResponse.data.error.includes('Please log in') || userProfileResponse.data.error.includes('Not authorized')))) {
        router.push('/login');
      }
    }
  } catch (err) {
    console.error('[DEBUG] Error detallado en fetchUserData:', err);
    let errorMessage = 'Error al cargar los datos del perfil.';
    if (err.response) {
      errorMessage = `Error del servidor: ${err.response.data.error || err.message} (Código: ${err.response.status})`;
      if (err.response.status === 401) {
        error.value = 'Sesión expirada o inválida. Redirigiendo al login...';
        router.push('/login');
      } else {
        error.value = errorMessage;
      }
    } else if (err.request) {
      error.value = 'No se pudo conectar al servidor. Verifique su conexión.';
    }
    else {
      error.value = `Error en la aplicación: ${err.message}`;
    }
  } finally {
    isLoading.value = false;
    console.log('[DEBUG] fetchUserData finalizado. isLoading:', isLoading.value);
  }
};

// Eliminar un artículo
const deleteItem = async (itemId) => {
  if (!confirm('¿Estás seguro de que deseas eliminar este artículo? Esta acción no se puede deshacer.')) {
    console.log('[DEBUG] Eliminación cancelada por el usuario.');
    return;
  }
  console.log('[DEBUG] Intentando eliminar artículo con ID:', itemId);
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      error.value = 'Usuario no autenticado. Redirigiendo al login...';
      router.push('/login');
      return;
    }
    const response = await axios.delete(`/api/v1/items/${itemId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('[DEBUG] Respuesta al eliminar artículo:', response.data);
    if (response.data && response.data.success) {
      items.value = items.value.filter(item => item._id !== itemId);
      alert('Artículo eliminado correctamente.');
      console.log('[DEBUG] Artículo eliminado correctamente:', itemId);
    } else {
      error.value = response.data.message || 'No se pudo eliminar el artículo.';
      alert(error.value);
      console.warn('[DEBUG] Error en la respuesta al eliminar:', response.data);
    }
  } catch (err) {
    let errorMessage = 'Error al eliminar el artículo.';
    if (err.response) {
      errorMessage = `Error del servidor: ${err.response.data.error || err.message} (Código: ${err.response.status})`;
      if (err.response.status === 401) {
        error.value = 'Sesión expirada o inválida. Redirigiendo al login...';
        router.push('/login');
      } else {
        error.value = errorMessage;
      }
    } else if (err.request) {
      error.value = 'No se pudo conectar al servidor. Verifique su conexión.';
    } else {
      error.value = `Error en la aplicación: ${err.message}`;
    }
    alert(error.value);
    console.error('[DEBUG] Error al eliminar artículo:', err);
  }
}

// Abrir modal para editar artículo
const openEditItemModal = (item) => {
  editingItem.value = { ...item }; // Copiar el item para evitar mutaciones directas
  showEditItemModal.value = true;
  console.log('[DEBUG] Abriendo modal para editar artículo:', item);
};

// Manejar el guardado del artículo editado
const handleItemSave = async (updatedItem) => {
  showEditItemModal.value = false;
  console.log('[DEBUG] Artículo guardado desde modal:', updatedItem);
  // Actualizar el artículo en la lista local
  const index = items.value.findIndex(item => item._id === updatedItem._id);
  if (index !== -1) {
    items.value[index] = updatedItem;
  }
  // Opcionalmente, recargar todos los datos para asegurar consistencia, aunque puede ser menos eficiente
  // await fetchUserData(); 
  alert('Artículo actualizado correctamente.');
};

// Manejar el guardado del perfil
const handleProfileSave = async (updatedProfile) => {
  showProfileEditor.value = false;
  // Actualizar los datos del usuario en la vista actual
  user.value = {
    ...user.value,
    name: updatedProfile.name,
    avatar: updatedProfile.avatarUrl || user.value.avatar,
    bio: updatedProfile.bio || user.value.bio,
    location: updatedProfile.location || user.value.location
  };
  // Recargar los datos del usuario para asegurar que tenemos la información más actualizada
  await fetchUserData();
}

onMounted(() => {
  fetchUserData()
})
</script>

<style scoped>
.profile-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
  background-color: #f9f9f9;
}

.user-info-container {
  margin-bottom: 2rem;
}

.user-info {
  background: linear-gradient(to bottom, #ffffff, #f5f5f5);
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 2rem;
}

.profile-title {
  color: #2c3e50;
  font-size: 2rem;
  margin-bottom: 1.5rem;
  text-align: center;
  font-weight: 600;
}

.profile-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

@media (min-width: 768px) {
  .profile-content {
    flex-direction: row;
    align-items: flex-start;
    justify-content: center;
  }
}

.avatar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.avatar {
  position: relative;
  width: 180px;
  height: 180px;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  border: 4px solid white;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.avatar:hover img {
  transform: scale(1.05);
}

.details {
  flex: 1;
  min-width: 0;
  background-color: white;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.user-name {
  color: #2c3e50;
  font-size: 1.8rem;
  margin-top: 0;
  margin-bottom: 1rem;
  font-weight: 600;
}

.user-email, .user-location, .user-joined {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  color: #555;
  font-size: 1rem;
}

.user-email i, .user-location i, .user-joined i {
  color: #4CAF50;
  width: 20px;
}

.bio-container {
  margin: 1.5rem 0;
  padding: 1rem;
  background-color: #f9f9f9;
  border-radius: 8px;
  border-left: 4px solid #4CAF50;
}

.section-title {
  color: #2c3e50;
  font-size: 1.5rem;
  margin-bottom: 1rem;
  font-weight: 600;
  border-bottom: 2px solid #eaeaea;
  padding-bottom: 0.5rem;
}

.user-bio {
  line-height: 1.6;
  color: #555;
}

.edit-btn {
  display: inline-block;
  padding: 0.6rem 1.2rem;
  background-color: #4CAF50;
  color: white;
  text-decoration: none;
  border-radius: 30px;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.edit-btn:hover {
  background-color: #45a049;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.user-items {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.item-card {
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 1px solid #eaeaea;
}

.item-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
}

.item-image {
  height: 200px;
  overflow: hidden;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.item-card:hover .item-image img {
  transform: scale(1.05);
}

.item-details {
  padding: 1rem;
}

.item-details h3 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1.2rem;
}

.item-price {
  font-weight: bold;
  color: #4CAF50;
  margin: 0.5rem 0;
  font-size: 1.1rem;
}

.item-location {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #777;
  font-size: 0.9rem;
  margin: 0.5rem 0 0 0;
}

.item-location i {
  color: #4CAF50;
}

.item-actions {
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  border-top: 1px solid #eaeaea;
}

.item-actions .edit-btn {
  background-color: #2196F3;
}

.item-actions .edit-btn:hover {
  background-color: #0b7dda;
}

.item-actions .delete-btn {
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 30px;
  padding: 0.6rem 1.2rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.item-actions .delete-btn:hover {
  background-color: #d32f2f;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}
</style>