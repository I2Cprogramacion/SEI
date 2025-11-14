import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getDatabase } from "@/lib/database-config"

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    
    if (!slug) {
      return NextResponse.json(
        { error: "Slug es requerido" },
        { status: 400 }
      )
    }

    const db = await getDatabase()
    
    // Buscar el campo por slug (convertir slug a nombre)
    const nombreCampo = slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
    
    // Obtener estadísticas del campo específico
    const campoQuery = `
      SELECT 
        COALESCE(area, area_investigacion, 'Sin especificar') as nombre,
        COALESCE(area, area_investigacion, 'Sin especificar') as area,
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
      WHERE LOWER(COALESCE(area, area_investigacion, 'Sin especificar')) = LOWER($1)
      GROUP BY COALESCE(area, area_investigacion, 'Sin especificar')
    `
    
    const campoResult = await db.query(campoQuery, [nombreCampo])
    
    if (campoResult.length === 0) {
      return NextResponse.json(
        { error: "Campo de investigación no encontrado" },
        { status: 404 }
      )
    }
    
    const campo = campoResult[0]
    
    // Obtener subcampos/especialidades
    const subcamposQuery = `
      SELECT 
        STRING_AGG(DISTINCT especialidad, ', ') as especialidades,
        STRING_AGG(DISTINCT disciplina, ', ') as disciplinas,
        STRING_AGG(DISTINCT linea_investigacion, ', ') as lineas_investigacion
      FROM investigadores 
      WHERE LOWER(COALESCE(area, area_investigacion, 'Sin especificar')) = LOWER($1)
        AND (especialidad IS NOT NULL AND especialidad != '')
    `
    
    const subcamposResult = await db.query(subcamposQuery, [nombreCampo])
    const subcampos = subcamposResult[0] || { especialidades: '', disciplinas: '', lineas_investigacion: '' }
    
    // Obtener lista de investigadores en este campo
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
      WHERE LOWER(COALESCE(area, area_investigacion, 'Sin especificar')) = LOWER($1)
      ORDER BY nombre_completo ASC
      LIMIT 20
    `
    
    const investigadores = await db.query(investigadoresQuery, [nombreCampo])
    
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
    
    const proyectos = await db.query(proyectosQuery, [nombreCampo])
    
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
      WHERE LOWER(COALESCE(inv.area, inv.area_investigacion, 'Sin especificar')) = LOWER($1)
        AND i.activo = true
      ORDER BY i.nombre ASC
      LIMIT 10
    `
    
    const instituciones = await db.query(institucionesQuery, [nombreCampo])
    
    // Procesar subcampos
    const especialidades = subcampos.especialidades ? subcampos.especialidades.split(', ').filter(Boolean) : []
    const disciplinas = subcampos.disciplinas ? subcampos.disciplinas.split(', ').filter(Boolean) : []
    const lineas = subcampos.lineas_investigacion ? subcampos.lineas_investigacion.split(', ').filter(Boolean) : []
    
    const subcamposLista = especialidades.length > 0 
      ? especialidades 
      : disciplinas.length > 0 
        ? disciplinas 
        : lineas.slice(0, 4)
    
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
    const colorIndex = Math.abs(campo.nombre.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % colores.length
    
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
    console.error("Error al obtener campo de investigación:", error)
    return NextResponse.json(
      { error: "Error interno del servidor", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
