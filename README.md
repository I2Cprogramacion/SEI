
# SEI

Plataforma del Sistema Estatal de Investigadores (SEI)

Sistema web para la gestión de perfiles académicos, registro de publicaciones y proyectos, colaboración entre investigadores y asignación de niveles. Incluye autenticación segura, integración con base de datos PostgreSQL (Neon), OCR para registro automatizado y paneles administrativos.

## Funcionalidades principales
- Registro y edición de perfiles de investigadores
- Gestión de publicaciones y proyectos
- Panel de administración y dashboard
- Sistema de autenticación con JWT
- Integración con OCR para autocompletar formularios desde PDF
- Roles diferenciados (admin, usuario, invitado)

## Requisitos previos
- Node.js >= 18
- pnpm
- Python >= 3.10
- PostgreSQL (Neon)

## Instalación
1. Clona el repositorio:
	```
	git clone https://github.com/I2Cprogramacion/SEI.git
	cd SEI
	```
2. Instala dependencias Node:
	```
	pnpm install
	```
3. Instala dependencias Python:
	```
	python -m venv .venv
	.venv\Scripts\Activate.ps1
	pip install PyMuPDF pytesseract pillow
	```
4. Configura las variables de entorno:
	- Copia y edita los archivos `env.example` y/o `env.local.example`.

## Ejecución
- Frontend/Backend:
  ```
  pnpm dev
  ```
- OCR (Python):
  ```
  python scripts/pdf_processor.py <ruta_al_pdf>
  ```

## Estructura del proyecto
- `app/` - Código principal Next.js
- `components/` - Componentes UI y funcionales
- `lib/` - Utilidades y configuración de base de datos
- `prisma/` - Esquema y migraciones de base de datos
- `scripts/` - Scripts Python para OCR y utilidades
- `public/` - Recursos estáticos
- `docs/` - Documentación

## Créditos
Desarrollado por I2Cprogramacion y colaboradores.

---
Para soporte o sugerencias, abre un issue en GitHub.
