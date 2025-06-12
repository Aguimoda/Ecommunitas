/**
 * @fileoverview Configuración de Tailwind CSS para Ecommunitas Frontend
 * 
 * Este archivo configura Tailwind CSS, un framework de CSS utilitario que permite
 * crear interfaces de usuario modernas y responsivas de manera eficiente.
 * 
 * Características principales:
 * - Modo oscuro basado en clases CSS
 * - Configuración de contenido para purgar CSS no utilizado
 * - Extensiones del tema base de Tailwind
 * - Configuración de plugins adicionales
 * 
 * Arquitectura:
 * - content: Define qué archivos escanear para clases de Tailwind
 * - darkMode: Configura el modo de activación del tema oscuro
 * - theme: Personaliza y extiende el sistema de diseño
 * - plugins: Añade funcionalidades adicionales
 * 
 * Optimización:
 * - PurgeCSS automático en producción
 * - Tree-shaking de clases no utilizadas
 * - Minificación automática del CSS final
 * 
 * @author Equipo de Desarrollo Ecommunitas
 * @version 1.0.0
 * @since 2024
 */

/** @type {import('tailwindcss').Config} */
export default {
  // Configuración de contenido - Define qué archivos escanear para clases de Tailwind
  // Esto permite a Tailwind eliminar CSS no utilizado en producción (PurgeCSS)
  content: [
    "./index.html",                    // Archivo HTML principal
    "./src/**/*.{vue,js,ts,jsx,tsx}", // Todos los archivos de componentes y scripts
  ],
  
  // Configuración del modo oscuro
  // 'class' significa que el modo oscuro se activa añadiendo la clase 'dark' al elemento HTML
  // Alternativa: 'media' usaría la preferencia del sistema operativo
  darkMode: 'class',
  
  // Configuración del tema - Personaliza y extiende el sistema de diseño de Tailwind
  theme: {
    extend: {
      // Colores personalizados para la marca Ecommunitas
      colors: {
        // Paleta principal de la marca
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',  // Color principal
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        // Colores secundarios para elementos de apoyo
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',  // Color secundario
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        // Colores para estados y acciones
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
      },
      
      // Tipografía personalizada
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Poppins', 'system-ui', 'sans-serif'],
      },
      
      // Espaciado personalizado
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      
      // Bordes redondeados personalizados
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      
      // Sombras personalizadas
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'strong': '0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 4px 25px -5px rgba(0, 0, 0, 0.1)',
      },
      
      // Animaciones personalizadas
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-soft': 'bounceSoft 0.6s ease-in-out',
      },
      
      // Keyframes para las animaciones
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceSoft: {
          '0%, 20%, 53%, 80%, 100%': { transform: 'translate3d(0,0,0)' },
          '40%, 43%': { transform: 'translate3d(0, -5px, 0)' },
          '70%': { transform: 'translate3d(0, -3px, 0)' },
          '90%': { transform: 'translate3d(0, -1px, 0)' },
        },
      },
    },
  },
  
  // Plugins de Tailwind CSS
  // Aquí se pueden añadir plugins oficiales o de terceros para extender funcionalidades
  plugins: [
    // Ejemplos de plugins útiles (comentados para referencia):
    // require('@tailwindcss/forms'),        // Estilos mejorados para formularios
    // require('@tailwindcss/typography'),   // Estilos para contenido tipográfico
    // require('@tailwindcss/aspect-ratio'), // Utilidades para aspect ratio
    // require('@tailwindcss/line-clamp'),   // Utilidades para truncar texto
  ],
}