import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    // Obtener todas las revistas únicas de las publicaciones existentes
    const result = await db.query(
      `SELECT DISTINCT revista 
       FROM publicaciones 
       WHERE revista IS NOT NULL 
         AND revista != '' 
       ORDER BY revista ASC`
    )

    const revistas = result.rows.map((row: { revista: string }) => row.revista)

    return NextResponse.json({ revistas }, { status: 200 })
  } catch (error) {
    console.error("Error al obtener revistas:", error)
    return NextResponse.json(
      { error: "Error al obtener la lista de revistas" },
      { status: 500 }
    )
  }
}
