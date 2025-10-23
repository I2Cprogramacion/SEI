import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getDatabase } from "@/lib/database-config"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Por ahora, devolver arrays vacíos hasta que se configure la base de datos correctamente
    return NextResponse.json({
      campos: [],
      estadisticas: {
        totalCampos: 0,
        totalInvestigadores: 0,
        totalProyectos: 0,
        totalPublicaciones: 0
      },
      filtros: {
        instituciones: [],
        nivelesActividad: [
          { valor: 'alto', etiqueta: 'Alta actividad (70%+)', color: 'text-green-600' },
          { valor: 'medio', etiqueta: 'Actividad media (40-69%)', color: 'text-yellow-600' },
          { valor: 'bajo', etiqueta: 'Baja actividad (<40%)', color: 'text-red-600' }
        ],
        ordenamiento: [
          { valor: 'investigadores', etiqueta: 'Por número de investigadores' },
          { valor: 'proyectos', etiqueta: 'Por número de proyectos' },
          { valor: 'publicaciones', etiqueta: 'Por número de publicaciones' },
          { valor: 'instituciones', etiqueta: 'Por número de instituciones' },
          { valor: 'nombre', etiqueta: 'Por nombre alfabético' }
        ]
      },
      parametros: {
        search: '',
        institucion: 'all',
        actividad: 'all',
        orden: 'investigadores',
        direccion: 'desc'
      }
    })
    
  } catch (error) {
    console.error("Error al obtener campos de investigación:", error)
    return NextResponse.json(
      { error: "Error interno del servidor", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
