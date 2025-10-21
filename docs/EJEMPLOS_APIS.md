# 🔌 EJEMPLOS DE IMPLEMENTACIÓN DE APIs

Este documento proporciona ejemplos concretos de código para las APIs de los nuevos módulos.

---

## 📁 Estructura de Carpetas

```
app/api/
├── evaluaciones/
│   ├── route.ts                 # GET, POST
│   ├── [id]/
│   │   ├── route.ts            # GET, PUT, DELETE
│   │   └── aprobar/route.ts    # POST
│   └── calcular/route.ts        # POST
├── niveles/
│   ├── route.ts                 # GET, POST
│   └── [id]/route.ts           # GET, PUT
├── certificados/
│   ├── route.ts                 # GET, POST
│   ├── [id]/
│   │   ├── route.ts            # GET
│   │   ├── descargar/route.ts  # GET
│   │   └── revocar/route.ts    # POST
│   ├── generar/route.ts         # POST
│   └── verificar/
│       └── [folio]/route.ts     # GET
├── convocatorias/
│   ├── route.ts                 # GET, POST
│   ├── [id]/
│   │   ├── route.ts            # GET, PUT, DELETE
│   │   ├── publicar/route.ts   # POST
│   │   └── cerrar/route.ts     # POST
│   └── activas/route.ts         # GET
└── postulaciones/
    ├── route.ts                 # GET, POST
    ├── [id]/
    │   ├── route.ts            # GET, PUT, DELETE
    │   ├── enviar/route.ts     # POST
    │   └── evaluaciones/route.ts # GET, POST
    └── mis-postulaciones/route.ts # GET
```

---

## 1️⃣ MÓDULO DE EVALUACIÓN

### GET /api/niveles - Listar todos los niveles

```typescript
// app/api/niveles/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'

export async function GET(req: NextRequest) {
  try {
    const niveles = await prisma.nivelInvestigador.findMany({
      where: { activo: true },
      orderBy: { orden: 'asc' },
      select: {
        id: true,
        codigo: true,
        nombre: true,
        descripcion: true,
        puntajeMinimo: true,
        puntajeMaximo: true,
        color: true,
        icono: true,
        orden: true,
        requisitos: true,
        beneficios: true,
        _count: {
          select: {
            investigadores: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: niveles,
      total: niveles.length
    })
  } catch (error) {
    console.error('Error fetching niveles:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener niveles' },
      { status: 500 }
    )
  }
}
```

### POST /api/evaluaciones - Crear evaluación

```typescript
// app/api/evaluaciones/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth, currentUser } from '@clerk/nextjs/server'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    const user = await currentUser()
    const body = await req.json()

    const {
      investigadorId,
      nivelPropuestoId,
      ciclo,
      puntajes,
      detalles,
      observaciones
    } = body

    // Validar que el usuario es admin
    // TODO: Implementar verificación de rol

    // Calcular puntaje total
    const puntajeTotal = 
      puntajes.publicaciones +
      puntajes.proyectos +
      puntajes.formacion +
      puntajes.experiencia +
      puntajes.impacto

    // Crear evaluación
    const evaluacion = await prisma.evaluacion.create({
      data: {
        investigadorId,
        evaluadorId: userId,
        evaluadorNombre: `${user?.firstName} ${user?.lastName}`,
        nivelPropuestoId,
        ciclo,
        puntajePublicaciones: puntajes.publicaciones,
        puntajeProyectos: puntajes.proyectos,
        puntajeFormacion: puntajes.formacion,
        puntajeExperiencia: puntajes.experiencia,
        puntajeImpacto: puntajes.impacto,
        puntajeTotal,
        detallePublicaciones: detalles.publicaciones,
        detalleProyectos: detalles.proyectos,
        detalleFormacion: detalles.formacion,
        detalleExperiencia: detalles.experiencia,
        detalleImpacto: detalles.impacto,
        observaciones,
        estado: 'EN_REVISION'
      },
      include: {
        investigador: {
          select: {
            nombreCompleto: true,
            correo: true
          }
        },
        nivelPropuesto: true
      }
    })

    // TODO: Enviar notificación al investigador

    return NextResponse.json({
      success: true,
      data: evaluacion,
      message: 'Evaluación creada exitosamente'
    })
  } catch (error) {
    console.error('Error creating evaluacion:', error)
    return NextResponse.json(
      { success: false, error: 'Error al crear evaluación' },
      { status: 500 }
    )
  }
}
```

### POST /api/evaluaciones/calcular - Calcular puntaje automático

```typescript
// app/api/evaluaciones/calcular/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface CalculoPuntaje {
  publicaciones: number
  proyectos: number
  formacion: number
  experiencia: number
  impacto: number
  total: number
  nivelSugerido: string
}

export async function POST(req: NextRequest) {
  try {
    const { investigadorId } = await req.json()

    // Obtener métricas del investigador
    const metricas = await prisma.metricaInvestigador.findUnique({
      where: { investigadorId }
    })

    if (!metricas) {
      return NextResponse.json(
        { success: false, error: 'Métricas no encontradas' },
        { status: 404 }
      )
    }

    // Calcular puntajes por categoría
    const puntajes: CalculoPuntaje = {
      publicaciones: calcularPuntajePublicaciones(metricas),
      proyectos: calcularPuntajeProyectos(metricas),
      formacion: calcularPuntajeFormacion(metricas),
      experiencia: calcularPuntajeExperiencia(metricas),
      impacto: calcularPuntajeImpacto(metricas),
      total: 0,
      nivelSugerido: ''
    }

    puntajes.total = Object.values(puntajes).reduce((sum, val) => 
      typeof val === 'number' ? sum + val : sum, 0
    )

    // Determinar nivel sugerido
    const niveles = await prisma.nivelInvestigador.findMany({
      where: { activo: true },
      orderBy: { puntajeMinimo: 'desc' }
    })

    const nivelSugerido = niveles.find(n => 
      puntajes.total >= n.puntajeMinimo && puntajes.total <= n.puntajeMaximo
    )

    puntajes.nivelSugerido = nivelSugerido?.codigo || 'NIVEL_1'

    return NextResponse.json({
      success: true,
      data: {
        puntajes,
        nivelSugerido: {
          id: nivelSugerido?.id,
          nombre: nivelSugerido?.nombre,
          color: nivelSugerido?.color
        },
        detalles: {
          publicaciones: detallePublicaciones(metricas),
          proyectos: detalleProyectos(metricas),
          formacion: detalleFormacion(metricas),
          experiencia: detalleExperiencia(metricas),
          impacto: detalleImpacto(metricas)
        }
      }
    })
  } catch (error) {
    console.error('Error calculating puntaje:', error)
    return NextResponse.json(
      { success: false, error: 'Error al calcular puntaje' },
      { status: 500 }
    )
  }
}

// Funciones auxiliares de cálculo
function calcularPuntajePublicaciones(metricas: any): number {
  let puntaje = 0
  puntaje += metricas.publicacionesQ1 * 2.5
  puntaje += metricas.publicacionesQ2 * 2.0
  puntaje += metricas.publicacionesQ3 * 1.5
  puntaje += metricas.publicacionesQ4 * 1.0
  puntaje += metricas.librosCompletos * 3.0
  puntaje += metricas.capitulosLibro * 1.0
  return Math.min(puntaje, 40) // Máximo 40 puntos
}

function calcularPuntajeProyectos(metricas: any): number {
  let puntaje = 0
  puntaje += metricas.proyectosPrincipal * 5
  puntaje += metricas.proyectosColaborador * 2
  puntaje += Math.log10(metricas.montoTotalFinanciamiento / 100000) * 5
  return Math.min(puntaje, 40) // Máximo 40 puntos
}

function calcularPuntajeFormacion(metricas: any): number {
  let puntaje = 0
  puntaje += metricas.tesisDoctorado * 4
  puntaje += metricas.tesisMaestria * 2
  puntaje += metricas.tesisLicenciatura * 1
  puntaje += metricas.postdoctorados * 3
  puntaje += metricas.cursosImpartidos * 0.5
  return Math.min(puntaje, 25) // Máximo 25 puntos
}

function calcularPuntajeExperiencia(metricas: any): number {
  let puntaje = 0
  puntaje += Math.min(metricas.aniosExperiencia / 2, 10)
  if (metricas.pertenenciaSNI) {
    const niveles: any = { 'Candidato': 2, 'I': 3, 'II': 4, 'III': 5 }
    puntaje += niveles[metricas.nivelSNI] || 0
  }
  puntaje += metricas.estanciasInvestigacion * 1
  return Math.min(puntaje, 20) // Máximo 20 puntos
}

function calcularPuntajeImpacto(metricas: any): number {
  let puntaje = 0
  puntaje += metricas.patentes * 2
  puntaje += metricas.desarrollosTecnologicos * 1.5
  puntaje += metricas.colaboracionesInternacionales * 1
  puntaje += metricas.premiosDistinciones * 2
  return Math.min(puntaje, 15) // Máximo 15 puntos
}

function detallePublicaciones(metricas: any) {
  return {
    q1: metricas.publicacionesQ1,
    q2: metricas.publicacionesQ2,
    q3: metricas.publicacionesQ3,
    q4: metricas.publicacionesQ4,
    libros: metricas.librosCompletos,
    capitulos: metricas.capitulosLibro,
    citas: metricas.totalCitas,
    indiceH: metricas.indiceH
  }
}

function detalleProyectos(metricas: any) {
  return {
    total: metricas.totalProyectos,
    vigentes: metricas.proyectosVigentes,
    principal: metricas.proyectosPrincipal,
    colaborador: metricas.proyectosColaborador,
    financiamiento: metricas.montoTotalFinanciamiento
  }
}

function detalleFormacion(metricas: any) {
  return {
    doctorados: metricas.tesisDoctorado,
    maestrias: metricas.tesisMaestria,
    licenciaturas: metricas.tesisLicenciatura,
    postdocs: metricas.postdoctorados,
    cursos: metricas.cursosImpartidos
  }
}

function detalleExperiencia(metricas: any) {
  return {
    años: metricas.aniosExperiencia,
    sni: metricas.pertenenciaSNI,
    nivelSNI: metricas.nivelSNI,
    estancias: metricas.estanciasInvestigacion
  }
}

function detalleImpacto(metricas: any) {
  return {
    patentes: metricas.patentes,
    desarrollos: metricas.desarrollosTecnologicos,
    colaboracionesInt: metricas.colaboracionesInternacionales,
    premios: metricas.premiosDistinciones
  }
}
```

---

## 2️⃣ MÓDULO DE CERTIFICADOS

### POST /api/certificados/generar - Generar certificado PDF

```typescript
// app/api/certificados/generar/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateCertificatePDF } from '@/lib/pdf-generator'
import { generateQRCode } from '@/lib/qr-generator'
import { uploadToCloudinary } from '@/lib/cloudinary'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const {
      investigadorId,
      nivelId,
      vigenciaMeses = 12
    } = await req.json()

    // Obtener datos del investigador
    const investigador = await prisma.profile.findUnique({
      where: { id: investigadorId },
      include: {
        nivelActual: true
      }
    })

    if (!investigador) {
      return NextResponse.json(
        { success: false, error: 'Investigador no encontrado' },
        { status: 404 }
      )
    }

    const nivel = await prisma.nivelInvestigador.findUnique({
      where: { id: nivelId }
    })

    if (!nivel) {
      return NextResponse.json(
        { success: false, error: 'Nivel no encontrado' },
        { status: 404 }
      )
    }

    // Generar folio único
    const year = new Date().getFullYear()
    const ultimoCertificado = await prisma.certificado.findFirst({
      where: {
        folio: {
          startsWith: `SEI-${year}-`
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const numeroConsecutivo = ultimoCertificado 
      ? parseInt(ultimoCertificado.folio.split('-')[2]) + 1 
      : 1

    const folio = `SEI-${year}-${numeroConsecutivo.toString().padStart(6, '0')}`

    // Generar código de verificación
    const codigoVerificacion = crypto
      .createHash('sha256')
      .update(`${folio}-${investigadorId}-${Date.now()}`)
      .digest('hex')

    // Generar QR Code
    const qrCodeBuffer = await generateQRCode(
      `https://sei-chih.com.mx/verificar/${folio}`
    )

    // Subir QR a Cloudinary
    const qrCodeUrl = await uploadToCloudinary(qrCodeBuffer, {
      folder: 'certificados/qr',
      public_id: `qr-${folio}`
    })

    // Generar PDF del certificado
    const fechaEmision = new Date()
    const fechaVigenciaInicio = new Date()
    const fechaVigenciaFin = new Date()
    fechaVigenciaFin.setMonth(fechaVigenciaFin.getMonth() + vigenciaMeses)

    const pdfBuffer = await generateCertificatePDF({
      nombreCompleto: investigador.nombreCompleto,
      curp: investigador.curp || 'N/A',
      nivel: nivel.nombre,
      fechaEmision: fechaEmision.toLocaleDateString('es-MX'),
      folio,
      vigenciaInicio: fechaVigenciaInicio.toLocaleDateString('es-MX'),
      vigenciaFin: fechaVigenciaFin.toLocaleDateString('es-MX'),
      qrCodeUrl
    })

    // Subir PDF a Cloudinary
    const pdfUrl = await uploadToCloudinary(pdfBuffer, {
      folder: 'certificados/pdf',
      public_id: `cert-${folio}`,
      resource_type: 'raw'
    })

    // Guardar certificado en BD
    const certificado = await prisma.certificado.create({
      data: {
        folio,
        investigadorId,
        nivelId,
        nombreCompleto: investigador.nombreCompleto,
        curp: investigador.curp || 'N/A',
        nivel: nivel.nombre,
        nivelDescripcion: nivel.descripcion,
        fechaEmision,
        fechaVigenciaInicio,
        fechaVigenciaFin,
        pdfUrl,
        qrCodeUrl,
        codigoVerificacion,
        estado: 'ACTIVO',
        firmadoPor: 'Secretario Técnico',
        cargoFirmante: 'Secretaría Técnica - SEI'
      }
    })

    return NextResponse.json({
      success: true,
      data: certificado,
      message: 'Certificado generado exitosamente'
    })
  } catch (error) {
    console.error('Error generating certificate:', error)
    return NextResponse.json(
      { success: false, error: 'Error al generar certificado' },
      { status: 500 }
    )
  }
}
```

### GET /api/certificados/verificar/[folio] - Verificar certificado

```typescript
// app/api/certificados/verificar/[folio]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: { folio: string } }
) {
  try {
    const { folio } = params

    // Buscar certificado
    const certificado = await prisma.certificado.findUnique({
      where: { folio },
      include: {
        investigador: {
          select: {
            nombreCompleto: true,
            fotografiaUrl: true,
            institucion: true
          }
        }
      }
    })

    if (!certificado) {
      return NextResponse.json({
        success: false,
        valido: false,
        mensaje: 'Certificado no encontrado'
      })
    }

    // Verificar estado
    const ahora = new Date()
    let estado = certificado.estado
    let valido = true
    let mensaje = 'Certificado válido'

    if (certificado.estado === 'REVOCADO') {
      valido = false
      mensaje = `Certificado revocado: ${certificado.motivoRevocacion}`
    } else if (ahora > certificado.fechaVigenciaFin) {
      estado = 'EXPIRADO'
      valido = false
      mensaje = 'Certificado expirado'
    }

    // Registrar verificación
    const ipAddress = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown'

    await prisma.verificacionCertificado.create({
      data: {
        certificadoId: certificado.id,
        folio,
        ipAddress,
        userAgent: req.headers.get('user-agent') || 'unknown',
        exitosa: valido,
        motivoFallo: valido ? null : mensaje
      }
    })

    // Actualizar contador
    await prisma.certificado.update({
      where: { id: certificado.id },
      data: {
        vecesVerificado: { increment: 1 },
        ultimaVerificacion: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      valido,
      mensaje,
      data: valido ? {
        folio: certificado.folio,
        investigador: {
          nombre: certificado.nombreCompleto,
          fotografia: certificado.investigador.fotografiaUrl,
          institucion: certificado.investigador.institucion
        },
        nivel: certificado.nivel,
        fechaEmision: certificado.fechaEmision,
        vigencia: {
          inicio: certificado.fechaVigenciaInicio,
          fin: certificado.fechaVigenciaFin
        },
        estado: certificado.estado
      } : null
    })
  } catch (error) {
    console.error('Error verifying certificate:', error)
    return NextResponse.json(
      { success: false, error: 'Error al verificar certificado' },
      { status: 500 }
    )
  }
}
```

---

## 3️⃣ MÓDULO DE CONVOCATORIAS

### POST /api/convocatorias - Crear convocatoria

```typescript
// app/api/convocatorias/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await req.json()

    // Generar folio único
    const year = new Date().getFullYear()
    const ultimaConv = await prisma.convocatoria.findFirst({
      where: {
        folio: {
          startsWith: `CONV-${year}-`
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const numeroConsecutivo = ultimaConv 
      ? parseInt(ultimaConv.folio.split('-')[2]) + 1 
      : 1

    const folio = `CONV-${year}-${numeroConsecutivo.toString().padStart(3, '0')}`

    // Crear convocatoria
    const convocatoria = await prisma.convocatoria.create({
      data: {
        ...body,
        folio,
        creadaPor: userId,
        estado: 'BORRADOR'
      }
    })

    return NextResponse.json({
      success: true,
      data: convocatoria,
      message: 'Convocatoria creada exitosamente'
    })
  } catch (error) {
    console.error('Error creating convocatoria:', error)
    return NextResponse.json(
      { success: false, error: 'Error al crear convocatoria' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const estado = searchParams.get('estado')
    const categoria = searchParams.get('categoria')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const where: any = {}
    if (estado) where.estado = estado
    if (categoria) where.categoria = categoria

    const [convocatorias, total] = await Promise.all([
      prisma.convocatoria.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { postulaciones: true }
          }
        }
      }),
      prisma.convocatoria.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: convocatorias,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching convocatorias:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener convocatorias' },
      { status: 500 }
    )
  }
}
```

### POST /api/postulaciones - Crear postulación

```typescript
// app/api/postulaciones/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { convocatoriaId, ...postulacionData } = body

    // Verificar que no existe postulación previa
    const existente = await prisma.postulacion.findFirst({
      where: {
        convocatoriaId,
        investigadorId: userId
      }
    })

    if (existente) {
      return NextResponse.json(
        { success: false, error: 'Ya existe una postulación para esta convocatoria' },
        { status: 400 }
      )
    }

    // Generar folio
    const year = new Date().getFullYear()
    const ultimaPost = await prisma.postulacion.findFirst({
      where: {
        folio: {
          startsWith: `POST-${year}-`
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const numeroConsecutivo = ultimaPost 
      ? parseInt(ultimaPost.folio.split('-')[2]) + 1 
      : 1

    const folio = `POST-${year}-${numeroConsecutivo.toString().padStart(6, '0')}`

    // Crear postulación
    const postulacion = await prisma.postulacion.create({
      data: {
        ...postulacionData,
        convocatoriaId,
        investigadorId: userId,
        folio,
        estado: 'BORRADOR'
      },
      include: {
        convocatoria: {
          select: {
            titulo: true,
            fechaCierreConv: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: postulacion,
      message: 'Postulación creada exitosamente'
    })
  } catch (error) {
    console.error('Error creating postulacion:', error)
    return NextResponse.json(
      { success: false, error: 'Error al crear postulación' },
      { status: 500 }
    )
  }
}
```

---

## 📚 LIBRERÍAS AUXILIARES

### Generación de PDF (lib/pdf-generator.ts)

```typescript
import puppeteer from 'puppeteer'
import { prisma } from './prisma'

export async function generateCertificatePDF(data: any): Promise<Buffer> {
  // Obtener plantilla
  const plantilla = await prisma.plantillaCertificado.findFirst({
    where: { activa: true }
  })

  if (!plantilla) {
    throw new Error('No hay plantilla activa')
  }

  // Reemplazar variables en HTML
  let html = plantilla.htmlTemplate
  html = html.replace('[NOMBRE_COMPLETO]', data.nombreCompleto)
  html = html.replace('[CURP]', data.curp)
  html = html.replace('[NIVEL]', data.nivel)
  html = html.replace('[FECHA_EMISION]', data.fechaEmision)
  html = html.replace('[FOLIO]', data.folio)
  html = html.replace('[VIGENCIA_INICIO]', data.vigenciaInicio)
  html = html.replace('[VIGENCIA_FIN]', data.vigenciaFin)
  html = html.replace('[QR_CODE]', data.qrCodeUrl)

  // Generar PDF con Puppeteer
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  const page = await browser.newPage()
  await page.setContent(html)
  
  const pdfBuffer = await page.pdf({
    format: 'letter',
    landscape: true,
    printBackground: true
  })

  await browser.close()

  return pdfBuffer
}
```

### Generación de QR (lib/qr-generator.ts)

```typescript
import QRCode from 'qrcode'

export async function generateQRCode(data: string): Promise<Buffer> {
  const qrBuffer = await QRCode.toBuffer(data, {
    errorCorrectionLevel: 'H',
    type: 'png',
    width: 300,
    margin: 1
  })

  return qrBuffer
}
```

---

**Siguiente paso**: Implementar las APIs siguiendo estos ejemplos y adaptar según necesidades específicas.
