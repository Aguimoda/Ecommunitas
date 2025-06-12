// Configuración de PostCSS para el frontend de Ecommunitas
// PostCSS es una herramienta para transformar CSS con plugins de JavaScript.
// Este archivo configura los plugins necesarios para procesar el CSS de la aplicación,
// incluyendo Tailwind CSS y Autoprefixer para compatibilidad cross-browser.

export default {
  plugins: {
    // Tailwind CSS - Framework de utilidades CSS
    // Procesa las directivas @tailwind y genera clases utilitarias
    tailwindcss: {},
    
    // Autoprefixer - Añade prefijos de vendor automáticamente
    // Basado en la configuración de browserslist en package.json
    autoprefixer: {},
  },
}