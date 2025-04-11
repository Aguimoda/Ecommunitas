/**
 * @file useAuth.ts
 * @description Composable para la gestión centralizada de autenticación
 * Implementa un sistema de autenticación con JWT, reintentos inteligentes,
 * tracking de actividad y prevención de múltiples mounts.
 * 
 * Este composable mantiene la compatibilidad con la API existente mientras
 * utiliza el nuevo sistema de autenticación mejorado internamente.
 */

import { AuthOptions } from '../types/auth'
import { useAuthManager } from './useAuthManager'

/**
 * Composable para la gestión centralizada de autenticación
 * @param options Opciones de configuración para la autenticación
 * @returns Objeto con métodos y estado para manejar la autenticación
 */
export function useAuth(options: Partial<AuthOptions> = {}) {
  // Utilizar el nuevo sistema de autenticación internamente
  return useAuthManager(options)
}