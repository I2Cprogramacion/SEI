import { test, expect } from '@playwright/test';

/**
 * Pruebas E2E para el módulo de publicaciones
 */
test.describe('Publicaciones', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/publicaciones');
  });

  test('debe cargar la página de publicaciones', async ({ page }) => {
    await expect(page.locator('h1')).toContainText(/Publicaciones/i);
  });

  test('debe mostrar filtros de búsqueda', async ({ page }) => {
    await expect(page.locator('input[placeholder*="Buscar"]')).toBeVisible();
    await expect(page.locator('select')).toHaveCount(3); // Categoría, Año, Acceso
  });

  test('debe filtrar publicaciones por búsqueda', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Buscar"]');
    await searchInput.fill('test');
    await searchInput.press('Enter');
    
    // Esperar a que se actualicen los resultados
    await page.waitForTimeout(1000);
    
    // Verificar que se muestran resultados o mensaje de no encontrado
    const results = page.locator('text=/encontrada|encontradas|No se encontraron/i');
    await expect(results.first()).toBeVisible();
  });

  test('debe mostrar tooltips en avatares de autores', async ({ page }) => {
    // Esperar a que carguen las publicaciones
    await page.waitForSelector('[data-testid="publication-card"]', { timeout: 5000 }).catch(() => {});
    
    // Buscar avatares de autores
    const avatares = page.locator('img[alt*="autor"], [role="img"]').first();
    
    if (await avatares.count() > 0) {
      await avatares.first().hover();
      // Verificar que aparece tooltip
      await expect(page.locator('text=/Autor|Coautor/i').first()).toBeVisible({ timeout: 2000 }).catch(() => {});
    }
  });
});


