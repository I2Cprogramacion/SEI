/**
 * Configuración de Clerk para el Sistema de Investigación
 * 
 * Esta configuración establece:
 * - Duración de sesión: 12 horas
 * - Rutas públicas y protegidas
 * - Configuración de autenticación
 */

export const clerkConfig = {
  // Duración de la sesión en segundos (12 horas)
  sessionTokenLifetime: 12 * 60 * 60, // 43200 segundos = 12 horas
  
  // Configuración de sesiones
  session: {
    // Tiempo de vida del token de sesión (12 horas)
    tokenLifetime: 12 * 60 * 60,
    
    // Renovar automáticamente la sesión cuando esté cerca de expirar
    autoRenew: true,
    
    // Tiempo antes de la expiración para renovar (1 hora antes)
    renewBeforeExpiry: 60 * 60,
  },
  
  // Rutas públicas (sin autenticación requerida)
  publicRoutes: [
    "/",
    "/registro",
    "/registro/(.*)",
    "/verificar-email",
    "/verificar-email/(.*)",
    "/iniciar-sesion",
    "/iniciar-sesion/(.*)",
    "/explorar",
    "/explorar/(.*)",
    "/investigadores",
    "/investigadores/(.*)",
    "/proyectos",
    "/proyectos/(.*)",
    "/publicaciones",
    "/publicaciones/(.*)",
    "/convocatorias",
    "/convocatorias/(.*)",
    "/ubicaciones",
    "/ubicaciones/(.*)",
    "/instituciones",
    "/instituciones/(.*)",
    "/redes",
    "/redes/(.*)",
    "/campos",
    "/campos/(.*)",
    "/buscar",
    "/buscar/(.*)",
    "/cookies",
    "/privacidad",
    "/terminos",
    "/api/registro",
    "/api/investigadores",
    "/api/proyectos",
    "/api/publicaciones",
  ],
  
  // Rutas protegidas (requieren autenticación)
  protectedRoutes: [
    "/admin",
    "/admin/(.*)",
    "/dashboard",
    "/dashboard/(.*)",
  ],
  
  // Redirecciones después de autenticación
  redirects: {
    afterSignIn: "/admin",
    afterSignUp: "/admin",
    afterSignOut: "/",
  },
}

export default clerkConfig
