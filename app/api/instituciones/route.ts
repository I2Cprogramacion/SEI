import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { obtenerInvestigadores } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // Obtener investigadores de la base de datos
    const investigadores = await obtenerInvestigadores()
    
    // Agrupar investigadores por institución
    const institucionesMap = new Map<string, any>()
    
    investigadores.forEach(inv => {
      const institucion = inv.institucion || 'Institución no especificada'
      
      if (!institucionesMap.has(institucion)) {
        institucionesMap.set(institucion, {
          id: institucion.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
          nombre: institucion,
          siglas: institucion.split(' ').map(word => word[0]).join('').substring(0, 6),
          tipo: "Institución de educación superior",
          ubicacion: "Chihuahua, México",
          descripcion: `Institución de educación superior en Chihuahua`,
          investigadores: 0,
          proyectos: 0,
          publicaciones: 0,
          areas: new Set<string>(),
          fundacion: 1990,
          sitioWeb: "#",
          slug: institucion.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
          investigadoresDestacados: []
        })
      }
      
      const institucionData = institucionesMap.get(institucion)
      institucionData.investigadores++
      
      // Contar proyectos
      if (inv.proyectos_investigacion) {
        const proyectos = inv.proyectos_investigacion.split('\n').filter((p: string) => p.trim())
        institucionData.proyectos += proyectos.length
      }
      
      // Contar publicaciones
      let publicaciones = 0
      if (inv.articulos) publicaciones += inv.articulos.split('\n').filter((a: string) => a.trim()).length
      if (inv.libros) publicaciones += inv.libros.split('\n').filter((l: string) => l.trim()).length
      if (inv.capitulos_libros) publicaciones += inv.capitulos_libros.split('\n').filter((c: string) => c.trim()).length
      if (inv.memorias) publicaciones += inv.memorias.split('\n').filter((m: string) => m.trim()).length
      institucionData.publicaciones += publicaciones
      
      // Agregar áreas
      if (inv.area) institucionData.areas.add(inv.area)
      if (inv.disciplina) institucionData.areas.add(inv.disciplina)
      if (inv.especialidad) institucionData.areas.add(inv.especialidad)
      
      // Agregar investigadores destacados (máximo 3)
      if (institucionData.investigadoresDestacados.length < 3) {
        institucionData.investigadoresDestacados.push({
          nombre: inv.nombre_completo,
          area: inv.area || inv.disciplina || inv.especialidad || 'Investigación'
        })
      }
    })
    
    // Convertir Map a array y formatear
    const instituciones = Array.from(institucionesMap.values()).map(inst => ({
      ...inst,
      areas: Array.from(inst.areas).slice(0, 5) // Máximo 5 áreas
    }))
    
    return NextResponse.json({ instituciones })
  } catch (error) {
    console.error("Error al obtener instituciones:", error)
    return NextResponse.json({ 
      instituciones: [],
      error: "Error al obtener las instituciones" 
    }, { status: 500 })
  }
}
