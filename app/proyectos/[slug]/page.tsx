"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDays, Link2, Share2, Users, ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"

export default function ProyectoPage() {
  const params = useParams()
  const slug = params.slug as string
  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProyecto = async () => {
      try {
        setLoading(true)
        // Buscar en proyectos
        const response = await fetch('/api/proyectos')
        if (response.ok) {
          const data = await response.json()
          const proyectos = data.proyectos || []
          
          // Buscar el proyecto por slug
          const proyectoEncontrado = proyectos.find((p: any) => p.slug === slug)
          if (proyectoEncontrado) {
            setProject(proyectoEncontrado)
            setLoading(false)
            return
          }
        }

        // Si no se encuentra, mostrar mensaje de no encontrado
        setProject(null)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching proyecto:", error)
        setProject(null)
        setLoading(false)
      }
    }

    fetchProyecto()
  }, [slug])

  const { toast } = useToast()

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: project?.title,
          text: `Mira este proyecto de investigación: ${project?.title}`,
          url: window.location.href,
        })
      } else {
        // Fallback para navegadores que no soportan Web Share API
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
      <div className="container mx-auto py-8 px-4">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
          <p className="text-blue-600">Cargando proyecto...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-blue-900 mb-4">Proyecto no encontrado</h1>
          <p className="text-blue-600 mb-6">El proyecto que buscas no existe o ha sido eliminado.</p>
          <Button asChild>
            <Link href="/proyectos">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a proyectos
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="space-y-8">
        {/* Botón de regreso */}
        <Button variant="ghost" asChild>
          <Link href="/proyectos">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a proyectos
          </Link>
        </Button>

        {/* Header del proyecto */}
        <Card className="bg-white border-blue-100">
          <CardContent className="pt-8">
            <div className="space-y-6">
              {/* Título y estado */}
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-blue-900 mb-2">{project.titulo}</h1>
                  <p className="text-blue-600 text-lg">{project.descripcion || project.resumen}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <Badge 
                    className={`${
                      project.estado === "Activo" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {project.estado || "En desarrollo"}
                  </Badge>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleShare}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Compartir
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleCopyLink}>
                      <Link2 className="h-4 w-4 mr-2" />
                      Copiar enlace
                    </Button>
                  </div>
                </div>
              </div>

              {/* Información del proyecto */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-blue-600">Fecha de publicación</p>
                    <p className="font-medium text-blue-900">
                      {project.fechaPublicacion ? 
                        new Date(project.fechaPublicacion).toLocaleDateString('es-ES') : 
                        'No especificada'
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-blue-600">Investigador</p>
                    <p className="font-medium text-blue-900">
                      {project.autor?.nombreCompleto || 'No especificado'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-blue-200 text-blue-700">
                    {project.categoria || 'Investigación'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información del investigador */}
        {project.autor && (
          <Card className="bg-white border-blue-100">
            <CardHeader>
              <CardTitle className="text-blue-900">Investigador Principal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-blue-100 text-blue-700 text-lg">
                    {project.autor.nombreCompleto
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-900">{project.autor.nombreCompleto}</h3>
                  <p className="text-blue-600">{project.autor.instituto || 'Institución no especificada'}</p>
                  <p className="text-sm text-blue-500">{project.autor.estado || 'Chihuahua, México'}</p>
                </div>
                <Button variant="outline" asChild>
                  <Link href={`/investigadores/${project.autor.nombreCompleto?.toLowerCase()
                    .replace(/[^a-z0-9\s]/g, '')
                    .replace(/\s+/g, '-')
                    .trim() || 'investigador'}`}>
                    Ver perfil
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Información adicional */}
        <Card className="bg-white border-blue-100">
          <CardHeader>
            <CardTitle className="text-blue-900">Información del Proyecto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-blue-900 mb-2">Institución</h4>
                <p className="text-blue-600">{project.autor?.instituto || 'No especificada'}</p>
              </div>
              
              {project.fechaInicio && (
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">Fecha de inicio</h4>
                  <p className="text-blue-600">
                    {new Date(project.fechaInicio).toLocaleDateString('es-ES')}
                  </p>
                </div>
              )}

              {project.fechaFin && (
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">Fecha de finalización</h4>
                  <p className="text-blue-600">
                    {new Date(project.fechaFin).toLocaleDateString('es-ES')}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}