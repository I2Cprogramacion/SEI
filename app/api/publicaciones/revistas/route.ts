import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/database-config"

export async function GET() {
  try {
    const db = await getDatabase()
    
    // Obtener todas las revistas únicas de las publicaciones existentes
    const result = await db.ejecutarConsulta(
      `SELECT DISTINCT revista 
       FROM publicaciones 
       WHERE revista IS NOT NULL 
         AND revista != '' 
       ORDER BY revista ASC`
    )

    const revistas = result.map((row: { revista: string }) => row.revista)

    return NextResponse.json({ revistas }, { status: 200 })
  } catch (error) {
    console.error("Error al obtener revistas:", error)
    return NextResponse.json(
      { error: "Error al obtener la lista de revistas" },
      { status: 500 }
    )
  }
}
