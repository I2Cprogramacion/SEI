import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

// Ruta del archivo de datos
const dataFilePath = path.join(process.cwd(), 'data', 'proyectos.json')

// Función para leer proyectos desde el archivo
async function readProyectos(): Promise<any[]> {
  try {
    await fs.mkdir(path.dirname(dataFilePath), { recursive: true })
    const data = await fs.readFile(dataFilePath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    // Si el archivo no existe o hay error, devolver array vacío
    return []
  }
}

// Función para escribir proyectos al archivo
async function writeProyectos(proyectos: any[]): Promise<void> {
  await fs.mkdir(path.dirname(dataFilePath), { recursive: true })
  await fs.writeFile(dataFilePath, JSON.stringify(proyectos, null, 2), 'utf8')
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar datos requeridos
    const requiredFields = ['titulo', 'descripcion', 'resumen', 'categoria', 'autor', 'institucion', 'fechaInicio']
    const missingFields = requiredFields.filter(field => !body[field])
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Campos faltantes: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    // Leer proyectos existentes
    const proyectos = await readProyectos()

    // Crear nuevo proyecto
    const nuevoProyecto = {
      id: proyectos.length + 1,
      ...body,
      slug: body.titulo
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .trim(),
      fechaCreacion: new Date().toISOString(),
      fechaPublicacion: new Date().toISOString().split('T')[0]
    }

    // Agregar a la lista
    proyectos.push(nuevoProyecto)

    // Guardar en archivo
    await writeProyectos(proyectos)

    return NextResponse.json(
      { 
        message: 'Proyecto creado exitosamente',
        proyecto: nuevoProyecto 
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Error al crear proyecto:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const proyectos = await readProyectos()
    
    // Si no hay proyectos reales, crear algunos de ejemplo
    if (proyectos.length === 0) {
      const proyectosEjemplo = [
        {
          id: 1,
          titulo: "Desarrollo de Energías Renovables en Zonas Áridas de Chihuahua",
          descripcion: "Investigación sobre el potencial de implementación de energías renovables en el estado de Chihuahua, enfocándose en energía solar y eólica para comunidades rurales.",
          resumen: "Este proyecto busca evaluar la viabilidad técnica y económica de implementar sistemas de energía renovable en zonas áridas del estado de Chihuahua.",
          categoria: "Energías Renovables",
          estado: "Activo",
          fechaInicio: "2023-01-01",
          fechaFin: "2024-12-31",
          fechaPublicacion: "2023-01-01",
          autor: {
            nombreCompleto: "Dr. Juan Pérez García",
            instituto: "Universidad",
            estado: "Chihuahua",
            email: "juan.pere@uach.mx"
          },
          slug: "desarrollo-energias-renovables-zonas-aridas-chihuahua"
        },
        {
          id: 2,
          titulo: "Innovación en Sistemas de Riego para Agricultura en Zonas Áridas",
          descripcion: "Desarrollo de tecnologías de riego inteligente que optimicen el uso del agua en la agricultura del norte de México.",
          resumen: "Implementación de sistemas IoT para monitoreo y control automático de riego en cultivos de la región.",
          categoria: "Agricultura",
          estado: "En desarrollo",
          fechaInicio: "2023-06-01",
          fechaFin: "2025-05-31",
          fechaPublicacion: "2023-06-01",
          autor: {
            nombreCompleto: "Dr. Juan Pérez García",
            instituto: "Universidad",
            estado: "Chihuahua",
            email: "juan.pere@uach.mx"
          },
          slug: "innovacion-sistemas-riego-agricultura-zonas-aridas"
        }
      ]
      return NextResponse.json({ proyectos: proyectosEjemplo }, { status: 200 })
    }
    
    return NextResponse.json({ proyectos }, { status: 200 })
  } catch (error) {
    console.error('Error al obtener proyectos:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
