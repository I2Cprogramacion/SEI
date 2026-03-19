import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'

/**
 * TEMP: Hace admin al usuario actual (para fixing sin tocar BD)
 * GET /api/debug/make-me-admin
 */
export async function GET() {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }
    
    // Actualizar Clerk claims directamente
    const response = await fetch(`https://api.clerk.com/v1/users/${user.id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        public_metadata: {
          es_admin: true,
          es_evaluador: false,
          sync_timestamp: new Date().toISOString()
        }
      })
    })
    
    if (!response.ok) {
      const error = await response.text()
      return NextResponse.json({ error }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Ahora eres admin en Clerk',
      userId: user.id,
      email: user.emailAddresses?.[0]?.emailAddress
    }, { status: 200 })
    
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
