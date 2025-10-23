-- ================================================
-- MIGRACIÓN COMPLETA: Agregar todas las columnas faltantes
-- Fecha: 2025-10-22
-- Propósito: Corregir schema de investigadores en producción
-- ================================================

-- 1. AGREGAR clerk_user_id (ya debería existir)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='investigadores' AND column_name='clerk_user_id'
    ) THEN
        ALTER TABLE investigadores ADD COLUMN clerk_user_id VARCHAR(255);
        CREATE INDEX idx_investigadores_clerk_id ON investigadores(clerk_user_id);
        RAISE NOTICE '✅ Columna clerk_user_id agregada';
    ELSE
        RAISE NOTICE '⏭️  Columna clerk_user_id ya existe';
    END IF;
END $$;

-- 2. AGREGAR ultima_actividad
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='investigadores' AND column_name='ultima_actividad'
    ) THEN
        ALTER TABLE investigadores ADD COLUMN ultima_actividad TIMESTAMP DEFAULT NOW();
        RAISE NOTICE '✅ Columna ultima_actividad agregada';
    ELSE
        RAISE NOTICE '⏭️  Columna ultima_actividad ya existe';
    END IF;
END $$;

-- 3. AGREGAR es_admin
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='investigadores' AND column_name='es_admin'
    ) THEN
        ALTER TABLE investigadores ADD COLUMN es_admin BOOLEAN DEFAULT FALSE;
        CREATE INDEX idx_investigadores_admin ON investigadores(es_admin) WHERE es_admin = TRUE;
        RAISE NOTICE '✅ Columna es_admin agregada';
    ELSE
        RAISE NOTICE '⏭️  Columna es_admin ya existe';
    END IF;
END $$;

-- 4. VERIFICAR y RENOMBRAR columnas con nombres inconsistentes
-- El código usa "nombres" y "apellidos", pero la BD puede tener "nombre_completo"

-- Verificar estructura actual
DO $$ 
DECLARE
    tiene_nombres BOOLEAN;
    tiene_apellidos BOOLEAN;
    tiene_nombre_completo BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='investigadores' AND column_name='nombres'
    ) INTO tiene_nombres;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='investigadores' AND column_name='apellidos'
    ) INTO tiene_apellidos;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='investigadores' AND column_name='nombre_completo'
    ) INTO tiene_nombre_completo;
    
    -- Si no tiene "nombres" pero sí "nombre_completo", agregar "nombres" y "apellidos"
    IF NOT tiene_nombres AND tiene_nombre_completo THEN
        ALTER TABLE investigadores ADD COLUMN nombres VARCHAR(255);
        ALTER TABLE investigadores ADD COLUMN apellidos VARCHAR(255);
        
        -- Intentar separar nombre_completo en nombres y apellidos
        UPDATE investigadores 
        SET 
            nombres = SPLIT_PART(nombre_completo, ' ', 1),
            apellidos = TRIM(SUBSTRING(nombre_completo FROM POSITION(' ' IN nombre_completo)))
        WHERE nombre_completo IS NOT NULL AND nombres IS NULL;
        
        RAISE NOTICE '✅ Columnas nombres y apellidos agregadas y pobladas';
    ELSIF tiene_nombres THEN
        RAISE NOTICE '⏭️  Columnas nombres y apellidos ya existen';
    END IF;
END $$;

-- 5. AGREGAR columnas de proyectos faltantes
DO $$ 
BEGIN
    -- fecha_registro para proyectos
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='proyectos' AND column_name='fecha_registro'
    ) THEN
        ALTER TABLE proyectos ADD COLUMN fecha_registro TIMESTAMP DEFAULT NOW();
        UPDATE proyectos SET fecha_registro = fecha_inicio WHERE fecha_registro IS NULL;
        RAISE NOTICE '✅ Columna fecha_registro agregada a proyectos';
    END IF;
END $$;

-- 6. RENOMBRAR columnas si usan snake_case en lugar del formato esperado
DO $$ 
BEGIN
    -- Verificar si existe ultimo_grado_estudios o grado_maximo_estudios
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='investigadores' AND column_name='grado_maximo_estudios'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='investigadores' AND column_name='ultimo_grado_estudios'
    ) THEN
        ALTER TABLE investigadores RENAME COLUMN grado_maximo_estudios TO ultimo_grado_estudios;
        RAISE NOTICE '✅ Columna renombrada: grado_maximo_estudios → ultimo_grado_estudios';
    ELSIF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='investigadores' AND column_name='ultimo_grado_estudios'
    ) THEN
        ALTER TABLE investigadores ADD COLUMN ultimo_grado_estudios VARCHAR(255);
        RAISE NOTICE '✅ Columna ultimo_grado_estudios agregada';
    ELSE
        RAISE NOTICE '⏭️  Columna ultimo_grado_estudios ya existe';
    END IF;
END $$;

-- ================================================
-- VERIFICACIÓN FINAL
-- ================================================

SELECT 
    '✅ VERIFICACIÓN DE COLUMNAS CRÍTICAS' as titulo;

SELECT 
    'investigadores' as tabla,
    column_name,
    data_type,
    is_nullable,
    CASE 
        WHEN column_name IN ('clerk_user_id', 'ultima_actividad', 'es_admin', 'nombres', 'apellidos', 'ultimo_grado_estudios') 
        THEN '✅ CRÍTICA'
        ELSE '✓ Normal'
    END as importancia
FROM information_schema.columns 
WHERE table_name = 'investigadores' 
AND column_name IN (
    'clerk_user_id',
    'ultima_actividad', 
    'es_admin',
    'nombres',
    'apellidos',
    'nombre_completo',
    'ultimo_grado_estudios',
    'grado_maximo_estudios'
)
ORDER BY 
    CASE column_name
        WHEN 'clerk_user_id' THEN 1
        WHEN 'nombres' THEN 2
        WHEN 'apellidos' THEN 3
        WHEN 'nombre_completo' THEN 4
        WHEN 'ultimo_grado_estudios' THEN 5
        WHEN 'ultima_actividad' THEN 6
        WHEN 'es_admin' THEN 7
        ELSE 99
    END;

-- Verificar proyectos
SELECT 
    'proyectos' as tabla,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'proyectos' 
AND column_name IN ('fecha_registro', 'fecha_inicio', 'fecha_fin');

-- ================================================
-- RESUMEN DE MIGRACIÓN
-- ================================================

DO $$ 
DECLARE
    total_investigadores INTEGER;
    con_clerk_id INTEGER;
    con_nombres INTEGER;
    administradores INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_investigadores FROM investigadores;
    SELECT COUNT(*) INTO con_clerk_id FROM investigadores WHERE clerk_user_id IS NOT NULL;
    SELECT COUNT(*) INTO con_nombres FROM investigadores WHERE nombres IS NOT NULL;
    SELECT COUNT(*) INTO administradores FROM investigadores WHERE es_admin = TRUE;
    
    RAISE NOTICE '';
    RAISE NOTICE '================================================';
    RAISE NOTICE '✅ MIGRACIÓN COMPLETADA';
    RAISE NOTICE '================================================';
    RAISE NOTICE 'Total investigadores: %', total_investigadores;
    RAISE NOTICE 'Con clerk_user_id: %', con_clerk_id;
    RAISE NOTICE 'Con nombres: %', con_nombres;
    RAISE NOTICE 'Administradores: %', administradores;
    RAISE NOTICE '================================================';
END $$;
