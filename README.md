# 🌱 Ecommunitas - Plataforma de Trueque Local
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)](https://nodejs.org/)
[![Vue.js Version](https://img.shields.io/badge/vue-3.3.4-green)](https://vuejs.org/)
[![Express Version](https://img.shields.io/badge/express-4.21.2-blue)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/mongodb-7.8.6-green)](https://www.mongodb.com/)

Plataforma comunitaria para el intercambio sostenible de bienes y servicios que fomenta la economía circular y reduce el desperdicio mediante un sistema de trueque local intuitivo y seguro.

## 📋 Tabla de Contenidos
- [Descripción](#-descripción)
- [Características Actuales](#-características-actuales)
- [Estado del Proyecto](#-estado-del-proyecto)
- [Tecnologías Utilizadas](#-tecnologías-utilizadas)
  - [Frontend](#frontend)
  - [Backend](#backend)
  - [Decisiones Clave](#decisiones-clave)
    - [Arquitectura](#arquitectura)
    - [Seguridad](#seguridad)
    - [Rendimiento y Escalabilidad](#rendimiento-y-escalabilidad)
    - [Experiencia de Usuario](#experiencia-de-usuario)
- [Estructura del Proyecto](#-estructura-del-proyecto)
  - [Backend: Organización y Arquitectura](#backend-organización-y-arquitectura)
    - [Controladores](#controladores)
    - [Middleware](#middleware)
    - [Modelos](#modelos)
    - [Rutas](#rutas)
  - [Frontend: Componentes y Servicios](#frontend-componentes-y-servicios)
    - [Componentes](#componentes)
    - [Composables](#composables)
    - [Servicios](#servicios)
    - [Stores (Pinia)](#stores-pinia)
    - [Vistas](#vistas)
- [Modelos de Datos](#-modelos-de-datos)
  - [Modelo de Usuario](#modelo-de-usuario)
  - [Modelo de Artículo](#modelo-de-artículo)
  - [Modelo de Mensaje](#modelo-de-mensaje)
- [Flujos Principales](#-flujos-principales)
  - [Flujo de Autenticación](#flujo-de-autenticación)
  - [Flujo de Gestión de Artículos](#flujo-de-gestión-de-artículos)
  - [Flujo de Mensajería](#flujo-de-mensajería)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Características y Funcionalidad](#-características-y-funcionalidad)
- [Variables de Entorno](#-variables-de-entorno)
- [API Endpoints](#-api-endpoints)
  - [Autenticación](#autenticación)
  - [Artículos](#artículos)
  - [Mensajes](#mensajes)
- [Diagrama de Flujo: Registro e Inicio de Sesión de Usuario](#-diagrama-de-flujo-registro-e-inicio-de-sesión-de-usuario)
- [Roadmap y Mejoras Futuras](#-roadmap-y-mejoras-futuras)
- [Dependencias](#-dependencias)
- [Licencia](#-licencia)

## 🌟 Descripción

Ecommunitas es una plataforma web que fomenta la economía circular permitiendo a los usuarios:
- Publicar artículos que ya no utilizan
- Buscar y descubrir objetos disponibles para intercambio mediante búsqueda avanzada y filtros
- Conectarse con otros miembros de la comunidad a través de un sistema de mensajería
- Reducir el desperdicio y promover la sostenibilidad

## 🚀 Características Actuales

### ✅ Funcionalidades Completamente Implementadas

#### 🔐 Autenticación y Seguridad
- ✅ Registro y login de usuarios con validación robusta de contraseñas
- ✅ Protección de rutas mediante JWT con middleware de autenticación
- ✅ Autorización basada en roles (usuario/administrador)
- ✅ Recuperación de contraseña con tokens seguros
- ✅ Validación exhaustiva de datos de entrada (frontend y backend)
- ✅ Sanitización contra ataques XSS y NoSQL injection
- ✅ Rate limiting para prevenir ataques de fuerza bruta
- ✅ Headers de seguridad con Helmet
- ✅ Cumplimiento GDPR con consentimiento de usuario

#### 🛍️ Gestión de Artículos
- ✅ CRUD completo de artículos (Crear, Leer, Actualizar, Eliminar)
- ✅ Subida múltiple de imágenes con Cloudinary
- ✅ Marcado de disponibilidad de artículos
- ✅ Categorización con enums predefinidos (books, electronics, clothing, furniture, other)
- ✅ Estados de condición (new, like_new, good, fair, poor)
- ✅ Validación de propiedad para edición/eliminación
- ✅ Índices de texto para búsqueda eficiente

#### 🔍 Búsqueda Avanzada
- ✅ Búsqueda por texto en título y descripción con índices MongoDB
- ✅ Filtrado por categoría, condición y ubicación
- ✅ Búsqueda geoespacial por distancia (temporalmente desactivada)
- ✅ Ordenación por relevancia, fecha o proximidad
- ✅ Paginación de resultados con metadata
- ✅ Filtros reactivos con prevención de loops infinitos

#### 💬 Sistema de Mensajería
- ✅ Conversaciones entre usuarios completamente funcional
- ✅ Mensajes asociados a artículos específicos
- ✅ Gestión de mensajes leídos/no leídos con actualización automática
- ✅ Historial de conversaciones agrupadas por usuario
- ✅ Interfaz de chat en tiempo real
- ✅ Contador de mensajes no leídos en navbar
- ✅ Marcado automático como leído al abrir conversación

#### 👤 Gestión de Perfiles
- ✅ Perfiles de usuario con información personal
- ✅ Edición de perfil con validación
- ✅ Visualización de artículos propios
- ✅ Avatar de usuario con soporte para imágenes
- ✅ Biografía y ubicación personalizables

#### 🛡️ Panel de Administración
- ✅ Dashboard administrativo implementado
- ✅ Gestión de usuarios (ver, activar/desactivar, cambiar roles)
- ✅ Gestión de artículos (moderación, eliminación)
- ✅ Estadísticas del sistema
- ✅ Protección de rutas administrativas
- ✅ Interfaz intuitiva con tabs organizados

### 🚧 Funcionalidades Parcialmente Implementadas

#### 🌍 Geolocalización
- ⚠️ Búsqueda geoespacial implementada pero temporalmente desactivada
- ⚠️ Modelo ItemGeo preparado para coordenadas geográficas
- ⚠️ Composable useGeolocation disponible pero no integrado
- ⚠️ Filtro de distancia en interfaz pero sin funcionalidad

#### 📧 Sistema de Notificaciones
- ⚠️ Infraestructura básica para notificaciones
- ⚠️ Notificaciones toast implementadas para acciones inmediatas
- ❌ Notificaciones por email pendientes
- ❌ Notificaciones push no implementadas

### ❌ Funcionalidades Planificadas (No Implementadas)

#### 🔄 Sistema de Intercambios
- ❌ Propuestas de intercambio formales
- ❌ Estados de intercambio (pendiente, aceptado, completado)
- ❌ Historial de intercambios
- ❌ Sistema de valoraciones y reputación

#### 📊 Analytics y Métricas
- ❌ Dashboard de métricas avanzadas
- ❌ Análisis de comportamiento de usuarios
- ❌ Reportes de actividad
- ❌ Métricas de sostenibilidad

#### 🌐 Internacionalización
- ❌ Soporte multi-idioma
- ❌ Localización de contenido
- ❌ Adaptación cultural regional

## 🏛 Arquitectura del Sistema

Ecommunitas sigue una arquitectura cliente-servidor con separación clara entre frontend y backend:

### Arquitectura General
- **Patrón MVC**: Separación de Modelo (datos), Vista (interfaz) y Controlador (lógica de negocio)
- **API RESTful**: Comunicación mediante endpoints HTTP bien definidos
- **Arquitectura por capas**: Separación de responsabilidades en el backend
- **Diseño modular**: Componentes reutilizables en el frontend

### Capas del Backend
1. **Capa de Presentación**: Rutas y endpoints REST (routes/)
2. **Capa de Lógica de Negocio**: Controladores que implementan la lógica (controllers/)
3. **Capa de Acceso a Datos**: Modelos y esquemas de Mongoose (models/)
4. **Capa Transversal**: Middleware, utilidades y configuración (middleware/, utils/, config/)

### Flujo de Datos
1. El cliente (Vue.js) realiza peticiones HTTP a la API
2. Las rutas de Express dirigen la petición al controlador adecuado
3. Los middleware interceptan y procesan la petición (autenticación, validación, etc.)
4. Los controladores implementan la lógica de negocio y operan con los modelos
5. Los modelos interactúan con la base de datos MongoDB
6. La respuesta sigue el camino inverso hasta el cliente

## 📊 Modelos de Datos

### Modelo de Usuario (User)
```javascript
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, minlength: 2, maxlength: 50 },
  email: { type: String, required: true, unique: true, match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/] },
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
  category: { type: String, required: true, enum: ['books', 'electronics', 'clothing', 'furniture', 'other'] },
  condition: { type: String, required: true, enum: ['new', 'like_new', 'good', 'fair', 'poor'] },
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

## 🔄 Flujos Principales

### Flujo de Autenticación
1. **Registro de Usuario**:
   - El usuario completa el formulario en `RegisterView.vue`
   - La petición se envía a `/api/v1/auth/register`
   - El controlador `auth.js` valida los datos y crea el usuario
   - Se genera un JWT y se devuelve al cliente

2. **Inicio de Sesión**:
   - El usuario completa el formulario en `LoginView.vue`
   - La petición se envía a `/api/v1/auth/login`
   - El controlador verifica las credenciales
   - Se genera un JWT y se devuelve al cliente

### Flujo de Gestión de Artículos
1. **Creación de Artículo**:
   - El usuario completa el formulario en `ItemForm.vue`
   - Se crea un objeto FormData con los datos e imágenes
   - La petición se envía a `/api/v1/items`
   - El middleware `auth.js` verifica la autenticación
   - El controlador `items.js` procesa las imágenes con Cloudinary
   - Se crea el artículo en la base de datos

2. **Búsqueda de Artículos**:
   - El usuario configura filtros en `SearchFilters.vue`
   - La petición se envía a `/api/v1/items/search`
   - El controlador `itemsGeo.js` construye la consulta MongoDB
   - Se aplican filtros de texto, categoría, condición y geoespaciales
   - Se devuelven los resultados paginados

### Flujo de Mensajería
1. **Envío de Mensaje**:
   - El usuario escribe un mensaje desde `ItemDetailView.vue`
   - La petición se envía a `/api/v1/messages`
   - El middleware `auth.js` verifica la autenticación
   - El controlador crea el mensaje asociado al artículo y usuarios

2. **Consulta de Conversaciones**:
   - El usuario accede a `MessagesView.vue`
   - La petición se envía a `/api/v1/messages/conversations`
   - Se recuperan las conversaciones agrupadas por usuario

## 🛠️ Tecnologías Utilizadas

### Frontend
- **Vue.js 3.3.4**: Framework progresivo para construir interfaces de usuario, utilizando Composition API para una mejor organización del código y reutilización de lógica.
- **Vite 4.4.5**: Herramienta de construcción que proporciona un servidor de desarrollo extremadamente rápido con Hot Module Replacement (HMR).
- **Tailwind CSS 3.3.3**: Framework de CSS utilitario para crear diseños personalizados sin salir del HTML.
- **Pinia 2.1.6**: Biblioteca de gestión de estado para Vue.js, más ligera y con mejor soporte para TypeScript que Vuex.
- **Vue Router 4.2.4**: Enrutador oficial para Vue.js, utilizado para la navegación entre vistas y protección de rutas.
- **Axios 1.5.0**: Cliente HTTP basado en promesas para realizar peticiones a la API REST.
- **Vue Toastification 2.0.0-rc.5**: Biblioteca para mostrar notificaciones toast elegantes y configurables.
- **jwt-decode**: Utilidad para decodificar tokens JWT en el cliente.
- **vue-slider-component**: Componente de slider utilizado para el filtro de distancia en la búsqueda avanzada.
- **dayjs**: Alternativa ligera a Moment.js para manipulación de fechas.
- **@vueuse/core 10.4.1**: Composables utilitarios para Vue.js.

### Backend
- **Node.js >=14.0.0**: Entorno de ejecución para JavaScript del lado del servidor.
- **Express 4.21.2**: Framework web minimalista y flexible para Node.js.
- **MongoDB 7.8.6**: Base de datos NoSQL orientada a documentos.
- **Mongoose 7.5.0**: ODM (Object Data Modeling) para MongoDB y Node.js, proporciona una solución basada en esquemas para modelar los datos.
- **Cloudinary 1.40.0**: Servicio de gestión de imágenes en la nube, utilizado para almacenar y optimizar las imágenes de los artículos.
- **JSON Web Token (jsonwebtoken 9.0.2)**: Estándar para la creación de tokens de acceso que permiten la propagación de identidad y privilegios.
- **bcryptjs 2.4.3**: Biblioteca para el hash de contraseñas.
- **express-fileupload**: Middleware para manejar la subida de archivos en Express.
- **Winston 3.10.0**: Biblioteca de logging versátil para Node.js.
- **express-rate-limit 6.10.0**: Middleware para limitar las solicitudes repetidas a las API públicas y endpoints.
- **cors 2.8.5**: Middleware para habilitar CORS (Cross-Origin Resource Sharing).
- **helmet 7.0.0**: Middleware para ayudar a proteger aplicaciones Express configurando varios encabezados HTTP.
- **express-mongo-sanitize 2.2.0**: Middleware para prevenir inyección de operadores MongoDB en las consultas.
- **xss-clean 0.1.4**: Middleware para sanitizar inputs previniendo ataques XSS.
- **hpp**: Middleware para proteger contra ataques de contaminación de parámetros HTTP.
- **Multer 1.4.5-lts.1**: Middleware para subida de archivos.
- **Validator 13.11.0**: Validación y sanitización de strings.
- **Dotenv 16.3.1**: Carga de variables de entorno.
- **Colors 1.4.0**: Colores para output de consola.
- **Jest**: Framework de pruebas para JavaScript con un enfoque en la simplicidad.

### Decisiones Clave

#### Arquitectura
- **Patrón MVC**: Implementación clara del patrón Modelo-Vista-Controlador en el backend, con separación de responsabilidades entre modelos (esquemas de Mongoose), controladores (lógica de negocio) y vistas (API REST).
- **API RESTful**: Diseño de API siguiendo principios REST, con endpoints bien definidos, métodos HTTP semánticos y respuestas JSON estructuradas.
- **Arquitectura por capas en el backend**: Separación en capas de rutas, controladores, servicios y modelos para facilitar el mantenimiento y la escalabilidad.
- **Componentes reutilizables en el frontend**: Diseño modular con componentes Vue.js independientes y reutilizables.

#### Seguridad
- **Autenticación JWT**: Implementación de JSON Web Tokens para autenticación stateless, con expiración configurable y renovación segura.
- **Middleware de protección**: Verificación de tokens y autorización basada en roles para proteger rutas sensibles.
- **Hash de contraseñas**: Uso de bcryptjs para almacenamiento seguro de contraseñas con salt dinámico.
- **Sanitización de entradas**: Implementación de express-mongo-sanitize y xss-clean para prevenir inyecciones y ataques XSS.
- **Headers de seguridad**: Uso de helmet para configurar headers HTTP de seguridad.
- **Rate limiting**: Protección contra ataques de fuerza bruta y abuso de API mediante express-rate-limit.
- **Validación de datos**: Validación exhaustiva tanto en frontend como en backend para garantizar integridad y seguridad.

#### Rendimiento y Escalabilidad
- **Índices de MongoDB**: Implementación de índices de texto y geoespaciales para búsquedas eficientes.
- **Paginación**: Resultados paginados en todas las consultas de listado para optimizar rendimiento.
- **Lazy loading**: Carga diferida de imágenes y componentes para mejorar tiempo de carga inicial.
- **Optimización de imágenes**: Uso de Cloudinary para transformación, optimización y entrega eficiente de imágenes.
- **Middleware de caché**: Implementación de caché para respuestas frecuentes y poco cambiantes.

#### Experiencia de Usuario
- **Diseño responsive**: Interfaz adaptable a diferentes dispositivos y tamaños de pantalla mediante Tailwind CSS.
- **Feedback inmediato**: Notificaciones toast para informar al usuario sobre el resultado de sus acciones.
- **Validación en tiempo real**: Feedback inmediato durante la entrada de datos en formularios.
- **Estado de carga**: Indicadores visuales durante operaciones asíncronas para mejorar la percepción de rendimiento.
- **Búsqueda avanzada**: Implementación de filtros intuitivos y geolocalización para facilitar la búsqueda de artículos cercanos.

## 🏗️ Estructura del Proyecto
```
ecommunitas/
├── backend/                  # API REST
│   ├── config/               # Configuración (DB, Cloudinary, índices)
│   │   ├── db.js             # Conexión a MongoDB
│   │   └── cloudinary.js     # Configuración de Cloudinary
│   ├── controllers/          # Lógica de negocio
│   │   ├── auth.js           # Autenticación y gestión de usuarios
│   │   ├── items.js          # CRUD de artículos
│   │   ├── itemsGeo.js       # Búsqueda avanzada y geoespacial
│   │   └── messages.js       # Sistema de mensajería
│   ├── middleware/           # Interceptores de peticiones
│   │   ├── auth.js           # Protección de rutas y autorización
│   │   ├── error.js          # Gestión centralizada de errores
│   │   ├── advancedResults.js # Paginación y filtrado
│   │   ├── async.js          # Manejo de excepciones asíncronas
│   │   └── upload.js         # Procesamiento de archivos
│   ├── models/               # Esquemas de datos
│   │   ├── User.js           # Modelo de usuario con métodos JWT
│   │   ├── Item.js           # Modelo de artículo con índice de texto
│   │   └── Message.js        # Modelo de mensajes con índices compuestos
│   ├── routes/               # Definición de endpoints RESTful
│   │   ├── auth.js           # Rutas de autenticación
│   │   ├── items.js          # Rutas de artículos
│   │   └── messages.js       # Rutas de mensajería
│   ├── tests/                # Pruebas unitarias e integración (Jest)
│   ├── uploads/              # Almacenamiento temporal de archivos
│   ├── utils/                # Utilidades
│   │   ├── errorResponse.js  # Clase para respuestas de error
│   │   └── logger.js         # Configuración de Winston
│   └── server.js             # Punto de entrada principal
├── frontend/                 # Aplicación Vue
│   ├── public/               # Assets estáticos
│   ├── src/
│   │   ├── assets/           # Recursos (imágenes, iconos, etc.)
│   │   ├── components/       # Componentes reutilizables
│   │   │   ├── ItemCard.vue  # Tarjeta de artículo
│   │   │   ├── SearchFilters.vue # Filtros de búsqueda avanzada
│   │   │   ├── MessageForm.vue # Formulario de mensajes
│   │   │   └── ItemForm.vue  # Formulario de creación/edición
│   │   ├── composables/      # Lógica reutilizable (hooks)
│   │   │   ├── useAuth.js    # Gestión de autenticación
│   │   │   └── useGeolocation.js # Obtención de coordenadas
│   │   ├── router/           # Configuración de rutas
│   │   │   └── index.js      # Definición de rutas y protección
│   │   ├── services/         # Servicios de API
│   │   │   ├── itemService.js # Comunicación con API de artículos
│   │   │   ├── authService.js # Comunicación con API de autenticación
│   │   │   └── messageService.js # Comunicación con API de mensajes
│   │   ├── stores/           # Estado global (Pinia)
│   │   │   ├── auth.js       # Estado de autenticación
│   │   │   └── items.js      # Estado de artículos
│   │   ├── views/            # Vistas principales
│   │   │   ├── HomeView.vue  # Página principal
│   │   │   ├── SearchView.vue # Búsqueda avanzada
│   │   │   ├── ItemDetailView.vue # Detalle de artículo
│   │   │   ├── MessagesView.vue # Sistema de mensajería
│   │   │   └── ProfileView.vue # Perfil de usuario
│   │   └── main.js           # Punto de entrada
│   └── vite.config.js        # Configuración de Vite
└── package.json              # Configuración del monorepo
```

### Frontend: Componentes y Servicios

#### Componentes
- **ItemCard.vue**: Muestra la información resumida de un artículo en forma de tarjeta, incluyendo imagen principal, título, descripción corta, categoría, condición, ubicación y fecha de creación. Se utiliza en las vistas de búsqueda y perfil.
- **SearchFilters.vue**: Implementa filtros avanzados para la búsqueda de artículos, incluyendo texto, categoría, condición, ubicación y distancia. Utiliza un slider para la distancia y selectores para categorías y condiciones.
- **MessageForm.vue**: Formulario para enviar mensajes entre usuarios, con validación de contenido y asociación con artículos específicos.
- **ItemForm.vue**: Formulario completo para creación y edición de artículos, con validación de campos, subida múltiple de imágenes y autocompletado de ubicación.

#### Composables
- **useAuth.js**: Proporciona funciones para gestionar la autenticación, incluyendo login, registro, verificación de token y cierre de sesión.
- **useGeolocation.js**: Obtiene las coordenadas del usuario mediante la API de Geolocalización del navegador, con manejo de permisos y errores.

#### Servicios
- **authService.js**: Gestiona la comunicación con la API de autenticación, incluyendo registro, login, recuperación de contraseña y actualización de perfil.
- **itemService.js**: Implementa la comunicación con la API de artículos, incluyendo creación, actualización, eliminación, búsqueda y cambio de disponibilidad.
- **messageService.js**: Gestiona la comunicación con la API de mensajes, incluyendo envío, lectura, listado de conversaciones y marcado como leído.

#### Stores (Pinia)
- **auth.js**: Mantiene el estado global de autenticación, incluyendo usuario actual, token JWT y estado de carga. Proporciona acciones para login, registro y cierre de sesión.
- **items.js**: Gestiona el estado global de artículos, incluyendo listados, filtros activos y estado de carga. Proporciona acciones para búsqueda, creación y actualización.

#### Vistas
- **HomeView.vue**: Página principal que muestra artículos destacados, categorías populares y llamadas a la acción para registro y búsqueda.
- **SearchView.vue**: Implementa la búsqueda avanzada de artículos, integrando SearchFilters y mostrando resultados en forma de grid con ItemCard.
- **ItemDetailView.vue**: Muestra la información completa de un artículo, incluyendo galería de imágenes, descripción, detalles del vendedor y formulario de contacto.
- **MessagesView.vue**: Gestiona el sistema de mensajería, mostrando conversaciones, mensajes individuales y formulario para responder.
- **ProfileView.vue**: Muestra y permite editar el perfil del usuario, incluyendo sus artículos publicados y mensajes recibidos.

### Backend: Organización y Arquitectura

#### Controladores
- **auth.js**: Implementa el registro, login, recuperación de contraseña y gestión de perfil de usuario. Incluye validaciones robustas de datos de entrada y generación segura de tokens JWT.
- **items.js**: Gestiona el CRUD completo de artículos, incluyendo la subida de imágenes a Cloudinary, validación de datos y asociación con usuarios.
- **itemsGeo.js**: Implementa la búsqueda avanzada con filtros de texto, categoría, condición y ubicación. Incluye búsqueda geoespacial por distancia y ordenación por relevancia.
- **messages.js**: Gestiona el sistema de mensajería, incluyendo envío, lectura y listado de conversaciones entre usuarios.

#### Middleware
- **auth.js**: Implementa la protección de rutas mediante verificación de JWT y autorización basada en roles (protect, authorize).
- **error.js**: Centraliza la gestión de errores para proporcionar respuestas coherentes y detalladas.
- **advancedResults.js**: Facilita la paginación, filtrado y ordenación de resultados en las consultas a la base de datos.
- **async.js**: Envuelve las funciones asíncronas para capturar excepciones y evitar código repetitivo.
- **upload.js**: Procesa la subida de archivos, validando tipos, tamaños y almacenamiento temporal.

#### Modelos
- **User.js**: Define el esquema de usuario con métodos para generación de JWT, comparación de contraseñas y recuperación de contraseña. Incluye hooks para encriptación automática de contraseñas.
- **Item.js**: Define el esquema de artículo con índices de texto para búsqueda eficiente. Incluye validaciones de campos obligatorios y enumeraciones para categorías y condiciones.
- **Message.js**: Define el esquema de mensajes con índices compuestos para búsqueda eficiente de conversaciones. Incluye referencias a usuarios y artículos.

#### Rutas
- **auth.js**: Define endpoints para registro, login, recuperación de contraseña y gestión de perfil.
- **items.js**: Define endpoints para CRUD de artículos, búsqueda y filtrado.
- **messages.js**: Define endpoints para envío, lectura y listado de mensajes y conversaciones.

## 🚀 Instalación y Configuración

### Prerrequisitos
- **Node.js** (versión 14 o superior) - [Descargar aquí](https://nodejs.org/)
- **npm** (incluido con Node.js) o **yarn**
- **MongoDB** (local o MongoDB Atlas) - [Configurar Atlas](https://www.mongodb.com/atlas)
- **Cuenta de Cloudinary** (para gestión de imágenes) - [Registrarse aquí](https://cloudinary.com/)
- **Git** para clonar el repositorio

### Instalación del Backend

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/Aguimoda/Ecommunitas.git
   cd Ecommunitas
   ```

2. **Instalar dependencias del backend**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   
   Crear un archivo `.env` en la raíz del proyecto:
   ```env
   # Configuración del servidor
   NODE_ENV=development
   PORT=5000
   
   # Base de datos MongoDB
   MONGODB_URI=mongodb://localhost:27017/ecommunitas
   # O para MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/ecommunitas
   
   # JWT Configuration
   JWT_SECRET=tu_jwt_secret_muy_seguro_y_largo_minimo_32_caracteres
   JWT_EXPIRE=30d
   JWT_COOKIE_EXPIRE=30
   
   # Cloudinary (Gestión de imágenes)
   CLOUDINARY_CLOUD_NAME=tu_cloud_name
   CLOUDINARY_API_KEY=tu_api_key
   CLOUDINARY_API_SECRET=tu_api_secret
   
   # Rate Limiting (Seguridad)
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX=100
   
   # Configuración de archivos (opcional)
   FILE_UPLOAD_PATH=./public/uploads
   MAX_FILE_UPLOAD=1000000
   ```

4. **Iniciar el servidor backend**
   ```bash
   # Producción
   npm start
   
   # Desarrollo (con auto-reload)
   npm run dev
   ```

### Instalación del Frontend

1. **Navegar al directorio frontend**
   ```bash
   cd frontend
   ```

2. **Instalar dependencias del frontend**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno del frontend**
   
   Crear un archivo `.env` en el directorio `frontend/`:
   ```env
   # URL de la API backend
   VITE_API_URL=http://localhost:5000/api/v1
   
   # Configuración de desarrollo
   VITE_APP_NAME=Ecommunitas
   VITE_APP_VERSION=1.0.0
   ```

4. **Iniciar el servidor de desarrollo frontend**
   ```bash
   npm run dev
   ```

5. **Construir para producción (opcional)**
   ```bash
   npm run build
   npm run preview
   ```

### Configuración de Base de Datos

#### Opción 1: MongoDB Local
1. Instalar MongoDB Community Edition
2. Iniciar el servicio MongoDB
3. Usar la URI: `mongodb://localhost:27017/ecommunitas`

#### Opción 2: MongoDB Atlas (Recomendado)
1. Crear cuenta en [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Crear un cluster gratuito
3. Configurar usuario y contraseña
4. Obtener la cadena de conexión
5. Reemplazar en `.env`: `MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/ecommunitas`

### Configuración de Cloudinary

1. Crear cuenta en [Cloudinary](https://cloudinary.com/)
2. Ir al Dashboard
3. Copiar:
   - **Cloud Name**
   - **API Key** 
   - **API Secret**
4. Agregar al archivo `.env` del backend

### Acceso a la Aplicación

- **Frontend (Aplicación Web)**: http://localhost:5173
- **Backend API**: http://localhost:5000/api/v1
- **Health Check**: http://localhost:5000/api/v1/health

### Verificación de Instalación

1. **Backend funcionando**: Visitar http://localhost:5000/api/v1/health
2. **Frontend funcionando**: Visitar http://localhost:5173
3. **Base de datos conectada**: Verificar logs del backend
4. **Cloudinary configurado**: Intentar subir una imagen de artículo

### Solución de Problemas Comunes

#### Error de conexión a MongoDB
- Verificar que MongoDB esté ejecutándose
- Comprobar la URI en `.env`
- Para Atlas, verificar IP whitelist

#### Error de Cloudinary
- Verificar credenciales en `.env`
- Comprobar límites de la cuenta gratuita

#### Puerto en uso
- Cambiar `PORT` en `.env`
- Verificar que no haya otros servicios usando el puerto

#### Problemas de CORS
- Verificar `VITE_API_URL` en frontend
- Comprobar configuración CORS en backend

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

## 🔌 API Endpoints

### 🔐 Autenticación (`/api/v1/auth`)

| Método | Endpoint | Descripción | Autenticación | Estado |
|--------|----------|-------------|---------------|--------|
| `POST` | `/register` | Registro de nuevo usuario | ❌ | ✅ |
| `POST` | `/login` | Inicio de sesión | ❌ | ✅ |
| `GET` | `/me` | Obtener perfil del usuario autenticado | ✅ | ✅ |
| `PUT` | `/updatedetails` | Actualizar detalles del usuario | ✅ | ✅ |
| `PUT` | `/updatepassword` | Actualizar contraseña | ✅ | ✅ |
| `POST` | `/forgotpassword` | Solicitar recuperación de contraseña | ❌ | ✅ |
| `PUT` | `/resetpassword/:resettoken` | Restablecer contraseña con token | ❌ | ✅ |
| `POST` | `/logout` | Cerrar sesión | ✅ | ✅ |

#### Detalles de Endpoints de Autenticación

**POST `/api/v1/auth/register`** - Registro de usuario
- **Parámetros**: `name`, `email`, `password`, `location`, `gdprConsent`
- **Validaciones**: Email único, contraseña mínimo 6 caracteres, GDPR obligatorio
- **Respuesta**: `{ success: true, token: "JWT", data: { user } }`

**POST `/api/v1/auth/login`** - Inicio de sesión
- **Parámetros**: `email`, `password`
- **Respuesta**: `{ success: true, token: "JWT", data: { user } }`
- **Rate Limiting**: Máximo 5 intentos por minuto

**GET `/api/v1/auth/me`** - Obtener usuario actual
- **Headers**: `Authorization: Bearer JWT`
- **Respuesta**: `{ success: true, data: { user } }`

**PUT `/api/v1/auth/updatedetails`** - Actualizar perfil
- **Headers**: `Authorization: Bearer JWT`
- **Parámetros**: `name`, `email`, `bio`, `location`, `avatar`
- **Respuesta**: `{ success: true, data: { user } }`

**PUT `/api/v1/auth/updatepassword`** - Cambiar contraseña
- **Headers**: `Authorization: Bearer JWT`
- **Parámetros**: `currentPassword`, `newPassword`
- **Respuesta**: `{ success: true, token: "JWT" }`

**POST `/api/v1/auth/forgotpassword`** - Solicitar recuperación
- **Parámetros**: `email`
- **Respuesta**: `{ success: true, data: { message: "Email enviado" } }`

**PUT `/api/v1/auth/resetpassword/:token`** - Restablecer contraseña
- **Parámetros**: `password`
- **Respuesta**: `{ success: true, token: "JWT", data: { user } }`

### 🛍️ Artículos (`/api/v1/items`)

| Método | Endpoint | Descripción | Autenticación | Estado |
|--------|----------|-------------|---------------|--------|
| `GET` | `/` | Obtener todos los artículos con paginación | ❌ | ✅ |
| `POST` | `/` | Crear nuevo artículo | ✅ | ✅ |
| `GET` | `/:id` | Obtener artículo específico por ID | ❌ | ✅ |
| `PUT` | `/:id` | Actualizar artículo (solo propietario) | ✅ | ✅ |
| `DELETE` | `/:id` | Eliminar artículo (solo propietario) | ✅ | ✅ |
| `PUT` | `/:id/availability` | Cambiar disponibilidad del artículo | ✅ | ✅ |
| `GET` | `/user/:userId` | Obtener artículos de un usuario específico | ❌ | ✅ |
| `GET` | `/search` | Búsqueda avanzada con filtros | ❌ | ✅ |
| `GET` | `/my` | Obtener artículos del usuario autenticado | ✅ | ✅ |

#### Detalles de Endpoints de Artículos

**GET `/api/v1/items`** - Obtener todos los artículos
- **Parámetros de consulta**: `category`, `condition`, `available`, `sort`, `page`, `limit`
- **Filtros disponibles**: 
  - `category`: books, electronics, clothing, furniture, other
  - `condition`: new, like_new, good, fair, poor
  - `available`: true/false
  - `sort`: createdAt, title, -createdAt (descendente)
- **Respuesta**: `{ success: true, count: 10, pagination: {...}, data: { items: [...] } }`

**POST `/api/v1/items`** - Crear artículo
- **Headers**: `Authorization: Bearer JWT`, `Content-Type: multipart/form-data`
- **Parámetros**: `title`, `description`, `category`, `condition`, `location`, `images[]`
- **Validaciones**: Título máximo 100 caracteres, descripción máximo 1000 caracteres
- **Imágenes**: Múltiples archivos, subida automática a Cloudinary
- **Respuesta**: `{ success: true, data: { item } }`

**GET `/api/v1/items/:id`** - Obtener artículo por ID
- **Población**: Incluye datos del usuario propietario
- **Respuesta**: `{ success: true, data: { item } }`

**PUT `/api/v1/items/:id`** - Actualizar artículo
- **Headers**: `Authorization: Bearer JWT`, `Content-Type: multipart/form-data`
- **Autorización**: Solo el propietario puede actualizar
- **Parámetros**: `title`, `description`, `category`, `condition`, `location`, `images[]`
- **Respuesta**: `{ success: true, data: { item } }`

**DELETE `/api/v1/items/:id`** - Eliminar artículo
- **Headers**: `Authorization: Bearer JWT`
- **Autorización**: Solo el propietario puede eliminar
- **Acción**: Elimina también las imágenes de Cloudinary
- **Respuesta**: `{ success: true, data: {} }`

**PUT `/api/v1/items/:id/availability`** - Cambiar disponibilidad
- **Headers**: `Authorization: Bearer JWT`
- **Parámetros**: `available` (boolean)
- **Autorización**: Solo el propietario
- **Respuesta**: `{ success: true, data: { item } }`

**GET `/api/v1/items/user/:userId`** - Artículos por usuario
- **Parámetros de consulta**: `available`, `sort`, `page`, `limit`
- **Respuesta**: `{ success: true, count: 5, pagination: {...}, data: { items: [...] } }`

**GET `/api/v1/items/search`** - Búsqueda avanzada
- **Parámetros de consulta**: 
  - `query`: Texto a buscar en título y descripción
  - `category`: Filtro por categoría
  - `condition`: Filtro por condición
  - `location`: Filtro por ubicación
  - `distance`: Radio de búsqueda (temporalmente desactivado)
  - `sort`: Ordenación (relevance, createdAt, -createdAt)
  - `page`, `limit`: Paginación
- **Índices**: Utiliza índices de texto de MongoDB para búsqueda eficiente
- **Respuesta**: `{ success: true, count: 8, pagination: {...}, data: { items: [...] } }`

### 💬 Mensajes (`/api/v1/messages`)

| Método | Endpoint | Descripción | Autenticación | Estado |
|--------|----------|-------------|---------------|--------|
| `GET` | `/` | Obtener todos los mensajes del usuario | ✅ | ✅ |
| `POST` | `/` | Enviar nuevo mensaje | ✅ | ✅ |
| `GET` | `/:id` | Obtener mensaje específico por ID | ✅ | ✅ |
| `DELETE` | `/:id` | Eliminar mensaje (solo remitente) | ✅ | ✅ |
| `PUT` | `/:id/read` | Marcar mensaje como leído | ✅ | ✅ |
| `PUT` | `/conversation/:userId/read` | Marcar conversación como leída | ✅ | ✅ |
| `GET` | `/conversations` | Obtener lista de conversaciones | ✅ | ✅ |
| `GET` | `/conversation/:userId` | Obtener conversación con usuario específico | ✅ | ✅ |
| `GET` | `/unread/count` | Obtener contador de mensajes no leídos | ✅ | ✅ |

#### Detalles de Endpoints de Mensajes

**GET `/api/v1/messages`** - Obtener mensajes del usuario
- **Headers**: `Authorization: Bearer JWT`
- **Parámetros de consulta**: `read`, `sort`, `page`, `limit`
- **Filtros**: 
  - `read`: true/false para filtrar por estado de lectura
  - `sort`: createdAt, -createdAt
- **Población**: Incluye datos de remitente, destinatario y artículo
- **Respuesta**: `{ success: true, count: 15, pagination: {...}, data: { messages: [...] } }`

**POST `/api/v1/messages`** - Enviar mensaje
- **Headers**: `Authorization: Bearer JWT`
- **Parámetros**: `recipient`, `content`, `item`
- **Validaciones**: 
  - Contenido máximo 500 caracteres
  - Destinatario debe existir
  - Artículo debe existir
  - No puede enviarse mensaje a sí mismo
- **Respuesta**: `{ success: true, data: { message } }`

**GET `/api/v1/messages/:id`** - Obtener mensaje por ID
- **Headers**: `Authorization: Bearer JWT`
- **Autorización**: Solo remitente o destinatario pueden ver el mensaje
- **Población**: Incluye datos completos de usuarios y artículo
- **Respuesta**: `{ success: true, data: { message } }`

**DELETE `/api/v1/messages/:id`** - Eliminar mensaje
- **Headers**: `Authorization: Bearer JWT`
- **Autorización**: Solo el remitente puede eliminar
- **Respuesta**: `{ success: true, data: {} }`

**PUT `/api/v1/messages/:id/read`** - Marcar mensaje como leído
- **Headers**: `Authorization: Bearer JWT`
- **Autorización**: Solo el destinatario puede marcar como leído
- **Acción**: Actualiza `readAt` con timestamp actual
- **Respuesta**: `{ success: true, data: { message } }`

**PUT `/api/v1/messages/conversation/:userId/read`** - Marcar conversación como leída
- **Headers**: `Authorization: Bearer JWT`
- **Acción**: Marca todos los mensajes no leídos de la conversación
- **Respuesta**: `{ success: true, data: { modifiedCount } }`

**GET `/api/v1/messages/conversations`** - Obtener conversaciones
- **Headers**: `Authorization: Bearer JWT`
- **Funcionalidad**: Agrupa mensajes por usuario y muestra el último mensaje
- **Datos**: Incluye contador de mensajes no leídos por conversación
- **Respuesta**: `{ success: true, data: { conversations: [...] } }`

**GET `/api/v1/messages/conversation/:userId`** - Conversación específica
- **Headers**: `Authorization: Bearer JWT`
- **Parámetros de consulta**: `item` (opcional, para filtrar por artículo)
- **Ordenación**: Mensajes ordenados por fecha de creación
- **Población**: Incluye datos de usuarios y artículo
- **Respuesta**: `{ success: true, data: { messages: [...] } }`

**GET `/api/v1/messages/unread/count`** - Contador de no leídos
- **Headers**: `Authorization: Bearer JWT`
- **Funcionalidad**: Cuenta mensajes no leídos del usuario autenticado
- **Respuesta**: `{ success: true, data: { count: 5 } }`

### 👥 Usuarios (`/api/v1/users`) - Solo Administradores

| Método | Endpoint | Descripción | Autenticación | Estado |
|--------|----------|-------------|---------------|--------|
| `GET` | `/` | Obtener todos los usuarios | ✅ Admin | ✅ |
| `GET` | `/:id` | Obtener perfil público de usuario | ❌ | ✅ |
| `PUT` | `/:id` | Actualizar usuario | ✅ Admin | ✅ |
| `DELETE` | `/:id` | Eliminar usuario | ✅ Admin | ✅ |
| `PUT` | `/:id/role` | Cambiar rol de usuario | ✅ Admin | ✅ |
| `PUT` | `/:id/status` | Activar/desactivar usuario | ✅ Admin | ✅ |

### 🔧 Sistema (`/api/v1`)

| Método | Endpoint | Descripción | Autenticación | Estado |
|--------|----------|-------------|---------------|--------|
| `GET` | `/health` | Health check del servidor | ❌ | ✅ |
| `GET` | `/stats` | Estadísticas del sistema | ✅ Admin | ⚠️ |

## 📊 Modelos de Datos

### 👤 Modelo de Usuario (`User.js`)
```javascript
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Por favor añade un nombre'],
    trim: true,
    maxlength: [50, 'El nombre no puede tener más de 50 caracteres']
  },
  email: {
    type: String,
    required: [true, 'Por favor añade un email'],
    unique: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Por favor añade un email válido']
  },
  password: {
    type: String,
    required: [true, 'Por favor añade una contraseña'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
    select: false
  },
  bio: {
    type: String,
    maxlength: [500, 'La biografía no puede tener más de 500 caracteres']
  },
  location: {
    type: String,
    required: [true, 'Por favor añade una ubicación']
  },
  avatar: {
    type: String,
    default: 'default-avatar.jpg'
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  lastLogin: Date,
  active: {
    type: Boolean,
    default: true
  },
  gdprConsent: {
    type: Boolean,
    required: [true, 'Debes aceptar la política de privacidad']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date
});

// Middleware pre-save para hash de contraseña
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Método para verificar contraseña
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Método para generar JWT
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Método para generar token de reset de contraseña
UserSchema.methods.getResetPasswordToken = function() {
  const resetToken = crypto.randomBytes(20).toString('hex');
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutos
  return resetToken;
};
```

### 📦 Modelo de Artículo (`Item.js`)
```javascript
const ItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Por favor añade un título'],
    trim: true,
    maxlength: [100, 'El título no puede tener más de 100 caracteres']
  },
  description: {
    type: String,
    required: [true, 'Por favor añade una descripción'],
    maxlength: [1000, 'La descripción no puede tener más de 1000 caracteres']
  },
  category: {
    type: String,
    required: [true, 'Por favor selecciona una categoría'],
    enum: ['muebles', 'electrodomesticos', 'ropa', 'juguetes', 'libros', 'deportes', 'otros']
  },
  condition: {
    type: String,
    required: [true, 'Por favor selecciona una condición'],
    enum: ['nuevo', 'como_nuevo', 'buen_estado', 'usado', 'necesita_reparacion']
  },
  location: {
    type: String,
    required: [true, 'Por favor añade una ubicación']
  },
  coordinates: {
    type: {
      type: String,
      enum: ['Point']
    },
    coordinates: {
      type: [Number],
      index: '2dsphere'
    }
  },
  imageUrls: {
    type: [String],
    required: [true, 'Por favor añade al menos una imagen'],
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: 'Debe incluir al menos una imagen'
    }
  },
  available: {
    type: Boolean,
    default: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  views: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Índice de texto para búsqueda eficiente
ItemSchema.index({ title: 'text', description: 'text' });

// Índices adicionales para optimización
ItemSchema.index({ available: 1, createdAt: -1 });
ItemSchema.index({ user: 1, available: 1 });
ItemSchema.index({ category: 1, available: 1 });
ItemSchema.index({ location: 1 });

// Middleware para actualizar updatedAt
ItemSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});
```

### 💬 Modelo de Mensaje (`Message.js`)
```javascript
const MessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Por favor añade un contenido al mensaje'],
    maxlength: [500, 'El mensaje no puede tener más de 500 caracteres'],
    trim: true
  },
  item: {
    type: mongoose.Schema.ObjectId,
    ref: 'Item',
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Índices para optimizar consultas de mensajes
MessageSchema.index({ sender: 1, recipient: 1, createdAt: -1 });
MessageSchema.index({ recipient: 1, read: 1 });
MessageSchema.index({ item: 1, createdAt: -1 });

// Índice compuesto para conversaciones
MessageSchema.index({ 
  $or: [
    { sender: 1, recipient: 1 },
    { sender: 1, recipient: 1 }
  ],
  createdAt: -1 
});

// Middleware para establecer readAt cuando se marca como leído
MessageSchema.pre('save', function(next) {
  if (this.isModified('read') && this.read && !this.readAt) {
    this.readAt = new Date();
  }
  next();
});

// Método estático para marcar conversación como leída
MessageSchema.statics.markConversationAsRead = function(userId, otherUserId) {
  return this.updateMany(
    {
      sender: otherUserId,
      recipient: userId,
      read: false
    },
    {
      read: true,
      readAt: new Date()
    }
  );
};

// Método estático para obtener conversaciones únicas
MessageSchema.statics.getConversations = function(userId) {
  return this.aggregate([
    {
      $match: {
        $or: [
          { sender: mongoose.Types.ObjectId(userId) },
          { recipient: mongoose.Types.ObjectId(userId) }
        ]
      }
    },
    {
      $sort: { createdAt: -1 }
    },
    {
      $group: {
        _id: {
          $cond: [
            { $eq: ['$sender', mongoose.Types.ObjectId(userId)] },
            '$recipient',
            '$sender'
          ]
        },
        lastMessage: { $first: '$$ROOT' },
        unreadCount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$recipient', mongoose.Types.ObjectId(userId)] },
                  { $eq: ['$read', false] }
                ]
              },
              1,
              0
            ]
          }
        }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'otherUser'
      }
    },
    {
      $lookup: {
        from: 'items',
        localField: 'lastMessage.item',
        foreignField: '_id',
        as: 'item'
      }
    },
    {
      $sort: { 'lastMessage.createdAt': -1 }
    }
  ]);
};
});

// Crear índice compuesto para búsqueda eficiente de conversaciones
MessageSchema.index({ sender: 1, recipient: 1, item: 1 });
```

## 🔄 Flujos Principales

### 🔐 Flujo de Autenticación

#### 1. **Registro de Usuario**
```mermaid
sequenceDiagram
    participant U as Usuario
    participant F as Frontend (Vue)
    participant B as Backend (Express)
    participant DB as MongoDB
    participant L as Winston Logger
    
    U->>F: Completa formulario registro
    F->>F: Validación frontend
    F->>B: POST /api/v1/auth/register
    B->>B: Validación backend
    B->>DB: Verificar email único
    B->>B: Hash contraseña (bcrypt)
    B->>DB: Crear usuario
    B->>B: Generar JWT token
    B->>L: Log evento registro
    B->>F: Respuesta con token y datos usuario
    F->>F: Almacenar token (localStorage)
    F->>F: Actualizar estado global (Pinia)
    F->>U: Redirección a dashboard
```

**Validaciones implementadas:**
- Email único en base de datos
- Contraseña mínimo 6 caracteres
- Nombre máximo 50 caracteres
- Ubicación requerida
- Aceptación GDPR obligatoria
- Rate limiting: 5 intentos por 15 minutos

#### 2. **Inicio de Sesión**
```mermaid
sequenceDiagram
    participant U as Usuario
    participant F as Frontend
    participant B as Backend
    participant DB as MongoDB
    
    U->>F: Email y contraseña
    F->>B: POST /api/v1/auth/login
    B->>DB: Buscar usuario por email
    B->>B: Verificar contraseña (bcrypt)
    B->>DB: Actualizar lastLogin
    B->>B: Generar JWT token
    B->>F: Token y datos usuario
    F->>F: Almacenar token
    F->>U: Acceso concedido
```

#### 3. **Protección de Rutas y Middleware**
- **Frontend**: Router guards verifican autenticación antes de acceder a rutas protegidas
- **Backend**: Middleware `auth.js` valida JWT en cada petición protegida
- **Autorización por roles**: Middleware `authorize.js` verifica permisos de admin
- **Rate limiting**: Protección contra ataques de fuerza bruta

### 📦 Flujo de Gestión de Artículos

#### 1. **Creación de Artículo**
```mermaid
sequenceDiagram
    participant U as Usuario
    participant F as Frontend
    participant B as Backend
    participant C as Cloudinary
    participant DB as MongoDB
    
    U->>F: Completa ItemForm.vue
    F->>F: Validación frontend
    F->>B: POST /api/v1/items (FormData)
    B->>B: Validación backend
    B->>C: Subir imágenes
    C->>B: URLs de imágenes
    B->>DB: Crear artículo
    B->>F: Artículo creado
    F->>U: Confirmación y redirección
```

**Características implementadas:**
- Subida múltiple de imágenes a Cloudinary
- Validación de tipos de archivo (imágenes)
- Compresión automática de imágenes
- Generación de thumbnails
- Validación de campos obligatorios
- Asociación automática con usuario autenticado

#### 2. **Búsqueda y Filtrado Avanzado**
```mermaid
sequenceDiagram
    participant U as Usuario
    participant F as SearchView.vue
    participant SF as SearchFilters.vue
    participant B as Backend
    participant DB as MongoDB
    
    U->>SF: Configura filtros
    SF->>F: Emite evento 'apply'
    F->>B: GET /api/v1/items/search
    B->>DB: Consulta con índices de texto
    DB->>B: Resultados paginados
    B->>F: Items + metadata paginación
    F->>U: Muestra resultados
```

**Filtros disponibles:**
- Búsqueda por texto (título, descripción)
- Filtro por categoría
- Filtro por condición
- Filtro por ubicación
- Ordenamiento (fecha, relevancia)
- Paginación (12 items por página)
- **Nota**: Filtro por distancia temporalmente desactivado
#### 3. **Gestión de Disponibilidad**
```mermaid
sequenceDiagram
    participant U as Usuario (Propietario)
    participant F as Frontend
    participant B as Backend
    participant DB as MongoDB
    
    U->>F: Cambiar disponibilidad
    F->>B: PUT /api/v1/items/:id/availability
    B->>B: Verificar propiedad
    B->>DB: Actualizar estado available
    B->>F: Confirmación
    F->>U: UI actualizada
```

**Características:**
- Verificación de propiedad del artículo
- Actualización en tiempo real de la interfaz
- Disponible desde `ItemDetailView.vue` y `ProfileView.vue`

### 💬 Flujo de Mensajería

#### 1. **Envío de Mensaje**
```mermaid
sequenceDiagram
    participant U as Usuario Interesado
    participant F as Frontend
    participant B as Backend
    participant DB as MongoDB
    participant N as Notificaciones
    
    U->>F: Completa formulario contacto (ItemDetailView)
    F->>F: Validación contenido
    F->>B: POST /api/v1/messages
    B->>B: Validar destinatario existe
    B->>DB: Crear mensaje
    B->>N: Notificar destinatario (futuro)
    B->>F: Mensaje enviado
    F->>U: Confirmación
```

**Validaciones implementadas:**
- Contenido máximo 500 caracteres
- Verificación de existencia del destinatario
- Referencia obligatoria al artículo
- Prevención de auto-mensajes

#### 2. **Gestión de Conversaciones**
```mermaid
sequenceDiagram
    participant U as Usuario
    participant F as MessagesView.vue
    participant B as Backend
    participant DB as MongoDB
    
    U->>F: Acceder a mensajes
    F->>B: GET /api/v1/messages/conversations
    B->>DB: Agregación de conversaciones
    DB->>B: Conversaciones agrupadas + conteo no leídos
    B->>F: Lista conversaciones
    F->>U: Muestra conversaciones
    
    U->>F: Seleccionar conversación
    F->>B: GET /api/v1/messages/conversation/:userId
    B->>DB: Mensajes de la conversación
    B->>DB: Marcar como leídos
    B->>F: Mensajes + estado actualizado
    F->>U: Vista conversación
```

**Funcionalidades implementadas:**
- Agrupación automática de mensajes por conversación
- Conteo de mensajes no leídos
- Marcado automático como leído al abrir conversación
- Ordenamiento por fecha del último mensaje
- Información del artículo asociado
- Datos del usuario remitente/destinatario

#### 3. **Estados de Mensaje**
- **Enviado**: Mensaje creado en base de datos
- **Entregado**: Mensaje visible para el destinatario
- **Leído**: Mensaje marcado como leído con timestamp
- **Eliminado**: Soft delete (futuro)

**Índices de optimización:**
- Índice compuesto para conversaciones
- Índice para mensajes no leídos
- Índice por artículo asociado

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

### ✅ Funcionalidades Completadas
- ✅ Sistema de autenticación completo (JWT, bcrypt, rate limiting)
- ✅ CRUD completo de artículos con validaciones
- ✅ Subida de imágenes a Cloudinary
- ✅ Sistema de mensajería básico
- ✅ Búsqueda con filtros y paginación
- ✅ Panel de administración básico
- ✅ Gestión de disponibilidad de artículos
- ✅ Logging con Winston
- ✅ Middleware de autorización por roles
- ✅ Índices de base de datos optimizados

### 🔄 En Desarrollo
- 🔄 **Filtro por distancia geográfica**: Temporalmente desactivado, requiere refinamiento
- 🔄 **Notificaciones en tiempo real**: Sistema de mensajería preparado para WebSockets
- 🔄 **Tests automatizados**: Estructura Jest configurada, pendiente cobertura completa
- 🔄 **Validaciones frontend mejoradas**: Algunos formularios requieren validación adicional

### 📋 Próximas Características (Prioridad Alta)
1. **Sistema de Notificaciones**
   - Notificaciones push para nuevos mensajes
   - Notificaciones por email
   - Centro de notificaciones en la aplicación

2. **Mejoras en Mensajería**
   - Indicadores de estado de mensaje (enviado, leído)
   - Búsqueda en conversaciones
   - Archivado de conversaciones
   - Eliminación de mensajes

3. **Funcionalidades de Intercambio**
   - Sistema de propuestas de intercambio
   - Historial de intercambios
   - Sistema de valoraciones/reputación
   - Favoritos y listas de deseos

### 📋 Mejoras Técnicas (Prioridad Media)
1. **Testing y Calidad**
   - Cobertura de tests al 80%
   - Tests de integración para APIs
   - Tests E2E con Cypress
   - Linting y formateo automático

2. **Performance y Escalabilidad**
   - Implementación de Redis para caché
   - Optimización de consultas MongoDB
   - CDN para imágenes
   - Compresión de respuestas

3. **Seguridad**
   - Validación de imágenes más estricta
   - Rate limiting por usuario
   - Logs de seguridad mejorados
   - Sanitización de contenido

### 📋 Funcionalidades Futuras (Prioridad Baja)
1. **Experiencia de Usuario**
   - Modo oscuro
   - Internacionalización (i18n)
   - PWA (Progressive Web App)
   - Accesibilidad mejorada

2. **Análisis y Métricas**
   - Dashboard de métricas para admins
   - Análisis de uso de la plataforma
   - Reportes de actividad
   - Integración con Google Analytics

3. **Integraciones Externas**
   - Login social (Google, Facebook)
   - Integración con mapas (Google Maps)
   - Sistema de pagos (futuro)
   - API pública para desarrolladores

### 🐛 Issues Conocidos
- **Filtro de distancia**: Desactivado temporalmente por problemas de precisión
- **Validación de imágenes**: Necesita mejoras en el frontend
- **Responsive design**: Algunos componentes requieren ajustes en móvil
- **Error handling**: Algunos errores no se muestran correctamente al usuario

### 🔧 Dependencias Técnicas
- **Base de datos**: Considerar migración a MongoDB Atlas para producción
- **Hosting**: Configuración para despliegue en Vercel/Netlify (frontend) y Railway/Heroku (backend)
- **Monitoreo**: Implementar Sentry para tracking de errores
- **CI/CD**: Pipeline de despliegue automático con GitHub Actions

## 🏗️ Arquitectura del Proyecto

### Arquitectura General
```mermaid
graph TB
    subgraph "Frontend (Vue.js 3)"
        A[Vue Router] --> B[Pinia Store]
        B --> C[Components]
        C --> D[Views]
        D --> E[API Services]
    end
    
    subgraph "Backend (Node.js + Express)"
        F[Express Server] --> G[Middleware]
        G --> H[Routes]
        H --> I[Controllers]
        I --> J[Models]
    end
    
    subgraph "Servicios Externos"
        K[MongoDB Atlas]
        L[Cloudinary]
        M[Winston Logger]
    end
    
    E --> F
    J --> K
    I --> L
    I --> M
```

### Patrones de Diseño Implementados

#### Frontend
- **Composition API**: Utilizado en todos los componentes Vue 3
- **Store Pattern**: Gestión de estado global con Pinia
- **Component Pattern**: Componentes reutilizables y modulares
- **Service Pattern**: Servicios API centralizados

#### Backend
- **MVC Pattern**: Separación clara entre modelos, vistas y controladores
- **Middleware Pattern**: Autenticación, autorización y logging
- **Repository Pattern**: Abstracción de acceso a datos
- **Factory Pattern**: Creación de respuestas API estandarizadas

### Estructura de Directorios Detallada

```
Ecommunitas/
├── 📁 backend/
│   ├── 📁 config/
│   │   ├── 📄 db.js              # Configuración MongoDB
│   │   └── 📄 cloudinary.js      # Configuración Cloudinary
│   ├── 📁 controllers/
│   │   ├── 📄 auth.js            # Autenticación y autorización
│   │   ├── 📄 items.js           # CRUD de artículos
│   │   ├── 📄 messages.js        # Sistema de mensajería
│   │   └── 📄 users.js           # Gestión de usuarios
│   ├── 📁 middleware/
│   │   ├── 📄 auth.js            # Verificación JWT
│   │   ├── 📄 authorize.js       # Autorización por roles
│   │   ├── 📄 error.js           # Manejo de errores
│   │   ├── 📄 logger.js          # Logging de requests
│   │   └── 📄 upload.js          # Subida de archivos
│   ├── 📁 models/
│   │   ├── 📄 User.js            # Esquema de usuario
│   │   ├── 📄 Item.js            # Esquema de artículo
│   │   └── 📄 Message.js         # Esquema de mensaje
│   ├── 📁 routes/
│   │   ├── 📄 auth.js            # Rutas de autenticación
│   │   ├── 📄 items.js           # Rutas de artículos
│   │   ├── 📄 messages.js        # Rutas de mensajes
│   │   └── 📄 users.js           # Rutas de usuarios
│   ├── 📁 utils/
│   │   ├── 📄 logger.js          # Configuración Winston
│   │   └── 📄 sendResponse.js    # Respuestas estandarizadas
│   ├── 📁 tests/
│   │   ├── 📄 auth.test.js       # Tests de autenticación
│   │   ├── 📄 items.test.js      # Tests de artículos
│   │   └── 📄 setup.js           # Configuración Jest
│   ├── 📄 server.js              # Punto de entrada del servidor
│   ├── 📄 package.json           # Dependencias backend
│   └── 📄 .env.example           # Variables de entorno ejemplo
├── 📁 frontend/
│   ├── 📁 public/
│   │   ├── 📄 index.html         # Template HTML principal
│   │   └── 📄 favicon.ico        # Icono de la aplicación
│   ├── 📁 src/
│   │   ├── 📁 components/
│   │   │   ├── 📁 common/
│   │   │   │   ├── 📄 AppHeader.vue      # Header principal
│   │   │   │   ├── 📄 AppFooter.vue      # Footer principal
│   │   │   │   ├── 📄 LoadingSpinner.vue # Spinner de carga
│   │   │   │   └── 📄 ErrorMessage.vue   # Mensajes de error
│   │   │   ├── 📁 forms/
│   │   │   │   ├── 📄 ItemForm.vue       # Formulario de artículos
│   │   │   │   ├── 📄 SearchFilters.vue  # Filtros de búsqueda
│   │   │   │   └── 📄 ContactForm.vue    # Formulario de contacto
│   │   │   └── 📁 items/
│   │   │       ├── 📄 ItemCard.vue       # Tarjeta de artículo
│   │   │       ├── 📄 ItemGrid.vue       # Grid de artículos
│   │   │       └── 📄 ItemDetail.vue     # Detalle de artículo
│   │   ├── 📁 views/
│   │   │   ├── 📄 HomeView.vue           # Página principal
│   │   │   ├── 📄 LoginView.vue          # Página de login
│   │   │   ├── 📄 RegisterView.vue       # Página de registro
│   │   │   ├── 📄 SearchView.vue         # Página de búsqueda
│   │   │   ├── 📄 ItemDetailView.vue     # Detalle de artículo
│   │   │   ├── 📄 ProfileView.vue        # Perfil de usuario
│   │   │   ├── 📄 MessagesView.vue       # Sistema de mensajes
│   │   │   └── 📄 AdminDashboard.vue     # Panel de administración
│   │   ├── 📁 router/
│   │   │   └── 📄 index.js               # Configuración de rutas
│   │   ├── 📁 stores/
│   │   │   ├── 📄 auth.js                # Store de autenticación
│   │   │   ├── 📄 items.js               # Store de artículos
│   │   │   └── 📄 messages.js            # Store de mensajes
│   │   ├── 📁 services/
│   │   │   ├── 📄 api.js                 # Cliente HTTP base
│   │   │   ├── 📄 authService.js         # Servicios de autenticación
│   │   │   ├── 📄 itemService.js         # Servicios de artículos
│   │   │   └── 📄 messageService.js      # Servicios de mensajes
│   │   ├── 📁 utils/
│   │   │   ├── 📄 constants.js           # Constantes de la aplicación
│   │   │   ├── 📄 validators.js          # Validadores frontend
│   │   │   └── 📄 formatters.js          # Formateadores de datos
│   │   ├── 📁 assets/
│   │   │   ├── 📁 images/                # Imágenes estáticas
│   │   │   └── 📁 styles/                # Estilos globales
│   │   ├── 📄 App.vue                    # Componente raíz
│   │   └── 📄 main.js                    # Punto de entrada
│   ├── 📄 package.json                   # Dependencias frontend
│   ├── 📄 vite.config.js                # Configuración Vite
│   └── 📄 tailwind.config.js            # Configuración Tailwind
├── 📄 README.md                          # Documentación principal
├── 📄 .gitignore                         # Archivos ignorados por Git
└── 📄 LICENSE                            # Licencia del proyecto
```

### Flujo de Datos

#### Frontend → Backend
1. **Usuario interactúa** con componente Vue
2. **Componente** llama a método del store (Pinia)
3. **Store** utiliza servicio API correspondiente
4. **Servicio** envía petición HTTP al backend
5. **Backend** procesa y responde
6. **Store** actualiza estado global
7. **Componente** se re-renderiza automáticamente

#### Autenticación y Autorización
1. **Login exitoso** → Token JWT almacenado en localStorage
2. **Cada petición** → Token incluido en header Authorization
3. **Middleware backend** → Verifica y decodifica token
4. **Autorización** → Verifica permisos según rol de usuario
5. **Acceso concedido/denegado** → Respuesta apropiada

## 📸 Screenshots

*Screenshots del proyecto serán añadidos próximamente*

## 🤝 Contribución

### Cómo Contribuir
1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Estándares de Código
- **Frontend**: ESLint + Prettier configurados
- **Backend**: ESLint con reglas de Node.js
- **Commits**: Conventional Commits
- **Testing**: Jest para backend, Vitest para frontend

### Reportar Issues
Utiliza las plantillas de GitHub Issues para:
- 🐛 Bug reports
- 💡 Feature requests
- 📚 Mejoras de documentación

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 👥 Autores

- **Equipo Ecommunitas** - *Desarrollo inicial* - [Aguimoda](https://github.com/Aguimoda)

## 🙏 Agradecimientos

- Comunidad Vue.js por la excelente documentación
- MongoDB por la base de datos flexible
- Cloudinary por el servicio de imágenes
- Tailwind CSS por el framework de estilos
- Todos los contribuidores del proyecto

