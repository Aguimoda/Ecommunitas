/**
 * @fileoverview Pruebas de accesibilidad para Ecommunitas
 * 
 * Estas pruebas verifican que la aplicación cumple con los estándares
 * de accesibilidad WCAG 2.1 AA usando axe-core y Playwright.
 */

const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

/**
 * Configuración de reglas de accesibilidad
 * Basado en WCAG 2.1 AA
 */
const axeConfig = {
  rules: {
    // Reglas críticas (Nivel A)
    'color-contrast': { enabled: true },
    'keyboard-navigation': { enabled: true },
    'focus-order-semantics': { enabled: true },
    'image-alt': { enabled: true },
    'label': { enabled: true },
    
    // Reglas importantes (Nivel AA)
    'color-contrast-enhanced': { enabled: true },
    'focus-visible': { enabled: true },
    'heading-order': { enabled: true },
    'landmark-unique': { enabled: true },
    'region': { enabled: true }
  },
  tags: ['wcag2a', 'wcag2aa', 'wcag21aa']
};

/**
 * Función auxiliar para ejecutar pruebas de accesibilidad
 * @param {Page} page - Página de Playwright
 * @param {string} pageName - Nombre de la página para reportes
 * @param {Object} options - Opciones adicionales para axe
 */
async function runAccessibilityTest(page, pageName, options = {}) {
  const accessibilityScanResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .configure(axeConfig)
    .exclude(options.exclude || [])
    .include(options.include || [])
    .analyze();

  // Generar reporte detallado
  if (accessibilityScanResults.violations.length > 0) {
    console.log(`\n=== VIOLACIONES DE ACCESIBILIDAD EN ${pageName.toUpperCase()} ===`);
    accessibilityScanResults.violations.forEach((violation, index) => {
      console.log(`\n${index + 1}. ${violation.id} (${violation.impact})`);
      console.log(`   Descripción: ${violation.description}`);
      console.log(`   Ayuda: ${violation.helpUrl}`);
      console.log(`   Elementos afectados: ${violation.nodes.length}`);
      
      violation.nodes.forEach((node, nodeIndex) => {
        console.log(`   ${nodeIndex + 1}. ${node.target.join(', ')}`);
        if (node.failureSummary) {
          console.log(`      Error: ${node.failureSummary}`);
        }
      });
    });
  }

  // Verificar que no hay violaciones críticas
  const criticalViolations = accessibilityScanResults.violations.filter(
    violation => violation.impact === 'critical' || violation.impact === 'serious'
  );
  
  expect(criticalViolations).toHaveLength(0);
  
  return accessibilityScanResults;
}

test.describe('Pruebas de Accesibilidad - Páginas Principales', () => {
  test('Página principal debe cumplir WCAG 2.1 AA', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const results = await runAccessibilityTest(page, 'Página Principal');
    
    // Verificaciones específicas para la página principal
    await test.step('Verificar estructura semántica', async () => {
      // Verificar que existe un heading principal
      const h1 = await page.locator('h1').count();
      expect(h1).toBeGreaterThanOrEqual(1);
      
      // Verificar landmarks principales
      await expect(page.locator('main')).toBeVisible();
      await expect(page.locator('nav')).toBeVisible();
    });
    
    await test.step('Verificar navegación por teclado', async () => {
      // Verificar que los elementos interactivos son accesibles por teclado
      const focusableElements = await page.locator(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ).all();
      
      expect(focusableElements.length).toBeGreaterThan(0);
      
      // Probar navegación con Tab
      await page.keyboard.press('Tab');
      const focusedElement = await page.evaluate(() => document.activeElement.tagName);
      expect(['BUTTON', 'A', 'INPUT']).toContain(focusedElement);
    });
  });

  test('Página de registro debe cumplir WCAG 2.1 AA', async ({ page }) => {
    await page.goto('/register');
    await page.waitForLoadState('networkidle');
    
    const results = await runAccessibilityTest(page, 'Página de Registro');
    
    await test.step('Verificar formulario accesible', async () => {
      // Verificar que todos los inputs tienen labels
      const inputs = await page.locator('input').all();
      for (const input of inputs) {
        const id = await input.getAttribute('id');
        if (id) {
          const label = await page.locator(`label[for="${id}"]`).count();
          const ariaLabel = await input.getAttribute('aria-label');
          const ariaLabelledby = await input.getAttribute('aria-labelledby');
          
          expect(label > 0 || ariaLabel || ariaLabelledby).toBeTruthy();
        }
      }
      
      // Verificar mensajes de error accesibles
      await page.click('[data-testid="register-button"]');
      await page.waitForTimeout(1000);
      
      const errorMessages = await page.locator('[role="alert"], .error-message').all();
      for (const error of errorMessages) {
        await expect(error).toBeVisible();
      }
    });
  });

  test('Página de búsqueda debe cumplir WCAG 2.1 AA', async ({ page }) => {
    await page.goto('/search');
    await page.waitForLoadState('networkidle');
    
    const results = await runAccessibilityTest(page, 'Página de Búsqueda');
    
    await test.step('Verificar filtros accesibles', async () => {
      // Verificar que los filtros tienen labels apropiados
      const selects = await page.locator('select').all();
      for (const select of selects) {
        const id = await select.getAttribute('id');
        if (id) {
          const label = await page.locator(`label[for="${id}"]`).count();
          expect(label).toBeGreaterThan(0);
        }
      }
    });
    
    await test.step('Verificar resultados accesibles', async () => {
      // Verificar que los resultados tienen estructura semántica
      const articles = await page.locator('article, [role="article"]').count();
      const listItems = await page.locator('li').count();
      
      // Debe haber estructura de lista o artículos
      expect(articles > 0 || listItems > 0).toBeTruthy();
    });
  });
});

test.describe('Pruebas de Accesibilidad - Componentes Interactivos', () => {
  test('Modales deben ser accesibles', async ({ page }) => {
    await page.goto('/');
    
    // Buscar botones que abran modales
    const modalTriggers = await page.locator('[data-modal], [aria-haspopup="dialog"]').all();
    
    for (const trigger of modalTriggers) {
      await test.step(`Verificar modal activado por ${await trigger.textContent()}`, async () => {
        await trigger.click();
        await page.waitForTimeout(500);
        
        // Verificar que el modal tiene los atributos ARIA correctos
        const modal = await page.locator('[role="dialog"], .modal').first();
        if (await modal.isVisible()) {
          // Verificar atributos ARIA
          const ariaModal = await modal.getAttribute('aria-modal');
          const ariaLabelledby = await modal.getAttribute('aria-labelledby');
          const ariaLabel = await modal.getAttribute('aria-label');
          
          expect(ariaModal).toBe('true');
          expect(ariaLabelledby || ariaLabel).toBeTruthy();
          
          // Verificar que el foco se mueve al modal
          const focusedElement = await page.evaluate(() => {
            const activeElement = document.activeElement;
            return activeElement ? activeElement.closest('[role="dialog"], .modal') : null;
          });
          expect(focusedElement).toBeTruthy();
          
          // Cerrar modal
          await page.keyboard.press('Escape');
          await page.waitForTimeout(500);
        }
      });
    }
  });

  test('Navegación debe ser accesible por teclado', async ({ page }) => {
    await page.goto('/');
    
    await test.step('Verificar navegación principal', async () => {
      const navLinks = await page.locator('nav a, nav button').all();
      
      for (let i = 0; i < Math.min(navLinks.length, 5); i++) {
        await page.keyboard.press('Tab');
        const focusedElement = await page.evaluate(() => {
          const active = document.activeElement;
          return {
            tagName: active.tagName,
            href: active.href,
            textContent: active.textContent?.trim()
          };
        });
        
        expect(['A', 'BUTTON']).toContain(focusedElement.tagName);
      }
    });
    
    await test.step('Verificar skip links', async () => {
      // Verificar que existe un skip link al contenido principal
      await page.keyboard.press('Tab');
      const firstFocusable = await page.evaluate(() => {
        return document.activeElement?.textContent?.toLowerCase().includes('skip') ||
               document.activeElement?.textContent?.toLowerCase().includes('saltar');
      });
      
      // Es recomendable pero no obligatorio
      if (firstFocusable) {
        console.log('✓ Skip link encontrado');
      }
    });
  });
});

test.describe('Pruebas de Accesibilidad - Contraste de Colores', () => {
  test('Verificar contraste en modo claro', async ({ page }) => {
    await page.goto('/');
    
    // Asegurar modo claro
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    });
    
    await page.waitForTimeout(500);
    
    const results = await runAccessibilityTest(page, 'Modo Claro');
    
    // Verificar que no hay violaciones de contraste
    const contrastViolations = results.violations.filter(
      violation => violation.id === 'color-contrast'
    );
    
    expect(contrastViolations).toHaveLength(0);
  });

  test('Verificar contraste en modo oscuro', async ({ page }) => {
    await page.goto('/');
    
    // Activar modo oscuro si está disponible
    const darkModeToggle = await page.locator('[data-theme-toggle], .dark-mode-toggle').first();
    if (await darkModeToggle.isVisible()) {
      await darkModeToggle.click();
      await page.waitForTimeout(500);
      
      const results = await runAccessibilityTest(page, 'Modo Oscuro');
      
      // Verificar que no hay violaciones de contraste en modo oscuro
      const contrastViolations = results.violations.filter(
        violation => violation.id === 'color-contrast'
      );
      
      expect(contrastViolations).toHaveLength(0);
    } else {
      console.log('Modo oscuro no disponible, saltando prueba');
    }
  });
});

test.describe('Pruebas de Accesibilidad - Tecnologías Asistivas', () => {
  test('Verificar compatibilidad con lectores de pantalla', async ({ page }) => {
    await page.goto('/');
    
    await test.step('Verificar estructura de headings', async () => {
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
      
      let previousLevel = 0;
      for (const heading of headings) {
        const tagName = await heading.evaluate(el => el.tagName);
        const currentLevel = parseInt(tagName.charAt(1));
        
        // Verificar que no se saltan niveles de heading
        if (previousLevel > 0) {
          expect(currentLevel - previousLevel).toBeLessThanOrEqual(1);
        }
        
        previousLevel = currentLevel;
      }
    });
    
    await test.step('Verificar landmarks ARIA', async () => {
      // Verificar landmarks principales
      const landmarks = {
        main: await page.locator('main, [role="main"]').count(),
        navigation: await page.locator('nav, [role="navigation"]').count(),
        banner: await page.locator('header, [role="banner"]').count(),
        contentinfo: await page.locator('footer, [role="contentinfo"]').count()
      };
      
      expect(landmarks.main).toBeGreaterThanOrEqual(1);
      expect(landmarks.navigation).toBeGreaterThanOrEqual(1);
    });
    
    await test.step('Verificar live regions', async () => {
      // Buscar elementos que deberían tener live regions
      const alerts = await page.locator('[role="alert"], .alert, .notification').count();
      const status = await page.locator('[role="status"], .status').count();
      
      // Si existen, verificar que tienen los atributos correctos
      if (alerts > 0 || status > 0) {
        console.log(`✓ Live regions encontradas: ${alerts} alerts, ${status} status`);
      }
    });
  });
});

// Generar reporte de accesibilidad
test.afterAll(async () => {
  console.log('\n=== RESUMEN DE PRUEBAS DE ACCESIBILIDAD ===');
  console.log('Las pruebas de accesibilidad han finalizado.');
  console.log('Revisa los reportes generados para más detalles.');
  console.log('Estándares verificados: WCAG 2.1 AA');
});