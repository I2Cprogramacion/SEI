import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { limpiarRegistrosExpirados } from "@/lib/db"

/**
 * API Cron para limpiar registros pendientes expirados (>24 horas)
 * 
 * Este endpoint debe ejecutarse periódicamente (diariamente) para:
 * 1. Eliminar registros de registros_pendientes con más de 24 horas
 * 2. Liberar espacio en la base de datos
 * 3. Mantener limpia la tabla temporal
 * 
 * Configuración en Vercel:
 * - Agregar en vercel.json:
 *   {
 *     "crons": [{
 *       "path": "/api/cron/limpiar-registros",
 *       "schedule": "0 2 * * *"
 *     }]
 *   }
 * 
 * Esto ejecutará la limpieza todos los días a las 2:00 AM UTC
 * 
 * SEGURIDAD: Usar Authorization header con CRON_SECRET
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autorización (solo permitir desde Vercel Cron o con secret)
    const authHeader = request.headers.get("authorization")
    const cronSecret = process.env.CRON_SECRET
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.error("❌ [CRON LIMPIEZA] Acceso no autorizado")
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    console.log("🔵 ========== INICIANDO LIMPIEZA DE REGISTROS EXPIRADOS ==========")
    console.log("⏰ Fecha/hora:", new Date().toISOString())
    
    // Ejecutar limpieza
    const resultado = await limpiarRegistrosExpirados()
    
    console.log("✅ Limpieza completada:")
    console.log("   Registros eliminados:", resultado.eliminados)
    console.log("   Detalles:", resultado.detalles)
    console.log("=================================================================")
    
    return NextResponse.json({
      success: true,
      message: "Limpieza de registros expirados completada",
      eliminados: resultado.eliminados,
      detalles: resultado.detalles,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ [CRON LIMPIEZA] Error al limpiar registros:", error)
    return NextResponse.json({
      error: `Error al limpiar registros: ${error instanceof Error ? error.message : "Error desconocido"}`,
    }, { status: 500 })
  }
}

// También permitir POST para pruebas manuales
export async function POST(request: NextRequest) {
  return GET(request)
}
