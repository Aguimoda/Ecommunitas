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
    path: '/items/:id',
    name: 'ItemDetailView',
    component: () => import('../features/items/views/ItemDetailView.vue'),
    props: true
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
    path: '/messages/:id',
    name: 'MessageDetailView',
    component: () => import('../features/messages/views/MessageDetailView.vue'),
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'AdminDashboardView',
    component: () => import('../features/admin/views/AdminDashboard.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../shared/views/NotFoundView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Guard centralizado usando el store de autenticación
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Verificar autenticación si hay token
  if (authStore.token && !authStore.user) {
    await authStore.checkAuth()
  }
  
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest)
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin)
  
  // Redirigir usuarios autenticados lejos de páginas de invitado
  if (requiresGuest && authStore.isAuthenticated) {
    next({ name: 'HomeView' })
    return
  }
  
  // Verificar autenticación requerida
  if (requiresAuth && !authStore.isAuthenticated) {
    next({ 
      name: 'LoginView',
      query: { redirect: to.fullPath }
    })
    return
  }
  
  // Verificar permisos de administrador
  if (requiresAdmin && !authStore.isAdmin) {
    next({ name: 'HomeView' })
    return
  }
  
  next()
})

export default router