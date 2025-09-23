# Researcher Platform

Plataforma de Investigadores del Sistema Estatal de Investigadores de Chihuahua.

## Stack Tecnológico

- **Frontend:** Next.js 14 + TypeScript + Tailwind CSS
- **Backend:** Next.js API Routes
- **Base de Datos:** PostgreSQL (Neon) + SQLite (desarrollo)
- **ORM:** Prisma
- **Hosting:** Vercel
- **Control de Versiones:** GitHub

## Desarrollo Local

1. Clonar repositorio
2. Instalar dependencias: `npm install`
3. Configurar variables de entorno
4. Ejecutar migraciones: `npx prisma db push`
5. Iniciar servidor: `npm run dev`

## Deploy

- **Frontend:** Automático desde GitHub a Vercel
- **Backend:** Automático desde GitHub a Railway
- **Base de Datos:** Neon con backups automáticos

## Variables de Entorno

```bash
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="https://tu-app.vercel.app"
```

## Scripts Disponibles

- `npm run dev` - Desarrollo local
- `npm run build` - Build de producción
- `npm run start` - Servidor de producción
- `npm run lint` - Linting
- `npm test` - Tests
