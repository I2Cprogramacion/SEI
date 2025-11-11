import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { getDatabase } from "@/lib/database-config"

/**
 * Endpoint para limpiar URLs de CV corruptas (URLs firmadas de Cloudinary que no funcionan)
 * Convierte URLs firmadas a URLs públicas limpias
 */
export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const email = user.emailAddresses[0]?.emailAddress

    if (!email) {
      return NextResponse.json({ error: "No se pudo obtener el email del usuario" }, { status: 400 })
    }

    // Obtener el CV URL actual
    const db = await getDatabase()
    const querySelect = `
      SELECT id, nombre_completo, cv_url 
      FROM investigadores 
      WHERE correo = $1
    `
    
    const result = await db.query(querySelect, [email])
    const rows = Array.isArray(result) ? result : (result.rows || [])

    if (rows.length === 0) {
      return NextResponse.json({ 
        error: "No se encontró un perfil de investigador" 
      }, { status: 404 })
    }

    const investigador = rows[0]
    const cvUrl = investigador.cv_url

    if (!cvUrl) {
      return NextResponse.json({ 
        error: "No hay CV URL para limpiar" 
      }, { status: 400 })
    }

    // Limpiar la URL si es de Cloudinary
    let cleanUrl = cvUrl
    if (cvUrl.includes('cloudinary.com')) {
      // Remover parámetros de firma que pueden causar problemas
      cleanUrl = cvUrl.split('?')[0]
      
      console.log("🧹 Limpiando URL de Cloudinary:")
      console.log("  Original:", cvUrl)
      console.log("  Limpia:", cleanUrl)
    }

    // Si la URL cambió, actualizarla en la base de datos
    if (cleanUrl !== cvUrl) {
      const queryUpdate = `
        UPDATE investigadores 
        SET cv_url = $1 
        WHERE correo = $2
        RETURNING id, nombre_completo, cv_url
      `
      
      const updateResult = await db.query(queryUpdate, [cleanUrl, email])
      const updatedRows = Array.isArray(updateResult) ? updateResult : (updateResult.rows || [])

      if (updatedRows.length === 0) {
        return NextResponse.json({ 
          error: "No se pudo actualizar la URL" 
        }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: "URL del CV limpiada exitosamente",
        data: {
          oldUrl: cvUrl,
          newUrl: cleanUrl,
          investigador: updatedRows[0]
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: "La URL ya está limpia, no se requieren cambios",
      data: {
        url: cvUrl
      }
    })

  } catch (error) {
    console.error("❌ Error al limpiar CV URL:", error)
    return NextResponse.json({
      error: `Error al limpiar la URL: ${error instanceof Error ? error.message : "Error desconocido"}`,
    }, { status: 500 })
  }
}

