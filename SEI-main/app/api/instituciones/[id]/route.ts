import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyJWT } from "@/lib/auth/verify-jwt"

function auth(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (!authHeader) return null
  const token = authHeader.replace("Bearer ", "")
  return verifyJWT(token)
}

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const item = await prisma.institution.findUnique({ where: { id: params.id } })
    if (!item) return NextResponse.json({ error: "No encontrado" }, { status: 404 })
    return NextResponse.json(item)
  } catch (error) {
    console.error("Error al obtener institución:", error)
    return NextResponse.json({ error: "Error al obtener la institución" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const payload = auth(request)
  if (!payload) {
    return NextResponse.json({ error: "Token inválido o no proporcionado" }, { status: 401 })
  }
  try {
    const body = await request.json()
    const { nombre, tipo, ubicacion, sitioWeb } = body ?? {}
    const updated = await prisma.institution.update({
      where: { id: params.id },
      data: { nombre, tipo, ubicacion, sitioWeb },
    })
    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error al actualizar institución:", error)
    return NextResponse.json({ error: "Error al actualizar la institución" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const payload = auth(request)
  if (!payload) {
    return NextResponse.json({ error: "Token inválido o no proporcionado" }, { status: 401 })
  }
  try {
    await prisma.institution.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error al eliminar institución:", error)
    return NextResponse.json({ error: "Error al eliminar la institución" }, { status: 500 })
  }
}



