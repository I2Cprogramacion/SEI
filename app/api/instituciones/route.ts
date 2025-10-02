import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { obtenerInvestigadores } from "@/lib/db"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Obtener investigadores de la base de datos
    const investigadores = await obtenerInvestigadores()
    
    // Extraer instituciones únicas de los investigadores
    const institucionesMap = new Map()
    
    if (Array.isArray(investigadores)) {
      investigadores.forEach(investigador => {
        const institucion = investigador.institucion || 'Institución no especificada'
        if (!institucionesMap.has(institucion)) {
          institucionesMap.set(institucion, {
            id: Math.random().toString(36).substr(2, 9),
            nombre: institucion,
            investigadores: 0,
            proyectos: 0,
            publicaciones: 0,
            tipo: 'Universidad',
            ubicacion: 'Chihuahua, México',
            sitio_web: '',
            telefono: '',
            email: ''
          })
        }
        institucionesMap.get(institucion).investigadores++
      })
    }
    
    // Convertir a array
    const instituciones = Array.from(institucionesMap.values())
    
    // Si no hay instituciones reales, crear algunas de ejemplo
    if (instituciones.length === 0) {
      instituciones.push(
        {
          id: 'demo_1',
          nombre: 'Universidad Autónoma de Chihuahua',
          investigadores: 0,
          proyectos: 0,
          publicaciones: 0,
          tipo: 'Universidad',
          ubicacion: 'Chihuahua, México',
          sitio_web: 'https://www.uach.mx',
          telefono: '+52 614 238 2000',
          email: 'contacto@uach.mx'
        },
        {
          id: 'demo_2',
          nombre: 'Instituto Tecnológico de Chihuahua',
          investigadores: 0,
          proyectos: 0,
          publicaciones: 0,
          tipo: 'Instituto Tecnológico',
          ubicacion: 'Chihuahua, México',
          sitio_web: 'https://www.itchihuahua.edu.mx',
          telefono: '+52 614 214 4800',
          email: 'contacto@itchihuahua.edu.mx'
        },
        {
          id: 'demo_3',
          nombre: 'Centro de Investigación en Materiales Avanzados',
          investigadores: 0,
          proyectos: 0,
          publicaciones: 0,
          tipo: 'Centro de Investigación',
          ubicacion: 'Chihuahua, México',
          sitio_web: 'https://www.cimav.edu.mx',
          telefono: '+52 614 439 4800',
          email: 'contacto@cimav.edu.mx'
        }
      )
    }
    
    return NextResponse.json({ instituciones })
  } catch (error) {
    console.error("Error al obtener instituciones:", error)
    return NextResponse.json({ 
      instituciones: [],
      error: "Error al obtener las instituciones" 
    }, { status: 500 })
  }
}