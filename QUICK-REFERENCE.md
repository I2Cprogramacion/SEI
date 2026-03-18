# 🚀 QUICK START GUIDE - SEI

**Acceso rápido a lo más importante**

---

## ⚡ En 30 Segundos

### ¿Qué es SEI?
Sistema Estatal de Investigadores - plataforma para conectar investigadores, publicaciones, proyectos e instituciones.

### ¿Dónde está?
- **Producción**: https://www.sei-chih.com.mx
- **Código**: https://github.com/I2Cprogramacion/SEI

### ¿Qué funciona?
✅ Autenticación | ✅ Búsqueda | ✅ Perfiles | ✅ Publicaciones | ✅ Admin

### ¿Qué falla?
⚠️ Base de datos (Neon) no conecta desde Vercel

---

## 🎯 Acceso por Rol

### 👨‍💻 SOY DESARROLLADOR
1. Clon: `git clone https://github.com/I2Cprogramacion/SEI.git`
2. Setup: `pnpm install && pnpm dev`
3. Docs: Lee [CATALOGO-FUNCIONES.md](CATALOGO-FUNCIONES.md)
4. Seguridad: Revisa [AUDITORIA-SEGURIDAD.md](AUDITORIA-SEGURIDAD.md)
5. Urgente: Arregla BD - ver sección "Fix BD"

### 👨‍💼 SOY ADMIN
1. Accede: https://www.sei-chih.com.mx/admin
2. Urgente: Regenera DATABASE_URL (ver "Fix BD")
3. Info: [CATALOGO-FUNCIONES.md](CATALOGO-FUNCIONES.md) - capítulo "Administración"
4. Usuarios: [SQL-DIAGNOSTICO-PERFILES.sql](docs/SQL-DIAGNOSTICO-PERFILES.sql)

### 🔒 SOY DE SEGURIDAD
1. Lee: [AUDITORIA-SEGURIDAD.md](AUDITORIA-SEGURIDAD.md) - 16 hallazgos
2. Visto: [SEGURIDAD-ACCIONES-COMPLETADAS.md](SEGURIDAD-ACCIONES-COMPLETADAS.md) - 3 arreglos
3. Pending: [ESTADO-PROYECTO-FINAL.md](ESTADO-PROYECTO-FINAL.md) - próximas semanas

### 👤 SOY USUARIO
1. Accede: https://www.sei-chih.com.mx/registro
2. Error?: [ENTENDER-ERRORES-REGISTRO.md](ENTENDER-ERRORES-REGISTRO.md)
3. Ayuda: Formulario de contacto en sitio

---

## 🆘 Problemas Comunes

### No me deja registrar
**Problema**: "Datos de registro inválidos"
**Solución**: [ENTENDER-ERRORES-REGISTRO.md](ENTENDER-ERRORES-REGISTRO.md)
- ¿Llenar CURP? (18 caracteres)
- ¿Llenar RFC? (13 caracteres)
- ¿Subir CV? (PDF, max 50MB)

### Veo error en la BD
**Problema**: "Can't reach database server"
**Solución**: [DIAGNOSTICO-BD-DEPLOYMENT.md](DIAGNOSTICO-BD-DEPLOYMENT.md)
- Espera a que dev regenere PASSWORD
- Verifica DATABASE_URL en Vercel

### El OCR no me lee CURP/RFC
**Problema**: "Campos no detectados"
**Solución**: Llenarlos manualmente
- OCR detecta: nombre, email, teléfono ✅
- OCR NO detecta: CURP, RFC, CVU ⚠️
- Llenarlos es obligatorio

### No sé qué funciones tiene
**Solución**: [CATALOGO-FUNCIONES.md](CATALOGO-FUNCIONES.md)
- 100+ funciones documentadas
- Todas las APIs listadas

---

## 🔧 Fix BD (Urgente para Devs)

### Paso 1: En Neon Console
```
1. Ir a: https://console.neon.tech
2. Proyecto: "SEI"
3. Database: "neon"
4. "Reset Password" en user "neondb_owner"
5. Copiar nuevo password
```

### Paso 2: En Vercel
```
1. Proyecto: SEI
2. Settings → Environment Variables
3. DATABASE_URL → Edit
4. Cambiar password en URL
5. Formato: postgresql://user:PASSWORD@host/db
6. Save y wait redeploy
```

### Paso 3: Verificar
```
1. Ir a: https://www.sei-chih.com.mx/api/health
2. Debe responder: {"status": "ok"}
3. Si aún falla: Check logs en Vercel
```

---

## 📚 Documentación

| Doc | Para | Tiempo |
|-----|------|--------|
| [INDICE-DOCUMENTACION.md](INDICE-DOCUMENTACION.md) | Navegar por todo | 5 min |
| [RESUMEN-FUNCIONES.md](RESUMEN-FUNCIONES.md) | Overview rápido | 5 min |
| [CATALOGO-FUNCIONES.md](CATALOGO-FUNCIONES.md) | Todas las funciones | 30 min |
| [AUDITORIA-SEGURIDAD.md](AUDITORIA-SEGURIDAD.md) | Hallazgos + soluciones | 20 min |
| [ESTADO-PROYECTO-FINAL.md](ESTADO-PROYECTO-FINAL.md) | Estado completo | 15 min |
| [README.md](README.md) | Instalación | 10 min |
| [DEPLOY.md](DEPLOY.md) | Cómo desplegar | 10 min |

---

## 💡 Comandos Útiles

### Desarrollo Local
```bash
# Instalar
pnpm install

# Correr
pnpm dev

# Tests
pnpm test
pnpm test:e2e

# Build
pnpm build
```

### Git
```bash
# Ver cambios
git status

# Commit
git add .
git commit -m "feat: descripción"

# Push a producción
git push origin main
```

### SQL Diagnostico
```sql
-- Ver todos los investigadores
SELECT id, nombre_completo, correo, created_at FROM investigadores LIMIT 10;

-- Ver último registro
SELECT * FROM investigadores ORDER BY created_at DESC LIMIT 1;

-- Ver errores de validación
SELECT * FROM auditoria WHERE error_type = 'validation' ORDER BY created_at DESC;
```

---

## 📊 Estado en un Vistazo

```
✅ Autenticación    ✅ Búsqueda
✅ Perfiles         ✅ Publicaciones
✅ Proyectos        ✅ Conexiones
✅ Instituciones    ✅ Convocatorias
✅ Admin            ✅ Dashboard
✅ APIs             ✅ Seguridad (mejorada)

⚠️  BD (Neon)       ⏳ Rate Limiting
⏳ Encripción CURP   ⏳ CSP Headers
⏳ Malware Scan      ⏳ Versioning API
```

---

## 🎓 Arquitectura en 60 Segundos

```
Frontend (Next.js 15 + React)
    ↓
API Routes (50+ endpoints)
    ↓
Prisma ORM + Zod Validation
    ↓
PostgreSQL (Neon)
    ↓
Storage: Vercel Blob + Cloudinary
    ↓
Services: Railway OCR, SendGrid Email
```

---

## 🔐 Seguridad: Lo Que Sé

### Hallazgos (16 Total)
- 3 Críticos ✅ Parcialmente arreglados
- 5 Altos ⏳ Pendientes
- 8 Medios ⏳ Pendientes

### Lo Que Se Arregló
1. ✅ Autenticación en endpoints
2. ✅ Datos enmascarados en logs
3. ✅ Validación de usuario

### Lo Que Falta
- ⏳ Rate limiting
- ⏳ Encripción CURP/RFC
- ⏳ CSP headers
- ⏳ File scanning

---

## 📞 ¿Preguntas?

| Tema | Archivo |
|------|---------|
| Cómo funciona X | [CATALOGO-FUNCIONES.md](CATALOGO-FUNCIONES.md) |
| Error de validación | [ENTENDER-ERRORES-REGISTRO.md](ENTENDER-ERRORES-REGISTRO.md) |
| Problemas de BD | [DIAGNOSTICO-BD-DEPLOYMENT.md](DIAGNOSTICO-BD-DEPLOYMENT.md) |
| Seguridad | [AUDITORIA-SEGURIDAD.md](AUDITORIA-SEGURIDAD.md) |
| Instalación | [README.md](README.md) |
| Deployment | [DEPLOY.md](DEPLOY.md) |
| Todo lo demás | [INDICE-DOCUMENTACION.md](INDICE-DOCUMENTACION.md) |

---

**Estado**: 🟢 PRODUCCIÓN (Excepto BD)  
**Última actualización**: 18 de marzo, 2026  
**Documento**: Quick reference - actualizar cada semana
