# OCR Server

Microservicio Node.js para procesamiento de PDFs vía OCR.

## Instalación

```
pnpm install
```

## Ejecución local

```
pnpm start
```

El servidor escuchará en el puerto definido por la variable de entorno `PORT` (por defecto 3000).

## Despliegue en Railway

1. Sube el contenido de esta rama a Railway como un nuevo proyecto Node.js.
2. Configura la variable de entorno `PORT` si Railway no la define automáticamente.
3. El endpoint principal es `/process-pdf` (POST, campo `file`).
