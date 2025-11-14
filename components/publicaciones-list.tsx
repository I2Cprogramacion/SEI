"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/ui/empty-state"
import { LoadingCard } from "@/components/ui/loading-card"
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
        
        // El endpoint /api/publicaciones devuelve { publicaciones, filtros }
        // El endpoint /api/investigadores/[slug]/publicaciones devuelve array directo
        if (slug) {
          const pubs = Array.isArray(data) ? data : []
          console.log('🔵 [CLIENT - Perfil Público] Publicaciones recibidas:', pubs.length)
          console.log('🔵 [CLIENT - Perfil Público] IDs:', pubs.map((p: any) => p.id).join(', '))
          console.log('🔵 [CLIENT - Perfil Público] Detalle primera pub:', pubs[0])
          setPublicaciones(pubs)
        } else {
          const pubs = Array.isArray(data.publicaciones) ? data.publicaciones : []
          console.log('🟢 [CLIENT - Dashboard] Publicaciones recibidas:', pubs.length)
          console.log('🟢 [CLIENT - Dashboard] IDs:', pubs.map((p: any) => p.id).join(', '))
          console.log('🟢 [CLIENT - Dashboard] Detalle primera pub:', pubs[0])
          setPublicaciones(pubs)
        }
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
        <CardContent className="space-y-4">
          <LoadingCard variant="list" />
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
          <EmptyState
            icon={FileText}
            title="No hay publicaciones registradas"
            description={isOwner 
              ? "Comienza a compartir tu producción científica con la comunidad." 
              : "Este investigador aún no ha registrado publicaciones."}
            action={isOwner ? {
              label: "Agregar Primera Publicación",
              onClick: () => router.push('/publicaciones/nueva')
            } : undefined}
          />
        ) : (
          <div className="space-y-4">
            {publicaciones.map((pub) => (
              <div 
                key={pub.id} 
                className="group border border-blue-100 rounded-xl p-5 hover:shadow-lg hover:border-blue-200 transition-all duration-300 bg-gradient-to-br from-white to-blue-50/30 relative overflow-hidden"
              >
                {/* Decorative gradient */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/50 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="font-bold text-blue-900 flex-1 text-lg group-hover:text-blue-700 transition-colors">
                      {pub.titulo}
                    </h3>
                    {pub.acceso && (
                      <Badge 
                        variant={pub.acceso.toLowerCase() === 'abierto' ? 'default' : 'secondary'}
                        className="shrink-0 shadow-sm"
                      >
                        {pub.acceso}
                      </Badge>
                    )}
                  </div>

                  {pub.autor && (
                    <p className="text-sm text-blue-700 mb-3 font-medium">
                      <span className="text-blue-500">Autores:</span> {pub.autor}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm text-blue-600 mb-3">
                    {pub.revista && (
                      <span className="flex items-center gap-1.5 bg-blue-50 px-2 py-1 rounded-md">
                        <BookOpen className="h-3.5 w-3.5" />
                        {pub.revista}
                      </span>
                    )}
                    {pub.año && (
                      <span className="flex items-center gap-1.5 bg-blue-50 px-2 py-1 rounded-md">
                        <Calendar className="h-3.5 w-3.5" />
                        {pub.año}
                      </span>
                    )}
                    {pub.volumen && (
                      <span className="bg-blue-50 px-2 py-1 rounded-md">Vol. {pub.volumen}</span>
                    )}
                    {pub.numero && (
                      <span className="bg-blue-50 px-2 py-1 rounded-md">Núm. {pub.numero}</span>
                    )}
                    {pub.paginas && (
                      <span className="bg-blue-50 px-2 py-1 rounded-md">pp. {pub.paginas}</span>
                    )}
                  </div>

                  {pub.resumen && (
                    <p className="text-sm text-blue-700 mb-3 line-clamp-2 leading-relaxed">
                      {pub.resumen}
                    </p>
                  )}

                  {pub.palabrasClave && pub.palabrasClave.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {pub.palabrasClave.slice(0, 5).map((palabra, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs bg-white">
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
                        className="text-xs hover:bg-blue-50 hover:border-blue-300"
                        onClick={() => window.open(`https://doi.org/${pub.doi}`, '_blank')}
                      >
                        <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                        Ver DOI
                      </Button>
                    )}
                    {pub.archivoUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs hover:bg-blue-50 hover:border-blue-300"
                        onClick={() => window.open(pub.archivoUrl, '_blank')}
                      >
                        <FileText className="mr-1.5 h-3.5 w-3.5" />
                        Ver PDF
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
