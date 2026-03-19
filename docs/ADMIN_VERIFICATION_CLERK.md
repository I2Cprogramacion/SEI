# 🔐 Admin Verification with Clerk Custom Claims

## Overview

El sistema de verificación de admin ha sido rediseñado para usar **Clerk Custom Claims** en lugar de consultas directas a base de datos en cada acceso.

### Por qué este cambio?

**Problema anterior:**
- ❌ Cada acceso a `/admin` hacía una consulta a BD
- ❌ Conexión a Neon con pooling issues
- ❌ Latencia de 5-15 segundos típicamente
- ❌ Timeouts y fallos 500 frecuentes
- ❌ No funciona bien en arquitectura serverless

**Solución actual:**
- ✅ Verificación instantánea desde token de Clerk
- ✅ Sin consultas a BD en cada acceso
- ✅ Claims cacheados en el cliente
- ✅ Arquitectura serverless-friendly
- ✅ Muy confiable y rápido

---

## Architecture

### 1. **Verificación de Admin Access**

**Endpoint:** `GET /api/auth/verify-admin`

```bash
# Verificar si el usuario tiene acceso de admin
curl -X GET http://localhost:3000/api/auth/verify-admin \
  -H "Authorization: Bearer <clerk-token>"
```

**Response (200 OK):**
```json
{
  "tieneAcceso": true,
  "esAdmin": true,
  "esEvaluador": false,
  "source": "clerk",
  "usuario": {
    "id": "user_123456",
    "email": "admin@ejemplo.com",
    "nombre": "Admin"
  }
}
```

**Response (403 Forbidden):**
```json
{
  "tieneAcceso": false,
  "esAdmin": false,
  "esEvaluador": false,
  "error": "No tienes permisos de administrador",
  "source": "clerk"
}
```

---

### 2. **Actualizar Status de Investigador**

**Endpoint:** `POST /api/admin/update-investigador`

**Solo admin puede usar este endpoint.**

```bash
curl -X POST http://localhost:3000/api/admin/update-investigador \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{
    "investigadorId": "inv_123",
    "es_admin": true,
    "es_evaluador": true
  }'
```

**Qué hace:**
1. Verifica que el usuario actual sea admin
2. Actualiza `investigadores` table en BD
3. **Automáticamente sincroniza a Clerk** si tiene `clerk_user_id`
4. Retorna el investigador actualizado

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Investigador actualizado y sincronizado",
  "investigador": {
    "id": "inv_123",
    "nombre": "Juan Pérez",
    "correo": "juan@ejemplo.com",
    "es_admin": true,
    "es_evaluador": true
  }
}
```

---

### 3. **Forzar Sincronización a Clerk**

**Endpoint:** `POST /api/admin/sync-investigador-clerk`

**Solo admin puede usar este endpoint. Útil cuando la sincronización automática falló.**

```bash
# Sincronizar un investigador específico
curl -X POST http://localhost:3000/api/admin/sync-investigador-clerk \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{
    "investigadorId": "inv_123"
  }'

# O sincronizar el usuario actual
curl -X POST http://localhost:3000/api/admin/sync-investigador-clerk \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{}'
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Investigador sincronizado a Clerk",
  "investigador": {
    "id": "inv_123",
    "nombre": "Juan Pérez",
    "correo": "juan@ejemplo.com",
    "es_admin": true,
    "es_evaluador": true
  }
}
```

---

## Flow: Admin Access

```
1. Usuario accede a https://tuapp.com/admin
   ↓
2. Admin layout llama GET /api/auth/verify-admin
   ↓
3. Endpoint verifica user.publicMetadata.es_admin en Clerk
   ↓
4. Si es true → Acceso permitido
   Si es false → Redirige a /dashboard
```

**Duración: < 100ms (sin consultas a BD)**

---

## Flow: Actualizar Admin Status

```
1. Admin abre admin panel (e.g., usuarios)
   ↓
2. Admin hace click en "Hacer Admin" para un investigador
   ↓
3. Frontend llama POST /api/admin/update-investigador
   ↓
4. Endpoint:
   a) Actualiza investigadores.es_admin = true en BD
   b) Sincroniza automáticamente a Clerk si tiene clerk_user_id
   ↓
5. El investigador ahora tiene es_admin=true tanto en BD como en Clerk
   ↓
6. Cuando ese investigador accede a /admin:
   a) Verifica su token de Clerk
   b) Ve user.publicMetadata.es_admin = true
   c) Acceso permitido instantáneamente
```

**Duración total: ~300ms (1x BD update + 1x Clerk API call)**

---

## Clerk Custom Claims

### Public Metadata Structure

```typescript
user.publicMetadata = {
  es_admin: boolean,           // true if admin
  es_evaluador: boolean,       // true if evaluator
  sync_timestamp: ISO string   // when last synced
}
```

### How to Access in Components

**Server-side (Next.js API routes):**
```typescript
import { currentUser } from '@clerk/nextjs/server'

const user = await currentUser()
const esAdmin = user?.publicMetadata?.es_admin === true
```

**Client-side (React components):**
```typescript
import { useAuth } from '@clerk/nextjs'

function AdminPanel() {
  const { sessionClaims } = useAuth()
  const esAdmin = sessionClaims?.public_metadata?.es_admin === true
  
  if (!esAdmin) return <AccessDenied />
  return <AdminContent />
}
```

---

## Database Schema

### investigadores table

```sql
CREATE TABLE investigadores (
  id UUID PRIMARY KEY,
  nombre_completo VARCHAR,
  correo VARCHAR UNIQUE,
  clerk_user_id VARCHAR UNIQUE,
  es_admin BOOLEAN DEFAULT false,
  es_evaluador BOOLEAN DEFAULT false,
  -- ... other fields
);

-- Index para búsquedas rápidas
CREATE INDEX idx_investigadores_correo_lower 
ON investigadores(LOWER(correo));
```

---

## Migration: Old Admin Users

Si tienes usuarios que ya son admin en la BD pero sus claims en Clerk no están sincronizados:

### Option 1: Manual Sync (One-off)

```bash
# Como admin, llamar este endpoint para un investigador específico
POST /api/admin/sync-investigador-clerk
{
  "investigadorId": "inv_123"
}
```

### Option 2: Batch Sync Script (futuro)

```sql
-- En Neon console, ejecutar algo como:
SELECT id, clerk_user_id FROM investigadores 
WHERE es_admin = true 
AND clerk_user_id IS NOT NULL;

-- Luego para cada fila, llamar POST /api/admin/sync-investigador-clerk
```

---

## Environment Variables

Asegurate que `CLERK_SECRET_KEY` esté configurada en Vercel:

```bash
# .env.local o Vercel settings
CLERK_SECRET_KEY=sk_test_...
```

**No necesitas** `DATABASE_URL_UNPOOLED` en runtime para verificar admin (solo para operaciones de BD en endpoints específicos).

---

## Testing

### Test 1: Admin Access

```bash
# Como admin, debería devolver 200
curl -X GET https://tuapp.com/api/auth/verify-admin

# Como user sin permisos, debería devolver 403
# (mismo endpoint, pero different token)
```

### Test 2: Update Admin Status

```bash
# Como admin, actualizar un investigador
curl -X POST https://tuapp.com/api/admin/update-investigador \
  -H "Content-Type: application/json" \
  -d '{
    "investigadorId": "...",
    "es_admin": true,
    "es_evaluador": false
  }'

# Verificar que Clerk claims se actualizaron
# (debería ver syncTimestamp reciente)
```

### Test 3: Admin Access After Update

```bash
# Como ese investigador, debería poder acceder a /admin
curl https://tuapp.com/admin
# Should NOT redirect to /dashboard
```

---

## Troubleshooting

### Problem: Admin access still returns 403

**Solution:**
1. Verificar que `es_admin=true` en BD:
   ```sql
   SELECT es_admin FROM investigadores 
   WHERE correo = 'admin@example.com';
   ```

2. Si BD tiene `true` pero Clerk no, sincronizar:
   ```bash
   POST /api/admin/sync-investigador-clerk
   ```

3. Verificar `CLERK_SECRET_KEY` en Vercel (Settings → Environment Variables)

### Problem: Sync endpoint returns error

**Check:**
- ¿El investigador tiene `clerk_user_id`?
- ¿Es válido el `investigadorId`?
- ¿CLERK_SECRET_KEY está correcta en Vercel?

### Problem: Admin layout keeps redirecting

**Debug:**
```typescript
// En app/admin/layout.tsx, los console.logs mostrarán:
// - Qué token se está usando
// - Qué dice el endpoint
// - Por qué se redirige
```

---

## Benefits

| Aspecto | Antes | Después |
|---------|-------|---------|
| **Latencia** | 5-15s | < 100ms |
| **Confiabilidad** | ⚠️ Timeouts frecuentes | ✅ Casi 100% |
| **Escalabilidad** | ❌ BD bottleneck | ✅ Serverless-friendly |
| **User Experience** | ❌ Esperas largas | ✅ Instantáneo |
| **Arquitectura** | ❌ Anti-pattern serverless | ✅ Cloud-native |

---

## Future Improvements

1. **Webhooks de Clerk**: Auto-sync cuando usuario se elimina
2. **Roles adicionales**: Extender a otros tipos de permisos (moderador, etc)
3. **Audit log**: Registrar cuándo cambios de admin status
4. **Admin Dashboard**: UI para gestionar admin users (usa endpoint `update-investigador`)
5. **Rate limiting**: Proteger endpoints de abuse
