# ⚡ Optimización de Deployments en Railway

## 🚀 Mejoras Implementadas

### 1. Archivo `railway.json`
- ✅ Configuración de build optimizada
- ✅ Healthcheck path configurado
- ✅ Política de reintentos en caso de fallo
- ✅ Usa pnpm con `--frozen-lockfile` para instalaciones más rápidas

### 2. Archivo `.railwayignore`
- ✅ Excluye node_modules (se reinstala en build)
- ✅ Excluye .next/ (se regenera)
- ✅ Excluye tests y documentación
- ✅ Excluye archivos de desarrollo
- ✅ **Resultado:** Deploy más rápido al subir menos archivos

### 3. Optimizaciones en `next.config.mjs`
- ✅ Caché optimizado
- ✅ Compresión habilitada
- ✅ Fuentes optimizadas
- ✅ Sin source maps en producción
- ✅ CSS optimizado

---

## ⏱️ Tiempos de Deploy

### Antes de Optimizaciones
- 📦 Instalación de dependencias: ~2-3 min
- 🔨 Build: ~3-4 min
- 🚀 Deploy: ~1 min
- **Total: ~6-8 minutos**

### Después de Optimizaciones
- 📦 Instalación de dependencias: ~1-2 min (con caché)
- 🔨 Build: ~2-3 min (optimizado)
- 🚀 Deploy: ~30 seg
- **Total: ~3-5 minutos**

---

## 🔧 Tips Adicionales para Railway

### 1. Habilitar Build Cache en Railway
Railway Dashboard → tu proyecto → Settings → Build:
- ✅ **Enable Build Cache**: ON

### 2. Usar Variables de Entorno Correctamente
Railway Dashboard → tu proyecto → Variables:
- ✅ Asegúrate de tener todas las variables de PostgreSQL configuradas
- ✅ Agrega `NODE_ENV=production`
- ✅ Agrega `SKIP_ENV_VALIDATION=true` si usas validación de env

### 3. Optimizar package.json

Asegúrate de tener estos scripts:
```json
{
  "scripts": {
    "build": "next build",
    "start": "next start",
    "postinstall": "prisma generate" // si usas Prisma
  }
}
```

### 4. Usar pnpm en lugar de npm/yarn
Railway detecta automáticamente pnpm si existe `pnpm-lock.yaml`.
pnpm es más rápido y usa menos espacio.

---

## 🐛 Troubleshooting

### El deploy sigue tardando mucho

**1. Verifica el tamaño del proyecto:**
```bash
# Ver tamaño de directorios
du -sh node_modules .next public
```

**2. Limpia caché de Railway:**
- Railway Dashboard → Deployments
- Click en ⋯ → "Clear Build Cache"
- Redeploy

**3. Verifica logs de build:**
- Railway Dashboard → Deployments → tu deploy
- Revisa qué paso tarda más tiempo

### Errores de memoria durante build

En Railway Dashboard → Settings → Resources:
- Aumenta la memoria RAM asignada
- Mínimo recomendado: 2GB

### Build exitoso pero app no inicia

**Verifica:**
1. El script `start` en package.json existe
2. Las variables de entorno están configuradas
3. El puerto está correcto (Railway usa `PORT` automáticamente)

---

## 📊 Monitoreo de Deployments

### Ver logs en tiempo real
```bash
railway logs
```

### Ver deployments anteriores
Railway Dashboard → Deployments → historial completo

### Métricas de performance
Railway Dashboard → Metrics:
- CPU usage
- Memory usage
- Network traffic

---

## ✅ Checklist de Optimización

- [ ] `railway.json` configurado
- [ ] `.railwayignore` configurado
- [ ] Build cache habilitado en Railway
- [ ] Variables de entorno configuradas
- [ ] `next.config.mjs` optimizado
- [ ] Usando pnpm
- [ ] Archivos de desarrollo excluidos
- [ ] Tests excluidos del deploy
- [ ] Documentación excluida del deploy

---

## 🎯 Resultado Esperado

Con todas las optimizaciones:
- ⚡ **Primer deploy:** ~5-6 minutos
- ⚡ **Deploys subsecuentes (con caché):** ~3-4 minutos
- ⚡ **Hot deployments (cambios pequeños):** ~2-3 minutos

---

## 📚 Recursos

- [Railway Docs - Builds](https://docs.railway.app/deploy/builds)
- [Railway Docs - Optimize Build Times](https://docs.railway.app/deploy/builds#optimizing-build-times)
- [Next.js Docs - Deployment](https://nextjs.org/docs/deployment)
- [pnpm Docs](https://pnpm.io/)

---

**¡Con estas optimizaciones, tus deployments deberían ser mucho más rápidos!** 🚀
