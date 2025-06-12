import { AxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * @file axios.d.ts
 * @description Extensiones de tipos para Axios con funcionalidades personalizadas
 * @module Types/Axios
 * @version 1.0.0
 * @author Ecommunitas Team
 * @created 2024
 * 
 * Este archivo extiende las interfaces de Axios para incluir:
 * - Configuraciones personalizadas para interceptores
 * - Propiedades para manejo de caché
 * - Flags para control de deduplicación
 * - Opciones para manejo de errores personalizado
 */

/**
 * Extensiones para las interfaces de Axios
 * Añade propiedades personalizadas para funcionalidades específicas de la aplicación
 */
declare module 'axios' {
  /**
   * Extensión de AxiosRequestConfig con opciones personalizadas
   */
  export interface AxiosRequestConfig {
    /** Omitir el refresh automático del token de autenticación */
    skipAuthRefresh?: boolean;
    /** Omitir la deduplicación de peticiones idénticas */
    skipDeduplication?: boolean;
    /** Omitir el manejo automático de errores */
    skipErrorHandler?: boolean;
  }

  /**
   * Extensión de AxiosResponse con metadatos de caché
   */
  export interface AxiosResponse {
    /** Indica si la respuesta proviene del caché */
    __CACHED__?: boolean;
  }

  /**
   * Extensión de AxiosError con información de deduplicación
   */
  export interface AxiosError {
    /** Indica si el error fue deduplicado */
    __DEDUPLICATED__?: boolean;
    /** Promesa de la petición pendiente para deduplicación */
    pendingRequest?: Promise<any>;
  }
}