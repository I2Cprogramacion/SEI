# Instrucciones para Migrar la Tabla Institutions

## Problema
El error indica que la tabla `institutions` no tiene todas las columnas necesarias para guardar los datos del formulario.

## Solución: Ejecutar Script de Migración

### Opción 1: Ejecutar SQL directamente en Neon Console (Recomendado)

1. Ve a [Neon Console](https://console.neon.tech)
2. Selecciona tu proyecto
3. Abre el **SQL Editor**
4. Copia y pega el contenido completo del archivo `scripts/migrate-institutions-table.sql`
5. Ejecuta el script
6. Verifica que todas las columnas se hayan creado correctamente

### Opción 2: Ejecutar Script Automático (Requiere DATABASE_URL)

Si tienes `DATABASE_URL` configurada en tu archivo `.env.local`:

```bash
npm run migrate:institutions
```

O directamente:

```bash
node scripts/migrate-institutions-auto.js
```

### Verificar que la migración fue exitosa

Después de ejecutar el script, puedes verificar que todas las columnas existen ejecutando:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'institutions'
ORDER BY ordinal_position;
```

Deberías ver todas estas columnas:
- id, nombre, siglas, tipo, tipo_otro_especificar, año_fundacion, sitio_web, imagen_url, descripcion
- tipo_persona, rfc, razon_social, regimen_fiscal, actividad_economica
- curp, nombre_completo
- numero_escritura, fecha_constitucion, notario_publico, numero_notaria, registro_publico, objeto_social
- domicilio_fiscal (JSONB), representante_legal (JSONB), contacto_institucional (JSONB)
- areas_investigacion (JSONB), capacidad_investigacion, documentos (JSONB)
- ubicacion, activo, estado, created_at, updated_at

## Nota Importante

Si el error persiste después de ejecutar la migración, verifica:
1. Que estás conectado a la base de datos correcta
2. Que el script se ejecutó completamente sin errores
3. Que todas las columnas se crearon correctamente

