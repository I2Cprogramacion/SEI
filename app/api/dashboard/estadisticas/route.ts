import { NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { sql } from "@vercel/postgres"

export async function GET(request: NextRequest) {
  try {
    // Obtener usuario autenticado
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const email = user.emailAddresses[0]?.emailAddress

    if (!email) {
      return NextResponse.json({ error: "No se pudo obtener el email del usuario" }, { status: 400 })
    }
    
    // Obtener datos del investigador actual
    const miPerfil = await sql`
      SELECT id, nombre_completo 
      FROM investigadores 
      WHERE correo = ${email}
    `

    if (!miPerfil || miPerfil.rows.length === 0 || !miPerfil.rows[0]) {
      console.log(`⚠️ No hay perfil de investigador para: ${email}`)
      return NextResponse.json({
        publicaciones: 0,
        proyectos: 0,
        conexiones: 0,
        perfilCompleto: 50
      })
    }

    const perfil = miPerfil.rows[0]
    const nombreCompleto = perfil?.nombre_completo || 'Usuario'
    
    // Contar publicaciones del investigador (de campo articulos)
    let totalPublicaciones = 0
    try {
      const articulos = await sql`
        SELECT articulos 
        FROM investigadores 
        WHERE id = ${perfil.id} AND articulos IS NOT NULL
      `
      
      if (articulos.rows.length > 0 && articulos.rows[0].articulos) {
        const articulosTexto = articulos.rows[0].articulos
        totalPublicaciones = articulosTexto.split('\n').filter((p: string) => p.trim()).length
      }
    } catch (error) {
      console.log("No se pudieron contar publicaciones:", error)
    }

    // Contar proyectos (extraer del campo proyectos_investigacion)
    let totalProyectos = 0
    try {
      const proyectos = await sql`
        SELECT proyectos_investigacion 
        FROM investigadores 
        WHERE id = ${perfil.id} AND proyectos_investigacion IS NOT NULL
      `
      
      if (proyectos.rows.length > 0 && proyectos.rows[0].proyectos_investigacion) {
        const proyectosTexto = proyectos.rows[0].proyectos_investigacion
        totalProyectos = proyectosTexto.split('\n').filter((p: string) => p.trim()).length
      }
    } catch (error) {
      console.log("No se pudieron contar proyectos:", error)
    }

    // Conexiones (simulado - para implementación futura)
    const totalConexiones = 0

    // Calcular porcentaje de perfil completo
    const camposRequeridos = await sql`
      SELECT 
        nombre_completo, 
        correo, 
        telefono, 
        institucion, 
        area, 
        linea_investigacion, 
        ultimo_grado_estudios, 
        empleo_actual
      FROM investigadores 
      WHERE id = ${perfil.id}
    `

    let camposCompletados = 0
    const totalCampos = 8
    
    if (camposRequeridos.rows.length > 0) {
      const datos = camposRequeridos.rows[0]
      if (datos.nombre_completo) camposCompletados++
      if (datos.correo) camposCompletados++
      if (datos.telefono) camposCompletados++
      if (datos.institucion) camposCompletados++
      if (datos.area) camposCompletados++
      if (datos.linea_investigacion) camposCompletados++
      if (datos.ultimo_grado_estudios) camposCompletados++
      if (datos.empleo_actual) camposCompletados++
    }

    const perfilCompleto = Math.round((camposCompletados / totalCampos) * 100)

    return NextResponse.json({
      publicaciones: totalPublicaciones,
      proyectos: totalProyectos,
      conexiones: totalConexiones,
      perfilCompleto: perfilCompleto
    })
  } catch (error) {
    console.error("Error al obtener estadísticas:", error)
    return NextResponse.json(
      { error: "Error al obtener estadísticas del dashboard" },
      { status: 500 }
    )
  }
}
