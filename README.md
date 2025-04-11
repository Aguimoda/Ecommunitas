# Ecommunitas

Plataforma de trueque local para fomentar la economía circular.

## Descripción

Ecommunitas es una aplicación web que permite a los usuarios publicar artículos que ya no utilizan para intercambiarlos con otros usuarios, fomentando así la economía circular y la sostenibilidad en la comunidad local.

## Estructura del Proyecto

- **frontend**: Aplicación Vue.js con Vite
- **backend**: API REST con Express y MongoDB

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
- Búsqueda y filtrado de artículos
- Visualización detallada de artículos
- Sistema de contacto entre usuarios

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

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo LICENSE para más detalles.