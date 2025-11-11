-- Migration: 002-backfill-slugs.sql
-- Purpose: ensure `slug` column exists and backfill missing slugs for existing investigadores.
-- This script is idempotent: safe to run multiple times.

-- 1) Ensure slug column exists
ALTER TABLE investigadores
  ADD COLUMN IF NOT EXISTS slug VARCHAR(255);

-- 2) Attempt to enable unaccent extension (may require superuser; if not allowed, the script continues)
DO $$
BEGIN
  BEGIN
    CREATE EXTENSION IF NOT EXISTS unaccent;
  EXCEPTION WHEN OTHERS THEN
    -- ignore: some hosted DBs don't allow creating extensions
    RAISE NOTICE 'Could not create unaccent extension (may not be allowed). Proceeding without it.';
  END;
END$$;

-- 3) Backfill slugs for rows where slug is null or empty.
-- Preferred approach: use unaccent() if available to strip accents; otherwise use a simpler regexp.

-- Using unaccent if available
UPDATE investigadores
SET slug = lower(
    regexp_replace(
      unaccent(coalesce(nombre_completo, 'sin-nombre')),
      '[^a-zA-Z0-9]+', '-', 'g'
    )
  ) || '-' || substr(md5(coalesce(clerk_user_id, correo || id::text)), 1, 6)
WHERE (slug IS NULL OR slug = '')
  AND exists(SELECT 1 FROM pg_extension WHERE extname = 'unaccent');

-- Fallback if unaccent not present
UPDATE investigadores
SET slug = lower(
    regexp_replace(
      coalesce(nombre_completo, 'sin-nombre'),
      '[^a-zA-Z0-9]+', '-', 'g'
    )
  ) || '-' || substr(md5(coalesce(clerk_user_id, correo || id::text)), 1, 6)
WHERE (slug IS NULL OR slug = '')
  AND NOT exists(SELECT 1 FROM pg_extension WHERE extname = 'unaccent');

-- Note: This creates reasonably human-friendly and mostly-unique slugs.
-- If you want to enforce uniqueness at DB level, add a unique index after you validate there are no collisions:
-- CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_investigadores_slug ON investigadores (slug);

-- End of migration
