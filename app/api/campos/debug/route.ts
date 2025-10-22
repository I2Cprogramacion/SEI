import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/database-config"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    console.log('=== DEBUG API CAMPOS ===')
    
    const db = await getDatabase()
    console.log('Base de datos conectada:', !!db)
    
    // Probar consulta simple
    const testQuery = `
      SELECT 
        COALESCE(area, area_investigacion, 'Sin especificar') as nombre,
        COUNT(DISTINCT id) as investigadores
      FROM investigadores 
      WHERE (area IS NOT NULL AND area != '') 
         OR (area_investigacion IS NOT NULL AND area_investigacion != '')
      GROUP BY COALESCE(area, area_investigacion, 'Sin especificar')
      LIMIT 5
    `
    
    console.log('Ejecutando consulta de prueba...')
    const result = await db.query(testQuery)
    console.log('Resultado de la consulta:', result)
    console.log('Tipo de resultado:', typeof result)
    console.log('Es array:', Array.isArray(result))
    console.log('Longitud:', result?.length)
    
    if (Array.isArray(result) && result.length > 0) {
      console.log('Primer resultado:', result[0])
    }
    
    return NextResponse.json({
      success: true,
      message: 'Conexión exitosa',
      data: {
        connected: !!db,
        queryResult: result,
        resultType: typeof result,
        isArray: Array.isArray(result),
        length: result?.length || 0,
        firstItem: result?.[0] || null
      }
    })
    
  } catch (error) {
    console.error("Error en debug API:", error)
    return NextResponse.json(
      { 
        error: "Error en debug", 
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
