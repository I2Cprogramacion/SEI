# 🔍 AUDITORÍA COMPLETA DE RUTAS DE DATOS
## Neon + Clerk + Prisma

---

## 📊 RESUMEN EJECUTIVO

### ✅ Estado General: **BUENO** con ajustes menores necesarios

---

## 1️⃣ SCHEMA PRISMA vs TABLA NEON

### Modelo en Prisma: `Profile`
**Mapeo a tabla:** `@@map("investigadores")` ✅ CORRECTO

### Campos Críticos del Registro:

| Campo Prisma (camelCase) | Campo DB (snake_case) | ¿Existe en Neon? | Estado |
|--------------------------|----------------------|------------------|--------|
| `clerkUserId` | `clerk_user_id` | ✅ Sí | ✅ OK |
| `nombreCompleto` | `nombre_completo` | ✅ Sí | ✅ OK |
| `nombres` | `nombres` | ✅ Sí | ✅ OK |
| `apellidos` | `apellidos` | ✅ Sí | ✅ OK |
| `correo` | `correo` | ✅ Sí | ✅ OK |
| `curp` | `curp` | ✅ Sí | ✅ OK |
| `rfc` | `rfc` | ✅ Sí | ✅ OK |
| `noCvu` | `no_cvu` | ✅ Sí | ✅ OK |
| `telefono` | `telefono` | ✅ Sí | ✅ OK |
| `genero` | `genero` | ✅ Sí | ✅ OK |
| `municipio` | `municipio` | ✅ Sí | ✅ OK |
| `tipoPerfil` | `tipo_perfil` | ✅ Sí | ✅ OK |
| `nivelInvestigador` | `nivel_investigador` | ✅ Sí | ✅ OK |
| `nivelTecnologoTexto` | `nivel_tecnologo` | ⚠️ Verificar | ⚠️ FALTA |
| `lineaInvestigacion` | `linea_investigacion` | ✅ Sí | ✅ OK |
| `areaInvestigacion` | `area_investigacion` | ✅ Sí | ✅ OK |
| `ultimoGradoEstudios` | `ultimo_grado_estudios` | ✅ Sí | ✅ OK |
| `empleoActual` | `empleo_actual` | ✅ Sí | ✅ OK |
| `fotografiaUrl` | `fotografia_url` | ✅ Sí | ✅ OK |
| `cvUrl` | `cv_url` | ✅ Sí | ✅ OK |

---

## 2️⃣ FLUJO DE REGISTRO

### Archivo: `app/api/registro/route.ts`

**Campos declarados (línea 71):**
```typescript
const camposTabla = [
  "nombre_completo", "nombres", "apellidos", "correo", "clerk_user_id", 
  "area_investigacion", "institucion", "fotografia_url", "slug", "curp", 
  "rfc", "no_cvu", "telefono", "nacionalidad", "fecha_nacimiento", "genero", 
  "tipo_perfil", "nivel_investigador", "nivel_tecnologo", "municipio", 
  "cv_url", "fecha_registro", "origen", "es_admin", "estado_nacimiento", 
  "entidad_federativa", "orcid", "empleo_actual", "nivel_actual", 
  "institucion_id", "activo"
]
```

### ⚠️ PROBLEMA DETECTADO #1:
**Falta:** `linea_investigacion` en la lista de `camposTabla`

**Impacto:** Al registrar un usuario, la `linea_investigacion` NO se guarda en la base de datos.

**Solución:** Agregar `"linea_investigacion"` al array de `camposTabla`.

---

## 3️⃣ FLUJO DE OBTENCIÓN DE PERFIL

### Archivo: `app/api/investigadores/perfil/route.ts`

**SELECT Query (líneas 29-68):**
```sql
SELECT 
  id, nombre_completo, nombres, apellidos, correo, clerk_user_id,
  area_investigacion, linea_investigacion, institucion, fotografia_url,
  slug, curp, rfc, no_cvu, telefono, nacionalidad, fecha_nacimiento,
  genero, municipio, tipo_perfil, nivel_investigador, nivel_tecnologo,
  cv_url, fecha_registro, origen, es_admin, estado_nacimiento,
  entidad_federativa, orcid, empleo_actual, ultimo_grado_estudios,
  nivel_actual, institucion_id, activo
FROM investigadores 
WHERE clerk_user_id = $1 OR correo = $2
```

### ✅ Estado: **CORRECTO**
- Todos los campos necesarios están en el SELECT
- Usa nombres de columna correctos (snake_case)
- Busca por `clerk_user_id` O `correo` (lógica correcta)

---

## 4️⃣ GUARDADO EN BASE DE DATOS

### Archivo: `lib/databases/postgresql-database.ts`

**Método:** `guardarInvestigador()` (líneas 174-241)

**Estrategia:**
```typescript
// Construye dinámicamente el INSERT con los campos que vienen
const campos = Object.keys(datos).filter(
  (campo) => datos[campo] !== undefined && datos[campo] !== null
)
const query = `INSERT INTO investigadores (${campos.join(", ")}) VALUES (...)`
```

### ✅ Estado: **CORRECTO**
- Usa nombres de campo tal cual vienen (snake_case) ✓
- Filtra valores undefined/null ✓
- Tiene logs completos para debugging ✓

---

## 5️⃣ CLERK INTEGRATION

### Archivo: `app/registro/page.tsx`

**Creación de usuario en Clerk (línea 883-886):**
```typescript
const signUpAttempt = await signUp.create({
  emailAddress: formData.correo,  // ✅ USA EL CORREO CORRECTO
  password: formData.password,
})
```

**Envío a PostgreSQL (línea 894-907):**
```typescript
const dataToSend = {
  ...formData,
  linea_investigacion: Array.isArray(formData.linea_investigacion) 
    ? formData.linea_investigacion.join(', ') 
    : formData.linea_investigacion,
  nombre_completo: formData.nombre_completo || `${formData.nombres} ${formData.apellidos}`,
  clerk_user_id: signUpAttempt.createdUserId, // ✅ VINCULA CON CLERK
  fecha_registro: new Date().toISOString(),
  origen: "ocr",
}
```

### ✅ Estado: **CORRECTO**
- Usa `formData.correo` para Clerk ✓
- Vincula con `clerk_user_id` ✓
- Convierte arrays a strings ✓

---

## 🔴 PROBLEMAS IDENTIFICADOS

### Problema #1: Campo faltante en API
**Archivo:** `app/api/registro/route.ts` línea 71
**Campo faltante:** `linea_investigacion`
**Severidad:** 🟡 MEDIA
**Impacto:** Las líneas de investigación no se guardan

### Problema #2: Columna posiblemente faltante en Neon
**Tabla:** `investigadores`
**Columna:** `nivel_tecnologo`
**Severidad:** 🟡 MEDIA
**Impacto:** Los niveles de tecnólogo no se guardan

---

## ✅ CORRECCIONES NECESARIAS

### 1. Agregar `linea_investigacion` al registro
```typescript
// En app/api/registro/route.ts línea 71
const camposTabla = [
  "nombre_completo", "nombres", "apellidos", "correo", "clerk_user_id", 
  "linea_investigacion", // ← AGREGAR AQUÍ
  "area_investigacion", "institucion", "fotografia_url", "slug", "curp", 
  ...
]
```

### 2. Verificar columna `nivel_tecnologo` en Neon
```sql
-- Ejecutar en Neon:
ALTER TABLE investigadores 
ADD COLUMN IF NOT EXISTS nivel_tecnologo VARCHAR(100);
```

---

## 📝 CHECKLIST DE VERIFICACIÓN

- [x] Prisma schema tiene `@@map("investigadores")` ✓
- [x] Clerk usa `emailAddress: formData.correo` ✓
- [x] API perfil busca por `clerk_user_id` ✓
- [x] Todos los campos usan snake_case en DB ✓
- [ ] ⚠️ Campo `linea_investigacion` en lista de registro
- [ ] ⚠️ Columna `nivel_tecnologo` existe en Neon

---

## 🎯 PLAN DE ACCIÓN

1. **Inmediato:** Agregar `linea_investigacion` al array de campos
2. **Inmediato:** Verificar/agregar columna `nivel_tecnologo` en Neon
3. **Testing:** Registrar un usuario de prueba y verificar que TODOS los campos se guarden
4. **Validación:** Verificar que el perfil cargue todos los datos

---

## 📊 RESULTADO FINAL ESPERADO

Después de las correcciones:
```
✅ Usuario registrado en Clerk con EMAIL correcto
✅ Datos guardados en Neon con clerk_user_id
✅ Todos los campos del formulario guardados (incluido linea_investigacion)
✅ Perfil carga correctamente con todos los datos
✅ Dashboard muestra nombre completo y datos correctos
```

