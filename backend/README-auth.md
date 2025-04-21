# Sistema de Autenticación - Ecommunitas

## Descripción General
Este módulo implementa un sistema completo de autenticación y gestión de usuarios para la plataforma Ecommunitas, con énfasis en seguridad, validaciones robustas y cumplimiento de RGPD.

## Características Principales

- ✅ Registro seguro con validaciones completas
- ✅ Inicio de sesión con JWT
- ✅ Restablecimiento de contraseñas
- ✅ Protección de rutas basada en roles
- ✅ Logs detallados para auditoría
- ✅ Cumplimiento de normativas RGPD

## Estructura de Archivos

```
├── controllers/
│   └── auth.js         # Controlador de autenticación
├── models/
│   └── User.js         # Modelo de usuario
├── middleware/
│   ├── auth.js         # Middleware de protección de rutas
│   └── async.js        # Manejador de errores asíncronos
├── routes/
│   └── auth.js         # Rutas de autenticación
├── utils/
│   └── errorResponse.js # Clase para respuestas de error
├── tests/
│   └── auth.test.js    # Pruebas unitarias
└── docs/
    └── auth-flow.md    # Documentación detallada
```

## Endpoints API

| Método | Ruta | Descripción | Acceso |
|--------|------|-------------|--------|
| POST | `/api/v1/auth/register` | Registro de usuario | Público |
| POST | `/api/v1/auth/login` | Inicio de sesión | Público |
| GET | `/api/v1/auth/me` | Obtener perfil de usuario | Privado |
| POST | `/api/v1/auth/forgotpassword` | Solicitar restablecimiento | Público |
| PUT | `/api/v1/auth/resetpassword/:resettoken` | Restablecer contraseña | Público |

## Validaciones Implementadas

### Usuario
- **Nombre**: 2-50 caracteres
- **Email**: Formato válido, único en la base de datos
- **Contraseña**: Mínimo 8 caracteres, al menos una mayúscula, un número y un carácter especial

## Seguridad

- Contraseñas cifradas con bcrypt
- Tokens JWT con tiempo de expiración
- Cookies HttpOnly y Secure en producción
- Protección contra CSRF
- Logs detallados con identificadores únicos por solicitud

## Cómo Ejecutar las Pruebas

```bash
# Instalar dependencias de desarrollo
npm install --save-dev jest supertest mongodb-memory-server

# Ejecutar todas las pruebas
npm test

# Ejecutar solo pruebas de autenticación
npm test -- tests/auth.test.js
```

## Mejoras Implementadas

1. **Validaciones robustas**:
   - Verificación previa de email existente
   - Validación completa de contraseña
   - Mensajes de error específicos en español

2. **Seguridad mejorada**:
   - Sistema de logs para auditoría
   - Manejo específico de errores de MongoDB
   - Protección contra ataques comunes

3. **Cumplimiento RGPD**:
   - Registro de consentimiento
   - Campos para gestión de datos personales
   - Seguridad en almacenamiento

## Documentación Adicional

Para una explicación detallada del flujo de autenticación, validaciones y consideraciones de seguridad, consulte el archivo [auth-flow.md](./docs/auth-flow.md).