-- Script para verificar la estructura de la tabla investigadores en Neon
-- Ejecuta esto en tu consola de Neon para ver qué columnas existen

-- Ver todas las columnas de la tabla investigadores
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'investigadores'
ORDER BY ordinal_position;

-- Ver si hay datos en la tabla
SELECT COUNT(*) as total_registros FROM investigadores;

-- Ver los últimos 3 registros insertados (si existen)
SELECT 
    id,
    nombre_completo,
    correo,
    clerk_user_id,
    genero,
    tipo_perfil,
    nivel_investigador,
    municipio,
    fecha_registro
FROM investigadores 
ORDER BY fecha_registro DESC 
LIMIT 3;

