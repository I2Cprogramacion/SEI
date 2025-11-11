-- scripts/inspect-db-for-dashboard-sqltext.sql
-- Safe, non-interactive inspector that DOES NOT execute dynamic SQL.
-- It lists which of the relevant columns exist and generates the exact SELECT statements
-- you can copy-paste to run in your client. This avoids parse-time errors in clients
-- that don't support psql meta-commands or DO blocks output.

-- 1) Show relevant columns that exist in the investigadores table
SELECT column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'investigadores'
  AND column_name IN (
    'articulos','proyectos_investigacion','linea_investigacion','area_investigacion','cv_url','dictamen_url',
    'telefono','institucion','ultimo_grado_estudios','empleo_actual','publicaciones_count','proyectos_count','conexiones_count','perfil_completo_percent'
  )
ORDER BY column_name;

-- 2) Total rows
SELECT COUNT(*) AS total_investigadores FROM investigadores;

-- 3) For each existing column above, this query will produce a text SQL statement (one per row)
--    that you can copy & run to get the non-empty counts.
SELECT
  format('SELECT %L AS column_name, COUNT(*) AS non_empty_count FROM investigadores WHERE %I IS NOT NULL AND length(trim(%I)) > 0;', column_name, column_name, column_name) AS sql_to_run
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'investigadores'
  AND column_name IN (
    'articulos','proyectos_investigacion','linea_investigacion','area_investigacion','cv_url','dictamen_url',
    'telefono','institucion','ultimo_grado_estudios','empleo_actual'
  )
ORDER BY column_name;

-- 4) For numeric columns you may want a simpler statement; generate them separately
SELECT
  format('SELECT %L AS column_name, COUNT(*) AS rows_with_value FROM investigadores WHERE %I IS NOT NULL;', column_name, column_name) AS sql_to_run
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'investigadores'
  AND column_name IN ('publicaciones_count','proyectos_count','conexiones_count','perfil_completo_percent')
ORDER BY column_name;

-- 5) Build a sample SELECT projection (text) including only available extra columns so you can run it safely.
--    This produces one SQL statement that you can copy-paste to inspect up to 50 rows.
WITH available_cols AS (
  SELECT column_name
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'investigadores'
    AND column_name IN ('telefono','institucion','linea_investigacion','area_investigacion','publicaciones_count','proyectos_count','conexiones_count','perfil_completo_percent','cv_url','dictamen_url','articulos','proyectos_investigacion')
  ORDER BY ordinal_position
)
SELECT
  'SELECT id, nombre_completo, correo' ||
  COALESCE(('' || string_agg(', ' || quote_ident(column_name), '')),'')
  || ' FROM investigadores ORDER BY id LIMIT 50;' AS sample_select
FROM available_cols;

-- End of file
