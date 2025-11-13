import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getDatabase } from "@/lib/database-config"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase()

    // Contar investigadores activos
    const investigadoresQuery = `
      SELECT COUNT(*) as count
      FROM investigadores
      WHERE activo IS NOT FALSE
        AND nombre_completo IS NOT NULL
        AND nombre_completo != ''
    `
    const investigadoresResult = await db.query(investigadoresQuery)
    const investigadoresCount = Array.isArray(investigadoresResult) 
      ? (investigadoresResult[0]?.count || 0)
      : (investigadoresResult.rows[0]?.count || 0)

    // Contar proyectos
    let proyectosCount = 0
    
    try {
      const proyectosQuery = `SELECT COUNT(*) as count FROM proyectos`
      const proyectosResult = await db.query(proyectosQuery)
      proyectosCount = Array.isArray(proyectosResult)
        ? (proyectosResult[0]?.count || 0)
        : (proyectosResult.rows[0]?.count || 0)
    } catch (error) {
      // Si la tabla proyectos no existe, contar desde investigadores
      const proyectosInvQuery = `
        SELECT COUNT(*) as count
        FROM investigadores
        WHERE proyectos_investigacion IS NOT NULL
          AND proyectos_investigacion != ''
          AND trim(proyectos_investigacion) != ''
      `
      try {
        const proyectosInvResult = await db.query(proyectosInvQuery)
        proyectosCount = Array.isArray(proyectosInvResult)
          ? (proyectosInvResult[0]?.count || 0)
          : (proyectosInvResult.rows[0]?.count || 0)
      } catch (e) {
        console.log("No se pudieron contar proyectos:", e)
      }
    }

    // Contar publicaciones
    let publicacionesCount = 0
    try {
      const publicacionesQuery = `SELECT COUNT(*) as count FROM publicaciones`
      const publicacionesResult = await db.query(publicacionesQuery)
      publicacionesCount = Array.isArray(publicacionesResult)
        ? (publicacionesResult[0]?.count || 0)
        : (publicacionesResult.rows[0]?.count || 0)
    } catch (error) {
      // Si la tabla publicaciones no existe, contar desde investigadores
      const publicacionesInvQuery = `
        SELECT COUNT(*) as count
        FROM investigadores
        WHERE articulos IS NOT NULL
          AND articulos != ''
          AND trim(articulos) != ''
      `
      try {
        const publicacionesInvResult = await db.query(publicacionesInvQuery)
        publicacionesCount = Array.isArray(publicacionesInvResult)
          ? (publicacionesInvResult[0]?.count || 0)
          : (publicacionesInvResult.rows[0]?.count || 0)
      } catch (e) {
        console.log("No se pudieron contar publicaciones:", e)
      }
    }

    // Contar instituciones
    let institucionesCount = 0
    try {
      const institucionesQuery = `
        SELECT COUNT(*) as count
        FROM institutions
        WHERE activo IS NOT FALSE
      `
      const institucionesResult = await db.query(institucionesQuery)
      institucionesCount = Array.isArray(institucionesResult)
        ? (institucionesResult[0]?.count || 0)
        : (institucionesResult.rows[0]?.count || 0)
    } catch (error) {
      // Si la tabla institutions no existe, contar instituciones únicas desde investigadores
      const institucionesInvQuery = `
        SELECT COUNT(DISTINCT institucion) as count
        FROM investigadores
        WHERE institucion IS NOT NULL
          AND institucion != ''
          AND trim(institucion) != ''
      `
      try {
        const institucionesInvResult = await db.query(institucionesInvQuery)
        institucionesCount = Array.isArray(institucionesInvResult)
          ? (institucionesInvResult[0]?.count || 0)
          : (institucionesInvResult.rows[0]?.count || 0)
      } catch (e) {
        console.log("No se pudieron contar instituciones:", e)
      }
    }

    // Contar áreas de investigación únicas
    const areasQuery = `
      SELECT COUNT(DISTINCT COALESCE(area_investigacion, area)) as count
      FROM investigadores
      WHERE (area_investigacion IS NOT NULL AND area_investigacion != '' AND trim(area_investigacion) != '')
         OR (area IS NOT NULL AND area != '' AND trim(area) != '')
    `
    let areasCount = 0
    try {
      const areasResult = await db.query(areasQuery)
      areasCount = Array.isArray(areasResult)
        ? (areasResult[0]?.count || 0)
        : (areasResult.rows[0]?.count || 0)
    } catch (e) {
      console.log("No se pudieron contar áreas:", e)
    }

    // Contar colaboraciones (conexiones)
    let colaboracionesCount = 0
    try {
      const colaboracionesQuery = `SELECT COUNT(*) as count FROM conexiones WHERE estado = 'aceptada'`
      const colaboracionesResult = await db.query(colaboracionesQuery)
      colaboracionesCount = Array.isArray(colaboracionesResult)
        ? (colaboracionesResult[0]?.count || 0)
        : (colaboracionesResult.rows[0]?.count || 0)
    } catch (error) {
      // Si la tabla conexiones no existe, usar 0
      colaboracionesCount = 0
    }

    return NextResponse.json({
      investigadores: parseInt(String(investigadoresCount)) || 0,
      proyectos: parseInt(String(proyectosCount)) || 0,
      publicaciones: parseInt(String(publicacionesCount)) || 0,
      instituciones: parseInt(String(institucionesCount)) || 0,
      colaboraciones: parseInt(String(colaboracionesCount)) || 0,
      areas: parseInt(String(areasCount)) || 0,
    })

  } catch (error) {
    console.error("Error al obtener estadísticas:", error)
    return NextResponse.json(
      {
        investigadores: 0,
        proyectos: 0,
        publicaciones: 0,
        instituciones: 0,
        colaboraciones: 0,
        areas: 0,
        error: error instanceof Error ? error.message : "Error desconocido"
      },
      { status: 500 }
    )
  }
}

