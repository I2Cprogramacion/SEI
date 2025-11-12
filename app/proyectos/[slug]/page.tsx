"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { 
  CalendarDays, 
  Share2, 
  Link2, 
  DollarSign, 
  Building2, 
  User,
  Target,
  CheckCircle2,
  FileText,
  Users,
  Loader2,
  ArrowLeft,
  Download,
  ExternalLink
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"

interface Proyecto {
  id: number
  titulo: string
  descripcion: string
  resumen?: string
  autor: {
    nombre: string
    institucion: string
  }
  institucion: string
  categoria: string
  estado: string
  fechaInicio: string | null
  fechaFin: string | null
  presupuesto: number | null
  financiamiento: string | null
  areaInvestigacion?: string
  palabrasClave: string[]
  objetivos: string[]
  resultados: string[]
  metodologia?: string | null
  impacto?: string | null
  colaboradores?: Array<{
    nombre: string
    institucion: string
    rol?: string
  }> | string[]
  archivoUrl?: string | null
  slug: string
  fechaCreacion: string | null
}

export default function ProjectPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const [proyecto, setProyecto] = useState<Proyecto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchProyecto = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`/api/proyectos/${slug}`)
        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.error || 'Error al cargar el proyecto')
        }

        if (data.proyecto) {
          setProyecto(data.proyecto)
        } else {
          throw new Error('Proyecto no encontrado')
        }
      } catch (err) {
        console.error("Error fetching proyecto:", err)
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchProyecto()
    }
  }, [slug])

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: proyecto?.titulo,
          text: `Mira este proyecto de investigación: ${proyecto?.titulo}`,
          url: window.location.href,
        })
      } else {
        navigator.clipboard.writeText(window.location.href)
        toast({
          title: "Enlace copiado",
          description: "El enlace al proyecto ha sido copiado al portapapeles.",
        })
      }
    } catch (error) {
      console.error("Error al compartir:", error)
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    toast({
      title: "Enlace copiado",
      description: "El enlace al proyecto ha sido copiado al portapapeles.",
    })
  }

  const formatFecha = (fecha: string | null) => {
    if (!fecha) return 'Presente'
    try {
      const date = new Date(fecha)
      if (isNaN(date.getTime())) return fecha
      return date.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })
    } catch {
      return fecha
    }
  }

  const formatPresupuesto = (presupuesto: number | null) => {
    if (!presupuesto) return 'No especificado'
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(presupuesto)
  }

  const getColaboradorNombre = (colab: any): string => {
    if (typeof colab === 'string') {
      return colab.includes(' - ') ? colab.split(' - ')[0] : colab
    }
    return colab?.nombre || ''
  }

  const getColaboradorInstitucion = (colab: any): string => {
    if (typeof colab === 'string') {
      return colab.includes(' - ') ? colab.split(' - ')[1] || '' : ''
    }
    return colab?.institucion || ''
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-blue-600">Cargando proyecto...</p>
        </div>
      </div>
    )
  }

  if (error || !proyecto) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-blue-900 mb-4">Proyecto no encontrado</h2>
            <p className="text-gray-600 mb-6">{error || 'El proyecto que buscas no existe o ha sido eliminado.'}</p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => router.back()} variant="outline" className="border-blue-200 text-blue-700">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver atrás
              </Button>
              <Button onClick={() => router.push('/proyectos')} className="bg-blue-700 hover:bg-blue-800">
                Ver todos los proyectos
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="container mx-auto py-8 px-4">
        {/* Botón volver */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </div>

        <div className="space-y-8">
          {/* Encabezado del proyecto */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {proyecto.categoria && (
                <Badge className="bg-blue-700 text-white text-sm px-3 py-1">{proyecto.categoria}</Badge>
              )}
              {proyecto.estado && (
                <Badge variant="outline" className="border-blue-300 text-blue-700 text-sm px-3 py-1">
                  {proyecto.estado}
                </Badge>
              )}
              {proyecto.areaInvestigacion && (
                <Badge variant="outline" className="border-green-300 text-green-700 text-sm px-3 py-1">
                  {proyecto.areaInvestigacion}
                </Badge>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-blue-900 leading-tight">
              {proyecto.titulo}
            </h1>

            {proyecto.resumen && (
              <p className="text-lg text-gray-700 leading-relaxed max-w-3xl">
                {proyecto.resumen}
              </p>
            )}

            <div className="flex flex-wrap gap-4 text-sm text-blue-600">
              <div className="flex items-center">
                <CalendarDays className="mr-2 h-4 w-4" />
                <span>
                  {formatFecha(proyecto.fechaInicio)} - {formatFecha(proyecto.fechaFin)}
                </span>
              </div>
              {proyecto.autor.nombre && (
                <div className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  <span>{proyecto.autor.nombre}</span>
                </div>
              )}
              {proyecto.autor.institucion && (
                <div className="flex items-center">
                  <Building2 className="mr-2 h-4 w-4" />
                  <span>{proyecto.autor.institucion}</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="border-blue-200 text-blue-700 hover:bg-blue-50"
                onClick={handleShare}
              >
                <Share2 className="mr-2 h-4 w-4" />
                Compartir
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-blue-200 text-blue-700 hover:bg-blue-50"
                onClick={handleCopyLink}
              >
                <Link2 className="mr-2 h-4 w-4" />
                Copiar enlace
              </Button>
              {proyecto.archivoUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-green-200 text-green-700 hover:bg-green-50"
                  onClick={() => window.open(proyecto.archivoUrl!, '_blank')}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Descargar archivo
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contenido principal */}
            <div className="lg:col-span-2 space-y-6">
              {/* Descripción */}
              {proyecto.descripcion && (
                <Card className="bg-white border-blue-100 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-blue-900 flex items-center">
                      <FileText className="mr-2 h-5 w-5" />
                      Descripción del Proyecto
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {proyecto.descripcion}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Objetivos */}
              {proyecto.objetivos && proyecto.objetivos.length > 0 && (
                <Card className="bg-white border-blue-100 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-blue-900 flex items-center">
                      <Target className="mr-2 h-5 w-5" />
                      Objetivos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {proyecto.objetivos.map((objetivo, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-semibold mt-0.5">
                            {index + 1}
                          </div>
                          <p className="text-gray-700 leading-relaxed flex-1">{objetivo}</p>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Metodología */}
              {proyecto.metodologia && (
                <Card className="bg-white border-blue-100 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-blue-900">Metodología</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {proyecto.metodologia}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Resultados */}
              {proyecto.resultados && proyecto.resultados.length > 0 && (
                <Card className="bg-white border-blue-100 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-blue-900 flex items-center">
                      <CheckCircle2 className="mr-2 h-5 w-5" />
                      Resultados
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {proyecto.resultados.map((resultado, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <p className="text-gray-700 leading-relaxed flex-1">{resultado}</p>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Impacto */}
              {proyecto.impacto && (
                <Card className="bg-white border-green-50 border-2 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-green-900">Impacto del Proyecto</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {proyecto.impacto}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar con información adicional */}
            <div className="space-y-6">
              {/* Información del proyecto */}
              <Card className="bg-white border-blue-100 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-blue-900 text-lg">Información del Proyecto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {proyecto.autor.institucion && (
                    <div>
                      <h4 className="font-semibold text-xs text-gray-500 uppercase tracking-wide mb-1">Institución</h4>
                      <p className="text-gray-900 flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-blue-600" />
                        {proyecto.autor.institucion}
                      </p>
                    </div>
                  )}
                  
                  {proyecto.financiamiento && (
                    <div>
                      <h4 className="font-semibold text-xs text-gray-500 uppercase tracking-wide mb-1">Fuente de Financiamiento</h4>
                      <p className="text-gray-900">{proyecto.financiamiento}</p>
                    </div>
                  )}
                  
                  {proyecto.presupuesto && (
                    <div>
                      <h4 className="font-semibold text-xs text-gray-500 uppercase tracking-wide mb-1">Presupuesto</h4>
                      <div className="flex items-center text-gray-900">
                        <DollarSign className="h-4 w-4 mr-1 text-green-600" />
                        {formatPresupuesto(proyecto.presupuesto)}
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="font-semibold text-xs text-gray-500 uppercase tracking-wide mb-1">Duración</h4>
                    <p className="text-gray-900 flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-blue-600" />
                      {formatFecha(proyecto.fechaInicio)} - {formatFecha(proyecto.fechaFin)}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-xs text-gray-500 uppercase tracking-wide mb-1">Estado</h4>
                    <Badge variant="outline" className="border-blue-200 text-blue-700">
                      {proyecto.estado || 'No especificado'}
                    </Badge>
                  </div>

                  {proyecto.palabrasClave && proyecto.palabrasClave.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-xs text-gray-500 uppercase tracking-wide mb-2">Palabras Clave</h4>
                      <div className="flex flex-wrap gap-2">
                        {proyecto.palabrasClave.map((palabra, index) => (
                          <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                            {palabra}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Investigador Principal */}
              <Card className="bg-white border-blue-100 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-blue-900 text-lg flex items-center">
                    <User className="mr-2 h-5 w-5" />
                    Investigador Principal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-semibold text-gray-900 text-lg">{proyecto.autor.nombre || 'No especificado'}</p>
                  {proyecto.autor.institucion && (
                    <p className="text-sm text-gray-600 mt-2 flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      {proyecto.autor.institucion}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Colaboradores */}
              {proyecto.colaboradores && proyecto.colaboradores.length > 0 && (
                <Card className="bg-white border-blue-100 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-blue-900 text-lg flex items-center">
                      <Users className="mr-2 h-5 w-5" />
                      Colaboradores
                    </CardTitle>
                    <CardDescription>
                      {proyecto.colaboradores.length} colaborador{proyecto.colaboradores.length !== 1 ? 'es' : ''}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {proyecto.colaboradores.map((colab, index) => {
                        const nombre = getColaboradorNombre(colab)
                        const institucion = getColaboradorInstitucion(colab)
                        const rol = typeof colab === 'object' ? colab.rol : (typeof colab === 'string' && colab.includes(' - ') ? colab.split(' - ')[2] : '')
                        
                        return (
                          <div key={index} className="pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                            <p className="font-medium text-gray-900">{nombre || 'Colaborador'}</p>
                            {institucion && (
                              <p className="text-sm text-gray-600 mt-1">{institucion}</p>
                            )}
                            {rol && (
                              <p className="text-xs text-gray-500 mt-1 italic">{rol}</p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
