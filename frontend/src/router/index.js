/**
 * @fileoverview Configuración del enrutador principal de la aplicación Ecommunitas
 * @description Define todas las rutas de la aplicación, incluyendo guards de navegación,
 * lazy loading de componentes, y configuración de metadatos para autenticación y autorización.
 * 
 * @features
 * - Enrutamiento con Vue Router 4
 * - Lazy loading de componentes para optimización
 * - Guards de navegación para autenticación
 * - Protección de rutas privadas y públicas
 * - Redirecciones automáticas según estado de autenticación
 * - Manejo de rutas no encontradas (404)
 * - Configuración de metadatos de ruta
 * 
 * @technical
 * - Vue Router 4 con modo history
 * - Lazy loading con import() dinámico
 * - Guards beforeEach para autenticación
 * - Integración con Pinia stores
 * - TypeScript para tipado de rutas
 * 
 * @routes
 * - / : Página principal (HomeView)
 * - /login : Inicio de sesión (solo invitados)
 * - /register : Registro de usuario (solo invitados)
 * - /post-item : Publicar artículo (requiere autenticación)
 * - /search : Búsqueda de artículos
 * - /item/:id : Detalle de artículo
 * - /edit-item/:id : Editar artículo (requiere autenticación)
 * - /profile : Perfil de usuario (requiere autenticación)
 * - /messages : Centro de mensajes (requiere autenticación)
 * - /message/:userId : Conversación específica (requiere autenticación)
 * - /admin/* : Panel de administración (requiere rol admin)
 * 
 * @guards
 * - requiresAuth: Requiere usuario autenticado
 * - requiresGuest: Solo para usuarios no autenticados
 * - requiresAdmin: Requiere rol de administrador
 * 
 * @author Equipo Ecommunitas
 * @version 1.0.0
 * @since 2024
 */

import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/features/auth'

// Rutas con lazy loading consistente y nombres estandarizados
const routes = [
  {
    path: '/',
    name: 'HomeView',
    component: () => import('../shared/views/HomeView.vue')
  },
  {
    path: '/login',
    name: 'LoginView',
    component: () => import('../features/auth/views/LoginView.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'RegisterView',
    component: () => import('../features/auth/views/RegisterView.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/post-item',
    name: 'ItemPostView',
    component: () => import('../features/items/views/ItemPostView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/search',
    name: 'SearchView',
    component: () => import('../shared/views/SearchView.vue')
  },
  {
    path: '/item/:id',
    name: 'ItemDetailView',
    component: () => import('../features/items/views/ItemDetailView.vue'),
    props: true
  },
  {
    path: '/edit-item/:id',
    name: 'EditItemView',
    component: () => import('../features/items/views/EditItemView.vue'),
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'ProfileView',
    component: () => import('../features/users/views/ProfileView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/messages',
    name: 'MessagesView',
    component: () => import('../features/messages/views/MessagesView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/message/:userId',
    name: 'MessageDetailView',
    component: () => import('../features/messages/views/MessageDetailView.vue'),
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: () => import('../features/admin/views/AdminDashboard.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/items',
    name: 'ItemManagementView',
    component: () => import('../features/admin/views/ItemManagementView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFoundView',
    component: () => import('../shared/views/NotFoundView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Guard de navegación global
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // Verificar si la ruta requiere autenticación
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
    return
  }
  
  // Verificar si la ruta es solo para invitados
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/')
    return
  }
  
  // Verificar si la ruta requiere permisos de admin
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next('/')
    return
  }
  
  next()
})

export default router