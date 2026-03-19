# ARQUITECTURA DE SEGURIDAD - BD CONNECTION STRINGS

## 🔒 CRITICAL: Credenciales en `.env.local` (LOCAL ONLY)

### Estado Actual ✅
- ✅ `.env.local` NO está en git (verificado)
- ✅ Credentials nunca se pushen a GitHub
- ✅ Solo developers locales tienen acceso a credenciales reales

### PERO: Necesitamos rotación de credenciales

Aunque las credenciales NO están en git, es buena práctica:
1. **Cada 90 días**: Regenerar credenciales en Neon
2. **Cada deployment**: Verificar que credenciales son correctas
3. **Post-incidente**: Rotación inmediata si sospecha compromiso

---

## 📋 SINGLE SOURCE OF TRUTH: BD Connection Strategy

### Para VERCEL (Serverless) - Recomendado ✅

**Escenario**: Tu app está deployada en Vercel

**Variables Requeridas** (prioridad):
```
1. DATABASE_URL_UNPOOLED (si existe)
   ├─ Mejor para serverless
   ├─ Evita connection pooling issues
   └─ Vercel lo provee automáticamente

2. DATABASE_URL (fallback)
   ├─ Con pooler integrado
   ├─ OK si _UNPOOLED no existe
   └─ Menos ideal pero funciona
```

**Configuración en Vercel**:
```
Vercel Dashboard → Settings → Environment Variables
├─ DATABASE_URL_UNPOOLED=postgresql://...
├─ DATABASE_URL=postgresql://... (fallback)
└─ RECAPTCHA_SECRET=...
```

**En el código** (`lib/database-config.ts`):
```typescript
const dbUrl = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL
// Prioridad correcta ✅
```

---

### Para LOCAL (Desarrollo) - Tu caso actual

**Variables en `.env.local`**:
```
# LOCAL DEVELOPMENT ONLY - Never commit
DATABASE_URL_UNPOOLED=postgresql://neondb_owner:...@...neon.tech/...
DATABASE_URL=postgresql://neondb_owner:...@...neon.tech/...
```

**Cómo obtenerlas**:
1. Neon Dashboard → Connection String
2. Copiar la URL "Unpooled" (si existe)
3. Copiar la URL normal como fallback

---

### Para TESTING/CI - (si lo necesitas)

```
GitHub Secrets → Add:
├─ DATABASE_URL_UNPOOLED (same as production)
├─ DATABASE_URL (same as production)
└─ RECAPTCHA_SECRET_TEST
```

---

## 🔄 ROTACIÓN DE CREDENCIALES (Seguridad Operacional)

### Checklist de Rotación (Cada 90 días)

```
Paso 1: Preparar nuevas credenciales
├─ [ ] Login a Neon Console (neon.tech)
├─ [ ] Ir a Settings → Credentials/Connection
└─ [ ] Generar nueva password

Paso 2: Actualizar Connection Strings
├─ [ ] Copiar nuevo DATABASE_URL_UNPOOLED
├─ [ ] Copiar nuevo DATABASE_URL
└─ [ ] Guardar en password manager

Paso 3: Actualizar LOCAL
├─ [ ] Actualizar .env.local
├─ [ ] Test: npm run dev
└─ [ ] Verify: Conexión a BD funciona

Paso 4: Actualizar VERCEL
├─ [ ] Vercel Dashboard → Settings
├─ [ ] Environment Variables
├─ [ ] Actualizar DATABASE_URL_UNPOOLED
├─ [ ] Actualizar DATABASE_URL
└─ [ ] Redeploy automático

Paso 5: Verificación
├─ [ ] Test en Vercel deployment
├─ [ ] Monitorear logs por 5 min
├─ [ ] Confirmar conexión exitosa
└─ [ ] Revoke credenciales viejas en Neon

Paso 6: Documentación
├─ [ ] Log en SECURITY-CREDENTIALS-ROTATION.log
├─ [ ] Timestamp de rotación
└─ [ ] Quién realizó la rotación
```

---

## 🚨 POST-INCIDENTE (Si sospechas compromiso)

### Acción Inmediata (Minutos 0-5)

```
1. REVOKE IMMEDIATELY en Neon Console
   ├─ Settings → Credentials
   ├─ Buscar credenciales comprometidas
   └─ Click "Revoke" (instantáneo)

2. GENERATE nueva credencial
   ├─ Settings → Credentials
   └─ "Create new credential"

3. UPDATE LOCAL + VERCEL (en paralelo)
   ├─ .env.local (si trabajas local)
   ├─ Vercel Dashboard
   └─ Redeploy

4. MONITOR logs
   ├─ Vercel logs (connexión OK?)
   ├─ Neon logs (actividad inusual?)
   └─ App errors?
```

### Comunicación

```
- [ ] Notificar a otros developers
- [ ] Actualizar la nueva credential en password manager
- [ ] Email: "Credenciales rotadas por seguridad"
- [ ] Update SECURITY log
```

---

## 📊 Matriz de Decisión: ¿Qué usar?

| Contexto | Variable | Por Qué | Prioridad |
|----------|----------|--------|----------|
| Vercel Deployment | DATABASE_URL_UNPOOLED | Evita pooling issues | 1️⃣ |
| Vercel Fallback | DATABASE_URL | Si _UNPOOLED no existe | 2️⃣ |
| Local Dev | DATABASE_URL_UNPOOLED | Same as Vercel | 1️⃣ |
| Local Fallback | DATABASE_URL | If _UNPOOLED unavailable | 2️⃣ |
| **NUNCA usar directamente** | POSTGRES_URL | Confuso, evitar | ❌ |

---

## 🔐 Security Checklist

- [ ] `.env.local` NUNCA committed a git
- [ ] `.gitignore` includes `*.env.local`
- [ ] Credenciales rotadas cada 90 días
- [ ] DATABASE_URL_UNPOOLED preferido
- [ ] DATABASE_URL como fallback
- [ ] POSTGRES_URL no usado directamente
- [ ] Vercel env variables verificadas
- [ ] Logs monitoreados post-update
- [ ] Incident response plan en lugar
- [ ] Team comunicado sobre rotación

---

## Próxima Acción (Para el Arquitecto)

1. ✅ Este documento: SEGURIDAD-BD-CREDENCIALES.md (creado)
2. ⏳ Agendar rotación de credenciales (90 días desde ahora)
3. ⏳ Implementar monitoring de conexiones BD
4. ⏳ Crear audit log para cambios de credenciales

**Estado**: PROTECTED ✅ (pero requiere monitoreo)

