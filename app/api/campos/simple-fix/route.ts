import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    console.log('=== SIMPLE FIX API CAMPOS ===')
    
    // Datos de prueba muy simples
    const camposPrueba = [
      {
        id: 1,
        nombre: "Ciencias de la Computación",
        descripcion: "Área de investigación con 15 investigadores activos",
        investigadores: 15,
        proyectos: 8,
        publicaciones: 25,
        instituciones: 2,
        crecimiento: 75,
        tendencia: "up" as const,
        subcampos: ["Inteligencia Artificial", "Machine Learning"],
        color: "bg-blue-100 text-blue-800",
        slug: "ciencias-computacion",
        instituciones_lista: "UACH, UACJ",
        dias_promedio_registro: 0
      },
      {
        id: 2,
        nombre: "Ingeniería",
        descripcion: "Área de investigación con 12 investigadores activos",
        investigadores: 12,
        proyectos: 6,
        publicaciones: 18,
        instituciones: 3,
        crecimiento: 65,
        tendencia: "up" as const,
        subcampos: ["Ingeniería Civil", "Ingeniería Industrial"],
        color: "bg-green-100 text-green-800",
        slug: "ingenieria",
        instituciones_lista: "UACH, UACJ, ITCH",
        dias_promedio_registro: 0
      }
    ]
    
    const estadisticas = {
      totalCampos: 2,
      totalInvestigadores: 27,
      totalProyectos: 14,
      totalPublicaciones: 43
    }
    
    const filtros = {
      instituciones: ["UACH", "UACJ", "ITCH"],
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
    }
    
    const parametros = {
      search: '',
      institucion: 'all',
      actividad: 'all',
      orden: 'investigadores',
      direccion: 'desc'
    }
    
    console.log('Retornando datos de prueba simples')
    
    return NextResponse.json({
      campos: camposPrueba,
      estadisticas,
      filtros,
      parametros
    })
    
  } catch (error) {
    console.error("Error en simple fix API:", error)
    return NextResponse.json(
      { 
        error: "Error en simple fix API", 
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
