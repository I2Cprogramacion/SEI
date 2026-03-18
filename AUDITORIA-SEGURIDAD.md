# 🔒 AUDITORÍA DE SEGURIDAD - SEI

**Fecha**: 18 de marzo, 2026  
**Nivel de riesgo general**: MEDIO-ALTO  
**Hallazgos críticos**: 3  
**Hallazgos altos**: 5  
**Hallazgos medios**: 8

---

## 📋 RESUMEN EJECUTIVO

El proyecto SEI cuenta con **autenticación robusta mediante Clerk** pero tiene **varias brechas de seguridad críticas** principalmente en:

1. ✅ **POSITIVO**: Autenticación con Clerk está bien configurada
2. ✅ **POSITIVO**: Validación Zod implementada correctamente
3. ✅ **POSITIVO**: No hay SQL injection evidente
4. ❌ **CRÍTICO**: Credenciales almacenadas en `.env.local` (versionado en git)
5. ❌ **CRÍTICO**: Datos sensibles (CURP, RFC) sin encriptación
6. ❌ **CRÍTICO**: Falta autorización en endpoints de API

---

## 🔴 HALLAZGOS CRÍTICOS

### 1. **CREDENCIALES COMPROMETIDAS EN GIT** 🚨
**Severidad**: CRÍTICA  
**Archivo**: `.env.local`  
**Problema**:
```env
DATABASE_URL=postgresql://neondb_owner:npg_Inb9YWHGiq0K@ep-super-recipe-a8kx6g4c-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require
POSTGRES_URL=postgresql://neondb_owner:npg_Inb9YWHGiq0K@...
```

**Riesgo**:
- Contraseña de base de datos visible en histórico de git
- Cualquier persona con acceso al repositorio puede conectar a la BD
- Si el repo es público, la BD está completamente comprometida

**Solución**:
```bash
# 1. REGENERAR CONTRASEÑA EN NEON INMEDIATAMENTE
# 2. Remover .env.local del histórico de git:
git filter-branch --tree-filter 'rm -f .env.local' HEAD

# 3. Agregar a .gitignore si no está
echo ".env.local" >> .gitignore

# 4. Usar variables de entorno de Vercel para production
# NO versionar credenciales NUNCA
```

---

### 2. **DATOS SENSIBLES (CURP, RFC) SIN ENCRIPTACIÓN** 🚨
**Severidad**: CRÍTICA  
**Archivos**: 
- `app/api/registro/route.ts`
- `lib/db.ts`

**Problema**:
```typescript
// CURP y RFC se guardan en texto plano en PostgreSQL
curp: z.string().length(18, 'CURP debe tener exactamente 18 caracteres'),
rfc: z.string().max(13, 'RFC debe tener máximo 13 caracteres'),
no_cvu: z.string().min(1, 'CVU es requerido'),
```

**Riesgo**:
- CURP y RFC son identificadores únicos mexicanos, equivalentes a SSN en EE.UU.
- Con CURP + RFC se puede cometer fraude de identidad
- Violación de privacidad: si la BD se compromete, miles de identidades expuestas
- Posible violación de LGPD (Ley General de Protección de Datos Personales - México)

**Solución**:
```typescript
// Encriptar campos sensibles
import crypto from 'crypto';

const encriptarCURP = (curp: string) => {
  const cifrador = crypto.createCipher('aes-256-cbc', process.env.ENCRYPTION_KEY!);
  let cifrado = cifrador.update(curp, 'utf8', 'hex');
  cifrado += cifrador.final('hex');
  return cifrado;
};

// En la BD usar: CURP_ENCRIPTADO (encrypted text)
// SOLO mostrar últimos 4 dígitos en UI
```

---

### 3. **FALTA DE AUTORIZACIÓN EN ENDPOINTS** 🚨
**Severidad**: CRÍTICA  
**Archivos**: 
- `app/api/registro/route.ts` - ✅ SIN validar quién crea registro
- `app/api/upload-cv-vercel/route.ts` - ✅ SIN validar quién sube archivos
- `app/api/ocr/route.ts` - ✅ SIN validar quién procesa OCR

**Problema**:
```typescript
// app/api/registro/route.ts
export async function POST(request: NextRequest) {
  // NO valida si el usuario está autenticado
  // NO valida si pertenece a los datos que envía
  const rawData = await request.json()  // <-- Cualquiera puede enviar datos
  // Guarda directamente sin verificar identity
}
```

**Riesgo**:
- Usuario A puede registrar datos con el clerk_user_id de Usuario B
- Crear perfiles falsos masivamente (spam)
- Acceso no autenticado a endpoints críticos

**Solución**:
```typescript
import { auth } from "@clerk/nextjs/server";

export async function POST(request: NextRequest) {
  const { userId } = await auth();  // ← Validar autenticación
  
  if (!userId) {
    return NextResponse.json(
      { error: "No autenticado" },
      { status: 401 }
    );
  }
  
  // Validar que clerk_user_id coincida con usuario autenticado
  const rawData = await request.json();
  
  if (rawData.clerk_user_id !== userId) {
    return NextResponse.json(
      { error: "No autorizado para crear registro de otro usuario" },
      { status: 403 }
    );
  }
  
  // Continuar...
}
```

---

## 🟠 HALLAZGOS ALTOS

### 4. **FALTA RATE LIMITING EN ENDPOINTS**
**Severidad**: ALTA  
**Archivo**: `app/api/registro/route.ts`, `app/api/upload-cv-vercel/route.ts`

**Problema**:
- No hay límite de requests por IP/usuario
- Se puede hacer fuerza bruta de OCR (procesar miles de PDFs)
- Posible DDoS mediante uploads masivos

**Solución**:
```typescript
import Ratelimit from '@upstash/ratelimit';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 h'), // 10 requests por hora
});

export async function POST(request: NextRequest) {
  const ip = request.ip || 'unknown';
  const { success } = await ratelimit.limit(ip);
  
  if (!success) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes" },
      { status: 429 }
    );
  }
  // ...
}
```

---

### 5. **VALIDACIÓN INSUFICIENTE EN UPLOAD DE ARCHIVOS**
**Severidad**: ALTA  
**Archivo**: `app/api/upload-cv-vercel/route.ts`

**Problema**:
```typescript
// No hay validación de:
// - Tipo de archivo (podría ser .exe, .sh)
// - Tamaño máximo (podría explotar memoria)
// - Contenido del archivo (podría tener malware)
// - Escaneo antivirus
```

**Riesgo**:
- Upload de malware
- Almacenamiento de archivos masivos (DoS)
- Ejecución de código malicioso

**Solución**:
```typescript
const ALLOWED_TYPES = ['application/pdf'];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

if (!ALLOWED_TYPES.includes(file.type)) {
  return NextResponse.json(
    { error: "Solo se permiten archivos PDF" },
    { status: 400 }
  );
}

if (file.size > MAX_FILE_SIZE) {
  return NextResponse.json(
    { error: "Archivo muy grande (máximo 50MB)" },
    { status: 400 }
  );
}

// Escanear con VirusTotal o similar
const virusScan = await scanFile(file);
if (virusScan.infected) {
  return NextResponse.json(
    { error: "Archivo contiene malware" },
    { status: 400 }
  );
}
```

---

### 6. **LOGS EXPONEN DATOS SENSIBLES**
**Severidad**: ALTA  
**Archivos**: Todos los `route.ts`

**Problema**:
```typescript
// ❌ MAL - Logging de datos sensibles
console.log("📥 [REGISTRO API] Datos recibidos:", {
  curp: rawData.curp,  // ← CURP en logs
  rfc: rawData.rfc,    // ← RFC en logs
  correo: rawData.correo,
  clerk_user_id: rawData.clerk_user_id
})
```

**Riesgo**:
- CURP y RFC en logs de Vercel (accesibles a desarrolladores)
- Si logs se archivan o exportan, datos sensibles quedan expuestos
- Cumplimiento LGPD violado

**Solución**:
```typescript
// ✅ BIEN - Enmascarar datos sensibles
console.log("📥 [REGISTRO API] Datos recibidos:", {
  curp: rawData.curp ? rawData.curp.substring(0, 4) + '****' : 'vacío',
  rfc: rawData.rfc ? rawData.rfc.substring(0, 2) + '****' : 'vacío',
  correo: rawData.correo ? rawData.correo.split('@')[0] + '@****' : 'vacío',
  clerk_user_id: rawData.clerk_user_id ? '****' + rawData.clerk_user_id.slice(-4) : 'vacío'
})
```

---

### 7. **FALTA VALIDACIÓN DE INTEGRIDAD EN API RESPONSES**
**Severidad**: ALTA  
**Archivo**: `app/registro/page.tsx`

**Problema**:
```typescript
// El frontend confía ciegamente en respuestas del API
const responseData = await response.json();
if (!responseData.success) {
  // Usa el mensaje sin validar si proviene del servidor
  throw new Error(responseData.message || responseData.error)
}
```

**Riesgo**:
- XSS si el error contiene HTML/JS
- Inyección de mensajes falsos

**Solución**:
```typescript
// Validar respuesta con Zod en frontend también
const apiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  error: z.string().optional(),
  id: z.string().optional()
});

const responseData = apiResponseSchema.parse(await response.json());
```

---

### 8. **CORS NO CONFIGURADO**
**Severidad**: ALTA  
**Archivos**: Todos los endpoints

**Problema**:
- No hay headers CORS configurados
- Por defecto Next.js permite same-origin
- Pero si dominio cambia, podría causar problemas

**Solución**:
```typescript
const headers = {
  'Access-Control-Allow-Origin': 'https://sei-chih.com.mx',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

export async function OPTIONS() {
  return new NextResponse(null, { headers });
}
```

---

## 🟡 HALLAZGOS MEDIOS

### 9. **FALTA HTTPS ENFORCEMENT**
**Severidad**: MEDIA  
**Recomendación**: Verificar `next.config.mjs`

```typescript
module.exports = {
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          }
        ]
      }
    ]
  }
}
```

---

### 10. **FALTA CONTENT SECURITY POLICY**
**Severidad**: MEDIA  
**Protección contra**: XSS, inyección de scripts

```typescript
// En middleware.ts o next.config.mjs
headers: {
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' cdn.clerk.com"
}
```

---

### 11. **FALTA VALIDACIÓN DE PERMISOS EN `/admin`**
**Severidad**: MEDIA  
**Archivo**: `app/admin/layout.tsx`

```typescript
// Verificar que el usuario sea admin
const { userId } = await auth();
const user = await clerkClient().users.getUser(userId);

if (!user.publicMetadata?.es_admin && !user.publicMetadata?.es_evaluador) {
  return redirect('/acceso-denegado');
}
```

---

### 12. **FALTA SANITIZACIÓN DE INPUT**
**Severidad**: MEDIA  
**Archivos**: Formularios con campos de texto libre

```typescript
import DOMPurify from 'isomorphic-dompurify';

const linea_investigacion = DOMPurify.sanitize(formData.linea_investigacion);
const area_investigacion = DOMPurify.sanitize(formData.area_investigacion);
```

---

### 13. **FALTA VERSIONADO DE API**
**Severidad**: MEDIA  
**Recomendación**: Usar `/api/v1/registro` en lugar de `/api/registro`

Permite cambios sin romper integraciones existentes

---

### 14. **FALTA MONITOREO Y AUDITORÍA**
**Severidad**: MEDIA  
**Recomendación**: Implementar logging de auditoría

```typescript
// Registrar todas las acciones sensibles
await logAuditEvent({
  action: 'REGISTRO_CREADO',
  userId,
  timestamp: new Date(),
  ip: request.ip,
  userAgent: request.headers.get('user-agent')
});
```

---

### 15. **FALTA ENCRIPTACIÓN EN TRÁNSITO (parcial)**
**Severidad**: MEDIA  
**Recomendación**: 
- ✅ HTTPS está en Vercel
- ❌ Verificar que todas las URLs sean HTTPS
- ❌ Considerar encriptación end-to-end para datos sensibles

---

### 16. **FALTA POLÍTICA DE ROTACIÓN DE KEYS**
**Severidad**: MEDIA  
**Recomendación**: 
- Rotar DATABASE_URL cada 90 días
- Rotar Clerk API keys cada 6 meses
- Implementar secret rotation automática en Vercel

---

## ✅ PRÁCTICAS BIEN IMPLEMENTADAS

1. **Validación con Zod** - Excelente validación de entrada
2. **Uso de Clerk** - Auth robusta y bien configurada
3. **Typescript** - Type safety en todo el código
4. **NEXT_PUBLIC_ prefix** - Separación correcta de variables públicas
5. **Prisma ORM** - Prevención de SQL injection
6. **Rate limiting en frontend** - Intento (aunque falta en backend)
7. **SSL/TLS en Neon** - Base de datos encriptada en tránsito

---

## 🎯 PLAN DE ACCIÓN

### INMEDIATO (Hoy)
- [ ] Regenerar DATABASE_URL en Neon
- [ ] Remover .env.local del histórico de git
- [ ] Agregar `auth()` a endpoints críticos

### ESTA SEMANA
- [ ] Implementar rate limiting en APIs
- [ ] Agregar validación de archivos en upload
- [ ] Enmascarar datos sensibles en logs

### ESTE MES
- [ ] Encriptar CURP, RFC, CVU en BD
- [ ] Implementar Content Security Policy
- [ ] Agregar auditoría de eventos

### ESTE TRIMESTRE
- [ ] Penetration testing
- [ ] Security code review externo
- [ ] Certificación OWASP compliance

---

## 📞 CONTACTO

Para reportar brechas de seguridad: **security@sei-chih.com.mx**  
No publiques brechas en issues públicos

---

**Generado**: 18 de marzo, 2026  
**Auditor**: Asistente de Seguridad  
**Próxima auditoría**: 18 de junio, 2026
