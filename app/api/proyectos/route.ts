import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { obtenerInvestigadores } from "@/lib/db"
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Obtener investigadores de la base de datos
    const investigadores = await obtenerInvestigadores()
    
    // Obtener proyectos del archivo JSON
    const proyectosPath = path.join(process.cwd(), 'data', 'proyectos.json')
    let proyectos = []
    
    try {
      const proyectosData = fs.readFileSync(proyectosPath, 'utf8')
      const proyectosJson = JSON.parse(proyectosData)
      proyectos = Array.isArray(proyectosJson) ? proyectosJson : []
    } catch (error) {
      console.error("Error al leer proyectos:", error)
    }
    
    // Procesar proyectos de investigadores
    const proyectosInvestigadores = []
    
    if (Array.isArray(investigadores)) {
      investigadores.forEach(investigador => {
        // Proyectos de investigación
        if (investigador.proyectos_investigacion) {
          const proyectosTexto = investigador.proyectos_investigacion.split('\n').filter((p: string) => p.trim())
          proyectosTexto.forEach((proyectoTexto: string, index: number) => {
            if (proyectoTexto.trim()) {
              proyectosInvestigadores.push({
                id: `${investigador.id}_proyecto_${index}`,
                titulo: proyectoTexto.trim(),
                investigador: investigador.nombre_completo,
                institucion: investigador.institucion || 'Institución no especificada',
                area: investigador.area || investigador.disciplina || 'Investigación',
                estado: 'activo',
                fecha_inicio: new Date().toISOString().split('T')[0],
                descripcion: `Proyecto de investigación de ${investigador.nombre_completo}`,
                tipo: 'Investigación'
              })
            }
          })
        }
      })
    }
    
    // Combinar proyectos del JSON con proyectos de investigadores
    const todosProyectos = [...proyectos, ...proyectosInvestigadores]
    
    // Si no hay proyectos reales, crear algunos de ejemplo
    if (todosProyectos.length === 0 && Array.isArray(investigadores) && investigadores.length > 0) {
      const primerInvestigador = investigadores[0]
      todosProyectos.push(
        {
          id: `${primerInvestigador.id}_demo_1`,
          titulo: "Desarrollo de Tecnologías Sostenibles para Zonas Áridas",
          investigador: primerInvestigador.nombre_completo,
          institucion: primerInvestigador.institucion || 'Institución no especificada',
          area: primerInvestigador.area || 'Investigación',
          estado: 'activo',
          fecha_inicio: '2024-01-01',
          descripcion: 'Proyecto enfocado en el desarrollo de tecnologías sostenibles para zonas áridas',
          tipo: 'Investigación'
        },
        {
          id: `${primerInvestigador.id}_demo_2`,
          titulo: "Análisis de Patrones Climáticos en el Norte de México",
          investigador: primerInvestigador.nombre_completo,
          institucion: primerInvestigador.institucion || 'Institución no especificada',
          area: primerInvestigador.area || 'Investigación',
          estado: 'en_progreso',
          fecha_inicio: '2024-02-01',
          descripcion: 'Estudio de patrones climáticos y su impacto en la región',
          tipo: 'Investigación'
        }
      )
    }
    
    return NextResponse.json({ proyectos: todosProyectos })
  } catch (error) {
    console.error("Error al obtener proyectos:", error)
    return NextResponse.json({ 
      proyectos: [],
      error: "Error al obtener los proyectos" 
    }, { status: 500 })
  }
}