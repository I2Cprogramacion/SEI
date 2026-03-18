# 📋 CATÁLOGO DE FUNCIONES - PLATAFORMA SEI

**Sistema Estatal de Investigadores (SEI)**  
**Versión**: 1.0  
**Última actualización**: 18 de marzo, 2026

---

## 📑 TABLA DE CONTENIDOS

1. [Autenticación y Acceso](#-autenticación-y-acceso)
2. [Gestión de Perfiles de Investigadores](#-gestión-de-perfiles)
3. [Búsqueda y Exploración](#-búsqueda-y-exploración)
4. [Publicaciones Científicas](#-publicaciones-científicas)
5. [Proyectos de Investigación](#-proyectos-de-investigación)
6. [Conexiones y Redes](#-conexiones-y-redes)
7. [Instituciones](#-instituciones)
8. [Convocatorias](#-convocatorias)
9. [Panel de Control](#-panel-de-control)
10. [Administración del Sistema](#-administración-del-sistema)
11. [APIs Backend](#-apis-backend)
12. [Herramientas Especiales](#-herramientas-especiales)

---

## 🔐 AUTENTICACIÓN Y ACCESO

### Funciones Públicas (sin login)

| Función | Descripción | Acceso |
|---------|-------------|--------|
| **Página Principal** | Inicio de la plataforma con información general | `/` |
| **Exploración de Investigadores** | Ver perfiles públicos de investigadores | `/investigadores` |
| **Búsqueda Global** | Buscar investigadores, proyectos y publicaciones | `/buscar` |
| **Directorio de Convocatorias** | Ver convocatorias abiertas | `/convocatorias` |
| **Información de Instituciones** | Consultar instituciones registradas | `/instituciones` |
| **FAQ** | Preguntas frecuentes y ayuda | `/faq` |
| **Términos de Servicio** | Política de uso de la plataforma | `/terminos` |
| **Política de Privacidad** | Información sobre privacidad de datos | `/privacidad` |
| **Gestión de Cookies** | Configurar preferencias de cookies | `/cookies` |

### Registro de Usuario

| Función | Descripción | Detalles |
|---------|-------------|---------|
| **Registro Completo** | Registro con perfil académico completo | `/registro` - Requiere: Nombre, Email, CURP, RFC, CVU |
| **Registro Simplificado** | Registro rápido solo con datos básicos | `/registro-simple` - Requiere: Email, contraseña |
| **Verificación de Email** | Confirmación de email con código de 6 dígitos | `/verificar-email` - Válido por 24 horas |
| **Recuperación de Contraseña** | Restaurar acceso mediante email | Función Clerk integrada |

### Autenticación

| Función | Descripción | Tecnología |
|---------|-------------|-----------|
| **Login con Email/Contraseña** | Autenticación tradicional | Clerk |
| **Login Social (Google, GitHub)** | Autenticación mediante proveedores OAuth | Clerk |
| **Sesión Persistente** | Mantener sesión durante 12 horas | JWT + Cookies seguras |
| **Cierre de Sesión** | Logout seguro y limpieza de sesión | `/api/usuario/eliminar` |
| **Renovación Automática** | Extensión automática de sesión activa | Clerk |

---

## 👥 GESTIÓN DE PERFILES

### Creación de Perfil

| Función | Descripción | Campo |
|---------|-------------|-------|
| **Información Personal** | Datos básicos del investigador | Nombre completo, Email, Teléfono, Fecha de nacimiento |
| **Identificación Legal** | Documentos de identificación | CURP (18 caracteres), RFC (10-13 caracteres), CVU (SNII) |
| **Ubicación** | Domicilio y ubicación geográfica | Nacionalidad, Estado, Municipio, Entidad federativa |
| **Fotografía de Perfil** | Foto identificadora | Upload a Cloudinary (.jpg, .png, máx 5MB) |

### Información Académica

| Función | Descripción | Detalles |
|---------|-------------|---------|
| **Grado de Estudios** | Nivel máximo de formación | Licenciatura, Maestría, Doctorado, PostDoctorado |
| **Especialidades** | Áreas de especialización | Múltiples selecciones posibles |
| **Disciplina** | Campo disciplinario principal | Ciencias, Ingeniería, Humanidades, etc. |
| **Líneas de Investigación** | Áreas de enfoque | Texto libre, múltiples líneas |

### Información Profesional

| Función | Descripción | Detalles |
|---------|-------------|---------|
| **Institución Actual** | Lugar de trabajo | Selección de BD de instituciones |
| **Puesto/Cargo** | Posición en institución | Profesor, Investigador, etc. |
| **Departamento** | Área dentro de institución | Ingeniería, Medicina, etc. |
| **Sitio Web** | Página personal o institucional | URL válida |

### Nivel Académico y SNII

| Función | Descripción | Valores |
|---------|-------------|--------|
| **Nivel SNI** | Sistema Nacional de Investigadores | Candidato, Nivel 1, Nivel 2, Nivel 3 |
| **Año de Asignación** | Cuándo se asignó el nivel | Campo numérico |
| **Tipo de Perfil** | Clasificación del investigador | Investigador, Tecnólogo, Ambos |

### CV y Documentos

| Función | Descripción | Especificaciones |
|---------|-------------|-----------------|
| **Upload de CV** | Subir perfil académico | PDF, máx 50MB, almacenado en Vercel Blob |
| **OCR Automático** | Extracción de datos desde PDF | Microservicio en Railway |
| **Edición Manual** | Completar datos faltantes del OCR | Formulario interactivo |
| **Historial de Versiones** | Control de cambios del CV | Último upload registrado |

### Experiencia y Producción

| Función | Descripción | Tipo |
|---------|-------------|------|
| **Experiencia Docente** | Años y cursos impartidos | Texto |
| **Experiencia Laboral** | Historial de empleos | Texto |
| **Proyectos de Investigación** | Número de proyectos dirigidos | Numérico |
| **Proyectos de Vinculación** | Proyectos con empresa/sociedad | Numérico |
| **Libros Publicados** | Autores de libros | Numérico |
| **Capítulos de Libros** | Contribuciones a capítulos | Numérico |
| **Artículos Científicos** | Papers publicados | Numérico |
| **Premios y Distinciones** | Reconocimientos recibidos | Texto |
| **Idiomas** | Lenguas que domina | Texto (separadas por comas) |

### Colaboración y Redes

| Función | Descripción | Detalles |
|---------|-------------|---------|
| **Colaboración Nacional** | Proyectos con investigadores México | Texto |
| **Colaboración Internacional** | Investigadores y proyectos externos | Texto |
| **Identificadores Académicos** | Número único en sistemas externos | ORCID, ResearchGate |

### Visualización de Perfil

| Función | Descripción | Acceso |
|---------|-------------|--------|
| **Perfil Público** | Visualización de perfil por otros usuarios | URL pública /investigadores/[id] |
| **Perfil Privado** | Visualización de datos personales propios | Dashboard personal |
| **Edición de Perfil** | Modificar información personal | `/investigadores/nuevo-perfil` |
| **Historial de Cambios** | Ver cuándo se editó el perfil | Timestamps en BD |

---

## 🔍 BÚSQUEDA Y EXPLORACIÓN

### Búsqueda Global

| Función | Descripción | Índices |
|---------|-------------|--------|
| **Búsqueda por Nombre** | Encontrar investigadores por nombre completo | Full text search |
| **Búsqueda por Email** | Localizar usuario por correo | Exact match |
| **Búsqueda por Institución** | Filtrar por lugar de trabajo | Index: institución_id |
| **Búsqueda por Especialidad** | Filtrar por área disciplinaria | Index: disciplina |
| **Búsqueda por Ubicación** | Filtrar por estado/municipio | Index: estado_nacimiento |
| **Búsqueda por Nivel SNI** | Filtrar por rango de nivel académico | Index: nivel_sni |

### Filtros Avanzados

| Filtro | Opciones | Uso |
|--------|----------|-----|
| **Tipo de Perfil** | Investigador, Tecnólogo, Ambos | `/investigadores?tipo=INVESTIGADOR` |
| **Área Disciplinaria** | 50+ disciplinas | `/investigadores?area=Ingenieria` |
| **Institución** | Todas las registradas | `/investigadores?institucion=UV` |
| **Ubicación Geográfica** | Estados y municipios | `/investigadores?estado=Veracruz` |
| **Ordenamiento** | Nombre, Fecha, Relevancia | `sort=nombre\|fecha\|relevancia` |

### Categorización Geográfica

| Función | Descripción | Datos |
|---------|-------------|-------|
| **Estados Disponibles** | 32 estados de México | `/ubicaciones` |
| **Municipios** | División por entidad federativa | Dinamico según estado |
| **Instituciones por Estado** | Agrupación institucional | `/instituciones` |

---

## 📚 PUBLICACIONES CIENTÍFICAS

### Gestión de Publicaciones

| Función | Descripción | Detalles |
|---------|-------------|---------|
| **Crear Publicación** | Registro de nuevo artículo/paper | Título, autores, resumen, DOI |
| **Editar Publicación** | Modificar información | Solo autor o admin |
| **Eliminar Publicación** | Remover de la BD | Solo autor o admin |
| **Ver Detalles** | Información completa | Acceso público |

### Metadatos de Publicación

| Campo | Descripción | Formato |
|-------|-------------|--------|
| **Título** | Nombre del artículo | Texto (máx 500 caracteres) |
| **Autores** | Personas involucradas | Lista de investigadores |
| **Abstract/Resumen** | Descripción breve | Texto (máx 2000 caracteres) |
| **Palabras Clave** | Tags para búsqueda | Múltiples selecciones |
| **DOI** | Identificador único | Formato: 10.xxxx/xxxxx |
| **Año de Publicación** | Cuándo se publicó | Numérico (YYYY) |
| **Revista/Conferencia** | Dónde se publicó | Nombre de publicación |
| **URL/DOI Link** | Enlace al artículo | URL válida |

### Documentos Adjuntos

| Función | Descripción | Formatos |
|---------|-------------|----------|
| **Upload PDF** | Archivo del artículo completo | .pdf (máx 100MB) |
| **Upload ZIP** | Múltiples archivos | .zip (máx 100MB) |
| **Archivos Suplementarios** | Datos, código, figuras | Cualquier formato |

### Búsqueda de Publicaciones

| Búsqueda | Campo | Índice |
|---------|-------|--------|
| **Por Título** | Búsqueda de texto | Full text |
| **Por Autor** | Nombre del investigador | investigador_id |
| **Por DOI** | Identificador único | doi (exact match) |
| **Por Palabra Clave** | Tags y categorías | keywords |
| **Por Año** | Rango temporal | año_publicacion |

---

## 🔬 PROYECTOS DE INVESTIGACIÓN

### Creación de Proyecto

| Función | Descripción | Campos |
|---------|-------------|--------|
| **Nuevo Proyecto** | Registrar proyecto de investigación | Título, descripción, período, financiamiento |
| **Asignar Investigadores** | Agregar colaboradores | Selección de investigadores registrados |
| **Definir Rol** | Responsabilidad en proyecto | Director, Colaborador, Asesor |

### Información del Proyecto

| Campo | Descripción | Tipo |
|-------|-------------|------|
| **Título** | Nombre del proyecto | Texto |
| **Descripción** | Objetivos y metodología | Texto largo |
| **Fecha Inicio** | Cuándo comienza | Fecha |
| **Fecha Fin** | Cuándo termina | Fecha |
| **Estado** | Fase actual | Propuesta, En curso, Completado, Cancelado |
| **Financiamiento** | Presupuesto y fuente | Numérico y texto |
| **Institución Principal** | Responsable | Selección |

### Colaboración en Proyectos

| Función | Descripción | Detalles |
|---------|-------------|---------|
| **Solicitar Colaboración** | Invitar investigador a proyecto | Notificación al investigador |
| **Aceptar Colaboración** | Confirmar participación | Dashboard personal |
| **Abandonar Proyecto** | Retirarse como colaborador | Notificación al director |
| **Ver Equipo** | Listar participantes | Nombres, roles, instituciones |

### Búsqueda de Proyectos

| Búsqueda | Filtro | Detalles |
|---------|--------|---------|
| **Por Título** | Texto | Full text search |
| **Por Investigador** | investigador_id | Proyectos donde participa |
| **Por Estado** | status | En curso, completado, etc. |
| **Por Institución** | institution | Proyectos de institución |
| **Por Fecha** | rango temporal | Proyectos activos en período |

---

## 🤝 CONEXIONES Y REDES

### Red de Colaboradores

| Función | Descripción | Acción |
|---------|-------------|--------|
| **Ver Red Personal** | Gráfico de colaboradores | `/redes` |
| **Conectar con Investigador** | Solicitud de conexión | Notificación |
| **Aceptar Conexión** | Confirmar vínculo | Dashboard |
| **Eliminar Conexión** | Desconectar de investigador | Confirmación |
| **Mensajes Directos** | Chat privado con conexión | Integración de mensajería |

### Mensajería

| Función | Descripción | Detalles |
|---------|-------------|---------|
| **Enviar Mensaje** | Comunicación directa | A investigadores conectados |
| **Bandeja de Entrada** | Recibir mensajes | Dashboard `/dashboard/mensajes` |
| **Historial de Chat** | Conversaciones previas | Persistente en BD |
| **Notificaciones** | Alerta de nuevo mensaje | Email + notificación en plataforma |

### Membresía y Roles

| Rol | Descripción | Permisos |
|-----|-------------|---------|
| **Investigador Regular** | Usuario estándar registrado | Ver perfil, crear proyectos, buscar |
| **Administrador** | Gestor del sistema | Todas las acciones + moderación |
| **Evaluador** | Revisor de publicaciones | Validar contenido, dar feedback |
| **Supervisor Institucional** | Responsable de institución | Gestionar usuarios de institución |

---

## 🏢 INSTITUCIONES

### Directorio de Instituciones

| Función | Descripción | Acceso |
|---------|-------------|--------|
| **Ver Instituciones** | Listado de todas las registradas | Público `/instituciones` |
| **Detalles de Institución** | Información completa | Públicamente disponible |
| **Investigadores por Institución** | Listar investigadores de institución | Filtro y búsqueda |
| **Contacto Institucional** | Información de contacto | Teléfono, email, sitio web |

### Datos de Institución

| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| **Nombre** | Nombre oficial | Universidad Veracruzana |
| **Siglas** | Acrónimo | UV |
| **Tipo** | Clasificación | Pública, Privada, etc. |
| **Ubicación** | Domicilio | Calle, número, ciudad |
| **Email** | Contacto oficial | contacto@institucion.edu.mx |
| **Teléfono** | Número de contacto | Formato: +52 xxx xxxx xxxx |
| **Sitio Web** | Página principal | https://www.institucion.edu.mx |
| **Logo** | Imagen institucional | Vercel Blob storage |

### Búsqueda de Instituciones

| Búsqueda | Campo | Resultado |
|---------|-------|-----------|
| **Por Nombre** | Texto completo | All institutions matching |
| **Por Ubicación** | Estado/Municipio | Instituciones en zona |
| **Por Tipo** | Categoría | Pública/Privada/etc |
| **Destacadas** | Ranking | Top instituciones |

---

## 📢 CONVOCATORIAS

### Gestión de Convocatorias

| Función | Descripción | Permisos |
|---------|-------------|----------|
| **Crear Convocatoria** | Registrar nueva oportunidad | Admin, Supervisor institucional |
| **Editar Convocatoria** | Modificar información | Creador, Admin |
| **Publicar Convocatoria** | Hacer visible públicamente | Admin |
| **Cerrar Convocatoria** | Finalizar recepción de solicitudes | Admin |
| **Ver Convocatorias** | Listado de oportunidades | Público |

### Información de Convocatoria

| Campo | Descripción | Tipo |
|-------|-------------|------|
| **Título** | Nombre de convocatoria | Texto |
| **Descripción** | Detalles y requisitos | Texto largo |
| **Tipo** | Beca, Financiamiento, Premio | Selección |
| **Institución Oferente** | Quién ofrece | Referencia a institución |
| **Fecha Apertura** | Cuándo comienza | Fecha |
| **Fecha Cierre** | Plazo final | Fecha |
| **Presupuesto** | Cantidad disponible | Numérico |
| **Beneficiarios Potenciales** | A quiénes va dirigida | Texto (criterios) |
| **Requisitos** | Qué se necesita | Lista de requisitos |
| **Enlace Externo** | URL para más información | Link a convocatoria oficial |

### Participación en Convocatorias

| Función | Descripción | Acción |
|---------|-------------|--------|
| **Aplicar a Convocatoria** | Enviar solicitud de participación | Botón "Aplicar" |
| **Ver Solicitantes** | Listar participantes | Admin |
| **Seleccionar Ganador** | Designar beneficiario | Admin |
| **Notificar Resultado** | Informar al solicitante | Email automático |

---

## 📊 PANEL DE CONTROL

### Dashboard Principal

| Componente | Descripción | Datos |
|------------|-------------|-------|
| **Mi Perfil** | Resumen de información personal | Nombre, institución, nivel |
| **Publicaciones Recientes** | Últimos artículos publicados | Título, fecha, acciones |
| **Proyectos Activos** | Proyectos en curso | Nombre, equipo, fechas |
| **Conexiones** | Red de colaboradores | Count + últimas conexiones |
| **Mensajes Nuevos** | Comunicaciones sin leer | Count + preview |
| **Estadísticas Personales** | Métricas del investigador | Publicaciones, proyectos, h-index |

### Gestión Personal

| Función | Descripción | Acceso |
|---------|-------------|--------|
| **Editar Perfil** | Modificar información personal | `/dashboard/editar-perfil` |
| **Subir Fotografía** | Cambiar imagen de perfil | Upload Cloudinary |
| **Subir CV** | Actualizar currículo | Upload Vercel Blob |
| **Gestionar Publicaciones** | Ver y editar artículos | `/dashboard/publicaciones` |
| **Gestionar Proyectos** | Ver y editar proyectos | `/dashboard/proyectos` |
| **Ver Conexiones** | Listar colaboradores | `/dashboard/conexiones` |
| **Leer Mensajes** | Bandeja de entrada | `/dashboard/mensajes` |
| **Configuración de Cuenta** | Preferencias y privacidad | `/dashboard/configuracion` |

### Estadísticas

| Métrica | Descripción | Cálculo |
|--------|-------------|--------|
| **H-Index** | Índice de productividad | Publicaciones y citas |
| **Total Publicaciones** | Cantidad de artículos | Count from publicaciones |
| **Proyectos Completados** | Proyectos finalizados | Count where estado='completado' |
| **Colaboradores Únicos** | Investigadores conectados | Count distinct collaborators |
| **Instituciones Asociadas** | Lugares donde ha trabajado | Count distinct instituciones |

---

## ⚙️ ADMINISTRACIÓN DEL SISTEMA

### Panel Administrativo

| Sección | Descripción | Acceso |
|---------|-------------|--------|
| **Dashboard Admin** | Estadísticas del sistema | `/admin` (solo admin) |
| **Gestión de Usuarios** | CRUD de investigadores | `/admin/usuarios` |
| **Gestión de Instituciones** | ABM de instituciones | `/admin/instituciones` |
| **Gestión de Convocatorias** | Crear y editar convocatorias | `/admin/convocatorias` |
| **Moderación** | Revisar contenido | `/admin/moderacion` |
| **Logs de Auditoría** | Historial de acciones | `/admin/auditoria` |
| **Reportes** | Análisis del sistema | `/admin/reportes` |

### Estadísticas Globales

| Métrica | Descripción | Dashboard |
|--------|-------------|-----------|
| **Total Usuarios** | Investigadores registrados | Count from investigadores |
| **Usuarios Activos** | Con sesión en últimos 30 días | Query con fecha |
| **Total Publicaciones** | Artículos en sistema | Count from publicaciones |
| **Total Proyectos** | Proyectos registrados | Count from proyectos |
| **Instituciones Activas** | Con investigadores asignados | Count con join |
| **Uso de la Plataforma** | Porcentaje de adopción | Total usuarios / meta |

### Gestión de Usuarios

| Función | Descripción | Permisos |
|---------|-------------|----------|
| **Ver Detalles de Usuario** | Información completa | Admin |
| **Editar Usuario** | Modificar datos | Admin |
| **Asignar Rol** | Cambiar permiso | Admin |
| **Suspender Usuario** | Bloquear acceso temporal | Admin |
| **Eliminar Usuario** | Remover permanentemente | Admin con confirmación |
| **Verificar Email** | Marcar como verificado | Admin |
| **Resetear Contraseña** | Enviar enlace de reset | Admin |

### Gestión de Contenido

| Función | Descripción | Acción |
|---------|-------------|--------|
| **Validar Publicación** | Revisar artículo | Aprobar/Rechazar |
| **Moderar Comentarios** | Revisar conversaciones | Ocultar/Eliminar |
| **Eliminar Contenido Inapropiado** | Remover por violación | Log de acción |
| **Suspender Publicación** | Ocultar temporalmente | Notificación al autor |

### Configuración del Sistema

| Parámetro | Descripción | Tipo |
|-----------|-------------|------|
| **Modo Mantenimiento** | Poner plataforma en mantenimiento | Boolean |
| **Límite de Upload** | Tamaño máximo de archivos | Numérico (MB) |
| **Autenticación Requerida** | Forzar login para acceder | Boolean |
| **Duración de Sesión** | Tiempo máximo de sesión | Numérico (minutos) |
| **Email de Notificaciones** | Remitente automático | Email |
| **Política de Privacidad** | Texto personalizado | Texto largo |

---

## 🔌 APIs BACKEND

### Endpoints de Autenticación

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/usuario/eliminar` | Eliminar cuenta de usuario | Requerido |
| GET | `/api/protected/user` | Obtener datos del usuario autenticado | Requerido |

### Endpoints de Investigadores

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/investigadores` | Listar investigadores | No |
| GET | `/api/investigadores/[id]` | Obtener detalles | No |
| POST | `/api/investigadores` | Crear nuevo investigador | Requerido |
| PUT | `/api/investigadores/[id]` | Actualizar investigador | Requerido |
| DELETE | `/api/investigadores/[id]` | Eliminar investigador | Admin |
| GET | `/api/investigadores/featured` | Listar investigadores destacados | No |

### Endpoints de Publicaciones

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/publicaciones` | Listar publicaciones | No |
| GET | `/api/publicaciones/[id]` | Obtener detalles | No |
| POST | `/api/publicaciones` | Crear publicación | Requerido |
| PUT | `/api/publicaciones/[id]` | Actualizar | Requerido |
| DELETE | `/api/publicaciones/[id]` | Eliminar | Requerido |

### Endpoints de Proyectos

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/proyectos` | Listar proyectos | No |
| GET | `/api/proyectos/[id]` | Obtener detalles | No |
| POST | `/api/proyectos` | Crear proyecto | Requerido |
| PUT | `/api/proyectos/[id]` | Actualizar | Requerido |
| DELETE | `/api/proyectos/[id]` | Eliminar | Admin |
| GET | `/api/proyectos/recent` | Últimos proyectos | No |

### Endpoints de Búsqueda

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/search` | Búsqueda global | No |
| GET | `/api/buscar-investigador-por-nombre` | Autocompletado de nombres | No |
| GET | `/api/areas-populares` | Áreas más buscadas | No |

### Endpoints de Instituciones

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/instituciones` | Listar instituciones | No |
| GET | `/api/instituciones/[id]` | Obtener detalles | No |
| POST | `/api/instituciones` | Crear institución | Admin |
| PUT | `/api/instituciones/[id]` | Actualizar | Admin |
| GET | `/api/instituciones-destacadas` | Instituciones principales | No |

### Endpoints de Convocatorias

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/convocatorias` | Listar convocatorias | No |
| GET | `/api/convocatorias/[id]` | Obtener detalles | No |
| POST | `/api/convocatorias` | Crear convocatoria | Admin |
| PUT | `/api/convocatorias/[id]` | Actualizar | Admin |

### Endpoints de Registro

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/registro` | Registrar nuevo investigador | Requerido (Clerk) |
| POST | `/api/registro-directo` | Registro simplificado | No |
| POST | `/api/completar-registro` | Completar datos tras verificación | Requerido |

### Endpoints de Subida de Archivos

| Método | Endpoint | Descripción | Max |
|--------|----------|-------------|-----|
| POST | `/api/upload-cv-vercel` | Upload de CV a Vercel Blob | 50MB |
| POST | `/api/upload-fotografia` | Upload de foto a Cloudinary | 5MB |
| POST | `/api/upload-cv-local` | Upload local (desarrollo) | - |

### Endpoints de OCR

| Método | Endpoint | Descripción | Servicio |
|--------|----------|-------------|----------|
| POST | `/api/ocr` | Procesar PDF y extraer datos | Railway microservicio |

### Endpoints Administrativos

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/admin/verificar-acceso` | Validar permisos admin | Admin |
| GET | `/api/admin/estadisticas` | Estadísticas del sistema | Admin |
| GET | `/api/dashboard` | Dashboard del admin | Admin |

### Endpoints de CRON

| Método | Endpoint | Descripción | Frecuencia |
|--------|----------|-------------|-----------|
| POST | `/api/cron/limpieza` | Limpiar registros antiguos | Diaria |
| POST | `/api/cron/notificaciones` | Enviar notificaciones pendientes | Cada hora |

---

## 🛠️ HERRAMIENTAS ESPECIALES

### OCR (Reconocimiento Óptico de Caracteres)

| Función | Descripción | Tecnología |
|---------|-------------|-----------|
| **Extracción de CURP** | Detectar CURP en PDF | Tesseract OCR + ML |
| **Extracción de RFC** | Identificar RFC en documento | Tesseract OCR |
| **Extracción de Nombre** | Obtener nombre completo | NLP |
| **Extracción de Email** | Detectar correo electrónico | Regex + OCR |
| **Extracción de Teléfono** | Identificar número de contacto | Regex + OCR |
| **Validación de Datos** | Verificar formato de extraído | Zod schemas |

### Microservicios

| Servicio | Ubicación | Función |
|----------|-----------|---------|
| **OCR Service** | Railway | Procesar PDFs y extraer texto |
| **Email Service** | Sendgrid/Built-in | Enviar correos de verificación |
| **Storage Service** | Vercel Blob | Almacenar CVs y fotos |
| **Image Service** | Cloudinary | Redimensionar y optimizar imágenes |

### Integraciones Externas

| Servicio | Función | Uso |
|----------|---------|-----|
| **Clerk** | Autenticación | Login, registro, gestión de usuarios |
| **Cloudinary** | Almacenamiento de imágenes | Fotos de perfil, logos |
| **Vercel Blob** | Almacenamiento de documentos | CVs, archivos PDF |
| **PostgreSQL (Neon)** | Base de datos | Persistencia de datos |
| **Sendgrid** | Email transaccional | Verificación, notificaciones |
| **Railway** | Hosting microservicios | OCR processing |

---

## 📱 CARACTERÍSTICAS ESPECIALES

### Responsividad

| Dispositivo | Soporte | Características |
|-------------|--------|-----------------|
| **Desktop** | ✅ Full | Todas las funciones |
| **Tablet** | ✅ Optimizado | Interfaz adaptada |
| **Móvil** | ✅ Responsive | Touch-friendly |

### Accesibilidad

| Aspecto | Implementación |
|--------|-----------------|
| **Contraste** | WCAG AA compliant |
| **Navegación Teclado** | Totalmente soportada |
| **Lectores de Pantalla** | ARIA labels implementadas |
| **Tamaño Texto** | Zoom soportado |

### Seguridad

| Medida | Descripción |
|--------|-------------|
| **HTTPS** | Obligatorio en Vercel |
| **CORS** | Configurado por dominio |
| **Rate Limiting** | Protección contra DDoS |
| **SQL Injection** | Prevenido con Prisma ORM |
| **XSS** | Sanitización de inputs |
| **CSRF** | Tokens de sesión seguros |

---

## 🎯 CASOS DE USO PRINCIPALES

### Para Investigadores

1. ✅ Crear y mantener perfil académico completo
2. ✅ Subir y gestionar CV automáticamente con OCR
3. ✅ Registrar publicaciones científicas
4. ✅ Colaborar en proyectos de investigación
5. ✅ Conectarse con otros investigadores
6. ✅ Buscar convocatorias y oportunidades
7. ✅ Comunicarse vía mensajes privados
8. ✅ Visualizar su red de colaboradores

### Para Instituciones

1. ✅ Registrar y mantener directorio de investigadores
2. ✅ Publicar convocatorias y oportunidades
3. ✅ Acceder a estadísticas de investigación
4. ✅ Identificar investigadores por área
5. ✅ Gestionar membresía institucional

### Para Administradores

1. ✅ Gestionar usuarios y permisos
2. ✅ Moderar contenido
3. ✅ Visualizar estadísticas del sistema
4. ✅ Configurar parámetros generales
5. ✅ Revisar logs de auditoría
6. ✅ Generar reportes

---

## 📞 SOPORTE Y CONTACTO

| Función | Acceso |
|---------|--------|
| **FAQ** | `/faq` |
| **Contacto** | Formulario en footer |
| **Términos de Servicio** | `/terminos` |
| **Política de Privacidad** | `/privacidad` |
| **Reporte de Seguridad** | `security@sei-chih.com.mx` |

---

## 📊 ESTADÍSTICAS DE LA PLATAFORMA

| Métrica | Valor |
|--------|-------|
| **Páginas Funcionales** | 30+ |
| **Endpoints API** | 50+ |
| **Campos en BD** | 200+ |
| **Usuarios Potenciales** | Miles de investigadores |
| **Instituciones** | 100+ |
| **Convocatorias** | Dinámicas |
| **Documentos** | Sin límite (cloud storage) |

---

**Documento generado**: 18 de marzo, 2026  
**Versión**: 1.0  
**Próxima actualización**: A medida que se agrieguen funciones

