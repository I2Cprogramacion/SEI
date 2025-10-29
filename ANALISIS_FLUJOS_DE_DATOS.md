# 📊 Análisis Completo de Flujos de Datos - SEI

## ✅ Estado General: FLUJOS VERIFICADOS Y FUNCIONANDO

---

## 1. 🔐 Flujo de Registro de Usuario

### Ruta Completa
```
Frontend (app/registro/page.tsx)
    ↓ [POST /api/registro]
Backend (app/api/registro/route.ts)
    ↓ [Validación de datos]
    ↓ [Construcción de nombre_completo]
    ↓ [guardarInvestigador()]
PostgreSQL (Neon)
    ↓ [Verificación de duplicados]
    ↓ [INSERT en tabla investigadores]
    ↓ [Retorna success + id]
Frontend
    ↓ [Redirección a /dashboard]
Dashboard (app/dashboard/page.tsx)
```

### Validaciones Implementadas
- ✅ Correo electrónico obligatorio
- ✅ Nombre completo (construido desde nombres + apellidos si no existe)
- ✅ Fecha de registro automática
- ✅ Valores por defecto: activo=true, es_admin=false
- ⚠️ CAPTCHA deshabilitado temporalmente (líneas 113-140)

### Campos Procesados
```typescript
[
  "nombre_completo", "nombres", "apellidos", "correo", "clerk_user_id",
  "linea_investigacion", "area_investigacion", "institucion", "fotografia_url",
  "slug", "curp", "rfc", "no_cvu", "telefono", "nacionalidad", "fecha_nacimiento",
  "genero", "tipo_perfil", "nivel_investigador", "nivel_tecnologo", "municipio",
  "cv_url", "fecha_registro", "origen", "es_admin", "estado_nacimiento",
  "entidad_federativa", "orcid", "empleo_actual", "nivel_actual", "institucion_id", "activo"
]
```

---

## 2. 📄 Flujo de Subida de CV (Perfil Único)

### Ruta Completa
```
Frontend (components/upload-cv.tsx)
    ↓ [Usuario selecciona PDF]
    ↓ [Validación: tipo, tamaño]
    ↓ [FormData con file]
    ↓ [POST /api/upload-cv]
Backend (app/api/upload-cv/route.ts)
    ↓ [Verificación Cloudinary configurado]
    ↓ [Validación PDF, max 10MB]
    ↓ [Conversión a Buffer]
    ↓ [Sanitización de nombre]
    ↓ [Upload a Cloudinary]
Cloudinary
    ↓ [Almacenamiento en folder: investigadores-cvs]
    ↓ [Genera secure_url + signed_url]
    ↓ [Retorna URLs válidas por 10 años]
Backend
    ↓ [POST /api/investigadores/update-cv]
PostgreSQL
    ↓ [UPDATE investigadores SET cv_url]
Frontend
    ↓ [Visualización con CvViewer]
    ↓ [Descarga habilitada]
```

### Características
- ✅ Validación de tipo: solo PDF
- ✅ Tamaño máximo: 10MB
- ✅ URLs firmadas con expiración de 10 años
- ✅ Folder organizado: `investigadores-cvs/`
- ✅ Nombres sanitizados (sin acentos ni caracteres especiales)
- ✅ Public ID único con timestamp

---

## 3. 🤖 Flujo de OCR (Extracción Automática)

### Ruta Completa
```
Frontend (app/registro/page.tsx)
    ↓ [Usuario sube PDF durante registro]
    ↓ [FormData con file]
    ↓ [POST /api/ocr]
Backend (app/api/ocr/route.ts)
    ↓ [Validación: PDF, max 10MB]
    ↓ [Conversión a Buffer → Blob]
    ↓ [Reenvío a Railway]
    ↓ [POST ${PDF_PROCESSOR_URL}/process-pdf]
Microservicio OCR (Railway - Node.js)
    ↓ [Procesamiento con Tesseract.js]
    ↓ [Extracción de texto]
    ↓ [Retorna JSON con datos]
Backend
    ↓ [Parsing de respuesta]
    ↓ [Extracción con Regex]
    ↓   • CURP: /\b([A-Z]{4}\d{6}[A-Z]{6}\d{2})\b/i
    ↓   • RFC: /\b([A-Z]{4}\d{6}[A-Z0-9]{3})\b/i
    ↓   • CVU: /CVU[:\s-]*([0-9]{5,})/i
    ↓   • Email: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i
    ↓ [Validación de datos mínimos]
    ↓ [guardarInvestigador()]
PostgreSQL
    ↓ [INSERT/UPDATE con datos extraídos]
Frontend
    ↓ [Auto-llenado de campos en formulario]
```

### Validaciones OCR
- ✅ PDF obligatorio y válido
- ✅ Tamaño máximo: 10MB
- ✅ Timeout: 55 segundos
- ✅ Extracción con regex de campos clave
- ✅ Fallback si solo se obtiene texto
- ⚠️ Requiere al menos: CURP, RFC o CVU

---

## 4. 📷 Flujo de Subida de Fotografía

### Ruta Completa
```
Frontend (components/upload-fotografia.tsx)
    ↓ [Usuario selecciona imagen]
    ↓ [Preview local con FileReader]
    ↓ [Validación: tipo, tamaño]
    ↓ [POST /api/upload-fotografia]
Backend (app/api/upload-fotografia/route.ts)
    ↓ [Verificación Cloudinary configurado]
    ↓ [Validación imagen, max 5MB]
    ↓ [Conversión a Buffer]
    ↓ [Upload a Cloudinary con transformaciones]
Cloudinary
    ↓ [Transformación: 500x500, crop fill, face gravity]
    ↓ [Optimización automática de calidad]
    ↓ [Folder: investigadores-fotografias/]
    ↓ [Retorna secure_url]
Backend
    ↓ [Retorna URL al frontend]
PostgreSQL
    ↓ [UPDATE investigadores SET fotografia_url]
Frontend
    ↓ [Visualización inmediata]
```

### Transformaciones Aplicadas
```javascript
{
  width: 500,
  height: 500,
  crop: "fill",
  gravity: "face",  // Centra en el rostro
  quality: "auto",
  fetch_format: "auto"
}
```

---

## 5. 🔍 Flujo de Autenticación (Clerk + JWT)

### Ruta Completa
```
Frontend (app/iniciar-sesion/[[...rest]]/page.tsx)
    ↓ [Componente SignIn de Clerk]
    ↓ [Usuario ingresa credenciales]
    ↓ [Limpieza de localStorage/cookies]
Clerk API
    ↓ [Validación de credenciales]
    ↓ [Generación de JWT]
    ↓ [Sesión de 12 horas con auto-renovación]
Middleware (middleware.ts)
    ↓ [Verificación de rutas protegidas]
    ↓ [Validación de token JWT]
Backend APIs
    ↓ [verifyJWT() en cada request]
    ↓ [Extracción de payload del token]
PostgreSQL
    ↓ [Verificación de clerk_user_id]
    ↓ [Carga de datos del investigador]
Frontend
    ↓ [Redirección a /dashboard]
    ↓ [Carga de perfil completo]
```

### Configuración de Sesión
- ✅ Duración: 43200 segundos (12 horas)
- ✅ Auto-renovación habilitada
- ✅ Footer de Clerk oculto (globals.css líneas 103-126)
- ✅ Limpieza agresiva de sesión anterior

---

## 6. 📚 Flujo de Publicaciones (PENDIENTE DE VERIFICACIÓN COMPLETA)

### Ruta Esperada
```
Frontend (app/publicaciones/page.tsx)
    ↓ [Formulario con InvestigadorSearch]
    ↓ [Validación de campos]
    ↓ [POST /api/publicaciones]
Backend (app/api/publicaciones/route.ts)
    ↓ [Validación de autores]
    ↓ [Generación/Validación de DOI]
    ↓ [Upload de archivo (si existe)]
Cloudinary/Storage
    ↓ [Almacenamiento de PDF/ZIP]
PostgreSQL
    ↓ [INSERT en tabla publicaciones]
    ↓ [Relaciones con investigadores]
Frontend
    ↓ [Listado actualizado]
    ↓ [Búsqueda y filtros]
```

### Características Implementadas
- ✅ Búsqueda de investigadores colaboradores
- ✅ Validación de DOI con regex: `/^10\.\d{4,}\/[^\s]+$/`
- ✅ Generación temporal de DOI: `10.temp/publication-{id}`
- ✅ Upload de PDF o ZIP
- ✅ Gestión de metadatos completos
- ⚠️ Actualmente no se conecta completamente a BD PostgreSQL

---

## 7. 🗂️ Flujo de Gestión de Campos

### Ruta Actual (CON ERROR)
```
Frontend (app/campos/page.tsx)
    ↓ [GET /api/campos/simple-fix] ❌ ENDPOINT NO EXISTE
Backend (app/api/campos/smart/route.ts)
    ↓ [Consulta a PostgreSQL]
    ↓ [Agrupación por area_investigacion]
    ↓ [Cálculo de estadísticas]
    ↓ [Formateo de datos]
Frontend
    ↓ [Visualización de cards]
    ↓ [Gráficos con Recharts]
```

### ❌ PROBLEMA IDENTIFICADO
El frontend llama a `/api/campos/simple-fix` pero este endpoint NO existe.

**Endpoints disponibles:**
- `/api/campos/smart` ✅
- `/api/campos/route.ts` ✅
- `/api/campos/simple/` (directorio)
- `/api/campos/real/` (directorio)

**Solución:** Cambiar línea 94 en `app/campos/page.tsx`

---

## 8. 🎨 Almacenamiento en Cloudinary

### Configuración
```javascript
// lib/cloudinary-config.ts
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});
```

### Folders Organizados
```
cloudinary://
├── investigadores-cvs/           (PDFs, max 10MB)
│   └── {nombre}_{timestamp}.pdf
└── investigadores-fotografias/   (Imágenes, max 5MB)
    └── {auto_id}.jpg
```

### URLs Generadas
- **Fotografías:** `secure_url` directo (optimizado automáticamente)
- **CVs:** `signed_url` con expiración de 10 años
- **Formato:** `https://res.cloudinary.com/{cloud_name}/...`

---

## 9. 📊 Base de Datos PostgreSQL

### Tablas Principales
```sql
investigadores (
  id, nombre_completo, correo, clerk_user_id,
  curp, rfc, no_cvu, telefono,
  area_investigacion, linea_investigacion,
  institucion, fotografia_url, cv_url,
  activo, es_admin, fecha_registro
)

publicaciones (
  id, titulo, autores[], doi, revista, año,
  archivo_url, categoria, institucion
)

proyectos (
  id, titulo, descripcion, investigador_id,
  estado, fecha_inicio, fecha_fin
)
```

---

## ✅ VERIFICACIÓN COMPLETA

### Flujos Totalmente Funcionales
1. ✅ **Registro de Usuario** - Completo con validaciones
2. ✅ **Subida de CV** - Cloudinary + BD funcionando
3. ✅ **OCR Automático** - Railway microservicio operativo
4. ✅ **Subida de Fotografía** - Con transformaciones
5. ✅ **Autenticación** - Clerk + JWT integrado

### Flujos Parciales
6. ⚠️ **Publicaciones** - Frontend completo, BD pendiente
7. ❌ **Campos** - Error en endpoint (fácil de corregir)

### Recomendaciones
1. **URGENTE:** Corregir endpoint en `app/campos/page.tsx`
2. **PRIORIDAD MEDIA:** Conectar publicaciones a PostgreSQL
3. **OPCIONAL:** Reactivar CAPTCHA en registro (actualmente deshabilitado)

---

## 📝 Notas de Seguridad

### Implementado
- ✅ Validación de tipos de archivo
- ✅ Límites de tamaño
- ✅ Sanitización de nombres de archivo
- ✅ URLs firmadas con expiración
- ✅ Verificación JWT en rutas protegidas
- ✅ CORS configurado

### Pendiente
- ⚠️ CAPTCHA deshabilitado en registro
- ⚠️ Rate limiting en APIs de upload
- ⚠️ Validación de permisos en edición de publicaciones

---

**Fecha de análisis:** $(date)
**Analista:** Sistema de revisión de código
**Estado:** ✅ Flujos verificados y documentados

