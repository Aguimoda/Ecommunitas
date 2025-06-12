/**
 * @file index.ts
 * @description Índice del módulo de autenticación de Ecommunitas
 * @module Features/Auth
 * @version 1.0.0
 * @author Equipo de Desarrollo Ecommunitas
 * @created 2024
 * 
 * Este archivo centraliza todas las exportaciones relacionadas con la funcionalidad
 * de autenticación y autorización de la aplicación. Proporciona un punto único
 * de acceso a todos los componentes, servicios, stores y utilidades del sistema
 * de autenticación.
 * 
 * ARQUITECTURA DEL MÓDULO:
 * ========================
 * 
 * 🏪 STORES (Estado Global):
 * - useAuthStore: Store principal de Pinia para gestión de estado de autenticación
 * - Manejo de usuario actual, tokens, estado de sesión
 * - Persistencia automática en localStorage
 * - Reactividad completa con Vue 3
 * 
 * 🔧 SERVICIOS (API):
 * - authService: Cliente HTTP para operaciones de autenticación
 * - Login, registro, logout, refresh de tokens
 * - Gestión de perfiles y configuración de usuario
 * - Interceptores automáticos para manejo de tokens
 * 
 * 🎯 COMPOSABLES (Lógica Reutilizable):
 * - useAuth: Hook principal para funcionalidades de autenticación
 * - Métodos reactivos para login, logout, verificación de permisos
 * - Integración automática con router y guards de navegación
 * - Manejo de errores y notificaciones
 * 
 * 🧩 COMPONENTES (UI):
 * - Formularios de login y registro
 * - Componentes de perfil de usuario
 * - Indicadores de estado de autenticación
 * - Modales y diálogos relacionados con auth
 * 
 * 📄 VISTAS (Páginas):
 * - Páginas de login y registro
 * - Perfil de usuario y configuración
 * - Recuperación de contraseña
 * - Verificación de email
 * 
 * 🛠️ UTILIDADES (Helpers):
 * - Validadores de email, contraseña y nombres
 * - Helpers para manejo de tokens y headers
 * - Funciones de verificación de permisos y roles
 * - Formateo y manipulación de datos de usuario
 * - Gestión de almacenamiento local
 * 
 * FUNCIONALIDADES PRINCIPALES:
 * ============================
 * 
 * 🔐 AUTENTICACIÓN:
 * - Login con email/contraseña
 * - Registro de nuevos usuarios
 * - Logout seguro con limpieza de datos
 * - Refresh automático de tokens
 * - Recordar sesión ("Remember me")
 * 
 * 👤 GESTIÓN DE PERFILES:
 * - Visualización y edición de perfil
 * - Cambio de contraseña
 * - Actualización de información personal
 * - Gestión de avatar/foto de perfil
 * 
 * 🛡️ AUTORIZACIÓN:
 * - Sistema de roles (admin, moderator, user)
 * - Verificación de permisos granular
 * - Guards de navegación automáticos
 * - Protección de rutas y componentes
 * 
 * 🔄 RECUPERACIÓN DE CUENTA:
 * - Solicitud de reset de contraseña
 * - Verificación por email
 * - Cambio seguro de contraseña
 * 
 * VENTAJAS DE LA ARQUITECTURA:
 * ============================
 * 
 * ✅ **Importaciones Limpias**: 
 *    `import { useAuth, authService } from '@/features/auth'`
 * 
 * ✅ **Separación de Responsabilidades**: 
 *    Cada capa tiene una función específica y bien definida
 * 
 * ✅ **Reutilización**: 
 *    Composables y utilidades reutilizables en toda la app
 * 
 * ✅ **Mantenibilidad**: 
 *    Código organizado y fácil de mantener
 * 
 * ✅ **Escalabilidad**: 
 *    Fácil agregar nuevas funcionalidades de auth
 * 
 * ✅ **Testing**: 
 *    Cada parte puede ser testeada independientemente
 * 
 * @example
 * ```typescript
 * // Uso básico del módulo de autenticación
 * import { 
 *   useAuth, 
 *   authService, 
 *   useAuthStore,
 *   isAuthenticated,
 *   hasRole 
 * } from '@/features/auth'
 * 
 * // En un componente Vue
 * const { login, logout, user, isLoading } = useAuth()
 * 
 * // Verificar autenticación
 * if (isAuthenticated()) {
 *   console.log('Usuario autenticado')
 * }
 * 
 * // Verificar roles
 * if (hasRole('admin')) {
 *   console.log('Usuario es administrador')
 * }
 * 
 * // Usar el store directamente
 * const authStore = useAuthStore()
 * console.log(authStore.user)
 * ```
 */

// Stores
export { useAuthStore } from './stores/authStore'

// Services
export { default as authService } from './services/authService'
export * from './services/authService'

// Composables
export {
  useAuth
} from './composables/useAuth'

// Components
export * from './components'

// Views
export * from './views'

// Utils
export {
  getAuthHeader,
  getAuthHeaders,
  getAuthHeadersFormData,
  isAuthenticated,
  getCurrentUser,
  getCurrentUserId,
  getCurrentUserRole,
  hasRole,
  hasAnyRole,
  isAdmin,
  isModerator,
  isOwner,
  canAccess,
  isValidEmail,
  validatePassword,
  validateName,
  clearAuthData,
  saveAuthData,
  getTokenExpiration,
  isTokenExpired,
  isCurrentTokenExpired,
  formatUserDisplayName,
  getUserInitials,
  generateSecurePassword,
  debounceAuthCheck
} from './utils/authUtils'

// Re-export types for convenience
export type {
  User,
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  UpdateProfileData,
  PasswordUpdateData,
  ForgotPasswordData,
  ResetPasswordData
} from './services/authService'

// Legacy exports for backward compatibility
export { default as authHeader } from './utils/authUtils'