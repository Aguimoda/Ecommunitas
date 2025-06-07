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
import { ref, onMounted, watch } from 'vue'
import { LMap, LTileLayer, LMarker, LPopup } from '@vue-leaflet/vue-leaflet'
import { OpenStreetMapProvider } from 'leaflet-geosearch'
import 'leaflet/dist/leaflet.css'
import './LocationPicker.css'
import { displayError } from '@/shared/utils/errorHandler'

// Props
const props = defineProps({
  initialLocation: {
    type: Object,
    default: null
  },
  initialAddress: {
    type: String,
    default: ''
  }
})

// Emits
const emit = defineEmits(['location-selected', 'location-cleared'])

// Toast notifications
// const toast = useToast()

// Reactive data
const searchQuery = ref('')
const searchResults = ref([])
const isGettingLocation = ref(false)
const selectedLocation = ref(props.initialLocation)
const selectedAddress = ref(props.initialAddress)
const zoom = ref(13)
const center = ref([40.4168, -3.7038]) // Madrid por defecto

// Map configuration
const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

// Geosearch provider
const provider = new OpenStreetMapProvider()

// Search functionality
let searchTimeout = null

const onSearchInput = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  
  searchTimeout = setTimeout(() => {
    if (searchQuery.value.trim().length > 2) {
      searchLocation()
    } else {
      searchResults.value = []
    }
  }, 300)
}

const searchLocation = async () => {
  if (!searchQuery.value.trim()) return
  
  try {
    const results = await provider.search({ query: searchQuery.value })
    searchResults.value = results.slice(0, 5) // Limitar a 5 resultados
  } catch (error) {
    console.error('Error searching location:', error)
    searchResults.value = []
  }
}

const selectSearchResult = (result) => {
  selectedLocation.value = {
    lat: result.y,
    lng: result.x
  }
  selectedAddress.value = result.label
  center.value = [result.y, result.x]
  zoom.value = 15
  searchResults.value = []
  searchQuery.value = result.label
}

// Geolocation functionality
const getCurrentLocation = () => {
  if (!navigator.geolocation) {
    alert.log('La geolocalización no está soportada en este navegador')
    return
  }

  isGettingLocation.value = true

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const lat = position.coords.latitude
      const lng = position.coords.longitude
      
      selectedLocation.value = { lat, lng }
      center.value = [lat, lng]
      zoom.value = 15
      
      // Reverse geocoding
      try {
        const results = await provider.search({ query: `${lat},${lng}` })
        if (results.length > 0) {
          selectedAddress.value = results[0].label
          searchQuery.value = results[0].label
        }
      } catch (error) {
        console.error('Error in reverse geocoding:', error)
        selectedAddress.value = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
      }
      
      isGettingLocation.value = false
    },
    (error) => {
      console.error('Error getting location:', error)
      let message = 'Error obteniendo la ubicación'
      
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
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    }
  )
}

// Map click handler
const onMapClick = async (event) => {
  const { lat, lng } = event.latlng
  
  selectedLocation.value = { lat, lng }
  
  // Reverse geocoding
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

// Marker drag handler
const onMarkerDrag = async (event) => {
  const { lat, lng } = event.target.getLatLng()
  
  selectedLocation.value = { lat, lng }
  
  // Reverse geocoding
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

// Action handlers
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

const clearLocation = () => {
  selectedLocation.value = null
  selectedAddress.value = ''
  searchQuery.value = ''
  searchResults.value = []
  emit('location-cleared')
}

// Initialize map
onMounted(() => {
  if (props.initialLocation) {
    center.value = [props.initialLocation.lat, props.initialLocation.lng]
    zoom.value = 15
  }
})

// Watch for prop changes
watch(() => props.initialLocation, (newLocation) => {
  if (newLocation) {
    selectedLocation.value = newLocation
    center.value = [newLocation.lat, newLocation.lng]
    zoom.value = 15
  }
})

watch(() => props.initialAddress, (newAddress) => {
  if (newAddress) {
    selectedAddress.value = newAddress
    searchQuery.value = newAddress
  }
})
</script>

<!-- Styles are imported from external CSS file -->
<!-- Los estilos se importan desde el archivo CSS externo -->