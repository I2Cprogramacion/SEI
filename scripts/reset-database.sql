-- SCRIPT COMPLETO PARA RESETEAR LA BASE DE DATOS NEON
-- Sistema Estatal de Investigadores (SEI)
-- Ejecutar en: Neon Console (https://console.neon.tech)

-- PASO 1: ELIMINAR TODAS LAS TABLAS EXISTENTES
-- Primero eliminar las tablas que existen actualmente en Neon
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS convocatorias CASCADE;
DROP TABLE IF EXISTS institutions CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS _prisma_migrations CASCADE;

-- Luego eliminar cualquier otra tabla que pueda existir (por si acaso)
DROP TABLE IF EXISTS notificaciones_convocatoria CASCADE;
DROP TABLE IF EXISTS ciclos_convocatoria CASCADE;
DROP TABLE IF EXISTS evaluaciones_postulacion CASCADE;
DROP TABLE IF EXISTS postulaciones CASCADE;
DROP TABLE IF EXISTS plantillas_certificado CASCADE;
DROP TABLE IF EXISTS verificaciones_certificado CASCADE;
DROP TABLE IF EXISTS certificados CASCADE;
DROP TABLE IF EXISTS metricas_investigador CASCADE;
DROP TABLE IF EXISTS evaluaciones CASCADE;
DROP TABLE IF EXISTS niveles_tecnologo CASCADE;
DROP TABLE IF EXISTS niveles_investigador CASCADE;
DROP TABLE IF EXISTS investigadores CASCADE;

-- PASO 2: CREAR TABLAS BASE

-- Tabla: roles
CREATE TABLE roles (
    id VARCHAR(30) PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: users
CREATE TABLE users (
    id VARCHAR(30) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    "roleId" VARCHAR(30) NOT NULL REFERENCES roles(id),
    "lastActive" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: institutions
CREATE TABLE institutions (
    id VARCHAR(30) PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    tipo VARCHAR(100),
    ubicacion VARCHAR(255),
    "sitioWeb" VARCHAR(500),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: niveles_investigador
CREATE TABLE niveles_investigador (
    id VARCHAR(30) PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL,
    puntaje_minimo INTEGER NOT NULL,
    puntaje_maximo INTEGER NOT NULL,
    color VARCHAR(50) NOT NULL,
    icono VARCHAR(100),
    orden INTEGER NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    requisitos JSONB,
    beneficios JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: niveles_tecnologo
CREATE TABLE niveles_tecnologo (
    id VARCHAR(30) PRIMARY KEY,
    codigo VARCHAR(10) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL
);

-- Tabla: investigadores (Profile en Prisma)
CREATE TABLE investigadores (
    id VARCHAR(30) PRIMARY KEY,
    user_id VARCHAR(30) UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    clerk_user_id VARCHAR(255) UNIQUE,
    slug VARCHAR(255) UNIQUE,
    nombre_completo VARCHAR(255) NOT NULL,
    nombres VARCHAR(255),
    apellidos VARCHAR(255),
    curp VARCHAR(18) UNIQUE,
    rfc VARCHAR(13),
    no_cvu VARCHAR(50),
    correo VARCHAR(255),
    telefono VARCHAR(20),
    fotografia_url TEXT,
    nacionalidad VARCHAR(100) DEFAULT 'Mexicana',
    fecha_nacimiento DATE,
    genero VARCHAR(50),
    municipio VARCHAR(100),
    estado_nacimiento VARCHAR(100),
    entidad_federativa VARCHAR(100),
    institucion_id VARCHAR(30) REFERENCES institutions(id),
    institucion VARCHAR(255),
    departamento VARCHAR(255),
    ubicacion VARCHAR(255),
    sitio_web TEXT,
    origen VARCHAR(100),
    archivo_procesado TEXT,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    es_admin BOOLEAN DEFAULT FALSE,
    activo BOOLEAN DEFAULT TRUE,
    ultimo_grado_estudios VARCHAR(255),
    grado_maximo_estudios VARCHAR(255),
    empleo_actual VARCHAR(255),
    linea_investigacion TEXT,
    area_investigacion VARCHAR(255),
    disciplina VARCHAR(255),
    especialidad VARCHAR(255),
    orcid VARCHAR(100),
    nivel VARCHAR(100),
    nivel_investigador VARCHAR(100),
    nivel_actual_id VARCHAR(30) REFERENCES niveles_investigador(id),
    fecha_asignacion_nivel TIMESTAMP,
    puntaje_total INTEGER DEFAULT 0,
    estado_evaluacion VARCHAR(50) DEFAULT 'PENDIENTE',
    articulos TEXT,
    libros TEXT,
    capitulos_libros TEXT,
    proyectos_investigacion TEXT,
    proyectos_vinculacion TEXT,
    experiencia_docente TEXT,
    experiencia_laboral TEXT,
    premios_distinciones TEXT,
    idiomas TEXT,
    colaboracion_internacional TEXT,
    colaboracion_nacional TEXT,
    sni VARCHAR(50),
    anio_sni INTEGER,
    cv_url TEXT,
    tipo_perfil VARCHAR(50) DEFAULT 'INVESTIGADOR',
    nivel_tecnologo_id VARCHAR(30) REFERENCES niveles_tecnologo(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: evaluaciones
CREATE TABLE evaluaciones (
    id VARCHAR(30) PRIMARY KEY,
    investigador_id VARCHAR(30) NOT NULL REFERENCES investigadores(id),
    evaluador_id VARCHAR(255) NOT NULL,
    evaluador_nombre VARCHAR(255) NOT NULL,
    nivel_propuesto_id VARCHAR(30) NOT NULL REFERENCES niveles_investigador(id),
    ciclo VARCHAR(50) NOT NULL,
    puntaje_publicaciones INTEGER DEFAULT 0,
    puntaje_proyectos INTEGER DEFAULT 0,
    puntaje_formacion INTEGER DEFAULT 0,
    puntaje_experiencia INTEGER DEFAULT 0,
    puntaje_impacto INTEGER DEFAULT 0,
    puntaje_total INTEGER DEFAULT 0,
    detalle_publicaciones JSONB,
    detalle_proyectos JSONB,
    detalle_formacion JSONB,
    detalle_experiencia JSONB,
    detalle_impacto JSONB,
    observaciones TEXT,
    fortalezas TEXT,
    areas_mejora TEXT,
    documentos_soporte JSONB,
    estado VARCHAR(50) DEFAULT 'EN_REVISION',
    aprobado_por VARCHAR(255),
    fecha_aprobacion TIMESTAMP,
    fecha_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_finalizacion TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: metricas_investigador
CREATE TABLE metricas_investigador (
    id VARCHAR(30) PRIMARY KEY,
    investigador_id VARCHAR(30) UNIQUE NOT NULL REFERENCES investigadores(id),
    publicaciones INTEGER DEFAULT 0,
    articulos INTEGER DEFAULT 0,
    libros INTEGER DEFAULT 0,
    capitulos_libro INTEGER DEFAULT 0,
    ponencias INTEGER DEFAULT 0,
    patentes INTEGER DEFAULT 0,
    proyectos INTEGER DEFAULT 0,
    tesis_dirigidas INTEGER DEFAULT 0,
    premios INTEGER DEFAULT 0,
    estancias INTEGER DEFAULT 0,
    colaboraciones INTEGER DEFAULT 0,
    evaluaciones_recibidas INTEGER DEFAULT 0,
    evaluaciones_realizadas INTEGER DEFAULT 0,
    indice_h FLOAT,
    indice_g FLOAT,
    citas_totales INTEGER DEFAULT 0,
    impacto_social TEXT,
    fecha_ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: certificados
CREATE TABLE certificados (
    id VARCHAR(30) PRIMARY KEY,
    folio VARCHAR(50) UNIQUE NOT NULL,
    investigador_id VARCHAR(30) NOT NULL REFERENCES investigadores(id),
    nivel_id VARCHAR(30),
    nombre_completo VARCHAR(255) NOT NULL,
    curp VARCHAR(18) NOT NULL,
    nivel VARCHAR(100) NOT NULL,
    nivel_descripcion TEXT,
    fecha_emision TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_vigencia_inicio TIMESTAMP NOT NULL,
    fecha_vigencia_fin TIMESTAMP NOT NULL,
    pdf_url TEXT,
    qr_code_url TEXT,
    codigo_verificacion VARCHAR(100) UNIQUE NOT NULL,
    verificado BOOLEAN DEFAULT FALSE,
    veces_verificado INTEGER DEFAULT 0,
    ultima_verificacion TIMESTAMP,
    estado VARCHAR(50) DEFAULT 'ACTIVO',
    motivo_revocacion TEXT,
    fecha_revocacion TIMESTAMP,
    revocado_por VARCHAR(255),
    firmado_por VARCHAR(255),
    cargo_firmante VARCHAR(255),
    firma_digital TEXT,
    plantilla_usada VARCHAR(100),
    metadata_adicional JSONB,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_certificados_investigador ON certificados(investigador_id);
CREATE INDEX idx_certificados_folio ON certificados(folio);
CREATE INDEX idx_certificados_estado ON certificados(estado);
CREATE INDEX idx_certificados_codigo ON certificados(codigo_verificacion);

-- Tabla: verificaciones_certificado
CREATE TABLE verificaciones_certificado (
    id VARCHAR(30) PRIMARY KEY,
    certificado_id VARCHAR(30) NOT NULL REFERENCES certificados(id),
    folio VARCHAR(50) NOT NULL,
    ip_address VARCHAR(50),
    user_agent TEXT,
    pais VARCHAR(100),
    ciudad VARCHAR(100),
    exitosa BOOLEAN DEFAULT TRUE,
    motivo_fallo TEXT,
    fecha_verificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_verificaciones_certificado ON verificaciones_certificado(certificado_id);
CREATE INDEX idx_verificaciones_fecha ON verificaciones_certificado(fecha_verificacion);

-- Tabla: plantillas_certificado
CREATE TABLE plantillas_certificado (
    id VARCHAR(30) PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    html_template TEXT NOT NULL,
    css_styles TEXT,
    variables JSONB,
    orientacion VARCHAR(20) DEFAULT 'portrait',
    tamano VARCHAR(20) DEFAULT 'letter',
    margenes JSONB,
    activa BOOLEAN DEFAULT FALSE,
    version INTEGER DEFAULT 1,
    creada_por VARCHAR(255),
    ultima_edicion VARCHAR(255),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: convocatorias
CREATE TABLE convocatorias (
    id VARCHAR(30) PRIMARY KEY,
    folio VARCHAR(50) UNIQUE,
    titulo VARCHAR(500) NOT NULL,
    descripcion TEXT,
    objetivos TEXT,
    alcance TEXT,
    organizacion VARCHAR(255),
    dependencia VARCHAR(255),
    contacto VARCHAR(255),
    email VARCHAR(255),
    telefono VARCHAR(50),
    "sitioWeb" TEXT,
    categoria VARCHAR(100),
    tipo VARCHAR(100),
    modalidad VARCHAR(100),
    fecha_publicacion TIMESTAMP,
    fecha_apertura_conv TIMESTAMP,
    "fechaInicio" TIMESTAMP NOT NULL,
    fecha_cierre_conv TIMESTAMP,
    "fechaCierre" TIMESTAMP NOT NULL,
    fecha_evaluacion TIMESTAMP,
    fecha_resultados TIMESTAMP,
    fecha_inicio_proyecto TIMESTAMP,
    fecha_fin_proyecto TIMESTAMP,
    presupuesto_total FLOAT,
    monto_minimo FLOAT,
    "montoMaximo" VARCHAR(100),
    numero_plazas INTEGER,
    plazas_disponibles INTEGER,
    nivel_minimo VARCHAR(100),
    nivel_maximo VARCHAR(100),
    areas_elegibles JSONB,
    instituciones_elegibles JSONB,
    edad_minima INTEGER,
    edad_maxima INTEGER,
    requisitos JSONB,
    documentos_requeridos JSONB,
    restricciones JSONB,
    criterios_evaluacion JSONB,
    puntaje_minimo FLOAT,
    bases_pdf TEXT,
    "pdfUrl" TEXT,
    formatos_pdf TEXT,
    ejemplos_pdf TEXT,
    estado VARCHAR(50) DEFAULT 'BORRADOR',
    permite_postulacion BOOLEAN DEFAULT TRUE,
    requiere_evaluacion BOOLEAN DEFAULT TRUE,
    es_publica BOOLEAN DEFAULT TRUE,
    permite_edicion_postulacion BOOLEAN DEFAULT TRUE,
    requiere_carta_postulacion BOOLEAN DEFAULT TRUE,
    notificar_apertura BOOLEAN DEFAULT TRUE,
    notificar_cierre BOOLEAN DEFAULT TRUE,
    notificar_resultados BOOLEAN DEFAULT TRUE,
    dias_antes_notificacion INTEGER DEFAULT 3,
    creada_por VARCHAR(255),
    modificada_por VARCHAR(255),
    ciclo_id VARCHAR(30),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_convocatorias_estado ON convocatorias(estado);
CREATE INDEX idx_convocatorias_cierre ON convocatorias("fechaCierre");
CREATE INDEX idx_convocatorias_categoria ON convocatorias(categoria);

-- Tabla: postulaciones
CREATE TABLE postulaciones (
    id VARCHAR(30) PRIMARY KEY,
    convocatoria_id VARCHAR(30) NOT NULL REFERENCES convocatorias(id),
    investigador_id VARCHAR(30) NOT NULL REFERENCES investigadores(id),
    folio VARCHAR(50) UNIQUE NOT NULL,
    titulo_proyecto VARCHAR(500),
    resumen TEXT,
    objetivo_general TEXT,
    objetivos_especificos TEXT,
    justificacion TEXT,
    metodologia TEXT,
    resultados_esperados TEXT,
    impacto_esperado TEXT,
    cronograma JSONB,
    presupuesto_solicitado FLOAT,
    desglose_presupuesto JSONB,
    cofinanciamiento FLOAT,
    fuente_cofinanciamiento VARCHAR(255),
    documentos JSONB,
    carta_postulacion TEXT,
    curriculum_vitae TEXT,
    carta_apoyo TEXT,
    colaboradores JSONB,
    puntaje_total FLOAT,
    dictamen VARCHAR(100),
    observaciones TEXT,
    recomendaciones TEXT,
    posicion_final INTEGER,
    estado VARCHAR(50) DEFAULT 'BORRADOR',
    notificado BOOLEAN DEFAULT FALSE,
    fecha_notificacion TIMESTAMP,
    fecha_postulacion TIMESTAMP,
    fecha_envio TIMESTAMP,
    fecha_recepcion TIMESTAMP,
    fecha_evaluacion TIMESTAMP,
    fecha_resultado TIMESTAMP,
    version INTEGER DEFAULT 1,
    version_anterior VARCHAR(30),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_postulaciones_convocatoria ON postulaciones(convocatoria_id);
CREATE INDEX idx_postulaciones_investigador ON postulaciones(investigador_id);
CREATE INDEX idx_postulaciones_estado ON postulaciones(estado);
CREATE INDEX idx_postulaciones_folio ON postulaciones(folio);

-- Tabla: evaluaciones_postulacion
CREATE TABLE evaluaciones_postulacion (
    id VARCHAR(30) PRIMARY KEY,
    postulacion_id VARCHAR(30) NOT NULL REFERENCES postulaciones(id),
    evaluador_id VARCHAR(255) NOT NULL,
    evaluador_nombre VARCHAR(255) NOT NULL,
    evaluador_especialidad VARCHAR(255),
    criterios JSONB NOT NULL,
    puntaje_total FLOAT NOT NULL,
    puntaje_maximo_total FLOAT NOT NULL,
    porcentaje FLOAT NOT NULL,
    recomendacion VARCHAR(100) NOT NULL,
    comentarios_generales TEXT,
    fortalezas TEXT,
    debilidades TEXT,
    recomendaciones_mejora TEXT,
    calidad_cientifica INTEGER,
    viabilidad INTEGER,
    impacto INTEGER,
    presupuesto INTEGER,
    estado VARCHAR(50) DEFAULT 'PENDIENTE',
    conflicto_interes BOOLEAN DEFAULT FALSE,
    motivo_conflicto TEXT,
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_inicio TIMESTAMP,
    fecha_completada TIMESTAMP,
    fecha_aprobada TIMESTAMP,
    aprobada_por VARCHAR(255),
    revisada_por VARCHAR(255),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_eval_postulacion ON evaluaciones_postulacion(postulacion_id);
CREATE INDEX idx_eval_evaluador ON evaluaciones_postulacion(evaluador_id);
CREATE INDEX idx_eval_estado ON evaluaciones_postulacion(estado);

-- Tabla: ciclos_convocatoria
CREATE TABLE ciclos_convocatoria (
    id VARCHAR(30) PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL,
    anio INTEGER NOT NULL,
    periodo VARCHAR(100) NOT NULL,
    fecha_inicio TIMESTAMP NOT NULL,
    fecha_fin TIMESTAMP NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    descripcion TEXT,
    presupuesto_total FLOAT,
    metas_proyectos INTEGER,
    total_convocatorias INTEGER DEFAULT 0,
    total_postulaciones INTEGER DEFAULT 0,
    total_aprobadas INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: notificaciones_convocatoria
CREATE TABLE notificaciones_convocatoria (
    id VARCHAR(30) PRIMARY KEY,
    convocatoria_id VARCHAR(30),
    tipo VARCHAR(100) NOT NULL,
    asunto VARCHAR(500) NOT NULL,
    mensaje TEXT NOT NULL,
    destinatarios JSONB NOT NULL,
    filtro_nivel VARCHAR(100),
    filtro_area VARCHAR(255),
    programada BOOLEAN DEFAULT FALSE,
    fecha_programada TIMESTAMP,
    enviada BOOLEAN DEFAULT FALSE,
    fecha_envio TIMESTAMP,
    total_destinatarios INTEGER DEFAULT 0,
    total_enviados INTEGER DEFAULT 0,
    total_fallidos INTEGER DEFAULT 0,
    log_envio JSONB,
    errores JSONB,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notif_convocatoria ON notificaciones_convocatoria(convocatoria_id);
CREATE INDEX idx_notif_enviada ON notificaciones_convocatoria(enviada);

-- PASO 3: INSERTAR DATOS INICIALES

-- Roles por defecto
INSERT INTO roles (id, name, description) VALUES
('cm123role1', 'admin', 'Administrador del sistema'),
('cm123role2', 'investigador', 'Investigador registrado'),
('cm123role3', 'evaluador', 'Evaluador de propuestas');

-- Niveles de Investigador
INSERT INTO niveles_investigador (id, codigo, nombre, descripcion, puntaje_minimo, puntaje_maximo, color, orden) VALUES
('nivel_candidato', 'CANDIDATO', 'Candidato a Investigador Estatal', 'Personas con nivel mínimo de licenciatura que realizan actividades de producción científica', 0, 100, '#60A5FA', 1),
('nivel_1', 'NIVEL_I', 'Investigador Estatal Nivel I', 'Profesionales con grado de maestría o estudiantes de doctorado', 101, 300, '#34D399', 2),
('nivel_2', 'NIVEL_II', 'Investigador Estatal Nivel II', 'Investigadores con grado de doctorado que han liderado proyectos científicos', 301, 500, '#FBBF24', 3),
('nivel_3', 'NIVEL_III', 'Investigador Estatal Nivel III', 'Miembros del SNI nivel II con alto impacto en el estado', 501, 700, '#F87171', 4),
('nivel_excepcional', 'EXCEPCIONAL', 'Investigador Excepcional', 'Miembros del SNI nivel III o Emérito con más de 10 años de experiencia', 701, 900, '#A78BFA', 5),
('nivel_insignia', 'INSIGNE', 'Investigador Insignia', 'Distinción al más alto nivel de reconocimiento científico', 901, 1000, '#F472B6', 6);

-- Niveles de Tecnólogo
INSERT INTO niveles_tecnologo (id, codigo, nombre, descripcion) VALUES
('tec_a', 'A', 'Tecnólogo Nivel A', 'Estudiantes o egresados recientes con experiencia en proyectos iniciales'),
('tec_b', 'B', 'Tecnólogo Nivel B', 'Profesionales con experiencia comprobable en desarrollo tecnológico');

-- FINALIZADO
-- Script ejecutado exitosamente
-- Todas las tablas han sido creadas con la estructura correcta
