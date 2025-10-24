import { NextResponse } from "next/server"
import { getAuth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
  // @ts-ignore
  const { userId } = getAuth(req)
    if (!userId) {
      return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 })
    }
    const { areas } = await req.json()
    if (!Array.isArray(areas)) {
      return NextResponse.json({ success: false, error: "Formato de áreas inválido" }, { status: 400 })
    }
    await prisma.profile.updateMany({
      where: { userId: userId },
      data: { areaInvestigacion: areas.join(",") }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
  return NextResponse.json({ success: false, error: (error as Error)?.message || "Error al actualizar áreas" }, { status: 500 })
  }
}
