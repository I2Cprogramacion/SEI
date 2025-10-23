-- ================================================
-- FIX CRÍTICO: Agregar columna area_investigacion
-- ERROR: column "area_investigacion" does not exist
-- ================================================

-- Agregar area_investigacion si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='investigadores' AND column_name='area_investigacion'
    ) THEN
        ALTER TABLE investigadores ADD COLUMN area_investigacion TEXT;
        RAISE NOTICE '✅ Columna area_investigacion agregada';
    ELSE
        RAISE NOTICE '⏭️  Columna area_investigacion ya existe';
    END IF;
END $$;

-- Verificar que ahora exista
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'investigadores'
    AND column_name = 'area_investigacion';

-- ================================================
-- VERIFICAR TODAS LAS COLUMNAS QUE EL CÓDIGO USA
-- ================================================

DO $$
DECLARE
    columnas_requeridas TEXT[] := ARRAY[
        'clerk_user_id',
        'nombres',
        'apellidos',
        'nombre_completo',
        'correo',
        'telefono',
        'ultimo_grado_estudios',
        'empleo_actual',
        'linea_investigacion',
        'area_investigacion',
        'nacionalidad',
        'fecha_nacimiento',
        'no_cvu',
        'curp',
        'rfc',
        'fecha_registro',
        'origen',
        'archivo_procesado',
        'password',
        'contrasena'
    ];
    columna TEXT;
    existe BOOLEAN;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '================================================';
    RAISE NOTICE 'VERIFICACIÓN DE COLUMNAS REQUERIDAS POR EL CÓDIGO';
    RAISE NOTICE '================================================';
    
    FOREACH columna IN ARRAY columnas_requeridas
    LOOP
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name='investigadores' AND column_name=columna
        ) INTO existe;
        
        IF existe THEN
            RAISE NOTICE '✅ % - EXISTE', columna;
        ELSE
            RAISE NOTICE '❌ % - NO EXISTE', columna;
        END IF;
    END LOOP;
    
    RAISE NOTICE '================================================';
END $$;
