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
    
    // No agregar datos dummy - solo devolver instituciones reales
    
    return NextResponse.json({ instituciones })
  } catch (error) {
    console.error("Error al obtener instituciones:", error)
    return NextResponse.json({ 
      instituciones: [],
      error: "Error al obtener las instituciones" 
    }, { status: 500 })
  }
}
