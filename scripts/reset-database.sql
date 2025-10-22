-- ================================================
-- SCRIPT PARA DROPEAR Y RECREAR TODA LA BASE DE DATOS
-- Sistema Estatal de Investigadores (SEI)
-- ================================================
-- ADVERTENCIA: Este script eliminará TODOS los datos
-- Úsalo solo para desarrollo o testing
-- ================================================

-- ================================================
-- PASO 1: DROPEAR TODAS LAS TABLAS EXISTENTES
-- ================================================
-- Nota: Se usa CASCADE para eliminar dependencias automáticamente

-- Drop tablas dependientes primero (las que tienen foreign keys)
DROP TABLE IF EXISTS mensajes CASCADE;
DROP TABLE IF EXISTS conexiones CASCADE;
DROP TABLE IF EXISTS publicaciones CASCADE;
DROP TABLE IF EXISTS proyectos CASCADE;

-- Drop tablas de Prisma/Next Auth
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS institutions CASCADE;

-- Drop tabla de investigadores (tabla principal)
DROP TABLE IF EXISTS investigadores CASCADE;

-- Drop tablas adicionales si existen
DROP TABLE IF EXISTS convocatorias CASCADE;
DROP TABLE IF EXISTS redes CASCADE;
DROP TABLE IF EXISTS eventos CASCADE;

-- ================================================
-- PASO 2: CREAR TABLA DE INVESTIGADORES
-- ================================================

CREATE TABLE investigadores (
  id SERIAL PRIMARY KEY,
  
  -- Clerk Integration
  clerk_user_id VARCHAR(255) UNIQUE,
  
  -- Información básica
  nombre_completo VARCHAR(255) NOT NULL,
  curp VARCHAR(18) UNIQUE,
  rfc VARCHAR(13),
  correo VARCHAR(255) UNIQUE NOT NULL,
  telefono VARCHAR(20),
  fotografia_url TEXT,
  
  -- Identificadores académicos
  no_cvu VARCHAR(50),
  orcid VARCHAR(50),
  orcid_verificado BOOLEAN DEFAULT FALSE,
  
  -- Información académica
  nivel VARCHAR(100),
  grado_maximo_estudios VARCHAR(200),
  titulo_tesis TEXT,
  anio_grado INTEGER,
  pais_grado VARCHAR(100),
  
  -- Áreas de conocimiento
  area VARCHAR(255),
  disciplina VARCHAR(255),
  especialidad VARCHAR(255),
  linea_investigacion TEXT,
  
  -- Institución
  institucion VARCHAR(255),
  empleo_actual TEXT,
  
  -- Ubicación
  nacionalidad VARCHAR(100) DEFAULT 'Mexicana',
  fecha_nacimiento DATE,
  genero VARCHAR(20),
  estado_nacimiento VARCHAR(100),
  municipio VARCHAR(100),
  entidad_federativa VARCHAR(100),
  domicilio TEXT,
  cp VARCHAR(10),
  
  -- SNI
  sni VARCHAR(20),
  anio_sni INTEGER,
  
  -- CVs y documentos
  cv_conacyt TEXT,
  cv_ligado_orcid TEXT,
  
  -- Experiencia
  experiencia_docente TEXT,
  experiencia_laboral TEXT,
  
  -- Proyectos y vinculación
  proyectos_investigacion TEXT,
  proyectos_vinculacion TEXT,
  vinculacion_sector_productivo TEXT,
  vinculacion_sector_social TEXT,
  vinculacion_sector_publico TEXT,
  
  -- Producción científica
  patentes TEXT,
  productos_cientificos TEXT,
  productos_tecnologicos TEXT,
  productos_humanisticos TEXT,
  libros TEXT,
  capitulos_libros TEXT,
  articulos TEXT,
  revistas_indexadas TEXT,
  revistas_no_indexadas TEXT,
  memorias TEXT,
  ponencias TEXT,
  
  -- Formación de recursos humanos
  formacion_recursos TEXT,
  direccion_tesis TEXT,
  direccion_posgrados TEXT,
  
  -- Participación académica
  evaluador_proyectos TEXT,
  miembro_comites TEXT,
  editor_revistas TEXT,
  
  -- Reconocimientos
  premios_distinciones TEXT,
  estancias_academicas TEXT,
  
  -- Otros datos
  idiomas TEXT,
  asociaciones_cientificas TEXT,
  gestion_academica TEXT,
  gestion_institucional TEXT,
  colaboracion_internacional TEXT,
  colaboracion_nacional TEXT,
  divulgacion_cientifica TEXT,
  participacion_politicas_publicas TEXT,
  impacto_social TEXT,
  otros_logros TEXT,
  
  -- Propuestas y documentación
  propuesta_linea_trabajo TEXT,
  documentacion_completa TEXT,
  observaciones TEXT,
  
  -- Control
  password TEXT,
  clerk_user_id VARCHAR(255),
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  activo BOOLEAN DEFAULT TRUE,
  
  -- Origen de datos
  origen VARCHAR(100),
  archivo_procesado TEXT
);

-- ================================================
-- PASO 3: CREAR TABLA DE CONEXIONES
-- ================================================

CREATE TABLE conexiones (
  id SERIAL PRIMARY KEY,
  investigador_id INTEGER NOT NULL REFERENCES investigadores(id) ON DELETE CASCADE,
  conectado_con_id INTEGER NOT NULL REFERENCES investigadores(id) ON DELETE CASCADE,
  estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aceptada', 'rechazada')),
  mensaje TEXT,
  fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_aceptacion TIMESTAMP,
  UNIQUE(investigador_id, conectado_con_id)
);

-- ================================================
-- PASO 4: CREAR TABLA DE MENSAJES
-- ================================================

CREATE TABLE mensajes (
  id SERIAL PRIMARY KEY,
  remitente_id INTEGER NOT NULL REFERENCES investigadores(id) ON DELETE CASCADE,
  destinatario_id INTEGER NOT NULL REFERENCES investigadores(id) ON DELETE CASCADE,
  asunto VARCHAR(200) NOT NULL,
  mensaje TEXT NOT NULL,
  fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  leido BOOLEAN DEFAULT FALSE
);

-- ================================================
-- PASO 5: CREAR TABLA DE PUBLICACIONES (OPCIONAL)
-- ================================================

CREATE TABLE publicaciones (
  id SERIAL PRIMARY KEY,
  investigador_id INTEGER REFERENCES investigadores(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  tipo VARCHAR(100),
  revista VARCHAR(255),
  editorial VARCHAR(255),
  anio INTEGER,
  volumen VARCHAR(50),
  numero VARCHAR(50),
  paginas VARCHAR(50),
  doi VARCHAR(255),
  isbn VARCHAR(50),
  issn VARCHAR(50),
  url TEXT,
  resumen TEXT,
  palabras_clave TEXT,
  autores TEXT,
  indexada BOOLEAN DEFAULT FALSE,
  factor_impacto DECIMAL(10,3),
  fecha_publicacion DATE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- PASO 6: CREAR TABLA DE PROYECTOS (OPCIONAL)
-- ================================================

CREATE TABLE proyectos (
  id SERIAL PRIMARY KEY,
  investigador_id INTEGER REFERENCES investigadores(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  tipo VARCHAR(100),
  estado VARCHAR(50),
  fecha_inicio DATE,
  fecha_fin DATE,
  presupuesto DECIMAL(15,2),
  institucion VARCHAR(255),
  financiamiento VARCHAR(255),
  colaboradores TEXT,
  objetivos TEXT,
  metodologia TEXT,
  resultados TEXT,
  impacto TEXT,
  palabras_clave TEXT,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- PASO 7: CREAR ÍNDICES PARA MEJOR PERFORMANCE
-- ================================================

-- Índices en investigadores
CREATE INDEX idx_investigadores_clerk_id ON investigadores(clerk_user_id);
CREATE INDEX idx_investigadores_correo ON investigadores(correo);
CREATE INDEX idx_investigadores_curp ON investigadores(curp);
CREATE INDEX idx_investigadores_nombre ON investigadores(nombre_completo);
CREATE INDEX idx_investigadores_institucion ON investigadores(institucion);
CREATE INDEX idx_investigadores_area ON investigadores(area);
CREATE INDEX idx_investigadores_fecha_registro ON investigadores(fecha_registro);

-- Índices en conexiones
CREATE INDEX idx_conexiones_investigador ON conexiones(investigador_id);
CREATE INDEX idx_conexiones_conectado ON conexiones(conectado_con_id);
CREATE INDEX idx_conexiones_estado ON conexiones(estado);

-- Índices en mensajes
CREATE INDEX idx_mensajes_remitente ON mensajes(remitente_id);
CREATE INDEX idx_mensajes_destinatario ON mensajes(destinatario_id);
CREATE INDEX idx_mensajes_leido ON mensajes(leido);
CREATE INDEX idx_mensajes_fecha ON mensajes(fecha_envio);

-- Índices en publicaciones
CREATE INDEX idx_publicaciones_investigador ON publicaciones(investigador_id);
CREATE INDEX idx_publicaciones_anio ON publicaciones(anio);
CREATE INDEX idx_publicaciones_tipo ON publicaciones(tipo);

-- Índices en proyectos
CREATE INDEX idx_proyectos_investigador ON proyectos(investigador_id);
CREATE INDEX idx_proyectos_estado ON proyectos(estado);
CREATE INDEX idx_proyectos_fecha_inicio ON proyectos(fecha_inicio);

-- ================================================
-- PASO 8: CREAR FUNCIONES Y TRIGGERS (OPCIONAL)
-- ================================================

-- Función para actualizar fecha_actualizacion automáticamente
CREATE OR REPLACE FUNCTION actualizar_fecha_modificacion()
RETURNS TRIGGER AS $$
BEGIN
  NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para investigadores
CREATE TRIGGER trigger_actualizar_investigadores
  BEFORE UPDATE ON investigadores
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_fecha_modificacion();

-- ================================================
-- CONFIRMACIÓN
-- ================================================

-- Verificar que las tablas se crearon correctamente
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as num_columnas
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
  AND table_name IN ('investigadores', 'conexiones', 'mensajes', 'publicaciones', 'proyectos')
ORDER BY table_name;

-- ================================================
-- FIN DEL SCRIPT
-- ================================================
-- Base de datos reiniciada y lista para usar
-- Todas las tablas creadas con sus relaciones y índices
-- ================================================
