import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Obtener cookies de la petición
    const token = request.cookies.get('auth-token')?.value
    const userData = request.cookies.get('user-data')?.value
    
    // Verificar que ambas cookies existen
    if (!token || !userData) {
      return NextResponse.json({ 
        authenticated: false 
      })
    }

    // Intentar parsear los datos del usuario
    try {
      const user = JSON.parse(userData)
      
      // Verificar que el usuario tiene los campos requeridos
      if (!user.id || !user.email) {
        return NextResponse.json({ 
          authenticated: false 
        })
      }

      // Sesión válida
      return NextResponse.json({ 
        authenticated: true,
        isAdmin: Boolean(user.isAdmin),
        email: user.email
      })
      
    } catch (parseError) {
      // Error al parsear user-data
      return NextResponse.json({ 
        authenticated: false 
      })
    }

  } catch (error) {
    console.error('Error checking session:', error)
    return NextResponse.json({ 
      authenticated: false 
    }, { status: 500 })
  }
}







