# 🔧 Solución a Errores de Conexión PostgreSQL

## ⚠️ PROBLEMA DETECTADO

```
Error: read ECONNRESET
Error: Connection terminated unexpectedly
```

### Causa:
- **Conexiones no gestionadas correctamente** con `@vercel/postgres`
- **Timeout de conexiones idle** en Neon/Vercel Postgres
- **Múltiples requests simultáneos** (polling cada 30s de badges)
- **Sin manejo de reintentos** en queries fallidas

---

## ✅ SOLUCIÓN IMPLEMENTADA

### 1. Nuevo Módulo: `lib/db-connection.ts`

**Características**:
- ✅ **Reintentos automáticos** (hasta 3 intentos)
- ✅ **Backoff exponencial** (espera progresiva entre reintentos)
- ✅ **Detección de errores de conexión** (ECONNRESET, ETIMEDOUT, etc.)
- ✅ **Cache de verificación** (no sobrecargar con health checks)
- ✅ **Wrapper seguro** para queries (`querySafe`)

### 2. Archivos Actualizados

#### `app/api/mensajes/no-leidos/route.ts`
```typescript
// ANTES ❌
import { sql } from "@vercel/postgres"
const result = await sql`SELECT ...`

// DESPUÉS ✅
import { querySafe } from "@/lib/db-connection"
const result = await querySafe<{ count: string }>`SELECT ...`
```

#### `app/api/conexiones/pendientes/route.ts`
```typescript
// ANTES ❌
import { sql } from "@vercel/postgres"
const result = await sql`SELECT ...`

// DESPUÉS ✅
import { querySafe } from "@/lib/db-connection"
const result = await querySafe<{ count: string }>`SELECT ...`
```

---

## 🔄 CÓMO FUNCIONA

### Reintentos Automáticos

```typescript
executeQuery(async () => {
  return await sql`SELECT ...`
}, retries = 3)
```

**Flujo**:
1. Intenta ejecutar query
2. Si falla con error de conexión → espera 1s, reintenta
3. Si falla de nuevo → espera 2s, reintenta
4. Si falla tercera vez → lanza error
5. Si no es error de conexión → lanza error inmediatamente

### Backoff Exponencial

```
Intento 1: 0ms
Intento 2: 1000ms (1s)
Intento 3: 2000ms (2s)
```

Esto evita **sobrecargar la BD** con reintentos muy rápidos.

---

## 🎯 PRÓXIMOS PASOS

### Para Aplicar en Todos los Endpoints

Reemplaza todas las importaciones de `sql`:

```typescript
// ❌ ANTES
import { sql } from "@vercel/postgres"

// ✅ DESPUÉS
import { querySafe } from "@/lib/db-connection"
```

Y cambia las queries:

```typescript
// ❌ ANTES
const result = await sql`SELECT * FROM tabla`

// ✅ DESPUÉS
const result = await querySafe`SELECT * FROM tabla`
```

---

## 📊 ENDPOINTS A ACTUALIZAR

### Alta Prioridad (polling frecuente):
- ✅ `/api/mensajes/no-leidos` - **ACTUALIZADO**
- ✅ `/api/conexiones/pendientes` - **ACTUALIZADO**

### Media Prioridad:
- ⏳ `/api/mensajes` (GET, POST, PATCH)
- ⏳ `/api/conexiones` (GET, POST, PATCH)

### Baja Prioridad:
- ⏳ `/api/investigadores`
- ⏳ `/api/dashboard/*`
- ⏳ Otros endpoints

---

## 🚀 BENEFICIOS

1. **Menos errores**: Reintentos automáticos para errores transitorios
2. **Mejor UX**: Usuario no ve errores temporales
3. **Más resiliente**: Sistema tolera desconexiones momentáneas
4. **Logs útiles**: Avisos cuando hay problemas, no crashes
5. **Performance**: Cache de health checks, no overhead innecesario

---

## 🔍 DEBUGGING

### Ver logs de reintentos:
```
⚠️ Error de conexión (intento 1/3), reintentando...
⚠️ Error de conexión (intento 2/3), reintentando...
❌ Error después de todos los reintentos: [error details]
```

### Verificar salud de conexión:
```typescript
import { checkConnection } from '@/lib/db-connection'

const isHealthy = await checkConnection()
console.log('BD saludable:', isHealthy)
```

---

## ⚡ CONFIGURACIÓN AVANZADA (Opcional)

### Ajustar número de reintentos:
```typescript
const result = await querySafe(`SELECT ...`, /* retries */ 5)
```

### Ajustar intervalo de health check:
```typescript
// En db-connection.ts línea 8
const CONNECTION_CHECK_INTERVAL = 60000 // 60 segundos
```

---

## 📝 NOTAS IMPORTANTES

1. **No afecta funcionalidad**: Solo agrega capa de resiliencia
2. **Compatible con Vercel Postgres**: Usa el mismo `sql` por debajo
3. **Zero breaking changes**: Misma sintaxis de template literals
4. **TypeScript safe**: Soporte completo de tipos genéricos

---

## 🎉 RESULTADO

**Antes**:
- ❌ Múltiples crashes con ECONNRESET
- ❌ Usuarios ven errores 500
- ❌ Navbar badges fallan silenciosamente

**Después**:
- ✅ Reintentos automáticos transparentes
- ✅ Usuarios no ven errores temporales
- ✅ Sistema resiliente a desconexiones

---

*Implementado: ${new Date().toLocaleString('es-MX')}*
*Commit: Pendiente*
