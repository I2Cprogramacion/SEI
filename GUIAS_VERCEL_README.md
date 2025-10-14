# 🚀 Guías de Deployment - SEI

Este directorio contiene guías paso a paso para resolver problemas de deployment en Vercel.

## 📋 Problema Actual

Si `/admin` no funciona en Vercel pero sí funciona en local:

### Síntomas
- ❌ En Vercel: `/admin` redirige a `/dashboard`
- ❌ Errores en logs: "column es_admin does not exist"
- ❌ Errores en logs: "column ultima_actividad does not exist"  
- ✅ En local: Todo funciona perfectamente

### Causa
**Vercel NO tiene las variables de entorno configuradas** para conectarse a la base de datos de PostgreSQL (Neon).

---

## ✅ Solución Rápida

### 1. Verificar Estado Actual

Accede a esta URL en tu deployment de Vercel:

```
https://tu-app.vercel.app/api/debug/env-status
```

Esto te mostrará:
- ✅ Qué variables están configuradas
- ✅ Si puede conectarse a la BD
- ✅ Si tu usuario es admin

### 2. Configurar Variables en Vercel

Ve a: **Vercel Dashboard → tu proyecto → Settings → Environment Variables**

Agrega estas 8 variables (cópialas de tu `.env.local`):

| Variable | Descripción |
|----------|-------------|
| `POSTGRES_URL` | URL principal de conexión |
| `POSTGRES_PRISMA_URL` | URL para Prisma con pgbouncer |
| `POSTGRES_URL_NO_SSL` | URL sin SSL |
| `POSTGRES_URL_NON_POOLING` | URL sin connection pooling |
| `POSTGRES_USER` | Usuario de la BD |
| `POSTGRES_HOST` | Host del servidor |
| `POSTGRES_PASSWORD` | Contraseña |
| `POSTGRES_DATABASE` | Nombre de la BD |

**IMPORTANTE:** Marca los 3 checkboxes para cada variable:
- ✅ Production
- ✅ Preview  
- ✅ Development

### 3. Redeploy

1. Ve a **Deployments** en Vercel
2. Click en los 3 puntos (⋯) del deployment más reciente
3. Click en **Redeploy**
4. **DESACTIVA** "Use existing Build Cache"
5. Click en **Redeploy**

### 4. Verificar

Accede a:
```
https://tu-app.vercel.app/admin
```

Deberías ver el panel de admin sin redirección.

---

## 📚 Guías Detalladas

- **`SOLUCION_DEFINITIVA_VERCEL.md`** - Guía completa paso a paso
- **`VERCEL_SETUP_PASO_A_PASO.md`** - Configuración detallada de variables
- **`docs/TROUBLESHOOTING_VERCEL_ADMIN.md`** - Troubleshooting avanzado

---

## 🛠️ Scripts Útiles

### Verificar Estado Local
```bash
node scripts/check-admin-vercel.js drksh2015@gmail.com
```

### Agregar Columnas en Producción (si es necesario)
```bash
node scripts/setup-production-db.js drksh2015@gmail.com
```

### Hacer Usuario Admin
```bash
node scripts/make-admin.js drksh2015@gmail.com
```

---

## 🆘 ¿Aún no funciona?

1. **Verifica los logs en Vercel:**
   - Deployments → tu deployment → Functions → ver logs

2. **Verifica que las columnas existan:**
   ```bash
   node scripts/check-db-structure.js
   ```

3. **Ejecuta la API de debug:**
   ```
   https://tu-app.vercel.app/api/debug/env-status
   ```

---

## ✅ Checklist de Solución

- [ ] Accedí a `/api/debug/env-status` en Vercel
- [ ] Configuré las 8 variables de PostgreSQL
- [ ] Marqué Production, Preview y Development
- [ ] Hice redeploy SIN usar caché
- [ ] El deployment terminó sin errores
- [ ] Probé `/admin` y funciona

---

**Una vez configurado, el panel de admin funcionará perfectamente.** 🎉
