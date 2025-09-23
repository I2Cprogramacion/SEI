import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { obtenerInvestigadores, guardarInvestigador } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // Obtener todos los investigadores de la base de datos
    const investigadores = await obtenerInvestigadores()
    
    // Filtrar para excluir administradores de las búsquedas públicas
    const investigadoresPublicos = investigadores.filter(inv => 
      inv.correo !== 'admin@sei.com.mx' && // Excluir administrador
      !inv.nombre_completo?.toLowerCase().includes('administrador')
    )

    return NextResponse.json({ investigadores: investigadoresPublicos })
  } catch (error) {
    console.error("Error al obtener investigadores:", error)
    return NextResponse.json({ 
      investigadores: [],
      error: "Error al obtener los investigadores" 
    }, { status: 500 })
  }
}

// Crear investigador desde el wizard "Nuevo Perfil"
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // El wizard usa nombres amigables; mapear a columnas de DB
    const mapped = {
      nombre_completo: [body.nombre, body.apellidos].filter(Boolean).join(" "),
      correo: body.email || "",
      telefono: body.telefono || "",
      fecha_nacimiento: body.fechaNacimiento || "",
      nacionalidad: body.nacionalidad || "Mexicana",
      curp: body.curp || "",
      rfc: body.rfc || "",
      grado_maximo_estudios: body.titulo || "",
      institucion: body.institucion || "",
      experiencia_laboral: body.departamento || "",
      area: body.areasEspecializacion?.join(", ") || "",
      titulo_tesis: "", // no se captura aquí
      linea_investigacion: body.biografia || "",
      // origen: "wizard", // Columna no existe en la tabla
      fecha_registro: new Date().toISOString(),
    }

    if (!mapped.nombre_completo || !mapped.correo) {
      return NextResponse.json({ error: "Nombre completo y correo son obligatorios" }, { status: 400 })
    }

    const resultado = await guardarInvestigador(mapped)
    if (!resultado.success) {
      const status = resultado.id ? 409 : 400
      return NextResponse.json({ error: resultado.message, id: resultado.id, duplicado: !!resultado.id }, { status })
    }

    return NextResponse.json({ success: true, id: resultado.id, message: resultado.message })
  } catch (error) {
    console.error("Error al crear investigador:", error)
    return NextResponse.json({ error: `Error al crear investigador: ${error instanceof Error ? error.message : "Error"}` }, { status: 500 })
  }
}
