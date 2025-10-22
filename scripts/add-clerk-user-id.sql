-- ================================================
-- MIGRACIÓN URGENTE: Agregar columna clerk_user_id
-- Fecha: 2025-10-22
-- Propósito: Permitir vincular investigadores con usuarios de Clerk
-- ================================================

-- Agregar columna clerk_user_id si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name='investigadores' 
        AND column_name='clerk_user_id'
    ) THEN
        ALTER TABLE investigadores 
        ADD COLUMN clerk_user_id VARCHAR(255);
        
        RAISE NOTICE 'Columna clerk_user_id agregada exitosamente';
    ELSE
        RAISE NOTICE 'Columna clerk_user_id ya existe, no se requiere acción';
    END IF;
END $$;

-- Crear índice para clerk_user_id si no existe
CREATE INDEX IF NOT EXISTS idx_investigadores_clerk_id 
ON investigadores(clerk_user_id);

-- Verificar que la columna fue agregada
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'investigadores' 
AND column_name = 'clerk_user_id';

COMMENT ON COLUMN investigadores.clerk_user_id IS 'ID del usuario en Clerk para vinculación con autenticación';

-- ================================================
-- VERIFICACIÓN
-- ================================================
SELECT 
    'clerk_user_id' as columna,
    CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name='investigadores' 
            AND column_name='clerk_user_id'
        ) THEN '✅ Existe'
        ELSE '❌ No existe'
    END as estado;
