# Guía Rápida: Configurar POSTGRES_URL en Vercel

## Problema
El error indica que falta la variable de entorno `POSTGRES_URL`:
```
'missing_connection_string' and no 'POSTGRES_URL' env var was found.
```

## Solución Rápida

### Opción 1: Si ya tienes Vercel Postgres configurado

1. Ve a tu proyecto en Vercel Dashboard: https://vercel.com/dashboard
2. Selecciona tu proyecto
3. Ve a **Storage** (en el menú lateral)
4. Si ves una base de datos Postgres, haz clic en ella
5. Ve a la pestaña **.env.local**
6. Copia el valor de `POSTGRES_URL`
7. Ve a **Settings** → **Environment Variables**
8. Agrega una nueva variable:
   - **Name**: `POSTGRES_URL`
   - **Value**: Pega el valor que copiaste
   - Marca: ✅ Production, ✅ Preview, ✅ Development
9. Guarda y haz **Redeploy**

### Opción 2: Si NO tienes Vercel Postgres configurado

#### A) Crear Vercel Postgres (Recomendado)

1. Ve a tu proyecto en Vercel Dashboard
2. Ve a **Storage** → **Create Database** → **Postgres**
3. Elige un plan (Hobby es gratis para empezar)
4. Selecciona la región más cercana
5. Crea la base de datos
6. Una vez creada, ve a la pestaña **.env.local**
7. Copia `POSTGRES_URL`
8. Ve a **Settings** → **Environment Variables**
9. Agrega `POSTGRES_URL` con el valor copiado
10. Marca todas las opciones (Production, Preview, Development)
11. Guarda y haz **Redeploy**

#### B) Usar otra base de datos PostgreSQL (Neon, Supabase, etc.)

Si ya tienes una base de datos PostgreSQL en otro servicio:

1. Obtén tu cadena de conexión (debería verse así):
   ```
   postgresql://usuario:password@host:5432/dbname?sslmode=require
   ```

2. Ve a Vercel Dashboard → Tu Proyecto → **Settings** → **Environment Variables**

3. Agrega una nueva variable:
   - **Name**: `POSTGRES_URL`
   - **Value**: Tu cadena de conexión completa
   - Marca: ✅ Production, ✅ Preview, ✅ Development

4. Guarda y haz **Redeploy**

## Verificar que Funciona

Después de configurar y hacer redeploy:

1. Visita: `https://tu-dominio.vercel.app/api/debug/env-status`
2. Deberías ver: `POSTGRES_URL: ✅ Configurada`
3. Y también: `database: ✅ Conectado`

## Notas Importantes

- ⚠️ **Después de agregar variables de entorno, SIEMPRE haz redeploy**
- ✅ Marca las tres opciones: Production, Preview y Development
- 🔒 No compartas tu `POSTGRES_URL` públicamente (contiene credenciales)

## Si Aún No Funciona

1. Verifica que la variable esté en **Settings** → **Environment Variables**
2. Verifica que hayas marcado **Production** (no solo Preview/Development)
3. Haz un **Redeploy** completo (no uses caché)
4. Espera 1-2 minutos después del deploy
5. Revisa los logs de Vercel para ver si hay otros errores

