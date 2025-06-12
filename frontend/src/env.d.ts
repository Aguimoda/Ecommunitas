/**
 * @fileoverview Declaraciones de tipos para el entorno de desarrollo
 * @description Archivo de declaraciones TypeScript que define tipos globales
 * para el entorno de desarrollo, incluyendo módulos Vue y variables de entorno.
 * 
 * @features
 * - Declaración de módulos Vue para TypeScript
 * - Soporte para importación de archivos .vue
 * - Tipado de componentes Vue
 * - Configuración de tipos para Vite
 * 
 * @technical
 * - TypeScript declaration file (.d.ts)
 * - Vue 3 component typing
 * - Vite environment support
 * - Module declaration for .vue files
 * 
 * @author Equipo Ecommunitas
 * @version 1.0.0
 * @since 2024
 */

/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}