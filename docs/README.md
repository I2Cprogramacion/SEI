# 📚 Índice de Documentación - SEI

Esta carpeta contiene toda la documentación técnica del proyecto SEI.

---

## 📖 Documentación Disponible

### 🔐 Autenticación y Sesiones

#### [CLERK_CONFIG_SETUP.md](./CLERK_CONFIG_SETUP.md)
Guía completa para configurar Clerk Authentication:
- Configuración de duración de sesión (12 horas)
- Configuración de verificación de email
- Setup de roles y permisos
- Variables de entorno requeridas

#### [IMPLEMENTACION_COMPLETA.md](./IMPLEMENTACION_COMPLETA.md)
Documentación técnica completa de la implementación:
- Flujo de registro y verificación
- Manejo de sesiones
- Código relevante y explicaciones
- Tests recomendados

#### [SESIONES_Y_PERMISOS_RESUMEN.md](./SESIONES_Y_PERMISOS_RESUMEN.md)
Resumen ejecutivo de sesiones y permisos:
- Configuración actual
- Flujo de autenticación
- Próximos pasos para RBAC

---

### 🗄️ Base de Datos

#### [DATABASE_MIGRATION.md](./DATABASE_MIGRATION.md)
Guía de migraciones de base de datos:
- Setup inicial de Prisma
- Ejecutar migraciones
- Resolver conflictos
- Backup y restore

#### [VERCEL_POSTGRES_SETUP.md](./VERCEL_POSTGRES_SETUP.md)
Configuración de Vercel Postgres:
- Crear base de datos en Vercel
- Configurar variables de entorno
- Integración con Prisma
- Tips de producción

---

### 📄 Procesamiento de Documentos

#### [OCR_SETUP.md](./OCR_SETUP.md)
Configuración del servicio OCR:
- Setup del microservicio Node.js
- Despliegue en Railway
- Integración con la app principal
- Troubleshooting

#### [PDF_PROCESSING_README.md](./PDF_PROCESSING_README.md)
Procesamiento de archivos PDF:
- Extracción de datos
- Validación de información
- APIs disponibles
- Ejemplos de uso

---

### 🚀 Despliegue

#### [DEPLOYMENT_README.md](./DEPLOYMENT_README.md)
Guía de despliegue en producción:
- Despliegue en Vercel
- Configuración de variables de entorno
- Setup de base de datos
- CI/CD con GitHub Actions

---

### 👥 Funcionalidades

#### [GUIA-PERFILES-PUBLICOS.md](./GUIA-PERFILES-PUBLICOS.md)
Guía de perfiles públicos de investigadores:
- Rutas públicas
- Información visible
- SEO y metadata
- Personalización

---

## 🗂️ Estructura de Documentos

```
docs/
├── README.md                          # Este archivo (índice)
├── CLERK_CONFIG_SETUP.md              # Auth: Configuración de Clerk
├── IMPLEMENTACION_COMPLETA.md         # Auth: Documentación técnica
├── SESIONES_Y_PERMISOS_RESUMEN.md     # Auth: Resumen de sesiones
├── DATABASE_MIGRATION.md              # DB: Guía de migraciones
├── VERCEL_POSTGRES_SETUP.md           # DB: Setup de Vercel Postgres
├── OCR_SETUP.md                       # OCR: Configuración del servicio
├── PDF_PROCESSING_README.md           # OCR: Procesamiento de PDFs
├── DEPLOYMENT_README.md               # Deploy: Guía de despliegue
└── GUIA-PERFILES-PUBLICOS.md          # Features: Perfiles públicos
```

---

## 🔍 Buscar en la Documentación

### Por Tema

| Tema | Documentos |
|------|-----------|
| **Autenticación** | CLERK_CONFIG_SETUP, IMPLEMENTACION_COMPLETA, SESIONES_Y_PERMISOS_RESUMEN |
| **Base de Datos** | DATABASE_MIGRATION, VERCEL_POSTGRES_SETUP |
| **OCR/PDFs** | OCR_SETUP, PDF_PROCESSING_README |
| **Despliegue** | DEPLOYMENT_README |
| **Funcionalidades** | GUIA-PERFILES-PUBLICOS |

### Por Rol

#### Para Desarrolladores
1. IMPLEMENTACION_COMPLETA.md - Entender la arquitectura
2. DATABASE_MIGRATION.md - Trabajar con la base de datos
3. CLERK_CONFIG_SETUP.md - Configurar autenticación

#### Para DevOps
1. DEPLOYMENT_README.md - Desplegar la aplicación
2. VERCEL_POSTGRES_SETUP.md - Configurar base de datos
3. OCR_SETUP.md - Configurar microservicio

#### Para Administradores
1. SESIONES_Y_PERMISOS_RESUMEN.md - Gestionar permisos
2. GUIA-PERFILES-PUBLICOS.md - Configurar perfiles públicos

---

## 📝 Notas

- **Última actualización**: Ver fecha en cada documento
- **Versión del proyecto**: Ver package.json
- **Contribuciones**: Mantener documentación actualizada al hacer cambios

---

## 🔗 Enlaces Útiles

- [README principal](../README.md)
- [Clerk Documentation](https://clerk.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Neon Documentation](https://neon.tech/docs)

---

## 💡 Tips

1. **Lee primero**: IMPLEMENTACION_COMPLETA.md para entender el proyecto
2. **Desarrollo local**: DATABASE_MIGRATION.md y CLERK_CONFIG_SETUP.md
3. **Producción**: DEPLOYMENT_README.md y VERCEL_POSTGRES_SETUP.md
4. **Troubleshooting**: Cada documento tiene una sección de problemas comunes

---

**¿No encuentras lo que buscas?**
Abre un issue en GitHub o contacta al equipo de desarrollo.
