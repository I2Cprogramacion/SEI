import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { consultarInvestigadoresIncompletos } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const investigadores = await consultarInvestigadoresIncompletos();
    // Forzar serialización segura (fechas a string, BigInt a string)
    const serializables = (investigadores || []).map((inv: any) => {
      const obj: any = { ...inv };
      for (const key in obj) {
        if (typeof obj[key] === 'bigint') obj[key] = obj[key].toString();
        if (obj[key] instanceof Date) obj[key] = obj[key].toISOString();
      }
      return obj;
    });
    return NextResponse.json(serializables)
  } catch (error) {
    console.error("Error al obtener investigadores incompletos:", error)
    return NextResponse.json({ error: "Error al obtener los investigadores incompletos" }, { status: 500 })
  }
}
