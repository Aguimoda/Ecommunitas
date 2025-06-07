<template>
  <div class="item-management">
    <!-- Tabla de ítems con acciones -->
    <div class="overflow-x-auto bg-white shadow-md rounded-lg">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Imagen</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Disponibilidad</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="item in (Array.isArray(items) ? items : [])" :key="item._id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="h-12 w-12 overflow-hidden rounded">
                <img :src="item.imageUrl" :alt="item.title" class="h-full w-full object-cover" />
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">{{ item.title }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-500">{{ translateCategory(item.category) }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" 
                :class="{
                  'bg-green-100 text-green-800': item.condition === 'new' || item.condition === 'like_new',
                  'bg-yellow-100 text-yellow-800': item.condition === 'good',
                  'bg-orange-100 text-orange-800': item.condition === 'fair',
                  'bg-red-100 text-red-800': item.condition === 'poor'
                }">
                {{ translateCondition(item.condition) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <button 
                @click="toggleAvailability(item)"
                class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                :class="{ 'bg-indigo-600': item.available, 'bg-gray-200': !item.available }"
                role="switch"
                :aria-checked="item.available"
                :disabled="isLoading"
              >
                <span 
                  aria-hidden="true" 
                  class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                  :class="{ 'translate-x-5': item.available, 'translate-x-0': !item.available }"
                ></span>
              </button>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <div class="flex space-x-2">
                <button 
                  @click="editItem(item)" 
                  class="text-indigo-600 hover:text-indigo-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-md p-1"
                  :disabled="isLoading"
                  aria-label="Editar ítem"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
                <button 
                  @click="confirmDelete(item)" 
                  class="text-red-600 hover:text-red-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 rounded-md p-1"
                  :disabled="isLoading"
                  aria-label="Eliminar ítem"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
          <!-- Estado de carga -->
          <tr v-if="isLoading && items.length === 0">
            <td colspan="6" class="px-6 py-4 text-center text-sm text-gray-500">
              <div class="flex justify-center items-center space-x-2">
                <svg class="animate-spin h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Cargando ítems...</span>
              </div>
            </td>
          </tr>
          <!-- Estado vacío -->
          <tr v-if="!isLoading && items.length === 0">
            <td colspan="6" class="px-6 py-4 text-center text-sm text-gray-500">
              No hay ítems disponibles
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal de confirmación para eliminar -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6" role="dialog" aria-modal="true" aria-labelledby="modal-headline">
        <div class="sm:flex sm:items-start">
          <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
            <svg class="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-headline">
              Eliminar ítem
            </h3>
            <div class="mt-2">
              <p class="text-sm text-gray-500">
                ¿Estás seguro de que deseas eliminar "{{ itemToDelete?.title }}"? Esta acción no se puede deshacer.
              </p>
            </div>
          </div>
        </div>
        <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
          <button 
            type="button" 
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
            @click="deleteItem"
            :disabled="isDeleting"
          >
            <span v-if="isDeleting" class="mr-2">
              <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            {{ isDeleting ? 'Eliminando...' : 'Eliminar' }}
          </button>
          <button 
            type="button" 
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
            @click="cancelDelete"
            :disabled="isDeleting"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de edición -->
    <div v-if="showEditModal" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6" role="dialog" aria-modal="true" aria-labelledby="edit-modal-headline">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg leading-6 font-medium text-gray-900" id="edit-modal-headline">
            Editar ítem
          </h3>
          <button 
            type="button" 
            class="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-md"
            @click="cancelEdit"
            :disabled="isUpdating"
            aria-label="Cerrar"
          >
            <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="mt-2">
          <ItemForm 
            :initial-data="itemToEdit" 
            :is-editing="true" 
            @success="handleEditSuccess" 
          />
        </div>
      </div>
    </div>

    <!-- Alerta de error -->
    <div v-if="error" 
         class="fixed bottom-4 right-4 bg-red-50 border-l-4 border-red-500 p-4 max-w-md" 
         role="alert"
         aria-live="assertive">
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-red-700">{{ error }}</p>
        </div>
        <div class="ml-auto pl-3">
          <button 
            @click="error = ''" 
            class="inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            aria-label="Cerrar alerta"
          >
            <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Alerta de éxito -->
    <div v-if="success" 
         class="fixed bottom-4 right-4 bg-green-50 border-l-4 border-green-500 p-4 max-w-md" 
         role="alert"
         aria-live="assertive">
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-green-700">{{ success }}</p>
        </div>
        <div class="ml-auto pl-3">
          <button 
            @click="success = ''" 
            class="inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            aria-label="Cerrar alerta"
          >
            <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useItemsStore } from '@/features/items';
// Removed direct itemService import - using store methods instead
import { ItemForm } from '@/features/items/components';
import { translateCategory, translateCondition } from '@/utils/translations';
import { displayError } from '@/shared/utils/errorHandler';

// Store
const itemsStore = useItemsStore();
// const toast = useToast(); // Migrated to standardized error handling

// Computed properties del store
const items = computed(() => itemsStore.items);
const isLoading = computed(() => itemsStore.loading);
const error = computed(() => itemsStore.error);

// Estado local para UI
const success = ref('');

// Estado para el modal de eliminación
const showDeleteModal = ref(false);
const itemToDelete = ref(null);
const isDeleting = ref(false);

// Estado para el modal de edición
const showEditModal = ref(false);
const itemToEdit = ref(null);
const isUpdating = ref(false);

// Emits para comunicación con componente padre
const emit = defineEmits(['item-updated', 'item-deleted']);

// Función para obtener ítems usando el store
const fetchItems = async () => {
  try {
    await itemsStore.fetchItems();
  } catch (err) {
    console.error('Error al cargar ítems:', err);
  }
};

// Cambiar disponibilidad del ítem
const toggleAvailability = async (item) => {
  try {
    // Usar el método del store directamente
    const updatedItem = await itemsStore.toggleItemAvailability(item._id);
    
    // Emitir evento para notificar al componente padre
    emit('item-updated', updatedItem);
    
    // toast.success(`Ítem ${updatedItem.available ? 'disponible' : 'no disponible'}`); // Migrated to standardized error handling
  } catch (err) {
    const errorMessage = err.message || 'Error al cambiar la disponibilidad';
    displayError(errorMessage);
    console.error('Error al cambiar disponibilidad:', err);
  }
};

// Abrir modal de edición
const editItem = (item) => {
  itemToEdit.value = { ...item };
  showEditModal.value = true;
};

// Cancelar edición
const cancelEdit = () => {
  showEditModal.value = false;
  itemToEdit.value = null;
};

// Manejar éxito en la edición
const handleEditSuccess = (updatedItem) => {
  showEditModal.value = false;
  
  // El store ya se actualiza automáticamente a través de ItemForm
  // Solo necesitamos emitir el evento para notificar al componente padre
  emit('item-updated', updatedItem);
  
  // toast.success('Ítem actualizado correctamente'); // Migrated to standardized error handling
};

// Abrir modal de confirmación para eliminar
const confirmDelete = (item) => {
  itemToDelete.value = item;
  showDeleteModal.value = true;
};

// Cancelar eliminación
const cancelDelete = () => {
  showDeleteModal.value = false;
  itemToDelete.value = null;
};

// Eliminar ítem
const deleteItem = async () => {
  if (!itemToDelete.value) return;
  
  try {
    isDeleting.value = true;
    
    // Usar el store para eliminar
    await itemsStore.deleteItem(itemToDelete.value._id);
    
    // Emitir evento para notificar al componente padre
    emit('item-deleted', itemToDelete.value);
    
    showDeleteModal.value = false;
    const deletedItem = itemToDelete.value;
    itemToDelete.value = null;
    
    // toast.success('Ítem eliminado correctamente'); // Migrated to standardized error handling
  } catch (err) {
    const errorMessage = err.message || 'Error al eliminar el ítem';
    displayError(errorMessage);
    console.error('Error al eliminar ítem:', err);
  } finally {
    isDeleting.value = false;
  }
};



// Cargar ítems al montar el componente
onMounted(() => {
  fetchItems();
});
</script>