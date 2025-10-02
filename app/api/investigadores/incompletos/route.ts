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

    // Asegurar que los datos sean serializables
    const investigadoresArray = Array.isArray(investigadores) ? investigadores : []
    const investigadoresSerializables = investigadoresArray.map((inv: any) => ({
      id: inv.id,
      no_cvu: inv.no_cvu,
      curp: inv.curp,
      nombre_completo: inv.nombre_completo,
      rfc: inv.rfc,
      correo: inv.correo,
      nacionalidad: inv.nacionalidad,
      fecha_nacimiento: inv.fecha_nacimiento,
      institucion: inv.institucion
    }))

    return NextResponse.json(investigadoresSerializables)
  } catch (error) {
    console.error("Error al obtener investigadores incompletos:", error)
    return NextResponse.json({ error: "Error al obtener los investigadores incompletos" }, { status: 500 })
  }
}
