<template>
  <div class="profile-view">
    <!-- Sección de información del usuario -->
    <div class="user-info">
      <h1>Perfil de Usuario</h1>
      <div class="avatar">
        <img :src="user.avatar" alt="Avatar del usuario" />
      </div>
      <div class="details">
        <h2>{{ user.name }}</h2>
        <p>{{ user.email }}</p>
        <p>{{ user.location }}</p>
        <p>Miembro desde: {{ user.joinedDate }}</p>
      </div>
      <button @click="showProfileEditor = true" class="edit-btn" style="border: none; cursor: pointer;">Editar Perfil</button>
    </div>
    
    <!-- Modal del editor de perfil -->
    <ProfileEditor v-if="showProfileEditor" @close="showProfileEditor = false" @save="handleProfileSave" />
    <EditItemModal v-if="showEditItemModal" :item="editingItem" @close="showEditItemModal = false" @save="handleItemSave" />

    <!-- Sección de artículos publicados -->
    <div class="user-items">
      <h2>Mis Artículos</h2>
      <div class="items-grid">
        <div v-for="item in items" :key="item._id" class="item-card">
          <router-link :to="`/items/${item._id}`">
            <img :src="item.image" :alt="item.title" />
            <h3>{{ item.title }}</h3>
            <p>{{ item.price }} €</p>
            <p>{{ item.location }}</p>
          </router-link>
          <div class="item-actions">
            <button @click="openEditItemModal(item)" class="edit-btn">Editar</button>
            <button @click="deleteItem(item._id)">Eliminar</button>
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
    location: updatedProfile.location
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
}

.user-info {
  background: #fff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  text-align: center;
}

.avatar img {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  margin: 0 auto 1rem;
}

.details {
  margin-bottom: 1.5rem;
}

.edit-btn {
  display: inline-block;
  padding: 0.5rem 1rem;
  background-color: #4CAF50;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.edit-btn:hover {
  background-color: #45a049;
}

.user-items h2 {
  margin-bottom: 1.5rem;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

.item-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.item-card:hover {
  transform: translateY(-5px);
}

.item-card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.item-card h3 {
  padding: 0.5rem 1rem;
  margin: 0;
}

.item-card p {
  padding: 0 1rem 0.5rem;
  margin: 0;
  color: #666;
}

.item-actions {
  padding: 1rem;
  display: flex;
  justify-content: space-between;
}

.item-actions button {
  padding: 0.5rem 1rem;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.item-actions button:hover {
  background-color: #d32f2f;
}
</style>