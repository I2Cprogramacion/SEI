# Fix: Error "Unexpected JSON Input" en Proyectos y Publicaciones

## 🔴 Problema Identificado

### Síntomas:
- ❌ Error "unexpected json input" al enviar formularios de proyectos y publicaciones
- ❌ Respuestas vacías o errores 404 en las peticiones POST
- ❌ Los formularios completos no se guardan en la base de datos

### Causa Raíz:
**Las rutas POST de las APIs NO EXISTÍAN** en:
- `app/api/proyectos/route.ts` → Solo tenía GET
- `app/api/publicaciones/route.ts` → Solo tenía GET

Adicionalmente, las tablas de la base de datos tenían **columnas faltantes** que las APIs intentaban usar.

---

## ✅ Soluciones Implementadas

### 1. **APIs POST Creadas**

#### `app/api/proyectos/route.ts`
- ✅ Nuevo método `POST` con autenticación Clerk
- ✅ Validación de campos requeridos
- ✅ Generación automática de slug único
- ✅ Inserción en base de datos PostgreSQL
- ✅ Manejo de errores específicos (duplicados, campos faltantes)
- ✅ Logs detallados para debugging

#### `app/api/publicaciones/route.ts`
- ✅ Nuevo método `POST` con autenticación Clerk
- ✅ Validación de campos requeridos
- ✅ Conversión de arrays a strings separados por comas
- ✅ Inserción en base de datos PostgreSQL
- ✅ Manejo de errores específicos
- ✅ Logs detallados para debugging

---

### 2. **Script de Migración SQL**

Archivo: `scripts/add-missing-columns.sql`

**Columnas agregadas a `proyectos`:**
- `investigador_principal_id` → ID del investigador principal
- `investigador_principal` → Nombre del investigador principal
- `area_investigacion` → Área de investigación
- `categoria` → Categoría del proyecto
- `fuente_financiamiento` → Fuente de financiamiento
- `archivo` → Nombre del archivo adjunto
- `archivo_url` → URL en Cloudinary
- `slug` → Slug único para URLs amigables
- `clerk_user_id` → ID del usuario en Clerk

**Columnas agregadas/modificadas en `publicaciones`:**
- `autor` → Renombrado desde "autores"
- `institucion` → Institución del autor
- `año_creacion` → Renombrado desde "anio"
- `categoria` → Categoría de la publicación
- `acceso` → Tipo de acceso (abierto/restringido)
- `archivo` → Nombre del archivo PDF
- `archivo_url` → URL en Cloudinary
- `clerk_user_id` → ID del usuario en Clerk

**Índices creados:**
- Índices en `slug`, `categoria`, `clerk_user_id` para mejor performance
- Índices en `investigador_principal` y `año_creacion` para filtros

---

## 🚀 Cómo Aplicar la Migración

### Opción 1: Usando psql (PostgreSQL CLI)

```bash
# Conectarse a la base de datos de Neon
psql "postgresql://usuario:contraseña@ep-nombre.region.neon.tech/sei?sslmode=require"

# Ejecutar el script de migración
\i scripts/add-missing-columns.sql
```

### Opción 2: Usando Neon Console

1. Ve a https://console.neon.tech
2. Selecciona tu proyecto
3. Ve a la pestaña **SQL Editor**
4. Copia y pega el contenido de `scripts/add-missing-columns.sql`
5. Click en **Run**

### Opción 3: Desde código (Next.js API)

Crear un endpoint temporal:

```typescript
// app/api/admin/migrate/route.ts
import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/database-config"
import fs from "fs"
import path from "path"

export async function POST() {
  try {
    const db = await getDatabase()
    const sqlPath = path.join(process.cwd(), 'scripts', 'add-missing-columns.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')
    
    await db.query(sql)
    
    return NextResponse.json({ 
      success: true, 
      message: "Migración ejecutada exitosamente" 
    })
  } catch (error) {
    console.error("Error en migración:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
```

Luego llamar: `POST /api/admin/migrate`

---

## 🧪 Testing

### Test 1: Crear Proyecto

```bash
curl -X POST https://sei-chih.com.mx/api/proyectos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -d '{
    "titulo": "Proyecto de Prueba",
    "descripcion": "Descripción del proyecto",
    "investigador_principal": "Dr. Juan Pérez",
    "fecha_inicio": "2025-01-01",
    "estado": "activo",
    "categoria": "Ciencias Exactas"
  }'
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Proyecto creado exitosamente",
  "proyecto": {
    "id": 1,
    "titulo": "Proyecto de Prueba",
    "slug": "proyecto-de-prueba"
  }
}
```

### Test 2: Crear Publicación

```bash
curl -X POST https://sei-chih.com.mx/api/publicaciones \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -d '{
    "titulo": "Publicación de Prueba",
    "autor": "Dr. María García",
    "año_creacion": 2024,
    "categoria": "Biotecnología",
    "tipo": "Artículo"
  }'
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Publicación creada exitosamente",
  "publicacion": {
    "id": 1,
    "titulo": "Publicación de Prueba",
    "año": 2024
  }
}
```

---

## 📊 Estructura de Datos

### Proyecto (Request Body)

```typescript
{
  // REQUERIDOS
  titulo: string
  descripcion: string
  investigador_principal: string
  fecha_inicio: string (YYYY-MM-DD)
  estado: string ("activo" | "completado" | "en-pausa")
  categoria: string
  
  // OPCIONALES
  investigador_principal_id?: number
  institucion?: string
  fecha_fin?: string
  area_investigacion?: string
  presupuesto?: number
  fuente_financiamiento?: string
  palabras_clave?: string[] | string
  objetivos?: string[] | string
  resultados?: string[] | string
  metodologia?: string
  impacto?: string
  colaboradores?: string[] | string
  archivo?: string
  archivoUrl?: string
}
```

### Publicación (Request Body)

```typescript
{
  // REQUERIDOS
  titulo: string
  autor: string | string[]
  año_creacion: number
  categoria: string
  tipo: string ("Artículo" | "Libro" | "Capítulo" | "Conferencia" | "Tesis")
  
  // OPCIONALES
  institucion?: string
  editorial?: string (o revista)
  doi?: string
  resumen?: string
  palabras_clave?: string[] | string
  acceso?: string ("abierto" | "restringido")
  volumen?: string
  numero?: string
  paginas?: string
  archivo?: string
  archivo_url?: string
}
```

---

## 🔍 Debugging

### Verificar que las APIs funcionan

```bash
# Ver logs en tiempo real en Vercel
vercel logs sei-chih.com.mx --follow

# O en terminal local (development)
npm run dev
# Luego enviar POST desde el frontend
```

### Logs esperados (backend):

```
📥 Datos recibidos para crear proyecto: { titulo: "...", ... }
💾 Insertando proyecto en base de datos...
✅ Proyecto creado exitosamente: { id: 1, titulo: "...", slug: "..." }
```

### Si hay error de columna faltante:

```
❌ Error al crear proyecto: column "slug" of relation "proyectos" does not exist
```

**Solución:** Ejecutar `scripts/add-missing-columns.sql`

### Si hay error de autenticación:

```json
{
  "error": "No autenticado"
}
```

**Solución:** El usuario no está logueado con Clerk. Verificar `currentUser()` en el servidor.

---

## 📋 Checklist de Verificación

- [ ] Ejecutar `scripts/add-missing-columns.sql` en la base de datos
- [ ] Verificar que las columnas existen con las queries del script
- [ ] Probar crear proyecto desde `/proyectos/nuevo`
- [ ] Probar crear publicación desde `/publicaciones/nueva`
- [ ] Verificar que los datos aparecen en `/proyectos` y `/publicaciones`
- [ ] Revisar logs de Vercel para confirmar que no hay errores
- [ ] Verificar que los archivos se suben correctamente a Cloudinary

---

## 🎯 Resultados Esperados

### Antes del Fix:
- ❌ Error "unexpected json input"
- ❌ Formularios no se guardaban
- ❌ Respuestas 404 o 500

### Después del Fix:
- ✅ Formularios se envían correctamente
- ✅ Proyectos y publicaciones se guardan en PostgreSQL
- ✅ Respuestas 201 con datos del recurso creado
- ✅ Archivos se suben a Cloudinary
- ✅ Los datos aparecen en las páginas de listado

---

## 📚 Archivos Modificados

1. ✅ `app/api/proyectos/route.ts` - Agregado método POST
2. ✅ `app/api/publicaciones/route.ts` - Agregado método POST
3. ✅ `scripts/add-missing-columns.sql` - Nuevo script de migración
4. ✅ `docs/FIX_UNEXPECTED_JSON.md` - Esta documentación

---

## 🔄 Próximos Pasos

1. **Ejecutar la migración SQL** en la base de datos de producción
2. **Probar los formularios** en staging antes de producción
3. **Monitorear logs** después del deploy para verificar que funciona
4. **Actualizar** `scripts/reset-database.sql` con las nuevas columnas (para futuros resets)

---

✅ **Fix completo implementado y documentado**
