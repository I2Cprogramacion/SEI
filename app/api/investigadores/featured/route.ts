import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { obtenerInvestigadores } from "@/lib/db"
import fs from 'fs'
import path from 'path'

export async function GET(request: NextRequest) {
  try {
    // Obtener todos los investigadores de la base de datos
    const investigadores = await obtenerInvestigadores()
    
    // Filtrar solo investigadores con datos básicos completos y excluir administradores
    const investigadoresCompletos = investigadores.filter(inv => 
      inv.nombre_completo && 
      inv.correo && 
      inv.institucion &&
      inv.correo !== 'admin@sei.com.mx' && // Excluir administrador
      !inv.nombre_completo.toLowerCase().includes('administrador')
    )
    
    // Obtener autores de proyectos del archivo JSON
    const proyectosPath = path.join(process.cwd(), 'data', 'proyectos.json')
    let autoresProyectos = []
    
    try {
      const proyectosData = fs.readFileSync(proyectosPath, 'utf8')
      const proyectos = JSON.parse(proyectosData)
      
      // Extraer autores únicos de los proyectos
      const autoresUnicos = new Map()
      proyectos.forEach(proyecto => {
        if (proyecto.autor && proyecto.autor.nombreCompleto) {
          const nombre = proyecto.autor.nombreCompleto
          if (!autoresUnicos.has(nombre)) {
            autoresUnicos.set(nombre, {
              nombre_completo: nombre,
              correo: proyecto.autor.email || '',
              institucion: proyecto.autor.instituto || 'Institución no especificada',
              telefono: proyecto.autor.telefono || '',
              area: proyecto.categoria || 'Investigación',
              slug: nombre.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
            })
          }
        }
      })
      
      autoresProyectos = Array.from(autoresUnicos.values())
    } catch (error) {
      console.error("Error al leer proyectos:", error)
    }
    
    // Combinar investigadores de la base de datos con autores de proyectos
    const todosInvestigadores = [...investigadoresCompletos, ...autoresProyectos]
    
    // Si no hay investigadores, devolver array vacío
    if (todosInvestigadores.length === 0) {
      return NextResponse.json([])
    }
    
    // Mezclar array y tomar máximo 6 investigadores aleatorios
    const shuffled = [...todosInvestigadores].sort(() => 0.5 - Math.random())
    const featuredResearchers = shuffled.slice(0, Math.min(6, shuffled.length))
    
    // Transformar datos al formato esperado por el componente
    const formattedResearchers = featuredResearchers.map(inv => ({
      id: inv.id || Math.random().toString(36).substr(2, 9), // ID temporal para autores de proyectos
      name: inv.nombre_completo,
      title: inv.grado_maximo_estudios || "Investigador",
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
