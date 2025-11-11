-- scripts/populate-missing-profile-12-for-neon.sql
-- Safe, idempotent script to ensure investigator id = '12' has publications
-- If `articulos` is empty or NULL it will be populated with example lines (you can edit these
-- before running to use real publication texts). Then derived counters are backfilled.
-- This script modifies only the `articulos` field when it is empty and derived counters
-- when they are NULL or 0. It will NOT overwrite existing `articulos` content.

-- Ensure derived columns exist (idempotent)
ALTER TABLE investigadores ADD COLUMN IF NOT EXISTS publicaciones_count INTEGER;
ALTER TABLE investigadores ADD COLUMN IF NOT EXISTS proyectos_count INTEGER;
ALTER TABLE investigadores ADD COLUMN IF NOT EXISTS conexiones_count INTEGER;
ALTER TABLE investigadores ADD COLUMN IF NOT EXISTS perfil_completo_percent INTEGER;

-- -----------------------------------------------------------------------------
-- Step 0: Populate `articulos` with example publications ONLY if it's NULL/empty
-- Edit the example lines below with the real publication entries if you want.
-- Each publication should be on its own line. The UI and API count publications by
-- splitting `articulos` on newlines.
-- -----------------------------------------------------------------------------
UPDATE investigadores
SET articulos = (
  'García, J.; López, M. (2021). Estudio sobre X. Revista de Ciencias.\n'
  || 'Pérez, A.; Ruiz, B. (2022). Avances en Y. Journal of Y.\n'
  || 'Hernández, C. (2023). Revisión Z. Revista Z.'
)
WHERE id = '12'
  AND (articulos IS NULL OR trim(articulos) = '');

-- -----------------------------------------------------------------------------
-- Step 1: Backfill publicaciones_count from articulos (only if NULL or 0)
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- Step 2: Backfill proyectos_count from proyectos_investigacion (only if NULL or 0)
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- Step 3: Backfill conexiones_count only if the table `conexiones` exists
-- This avoids errors in environments (like your Neon branch) where that table is missing.
-- -----------------------------------------------------------------------------
UPDATE investigadores
SET conexiones_count = COALESCE((
    SELECT COUNT(*) FROM conexiones c WHERE c.investigador_id = '12'
  ), 0)
WHERE id = '12'
  AND (conexiones_count IS NULL OR conexiones_count = 0)
  AND EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'conexiones'
  );

-- -----------------------------------------------------------------------------
-- Step 4: Compute perfil_completo_percent if NULL or 0
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- Verification: run this SELECT after executing the script to confirm changes
-- -----------------------------------------------------------------------------
-- SELECT id, nombre_completo, correo, telefono, articulos, publicaciones_count, proyectos_count, conexiones_count, perfil_completo_percent
-- FROM investigadores
-- WHERE id = '12';

-- Notes:
-- - The script only writes to `articulos` when it's empty. It will not overwrite
--   existing publication text. If you prefer different example publications, edit
--   the UPDATE that sets `articulos` before running.
-- - The conexiones_count update will be skipped silently if the `conexiones` table
--   does not exist in the public schema (avoids the error you saw).
-- - Run the file in Neon SQL Editor or via psql as described in repository docs.
