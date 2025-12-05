import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getDatabase } from "@/lib/database-config"
import { AREAS_SNII, getParametrosSNII, compararConParametros } from "@/lib/snii-parametros"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase()
    const { searchParams } = new URL(request.url)
    const tipo = searchParams.get("tipo") || "resumen"

    // Resumen general de evaluaciones
    if (tipo === "resumen") {
      try {
        // Obtener distribución por área
        const distribucionAreaQuery = `
          SELECT 
            COALESCE(area_investigacion, 'Sin área') as area,
            COUNT(*) as total
          FROM investigadores
          WHERE activo = true OR activo IS NULL
          GROUP BY COALESCE(area_investigacion, 'Sin área')
          ORDER BY total DESC
        `
        const distribucionAreaResult = await db.query(distribucionAreaQuery)
        const distribucionArea = Array.isArray(distribucionAreaResult)
          ? distribucionAreaResult
          : distribucionAreaResult.rows || []

        // Obtener distribución por nivel
        const distribucionNivelQuery = `
          SELECT 
            COALESCE(nivel_investigador, 'Sin nivel') as nivel,
            COUNT(*) as total
          FROM investigadores
          WHERE activo = true OR activo IS NULL
          GROUP BY COALESCE(nivel_investigador, 'Sin nivel')
          ORDER BY 
            CASE 
              WHEN nivel_investigador = 'SNII III' THEN 1
              WHEN nivel_investigador = 'SNII II' THEN 2
              WHEN nivel_investigador = 'SNII I' THEN 3
              WHEN nivel_investigador = 'Candidato SNII' THEN 4
              ELSE 5
            END
        `
        const distribucionNivelResult = await db.query(distribucionNivelQuery)
        const distribucionNivel = Array.isArray(distribucionNivelResult)
          ? distribucionNivelResult
          : distribucionNivelResult.rows || []

        // Obtener total de investigadores
        const totalQuery = `
          SELECT COUNT(*) as total
          FROM investigadores
          WHERE activo = true OR activo IS NULL
        `
        const totalResult = await db.query(totalQuery)
        const total = Array.isArray(totalResult)
          ? (totalResult[0]?.total || 0)
          : (totalResult.rows?.[0]?.total || 0)

        return NextResponse.json({
          total: parseInt(String(total)) || 0,
          distribucionArea: distribucionArea || [],
          distribucionNivel: distribucionNivel || [],
        })
      } catch (error) {
        console.error("Error en resumen:", error)
        // Retornar datos vacíos en lugar de error
        return NextResponse.json({
          total: 0,
          distribucionArea: [],
          distribucionNivel: [],
        })
      }
    }

    // Detalle de investigadores para evaluación
    if (tipo === "detalle") {
      try {
        const area = searchParams.get("area")
        const nivel = searchParams.get("nivel")

        let whereConditions = ["activo = true OR activo IS NULL"]
        const params: any[] = []
        let paramCount = 1
        
        if (area && area !== "todas") {
          whereConditions.push(`area_investigacion ILIKE $${paramCount}`)
          params.push(`%${area}%`)
          paramCount++
        }
        
        if (nivel && nivel !== "todos") {
          whereConditions.push(`nivel_investigador = $${paramCount}`)
          params.push(nivel)
          paramCount++
        }

        const query = `
          SELECT 
            id,
            nombre_completo as nombre,
            correo as email,
            fotografia_url,
            institucion,
            area_investigacion as area,
            nivel_investigador as nivel,
            slug
          FROM investigadores
          WHERE ${whereConditions.join(" AND ")}
          ORDER BY nombre_completo
        `

        const result = await db.query(query, params)
        const investigadores = Array.isArray(result) ? result : result.rows || []

        // Por ahora, retornar investigadores sin evaluación detallada
        // (hasta que tengamos campos numéricos de producción)
        const investigadoresConEstado = investigadores.map((inv: any) => ({
          ...inv,
          evaluacion: null,
          estadoGeneral: "sin_datos",
        }))

        return NextResponse.json({
          investigadores: investigadoresConEstado || [],
          total: investigadoresConEstado.length || 0,
        })
      } catch (error) {
        console.error("Error en detalle:", error)
        return NextResponse.json({
          investigadores: [],
          total: 0,
        })
      }
    }

    // Alertas: investigadores que necesitan actualizar
    if (tipo === "alertas") {
      try {
        const query = `
          SELECT 
            id,
            nombre_completo as nombre,
            correo as email,
            fotografia_url,
            area_investigacion as area,
            nivel_investigador as nivel,
            fecha_registro,
            slug
          FROM investigadores
          WHERE (activo = true OR activo IS NULL)
            AND nivel_investigador IS NOT NULL
            AND nivel_investigador != ''
          ORDER BY nombre_completo
        `

        const result = await db.query(query)
        const investigadores = Array.isArray(result) ? result : result.rows || []

        const alertas: any[] = []

        // Por ahora, solo generar alertas basadas en fecha de registro
        // (hasta que tengamos campos numéricos de producción)
        investigadores.forEach((inv: any) => {
          const problemas: string[] = []

          // Verificar si el perfil está completo
          if (!inv.area) {
            problemas.push("Área de investigación no especificada")
          }

          // Verificar fecha de registro
          const fechaRegistro = inv.fecha_registro 
            ? new Date(inv.fecha_registro)
            : null
          
          if (fechaRegistro) {
            const mesesDesdeRegistro = Math.floor(
              (Date.now() - fechaRegistro.getTime()) / (1000 * 60 * 60 * 24 * 30)
            )
            
            if (mesesDesdeRegistro > 12) {
              problemas.push(`Perfil registrado hace ${mesesDesdeRegistro} meses - Revisar actualización`)
            }
          }

          if (problemas.length > 0) {
            alertas.push({
              id: inv.id,
              nombre: inv.nombre,
              email: inv.email || "No especificado",
              fotografia_url: inv.fotografia_url,
              area: inv.area || "Sin área",
              nivel: inv.nivel,
              problemas,
              prioridad: problemas.length >= 2 ? "alta" : "media",
              slug: inv.slug,
            })
          }
        })

        // Ordenar por prioridad
        alertas.sort((a, b) => {
          if (a.prioridad === "alta" && b.prioridad !== "alta") return -1
          if (a.prioridad !== "alta" && b.prioridad === "alta") return 1
          return b.problemas.length - a.problemas.length
        })

        return NextResponse.json({
          alertas: alertas || [],
          total: alertas.length || 0,
          alta: alertas.filter(a => a.prioridad === "alta").length || 0,
          media: alertas.filter(a => a.prioridad === "media").length || 0,
        })
      } catch (error) {
        console.error("Error en alertas:", error)
        // Retornar datos vacíos en lugar de error
        return NextResponse.json({
          alertas: [],
          total: 0,
          alta: 0,
          media: 0,
        })
      }
    }

    // Comparativa por área
    if (tipo === "comparativa") {
      try {
        const areas = Object.keys(AREAS_SNII)
        const comparativa = []

        for (const areaId of areas) {
          const areaData = AREAS_SNII[areaId]
          const areaQuery = `
            SELECT COUNT(*) as total
            FROM investigadores
            WHERE (activo = true OR activo IS NULL)
              AND area_investigacion ILIKE $1
          `
          
          try {
            const result = await db.query(areaQuery, [`%${areaData.nombre}%`])
            const total = Array.isArray(result) 
              ? (result[0]?.total || 0)
              : (result.rows?.[0]?.total || 0)

            comparativa.push({
              areaId,
              area: areaData.nombre,
              total: parseInt(String(total)) || 0,
            })
          } catch (error) {
            console.error(`Error al contar investigadores para ${areaData.nombre}:`, error)
            comparativa.push({
              areaId,
              area: areaData.nombre,
              total: 0,
            })
          }
        }

        return NextResponse.json({
          comparativa: comparativa || [],
        })
      } catch (error) {
        console.error("Error en comparativa:", error)
        return NextResponse.json({
          comparativa: [],
        })
      }
    }

    return NextResponse.json(
      { error: "Tipo de consulta no válido" },
      { status: 400 }
    )

  } catch (error) {
    console.error("Error al obtener evaluaciones:", error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Error desconocido",
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

/**
 * Mapea el nombre del área a su ID
 */
function mapearAreaAId(area: string | null): string | null {
  if (!area) return null

  const areaLower = area.toLowerCase()
  
  if (areaLower.includes("físico") || areaLower.includes("matemáticas") || areaLower.includes("tierra")) {
    return "area1"
  }
  if (areaLower.includes("biología") || areaLower.includes("química")) {
    return "area2"
  }
  if (areaLower.includes("medicina") || areaLower.includes("salud")) {
    return "area3"
  }
  if (areaLower.includes("conducta") || areaLower.includes("educación")) {
    return "area4"
  }
  if (areaLower.includes("humanidades")) {
    return "area5"
  }
  if (areaLower.includes("sociales")) {
    return "area6"
  }
  if (areaLower.includes("agricultura") || areaLower.includes("agropecuarias") || areaLower.includes("forestales") || areaLower.includes("ecosistemas")) {
    return "area7"
  }
  if (areaLower.includes("ingenierías") || areaLower.includes("ingeniería") || areaLower.includes("tecnológico")) {
    return "area8"
  }
  if (areaLower.includes("interdisciplinaria")) {
    return "area9"
  }

  return null
}

/**
 * Mapea el nombre del nivel a su ID
 */
function mapearNivelAId(nivel: string | null): string | null {
  if (!nivel) return null

  const nivelLower = nivel.toLowerCase()
  
  if (nivelLower.includes("candidato")) {
    return "candidato"
  }
  if (nivelLower.includes("snii iii") || nivelLower.includes("snii 3") || nivelLower.includes("nivel 3") || nivelLower === "iii") {
    return "nivel3"
  }
  if (nivelLower.includes("snii ii") || nivelLower.includes("snii 2") || nivelLower.includes("nivel 2") || nivelLower === "ii") {
    return "nivel2"
  }
  if (nivelLower.includes("snii i") || nivelLower.includes("snii 1") || nivelLower.includes("nivel 1") || nivelLower === "i") {
    return "nivel1"
  }

  return null
}

