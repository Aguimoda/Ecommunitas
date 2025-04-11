import { AxiosRequestConfig, AxiosResponse } from 'axios';

// Extender las interfaces de Axios para incluir propiedades personalizadas
declare module 'axios' {
  export interface AxiosRequestConfig {
    skipAuthRefresh?: boolean;
    skipDeduplication?: boolean;
    skipErrorHandler?: boolean;
  }

  export interface AxiosResponse {
    __CACHED__?: boolean;
  }

  export interface AxiosError {
    __DEDUPLICATED__?: boolean;
    pendingRequest?: Promise<any>;
  }
}