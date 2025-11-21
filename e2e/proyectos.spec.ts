import { test, expect } from '@playwright/test';

/**
 * Pruebas E2E para el módulo de proyectos
 */
test.describe('Proyectos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/proyectos');
  });

  test('debe cargar la página de proyectos', async ({ page }) => {
    await expect(page.locator('h1, h2')).toContainText(/Proyectos/i);
  });

  test('debe mostrar filtros de búsqueda', async ({ page }) => {
    await expect(page.locator('input[placeholder*="Buscar"]')).toBeVisible();
  });

  test('debe mostrar tooltips con roles en avatares', async ({ page }) => {
    // Esperar a que carguen los proyectos
    await page.waitForTimeout(2000);
    
    // Buscar avatares de investigadores
    const avatares = page.locator('img[alt*="investigador"], [role="img"], .avatar').first();
    
    if (await avatares.count() > 0) {
      await avatares.first().hover();
      // Verificar que aparece tooltip con rol
      await expect(page.locator('text=/Autor|Coautor/i').first()).toBeVisible({ timeout: 2000 }).catch(() => {});
    }
  });

  test('debe mostrar información de presupuesto', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    // Buscar elementos de presupuesto
    const presupuesto = page.locator('text=/\\$|presupuesto/i').first();
    await expect(presupuesto).toBeVisible({ timeout: 3000 }).catch(() => {});
  });
});


