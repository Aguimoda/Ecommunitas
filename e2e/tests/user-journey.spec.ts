/**
 * @fileoverview Pruebas E2E del flujo completo de usuario en Ecommunitas
 * 
 * Estas pruebas verifican los flujos críticos de la aplicación desde
 * la perspectiva del usuario final, incluyendo registro, login,
 * publicación de artículos y navegación.
 */

import { test, expect } from '@playwright/test';

// Datos de prueba
const testUser = {
  name: 'Usuario E2E Test',
  email: `test-${Date.now()}@example.com`,
  password: 'Password123!'
};

const testItem = {
  title: 'Libro de Programación E2E',
  description: 'Libro sobre desarrollo web moderno en excelente estado. Perfecto para intercambio.',
  category: 'libros',
  condition: 'bueno'
};

test.describe('Flujo Completo de Usuario', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar a la página principal antes de cada test
    await page.goto('/');
  });

  test('Flujo completo: registro → login → publicar artículo → búsqueda', async ({ page }) => {
    // 1. REGISTRO DE USUARIO
    await test.step('Registro de nuevo usuario', async () => {
      await page.click('[data-testid="register-link"]');
      await expect(page).toHaveURL('/register');
      
      // Llenar formulario de registro
      await page.fill('[data-testid="name-input"]', testUser.name);
      await page.fill('[data-testid="email-input"]', testUser.email);
      await page.fill('[data-testid="password-input"]', testUser.password);
      await page.fill('[data-testid="confirm-password-input"]', testUser.password);
      
      // Aceptar términos y condiciones
      await page.check('[data-testid="terms-checkbox"]');
      
      // Enviar formulario
      await page.click('[data-testid="register-button"]');
      
      // Verificar redirección exitosa
      await expect(page).toHaveURL('/');
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    });

    // 2. VERIFICAR ESTADO DE AUTENTICACIÓN
    await test.step('Verificar usuario autenticado', async () => {
      // Verificar que aparece el menú de usuario autenticado
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
      await expect(page.locator('[data-testid="user-name"]')).toContainText(testUser.name);
      
      // Verificar que no aparecen los enlaces de login/registro
      await expect(page.locator('[data-testid="login-link"]')).not.toBeVisible();
      await expect(page.locator('[data-testid="register-link"]')).not.toBeVisible();
    });

    // 3. PUBLICAR ARTÍCULO
    await test.step('Publicar nuevo artículo', async () => {
      await page.click('[data-testid="post-item-button"]');
      await expect(page).toHaveURL('/post-item');
      
      // Llenar formulario de artículo
      await page.fill('[data-testid="title-input"]', testItem.title);
      await page.fill('[data-testid="description-textarea"]', testItem.description);
      await page.selectOption('[data-testid="category-select"]', testItem.category);
      await page.selectOption('[data-testid="condition-select"]', testItem.condition);
      
      // Simular selección de ubicación en el mapa
      await page.click('[data-testid="map-container"]');
      await page.waitForTimeout(1000); // Esperar a que se actualice la ubicación
      
      // Publicar artículo
      await page.click('[data-testid="publish-button"]');
      
      // Verificar publicación exitosa
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="success-message"]')).toContainText('Artículo publicado');
    });

    // 4. VERIFICAR ARTÍCULO EN PERFIL
    await test.step('Verificar artículo en perfil de usuario', async () => {
      await page.click('[data-testid="profile-link"]');
      await expect(page).toHaveURL('/profile');
      
      // Verificar que el artículo aparece en "Mis Artículos"
      await expect(page.locator('[data-testid="my-items-section"]')).toBeVisible();
      await expect(page.locator(`[data-testid="item-card"]:has-text("${testItem.title}")`)).toBeVisible();
    });

    // 5. BUSCAR ARTÍCULO PUBLICADO
    await test.step('Buscar artículo en la página principal', async () => {
      await page.goto('/');
      
      // Usar la búsqueda
      await page.fill('[data-testid="search-input"]', testItem.title.split(' ')[0]);
      await page.click('[data-testid="search-button"]');
      
      // Verificar resultados de búsqueda
      await expect(page).toHaveURL(/\/search/);
      await expect(page.locator(`[data-testid="search-result"]:has-text("${testItem.title}")`)).toBeVisible();
    });

    // 6. VER DETALLE DEL ARTÍCULO
    await test.step('Ver detalle del artículo', async () => {
      await page.click(`[data-testid="search-result"]:has-text("${testItem.title}")`);
      
      // Verificar que estamos en la página de detalle
      await expect(page).toHaveURL(/\/item\/\w+/);
      await expect(page.locator('[data-testid="item-title"]')).toContainText(testItem.title);
      await expect(page.locator('[data-testid="item-description"]')).toContainText(testItem.description);
      await expect(page.locator('[data-testid="item-owner"]')).toContainText(testUser.name);
    });
  });

  test('Flujo de logout y login existente', async ({ page }) => {
    // Primero registrar un usuario (reutilizando el flujo anterior simplificado)
    await page.click('[data-testid="register-link"]');
    await page.fill('[data-testid="name-input"]', testUser.name);
    await page.fill('[data-testid="email-input"]', testUser.email);
    await page.fill('[data-testid="password-input"]', testUser.password);
    await page.fill('[data-testid="confirm-password-input"]', testUser.password);
    await page.check('[data-testid="terms-checkbox"]');
    await page.click('[data-testid="register-button"]');
    
    // Esperar a que se complete el registro
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();

    // LOGOUT
    await test.step('Cerrar sesión', async () => {
      await page.click('[data-testid="user-menu"]');
      await page.click('[data-testid="logout-button"]');
      
      // Verificar que se cerró la sesión
      await expect(page.locator('[data-testid="login-link"]')).toBeVisible();
      await expect(page.locator('[data-testid="register-link"]')).toBeVisible();
      await expect(page.locator('[data-testid="user-menu"]')).not.toBeVisible();
    });

    // LOGIN
    await test.step('Iniciar sesión con usuario existente', async () => {
      await page.click('[data-testid="login-link"]');
      await expect(page).toHaveURL('/login');
      
      // Llenar formulario de login
      await page.fill('[data-testid="email-input"]', testUser.email);
      await page.fill('[data-testid="password-input"]', testUser.password);
      await page.click('[data-testid="login-button"]');
      
      // Verificar login exitoso
      await expect(page).toHaveURL('/');
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
      await expect(page.locator('[data-testid="user-name"]')).toContainText(testUser.name);
    });
  });

  test('Navegación y filtros en búsqueda', async ({ page }) => {
    await test.step('Navegar a página de búsqueda', async () => {
      await page.click('[data-testid="search-link"]');
      await expect(page).toHaveURL('/search');
    });

    await test.step('Aplicar filtros de búsqueda', async () => {
      // Filtrar por categoría
      await page.selectOption('[data-testid="category-filter"]', 'libros');
      
      // Filtrar por condición
      await page.selectOption('[data-testid="condition-filter"]', 'bueno');
      
      // Aplicar filtros
      await page.click('[data-testid="apply-filters-button"]');
      
      // Verificar que se aplicaron los filtros
      await expect(page.locator('[data-testid="active-filters"]')).toContainText('libros');
      await expect(page.locator('[data-testid="active-filters"]')).toContainText('bueno');
    });

    await test.step('Cambiar ordenamiento', async () => {
      await page.selectOption('[data-testid="sort-select"]', 'recent');
      
      // Verificar que se actualizaron los resultados
      await page.waitForLoadState('networkidle');
      await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    });
  });

  test('Responsividad en dispositivos móviles', async ({ page }) => {
    // Este test se ejecutará automáticamente en dispositivos móviles
    // según la configuración de playwright.config.ts
    
    await test.step('Verificar menú móvil', async () => {
      // En móvil, el menú debería estar colapsado
      const viewport = page.viewportSize();
      if (viewport && viewport.width < 768) {
        await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();
        
        // Abrir menú móvil
        await page.click('[data-testid="mobile-menu-button"]');
        await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
      }
    });

    await test.step('Verificar formularios en móvil', async () => {
      await page.goto('/register');
      
      // Verificar que los campos son accesibles en móvil
      await expect(page.locator('[data-testid="name-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="email-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="password-input"]')).toBeVisible();
    });
  });
});

test.describe('Manejo de Errores', () => {
  test('Manejo de errores en formularios', async ({ page }) => {
    await page.goto('/register');

    await test.step('Validación de campos requeridos', async () => {
      // Intentar enviar formulario vacío
      await page.click('[data-testid="register-button"]');
      
      // Verificar mensajes de error
      await expect(page.locator('[data-testid="name-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="password-error"]')).toBeVisible();
    });

    await test.step('Validación de formato de email', async () => {
      await page.fill('[data-testid="email-input"]', 'email-invalido');
      await page.click('[data-testid="register-button"]');
      
      await expect(page.locator('[data-testid="email-error"]')).toContainText('formato válido');
    });

    await test.step('Validación de contraseña', async () => {
      await page.fill('[data-testid="password-input"]', '123');
      await page.click('[data-testid="register-button"]');
      
      await expect(page.locator('[data-testid="password-error"]')).toContainText('8 caracteres');
    });
  });

  test('Manejo de errores de red', async ({ page }) => {
    // Simular error de red
    await page.route('**/api/v1/auth/register', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, error: 'Error del servidor' })
      });
    });

    await page.goto('/register');
    await page.fill('[data-testid="name-input"]', testUser.name);
    await page.fill('[data-testid="email-input"]', testUser.email);
    await page.fill('[data-testid="password-input"]', testUser.password);
    await page.fill('[data-testid="confirm-password-input"]', testUser.password);
    await page.check('[data-testid="terms-checkbox"]');
    await page.click('[data-testid="register-button"]');

    // Verificar manejo del error
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Error del servidor');
  });
});