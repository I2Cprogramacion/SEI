import { NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { getDatabase } from "@/lib/database-config"

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

    const db = await getDatabase()
    
    // Obtener datos del investigador actual
    const miPerfil = await db.query(
      `SELECT id, nombre_completo 
       FROM investigadores 
       WHERE correo = $1`,
      [email]
    )

    if (!miPerfil || miPerfil.length === 0 || !miPerfil[0]) {
      console.log(`⚠️ No hay perfil de investigador para: ${email}`)
      return NextResponse.json({
        publicaciones: 0,
        proyectos: 0,
        conexiones: 0,
        perfilCompleto: 50
      })
    }

    const perfil = miPerfil[0]
    const nombreCompleto = perfil?.nombre_completo || 'Usuario'
    
    // Contar publicaciones del investigador
    let totalPublicaciones = 0
    try {
      const publicaciones = await db.query(
        `SELECT COUNT(*) as total 
         FROM publicaciones 
         WHERE LOWER(autor) LIKE $1 OR LOWER(autor) LIKE $2`,
        [
          `%${nombreCompleto.toLowerCase()}%`,
          `%${email.toLowerCase()}%`
        ]
      )
      totalPublicaciones = publicaciones[0]?.total || 0
    } catch (error) {
      console.log("No se pudieron contar publicaciones:", error)
    }

    // Contar proyectos (extraer del campo proyectos_investigacion)
    let totalProyectos = 0
    try {
      const proyectos = await db.query(
        `SELECT proyectos_investigacion 
         FROM investigadores 
         WHERE id = $1 AND proyectos_investigacion IS NOT NULL`,
        [perfil.id]
      )
      
      if (proyectos.length > 0 && proyectos[0].proyectos_investigacion) {
        const proyectosTexto = proyectos[0].proyectos_investigacion
        totalProyectos = proyectosTexto.split('\n').filter((p: string) => p.trim()).length
      }
    } catch (error) {
      console.log("No se pudieron contar proyectos:", error)
    }

    // Conexiones (simulado - para implementación futura)
    const totalConexiones = 0

    // Calcular porcentaje de perfil completo
    const camposRequeridos = await db.query(
      `SELECT 
        nombre_completo, 
        correo, 
        telefono, 
        institucion, 
        area, 
        linea_investigacion, 
        ultimo_grado_estudios, 
        empleo_actual,
        fotografia_url
       FROM investigadores 
       WHERE id = $1`,
      [perfil.id]
    )

    let camposCompletados = 0
    const totalCampos = 9
    
    if (camposRequeridos.length > 0) {
      const datos = camposRequeridos[0]
      if (datos.nombre_completo) camposCompletados++
      if (datos.correo) camposCompletados++
      if (datos.telefono) camposCompletados++
      if (datos.institucion) camposCompletados++
      if (datos.area) camposCompletados++
      if (datos.linea_investigacion) camposCompletados++
      if (datos.ultimo_grado_estudios) camposCompletados++
      if (datos.empleo_actual) camposCompletados++
      if (datos.fotografia_url) camposCompletados++
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
