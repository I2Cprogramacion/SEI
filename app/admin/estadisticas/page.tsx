"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, TrendingUp, Users, FileText, Building, BookOpen, Calendar, BarChart3, PieChart } from "lucide-react"

// Interfaces para los datos de estadísticas
interface EstadisticasGenerales {
  totalInvestigadores: number
  totalProyectos: number
  totalPublicaciones: number
  totalInstituciones: number
  investigadoresNuevos: number
  proyectosActivos: number
  publicacionesRecientes: number
  crecimientoMensual: number
}

interface EstadisticasPorArea {
  area: string
  investigadores: number
  proyectos: number
  publicaciones: number
}

interface EstadisticasPorInstitucion {
  institucion: string
  investigadores: number
  proyectos: number
  publicaciones: number
}

export default function EstadisticasAdmin() {
  const [estadisticas, setEstadisticas] = useState<EstadisticasGenerales>({
    totalInvestigadores: 0,
    totalProyectos: 0,
    totalPublicaciones: 0,
    totalInstituciones: 0,
    investigadoresNuevos: 0,
    proyectosActivos: 0,
    publicacionesRecientes: 0,
    crecimientoMensual: 0
  })
  const [estadisticasPorArea, setEstadisticasPorArea] = useState<EstadisticasPorArea[]>([])
  const [estadisticasPorInstitucion, setEstadisticasPorInstitucion] = useState<EstadisticasPorInstitucion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  // Cargar estadísticas reales desde las APIs
  useEffect(() => {
    const fetchEstadisticas = async () => {
      try {
        setIsLoading(true)
        
        // Cargar datos de todas las APIs en paralelo
        const [investigadoresRes, proyectosRes, publicacionesRes, institucionesRes] = await Promise.all([
          fetch('/api/investigadores').catch(() => ({ ok: false })),
          fetch('/api/proyectos').catch(() => ({ ok: false })),
          fetch('/api/publicaciones').catch(() => ({ ok: false })),
          fetch('/api/instituciones').catch(() => ({ ok: false }))
        ])

        // Procesar datos de investigadores
        let investigadores = []
        if (investigadoresRes.ok && 'json' in investigadoresRes) {
          try {
            const investigadoresData = await investigadoresRes.json()
            investigadores = Array.isArray(investigadoresData.investigadores) ? investigadoresData.investigadores : 
                           Array.isArray(investigadoresData) ? investigadoresData : []
          } catch (error) {
            console.error("Error al procesar investigadores:", error)
            investigadores = []
          }
        }

        // Procesar datos de proyectos
        let proyectos = []
        if (proyectosRes.ok && 'json' in proyectosRes) {
          try {
            const proyectosData = await proyectosRes.json()
            proyectos = Array.isArray(proyectosData.proyectos) ? proyectosData.proyectos : 
                       Array.isArray(proyectosData) ? proyectosData : []
          } catch (error) {
            console.error("Error al procesar proyectos:", error)
            proyectos = []
          }
        }

        // Procesar datos de publicaciones
        let publicaciones = []
        if (publicacionesRes.ok && 'json' in publicacionesRes) {
          try {
            const publicacionesData = await publicacionesRes.json()
            publicaciones = Array.isArray(publicacionesData.publicaciones) ? publicacionesData.publicaciones : 
                           Array.isArray(publicacionesData) ? publicacionesData : []
          } catch (error) {
            console.error("Error al procesar publicaciones:", error)
            publicaciones = []
          }
        }

        // Procesar datos de instituciones
        let instituciones = []
        if (institucionesRes.ok && 'json' in institucionesRes) {
          try {
            const institucionesData = await institucionesRes.json()
            instituciones = Array.isArray(institucionesData.instituciones) ? institucionesData.instituciones : 
                           Array.isArray(institucionesData) ? institucionesData : []
          } catch (error) {
            console.error("Error al procesar instituciones:", error)
            instituciones = []
          }
        }

        // Calcular estadísticas generales
        const ahora = new Date()
        const haceUnMes = new Date(ahora.getTime() - 30 * 24 * 60 * 60 * 1000)

        const investigadoresNuevos = Array.isArray(investigadores) ? investigadores.filter(inv => {
          try {
            const fecha = inv.fecha_registro || inv.createdAt
            return fecha ? new Date(fecha) >= haceUnMes : false
          } catch (error) {
            return false
          }
        }).length : 0

        const proyectosActivos = Array.isArray(proyectos) ? proyectos.filter(proj => 
          proj && (proj.estado === 'activo' || proj.estado === 'en_progreso')
        ).length : 0

        const publicacionesRecientes = Array.isArray(publicaciones) ? publicaciones.filter(pub => {
          try {
            const fecha = pub.fecha_publicacion || pub.createdAt
            return fecha ? new Date(fecha) >= haceUnMes : false
          } catch (error) {
            return false
          }
        }).length : 0

        // Calcular crecimiento mensual
        const totalAnterior = investigadores.length - investigadoresNuevos
        const crecimientoMensual = totalAnterior > 0 ? (investigadoresNuevos / totalAnterior) * 100 : 0

        setEstadisticas({
          totalInvestigadores: investigadores.length,
          totalProyectos: proyectos.length,
          totalPublicaciones: publicaciones.length,
          totalInstituciones: instituciones.length,
          investigadoresNuevos,
          proyectosActivos,
          publicacionesRecientes,
          crecimientoMensual: Math.round(crecimientoMensual * 10) / 10
        })

        // Calcular estadísticas por área
        const areasMap = new Map()
        
        if (Array.isArray(investigadores)) {
          investigadores.forEach(inv => {
            if (inv) {
              const area = inv.linea_investigacion || inv.area_investigacion || inv.area || 'Sin especificar'
              if (!areasMap.has(area)) {
                areasMap.set(area, { area, investigadores: 0, proyectos: 0, publicaciones: 0 })
              }
              areasMap.get(area).investigadores++
            }
          })
        }

        if (Array.isArray(proyectos)) {
          proyectos.forEach(proj => {
            if (proj) {
              const area = proj.area_investigacion || proj.area || 'Sin especificar'
              if (!areasMap.has(area)) {
                areasMap.set(area, { area, investigadores: 0, proyectos: 0, publicaciones: 0 })
              }
              areasMap.get(area).proyectos++
            }
          })
        }

        if (Array.isArray(publicaciones)) {
          publicaciones.forEach(pub => {
            if (pub) {
              const area = pub.area_tematica || pub.area || 'Sin especificar'
              if (!areasMap.has(area)) {
                areasMap.set(area, { area, investigadores: 0, proyectos: 0, publicaciones: 0 })
              }
              areasMap.get(area).publicaciones++
            }
          })
        }

        const estadisticasAreas = Array.from(areasMap.values())
          .sort((a, b) => b.investigadores - a.investigadores)
          .slice(0, 5)

        setEstadisticasPorArea(estadisticasAreas)

        // Calcular estadísticas por institución
        const institucionesMap = new Map()
        
        if (Array.isArray(investigadores)) {
          investigadores.forEach(inv => {
            if (inv) {
              const institucion = inv.institucion || 'Sin especificar'
              if (!institucionesMap.has(institucion)) {
                institucionesMap.set(institucion, { institucion, investigadores: 0, proyectos: 0, publicaciones: 0 })
              }
              institucionesMap.get(institucion).investigadores++
            }
          })
        }

        if (Array.isArray(proyectos)) {
          proyectos.forEach(proj => {
            if (proj) {
              const institucion = proj.institucion || 'Sin especificar'
              if (!institucionesMap.has(institucion)) {
                institucionesMap.set(institucion, { institucion, investigadores: 0, proyectos: 0, publicaciones: 0 })
              }
              institucionesMap.get(institucion).proyectos++
            }
          })
        }

        if (Array.isArray(publicaciones)) {
          publicaciones.forEach(pub => {
            if (pub) {
              const institucion = pub.institucion || pub.autor?.institucion || 'Sin especificar'
              if (!institucionesMap.has(institucion)) {
                institucionesMap.set(institucion, { institucion, investigadores: 0, proyectos: 0, publicaciones: 0 })
              }
              institucionesMap.get(institucion).publicaciones++
            }
          })
        }

        const estadisticasInstituciones = Array.from(institucionesMap.values())
          .sort((a, b) => b.investigadores - a.investigadores)
          .slice(0, 5)

        setEstadisticasPorInstitucion(estadisticasInstituciones)
        
      } catch (error) {
        console.error("Error al cargar estadísticas:", error)
        setError("No se pudieron cargar las estadísticas.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchEstadisticas()
  }, [])

  const getCrecimientoColor = (crecimiento: number) => {
    if (crecimiento > 0) return "text-green-600"
    if (crecimiento < 0) return "text-red-600"
    return "text-gray-600"
  }

  const getCrecimientoIcon = (crecimiento: number) => {
    if (crecimiento > 0) return "↗"
    if (crecimiento < 0) return "↘"
    return "→"
  }

  // Función para exportar reporte básico
  const handleExportReport = async () => {
    try {
      setIsExporting(true)
      
      // Crear datos del reporte
      const reportData = {
        fechaGeneracion: new Date().toLocaleString('es-MX'),
        estadisticasGenerales: estadisticas,
        distribucionPorAreas: estadisticasPorArea,
        topInstituciones: estadisticasPorInstitucion
      }

      // Convertir a CSV
      const csvContent = generateCSVReport(reportData)
      
      // Descargar archivo
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `reporte-estadisticas-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
    } catch (error) {
      console.error('Error al exportar reporte:', error)
      alert('Error al exportar el reporte. Inténtalo de nuevo.')
    } finally {
      setIsExporting(false)
    }
  }

  // Función para generar reporte completo
  const handleGenerateCompleteReport = async () => {
    try {
      setIsExporting(true)
      
      // Crear reporte completo con más detalles
      const completeReport = {
        metadata: {
          titulo: "Reporte Completo de Estadísticas - SECCTI",
          fechaGeneracion: new Date().toLocaleString('es-MX'),
          periodo: "Último mes",
          totalRegistros: {
            investigadores: estadisticas.totalInvestigadores,
            proyectos: estadisticas.totalProyectos,
            publicaciones: estadisticas.totalPublicaciones,
            instituciones: estadisticas.totalInstituciones
          }
        },
        resumenEjecutivo: {
          crecimientoMensual: estadisticas.crecimientoMensual,
          investigadoresNuevos: estadisticas.investigadoresNuevos,
          proyectosActivos: estadisticas.proyectosActivos,
          publicacionesRecientes: estadisticas.publicacionesRecientes
        },
        analisisPorAreas: estadisticasPorArea,
        rankingInstituciones: estadisticasPorInstitucion,
        recomendaciones: generateRecommendations()
      }

      // Generar reporte en formato JSON (más completo)
      const jsonContent = JSON.stringify(completeReport, null, 2)
      
      // Descargar archivo JSON
      const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `reporte-completo-estadisticas-${new Date().toISOString().split('T')[0]}.json`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
    } catch (error) {
      console.error('Error al generar reporte completo:', error)
      alert('Error al generar el reporte completo. Inténtalo de nuevo.')
    } finally {
      setIsExporting(false)
    }
  }

  // Función para generar CSV
  const generateCSVReport = (data: any) => {
    let csv = 'REPORTE DE ESTADÍSTICAS - SECCTI\n'
    csv += `Fecha de generación,${data.fechaGeneracion}\n\n`
    
    csv += 'ESTADÍSTICAS GENERALES\n'
    csv += 'Métrica,Valor\n'
    csv += `Total Investigadores,${data.estadisticasGenerales.totalInvestigadores}\n`
    csv += `Investigadores Nuevos,${data.estadisticasGenerales.investigadoresNuevos}\n`
    csv += `Total Proyectos,${data.estadisticasGenerales.totalProyectos}\n`
    csv += `Proyectos Activos,${data.estadisticasGenerales.proyectosActivos}\n`
    csv += `Total Publicaciones,${data.estadisticasGenerales.totalPublicaciones}\n`
    csv += `Publicaciones Recientes,${data.estadisticasGenerales.publicacionesRecientes}\n`
    csv += `Total Instituciones,${data.estadisticasGenerales.totalInstituciones}\n`
    csv += `Crecimiento Mensual,${data.estadisticasGenerales.crecimientoMensual}%\n\n`
    
    csv += 'DISTRIBUCIÓN POR ÁREAS\n'
    csv += 'Área,Investigadores,Proyectos,Publicaciones\n'
    data.distribucionPorAreas.forEach((area: any) => {
      csv += `${area.area},${area.investigadores},${area.proyectos},${area.publicaciones}\n`
    })
    
    csv += '\nTOP INSTITUCIONES\n'
    csv += 'Institución,Investigadores,Proyectos,Publicaciones\n'
    data.topInstituciones.forEach((inst: any) => {
      csv += `${inst.institucion},${inst.investigadores},${inst.proyectos},${inst.publicaciones}\n`
    })
    
    return csv
  }

  // Función para generar recomendaciones
  const generateRecommendations = () => {
    const recommendations = []
    
    if (estadisticas.crecimientoMensual < 5) {
      recommendations.push("Considerar estrategias de marketing para aumentar el registro de nuevos investigadores")
    }
    
    if (estadisticas.proyectosActivos / estadisticas.totalProyectos < 0.7) {
      recommendations.push("Revisar el estado de los proyectos inactivos y reactivar los que sean viables")
    }
    
    if (estadisticasPorArea.length > 0) {
      const topArea = estadisticasPorArea[0]
      recommendations.push(`El área '${topArea.area}' tiene la mayor concentración de investigadores (${topArea.investigadores}). Considerar crear programas específicos para esta área.`)
    }
    
    if (estadisticasPorInstitucion.length > 0) {
      const topInstitucion = estadisticasPorInstitucion[0]
      recommendations.push(`La institución '${topInstitucion.institucion}' es la más activa. Considerar establecer alianzas estratégicas.`)
    }
    
    return recommendations
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center mb-6">
        <Button variant="ghost" asChild className="mr-4 text-blue-700 hover:bg-blue-50">
          <Link href="/admin">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al panel
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-blue-900">Estadísticas de la Plataforma</h1>
      </div>

      {error && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6">
          <p>{error}</p>
        </div>
      )}

      {/* Estadísticas Generales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white border-blue-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">Total Investigadores</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{isLoading ? "..." : estadisticas.totalInvestigadores}</div>
            <p className="text-xs text-blue-600">
              +{isLoading ? "..." : estadisticas.investigadoresNuevos} nuevos este mes
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-blue-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">Proyectos Activos</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{isLoading ? "..." : estadisticas.proyectosActivos}</div>
            <p className="text-xs text-blue-600">de {isLoading ? "..." : estadisticas.totalProyectos} totales</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-blue-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">Publicaciones</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{isLoading ? "..." : estadisticas.totalPublicaciones}</div>
            <p className="text-xs text-blue-600">+{isLoading ? "..." : estadisticas.publicacionesRecientes} este mes</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-blue-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">Instituciones</CardTitle>
            <Building className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{isLoading ? "..." : estadisticas.totalInstituciones}</div>
            <p className="text-xs text-blue-600">registradas</p>
          </CardContent>
        </Card>
      </div>

      {/* Métricas de Crecimiento */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="bg-white border-blue-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <TrendingUp className="h-5 w-5" />
              Crecimiento Mensual
            </CardTitle>
            <CardDescription className="text-blue-600">
              Indicadores de crecimiento de la plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-600">Investigadores nuevos</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-blue-900">
                    {isLoading ? (
                      <div className="animate-pulse bg-blue-100 h-4 w-8 rounded"></div>
                    ) : (
                      estadisticas.investigadoresNuevos
                    )}
                  </span>
                  <Badge className="bg-green-100 text-green-800">
                    {isLoading ? (
                      <div className="animate-pulse bg-green-200 h-3 w-8 rounded"></div>
                    ) : (
                      `+${estadisticas.crecimientoMensual}%`
                    )}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-600">Proyectos activos</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-blue-900">
                    {isLoading ? (
                      <div className="animate-pulse bg-blue-100 h-4 w-8 rounded"></div>
                    ) : (
                      estadisticas.proyectosActivos
                    )}
                  </span>
                  <Badge className="bg-blue-100 text-blue-800">
                    {isLoading ? (
                      <div className="animate-pulse bg-blue-200 h-3 w-8 rounded"></div>
                    ) : (
                      `${Math.round((estadisticas.proyectosActivos / estadisticas.totalProyectos) * 100)}%`
                    )}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-600">Publicaciones recientes</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-blue-900">
                    {isLoading ? (
                      <div className="animate-pulse bg-blue-100 h-4 w-8 rounded"></div>
                    ) : (
                      estadisticas.publicacionesRecientes
                    )}
                  </span>
                  <Badge className="bg-purple-100 text-purple-800">
                    {isLoading ? (
                      <div className="animate-pulse bg-purple-200 h-3 w-8 rounded"></div>
                    ) : (
                      `+${Math.round((estadisticas.publicacionesRecientes / estadisticas.totalPublicaciones) * 100)}%`
                    )}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-blue-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <BarChart3 className="h-5 w-5" />
              Distribución por Áreas
            </CardTitle>
            <CardDescription className="text-blue-600">
              Investigadores por área de especialización
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="animate-pulse bg-blue-100 h-4 w-24 rounded"></div>
                    <div className="flex items-center gap-2">
                      <div className="animate-pulse bg-blue-100 h-4 w-8 rounded"></div>
                      <div className="w-16 bg-blue-100 rounded-full h-2">
                        <div className="animate-pulse bg-blue-200 h-2 rounded-full w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : estadisticasPorArea.length > 0 ? (
                estadisticasPorArea.map((area, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-blue-600 truncate" title={area.area}>
                      {area.area}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-blue-900">{area.investigadores}</span>
                      <div className="w-16 bg-blue-100 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                          style={{ 
                            width: `${estadisticas.totalInvestigadores > 0 ? (area.investigadores / estadisticas.totalInvestigadores) * 100 : 0}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-blue-600 py-4">
                  No hay datos de áreas disponibles
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estadísticas por Institución */}
      <Card className="bg-white border-blue-100 mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Building className="h-5 w-5" />
            Top Instituciones
          </CardTitle>
          <CardDescription className="text-blue-600">
            Instituciones con mayor actividad en la plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex-1">
                    <div className="animate-pulse bg-blue-200 h-4 w-48 rounded mb-2"></div>
                    <div className="flex gap-4">
                      <div className="animate-pulse bg-blue-200 h-3 w-20 rounded"></div>
                      <div className="animate-pulse bg-blue-200 h-3 w-16 rounded"></div>
                      <div className="animate-pulse bg-blue-200 h-3 w-20 rounded"></div>
                    </div>
                  </div>
                  <div className="animate-pulse bg-blue-200 h-6 w-8 rounded"></div>
                </div>
              ))
            ) : estadisticasPorInstitucion.length > 0 ? (
              estadisticasPorInstitucion.map((institucion, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                  <div className="flex-1">
                    <h4 className="font-medium text-blue-900 mb-2 truncate" title={institucion.institucion}>
                      {institucion.institucion}
                    </h4>
                    <div className="flex gap-4 text-sm text-blue-600">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {institucion.investigadores} investigadores
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {institucion.proyectos} proyectos
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        {institucion.publicaciones} publicaciones
                      </span>
                    </div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">
                    #{index + 1}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center text-blue-600 py-8">
                No hay datos de instituciones disponibles
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Acciones de Exportación */}
      <div className="flex justify-between items-center">
        <Button 
          variant="outline" 
          className="border-blue-200 text-blue-700 hover:bg-blue-50"
          onClick={() => window.location.reload()}
          disabled={isLoading}
        >
          <TrendingUp className="mr-2 h-4 w-4" />
          {isLoading ? "Actualizando..." : "Actualizar Estadísticas"}
        </Button>
        <div className="flex gap-4">
          <Button 
            variant="outline" 
            className="border-blue-200 text-blue-700 hover:bg-blue-50"
            onClick={handleExportReport}
            disabled={isExporting || isLoading}
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                Exportando...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Exportar Reporte
              </>
            )}
          </Button>
          <Button 
            className="bg-blue-700 text-white hover:bg-blue-800"
            onClick={handleGenerateCompleteReport}
            disabled={isExporting || isLoading}
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generando...
              </>
            ) : (
              <>
                <BarChart3 className="mr-2 h-4 w-4" />
                Generar Reporte Completo
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
