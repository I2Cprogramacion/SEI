import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Crear membresía
export async function POST(request: NextRequest) {
  const data = await request.json()
  try {
    const membership = await prisma.membership.create({
      data: {
        investigadorId: data.investigadorId,
        institucionId: data.institucionId,
        rol: data.rol,
        fechaInicio: data.fechaInicio ? new Date(data.fechaInicio) : undefined,
        fechaFin: data.fechaFin ? new Date(data.fechaFin) : undefined,
      },
    })
    return NextResponse.json({ success: true, membership })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ success: false, error: errorMsg }, { status: 400 })
  }
}

// Consultar membresías
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const investigadorId = searchParams.get("investigadorId")
  const institucionId = searchParams.get("institucionId")
  try {
    const memberships = await prisma.membership.findMany({
      where: {
        ...(investigadorId ? { investigadorId: Number(investigadorId) } : {}),
        ...(institucionId ? { institucionId } : {}),
      },
      include: {
        investigador: true,
        institucion: true,
      },
    })
    return NextResponse.json({ success: true, memberships })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ success: false, error: errorMsg }, { status: 400 })
  }
}

// Eliminar membresía
export async function DELETE(request: NextRequest) {
  const data = await request.json()
  try {
    await prisma.membership.delete({
      where: { id: data.id },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ success: false, error: errorMsg }, { status: 400 })
  }
}
