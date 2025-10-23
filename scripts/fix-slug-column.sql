-- ================================================
-- FIX: Agregar columna slug a investigadores
-- ERROR: column "slug" does not exist
-- ================================================

-- Agregar columna slug
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='investigadores' AND column_name='slug'
    ) THEN
        ALTER TABLE investigadores ADD COLUMN slug VARCHAR(255);
        
        -- Crear índice único para búsquedas rápidas
        CREATE UNIQUE INDEX idx_investigadores_slug ON investigadores(slug);
        
        -- Generar slugs para registros existentes (si los hay)
        -- Formato: nombre-apellido-id
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
        
        RAISE NOTICE '✅ Columna slug agregada y poblada';
    ELSE
        RAISE NOTICE '⏭️  Columna slug ya existe';
    END IF;
END $$;

-- Verificar
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'investigadores'
    AND column_name = 'slug';

-- Ver índice
SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'investigadores'
    AND indexname = 'idx_investigadores_slug';
