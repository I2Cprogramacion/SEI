-- ================================================
-- DIAGNÓSTICO COMPLETO: Tabla investigadores
-- Ejecuta esto en Neon Console para ver la estructura exacta
-- ================================================

-- 1. Ver TODAS las columnas de la tabla
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default,
    CASE 
        WHEN is_nullable = 'NO' AND column_default IS NULL THEN '🚨 REQUERIDA SIN DEFAULT'
        WHEN is_nullable = 'NO' AND column_default IS NOT NULL THEN '⚠️  REQUERIDA CON DEFAULT'
        WHEN is_nullable = 'YES' THEN '✅ OPCIONAL'
    END as estado
FROM information_schema.columns 
WHERE table_name = 'investigadores'
ORDER BY ordinal_position;

-- 2. Ver CONSTRAINTS (restricciones)
SELECT
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    tc.is_deferrable,
    tc.initially_deferred
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'investigadores'
ORDER BY tc.constraint_type, kcu.column_name;

-- 3. Ver ÍNDICES
SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'investigadores'
ORDER BY indexname;

-- 4. Ver TRIGGERS (si hay alguno que podría estar validando)
SELECT
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'investigadores';

-- 5. Contar registros actuales
SELECT 
    COUNT(*) as total_registros,
    COUNT(clerk_user_id) as con_clerk_id,
    COUNT(nombres) as con_nombres,
    COUNT(apellidos) as con_apellidos,
    COUNT(nombre_completo) as con_nombre_completo,
    COUNT(correo) as con_correo
FROM investigadores;

-- 6. Ver muestra de datos (si hay registros)
SELECT 
    id,
    clerk_user_id,
    nombres,
    apellidos,
    nombre_completo,
    correo,
    fecha_registro,
    LENGTH(nombres) as len_nombres,
    LENGTH(apellidos) as len_apellidos
FROM investigadores
LIMIT 5;

-- ================================================
-- VERIFICACIÓN DE PROBLEMA ESPECÍFICO
-- ================================================

-- 7. Verificar si hay columnas con NOT NULL que podrían causar problemas
SELECT 
    '🚨 COLUMNAS REQUERIDAS (NOT NULL) SIN DEFAULT' as alerta,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'investigadores'
    AND is_nullable = 'NO'
    AND column_default IS NULL
ORDER BY column_name;

-- 8. Test de INSERT simulado (NO ejecuta, solo verifica sintaxis)
EXPLAIN 
INSERT INTO investigadores (
    clerk_user_id,
    nombres,
    apellidos,
    nombre_completo,
    correo,
    telefono,
    ultimo_grado_estudios,
    empleo_actual,
    linea_investigacion,
    area_investigacion,
    nacionalidad,
    fecha_nacimiento,
    no_cvu,
    curp,
    rfc,
    fecha_registro,
    origen,
    archivo_procesado
) VALUES (
    'clerk_test_123',
    'Juan',
    'Pérez',
    'Juan Pérez',
    'test@test.com',
    '1234567890',
    'Doctorado',
    'UNAM',
    'IA',
    'Computación',
    'Mexicana',
    '1990-01-01',
    '123456',
    'PEXJ900101HDFRXN01',
    'PEXJ900101ABC',
    NOW(),
    'ocr',
    'test.pdf'
);
