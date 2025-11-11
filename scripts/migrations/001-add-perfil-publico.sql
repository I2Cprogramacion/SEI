-- Migration: add perfil_publico column to investigadores if it doesn't exist
ALTER TABLE investigadores
  ADD COLUMN IF NOT EXISTS perfil_publico BOOLEAN DEFAULT TRUE;

-- Nota: ejecutar este script en tu consola de Postgres/Neon si prefieres aplicar la migración manualmente.
