# 🔬 SEI - Sistema Estatal de Investigadores

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-316192?style=for-the-badge&logo=postgresql)
![Clerk](https://img.shields.io/badge/Clerk-Auth-6C47FF?style=for-the-badge)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.x-38B2AC?style=for-the-badge&logo=tailwind-css)

Plataforma integral para la gestión de investigadores, publicaciones científicas y proyectos de investigación

[Características](#-características-principales) • [Instalación](#-instalación) • [Uso](#-uso) • [API](#-api) • [FAQ](#-preguntas-frecuentes-faq) • [Despliegue](#-despliegue)

</div>

---

## 📋 Descripción

El **Sistema Estatal de Investigadores (SEI)** es una plataforma web moderna diseñada para facilitar la gestión integral de perfiles académicos, publicaciones científicas y proyectos de investigación.

Proporciona herramientas avanzadas para investigadores, instituciones y administradores del sistema.

### 🎓 Casos de Uso

* Universidades e instituciones académicas
* Centros de investigación
* Sistemas estatales de ciencia y tecnología
* Conacyt y organismos similares
* Plataformas de colaboración científica

---

## ✨ Características Principales

### 👥 Gestión de Investigadores

- Perfiles completos con información académica, profesional y de contacto
- Validación automática de datos
- Sistema de niveles (SNI similar)
- Detección de perfiles incompletos
- Perfiles públicos accesibles sin autenticación

### 📚 Publicaciones Científicas

- Gestión completa de publicaciones
- Generación automática de DOI
- Subida de archivos PDF y ZIP
- Búsqueda por título, autores, DOI, palabras clave
- Categorización y etiquetado

### 🔬 Proyectos de Investigación

- Seguimiento de proyectos desde inicio hasta finalización
- Colaboración entre investigadores e instituciones
- Estados y clasificación de proyectos
- Gestión de documentación relacionada

### 🔍 Búsqueda Avanzada

- Búsqueda global en investigadores, proyectos y publicaciones
- Filtros por tipo, área, institución, fecha
- Autocompletado en tiempo real
- Resultados organizados y paginados

### 📄 OCR Automatizado

- Extracción automática de datos desde PDFs
- Microservicio dedicado en Railway
- Integración transparente con el sistema principal
- Validación de datos extraídos

### 🔐 Autenticación Segura

- Integración con Clerk para autenticación
- Verificación de email con código de 6 dígitos
- Sesiones de 12 horas con renovación automática
- Rutas públicas y protegidas
- Gestión de permisos y roles

### 📊 Panel Administrativo

- Dashboard con estadísticas del sistema
- Gestión de usuarios y permisos
- Configuración del sistema
- Monitoreo de actividad

---

## 🛠️ Stack Tecnológico

### Frontend

- **Next.js 15.5.4** - Framework React con App Router
- **TypeScript** - Tipado estático
- **TailwindCSS** - Estilos utility-first
- **shadcn/ui** - Componentes UI modernos
- **Lucide React** - Iconos

### Backend & API

- **Next.js API Routes** - Endpoints RESTful
- **Clerk** - Autenticación y gestión de usuarios
- **Node.js** - Microservicio OCR

### Base de Datos

- **PostgreSQL** - Base de datos principal (Neon)
- **Prisma** - ORM para TypeScript

### Deployment

- **Vercel** - Aplicación principal
- **Railway** - Microservicio OCR
- **Neon** - Base de datos PostgreSQL

---

## 🚀 Instalación

### Prerrequisitos

- **Node.js** 18.x o superior
- **pnpm** 8.x o superior (o npm/yarn)
- **PostgreSQL** (o cuenta en Neon)
- **Cuenta Clerk** para autenticación

### Pasos

1. **Clonar el repositorio**

```bash
git clone https://github.com/I2Cprogramacion/SEI.git
cd SEI
```

2. **Instalar dependencias**

```bash
pnpm install
```

3. **Configurar variables de entorno**

```bash
# Copiar el archivo de ejemplo
cp env.local.example .env.local

# Editar .env.local con tus credenciales
```

4. **Configurar la base de datos**

```bash
# Generar cliente de Prisma
pnpm prisma generate

# Ejecutar migraciones
pnpm prisma migrate dev

# (Opcional) Poblar con datos de ejemplo
pnpm prisma db seed
```

5. **Iniciar servidor de desarrollo**

```bash
pnpm dev
```

La aplicación estará disponible en `http://localhost:3000`

---

## ⚙️ Configuración

### Variables de Entorno

Crea un archivo `.env.local` con las siguientes variables:

```env
# ========================================
# CLERK AUTHENTICATION
# ========================================
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx

# URLs de redirección
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/iniciar-sesion
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/registro
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# ========================================
# DATABASE - POSTGRESQL
# ========================================
DATABASE_URL=postgresql://usuario:password@host.neon.tech/dbname?sslmode=require
DATABASE_TYPE=postgresql

# ========================================
# OCR SERVICE (Opcional)
# ========================================
PDF_PROCESSOR_URL=http://localhost:8001
# PDF_PROCESSOR_URL=https://tu-servidor-ocr.railway.app

# ========================================
# CLOUDINARY (Almacenamiento)
# ========================================
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

### Configuración de Clerk

1. Ve a [Clerk Dashboard](https://dashboard.clerk.com/)
2. Crea una nueva aplicación
3. En **Configure → Sessions**:
   * Session token lifetime: `43200` segundos (12 horas)
   * Automatically renew: ✓ Habilitado
4. Copia las claves a tu `.env.local`

Ver [CONFIGURAR_CLERK_LOCAL.md](./CONFIGURAR_CLERK_LOCAL.md) para configuración completa.

### Base de Datos

#### Neon PostgreSQL (Recomendado)

1. Crea una cuenta en [Neon](https://neon.tech/)
2. Crea un nuevo proyecto
3. Copia la cadena de conexión
4. Pégala en `DATABASE_URL` en `.env.local`

---

## 📁 Estructura del Proyecto

```
SEI/
├── app/                      # Next.js App Router
│   ├── admin/                # Panel administrativo
│   ├── api/                  # API Routes
│   ├── buscar/               # Búsqueda
│   ├── registro/             # Registro de usuarios
│   └── layout.tsx            # Layout principal
├── components/               # Componentes React
│   ├── ui/                   # shadcn/ui components
│   ├── navbar.tsx
│   └── footer.tsx
├── lib/                      # Utilidades y configuración
│   ├── auth/                 # Utilidades de autenticación
│   ├── databases/            # Configuración de base de datos
│   ├── db.ts                 # Cliente de base de datos
│   └── utils.ts              # Funciones auxiliares
├── hooks/                    # Custom React hooks
├── prisma/                   # Prisma ORM
│   ├── schema.prisma         # Esquema de base de datos
│   └── migrations/           # Migraciones
├── docs/                     # Documentación técnica
├── scripts/                  # Scripts de utilidad
├── public/                   # Archivos estáticos
├── middleware.ts             # Clerk middleware
└── package.json              # Dependencias
```

---

## 📖 Uso

### Registro de Usuario

1. Ve a `/registro`
2. Llena el formulario completo
3. (Opcional) Sube un PDF con tu CV para **extracción automática**
4. Haz clic en "Registrarse"
5. Revisa tu email y copia el código de verificación
6. Ingresa el código en `/verificar-email`
7. Serás redirigido al dashboard

### Panel Administrativo

Accede a `/admin` para ver:

* Estadísticas del sistema
* Gestión de investigadores
* Gestión de proyectos y publicaciones

### Búsqueda

Usa la barra de búsqueda global en la navbar para encontrar investigadores, proyectos y publicaciones.

---

## 📝 Scripts Disponibles

```bash
pnpm dev                # Servidor de desarrollo
pnpm build              # Build de producción
pnpm start              # Servidor de producción
pnpm lint               # Ejecutar linter
pnpm test               # Tests
pnpm prisma:generate    # Generar cliente Prisma
pnpm prisma:migrate     # Ejecutar migraciones
pnpm prisma:studio      # Abrir Prisma Studio
```

---

## 🔌 API

La plataforma expone una API REST completa. Principales endpoints:

### Investigadores

```
GET    /api/investigadores          # Listar investigadores
GET    /api/investigadores/[id]     # Obtener investigador
POST   /api/investigadores          # Crear investigador
PUT    /api/investigadores/[id]     # Actualizar investigador
GET    /api/investigadores/search   # Búsqueda avanzada
```

### Proyectos

```
GET    /api/proyectos               # Listar proyectos
GET    /api/proyectos/[id]          # Obtener proyecto
POST   /api/proyectos               # Crear proyecto
PUT    /api/proyectos/[id]          # Actualizar proyecto
```

### Publicaciones

```
GET    /api/publicaciones           # Listar publicaciones
GET    /api/publicaciones/[id]      # Obtener publicación
POST   /api/publicaciones           # Crear publicación
PUT    /api/publicaciones/[id]      # Actualizar publicación
```

### Autenticación

```
POST   /api/registro                # Registro de usuario
```

---

## 📚 Documentación Adicional

Documentación adicional disponible en el repositorio:

* [CONFIGURAR_CLERK_LOCAL.md](./CONFIGURAR_CLERK_LOCAL.md) - Configuración de Clerk
* [CONFIGURAR_VERCEL.md](./CONFIGURAR_VERCEL.md) - Configuración de Vercel
* [VERCEL_SETUP.md](./VERCEL_SETUP.md) - Guía de despliegue en Vercel
* [README-TESTING.md](./README-TESTING.md) - Guía de pruebas E2E
* [docs/auditoria-sistema.md](./docs/auditoria-sistema.md) - Auditoría del sistema
* [docs/testing-e2e-report.md](./docs/testing-e2e-report.md) - Reporte de pruebas

---

## 🐛 Solución de Problemas

### Error: "Cannot find module '@prisma/client'"

```bash
pnpm prisma generate
```

### Error: "Clerk is not configured"

Verifica las variables `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` y `CLERK_SECRET_KEY` en `.env.local`

### Error de base de datos

```bash
pnpm prisma migrate reset
pnpm prisma migrate dev
```

---

## ❓ Preguntas Frecuentes (FAQ)

### ¿Qué es el Sistema Estatal de Investigadores?

Es una plataforma web integral diseñada para gestionar perfiles académicos, publicaciones científicas y proyectos de investigación de manera centralizada y eficiente.

### ¿Necesito conocimientos técnicos para usar la plataforma?

No. La plataforma está diseñada para ser intuitiva y fácil de usar. Los investigadores pueden registrarse, crear perfiles y gestionar sus publicaciones sin necesidad de conocimientos técnicos avanzados.

### ¿Cómo puedo registrarme?

Visita la página de registro, completa el formulario con tus datos académicos y profesionales, verifica tu email con el código de 6 dígitos que recibirás, y listo. Opcionalmente, puedes subir tu CV en PDF para extracción automática de datos.

### ¿La plataforma es gratuita?

Sí, el SEI es una plataforma de acceso gratuito para investigadores e instituciones académicas.

### ¿Mis datos están seguros?

Absolutamente. Utilizamos Clerk para autenticación segura, encriptación de datos sensibles, y seguimos las mejores prácticas de seguridad. Los datos personales como CURP y RFC no son accesibles públicamente.

### ¿Puedo ver perfiles de otros investigadores sin registrarme?

Sí, los perfiles públicos de investigadores son accesibles sin necesidad de crear una cuenta. Sin embargo, para acceder a funcionalidades completas necesitas registrarte.

### ¿Qué es el OCR automatizado?

Es una funcionalidad que extrae automáticamente información de tu CV en PDF (nombre, institución, grados académicos, etc.) para facilitar el proceso de registro y ahorrarte tiempo.

### ¿Puedo subir mis publicaciones?

Sí, puedes gestionar tus publicaciones científicas, agregar archivos PDF, asignar DOI, y hacerlas visibles en tu perfil público.

### ¿Cómo funciona el sistema de niveles SNI?

El sistema clasifica a los investigadores en niveles similares al Sistema Nacional de Investigadores, permitiendo identificar trayectorias y reconocimiento académico.

### ¿La plataforma está disponible 24/7?

Sí, está desplegada en Vercel con alta disponibilidad. En caso de mantenimiento programado, se notificará con anticipación.

### ¿Puedo exportar mis datos?

Sí, puedes exportar tu información y publicaciones en diferentes formatos desde tu panel de usuario.

### ¿Quién puede ser administrador?

Los administradores son designados por el equipo técnico. No es posible auto-asignarse permisos de administrador por razones de seguridad.

---

## 🚢 Despliegue

### Vercel (Aplicación Principal)

1. Conecta tu repositorio de GitHub a Vercel
2. Configura las variables de entorno
3. Despliega automáticamente

### Railway (Microservicio OCR)

1. Crea un nuevo proyecto en Railway
2. Conecta el directorio `ocr-server/`
3. Configura las variables de entorno
4. Actualiza `PDF_PROCESSOR_URL` en Vercel

### Base de Datos

Usa **Neon PostgreSQL** para una configuración sin servidor y escalable.

---

## 👥 Equipo

Desarrollado por **[I2Cprogramacion](https://github.com/I2Cprogramacion)**

---

## 📄 Licencia

Este proyecto está bajo **licencia privada**. Todos los derechos reservados.

---

## 🙏 Agradecimientos

* [Next.js](https://nextjs.org/) - Framework React
* [Clerk](https://clerk.com/) - Autenticación
* [shadcn/ui](https://ui.shadcn.com/) - Componentes UI
* [Neon](https://neon.tech/) - Base de datos PostgreSQL
* [Vercel](https://vercel.com/) - Hosting y deployment

---

<div align="center">

**⭐ Si este proyecto te fue útil, considera darle una estrella en GitHub ⭐**

[⬆ Volver arriba](#-sei---sistema-estatal-de-investigadores)

</div>

 

 
