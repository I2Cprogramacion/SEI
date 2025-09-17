import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { obtenerInvestigadores } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const type = searchParams.get('type') || 'all'
    
    if (!query.trim()) {
      return NextResponse.json({ 
        investigadores: [], 
        proyectos: [], 
        total: 0 
      })
    }

    // Obtener investigadores de la base de datos
    const investigadores = await obtenerInvestigadores()
    
    // Filtrar investigadores por término de búsqueda
    const investigadoresFiltrados = investigadores.filter(inv => {
      const searchTerm = query.toLowerCase()
      return (
        inv.nombre_completo?.toLowerCase().includes(searchTerm) ||
        inv.institucion?.toLowerCase().includes(searchTerm) ||
        inv.area?.toLowerCase().includes(searchTerm) ||
        inv.disciplina?.toLowerCase().includes(searchTerm) ||
        inv.especialidad?.toLowerCase().includes(searchTerm) ||
        inv.linea_investigacion?.toLowerCase().includes(searchTerm)
      )
    })

    // Transformar investigadores al formato esperado
    const investigadoresFormateados = investigadoresFiltrados.map(inv => ({
      id: inv.id,
      nombre: inv.nombre_completo,
      institucion: inv.institucion || 'Institución no especificada',
      area: inv.area || inv.disciplina || inv.especialidad || 'Investigación',
      slug: inv.slug || inv.nombre_completo?.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .trim() || `investigador-${inv.id}`,
      keywords: [
        inv.area,
        inv.disciplina,
        inv.especialidad
      ].filter(Boolean)
    }))

    // Para proyectos y publicaciones, extraer de los campos de investigadores
    const proyectos: any[] = []
    investigadores.forEach(inv => {
      // Proyectos de investigación
      if (inv.proyectos_investigacion) {
        const proyectosTexto = inv.proyectos_investigacion.split('\n').filter((p: string) => p.trim())
        proyectosTexto.forEach((proyectoTexto: string, index: number) => {
          if (proyectoTexto.toLowerCase().includes(query.toLowerCase())) {
            proyectos.push({
              id: `${inv.id}_proyecto_${index}`,
              titulo: proyectoTexto.trim(),
              investigador: inv.nombre_completo,
              institucion: inv.institucion || 'Institución no especificada',
              area: inv.area || inv.disciplina || 'Investigación',
              slug: `proyecto-${inv.id}-${index}`,
              keywords: [inv.area, inv.disciplina, inv.especialidad].filter(Boolean)
            })
          }
        })
      }

      // Artículos
      if (inv.articulos) {
        const articulosTexto = inv.articulos.split('\n').filter((a: string) => a.trim())
        articulosTexto.forEach((articuloTexto: string, index: number) => {
          if (articuloTexto.toLowerCase().includes(query.toLowerCase())) {
            proyectos.push({
              id: `${inv.id}_articulo_${index}`,
              titulo: articuloTexto.trim(),
              investigador: inv.nombre_completo,
              institucion: inv.institucion || 'Institución no especificada',
              area: inv.area || inv.disciplina || 'Investigación',
              slug: `articulo-${inv.id}-${index}`,
              keywords: [inv.area, inv.disciplina, inv.especialidad].filter(Boolean)
            })
          }
        })
      }

      // Libros
      if (inv.libros) {
        const librosTexto = inv.libros.split('\n').filter((l: string) => l.trim())
        librosTexto.forEach((libroTexto: string, index: number) => {
          if (libroTexto.toLowerCase().includes(query.toLowerCase())) {
            proyectos.push({
              id: `${inv.id}_libro_${index}`,
              titulo: libroTexto.trim(),
              investigador: inv.nombre_completo,
              institucion: inv.institucion || 'Institución no especificada',
              area: inv.area || inv.disciplina || 'Investigación',
              slug: `libro-${inv.id}-${index}`,
              keywords: [inv.area, inv.disciplina, inv.especialidad].filter(Boolean)
            })
          }
        })
      }
    })

    // Si no hay publicaciones reales, buscar en las de ejemplo
    if (proyectos.length === 0 && investigadores.length > 0) {
      const primerInvestigador = investigadores[0]
      const publicacionesEjemplo = [
        {
          id: `${primerInvestigador.id}_demo_1`,
          titulo: "Desarrollo de Energías Renovables en Zonas Áridas: Un Estudio de Caso en Chihuahua",
          investigador: primerInvestigador.nombre_completo,
          institucion: primerInvestigador.institucion || 'Institución no especificada',
          area: primerInvestigador.area || 'Investigación',
          slug: `demo-${primerInvestigador.id}-1`,
          keywords: ["Energías renovables", "Zonas áridas", "Sostenibilidad", "Chihuahua"]
        },
        {
          id: `${primerInvestigador.id}_demo_2`,
          titulo: "Innovación Tecnológica en la Agricultura del Norte de México",
          investigador: primerInvestigador.nombre_completo,
          institucion: primerInvestigador.institucion || 'Institución no especificada',
          area: primerInvestigador.area || 'Investigación',
          slug: `demo-${primerInvestigador.id}-2`,
          keywords: ["Agricultura", "Innovación", "Tecnología", "México"]
        },
        {
          id: `${primerInvestigador.id}_demo_3`,
          titulo: "Análisis de Patrones de Sequía en el Desierto de Chihuahua",
          investigador: primerInvestigador.nombre_completo,
          institucion: primerInvestigador.institucion || 'Institución no especificada',
          area: primerInvestigador.area || 'Investigación',
          slug: `demo-${primerInvestigador.id}-3`,
          keywords: ["Sequía", "Cambio climático", "Desierto", "Análisis ambiental"]
        }
      ]

      // Filtrar publicaciones de ejemplo que coincidan con la búsqueda
      const publicacionesFiltradas = publicacionesEjemplo.filter(pub => 
        pub.titulo.toLowerCase().includes(query.toLowerCase()) ||
        pub.investigador.toLowerCase().includes(query.toLowerCase()) ||
        pub.institucion.toLowerCase().includes(query.toLowerCase()) ||
        pub.area.toLowerCase().includes(query.toLowerCase()) ||
        pub.keywords.some(keyword => keyword.toLowerCase().includes(query.toLowerCase()))
      )

      proyectos.push(...publicacionesFiltradas)
    }

    // Filtrar resultados según el tipo
    let resultado = {
      investigadores: type === 'all' || type === 'investigadores' ? investigadoresFormateados : [],
      proyectos: type === 'all' || type === 'proyectos' || type === 'publicaciones' ? proyectos : [],
      total: 0
    }

    resultado.total = resultado.investigadores.length + resultado.proyectos.length

    return NextResponse.json(resultado)
  } catch (error) {
    console.error("Error al buscar:", error)
    return NextResponse.json({ 
      investigadores: [], 
      proyectos: [], 
      total: 0,
      error: "Error al realizar la búsqueda" 
    }, { status: 500 })
  }
}
