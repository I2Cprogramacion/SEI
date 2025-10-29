# 🔧 Solución para Errores de Clerk y Next.js

## 📋 Errores Comunes

### Error 1: ChunkLoadError
```
Loading chunk app/layout failed.
(missing: http://localhost:3000/_next/static/chunks/app/layout.js)
```

### Error 2: SyntaxError
```
Invalid or unexpected token
```

---

## 🎯 Causas Principales

Estos errores generalmente ocurren por:

1. **Caché corrupto de Next.js** (`.next/` directory)
2. **Archivos temporales de TypeScript** (`tsconfig.tsbuildinfo`)
3. **Hot-reload fallido** durante el desarrollo
4. **Dependencias mal compiladas**
5. **Problemas con pnpm store**

---

## 🛠️ Solución Completa

### Método 1: Limpieza Rápida (Recomendado)

Ejecuta estos comandos en orden:

```powershell
# 1. Detener el servidor (Ctrl + C en la terminal donde corre)

# 2. Detener todos los procesos de Node.js
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

# 3. Limpiar caché de Next.js
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue

# 4. Limpiar caché de TypeScript
Remove-Item -Force tsconfig.tsbuildinfo -ErrorAction SilentlyContinue

# 5. Limpiar caché de pnpm
pnpm store prune

# 6. Reiniciar el servidor
pnpm dev
```

### Método 2: Limpieza Profunda (Si el Método 1 no funciona)

```powershell
# 1. Detener el servidor
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

# 2. Limpiar todos los cachés
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Remove-Item -Force tsconfig.tsbuildinfo -ErrorAction SilentlyContinue

# 3. Limpiar node_modules y reinstalar
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
pnpm install

# 4. Limpiar caché de pnpm
pnpm store prune

# 5. Regenerar Prisma Client
pnpm prisma generate

# 6. Reiniciar el servidor
pnpm dev
```

### Método 3: Limpieza Total (Último recurso)

```powershell
# 1. Detener el servidor
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

# 2. Limpiar todo
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Remove-Item -Force tsconfig.tsbuildinfo -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force pnpm-lock.yaml -ErrorAction SilentlyContinue

# 3. Limpiar caché global de pnpm
pnpm store prune

# 4. Reinstalar desde cero
pnpm install

# 5. Reiniciar
pnpm dev
```

---

## 🔍 Verificación del Archivo layout.tsx

El archivo `app/layout.tsx` debe estar correctamente estructurado:

```tsx
import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SEI Chihuahua",
  description: "Sistema Estatal de Investigadores"
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider
      appearance={{
        elements: {
          footer: "hidden",
          badge: "hidden",
        },
      }}
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      <html lang="es">
        <body className={inter.className}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
```

---

## 📝 Variables de Entorno Requeridas

Asegúrate de tener en tu archivo `.env.local`:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/iniciar-sesion
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/registro
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Database
DATABASE_URL=postgresql://...
POSTGRES_URL=postgresql://...

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

---

## 🚨 Errores Específicos de Clerk

### Error: "Clerk: Missing publishableKey"

**Solución:**
1. Verifica que `.env.local` tenga `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
2. Reinicia el servidor después de agregar variables de entorno
3. Asegúrate de que el archivo `.env.local` esté en la raíz del proyecto

### Error: "Invalid Clerk configuration"

**Solución:**
1. Verifica que las claves de Clerk sean válidas
2. Revisa que las URLs de redirección estén configuradas correctamente
3. Asegúrate de estar usando la versión correcta de `@clerk/nextjs`

---

## 🔄 Prevención de Errores

### Buenas Prácticas:

1. **Siempre detén el servidor antes de limpiar caché:**
   ```powershell
   # Presiona Ctrl + C en la terminal del servidor
   ```

2. **Limpia el caché periódicamente:**
   ```powershell
   pnpm store prune
   ```

3. **Usa pnpm en lugar de npm:**
   - El proyecto usa `packageManager: "pnpm@9.0.0"`
   - Usar npm puede causar conflictos

4. **Reinicia el servidor después de cambios importantes:**
   - Cambios en `package.json`
   - Cambios en variables de entorno
   - Cambios en archivos de configuración

5. **Verifica los logs del servidor:**
   - Lee los mensajes de error completos
   - Busca advertencias sobre módulos faltantes

---

## 📞 Comandos de Depuración Útiles

```powershell
# Ver procesos de Node.js activos
Get-Process -Name node

# Ver el puerto 3000
netstat -ano | findstr :3000

# Limpiar solo .next
Remove-Item -Recurse -Force .next

# Verificar versión de pnpm
pnpm --version

# Verificar versión de Node
node --version

# Ver dependencias instaladas
pnpm list

# Verificar configuración de Clerk
pnpm list @clerk/nextjs
```

---

## 🎯 Checklist de Resolución

- [ ] Detener el servidor
- [ ] Detener procesos de Node.js
- [ ] Eliminar `.next/`
- [ ] Eliminar `tsconfig.tsbuildinfo`
- [ ] Ejecutar `pnpm store prune`
- [ ] Verificar variables de entorno
- [ ] Reiniciar el servidor con `pnpm dev`
- [ ] Verificar que el servidor inicie correctamente
- [ ] Abrir `http://localhost:3000` en el navegador
- [ ] Verificar que no haya errores en la consola

---

## 📚 Recursos Adicionales

- [Documentación de Clerk](https://clerk.com/docs)
- [Documentación de Next.js](https://nextjs.org/docs)
- [pnpm Documentation](https://pnpm.io/)
- [Troubleshooting Next.js](https://nextjs.org/docs/messages)

---

## ⚡ Solución Rápida (Una línea)

Si tienes prisa, ejecuta esto:

```powershell
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force; Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue; Remove-Item -Force tsconfig.tsbuildinfo -ErrorAction SilentlyContinue; pnpm store prune; pnpm dev
```

---

**Última actualización:** Octubre 2025  
**Versión de Next.js:** 15.5.4  
**Versión de Clerk:** 6.33.3

