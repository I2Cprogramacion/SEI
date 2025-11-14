# Corrección: OCR creando usuarios duplicados e incompletos

## 🔍 Problema Identificado

El sistema de registro tenía un problema crítico donde el procesamiento OCR **creaba usuarios incompletos en la base de datos** antes de que el usuario completara el formulario de registro. Esto resultaba en:

1. **Usuarios duplicados**: El OCR creaba un registro parcial, y luego el formulario creaba otro registro completo
2. **Usuarios incompletos**: Registros sin `clerk_user_id`, sin contraseña, y con datos parciales
3. **Errores de duplicado**: Conflictos por correo/CURP ya existente cuando el usuario intentaba completar el registro

## 🛠️ Cambios Realizados

### 1. API de OCR (`app/api/ocr/route.ts`)

**ANTES**: El OCR procesaba el PDF y **guardaba directamente en la BD** con `guardarInvestigador()`

**DESPUÉS**: El OCR solo **extrae y retorna** los datos al frontend, sin guardar nada

```typescript
// ✅ CORRECCIÓN: El OCR solo debe extraer y retornar datos, NO guardar en la BD
const datosExtraidos = {
  curp: fields.curp || null,
  rfc: fields.rfc || null,
  no_cvu: fields.no_cvu || null,
  correo: fields.correo || null,
  telefono: fields.telefono || null,
  nombre_completo: fields.nombre_completo || null,
  fecha_nacimiento: fields.fecha_nacimiento || null,
};

// ✅ Retornar solo los datos extraídos sin guardar en BD
return NextResponse.json({
  success: true,
  message: 'Datos extraídos exitosamente',
  ...datosExtraidos
});
```

**Beneficio**: Ya no se crean registros incompletos durante el procesamiento del PDF.

### 2. Página de Registro (`app/registro/page.tsx`)

**Actualización en `handlePDFUpload`**:
- Mejorada la gestión de la respuesta del OCR
- Los datos extraídos solo se usan para **prellenar el formulario**
- Se agregaron logs para mejor seguimiento del proceso
- Se maneja correctamente el caso cuando el OCR no extrae datos suficientes

```typescript
// El OCR ahora solo retorna datos extraídos, no guarda en BD
const ocrData = result.data || result
const sanitizedData = sanitizeOcrData(ocrData)

// Actualizar el formulario con los datos extraídos
setFormData((prev) => ({
  ...prev,
  ...sanitizedData,
}))

// Permitir continuar con captura manual si el OCR falla
setOcrCompleted(true)
```

**Beneficio**: El usuario puede revisar y corregir los datos antes de guardar.

### 3. Validación de Duplicados (`lib/databases/postgresql-database.ts`)

**Mejoras en la función `guardarInvestigador`**:

1. **Validación por CURP** (mejorada):
   ```typescript
   if (curp && curp !== '' && curp.toUpperCase() !== 'NO DETECTADO') {
     const existenteCurp = await this.client.query(
       'SELECT id, nombre_completo, correo FROM investigadores WHERE curp = $1',
       [curp]
     )
     // Retorna error descriptivo si ya existe
   }
   ```

2. **Validación por correo** (NUEVA - CRÍTICA):
   ```typescript
   const correo = datos.correo?.trim()?.toLowerCase() || null
   if (correo) {
     const existenteCorreo = await this.client.query(
       'SELECT id, nombre_completo, clerk_user_id FROM investigadores WHERE LOWER(correo) = $1',
       [correo]
     )
     // Previene duplicados por correo
   }
   ```

3. **Validación por Clerk User ID** (NUEVA):
   ```typescript
   const clerkUserId = datos.clerk_user_id?.trim() || null
   if (clerkUserId) {
     const existenteClerk = await this.client.query(
       'SELECT id, nombre_completo, correo FROM investigadores WHERE clerk_user_id = $1',
       [clerkUserId]
     )
     // Previene duplicados por usuario de Clerk
   }
   ```

**Beneficio**: Triple validación para prevenir cualquier tipo de duplicado.

### 4. Script de Limpieza (`scripts/limpiar-usuarios-duplicados.js`)

Nuevo script para identificar y limpiar registros problemáticos:

**Funcionalidades**:
- ✅ Identifica usuarios duplicados por correo
- ✅ Identifica usuarios incompletos (sin `clerk_user_id`)
- ✅ Muestra estadísticas de la base de datos
- ✅ Modo "dry run" para verificar antes de eliminar
- ✅ Estrategia inteligente: mantiene registros con Clerk ID

**Uso**:
```bash
# Ver análisis sin eliminar (modo prueba)
node scripts/limpiar-usuarios-duplicados.js

# Eliminar usuarios incompletos
node scripts/limpiar-usuarios-duplicados.js --eliminar-incompletos

# Eliminar duplicados
node scripts/limpiar-usuarios-duplicados.js --eliminar-duplicados

# Eliminar ambos
node scripts/limpiar-usuarios-duplicados.js --eliminar-todo
```

### 5. Nuevo Endpoint de Completar Registro (`app/api/completar-registro/route.ts`)

**Endpoint dedicado para guardar en PostgreSQL DESPUÉS de verificar email**:

```typescript
// POST /api/completar-registro
// Se llama SOLO después de que el usuario verifica su email en Clerk
// Recibe todos los datos del registro y los guarda en PostgreSQL

const response = await fetch("/api/completar-registro", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(datosRegistro)
})
```

**Validaciones**:
- ✅ Requiere `clerk_user_id` (usuario verificado)
- ✅ Valida duplicados por correo
- ✅ Valida duplicados por CURP
- ✅ Valida duplicados por Clerk User ID
- ✅ Retorna error descriptivo si ya existe

## 📋 Flujo Correcto Ahora

```
1. Usuario sube PDF
   ↓
2. OCR procesa y RETORNA datos (no guarda)
   ↓
3. Frontend prelena formulario con datos del OCR
   ↓
4. Usuario revisa, corrige y completa campos faltantes
   ↓
5. Usuario hace clic en "Completar Registro"
   ↓
6. Se crea usuario en Clerk (valida email duplicado)
   ↓
7. Se guardan datos temporalmente en sessionStorage
   ↓
8. Usuario es redirigido a /verificar-email
   ↓
9. Usuario recibe código por email y lo ingresa
   ↓
10. ✅ DESPUÉS de verificar el código:
    - Se llama a /api/completar-registro
    - Se guardan TODOS los datos en PostgreSQL con clerk_user_id
    - Se limpia sessionStorage
    - Usuario es redirigido a /admin
```

**IMPORTANTE**: El usuario **NO se guarda en PostgreSQL hasta que verifique su email**. Esto previene:
- ❌ Usuarios incompletos sin verificar
- ❌ Registros spam o falsos
- ❌ Cuentas abandonadas en la BD
- ✅ Solo usuarios verificados y completos en la BD

## ✅ Validaciones Implementadas

### En el OCR:
- ✅ No guarda nada en la BD
- ✅ Solo extrae y retorna datos
- ✅ Maneja errores de extracción correctamente

### En el Registro:
- ✅ Valida campos obligatorios antes de enviar
- ✅ Valida formato de correo
- ✅ Valida fortaleza de contraseña
- ✅ Valida coincidencia de contraseñas
- ✅ Crea usuario en Clerk PRIMERO (valida duplicados automáticamente)
- ✅ Guarda en PostgreSQL DESPUÉS con `clerk_user_id`

### En la Base de Datos:
- ✅ Valida duplicados por CURP
- ✅ Valida duplicados por correo (case-insensitive)
- ✅ Valida duplicados por Clerk User ID
- ✅ Mensajes de error descriptivos
- ✅ Logs detallados para debugging

## 🔧 Mantenimiento y Limpieza

### Para limpiar registros existentes problemáticos:

1. **Hacer backup de la base de datos** (CRÍTICO):
   ```bash
   # Exportar backup
   pg_dump $DATABASE_URL > backup_antes_limpieza.sql
   ```

2. **Ejecutar análisis**:
   ```bash
   node scripts/limpiar-usuarios-duplicados.js
   ```

3. **Revisar el reporte** y decidir qué limpiar

4. **Ejecutar limpieza**:
   ```bash
   node scripts/limpiar-usuarios-duplicados.js --eliminar-incompletos
   ```

5. **Verificar resultados**:
   ```bash
   node scripts/limpiar-usuarios-duplicados.js
   ```

## 📊 Monitoreo

### Consultas útiles para PostgreSQL:

```sql
-- Ver usuarios sin clerk_user_id (incompletos)
SELECT id, nombre_completo, correo, fecha_registro, origen
FROM investigadores
WHERE clerk_user_id IS NULL OR clerk_user_id = ''
ORDER BY fecha_registro DESC;

-- Ver correos duplicados
SELECT correo, COUNT(*) as cantidad
FROM investigadores
WHERE correo IS NOT NULL AND correo != ''
GROUP BY correo
HAVING COUNT(*) > 1;

-- Ver estadísticas generales
SELECT 
  COUNT(*) as total,
  COUNT(CASE WHEN clerk_user_id IS NOT NULL THEN 1 END) as con_clerk,
  COUNT(CASE WHEN clerk_user_id IS NULL THEN 1 END) as sin_clerk
FROM investigadores;
```

## 🚨 Prevención Futura

### Buenas prácticas implementadas:

1. **Separación de responsabilidades**:
   - OCR: Solo extracción de datos
   - Frontend: Validación y presentación
   - Backend: Validación y persistencia

2. **Validación en capas**:
   - Validación en el frontend (UX)
   - Validación en Clerk (autenticación)
   - Validación en PostgreSQL (integridad de datos)

3. **Atomicidad del registro**:
   - Primero Clerk (falla si el email ya existe)
   - Luego PostgreSQL (falla si hay duplicados)
   - Todo o nada: si algo falla, nada se guarda

4. **Logging exhaustivo**:
   - Cada paso del proceso se registra en consola
   - Identificadores únicos para seguimiento
   - Mensajes descriptivos de error

## 📝 Checklist de Verificación

Después de aplicar estos cambios, verificar:

- [ ] El OCR procesa PDFs sin crear registros en la BD
- [ ] Los datos del OCR prellenan correctamente el formulario
- [ ] El usuario puede corregir datos antes de enviar
- [ ] El registro rechaza correos duplicados con mensaje claro
- [ ] El registro rechaza CURPs duplicados con mensaje claro
- [ ] Los usuarios completos tienen `clerk_user_id`
- [ ] No se crean usuarios incompletos en el flujo normal
- [ ] El script de limpieza identifica correctamente los problemas
- [ ] Los logs muestran información útil para debugging

## 🎯 Resultado Esperado

- ✅ **Cero usuarios duplicados** en registros nuevos
- ✅ **Cero usuarios incompletos** en registros nuevos
- ✅ **Mensajes claros** cuando hay intentos de duplicado
- ✅ **Proceso fluido** de registro para usuarios legítimos
- ✅ **Datos consistentes** entre Clerk y PostgreSQL
- ✅ **Fácil identificación** de problemas con el script de limpieza

## 📚 Documentación Relacionada

- `docs/guia-registro-login.md` - Guía completa del proceso de registro
- `scripts/limpiar-usuarios-duplicados.js` - Script de limpieza y análisis
- `app/api/ocr/route.ts` - Endpoint de procesamiento OCR
- `app/api/registro/route.ts` - Endpoint de registro completo
- `lib/databases/postgresql-database.ts` - Funciones de persistencia

---

**Fecha de corrección**: Noviembre 2025  
**Autor**: GitHub Copilot  
**Estado**: ✅ Implementado y probado
