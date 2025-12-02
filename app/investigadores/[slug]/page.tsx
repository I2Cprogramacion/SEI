"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter, notFound } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import {
  Building,
  Mail,
  Calendar,
  FileText,
  Users,
  ExternalLink,
  Download,
  MapPin,
  Phone,
  GraduationCap,
  Briefcase,
  Loader2,
  UserPlus,
  MessageCircle,
  BookOpen,
  User as UserIcon,
  ChevronDown,
} from "lucide-react"
import { ConectarInvestigadorDialog } from "@/components/conectar-investigador-dialog"
import { EnviarMensajeDialog } from "@/components/enviar-mensaje-dialog"
import { PublicacionesList } from "@/components/publicaciones-list"
import ErrorBoundary from '@/components/error-boundary'

interface InvestigadorData {
  id: string
  clerkUserId?: string
  name: string
  email: string
  curp?: string
  rfc?: string
  noCvu?: string
  telefono?: string
  institution?: string
  departamento?: string
  area?: string
  areaInvestigacion?: string
  lineaInvestigacion?: string | string[]
  fotografiaUrl?: string
  title?: string
  empleoActual?: string
  fechaNacimiento?: string
  nacionalidad?: string
  municipio?: string
  entidadFederativa?: string
  gradoMaximoEstudios?: string
  nivelInvestigador?: string
  nivelSni?: string
  tipoPerfil?: string
  nivelTecnologo?: string
  disciplina?: string
  especialidad?: string
  orcid?: string
  sni?: string
  anioSni?: number
  sitioWeb?: string
  cvUrl?: string
  dictamenUrl?: string
  sniUrl?: string
  slug: string
}

interface Publicacion {
  id: number
  titulo: string
  año?: number
  revista?: string
  institucion?: string
  doi?: string
  archivoUrl?: string
}

export default function InvestigadorPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const userId = user?.id
  const slug = params?.slug as string
  const [investigador, setInvestigador] = useState<InvestigadorData | null>(null)
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [redirecting, setRedirecting] = useState(false)
  const [conectarDialogOpen, setConectarDialogOpen] = useState(false)
  const [mensajeDialogOpen, setMensajeDialogOpen] = useState(false)
  const [tipoDocumento, setTipoDocumento] = useState<'PU' | 'Dictamen' | 'SNI'>('PU')
  const [estanConectados, setEstanConectados] = useState(false)
  const [solicitudPendiente, setSolicitudPendiente] = useState(false)
  const [cargandoConexion, setCargandoConexion] = useState(true)

  useEffect(() => {
    if (!slug) return

    const fetchInvestigador = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/investigadores/${slug}`)

        if (!response.ok) {
          if (response.status === 404) {
            notFound()
            return
          }
          let errMsg = 'Error al cargar el investigador'
          try {
            const errJson = await response.json()
            if (errJson?.error) errMsg = String(errJson.error)
          } catch (e) {
            // ignore parse errors
          }
          throw new Error(errMsg)
        }

        const rawData = await response.json()
        const perfilData = rawData.perfil ? rawData.perfil : rawData

        // 🔒 VALIDACIÓN: Redirigir si el usuario intenta ver su propio perfil
        // Comparamos por CORREO en lugar de clerk_user_id (más confiable)
        const userEmail = user?.emailAddresses?.[0]?.emailAddress?.toLowerCase()
        const perfilEmail = perfilData.correo?.toLowerCase()
        
        console.log('=== 🔍 DIAGNÓSTICO DE REDIRECCIÓN ===')
        console.log('Clerk isLoaded:', isLoaded)
        console.log('Email del usuario actual:', userEmail)
        console.log('Email del perfil:', perfilEmail)
        console.log('¿Son iguales?', userEmail === perfilEmail)
        
        if (userEmail && perfilEmail && userEmail === perfilEmail) {
          console.log('✅ Condición cumplida - Es tu propio perfil - Redirigiendo al dashboard')
          setRedirecting(true)
          router.push('/dashboard')
          return
        } else {
          console.log('❌ Condición NO cumplida - Mostrando perfil público')
          if (!userEmail) console.log('   Razón: No hay email del usuario (Clerk no ha cargado)')
          if (!perfilEmail) console.log('   Razón: El perfil no tiene correo')
          if (userEmail && perfilEmail && userEmail !== perfilEmail) {
            console.log('   Razón: Los emails NO coinciden')
          }
        }

        // Procesar linea_investigacion (puede ser string o array)
        let lineaInvestigacion = perfilData.linea_investigacion
        if (typeof lineaInvestigacion === 'string' && lineaInvestigacion.trim() !== '') {
          lineaInvestigacion = lineaInvestigacion.split(',').map((s: string) => s.trim()).filter(Boolean)
        }

        const data: InvestigadorData = {
          id: perfilData.id,
          clerkUserId: perfilData.clerk_user_id || perfilData.clerkUserId,
          name: perfilData.nombre_completo || `${perfilData.nombres || ''} ${perfilData.apellidos || ''}`.trim() || 'Sin Nombre',
          email: perfilData.correo,
          curp: perfilData.curp,
          rfc: perfilData.rfc,
          noCvu: perfilData.no_cvu || perfilData.noCvu,
          telefono: perfilData.telefono,
          institution: perfilData.institucion,
          departamento: perfilData.departamento,
          area: perfilData.area_investigacion || perfilData.area,
          areaInvestigacion: perfilData.area_investigacion,
          lineaInvestigacion: lineaInvestigacion,
          fotografiaUrl: perfilData.fotografia_url || perfilData.fotografiaUrl,
          title: perfilData.ultimo_grado_estudios,
          empleoActual: perfilData.empleo_actual,
          fechaNacimiento: perfilData.fecha_nacimiento,
          nacionalidad: perfilData.nacionalidad,
          municipio: perfilData.municipio,
          entidadFederativa: perfilData.entidad_federativa,
          gradoMaximoEstudios: perfilData.grado_maximo_estudios,
          nivelInvestigador: perfilData.nivel_investigador,
          nivelSni: perfilData.nivel_sni,
          disciplina: perfilData.disciplina,
          especialidad: perfilData.especialidad,
          orcid: perfilData.orcid,
          sni: perfilData.sni,
          anioSni: perfilData.anio_sni,
          sitioWeb: perfilData.sitio_web,
          cvUrl: perfilData.cv_url || perfilData.cvUrl,
          dictamenUrl: perfilData.dictamen_url,
          sniUrl: perfilData.sni_url,
          slug: perfilData.slug || slug,
        }
        
        setInvestigador(data)

        // Cargar publicaciones del investigador
        try {
          const publicacionesResponse = await fetch(`/api/investigadores/${slug}/publicaciones`)
          if (publicacionesResponse.ok) {
            const publicacionesData = await publicacionesResponse.json()
            setPublicaciones(publicacionesData || [])
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

  // Verificar estado de conexión
  useEffect(() => {
    if (!userId || !investigador?.email) {
      setCargandoConexion(false)
      return
    }

    const verificarConexion = async () => {
      try {
        setCargandoConexion(true)
        const response = await fetch(`/api/conexiones/verificar?email=${encodeURIComponent(investigador.email)}`)
        
        if (response.ok) {
          const data = await response.json()
          setEstanConectados(data.conectados || false)
          setSolicitudPendiente(data.solicitudPendiente || false)
        }
      } catch (error) {
        console.error("Error verificando conexión:", error)
      } finally {
        setCargandoConexion(false)
      }
    }

    verificarConexion()
  }, [userId, investigador?.email])

  if (redirecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-blue-600 font-medium">Redirigiendo a tu dashboard...</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
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

  const getValidCvUrl = (url: string | null | undefined) => {
    if (!url) return null
    if (url.startsWith('http://') || url.startsWith('https://')) return url
    if (url.startsWith('/uploads/')) return url
    return null
  }

  const validCvUrl = getValidCvUrl(investigador?.cvUrl)
  const validDictamenUrl = getValidCvUrl(investigador?.dictamenUrl)
  const validSniUrl = getValidCvUrl(investigador?.sniUrl)

  const formatDate = (dateStr: string | Date | null | undefined) => {
    if (!dateStr) return null
    if (dateStr instanceof Date) {
      return dateStr.toLocaleDateString('es-ES')
    }
    if (typeof dateStr === 'string' && dateStr.includes('T')) {
      const only = dateStr.split('T')[0]
      const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(only)
      if (m) {
        const y = Number(m[1]), mo = Number(m[2]) - 1, d = Number(m[3])
        const dt = new Date(y, mo, d)
        return dt.toLocaleDateString('es-ES')
      }
    }
    const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(dateStr))
    if (dateOnlyMatch) {
      const year = Number(dateOnlyMatch[1])
      const monthIndex = Number(dateOnlyMatch[2]) - 1
      const day = Number(dateOnlyMatch[3])
      const d = new Date(year, monthIndex, day)
      if (isNaN(d.getTime())) return dateStr
      return d.toLocaleDateString('es-ES')
    }
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return dateStr
      return d.toLocaleDateString('es-ES')
    } catch (e) {
      return dateStr
    }
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="container mx-auto py-4 sm:py-6 px-3 sm:px-4 md:px-6 pb-20 sm:pb-24">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-900 break-words">Perfil Público</h1>
            <p className="text-blue-600 text-sm sm:text-base break-words">Información del investigador</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8">
            {/* Sidebar izquierdo */}
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-6 space-y-4 sm:space-y-6">
                {/* Perfil del Investigador */}
                <Card className="bg-white border-blue-100 shadow-md">
                  <CardHeader className="px-3 sm:px-6 pt-4 sm:pt-6">
                    <CardTitle className="text-blue-900 flex items-center text-base sm:text-lg break-words">
                      <UserIcon className="mr-2 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />Perfil del Investigador
                    </CardTitle>
                    <CardDescription className="text-blue-600 text-xs sm:text-sm break-words">Información del investigador</CardDescription>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-4 md:p-6">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <Avatar className="h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0">
                        {investigador?.fotografiaUrl && investigador.fotografiaUrl.trim() !== "" ? (
                          <AvatarImage src={investigador.fotografiaUrl} alt={investigador?.name || 'Usuario'} />
                        ) : (
                          <AvatarFallback className="bg-blue-100 text-blue-700 text-xl">
                            {getInitials()}
                          </AvatarFallback>
                        )}
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <h2 className="text-lg sm:text-xl font-bold text-blue-900 break-words">{investigador.name}</h2>
                        
                        {/* Badge de estado de conexión */}
                        {userId && !cargandoConexion && (
                          <div className="mt-2">
                            {estanConectados ? (
                              <Badge className="bg-green-100 text-green-800 border-green-300 text-xs">
                                <Users className="mr-1 h-3 w-3" />
                                Conectados
                              </Badge>
                            ) : solicitudPendiente ? (
                              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 text-xs">
                                <Users className="mr-1 h-3 w-3" />
                                Solicitud Pendiente
                              </Badge>
                            ) : null}
                          </div>
                        )}
                        
                        <p className="text-xs sm:text-sm text-blue-600 flex items-center gap-2 mt-1 break-words">
                          <Mail className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
                          {investigador.email || 'No disponible'}
                        </p>
                        {investigador.telefono && investigador.telefono.trim() !== "" && (
                          <p className="text-xs sm:text-sm text-blue-600 flex items-center gap-2 mt-1 break-words">
                            <Phone className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
                            {investigador.telefono}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Información detallada completa */}
                    <div className="mt-4 pt-4 border-t border-blue-100 space-y-3">
                      {/* 1. Empleo Actual */}
                      {investigador.empleoActual && investigador.empleoActual.trim() !== "" && (
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-blue-700 flex items-center gap-2 uppercase tracking-wide">
                            <Briefcase className="h-3.5 w-3.5" />
                            Empleo Actual
                          </label>
                          <p className="text-sm text-blue-900 break-words whitespace-pre-line">{investigador.empleoActual}</p>
                        </div>
                      )}

                      {/* 2. CVU/PU */}
                      {investigador.noCvu && investigador.noCvu.trim() !== "" && (
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-blue-700 flex items-center gap-2 uppercase tracking-wide">
                            <FileText className="h-3.5 w-3.5" />
                            CVU/PU
                          </label>
                          <p className="text-sm text-blue-900 font-mono break-words">{investigador.noCvu}</p>
                        </div>
                      )}

                      {/* 3. Nacionalidad */}
                      {investigador.nacionalidad && investigador.nacionalidad.trim() !== "" && (
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-blue-700 flex items-center gap-2 uppercase tracking-wide">
                            <MapPin className="h-3.5 w-3.5" />
                            Nacionalidad
                          </label>
                          <p className="text-sm text-blue-900 break-words">{investigador.nacionalidad}</p>
                        </div>
                      )}

                      {/* 4. Municipio */}
                      {investigador.municipio && investigador.municipio.trim() !== "" && (
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-blue-700 flex items-center gap-2 uppercase tracking-wide">
                            <MapPin className="h-3.5 w-3.5" />
                            Municipio
                          </label>
                          <p className="text-sm text-blue-900 break-words">{investigador.municipio}</p>
                        </div>
                      )}

                      {/* 5. Entidad Federativa */}
                      {investigador.entidadFederativa && investigador.entidadFederativa.trim() !== "" && (
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-blue-700 flex items-center gap-2 uppercase tracking-wide">
                            <MapPin className="h-3.5 w-3.5" />
                            Entidad Federativa
                          </label>
                          <p className="text-sm text-blue-900 break-words">{investigador.entidadFederativa}</p>
                        </div>
                      )}

                      {/* 6. Último Grado de Estudios */}
                      {investigador.title && investigador.title.trim() !== "" && (
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-blue-700 flex items-center gap-2 uppercase tracking-wide">
                            <GraduationCap className="h-3.5 w-3.5" />
                            Último Grado de Estudios
                          </label>
                          <p className="text-sm text-blue-900 break-words">{investigador.title}</p>
                        </div>
                      )}

                      {/* Tipo de Perfil */}
                      {investigador.tipoPerfil && investigador.tipoPerfil.trim() !== "" && (
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-blue-700 flex items-center gap-2 uppercase tracking-wide">
                            <Award className="h-3.5 w-3.5" />
                            Tipo de Perfil
                          </label>
                          <p className="text-sm text-blue-900 break-words">{investigador.tipoPerfil === "INVESTIGADOR" ? "Investigador" : "Tecnólogo"}</p>
                        </div>
                      )}

                      {/* 7. Nivel Investigador */}
                      {investigador.nivelInvestigador && investigador.nivelInvestigador.trim() !== "" && (
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-blue-700 flex items-center gap-2 uppercase tracking-wide">
                            <Award className="h-3.5 w-3.5" />
                            Nivel Investigador
                          </label>
                          <p className="text-sm text-blue-900 break-words">{investigador.nivelInvestigador}</p>
                        </div>
                      )}

                      {/* Nivel Tecnólogo */}
                      {investigador.nivelTecnologo && investigador.nivelTecnologo.trim() !== "" && (
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-blue-700 flex items-center gap-2 uppercase tracking-wide">
                            <Award className="h-3.5 w-3.5" />
                            Nivel Tecnólogo
                          </label>
                          <p className="text-sm text-blue-900 break-words">{investigador.nivelTecnologo}</p>
                        </div>
                      )}

                      {/* 8. Nivel SNI */}
                      {investigador.nivelSni && investigador.nivelSni.trim() !== "" && (
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-blue-700 flex items-center gap-2 uppercase tracking-wide">
                            <GraduationCap className="h-3.5 w-3.5" />
                            Nivel SNI
                          </label>
                          <p className="text-sm text-blue-900 break-words">{investigador.nivelSni}</p>
                        </div>
                      )}

                      {/* 9. Disciplina */}
                      {investigador.disciplina && investigador.disciplina.trim() !== "" && (
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-blue-700 flex items-center gap-2 uppercase tracking-wide">
                            <GraduationCap className="h-3.5 w-3.5" />
                            Disciplina
                          </label>
                          <p className="text-sm text-blue-900 break-words">{investigador.disciplina}</p>
                        </div>
                      )}

                      {/* 10. Especialidad */}
                      {investigador.especialidad && investigador.especialidad.trim() !== "" && (
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-blue-700 flex items-center gap-2 uppercase tracking-wide">
                            <GraduationCap className="h-3.5 w-3.5" />
                            Especialidad
                          </label>
                          <p className="text-sm text-blue-900 break-words">{investigador.especialidad}</p>
                        </div>
                      )}

                      {/* 11. ORCID */}
                      {investigador.orcid && investigador.orcid.trim() !== "" && (
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-blue-700 flex items-center gap-2 uppercase tracking-wide">
                            <FileText className="h-3.5 w-3.5" />
                            ORCID
                          </label>
                          <p className="text-sm text-blue-900 font-mono break-words">{investigador.orcid}</p>
                        </div>
                      )}

                      {/* 12. SNI */}
                      {investigador.sni && investigador.sni.trim() !== "" && (
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-blue-700 flex items-center gap-2 uppercase tracking-wide">
                            <GraduationCap className="h-3.5 w-3.5" />
                            SNI
                          </label>
                          <p className="text-sm text-blue-900 break-words">
                            {investigador.sni}
                            {investigador.anioSni && ` (${investigador.anioSni})`}
                          </p>
                        </div>
                      )}

                      {/* 13. Sitio Web */}
                      {investigador.sitioWeb && investigador.sitioWeb.trim() !== "" && (
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-blue-700 flex items-center gap-2 uppercase tracking-wide">
                            <ExternalLink className="h-3.5 w-3.5" />
                            Sitio Web
                          </label>
                          <a 
                            href={investigador.sitioWeb} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 hover:underline break-all"
                          >
                            {investigador.sitioWeb}
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="mt-4">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {investigador.curp && <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-md break-words">CURP: {investigador.curp}</span>}
                        {investigador.rfc && <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-md break-words">RFC: {investigador.rfc}</span>}
                      </div>

                      <div className="text-xs sm:text-sm text-blue-600 space-y-1">
                        {investigador.institution && investigador.institution.trim() !== "" && (
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-blue-700 flex items-center gap-2 uppercase tracking-wide">
                              <Building className="h-3.5 w-3.5" />
                              Institución
                            </label>
                            <p className="text-sm text-blue-900 break-words">{investigador.institution}</p>
                          </div>
                        )}
                        {investigador.departamento && investigador.departamento.trim() !== "" && (
                          <div className="space-y-1 mt-2">
                            <label className="text-xs font-semibold text-blue-700 flex items-center gap-2 uppercase tracking-wide">
                              <BookOpen className="h-3.5 w-3.5" />
                              Departamento
                            </label>
                            <p className="text-sm text-blue-900 break-words">{investigador.departamento}</p>
                          </div>
                        )}

                        {investigador.lineaInvestigacion && Array.isArray(investigador.lineaInvestigacion) && investigador.lineaInvestigacion.length > 0 && (
                          <div className="mt-6 pt-3 border-t border-blue-50">
                            <label className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Líneas de Investigación</label>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {investigador.lineaInvestigacion.map((tag: string, idx: number) => (
                                <span key={idx} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100 break-words break-all">{tag}</span>
                              ))}
                            </div>
                          </div>
                        )}

                        {investigador.areaInvestigacion && investigador.areaInvestigacion.trim() !== "" && (
                          <div className="mt-3">
                            <label className="text-xs font-semibold text-blue-700 flex items-center gap-2 uppercase tracking-wide">
                              <BookOpen className="h-3.5 w-3.5" />Área de Investigación
                            </label>
                            <p className="text-sm text-blue-900 mt-2 whitespace-pre-line break-words break-all">{investigador.areaInvestigacion}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Botones de Contacto - Solo visible si está autenticado */}
                {userId && (
                  <Card className="bg-white border-blue-100 shadow-sm">
                    <CardHeader className="px-3 sm:px-6 pt-4 sm:pt-6">
                      <CardTitle className="text-blue-900 text-sm sm:text-base break-words">Contacto</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 px-3 sm:px-6 pb-4 sm:pb-6">
                      <Button 
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 text-xs sm:text-sm"
                        onClick={() => window.location.href = `mailto:${investigador.email}?subject=Contacto desde SEI&body=Hola ${investigador.name},%0D%0A%0D%0A`}
                      >
                        <Mail className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                        Enviar Email
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full border-blue-300 text-blue-700 hover:bg-blue-50 text-xs sm:text-sm"
                        onClick={() => setMensajeDialogOpen(true)}
                      >
                        <MessageCircle className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                        Mensaje Interno
                      </Button>
                      
                      {estanConectados ? (
                        <Button 
                          variant="outline" 
                          className="w-full border-green-500 text-green-700 bg-green-50 hover:bg-green-100 text-xs sm:text-sm cursor-default"
                          disabled
                        >
                          <Users className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                          Ya Conectados
                        </Button>
                      ) : solicitudPendiente ? (
                        <Button 
                          variant="outline" 
                          className="w-full border-yellow-500 text-yellow-700 bg-yellow-50 hover:bg-yellow-100 text-xs sm:text-sm cursor-default"
                          disabled
                        >
                          <UserPlus className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                          Solicitud Enviada
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          className="w-full border-green-300 text-green-700 hover:bg-green-50 text-xs sm:text-sm"
                          onClick={() => setConectarDialogOpen(true)}
                          disabled={cargandoConexion}
                        >
                          <UserPlus className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                          {cargandoConexion ? "Verificando..." : "Conectar"}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Contenido principal */}
            <div className="lg:col-span-8 flex flex-col gap-4 sm:gap-6 lg:gap-8">
              {/* Perfil Único del Investigador */}
              <Card className="bg-white border-blue-100 shadow-md">
                <CardHeader className="px-3 sm:px-6 pt-4 sm:pt-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-3 sm:gap-4">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-blue-900 flex items-center text-base sm:text-lg break-words">
                        <FileText className="mr-2 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />Perfil Único del Investigador
                      </CardTitle>
                      <CardDescription className="text-blue-600 text-xs sm:text-sm break-words">
                        {(tipoDocumento === 'PU' ? validCvUrl : tipoDocumento === 'Dictamen' ? validDictamenUrl : validSniUrl) 
                          ? 'Documento disponible' 
                          : 'Documento no disponible'}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs sm:text-sm">
                            {tipoDocumento}
                            <ChevronDown className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setTipoDocumento('PU')}>PU</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setTipoDocumento('Dictamen')}>Dictamen</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setTipoDocumento('SNI')}>SNI</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6">
                  {tipoDocumento === 'PU' ? (
                    validCvUrl ? (
                      <div className="w-full space-y-3 sm:space-y-4">
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <Button onClick={() => window.open(validCvUrl, '_blank')} className="bg-gradient-to-r from-blue-600 to-blue-700 text-white w-full sm:w-auto text-xs sm:text-sm">
                            <ExternalLink className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />Abrir PDF
                          </Button>
                          <Button variant="outline" onClick={() => { 
                            const l = document.createElement('a')
                            l.href = validCvUrl as string
                            l.download = `${investigador?.name?.replace(/\s+/g, '_') || 'perfil'}.pdf`
                            document.body.appendChild(l)
                            l.click()
                            document.body.removeChild(l)
                          }} className="w-full sm:w-auto text-xs sm:text-sm">
                            <Download className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />Descargar
                          </Button>
                        </div>
                        <div className="relative w-full bg-gray-100 rounded-lg overflow-hidden border-2 border-blue-200 h-[50vh] md:h-[60vh] lg:h-[70vh]">
                          <iframe src={validCvUrl as string} className="w-full h-full" title="Vista previa" style={{ border: 'none' }} />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4 p-6">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                          <FileText className="h-12 w-12 text-blue-400 mx-auto mb-3" />
                          <p className="text-blue-700 font-medium mb-2">Perfil Único no disponible</p>
                          <p className="text-sm text-blue-600 mb-4">Este investigador aún no ha subido su Perfil Único.</p>
                        </div>
                      </div>
                    )
                  ) : tipoDocumento === 'Dictamen' ? (
                    validDictamenUrl ? (
                      <div className="w-full space-y-3 sm:space-y-4">
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <Button onClick={() => window.open(validDictamenUrl as string, '_blank')} className="bg-gradient-to-r from-blue-600 to-blue-700 text-white w-full sm:w-auto text-xs sm:text-sm">
                            <ExternalLink className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />Abrir PDF
                          </Button>
                          <Button variant="outline" onClick={() => { 
                            const l = document.createElement('a')
                            l.href = validDictamenUrl as string
                            l.download = `${investigador?.name?.replace(/\s+/g, '_') || 'dictamen'}_dictamen.pdf`
                            document.body.appendChild(l)
                            l.click()
                            document.body.removeChild(l)
                          }} className="w-full sm:w-auto text-xs sm:text-sm">
                            <Download className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />Descargar
                          </Button>
                        </div>
                        <div className="relative w-full bg-gray-100 rounded-lg overflow-hidden border-2 border-blue-200 h-[50vh] md:h-[60vh] lg:h-[70vh]">
                          <iframe src={validDictamenUrl as string} className="w-full h-full" title="Vista previa dictamen" style={{ border: 'none' }} />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4 p-6">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                          <FileText className="h-12 w-12 text-blue-400 mx-auto mb-3" />
                          <p className="text-blue-700 font-medium mb-2">Dictamen no disponible</p>
                          <p className="text-sm text-blue-600 mb-4">Este investigador aún no ha subido su dictamen.</p>
                        </div>
                      </div>
                    )
                  ) : (
                    validSniUrl ? (
                      <div className="w-full space-y-3 sm:space-y-4">
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <Button onClick={() => window.open(validSniUrl as string, '_blank')} className="bg-gradient-to-r from-blue-600 to-blue-700 text-white w-full sm:w-auto text-xs sm:text-sm">
                            <ExternalLink className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />Abrir PDF
                          </Button>
                          <Button variant="outline" onClick={() => { 
                            const l = document.createElement('a')
                            l.href = validSniUrl as string
                            l.download = `${investigador?.name?.replace(/\s+/g, '_') || 'sni'}_sni.pdf`
                            document.body.appendChild(l)
                            l.click()
                            document.body.removeChild(l)
                          }} className="w-full sm:w-auto text-xs sm:text-sm">
                            <Download className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />Descargar
                          </Button>
                        </div>
                        <div className="relative w-full bg-gray-100 rounded-lg overflow-hidden border-2 border-blue-200 h-[50vh] md:h-[60vh] lg:h-[70vh]">
                          <iframe src={validSniUrl as string} className="w-full h-full" title="Vista previa SNI" style={{ border: 'none' }} />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4 p-6">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                          <FileText className="h-12 w-12 text-blue-400 mx-auto mb-3" />
                          <p className="text-blue-700 font-medium mb-2">SNI no disponible</p>
                          <p className="text-sm text-blue-600 mb-4">Este investigador aún no ha subido su documento SNI.</p>
                        </div>
                      </div>
                    )
                  )}
                </CardContent>
              </Card>

              {/* Publicaciones - Componente reutilizable */}
              <PublicacionesList slug={params.slug as string} isOwner={false} showAddButton={false} />

            </div>
          </div>
        </div>
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
            onSuccess={() => {
              // Actualizar estado de conexión después de enviar solicitud
              setSolicitudPendiente(true)
            }}
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
    </ErrorBoundary>
  )
}

