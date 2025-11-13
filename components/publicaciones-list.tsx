"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Plus, Calendar, ExternalLink, BookOpen, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface Publicacion {
  id: number
  titulo: string
  autor: string
  institucion?: string
  revista?: string
  año?: number
  volumen?: string
  numero?: string
  paginas?: string
  doi?: string
  resumen?: string
  palabrasClave?: string[]
  categoria?: string
  tipo?: string
  acceso?: string
  archivoUrl?: string
  fechaCreacion?: string
}

interface PublicacionesListProps {
  slug?: string // Para perfil público
  isOwner?: boolean // Si es el dueño del perfil (para mostrar botón de agregar)
  showAddButton?: boolean // Mostrar botón de agregar
}

export function PublicacionesList({ slug, isOwner = false, showAddButton = true }: PublicacionesListProps) {
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Esperar a que Clerk cargue el usuario
    if (!isLoaded) return

    async function fetchPublicaciones() {
      try {
        setLoading(true)
        setError(null)
        
        let url: string
        
        if (slug) {
          // Perfil público: usar endpoint de investigadores
          url = `/api/investigadores/${slug}/publicaciones`
        } else if (user?.id) {
          // Dashboard propio: usar endpoint con clerk_user_id
          url = `/api/publicaciones?clerk_user_id=${user.id}`
        } else {
          // Sin slug ni usuario: no cargar nada
          setPublicaciones([])
          setLoading(false)
          return
        }
        
        const response = await fetch(url)
        
        if (!response.ok) {
          throw new Error('Error al cargar publicaciones')
        }
        
        const data = await response.json()
        setPublicaciones(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error('Error fetching publicaciones:', err)
        setError('Error al cargar las publicaciones')
      } finally {
        setLoading(false)
      }
    }

    fetchPublicaciones()
  }, [slug, user?.id, isLoaded])

  if (loading) {
    return (
      <Card className="bg-white border-blue-100 shadow-md">
        <CardHeader>
          <CardTitle className="text-blue-900 flex items-center text-lg md:text-xl">
            <FileText className="mr-2 h-4 w-4 md:h-5 md:w-5" />
            Publicaciones
          </CardTitle>
          <CardDescription className="text-blue-600 text-sm">
            Producción científica del investigador
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="ml-2 text-blue-600">Cargando publicaciones...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-white border-blue-100 shadow-md">
        <CardHeader>
          <CardTitle className="text-blue-900 flex items-center text-lg md:text-xl">
            <FileText className="mr-2 h-4 w-4 md:h-5 md:w-5" />
            Publicaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-600">
            {error}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white border-blue-100 shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-blue-900 flex items-center text-lg md:text-xl">
              <FileText className="mr-2 h-4 w-4 md:h-5 md:w-5" />
              Publicaciones
            </CardTitle>
            <CardDescription className="text-blue-600 text-sm">
              {publicaciones.length > 0 
                ? `${publicaciones.length} publicación${publicaciones.length !== 1 ? 'es' : ''} registrada${publicaciones.length !== 1 ? 's' : ''}`
                : 'Producción científica del investigador'
              }
            </CardDescription>
          </div>
          {isOwner && showAddButton && (
            <Button
              onClick={() => router.push('/publicaciones/nueva')}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800"
              size="sm"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nueva Publicación
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {publicaciones.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-blue-300 mx-auto mb-3" />
            <p className="text-blue-700 font-medium mb-2">No hay publicaciones registradas</p>
            {isOwner && (
              <>
                <p className="text-sm text-blue-600 mb-4">
                  Comienza a compartir tu producción científica con la comunidad.
                </p>
                <Button
                  onClick={() => router.push('/publicaciones/nueva')}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Primera Publicación
                </Button>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {publicaciones.map((pub) => (
              <div 
                key={pub.id} 
                className="border border-blue-100 rounded-lg p-4 hover:shadow-md transition-shadow bg-blue-50/30"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-semibold text-blue-900 flex-1">
                    {pub.titulo}
                  </h3>
                  {pub.acceso && (
                    <Badge 
                      variant={pub.acceso.toLowerCase() === 'abierto' ? 'default' : 'secondary'}
                      className="shrink-0"
                    >
                      {pub.acceso}
                    </Badge>
                  )}
                </div>

                {pub.autor && (
                  <p className="text-sm text-blue-700 mb-2">
                    <span className="font-medium">Autores:</span> {pub.autor}
                  </p>
                )}

                <div className="flex flex-wrap gap-3 text-sm text-blue-600 mb-3">
                  {pub.revista && (
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-3.5 w-3.5" />
                      {pub.revista}
                    </span>
                  )}
                  {pub.año && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {pub.año}
                    </span>
                  )}
                  {pub.volumen && (
                    <span>Vol. {pub.volumen}</span>
                  )}
                  {pub.numero && (
                    <span>Núm. {pub.numero}</span>
                  )}
                  {pub.paginas && (
                    <span>pp. {pub.paginas}</span>
                  )}
                </div>

                {pub.resumen && (
                  <p className="text-sm text-blue-700 mb-3 line-clamp-2">
                    {pub.resumen}
                  </p>
                )}

                {pub.palabrasClave && pub.palabrasClave.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {pub.palabrasClave.slice(0, 5).map((palabra, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {palabra}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {pub.doi && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => window.open(`https://doi.org/${pub.doi}`, '_blank')}
                    >
                      <ExternalLink className="mr-1 h-3 w-3" />
                      DOI
                    </Button>
                  )}
                  {pub.archivoUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => window.open(pub.archivoUrl, '_blank')}
                    >
                      <FileText className="mr-1 h-3 w-3" />
                      Ver PDF
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
