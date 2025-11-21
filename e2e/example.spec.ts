import { test, expect } from '@playwright/test';

test('homepage loads correctly', async ({ page }) => {
  await page.goto('/');
  
  // Verificar que la página carga
  await expect(page).toHaveTitle(/SEI/);
  
  // Verificar elementos principales
  await expect(page.locator('nav')).toBeVisible();
  await expect(page.locator('footer')).toBeVisible();
});


