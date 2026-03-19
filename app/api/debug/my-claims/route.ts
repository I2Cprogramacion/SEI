import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'

/**
 * DEBUG ENDPOINT - Ver qué claims tiene el usuario actual
 */
export async function GET() {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }
    
    return NextResponse.json({
      userId: user.id,
      email: user.emailAddresses?.[0]?.emailAddress,
      nombre: user.firstName,
      publicMetadata: user.publicMetadata,
      esAdmin: user.publicMetadata?.es_admin === true,
      esEvaluador: user.publicMetadata?.es_evaluador === true,
    }, { status: 200 })
    
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
