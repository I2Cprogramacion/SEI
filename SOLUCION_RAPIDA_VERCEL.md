# 🔥 SOLUCIÓN RÁPIDA: Errores en Vercel

## 🚨 **Problema Principal**

```
⚠️ Clerk: Clerk has been loaded with development keys.
Development instances have strict usage limits and should not be used in production.
```

**APIs fallando con 500**:
- `/api/usuario/actividad`
- `/api/mensajes/no-leidos`
- `/api/conexiones/pendientes`

---

## ✅ **SOLUCIÓN (10 minutos)**

### 1. **Clerk Production Keys** (5 min)

1. Ve a: https://dashboard.clerk.com/
2. Click en tu proyecto → **Settings** → **API Keys**
3. Cambia a **"Production"** (arriba a la derecha)
4. Copia las claves que empiezan con `pk_live_` y `sk_live_`

### 2. **Actualizar Vercel** (3 min)

1. Ve a: https://vercel.com/dashboard
2. Click en tu proyecto **SEI**
3. **Settings** → **Environment Variables**
4. **Edita** estas 2 variables:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
Valor: pk_live_xxxxxxxxxx (el que copiaste)

CLERK_SECRET_KEY
Valor: sk_live_xxxxxxxxxx (el que copiaste)
```

5. **Aplicar a**: Production, Preview, Development
6. **Save**

### 3. **Redeploy** (2 min)

En Vercel:
- **Deployments** → (último deployment) → botón **...** → **"Redeploy"**

O en terminal:
```bash
git commit --allow-empty -m "trigger redeploy"
git push origin main
```

---

## ✅ **Verificar que Funciona**

1. Ve a tu sitio: https://tu-dominio.vercel.app
2. Abre **DevTools Console** (F12)
3. **NO** debe aparecer: `⚠️ Clerk: development keys`
4. Prueba **login** → debe funcionar
5. Prueba **enviar mensaje** → debe funcionar

---

## ⚠️ **IMPORTANTE: Usuarios**

Los usuarios de development **NO se transfieren** automáticamente.

**Opciones**:

**A. Empezar de cero** (más fácil):
- Los usuarios se registran de nuevo
- Los datos de BD se quedan (se vinculan por correo)

**B. Migrar usuarios**:
- Clerk Dashboard → Users → Export/Import

---

## 🔍 **Si Sigue Fallando**

### Verificar BD en Neon:

```sql
-- Ver columnas de investigadores
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'investigadores';

-- Debe incluir:
-- - clerk_user_id
-- - ultima_actividad  
-- - correo
```

### Agregar columna si falta:

```sql
ALTER TABLE investigadores 
ADD COLUMN IF NOT EXISTS ultima_actividad TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_ultima_actividad 
ON investigadores(ultima_actividad);
```

---

## 📊 **Checklist**

Después de redeploy, verificar:

- [ ] Sin warning de "development keys" en console
- [ ] Login funciona
- [ ] Registro funciona  
- [ ] Mensajes funcionan
- [ ] Conexiones funcionan
- [ ] APIs retornan 200 (no 500)

---

## 💡 **Resumen**

**Problema**: Clerk development keys en producción  
**Solución**: Cambiar a production keys en Vercel  
**Tiempo**: 10 minutos  
**Impacto**: Resuelve todos los errores 500

---

**Fecha**: 15 de Octubre, 2025  
**Urgencia**: 🔴 ALTA
