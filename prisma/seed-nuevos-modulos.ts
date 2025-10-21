/**
 * Script de seed para inicializar datos de los nuevos módulos
 * 
 * Ejecutar con: npx prisma db seed
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de datos...\n')

  // ========================================
  // 1. NIVELES DE INVESTIGADOR
  // ========================================
  console.log('📊 Creando niveles de investigador...')
  
  const niveles = [
    {
      codigo: 'NIVEL_1',
      nombre: 'Nivel 1',
      descripcion: 'Investigador Junior - Inicio de carrera académica con potencial demostrado',
      puntajeMinimo: 0,
      puntajeMaximo: 40,
      color: '#10B981', // green-500
      icono: 'User',
      orden: 1,
      requisitos: [
        'Grado mínimo: Maestría',
        'Al menos 2 publicaciones en revistas indexadas',
        'Participación en al menos 1 proyecto de investigación',
        'Experiencia mínima de 2 años en investigación'
      ],
      beneficios: [
        'Reconocimiento oficial como investigador',
        'Acceso a convocatorias nivel básico',
        'Descuentos en eventos académicos',
        'Certificación digital'
      ]
    },
    {
      codigo: 'NIVEL_2',
      nombre: 'Nivel 2',
      descripcion: 'Investigador Consolidado - Trayectoria académica sólida y productiva',
      puntajeMinimo: 41,
      puntajeMaximo: 65,
      color: '#3B82F6', // blue-500
      icono: 'GraduationCap',
      orden: 2,
      requisitos: [
        'Grado mínimo: Doctorado',
        'Al menos 5 publicaciones en revistas Q1 o Q2',
        'Dirección de al menos 2 tesis de posgrado',
        'Participación como investigador principal en proyectos',
        'Experiencia mínima de 5 años en investigación'
      ],
      beneficios: [
        'Reconocimiento como investigador consolidado',
        'Acceso prioritario a convocatorias',
        'Elegible para comités de evaluación',
        'Apoyo para estancias de investigación',
        'Certificación digital premium'
      ]
    },
    {
      codigo: 'NIVEL_3',
      nombre: 'Nivel 3',
      descripcion: 'Investigador Senior - Liderazgo académico y reconocimiento nacional/internacional',
      puntajeMinimo: 66,
      puntajeMaximo: 85,
      color: '#8B5CF6', // purple-500
      icono: 'Award',
      orden: 3,
      requisitos: [
        'Grado: Doctorado con postdoctorado',
        'Al menos 10 publicaciones en revistas Q1',
        'Índice H mayor a 10',
        'Dirección de al menos 5 tesis de doctorado',
        'Líder de proyectos de alto impacto',
        'Colaboraciones internacionales activas',
        'Experiencia mínima de 10 años en investigación'
      ],
      beneficios: [
        'Reconocimiento como líder en su campo',
        'Máxima prioridad en convocatorias',
        'Participación en comités estratégicos',
        'Apoyo para organización de eventos',
        'Representación en congresos internacionales',
        'Certificación digital élite'
      ]
    },
    {
      codigo: 'CANDIDATO',
      nombre: 'Candidato a Emérito',
      descripcion: 'Investigador de excelencia con trayectoria sobresaliente - En evaluación para Emérito',
      puntajeMinimo: 86,
      puntajeMaximo: 94,
      color: '#F59E0B', // amber-500
      icono: 'Star',
      orden: 4,
      requisitos: [
        'Nivel 3 por al menos 5 años',
        'Más de 20 publicaciones en revistas Q1',
        'Índice H mayor a 20',
        'Formación de más de 10 doctores',
        'Impacto nacional e internacional demostrado',
        'Contribuciones excepcionales a la ciencia',
        'Experiencia mínima de 15 años en investigación'
      ],
      beneficios: [
        'Reconocimiento de excelencia académica',
        'Todos los beneficios de Nivel 3',
        'Candidatura automática a Emérito',
        'Mención especial en certificación',
        'Participación en consejo asesor'
      ]
    },
    {
      codigo: 'EMERITO',
      nombre: 'Emérito',
      descripcion: 'Investigador Emérito - Máxima distinción por contribuciones excepcionales y sostenidas',
      puntajeMinimo: 95,
      puntajeMaximo: 100,
      color: '#DC2626', // red-600
      icono: 'Crown',
      orden: 5,
      requisitos: [
        'Trayectoria de excelencia sostenida',
        'Contribuciones transformadoras en su campo',
        'Reconocimiento nacional e internacional',
        'Formación de generaciones de investigadores',
        'Impacto social demostrable',
        'Más de 20 años de experiencia',
        'Aprobación del consejo asesor'
      ],
      beneficios: [
        'Máxima distinción del Sistema',
        'Reconocimiento vitalicio',
        'Membresía permanente del consejo',
        'Apoyo institucional continuo',
        'Participación en eventos de honor',
        'Certificación de distinción especial',
        'Legado institucional'
      ]
    }
  ]

  for (const nivel of niveles) {
    await prisma.nivelInvestigador.upsert({
      where: { codigo: nivel.codigo },
      update: {},
      create: nivel as any
    })
    console.log(`  ✅ ${nivel.nombre}`)
  }

  // ========================================
  // 2. CRITERIOS DE EVALUACIÓN
  // ========================================
  console.log('\n📋 Creando criterios de evaluación...')
  
  const criterios = [
    {
      codigo: 'PUB_ARTICULOS_Q1',
      nombre: 'Artículos en revistas Q1',
      descripcion: 'Publicaciones en revistas científicas del primer cuartil',
      categoria: 'PRODUCTIVIDAD',
      peso: 10,
      puntajeMaximo: 10,
      formula: 'COUNT(publicaciones WHERE quartil = "Q1") * 2',
      activo: true,
      orden: 1,
      subcategorias: [
        { nombre: 'Autor principal', peso: 60 },
        { nombre: 'Coautor', peso: 40 }
      ]
    },
    {
      codigo: 'PUB_ARTICULOS_Q2',
      nombre: 'Artículos en revistas Q2',
      descripcion: 'Publicaciones en revistas científicas del segundo cuartil',
      categoria: 'PRODUCTIVIDAD',
      peso: 5,
      puntajeMaximo: 5,
      formula: 'COUNT(publicaciones WHERE quartil = "Q2") * 1.5',
      activo: true,
      orden: 2
    },
    {
      codigo: 'PUB_LIBROS',
      nombre: 'Libros completos',
      descripcion: 'Publicación de libros científicos o académicos',
      categoria: 'PRODUCTIVIDAD',
      peso: 5,
      puntajeMaximo: 5,
      activo: true,
      orden: 3
    },
    {
      codigo: 'PROY_PRINCIPAL',
      nombre: 'Proyectos como investigador principal',
      descripcion: 'Liderazgo de proyectos de investigación',
      categoria: 'PRODUCTIVIDAD',
      peso: 15,
      puntajeMaximo: 15,
      activo: true,
      orden: 4
    },
    {
      codigo: 'PROY_FINANCIAMIENTO',
      nombre: 'Financiamiento obtenido',
      descripcion: 'Monto total de recursos conseguidos para investigación',
      categoria: 'PRODUCTIVIDAD',
      peso: 5,
      puntajeMaximo: 5,
      formula: 'LOG10(monto_total / 100000) * 2',
      activo: true,
      orden: 5
    },
    {
      codigo: 'FORM_TESIS_DOC',
      nombre: 'Dirección de tesis de doctorado',
      descripcion: 'Dirección y graduación de estudiantes de doctorado',
      categoria: 'FORMACION',
      peso: 10,
      puntajeMaximo: 10,
      activo: true,
      orden: 6
    },
    {
      codigo: 'FORM_TESIS_MAESTRIA',
      nombre: 'Dirección de tesis de maestría',
      descripcion: 'Dirección y graduación de estudiantes de maestría',
      categoria: 'FORMACION',
      peso: 7,
      puntajeMaximo: 7,
      activo: true,
      orden: 7
    },
    {
      codigo: 'FORM_CURSOS',
      nombre: 'Cursos y talleres impartidos',
      descripcion: 'Docencia en cursos de posgrado y formación continua',
      categoria: 'FORMACION',
      peso: 3,
      puntajeMaximo: 3,
      activo: true,
      orden: 8
    },
    {
      codigo: 'EXP_AÑOS',
      nombre: 'Años de experiencia en investigación',
      descripcion: 'Trayectoria total en investigación científica',
      categoria: 'EXPERIENCIA',
      peso: 8,
      puntajeMaximo: 8,
      formula: 'MIN(años_experiencia / 2, 8)',
      activo: true,
      orden: 9
    },
    {
      codigo: 'EXP_GRADO',
      nombre: 'Grado académico',
      descripcion: 'Nivel del máximo grado académico obtenido',
      categoria: 'EXPERIENCIA',
      peso: 7,
      puntajeMaximo: 7,
      subcategorias: [
        { nombre: 'Licenciatura', puntos: 2 },
        { nombre: 'Maestría', puntos: 4 },
        { nombre: 'Doctorado', puntos: 6 },
        { nombre: 'Posdoctorado', puntos: 7 }
      ],
      activo: true,
      orden: 10
    },
    {
      codigo: 'EXP_SNI',
      nombre: 'Pertenencia al SNI',
      descripcion: 'Membresía en el Sistema Nacional de Investigadores',
      categoria: 'EXPERIENCIA',
      peso: 5,
      puntajeMaximo: 5,
      subcategorias: [
        { nombre: 'Candidato', puntos: 2 },
        { nombre: 'Nivel I', puntos: 3 },
        { nombre: 'Nivel II', puntos: 4 },
        { nombre: 'Nivel III', puntos: 5 }
      ],
      activo: true,
      orden: 11
    },
    {
      codigo: 'IMP_PATENTES',
      nombre: 'Patentes y registros',
      descripcion: 'Patentes otorgadas y registros de propiedad intelectual',
      categoria: 'IMPACTO',
      peso: 5,
      puntajeMaximo: 5,
      activo: true,
      orden: 12
    },
    {
      codigo: 'IMP_COLAB_INT',
      nombre: 'Colaboraciones internacionales',
      descripcion: 'Trabajo colaborativo con instituciones extranjeras',
      categoria: 'IMPACTO',
      peso: 5,
      puntajeMaximo: 5,
      activo: true,
      orden: 13
    },
    {
      codigo: 'IMP_PREMIOS',
      nombre: 'Premios y distinciones',
      descripcion: 'Reconocimientos académicos y científicos recibidos',
      categoria: 'IMPACTO',
      peso: 5,
      puntajeMaximo: 5,
      activo: true,
      orden: 14
    }
  ]

  for (const criterio of criterios) {
    await prisma.criterioEvaluacion.upsert({
      where: { codigo: criterio.codigo },
      update: {},
      create: criterio as any
    })
    console.log(`  ✅ ${criterio.nombre}`)
  }

  // ========================================
  // 3. PLANTILLA DE CERTIFICADO
  // ========================================
  console.log('\n📜 Creando plantilla de certificado...')
  
  const plantilla = {
    nombre: 'Certificado SEI - Oficial',
    descripcion: 'Plantilla oficial del Sistema Estatal de Investigadores',
    orientacion: 'landscape',
    tamano: 'letter',
    margenes: { top: 20, right: 20, bottom: 20, left: 20 },
    activa: true,
    version: 1,
    variables: [
      { nombre: 'nombreCompleto', placeholder: '[NOMBRE_COMPLETO]', tipo: 'string' },
      { nombre: 'curp', placeholder: '[CURP]', tipo: 'string' },
      { nombre: 'nivel', placeholder: '[NIVEL]', tipo: 'string' },
      { nombre: 'fechaEmision', placeholder: '[FECHA_EMISION]', tipo: 'date' },
      { nombre: 'folio', placeholder: '[FOLIO]', tipo: 'string' },
      { nombre: 'vigenciaInicio', placeholder: '[VIGENCIA_INICIO]', tipo: 'date' },
      { nombre: 'vigenciaFin', placeholder: '[VIGENCIA_FIN]', tipo: 'date' },
      { nombre: 'qrCode', placeholder: '[QR_CODE]', tipo: 'image' },
      { nombre: 'firma', placeholder: '[FIRMA]', tipo: 'image' }
    ],
    htmlTemplate: `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <style>
        @page {
            size: letter landscape;
            margin: 0;
        }
        body {
            font-family: 'Georgia', serif;
            margin: 0;
            padding: 40px;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        }
        .certificado {
            background: white;
            padding: 60px;
            border: 10px solid #1e40af;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            position: relative;
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #1e40af;
            padding-bottom: 20px;
            margin-bottom: 40px;
        }
        .logo {
            font-size: 48px;
            color: #1e40af;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .institucion {
            font-size: 24px;
            color: #1e40af;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .subtitulo {
            font-size: 18px;
            color: #64748b;
        }
        .certifica {
            text-align: center;
            font-size: 36px;
            color: #1e40af;
            font-weight: bold;
            margin: 30px 0;
            text-transform: uppercase;
            letter-spacing: 3px;
        }
        .contenido {
            font-size: 18px;
            line-height: 2;
            text-align: center;
            color: #334155;
        }
        .nombre {
            font-size: 32px;
            font-weight: bold;
            color: #1e40af;
            margin: 20px 0;
        }
        .nivel {
            font-size: 36px;
            font-weight: bold;
            color: #dc2626;
            margin: 30px 0;
            padding: 20px;
            background: #fef2f2;
            border-radius: 10px;
            display: inline-block;
        }
        .detalles {
            margin-top: 40px;
            font-size: 16px;
            color: #64748b;
        }
        .footer {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-top: 60px;
            padding-top: 30px;
            border-top: 2px solid #e2e8f0;
        }
        .qr-section {
            text-align: center;
        }
        .qr-code {
            width: 120px;
            height: 120px;
            border: 3px solid #1e40af;
            border-radius: 10px;
        }
        .firma-section {
            text-align: center;
        }
        .firma {
            width: 200px;
            margin-bottom: 10px;
        }
        .linea-firma {
            border-top: 2px solid #1e40af;
            width: 250px;
            margin: 10px auto;
        }
        .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 120px;
            color: rgba(30, 64, 175, 0.05);
            font-weight: bold;
            z-index: 0;
        }
    </style>
</head>
<body>
    <div class="certificado">
        <div class="watermark">SEI</div>
        
        <div class="header">
            <div class="logo">SEI</div>
            <div class="institucion">SISTEMA ESTATAL DE INVESTIGADORES</div>
            <div class="subtitulo">Estado de Chihuahua</div>
        </div>
        
        <div class="certifica">CERTIFICA</div>
        
        <div class="contenido">
            Que el/la
            <div class="nombre">[NOMBRE_COMPLETO]</div>
            con CURP: <strong>[CURP]</strong>
            <br>
            pertenece al Sistema Estatal de Investigadores
            <br>
            del Estado de Chihuahua con el nivel:
            <div class="nivel">[NIVEL]</div>
        </div>
        
        <div class="detalles">
            <p>Reconocimiento otorgado el: <strong>[FECHA_EMISION]</strong></p>
            <p>Vigencia: <strong>[VIGENCIA_INICIO]</strong> al <strong>[VIGENCIA_FIN]</strong></p>
            <p>Folio: <strong>[FOLIO]</strong></p>
        </div>
        
        <div class="footer">
            <div class="qr-section">
                <img src="[QR_CODE]" alt="QR Code" class="qr-code">
                <p style="font-size: 12px; margin-top: 10px;">
                    Verificar en:<br>
                    <strong>sei-chih.com.mx/verificar</strong>
                </p>
            </div>
            
            <div class="firma-section">
                <div class="linea-firma"></div>
                <p style="margin: 5px 0; font-weight: bold;">Secretario Técnico</p>
                <p style="margin: 0; font-size: 14px;">Sistema Estatal de Investigadores</p>
            </div>
        </div>
    </div>
</body>
</html>
    `,
    cssStyles: ''
  }

  await prisma.plantillaCertificado.upsert({
    where: { nombre: plantilla.nombre },
    update: {},
    create: plantilla as any
  })
  console.log('  ✅ Plantilla de certificado creada')

  // ========================================
  // 4. CICLOS DE CONVOCATORIAS
  // ========================================
  console.log('\n📅 Creando ciclos de convocatorias...')
  
  const ciclos = [
    {
      nombre: '2025-1',
      anio: 2025,
      periodo: 'Primer Semestre',
      fechaInicio: new Date('2025-01-01'),
      fechaFin: new Date('2025-06-30'),
      activo: true,
      descripcion: 'Primer ciclo de convocatorias 2025',
      presupuestoTotal: 5000000
    },
    {
      nombre: '2025-2',
      anio: 2025,
      periodo: 'Segundo Semestre',
      fechaInicio: new Date('2025-07-01'),
      fechaFin: new Date('2025-12-31'),
      activo: false,
      descripcion: 'Segundo ciclo de convocatorias 2025',
      presupuestoTotal: 5000000
    }
  ]

  for (const ciclo of ciclos) {
    await prisma.cicloConvocatoria.upsert({
      where: { nombre: ciclo.nombre },
      update: {},
      create: ciclo
    })
    console.log(`  ✅ Ciclo ${ciclo.nombre}`)
  }

  console.log('\n✨ Seed completado exitosamente!\n')
  console.log('📊 Resumen:')
  console.log(`  • ${niveles.length} niveles de investigador`)
  console.log(`  • ${criterios.length} criterios de evaluación`)
  console.log('  • 1 plantilla de certificado')
  console.log(`  • ${ciclos.length} ciclos de convocatorias\n`)
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
