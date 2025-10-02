
# SEI

Plataforma del Sistema Estatal de Investigadores (SEI)

Sistema web para la gestión de perfiles académicos, registro de publicaciones y proyectos, colaboración entre investigadores y asignación de niveles. Incluye autenticación segura, integración con base de datos PostgreSQL (Neon), OCR para registro automatizado (microservicio Node.js en Railway) y paneles administrativos.

## Arquitectura actual
- **Frontend y API**: Next.js desplegado en Vercel (todas las rutas `/app` y `/api` funcionan en Vercel)
- **OCR**: Microservicio Node.js desplegado en Railway (recibe PDFs y extrae datos)
- **Base de datos**: PostgreSQL (Neon, Railway, Vercel Postgres, etc.)

## Flujo de OCR
1. El usuario sube un PDF desde el frontend (Vercel).
2. El endpoint `/api/ocr` reenvía el archivo al microservicio OCR en Railway usando la variable de entorno `PDF_PROCESSOR_URL`.
3. El microservicio OCR responde con los datos extraídos y el backend los guarda en la base de datos.

## Requisitos previos
- Node.js >= 18
- pnpm
- PostgreSQL (Neon, Railway, Vercel Postgres, etc.)

## Instalación y despliegue
1. Clona el repositorio:
	```
	git clone https://github.com/I2Cprogramacion/SEI.git
	cd SEI
	```
2. Instala dependencias Node:
	```
	pnpm install
	```
3. Configura las variables de entorno:
	- Copia y edita los archivos `env.example` y/o `env.local.example`.
	- **IMPORTANTE:** En Vercel, configura la variable `PDF_PROCESSOR_URL` con la URL pública de tu microservicio OCR en Railway (ejemplo: `https://tu-ocr-app.up.railway.app`).
	- Configura las variables de conexión a tu base de datos PostgreSQL.


## Ejecución local
- Frontend/API:
	```
	pnpm dev
	```
- OCR (opcional, solo si quieres probar el microservicio localmente):
	- Ve al repositorio del microservicio OCR Node.js y sigue sus instrucciones.


## Estructura del proyecto
- `app/` - Código principal Next.js (frontend y API)
- `components/` - Componentes UI y funcionales
- `lib/` - Utilidades y configuración de base de datos
- `prisma/` - Esquema y migraciones de base de datos
- `public/` - Recursos estáticos
- `docs/` - Documentación


## Notas importantes
- **No se requiere Python**: Todo el OCR se realiza con Node.js en Railway.
- **Variables de entorno**: Asegúrate de que `PDF_PROCESSOR_URL` apunte al OCR de Railway y que las credenciales de la base de datos sean correctas en Vercel y Railway.
- **Despliegue recomendado**:
	- Vercel: frontend y API Next.js
	- Railway: microservicio OCR Node.js
	- Neon/Railway/Vercel Postgres: base de datos PostgreSQL

## Créditos
Desarrollado por I2Cprogramacion y colaboradores.

---
Para soporte o sugerencias, abre un issue en GitHub.
