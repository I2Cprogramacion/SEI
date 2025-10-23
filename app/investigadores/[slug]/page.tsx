"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter, notFound } from "next/navigation"
import { useAuth } from "@clerk/nextjs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  Building,
  Mail,
  Globe,
  Calendar,
  Award,
  FileText,
  Users,
  ExternalLink,
  Download,
  MapPin,
  Phone,
  CreditCard,
  GraduationCap,
  Briefcase,
  Loader2,
  UserPlus,
  MessageCircle,
  Network,
} from "lucide-react"
import { ConectarInvestigadorDialog } from "@/components/conectar-investigador-dialog"
import { EnviarMensajeDialog } from "@/components/enviar-mensaje-dialog"
import { CvViewer } from "@/components/cv-viewer"

interface InvestigadorData {
  id: number
  clerkUserId?: string
  name: string
  email: string
  curp?: string
  rfc?: string
  noCvu?: string
  telefono?: string
  institution?: string
  area?: string
  areaInvestigacion?: string
  lineaInvestigacion?: string
  fotografiaUrl?: string
  title?: string
  empleoActual?: string
  fechaNacimiento?: string
  nacionalidad?: string
  orcid?: string
  nivel?: string
  location?: string
  domicilio?: string
  cp?: string
  gradoMaximoEstudios?: string
  disciplina?: string
  especialidad?: string
  sni?: string
  anioSni?: number
  experienciaDocente?: string
  experienciaLaboral?: string
  proyectosInvestigacion?: string
  proyectosVinculacion?: string
  libros?: string
  capitulosLibros?: string
  articulos?: string
  premiosDistinciones?: string
  idiomas?: string
  colaboracionInternacional?: string
  colaboracionNacional?: string
  cvUrl?: string
  slug: string
}

interface InvestigadorRelacionado {
  id: number
  name: string
  email: string
  institution?: string
  area?: string
  lineaInvestigacion?: string
  fotografiaUrl?: string
  title?: string
  slug: string
}

interface Publicacion {
  id: number
  titulo: string
  autor: string
  institucion?: string
  revista?: string
  año: number
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
}

export default function InvestigadorPage() {
  const params = useParams()
  const router = useRouter()
  const { userId } = useAuth()
  const slug = params?.slug as string
  const [investigador, setInvestigador] = useState<InvestigadorData | null>(null)
  const [relacionados, setRelacionados] = useState<InvestigadorRelacionado[]>([])
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [conectarDialogOpen, setConectarDialogOpen] = useState(false)
  const [mensajeDialogOpen, setMensajeDialogOpen] = useState(false)

  // Redirigir si es tu propio perfil
  useEffect(() => {
    if (userId && investigador?.clerkUserId && investigador.clerkUserId === userId) {
      router.push('/dashboard')
    }
  }, [userId, investigador, router])

  useEffect(() => {
    if (!slug) return

    const fetchInvestigador = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/investigadores/${slug}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            notFound()
          }
          throw new Error("Error al cargar el investigador")
        }

        const data = await response.json()
        setInvestigador(data)

        // Cargar investigadores relacionados
        try {
          const relacionadosResponse = await fetch(`/api/investigadores/${slug}/relacionados`)
          if (relacionadosResponse.ok) {
            const relacionadosData = await relacionadosResponse.json()
            setRelacionados(relacionadosData)
          }
        } catch (err) {
          console.error("Error loading related investigators:", err)
        }

        // Cargar publicaciones del investigador
        try {
          const publicacionesResponse = await fetch(`/api/investigadores/${slug}/publicaciones`)
          if (publicacionesResponse.ok) {
            const publicacionesData = await publicacionesResponse.json()
            setPublicaciones(publicacionesData)
          }
        } catch (err) {
          console.error("Error loading publications:", err)
        }
      } catch (err) {
        console.error("Error fetching investigador:", err)
        setError(err instanceof Error ? err.message : "Error desconocido")
      } finally {
        setIsLoading(false)
      }
    }

    fetchInvestigador()
  }, [slug])

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-blue-600">Cargando perfil...</p>
        </div>
      </div>
    )
  }

  if (error || !investigador) {
    return notFound()
  }

  const getInitials = () => {
    return investigador.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="space-y-8">
        {/* Header del perfil */}
        <Card className="bg-white border-blue-100">
          <CardContent className="pt-8">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-shrink-0">
                <Avatar className="h-32 w-32 ring-4 ring-blue-100">
                  <AvatarImage src={investigador.fotografiaUrl || "/placeholder-user.jpg"} alt={investigador.name} />
                  <AvatarFallback className="bg-blue-100 text-blue-700 text-2xl">{getInitials()}</AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-grow">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-blue-900 mb-2">{investigador.name}</h1>
                    <p className="text-xl text-blue-600 mb-4">{investigador.title || investigador.gradoMaximoEstudios}</p>
                    <div className="space-y-2">
                      {investigador.institution && (
                        <div className="flex items-center gap-2 text-blue-600">
                          <Building className="h-4 w-4" />
                          <span>{investigador.institution}</span>
                        </div>
                      )}
                      {investigador.location && (
                        <div className="flex items-center gap-2 text-blue-600">
                          <MapPin className="h-4 w-4" />
                          <span>{investigador.location}</span>
                        </div>
                      )}
                      {investigador.email && (
                        <div className="flex items-center gap-2 text-blue-600">
                          <Mail className="h-4 w-4" />
                          <a href={`mailto:${investigador.email}`} className="hover:underline">
                            {investigador.email}
                          </a>
                        </div>
                      )}
                      {investigador.telefono && (
                        <div className="flex items-center gap-2 text-blue-600">
                          <Phone className="h-4 w-4" />
                          <span>{investigador.telefono}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button 
                      className="bg-blue-700 text-white hover:bg-blue-800"
                      onClick={() => window.location.href = `mailto:${investigador.email}?subject=Contacto desde SEI&body=Hola ${investigador.name},%0D%0A%0D%0A`}
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Enviar Email
                    </Button>
                    <Button 
                      variant="outline" 
                      className="border-blue-300 text-blue-700 hover:bg-blue-50"
                      onClick={() => setMensajeDialogOpen(true)}
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Mensaje Interno
                    </Button>
                    <Button 
                      variant="outline" 
                      className="border-green-300 text-green-700 hover:bg-green-50"
                      onClick={() => setConectarDialogOpen(true)}
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Conectar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Curriculum Vitae */}
        {investigador.cvUrl && (
          <CvViewer 
            cvUrl={investigador.cvUrl} 
            investigadorNombre={investigador.name}
          />
        )}

        {/* Información de registro */}
        {(investigador.curp || investigador.rfc || investigador.noCvu) && (
          <Card className="bg-white border-blue-100">
            <CardHeader>
              <CardTitle className="text-blue-900 flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Información de Registro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {investigador.curp && (
                  <div>
                    <p className="text-sm text-blue-600 font-medium">CURP</p>
                    <p className="text-blue-900">{investigador.curp}</p>
                  </div>
                )}
                {investigador.rfc && (
                  <div>
                    <p className="text-sm text-blue-600 font-medium">RFC</p>
                    <p className="text-blue-900">{investigador.rfc}</p>
                  </div>
                )}
                {investigador.noCvu && (
                  <div>
                    <p className="text-sm text-blue-600 font-medium">CVU/PU</p>
                    <p className="text-blue-900">{investigador.noCvu}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-8">
            {/* Línea de investigación */}
            {investigador.lineaInvestigacion && (
              <Card className="bg-white border-blue-100">
                <CardHeader>
                  <CardTitle className="text-blue-900">Línea de Investigación</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-blue-600 leading-relaxed whitespace-pre-wrap">{investigador.lineaInvestigacion}</p>
                </CardContent>
              </Card>
            )}

            {/* Área de investigación */}
            {(investigador.area || investigador.areaInvestigacion) && (
              <Card className="bg-white border-blue-100">
                <CardHeader>
                  <CardTitle className="text-blue-900">Áreas de Especialización</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {investigador.areaInvestigacion && (
                      <Badge className="bg-blue-700 text-white">{investigador.areaInvestigacion}</Badge>
                    )}
                    {investigador.area && (
                      <Badge className="bg-blue-600 text-white">{investigador.area}</Badge>
                    )}
                    {investigador.disciplina && (
                      <Badge className="bg-blue-500 text-white">{investigador.disciplina}</Badge>
                    )}
                    {investigador.especialidad && (
                      <Badge className="bg-blue-400 text-white">{investigador.especialidad}</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Experiencia laboral */}
            {investigador.experienciaLaboral && (
              <Card className="bg-white border-blue-100">
                <CardHeader>
                  <CardTitle className="text-blue-900 flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Experiencia Laboral
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-blue-600 leading-relaxed whitespace-pre-wrap">{investigador.experienciaLaboral}</p>
                </CardContent>
              </Card>
            )}

            {/* Proyectos de investigación */}
            {investigador.proyectosInvestigacion && (
              <Card className="bg-white border-blue-100">
                <CardHeader>
                  <CardTitle className="text-blue-900 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Proyectos de Investigación
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-blue-600 leading-relaxed whitespace-pre-wrap">{investigador.proyectosInvestigacion}</p>
                </CardContent>
              </Card>
            )}

            {/* Publicaciones */}
            {(publicaciones.length > 0 || investigador.articulos || investigador.libros || investigador.capitulosLibros) && (
              <Card className="bg-white border-blue-100">
                <CardHeader>
                  <CardTitle className="text-blue-900 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Publicaciones
                  </CardTitle>
                  {publicaciones.length > 0 && (
                    <CardDescription className="text-blue-600">
                      {publicaciones.length} publicacion{publicaciones.length !== 1 ? 'es' : ''} registrada{publicaciones.length !== 1 ? 's' : ''}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Publicaciones de la base de datos */}
                  {publicaciones.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        Publicaciones Registradas
                      </h4>
                      <div className="space-y-3">
                        {publicaciones.slice(0, 5).map((pub) => (
                          <div
                            key={pub.id}
                            className="p-4 bg-blue-50 border border-blue-100 rounded-lg hover:shadow-md transition-shadow"
                          >
                            <h5 className="font-semibold text-blue-900 mb-2 line-clamp-2">
                              {pub.titulo}
                            </h5>
                            <div className="text-sm text-blue-600 space-y-1">
                              {pub.revista && (
                                <p className="flex items-center gap-1">
                                  <FileText className="h-3 w-3" />
                                  {pub.revista} {pub.año && `(${pub.año})`}
                                </p>
                              )}
                              {pub.doi && (
                                <p className="flex items-center gap-1 text-blue-500">
                                  <ExternalLink className="h-3 w-3" />
                                  DOI: {pub.doi}
                                </p>
                              )}
                              {pub.categoria && (
                                <Badge className="mt-2 bg-blue-600 text-white text-xs">
                                  {pub.categoria}
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      {publicaciones.length > 5 && (
                        <p className="text-sm text-blue-500 text-center pt-2">
                          + {publicaciones.length - 5} publicaciones más
                        </p>
                      )}
                    </div>
                  )}

                  {/* Publicaciones del perfil (texto) */}
                  {investigador.articulos && (
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-2">Artículos</h4>
                      <p className="text-blue-600 whitespace-pre-wrap">{investigador.articulos}</p>
                    </div>
                  )}
                  {investigador.libros && (
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-2">Libros</h4>
                      <p className="text-blue-600 whitespace-pre-wrap">{investigador.libros}</p>
                    </div>
                  )}
                  {investigador.capitulosLibros && (
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-2">Capítulos de Libros</h4>
                      <p className="text-blue-600 whitespace-pre-wrap">{investigador.capitulosLibros}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Columna lateral */}
          <div className="space-y-8">
            {/* Formación académica */}
            <Card className="bg-white border-blue-100">
              <CardHeader>
                <CardTitle className="text-blue-900 flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Formación Académica
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {investigador.gradoMaximoEstudios && (
                    <div>
                      <p className="text-sm text-blue-600 font-medium">Grado Máximo</p>
                      <p className="text-blue-900">{investigador.gradoMaximoEstudios}</p>
                    </div>
                  )}
                  {investigador.title && (
                    <div>
                      <p className="text-sm text-blue-600 font-medium">Último Grado de Estudios</p>
                      <p className="text-blue-900">{investigador.title}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Empleo actual */}
            {investigador.empleoActual && (
              <Card className="bg-white border-blue-100">
                <CardHeader>
                  <CardTitle className="text-blue-900 flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Empleo Actual
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-blue-600">{investigador.empleoActual}</p>
                </CardContent>
              </Card>
            )}

            {/* SNI */}
            {investigador.sni && (
              <Card className="bg-white border-blue-100">
                <CardHeader>
                  <CardTitle className="text-blue-900 flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Sistema Nacional de Investigadores
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-blue-900 font-semibold">{investigador.sni}</p>
                  {investigador.anioSni && (
                    <p className="text-sm text-blue-600">Año: {investigador.anioSni}</p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Reconocimientos */}
            {investigador.premiosDistinciones && (
              <Card className="bg-white border-blue-100">
                <CardHeader>
                  <CardTitle className="text-blue-900">Reconocimientos</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-blue-600 whitespace-pre-wrap">{investigador.premiosDistinciones}</p>
                </CardContent>
              </Card>
            )}

            {/* Idiomas */}
            {investigador.idiomas && (
              <Card className="bg-white border-blue-100">
                <CardHeader>
                  <CardTitle className="text-blue-900">Idiomas</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-blue-600">{investigador.idiomas}</p>
                </CardContent>
              </Card>
            )}

            {/* Colaboración */}
            {(investigador.colaboracionInternacional || investigador.colaboracionNacional) && (
              <Card className="bg-white border-blue-100">
                <CardHeader>
                  <CardTitle className="text-blue-900 flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Colaboración
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {investigador.colaboracionInternacional && (
                    <div>
                      <p className="text-sm text-blue-600 font-medium">Internacional</p>
                      <p className="text-blue-900 text-sm">{investigador.colaboracionInternacional}</p>
                    </div>
                  )}
                  {investigador.colaboracionNacional && (
                    <div>
                      <p className="text-sm text-blue-600 font-medium">Nacional</p>
                      <p className="text-blue-900 text-sm">{investigador.colaboracionNacional}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Investigadores Relacionados */}
        {relacionados.length > 0 && (
          <Card className="bg-white border-blue-100">
            <CardHeader>
              <CardTitle className="text-blue-900 flex items-center gap-2">
                <Network className="h-5 w-5" />
                Investigadores Relacionados
              </CardTitle>
              <CardDescription className="text-blue-600">
                Otros investigadores con intereses similares
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {relacionados.map((rel) => (
                  <Link
                    key={rel.id}
                    href={`/investigadores/${rel.slug}`}
                    className="block group"
                  >
                    <Card className="bg-blue-50 border-blue-200 hover:border-blue-400 hover:shadow-lg transition-all">
                      <CardContent className="pt-6">
                        <div className="flex flex-col items-center text-center space-y-3">
                          <Avatar className="h-20 w-20 ring-2 ring-blue-200 group-hover:ring-blue-400 transition-all">
                            <AvatarImage src={rel.fotografiaUrl || "/placeholder-user.jpg"} alt={rel.name} />
                            <AvatarFallback className="bg-blue-100 text-blue-700">
                              {rel.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-grow">
                            <h3 className="font-semibold text-blue-900 group-hover:text-blue-700 transition-colors line-clamp-2">
                              {rel.name}
                            </h3>
                            {rel.title && (
                              <p className="text-sm text-blue-600 mt-1 line-clamp-1">{rel.title}</p>
                            )}
                            {rel.institution && (
                              <p className="text-xs text-blue-500 mt-1 line-clamp-1 flex items-center justify-center gap-1">
                                <Building className="h-3 w-3" />
                                {rel.institution}
                              </p>
                            )}
                            {rel.area && (
                              <Badge className="mt-2 bg-blue-600 text-white text-xs">
                                {rel.area}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Diálogos */}
      {investigador && (
        <>
          <ConectarInvestigadorDialog
            open={conectarDialogOpen}
            onOpenChange={setConectarDialogOpen}
            investigadorId={investigador.id}
            investigadorClerkId={investigador.clerkUserId || ''}
            investigadorNombre={investigador.name}
          />
          <EnviarMensajeDialog
            open={mensajeDialogOpen}
            onOpenChange={setMensajeDialogOpen}
            investigadorId={investigador.id}
            investigadorClerkId={investigador.clerkUserId || ''}
            investigadorNombre={investigador.name}
            investigadorEmail={investigador.email}
          />
        </>
      )}
    </div>
  )
}
