import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { obtenerProyectos } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // Obtener todos los proyectos de la base de datos
    const response = await obtenerProyectos()
    const proyectos = response.proyectos || []
    
    // Filtrar solo proyectos con datos básicos completos
    const proyectosCompletos = proyectos.filter(proyecto => 
      proyecto.titulo && 
      proyecto.autor &&
      proyecto.autor.nombreCompleto
    )
    
    // Si no hay proyectos completos, devolver array vacío
    if (proyectosCompletos.length === 0) {
      return NextResponse.json([])
    }
    
    // Ordenar por fecha de publicación (más recientes primero) y tomar máximo 4
    const proyectosOrdenados = proyectosCompletos
      .sort((a, b) => {
        // Si hay fechas, ordenar por fecha
        if (a.fechaPublicacion && b.fechaPublicacion) {
          return new Date(b.fechaPublicacion).getTime() - new Date(a.fechaPublicacion).getTime()
        }
        // Si no hay fechas, mantener orden original
        return 0
      })
      .slice(0, Math.min(4, proyectosCompletos.length))
    
    // Transformar datos al formato esperado por el componente
    const formattedProjects = proyectosOrdenados.map(proyecto => ({
      id: proyecto.id,
      title: proyecto.titulo,
      status: proyecto.autor?.estado || "Chihuahua",
      category: "Investigación",
      startDate: proyecto.fechaPublicacion ? 
        new Date(proyecto.fechaPublicacion).toLocaleDateString('es-ES', { 
          year: 'numeric', 
          month: 'short' 
        }) : "Fecha no disponible",
      slug: proyecto.slug || `proyecto-${proyecto.id}`
    }))
    
    return NextResponse.json(formattedProjects)
  } catch (error) {
    console.error("Error al obtener proyectos recientes:", error)
    return NextResponse.json({ error: "Error al obtener los proyectos recientes" }, { status: 500 })
  }
}
