# 🌱 Ecommunitas - Plataforma de Trueque Local
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)](https://nodejs.org/)
[![Vue.js Version](https://img.shields.io/badge/vue-3.3.4-green)](https://vuejs.org/)

Plataforma comunitaria para el intercambio sostenible de bienes y servicios.

## 📌 Tabla de Contenidos
- [Descripción](#-descripción)
- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Estructura](#-estructura-del-proyecto)
- [Instalación](#-instalación)
- [Desarrollo](#-desarrollo)
- [Contribución](#-contribución)
- [Licencia](#-licencia)

## 🌟 Descripción

Ecommunitas es una plataforma web que fomenta la economía circular permitiendo a los usuarios:
- Publicar artículos que ya no utilizan
- Buscar y descubrir objetos disponibles para intercambio
- Conectarse con otros miembros de la comunidad
- Reducir el desperdicio y promover la sostenibilidad

## 🚀 Características Actuales

### 🔐 Autenticación
- Registro y login de usuarios

### 🛍️ Gestión de Artículos
- Publicación de artículos

## 🛠 Estado Actual

✅ **Implementado completamente**
- Autenticación de usuarios (registro/login)

🔄 **En desarrollo**
- CRUD de artículos

📅 **Planeado**
- Sistema de búsqueda avanzada
- Sistema de mensajería

## 💻 Tecnologías

### Frontend
- **Framework**: Vue.js 3 (Composition API)
- **Bundler**: Vite
- **Estilos**: Tailwind CSS
- **Estado**: Pinia
- **Routing**: Vue Router

### Backend
- **Runtime**: Node.js
- **Framework**: Express
- **Base de datos**: MongoDB (Mongoose)

## 🏗️ Estructura del Proyecto
```
ecommunitas/
├── backend/           # API REST
│   ├── controllers/  # Lógica de negocio
│   ├── models/       # Esquemas de MongoDB
│   ├── routes/       # Definición de endpoints
│   └── server.js     # Punto de entrada
├── frontend/         # Aplicación Vue
│   ├── public/       # Assets estáticos
│   ├── src/
│   │   ├── assets/   # Recursos
│   │   ├── components/
│   │   ├── composables/
│   │   ├── router/   # Configuración de rutas
│   │   ├── views/    # Componentes de página
│   │   └── main.js   # Punto de entrada
│   └── vite.config.js
└── package.json      # Configuración del monorepo
```

## Requisitos Previos

- Node.js (v14 o superior)
- MongoDB (local o remoto)
- npm o yarn

## Instalación

### Backend

1. Navega al directorio del backend:
   ```
   cd backend
   ```

2. Instala las dependencias:
   ```
   npm install
   ```

3. Crea un archivo `.env` basado en `.env.example`:
   ```
   cp .env.example .env
   ```

4. Configura las variables de entorno en el archivo `.env`

5. Inicia el servidor:
   ```
   npm start
   ```

### Frontend

1. Navega al directorio del frontend:
   ```
   cd frontend
   ```

2. Instala las dependencias:
   ```
   npm install
   ```

3. Inicia el servidor de desarrollo:
   ```
   npm run dev
   ```

## Características

- Registro y autenticación de usuarios
- Publicación de artículos con imágenes
- Búsqueda básica de artículos

## Tecnologías Utilizadas

- **Frontend**: Vue.js 3, Vite, Tailwind CSS
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Autenticación**: JWT (JSON Web Tokens)

## Contribución

Si deseas contribuir a este proyecto, por favor sigue estos pasos:

1. Haz un fork del repositorio
2. Crea una rama para tu característica (`git checkout -b feature/amazing-feature`)
3. Haz commit de tus cambios (`git commit -m 'Add some amazing feature'`)
4. Haz push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## .env Configuration

| Variable | Requerida | Ejemplo | Descripción |
|----------|-----------|---------|-------------|
| PORT | N | 3000 | Puerto del servidor |
| MONGODB_URI | Y | mongodb://localhost:27017/ecommunitas | URL de conexión a MongoDB |
| JWT_SECRET | Y | secreto123 | Clave secreta para JWT |

## 📡 Endpoints

### Autenticación
- `POST /api/auth/register`
  - Parámetros: email, password, name
  - Ejemplo respuesta: `{ "token": "jwt.token.here" }`

### Artículos
- `GET /api/items`
  - Parámetros: (ninguno)
  - Ejemplo respuesta: `[{ "id": 1, "title": "Libro" }]`

## 🚧 Roadmap

### Próximas características
1. Búsqueda avanzada (Q2 2024)
2. Sistema de mensajería (Q3 2024)

### Dependencias
- Finalizar CRUD de artículos
- Implementar ElasticSearch para búsqueda

## 📸 Screenshots

<!-- Login screen -->
<!-- Item listing -->

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo LICENSE para más detalles.

