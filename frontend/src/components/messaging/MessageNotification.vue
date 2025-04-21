<template>
  <div class="message-notification relative">
    <button 
      @click="toggleDropdown"
      class="notification-button p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none relative"
      aria-label="Notificaciones de mensajes"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
      
      <!-- Badge de notificaciones -->
      <span 
        v-if="unreadCount > 0"
        class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
      >
        {{ unreadCount > 9 ? '9+' : unreadCount }}
      </span>
    </button>
    
    <!-- Dropdown de notificaciones -->
    <div 
      v-if="isOpen"
      class="notification-dropdown absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden z-50"
      v-click-outside="closeDropdown"
    >
      <div class="p-3 border-b dark:border-gray-700 flex justify-between items-center">
        <h3 class="font-medium">Mensajes no leídos</h3>
        <router-link 
          to="/messages" 
          class="text-sm text-green-500 hover:text-green-600 dark:hover:text-green-400"
          @click="closeDropdown"
        >
          Ver todos
        </router-link>
      </div>
      
      <div class="max-h-96 overflow-y-auto">
        <template v-if="unreadMessages.length > 0">
          <div 
            v-for="message in unreadMessages" 
            :key="message._id"
            class="notification-item p-3 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
            @click="goToConversation(message.sender._id)"
          >
            <div class="flex items-start">
              <div class="avatar mr-3 mt-1">
                <img 
                  :src="message.sender.avatar || '/img/default-avatar.png'" 
                  :alt="message.sender.name" 
                  class="w-10 h-10 rounded-full object-cover"
                >
              </div>
              <div class="flex-1">
                <div class="flex justify-between">
                  <h4 class="font-medium">{{ message.sender.name }}</h4>
                  <span class="text-xs text-gray-500">{{ formatDate(message.createdAt) }}</span>
                </div>
                <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{{ message.content }}</p>
              </div>
            </div>
          </div>
        </template>
        
        <div v-else class="p-4 text-center text-gray-500">
          No tienes mensajes no leídos
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import messageService from '../../services/messageService';
import { useToast } from 'vue-toastification';

export default {
  name: 'MessageNotification',
  setup() {
    const router = useRouter();
    const toast = useToast();
    const isOpen = ref(false);
    const unreadMessages = ref([]);
    const pollingInterval = ref(null);
    const previousCount = ref(0);
    
    const unreadCount = computed(() => unreadMessages.value.length);
    
    // Cargar mensajes no leídos
    const loadUnreadMessages = async () => {
      try {
        const response = await messageService.getUnreadMessages();
        
        // Verificar si hay nuevos mensajes para mostrar notificación
        if (response.data.length > previousCount.value && previousCount.value > 0) {
          const newMessages = response.data.length - previousCount.value;
          const message = newMessages === 1 
            ? 'Has recibido un nuevo mensaje' 
            : `Has recibido ${newMessages} nuevos mensajes`;
          
          toast.info(message, {
            timeout: 4000,
            onClick: () => router.push('/messages')
          });
        }
        
        // Actualizar valores
        previousCount.value = response.data.length;
        unreadMessages.value = response.data;
      } catch (error) {
        console.error('Error al cargar mensajes no leídos:', error);
        toast.error('Error al cargar mensajes no leídos');
      }
    };
    
    // Formatear fecha
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.round(diffMs / 60000);
      const diffHours = Math.round(diffMs / 3600000);
      const diffDays = Math.round(diffMs / 86400000);
      
      if (diffMins < 1) return 'Ahora';
      if (diffMins < 60) return `Hace ${diffMins} min`;
      if (diffHours < 24) return `Hace ${diffHours} h`;
      if (diffDays === 1) return 'Ayer';
      if (diffDays < 7) return `Hace ${diffDays} días`;
      
      return date.toLocaleDateString();
    };
    
    // Abrir/cerrar dropdown
    const toggleDropdown = () => {
      isOpen.value = !isOpen.value;
    };
    
    const closeDropdown = () => {
      isOpen.value = false;
    };
    
    // Ir a la conversación
    const goToConversation = (userId) => {
      router.push({ 
        path: '/messages',
        query: { userId }
      });
      closeDropdown();
      
      // Mostrar toast de confirmación
      toast.success('Abriendo conversación...', {
        timeout: 2000
      });
    };
    
    // Directiva personalizada para cerrar al hacer clic fuera
    const clickOutside = {
      mounted(el, binding) {
        el.clickOutsideEvent = (event) => {
          if (!(el === event.target || el.contains(event.target))) {
            binding.value();
          }
        };
        document.addEventListener('click', el.clickOutsideEvent);
      },
      unmounted(el) {
        document.removeEventListener('click', el.clickOutsideEvent);
      },
    };
    
    // Iniciar polling para actualizar mensajes no leídos
    onMounted(() => {
      loadUnreadMessages();
      
      // Actualizar cada minuto
      pollingInterval.value = setInterval(() => {
        loadUnreadMessages();
      }, 60000);
    });
    
    // Limpiar intervalo al desmontar
    onBeforeUnmount(() => {
      if (pollingInterval.value) {
        clearInterval(pollingInterval.value);
      }
    });
    
    return {
      isOpen,
      unreadMessages,
      unreadCount,
      toggleDropdown,
      closeDropdown,
      goToConversation,
      formatDate,
      vClickOutside: clickOutside
    };
  }
};
</script>

<style scoped>
.notification-dropdown {
  max-height: 400px;
  overflow-y: auto;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>