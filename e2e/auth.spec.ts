import { test, expect } from '@playwright/test';

/**
 * Pruebas E2E para autenticación y registro
 */
test.describe('Autenticación', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('debe mostrar la página de inicio de sesión', async ({ page }) => {
    // Navegar a login
    await page.click('text=Iniciar Sesión');
    await expect(page).toHaveURL(/.*iniciar-sesion/);
  });

  test('debe mostrar la página de registro', async ({ page }) => {
    // Navegar a registro
    await page.click('text=Registrarse');
    await expect(page).toHaveURL(/.*registro/);
    
    // Verificar elementos del formulario
    await expect(page.locator('input[name="nombres"]')).toBeVisible();
    await expect(page.locator('input[name="apellidos"]')).toBeVisible();
    await expect(page.locator('input[name="correo"]')).toBeVisible();
  });

  test('debe validar campos requeridos en registro', async ({ page }) => {
    await page.goto('/registro');
    
    // Intentar enviar formulario vacío
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Verificar que se muestran mensajes de error
    await expect(page.locator('text=obligatorio')).toBeVisible();
  });
});


