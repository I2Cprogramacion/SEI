-- ================================================
-- SCRIPT DE DIAGNÓSTICO: Verificar estado de la base de datos
-- ================================================

-- 1. Ver qué tablas existen
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Ver estructura de la tabla investigadores (si existe)
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'investigadores' 
ORDER BY ordinal_position;

-- 3. Contar investigadores
SELECT 
    COUNT(*) as total_investigadores,
    COUNT(clerk_user_id) as con_clerk_id,
    COUNT(nombre_completo) as con_nombre,
    COUNT(correo) as con_correo
FROM investigadores;

-- 4. Ver últimos investigadores registrados
SELECT 
    id,
    nombre_completo,
    correo,
    clerk_user_id,
    fecha_registro,
    ultima_actividad
FROM investigadores 
ORDER BY fecha_registro DESC 
LIMIT 10;

-- 5. Buscar usuario específico
SELECT 
    id,
    nombre_completo,
    correo,
    clerk_user_id,
    es_admin,
    fecha_registro,
    ultima_actividad
FROM investigadores 
WHERE correo = 'drksh2015@gmail.com';

-- 6. Ver columnas que faltan (comparar con lo esperado)
SELECT 
    'clerk_user_id' as columna,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='investigadores' AND column_name='clerk_user_id'
    ) THEN '✅ Existe' ELSE '❌ Falta' END as estado
UNION ALL
SELECT 
    'ultima_actividad',
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='investigadores' AND column_name='ultima_actividad'
    ) THEN '✅ Existe' ELSE '❌ Falta' END
UNION ALL
SELECT 
    'es_admin',
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='investigadores' AND column_name='es_admin'
    ) THEN '✅ Existe' ELSE '❌ Falta' END
UNION ALL
SELECT 
    'nombres',
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='investigadores' AND column_name='nombres'
    ) THEN '✅ Existe' ELSE '❌ Falta' END
UNION ALL
SELECT 
    'apellidos',
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='investigadores' AND column_name='apellidos'
    ) THEN '✅ Existe' ELSE '❌ Falta' END
UNION ALL
SELECT 
    'ultimo_grado_estudios',
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='investigadores' AND column_name='ultimo_grado_estudios'
    ) THEN '✅ Existe' ELSE '❌ Falta' END;
