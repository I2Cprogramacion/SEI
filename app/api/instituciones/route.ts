import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { obtenerInvestigadores } from "@/lib/db"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

export async function GET(request: NextRequest) {
  try {
    // Obtener investigadores de la base de datos
    const investigadores = await obtenerInvestigadores()
    
    // Agrupar investigadores por institución
    const institucionesMap = new Map<string, any>()
    
    investigadores.forEach(inv => {
      const institucion = inv.institucion || 'Institución no especificada'
      
      if (!institucionesMap.has(institucion)) {
        institucionesMap.set(institucion, {
          id: institucion.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
          nombre: institucion,
          siglas: institucion.split(' ').map(word => word[0]).join('').substring(0, 6),
          tipo: "Institución de educación superior",
          ubicacion: "Chihuahua, México",
          descripcion: `Institución de educación superior en Chihuahua`,
          investigadores: 0,
          proyectos: 0,
          publicaciones: 0,
          areas: new Set<string>(),
          fundacion: 1990,
          sitioWeb: "#",
          slug: institucion.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
          investigadoresDestacados: []
        })
      }
      
      const institucionData = institucionesMap.get(institucion)
      institucionData.investigadores++
      
      // Contar proyectos
      if (inv.proyectos_investigacion) {
        const proyectos = inv.proyectos_investigacion.split('\n').filter((p: string) => p.trim())
        institucionData.proyectos += proyectos.length
      }
      
      // Contar publicaciones
      let publicaciones = 0
      if (inv.articulos) publicaciones += inv.articulos.split('\n').filter((a: string) => a.trim()).length
      if (inv.libros) publicaciones += inv.libros.split('\n').filter((l: string) => l.trim()).length
      if (inv.capitulos_libros) publicaciones += inv.capitulos_libros.split('\n').filter((c: string) => c.trim()).length
      if (inv.memorias) publicaciones += inv.memorias.split('\n').filter((m: string) => m.trim()).length
      institucionData.publicaciones += publicaciones
      
      // Agregar áreas
      if (inv.area) institucionData.areas.add(inv.area)
      if (inv.disciplina) institucionData.areas.add(inv.disciplina)
      if (inv.especialidad) institucionData.areas.add(inv.especialidad)
      
      // Agregar investigadores destacados (máximo 3)
      if (institucionData.investigadoresDestacados.length < 3) {
        institucionData.investigadoresDestacados.push({
          nombre: inv.nombre_completo,
          area: inv.area || inv.disciplina || inv.especialidad || 'Investigación'
        })
      }
    })
    
    // Convertir Map a array y formatear
    const instituciones = Array.from(institucionesMap.values()).map(inst => ({
      ...inst,
      areas: Array.from(inst.areas).slice(0, 5) // Máximo 5 áreas
    }))
    
    return NextResponse.json({ instituciones })
  } catch (error) {
    console.error("Error al obtener instituciones:", error)
    return NextResponse.json({ 
      instituciones: [],
      error: "Error al obtener las instituciones" 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    // Extraer datos del formulario
    const nombre = formData.get('nombre') as string
    const siglas = formData.get('siglas') as string
    const tipo = formData.get('tipo') as string
    const ubicacion = formData.get('ubicacion') as string
    const descripcion = formData.get('descripcion') as string
    const fundacion = formData.get('fundacion') as string
    const sitioWeb = formData.get('sitioWeb') as string
    const telefono = formData.get('telefono') as string
    const email = formData.get('email') as string
    const areas = JSON.parse(formData.get('areas') as string || '[]')
    const imagen = formData.get('imagen') as File | null

    // Validar datos obligatorios
    if (!nombre || !siglas || !tipo || !ubicacion || !descripcion || !fundacion || !email) {
      return NextResponse.json({ 
        error: "Faltan campos obligatorios" 
      }, { status: 400 })
    }

    // Validar email
    if (!email.includes("@")) {
      return NextResponse.json({ 
        error: "El correo electrónico no es válido" 
      }, { status: 400 })
    }

    // Validar año de fundación
    const currentYear = new Date().getFullYear()
    const fundacionYear = parseInt(fundacion)
    if (fundacionYear < 1800 || fundacionYear > currentYear) {
      return NextResponse.json({ 
        error: "El año de fundación no es válido" 
      }, { status: 400 })
    }

    let imagenPath = null

    // Procesar imagen si existe
    if (imagen && imagen.size > 0) {
      try {
        const bytes = await imagen.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Crear directorio si no existe
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'instituciones')
        await mkdir(uploadsDir, { recursive: true })

        // Generar nombre único para el archivo
        const timestamp = Date.now()
        const extension = path.extname(imagen.name)
        const filename = `${siglas.toLowerCase().replace(/\s+/g, '-')}-${timestamp}${extension}`
        const filepath = path.join(uploadsDir, filename)

        // Guardar archivo
        await writeFile(filepath, buffer)
        imagenPath = `/uploads/instituciones/${filename}`
      } catch (error) {
        console.error("Error al guardar imagen:", error)
        return NextResponse.json({ 
          error: "Error al procesar la imagen" 
        }, { status: 500 })
      }
    }

    // Crear objeto de institución
    const nuevaInstitucion = {
      id: Date.now(), // ID temporal
      nombre: nombre.trim(),
      siglas: siglas.trim().toUpperCase(),
      tipo: tipo.trim(),
      ubicacion: ubicacion.trim(),
      descripcion: descripcion.trim(),
      fundacion: parseInt(fundacion),
      sitioWeb: sitioWeb?.trim() || "#",
      telefono: telefono?.trim() || "",
      email: email.trim(),
      areas: areas,
      imagen: imagenPath,
      investigadores: 0,
      proyectos: 0,
      publicaciones: 0,
      slug: nombre.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      investigadoresDestacados: [],
      fechaCreacion: new Date().toISOString()
    }

    // TODO: Guardar en base de datos
    // Por ahora, solo devolvemos éxito
    // En el futuro, esto se guardaría en una tabla de instituciones

    console.log("Nueva institución creada:", nuevaInstitucion)

    return NextResponse.json({
      success: true,
      message: `Institución "${nombre}" creada exitosamente`,
      institucion: nuevaInstitucion
    })

  } catch (error) {
    console.error("Error al crear institución:", error)
    return NextResponse.json(
      { 
        error: "Error al crear la institución" 
      },
      { status: 500 }
    )
  }
}
