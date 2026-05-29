
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Definir las rutas públicas (sin autenticación)
const isPublicRoute = createRouteMatcher([
  "/",
  "/registro(.*)",
  "/verificar-email(.*)",
  "/iniciar-sesion(.*)",
  "/explorar(.*)",
  "/investigadores(.*)",
  "/proyectos(.*)",
  "/publicaciones(.*)",
  "/convocatorias(.*)",
  "/ubicaciones(.*)",
  "/instituciones(.*)",
  "/redes(.*)",
  "/buscar(.*)",
  "/cookies(.*)",
  "/privacidad(.*)",
  "/terminos(.*)",
  "/api/registro",
  "/api/investigadores",
  "/api/proyectos",
  "/api/publicaciones",
]);

// Definir las rutas protegidas (requieren autenticación)
const isProtectedRoute = createRouteMatcher([
  "/admin(.*)",
  "/dashboard(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  // Proteger las rutas del admin y dashboard
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  // Crear response para manipular headers
  const response = NextResponse.next();

  // ============================================
  // HEADERS DE SEGURIDAD - CRÍTICO
  // ============================================

  // 1. Prevenir MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // 2. Protección contra clickjacking
  response.headers.set('X-Frame-Options', 'DENY');

  // 3. Protección XSS (más moderna que X-XSS-Protection)
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // 4. Referrer Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // 5. Permissions-Policy (previamente Feature-Policy)
  response.headers.set('Permissions-Policy', 'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()');

  // 6. Strict-Transport-Security (HSTS) - HTTPS obligatorio
  // Nota: Solo en producción. En desarrollo comentar si no tienes HTTPS
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  // 7. Content-Security-Policy - Prevenir inyección de contenido
  // Se corrigió la política Content-Security-Policy (CSP) del frontend Next.js en Vercel para permitir la carga de scripts y conexiones desde clerk.sei-chih.com.mx.
  // Se agregó el dominio personalizado de Clerk en:
  // - script-src
  // - connect-src
  // Esto resolvió el bloqueo "(blocked:csp)" que impedía cargar Clerk y congelaba el formulario de registro.

  const cspHeader = process.env.NODE_ENV === 'production'
    ? "default-src 'self'; script-src 'self' 'unsafe-inline' cdn.clerk.com https://clerk.sei-chih.com.mx https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' cdn.clerk.com https://clerk.sei-chih.com.mx https://challenges.cloudflare.com; frame-src 'self' https://*.public.blob.vercel-storage.com https://challenges.cloudflare.com; frame-ancestors 'none';"
    : "default-src 'self'; script-src 'self' 'unsafe-inline' cdn.clerk.com https://clerk.sei-chih.com.mx https://challenges.cloudflare.com localhost:*; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: localhost:*; font-src 'self' data:; connect-src 'self' cdn.clerk.com https://clerk.sei-chih.com.mx https://challenges.cloudflare.com localhost:*; frame-src 'self' https://*.public.blob.vercel-storage.com https://challenges.cloudflare.com localhost:*; frame-ancestors 'none';";

  response.headers.set('Content-Security-Policy', cspHeader);

  return response;
}, {
  // Configuración de duración de sesión (12 horas)
  // Nota: La duración exacta se configura en el dashboard de Clerk
  // Esta es la configuración del lado del servidor
  debug: false,
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};


