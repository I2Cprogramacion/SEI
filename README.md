# SEI - Sistema Estatal de Investigadores

Plataforma web integral para la gestión de perfiles académicos, registro de publicaciones y proyectos, colaboración entre investigadores y asignación de niveles. El SEI facilita la administración y seguimiento de la actividad científica en el estado, proporcionando herramientas modernas para investigadores, instituciones y administradores del sistema.

## 🚀 Características Principales

### 🧑‍🔬 Gestión de Investigadores
- **Perfiles Completos**: Sistema robusto para el registro y gestión de perfiles académicos con información detallada sobre formación, experiencia, publicaciones y proyectos
- **Validación de Datos**: Verificación automática de información académica y profesional
- **Niveles de Investigador**: Asignación y seguimiento de niveles según criterios establecidos
- **Perfiles Incompletos**: Gestión especializada para investigadores con información pendiente

### 📚 Publicaciones Científicas
- **Registro Automatizado**: Sistema de registro de publicaciones con extracción automática de datos mediante OCR
- **DOI Automático**: Generación y gestión automática de DOI para publicaciones
- **Gestión de Archivos**: Subida y almacenamiento seguro de archivos PDF y ZIP
- **Búsqueda Avanzada**: Búsqueda por título, autores, DOI, palabras clave y categorías

### 📊 Proyectos de Investigación
- **Seguimiento Completo**: Gestión integral de proyectos desde su concepción hasta su finalización
- **Colaboración**: Sistema de colaboración entre investigadores e instituciones
- **Estados y Categorías**: Clasificación y seguimiento del estado de los proyectos
- **Documentación**: Almacenamiento y gestión de documentación relacionada

### 🔍 Búsqueda Avanzada
- **Búsqueda Global**: Búsqueda unificada en investigadores, proyectos y publicaciones
- **Filtros Inteligentes**: Filtrado por tipo de contenido, área, institución, fecha y más
- **Resultados Organizados**: Presentación clara y organizada de resultados de búsqueda
- **Búsqueda en Tiempo Real**: Autocompletado y sugerencias mientras se escribe

### 👑 Panel Administrativo
- **Gestión Completa**: Herramientas administrativas para la gestión integral del sistema
- **Estadísticas**: Dashboard con métricas y estadísticas del sistema
- **Usuarios**: Gestión de usuarios, roles y permisos
- **Configuración**: Configuración avanzada del sistema y sus módulos

### 🔧 OCR Automatizado
- **Extracción Inteligente**: Procesamiento automático de PDFs para extraer información relevante
- **Microservicio Dedicado**: Servicio especializado desplegado en Railway para procesamiento OCR
- **Integración Seamless**: Integración transparente con el sistema principal
- **Validación de Datos**: Verificación y validación de datos extraídos

### 🔐 Autenticación Segura
- **Sistema de Login**: Autenticación robusta con JWT y verificación 2FA
- **Roles y Permisos**: Sistema granular de roles y permisos
- **Seguridad**: Implementación de mejores prácticas de seguridad
- **Recuperación**: Sistema de recuperación de contraseñas y cuentas

## 🏗️ Arquitectura

La plataforma SEI está construida con una arquitectura moderna y escalable que separa claramente las responsabilidades:

### 🎨 Frontend y API
- **Next.js 14**: Framework React con App Router para renderizado del lado del servidor y cliente
- **TypeScript**: Tipado estático para mayor robustez y mantenibilidad del código
- **Despliegue**: Vercel para hosting automático y escalado global
- **API Routes**: Endpoints RESTful integrados en la aplicación Next.js

### 🔧 Microservicio OCR
- **Node.js**: Servicio especializado para procesamiento de documentos
- **Railway**: Plataforma de despliegue para el microservicio OCR
- **Comunicación**: API REST para comunicación con el sistema principal
- **Procesamiento**: Extracción automática de datos desde archivos PDF

### 🗄️ Base de Datos
- **PostgreSQL**: Base de datos relacional para producción
- **SQLite**: Base de datos local para desarrollo
- **Proveedores**: Neon, Railway, Vercel Postgres para hosting
- **Migraciones**: Sistema de migraciones para versionado de esquemas

### 🎨 Interfaz de Usuario
- **TailwindCSS**: Framework CSS utilitario para estilos consistentes
- **shadcn/ui**: Biblioteca de componentes UI modernos y accesibles
- **Responsive Design**: Diseño adaptativo para todos los dispositivos
- **Temas**: Soporte para tema claro y oscuro

## 📁 Módulos Principales

La plataforma SEI está organizada en módulos especializados que cubren todas las necesidades del sistema de investigación:

### 🧑‍🔬 Módulo de Investigadores
El módulo de investigadores es el núcleo del sistema, proporcionando herramientas completas para la gestión de perfiles académicos:

- **Listado y Perfiles**: Visualización de investigadores con información detallada sobre formación, experiencia y logros
- **Búsqueda Avanzada**: Búsqueda por área de especialización, institución, nivel académico y palabras clave
- **Gestión de Perfiles**: Herramientas para completar y actualizar información de investigadores
- **Perfiles Incompletos**: Sistema especializado para identificar y gestionar investigadores con información pendiente
- **Registro de Nuevos**: Formularios intuitivos para el registro de nuevos investigadores al sistema
- **Validación de Datos**: Verificación automática de información académica y profesional

### 📚 Módulo de Publicaciones
Sistema integral para la gestión de publicaciones científicas con funcionalidades avanzadas:

- **Catálogo Completo**: Base de datos de publicaciones científicas con información detallada
- **DOI Automático**: Generación y gestión automática de DOI para nuevas publicaciones
- **Gestión de Archivos**: Subida segura de archivos PDF y ZIP con validación de formato
- **Búsqueda Especializada**: Búsqueda por título, autores, DOI, palabras clave y categorías
- **Metadatos**: Almacenamiento de información completa sobre cada publicación
- **Integración OCR**: Extracción automática de datos desde archivos PDF

### 📊 Módulo de Proyectos
Herramientas para el seguimiento y gestión de proyectos de investigación:

- **Listado Completo**: Visualización de todos los proyectos con información relevante
- **Detalles y Seguimiento**: Seguimiento detallado del progreso y estado de cada proyecto
- **Filtrado Avanzado**: Filtros por categoría, estado, área de investigación y fechas
- **Colaboración**: Sistema de colaboración entre investigadores e instituciones
- **Documentación**: Gestión de documentación relacionada con cada proyecto
- **Estados y Fases**: Seguimiento del ciclo de vida completo de los proyectos

### 🏛️ Módulo de Instituciones
Directorio completo de instituciones de investigación y educación:

- **Directorio Completo**: Base de datos de instituciones con información detallada
- **Información Institucional**: Datos sobre programas, investigadores y proyectos
- **Registro de Nuevas**: Formularios para el registro de nuevas instituciones
- **Validación**: Verificación de información institucional
- **Relaciones**: Gestión de relaciones entre instituciones e investigadores

### 🔍 Módulo de Búsqueda Global
Sistema de búsqueda unificado que permite encontrar información en toda la plataforma:

- **Búsqueda Unificada**: Búsqueda simultánea en investigadores, proyectos y publicaciones
- **Filtros Inteligentes**: Filtros por tipo de contenido, área, institución, fecha y más
- **Resultados Organizados**: Presentación clara y organizada de resultados por categorías
- **Búsqueda en Tiempo Real**: Autocompletado y sugerencias mientras se escribe
- **Historial**: Guardado de búsquedas recientes para facilitar el acceso
- **Exportación**: Opciones para exportar resultados de búsqueda

### 👑 Módulo de Administración
Panel de control completo para administradores del sistema:

- **Dashboard Principal**: Vista general del sistema con métricas y estadísticas
- **Gestión de Usuarios**: Herramientas para gestionar usuarios, roles y permisos
- **Gestión de Investigadores**: Administración completa de perfiles de investigadores
- **Estadísticas del Sistema**: Métricas detalladas sobre el uso y actividad del sistema
- **Configuración Avanzada**: Configuración de parámetros del sistema y módulos
- **Logs y Auditoría**: Registro de actividades y cambios en el sistema

## 🔧 Tecnologías

La plataforma SEI utiliza un stack tecnológico moderno y robusto que garantiza escalabilidad, mantenibilidad y rendimiento:

### 🎨 Frontend y Desarrollo
- **Next.js 14**: Framework React de última generación con App Router, Server Components y optimizaciones automáticas
- **TypeScript**: Tipado estático para mayor robustez, mejor experiencia de desarrollo y detección temprana de errores
- **TailwindCSS**: Framework CSS utilitario que permite crear interfaces modernas y consistentes
- **shadcn/ui**: Biblioteca de componentes UI accesibles y personalizables basada en Radix UI
- **React Hook Form**: Gestión eficiente de formularios con validación integrada
- **Zod**: Validación de esquemas para TypeScript con excelente integración

### 🗄️ Base de Datos y Almacenamiento
- **PostgreSQL**: Base de datos relacional robusta para producción con soporte completo para consultas complejas
- **SQLite**: Base de datos local para desarrollo y testing
- **Prisma**: ORM moderno para TypeScript con migraciones automáticas y type-safety
- **Neon/Railway/Vercel Postgres**: Proveedores de hosting para PostgreSQL en la nube

### 🔐 Autenticación y Seguridad
- **JWT (JSON Web Tokens)**: Autenticación stateless segura y escalable
- **2FA (Two-Factor Authentication)**: Autenticación de dos factores para mayor seguridad
- **bcrypt**: Hashing seguro de contraseñas
- **NextAuth.js**: Framework de autenticación para Next.js
- **Middleware**: Protección de rutas y validación de permisos

### 🔧 Microservicios y APIs
- **Node.js**: Runtime de JavaScript para el microservicio OCR
- **Express.js**: Framework web para APIs REST
- **Railway**: Plataforma de despliegue para microservicios
- **REST APIs**: Arquitectura de APIs RESTful para comunicación entre servicios

### 🚀 Despliegue y DevOps
- **Vercel**: Plataforma de despliegue para aplicaciones Next.js con CI/CD automático
- **Railway**: Hosting para microservicios con escalado automático
- **GitHub Actions**: Automatización de CI/CD y despliegues
- **Environment Variables**: Gestión segura de configuraciones y secretos

### 📊 Monitoreo y Analytics
- **Vercel Analytics**: Métricas de rendimiento y uso de la aplicación
- **Error Tracking**: Monitoreo de errores en tiempo real
- **Performance Monitoring**: Seguimiento del rendimiento de la aplicación

## 🚀 Instalación y Despliegue

### Requisitos previos
Antes de comenzar, asegúrate de tener instalado:

- **Node.js >= 18**: Runtime de JavaScript necesario para ejecutar la aplicación
- **pnpm**: Gestor de paquetes rápido y eficiente (alternativa a npm/yarn)
- **PostgreSQL**: Base de datos relacional para producción
- **Git**: Sistema de control de versiones para clonar el repositorio

### Instalación local
Sigue estos pasos para configurar el entorno de desarrollo:

```bash
# 1. Clonar el repositorio desde GitHub
git clone https://github.com/I2Cprogramacion/SEI.git
cd SEI

# 2. Instalar todas las dependencias del proyecto
pnpm install

# 3. Configurar las variables de entorno
cp env.example .env.local
# Editar .env.local con tus credenciales específicas

# 4. Configurar la base de datos
# Para desarrollo local, se usará SQLite automáticamente
# Para producción, configura las variables de PostgreSQL

# 5. Ejecutar la aplicación en modo desarrollo
pnpm dev
```

La aplicación estará disponible en `http://localhost:3000`

### Configuración de variables de entorno
Crea un archivo `.env.local` con las siguientes variables:

```env
# Base de datos (para producción)
POSTGRES_HOST=your-postgres-host
POSTGRES_DATABASE=your-database-name
POSTGRES_USER=your-username
POSTGRES_PASSWORD=your-password
POSTGRES_PORT=5432

# OCR Microservicio
PDF_PROCESSOR_URL=https://your-ocr-service.railway.app

# Autenticación
JWT_SECRET=your-super-secret-jwt-key
NEXT_PUBLIC_ADMIN_EMAIL=admin@sei.com.mx

# Entorno
NODE_ENV=development
```

## 🔄 Flujo de OCR

El sistema de OCR (Optical Character Recognition) permite la extracción automática de datos desde documentos PDF, facilitando el registro de publicaciones y proyectos:

### Proceso paso a paso:

1. **Subida de Archivo**: El usuario sube un archivo PDF desde el frontend desplegado en Vercel
2. **Procesamiento**: El endpoint `/api/ocr` recibe el archivo y lo reenvía al microservicio OCR desplegado en Railway
3. **Extracción**: El microservicio OCR procesa el PDF y extrae información relevante como:
   - Título de la publicación
   - Autores
   - Resumen
   - Palabras clave
   - DOI (si existe)
   - Información de la revista o editorial
4. **Validación**: Los datos extraídos se validan y estructuran
5. **Almacenamiento**: La información se guarda en la base de datos PostgreSQL
6. **Respuesta**: El sistema devuelve los datos procesados al usuario

### Características del OCR:
- **Procesamiento Automático**: Sin intervención manual requerida
- **Validación de Datos**: Verificación de la calidad de la información extraída
- **Formato Estructurado**: Datos organizados en campos específicos
- **Manejo de Errores**: Gestión robusta de archivos problemáticos
- **Escalabilidad**: Microservicio independiente que puede escalar según la demanda


## 📂 Estructura del Proyecto

La plataforma SEI está organizada siguiendo las mejores prácticas de Next.js 14 con App Router:

```
SEI/
├── app/                           # Directorio principal de la aplicación
│   ├── api/                       # Endpoints de API REST
│   │   ├── auth/                  # Autenticación y autorización
│   │   ├── investigadores/        # APIs para gestión de investigadores
│   │   ├── proyectos/             # APIs para gestión de proyectos
│   │   ├── publicaciones/         # APIs para gestión de publicaciones
│   │   ├── instituciones/         # APIs para gestión de instituciones
│   │   ├── search/                # API de búsqueda global
│   │   ├── ocr/                   # API para procesamiento OCR
│   │   └── upload/                # API para subida de archivos
│   ├── admin/                     # Panel de administración
│   │   ├── investigadores/        # Gestión de investigadores
│   │   ├── proyectos/             # Gestión de proyectos
│   │   ├── publicaciones/         # Gestión de publicaciones
│   │   ├── instituciones/         # Gestión de instituciones
│   │   ├── estadisticas/          # Dashboard con estadísticas
│   │   └── configuracion/         # Configuración del sistema
│   ├── investigadores/            # Módulo de investigadores
│   │   ├── [slug]/                # Perfiles individuales
│   │   ├── nuevo-perfil/          # Registro de nuevos investigadores
│   │   └── incompletos/           # Gestión de perfiles incompletos
│   ├── proyectos/                 # Módulo de proyectos
│   │   ├── [slug]/                # Detalles de proyectos
│   │   └── nuevo/                 # Creación de nuevos proyectos
│   ├── publicaciones/             # Módulo de publicaciones
│   │   └── nueva/                 # Registro de nuevas publicaciones
│   ├── instituciones/             # Módulo de instituciones
│   │   └── nueva/                 # Registro de nuevas instituciones
│   ├── buscar/                    # Búsqueda global
│   ├── explorar/                  # Exploración de contenido
│   ├── dashboard/                 # Panel de usuario
│   ├── iniciar-sesion/            # Página de login
│   ├── registro/                  # Página de registro
│   └── [páginas públicas]/       # Páginas de información general
├── components/                    # Componentes reutilizables
│   ├── ui/                        # Componentes base (shadcn/ui)
│   │   ├── button.tsx             # Botones
│   │   ├── input.tsx              # Campos de entrada
│   │   ├── card.tsx               # Tarjetas
│   │   ├── table.tsx              # Tablas
│   │   ├── dialog.tsx             # Modales
│   │   └── [otros componentes]/   # Más componentes UI
│   ├── investigador-search.tsx    # Búsqueda de investigadores
│   ├── search-bar.tsx             # Barra de búsqueda principal
│   ├── admin-sidebar.tsx          # Navegación del panel admin
│   ├── featured-researchers.tsx   # Investigadores destacados
│   └── [otros componentes]/       # Componentes específicos
├── lib/                           # Utilidades y configuración
│   ├── database-config.ts         # Configuración de base de datos
│   ├── database-interface.ts      # Interfaz común para BD
│   ├── databases/                 # Implementaciones de BD
│   │   ├── sqlite-database.ts     # Implementación SQLite
│   │   └── postgresql-database.ts # Implementación PostgreSQL
│   ├── auth/                      # Utilidades de autenticación
│   ├── utils.ts                   # Funciones auxiliares
│   └── [otras utilidades]/        # Más utilidades
├── hooks/                         # Custom React hooks
├── styles/                        # Estilos globales
├── public/                        # Recursos estáticos
├── scripts/                       # Scripts de utilidad
├── docs/                          # Documentación
└── [archivos de configuración]/   # Configuración del proyecto
```

### Descripción de directorios principales:

- **`app/`**: Contiene todas las páginas y APIs de la aplicación usando App Router de Next.js 14
- **`components/`**: Componentes reutilizables organizados por funcionalidad
- **`lib/`**: Utilidades, configuración y lógica de negocio
- **`hooks/`**: Custom hooks de React para lógica reutilizable
- **`public/`**: Archivos estáticos como imágenes, iconos y documentos
- **`scripts/`**: Scripts de Node.js para tareas de desarrollo y mantenimiento
- **`docs/`**: Documentación técnica y guías de usuario

## 🔐 Roles y Permisos

El sistema SEI implementa un sistema granular de roles y permisos que garantiza la seguridad y el acceso controlado a las funcionalidades:

### 👤 Usuario Normal
- **Acceso**: Contenido público de la plataforma
- **Funcionalidades**:
  - Visualización de investigadores, proyectos y publicaciones
  - Búsqueda en el catálogo público
  - Acceso a información de instituciones
  - Navegación por el contenido disponible

### 🧑‍🔬 Investigador
- **Acceso**: Gestión de su propio perfil y contenido relacionado
- **Funcionalidades**:
  - Edición y actualización de su perfil personal
  - Registro de nuevas publicaciones
  - Creación y gestión de proyectos
  - Acceso a herramientas de colaboración
  - Visualización de estadísticas personales

### 👑 Administrador
- **Acceso**: Control completo del sistema
- **Funcionalidades**:
  - Gestión de todos los usuarios e investigadores
  - Administración de publicaciones y proyectos
  - Configuración del sistema
  - Acceso a estadísticas y métricas
  - Gestión de instituciones
  - Herramientas de moderación y validación
  - Configuración de parámetros del sistema

### 🔒 Sistema de Seguridad
- **Autenticación JWT**: Tokens seguros para sesiones
- **2FA**: Autenticación de dos factores para mayor seguridad
- **Middleware**: Protección de rutas sensibles
- **Validación de Permisos**: Verificación en cada operación
- **Auditoría**: Registro de actividades importantes

## 🌐 Despliegue Recomendado

La plataforma SEI está diseñada para desplegarse en múltiples servicios cloud, aprovechando las mejores características de cada plataforma:

### 🚀 Frontend y API (Vercel)
- **Plataforma**: Vercel
- **Ventajas**:
  - Despliegue automático desde GitHub
  - CDN global para mejor rendimiento
  - Escalado automático
  - Integración nativa con Next.js
  - Variables de entorno seguras
  - Analytics integrado

### 🔧 Microservicio OCR (Railway)
- **Plataforma**: Railway
- **Ventajas**:
  - Despliegue simple de microservicios
  - Escalado automático
  - Logs en tiempo real
  - Variables de entorno
  - Integración con GitHub
  - Costo eficiente

### 🗄️ Base de Datos (PostgreSQL)
- **Opciones recomendadas**:
  - **Neon**: PostgreSQL serverless con branching
  - **Railway**: PostgreSQL con backup automático
  - **Vercel Postgres**: Integración nativa con Vercel
- **Ventajas**:
  - Escalado automático
  - Backup automático
  - Conexiones seguras
  - Monitoreo integrado

### 📋 Checklist de Despliegue
- [ ] Configurar repositorio en GitHub
- [ ] Conectar Vercel al repositorio
- [ ] Configurar variables de entorno en Vercel
- [ ] Desplegar microservicio OCR en Railway
- [ ] Configurar base de datos PostgreSQL
- [ ] Configurar dominio personalizado (opcional)
- [ ] Configurar SSL/HTTPS
- [ ] Configurar monitoreo y alertas

## 📋 APIs Principales

La plataforma SEI expone una API REST completa para la gestión de todos los recursos:

### 🔐 Autenticación y Autorización
- `POST /api/auth/login` - Inicio de sesión con credenciales
- `POST /api/auth/logout` - Cerrar sesión y invalidar token
- `POST /api/auth/registro-simple` - Registro simplificado de usuarios
- `POST /api/auth/verify-2fa` - Verificación de autenticación de dos factores
- `GET /api/auth/verify-token` - Verificación de validez de token JWT

### 🧑‍🔬 Gestión de Investigadores
- `GET /api/investigadores` - Obtener lista completa de investigadores
- `GET /api/investigadores/[id]` - Obtener investigador específico por ID
- `GET /api/investigadores/search` - Búsqueda avanzada de investigadores
- `GET /api/investigadores/featured` - Obtener investigadores destacados
- `GET /api/investigadores/incompletos` - Investigadores con perfiles incompletos
- `POST /api/investigadores` - Crear nuevo investigador
- `PUT /api/investigadores/[id]` - Actualizar investigador existente

### 📚 Gestión de Publicaciones
- `GET /api/publicaciones` - Obtener lista de publicaciones
- `GET /api/publicaciones/[id]` - Obtener publicación específica
- `POST /api/publicaciones` - Crear nueva publicación
- `PUT /api/publicaciones/[id]` - Actualizar publicación existente
- `DELETE /api/publicaciones/[id]` - Eliminar publicación

### 📊 Gestión de Proyectos
- `GET /api/proyectos` - Obtener lista de proyectos
- `GET /api/proyectos/[id]` - Obtener proyecto específico
- `GET /api/proyectos/recent` - Obtener proyectos recientes
- `POST /api/proyectos` - Crear nuevo proyecto
- `PUT /api/proyectos/[id]` - Actualizar proyecto existente

### 🏛️ Gestión de Instituciones
- `GET /api/instituciones` - Obtener lista de instituciones
- `GET /api/instituciones/[id]` - Obtener institución específica
- `POST /api/instituciones` - Crear nueva institución
- `PUT /api/instituciones/[id]` - Actualizar institución existente

### 🔍 Búsqueda y Exploración
- `GET /api/search` - Búsqueda global en toda la plataforma
- `GET /api/search?type=investigadores` - Búsqueda específica en investigadores
- `GET /api/search?type=proyectos` - Búsqueda específica en proyectos
- `GET /api/search?type=publicaciones` - Búsqueda específica en publicaciones

### 🔧 Utilidades y Servicios
- `POST /api/upload` - Subida de archivos (PDF, imágenes, documentos)
- `POST /api/ocr` - Procesamiento OCR de documentos PDF
- `GET /api/membership` - Información de membresía y niveles
- `GET /api/protected` - Verificación de acceso a rutas protegidas

### 📊 Estadísticas y Reportes
- `GET /api/stats/investigadores` - Estadísticas de investigadores
- `GET /api/stats/proyectos` - Estadísticas de proyectos
- `GET /api/stats/publicaciones` - Estadísticas de publicaciones
- `GET /api/stats/general` - Estadísticas generales del sistema

## 🎨 Características de UI

La plataforma SEI ofrece una experiencia de usuario moderna y accesible:

### 📱 Diseño Responsive
- **Mobile-First**: Diseño optimizado para dispositivos móviles
- **TailwindCSS**: Framework CSS utilitario para estilos consistentes
- **Breakpoints**: Adaptación automática a diferentes tamaños de pantalla
- **Touch-Friendly**: Interfaz optimizada para dispositivos táctiles

### 🌙 Tema Oscuro/Claro
- **Soporte Completo**: Implementación nativa de ambos temas
- **Persistencia**: Preferencias guardadas en el navegador
- **Transiciones**: Cambios suaves entre temas
- **Accesibilidad**: Cumple con estándares de contraste

### 🧩 Componentes Modernos
- **shadcn/ui**: Biblioteca de componentes accesibles y personalizables
- **Consistencia**: Diseño uniforme en toda la aplicación
- **Accesibilidad**: Componentes que cumplen con WCAG 2.1
- **Personalización**: Temas y estilos personalizables

### 🔍 Búsqueda en Tiempo Real
- **Autocompletado**: Sugerencias mientras se escribe
- **Filtros Dinámicos**: Filtros que se actualizan en tiempo real
- **Debouncing**: Optimización de rendimiento en búsquedas
- **Resultados Instantáneos**: Respuesta inmediata a las consultas

### 🎯 Experiencia de Usuario
- **Navegación Intuitiva**: Estructura clara y lógica
- **Feedback Visual**: Indicadores de estado y progreso
- **Loading States**: Estados de carga para mejor UX
- **Error Handling**: Manejo elegante de errores

## 📚 Documentación Adicional

La plataforma SEI incluye documentación completa para desarrolladores y administradores:

### 📖 Documentación Técnica
- [Documentación de Módulos](README-MODULOS.md) - Detalles técnicos de cada módulo y componente
- [Configuración de OCR](OCR-SETUP.md) - Setup completo del microservicio OCR
- [Deployment](DEPLOYMENT_CHECKLIST.md) - Checklist detallado para despliegue
- [Base de Datos](DATABASE_MIGRATION_README.md) - Guía de migración y configuración de BD

### 🔧 Guías de Configuración
- [Google Vision Setup](GOOGLE-VISION-SETUP.md) - Configuración de Google Vision API
- [Vercel Postgres](VERCEL_POSTGRES_SETUP.md) - Setup de PostgreSQL en Vercel
- [OCR Testing](OCR-TESTING.md) - Guía de pruebas del sistema OCR
- [PDF Processing](PDF_PROCESSING_README.md) - Procesamiento de documentos PDF

### 📋 Guías de Usuario
- [Perfiles Públicos](GUIA-PERFILES-PUBLICOS.md) - Guía para investigadores
- [Configuración Google Vision](CONFIGURACION-GOOGLE-VISION.md) - Setup de Google Vision
- [Soluciones OCR](SOLUCIONES-OCR.md) - Solución de problemas comunes

### 🛠️ Scripts de Utilidad
- `scripts/check-*.js` - Scripts de verificación de datos
- `scripts/create-*.js` - Scripts de creación de usuarios
- `scripts/test-*.js` - Scripts de pruebas y validación

## 🤝 Contribución

¡Las contribuciones son bienvenidas! Para contribuir al proyecto SEI:

### 🚀 Proceso de Contribución
1. **Fork el repositorio** - Crea tu propia copia del proyecto
2. **Crea una rama** - `git checkout -b feature/nueva-funcionalidad`
3. **Desarrolla tu feature** - Implementa los cambios necesarios
4. **Commit tus cambios** - `git commit -m 'Agregar nueva funcionalidad'`
5. **Push a tu rama** - `git push origin feature/nueva-funcionalidad`
6. **Abre un Pull Request** - Describe los cambios realizados

### 📋 Guías de Contribución
- **Código**: Sigue las convenciones de TypeScript y React
- **Commits**: Usa mensajes descriptivos y claros
- **Testing**: Incluye pruebas para nuevas funcionalidades
- **Documentación**: Actualiza la documentación cuando sea necesario
- **Issues**: Reporta bugs y sugiere mejoras

### 🔍 Áreas de Contribución
- **Frontend**: Mejoras en la interfaz de usuario
- **Backend**: Nuevas APIs y funcionalidades
- **Base de Datos**: Optimizaciones y nuevas consultas
- **Documentación**: Mejoras en la documentación
- **Testing**: Nuevas pruebas y cobertura
- **Performance**: Optimizaciones de rendimiento

## 📝 Notas Importantes

### 🔧 Consideraciones Técnicas
- **No se requiere Python**: Todo el OCR se realiza con Node.js y microservicios
- **Variables de entorno**: Configura `PDF_PROCESSOR_URL` para el OCR de Railway
- **Base de datos**: SQLite en desarrollo, PostgreSQL en producción
- **Autenticación**: Sistema robusto con JWT y verificación 2FA

### 🚀 Despliegue y Producción
- **Despliegue recomendado**: Vercel (frontend) + Railway (OCR) + PostgreSQL
- **Variables de entorno**: Asegúrate de configurar todas las variables necesarias
- **SSL/HTTPS**: Configuración automática en Vercel y Railway
- **Monitoreo**: Implementa alertas y monitoreo de errores

### 🔒 Seguridad
- **Tokens JWT**: Configura un secreto fuerte para JWT
- **2FA**: Implementa autenticación de dos factores para mayor seguridad
- **Validación**: Valida todos los inputs del usuario
- **HTTPS**: Usa siempre conexiones seguras en producción

### 📊 Rendimiento
- **Caching**: Implementa caching para mejorar el rendimiento
- **Optimización**: Optimiza imágenes y recursos estáticos
- **CDN**: Aprovecha el CDN global de Vercel
- **Database**: Optimiza consultas y usa índices apropiados

## 🏆 Créditos

Desarrollado por **I2Cprogramacion** y colaboradores.

---

Para soporte o sugerencias, abre un [issue en GitHub](https://github.com/I2Cprogramacion/SEI/issues).