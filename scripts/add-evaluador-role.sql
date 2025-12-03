-- Script para agregar el campo es_evaluador a la tabla investigadores
-- Ejecutar este script en la base de datos PostgreSQL

-- Agregar columna es_evaluador si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'investigadores' 
        AND column_name = 'es_evaluador'
    ) THEN
        ALTER TABLE investigadores 
        ADD COLUMN es_evaluador BOOLEAN DEFAULT FALSE;
        
        -- Crear índice para mejorar búsquedas
        CREATE INDEX idx_investigadores_es_evaluador ON investigadores(es_evaluador);
        
        RAISE NOTICE 'Columna es_evaluador agregada exitosamente';
    ELSE
        RAISE NOTICE 'La columna es_evaluador ya existe';
    END IF;
END $$;

-- Verificar que la columna fue creada
SELECT 
    column_name, 
    data_type, 
    column_default, 
    is_nullable
FROM information_schema.columns
WHERE table_name = 'investigadores' 
AND column_name = 'es_evaluador';

