# 🌱 Ecommunitas

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![Vue.js Version](https://img.shields.io/badge/vue-3.3.4-green)](https://vuejs.org/)
[![Express Version](https://img.shields.io/badge/express-4.21.2-blue)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/mongodb-7.8.6-green)](https://www.mongodb.com/)
[![Pinia](https://img.shields.io/badge/pinia-2.1.6-yellow)](https://pinia.vuejs.org/)
[![Tailwind CSS](https://img.shields.io/badge/tailwindcss-3.3.3-blue)](https://tailwindcss.com/)
[![Cloudinary](https://img.shields.io/badge/cloudinary-1.40.0-blue)](https://cloudinary.com/)

Plataforma comunitaria para el intercambio sostenible de bienes y servicios que fomenta la economía circular y reduce el desperdicio mediante un sistema de trueque local intuitivo y seguro.

## 🎯 Estado Actual del Proyecto

**Versión**: 1.0.0 (Funcional y Desplegable)  
**Estado**: ✅ **COMPLETAMENTE FUNCIONAL**  
**Última actualización**: Diciembre 2024

### 📊 Resumen de Funcionalidades
- ✅ **Sistema de autenticación completo** (registro, login, recuperación de contraseña)
- ✅ **Gestión completa de artículos** (CRUD, búsqueda avanzada, categorización)
- ✅ **Sistema de mensajería funcional** (conversaciones, mensajes en tiempo real)
- ✅ **Panel de administración** (gestión de usuarios y artículos)
- ✅ **Búsqueda avanzada con filtros** (categoría, condición, ubicación)
- ✅ **Subida de imágenes** (integración con Cloudinary)
- ✅ **Diseño responsive** (optimizado para móvil y desktop)
- ✅ **Seguridad robusta** (JWT, validación, sanitización)

### 🚀 Listo para Producción
Este proyecto está completamente funcional y listo para ser desplegado en producción. Todas las funcionalidades principales han sido implementadas y probadas.

## 📋 Tabla de Contenidos
- [Descripción](#-descripción)
- [Características Implementadas](#-características-implementadas)
- [Tecnologías Utilizadas](#-tecnologías-utilizadas)
- [Arquitectura del Sistema](#-arquitectura-del-sistema)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Modelos de Datos](#-modelos-de-datos)
- [API Endpoints](#-api-endpoints)
- [Instalación y Configuración](#-instalación-y-configuración)
- [Variables de Entorno](#-variables-de-entorno)
- [Uso del Sistema](#-uso-del-sistema)
- [Roadmap y Mejoras Futuras](#-roadmap-y-mejoras-futuras)
- [Contribución](#-contribución)
- [Licencia](#-licencia)

## 🌟 Descripción

Ecommunitas es una plataforma web completa que fomenta la economía circular permitiendo a los usuarios:
- **Publicar artículos** que ya no utilizan con imágenes y descripciones detalladas
- **Buscar y descubrir** objetos disponibles mediante búsqueda avanzada con filtros
- **Conectarse con otros usuarios** a través de un sistema de mensajería integrado
- **Gestionar su perfil** y visualizar su historial de artículos
- **Administrar la plataforma** (para usuarios con rol de administrador)

## ✅ Características Implementadas

### 🔐 Sistema de Autenticación Completo
- **Registro de usuarios** con validación robusta de datos
- **Inicio de sesión** con JWT y persistencia de sesión
- **Recuperación de contraseña** con tokens seguros
- **Protección de rutas** basada en autenticación y roles
- **Autorización por roles** (usuario/administrador)
- **Validación de datos** tanto en frontend como backend
- **Seguridad avanzada** con sanitización contra XSS y NoSQL injection

### 🛍️ Gestión Completa de Artículos
- **CRUD completo** (Crear, Leer, Actualizar, Eliminar)
- **Subida múltiple de imágenes** con integración a Cloudinary
- **Categorización** (libros, electrónicos, ropa, muebles, otros)
- **Estados de condición** (nuevo, como nuevo, bueno, regular, pobre)
- **Control de disponibilidad** (disponible/no disponible)
- **Validación de propiedad** para edición y eliminación
- **Optimización de imágenes** automática

### 🔍 Búsqueda Avanzada y Filtros
- **Búsqueda por texto** en título y descripción
- **Filtros por categoría** con selección múltiple
- **Filtros por condición** del artículo
- **Filtros por ubicación** geográfica
- **Ordenación** por relevancia, fecha o proximidad
- **Paginación** de resultados con metadata
- **Búsqueda en tiempo real** con debounce

### 💬 Sistema de Mensajería Funcional
- **Conversaciones entre usuarios** completamente implementado
- **Mensajes asociados a artículos** específicos
- **Gestión de mensajes leídos/no leídos** con actualización automática
- **Historial de conversaciones** agrupadas por usuario
- **Interfaz de chat intuitiva** con diseño moderno
- **Contador de mensajes no leídos** en la navegación
- **Marcado automático como leído** al abrir conversaciones

### 👤 Gestión de Perfiles de Usuario
- **Perfiles completos** con información personal
- **Edición de perfil** con validación en tiempo real
- **Avatar de usuario** con soporte para imágenes
- **Biografía personalizable** y ubicación
- **Visualización de artículos propios** con estadísticas
- **Historial de actividad** del usuario

### 🛡️ Panel de Administración
- **Dashboard administrativo** con métricas del sistema
- **Gestión de usuarios** (ver, activar/desactivar, cambiar roles)
- **Gestión de artículos** (moderación, aprobación, eliminación)
- **Estadísticas en tiempo real** de la plataforma
- **Protección de rutas administrativas** con autorización
- **Interfaz organizada** con tabs y navegación intuitiva

### 🎨 Diseño y Experiencia de Usuario
- **Diseño responsive** optimizado para móvil y desktop
- **Interfaz moderna** con Tailwind CSS
- **Modo oscuro** (preparado para implementación)
- **Notificaciones toast** para feedback inmediato
- **Estados de carga** y spinners informativos
- **Validación en tiempo real** en formularios
- **Navegación intuitiva** con breadcrumbs y menús claros

## 🛠️ Tecnologías Utilizadas

### Frontend
- **Vue.js 3.3.4** - Framework progresivo con Composition API
- **Vite 4.4.5** - Herramienta de construcción rápida con HMR
- **Tailwind CSS 3.3.3** - Framework de CSS utilitario
- **Pinia 2.1.6** - Gestión de estado moderna para Vue
- **Vue Router 4.2.4** - Enrutador oficial con protección de rutas
- **Axios 1.5.0** - Cliente HTTP para comunicación con API
- **Vue Toastification 2.0.0-rc.5** - Sistema de notificaciones
- **@vueuse/core 10.4.1** - Composables utilitarios
- **dayjs** - Manipulación de fechas ligera

### Backend
- **Node.js >=18.0.0** - Entorno de ejecución JavaScript
- **Express 4.21.2** - Framework web minimalista
- **MongoDB 7.8.6** - Base de datos NoSQL
- **Mongoose 7.5.0** - ODM para MongoDB con esquemas
- **Cloudinary 1.40.0** - Gestión de imágenes en la nube
- **JSON Web Token 9.0.2** - Autenticación stateless
- **bcryptjs 2.4.3** - Hash seguro de contraseñas
- **Winston 3.10.0** - Sistema de logging avanzado
- **express-rate-limit 6.10.0** - Limitación de requests
- **helmet 7.0.0** - Headers de seguridad HTTP
- **cors 2.8.5** - Configuración CORS
- **express-mongo-sanitize 2.2.0** - Prevención de inyección NoSQL
- **xss-clean 0.1.4** - Sanitización contra XSS

### Herramientas de Desarrollo
- **Jest** - Framework de pruebas para backend
- **Vitest** - Framework de pruebas para frontend
- **ESLint** - Linting de código
- **Prettier** - Formateo de código
- **TypeScript** - Tipado estático (configurado)

## 🏛️ Arquitectura del Sistema

### Arquitectura General
Ecommunitas sigue una arquitectura cliente-servidor con separación clara:

```
┌─────────────────┐    HTTP/REST    ┌─────────────────┐
│   Frontend      │◄──────────────►│    Backend      │
│   (Vue.js 3)    │                 │   (Express)     │
│                 │                 │                 │
│ ┌─────────────┐ │                 │ ┌─────────────┐ │
│ │ Components  │ │                 │ │ Controllers │ │
│ │ Views       │ │                 │ │ Middleware  │ │
│ │ Stores      │ │                 │ │ Routes      │ │
│ │ Services    │ │                 │ │ Models      │ │
│ └─────────────┘ │                 │ └─────────────┘ │
└─────────────────┘                 └─────────────────┘
                                             │
                                             ▼
                                    ┌─────────────────┐
                                    │    MongoDB      │
                                    │   (Database)    │
                                    └─────────────────┘
                                             │
                                             ▼
                                    ┌─────────────────┐
                                    │   Cloudinary    │
                                    │ (Image Storage) │
                                    └─────────────────┘
```

### Patrones de Diseño Implementados

#### Frontend
- **Composition API** - Lógica reutilizable en composables
- **Store Pattern** - Gestión de estado global con Pinia
- **Component Pattern** - Componentes modulares y reutilizables
- **Service Pattern** - Servicios API centralizados

#### Backend
- **MVC Pattern** - Separación Modelo-Vista-Controlador
- **Middleware Pattern** - Interceptores para autenticación y logging
- **Repository Pattern** - Abstracción de acceso a datos
- **Factory Pattern** - Respuestas API estandarizadas

## 📁 Estructura del Proyecto

```
ecommunitas/
├── 📁 backend/                    # API REST del servidor
│   ├── 📁 src/
│   │   ├── 📁 config/             # Configuración (DB, Cloudinary)
│   │   │   ├── 📄 db.js           # Conexión MongoDB
│   │   │   └── 📄 cloudinary.js   # Config Cloudinary
│   │   ├── 📁 controllers/        # Lógica de negocio
│   │   │   ├── 📄 auth.js         # Autenticación
│   │   │   ├── 📄 items.js        # CRUD artículos
│   │   │   ├── 📄 messages.js     # Sistema mensajería
│   │   │   └── 📄 users.js        # Gestión usuarios
│   │   ├── 📁 middleware/         # Interceptores
│   │   │   ├── 📄 auth.js         # Verificación JWT
│   │   │   ├── 📄 error.js        # Manejo errores
│   │   │   └── 📄 advancedResults.js # Paginación
│   │   ├── 📁 models/             # Esquemas datos
│   │   │   ├── 📄 User.js         # Modelo usuario
│   │   │   ├── 📄 Item.js         # Modelo artículo
│   │   │   └── 📄 Message.js      # Modelo mensaje
│   │   ├── 📁 routes/             # Endpoints REST
│   │   │   ├── 📄 auth.js         # Rutas autenticación
│   │   │   ├── 📄 items.js        # Rutas artículos
│   │   │   └── 📄 messages.js     # Rutas mensajes
│   │   └── 📁 utils/              # Utilidades
│   │       ├── 📄 logger.js       # Winston config
│   │       └── 📄 errorResponse.js # Respuestas error
│   ├── 📁 tests/                  # Pruebas Jest
│   ├── 📄 server.js               # Punto entrada
│   └── 📄 package.json            # Dependencias backend
├── 📁 frontend/                   # Aplicación Vue.js
│   ├── 📁 src/
│   │   ├── 📁 features/           # Funcionalidades por módulo
│   │   │   ├── 📁 auth/           # Autenticación
│   │   │   │   ├── 📁 components/ # Componentes auth
│   │   │   │   ├── 📁 composables/ # Lógica auth
│   │   │   │   ├── 📁 services/   # API auth
│   │   │   │   ├── 📁 stores/     # Estado auth
│   │   │   │   └── 📁 views/      # Vistas auth
│   │   │   ├── 📁 items/          # Gestión artículos
│   │   │   │   ├── 📁 components/ # Componentes items
│   │   │   │   ├── 📁 composables/ # Lógica items
│   │   │   │   ├── 📁 services/   # API items
│   │   │   │   ├── 📁 stores/     # Estado items
│   │   │   │   └── 📁 views/      # Vistas items
│   │   │   ├── 📁 messages/       # Sistema mensajería
│   │   │   ├── 📁 users/          # Gestión usuarios
│   │   │   └── 📁 admin/          # Panel administración
│   │   ├── 📁 shared/             # Componentes compartidos
│   │   │   ├── 📁 components/     # Componentes comunes
│   │   │   ├── 📁 composables/    # Lógica compartida
│   │   │   └── 📁 views/          # Vistas principales
│   │   ├── 📁 router/             # Configuración rutas
│   │   ├── 📄 App.vue             # Componente raíz
│   │   └── 📄 main.js             # Punto entrada
│   ├── 📄 package.json            # Dependencias frontend
│   └── 📄 vite.config.js          # Config Vite
├── 📄 package.json                # Config monorepo
└── 📄 README.md                   # Documentación
```

## 📊 Modelos de Datos

### Modelo de Usuario (User)
```javascript
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, minlength: 2, maxlength: 50 },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 8, select: false },
  bio: { type: String, maxlength: 500, default: '' },
  location: { type: String, maxlength: 100, default: '' },
  avatar: { type: String, default: null },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  lastLogin: { type: Date, default: null },
  active: { type: Boolean, default: true },
  gdprConsent: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
```

### Modelo de Artículo (Item)
```javascript
const ItemSchema = new mongoose.Schema({
  title: { type: String, required: true, maxlength: 100 },
  description: { type: String, required: true, maxlength: 1000 },
  category: { 
    type: String, 
    required: true, 
    enum: ['books', 'electronics', 'clothing', 'furniture', 'other'] 
  },
  condition: { 
    type: String, 
    required: true, 
    enum: ['new', 'like_new', 'good', 'fair', 'poor'] 
  },
  location: { type: String, required: true },
  imageUrls: { type: [String], default: [] },
  available: { type: Boolean, default: true },
  user: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});
```

### Modelo de Mensaje (Message)
```javascript
const MessageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  recipient: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, maxlength: 1000 },
  item: { type: mongoose.Schema.ObjectId, ref: 'Item', required: false },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});
```

## 🔌 API Endpoints

### Autenticación
```
POST   /api/v1/auth/register     # Registro de usuario
POST   /api/v1/auth/login        # Inicio de sesión
GET    /api/v1/auth/logout       # Cerrar sesión
GET    /api/v1/auth/me           # Obtener usuario actual
POST   /api/v1/auth/forgotpassword # Recuperar contraseña
PUT    /api/v1/auth/resetpassword/:resettoken # Restablecer contraseña
```

### Artículos
```
GET    /api/v1/items             # Listar artículos (con paginación)
POST   /api/v1/items             # Crear artículo
GET    /api/v1/items/search      # Búsqueda avanzada
GET    /api/v1/items/user/:userId # Artículos de usuario
GET    /api/v1/items/:id         # Obtener artículo específico
PUT    /api/v1/items/:id         # Actualizar artículo
DELETE /api/v1/items/:id         # Eliminar artículo
PATCH  /api/v1/items/:id/approve # Aprobar artículo (admin)
PATCH  /api/v1/items/:id/reject  # Rechazar artículo (admin)
```

### Mensajes
```
GET    /api/v1/messages          # Obtener mis mensajes
POST   /api/v1/messages          # Enviar mensaje
GET    /api/v1/messages/unread   # Mensajes no leídos
GET    /api/v1/messages/conversations # Lista de conversaciones
GET    /api/v1/messages/conversations/:userId # Conversación específica
PUT    /api/v1/messages/conversations/:userId/read # Marcar conversación como leída
PUT    /api/v1/messages/:id/read # Marcar mensaje como leído
DELETE /api/v1/messages/:id      # Eliminar mensaje
```

### Usuarios (Admin)
```
GET    /api/v1/users             # Listar usuarios (admin)
GET    /api/v1/users/:id         # Obtener usuario específico
PUT    /api/v1/users/:id         # Actualizar usuario
DELETE /api/v1/users/:id         # Eliminar usuario (admin)
PATCH  /api/v1/users/:id/role    # Cambiar rol de usuario (admin)
```

## ⚙️ Instalación y Configuración

### Requisitos Previos
- **Node.js** >= 18.0.0
- **npm** >= 8.0.0
- **MongoDB** >= 5.0.0
- **Cuenta de Cloudinary** (para imágenes)

### Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/ecommunitas.git
cd ecommunitas
```

2. **Instalar dependencias**
```bash
# Instalar dependencias del proyecto completo
npm install

# O instalar por separado
cd backend && npm install
cd ../frontend && npm install
```

3. **Configurar variables de entorno**
```bash
# En el directorio backend
cp .env.example .env
```

4. **Configurar base de datos**
```bash
# Asegúrate de que MongoDB esté ejecutándose
# La aplicación creará las colecciones automáticamente
```

5. **Ejecutar en modo desarrollo**
```bash
# Desde la raíz del proyecto
npm run dev

# O ejecutar por separado
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

### Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Ejecutar frontend y backend
npm run dev:frontend # Solo frontend
npm run dev:backend  # Solo backend

# Producción
npm run build        # Construir frontend
npm run start        # Ejecutar backend en producción

# Pruebas
npm run test         # Ejecutar todas las pruebas
npm run test:backend # Pruebas del backend
npm run test:frontend # Pruebas del frontend

# Utilidades
npm run lint         # Linting de código
npm run format       # Formatear código
```

## 🔧 Variables de Entorno

### Backend (.env)
```env
# Servidor
NODE_ENV=development
PORT=5000

# Base de datos
MONGO_URI=mongodb://localhost:27017/ecommunitas

# JWT
JWT_SECRET=tu_jwt_secret_muy_seguro
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30

# Cloudinary
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# Email (para recuperación de contraseña)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=tu_email@gmail.com
SMTP_PASSWORD=tu_password_de_aplicacion
FROM_EMAIL=noreply@ecommunitas.com
FROM_NAME=Ecommunitas

# Seguridad
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend
```env
# API Base URL
VITE_API_BASE_URL=http://localhost:5000/api/v1

# Cloudinary (para frontend)
VITE_CLOUDINARY_CLOUD_NAME=tu_cloud_name
```

## 🎮 Uso del Sistema

### Para Usuarios Regulares

1. **Registro e Inicio de Sesión**
   - Crear cuenta con email y contraseña
   - Verificar email (si está configurado)
   - Iniciar sesión y mantener sesión activa

2. **Gestión de Artículos**
   - Publicar nuevos artículos con imágenes
   - Editar y actualizar artículos propios
   - Marcar como disponible/no disponible
   - Eliminar artículos cuando sea necesario

3. **Búsqueda y Descubrimiento**
   - Buscar artículos por texto
   - Filtrar por categoría y condición
   - Filtrar por ubicación geográfica
   - Ver detalles completos de artículos

4. **Comunicación**
   - Enviar mensajes sobre artículos específicos
   - Mantener conversaciones con otros usuarios
   - Ver historial de mensajes
   - Recibir notificaciones de nuevos mensajes

5. **Gestión de Perfil**
   - Actualizar información personal
   - Cambiar avatar y biografía
   - Ver historial de artículos publicados
   - Gestionar configuración de cuenta

### Para Administradores

1. **Panel de Administración**
   - Acceder al dashboard administrativo
   - Ver estadísticas del sistema
   - Monitorear actividad de usuarios

2. **Gestión de Usuarios**
   - Ver lista completa de usuarios
   - Activar/desactivar cuentas
   - Cambiar roles de usuario
   - Ver detalles de actividad

3. **Moderación de Contenido**
   - Revisar artículos reportados
   - Aprobar o rechazar publicaciones
   - Eliminar contenido inapropiado
   - Gestionar categorías y etiquetas

## 🗺️ Roadmap y Mejoras Futuras

### 🎯 Próximas Funcionalidades (Prioridad Alta)

#### Sistema de Intercambios Formales
- [ ] Propuestas de intercambio estructuradas
- [ ] Estados de intercambio (pendiente, aceptado, completado)
- [ ] Historial de intercambios por usuario
- [ ] Sistema de valoraciones y reputación
- [ ] Notificaciones de estado de intercambio

#### Geolocalización Avanzada
- [ ] Búsqueda por proximidad geográfica
- [ ] Mapa interactivo de artículos
- [ ] Filtros de distancia precisos
- [ ] Integración con servicios de mapas

#### Notificaciones Mejoradas
- [ ] Notificaciones push en tiempo real
- [ ] Notificaciones por email configurables
- [ ] Centro de notificaciones en la app
- [ ] Preferencias de notificación por usuario

### 📋 Mejoras Técnicas (Prioridad Media)

#### Testing y Calidad
- [ ] Cobertura de tests al 80%+
- [ ] Tests de integración para todas las APIs
- [ ] Tests E2E con Cypress/Playwright
- [ ] Pipeline CI/CD automatizado

#### Performance y Escalabilidad
- [ ] Implementación de Redis para caché
- [ ] Optimización de consultas MongoDB
- [ ] CDN para entrega de imágenes
- [ ] Compresión de respuestas HTTP
- [ ] Lazy loading avanzado

#### Seguridad Avanzada
- [ ] Validación de imágenes más estricta
- [ ] Rate limiting por usuario
- [ ] Logs de seguridad detallados
- [ ] Auditoría de acciones administrativas

### 🌟 Funcionalidades Futuras (Prioridad Baja)

#### Experiencia de Usuario
- [ ] Modo oscuro completo
- [ ] Internacionalización (i18n)
- [ ] Progressive Web App (PWA)
- [ ] Accesibilidad mejorada (WCAG 2.1)
- [ ] Tema personalizable

#### Análisis y Métricas
- [ ] Dashboard de métricas avanzadas
- [ ] Análisis de comportamiento de usuarios
- [ ] Reportes de sostenibilidad
- [ ] Integración con Google Analytics

#### Integraciones Externas
- [ ] Login social (Google, Facebook, GitHub)
- [ ] Integración con Google Maps
- [ ] API pública para desarrolladores
- [ ] Webhooks para integraciones

### 🐛 Issues Conocidos

- **Filtro de distancia**: Temporalmente desactivado por problemas de precisión
- **Validación de imágenes**: Necesita mejoras en el frontend
- **Responsive design**: Algunos componentes requieren ajustes en móvil
- **Error handling**: Algunos errores no se muestran correctamente al usuario
- **Performance**: Optimización de carga inicial pendiente

## 🤝 Contribución

### Cómo Contribuir

1. **Fork el proyecto**
```bash
git clone https://github.com/tu-usuario/ecommunitas.git
```

2. **Crear rama para feature**
```bash
git checkout -b feature/nueva-funcionalidad
```

3. **Realizar cambios y commit**
```bash
git commit -m "feat: añadir nueva funcionalidad"
```

4. **Push y crear Pull Request**
```bash
git push origin feature/nueva-funcionalidad
```

### Estándares de Código

- **Frontend**: ESLint + Prettier configurados
- **Backend**: ESLint con reglas de Node.js
- **Commits**: Conventional Commits
- **Testing**: Jest para backend, Vitest para frontend
- **Documentación**: JSDoc para funciones complejas

### Tipos de Contribución

- 🐛 **Bug fixes**: Corrección de errores
- ✨ **Features**: Nuevas funcionalidades
- 📚 **Documentation**: Mejoras de documentación
- 🎨 **UI/UX**: Mejoras de diseño
- ⚡ **Performance**: Optimizaciones
- 🔒 **Security**: Mejoras de seguridad

### Reportar Issues

Utiliza las plantillas de GitHub Issues para:
- 🐛 **Bug reports** con pasos para reproducir
- 💡 **Feature requests** con casos de uso
- 📚 **Documentation** mejoras y correcciones
- 🔒 **Security** vulnerabilidades (privado)

## 📄 Licencia

Este proyecto está licenciado bajo la **Licencia MIT** - ver el archivo [LICENSE](LICENSE) para más detalles.

### Resumen de la Licencia MIT
- ✅ Uso comercial permitido
- ✅ Modificación permitida
- ✅ Distribución permitida
- ✅ Uso privado permitido
- ❌ Sin garantía
- ❌ Sin responsabilidad del autor

## 👥 Autores y Reconocimientos

### Equipo de Desarrollo
- **Desarrollador Principal** - [Aguimoda](https://github.com/Aguimoda)

### Agradecimientos
- **Vue.js Community** - Por la excelente documentación y ecosistema
- **MongoDB** - Por la base de datos flexible y potente
- **Cloudinary** - Por el servicio de gestión de imágenes
- **Tailwind CSS** - Por el framework de estilos utilitario
- **Express.js** - Por el framework web minimalista
- **Todos los contribuidores** - Por hacer posible este proyecto

### Inspiración
Este proyecto fue inspirado por la necesidad de crear una economía más circular y sostenible, donde los objetos puedan tener una segunda vida útil en lugar de convertirse en desperdicio.

---

**¿Tienes preguntas o sugerencias?** 

📧 **Email**: contacto@ecommunitas.com  
🐛 **Issues**: [GitHub Issues](https://github.com/tu-usuario/ecommunitas/issues)  
💬 **Discusiones**: [GitHub Discussions](https://github.com/tu-usuario/ecommunitas/discussions)  

---

<div align="center">
  <strong>Hecho con ❤️ para fomentar la economía circular</strong>
</div>

