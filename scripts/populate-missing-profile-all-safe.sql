-- scripts/populate-missing-profile-all-safe.sql
-- Backfill seguro y set-based para TODOS los investigadores.
-- Diseñado para ejecutarse en clientes que no aceptan DO/PLPGSQL.
-- Recomendaciones:
--  - Ejecutar en un mantenimiento de baja carga si la tabla es grande.
--  - Ejecutar dentro de BEGIN/COMMIT si quieres revertir todo en caso de error.
--  - Crear índices temporales si las subconsultas COUNT(*) escanean tablas grandes
--    (p.ej. conexiones(investigador_id)) y luego eliminarlos.

-- 0) idempotente: aseguramos que las columnas existan
ALTER TABLE investigadores ADD COLUMN IF NOT EXISTS publicaciones_count INTEGER;
ALTER TABLE investigadores ADD COLUMN IF NOT EXISTS proyectos_count INTEGER;
ALTER TABLE investigadores ADD COLUMN IF NOT EXISTS conexiones_count INTEGER;
ALTER TABLE investigadores ADD COLUMN IF NOT EXISTS perfil_completo_percent INTEGER;

-- 1) publicaciones_count: set-based para todos los registros que lo necesiten
UPDATE investigadores
SET publicaciones_count = (
  CASE
    WHEN articulos IS NULL OR trim(articulos) = '' THEN 0
    ELSE array_length(regexp_split_to_array(articulos, E'\n'), 1)
  END
)
WHERE (publicaciones_count IS NULL OR publicaciones_count = 0)
  AND articulos IS NOT NULL AND trim(articulos) <> '';

-- 2) proyectos_count: set-based para todos los registros que lo necesiten
UPDATE investigadores
SET proyectos_count = (
  CASE
    WHEN proyectos_investigacion IS NULL OR trim(proyectos_investigacion) = '' THEN 0
    ELSE array_length(regexp_split_to_array(proyectos_investigacion, E'\n'), 1)
  END
)
WHERE (proyectos_count IS NULL OR proyectos_count = 0)
  AND proyectos_investigacion IS NOT NULL AND trim(proyectos_investigacion) <> '';

-- 3) conexiones_count: OPCIONAL y conservador
-- Si la tabla `conexiones` existe, ejecuta el UPDATE siguiente. Si no existe,
-- déjalo comentado o ejecútalo solo después de restaurar/crear la tabla.
-- Primero, comprueba existencia (ejecutar manualmente):
-- SELECT EXISTS (
--   SELECT 1 FROM information_schema.tables
--   WHERE table_schema = 'public' AND table_name = 'conexiones'
-- );
-- Si devuelve true, puedes ejecutar este UPDATE set-based:
-- UPDATE investigadores
-- SET conexiones_count = COALESCE((SELECT COUNT(*) FROM conexiones c WHERE c.investigador_id = investigadores.id), 0)
-- WHERE (conexiones_count IS NULL OR conexiones_count = 0);
--
-- Recomendación de índice (si la tabla conexiones es grande):
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conexiones_investigador_id ON conexiones(investigador_id);
-- Ejecuta el UPDATE anterior después de crear el índice para acelerar el COUNT.

-- 4) perfil_completo_percent: calculo set-based para todos los registros que lo necesiten
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
WHERE (perfil_completo_percent IS NULL OR perfil_completo_percent = 0);

-- Verificación rápida después de ejecutar:
-- SELECT COUNT(*) FROM investigadores WHERE publicaciones_count IS NULL OR proyectos_count IS NULL OR perfil_completo_percent IS NULL;
-- SELECT id, nombre_completo, publicaciones_count, proyectos_count, conexiones_count, perfil_completo_percent FROM investigadores ORDER BY id LIMIT 50;

-- Ejecución recomendada (PowerShell + psql):
-- $env:PGPASSWORD = 'tu_contraseña'
-- psql -h <host> -U <usuario> -d <basedatos> -f .\scripts\populate-missing-profile-all-safe.sql

-- Si la tabla es grande y prefieres evitar bloqueos largos:
--  - crea índices necesarios CONCURRENTLY
--  - ejecuta los UPDATEs por lotes (p.ej. por rango de id) o durante ventanas de mantenimiento
