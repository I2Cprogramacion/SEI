import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { guardarInvestigador } from "@/lib/db"
import { verifyJWT } from "@/lib/auth/verify-jwt"

export async function POST(request: NextRequest) {
  // Permitir registro abierto, pero si se envía token, verificarlo
  const authHeader = request.headers.get("authorization")
  let payload = null
  if (authHeader) {
    const token = authHeader.replace("Bearer ", "")
    payload = verifyJWT(token)
    if (!payload) {
      return NextResponse.json({ error: "Token inválido o expirado" }, { status: 401 })
    }
  }
  try {
    const data = await request.json()
    console.log("Datos recibidos para registro:", data)
    // Validar datos obligatorios
    if (!data.nombre_completo) {
      console.error("Falta el nombre completo")
      return NextResponse.json({ error: "El nombre completo es obligatorio" }, { status: 400 })
    }
    if (!data.correo) {
      console.error("Falta el correo electrónico")
      return NextResponse.json({ error: "El correo electrónico es obligatorio" }, { status: 400 })
    }
    // Añadir fecha de registro si no existe
    if (!data.fecha_registro) {
      data.fecha_registro = new Date().toISOString()
    }
    // Si el campo es 'password', hashearla antes de guardar
    if (data.password) {
      const bcrypt = (await import('bcryptjs')).default;
      const salt = await bcrypt.genSalt(10);
      data.password = await bcrypt.hash(data.password, salt);
    }
    try {
      const resultado = await guardarInvestigador(data)
      console.log("Resultado del guardado:", resultado)
      if (resultado.success) {
        return NextResponse.json({
          success: true,
          message: resultado.message,
          id: resultado.id,
        })
      } else {
        // Error de duplicado o validación
        return NextResponse.json({
          success: false,
          message: resultado.message,
          duplicado: !resultado.success,
        }, { status: 409 }) // 409 Conflict para duplicados
      }
    } catch (dbError) {
      console.error("Error al guardar en la base de datos:", dbError)
      return NextResponse.json({
        error: `Error al guardar en la base de datos: ${dbError instanceof Error ? dbError.message : "Error desconocido"}`,
      }, { status: 500 })
    }
  } catch (error) {
    console.error("Error al procesar el registro:", error)
    return NextResponse.json({
      error: `Error al procesar el registro: ${error instanceof Error ? error.message : "Error desconocido"}`,
    }, { status: 500 })
  }
}
