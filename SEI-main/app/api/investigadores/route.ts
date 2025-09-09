import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { obtenerInvestigadores } from "@/lib/db"
import { verifyJWT } from "@/lib/auth/verify-jwt"
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (!authHeader) {
    return NextResponse.json({ error: "Token no proporcionado" }, { status: 401 })
  }
  const token = authHeader.replace("Bearer ", "")
  const payload = verifyJWT(token)
  if (!payload) {
    return NextResponse.json({ error: "Token inválido o expirado" }, { status: 401 })
  }
  try {
    // Obtener todos los investigadores de la base de datos
    const investigadores = await obtenerInvestigadores()
    return NextResponse.json(investigadores)
  } catch (error) {
    console.error("Error al obtener investigadores:", error)
    return NextResponse.json({ error: "Error al obtener los investigadores" }, { status: 500 })
  }
}
