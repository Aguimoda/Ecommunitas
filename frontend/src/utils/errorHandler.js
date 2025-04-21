export function displayError(error) {
  let message = 'Error desconocido';
  let errorCode = 'UNKNOWN';
  
  if (error.response) {
    // Error de API
    message = error.response.data?.message || error.response.statusText;
    errorCode = `API_${error.response.status}`;
    
    // Mensajes específicos para códigos comunes
    if (error.response.status === 400) {
      message = 'Datos inválidos: ' + (error.response.data?.errors?.join(', ') || message);
    } else if (error.response.status === 401) {
      message = 'No autorizado: ' + message;
    } else if (error.response.status === 404) {
      message = 'Recurso no encontrado';
    } else if (error.response.status >= 500) {
      message = 'Error del servidor: ' + message;
    }
  } else if (error.request) {
    // Error de conexión
    message = 'No se pudo conectar al servidor. Verifica tu conexión a internet.';
    errorCode = 'NETWORK_ERROR';
  } else {
    // Error local
    message = error.message;
    errorCode = 'CLIENT_ERROR';
  }

  console.error(`[${errorCode}] ${message}`, error);
  
  // TODO: Reemplazar con sistema de notificaciones UI
  alert(`[${errorCode}] ${message}`);
  
  return { message, code: errorCode };
}