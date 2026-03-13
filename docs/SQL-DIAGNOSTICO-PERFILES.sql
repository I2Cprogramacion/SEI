-- Script de Diagnóstico y Limpieza para Problemas de Perfiles
-- ============================================================
-- Usar solo con acceso de administrador a la BD

-- ============================================================
-- DIAGNÓSTICO 1: Verificar usuarios sin perfil completo
-- ============================================================
SELECT 
  id,
  correo,
  clerk_user_id,
  nombre_completo,
  activo,
  fecha_registro,
  -- Campos críticos
  cv_url,
  empleo_actual,
  area_investigacion,
  linea_investigacion
FROM investigadores
WHERE 
  -- Usuario activo pero sin datos críticos
  activo = true AND (
    nombre_completo IS NULL OR nombre_completo = '' OR
    correo IS NULL OR correo = '' OR
    cv_url IS NULL OR cv_url = '' OR
    empleo_actual IS NULL OR empleo_actual = '' OR
    area_investigacion IS NULL OR area_investigacion = ''
  )
ORDER BY fecha_registro DESC;

-- ============================================================
-- DIAGNÓSTICO 2: Usuarios con email case inconsistente
-- ============================================================
SELECT 
  id,
  correo,
  LOWER(correo) as correo_lower,
  clerk_user_id,
  COUNT(*) as duplicados
FROM investigadores
GROUP BY LOWER(correo), id, correo, clerk_user_id
HAVING COUNT(*) > 1
ORDER BY COUNT(*) DESC;

-- ============================================================
-- DIAGNÓSTICO 3: Usuarios sin clerk_user_id
-- ============================================================
SELECT 
  id,
  correo,
  nombre_completo,
  clerk_user_id,
  fecha_registro
FROM investigadores
WHERE clerk_user_id IS NULL OR clerk_user_id = ''
ORDER BY fecha_registro DESC;

-- ============================================================
-- DIAGNÓSTICO 4: Verificar usuario específico
-- ============================================================
-- Reemplazar 'attanodaron@gmail.com' con el email a verificar
SELECT 
  id,
  correo,
  nombres,
  apellidos,
  nombre_completo,
  clerk_user_id,
  cv_url,
  empleo_actual,
  area_investigacion,
  linea_investigacion,
  activo,
  fecha_registro,
  es_admin,
  es_evaluador
FROM investigadores
WHERE LOWER(correo) = LOWER('attanodaron@gmail.com')
LIMIT 1;

-- ============================================================
-- DIAGNÓSTICO 5: Usuarios registrados hoy
-- ============================================================
SELECT 
  id,
  correo,
  nombre_completo,
  activo,
  fecha_registro,
  -- Campos críticos que falta verificar
  cv_url,
  empleo_actual
FROM investigadores
WHERE DATE(fecha_registro) = CURRENT_DATE
ORDER BY fecha_registro DESC;

-- ============================================================
-- LIMPIEZA 1: Normalizar emails a lowercase
-- ============================================================
-- CUIDADO: Hacer backup antes de ejecutar
UPDATE investigadores
SET correo = LOWER(correo)
WHERE correo != LOWER(correo);

-- ============================================================
-- LIMPIEZA 2: Eliminar usuarios duplicados (keep newest)
-- ============================================================
-- CUIDADO: Hacer backup antes de ejecutar
WITH ranked_investigadores AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (PARTITION BY LOWER(correo) ORDER BY fecha_registro DESC) as rn
  FROM investigadores
  WHERE activo = true
)
DELETE FROM investigadores
WHERE id IN (
  SELECT id FROM ranked_investigadores WHERE rn > 1
);

-- ============================================================
-- LIMPIEZA 3: Eliminar usuario específico problemático
-- ============================================================
-- CUIDADO: Ejecutar solo si estás seguro
-- DELETE FROM investigadores 
-- WHERE LOWER(correo) = 'attanodaron@gmail.com'
-- AND activo = true;

-- Primero, SOLO LEER:
SELECT id, correo, nombre_completo, fecha_registro 
FROM investigadores 
WHERE LOWER(correo) = 'attanodaron@gmail.com';

-- Si todo se ve bien, luego ejecutar:
-- DELETE FROM investigadores 
-- WHERE LOWER(correo) = 'attanodaron@gmail.com';

-- ============================================================
-- VERIFICACIÓN: Confirmar que problema se solucionó
-- ============================================================
SELECT 
  id,
  correo,
  nombre_completo,
  clerk_user_id,
  cv_url,
  empleo_actual
FROM investigadores
WHERE LOWER(correo) = 'attanodaron@gmail.com'
LIMIT 1;

-- Debe devolver 1 fila con todos los campos completos

-- ============================================================
-- AUDITORÍA: Ver cambios recientes
-- ============================================================
SELECT 
  id,
  correo,
  fecha_registro,
  es_admin,
  es_evaluador,
  activo,
  CASE 
    WHEN fecha_registro > NOW() - INTERVAL '1 hour' THEN '⏪ Hace < 1 hora'
    WHEN fecha_registro > NOW() - INTERVAL '1 day' THEN '📅 Hoy'
    ELSE '📊 Antes de hoy'
  END as "Cuándo"
FROM investigadores
ORDER BY fecha_registro DESC
LIMIT 20;

-- ============================================================
-- SALUD DE DATOS: Resumen general
-- ============================================================
SELECT 
  COUNT(*) as total_usuarios,
  SUM(CASE WHEN activo = true THEN 1 ELSE 0 END) as activos,
  SUM(CASE WHEN clerk_user_id IS NOT NULL THEN 1 ELSE 0 END) as con_clerk_id,
  SUM(CASE WHEN cv_url IS NOT NULL AND cv_url != '' THEN 1 ELSE 0 END) as con_cv,
  SUM(CASE WHEN es_admin = true THEN 1 ELSE 0 END) as admins,
  SUM(CASE WHEN es_evaluador = true THEN 1 ELSE 0 END) as evaluadores
FROM investigadores;

-- ============================================================
-- EXPORT: Usuarios que pueden tener problemas
-- ============================================================
SELECT 
  correo,
  nombre_completo,
  'PERFIL_INCOMPLETO' as problema,
  fecha_registro
FROM investigadores
WHERE activo = true AND (
  cv_url IS NULL OR cv_url = '' OR
  empleo_actual IS NULL OR empleo_actual = ''
)
ORDER BY fecha_registro DESC;
