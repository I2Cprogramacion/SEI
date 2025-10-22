"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { 
  TrendingUp, 
  Users, 
  FileText, 
  Award, 
  Building2, 
  ArrowLeft, 
  Loader2,
  Calendar,
  MapPin,
  ExternalLink
} from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"

interface Investigador {
  id: number
  nombre: string
  email: string
  institucion: string
  linea_investigacion?: string
  fotografia_url?: string
  ultimo_grado_estudios?: string
  slug: string
}

interface CampoDetalle {
  nombre: string
  descripcion: string
  investigadores: number
  proyectos: number
  publicaciones: number
  instituciones: number
  crecimiento: number
  tendencia: "up" | "down" | "stable"
  subcampos: string[]
  color: string
  slug: string
  instituciones_lista?: string
  investigadores_lista: Investigador[]
}

export default function CampoPage() {
  const params = useParams()
  const slug = params.slug as string
  
  const [campo, setCampo] = useState<CampoDetalle | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCampo = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/campos/${slug}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Campo de investigación no encontrado')
          }
          throw new Error('Error al cargar el campo de investigación')
        }
        
        const data = await response.json()
        setCampo(data)
      } catch (err) {
        console.error('Error fetching campo:', err)
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchCampo()
    }
  }, [slug])

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-4" />
            <p className="text-blue-600">Cargando campo de investigación...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-red-600 mb-4">{error}</p>
          <div className="space-x-4">
            <Button asChild>
              <Link href="/campos">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a Campos
              </Link>
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Reintentar
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!campo) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-600 mb-4">Campo no encontrado</h1>
          <p className="text-gray-600 mb-4">El campo de investigación solicitado no existe.</p>
          <Button asChild>
            <Link href="/campos">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Campos
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="space-y-6">
        {/* Header con navegación */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" asChild>
            <Link href="/campos">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Campos
            </Link>
          </Button>
          <div className="h-6 w-px bg-gray-300" />
          <div>
            <h1 className="text-3xl font-bold text-blue-900">{campo.nombre}</h1>
            <p className="text-blue-600">Campo de investigación</p>
          </div>
        </div>

        {/* Estadísticas principales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white border-blue-100 text-center">
            <CardContent className="pt-6">
              <Users className="h-8 w-8 mx-auto text-blue-600 mb-2" />
              <div className="text-2xl font-bold text-blue-900">{campo.investigadores}</div>
              <p className="text-sm text-blue-600">Investigadores</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-blue-100 text-center">
            <CardContent className="pt-6">
              <FileText className="h-8 w-8 mx-auto text-blue-600 mb-2" />
              <div className="text-2xl font-bold text-blue-900">{campo.proyectos}</div>
              <p className="text-sm text-blue-600">Proyectos</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-blue-100 text-center">
            <CardContent className="pt-6">
              <Award className="h-8 w-8 mx-auto text-blue-600 mb-2" />
              <div className="text-2xl font-bold text-blue-900">{campo.publicaciones}</div>
              <p className="text-sm text-blue-600">Publicaciones</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-blue-100 text-center">
            <CardContent className="pt-6">
              <Building2 className="h-8 w-8 mx-auto text-blue-600 mb-2" />
              <div className="text-2xl font-bold text-blue-900">{campo.instituciones}</div>
              <p className="text-sm text-blue-600">Instituciones</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información del campo */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white border-blue-100">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={campo.color}>{campo.nombre}</Badge>
                  <div className="flex items-center gap-1">
                    <TrendingUp
                      className={`h-4 w-4 ${campo.tendencia === "up" ? "text-green-500" : "text-blue-500"}`}
                    />
                    <span className="text-xs text-blue-600">{campo.crecimiento}% actividad</span>
                  </div>
                </div>
                <CardTitle className="text-xl text-blue-900">{campo.nombre}</CardTitle>
                <CardDescription className="text-blue-600">{campo.descripcion}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Barra de progreso de actividad */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-600">Nivel de actividad</span>
                      <span className="text-blue-900 font-medium">{campo.crecimiento}%</span>
                    </div>
                    <Progress value={campo.crecimiento} className="h-2" />
                  </div>

                  {/* Subcampos */}
                  {campo.subcampos.length > 0 && (
                    <div>
                      <h4 className="font-medium text-blue-900 mb-2 text-sm">Especialidades:</h4>
                      <div className="flex flex-wrap gap-1">
                        {campo.subcampos.map((subcampo, index) => (
                          <Badge key={index} variant="outline" className="border-blue-200 text-blue-700 text-xs">
                            {subcampo}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Instituciones */}
                  {campo.instituciones_lista && (
                    <div>
                      <h4 className="font-medium text-blue-900 mb-2 text-sm">Instituciones participantes:</h4>
                      <p className="text-sm text-blue-600">{campo.instituciones_lista}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Lista de investigadores */}
            <Card className="bg-white border-blue-100">
              <CardHeader>
                <CardTitle className="text-blue-900">Investigadores en este campo</CardTitle>
                <CardDescription className="text-blue-700">
                  {campo.investigadores} investigadores especializados en {campo.nombre}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {campo.investigadores_lista.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-blue-400 mb-4" />
                    <p className="text-blue-600">No hay investigadores registrados en este campo</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {campo.investigadores_lista.slice(0, 6).map((investigador) => (
                      <Link 
                        href={`/investigadores/${investigador.slug}`} 
                        key={investigador.id}
                        className="block"
                      >
                        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors">
                          <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-blue-900 text-sm truncate">{investigador.nombre}</h4>
                            <p className="text-xs text-blue-600 truncate">{investigador.institucion}</p>
                            {investigador.linea_investigacion && (
                              <p className="text-xs text-blue-500 truncate">{investigador.linea_investigacion}</p>
                            )}
                          </div>
                          <ExternalLink className="h-4 w-4 text-blue-400" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
                
                {campo.investigadores_lista.length > 6 && (
                  <div className="mt-4 text-center">
                    <Button variant="outline" asChild>
                      <Link href={`/investigadores?area=${encodeURIComponent(campo.nombre)}`}>
                        Ver todos los investigadores ({campo.investigadores})
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar con información adicional */}
          <div className="space-y-6">
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900 text-lg">Estadísticas del Campo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-blue-600">Investigadores activos</span>
                  <span className="font-medium text-blue-900">{campo.investigadores}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-600">Proyectos en curso</span>
                  <span className="font-medium text-blue-900">{campo.proyectos}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-600">Publicaciones</span>
                  <span className="font-medium text-blue-900">{campo.publicaciones}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-600">Instituciones</span>
                  <span className="font-medium text-blue-900">{campo.instituciones}</span>
                </div>
                <div className="pt-2 border-t border-blue-200">
                  <div className="flex justify-between">
                    <span className="text-blue-600">Nivel de actividad</span>
                    <span className="font-medium text-blue-900">{campo.crecimiento}%</span>
                  </div>
                  <Progress value={campo.crecimiento} className="h-2 mt-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-blue-100">
              <CardHeader>
                <CardTitle className="text-blue-900 text-lg">Acciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full">
                  <Link href={`/investigadores?area=${encodeURIComponent(campo.nombre)}`}>
                    <Users className="h-4 w-4 mr-2" />
                    Ver Investigadores
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link href={`/proyectos?area=${encodeURIComponent(campo.nombre)}`}>
                    <FileText className="h-4 w-4 mr-2" />
                    Ver Proyectos
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link href={`/publicaciones?area=${encodeURIComponent(campo.nombre)}`}>
                    <Award className="h-4 w-4 mr-2" />
                    Ver Publicaciones
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
