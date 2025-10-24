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
    // Eliminar investigador por clerk_user_id
  await prisma.profile.deleteMany({ where: { userId: userId } })
    // Eliminar usuario de Clerk (opcional, si tienes lógica para esto)
    // ...
    return NextResponse.json({ success: true })
  } catch (error) {
  return NextResponse.json({ success: false, error: (error as Error)?.message || "Error al eliminar" }, { status: 500 })
  }
}
