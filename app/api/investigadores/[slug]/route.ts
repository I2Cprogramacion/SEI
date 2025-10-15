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

    // Buscar investigador por slug en PostgreSQL
    const result = await sql`
      SELECT 
        id,
        clerk_user_id as "clerkUserId",
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
        slug,
        entidad_federativa as location
      FROM investigadores
      WHERE slug = ${slug}
      LIMIT 1
    `

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Investigador no encontrado" },
        { status: 404 }
      )
    }

    // El resultado ya tiene los campos con alias correctos (camelCase)
    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error al obtener investigador:", error)
    return NextResponse.json(
      { error: "Error interno del servidor", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

