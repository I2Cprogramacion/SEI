import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getDatabase } from "@/lib/database-config"

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  let slug: string = ''
  
  try {
    const paramsData = await params
    slug = paramsData.slug
    
    if (!slug) {
      return NextResponse.json(
        { error: "Slug es requerido" },
        { status: 400 }
      )
    }

    const db = await getDatabase()
    
    // Buscar el campo por slug (convertir slug a nombre)
    // Primero intentamos buscar el campo usando el slug directamente como patrón
    let nombreCampo = slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
    
    console.log(`Buscando campo con slug: ${slug}, nombre generado: ${nombreCampo}`)
    
    // Obtener estadísticas del campo específico
    // Intentar buscar con coincidencia parcial para mayor flexibilidad
    const campoQuery = `
      SELECT 
        COALESCE(area_investigacion, 'Sin especificar') as nombre,
        COALESCE(area_investigacion, 'Sin especificar') as area,
        COUNT(DISTINCT id) as investigadores,
        COUNT(DISTINCT CASE WHEN proyectos_investigacion IS NOT NULL AND proyectos_investigacion != '' THEN id END) as proyectos,
        COUNT(DISTINCT CASE WHEN articulos IS NOT NULL AND articulos != '' THEN id END) as publicaciones,
        COUNT(DISTINCT institucion) as instituciones,
        AVG(CASE 
          WHEN fecha_registro IS NOT NULL 
          THEN EXTRACT(EPOCH FROM (NOW() - fecha_registro)) / 86400 
          ELSE 0 
        END) as dias_promedio_registro,
        STRING_AGG(DISTINCT institucion, ', ') as instituciones_lista
      FROM investigadores 
      WHERE LOWER(COALESCE(area_investigacion, 'Sin especificar')) LIKE LOWER($1)
      GROUP BY COALESCE(area_investigacion, 'Sin especificar')
      LIMIT 1
    `
    
    // Intentar primero con coincidencia exacta, luego con LIKE
    let campoResult = await db.query(campoQuery, [nombreCampo])
    console.log(`🔍 Búsqueda inicial con "${nombreCampo}": ${campoResult.length} resultados`)
    
    // Si no encuentra con el nombre generado, intentar con búsqueda parcial
    if (campoResult.length === 0) {
      console.log(`No se encontró con nombre exacto, intentando con búsqueda parcial...`)
      const searchPattern = `%${nombreCampo.split(' ').join('%')}%`
      campoResult = await db.query(campoQuery, [searchPattern])
      console.log(`Búsqueda con patrón ${searchPattern}, resultados: ${campoResult.length}`)
    }
    
    if (campoResult.length === 0) {
      console.log(`Campo no encontrado para slug: ${slug}, nombre: ${nombreCampo}`)
      return NextResponse.json(
        { error: "Campo de investigación no encontrado" },
        { status: 404 }
      )
    }
    
    const campo = campoResult[0]
    
    // Usar el nombre real del campo encontrado para las siguientes queries
    const nombreCampoReal = campo.nombre
    console.log(`Campo encontrado: ${nombreCampoReal}`)
    
    // Obtener subcampos/especialidades y líneas de investigación
    let subcampos: { especialidades: string | null, disciplinas: string | null, lineas_investigacion: string | null } = { 
      especialidades: null, 
      disciplinas: null, 
      lineas_investigacion: null 
    }
    
    try {
      const subcamposQuery = `
        SELECT 
          STRING_AGG(DISTINCT especialidad, ', ') as especialidades,
          STRING_AGG(DISTINCT disciplina, ', ') as disciplinas,
          STRING_AGG(DISTINCT linea_investigacion, ', ') as lineas_investigacion
        FROM investigadores 
        WHERE LOWER(COALESCE(area_investigacion, 'Sin especificar')) = LOWER($1)
          AND (
            (especialidad IS NOT NULL AND especialidad != '') OR
            (disciplina IS NOT NULL AND disciplina != '') OR
            (linea_investigacion IS NOT NULL AND linea_investigacion != '')
          )
      `
      
      const subcamposResult = await db.query(subcamposQuery, [nombreCampoReal])
      subcampos = subcamposResult[0] || subcampos
      console.log(`✅ Subcampos obtenidos para ${nombreCampoReal}:`, {
        especialidades: subcampos.especialidades?.length || 0,
        disciplinas: subcampos.disciplinas?.length || 0,
        lineas: subcampos.lineas_investigacion?.length || 0
      })
    } catch (subcamposError) {
      console.error(`❌ Error al obtener subcampos:`, subcamposError)
      // Continuar sin subcampos en lugar de fallar completamente
    }
    
    // Obtener lista de investigadores en este campo
    let investigadores: any[] = []
    
    try {
      const investigadoresQuery = `
        SELECT 
          id,
          nombre_completo as nombre,
          correo as email,
          institucion,
          linea_investigacion,
          fotografia_url,
          ultimo_grado_estudios,
          slug
        FROM investigadores 
        WHERE LOWER(COALESCE(area_investigacion, 'Sin especificar')) = LOWER($1)
        ORDER BY nombre_completo ASC
        LIMIT 20
      `
      
      investigadores = await db.query(investigadoresQuery, [nombreCampoReal])
      console.log(`✅ ${investigadores.length} investigadores encontrados en ${nombreCampoReal}`)
    } catch (invError) {
      console.error(`❌ Error al obtener investigadores:`, invError)
      // Continuar con array vacío
    }
    
    // Obtener proyectos relacionados con este campo
    const proyectosQuery = `
      SELECT 
        id,
        titulo,
        descripcion,
        resumen,
        investigador_principal AS autor,
        institucion,
        fecha_inicio,
        fecha_fin,
        estado,
        categoria,
        area_investigacion,
        slug
      FROM proyectos
      WHERE LOWER(COALESCE(area_investigacion, '')) = LOWER($1)
      ORDER BY fecha_creacion DESC
      LIMIT 10
    `
    
    const proyectos = await db.query(proyectosQuery, [nombreCampoReal])
    
    // Obtener publicaciones relacionadas (a través de investigadores del campo)
    const investigadoresIds = investigadores.map((inv: any) => inv.id)
    let publicaciones: any[] = []
    
    if (investigadoresIds.length > 0) {
      // Obtener correos y nombres de los investigadores
      const investigadoresInfo = investigadores.map((inv: any) => ({
        email: inv.email?.toLowerCase() || '',
        nombre: inv.nombre?.toLowerCase() || ''
      }))
      
      // Construir condiciones para buscar publicaciones
      const condicionesPublicaciones: string[] = []
      const valoresPublicaciones: any[] = []
      let paramIndex = 1
      
      investigadoresInfo.forEach((inv: any) => {
        if (inv.email) {
          condicionesPublicaciones.push(`LOWER(autor) LIKE $${paramIndex}`)
          valoresPublicaciones.push(`%${inv.email}%`)
          paramIndex++
        }
        if (inv.nombre) {
          const nombreParts = inv.nombre.split(' ').filter(Boolean)
          if (nombreParts.length >= 2) {
            const apellidos = nombreParts.slice(1).join(' ')
            condicionesPublicaciones.push(`LOWER(autor) LIKE $${paramIndex}`)
            valoresPublicaciones.push(`%${apellidos}%`)
            paramIndex++
          }
        }
      })
      
      if (condicionesPublicaciones.length > 0) {
        const publicacionesQuery = `
          SELECT 
            id,
            titulo,
            autor,
            institucion,
            editorial,
            año_creacion as anio,
            doi,
            resumen,
            palabras_clave,
            categoria,
            tipo,
            slug
          FROM publicaciones
          WHERE ${condicionesPublicaciones.join(' OR ')}
          ORDER BY año_creacion DESC NULLS LAST, fecha_creacion DESC
          LIMIT 10
        `
        
        publicaciones = await db.query(publicacionesQuery, valoresPublicaciones)
      }
    }
    
    // Obtener instituciones relacionadas (únicas)
    const institucionesQuery = `
      SELECT DISTINCT
        i.id,
        i.nombre,
        i.siglas,
        i.tipo,
        i.imagen_url,
        i.sitio_web,
        i.estado,
        i.activo
      FROM instituciones i
      INNER JOIN investigadores inv ON LOWER(TRIM(inv.institucion)) = LOWER(TRIM(i.nombre))
      WHERE LOWER(COALESCE(inv.area_investigacion, 'Sin especificar')) = LOWER($1)
        AND i.activo = true
      ORDER BY i.nombre ASC
      LIMIT 10
    `
    
    const instituciones = await db.query(institucionesQuery, [nombreCampoReal])
    
    // Procesar subcampos y líneas de investigación
    const especialidades = subcampos.especialidades ? subcampos.especialidades.split(', ').filter(Boolean) : []
    const disciplinas = subcampos.disciplinas ? subcampos.disciplinas.split(', ').filter(Boolean) : []
    const lineas = subcampos.lineas_investigacion ? subcampos.lineas_investigacion.split(', ').filter(Boolean) : []
    
    // Priorizar líneas de investigación, luego especialidades, luego disciplinas
    const subcamposLista = lineas.length > 0 
      ? lineas.slice(0, 8)  // Mostrar hasta 8 líneas de investigación
      : especialidades.length > 0 
        ? especialidades 
        : disciplinas.length > 0 
          ? disciplinas 
          : []
    
    console.log(`Campo ${nombreCampoReal}: ${lineas.length} líneas de investigación encontradas`)
    
    // Calcular nivel de actividad
    const actividad = Math.min(100, Math.round((campo.investigadores * 2 + campo.proyectos * 3 + campo.publicaciones * 1.5) / 2))
    
    // Asignar colores basados en el área
    const colores = [
      'bg-blue-100 text-blue-800',
      'bg-purple-100 text-purple-800', 
      'bg-green-100 text-green-800',
      'bg-orange-100 text-orange-800',
      'bg-teal-100 text-teal-800',
      'bg-indigo-100 text-indigo-800',
      'bg-pink-100 text-pink-800',
      'bg-lime-100 text-lime-800'
    ]
    const colorIndex = Math.abs(campo.nombre.split('').reduce((a: number, b: string) => a + b.charCodeAt(0), 0)) % colores.length
    
    const campoFormateado = {
      nombre: campo.nombre,
      descripcion: `Área de investigación con ${campo.investigadores} investigadores activos en ${campo.instituciones} instituciones`,
      investigadores: parseInt(campo.investigadores) || 0,
      proyectos: parseInt(campo.proyectos) || 0,
      publicaciones: parseInt(campo.publicaciones) || 0,
      instituciones: parseInt(campo.instituciones) || 0,
      crecimiento: actividad,
      tendencia: actividad > 70 ? "up" : actividad > 40 ? "stable" : "down",
      subcampos: subcamposLista,
      lineas_investigacion: lineas, // Todas las líneas de investigación
      especialidades: especialidades,
      disciplinas: disciplinas,
      color: colores[colorIndex],
      slug: slug,
      instituciones_lista: campo.instituciones_lista,
      dias_promedio_registro: Math.round(campo.dias_promedio_registro || 0),
      investigadores_lista: investigadores.map((inv: any) => ({
        id: inv.id,
        nombre: inv.nombre,
        email: inv.email,
        institucion: inv.institucion || 'Institución no especificada',
        linea_investigacion: inv.linea_investigacion,
        fotografia_url: inv.fotografia_url,
        ultimo_grado_estudios: inv.ultimo_grado_estudios,
        slug: inv.slug || `investigador-${inv.id}`
      })),
      proyectos_lista: proyectos.map((proj: any) => ({
        id: proj.id,
        titulo: proj.titulo,
        descripcion: proj.descripcion || proj.resumen,
        autor: proj.autor,
        institucion: proj.institucion,
        estado: proj.estado,
        categoria: proj.categoria,
        fecha_inicio: proj.fecha_inicio,
        slug: proj.slug || `proyecto-${proj.id}`
      })),
      publicaciones_lista: publicaciones.map((pub: any) => ({
        id: pub.id,
        titulo: pub.titulo,
        autor: pub.autor,
        institucion: pub.institucion,
        editorial: pub.editorial,
        anio: pub.anio,
        categoria: pub.categoria,
        tipo: pub.tipo,
        slug: pub.slug || `publicacion-${pub.id}`
      })),
      instituciones_lista_detalle: instituciones.map((inst: any) => ({
        id: inst.id,
        nombre: inst.nombre,
        siglas: inst.siglas,
        tipo: inst.tipo,
        imagen_url: inst.imagen_url,
        sitio_web: inst.sitio_web,
        estado: inst.estado,
        activo: inst.activo
      }))
    }
    
    return NextResponse.json(campoFormateado)
    
  } catch (error) {
    console.error("❌ [CAMPOS] Error detallado al obtener campo de investigación:")
    console.error("   Slug recibido:", slug)
    console.error("   Error tipo:", error instanceof Error ? error.constructor.name : typeof error)
    console.error("   Mensaje:", error instanceof Error ? error.message : String(error))
    console.error("   Stack:", error instanceof Error ? error.stack : 'No stack trace')
    
    return NextResponse.json(
      { 
        error: "Error al cargar el campo de investigación", 
        details: error instanceof Error ? error.message : String(error),
        slug: slug,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

