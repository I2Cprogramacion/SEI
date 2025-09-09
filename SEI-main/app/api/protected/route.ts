import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import * as jwt from "jsonwebtoken"

function verifyJWT(token: string): any {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || "default_secret")
  } catch (err) {
    return null
  }
}

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
  // Aquí va la lógica protegida
  return NextResponse.json({ success: true, message: "Acceso permitido", user: payload })
}
