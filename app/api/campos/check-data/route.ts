import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/database-config"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    console.log('=== CHECK DATA API ===')
    
    const db = await getDatabase()
    console.log('Base de datos conectada')
    
    // Verificar si hay investigadores
    const totalQuery = `SELECT COUNT(*) as total FROM investigadores`
    const totalResult = await db.query(totalQuery)
    const totalInvestigadores = totalResult?.[0]?.total || 0
    
    console.log('Total investigadores:', totalInvestigadores)
    
    // Verificar campos con datos
    const areasQuery = `
      SELECT 
        COALESCE(area, area_investigacion, 'Sin especificar') as nombre,
        COUNT(DISTINCT id) as investigadores
      FROM investigadores 
      WHERE (area IS NOT NULL AND area != '') 
         OR (area_investigacion IS NOT NULL AND area_investigacion != '')
      GROUP BY COALESCE(area, area_investigacion, 'Sin especificar')
      ORDER BY investigadores DESC
    `
    
    const areasResult = await db.query(areasQuery)
    console.log('Áreas encontradas:', areasResult?.length || 0)
    
    // Verificar algunos registros de ejemplo
    const sampleQuery = `
      SELECT 
        id, 
        nombre_completo, 
        area, 
        area_investigacion, 
        institucion,
        correo
      FROM investigadores 
      LIMIT 5
    `
    
    const sampleResult = await db.query(sampleQuery)
    console.log('Muestra de investigadores:', sampleResult)
    
    return NextResponse.json({
      success: true,
      data: {
        totalInvestigadores,
        areasEncontradas: areasResult?.length || 0,
        areas: areasResult || [],
        muestraInvestigadores: sampleResult || [],
        tieneDatos: totalInvestigadores > 0,
        tieneAreas: (areasResult?.length || 0) > 0
      }
    })
    
  } catch (error) {
    console.error("Error en check data API:", error)
    return NextResponse.json(
      { 
        error: "Error al verificar datos", 
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
