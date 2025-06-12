/**
 * @fileoverview Configuración de Vitest para testing del frontend de Ecommunitas
 * 
 * Este archivo configura Vitest, el framework de testing rápido y moderno
 * para aplicaciones Vue 3. Proporciona un entorno de testing optimizado
 * con soporte completo para Vue Single File Components.
 * 
 * @description Características principales:
 * - **Testing Framework**: Vitest (compatible con Jest API)
 * - **Entorno DOM**: jsdom para simular el navegador
 * - **Soporte Vue**: Plugin oficial para componentes .vue
 * - **Globals**: APIs de testing disponibles globalmente
 * - **Alias**: Resolución de rutas con @ para imports limpios
 * 
 * @architecture
 * ```
 * vitest.config.js
 * ├── Plugins
 * │   └── @vitejs/plugin-vue (soporte SFC)
 * ├── Configuración de Test
 * │   ├── globals: true (describe, it, expect globales)
 * │   └── environment: 'jsdom' (DOM simulation)
 * └── Resolución de Rutas
 *     └── alias: '@' -> './src'
 * ```
 * 
 * @features
 * - Hot Module Replacement para tests
 * - Ejecución paralela de tests
 * - Coverage reports integrados
 * - Watch mode inteligente
 * - Compatibilidad con TypeScript
 * - Mocking avanzado
 * 
 * @usage
 * ```bash
 * # Ejecutar tests en modo watch
 * npm run test
 * 
 * # Ejecutar tests una vez
 * npm run test:run
 * 
 * # Ejecutar con interfaz UI
 * npm run test:ui
 * ```
 * 
 * @example
 * ```javascript
 * // Ejemplo de test con esta configuración
 * import { mount } from '@vue/test-utils'
 * import MyComponent from '@/components/MyComponent.vue'
 * 
 * describe('MyComponent', () => {
 *   it('renders correctly', () => {
 *     const wrapper = mount(MyComponent)
 *     expect(wrapper.text()).toContain('Hello')
 *   })
 * })
 * ```
 * 
 * @author Equipo Ecommunitas
 * @version 1.0.0
 * @since 2024
 */

import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  // Plugins necesarios para el entorno de testing
  plugins: [vue()], // Soporte para Vue Single File Components
  
  // Configuración específica de testing
  test: {
    globals: true,        // Hace disponibles describe, it, expect sin imports
    environment: 'jsdom'  // Simula el DOM del navegador para tests de componentes
  },
  
  // Resolución de rutas - debe coincidir con vite.config.js
  resolve: {
    alias: {
      '@': resolve(__dirname, './src') // Permite imports como '@/components/...'
    }
  }
})