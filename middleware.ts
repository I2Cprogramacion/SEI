
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

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
  // Las rutas públicas no requieren autenticación
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


