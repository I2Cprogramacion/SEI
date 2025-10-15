import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

/**
 * GET /api/debug/env-status
 * Verifica el estado de las variables de entorno en Vercel
 * Solo para debugging - ELIMINAR EN PRODUCCIÓN
 */
export async function GET() {
  try {
    const envStatus = {
      POSTGRES_URL: process.env.POSTGRES_URL ? '✅ Configurada' : '❌ NO configurada',
      POSTGRES_PRISMA_URL: process.env.POSTGRES_PRISMA_URL ? '✅ Configurada' : '❌ NO configurada',
      POSTGRES_URL_NO_SSL: process.env.POSTGRES_URL_NO_SSL ? '✅ Configurada' : '❌ NO configurada',
      POSTGRES_URL_NON_POOLING: process.env.POSTGRES_URL_NON_POOLING ? '✅ Configurada' : '❌ NO configurada',
      POSTGRES_USER: process.env.POSTGRES_USER ? '✅ Configurada' : '❌ NO configurada',
      POSTGRES_HOST: process.env.POSTGRES_HOST ? '✅ Configurada' : '❌ NO configurada',
      POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD ? '✅ Configurada (oculta)' : '❌ NO configurada',
      POSTGRES_DATABASE: process.env.POSTGRES_DATABASE ? '✅ Configurada' : '❌ NO configurada',
    }

    let dbConnection = '❌ No se pudo conectar'
    let adminUserStatus = '❓ No verificado'
    
    try {
      // Intentar conectar a la BD
      const result = await sql`SELECT COUNT(*) as total FROM investigadores`
      const totalUsers = parseInt(result.rows[0].total)
      dbConnection = `✅ Conectado - ${totalUsers} usuarios en BD`

      // Verificar usuario admin
      const adminCheck = await sql`
        SELECT id, nombre_completo, correo, es_admin 
        FROM investigadores 
        WHERE correo = 'drksh2015@gmail.com'
      `
      
      if (adminCheck.rows.length === 0) {
        adminUserStatus = '❌ Usuario drksh2015@gmail.com NO existe en BD'
      } else {
        const user = adminCheck.rows[0]
        if (user.es_admin) {
          adminUserStatus = `✅ Usuario ES admin (ID: ${user.id})`
        } else {
          adminUserStatus = `⚠️ Usuario existe pero NO es admin (ID: ${user.id})`
        }
      }
    } catch (dbError: any) {
      dbConnection = `❌ Error: ${dbError.message}`
    }

    const allConfigured = Object.values(envStatus).every(status => status.includes('✅'))

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment: process.env.VERCEL_ENV || 'development',
      status: allConfigured ? '✅ Todo configurado' : '⚠️ Faltan variables',
      variables: envStatus,
      database: dbConnection,
      adminUser: adminUserStatus,
      summary: {
        totalVariables: Object.keys(envStatus).length,
        configured: Object.values(envStatus).filter(s => s.includes('✅')).length,
        missing: Object.values(envStatus).filter(s => s.includes('❌')).length,
      },
      nextSteps: allConfigured 
        ? ['✅ Variables configuradas', '✅ Conexión a BD exitosa', 'Verifica acceso a /admin']
        : [
          '❌ Configura las variables faltantes en Vercel',
          'Settings → Environment Variables',
          'Marca Production, Preview y Development',
          'Redeploy sin usar caché existente'
        ]
    }, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    })
  } catch (error: any) {
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      status: '❌ Error general',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      help: 'Verifica que las variables de entorno estén configuradas en Vercel'
    }, {
      status: 500
    })
  }
}
