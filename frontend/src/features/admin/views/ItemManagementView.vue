<!--
/**
 * @file ItemManagementView.vue
 * @description Vista de administración para gestión de artículos en Ecommunitas
 * 
 * Esta vista proporciona una interfaz completa para que los usuarios administren
 * sus artículos publicados. Permite crear nuevos artículos, editar los existentes,
 * cambiar su disponibilidad y eliminarlos. Es el centro de control principal
 * para la gestión de contenido del usuario.
 * 
 * CARACTERÍSTICAS PRINCIPALES:
 * - 📝 Gestión completa de artículos del usuario
 * - ➕ Creación de nuevos artículos
 * - ✏️ Edición de artículos existentes
 * - 🗑️ Eliminación de artículos
 * - 👁️ Visualización de estado y disponibilidad
 * - 🔄 Actualización en tiempo real
 * - 📊 Vista organizada y funcional
 * - 🎨 Interfaz intuitiva y responsive
 * 
 * FUNCIONALIDADES:
 * - Listado de todos los artículos del usuario
 * - Botón prominente para crear nuevos artículos
 * - Integración con componente ItemManagement
 * - Manejo de eventos de actualización y eliminación
 * - Navegación fluida entre vistas
 * - Feedback visual de acciones realizadas
 * - Confirmaciones para acciones destructivas
 * 
 * ACCIONES DISPONIBLES:
 * - Crear nuevo artículo: Redirige al formulario de creación
 * - Editar artículo: Abre modal o vista de edición
 * - Eliminar artículo: Con confirmación de seguridad
 * - Cambiar disponibilidad: Toggle rápido de estado
 * - Ver detalles: Navegación a vista detallada
 * 
 * EVENTOS MANEJADOS:
 * @event item-updated - Cuando se actualiza un artículo
 * @event item-deleted - Cuando se elimina un artículo
 * 
 * NAVEGACIÓN:
 * - Botón "Crear nuevo ítem": Redirige a /items/new
 * - Enlaces a edición y detalles de artículos
 * - Breadcrumbs para navegación contextual
 * - Integración con sistema de rutas
 * 
 * INTEGRACIÓN:
 * - Componente ItemManagement para funcionalidad principal
 * - Composable useItemManagement para lógica de negocio
 * - Sistema de rutas de Vue Router
 * - Store de artículos para gestión de estado
 * 
 * COMPOSABLES UTILIZADOS:
 * - useItemManagement: Lógica principal de gestión
 * - Funciones de manejo de eventos
 * - Inicialización de componente
 * - Gestión de estado reactivo
 * 
 * TECNOLOGÍAS:
 * - Vue 3 Composition API
 * - Vue Router para navegación
 * - Tailwind CSS para estilos
 * - Componentes reutilizables
 * - Composables personalizados
 * 
 * @author Equipo de Desarrollo Ecommunitas
 * @version 1.0.0
 * @since 1.0.0
 */
-->
<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">Gestión de Ítems</h1>
      <p class="mt-2 text-gray-600">Administra tus ítems publicados, edita su información o cambia su disponibilidad.</p>
    </div>
    
    <!-- Botón para crear nuevo ítem -->
    <div class="mb-6">
      <router-link 
        to="/items/new" 
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
        </svg>
        Crear nuevo ítem
      </router-link>
    </div>
    
    <!-- Componente de gestión de ítems -->
    <ItemManagement 
      @item-updated="handleItemUpdated"
      @item-deleted="handleItemDeleted"
    />
  </div>
</template>

<script setup>
import { ItemManagement } from '@/features/admin/components'
import { useItemManagement } from '../composables/useItemManagement'

// Usar el composable para toda la lógica de gestión de ítems
const {
  // Funciones de manejo de eventos
  handleItemUpdated,
  handleItemDeleted,
  
  // Función de inicialización
  initializeComponent
} = useItemManagement()
</script>