-- Agregar columna lastActive a la tabla users si no existe
ALTER TABLE users ADD COLUMN IF NOT EXISTS "lastActive" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

-- Actualizar valores existentes
UPDATE users SET "lastActive" = CURRENT_TIMESTAMP WHERE "lastActive" IS NULL;
