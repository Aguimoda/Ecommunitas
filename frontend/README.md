# Ecommunitas Frontend

## 📋 Descripción

Frontend de la plataforma Ecommunitas, una aplicación web moderna para facilitar el trueque local y promover la economía circular. Construida con Vue 3, Vite, Pinia y Tailwind CSS.

## 🚀 Tecnologías Principales

### Framework y Herramientas de Desarrollo
- **Vue 3** (^3.3.4) - Framework progresivo de JavaScript para interfaces de usuario
- **Vite** (^4.4.9) - Herramienta de construcción rápida y servidor de desarrollo
- **TypeScript** (^5.0.2) - Superset tipado de JavaScript
- **Pinia** (^2.1.6) - Store oficial para Vue 3 (gestión de estado)
- **Vue Router** (^4.2.4) - Router oficial para Vue.js

### Estilos y UI
- **Tailwind CSS** (^3.3.3) - Framework de CSS utilitario
- **PostCSS** (^8.4.29) - Herramienta para transformar CSS
- **Autoprefixer** (^10.4.15) - Plugin de PostCSS para agregar prefijos de navegador

### Comunicación y Datos
- **Axios** (^1.5.0) - Cliente HTTP para realizar peticiones al backend
- **JWT Decode** (^4.0.0) - Decodificador de tokens JWT para autenticación
- **Zod** (^3.25.36) - Validación de esquemas TypeScript-first

### Mapas y Geolocalización
- **Leaflet** (^1.9.4) - Biblioteca de mapas interactivos
- **@vue-leaflet/vue-leaflet** (^0.10.1) - Componentes Vue para Leaflet
- **leaflet-geosearch** (^4.2.0) - Plugin de búsqueda geográfica para Leaflet

### Seguridad y Utilidades
- **DOMPurify** (^3.2.6) - Sanitizador de HTML para prevenir XSS
- **Vue Toastification** (^2.0.0-rc.5) - Notificaciones toast para Vue 3

### Testing
- **Vitest** (^3.2.2) - Framework de testing rápido para Vite
- **@vitest/ui** (^3.2.2) - Interfaz web para Vitest
- **jsdom** (^26.1.0) - Implementación de DOM para testing

## 📁 Estructura del Proyecto

```
frontend/
├── src/
│   ├── assets/          # Recursos estáticos (imágenes, iconos)
│   ├── config/          # Configuraciones de la aplicación
│   ├── features/        # Módulos de funcionalidades
│   │   ├── admin/       # Funcionalidades de administración
│   │   ├── auth/        # Autenticación y autorización
│   │   ├── items/       # Gestión de artículos
│   │   ├── messages/    # Sistema de mensajería
│   │   └── users/       # Gestión de usuarios
│   ├── router/          # Configuración de rutas
│   ├── shared/          # Componentes y utilidades compartidas
│   │   ├── components/  # Componentes reutilizables
│   │   ├── composables/ # Composables de Vue
│   │   ├── constants/   # Constantes de la aplicación
│   │   ├── utils/       # Funciones utilitarias
│   │   └── views/       # Vistas compartidas
│   ├── tests/           # Archivos de pruebas
│   ├── types/           # Definiciones de tipos TypeScript
│   ├── utils/           # Utilidades generales
│   ├── App.vue          # Componente raíz
│   └── main.js          # Punto de entrada de la aplicación
├── public/              # Archivos públicos estáticos
├── package.json         # Dependencias y scripts
├── vite.config.js       # Configuración de Vite
├── tailwind.config.js   # Configuración de Tailwind CSS
└── README.md           # Este archivo
```

## 🛠️ Scripts Disponibles

### Desarrollo
```bash
npm run dev
```
Inicia el servidor de desarrollo con hot-reload en `http://localhost:5173`

### Construcción
```bash
npm run build
```
Construye la aplicación para producción en la carpeta `dist/`

### Vista Previa
```bash
npm run preview
```
Previsualiza la construcción de producción localmente

### Testing
```bash
npm run test        # Ejecuta tests en modo watch
npm run test:run    # Ejecuta tests una vez
npm run test:ui     # Abre la interfaz web de Vitest
```

## 🔧 Configuración

### Variables de Entorno
Crea un archivo `.env.local` en la raíz del proyecto:

```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=Ecommunitas
VITE_APP_VERSION=1.0.0
```

### Requisitos del Sistema
- **Node.js**: >= 16.0.0
- **npm**: >= 8.0.0

### Navegadores Soportados
- Navegadores modernos con > 1% de uso
- Últimas 2 versiones de cada navegador
- Excluye navegadores obsoletos

## 🏗️ Arquitectura

### Gestión de Estado (Pinia)
- **authStore**: Manejo de autenticación y autorización
- **itemsStore**: Gestión de artículos y búsquedas
- **messagesStore**: Sistema de mensajería
- **usersStore**: Gestión de perfiles de usuario

### Routing (Vue Router)
- Rutas protegidas con guards de autenticación
- Lazy loading de componentes
- Metadata para control de acceso

### Comunicación con API
- Interceptores de Axios para manejo de tokens
- Manejo centralizado de errores
- Transformación automática de respuestas

## 🔒 Seguridad

- **Sanitización HTML**: DOMPurify previene ataques XSS
- **Validación de datos**: Zod valida esquemas de entrada
- **Autenticación JWT**: Tokens seguros para autenticación
- **Rutas protegidas**: Control de acceso basado en roles

## 🌍 Funcionalidades Principales

1. **Autenticación y Autorización**
   - Registro e inicio de sesión
   - Recuperación de contraseña
   - Roles de usuario (usuario, admin)

2. **Gestión de Artículos**
   - Publicación de artículos para trueque
   - Búsqueda y filtrado avanzado
   - Categorización y etiquetado
   - Geolocalización de artículos

3. **Sistema de Mensajería**
   - Chat en tiempo real entre usuarios
   - Notificaciones de mensajes
   - Historial de conversaciones

4. **Mapas Interactivos**
   - Visualización de artículos en mapa
   - Búsqueda geográfica
   - Filtros por distancia

5. **Panel de Administración**
   - Gestión de usuarios
   - Moderación de contenido
   - Estadísticas de la plataforma

## 📱 Responsive Design

La aplicación está optimizada para:
- 📱 Dispositivos móviles (320px+)
- 📱 Tablets (768px+)
- 💻 Escritorio (1024px+)
- 🖥️ Pantallas grandes (1440px+)

## 🚀 Optimizaciones

- **Code Splitting**: Carga lazy de rutas y componentes
- **Tree Shaking**: Eliminación de código no utilizado
- **Minificación**: Compresión de assets para producción
- **Caching**: Estrategias de cache para mejor rendimiento
- **PWA Ready**: Preparado para Progressive Web App

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👥 Equipo de Desarrollo

Equipo de Desarrollo Ecommunitas

---

**Ecommunitas** - Promoviendo la economía circular a través del trueque local 🌱