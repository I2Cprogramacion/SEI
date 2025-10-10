-- ============================================
-- TABLAS SQL PARA RED SOCIAL DE INVESTIGADORES
-- Sistema: SEI (Sistema Estatal de Investigadores)
-- Base de datos: PostgreSQL (Neon)
-- ============================================

-- ============================================
-- TABLA: investigadores
-- Almacena la información completa de los investigadores
-- ============================================
CREATE TABLE IF NOT EXISTS investigadores (
  id SERIAL PRIMARY KEY,
  
  -- Datos básicos
  nombre_completo VARCHAR(255) NOT NULL,
  curp VARCHAR(18) UNIQUE,
  rfc VARCHAR(13),
  correo VARCHAR(255) UNIQUE NOT NULL,
  telefono VARCHAR(20),
  no_cvu VARCHAR(50),
  orcid VARCHAR(20),
  
  -- Formación académica
  ultimo_grado_estudios VARCHAR(100),
  grado_maximo_estudios VARCHAR(100),
  titulo_tesis TEXT,
  anio_grado INTEGER,
  pais_grado VARCHAR(100),
  disciplina VARCHAR(255),
  especialidad VARCHAR(255),
  
  -- Investigación
  area VARCHAR(255),
  area_investigacion TEXT,
  linea_investigacion TEXT,
  nivel VARCHAR(50),
  sni VARCHAR(10),
  anio_sni INTEGER,
  
  -- Empleo e institución
  empleo_actual VARCHAR(255),
  institucion VARCHAR(255),
  
  -- Ubicación
  nacionalidad VARCHAR(100) DEFAULT 'Mexicana',
  fecha_nacimiento DATE,
  estado_nacimiento VARCHAR(100),
  municipio VARCHAR(100),
  entidad_federativa VARCHAR(100),
  domicilio TEXT,
  cp VARCHAR(10),
  
  -- Experiencia
  cv_conacyt TEXT,
  experiencia_docente TEXT,
  experiencia_laboral TEXT,
  
  -- Proyectos y producción
  proyectos_investigacion TEXT,
  proyectos_vinculacion TEXT,
  patentes TEXT,
  productos_cientificos TEXT,
  productos_tecnologicos TEXT,
  productos_humanisticos TEXT,
  
  -- Publicaciones
  libros TEXT,
  capitulos_libros TEXT,
  articulos TEXT,
  revistas_indexadas TEXT,
  revistas_no_indexadas TEXT,
  memorias TEXT,
  ponencias TEXT,
  
  -- Formación y gestión
  formacion_recursos TEXT,
  direccion_tesis TEXT,
  direccion_posgrados TEXT,
  evaluador_proyectos TEXT,
  miembro_comites TEXT,
  editor_revistas TEXT,
  
  -- Reconocimientos
  premios_distinciones TEXT,
  estancias_academicas TEXT,
  
  -- Habilidades
  idiomas TEXT,
  asociaciones_cientificas TEXT,
  
  -- Colaboración
  colaboracion_internacional TEXT,
  colaboracion_nacional TEXT,
  
  -- Gestión
  gestion_academica TEXT,
  gestion_institucional TEXT,
  
  -- Divulgación e impacto
  divulgacion_cientifica TEXT,
  otros_logros TEXT,
  vinculacion_sector_productivo TEXT,
  vinculacion_sector_social TEXT,
  vinculacion_sector_publico TEXT,
  participacion_politicas_publicas TEXT,
  impacto_social TEXT,
  propuesta_linea_trabajo TEXT,
  
  -- Documentación
  documentacion_completa TEXT,
  observaciones TEXT,
  
  -- Perfil
  fotografia_url TEXT,
  slug VARCHAR(255),
  
  -- Verificación
  orcid_verificado BOOLEAN DEFAULT FALSE,
  cv_ligado_orcid TEXT,
  
  -- Datos personales adicionales
  genero VARCHAR(20),
  
  -- Sistema
  password VARCHAR(255),
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  origen VARCHAR(50),
  archivo_procesado VARCHAR(255),
  
  -- Índices para búsqueda rápida
  CONSTRAINT idx_investigadores_correo_unique UNIQUE (correo)
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_investigadores_nombre ON investigadores(nombre_completo);
CREATE INDEX IF NOT EXISTS idx_investigadores_area ON investigadores(area);
CREATE INDEX IF NOT EXISTS idx_investigadores_institucion ON investigadores(institucion);
CREATE INDEX IF NOT EXISTS idx_investigadores_slug ON investigadores(slug);
CREATE INDEX IF NOT EXISTS idx_investigadores_curp ON investigadores(curp);

-- ============================================
-- TABLA: publicaciones
-- Almacena las publicaciones científicas
-- ============================================
CREATE TABLE IF NOT EXISTS publicaciones (
  id SERIAL PRIMARY KEY,
  
  -- Información básica
  titulo TEXT NOT NULL,
  autor TEXT NOT NULL,
  institucion VARCHAR(255),
  editorial VARCHAR(255),
  
  -- Publicación
  año_creacion INTEGER,
  doi VARCHAR(100),
  resumen TEXT,
  palabras_clave TEXT,
  
  -- Clasificación
  categoria VARCHAR(100),
  tipo VARCHAR(100),
  acceso VARCHAR(50),
  
  -- Detalles
  volumen VARCHAR(50),
  numero VARCHAR(50),
  paginas VARCHAR(50),
  
  -- Archivos
  archivo VARCHAR(255),
  archivo_url TEXT,
  
  -- Sistema
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Para vincular con investigadores (opcional)
  investigador_id INTEGER REFERENCES investigadores(id) ON DELETE SET NULL,
  autor_correo VARCHAR(255)
);

-- Índices para búsqueda
CREATE INDEX IF NOT EXISTS idx_publicaciones_autor ON publicaciones(autor);
CREATE INDEX IF NOT EXISTS idx_publicaciones_titulo ON publicaciones(titulo);
CREATE INDEX IF NOT EXISTS idx_publicaciones_categoria ON publicaciones(categoria);
CREATE INDEX IF NOT EXISTS idx_publicaciones_investigador ON publicaciones(investigador_id);

-- ============================================
-- TABLA: conexiones (para red social)
-- Almacena las conexiones entre investigadores
-- ============================================
CREATE TABLE IF NOT EXISTS conexiones (
  id SERIAL PRIMARY KEY,
  
  -- Investigadores conectados
  investigador_origen_id INTEGER NOT NULL REFERENCES investigadores(id) ON DELETE CASCADE,
  investigador_destino_id INTEGER NOT NULL REFERENCES investigadores(id) ON DELETE CASCADE,
  
  -- Estado de la conexión
  estado VARCHAR(20) NOT NULL DEFAULT 'pendiente', -- pendiente, aceptada, rechazada
  
  -- Fechas
  fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_respuesta TIMESTAMP,
  
  -- Mensaje opcional
  mensaje TEXT,
  
  -- Evitar conexiones duplicadas
  CONSTRAINT conexiones_unique UNIQUE (investigador_origen_id, investigador_destino_id)
);

-- Índices para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_conexiones_origen ON conexiones(investigador_origen_id);
CREATE INDEX IF NOT EXISTS idx_conexiones_destino ON conexiones(investigador_destino_id);
CREATE INDEX IF NOT EXISTS idx_conexiones_estado ON conexiones(estado);

-- ============================================
-- TABLA: mensajes (mensajería interna)
-- Sistema de mensajes entre investigadores
-- ============================================
CREATE TABLE IF NOT EXISTS mensajes (
  id SERIAL PRIMARY KEY,
  
  -- Remitente y destinatario
  remitente_id INTEGER NOT NULL REFERENCES investigadores(id) ON DELETE CASCADE,
  destinatario_id INTEGER NOT NULL REFERENCES investigadores(id) ON DELETE CASCADE,
  
  -- Contenido
  asunto VARCHAR(255),
  mensaje TEXT NOT NULL,
  
  -- Estado
  leido BOOLEAN DEFAULT FALSE,
  fecha_lectura TIMESTAMP,
  
  -- Archivos adjuntos (opcional)
  archivo_url TEXT,
  
  -- Sistema
  fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para consultas
CREATE INDEX IF NOT EXISTS idx_mensajes_remitente ON mensajes(remitente_id);
CREATE INDEX IF NOT EXISTS idx_mensajes_destinatario ON mensajes(destinatario_id);
CREATE INDEX IF NOT EXISTS idx_mensajes_leido ON mensajes(leido);

-- ============================================
-- TABLA: notificaciones
-- Sistema de notificaciones para actividades
-- ============================================
CREATE TABLE IF NOT EXISTS notificaciones (
  id SERIAL PRIMARY KEY,
  
  -- Destinatario
  investigador_id INTEGER NOT NULL REFERENCES investigadores(id) ON DELETE CASCADE,
  
  -- Tipo de notificación
  tipo VARCHAR(50) NOT NULL, -- conexion, mensaje, publicacion, proyecto, etc.
  
  -- Contenido
  titulo VARCHAR(255) NOT NULL,
  mensaje TEXT,
  
  -- Referencia (opcional)
  referencia_tipo VARCHAR(50), -- investigador, publicacion, proyecto, etc.
  referencia_id INTEGER,
  
  -- Estado
  leida BOOLEAN DEFAULT FALSE,
  fecha_lectura TIMESTAMP,
  
  -- Sistema
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_notificaciones_investigador ON notificaciones(investigador_id);
CREATE INDEX IF NOT EXISTS idx_notificaciones_leida ON notificaciones(leida);
CREATE INDEX IF NOT EXISTS idx_notificaciones_tipo ON notificaciones(tipo);

-- ============================================
-- TABLA: proyectos
-- Proyectos de investigación detallados
-- ============================================
CREATE TABLE IF NOT EXISTS proyectos (
  id SERIAL PRIMARY KEY,
  
  -- Información básica
  titulo TEXT NOT NULL,
  descripcion TEXT,
  investigador_principal_id INTEGER REFERENCES investigadores(id) ON DELETE SET NULL,
  investigador_principal VARCHAR(255), -- Nombre como texto alternativo
  
  -- Fechas
  fecha_inicio DATE,
  fecha_fin DATE,
  
  -- Clasificación
  estado VARCHAR(50), -- activo, finalizado, en_revision, etc.
  area_investigacion VARCHAR(255),
  categoria VARCHAR(100),
  
  -- Financiamiento
  presupuesto DECIMAL(15, 2),
  fuente_financiamiento VARCHAR(255),
  
  -- Institución
  institucion VARCHAR(255),
  
  -- Archivos
  archivo_proyecto TEXT,
  archivo_url TEXT,
  
  -- Sistema
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  slug VARCHAR(255)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_proyectos_investigador ON proyectos(investigador_principal_id);
CREATE INDEX IF NOT EXISTS idx_proyectos_estado ON proyectos(estado);
CREATE INDEX IF NOT EXISTS idx_proyectos_slug ON proyectos(slug);

-- ============================================
-- TABLA: colaboradores_proyecto
-- Relación muchos a muchos entre proyectos e investigadores
-- ============================================
CREATE TABLE IF NOT EXISTS colaboradores_proyecto (
  id SERIAL PRIMARY KEY,
  
  proyecto_id INTEGER NOT NULL REFERENCES proyectos(id) ON DELETE CASCADE,
  investigador_id INTEGER NOT NULL REFERENCES investigadores(id) ON DELETE CASCADE,
  
  -- Rol en el proyecto
  rol VARCHAR(100), -- colaborador, coinvestigador, asistente, etc.
  
  -- Fechas
  fecha_inicio DATE,
  fecha_fin DATE,
  
  -- Evitar duplicados
  CONSTRAINT colaboradores_proyecto_unique UNIQUE (proyecto_id, investigador_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_colaboradores_proyecto ON colaboradores_proyecto(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_colaboradores_investigador ON colaboradores_proyecto(investigador_id);

-- ============================================
-- VISTA: estadisticas_investigador
-- Vista con estadísticas calculadas de cada investigador
-- ============================================
CREATE OR REPLACE VIEW estadisticas_investigador AS
SELECT 
  i.id,
  i.nombre_completo,
  i.correo,
  COUNT(DISTINCT p.id) AS total_publicaciones,
  COUNT(DISTINCT pr.id) AS total_proyectos,
  COUNT(DISTINCT c1.id) + COUNT(DISTINCT c2.id) AS total_conexiones,
  CASE 
    WHEN i.nombre_completo IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN i.correo IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN i.telefono IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN i.institucion IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN i.area IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN i.linea_investigacion IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN i.ultimo_grado_estudios IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN i.empleo_actual IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN i.fotografia_url IS NOT NULL THEN 1 ELSE 0 END
  ) * 100 / 9 AS perfil_completo_porcentaje
FROM investigadores i
LEFT JOIN publicaciones p ON LOWER(p.autor) LIKE LOWER('%' || i.nombre_completo || '%')
LEFT JOIN proyectos pr ON pr.investigador_principal_id = i.id
LEFT JOIN conexiones c1 ON c1.investigador_origen_id = i.id AND c1.estado = 'aceptada'
LEFT JOIN conexiones c2 ON c2.investigador_destino_id = i.id AND c2.estado = 'aceptada'
GROUP BY i.id, i.nombre_completo, i.correo, i.telefono, i.institucion, i.area, 
         i.linea_investigacion, i.ultimo_grado_estudios, i.empleo_actual, i.fotografia_url;

-- ============================================
-- FUNCIONES ÚTILES
-- ============================================

-- Función para generar slug automáticamente
CREATE OR REPLACE FUNCTION generar_slug(nombre TEXT) 
RETURNS TEXT AS $$
BEGIN
  RETURN LOWER(
    REGEXP_REPLACE(
      REGEXP_REPLACE(nombre, '[^a-zA-Z0-9\s]', '', 'g'),
      '\s+', '-', 'g'
    )
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger para generar slug automáticamente al insertar investigador
CREATE OR REPLACE FUNCTION trigger_generar_slug_investigador()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generar_slug(NEW.nombre_completo) || '-' || NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_insert_investigador_slug
  BEFORE INSERT ON investigadores
  FOR EACH ROW
  EXECUTE FUNCTION trigger_generar_slug_investigador();

-- ============================================
-- DATOS DE EJEMPLO (OPCIONAL)
-- Descomentar si deseas datos de prueba
-- ============================================

/*
-- Insertar investigador de ejemplo
INSERT INTO investigadores (
  nombre_completo, 
  correo, 
  telefono, 
  institucion, 
  area, 
  linea_investigacion,
  ultimo_grado_estudios,
  empleo_actual,
  nacionalidad
) VALUES (
  'Dr. Juan Pérez García',
  'juan.perez@ejemplo.com',
  '6141234567',
  'Universidad Autónoma de Chihuahua',
  'Ingeniería',
  'Inteligencia Artificial y Aprendizaje Automático',
  'Doctorado en Ciencias Computacionales',
  'Investigador Senior',
  'Mexicana'
);

-- Insertar publicación de ejemplo
INSERT INTO publicaciones (
  titulo,
  autor,
  institucion,
  editorial,
  año_creacion,
  doi,
  resumen,
  categoria,
  tipo,
  acceso
) VALUES (
  'Machine Learning Applications in Healthcare',
  'Dr. Juan Pérez García',
  'Universidad Autónoma de Chihuahua',
  'Journal of Medical AI',
  2024,
  '10.1000/jmai.2024.001',
  'Estudio sobre aplicaciones de machine learning en diagnóstico médico',
  'Ciencias de la Computación',
  'Artículo de investigación',
  'Abierto'
);
*/

-- ============================================
-- COMENTARIOS FINALES
-- ============================================
-- Este script crea todas las tablas necesarias para la red social de investigadores
-- Incluye:
-- - investigadores: Tabla principal con toda la información
-- - publicaciones: Almacena publicaciones científicas
-- - conexiones: Red social entre investigadores
-- - mensajes: Sistema de mensajería interna
-- - notificaciones: Sistema de notificaciones
-- - proyectos: Proyectos de investigación
-- - colaboradores_proyecto: Relación muchos a muchos
-- - Vista de estadísticas calculadas
-- - Funciones y triggers útiles

-- Para ejecutar en Neon:
-- 1. Copia todo este script
-- 2. Ve a tu dashboard de Neon
-- 3. Abre el SQL Editor
-- 4. Pega el script
-- 5. Ejecuta (Run)

COMMENT ON TABLE investigadores IS 'Tabla principal de investigadores del SEI';
COMMENT ON TABLE publicaciones IS 'Publicaciones científicas de los investigadores';
COMMENT ON TABLE conexiones IS 'Red social - conexiones entre investigadores';
COMMENT ON TABLE mensajes IS 'Sistema de mensajería interna';
COMMENT ON TABLE notificaciones IS 'Sistema de notificaciones de actividad';
COMMENT ON TABLE proyectos IS 'Proyectos de investigación';
COMMENT ON TABLE colaboradores_proyecto IS 'Colaboradores en proyectos (relación N:N)';
