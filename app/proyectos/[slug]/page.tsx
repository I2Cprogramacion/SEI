"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays, Share2, Link2, DollarSign, Building2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useParams } from "next/navigation"

interface Proyecto {
  id: number
  titulo: string
  descripcion: string
  autor: {
    nombre: string
    institucion: string
  }
  categoria: string
  estado: string
  fechaInicio: string
  fechaFin: string | null
  presupuesto: number | null
  financiamiento: string | null
  slug: string
}

export default function ProjectPage() {
  const params = useParams()
  const slug = params.slug as string
  const [proyecto, setProyecto] = useState<Proyecto | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchProyecto = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/proyectos`)
        const data = await response.json()
        
        if (data.proyectos && data.proyectos.length > 0) {
          const found = data.proyectos.find((p: Proyecto) => 
            p.slug === slug || 
            p.titulo?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') === slug
          )
          setProyecto(found || null)
        }
      } catch (error) {
        console.error("Error fetching proyecto:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProyecto()
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-blue-700">Cargando proyecto...</div>
      </div>
    )
  }

  if (!proyecto) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-blue-900 mb-4">Proyecto no encontrado</h2>
          <p className="text-gray-600 mb-6">El proyecto que buscas no existe o ha sido eliminado.</p>
          <Button onClick={() => window.history.back()} className="bg-blue-700 hover:bg-blue-800">
            Volver atrás
          </Button>
        </div>
      </div>
    )
  }

  const formatFecha = (fecha: string | null) => {
    if (!fecha) return 'Presente'
    const date = new Date(fecha)
    return date.toLocaleDateString('es-MX', { year: 'numeric', month: 'long' })
  }

  const formatPresupuesto = (presupuesto: number | null) => {
    if (!presupuesto) return 'No especificado'
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(presupuesto)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="space-y-8">
        {/* Encabezado del proyecto */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {proyecto.categoria && (
              <Badge className="bg-blue-700 text-white">{proyecto.categoria}</Badge>
            )}
            {proyecto.estado && (
              <Badge variant="outline" className="border-blue-200 text-blue-700">
                {proyecto.estado}
              </Badge>
            )}
          </div>

          <h1 className="text-3xl font-bold md:text-4xl text-blue-900">{proyecto.titulo}</h1>

          <div className="flex flex-wrap gap-4 text-sm text-blue-600">
            <div className="flex items-center">
              <CalendarDays className="mr-1 h-4 w-4" />
              <span>
                {formatFecha(proyecto.fechaInicio)} - {formatFecha(proyecto.fechaFin)}
              </span>
            </div>
            {proyecto.autor.nombre && (
              <div className="flex items-center">
                <Building2 className="mr-1 h-4 w-4" />
                <span>{proyecto.autor.nombre}</span>
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-4">
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
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Contenido principal */}
          <div className="md:col-span-2 space-y-6">
            <Card className="bg-white border-blue-100">
              <CardHeader>
                <CardTitle className="text-blue-900">Descripción del proyecto</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {proyecto.descripcion || 'No hay descripción disponible.'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar con información adicional */}
          <div className="space-y-6">
            {/* Información del proyecto */}
            <Card className="bg-white border-blue-100">
              <CardHeader>
                <CardTitle className="text-blue-900">Información del Proyecto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {proyecto.autor.institucion && (
                  <div>
                    <h4 className="font-semibold text-sm text-gray-500 mb-1">Institución</h4>
                    <p className="text-gray-900">{proyecto.autor.institucion}</p>
                  </div>
                )}
                
                {proyecto.financiamiento && (
                  <div>
                    <h4 className="font-semibold text-sm text-gray-500 mb-1">Fuente de Financiamiento</h4>
                    <p className="text-gray-900">{proyecto.financiamiento}</p>
                  </div>
                )}
                
                {proyecto.presupuesto && (
                  <div>
                    <h4 className="font-semibold text-sm text-gray-500 mb-1">Presupuesto</h4>
                    <div className="flex items-center text-gray-900">
                      <DollarSign className="h-4 w-4 mr-1" />
                      {formatPresupuesto(proyecto.presupuesto)}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold text-sm text-gray-500 mb-1">Duración</h4>
                  <p className="text-gray-900">
                    {formatFecha(proyecto.fechaInicio)} - {formatFecha(proyecto.fechaFin)}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-gray-500 mb-1">Estado</h4>
                  <Badge variant="outline" className="border-blue-200 text-blue-700">
                    {proyecto.estado || 'No especificado'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Investigador Principal */}
            <Card className="bg-white border-blue-100">
              <CardHeader>
                <CardTitle className="text-blue-900">Investigador Principal</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium text-gray-900">{proyecto.autor.nombre}</p>
                {proyecto.autor.institucion && (
                  <p className="text-sm text-gray-600 mt-1">{proyecto.autor.institucion}</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
