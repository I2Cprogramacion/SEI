-- scripts/populate-dashboard-stats.sql
--
-- Script para derivar y poblar columnas de estadísticas útiles para el dashboard
-- - Añade columnas numéricas si no existen: publicaciones_count, proyectos_count, conexiones_count, perfil_completo_percent
-- - Rellena esas columnas a partir de campos existentes (articulos, proyectos_investigacion, etc.)
-- - Es idempotente: puede ejecutarse varias veces sin efectos adversos
--
-- Advertencia: revisa y haz backup antes de ejecutar en producción.
-- Cómo ejecutar (ejemplo local usando psql):
-- psql "postgres://user:pass@host:port/dbname" -f scripts/populate-dashboard-stats.sql

BEGIN;

-- 1) Añadir columnas si no existen
ALTER TABLE investigadores
  ADD COLUMN IF NOT EXISTS publicaciones_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS proyectos_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS conexiones_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS perfil_completo_percent INTEGER DEFAULT 0;

-- 2) Rellenar publicaciones_count a partir del campo `articulos` (lineas separadas por \n)
UPDATE investigadores
SET publicaciones_count = (
  CASE
    WHEN articulos IS NULL OR trim(articulos) = '' THEN 0
    ELSE array_length(regexp_split_to_array(articulos, E'\n'), 1)
  END
);

-- 3) Rellenar proyectos_count a partir del campo `proyectos_investigacion` (lineas separadas por \n)
UPDATE investigadores
SET proyectos_count = (
  CASE
    WHEN proyectos_investigacion IS NULL OR trim(proyectos_investigacion) = '' THEN 0
    ELSE array_length(regexp_split_to_array(proyectos_investigacion, E'\n'), 1)
  END
);

-- 4) Rellenar conexiones_count si existe una tabla `conexiones` con columna investigador_id
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'conexiones') THEN
    -- Asumimos que la tabla `conexiones` tiene una columna `investigador_id` (ajustar si tiene otro nombre)
    EXECUTE '
      UPDATE investigadores SET conexiones_count = COALESCE((SELECT COUNT(*) FROM conexiones c WHERE c.investigador_id = investigadores.id), 0);
    '; 
  ELSE
    -- Si no existe tabla conexiones, mantenemos el valor actual (por defecto 0)
    RAISE NOTICE 'Tabla public.conexiones no encontrada, se omite actualización de conexiones_count';
  END IF;
END$$;

-- 5) Calcular porcentaje de perfil completo basado en 8 campos clave (igual lógica que backend)
-- Lista de campos: nombre_completo, correo, telefono, institucion, area_investigacion, linea_investigacion, ultimo_grado_estudios, empleo_actual
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
;

-- 6) (Opcional) Mostrar resumen de actualización
-- Retorna un resumen básico de cuantos registros fueron actualizados (Postgres no devuelve filas afectadas para múltiples UPDATE separados en un script sin usar PL/pgSQL)
-- Puedes ejecutar las siguientes consultas manualmente después de ejecutar el script para verificar:
-- SELECT COUNT(*) AS total_investigadores FROM investigadores;
-- SELECT COUNT(*) FILTER (WHERE publicaciones_count > 0) AS with_publicaciones, COUNT(*) FILTER (WHERE proyectos_count > 0) AS with_proyectos, COUNT(*) FILTER (WHERE conexiones_count > 0) AS with_conexiones, AVG(perfil_completo_percent) AS avg_perfil FROM investigadores;

COMMIT;

-- Fin del script
