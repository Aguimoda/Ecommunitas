import { ref } from 'vue';

/**
 * Composable para manejar la geolocalización del usuario
 * @returns {Object} - Objeto con las coordenadas, funciones y estado
 */
export function useGeolocation() {
  const coordinates = ref(null);
  const loading = ref(false);
  const error = ref(null);
  
  /**
   * Obtiene la ubicación actual del usuario
   * @returns {Promise} - Promesa con las coordenadas
   */
  const getLocation = () => {
    // Resetear estado
    loading.value = true;
    error.value = null;
    
    return new Promise((resolve, reject) => {
      // Verificar si la API de geolocalización está disponible
      if (!navigator.geolocation) {
        const geoError = new Error('La geolocalización no está soportada por este navegador.');
        error.value = geoError;
        loading.value = false;
        reject(geoError);
        return;
      }
      
      // Opciones para la geolocalización
      const options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      };
      
      // Solicitar la ubicación actual
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Éxito: guardar coordenadas
          coordinates.value = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          loading.value = false;
          resolve(coordinates.value);
        },
        (err) => {
          // Error: guardar mensaje de error
          const geoError = new Error(`Error al obtener la ubicación: ${err.message}`);
          error.value = geoError;
          loading.value = false;
          reject(geoError);
        },
        options
      );
    });
  };
  
  /**
   * Calcula la distancia entre dos puntos geográficos usando la fórmula de Haversine
   * @param {Object} point1 - Primer punto {lat, lng}
   * @param {Object} point2 - Segundo punto {lat, lng}
   * @returns {Number} - Distancia en kilómetros
   */
  const calculateDistance = (point1, point2) => {
    if (!point1 || !point2) return null;
    
    // Radio de la Tierra en kilómetros
    const R = 6371;
    
    // Convertir latitudes y longitudes de grados a radianes
    const lat1Rad = (point1.lat * Math.PI) / 180;
    const lat2Rad = (point2.lat * Math.PI) / 180;
    const lon1Rad = (point1.lng * Math.PI) / 180;
    const lon2Rad = (point2.lng * Math.PI) / 180;
    
    // Diferencias de latitud y longitud
    const dLat = lat2Rad - lat1Rad;
    const dLon = lon2Rad - lon1Rad;
    
    // Fórmula de Haversine
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1Rad) * Math.cos(lat2Rad) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distancia en kilómetros
    
    return distance;
  };
  
  return {
    coordinates,
    loading,
    error,
    getLocation,
    calculateDistance
  };
}