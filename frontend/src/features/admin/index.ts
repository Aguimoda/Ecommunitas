/**
 * @file index.ts
 * @description Índice del módulo de administración de Ecommunitas
 * @module Features/Admin
 * @version 1.0.0
 * @author Equipo de Desarrollo Ecommunitas
 * @created 2024
 * 
 * Este archivo centraliza todas las exportaciones relacionadas con la funcionalidad
 * de administración del sistema. Proporciona un punto único de acceso a todos los
 * componentes, servicios, stores, composables, utilidades y tipos relacionados
 * con la gestión administrativa, moderación y análisis del sistema.
 * 
 * ARQUITECTURA DEL MÓDULO:
 * ========================
 * 
 * 🏪 STORES (Estado Global):
 * - useAdminStore: Store principal de Pinia para gestión administrativa
 * - Cache de datos administrativos con invalidación inteligente
 * - Estado de filtros, paginación y búsquedas
 * - Gestión de permisos y roles administrativos
 * - Optimización de rendimiento con lazy loading
 * 
 * 🔧 SERVICIOS (API):
 * - adminService: Cliente HTTP para operaciones administrativas
 * - Gestión de usuarios y moderación
 * - Estadísticas y analytics del sistema
 * - Logs del sistema y auditoría
 * - Configuración global del sistema
 * - Reportes y exportación de datos
 * 
 * 🧩 COMPONENTES (UI):
 * - AdminDashboard: Panel principal de administración
 * - UserManagement: Gestión de usuarios
 * - ModerationPanel: Panel de moderación
 * - AnalyticsCharts: Gráficos y estadísticas
 * - SystemLogs: Visualización de logs
 * - AdminSettings: Configuración del sistema
 * 
 * 📄 VISTAS (Páginas):
 * - Dashboard administrativo principal
 * - Gestión de usuarios y roles
 * - Panel de moderación de contenido
 * - Analytics y reportes
 * - Logs del sistema
 * - Configuración global
 * 
 * 🎯 COMPOSABLES (Lógica Reutilizable):
 * - useAdmin: Gestión general administrativa
 * - useModeration: Moderación de contenido
 * - useAdminUsers: Gestión de usuarios
 * - useSystemLogs: Manejo de logs del sistema
 * - useAdminAnalytics: Analytics y estadísticas
 * 
 * 🛠️ UTILIDADES (Helpers):
 * - Constantes de roles y estados
 * - Formateo de datos y números
 * - Validación de permisos
 * - Procesamiento de estadísticas
 * - Exportación de datos
 * - Cálculos de métricas
 * 
 * 📊 TIPOS (TypeScript):
 * - AdminStats: Estadísticas administrativas
 * - AdminAnalytics: Datos de analytics
 * - ModerationItem: Elemento de moderación
 * - AdminUser: Usuario con datos administrativos
 * - SystemLog: Log del sistema
 * - AdminResponse: Respuestas de la API admin
 * 
 * FUNCIONALIDADES PRINCIPALES:
 * ============================
 * 
 * 👥 GESTIÓN DE USUARIOS:
 * - Visualización completa de usuarios registrados
 * - Edición de perfiles y roles de usuario
 * - Suspensión y activación de cuentas
 * - Gestión de permisos granulares
 * - Historial de actividad de usuarios
 * - Búsqueda avanzada y filtros
 * 
 * 🛡️ MODERACIÓN DE CONTENIDO:
 * - Cola de moderación de artículos
 * - Revisión de reportes de usuarios
 * - Aprobación/rechazo de contenido
 * - Gestión de contenido inapropiado
 * - Sistema de alertas automáticas
 * - Herramientas de moderación masiva
 * 
 * 📊 ANALYTICS Y ESTADÍSTICAS:
 * - Dashboard con métricas clave del sistema
 * - Gráficos de crecimiento de usuarios
 * - Estadísticas de uso y actividad
 * - Análisis de comportamiento
 * - Reportes personalizables
 * - Exportación de datos en múltiples formatos
 * 
 * 🔍 LOGS Y AUDITORÍA:
 * - Visualización de logs del sistema
 * - Filtrado por nivel de severidad
 * - Búsqueda en logs por fecha y contenido
 * - Alertas de errores críticos
 * - Trazabilidad de acciones administrativas
 * - Exportación de logs para análisis
 * 
 * ⚙️ CONFIGURACIÓN DEL SISTEMA:
 * - Configuración global de la aplicación
 * - Gestión de parámetros del sistema
 * - Configuración de notificaciones
 * - Ajustes de seguridad
 * - Configuración de APIs externas
 * - Mantenimiento del sistema
 * 
 * 🔐 ROLES Y PERMISOS:
 * - Sistema jerárquico de roles administrativos
 * - Permisos granulares por funcionalidad
 * - Validación de autorización en tiempo real
 * - Gestión de acceso a secciones
 * - Auditoría de cambios de permisos
 * 
 * 📈 REPORTES Y EXPORTACIÓN:
 * - Generación de reportes automáticos
 * - Exportación a CSV, Excel, PDF
 * - Reportes programados
 * - Dashboards personalizables
 * - Métricas de rendimiento
 * 
 * CONSTANTES Y CONFIGURACIÓN:
 * ===========================
 * 
 * 🏷️ **ROLES ADMINISTRATIVOS**:
 * - SUPER_ADMIN: Acceso completo al sistema
 * - ADMIN: Gestión general sin configuración crítica
 * - MODERATOR: Moderación de contenido únicamente
 * - SUPPORT: Soporte a usuarios
 * 
 * 📋 **ESTADOS DE MODERACIÓN**:
 * - PENDING: Pendiente de revisión
 * - APPROVED: Aprobado
 * - REJECTED: Rechazado
 * - FLAGGED: Marcado para revisión
 * 
 * 📊 **NIVELES DE LOG**:
 * - ERROR: Errores críticos
 * - WARN: Advertencias
 * - INFO: Información general
 * - DEBUG: Información de depuración
 * 
 * VENTAJAS DE LA ARQUITECTURA:
 * ============================
 * 
 * ✅ **Importaciones Limpias**: 
 *    `import { useAdminStore, adminService } from '@/features/admin'`
 * 
 * ✅ **Gestión Completa**: 
 *    Todas las herramientas administrativas centralizadas
 * 
 * ✅ **Seguridad Robusta**: 
 *    Validación de permisos en múltiples capas
 * 
 * ✅ **Analytics Avanzados**: 
 *    Métricas detalladas y reportes personalizables
 * 
 * ✅ **Moderación Eficiente**: 
 *    Herramientas potentes para gestión de contenido
 * 
 * ✅ **Tipado Fuerte**: 
 *    TypeScript para mayor seguridad
 * 
 * ✅ **Escalabilidad**: 
 *    Preparado para crecimiento del sistema
 * 
 * ✅ **Utilidades Extensas**: 
 *    Helpers para todas las operaciones administrativas
 * 
 * @example
 * ```typescript
 * // Uso básico del módulo de administración
 * import { 
 *   useAdminStore, 
 *   adminService,
 *   useModeration,
 *   ADMIN_ROLES,
 *   formatNumber,
 *   type AdminStats 
 * } from '@/features/admin'
 * 
 * // En un componente Vue
 * const adminStore = useAdminStore()
 * const { moderationQueue, approveItem } = useModeration()
 * 
 * // Obtener estadísticas del sistema
 * const stats: AdminStats = await adminService.getSystemStats()
 * 
 * // Moderar un artículo
 * await approveItem('item-123', {
 *   reason: 'Contenido apropiado',
 *   moderatorId: 'admin-456'
 * })
 * 
 * // Verificar permisos
 * if (adminStore.hasRole(ADMIN_ROLES.MODERATOR)) {
 *   // Mostrar herramientas de moderación
 * }
 * 
 * // Formatear números para mostrar
 * const formattedUsers = formatNumber(stats.totalUsers)
 * ```
 */

// Components
export * from './components'

// Views
export * from './views'

// Services
export { adminService } from './services/adminService'
export type {
  AdminStats,
  AdminAnalytics,
  ModerationItem,
  AdminUser,
  SystemLog,
  AdminResponse
} from './services/adminService'

// Store
export { useAdminStore } from './stores/adminStore'
export type {
  AdminFilters,
  AdminPagination,
  AdminCache,
  AdminState
} from './stores/adminStore'

// Composables
export {
  useAdmin,
  useModeration,
  useAdminUsers,
  useSystemLogs,
  useAdminAnalytics
} from './composables/useAdmin'

// Utilities
export {
  // Constants
  ADMIN_ROLES,
  MODERATION_STATUSES,
  LOG_LEVELS,
  ITEM_CATEGORIES,
  
  // Role utilities
  getRoleLabel,
  getRoleColor,
  getRoleIcon,
  canManageRole,
  getAvailableRoles,
  
  // Status utilities
  getStatusLabel,
  getStatusColor,
  getStatusIcon,
  
  // Log level utilities
  getLogLevelLabel,
  getLogLevelColor,
  getLogLevelIcon,
  
  // Category utilities
  getCategoryLabel,
  getCategoryIcon,
  
  // Formatting utilities
  formatNumber,
  formatPercentage,
  formatCurrency,
  formatDate,
  formatRelativeTime,
  
  // Validation utilities
  isValidEmail,
  isValidRole,
  isValidStatus,
  isValidLogLevel,
  isValidCategory,
  
  // Data processing utilities
  calculateGrowthRate,
  calculatePercentage,
  groupByPeriod,
  sortByDate,
  filterByDateRange,
  
  // Statistics utilities
  calculateStats,
  generateChartData,
  
  // Search and filter utilities
  searchItems,
  filterItems,
  
  // Export utilities
  exportToCSV,
  
  // Specific admin utilities
  getModerationItemPriority,
  getUserRiskScore,
  getSystemHealthScore
} from './utils/adminUtils'

export type {
  AdminRole,
  ModerationStatus,
  LogLevel,
  ItemCategory
} from './utils/adminUtils'