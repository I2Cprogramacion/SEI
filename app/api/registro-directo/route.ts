import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { guardarInvestigador } from "@/lib/db"

/**
 * API de respaldo para guardar directamente en investigadores
 * Se usa cuando falla el sistema de registros_pendientes
 */
export async function POST(request: NextRequest) {
  try {
    const datos = await request.json()
    
    console.log("📥 [REGISTRO DIRECTO] Guardando en investigadores...")
    
    // Validación básica
    if (!datos.clerk_user_id) {
      return NextResponse.json(
        { error: "clerk_user_id es requerido" },
        { status: 400 }
      )
    }
    
    if (!datos.correo) {
      return NextResponse.json(
        { error: "correo es requerido" },
        { status: 400 }
      )
    }
    
    // Guardar directamente
    const resultado = await guardarInvestigador(datos)
    
    if (resultado.success) {
      console.log("✅ [REGISTRO DIRECTO] Guardado exitosamente")
      return NextResponse.json({
        success: true,
        message: "Registro completado",
        id: resultado.id
      })
    } else {
      console.error("❌ [REGISTRO DIRECTO] Error:", resultado.message)
      return NextResponse.json({
        success: false,
        message: resultado.message
      }, { status: 409 })
    }
  } catch (error) {
    console.error("❌ [REGISTRO DIRECTO] Error:", error)
    return NextResponse.json({
      error: `Error: ${error instanceof Error ? error.message : "Error desconocido"}`
    }, { status: 500 })
  }
}
