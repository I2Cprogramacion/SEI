import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyJWT } from "@/lib/auth/verify-jwt"

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (!authHeader) {
    return NextResponse.json({ error: "Token no proporcionado" }, { status: 401 })
  }
  const token = authHeader.replace("Bearer ", "")
  const payload = verifyJWT(token)
  if (!payload) {
    return NextResponse.json({ error: "Token inválido o expirado" }, { status: 401 })
  }
  return NextResponse.json(
    {
      error:
        "La funcionalidad de procesamiento de PDFs ha sido deshabilitada. Por favor, utiliza el formulario de registro manual.",
    },
    { status: 501 },
  )
}
