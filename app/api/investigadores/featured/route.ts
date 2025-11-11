import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getDatabase } from "@/lib/database-config"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase()
    
    // Obtener todos los investigadores de la base de datos
    const investigadoresRaw = await db.obtenerInvestigadores()
    
    // Filtrar solo investigadores activos y con datos básicos
    const investigadoresActivos = investigadoresRaw.filter((inv: any) => {
      // Solo mostrar investigadores activos (activo !== false)
      const estaActivo = inv.activo !== false && inv.activo !== null
      // Y que tengan nombre completo
      const tieneNombre = inv.nombre_completo && inv.nombre_completo.trim() !== ''
      return estaActivo && tieneNombre
    })

    // Mapear datos de snake_case al formato esperado por FeaturedResearchers
    const investigadores = investigadoresActivos.slice(0, 8).map((inv: any) => {
      // Generar slug si no existe
      let slug = inv.slug
      if (!slug || slug.trim() === '') {
        const nombreSlug = (inv.nombre_completo || 'investigador')
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")
        slug = `${nombreSlug}-${inv.id}`
      }

      return {
        id: inv.id,
        name: inv.nombre_completo || (inv.nombres && inv.apellidos ? `${inv.nombres} ${inv.apellidos}` : null) || 'Sin nombre',
        title: inv.ultimo_grado_estudios || inv.nivel_investigador || inv.nivel || 'Investigador',
        institution: inv.institucion || 'Sin institución',
        field: inv.area_investigacion || inv.area || 'Sin área',
        avatar: inv.fotografia_url && inv.fotografia_url.includes('/image/upload/') && inv.fotografia_url.length > 50
          ? inv.fotografia_url 
          : undefined,
        slug: slug
      }
    })

    return NextResponse.json(investigadores)
  } catch (error) {
    console.error("Error al obtener investigadores destacados:", error)
    return NextResponse.json(
      { error: "Error al cargar investigadores destacados" },
      { status: 500 }
    )
  }
}
