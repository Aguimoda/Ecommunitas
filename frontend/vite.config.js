/**
 * @file vite.config.js
 * @description Configuración de Vite para el desarrollo y construcción del frontend
 * @module ViteConfig
 * @version 1.0.0
 * @author Ecommunitas Team
 * @created 2024
 * 
 * Este archivo configura Vite, el bundler y servidor de desarrollo para la aplicación.
 * Incluye configuraciones para:
 * 
 * CARACTERÍSTICAS PRINCIPALES:
 * - Plugin de Vue 3 para soporte completo del framework
 * - Alias de rutas para importaciones más limpias
 * - Servidor de desarrollo con hot reload
 * - Proxy para comunicación con el backend durante desarrollo
 * - Configuración de puertos y CORS
 * 
 * ARQUITECTURA DE DESARROLLO:
 * - Frontend: Puerto 5173 (Vite dev server)
 * - Backend: Puerto 3000 (Express server)
 * - Proxy: Redirige /api/* al backend automáticamente
 * 
 * BENEFICIOS:
 * - Hot Module Replacement (HMR) para desarrollo rápido
 * - Bundling optimizado para producción
 * - Soporte nativo para TypeScript y Vue SFC
 * - Importaciones de alias para mejor organización del código
 */

// ============================================================================
// IMPORTACIONES DE DEPENDENCIAS
// ============================================================================

/**
 * Importación de la función de configuración de Vite
 * defineConfig proporciona tipado y autocompletado para la configuración
 */
import { defineConfig } from 'vite'

/**
 * Plugin oficial de Vue para Vite
 * Proporciona soporte completo para:
 * - Single File Components (.vue)
 * - Composition API
 * - Script setup
 * - CSS scoped
 * - Hot Module Replacement
 */
import vue from '@vitejs/plugin-vue'

/**
 * Módulo path de Node.js para manejo de rutas del sistema de archivos
 * Necesario para configurar alias de importación
 */
import path from 'path'

// ============================================================================
// CONFIGURACIÓN PRINCIPAL
// ============================================================================

/**
 * Configuración principal de Vite
 * 
 * Esta configuración se aplica tanto en desarrollo como en producción,
 * con optimizaciones automáticas según el entorno.
 */
export default defineConfig({
  // ==========================================================================
  // PLUGINS
  // ==========================================================================
  
  /**
   * Array de plugins de Vite
   * 
   * PLUGINS INCLUIDOS:
   * - @vitejs/plugin-vue: Soporte completo para Vue 3
   *   - Compila archivos .vue
   *   - Maneja CSS scoped
   *   - Proporciona HMR para componentes Vue
   *   - Soporte para <script setup>
   */
  plugins: [vue()],
  
  // ==========================================================================
  // RESOLUCIÓN DE MÓDULOS
  // ==========================================================================
  
  /**
   * Configuración de resolución de módulos
   * Define cómo Vite resuelve las importaciones
   */
  resolve: {
    /**
     * Alias de rutas para importaciones más limpias
     * 
     * ALIAS CONFIGURADOS:
     * - '@': Apunta a './src' (directorio raíz del código fuente)
     * 
     * BENEFICIOS:
     * - Importaciones más cortas y legibles
     * - Independiente de la ubicación del archivo
     * - Fácil refactoring y reorganización
     * 
     * @example
     * // En lugar de:
     * import Component from '../../../shared/components/Component.vue'
     * 
     * // Puedes usar:
     * import Component from '@/shared/components/Component.vue'
     */
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  
  // ==========================================================================
  // CONFIGURACIÓN DEL SERVIDOR DE DESARROLLO
  // ==========================================================================
  
  /**
   * Configuración del servidor de desarrollo de Vite
   * Solo se aplica durante el desarrollo (npm run dev)
   */
  server: {
    /**
     * Puerto del servidor de desarrollo
     * 
     * CONFIGURACIÓN:
     * - Puerto: 5173 (puerto por defecto de Vite)
     * - Accesible en: http://localhost:5173
     * 
     * NOTAS:
     * - Si el puerto está ocupado, Vite automáticamente usa el siguiente disponible
     * - Se puede sobrescribir con la variable de entorno PORT
     */
    port: 5173,
    
    /**
     * Configuración de proxy para desarrollo
     * 
     * PROPÓSITO:
     * - Redirigir peticiones de la API al servidor backend
     * - Evitar problemas de CORS durante desarrollo
     * - Simular el comportamiento de producción
     * 
     * CONFIGURACIÓN ACTUAL:
     * - Todas las rutas que empiecen con '/api' se redirigen al backend
     * - Backend ejecutándose en http://localhost:3000
     */
    proxy: {
      /**
       * Proxy para rutas de API
       * 
       * CONFIGURACIÓN:
       * - Patrón: '/api' - Captura todas las rutas que empiecen con /api
       * - Target: 'http://localhost:3000' - Servidor backend
       * - changeOrigin: true - Cambia el header Origin para evitar problemas de CORS
       * - secure: false - Permite conexiones HTTP no seguras (desarrollo)
       * - rewrite: (path) => path - Mantiene la ruta original sin modificaciones
       * 
       * FLUJO DE FUNCIONAMIENTO:
       * 1. Frontend hace petición a: http://localhost:5173/api/users
       * 2. Vite intercepta la petición
       * 3. Redirige a: http://localhost:3000/api/users
       * 4. Retorna la respuesta al frontend
       * 
       * @example
       * // En el frontend:
       * axios.get('/api/users') // Se redirige automáticamente al backend
       */
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
      }
    }
  }
  
  /**
   * NOTAS DE DESARROLLO:
   * 
   * 1. DESARROLLO VS PRODUCCIÓN:
   *    - Esta configuración es principalmente para desarrollo
   *    - En producción, el frontend se sirve como archivos estáticos
   *    - El proxy solo funciona en desarrollo
   * 
   * 2. HOT MODULE REPLACEMENT (HMR):
   *    - Vite proporciona HMR automático para archivos Vue
   *    - Los cambios se reflejan instantáneamente sin recargar la página
   *    - Preserva el estado de la aplicación durante el desarrollo
   * 
   * 3. OPTIMIZACIONES AUTOMÁTICAS:
   *    - Vite optimiza automáticamente las dependencias
   *    - Pre-bundling de dependencias de node_modules
   *    - Tree-shaking automático en producción
   * 
   * 4. CONFIGURACIONES ADICIONALES POSIBLES:
   *    - build: Configuración para construcción de producción
   *    - css: Configuración de preprocesadores CSS
   *    - define: Variables globales
   *    - optimizeDeps: Optimización de dependencias
   * 
   * 5. VARIABLES DE ENTORNO:
   *    - Vite carga automáticamente archivos .env
   *    - Variables con prefijo VITE_ están disponibles en el cliente
   *    - Ejemplo: VITE_API_URL se puede usar en el código frontend
   */
})