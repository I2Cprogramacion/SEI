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
    return NextResponse.json({ proyectos }, { status: 200 })
  } catch (error) {
    console.error('Error al obtener proyectos:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
