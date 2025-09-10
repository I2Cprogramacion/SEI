# Configuración de Vercel Postgres

## 🚀 Configuración Automática

Tu proyecto ya está configurado para usar Vercel Postgres. Las variables de entorno se configuran automáticamente cuando despliegas en Vercel.

## 📋 Variables de Entorno Requeridas

Vercel configura automáticamente estas variables:
- `POSTGRES_HOST` - Host de la base de datos
- `POSTGRES_DATABASE` - Nombre de la base de datos
- `POSTGRES_USER` - Usuario de la base de datos
- `POSTGRES_PASSWORD` - Contraseña de la base de datos
- `POSTGRES_PORT` - Puerto (por defecto 5432)

## 🔧 Configuración Local

Para desarrollo local, crea un archivo `.env.local` con las variables de Vercel:

```bash
# Copia las variables desde tu dashboard de Vercel
POSTGRES_HOST=tu-host-vercel
POSTGRES_DATABASE=tu-database-name
POSTGRES_USER=tu-username
POSTGRES_PASSWORD=tu-password
POSTGRES_PORT=5432
NODE_ENV=development
```

## 🧪 Probar la Conexión

Ejecuta el script de prueba:

```bash
node scripts/test-vercel-postgres.js
```

## 🔄 Cambiar Entre Bases de Datos

### Usar Vercel Postgres (Producción)
```typescript
import { usePredefinedConfig } from './lib/database-config'

// En producción
usePredefinedConfig('production', 'vercelPostgres')
```

### Usar SQLite (Desarrollo Local)
```typescript
import { usePredefinedConfig } from './lib/database-config'

// En desarrollo
usePredefinedConfig('development', 'sqlite')
```

## 📊 Estructura de la Base de Datos

La base de datos se crea automáticamente con las tablas necesarias cuando se ejecuta por primera vez.

## 🚨 Solución de Problemas

### Error de Conexión
1. Verifica que las variables de entorno estén configuradas
2. Asegúrate de que la base de datos esté activa en Vercel
3. Verifica que tu IP esté permitida (si usas restricciones)

### Variables Faltantes
1. Ve a tu dashboard de Vercel
2. Navega a Storage > PostgreSQL
3. Copia las variables de entorno

## 📚 Recursos Adicionales

- [Documentación de Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
- [Guía de Migración](https://vercel.com/docs/storage/vercel-postgres/quickstart)
- [Variables de Entorno](https://vercel.com/docs/projects/environment-variables)
