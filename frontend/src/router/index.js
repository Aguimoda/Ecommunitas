import { createRouter, createWebHistory } from 'vue-router'

const isAuthenticated = () => {
  return !!localStorage.getItem('token')
}

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomeView.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/RegisterView.vue')
  },
  {
    path: '/post-item',
    name: 'ItemPost',
    component: () => import('../views/ItemPostView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('../views/SearchView.vue')
  },
  {
    path: '/items/:id',
    name: 'ItemDetail',
    component: () => import('../views/ItemDetailView.vue'),
    props: true
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/ProfileView.vue'),
    meta: { requiresAuth: true }
  },
  // La ruta de edición de perfil se ha eliminado porque ahora se maneja como un modal en ProfileView.vue
  {
    path: '/messages',
    name: 'Messages',
    component: () => import('../views/MessagesView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/messages/:id',
    name: 'MessageDetail',
    component: () => import('../views/MessageDetailView.vue'),
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: () => import('../views/AdminDashboard.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin);
  const user = JSON.parse(localStorage.getItem('user')); // Asumimos que el usuario se guarda aquí

  if (requiresAuth && !isAuthenticated()) {
    next({ name: 'Login' });
  } else if (requiresAdmin && (!user || user.role !== 'admin')) {
    // Si requiere admin y el usuario no es admin (o no hay usuario), redirigir
    // Podrías redirigir a Home o a una página de 'Acceso Denegado'
    next({ name: 'Home' }); 
  } else {
    next();
  }
});

export default router