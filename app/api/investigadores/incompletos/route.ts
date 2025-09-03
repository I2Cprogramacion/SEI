import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { initDB } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const db = await initDB()

    // Obtener investigadores con CURP no detectado o vacío
    const investigadores = await db.ejecutarMigracion(`
      SELECT id, no_cvu, curp, nombre_completo, rfc, correo, nacionalidad, fecha_nacimiento, institucion
      FROM investigadores
      WHERE curp = 'NO DETECTADO' OR curp = '' OR curp IS NULL
    `)

    return NextResponse.json(investigadores)
  } catch (error) {
    console.error("Error al obtener investigadores incompletos:", error)
    return NextResponse.json({ error: "Error al obtener los investigadores incompletos" }, { status: 500 })
  }
}
