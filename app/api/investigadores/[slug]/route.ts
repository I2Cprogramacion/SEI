import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import sqlite3 from "sqlite3"
import path from "path"

export const dynamic = 'force-dynamic'

// Función para generar slug
function generarSlug(nombreCompleto: string): string {
  return nombreCompleto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    
    // Conectar a la base de datos SQLite
    const dbPath = path.join(process.cwd(), 'database.db')
    const db = new sqlite3.Database(dbPath)

    // Obtener todos los investigadores
    const investigadores = await new Promise<any[]>((resolve, reject) => {
      db.all(`
        SELECT 
          id,
          nombre_completo,
          correo,
          curp,
          rfc,
          no_cvu,
          telefono,
          institucion,
          area,
          area_investigacion,
          linea_investigacion,
          fotografia_url,
          cv_url,
          ultimo_grado_estudios,
          empleo_actual,
          fecha_nacimiento,
          nacionalidad,
          orcid,
          nivel,
          estado_nacimiento,
          municipio,
          entidad_federativa,
          domicilio,
          cp,
          grado_maximo_estudios,
          disciplina,
          especialidad,
          sni,
          anio_sni,
          experiencia_docente,
          experiencia_laboral,
          proyectos_investigacion,
          proyectos_vinculacion,
          libros,
          capitulos_libros,
          articulos,
          premios_distinciones,
          idiomas,
          colaboracion_internacional,
          colaboracion_nacional
        FROM investigadores
        ORDER BY nombre_completo ASC
      `, (err, rows) => {
        db.close()
        if (err) reject(err)
        else resolve(rows)
      })
    })

    // Buscar investigador por slug
    const investigador = investigadores.find((inv: any) => {
      const generatedSlug = generarSlug(inv.nombre_completo)
      return generatedSlug === slug
    })

    if (!investigador) {
      return NextResponse.json(
        { error: "Investigador no encontrado" },
        { status: 404 }
      )
    }

    // Formatear respuesta
    const investigadorFormateado = {
      id: investigador.id,
      name: investigador.nombre_completo,
      email: investigador.correo,
      curp: investigador.curp,
      rfc: investigador.rfc,
      noCvu: investigador.no_cvu,
      telefono: investigador.telefono,
      institution: investigador.institucion,
      area: investigador.area,
      areaInvestigacion: investigador.area_investigacion,
      lineaInvestigacion: investigador.linea_investigacion,
      fotografiaUrl: investigador.fotografia_url,
      cvUrl: investigador.cv_url,
      title: investigador.ultimo_grado_estudios,
      empleoActual: investigador.empleo_actual,
      fechaNacimiento: investigador.fecha_nacimiento,
      nacionalidad: investigador.nacionalidad,
      orcid: investigador.orcid,
      nivel: investigador.nivel,
      location: [investigador.municipio, investigador.estado_nacimiento, investigador.entidad_federativa]
        .filter(Boolean)
        .join(", "),
      domicilio: investigador.domicilio,
      cp: investigador.cp,
      gradoMaximoEstudios: investigador.grado_maximo_estudios,
      disciplina: investigador.disciplina,
      especialidad: investigador.especialidad,
      sni: investigador.sni,
      anioSni: investigador.anio_sni,
      experienciaDocente: investigador.experiencia_docente,
      experienciaLaboral: investigador.experiencia_laboral,
      proyectosInvestigacion: investigador.proyectos_investigacion,
      proyectosVinculacion: investigador.proyectos_vinculacion,
      libros: investigador.libros,
      capitulosLibros: investigador.capitulos_libros,
      articulos: investigador.articulos,
      premiosDistinciones: investigador.premios_distinciones,
      idiomas: investigador.idiomas,
      colaboracionInternacional: investigador.colaboracion_internacional,
      colaboracionNacional: investigador.colaboracion_nacional,
      slug: slug,
    }

    return NextResponse.json(investigadorFormateado)
  } catch (error) {
    console.error("Error al obtener investigador:", error)
    return NextResponse.json(
      { error: "Error interno del servidor", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

