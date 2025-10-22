-- ================================================
-- MIGRACIÓN: Agregar columnas faltantes a proyectos y publicaciones
-- Fecha: 2025-10-22
-- Propósito: Sincronizar esquema de BD con APIs de POST
-- ================================================

-- ================================================
-- PROYECTOS: Agregar columnas faltantes
-- ================================================

-- Agregar columnas si no existen
DO $$ 
BEGIN
    -- investigador_principal_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name='proyectos' AND column_name='investigador_principal_id') THEN
        ALTER TABLE proyectos ADD COLUMN investigador_principal_id INTEGER;
        COMMENT ON COLUMN proyectos.investigador_principal_id IS 'ID del investigador principal del proyecto';
    END IF;

    -- investigador_principal (nombre)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name='proyectos' AND column_name='investigador_principal') THEN
        ALTER TABLE proyectos ADD COLUMN investigador_principal VARCHAR(255);
        COMMENT ON COLUMN proyectos.investigador_principal IS 'Nombre completo del investigador principal';
    END IF;

    -- area_investigacion
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name='proyectos' AND column_name='area_investigacion') THEN
        ALTER TABLE proyectos ADD COLUMN area_investigacion VARCHAR(255);
        COMMENT ON COLUMN proyectos.area_investigacion IS 'Área o campo de investigación del proyecto';
    END IF;

    -- categoria
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name='proyectos' AND column_name='categoria') THEN
        ALTER TABLE proyectos ADD COLUMN categoria VARCHAR(100);
        COMMENT ON COLUMN proyectos.categoria IS 'Categoría del proyecto';
    END IF;

    -- fuente_financiamiento
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name='proyectos' AND column_name='fuente_financiamiento') THEN
        ALTER TABLE proyectos ADD COLUMN fuente_financiamiento VARCHAR(255);
        COMMENT ON COLUMN proyectos.fuente_financiamiento IS 'Fuente de financiamiento del proyecto';
    END IF;

    -- archivo
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name='proyectos' AND column_name='archivo') THEN
        ALTER TABLE proyectos ADD COLUMN archivo VARCHAR(255);
        COMMENT ON COLUMN proyectos.archivo IS 'Nombre del archivo adjunto del proyecto';
    END IF;

    -- archivo_url
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name='proyectos' AND column_name='archivo_url') THEN
        ALTER TABLE proyectos ADD COLUMN archivo_url TEXT;
        COMMENT ON COLUMN proyectos.archivo_url IS 'URL del archivo adjunto en Cloudinary';
    END IF;

    -- slug
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name='proyectos' AND column_name='slug') THEN
        ALTER TABLE proyectos ADD COLUMN slug VARCHAR(255) UNIQUE;
        COMMENT ON COLUMN proyectos.slug IS 'Slug único para URL amigable';
    END IF;

    -- clerk_user_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name='proyectos' AND column_name='clerk_user_id') THEN
        ALTER TABLE proyectos ADD COLUMN clerk_user_id VARCHAR(255);
        COMMENT ON COLUMN proyectos.clerk_user_id IS 'ID del usuario en Clerk que creó el proyecto';
    END IF;
END $$;

-- Renombrar columna "financiamiento" a "fuente_financiamiento" si existe la primera
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
              WHERE table_name='proyectos' AND column_name='financiamiento') THEN
        ALTER TABLE proyectos RENAME COLUMN financiamiento TO fuente_financiamiento_old;
    END IF;
END $$;

-- ================================================
-- PUBLICACIONES: Agregar columnas faltantes
-- ================================================

DO $$ 
BEGIN
    -- autor (renombrar "autores" a "autor" si existe)
    IF EXISTS (SELECT 1 FROM information_schema.columns 
              WHERE table_name='publicaciones' AND column_name='autores') THEN
        ALTER TABLE publicaciones RENAME COLUMN autores TO autor;
    ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                     WHERE table_name='publicaciones' AND column_name='autor') THEN
        ALTER TABLE publicaciones ADD COLUMN autor TEXT;
    END IF;

    -- institucion
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name='publicaciones' AND column_name='institucion') THEN
        ALTER TABLE publicaciones ADD COLUMN institucion VARCHAR(255);
        COMMENT ON COLUMN publicaciones.institucion IS 'Institución del autor principal';
    END IF;

    -- año_creacion (renombrar "anio" a "año_creacion")
    IF EXISTS (SELECT 1 FROM information_schema.columns 
              WHERE table_name='publicaciones' AND column_name='anio') THEN
        ALTER TABLE publicaciones RENAME COLUMN anio TO año_creacion;
    ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                     WHERE table_name='publicaciones' AND column_name='año_creacion') THEN
        ALTER TABLE publicaciones ADD COLUMN año_creacion INTEGER;
    END IF;

    -- categoria
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name='publicaciones' AND column_name='categoria') THEN
        ALTER TABLE publicaciones ADD COLUMN categoria VARCHAR(100);
        COMMENT ON COLUMN publicaciones.categoria IS 'Categoría de la publicación';
    END IF;

    -- acceso (abierto/restringido)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name='publicaciones' AND column_name='acceso') THEN
        ALTER TABLE publicaciones ADD COLUMN acceso VARCHAR(50) DEFAULT 'abierto';
        COMMENT ON COLUMN publicaciones.acceso IS 'Tipo de acceso: abierto o restringido';
    END IF;

    -- archivo
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name='publicaciones' AND column_name='archivo') THEN
        ALTER TABLE publicaciones ADD COLUMN archivo VARCHAR(255);
        COMMENT ON COLUMN publicaciones.archivo IS 'Nombre del archivo PDF de la publicación';
    END IF;

    -- archivo_url
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name='publicaciones' AND column_name='archivo_url') THEN
        ALTER TABLE publicaciones ADD COLUMN archivo_url TEXT;
        COMMENT ON COLUMN publicaciones.archivo_url IS 'URL del archivo en Cloudinary';
    END IF;

    -- clerk_user_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name='publicaciones' AND column_name='clerk_user_id') THEN
        ALTER TABLE publicaciones ADD COLUMN clerk_user_id VARCHAR(255);
        COMMENT ON COLUMN publicaciones.clerk_user_id IS 'ID del usuario en Clerk que creó la publicación';
    END IF;
END $$;

-- ================================================
-- ÍNDICES ADICIONALES
-- ================================================

-- Índice en slug de proyectos (ya es UNIQUE pero agregar índice explícito)
CREATE INDEX IF NOT EXISTS idx_proyectos_slug ON proyectos(slug);

-- Índice en clerk_user_id para ambas tablas
CREATE INDEX IF NOT EXISTS idx_proyectos_clerk_user ON proyectos(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_publicaciones_clerk_user ON publicaciones(clerk_user_id);

-- Índice en investigador_principal para búsquedas
CREATE INDEX IF NOT EXISTS idx_proyectos_investigador_principal ON proyectos(investigador_principal);

-- Índice en categoría para filtros
CREATE INDEX IF NOT EXISTS idx_proyectos_categoria ON proyectos(categoria);
CREATE INDEX IF NOT EXISTS idx_publicaciones_categoria ON publicaciones(categoria);

-- Índice en año para filtros de publicaciones
CREATE INDEX IF NOT EXISTS idx_publicaciones_año ON publicaciones(año_creacion);

-- ================================================
-- VERIFICACIÓN
-- ================================================

-- Ver columnas de proyectos
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'proyectos'
ORDER BY ordinal_position;

-- Ver columnas de publicaciones
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'publicaciones'
ORDER BY ordinal_position;

COMMENT ON TABLE proyectos IS 'Tabla de proyectos de investigación - Actualizada 2025-10-22';
COMMENT ON TABLE publicaciones IS 'Tabla de publicaciones científicas - Actualizada 2025-10-22';
