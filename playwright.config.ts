import { defineConfig, devices } from '@playwright/test';

/**
 * Configuración de Playwright para pruebas E2E
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  /* Ejecutar tests en paralelo */
  fullyParallel: true,
  /* Fallar el build si accidentalmente dejaste test.only en el código */
  forbidOnly: !!process.env.CI,
  /* Reintentar en CI si falla */
  retries: process.env.CI ? 2 : 0,
  /* Número de workers en paralelo */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter a usar */
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }]
  ],
  /* Configuración compartida para todos los proyectos */
  use: {
    /* URL base para usar en navegación */
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000',
    /* Recopilar trace cuando se reintenta el test fallido */
    trace: 'on-first-retry',
    /* Screenshots en fallos */
    screenshot: 'only-on-failure',
    /* Video en fallos */
    video: 'retain-on-failure',
  },

  /* Configurar proyectos para diferentes navegadores */
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
    /* Test en dispositivos móviles */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  /* Ejecutar servidor de desarrollo antes de los tests */
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});


