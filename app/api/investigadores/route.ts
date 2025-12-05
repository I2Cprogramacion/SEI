import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getDatabase } from "@/lib/database-config"

export const dynamic = 'force-dynamic'

// Función para mezclar array aleatoriamente (Fisher-Yates shuffle)
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase()
    
    // Obtener parámetro para modo admin (mostrar todos incluyendo inactivos)
    const { searchParams } = new URL(request.url)
    const incluirInactivos = searchParams.get('incluirInactivos') === 'true'
    
    // Obtener todos los investigadores de la base de datos
    const investigadoresRaw = await db.obtenerInvestigadores()
    
    // Filtrar investigadores según el modo
    const investigadoresFiltrados = investigadoresRaw.filter((inv: any) => {
      // Siempre requerir nombre completo
      const tieneNombre = inv.nombre_completo && inv.nombre_completo.trim() !== ''
      if (!tieneNombre) return false
      
      // Si incluirInactivos es true (modo admin), mostrar todos
      if (incluirInactivos) return true
      
      // Si no, solo mostrar activos (modo público)
      // Consideramos activo si NO es explícitamente false
      const estaActivo = inv.activo !== false
      return estaActivo
    })

    // Mezclar aleatoriamente los investigadores (solo en modo público)
    const investigadoresProcesados = incluirInactivos 
      ? investigadoresFiltrados 
      : shuffleArray(investigadoresFiltrados)

    // Mapear datos de snake_case a camelCase para el frontend
    const investigadores = investigadoresProcesados.map((inv: any) => {
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
        nombre: inv.nombre_completo || (inv.nombres && inv.apellidos ? `${inv.nombres} ${inv.apellidos}` : null) || 'Sin nombre',
        nombre_completo: inv.nombre_completo || (inv.nombres && inv.apellidos ? `${inv.nombres} ${inv.apellidos}` : null) || 'Sin nombre',
        email: inv.correo || null,
        correo: inv.correo || null,
        fotografiaUrl: inv.fotografia_url || null,
        fotografia_url: inv.fotografia_url || null,
        institucion: inv.institucion || null,
        area: inv.area_investigacion || null,
        area_investigacion: inv.area_investigacion || null,
        ultimoGradoEstudios: inv.ultimo_grado_estudios || null,
        ultimo_grado_estudios: inv.ultimo_grado_estudios || null,
        nivel: inv.nivel_investigador || inv.nivel || null,
        nivel_investigador: inv.nivel_investigador || inv.nivel || null,
        nivel_sni: inv.nivel_sni || null,
        estadoNacimiento: inv.estado_nacimiento || null,
        estado_nacimiento: inv.estado_nacimiento || null,
        entidadFederativa: inv.entidad_federativa || null,
        entidad_federativa: inv.entidad_federativa || null,
        municipio: inv.municipio || null,
        telefono: inv.telefono || null,
        lineaInvestigacion: inv.linea_investigacion || null,
        linea_investigacion: inv.linea_investigacion || null,
        slug: slug,
        fecha_registro: inv.fecha_registro || null,
        activo: inv.activo !== false,
        // Additional fields for evaluation
        articulos_publicados: inv.articulos || null,
        libros_publicados: inv.libros || null,
        capitulos_publicados: inv.capitulos_libros || null
      }
    })

    // Extraer filtros únicos
    const areas = Array.from(new Set(
      investigadores
        .map((inv: any) => inv.area)
        .filter((area: any) => area && area.trim() !== '')
    )).sort()

    const instituciones = Array.from(new Set(
      investigadores
        .map((inv: any) => inv.institucion)
        .filter((inst: any) => inst && inst.trim() !== '')
    )).sort()

    const ubicaciones = Array.from(new Set(
      investigadores
        .map((inv: any) => inv.municipio)
        .filter((ubic: any) => ubic && ubic.trim() !== '')
    )).sort()

    return NextResponse.json({
      investigadores: investigadores,
      filtros: {
        areas: areas,
        instituciones: instituciones,
        ubicaciones: ubicaciones
      }
    })

  } catch (error) {
    console.error("Error al obtener investigadores:", error)
    return NextResponse.json(
      { 
        error: "Error interno del servidor",
        detalles: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}