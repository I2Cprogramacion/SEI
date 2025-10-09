# 🔬 SEI - Sistema Estatal de Investigadores# SEI - Sistema Estatal de Investigadores



<div align="center">Plataforma web integral para la gestión de perfiles académicos, registro de publicaciones y proyectos, colaboración entre investigadores y asignación de niveles. El SEI facilita la administración y seguimiento de la actividad científica en el estado, proporcionando herramientas modernas para investigadores, instituciones y administradores del sistema.

La plataforma SEI está organizada siguiendo las mejores prácticas de Next.js 14 con App Router:


![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black?style=for-the-badge&logo=next.js)##  Características Principales

![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)

![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-316192?style=for-the-badge&logo=postgresql)###  Gestión de Investigadores

![Clerk](https://img.shields.io/badge/Clerk-Auth-6C47FF?style=for-the-badge)- **Perfiles Completos**: Sistema robusto para el registro y gestión de perfiles académicos con información detallada sobre formación, experiencia, publicaciones y proyectos

![TailwindCSS](https://img.shields.io/badge/Tailwind-3.x-38B2AC?style=for-the-badge&logo=tailwind-css)- **Validación de Datos**: Verificación automática de información académica y profesional

- **Niveles de Investigador**: Asignación y seguimiento de niveles según criterios establecidos

**Plataforma integral para la gestión de investigadores, publicaciones científicas y proyectos de investigación**- **Perfiles Incompletos**: Gestión especializada para investigadores con información pendiente

### Descripción de directorios principales:


[Características](#-características-principales) · [Instalación](#-instalación) · [Documentación](#-documentación)###  Publicaciones Científicas

- **DOI Automático**: Generación y gestión automática de DOI para publicaciones

</div>- **Gestión de Archivos**: Subida y almacenamiento seguro de archivos PDF y ZIP

- **Búsqueda Avanzada**: Búsqueda por título, autores, DOI, palabras clave y categorías

---

###  Proyectos de Investigación

## 📋 Tabla de Contenidos- **Seguimiento Completo**: Gestión integral de proyectos desde su concepción hasta su finalización

- **Colaboración**: Sistema de colaboración entre investigadores e instituciones

- [Acerca del Proyecto](#-acerca-del-proyecto)- **Estados y Categorías**: Clasificación y seguimiento del estado de los proyectos

- [Características Principales](#-características-principales)- **Documentación**: Almacenamiento y gestión de documentación relacionada

- [Stack Tecnológico](#-stack-tecnológico)

- [Arquitectura](#-arquitectura)###  Búsqueda Avanzada

- [Instalación](#-instalación)- **Búsqueda Global**: Búsqueda unificada en investigadores, proyectos y publicaciones

- [Configuración](#-configuración)- **Filtros Inteligentes**: Filtrado por tipo de contenido, área, institución, fecha y más

- [Uso](#-uso)- **Resultados Organizados**: Presentación clara y organizada de resultados de búsqueda

- [Estructura del Proyecto](#-estructura-del-proyecto)- **Búsqueda en Tiempo Real**: Autocompletado y sugerencias mientras se escribe

- [Documentación](#-documentación)

- [Scripts Disponibles](#-scripts-disponibles)###  Panel Administrativo

- **Gestión Completa**: Herramientas administrativas para la gestión integral del sistema

---- **Estadísticas**: Dashboard con métricas y estadísticas del sistema

- **Usuarios**: Gestión de usuarios, roles y permisos

## 🎯 Acerca del Proyecto- **Configuración**: Configuración avanzada del sistema y sus módulos



El **Sistema Estatal de Investigadores (SEI)** es una plataforma web moderna diseñada para facilitar la gestión integral de la actividad científica y académica. Proporciona herramientas para investigadores, instituciones y administradores, permitiendo:###  OCR Automatizado

- **Extracción Inteligente**: Procesamiento automático de PDFs para extraer información relevante

- **Registro y gestión** de perfiles académicos completos- **Microservicio Dedicado**: Servicio especializado desplegado en Railway para procesamiento OCR

- **Publicación y seguimiento** de investigaciones científicas- **Integración Seamless**: Integración transparente con el sistema principal

- **Administración** de proyectos de investigación- **Validación de Datos**: Verificación y validación de datos extraídos

- **Búsqueda avanzada** con filtros inteligentes

- **Procesamiento OCR** automático de documentos PDF###  Autenticación Segura

- **Autenticación segura** con verificación de email- **Sistema de Login**: Autenticación robusta con JWT y verificación 2FA

- **Roles y Permisos**: Sistema granular de roles y permisos

### 🎓 Casos de Uso- **Seguridad**: Implementación de mejores prácticas de seguridad

- **Recuperación**: Sistema de recuperación de contraseñas y cuentas

- Universidades e instituciones académicas

- Centros de investigación##  Arquitectura

- Sistemas estatales de ciencia y tecnología

- Conacyt y organismos similaresLa plataforma SEI está construida con una arquitectura moderna y escalable que separa claramente las responsabilidades:

- Plataformas de colaboración científica

### Frontend y API

---- **Next.js 14**: Framework React con App Router para renderizado del lado del servidor y cliente

- **TypeScript**: Tipado estático para mayor robustez y mantenibilidad del código

## ✨ Características Principales- **Despliegue**: Vercel para hosting automático y escalado global

- **API Routes**: Endpoints RESTful integrados en la aplicación Next.js

### 👥 Gestión de Investigadores

- ✅ Perfiles completos con información académica y profesional### Microservicio OCR

- ✅ Validación automática de datos- **Node.js**: Servicio especializado para procesamiento de documentos

- ✅ Sistema de niveles (SNI, similar)- **Railway**: Plataforma de despliegue para el microservicio OCR

- ✅ Detección de perfiles incompletos- **Comunicación**: API REST para comunicación con el sistema principal

- ✅ Perfiles públicos accesibles sin autenticación- **Procesamiento**: Extracción automática de datos desde archivos PDF



### 📚 Publicaciones Científicas### Base de Datos

- ✅ Gestión completa de publicaciones- **PostgreSQL**: Base de datos relacional para producción

- ✅ Generación automática de DOI- **SQLite**: Base de datos local para desarrollo

- ✅ Subida de archivos PDF y ZIP- **Proveedores**: Neon, Railway, Vercel Postgres para hosting

- ✅ Búsqueda por título, autores, DOI, palabras clave- **Migraciones**: Sistema de migraciones para versionado de esquemas

- ✅ Categorización y etiquetado

###  Interfaz de Usuario

### 🔬 Proyectos de Investigación- **TailwindCSS**: Framework CSS utilitario para estilos consistentes

- ✅ Seguimiento de proyectos desde inicio hasta finalización- **shadcn/ui**: Biblioteca de componentes UI modernos y accesibles

- ✅ Colaboración entre investigadores e instituciones- **Responsive Design**: Diseño adaptativo para todos los dispositivos

- ✅ Estados y clasificación de proyectos- **Temas**: Soporte para tema claro y oscuro

- ✅ Gestión de documentación relacionada

##  Módulos Principales

### 🔍 Búsqueda Avanzada

- ✅ Búsqueda global en investigadores, proyectos y publicacionesLa plataforma SEI está organizada en módulos especializados que cubren todas las necesidades del sistema de investigación:

- ✅ Filtros por tipo, área, institución, fecha

- ✅ Autocompletado en tiempo real###  Módulo de Investigadores

- ✅ Resultados organizados y paginadosEl módulo de investigadores es el núcleo del sistema, proporcionando herramientas completas para la gestión de perfiles académicos:



### 📄 OCR Automatizado- **Listado y Perfiles**: Visualización de investigadores con información detallada sobre formación, experiencia y logros

- ✅ Extracción automática de datos desde PDFs- **Búsqueda Avanzada**: Búsqueda por área de especialización, institución, nivel académico y palabras clave

- ✅ Microservicio dedicado en Railway- **Gestión de Perfiles**: Herramientas para completar y actualizar información de investigadores

- ✅ Integración transparente con el sistema principal- **Perfiles Incompletos**: Sistema especializado para identificar y gestionar investigadores con información pendiente

- ✅ Validación de datos extraídos- **Registro de Nuevos**: Formularios intuitivos para el registro de nuevos investigadores al sistema

- **Validación de Datos**: Verificación automática de información académica y profesional

### 🔐 Autenticación Segura

- ✅ Integración con Clerk para autenticación###  Módulo de Publicaciones

- ✅ Verificación de email con código de 6 dígitosSistema integral para la gestión de publicaciones científicas con funcionalidades avanzadas:

- ✅ Sesiones de 12 horas con renovación automática

- ✅ Rutas públicas y protegidas- **Catálogo Completo**: Base de datos de publicaciones científicas con información detallada

- ✅ Gestión de permisos y roles- **DOI Automático**: Generación y gestión automática de DOI para nuevas publicaciones

- **Gestión de Archivos**: Subida segura de archivos PDF y ZIP con validación de formato

### 📊 Panel Administrativo- **Búsqueda Especializada**: Búsqueda por título, autores, DOI, palabras clave y categorías

- ✅ Dashboard con estadísticas del sistema- **Metadatos**: Almacenamiento de información completa sobre cada publicación

- ✅ Gestión de usuarios y permisos- **Integración OCR**: Extracción automática de datos desde archivos PDF

- ✅ Configuración del sistema

- ✅ Monitoreo de actividad###  Módulo de Proyectos

Herramientas para el seguimiento y gestión de proyectos de investigación:

---

- **Listado Completo**: Visualización de todos los proyectos con información relevante

## 🛠️ Stack Tecnológico- **Detalles y Seguimiento**: Seguimiento detallado del progreso y estado de cada proyecto

- **Filtrado Avanzado**: Filtros por categoría, estado, área de investigación y fechas

### Frontend- **Colaboración**: Sistema de colaboración entre investigadores e instituciones

- **Next.js 15.5.4** - Framework React con App Router- **Documentación**: Gestión de documentación relacionada con cada proyecto

- **TypeScript** - Tipado estático- **Estados y Fases**: Seguimiento del ciclo de vida completo de los proyectos

- **TailwindCSS** - Estilos utility-first

- **shadcn/ui** - Componentes UI modernos###  Módulo de Instituciones

- **Lucide React** - IconosDirectorio completo de instituciones de investigación y educación:



### Backend & API- **Directorio Completo**: Base de datos de instituciones con información detallada

- **Next.js API Routes** - Endpoints RESTful- **Información Institucional**: Datos sobre programas, investigadores y proyectos

- **Clerk** - Autenticación y gestión de usuarios- **Registro de Nuevas**: Formularios para el registro de nuevas instituciones

- **Node.js** - Microservicio OCR- **Validación**: Verificación de información institucional

- **Relaciones**: Gestión de relaciones entre instituciones e investigadores

### Base de Datos

- **PostgreSQL** - Base de datos principal (Neon)###  Módulo de Búsqueda Global

- **Prisma** - ORM para TypeScriptSistema de búsqueda unificado que permite encontrar información en toda la plataforma:



### Deployment- **Búsqueda Unificada**: Búsqueda simultánea en investigadores, proyectos y publicaciones

- **Vercel** - Aplicación principal- **Filtros Inteligentes**: Filtros por tipo de contenido, área, institución, fecha y más

- **Railway** - Microservicio OCR- **Resultados Organizados**: Presentación clara y organizada de resultados por categorías

- **Neon** - Base de datos PostgreSQL- **Búsqueda en Tiempo Real**: Autocompletado y sugerencias mientras se escribe

- **Historial**: Guardado de búsquedas recientes para facilitar el acceso

---- **Exportación**: Opciones para exportar resultados de búsqueda



## 🏗️ Arquitectura###  Módulo de Administración

Panel de control completo para administradores del sistema:

```

┌─────────────────────────────────────────────────────────────┐- **Dashboard Principal**: Vista general del sistema con métricas y estadísticas

│                        FRONTEND (Next.js)                    │- **Gestión de Usuarios**: Herramientas para gestionar usuarios, roles y permisos

│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐       │- **Gestión de Investigadores**: Administración completa de perfiles de investigadores

│  │   Pages     │  │  Components  │  │    Hooks     │       │- **Estadísticas del Sistema**: Métricas detalladas sobre el uso y actividad del sistema

│  │  (App Dir)  │  │   (shadcn)   │  │  (Custom)    │       │- **Configuración Avanzada**: Configuración de parámetros del sistema y módulos

│  └─────────────┘  └──────────────┘  └──────────────┘       │- **Logs y Auditoría**: Registro de actividades y cambios en el sistema

│                           │                                  │

│  ┌────────────────────────┴──────────────────────┐          │##  Tecnologías

│  │              API Routes (Next.js)             │          │

│  └────────────────────────┬──────────────────────┘          │La plataforma SEI utiliza un stack tecnológico moderno y robusto que garantiza escalabilidad, mantenibilidad y rendimiento:

└────────────────────────────┼──────────────────────────────┘

                             │###  Frontend y Desarrollo

          ┌──────────────────┼──────────────────┐- **Next.js 14**: Framework React de última generación con App Router, Server Components y optimizaciones automáticas

          │                  │                  │- **TypeScript**: Tipado estático para mayor robustez, mejor experiencia de desarrollo y detección temprana de errores

┌─────────▼─────────┐  ┌────▼─────┐  ┌────────▼────────┐- **TailwindCSS**: Framework CSS utilitario que permite crear interfaces modernas y consistentes

│   PostgreSQL      │  │  Clerk   │  │  OCR Service    │- **shadcn/ui**: Biblioteca de componentes UI accesibles y personalizables basada en Radix UI

│   (Neon)          │  │  Auth    │  │   (Railway)     │- **React Hook Form**: Gestión eficiente de formularios con validación integrada

│                   │  │          │  │                 │- **Zod**: Validación de esquemas para TypeScript con excelente integración

│  • Investigadores │  │ • Users  │  │ • PDF Extract   │

│  • Publicaciones  │  │ • Auth   │  │ • Tesseract     │###  Base de Datos y Almacenamiento

│  • Proyectos      │  │ • 2FA    │  │ • Validation    │- **PostgreSQL**: Base de datos relacional robusta para producción con soporte completo para consultas complejas

└───────────────────┘  └──────────┘  └─────────────────┘- **SQLite**: Base de datos local para desarrollo y testing

```- **Prisma**: ORM moderno para TypeScript con migraciones automáticas y type-safety

- **Neon/Railway/Vercel Postgres**: Proveedores de hosting para PostgreSQL en la nube

---

###  Autenticación y Seguridad

## 🚀 Instalación- **JWT (JSON Web Tokens)**: Autenticación stateless segura y escalable

- **2FA (Two-Factor Authentication)**: Autenticación de dos factores para mayor seguridad

### Prerrequisitos- **bcrypt**: Hashing seguro de contraseñas

- **NextAuth.js**: Framework de autenticación para Next.js

- **Node.js** 18.x o superior- **Middleware**: Protección de rutas y validación de permisos

- **pnpm** 8.x o superior (o npm/yarn)

- **PostgreSQL** (o cuenta en Neon)###  Microservicios y APIs

- **Cuenta Clerk** para autenticación- **Node.js**: Runtime de JavaScript para el microservicio OCR

- **Express.js**: Framework web para APIs REST

### Pasos- **Railway**: Plataforma de despliegue para microservicios

- **REST APIs**: Arquitectura de APIs RESTful para comunicación entre servicios

1. **Clonar el repositorio**

```bash###  Despliegue y DevOps

git clone https://github.com/I2Cprogramacion/SEI.git- **Vercel**: Plataforma de despliegue para aplicaciones Next.js con CI/CD automático

cd SEI- **Railway**: Hosting para microservicios con escalado automático

```- **GitHub Actions**: Automatización de CI/CD y despliegues

- **Environment Variables**: Gestión segura de configuraciones y secretos

2. **Instalar dependencias**

```bash###  Monitoreo y Analytics

pnpm install- **Vercel Analytics**: Métricas de rendimiento y uso de la aplicación

```- **Error Tracking**: Monitoreo de errores en tiempo real

- **Performance Monitoring**: Seguimiento del rendimiento de la aplicación

3. **Configurar variables de entorno**

```bash##  Instalación y Despliegue

# Copiar el archivo de ejemplo

cp env.local.example .env.local### Requisitos previos

Antes de comenzar, asegúrate de tener instalado:

# Editar .env.local con tus credenciales

```- **Node.js >= 18**: Runtime de JavaScript necesario para ejecutar la aplicación

- **pnpm**: Gestor de paquetes rápido y eficiente (alternativa a npm/yarn)

4. **Configurar la base de datos**- **PostgreSQL**: Base de datos relacional para producción

```bash- **Git**: Sistema de control de versiones para clonar el repositorio

# Generar cliente de Prisma

pnpm prisma generate### Descripción de directorios principales:



# Ejecutar migraciones- **`app/`**: Contiene todas las páginas y APIs de la aplicación usando App Router de Next.js 14

pnpm prisma migrate dev- **`components/`**: Componentes reutilizables organizados por funcionalidad

- **`lib/`**: Utilidades, configuración y lógica de negocio

# (Opcional) Poblar con datos de ejemplo- **`hooks/`**: Custom hooks de React para lógica reutilizable

pnpm prisma db seed- **`public/`**: Archivos estáticos como imágenes, iconos y documentos

```- **`scripts/`**: Scripts de Node.js para tareas de desarrollo y mantenimiento

- **`docs/`**: Documentación técnica y guías de usuario

5. **Iniciar servidor de desarrollo**

```bash##  Roles y Permisos

pnpm dev

```El sistema SEI implementa un sistema granular de roles y permisos que garantiza la seguridad y el acceso controlado a las funcionalidades:



La aplicación estará disponible en `http://localhost:3000`###  Investigador

- **Acceso**: Gestión de su propio perfil y contenido relacionado

---- **Funcionalidades**:

  - Edición y actualización de su perfil personal

## ⚙️ Configuración  - Registro de nuevas publicaciones

  - Creación y gestión de proyectos

### Variables de Entorno  - Acceso a herramientas de colaboración

  - Visualización de estadísticas personales

Crea un archivo `.env.local` con las siguientes variables:

###  Administrador

```env- **Acceso**: Control completo del sistema

# ========================================- **Funcionalidades**:

# CLERK AUTHENTICATION  - Gestión de todos los usuarios e investigadores

# ========================================  - Administración de publicaciones y proyectos

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx  - Configuración del sistema

CLERK_SECRET_KEY=sk_test_xxxxx  - Acceso a estadísticas y métricas

  - Gestión de instituciones

# URLs de redirección  - Herramientas de moderación y validación

NEXT_PUBLIC_CLERK_SIGN_IN_URL=/iniciar-sesion  - Configuración de parámetros del sistema

NEXT_PUBLIC_CLERK_SIGN_UP_URL=/registro

NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/admin###  Sistema de Seguridad

NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/admin- **Autenticación JWT**: Tokens seguros para sesiones

- **2FA**: Autenticación de dos factores para mayor seguridad

# ========================================- **Middleware**: Protección de rutas sensibles

# DATABASE - POSTGRESQL- **Validación de Permisos**: Verificación en cada operación

# ========================================- **Auditoría**: Registro de actividades importantes

DATABASE_URL=postgresql://usuario:password@host.neon.tech/dbname?sslmode=require

###  Frontend y API (Vercel)

# ========================================- **Plataforma**: Vercel

# OCR SERVICE (Opcional)- **Ventajas**:

# ========================================  - Despliegue automático desde GitHub

PDF_PROCESSOR_URL=http://localhost:8001  - CDN global para mejor rendimiento

# PDF_PROCESSOR_URL=https://tu-servidor-ocr.railway.app  - Escalado automático

```  - Integración nativa con Next.js

  - Variables de entorno seguras

### Configuración de Clerk  - Analytics integrado



1. Ve a [Clerk Dashboard](https://dashboard.clerk.com/)###  Microservicio OCR (Railway)

2. Crea una nueva aplicación- **Plataforma**: Railway

3. En **Configure → Sessions**:- **Ventajas**:

   - Session token lifetime: `43200` segundos (12 horas)  - Despliegue simple de microservicios

   - Automatically renew: ✓ Habilitado  - Escalado automático

4. Copia las claves a tu `.env.local`  - Logs en tiempo real

  - Variables de entorno

Ver [docs/CLERK_CONFIG_SETUP.md](./docs/CLERK_CONFIG_SETUP.md) para más detalles.  - Integración con GitHub

  - Costo eficiente

### Base de Datos

###  Base de Datos (PostgreSQL)

#### Neon PostgreSQL (Recomendado)- **Opciones recomendadas**:

1. Crea una cuenta en [Neon](https://neon.tech/)  - **Neon**: PostgreSQL serverless con branching

2. Crea un nuevo proyecto  - **Railway**: PostgreSQL con backup automático

3. Copia la cadena de conexión  - **Vercel Postgres**: Integración nativa con Vercel

4. Pégala en `DATABASE_URL` en `.env.local`- **Ventajas**:

  - Escalado automático

---  - Backup automático

  - Conexiones seguras

## 📖 Uso  - Monitoreo integrado



### Registro de Usuario###  Checklist de Despliegue

- [ ] Configurar repositorio en GitHub

1. Ve a `/registro`- [ ] Conectar Vercel al repositorio

2. Llena el formulario completo- [ ] Configurar variables de entorno en Vercel

3. (Opcional) Sube un PDF con tu CV para extracción automática- [ ] Desplegar microservicio OCR en Railway

4. Haz clic en "Registrarse"- [ ] Configurar base de datos PostgreSQL

5. Revisa tu email y copia el código de verificación- [ ] Configurar dominio personalizado (opcional)

6. Ingresa el código en `/verificar-email`- [ ] Configurar SSL/HTTPS

7. Serás redirigido al dashboard- [ ] Configurar monitoreo y alertas



### Panel Administrativo##  APIs Principales



Accede a `/admin` para ver:La plataforma SEI expone una API REST completa para la gestión de todos los recursos:

- Estadísticas del sistema

- Gestión de investigadores###  Autenticación y Autorización

- Gestión de proyectos y publicaciones- `POST /api/auth/login` - Inicio de sesión con credenciales

- `POST /api/auth/logout` - Cerrar sesión y invalidar token

### Búsqueda- `POST /api/auth/registro-simple` - Registro simplificado de usuarios

- `POST /api/auth/verify-2fa` - Verificación de autenticación de dos factores

Usa la barra de búsqueda global en la navbar para encontrar investigadores, proyectos y publicaciones.- `GET /api/auth/verify-token` - Verificación de validez de token JWT



---###  Gestión de Investigadores

- `GET /api/investigadores` - Obtener lista completa de investigadores

## 📁 Estructura del Proyecto- `GET /api/investigadores/[id]` - Obtener investigador específico por ID

- `GET /api/investigadores/search` - Búsqueda avanzada de investigadores

```- `GET /api/investigadores/featured` - Obtener investigadores destacados

SEI/- `GET /api/investigadores/incompletos` - Investigadores con perfiles incompletos

├── app/                          # Next.js App Router- `POST /api/investigadores` - Crear nuevo investigador

│   ├── admin/                    # Panel administrativo- `PUT /api/investigadores/[id]` - Actualizar investigador existente

│   ├── api/                      # API Routes

│   ├── buscar/                  # Búsqueda###  Gestión de Publicaciones

│   ├── registro/                # Registro- `GET /api/publicaciones` - Obtener lista de publicaciones

│   ├── verificar-email/         # Verificación- `GET /api/publicaciones/[id]` - Obtener publicación específica

│   └── layout.tsx               # Layout principal- `POST /api/publicaciones` - Crear nueva publicación

├── components/                   # Componentes React- `PUT /api/publicaciones/[id]` - Actualizar publicación existente

│   ├── ui/                      # shadcn/ui components- `DELETE /api/publicaciones/[id]` - Eliminar publicación

│   ├── navbar.tsx

│   └── footer.tsx###  Gestión de Proyectos

├── lib/                         # Utilidades- `GET /api/proyectos` - Obtener lista de proyectos

│   ├── auth/                    # Auth utilities- `GET /api/proyectos/[id]` - Obtener proyecto específico

│   ├── databases/               # DB config- `GET /api/proyectos/recent` - Obtener proyectos recientes

│   └── utils.ts- `POST /api/proyectos` - Crear nuevo proyecto

├── prisma/                      # Prisma ORM- `PUT /api/proyectos/[id]` - Actualizar proyecto existente

│   ├── schema.prisma

│   └── migrations/###  Gestión de Instituciones

├── docs/                        # Documentación- `GET /api/instituciones` - Obtener lista de instituciones

│   ├── CLERK_CONFIG_SETUP.md- `GET /api/instituciones/[id]` - Obtener institución específica

│   ├── DATABASE_MIGRATION.md- `POST /api/instituciones` - Crear nueva institución

│   └── OCR_SETUP.md- `PUT /api/instituciones/[id]` - Actualizar institución existente

├── public/                      # Archivos estáticos

├── middleware.ts                # Clerk middleware###  Búsqueda y Exploración

├── clerk.config.ts              # Clerk config- `GET /api/search` - Búsqueda global en toda la plataforma

└── package.json- `GET /api/search?type=investigadores` - Búsqueda específica en investigadores

```- `GET /api/search?type=proyectos` - Búsqueda específica en proyectos

- `GET /api/search?type=publicaciones` - Búsqueda específica en publicaciones

---

###  Utilidades y Servicios

## 📚 Documentación- `POST /api/upload` - Subida de archivos (PDF, imágenes, documentos)

- `POST /api/ocr` - Procesamiento OCR de documentos PDF

Documentación adicional en [`docs/`](./docs/):- `GET /api/membership` - Información de membresía y niveles

- `GET /api/protected` - Verificación de acceso a rutas protegidas

- **[CLERK_CONFIG_SETUP.md](./docs/CLERK_CONFIG_SETUP.md)** - Configuración de Clerk

- **[IMPLEMENTACION_COMPLETA.md](./docs/IMPLEMENTACION_COMPLETA.md)** - Documentación técnica###  Estadísticas y Reportes

- **[SESIONES_Y_PERMISOS_RESUMEN.md](./docs/SESIONES_Y_PERMISOS_RESUMEN.md)** - Sesiones y permisos- `GET /api/stats/investigadores` - Estadísticas de investigadores

- **[DATABASE_MIGRATION.md](./docs/DATABASE_MIGRATION.md)** - Migraciones- `GET /api/stats/proyectos` - Estadísticas de proyectos

- **[OCR_SETUP.md](./docs/OCR_SETUP.md)** - Configuración OCR- `GET /api/stats/publicaciones` - Estadísticas de publicaciones

- `GET /api/stats/general` - Estadísticas generales del sistema

---

##  Características de UI

## 📝 Scripts Disponibles

La plataforma SEI ofrece una experiencia de usuario moderna y accesible:

```bash

pnpm dev          # Servidor de desarrollo###  Diseño Responsive

pnpm build        # Build de producción- **Mobile-First**: Diseño optimizado para dispositivos móviles

pnpm start        # Servidor de producción- **TailwindCSS**: Framework CSS utilitario para estilos consistentes

pnpm lint         # Linter- **Breakpoints**: Adaptación automática a diferentes tamaños de pantalla

pnpm test         # Tests- **Touch-Friendly**: Interfaz optimizada para dispositivos táctiles

pnpm prisma:generate    # Generar cliente Prisma

pnpm prisma:migrate     # Ejecutar migraciones###  Tema Oscuro/Claro

pnpm prisma:studio      # Abrir Prisma Studio- **Soporte Completo**: Implementación nativa de ambos temas

```- **Persistencia**: Preferencias guardadas en el navegador

- **Transiciones**: Cambios suaves entre temas

---- **Accesibilidad**: Cumple con estándares de contraste



## 🐛 Solución de Problemas###  Componentes Modernos

- **shadcn/ui**: Biblioteca de componentes accesibles y personalizables

### Error: "Cannot find module '@prisma/client'"- **Consistencia**: Diseño uniforme en toda la aplicación

```bash- **Accesibilidad**: Componentes que cumplen con WCAG 2.1

pnpm prisma generate- **Personalización**: Temas y estilos personalizables

```

###  Búsqueda en Tiempo Real

### Error: "Clerk is not configured"- **Autocompletado**: Sugerencias mientras se escribe

Verifica las variables `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` y `CLERK_SECRET_KEY` en `.env.local`- **Filtros Dinámicos**: Filtros que se actualizan en tiempo real

- **Debouncing**: Optimización de rendimiento en búsquedas

### Error de base de datos- **Resultados Instantáneos**: Respuesta inmediata a las consultas

```bash

pnpm prisma migrate reset###  Experiencia de Usuario

pnpm prisma migrate dev- **Navegación Intuitiva**: Estructura clara y lógica

```- **Feedback Visual**: Indicadores de estado y progreso

- **Loading States**: Estados de carga para mejor UX

---- **Error Handling**: Manejo elegante de errores



## 👥 Equipo###  Consideraciones Técnicas

- **No se requiere Python**: Todo el OCR se realiza con Node.js y microservicios

Desarrollado por **I2C Programación**- **Variables de entorno**: Configura `PDF_PROCESSOR_URL` para el OCR de Railway

- **Base de datos**: SQLite en desarrollo, PostgreSQL en producción

---- **Autenticación**: Sistema robusto con JWT y verificación 2FA



## 📞 Contacto###  Despliegue y Producción

- **Despliegue recomendado**: Vercel (frontend) + Railway (OCR) + PostgreSQL

- **GitHub**: [@I2Cprogramacion](https://github.com/I2Cprogramacion)- **Variables de entorno**: Asegúrate de configurar todas las variables necesarias

- **SSL/HTTPS**: Configuración automática en Vercel y Railway

---- **Monitoreo**: Implementa alertas y monitoreo de errores



## 🙏 Agradecimientos###  Seguridad

- **Tokens JWT**: Configura un secreto fuerte para JWT

- [Next.js](https://nextjs.org/)- **2FA**: Implementa autenticación de dos factores para mayor seguridad

- [Clerk](https://clerk.com/)- **Validación**: Valida todos los inputs del usuario

- [shadcn/ui](https://ui.shadcn.com/)- **HTTPS**: Usa siempre conexiones seguras en producción

- [Neon](https://neon.tech/)

- [Vercel](https://vercel.com/)###  Rendimiento

- **Caching**: Implementa caching para mejorar el rendimiento

---- **Optimización**: Optimiza imágenes y recursos estáticos

- **CDN**: Aprovecha el CDN global de Vercel

<div align="center">- **Database**: Optimiza consultas y usa índices apropiados



**⭐ Si este proyecto te fue útil, considera darle una estrella en GitHub ⭐**##  Créditos



[⬆ Volver arriba](#-sei---sistema-estatal-de-investigadores)Desarrollado por **I2Cprogramacion** y colaboradores.



</div>---


Para soporte o sugerencias, abre un [issue en GitHub](https://github.com/I2Cprogramacion/SEI/issues).
