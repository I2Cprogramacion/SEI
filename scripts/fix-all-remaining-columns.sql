-- ================================================
-- FIX FINAL: Agregar TODAS las columnas faltantes
-- ================================================

-- 1. Agregar cv_url
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='investigadores' AND column_name='cv_url'
    ) THEN
        ALTER TABLE investigadores ADD COLUMN cv_url TEXT;
        RAISE NOTICE '✅ Columna cv_url agregada';
    ELSE
        RAISE NOTICE '⏭️  Columna cv_url ya existe';
    END IF;
END $$;

-- 2. Agregar ultima_actividad (si no existe)
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

-- 3. Verificar que slug existe (debería estar ya)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='investigadores' AND column_name='slug'
    ) THEN
        ALTER TABLE investigadores ADD COLUMN slug VARCHAR(255);
        CREATE UNIQUE INDEX idx_investigadores_slug ON investigadores(slug);
        
        -- Generar slugs para registros existentes
        UPDATE investigadores 
        SET slug = LOWER(
            REGEXP_REPLACE(
                REGEXP_REPLACE(
                    COALESCE(nombre_completo, CONCAT(nombres, ' ', apellidos, ' ', id::text)),
                    '[^a-zA-Z0-9\s-]', '', 'g'
                ),
                '\s+', '-', 'g'
            )
        )
        WHERE slug IS NULL;
        
        RAISE NOTICE '✅ Columna slug agregada';
    ELSE
        RAISE NOTICE '⏭️  Columna slug ya existe';
    END IF;
END $$;

-- ================================================
-- VERIFICACIÓN FINAL DE TODAS LAS COLUMNAS
-- ================================================

SELECT 
    'investigadores' as tabla,
    column_name,
    data_type,
    is_nullable,
    CASE 
        WHEN column_name IN ('cv_url', 'ultima_actividad', 'slug', 'area_investigacion') 
        THEN '✅ RECIÉN AGREGADA'
        ELSE '✓ Existía'
    END as estado
FROM information_schema.columns 
WHERE table_name = 'investigadores' 
    AND column_name IN ('cv_url', 'ultima_actividad', 'slug', 'area_investigacion', 
                        'clerk_user_id', 'nombres', 'apellidos', 'nombre_completo', 
                        'correo', 'curp', 'rfc')
ORDER BY 
    CASE column_name
        WHEN 'clerk_user_id' THEN 1
        WHEN 'correo' THEN 2
        WHEN 'nombres' THEN 3
        WHEN 'apellidos' THEN 4
        WHEN 'nombre_completo' THEN 5
        WHEN 'slug' THEN 6
        WHEN 'curp' THEN 7
        WHEN 'rfc' THEN 8
        WHEN 'area_investigacion' THEN 9
        WHEN 'cv_url' THEN 10
        WHEN 'ultima_actividad' THEN 11
        ELSE 99
    END;

-- Contar registros
SELECT 
    COUNT(*) as total_investigadores,
    COUNT(clerk_user_id) as con_clerk_id,
    COUNT(slug) as con_slug,
    COUNT(cv_url) as con_cv,
    COUNT(ultima_actividad) as con_ultima_actividad
FROM investigadores;
