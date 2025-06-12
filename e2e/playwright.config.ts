/**
 * @fileoverview Configuración de Playwright para pruebas E2E de Ecommunitas
 * 
 * Este archivo configura Playwright para ejecutar pruebas end-to-end
 * en múltiples navegadores y dispositivos, con captura de screenshots
 * y videos en caso de fallos.
 */

import { defineConfig, devices } from '@playwright/test';

/**
 * Configuración de Playwright
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  
  /* Ejecutar tests en paralelo */
  fullyParallel: true,
  
  /* Fallar si se deja test.only en CI */
  forbidOnly: !!process.env.CI,
  
  /* Reintentos en CI */
  retries: process.env.CI ? 2 : 0,
  
  /* Workers en CI vs local */
  workers: process.env.CI ? 1 : undefined,
  
  /* Reporter para generar reportes HTML */
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results.json' }],
    ['junit', { outputFile: 'test-results.xml' }]
  ],
  
  /* Configuración global para todos los tests */
  use: {
    /* URL base para navegación */
    baseURL: 'http://localhost:5173',
    
    /* Capturar trace en primer reintento */
    trace: 'on-first-retry',
    
    /* Screenshot solo en fallos */
    screenshot: 'only-on-failure',
    
    /* Video solo en fallos */
    video: 'retain-on-failure',
    
    /* Timeout para acciones */
    actionTimeout: 10000,
    
    /* Timeout para navegación */
    navigationTimeout: 30000,
  },

  /* Configuración de proyectos para diferentes navegadores */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Tests en dispositivos móviles */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },

    /* Tests en tablets */
    {
      name: 'Tablet',
      use: { ...devices['iPad Pro'] },
    },
  ],

  /* Configuración del servidor de desarrollo */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 minutos
  },

  /* Configuración de timeouts globales */
  timeout: 30 * 1000, // 30 segundos por test
  expect: {
    timeout: 5 * 1000, // 5 segundos para assertions
  },

  /* Configuración de directorios */
  outputDir: 'test-results/',
  
  /* Configuración de metadatos */
  metadata: {
    project: 'Ecommunitas E2E Tests',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'test'
  }
});