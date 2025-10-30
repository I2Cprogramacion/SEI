import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { currentUser } from "@clerk/nextjs/server"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }
    return NextResponse.json({ id: user.id, email: user.emailAddresses?.[0]?.emailAddress || null });
  } catch (error) {
    console.error("Error al obtener datos de Clerk:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

