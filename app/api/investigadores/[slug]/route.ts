import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

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

    // Buscar por slug primero
    let result = await sql`
      SELECT 
        id,
        COALESCE(clerk_user_id, '') as "clerkUserId",
        nombre_completo as name,
        correo as email,
        curp,
        rfc,
        no_cvu as "noCvu",
        telefono,
        institucion as institution,
        area,
        area_investigacion as "areaInvestigacion",
        linea_investigacion as "lineaInvestigacion",
        fotografia_url as "fotografiaUrl",
        ultimo_grado_estudios as title,
        empleo_actual as "empleoActual",
        fecha_nacimiento as "fechaNacimiento",
        nacionalidad,
        orcid,
        nivel,
        domicilio,
        cp,
        grado_maximo_estudios as "gradoMaximoEstudios",
        disciplina,
        especialidad,
        sni,
        anio_sni as "anioSni",
        experiencia_docente as "experienciaDocente",
        experiencia_laboral as "experienciaLaboral",
        proyectos_investigacion as "proyectosInvestigacion",
        proyectos_vinculacion as "proyectosVinculacion",
        libros,
        capitulos_libros as "capitulosLibros",
        articulos,
        premios_distinciones as "premiosDistinciones",
        idiomas,
        colaboracion_internacional as "colaboracionInternacional",
        colaboracion_nacional as "colaboracionNacional",
        cv_url as "cvUrl",
        slug,
        entidad_federativa as location
      FROM investigadores
      WHERE slug = ${slug}
      LIMIT 1
    `;
    // Si no se encontró por slug, intentar por id si el slug es tipo investigador-{id}
    if (result.length === 0 && slug.startsWith('investigador-')) {
      const idStr = slug.replace('investigador-', '');
      const id = parseInt(idStr);
      if (!isNaN(id)) {
        result = await sql`
          SELECT 
            id,
            COALESCE(clerk_user_id, '') as "clerkUserId",
            nombre_completo as name,
            correo as email,
            curp,
            rfc,
            no_cvu as "noCvu",
            telefono,
            institucion as institution,
            area,
            area_investigacion as "areaInvestigacion",
            linea_investigacion as "lineaInvestigacion",
            fotografia_url as "fotografiaUrl",
            ultimo_grado_estudios as title,
            empleo_actual as "empleoActual",
            fecha_nacimiento as "fechaNacimiento",
            nacionalidad,
            orcid,
            nivel,
            domicilio,
            cp,
            grado_maximo_estudios as "gradoMaximoEstudios",
            disciplina,
            especialidad,
            sni,
            anio_sni as "anioSni",
            experiencia_docente as "experienciaDocente",
            experiencia_laboral as "experienciaLaboral",
            proyectos_investigacion as "proyectosInvestigacion",
            proyectos_vinculacion as "proyectosVinculacion",
            libros,
            capitulos_libros as "capitulosLibros",
            articulos,
            premios_distinciones as "premiosDistinciones",
            idiomas,
            colaboracion_internacional as "colaboracionInternacional",
            colaboracion_nacional as "colaboracionNacional",
            cv_url as "cvUrl",
            slug,
            entidad_federativa as location
          FROM investigadores
          WHERE id = ${id}
          LIMIT 1
        `;
      }
    }
    if (result.length === 0) {
      return NextResponse.json(
        { error: "Investigador no encontrado" },
        { status: 404 }
      )
    }
    // Mapear valores por defecto si faltan datos
    const inv = result[0]
    const mapped = {
      id: inv.id,
      clerkUserId: inv.clerkUserId || '',
      name: inv.name || 'Sin nombre',
      email: inv.email || 'Sin correo',
      curp: inv.curp || 'Sin CURP',
      rfc: inv.rfc || 'Sin RFC',
      noCvu: inv.noCvu || 'Sin CVU',
      telefono: inv.telefono || 'Sin teléfono',
      institution: inv.institution || 'Sin institución',
      area: inv.area || inv.areaInvestigacion || 'Sin área',
      areaInvestigacion: inv.areaInvestigacion || 'Sin área de investigación',
      lineaInvestigacion: inv.lineaInvestigacion || 'Sin línea de investigación',
      fotografiaUrl: inv.fotografiaUrl || null,
      title: inv.title || 'Investigador',
      empleoActual: inv.empleoActual || 'Sin empleo actual',
      fechaNacimiento: inv.fechaNacimiento || null,
      nacionalidad: inv.nacionalidad || 'Sin nacionalidad',
      orcid: inv.orcid || null,
      nivel: inv.nivel || 'Sin nivel',
      domicilio: inv.domicilio || null,
      cp: inv.cp || null,
      gradoMaximoEstudios: inv.gradoMaximoEstudios || 'Sin grado',
      disciplina: inv.disciplina || null,
      especialidad: inv.especialidad || null,
      sni: inv.sni || null,
      anioSni: inv.anioSni || null,
      experienciaDocente: inv.experienciaDocente || null,
      experienciaLaboral: inv.experienciaLaboral || null,
      proyectosInvestigacion: inv.proyectosInvestigacion || null,
      proyectosVinculacion: inv.proyectosVinculacion || null,
      libros: inv.libros || null,
      capitulosLibros: inv.capitulosLibros || null,
      articulos: inv.articulos || null,
      premiosDistinciones: inv.premiosDistinciones || null,
      idiomas: inv.idiomas || null,
      colaboracionInternacional: inv.colaboracionInternacional || null,
      colaboracionNacional: inv.colaboracionNacional || null,
      cvUrl: inv.cvUrl || null,
      slug: inv.slug || `investigador-${inv.id}`,
      location: inv.location || null
    }
    return NextResponse.json(mapped)
  } catch (error) {
    return NextResponse.json(
      { error: "Error interno del servidor", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

