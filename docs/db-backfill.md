# Backfill de campos derivados (scripts)

Este documento describe los scripts disponibles para añadir y rellenar columnas derivadas en la tabla `investigadores`.

Archivos relevantes en `scripts/`

- `populate-missing-profile-12-fixed.sql` — Script idempotente que añade las columnas derivadas (si no existen) y backfillea solo el registro del investigador con `id = '12'`. Incluye un bloque `DO` originalmente, pero está comentado para evitar errores en clientes SQL que no soportan dollar-quoted blocks; al final del archivo hay un fallback comentado para ejecutar un `UPDATE` manual para `conexiones_count` si la tabla `conexiones` existe.

- `populate-missing-profile-all-safe.sql` — Script nuevo (set-based) que realiza el backfill para TODOS los investigadores. No usa DO/PLPGSQL; incluye instrucciones y recomendaciones para crear índices temporales y ejecutar por lotes si la base de datos es grande.

Cómo ejecutar (ejemplo PowerShell + psql)

```powershell
$env:PGPASSWORD = 'tu_contraseña'
psql -h <host> -U <usuario> -d <basedatos> -f .\scripts\populate-missing-profile-all-safe.sql
```

Notas y recomendaciones

- Haz siempre una copia de seguridad (dump) antes de ejecutar cambios en producción.
- Para `conexiones_count`: si la tabla `conexiones` existe y es grande, crea un índice `CONCURRENTLY` sobre `conexiones(investigador_id)` antes de ejecutar el UPDATE set-based para acelerar el conteo:

```sql
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conexiones_investigador_id ON conexiones(investigador_id);
```

- Si no puedes crear índices o la tabla es enorme, ejecuta los UPDATEs por lotes (p. ej. por rangos de id) para evitar bloqueos largos.

Verificación rápida (después de ejecutar)

```sql
SELECT COUNT(*) FROM investigadores WHERE publicaciones_count IS NULL OR proyectos_count IS NULL OR perfil_completo_percent IS NULL;
SELECT id, nombre_completo, publicaciones_count, proyectos_count, conexiones_count, perfil_completo_percent FROM investigadores ORDER BY id LIMIT 50;
```

Si quieres, puedo generar:
- un script adicional que haga el UPDATE de `conexiones_count` para todos los investigadores de forma automática (opción segura),
- o un script que ejecute los UPDATEs por lotes.

