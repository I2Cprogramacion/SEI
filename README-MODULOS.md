# 📚 Documentación de Módulos - Researcher Platform

## 🏗️ Arquitectura General

La aplicación está construida con **Next.js 14** usando el App Router, **TypeScript**, **TailwindCSS** y **shadcn/ui** para los componentes.

## 📁 Estructura de Directorios

```
app/
├── api/                    # Endpoints de API
├── admin/                  # Panel de administración
├── investigadores/         # Gestión de investigadores
├── proyectos/              # Gestión de proyectos
├── publicaciones/          # Gestión de publicaciones
├── instituciones/          # Gestión de instituciones
├── buscar/                 # Búsqueda global
├── explorar/               # Exploración de contenido
├── dashboard/              # Panel de usuario
└── [páginas públicas]/    # Páginas de información

components/
├── ui/                     # Componentes base (shadcn/ui)
├── [componentes específicos] # Componentes de la aplicación
└── [modales y diálogos]    # Componentes interactivos
```

## 🔧 Módulos Principales

### 1. 🧑‍🔬 Módulo de Investigadores

**Ubicación:** `app/investigadores/`

**Funcionalidades:**
- Listado de investigadores registrados
- Perfiles individuales con información completa
- Búsqueda y filtrado por área, institución, etc.
- Gestión de perfiles incompletos
- Registro de nuevos investigadores

**Componentes clave:**
- `page.tsx` - Listado principal
- `[slug]/page.tsx` - Perfil individual
- `nuevo-perfil/page.tsx` - Formulario de registro
- `incompletos/page.tsx` - Gestión de perfiles incompletos

**APIs relacionadas:**
- `GET /api/investigadores` - Obtener lista de investigadores
- `GET /api/investigadores/[id]` - Obtener investigador específico
- `GET /api/investigadores/search` - Búsqueda de investigadores
- `GET /api/investigadores/incompletos` - Investigadores con perfiles incompletos

### 2. 📊 Módulo de Proyectos

**Ubicación:** `app/proyectos/`

**Funcionalidades:**
- Listado de proyectos de investigación
- Detalles de proyectos individuales
- Búsqueda por título, descripción, palabras clave
- Filtrado por categoría, estado, área
- Creación de nuevos proyectos

**Componentes clave:**
- `page.tsx` - Listado principal
- `[slug]/page.tsx` - Detalle del proyecto
- `nuevo/page.tsx` - Formulario de creación

**APIs relacionadas:**
- `GET /api/proyectos` - Obtener lista de proyectos
- `GET /api/proyectos/recent` - Proyectos recientes

### 3. 📚 Módulo de Publicaciones

**Ubicación:** `app/publicaciones/`

**Funcionalidades:**
- Listado de publicaciones científicas
- Gestión de publicaciones (solo admin)
- Subida de nuevas publicaciones
- Búsqueda por título, autores, DOI
- Gestión de DOI automático

**Componentes clave:**
- `page.tsx` - Listado principal con gestión
- `nueva/page.tsx` - Formulario de nueva publicación

**APIs relacionadas:**
- `GET /api/publicaciones` - Obtener lista de publicaciones
- `POST /api/publicaciones` - Crear nueva publicación

**Características especiales:**
- Búsqueda de autores desde base de datos
- Generación automática de DOI
- Validación de archivos PDF/ZIP
- Gestión de archivos adjuntos

### 4. 🏛️ Módulo de Instituciones

**Ubicación:** `app/instituciones/`

**Funcionalidades:**
- Listado de instituciones registradas
- Información detallada de cada institución
- Registro de nuevas instituciones

**Componentes clave:**
- `page.tsx` - Listado principal
- `nueva/page.tsx` - Formulario de nueva institución

**APIs relacionadas:**
- `GET /api/instituciones` - Obtener lista de instituciones

### 5. 🔍 Módulo de Búsqueda

**Ubicación:** `app/buscar/`

**Funcionalidades:**
- Búsqueda global en toda la plataforma
- Filtrado por tipo de contenido
- Resultados organizados por categorías
- Búsqueda en tiempo real

**Componentes clave:**
- `page.tsx` - Página de resultados
- `components/search-bar.tsx` - Barra de búsqueda principal

**APIs relacionadas:**
- `GET /api/search` - Búsqueda global

### 6. 👑 Módulo de Administración

**Ubicación:** `app/admin/`

**Funcionalidades:**
- Panel de control para administradores
- Gestión de usuarios e investigadores
- Estadísticas de la plataforma
- Configuración del sistema

**Componentes clave:**
- `layout.tsx` - Layout del panel admin
- `page.tsx` - Dashboard principal
- `investigadores/page.tsx` - Gestión de investigadores
- `proyectos/page.tsx` - Gestión de proyectos
- `publicaciones/page.tsx` - Gestión de publicaciones
- `instituciones/page.tsx` - Gestión de instituciones
- `estadisticas/page.tsx` - Estadísticas del sistema

**Características especiales:**
- Acceso restringido a administradores
- Sidebar de navegación específico
- Funciones de gestión avanzada

## 🧩 Componentes Reutilizables

### Componentes de UI Base
**Ubicación:** `components/ui/`

Componentes de shadcn/ui que proporcionan la base visual:
- `button.tsx` - Botones
- `input.tsx` - Campos de entrada
- `card.tsx` - Tarjetas
- `table.tsx` - Tablas
- `dialog.tsx` - Modales
- `badge.tsx` - Etiquetas
- `avatar.tsx` - Avatares
- Y muchos más...

### Componentes Específicos

**`components/investigador-search.tsx`**
- Búsqueda y selección de investigadores
- Autocompletado con debounce
- Selección múltiple
- Integración con base de datos

**`components/search-bar.tsx`**
- Barra de búsqueda principal
- Filtros por tipo de contenido
- Navegación a resultados

**`components/admin-sidebar.tsx`**
- Navegación del panel de administración
- Enlaces a secciones de gestión
- Indicadores de estado

**`components/featured-researchers.tsx`**
- Listado de investigadores destacados
- Tarjetas con información resumida
- Enlaces a perfiles completos

## 🔌 APIs y Endpoints

### Autenticación
- `POST /api/auth/login` - Inicio de sesión
- `POST /api/auth/logout` - Cerrar sesión
- `POST /api/auth/registro-simple` - Registro simple
- `POST /api/auth/verify-2fa` - Verificación 2FA
- `GET /api/auth/verify-token` - Verificar token

### Gestión de Datos
- `GET /api/investigadores` - Lista de investigadores
- `GET /api/investigadores/search` - Búsqueda de investigadores
- `GET /api/proyectos` - Lista de proyectos
- `GET /api/publicaciones` - Lista de publicaciones
- `GET /api/instituciones` - Lista de instituciones
- `GET /api/search` - Búsqueda global

### Utilidades
- `POST /api/upload` - Subida de archivos
- `POST /api/ocr` - Procesamiento OCR
- `GET /api/membership` - Información de membresía

## 🗄️ Base de Datos

### Configuración
- **Desarrollo:** SQLite (`database.db`)
- **Producción:** PostgreSQL (Vercel Postgres)

### Tablas Principales
- `investigadores` - Información de investigadores
- `publicaciones` - Publicaciones científicas
- `usuarios` - Usuarios del sistema (PostgreSQL)

### Interfaces
- `DatabaseInterface` - Interfaz común para diferentes bases de datos
- `SQLiteDatabase` - Implementación para SQLite
- `PostgreSQLDatabase` - Implementación para PostgreSQL

## 🎨 Estilos y Temas

### TailwindCSS
- Configuración personalizada en `tailwind.config.ts`
- Colores del tema en `app/globals.css`
- Componentes responsivos

### Tema Oscuro/Claro
- `components/theme-provider.tsx` - Proveedor de tema
- `components/mode-toggle.tsx` - Toggle de modo
- Soporte completo para ambos temas

## 🔒 Seguridad y Autenticación

### Middleware
- `middleware.ts` - Verificación de rutas protegidas
- Validación de tokens JWT
- Redirección automática

### Roles y Permisos
- **Usuario normal:** Acceso a contenido público
- **Investigador:** Gestión de su propio perfil
- **Administrador:** Acceso completo al panel admin

## 📱 Responsive Design

- Diseño mobile-first
- Breakpoints de TailwindCSS
- Componentes adaptativos
- Navegación optimizada para móviles

## 🚀 Despliegue

### Variables de Entorno
- `NEXT_PUBLIC_ADMIN_EMAIL` - Email del administrador
- `JWT_SECRET` - Secreto para tokens JWT
- `POSTGRES_*` - Configuración de PostgreSQL

### Scripts de Utilidad
- `scripts/check-*.js` - Verificación de datos
- `scripts/create-*.js` - Creación de usuarios
- `scripts/test-*.js` - Pruebas de funcionalidad

## 📋 Próximas Mejoras

- [ ] Sistema de notificaciones
- [ ] Chat entre investigadores
- [ ] Sistema de colaboraciones
- [ ] Exportación de datos
- [ ] API REST completa
- [ ] Documentación automática
- [ ] Tests automatizados

---

**Última actualización:** Octubre 2024  
**Versión:** 1.0.0  
**Desarrollado con:** Next.js 14, TypeScript, TailwindCSS, shadcn/ui
