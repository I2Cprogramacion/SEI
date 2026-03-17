# 🔍 DIAGNÓSTICO COMPLETO - BASE DE DATOS Y DEPLOYMENT

## 📋 INFORMACIÓN DEL SISTEMA

**Fecha:** 2026-03-17  
**Proyecto:** SEI (Sistema Estatal de Investigadores)  
**Versión Node:** 20.19.5  
**Versión pnpm:** 9.0.0  
**Versión Next.js:** 15.5.9  
**Versión Prisma:** 6.15.0  

---

## 🗄️ CONFIGURACIÓN DE BASE DE DATOS

### LOCAL (.env.local)
✅ **DATABASE_URL:**
```
postgresql://neondb_owner:npg_Inb9YWHGiq0K@ep-super-recipe-a8kx6g4c-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require
```
- ✅ Formato correcto (sin `psql`)
- ✅ Usa Pooler (eastus2.azure.neon.tech)
- ✅ SSL habilitado
- ✅ Channel binding habilitado

### VERCEL (Environment Variables)
⚠️ **ESTADO DESCONOCIDO - NECESITA VERIFICACIÓN**

El usuario reportó que en Vercel tiene:
```
postgresql://neondb_owner:npg_NIia51xLAGug@...
```
(Contraseña diferente a local)

---

## ❌ ERRORES ENCONTRADOS

### Error Principal
```
Error [PrismaClientInitializationError]: 
Can't reach database server at `ep-super-recipe-a8kx6g4c-pooler.eastus2.azure.neon.tech:5432`
```

**Causas posibles:**

1. **DATABASE_URL en Vercel tiene contraseña expirada/revocada**
   - Local: `npg_Inb9YWHGiq0K` 
   - Vercel: `npg_NIia51xLAGug` (diferente)
   - ❓ ¿Fueron regeneradas las passwords?

2. **DATABASE_URL en Vercel es inválido**
   - ¿Tiene `psql '` al inicio?
   - ¿Tiene comillas al final?
   - ¿Tiene caracteres escapados incorrectamente?

3. **Neon está caído o bloqueando la conexión**
   - IP de Vercel no autorizada
   - Límite de conexiones excedido

4. **Redeploy en Vercel no se completó**
   - Las variables se actualizaron pero Vercel aún no redeployó
   - Status mostrado es "Ready" pero usa código antiguo

---

## ✅ LO QUE FUNCIONA

✅ **Local:**
- DATABASE_URL correcta y accesible
- Prisma schema compilado
- Conexión a Neon posible desde local

✅ **Código:**
- Build compila sin errores
- TypeScript sin errores
- Clerk configuration OK
- CURP/RFC/CVU validation OK

✅ **Deployment:**
- Git commits en main
- Vercel detecta cambios
- Build ejecuta correctamente

---

## ⚠️ PROBLEMAS IDENTIFICADOS

| # | Problema | Severidad | Estado | Acción |
|---|----------|-----------|--------|--------|
| 1 | DATABASE_URL en Vercel puede estar inválida | 🔴 CRÍTICA | ❓ Por revisar | Verificar en Neon Console |
| 2 | Contraseña en Vercel puede estar revocada | 🔴 CRÍTICA | ❓ Por revisar | Regenerar en Neon |
| 3 | Redeploy en Vercel nunca se ejecutó | 🟡 ALTA | ⏳ Pendiente | Hacer manualmente |
| 4 | Preload warnings en registro | 🟢 BAJA | ⚠️ No-crítico | Ignorar (de Clerk) |
| 5 | Feature Policy warnings | 🟢 BAJA | ⚠️ No-crítico | Ignorar (de Clerk) |

---

## 🔧 SOLUCIONES RECOMENDADAS

### 1. **VERIFICAR DATABASE_URL en Vercel** (URGENTE)

```
Vercel → Settings → Environment Variables
Buscar: DATABASE_URL
Verificar que sea exactamente:
postgresql://neondb_owner:npg_NIia51xLAGug@ep-super-recipe-a8kx6g4c-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require

❌ NO debe tener:
- psql ' al inicio
- comillas al final
- caracteres escapados
- espacios en blanco
```

### 2. **REGENERAR PASSWORD en Neon** (SI FALLA)

```
https://console.neon.tech/
Proyecto → Database → Users → neondb_owner
Click: "Reset Password"
Copiar nueva URL
Actualizar en Vercel
```

### 3. **REDEPLOY en Vercel** (DESPUÉS DE ACTUALIZAR VARS)

```
Vercel → Deployments
Click en último deployment
Click: "Redeploy"
Esperar status: Ready (verde)
```

### 4. **PRUEBA DE CONEXIÓN LOCAL**

```powershell
# En terminal:
$env:DATABASE_URL='postgresql://neondb_owner:npg_Inb9YWHGiq0K@ep-super-recipe-a8kx6g4c-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require'
npx prisma db push
```

Si funciona localmente, el problema ESTÁ EN VERCEL.

---

## 📊 CHECKLIST DE VERIFICACIÓN

### Local
- [x] NODE_ENV = development
- [x] DATABASE_URL presente y válida
- [x] Prisma schema existe
- [x] .env.local contiene credenciales
- [x] Build compila sin errores

### Vercel
- [ ] DATABASE_URL variable existe
- [ ] DATABASE_URL sin prefijo `psql`
- [ ] Contraseña actual y válida
- [ ] Último deployment en status "Ready"
- [ ] Redeploy completado después de cambiar vars

### Neon
- [ ] Proyecto activo
- [ ] Database `neondb` existente
- [ ] Usuario `neondb_owner` activo
- [ ] Password válida
- [ ] Pooler funcionando

---

## 🚀 PRÓXIMOS PASOS INMEDIATOS

1. **HOJA 1 - Verificar en Neon Console** (5 min)
   - Conectar a https://console.neon.tech/
   - Copiar Connection String actualizado
   - Notar la contraseña actual

2. **HOJA 2 - Verificar en Vercel** (5 min)
   - Ir a Vercel → Settings → Environment Variables
   - Buscar DATABASE_URL
   - Verificar que sea correcto (sin psql, sin comillas)
   - Si está mal, editar y guardar

3. **HOJA 3 - Redeploy en Vercel** (5 min)
   - Ir a Deployments
   - Click en último deployment
   - Click Redeploy
   - Esperar a Ready (3-5 min)

4. **HOJA 4 - Prueba final** (2 min)
   - Ir a https://sei-chih.com.mx
   - Probar cargar página de convocatorias
   - Verificar que no haya error de BD

---

## 📝 NOTAS

- El error ocurre en `/api/convocatorias` que intenta consultar BD
- La conexión no se puede establecer desde Vercel
- Local funciona fine (prueba de que la URL/contraseña son válidas en ese punto)
- El deployment necesita ser hecho DESPUÉS de actualizar variables

---

**Estado:** ⏳ Esperando acción del usuario  
**Prioridad:** 🔴 CRÍTICA  
**Estimado de Fix:** 15 minutos  

