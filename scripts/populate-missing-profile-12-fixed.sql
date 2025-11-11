-- scripts/populate-missing-profile-12-fixed.sql
-- Rellena solo los campos DERIVADOS que estén vacíos (NULL o 0) para investigador id = '12'
-- Nota: la columna `id` en tu tabla es de tipo text/character varying, por eso usamos '12' (cadena)
-- 1) publicaciones_count: si está vacío y existe contenido en articulos
-- Nota: no usamos BEGIN/COMMIT para evitar que clientes muestren "ROLLBACK required"
-- si alguna sentencia falla. En su lugar, ejecuta este script tal cual; las
-- operaciones DDL se hacen con IF NOT EXISTS para que el script sea idempotente.

-- Aseguramos que las columnas derivadas existen (idempotente)
ALTER TABLE investigadores ADD COLUMN IF NOT EXISTS publicaciones_count INTEGER;
ALTER TABLE investigadores ADD COLUMN IF NOT EXISTS proyectos_count INTEGER;
ALTER TABLE investigadores ADD COLUMN IF NOT EXISTS conexiones_count INTEGER;
ALTER TABLE investigadores ADD COLUMN IF NOT EXISTS perfil_completo_percent INTEGER;

-- 1) publicaciones_count: si está vacío y existe contenido en articulos
UPDATE investigadores
SET publicaciones_count = (
  CASE
    WHEN articulos IS NULL OR trim(articulos) = '' THEN 0
    ELSE array_length(regexp_split_to_array(articulos, E'\n'), 1)
  END
)
WHERE id = '12'
  AND (publicaciones_count IS NULL OR publicaciones_count = 0)
  AND articulos IS NOT NULL AND trim(articulos) <> '';

-- 2) proyectos_count: si está vacío y existe contenido en proyectos_investigacion
UPDATE investigadores
SET proyectos_count = (
  CASE
    WHEN proyectos_investigacion IS NULL OR trim(proyectos_investigacion) = '' THEN 0
    ELSE array_length(regexp_split_to_array(proyectos_investigacion, E'\n'), 1)
  END
)
WHERE id = '12'
  AND (proyectos_count IS NULL OR proyectos_count = 0)
  AND proyectos_investigacion IS NOT NULL AND trim(proyectos_investigacion) <> '';

-- 3) conexiones_count: backfill seguro y automático (opción recomendada)
-- Ejecuta el backfill únicamente si la tabla `conexiones` existe; en caso
-- contrario se emite un NOTICE y no se modifica nada.
-- NOTE: Algunos clientes lanzan "unterminated dollar-quoted string" al intentar
-- ejecutar bloques DO/PLPGSQL (p.ej. ciertos modos de pgAdmin/DBeaver).
-- Si tu cliente soporta DO, puedes descomentar el bloque siguiente y ejecutarlo
-- (ejecutarlo en psql suele funcionar). Si no, utiliza el fallback manual
-- que viene más abajo (comprobación + UPDATE separado).
--
-- DO $$
-- BEGIN
--   IF EXISTS (
--     SELECT 1 FROM information_schema.tables
--     WHERE table_schema = 'public' AND table_name = 'conexiones'
--   ) THEN
--     EXECUTE format(
--       'UPDATE investigadores\n'
--       || 'SET conexiones_count = COALESCE((SELECT COUNT(*) FROM conexiones c WHERE c.investigador_id = %L), 0)\n'
--       || 'WHERE id = %L\n'
--       || '  AND (conexiones_count IS NULL OR conexiones_count = 0);',
--       '12', '12'
--     );
--   ELSE
--     RAISE NOTICE 'Table "conexiones" does not exist in schema public — skipping conexiones_count backfill.';
--   END IF;
-- END
-- $$;

-- 4) perfil_completo_percent: calcular solo si está vacío o en 0
UPDATE investigadores
SET perfil_completo_percent = (
  (
    (CASE WHEN nombre_completo IS NOT NULL AND trim(nombre_completo) <> '' THEN 1 ELSE 0 END)
    + (CASE WHEN correo IS NOT NULL AND trim(correo) <> '' THEN 1 ELSE 0 END)
    + (CASE WHEN telefono IS NOT NULL AND trim(telefono) <> '' THEN 1 ELSE 0 END)
    + (CASE WHEN institucion IS NOT NULL AND trim(institucion) <> '' THEN 1 ELSE 0 END)
    + (CASE WHEN area_investigacion IS NOT NULL AND trim(area_investigacion) <> '' THEN 1 ELSE 0 END)
    + (CASE WHEN linea_investigacion IS NOT NULL AND trim(linea_investigacion) <> '' THEN 1 ELSE 0 END)
    + (CASE WHEN ultimo_grado_estudios IS NOT NULL AND trim(ultimo_grado_estudios) <> '' THEN 1 ELSE 0 END)
    + (CASE WHEN empleo_actual IS NOT NULL AND trim(empleo_actual) <> '' THEN 1 ELSE 0 END)
  ) * 100 / 8
)::INTEGER
WHERE id = '12'
  AND (perfil_completo_percent IS NULL OR perfil_completo_percent = 0);

-- Nota: no dejamos COMMIT ni BEGIN en este script para evitar errores en clientes
-- que no abren una transacción explícita (p.ej. pgAdmin, DBeaver en modo simple).
-- Si prefieres ejecutar todo en una transacción, envuélvelo en BEGIN/COMMIT manualmente.

-- Opcional: chequear el registro actualizado
-- SELECT id, nombre_completo, correo, telefono, institucion, publicaciones_count, proyectos_count, conexiones_count, perfil_completo_percent FROM investigadores WHERE id = '12';

-- ==================================================================
-- Fallback y notas para clientes que no aceptan DO $$ ... $$ blocks
-- ==================================================================
-- Algunos clientes/editores SQL (o ciertos modos) no permiten ejecutar
-- bloques DO/PLPGSQL en scripts por defecto. Si tu cliente no acepta el
-- bloque DO anterior, puedes ejecutar manualmente estas sentencias *solo*
-- si confirmas que la tabla `conexiones` existe en el esquema `public`.

-- 1) Verificar existencia de la tabla conexiones (ejecutar y confirmar que devuelve true):
-- SELECT EXISTS (
--   SELECT 1 FROM information_schema.tables
--   WHERE table_schema = 'public' AND table_name = 'conexiones'
-- );

-- 2) Si la consulta anterior devolvió true, ejecutar este UPDATE manualmente:
-- UPDATE investigadores
-- SET conexiones_count = COALESCE((SELECT COUNT(*) FROM conexiones c WHERE c.investigador_id = '12'), 0)
-- WHERE id = '12' AND (conexiones_count IS NULL OR conexiones_count = 0);

-- Ejecución recomendada con psql en PowerShell (ejemplo):
-- $env:PGPASSWORD = 'tu_contraseña'
-- psql -h <host> -U <usuario> -d <basedatos> -f .\scripts\populate-missing-profile-12-fixed.sql

-- Verificación rápida (después de ejecutar):
-- SELECT id, nombre_completo, publicaciones_count, proyectos_count, conexiones_count, perfil_completo_percent
-- FROM investigadores
-- WHERE id = '12';

-- Si quieres que genere un script para backfill de TODOS los investigadores
-- (set-based, con recomendaciones de índices y ejecución por lotes para tablas
-- grandes), dímelo y lo creo como `scripts/populate-missing-profile-all-safe.sql`.

