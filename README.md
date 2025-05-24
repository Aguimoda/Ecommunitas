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
- Creación, visualización, actualización y eliminación de artículos (CRUD en desarrollo)

### 💬 Mensajería
- Visualización de conversaciones y envío de mensajes (En desarrollo)

## 🛠 Estado Actual

✅ **Implementado completamente**
- Autenticación de usuarios (registro/login)

🔄 **En desarrollo**
- CRUD de artículos
- Sistema de mensajería (funcionalidad básica implementada: visualización de conversaciones y envío de mensajes)

📅 **Planeado**
- Sistema de búsqueda avanzada
- Funcionalidades avanzadas de mensajería (ej: notificaciones en tiempo real, búsqueda en mensajes)

## 💻 Tecnologías y Decisiones Técnicas
### Frontend
- **Framework:** Vue.js 3 (Composition API). Elegido por su reactividad, modularidad y ecosistema moderno.
- **Bundler:** Vite. Proporciona recarga instantánea y optimización avanzada para desarrollo Vue.
- **Estilos:** Tailwind CSS. Permite un diseño rápido, responsivo y consistente.
- **Gestión de Estado:** Pinia. Sencillo, escalable y compatible con Vue 3.
- **Routing:** Vue Router. Navegación declarativa y soporte para rutas protegidas.
- **Notificaciones:** Vue Toastification. Para mostrar feedback al usuario de forma no intrusiva.
- **Manejo de JWT (Frontend):** jwt-decode. Para decodificar tokens JWT en el cliente.

### Backend
- **Runtime:** Node.js. Permite alta concurrencia y desarrollo fullstack JS.
- **Framework:** Express. Minimalista, flexible y ampliamente soportado.
- **Base de datos:** MongoDB (Mongoose). NoSQL, flexible y escalable, ideal para datos de usuarios y artículos.
- **ORM:** Mongoose. Facilita validaciones, relaciones y lógica de negocio en los modelos.
- **Gestión de imágenes:** Cloudinary. Almacenamiento externo seguro, transformación y entrega optimizada de imágenes.
- **Autenticación:** JWT (JSON Web Tokens). Tokens seguros y stateless para APIs REST.
- **Carga de archivos:** express-fileupload. Manejo eficiente de archivos y almacenamiento temporal.
- **Logs:** Winston. Registro estructurado de eventos, errores y operaciones críticas (archivos y consola).
- **Rate Limiting:** express-rate-limit. Protección ante abusos y ataques de fuerza bruta.
- **CORS:** cors. Permite acceso seguro desde el frontend.
- **Testing:** Jest. Pruebas unitarias y de integración para endpoints y lógica de negocio.

### Decisiones Clave
- **Separación de capas:** Controladores, modelos, rutas y middleware bien definidos para facilitar el mantenimiento y escalabilidad.
- **Gestión de errores centralizada:** Middleware dedicado para respuestas coherentes y trazabilidad.
- **Variables de entorno:** Uso extensivo de `.env` para credenciales y configuración sensible.
- **Logs persistentes:** Winston y archivos dedicados para auditoría y debugging.
- **Validaciones robustas:** En modelos y middleware para garantizar integridad de datos y seguridad.
- **Pruebas automatizadas:** Cobertura de autenticación, artículos y lógica crítica.

## 🏗️ Estructura del Proyecto
```
ecommunitas/
├── backend/                  # API REST
│   ├── config/               # Configuración (DB, Cloudinary, índices)
│   ├── controllers/          # Lógica de negocio (auth, items, users, mensajes)
│   ├── middleware/           # Autenticación, gestión de errores, subida de archivos, rate limiting
│   ├── models/               # Esquemas de Mongoose (User, Item, Message)
│   ├── routes/               # Definición de endpoints RESTful
│   ├── tests/                # Pruebas unitarias e integración (Jest)
│   ├── uploads/              # Almacenamiento temporal de archivos
│   ├── utils/                # Utilidades (logger, manejo de errores)
│   └── server.js             # Punto de entrada principal
├── frontend/                 # Aplicación Vue
│   ├── public/               # Assets estáticos
│   ├── src/
│   │   ├── assets/           # Recursos
│   │   ├── components/       # Componentes reutilizables
│   │   ├── composables/      # Lógica reutilizable (hooks)
│   │   ├── router/           # Configuración de rutas
│   │   ├── views/            # Vistas principales
│   │   └── main.js           # Punto de entrada
│   └── vite.config.js
└── package.json              # Configuración del monorepo
```

### Backend: Organización y Arquitectura
- **config/**: Inicialización de base de datos, Cloudinary y configuración de índices.
- **controllers/**: Implementa la lógica de negocio para autenticación, gestión de artículos, usuarios y mensajes.
- **middleware/**: Incluye protección de rutas (JWT), gestión de errores, subida de archivos y limitación de peticiones.
- **models/**: Esquemas de Mongoose con validaciones y métodos personalizados.
- **routes/**: Define endpoints RESTful siguiendo buenas prácticas (autenticación, artículos, usuarios, mensajes).
- **utils/**: Logger avanzado (Winston), manejo centralizado de errores.
- **tests/**: Pruebas automatizadas con Jest para endpoints críticos.
- **uploads/**: Carpeta temporal para archivos antes de subirlos a Cloudinary.

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

## Características y Funcionamiento

- **Registro y autenticación de usuarios:**
  - Registro y login mediante JWT, validación robusta de contraseñas y emails.
  - Rutas protegidas con middleware de autenticación y autorización por roles.
- **Gestión de artículos:**
  - CRUD completo de artículos, asociados a usuarios.
  - Subida de imágenes gestionada con express-fileupload y almacenamiento en Cloudinary.
  - Validaciones de campos y categorías, control de disponibilidad.
- **Búsqueda y filtrado:**
  - Búsqueda básica y avanzada de artículos por usuario, categoría y texto.
  - Middleware de resultados avanzados para paginación y filtrado.
- **Mensajería (planeado):**
  - Sistema de mensajes entre usuarios para negociar intercambios.
- **Logs y auditoría:**
  - Registro de operaciones, errores y eventos críticos con Winston (archivos y consola).
- **Gestión de errores:**
  - Middleware centralizado para respuestas coherentes y trazabilidad.
- **Pruebas automatizadas:**
  - Cobertura de endpoints de autenticación, artículos y lógica de negocio con Jest.

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

## Configuración de Variables de Entorno (.env)

| Variable                | Requerida | Ejemplo                                      | Descripción                                 |
|-------------------------|-----------|----------------------------------------------|---------------------------------------------|
| PORT                    | N         | 3000                                         | Puerto del servidor                         |
| MONGODB_URI             | Y         | mongodb://localhost:27017/ecommunitas        | URL de conexión a MongoDB                   |
| JWT_SECRET              | Y         | secreto123                                   | Clave secreta para JWT                      |
| CLOUDINARY_CLOUD_NAME   | Y         | tu_cloud_name                                | Nombre de Cloudinary                        |
| CLOUDINARY_API_KEY      | Y         | 123456789                                    | API Key de Cloudinary                       |
| CLOUDINARY_API_SECRET   | Y         | abcdefghijklmnopqrstuvwxyz                    | API Secret de Cloudinary                    |
| FILE_UPLOAD_PATH        | N         | ./uploads                                    | Carpeta temporal para archivos subidos       |
| NODE_ENV                | N         | development                                  | Entorno de ejecución                        |
| RATE_LIMIT_WINDOW_MS    | N         | 60000                                        | Ventana de rate limiting (ms)               |
| RATE_LIMIT_MAX          | N         | 100                                          | Máximo de peticiones por ventana            |

## 📡 Endpoints Principales

### Autenticación
- `POST /api/v1/auth/register` — Registro de usuario (name, email, password)
- `POST /api/v1/auth/login` — Login (email, password)
- `GET /api/v1/auth/me` — Obtener perfil del usuario autenticado (JWT requerido)
- `POST /api/v1/auth/forgotpassword` — Solicitar recuperación de contraseña
- `PUT /api/v1/auth/resetpassword/:resettoken` — Restablecer contraseña

## 🔄 Diagrama de Flujo: Registro e Inicio de Sesión de Usuario

```mermaid
flowchart TD
  A[Usuario en navegador] --> B[Formulario de registro/login<br/>RegisterView.vue / LoginView.vue]
  B -->|POST /api/v1/auth/register o /login| C[axios → router/auth.js (frontend)]
  C --> D[Backend: routes/auth.js]
  D --> E[controllers/auth.js]
  E --> F[models/User.js<br/>Validación y hash de contraseña]
  F --> G[Generación de JWT]
  G --> H[Respuesta JSON con token y datos de usuario]
  H --> I[Frontend almacena token y redirige]
```

### Explicación del flujo
1. **Usuario** completa el formulario de registro o login en el frontend (`RegisterView.vue` o `LoginView.vue`).
2. El formulario envía una petición HTTP POST usando **axios** a `/api/v1/auth/register` o `/api/v1/auth/login`.
3. El **router** del frontend gestiona la navegación y posibles redirecciones.
4. La petición llega al backend, específicamente a `routes/auth.js`, que define los endpoints de autenticación.
5. El endpoint invoca el controlador `controllers/auth.js`, donde se procesa la lógica de registro o login:
   - En registro: se valida el payload, se crea un nuevo usuario y se hashea la contraseña usando **bcrypt**.
   - En login: se valida el usuario y la contraseña, y se compara el hash.
6. El modelo `models/User.js` define el esquema y métodos de usuario, incluyendo validaciones y métodos para comparar contraseñas.
7. Si la autenticación es exitosa, el controlador genera un **JWT** (JSON Web Token) y lo envía en la respuesta JSON.
8. El frontend recibe el token, lo almacena (por ejemplo, en localStorage) y redirige al usuario a la vista protegida.

**Archivos clave involucrados:**
- Frontend: `RegisterView.vue`, `LoginView.vue`, `router/index.js`, lógica axios
- Backend: `routes/auth.js`, `controllers/auth.js`, `models/User.js`, middlewares de validación y error
- Seguridad: Middleware de autenticación para rutas protegidas, generación y validación de JWT

### Artículos
- `GET /api/v1/items` — Listar artículos (paginación, filtrado, búsqueda)
- `POST /api/v1/items` — Crear artículo (JWT requerido, permite imágenes)
- `GET /api/v1/items/:id` — Obtener detalle de un artículo
- `PUT /api/v1/items/:id` — Actualizar artículo (JWT requerido)
- `DELETE /api/v1/items/:id` — Eliminar artículo (JWT requerido)
- `GET /api/v1/items/user/:userId` — Listar artículos de un usuario
- `GET /api/v1/items/search` — Búsqueda avanzada de artículos

### Usuarios
- `GET /api/v1/users/:id` — Perfil público de usuario

### Mensajes (En desarrollo)
- `GET /api/v1/messages/:conversationId` — Obtener mensajes de una conversación
- `POST /api/v1/messages` — Enviar un nuevo mensaje

## 🔄 Flowchart: Registro e Inicio de Sesión de Usuario

```mermaid
flowchart TD
  A[Usuario en navegador] --> B[Formulario de registro/login<br/>RegisterView.vue / LoginView.vue]
  B -->|POST /api/v1/auth/register o /login| C[axios → router/auth.js (frontend)]
  C --> D[Backend: routes/auth.js]
  D --> E[controllers/auth.js]
  E --> F[models/User.js<br/>Validación y hash de contraseña]
  F --> G[Generación de JWT]
  G --> H[Respuesta JSON con token y datos de usuario]
  H --> I[Frontend almacena token y redirige]
```

### Explicación del flujo
1. **Usuario** completa el formulario de registro o login en el frontend (`RegisterView.vue` o `LoginView.vue`).
2. El formulario envía una petición HTTP POST usando **axios** a `/api/v1/auth/register` o `/api/v1/auth/login`.
3. El **router** del frontend gestiona la navegación y posibles redirecciones.
4. La petición llega al backend, específicamente a `routes/auth.js`, que define los endpoints de autenticación.
5. El endpoint invoca el controlador `controllers/auth.js`, donde se procesa la lógica de registro o login:
   - En registro: se valida el payload, se crea un nuevo usuario y se hashea la contraseña usando **bcrypt**.
   - En login: se valida el usuario y la contraseña, y se compara el hash.
6. El modelo `models/User.js` define el esquema y métodos de usuario, incluyendo validaciones y métodos para comparar contraseñas.
7. Si la autenticación es exitosa, el controlador genera un **JWT** (JSON Web Token) y lo envía en la respuesta JSON.
8. El frontend recibe el token, lo almacena (por ejemplo, en localStorage) y redirige al usuario a la vista protegida.

**Archivos clave involucrados:**
- Frontend: `RegisterView.vue`, `LoginView.vue`, `router/index.js`, lógica axios
- Backend: `routes/auth.js`, `controllers/auth.js`, `models/User.js`, middlewares de validación y error
- Seguridad: Middleware de autenticación para rutas protegidas, generación y validación de JWT

## 🚧 Roadmap y Futuras Mejoras

### Próximas características
1. Búsqueda avanzada (Q2 2024, posible integración con ElasticSearch)
2. Funcionalidades avanzadas de mensajería (ej: notificaciones en tiempo real, búsqueda en mensajes, etc.) (Q3 2024)
3. Mejoras en la gestión de imágenes (optimización y moderación)
4. Panel de administración y métricas
5. Internacionalización y accesibilidad

### Dependencias y tareas técnicas
- Finalizar y testear CRUD de artículos
- Implementar ElasticSearch para búsqueda avanzada
- Mejorar cobertura de pruebas y documentación
- Optimizar logs y auditoría

## 📸 Screenshots



## Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo LICENSE para más detalles.

