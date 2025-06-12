<!--
/**
 * @file LocationPicker.vue
 * @description Componente interactivo para selección de ubicaciones geográficas
 * 
 * Este componente proporciona una interfaz completa para que los usuarios puedan:
 * - Buscar ubicaciones por texto usando la API de Nominatim
 * - Obtener su ubicación actual usando geolocalización del navegador
 * - Seleccionar ubicaciones haciendo clic en un mapa interactivo
 * - Visualizar la ubicación seleccionada con un marcador
 * 
 * Características principales:
 * - Integración con Leaflet para mapas interactivos
 * - Búsqueda de ubicaciones en tiempo real
 * - Geolocalización automática
 * - Interfaz responsive y accesible
 * - Manejo de errores y estados de carga
 * 
 * Dependencias:
 * - Vue 3 Composition API
 * - Leaflet para mapas
 * - Vue2Leaflet para integración con Vue
 * - API de Nominatim para geocodificación
 * - Geolocation API del navegador
 * 
 * @author Sistema Ecommunitas
 * @version 1.0.0
 * @since 2024
 */
-->
<template>
  <div class="location-picker">
    <!-- Search Section -->
    <div class="search-section">
      <div class="search-container">
        <input
          v-model="searchQuery"
          @input="onSearchInput"
          @keydown.enter.prevent="searchLocation"
          type="text"
          placeholder="Buscar ubicación... / Search location..."
          class="search-input"
        />
        <button
          @click="getCurrentLocation"
          :disabled="isGettingLocation"
          class="my-location-btn"
          :class="{ 'my-location-btn--loading': isGettingLocation }"
        >
          <span v-if="!isGettingLocation">📍</span>
          <span v-else class="spinner">⟳</span>
          {{ isGettingLocation ? 'Obteniendo...' : 'Mi ubicación' }}
        </button>
      </div>
    </div>

    <!-- Search Results -->
    <div v-if="searchResults.length > 0" class="search-results">
      <div
        v-for="(result, index) in searchResults"
        :key="index"
        @click="selectSearchResult(result)"
        class="search-result-item"
      >
        <div class="result-name">{{ result.label }}</div>
        <div class="result-details">{{ result.raw.display_name }}</div>
      </div>
    </div>

    <!-- Map Container -->
    <div class="map-container">
      <l-map
        ref="map"
        :zoom="zoom"
        :center="center"
        @click="onMapClick"
        class="map"
      >
        <l-tile-layer
          :url="tileUrl"
          :attribution="attribution"
        />
        
        <!-- Selected Location Marker -->
        <l-marker
          v-if="selectedLocation"
          :lat-lng="selectedLocation"
          :draggable="true"
          @dragend="onMarkerDrag"
        >
          <l-popup>
            <div class="popup-content">
              <strong>Ubicación seleccionada</strong><br>
              Lat: {{ selectedLocation.lat.toFixed(6) }}<br>
              Lng: {{ selectedLocation.lng.toFixed(6) }}<br>
              <small>{{ selectedAddress || 'Arrastra el marcador para ajustar' }}</small>
            </div>
          </l-popup>
        </l-marker>
      </l-map>
    </div>

    <!-- Selected Location Display -->
    <div v-if="selectedLocation" class="selected-location">
      <h4>📍 Ubicación seleccionada:</h4>
      <p class="selected-address">{{ selectedAddress || 'Cargando dirección...' }}</p>
      <p class="selected-coordinates">{{ selectedLocation.lat.toFixed(6) }}, {{ selectedLocation.lng.toFixed(6) }}</p>
      
      <div class="action-buttons">
        <button @click="confirmLocation" class="confirm-btn">
          ✓ Confirmar ubicación
        </button>
        <button @click="clearLocation" class="clear-btn">
          ✗ Limpiar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
/* ============================================================================
 * IMPORTS Y DEPENDENCIAS
 * ============================================================================ */
import { ref, onMounted, watch } from 'vue'
import { LMap, LTileLayer, LMarker, LPopup } from '@vue-leaflet/vue-leaflet'
import { OpenStreetMapProvider } from 'leaflet-geosearch'
import 'leaflet/dist/leaflet.css'
import './LocationPicker.css'
import { displayError } from '@/shared/utils/errorHandler'

/* ============================================================================
 * PROPS Y CONFIGURACIÓN DEL COMPONENTE
 * ============================================================================ */

/**
 * Props del componente LocationPicker
 * @typedef {Object} LocationPickerProps
 * @property {Object|null} initialLocation - Ubicación inicial para mostrar en el mapa
 * @property {string} initialAddress - Dirección inicial para mostrar
 */
const props = defineProps({
  /**
   * Ubicación inicial para mostrar en el mapa
   * @type {Object|null}
   * @default null
   * @example { lat: 40.4168, lng: -3.7038 }
   */
  initialLocation: {
    type: Object,
    default: null
  },
  /**
   * Dirección inicial para mostrar en el componente
   * @type {string}
   * @default ''
   */
  initialAddress: {
    type: String,
    default: ''
  }
})

/**
 * Eventos emitidos por el componente
 * @typedef {Object} LocationPickerEmits
 * @property {Function} location-selected - Se emite cuando se selecciona una ubicación
 * @property {Function} location-cleared - Se emite cuando se limpia la ubicación
 */
const emit = defineEmits([
  /**
   * Evento emitido cuando el usuario selecciona una ubicación
   * @param {Object} location - Objeto con lat, lng y address
   */
  'location-selected',
  /**
   * Evento emitido cuando el usuario limpia la ubicación seleccionada
   */
  'location-cleared'
])

/* ============================================================================
 * ESTADO REACTIVO DEL COMPONENTE
 * ============================================================================ */

// Variables para búsqueda de ubicaciones
/** @type {Ref<string>} Query de búsqueda introducido por el usuario */
const searchQuery = ref('')
/** @type {Ref<Array>} Resultados de la búsqueda de ubicaciones */
const searchResults = ref([])
/** @type {Ref<boolean>} Indica si se está obteniendo la ubicación actual */
const isGettingLocation = ref(false)

// Variables para ubicación seleccionada
/** @type {Ref<Object|null>} Ubicación actualmente seleccionada */
const selectedLocation = ref(props.initialLocation)
/** @type {Ref<string>} Dirección de la ubicación seleccionada */
const selectedAddress = ref(props.initialAddress)

// Variables para configuración del mapa
/** @type {Ref<number>} Nivel de zoom del mapa */
const zoom = ref(13)
/** @type {Ref<Array>} Centro del mapa [lat, lng] - Madrid por defecto */
const center = ref([40.4168, -3.7038])

/* ============================================================================
 * CONFIGURACIÓN DEL MAPA Y SERVICIOS
 * ============================================================================ */

/** URL del servidor de tiles de OpenStreetMap */
const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
/** Atribución requerida para OpenStreetMap */
const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

/** Proveedor de geocodificación para búsqueda de ubicaciones */
const provider = new OpenStreetMapProvider()

/* ============================================================================
 * FUNCIONES DE BÚSQUEDA Y GEOLOCALIZACIÓN
 * ============================================================================ */

/** Timeout para debounce de búsqueda */
let searchTimeout = null

/**
 * Maneja la entrada de texto en el campo de búsqueda
 * Implementa debounce para evitar búsquedas excesivas
 * @function onSearchInput
 */
const onSearchInput = () => {
  // Cancelar búsqueda anterior si existe
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  
  // Programar nueva búsqueda con delay de 300ms
  searchTimeout = setTimeout(() => {
    if (searchQuery.value.trim().length > 2) {
      searchLocation()
    } else {
      searchResults.value = []
    }
  }, 300)
}

/**
 * Busca ubicaciones usando la API de Nominatim
 * @async
 * @function searchLocation
 * @returns {Promise<void>}
 */
const searchLocation = async () => {
  if (!searchQuery.value.trim()) return
  
  try {
    // Realizar búsqueda usando el proveedor de OpenStreetMap
    const results = await provider.search({ query: searchQuery.value })
    // Limitar resultados a 5 para mejor UX
    searchResults.value = results.slice(0, 5)
  } catch (error) {
    console.error('Error searching location:', error)
    displayError('Error al buscar ubicación')
    searchResults.value = []
  }
}

/**
 * Selecciona un resultado de búsqueda y actualiza el mapa
 * @function selectSearchResult
 * @param {Object} result - Resultado de búsqueda seleccionado
 * @param {number} result.y - Latitud de la ubicación
 * @param {number} result.x - Longitud de la ubicación
 * @param {string} result.label - Etiqueta descriptiva de la ubicación
 */
const selectSearchResult = (result) => {
  // Establecer nueva ubicación seleccionada
  selectedLocation.value = {
    lat: result.y,
    lng: result.x
  }
  selectedAddress.value = result.label
  
  // Centrar mapa en la nueva ubicación
  center.value = [result.y, result.x]
  zoom.value = 15
  
  // Limpiar resultados y actualizar campo de búsqueda
  searchResults.value = []
  searchQuery.value = result.label
}

/* ============================================================================
 * FUNCIONES DE GEOLOCALIZACIÓN
 * ============================================================================ */

/**
 * Obtiene la ubicación actual del usuario usando la API de geolocalización
 * @function getCurrentLocation
 */
const getCurrentLocation = () => {
  // Verificar soporte de geolocalización
  if (!navigator.geolocation) {
    displayError('La geolocalización no está soportada en este navegador')
    return
  }

  isGettingLocation.value = true

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const lat = position.coords.latitude
      const lng = position.coords.longitude
      
      // Establecer ubicación obtenida
      selectedLocation.value = { lat, lng }
      center.value = [lat, lng]
      zoom.value = 15
      
      // Geocodificación inversa para obtener dirección
      try {
        const results = await provider.search({ query: `${lat},${lng}` })
        if (results.length > 0) {
          selectedAddress.value = results[0].label
          searchQuery.value = results[0].label
        }
      } catch (error) {
        console.error('Error in reverse geocoding:', error)
        // Mostrar coordenadas si no se puede obtener dirección
        selectedAddress.value = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
      }
      
      isGettingLocation.value = false
    },
    /**
     * Maneja errores de geolocalización
     * @param {GeolocationPositionError} error - Error de geolocalización
     */
    (error) => {
      console.error('Error getting location:', error)
      let message = 'Error obteniendo la ubicación'
      
      // Personalizar mensaje según tipo de error
      switch (error.code) {
        case error.PERMISSION_DENIED:
          message = 'Permisos de ubicación denegados'
          break
        case error.POSITION_UNAVAILABLE:
          message = 'Ubicación no disponible'
          break
        case error.TIMEOUT:
          message = 'Tiempo de espera agotado'
          break
      }
      
      displayError(message)
      isGettingLocation.value = false
    },
    {
      // Opciones de geolocalización
      enableHighAccuracy: true,  // Usar GPS si está disponible
      timeout: 10000,           // Timeout de 10 segundos
      maximumAge: 60000         // Cache de 1 minuto
    }
  )
}

/* ============================================================================
 * FUNCIONES DE INTERACCIÓN CON EL MAPA
 * ============================================================================ */

/**
 * Maneja clics en el mapa para seleccionar ubicaciones
 * @async
 * @function onMapClick
 * @param {Object} event - Evento de clic del mapa
 * @param {Object} event.latlng - Coordenadas del clic
 * @param {number} event.latlng.lat - Latitud
 * @param {number} event.latlng.lng - Longitud
 */
const onMapClick = async (event) => {
  const { lat, lng } = event.latlng
  
  // Establecer nueva ubicación seleccionada
  selectedLocation.value = { lat, lng }
  
  // Geocodificación inversa para obtener dirección
  try {
    const results = await provider.search({ query: `${lat},${lng}` })
    if (results.length > 0) {
      selectedAddress.value = results[0].label
    } else {
      // Mostrar coordenadas si no hay dirección disponible
      selectedAddress.value = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    }
  } catch (error) {
    console.error('Error in reverse geocoding:', error)
    selectedAddress.value = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
  }
}

/**
 * Maneja el arrastre del marcador en el mapa
 * @async
 * @function onMarkerDrag
 * @param {Object} event - Evento de arrastre del marcador
 * @param {Object} event.target - Marcador arrastrado
 */
const onMarkerDrag = async (event) => {
  const { lat, lng } = event.target.getLatLng()
  
  // Actualizar ubicación seleccionada
  selectedLocation.value = { lat, lng }
  
  // Geocodificación inversa para obtener dirección
  try {
    const results = await provider.search({ query: `${lat},${lng}` })
    if (results.length > 0) {
      selectedAddress.value = results[0].label
    } else {
      selectedAddress.value = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    }
  } catch (error) {
    console.error('Error in reverse geocoding:', error)
    selectedAddress.value = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
  }
}

/* ============================================================================
 * FUNCIONES DE ACCIÓN
 * ============================================================================ */

/**
 * Confirma la ubicación seleccionada y emite el evento correspondiente
 * @function confirmLocation
 * @emits location-selected - Emite la ubicación y dirección seleccionadas
 */
const confirmLocation = () => {
  if (selectedLocation.value) {
    emit('location-selected', {
      location: selectedLocation.value,
      address: selectedAddress.value,
      latitude: selectedLocation.value.lat,
      longitude: selectedLocation.value.lng
    })
  }
}

/**
 * Limpia la ubicación seleccionada y resetea el estado
 * @function clearLocation
 * @emits location-cleared - Emite evento de limpieza de ubicación
 */
const clearLocation = () => {
  selectedLocation.value = null
  selectedAddress.value = ''
  searchQuery.value = ''
  searchResults.value = []
  emit('location-cleared')
}

/* ============================================================================
 * INICIALIZACIÓN Y CICLO DE VIDA
 * ============================================================================ */

/**
 * Inicializa el mapa con la ubicación inicial si se proporciona
 */
onMounted(() => {
  if (props.initialLocation) {
    center.value = [props.initialLocation.lat, props.initialLocation.lng]
    zoom.value = 15
  }
})

/* ============================================================================
 * WATCHERS - OBSERVADORES DE CAMBIOS
 * ============================================================================ */

/**
 * Observa cambios en la ubicación inicial
 * Actualiza el mapa cuando se proporciona una nueva ubicación inicial
 */
watch(() => props.initialLocation, (newLocation) => {
  if (newLocation) {
    selectedLocation.value = newLocation
    center.value = [newLocation.lat, newLocation.lng]
    zoom.value = 15
  }
})

/**
 * Observa cambios en la dirección inicial
 * Actualiza los campos de dirección cuando se proporciona una nueva dirección inicial
 */
watch(() => props.initialAddress, (newAddress) => {
  if (newAddress) {
    selectedAddress.value = newAddress
    searchQuery.value = newAddress
  }
})
</script>

<!-- 
  ESTILOS
  Los estilos para este componente se definen en un archivo CSS externo
  para mantener la separación de responsabilidades y facilitar el mantenimiento.
  
  STYLES
  Styles for this component are defined in an external CSS file
  to maintain separation of concerns and facilitate maintenance.
-->