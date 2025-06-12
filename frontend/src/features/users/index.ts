/**
 * @file index.ts
 * @description Índice del módulo de gestión de usuarios de Ecommunitas
 * @module Features/Users
 * @version 1.0.0
 * @author Equipo de Desarrollo Ecommunitas
 * @created 2024
 * 
 * Este archivo centraliza todas las exportaciones relacionadas con la funcionalidad
 * de gestión de usuarios del sistema. Proporciona un punto único de acceso a todos
 * los componentes, servicios, stores, composables, utilidades y tipos relacionados
 * con la administración, perfiles y interacciones de usuarios.
 * 
 * ARQUITECTURA DEL MÓDULO:
 * ========================
 * 
 * 🏪 STORES (Estado Global):
 * - useUsersStore: Store principal de Pinia para gestión de estado de usuarios
 * - Cache inteligente de perfiles con invalidación automática
 * - Estado de búsqueda, filtros y paginación de usuarios
 * - Gestión de usuario actual y preferencias
 * - Optimización de rendimiento con lazy loading
 * 
 * 🔧 SERVICIOS (API):
 * - userService: Cliente HTTP para operaciones CRUD de usuarios
 * - Gestión de perfiles y preferencias
 * - Autenticación y autorización
 * - Búsqueda avanzada de usuarios
 * - Estadísticas y analytics de usuarios
 * 
 * 🧩 COMPONENTES (UI):
 * - UserCard: Tarjeta de perfil de usuario
 * - UserList: Lista de usuarios con filtros
 * - UserProfile: Vista completa de perfil
 * - UserForm: Formulario de edición de perfil
 * - UserAvatar: Avatar con estados online/offline
 * - UserSearch: Búsqueda avanzada de usuarios
 * 
 * 📄 VISTAS (Páginas):
 * - Lista de usuarios con búsqueda y filtros
 * - Perfil de usuario individual
 * - Edición de perfil personal
 * - Configuración de preferencias
 * - Panel de administración de usuarios
 * 
 * 🎯 COMPOSABLES (Lógica Reutilizable):
 * - useUsers: Gestión general de usuarios
 * - useCurrentUser: Usuario actual y sesión
 * - useUserSearch: Búsqueda avanzada
 * - useUserPermissions: Gestión de permisos
 * - useUserList: Lista paginada de usuarios
 * 
 * 🛠️ UTILIDADES (Helpers):
 * - Formateo de nombres y avatares
 * - Gestión de roles y permisos
 * - Validación de datos de usuario
 * - Utilidades de comparación y ordenamiento
 * - Filtrado y búsqueda
 * - Gestión de preferencias
 * - Estadísticas y métricas
 * 
 * 📊 TIPOS (TypeScript):
 * - User: Interfaz principal de usuario
 * - UserPreferences: Configuración personal
 * - UpdateUserData: Datos para actualizar perfil
 * - UsersResponse: Respuesta paginada de usuarios
 * - UserFilters: Filtros de búsqueda
 * - UsersState: Estado del store
 * 
 * FUNCIONALIDADES PRINCIPALES:
 * ============================
 * 
 * 👤 GESTIÓN DE PERFILES:
 * - Visualización de perfiles completos
 * - Edición de información personal
 * - Gestión de avatar y fotos
 * - Configuración de preferencias
 * - Historial de actividad
 * 
 * 🔍 BÚSQUEDA Y FILTRADO:
 * - Búsqueda por nombre, email, ubicación
 * - Filtros por rol, estado, fecha de registro
 * - Búsqueda geográfica por proximidad
 * - Ordenamiento por múltiples criterios
 * - Filtros avanzados personalizables
 * 
 * 🔐 ROLES Y PERMISOS:
 * - Sistema de roles jerárquico
 * - Gestión granular de permisos
 * - Validación de autorización
 * - Moderación y administración
 * - Control de acceso a funcionalidades
 * 
 * 📊 ESTADÍSTICAS Y MÉTRICAS:
 * - Tiempo de registro y última actividad
 * - Estadísticas de uso y participación
 * - Métricas de interacción social
 * - Análisis de comportamiento
 * - Reportes de actividad
 * 
 * 💬 INTERACCIÓN SOCIAL:
 * - Sistema de seguimiento entre usuarios
 * - Mensajería directa
 * - Valoraciones y reputación
 * - Reportes de usuarios
 * - Bloqueo y moderación
 * 
 * 🎨 PERSONALIZACIÓN:
 * - Temas y preferencias visuales
 * - Configuración de notificaciones
 * - Preferencias de privacidad
 * - Configuración de ubicación
 * - Idioma y localización
 * 
 * VENTAJAS DE LA ARQUITECTURA:
 * ============================
 * 
 * ✅ **Importaciones Limpias**: 
 *    `import { useUsersStore, userService } from '@/features/users'`
 * 
 * ✅ **Gestión Completa**: 
 *    Todas las utilidades de usuario en un solo lugar
 * 
 * ✅ **Roles y Permisos**: 
 *    Sistema robusto de autorización
 * 
 * ✅ **Cache Inteligente**: 
 *    Optimización automática de rendimiento
 * 
 * ✅ **Búsqueda Avanzada**: 
 *    Filtros potentes y búsqueda flexible
 * 
 * ✅ **Tipado Fuerte**: 
 *    TypeScript para mayor seguridad
 * 
 * ✅ **Composables Reutilizables**: 
 *    Lógica compartida entre componentes
 * 
 * ✅ **Utilidades Extensas**: 
 *    Helpers para todas las operaciones comunes
 * 
 * @example
 * ```typescript
 * // Uso básico del módulo de usuarios
 * import { 
 *   useUsersStore, 
 *   userService,
 *   useCurrentUser,
 *   formatUserDisplayName,
 *   isUserAdmin,
 *   type User 
 * } from '@/features/users'
 * 
 * // En un componente Vue
 * const usersStore = useUsersStore()
 * const { currentUser, isLoggedIn } = useCurrentUser()
 * 
 * // Buscar usuarios
 * await usersStore.searchUsers({
 *   query: 'Juan',
 *   role: 'user',
 *   location: 'Madrid'
 * })
 * 
 * // Verificar permisos
 * if (isUserAdmin(currentUser.value)) {
 *   // Mostrar panel de administración
 * }
 * 
 * // Formatear nombre para mostrar
 * const displayName = formatUserDisplayName(user)
 * ```
 */

// Services
export { userService, default as defaultUserService } from './services/userService'

// Components
export * from './components'

// Views
export * from './views'

// Stores
export { useUsersStore } from './stores/usersStore'

// Composables
export {
  useUsers,
  useCurrentUser,
  useUserSearch,
  useUserPermissions,
  useUserList
} from './composables/useUsers'

// Utils
export {
  // Display utilities
  formatUserDisplayName,
  getUserInitials,
  getUserAvatarUrl,
  
  // Role utilities
  getUserRoleLabel,
  getUserRoleColor,
  isUserRole,
  hasUserRole,
  isUserAdmin,
  isUserModerator,
  canUserModerate,
  
  // Status utilities
  getUserStatusLabel,
  getUserStatusColor,
  isUserActive,
  isUserOnline,
  
  // Validation utilities
  isValidUserName,
  isValidUserEmail,
  isValidUserPhone,
  validateUserData,
  
  // Comparison utilities
  isSameUser,
  isCurrentUser,
  
  // Sorting utilities
  sortUsersByName,
  sortUsersByRole,
  sortUsersByDate,
  
  // Filtering utilities
  filterUsersByRole,
  filterUsersByStatus,
  filterUsersBySearch,
  
  // Preferences utilities
  getDefaultUserPreferences,
  mergeUserPreferences,
  
  // Statistics utilities
  calculateUserAge,
  formatUserJoinDate,
  formatUserLastSeen,
  
  // Helper utilities
  sanitizeUserInput,
  truncateText,
  getUserDisplayInfo
} from './utils/userUtils'

// Types
export type {
  User,
  UserPreferences,
  UpdateUserData,
  UserItem,
  UserTrade,
  UsersResponse,
  UserResponse,
  UserItemsResponse,
  UserTradesResponse
} from './services/userService'

export type {
  UserFilters,
  UserPagination,
  UserCache,
  UsersState
} from './stores/usersStore'