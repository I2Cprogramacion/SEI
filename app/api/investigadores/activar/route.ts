import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { Client } from "pg"

export async function POST(request: NextRequest) {
  let client: Client | null = null
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }
    const correo = user.emailAddresses[0]?.emailAddress
    if (!correo) {
      return NextResponse.json({ error: "No se encontró el correo del usuario" }, { status: 400 })
    }
    console.log("🟢 Reactivando perfil para correo:", correo)
    
    // Conexión directa a PostgreSQL
    const databaseUrl = process.env.DATABASE_URL
    if (!databaseUrl) {
      throw new Error("DATABASE_URL no configurada")
    }
    
    client = new Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } })
    await client.connect()
    
    // Verificar el estado actual antes de actualizar
    const checkQuery = `SELECT id, nombre_completo, correo, activo FROM investigadores WHERE correo = $1`
    const beforeUpdate = await client.query(checkQuery, [correo])
    console.log("📊 Estado ANTES de reactivar:", beforeUpdate.rows[0])
    
    if (!beforeUpdate.rows || beforeUpdate.rows.length === 0) {
      return NextResponse.json({ error: "No se encontró el investigador con ese correo" }, { status: 404 })
    }
    
    // Actualizar el campo activo a true usando el ID del investigador
    const investigadorId = beforeUpdate.rows[0].id
    const updateQuery = `UPDATE investigadores SET activo = TRUE WHERE id = $1 RETURNING id, nombre_completo, correo, activo`
    const result = await client.query(updateQuery, [investigadorId])
    
    console.log("✅ Estado DESPUÉS de reactivar:", result.rows[0])
    
    if (!result.rows || result.rows.length === 0) {
      return NextResponse.json({ error: "No se pudo actualizar el perfil" }, { status: 500 })
    }
    
    return NextResponse.json({ 
      success: true, 
      message: "Perfil reactivado",
      data: result.rows[0]
    })
  } catch (error) {
    console.error("❌ Error al reactivar perfil:", error)
    return NextResponse.json({ 
      error: `Error al reactivar el perfil: ${error instanceof Error ? error.message : "Error desconocido"}` 
    }, { status: 500 })
  } finally {
    if (client) {
      await client.end()
    }
  }
}
