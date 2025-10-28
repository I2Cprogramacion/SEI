-- ================================================================
-- 🔧 SCRIPT DEFINITIVO: TODAS LAS COLUMNAS NECESARIAS
-- ================================================================
-- Este script agrega TODAS las columnas que el código necesita
-- Ejecutar en Neon Console para la base de datos de producción
-- ================================================================

BEGIN;

-- ================================================================
-- PARTE 1: COLUMNAS CRÍTICAS PARA AUTENTICACIÓN
-- ================================================================

-- clerk_user_id: ID de usuario en Clerk (CRÍTICO para login)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='investigadores' AND column_name='clerk_user_id'
    ) THEN
        ALTER TABLE investigadores ADD COLUMN clerk_user_id VARCHAR(255);
        CREATE UNIQUE INDEX IF NOT EXISTS idx_investigadores_clerk_id ON investigadores(clerk_user_id);
        RAISE NOTICE '✅ clerk_user_id agregada';
    ELSE
        RAISE NOTICE '⏭️  clerk_user_id ya existe';
    END IF;
END $$;

-- ================================================================
-- PARTE 2: COLUMNAS DE NOMBRE (requeridas para registro)
-- ================================================================

-- nombres: Primer y segundo nombre
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='investigadores' AND column_name='nombres'
    ) THEN
        ALTER TABLE investigadores ADD COLUMN nombres VARCHAR(255);
        RAISE NOTICE '✅ nombres agregada';
    ELSE
        RAISE NOTICE '⏭️  nombres ya existe';
    END IF;
END $$;

-- apellidos: Apellidos del investigador
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='investigadores' AND column_name='apellidos'
    ) THEN
        ALTER TABLE investigadores ADD COLUMN apellidos VARCHAR(255);
        RAISE NOTICE '✅ apellidos agregada';
    ELSE
        RAISE NOTICE '⏭️  apellidos ya existe';
    END IF;
END $$;

-- nombre_completo: Nombre completo (requerido NOT NULL en algunas queries)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='investigadores' AND column_name='nombre_completo'
    ) THEN
        ALTER TABLE investigadores ADD COLUMN nombre_completo VARCHAR(500);
        RAISE NOTICE '✅ nombre_completo agregada';
    ELSE
        RAISE NOTICE '⏭️  nombre_completo ya existe';
    END IF;
END $$;

-- ================================================================
-- PARTE 3: COLUMNAS DE PERFIL ACADÉMICO
-- ================================================================

-- ultimo_grado_estudios: Nivel máximo de estudios
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='investigadores' AND column_name='ultimo_grado_estudios'
    ) THEN
        ALTER TABLE investigadores ADD COLUMN ultimo_grado_estudios VARCHAR(255);
        RAISE NOTICE '✅ ultimo_grado_estudios agregada';
    ELSE
        RAISE NOTICE '⏭️  ultimo_grado_estudios ya existe';
    END IF;
END $$;

-- area_investigacion: Área de investigación (CRÍTICO - causaba error)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='investigadores' AND column_name='area_investigacion'
    ) THEN
        ALTER TABLE investigadores ADD COLUMN area_investigacion TEXT;
        RAISE NOTICE '✅ area_investigacion agregada';
    ELSE
        RAISE NOTICE '⏭️  area_investigacion ya existe';
    END IF;
END $$;

-- linea_investigacion: Línea específica de investigación
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='investigadores' AND column_name='linea_investigacion'
    ) THEN
        ALTER TABLE investigadores ADD COLUMN linea_investigacion TEXT;
        RAISE NOTICE '✅ linea_investigacion agregada';
    ELSE
        RAISE NOTICE '⏭️  linea_investigacion ya existe';
    END IF;
END $$;

-- empleo_actual: Institución o empleo actual
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='investigadores' AND column_name='empleo_actual'
    ) THEN
        ALTER TABLE investigadores ADD COLUMN empleo_actual TEXT;
        RAISE NOTICE '✅ empleo_actual agregada';
    ELSE
        RAISE NOTICE '⏭️  empleo_actual ya existe';
    END IF;
END $$;

-- institucion: Institución (usado en featured)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='investigadores' AND column_name='institucion'
    ) THEN
        ALTER TABLE investigadores ADD COLUMN institucion TEXT;
        RAISE NOTICE '✅ institucion agregada';
    ELSE
        RAISE NOTICE '⏭️  institucion ya existe';
    END IF;
END $$;

-- area: Área general (usado en featured como fallback)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='investigadores' AND column_name='area'
    ) THEN
        ALTER TABLE investigadores ADD COLUMN area TEXT;
        RAISE NOTICE '✅ area agregada';
    ELSE
        RAISE NOTICE '⏭️  area ya existe';
    END IF;
END $$;

-- ================================================================
-- PARTE 4: COLUMNAS DE ARCHIVOS Y URLS
-- ================================================================

-- cv_url: URL del CV en Cloudinary (CRÍTICO - causaba error en dashboard)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='investigadores' AND column_name='cv_url'
    ) THEN
        ALTER TABLE investigadores ADD COLUMN cv_url TEXT;
        RAISE NOTICE '✅ cv_url agregada';
    ELSE
        RAISE NOTICE '⏭️  cv_url ya existe';
    END IF;
END $$;

-- fotografia_url: URL de foto de perfil en Cloudinary
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='investigadores' AND column_name='fotografia_url'
    ) THEN
        ALTER TABLE investigadores ADD COLUMN fotografia_url TEXT;
        RAISE NOTICE '✅ fotografia_url agregada';
    ELSE
        RAISE NOTICE '⏭️  fotografia_url ya existe';
    END IF;
END $$;

-- slug: URL amigable para perfil (CRÍTICO - causaba error en featured)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='investigadores' AND column_name='slug'
    ) THEN
        ALTER TABLE investigadores ADD COLUMN slug VARCHAR(255);
        CREATE UNIQUE INDEX IF NOT EXISTS idx_investigadores_slug ON investigadores(slug);
        RAISE NOTICE '✅ slug agregada';
    ELSE
        RAISE NOTICE '⏭️  slug ya existe';
    END IF;
END $$;

-- ================================================================
-- PARTE 5: COLUMNAS DE TRACKING Y ADMINISTRACIÓN
-- ================================================================

-- ultima_actividad: Timestamp de última actividad (CRÍTICO - causaba error)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='investigadores' AND column_name='ultima_actividad'
    ) THEN
        ALTER TABLE investigadores ADD COLUMN ultima_actividad TIMESTAMP DEFAULT NOW();
        CREATE INDEX IF NOT EXISTS idx_investigadores_actividad ON investigadores(ultima_actividad);
        RAISE NOTICE '✅ ultima_actividad agregada';
    ELSE
        RAISE NOTICE '⏭️  ultima_actividad ya existe';
    END IF;
END $$;

-- es_admin: Flag de administrador
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='investigadores' AND column_name='es_admin'
    ) THEN
        ALTER TABLE investigadores ADD COLUMN es_admin BOOLEAN DEFAULT FALSE;
        CREATE INDEX IF NOT EXISTS idx_investigadores_admin ON investigadores(es_admin) WHERE es_admin = TRUE;
        RAISE NOTICE '✅ es_admin agregada';
    ELSE
        RAISE NOTICE '⏭️  es_admin ya existe';
    END IF;
END $$;

-- fecha_registro: Cuándo se registró
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='investigadores' AND column_name='fecha_registro'
    ) THEN
        ALTER TABLE investigadores ADD COLUMN fecha_registro TIMESTAMP DEFAULT NOW();
        RAISE NOTICE '✅ fecha_registro agregada';
    ELSE
        RAISE NOTICE '⏭️  fecha_registro ya existe';
    END IF;
END $$;

-- origen: De dónde viene el registro (ocr, manual, etc)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='investigadores' AND column_name='origen'
    ) THEN
        ALTER TABLE investigadores ADD COLUMN origen VARCHAR(50);
        RAISE NOTICE '✅ origen agregada';
    ELSE
        RAISE NOTICE '⏭️  origen ya existe';
    END IF;
END $$;

-- archivo_procesado: Nombre del PDF procesado con OCR
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='investigadores' AND column_name='archivo_procesado'
    ) THEN
        ALTER TABLE investigadores ADD COLUMN archivo_procesado TEXT;
        RAISE NOTICE '✅ archivo_procesado agregada';
    ELSE
        RAISE NOTICE '⏭️  archivo_procesado ya existe';
    END IF;
END $$;

-- tipo_perfil: INVESTIGADOR o TECNOLOGO
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='investigadores' AND column_name='tipo_perfil'
    ) THEN
        ALTER TABLE investigadores ADD COLUMN tipo_perfil VARCHAR(20) DEFAULT 'INVESTIGADOR';
        RAISE NOTICE '✅ tipo_perfil agregada';
    ELSE
        RAISE NOTICE '⏭️  tipo_perfil ya existe';
    END IF;
END $$;

-- nivel_tecnologo_id: Relación con niveles_tecnologo
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='investigadores' AND column_name='nivel_tecnologo_id'
    ) THEN
        ALTER TABLE investigadores ADD COLUMN nivel_tecnologo_id VARCHAR(100);
        RAISE NOTICE '✅ nivel_tecnologo_id agregada';
    ELSE
        RAISE NOTICE '⏭️  nivel_tecnologo_id ya existe';
    END IF;
END $$;
    ELSE
        RAISE NOTICE '⏭️  archivo_procesado ya existe';
    END IF;
END $$;

-- ================================================================
-- PARTE 6: GENERAR SLUGS PARA REGISTROS EXISTENTES
-- ================================================================

DO $$
DECLARE
    registros_sin_slug INTEGER;
BEGIN
    -- Contar cuántos no tienen slug
    SELECT COUNT(*) INTO registros_sin_slug 
    FROM investigadores 
    WHERE slug IS NULL AND nombre_completo IS NOT NULL;
    
    IF registros_sin_slug > 0 THEN
        -- Generar slugs para todos los que no tienen
        UPDATE investigadores 
        SET slug = LOWER(
            REGEXP_REPLACE(
                REGEXP_REPLACE(
                    CONCAT(
                        COALESCE(nombre_completo, CONCAT(nombres, ' ', apellidos)),
                        '-',
                        id::text
                    ),
                    '[^a-zA-Z0-9\s-]', '', 'g'
                ),
                '\s+', '-', 'g'
            )
        )
        WHERE slug IS NULL AND nombre_completo IS NOT NULL;
        
        RAISE NOTICE '✅ Slugs generados para % registros', registros_sin_slug;
    ELSE
        RAISE NOTICE '⏭️  Todos los registros ya tienen slug';
    END IF;
END $$;

COMMIT;

-- ================================================================
-- VERIFICACIÓN FINAL
-- ================================================================

DO $$
DECLARE
    col RECORD;
    columnas_criticas TEXT[] := ARRAY[
        'clerk_user_id', 'nombres', 'apellidos', 'nombre_completo',
        'ultimo_grado_estudios', 'area_investigacion', 'linea_investigacion',
        'empleo_actual', 'institucion', 'area', 'cv_url', 'fotografia_url',
        'slug', 'ultima_actividad', 'es_admin', 'fecha_registro',
        'origen', 'archivo_procesado', 'correo', 'curp', 'rfc',
        'no_cvu', 'telefono', 'nacionalidad', 'fecha_nacimiento'
    ];
    columna TEXT;
    existe BOOLEAN;
    total_ok INTEGER := 0;
    total_faltantes INTEGER := 0;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '================================================================';
    RAISE NOTICE '📋 VERIFICACIÓN FINAL DE TODAS LAS COLUMNAS';
    RAISE NOTICE '================================================================';
    
    FOREACH columna IN ARRAY columnas_criticas
    LOOP
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name='investigadores' AND column_name=columna
        ) INTO existe;
        
        IF existe THEN
            RAISE NOTICE '✅ % - OK', columna;
            total_ok := total_ok + 1;
        ELSE
            RAISE NOTICE '❌ % - FALTA', columna;
            total_faltantes := total_faltantes + 1;
        END IF;
    END LOOP;
    
    RAISE NOTICE '================================================================';
    RAISE NOTICE '📊 RESUMEN: % columnas OK, % columnas faltantes', total_ok, total_faltantes;
    RAISE NOTICE '================================================================';
END $$;

-- Estadísticas de datos
SELECT 
    '📊 ESTADÍSTICAS DE DATOS' as titulo,
    COUNT(*) as total_investigadores,
    COUNT(clerk_user_id) as con_clerk_id,
    COUNT(slug) as con_slug,
    COUNT(cv_url) as con_cv,
    COUNT(ultima_actividad) as con_ultima_actividad,
    COUNT(nombre_completo) as con_nombre_completo,
    COUNT(area_investigacion) as con_area_investigacion
FROM investigadores;
