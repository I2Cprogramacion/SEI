import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const convocatorias = await prisma.convocatoria.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calcular el estado basado en las fechas
    const convocatoriasConEstado = convocatorias.map(conv => {
      const hoy = new Date()
      const fechaInicio = new Date(conv.fechaInicio)
      const fechaCierre = new Date(conv.fechaCierre)

      let estado = "Abierta"
      if (hoy < fechaInicio) {
        estado = "Próxima"
      } else if (hoy > fechaCierre) {
        estado = "Cerrada"
      }

      return {
        id: conv.id,
        titulo: conv.titulo,
        organizacion: conv.organizacion || "",
        descripcion: conv.descripcion || "",
        fechaApertura: conv.fechaInicio.toISOString(),
        fechaCierre: conv.fechaCierre.toISOString(),
        montoMaximo: conv.montoMaximo || "",
        categoria: conv.categoria || "",
        estado: estado,
        pdfUrl: conv.pdfUrl,
      }
    })
    
    return NextResponse.json(convocatoriasConEstado)
  } catch (error) {
    console.error("Error al obtener convocatorias:", error)
    return NextResponse.json({ 
      error: "Error al obtener las convocatorias" 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { titulo, organizacion, descripcion, fechaInicio, fechaCierre, montoMaximo, categoria, pdfUrl } = body

    if (!titulo || !fechaInicio || !fechaCierre) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      )
    }

    // Crear la convocatoria
    const convocatoria = await prisma.convocatoria.create({
      data: {
        titulo,
        organizacion: organizacion || null,
        descripcion: descripcion || null,
        fechaInicio: new Date(fechaInicio),
        fechaCierre: new Date(fechaCierre),
        montoMaximo: montoMaximo || null,
        categoria: categoria || null,
        pdfUrl: pdfUrl || null,
      }
    })

    return NextResponse.json(convocatoria, { status: 201 })
  } catch (error) {
    console.error("Error al crear convocatoria:", error)
    return NextResponse.json(
      { error: "Error al crear la convocatoria" },
      { status: 500 }
    )
  }
}
