import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Email del único administrador autorizado
const AUTHORIZED_ADMIN_EMAIL = 'admin@sei.com.mx'

export function middleware(request: NextRequest) {
  // Solo aplicar middleware a rutas de admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Obtener el token de autenticación de las cookies
    const token = request.cookies.get('auth-token')?.value
    const userData = request.cookies.get('user-data')?.value
    
    // Si no hay token o datos de usuario, redirigir al login
    if (!token || !userData) {
      return NextResponse.redirect(new URL('/iniciar-sesion', request.url))
    }

    try {
      // Parsear los datos del usuario
      const user = JSON.parse(userData)
      
      // Verificar que el usuario sea admin Y que sea el email autorizado
      if (!user.isAdmin || user.email !== AUTHORIZED_ADMIN_EMAIL) {
        // Redirigir a la página principal con mensaje de error
        const response = NextResponse.redirect(new URL('/', request.url))
        response.cookies.set('admin-error', 'Acceso denegado: Solo el administrador principal puede acceder al panel')
        return response
      }
      
      // Si todo está bien, continuar con la solicitud
      return NextResponse.next()
      
    } catch (error) {
      // Si hay error al parsear los datos, redirigir al login
      console.error('Error parsing user data in middleware:', error)
      return NextResponse.redirect(new URL('/iniciar-sesion', request.url))
    }
  }

  // Para rutas que no son de admin, continuar normalmente
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*'
  ]
}


