"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AnimatedCard } from "@/components/ui/animated-card"
import { AnimatedButton } from "@/components/ui/animated-button"
import { AnimatedBadge } from "@/components/ui/animated-badge"
import { AnimatedHeader } from "@/components/ui/animated-header"
import { Badge } from "@/components/ui/badge"
import { Building, Users, FileText, MapPin, Globe2, GraduationCap, Mail, Phone, CheckCircle2, Clock, Calendar } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

function formatDate(value?: string | null) {
  if (!value) return "Sin registro"
  try {
    return new Intl.DateTimeFormat("es-MX", { dateStyle: "medium" }).format(new Date(value))
  } catch {
    return value
  }
}

function getInitials(text?: string | null) {
  if (!text) return "SEI"
  return text
    .split(" ")
    .map((part) => part[0])
    .join("")
    .substring(0, 4)
    .toUpperCase()
}

interface ContactoInstitucional {
  nombreContacto?: string
  cargo?: string
  telefono?: string
  email?: string
  extension?: string
}

interface Institucion {
  id: string
  nombre: string
  siglas?: string | null
  tipo?: string | null
  tipoOtroEspecificar?: string | null
  ubicacion?: string | null
  descripcion?: string | null
  añoFundacion?: number | null
  sitioWeb?: string | null
  imagenUrl?: string | null
  estado: string
  activo: boolean
  areasInvestigacion: string[]
  documentos: Record<string, string>
  contacto?: ContactoInstitucional | null
  createdAt?: string | null
  updatedAt?: string | null
}

function estadoConfig(estado: string, activo: boolean) {
  const normalized = estado?.toUpperCase() || "PENDIENTE"

  if (!activo) {
    return {
      label: normalized || "Inactiva",
      className: "border-rose-200 bg-rose-50 text-rose-600"
    }
  }

  if (normalized === "APROBADA") {
    return {
      label: "Aprobada",
      className: "border-emerald-200 bg-emerald-50 text-emerald-600"
    }
  }

  if (normalized === "RECHAZADA") {
    return {
      label: "Rechazada",
      className: "border-rose-200 bg-rose-50 text-rose-600"
    }
  }

  return {
    label: normalized || "Pendiente",
    className: "border-amber-200 bg-amber-50 text-amber-600"
  }
}

export default function InstitucionesPage() {
  const [instituciones, setInstituciones] = useState<Institucion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchInstituciones = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/instituciones", { cache: "no-store" })
        const data = await response.json()

        if (response.ok && Array.isArray(data.instituciones)) {
          setInstituciones(data.instituciones)
        } else {
          setInstituciones([])
        }
      } catch (error) {
        console.error("Error fetching instituciones:", error)
        setInstituciones([])
      } finally {
        setLoading(false)
      }
    }

    fetchInstituciones()
  }, [])

  const stats = useMemo(() => {
    const total = instituciones.length
    const activas = instituciones.filter((inst) => inst.activo).length
    const enRevision = instituciones.filter((inst) => (inst.estado || "").toUpperCase() !== "APROBADA").length
    const conDocumentos = instituciones.filter((inst) => Object.keys(inst.documentos || {}).length > 0).length

    return { total, activas, enRevision, conDocumentos }
  }, [instituciones])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8 lg:py-10">
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-800 via-blue-700 to-indigo-700 bg-clip-text text-transparent">
              Instituciones de Investigación
            </h1>
            <p className="text-slate-600 text-sm sm:text-base">
              Explora las instituciones registradas y conoce sus áreas de especialidad
            </p>
          </div>
          <AnimatedButton
            asChild
            className="bg-gradient-to-r from-blue-500/90 to-indigo-500/90 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg shadow-blue-500/25 border-0"
          >
            <Link href="/instituciones/nueva">
              <Building className="mr-2 h-4 w-4" />
              Registrar Institución
            </Link>
          </AnimatedButton>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <AnimatedCard className="bg-white/70 backdrop-blur-sm border border-slate-200/50 shadow-sm hover:shadow-md transition-all duration-300 text-center" delay={100}>
            <CardContent className="pt-6">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                <Building className="h-6 w-6 text-blue-500/80" />
              </div>
              <div className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">{loading ? "..." : stats.total}</div>
              <p className="text-sm text-slate-500 mt-1">Instituciones</p>
            </CardContent>
          </AnimatedCard>
          <AnimatedCard className="bg-white/70 backdrop-blur-sm border border-slate-200/50 shadow-sm hover:shadow-md transition-all duration-300 text-center" delay={200}>
            <CardContent className="pt-6">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-emerald-500/80" />
              </div>
              <div className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">{loading ? "..." : stats.activas}</div>
              <p className="text-sm text-slate-500 mt-1">Instituciones activas</p>
            </CardContent>
          </AnimatedCard>
          <AnimatedCard className="bg-white/70 backdrop-blur-sm border border-slate-200/50 shadow-sm hover:shadow-md transition-all duration-300 text-center" delay={300}>
            <CardContent className="pt-6">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-amber-500/80" />
              </div>
              <div className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">{loading ? "..." : stats.enRevision}</div>
              <p className="text-sm text-slate-500 mt-1">En revisión</p>
            </CardContent>
          </AnimatedCard>
          <AnimatedCard className="bg-white/70 backdrop-blur-sm border border-slate-200/50 shadow-sm hover:shadow-md transition-all duration-300 text-center" delay={400}>
            <CardContent className="pt-6">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                <FileText className="h-6 w-6 text-purple-500/80" />
              </div>
              <div className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">{loading ? "..." : stats.conDocumentos}</div>
              <p className="text-sm text-slate-500 mt-1">Con documentación</p>
            </CardContent>
          </AnimatedCard>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="bg-white border-blue-100">
                <div className="relative h-44 w-full bg-blue-100 animate-pulse"></div>
                <CardHeader>
                  <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-blue-100 rounded w-1/3"></div>
                    <div className="h-6 bg-blue-100 rounded w-3/4"></div>
                    <div className="h-4 bg-blue-100 rounded w-1/2"></div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-blue-100 rounded w-full"></div>
                    <div className="h-4 bg-blue-100 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : instituciones.length === 0 ? (
          <AnimatedCard className="bg-white/70 backdrop-blur-sm border border-slate-200/50 shadow-sm" delay={300}>
            <CardContent className="pt-6 text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-slate-100 to-blue-100 flex items-center justify-center">
                <Building className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-slate-700">No hay instituciones registradas</h3>
              <p className="text-sm text-slate-500">En cuanto se registre la primera institución aparecerá aquí.</p>
            </CardContent>
          </AnimatedCard>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {instituciones.map((institucion, index) => {
              const estado = estadoConfig(institucion.estado, institucion.activo)

              return (
                <Link href={`/instituciones/${institucion.id}`} key={institucion.id}>
                  <AnimatedCard className="h-full bg-white/80 backdrop-blur-sm border border-slate-200/60 shadow-sm hover:shadow-xl hover:border-slate-300/80 cursor-pointer overflow-hidden group relative transition-all duration-500" delay={index * 100}>
                    {/* Gradiente decorativo superior sutil */}
                    <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-blue-50/40 via-indigo-50/20 to-purple-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <CardContent className="pt-6 sm:pt-8 md:pt-10 px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 relative z-10">
                      <div className="flex flex-col items-center text-center w-full max-w-full">
                        {/* Imagen/Logo de la institución con efecto mejorado */}
                        <div className="relative mb-4 sm:mb-5 md:mb-6 w-full">
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-200/30 via-indigo-200/20 to-purple-200/30 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          <div className="relative flex items-center justify-center w-full rounded-2xl bg-gradient-to-br from-slate-50/80 via-blue-50/60 to-indigo-50/40 backdrop-blur-sm border border-slate-200/40 group-hover:border-slate-300/60 transition-all duration-500 shadow-sm group-hover:shadow-md p-4 sm:p-6 md:p-8 min-h-[200px] sm:min-h-[240px] md:min-h-[280px]">
                            {institucion.imagenUrl ? (
                              <div className="relative w-full h-full flex items-center justify-center" style={{ minHeight: '180px', maxHeight: '260px' }}>
                                <img
                                  src={institucion.imagenUrl}
                                  alt={`Imagen de ${institucion.nombre}`}
                                  className="w-auto h-auto object-contain transition-transform duration-500 group-hover:scale-105"
                                  style={{ 
                                    maxWidth: '100%', 
                                    maxHeight: '100%',
                                    width: 'auto',
                                    height: 'auto',
                                    objectFit: 'contain',
                                    display: 'block'
                                  }}
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement
                                    target.style.display = 'none'
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center text-slate-400/70 w-full" style={{ minHeight: '180px' }}>
                                <span className="text-2xl sm:text-3xl md:text-4xl font-bold uppercase tracking-wide leading-tight">
                                  {getInitials(institucion.siglas || institucion.nombre)}
                                </span>
                                {institucion.siglas && (
                                  <span className="text-[10px] sm:text-xs md:text-sm mt-1 sm:mt-2 font-semibold">{institucion.siglas}</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Nombre con mejor tipografía */}
                        <h3 className="font-semibold text-slate-800 mb-2 sm:mb-3 text-base sm:text-lg md:text-xl w-full px-2 sm:px-3 line-clamp-2 leading-tight group-hover:text-slate-900 transition-colors">
                          {institucion.nombre || 'Sin nombre'}
                        </h3>

                        {/* Tipo y estado con estilo mejorado */}
                        <div className="mb-3 sm:mb-4 w-full px-2 sm:px-3 space-y-1.5 sm:space-y-2">
                          {institucion.tipo && (
                            <AnimatedBadge 
                              variant="secondary" 
                              className="bg-gradient-to-r from-blue-400/80 to-indigo-400/80 text-white text-[10px] sm:text-xs md:text-sm font-medium px-2 sm:px-3 py-1 sm:py-1.5 shadow-sm hover:shadow-md transition-all duration-300 border-0"
                            >
                              {institucion.tipo}
                            </AnimatedBadge>
                          )}
                          <Badge variant="outline" className={`text-[10px] sm:text-xs ${estado.className} border border-opacity-50`}>
                            {estado.label}
                          </Badge>
                        </div>

                        {/* Información básica - Rediseñada con colores suaves */}
                        <div className="w-full space-y-2 sm:space-y-2.5 md:space-y-3 text-[11px] sm:text-xs md:text-sm mb-3 sm:mb-4 px-2 sm:px-3">
                          {institucion.añoFundacion && (
                            <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-slate-600 max-w-full bg-slate-50/60 rounded-xl px-2 sm:px-3 py-1.5 sm:py-2 border border-slate-200/50 backdrop-blur-sm">
                              <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0 text-slate-400" />
                              <span className="text-[11px] sm:text-xs font-medium text-center truncate min-w-0 flex-1">Fundada en {institucion.añoFundacion}</span>
                            </div>
                          )}

                          {institucion.ubicacion && institucion.ubicacion.trim() !== '' && (
                            <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-slate-600 max-w-full bg-slate-50/60 rounded-xl px-2 sm:px-3 py-1.5 sm:py-2 border border-slate-200/50 backdrop-blur-sm">
                              <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0 text-slate-400" />
                              <span className="text-[11px] sm:text-xs font-medium text-center truncate min-w-0 flex-1 line-clamp-2">{institucion.ubicacion}</span>
                            </div>
                          )}

                          {institucion.contacto?.telefono && (
                            <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-slate-600 max-w-full bg-slate-50/60 rounded-xl px-2 sm:px-3 py-1.5 sm:py-2 border border-slate-200/50 backdrop-blur-sm">
                              <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0 text-slate-400" />
                              <span className="text-[11px] sm:text-xs font-medium text-center truncate min-w-0 flex-1">
                                {institucion.contacto.telefono}
                                {institucion.contacto.extension ? ` ext. ${institucion.contacto.extension}` : ""}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Áreas de investigación - Rediseñado */}
                        {institucion.areasInvestigacion.length > 0 && (
                          <div className="w-full mt-1 sm:mt-2 px-2 sm:px-3">
                            <div className="inline-block w-full">
                              <AnimatedBadge 
                                variant="outline" 
                                interactive 
                                className="border border-indigo-200/60 text-indigo-600 bg-indigo-50/50 px-3 sm:px-4 py-1.5 sm:py-2 w-full overflow-hidden hover:bg-indigo-50/80 transition-all duration-300 shadow-sm backdrop-blur-sm"
                              >
                                <span className="block truncate text-[10px] sm:text-[11px] md:text-xs font-medium uppercase tracking-wide">
                                  {institucion.areasInvestigacion.slice(0, 2).join(', ')}
                                  {institucion.areasInvestigacion.length > 2 && ` +${institucion.areasInvestigacion.length - 2} más`}
                                </span>
                              </AnimatedBadge>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    
                    {/* Footer con email y acciones - Rediseñado */}
                    <CardFooter className="border-t border-slate-200/50 flex flex-col gap-1.5 sm:gap-2 py-3 sm:py-4 md:py-5 px-4 sm:px-5 md:px-6 bg-gradient-to-r from-slate-50/40 via-blue-50/20 to-indigo-50/20 relative overflow-hidden backdrop-blur-sm">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="text-center w-full max-w-full overflow-hidden relative z-10">
                        {institucion.contacto?.email && (
                          <p className="text-[11px] sm:text-xs md:text-sm text-slate-600 px-1 sm:px-2 truncate font-medium flex items-center justify-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                            <Mail className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-slate-400" />
                            <span>{institucion.contacto.email}</span>
                          </p>
                        )}
                        <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap">
                          <AnimatedButton
                            variant="outline"
                            size="sm"
                            className="border-slate-200/60 text-slate-600 hover:bg-slate-50/80 hover:border-slate-300/80 bg-white/50 backdrop-blur-sm text-[10px] sm:text-xs shadow-sm px-2 sm:px-3 py-1.5 sm:py-2"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              window.location.href = `/instituciones/${institucion.id}`
                            }}
                          >
                            <GraduationCap className="mr-1 sm:mr-1.5 h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            Ver detalles
                          </AnimatedButton>
                          {institucion.sitioWeb && (
                            <AnimatedButton
                              variant="outline"
                              size="sm"
                              className="border-slate-200/60 text-slate-600 hover:bg-slate-50/80 hover:border-slate-300/80 bg-white/50 backdrop-blur-sm text-[10px] sm:text-xs shadow-sm px-2 sm:px-3 py-1.5 sm:py-2"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              if (institucion.sitioWeb) {
                                window.open(institucion.sitioWeb, "_blank")
                              }
                            }}
                            >
                              <Globe2 className="mr-1 sm:mr-1.5 h-3 w-3 sm:h-3.5 sm:w-3.5" />
                              Sitio web
                            </AnimatedButton>
                          )}
                        </div>
                      </div>
                    </CardFooter>
                  </AnimatedCard>
                </Link>
              )
            })}
          </div>
        )}
      </div>
      </div>
    </div>
  )
}
