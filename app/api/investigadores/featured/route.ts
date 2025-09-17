import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { obtenerInvestigadores } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // Obtener todos los investigadores de la base de datos
    const investigadores = await obtenerInvestigadores()
    
    // Filtrar solo investigadores con datos básicos completos
    const investigadoresCompletos = investigadores.filter(inv => 
      inv.nombre_completo && 
      inv.correo && 
      inv.institucion
    )
    
    // Si no hay investigadores completos, devolver array vacío
    if (investigadoresCompletos.length === 0) {
      return NextResponse.json([])
    }
    
    // Mezclar array y tomar máximo 6 investigadores aleatorios
    const shuffled = [...investigadoresCompletos].sort(() => 0.5 - Math.random())
    const featuredResearchers = shuffled.slice(0, Math.min(6, shuffled.length))
    
    // Transformar datos al formato esperado por el componente
    const formattedResearchers = featuredResearchers.map(inv => ({
      id: inv.id,
      name: inv.nombre_completo,
      title: inv.ultimo_grado_estudios || "Investigador",
      institution: inv.institucion,
      field: inv.area || inv.disciplina || inv.especialidad || "Investigación",
      avatar: inv.foto_perfil || undefined,
      slug: inv.slug || inv.nombre_completo.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    }))
    
    return NextResponse.json(formattedResearchers)
  } catch (error) {
    console.error("Error al obtener investigadores destacados:", error)
    return NextResponse.json({ error: "Error al obtener los investigadores destacados" }, { status: 500 })
  }
}
