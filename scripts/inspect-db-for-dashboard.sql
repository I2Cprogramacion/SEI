-- scripts/inspect-db-for-dashboard.sql
-- Read-only inspection script to check which fields and data are available
-- Useful to verify what the dashboard can derive from the database before populating anything.
-- Run with psql or your preferred DB client. Example:
-- psql "postgres://USER:PASS@HOST:PORT/DBNAME" -f scripts/inspect-db-for-dashboard.sql

\echo '--- 1) columnas de la tabla investigadores ---'
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'investigadores'
ORDER BY ordinal_position;

\echo '\n--- 2) resumen de filas totales ---'
SELECT COUNT(*) AS total_investigadores FROM investigadores;

\echo '\n--- 3) conteo de valores no nulos por campo relevante ---'
SELECT
  SUM(CASE WHEN articulos IS NOT NULL AND trim(articulos) <> '' THEN 1 ELSE 0 END) AS with_articulos,
  SUM(CASE WHEN proyectos_investigacion IS NOT NULL AND trim(proyectos_investigacion) <> '' THEN 1 ELSE 0 END) AS with_proyectos_investigacion,
  SUM(CASE WHEN linea_investigacion IS NOT NULL AND trim(linea_investigacion) <> '' THEN 1 ELSE 0 END) AS with_linea_investigacion,
  SUM(CASE WHEN area_investigacion IS NOT NULL AND trim(area_investigacion) <> '' THEN 1 ELSE 0 END) AS with_area_investigacion,
  SUM(CASE WHEN cv_url IS NOT NULL AND trim(cv_url) <> '' THEN 1 ELSE 0 END) AS with_cv_url,
  SUM(CASE WHEN dictamen_url IS NOT NULL AND trim(dictamen_url) <> '' THEN 1 ELSE 0 END) AS with_dictamen_url,
  SUM(CASE WHEN telefono IS NOT NULL AND trim(telefono) <> '' THEN 1 ELSE 0 END) AS with_telefono,
  SUM(CASE WHEN institucion IS NOT NULL AND trim(institucion) <> '' THEN 1 ELSE 0 END) AS with_institucion,
  SUM(CASE WHEN ultimo_grado_estudios IS NOT NULL AND trim(ultimo_grado_estudios) <> '' THEN 1 ELSE 0 END) AS with_ultimo_grado_estudios,
  SUM(CASE WHEN empleo_actual IS NOT NULL AND trim(empleo_actual) <> '' THEN 1 ELSE 0 END) AS with_empleo_actual,
  SUM(CASE WHEN publicaciones_count IS NOT NULL THEN 1 ELSE 0 END) AS has_publicaciones_count_col,
  SUM(CASE WHEN proyectos_count IS NOT NULL THEN 1 ELSE 0 END) AS has_proyectos_count_col,
  SUM(CASE WHEN conexiones_count IS NOT NULL THEN 1 ELSE 0 END) AS has_conexiones_count_col,
  SUM(CASE WHEN perfil_completo_percent IS NOT NULL THEN 1 ELSE 0 END) AS has_perfil_completo_percent_col
FROM investigadores;

\echo '\n--- 4) sample de registros (limit 50) ---'
SELECT id, nombre_completo, correo, telefono, institucion, linea_investigacion, area_investigacion,
  (CASE WHEN articulos IS NOT NULL AND trim(articulos) <> '' THEN 1 ELSE 0 END) AS tiene_articulos,
  (CASE WHEN proyectos_investigacion IS NOT NULL AND trim(proyectos_investigacion) <> '' THEN 1 ELSE 0 END) AS tiene_proyectos_investigacion,
  publicaciones_count, proyectos_count, conexiones_count, perfil_completo_percent, cv_url, dictamen_url
FROM investigadores
ORDER BY id
LIMIT 50;

\echo '\n--- 5) existe tabla conexiones? ---'
SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'conexiones') AS conexiones_table_exists;

\echo '\n--- 6) si existe conexiones -> top 20 investigadores por conexiones (count) ---'
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'conexiones') THEN
    RAISE NOTICE 'Tabla conexiones encontrada. Listando top 20 por conteo...';
  ELSE
    RAISE NOTICE 'Tabla conexiones no encontrada. Omitiendo este paso.';
  END IF;
END$$;

-- The following query will run only if the table exists; some psql clients may still error if table missing,
-- so we run it conditionally using a simple check in SQL (non-PL/pgSQL) using information_schema.

SELECT
  i.id,
  i.nombre_completo,
  COALESCE(c.cnt,0) AS conexiones_count_from_table
FROM investigadores i
LEFT JOIN (
  SELECT investigador_id, COUNT(*) AS cnt
  FROM conexiones
  GROUP BY investigador_id
) c ON c.investigador_id = i.id
ORDER BY conexiones_count_from_table DESC NULLS LAST
LIMIT 20;

\echo '\n--- 7) recomendaciones ---'
SELECT 'Si faltan columnas, considera ejecutar scripts/populate-dashboard-stats.sql (opcional) o revisar el API /api/investigadores/perfil para traer campos necesarios' AS info;

-- Fin del script
