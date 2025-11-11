-- scripts/inspect-db-for-dashboard-portable.sql
-- Portable, read-only inspection script for Postgres
-- Does NOT use psql meta-commands and avoids selecting non-existent columns
-- Uses PL/pgSQL DO blocks to run conditional checks and RAISE NOTICE for results
-- Run with any Postgres client that accepts SQL/PLpgSQL (psql, pgAdmin, etc.)

-- 1) List columns of table investigadores
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'investigadores'
ORDER BY ordinal_position;

-- 2) Total rows
SELECT COUNT(*) AS total_investigadores FROM investigadores;

-- 3) For each relevant field, check existence and produce a count of non-empty values
DO $$
DECLARE
  col_exists boolean;
  cnt bigint;
BEGIN
  -- helper to check and print counts for a column
  FOR col IN SELECT * FROM (VALUES
    ('articulos'),
    ('proyectos_investigacion'),
    ('linea_investigacion'),
    ('area_investigacion'),
    ('cv_url'),
    ('dictamen_url'),
    ('telefono'),
    ('institucion'),
    ('ultimo_grado_estudios'),
    ('empleo_actual'),
    ('publicaciones_count'),
    ('proyectos_count'),
    ('conexiones_count'),
    ('perfil_completo_percent')
  ) AS v(col_name)
  LOOP
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'investigadores' AND column_name = col.col_name
    ) INTO col_exists;

    IF col_exists THEN
      EXECUTE format('SELECT COUNT(*) FROM investigadores WHERE %I IS NOT NULL AND length(trim(%I)) > 0', col.col_name, col.col_name) INTO cnt;
      -- For numeric columns (those ending with _count or _percent) use simpler existence check
      IF col.col_name LIKE '%_count' OR col.col_name LIKE '%_percent' THEN
        EXECUTE format('SELECT COUNT(*) FROM investigadores WHERE %I IS NOT NULL', col.col_name) INTO cnt;
      END IF;
      RAISE NOTICE '%: %', col.col_name, cnt;
    ELSE
      RAISE NOTICE '%: (columna no encontrada)', col.col_name;
    END IF;
  END LOOP;
END$$;

-- 4) Sample rows: build dynamic select projecting only available columns to avoid errors
DO $$
DECLARE
  cols text := 'id, nombre_completo, correo';
  rec record;
  exist boolean;
  extra_cols text[] := ARRAY['telefono','institucion','linea_investigacion','area_investigacion','publicaciones_count','proyectos_count','conexiones_count','perfil_completo_percent','cv_url','dictamen_url','articulos','proyectos_investigacion'];
  sel text;
BEGIN
  FOREACH c IN ARRAY extra_cols LOOP
    SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='investigadores' AND column_name = c) INTO exist;
    IF exist THEN
      cols := cols || ', ' || c;
    END IF;
  END LOOP;

  sel := format('SELECT %s FROM investigadores ORDER BY id LIMIT 50', cols);
  RAISE NOTICE 'Executing sample query: %', sel;
  FOR rec IN EXECUTE sel LOOP
    -- Print each row as a composite (client may display NOTICEs differently)
    RAISE NOTICE '%', rec;
  END LOOP;
END$$;

-- 5) Check if conexiones table exists and if so show top 20 by count
DO $$
DECLARE
  exists_con boolean;
BEGIN
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='conexiones') INTO exists_con;
  IF NOT exists_con THEN
    RAISE NOTICE 'Tabla conexiones no encontrada.';
  ELSE
    RAISE NOTICE 'Tabla conexiones encontrada. Top 20 investigadores por conexiones:';
    -- Print id + count for top 20
    PERFORM 1;
    -- Execute a query and raise notices for top 20
    EXECUTE '
      SELECT i.id, i.nombre_completo, COALESCE(c.cnt,0) AS conexiones_count_from_table
      FROM investigadores i
      LEFT JOIN (SELECT investigador_id, COUNT(*) AS cnt FROM conexiones GROUP BY investigador_id) c ON c.investigador_id = i.id
      ORDER BY conexiones_count_from_table DESC NULLS LAST
      LIMIT 20
    '
    INTO STRICT;
  END IF;
END$$;

-- Note: some clients may not show RAISE NOTICE outputs prominently. If so, run manual SELECTs as needed.

-- End of script
