import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { guardarInvestigador } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    console.log("Datos recibidos para registro:", data)

    // Validar datos obligatorios
    if (!data.nombre_completo) {
      console.error("Falta el nombre completo")
      return NextResponse.json({ error: "El nombre completo es obligatorio" }, { status: 400 })
    }

    if (!data.correo) {
      console.error("Falta el correo electrónico")
      return NextResponse.json({ error: "El correo electrónico es obligatorio" }, { status: 400 })
    }

    // Añadir fecha de registro si no existe
    if (!data.fecha_registro) {
      data.fecha_registro = new Date().toISOString()
    }

    // Guardar en la base de datos SQLite
    try {
      const resultado = await guardarInvestigador(data)
      console.log("Resultado del guardado:", resultado)

      if (resultado.success) {
        return NextResponse.json({
          success: true,
          message: resultado.message,
          id: resultado.id,
        })
      } else {
        // Si no fue exitoso pero tenemos un ID, es porque es un duplicado
        if (resultado.id) {
          return NextResponse.json(
            {
              success: false,
              message: resultado.message,
              id: resultado.id,
              duplicado: true,
            },
            { status: 409 },
          ) // 409 Conflict para duplicados
        } else {
          return NextResponse.json(
            {
              error: resultado.message,
            },
            { status: 400 },
          )
        }
      }
    } catch (dbError) {
      console.error("Error al guardar en la base de datos:", dbError)
      return NextResponse.json(
        {
          error: `Error al guardar en la base de datos: ${dbError instanceof Error ? dbError.message : "Error desconocido"}`,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error al procesar el registro:", error)
    return NextResponse.json(
      {
        error: `Error al procesar el registro: ${error instanceof Error ? error.message : "Error desconocido"}`,
      },
      { status: 500 },
    )
  }
}
