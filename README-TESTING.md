# 🧪 Guía de Testing E2E y Métricas

Esta guía explica cómo ejecutar las pruebas End-to-End (E2E) y las métricas de rendimiento, usabilidad y seguridad del sistema SEI.

## 📋 Prerrequisitos

1. **Instalar dependencias:**
   ```bash
   pnpm install
   ```

2. **Instalar navegadores de Playwright:**
   ```bash
   pnpm exec playwright install
   ```

3. **Configurar variables de entorno:**
   - Asegúrate de tener `.env.local` configurado
   - Para pruebas en producción, configura `PLAYWRIGHT_TEST_BASE_URL`

## 🚀 Ejecutar Pruebas

### Testing E2E Completo

```bash
# Ejecutar todas las pruebas E2E
pnpm test:e2e

# Ejecutar con interfaz gráfica (recomendado para desarrollo)
pnpm test:e2e:ui

# Ver reporte HTML después de ejecutar pruebas
pnpm test:e2e:report
```

### Pruebas Específicas

```bash
# Solo pruebas de autenticación
pnpm exec playwright test e2e/auth.spec.ts

# Solo pruebas de publicaciones
pnpm exec playwright test e2e/publicaciones.spec.ts

# Solo pruebas de proyectos
pnpm exec playwright test e2e/proyectos.spec.ts
```

### Métricas de Rendimiento

```bash
# Ejecutar análisis de rendimiento con Lighthouse
pnpm test:performance

# Requiere tener Lighthouse instalado globalmente:
# npm install -g lighthouse
```

### Verificación de Seguridad

```bash
# Ejecutar verificación de seguridad
pnpm test:security
```

### Ejecutar Todo

```bash
# Ejecutar todas las pruebas (seguridad, rendimiento y E2E)
pnpm test:all
```

## 📊 Interpretar Resultados

### Reportes E2E

Los reportes se generan en:
- **HTML:** `playwright-report/index.html`
- **JSON:** `test-results/results.json`
- **JUnit:** `test-results/junit.xml`

### Métricas de Rendimiento

Los resultados se guardan en:
- `test-results/performance/performance-report.json`
- `test-results/performance/*-lighthouse.json`

### Verificación de Seguridad

Los resultados se guardan en:
- `test-results/security/security-report.json`

## 🎯 Criterios de Éxito

### E2E Tests
- ✅ Tasa de éxito: > 90%
- ✅ Todos los flujos críticos funcionan
- ✅ Sin errores en consola del navegador

### Rendimiento
- ✅ Performance Score: > 80
- ✅ Accessibility Score: > 90
- ✅ Best Practices Score: > 85
- ✅ SEO Score: > 80

### Seguridad
- ✅ Sin secretos hardcodeados
- ✅ Variables de entorno protegidas
- ✅ Middleware de autenticación configurado

## 🔧 Configuración Avanzada

### Ejecutar en CI/CD

```bash
# En GitHub Actions, GitLab CI, etc.
pnpm exec playwright test --reporter=github
```

### Ejecutar en diferentes navegadores

```bash
# Solo Chrome
pnpm exec playwright test --project=chromium

# Solo Firefox
pnpm exec playwright test --project=firefox

# Solo Safari
pnpm exec playwright test --project=webkit
```

### Ejecutar en modo headless

```bash
# Por defecto Playwright ejecuta en modo headless en CI
# Para forzar modo headless:
pnpm exec playwright test --headed=false
```

## 📝 Escribir Nuevas Pruebas

Las pruebas E2E se encuentran en `e2e/`. Para agregar nuevas pruebas:

1. Crea un archivo `e2e/tu-modulo.spec.ts`
2. Usa la estructura:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Tu Módulo', () => {
  test('debe hacer algo', async ({ page }) => {
    await page.goto('/tu-ruta');
    await expect(page.locator('selector')).toBeVisible();
  });
});
```

## 🐛 Troubleshooting

### Las pruebas fallan en CI pero funcionan localmente

- Verifica que el servidor de desarrollo esté corriendo
- Aumenta los timeouts en `playwright.config.ts`
- Revisa los logs en `test-results/`

### Lighthouse no se ejecuta

- Instala Lighthouse globalmente: `npm install -g lighthouse`
- O usa npx: `npx lighthouse <url>`

### Errores de autenticación en pruebas

- Las pruebas de admin requieren configuración de autenticación mock
- Considera usar `test.skip()` para pruebas que requieren autenticación real

## 📚 Recursos

- [Documentación de Playwright](https://playwright.dev/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [Reporte de Testing E2E](./docs/testing-e2e-report.md)


