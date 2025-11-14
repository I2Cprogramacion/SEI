# Limpieza Automática de Registros Expirados

## Descripción

Sistema de limpieza automática para la tabla `registros_pendientes` que elimina registros con más de 24 horas de antigüedad.

## Archivo Creado

- **Ruta**: `app/api/cron/limpiar-registros/route.ts`
- **Método**: GET/POST
- **Función**: Elimina registros expirados de `registros_pendientes`

## Configuración en Vercel

### 1. Agregar Cron Job

El archivo `vercel.json` ya incluye la configuración:

```json
{
  "crons": [
    {
      "path": "/api/cron/limpiar-registros",
      "schedule": "0 2 * * *"
    }
  ]
}
```

**Horario**: Todos los días a las 2:00 AM UTC

### 2. Configurar Variable de Entorno

Genera un secreto único para proteger el endpoint:

```bash
# Generar secret (en tu terminal local)
openssl rand -base64 32
```

Agrega la variable en Vercel:
1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Agrega: `CRON_SECRET` con el valor generado
4. Aplica a: Production, Preview, Development

### 3. Redeploy

Después de agregar la variable:
```bash
git add vercel.json app/api/cron/limpiar-registros/route.ts
git commit -m "Add cron job for cleaning expired registrations"
git push
```

## Verificación del Cron Job

### En Vercel Dashboard

1. Ve a tu proyecto
2. Pestaña "Cron Jobs"
3. Verás: `limpiar-registros` con schedule `0 2 * * *`
4. Revisa logs de ejecución

### Prueba Manual

Puedes ejecutar el cron job manualmente con:

```bash
# Con el CRON_SECRET configurado
curl -X POST https://tu-dominio.vercel.app/api/cron/limpiar-registros \
  -H "Authorization: Bearer TU_CRON_SECRET"
```

O desde tu navegador (si no tienes CRON_SECRET):
```
https://tu-dominio.vercel.app/api/cron/limpiar-registros
```

## Respuesta del Endpoint

### Exitosa
```json
{
  "success": true,
  "message": "Limpieza de registros expirados completada",
  "eliminados": 5,
  "detalles": [
    "user_xyz123",
    "user_abc456"
  ],
  "timestamp": "2025-11-14T02:00:00.000Z"
}
```

### Error
```json
{
  "error": "Error al limpiar registros: Connection timeout"
}
```

## Función de Limpieza

La función `limpiarRegistrosExpirados()` en `lib/db.ts`:

- Busca registros con `fecha_expiracion < NOW()`
- Elimina todos los registros expirados
- Retorna cantidad eliminada y lista de clerk_user_ids

## Logs

Los logs aparecen en:
- **Vercel**: Deployments → Functions → `/api/cron/limpiar-registros`
- **Consola**: Durante desarrollo local

Ejemplo de log:
```
🔵 ========== INICIANDO LIMPIEZA DE REGISTROS EXPIRADOS ==========
⏰ Fecha/hora: 2025-11-14T02:00:00.000Z
✅ Limpieza completada:
   Registros eliminados: 3
   Detalles: ["user_123", "user_456", "user_789"]
=================================================================
```

## Monitoreo

### Métricas Importantes

1. **Cantidad de registros eliminados**: Normal 0-10 por día
2. **Errores**: Revisar si hay fallas en la base de datos
3. **Tiempo de ejecución**: Debe ser < 5 segundos

### Alertas Recomendadas

- Si se eliminan >50 registros/día → Revisar flujo de verificación
- Si hay errores consecutivos → Verificar conexión a DB
- Si no se ejecuta → Revisar configuración de Vercel Cron

## Desarrollo Local

Para probar en local:

```bash
# Sin CRON_SECRET (para desarrollo)
curl http://localhost:3000/api/cron/limpiar-registros

# Con CRON_SECRET
curl -H "Authorization: Bearer tu-secret" \
  http://localhost:3000/api/cron/limpiar-registros
```

## Consideraciones

### Seguridad
- ✅ Protected con `CRON_SECRET` en producción
- ✅ Solo accesible desde Vercel Cron o con header correcto

### Performance
- ⚡ Query optimizado con índice en `fecha_expiracion`
- ⚡ Eliminación en batch (no bucles)

### Datos
- 📊 Registros expirados = `fecha_creacion + 24 horas`
- 🗑️ Eliminación permanente (no soft delete)
- 📋 Log de clerk_user_ids eliminados para auditoría

## Troubleshooting

### El cron no se ejecuta

1. Verifica que `vercel.json` esté en la raíz
2. Confirma que el proyecto tenga Cron Jobs habilitado
3. Revisa logs en Vercel Dashboard

### Error 401 (No autorizado)

1. Verifica que `CRON_SECRET` esté configurado en Vercel
2. Confirma que el header `Authorization` sea correcto
3. En desarrollo local, puedes omitir el secret

### No se eliminan registros

1. Verifica que `limpiarRegistrosExpirados()` funcione en DB
2. Confirma que existan registros con >24 horas
3. Revisa logs de la función para errores SQL

## Mantenimiento

### Cambiar Horario

Edita `vercel.json`:
```json
"schedule": "0 3 * * *"  // 3 AM en vez de 2 AM
```

Ejemplos de schedule (cron syntax):
- `0 2 * * *` - Diario a las 2 AM
- `0 */6 * * *` - Cada 6 horas
- `0 0 * * 0` - Domingos a medianoche
- `*/30 * * * *` - Cada 30 minutos

### Desactivar

Comenta o elimina la sección `crons` en `vercel.json`:
```json
// "crons": [...]
```

## Referencias

- [Vercel Cron Jobs Documentation](https://vercel.com/docs/cron-jobs)
- [Cron Schedule Syntax](https://crontab.guru/)
- Función relacionada: `lib/databases/postgresql-database.ts` → `limpiarRegistrosExpirados()`
