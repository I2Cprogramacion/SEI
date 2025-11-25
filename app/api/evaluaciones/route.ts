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
      // Obtener distribución por área
      const distribucionAreaQuery = `
        SELECT 
          COALESCE(area_investigacion, area, 'Sin área') as area,
          COUNT(*) as total
        FROM investigadores
        WHERE activo IS NOT FALSE
        GROUP BY COALESCE(area_investigacion, area, 'Sin área')
        ORDER BY total DESC
      `
      const distribucionAreaResult = await db.query(distribucionAreaQuery)
      const distribucionArea = Array.isArray(distribucionAreaResult)
        ? distribucionAreaResult
        : distribucionAreaResult.rows

      // Obtener distribución por nivel
      const distribucionNivelQuery = `
        SELECT 
          COALESCE(nivel_investigador, 'Sin nivel') as nivel,
          COUNT(*) as total
        FROM investigadores
        WHERE activo IS NOT FALSE
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
        : distribucionNivelResult.rows

      // Obtener total de investigadores
      const totalQuery = `
        SELECT COUNT(*) as total
        FROM investigadores
        WHERE activo IS NOT FALSE
      `
      const totalResult = await db.query(totalQuery)
      const total = Array.isArray(totalResult)
        ? (totalResult[0]?.total || 0)
        : (totalResult.rows[0]?.total || 0)

      return NextResponse.json({
        total: parseInt(String(total)),
        distribucionArea,
        distribucionNivel,
      })
    }

    // Detalle de investigadores para evaluación
    if (tipo === "detalle") {
      const area = searchParams.get("area")
      const nivel = searchParams.get("nivel")
      const estado = searchParams.get("estado") // bajo, medio, alto

      let whereConditions = ["activo IS NOT FALSE"]
      
      if (area && area !== "todas") {
        whereConditions.push(`(area_investigacion = '${area}' OR area = '${area}')`)
      }
      
      if (nivel && nivel !== "todos") {
        whereConditions.push(`nivel_investigador = '${nivel}'`)
      }

      const query = `
        SELECT 
          id,
          nombre_completo as nombre,
          email,
          fotografia_url,
          institucion,
          area_investigacion as area,
          nivel_investigador as nivel,
          articulos_publicados,
          libros_publicados,
          capitulos_publicados,
          patentes,
          proyectos_investigacion,
          slug
        FROM investigadores
        WHERE ${whereConditions.join(" AND ")}
        ORDER BY nombre_completo
      `

      const result = await db.query(query)
      const investigadores = Array.isArray(result) ? result : result.rows

      // Evaluar cada investigador contra parámetros SNII
      const investigadoresEvaluados = investigadores.map((inv: any) => {
        const areaId = mapearAreaAId(inv.area)
        const nivelId = mapearNivelAId(inv.nivel)
        
        if (!areaId || !nivelId) {
          return {
            ...inv,
            evaluacion: null,
            estadoGeneral: "sin_datos",
          }
        }

        const parametros = getParametrosSNII(areaId, nivelId)
        if (!parametros) {
          return {
            ...inv,
            evaluacion: null,
            estadoGeneral: "sin_datos",
          }
        }

        // Parsear valores del investigador
        const articulos = parseInt(inv.articulos_publicados) || 0
        const libros = parseInt(inv.libros_publicados) || 0
        const capitulos = parseInt(inv.capitulos_publicados) || 0

        // Comparar con parámetros
        const estadoArticulos = compararConParametros(articulos, parametros.articulos)
        const estadoLibros = compararConParametros(libros, parametros.libros)
        const estadoCapitulos = compararConParametros(capitulos, parametros.capitulos)

        // Calcular estado general (si al menos 2 de 3 indicadores están en "medio" o "alto")
        const estadosAltos = [estadoArticulos, estadoLibros, estadoCapitulos].filter(
          e => e === "alto"
        ).length
        const estadosMedios = [estadoArticulos, estadoLibros, estadoCapitulos].filter(
          e => e === "medio"
        ).length

        let estadoGeneral: "bajo" | "medio" | "alto"
        if (estadosAltos >= 2) {
          estadoGeneral = "alto"
        } else if (estadosAltos + estadosMedios >= 2) {
          estadoGeneral = "medio"
        } else {
          estadoGeneral = "bajo"
        }

        return {
          ...inv,
          evaluacion: {
            articulos: {
              valor: articulos,
              estado: estadoArticulos,
              q1: parametros.articulos.q1,
              q2: parametros.articulos.q2,
              q3: parametros.articulos.q3,
            },
            libros: {
              valor: libros,
              estado: estadoLibros,
              q1: parametros.libros.q1,
              q2: parametros.libros.q2,
              q3: parametros.libros.q3,
            },
            capitulos: {
              valor: capitulos,
              estado: estadoCapitulos,
              q1: parametros.capitulos.q1,
              q2: parametros.capitulos.q2,
              q3: parametros.capitulos.q3,
            },
          },
          estadoGeneral,
        }
      })

      // Filtrar por estado si se especifica
      const investigadoresFiltrados = estado
        ? investigadoresEvaluados.filter((inv: any) => inv.estadoGeneral === estado)
        : investigadoresEvaluados

      return NextResponse.json({
        investigadores: investigadoresFiltrados,
        total: investigadoresFiltrados.length,
      })
    }

    // Alertas: investigadores que necesitan actualizar
    if (tipo === "alertas") {
      const query = `
        SELECT 
          id,
          nombre_completo as nombre,
          email,
          fotografia_url,
          area_investigacion as area,
          nivel_investigador as nivel,
          articulos_publicados,
          libros_publicados,
          capitulos_publicados,
          ultima_actualizacion,
          slug
        FROM investigadores
        WHERE activo IS NOT FALSE
          AND nivel_investigador IS NOT NULL
          AND nivel_investigador != ''
        ORDER BY nombre_completo
      `

      const result = await db.query(query)
      const investigadores = Array.isArray(result) ? result : result.rows

      const alertas: any[] = []

      investigadores.forEach((inv: any) => {
        const areaId = mapearAreaAId(inv.area)
        const nivelId = mapearNivelAId(inv.nivel)
        
        if (!areaId || !nivelId) return

        const parametros = getParametrosSNII(areaId, nivelId)
        if (!parametros) return

        const articulos = parseInt(inv.articulos_publicados) || 0
        const libros = parseInt(inv.libros_publicados) || 0
        const capitulos = parseInt(inv.capitulos_publicados) || 0

        const problemas: string[] = []

        // Verificar si está por debajo de Q1 en indicadores principales
        if (articulos < parametros.articulos.q1) {
          problemas.push(`Artículos por debajo del cuartil 1 (tiene ${articulos}, esperado mínimo ${parametros.articulos.q1})`)
        }

        if (libros < parametros.libros.q1 && parametros.libros.q1 > 0) {
          problemas.push(`Libros por debajo del cuartil 1 (tiene ${libros}, esperado mínimo ${parametros.libros.q1})`)
        }

        if (capitulos < parametros.capitulos.q1 && parametros.capitulos.q1 > 0) {
          problemas.push(`Capítulos por debajo del cuartil 1 (tiene ${capitulos}, esperado mínimo ${parametros.capitulos.q1})`)
        }

        // Verificar última actualización
        const ultimaActualizacion = inv.ultima_actualizacion 
          ? new Date(inv.ultima_actualizacion)
          : null
        
        if (ultimaActualizacion) {
          const mesesSinActualizar = Math.floor(
            (Date.now() - ultimaActualizacion.getTime()) / (1000 * 60 * 60 * 24 * 30)
          )
          
          if (mesesSinActualizar > 6) {
            problemas.push(`Sin actualizar perfil desde hace ${mesesSinActualizar} meses`)
          }
        }

        if (problemas.length > 0) {
          alertas.push({
            id: inv.id,
            nombre: inv.nombre,
            email: inv.email,
            fotografia_url: inv.fotografia_url,
            area: inv.area,
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
        alertas,
        total: alertas.length,
        alta: alertas.filter(a => a.prioridad === "alta").length,
        media: alertas.filter(a => a.prioridad === "media").length,
      })
    }

    // Comparativa por área
    if (tipo === "comparativa") {
      const areas = Object.keys(AREAS_SNII)
      const comparativa = []

      for (const areaId of areas) {
        const areaData = AREAS_SNII[areaId]
        const areaQuery = `
          SELECT COUNT(*) as total
          FROM investigadores
          WHERE activo IS NOT FALSE
            AND (area_investigacion LIKE '%${areaData.nombre}%' OR area LIKE '%${areaData.nombre}%')
        `
        
        try {
          const result = await db.query(areaQuery)
          const total = Array.isArray(result) 
            ? (result[0]?.total || 0)
            : (result.rows[0]?.total || 0)

          comparativa.push({
            areaId,
            area: areaData.nombre,
            total: parseInt(String(total)),
          })
        } catch (error) {
          console.error(`Error al contar investigadores para ${areaData.nombre}:`, error)
        }
      }

      return NextResponse.json({
        comparativa,
      })
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

