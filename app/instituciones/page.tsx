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
    <div className="min-h-screen">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <AnimatedHeader
            title="Instituciones de Investigación"
            subtitle="Explora las instituciones registradas y conoce sus áreas de especialidad"
          />
          <AnimatedButton
            asChild
            className="bg-blue-700 hover:bg-blue-800 text-white animate-glow"
          >
            <Link href="/instituciones/nueva">
              <Building className="mr-2 h-4 w-4" />
              Registrar Institución
            </Link>
          </AnimatedButton>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <AnimatedCard className="glass-effect card-hover text-center" delay={100}>
            <CardContent className="pt-6">
              <Building className="h-8 w-8 mx-auto text-blue-600 mb-2 animate-float" />
              <div className="text-2xl font-bold text-blue-900">{loading ? "..." : stats.total}</div>
              <p className="text-sm text-blue-600">Instituciones</p>
            </CardContent>
          </AnimatedCard>
          <AnimatedCard className="glass-effect card-hover text-center" delay={200}>
            <CardContent className="pt-6">
              <CheckCircle2 className="h-8 w-8 mx-auto text-blue-600 mb-2 animate-float" />
              <div className="text-2xl font-bold text-blue-900">{loading ? "..." : stats.activas}</div>
              <p className="text-sm text-blue-600">Instituciones activas</p>
            </CardContent>
          </AnimatedCard>
          <AnimatedCard className="glass-effect card-hover text-center" delay={300}>
            <CardContent className="pt-6">
              <Clock className="h-8 w-8 mx-auto text-blue-600 mb-2 animate-float" />
              <div className="text-2xl font-bold text-blue-900">{loading ? "..." : stats.enRevision}</div>
              <p className="text-sm text-blue-600">En revisión</p>
            </CardContent>
          </AnimatedCard>
          <AnimatedCard className="glass-effect card-hover text-center" delay={400}>
            <CardContent className="pt-6">
              <FileText className="h-8 w-8 mx-auto text-blue-600 mb-2 animate-float" />
              <div className="text-2xl font-bold text-blue-900">{loading ? "..." : stats.conDocumentos}</div>
              <p className="text-sm text-blue-600">Con documentación</p>
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
          <AnimatedCard className="glass-effect card-hover" delay={300}>
            <CardContent className="pt-6 text-center py-12">
              <Building className="h-12 w-12 mx-auto text-blue-300 mb-4 animate-float" />
              <h3 className="text-lg font-semibold mb-2 text-blue-900">No hay instituciones registradas</h3>
              <p className="text-sm text-blue-600">En cuanto se registre la primera institución aparecerá aquí.</p>
            </CardContent>
          </AnimatedCard>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {instituciones.map((institucion, index) => {
              const estado = estadoConfig(institucion.estado, institucion.activo)

              return (
                <Link href={`/instituciones/${institucion.id}`} key={institucion.id}>
                  <AnimatedCard className="h-full glass-effect card-hover cursor-pointer overflow-hidden group relative" delay={index * 100}>
                    {/* Gradiente decorativo superior */}
                    <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <CardContent className="pt-8 sm:pt-10 px-5 sm:px-6 pb-5 overflow-hidden relative z-10">
                      <div className="flex flex-col items-center text-center w-full max-w-full">
                        {/* Imagen/Logo de la institución con efecto mejorado */}
                        <div className="relative mb-5 sm:mb-6 w-full">
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity"></div>
                          <div className="relative flex items-center justify-center h-40 sm:h-44 w-full rounded-xl bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 ring-4 ring-blue-100 group-hover:ring-blue-200 transition-all duration-300 shadow-lg overflow-hidden">
                            {institucion.imagenUrl ? (
                              <Image
                                src={institucion.imagenUrl}
                                alt={`Imagen de ${institucion.nombre}`}
                                fill
                                className="object-contain p-4"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              />
                            ) : (
                              <div className="absolute inset-0 flex flex-col items-center justify-center text-blue-900/60 p-4">
                                <span className="text-3xl sm:text-4xl font-bold uppercase tracking-wide leading-tight">
                                  {getInitials(institucion.siglas || institucion.nombre)}
                                </span>
                                {institucion.siglas && (
                                  <span className="text-xs sm:text-sm mt-2 font-semibold">{institucion.siglas}</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Nombre con mejor tipografía */}
                        <h3 className="font-bold text-blue-900 mb-2 text-lg sm:text-xl w-full px-3 line-clamp-2 leading-tight group-hover:text-blue-700 transition-colors">
                          {institucion.nombre || 'Sin nombre'}
                        </h3>

                        {/* Tipo y estado con estilo mejorado */}
                        <div className="mb-4 w-full px-3 space-y-2">
                          {institucion.tipo && (
                            <AnimatedBadge 
                              variant="secondary" 
                              className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs sm:text-sm font-bold px-3 py-1.5 shadow-md hover:shadow-lg transition-shadow"
                            >
                              {institucion.tipo}
                            </AnimatedBadge>
                          )}
                          <Badge variant="outline" className={`text-xs ${estado.className} border-2`}>
                            {estado.label}
                          </Badge>
                        </div>

                        {/* Información básica - Rediseñada */}
                        <div className="w-full space-y-2.5 sm:space-y-3 text-xs sm:text-sm mb-4 px-3">
                          {institucion.añoFundacion && (
                            <div className="flex items-center justify-center gap-2 text-blue-700 max-w-full bg-blue-50/50 rounded-lg px-3 py-2 border border-blue-100">
                              <Calendar className="h-4 w-4 flex-shrink-0 text-blue-500" />
                              <span className="text-xs font-semibold text-center truncate min-w-0 flex-1">Fundada en {institucion.añoFundacion}</span>
                            </div>
                          )}

                          {institucion.ubicacion && institucion.ubicacion.trim() !== '' && (
                            <div className="flex items-center justify-center gap-2 text-blue-700 max-w-full bg-blue-50/50 rounded-lg px-3 py-2 border border-blue-100">
                              <MapPin className="h-4 w-4 flex-shrink-0 text-blue-500" />
                              <span className="text-xs font-semibold text-center truncate min-w-0 flex-1 line-clamp-2">{institucion.ubicacion}</span>
                            </div>
                          )}

                          {institucion.contacto?.telefono && (
                            <div className="flex items-center justify-center gap-2 text-blue-700 max-w-full bg-blue-50/50 rounded-lg px-3 py-2 border border-blue-100">
                              <Phone className="h-4 w-4 flex-shrink-0 text-blue-500" />
                              <span className="text-xs font-semibold text-center truncate min-w-0 flex-1">
                                {institucion.contacto.telefono}
                                {institucion.contacto.extension ? ` ext. ${institucion.contacto.extension}` : ""}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Áreas de investigación - Rediseñado */}
                        {institucion.areasInvestigacion.length > 0 && (
                          <div className="w-full mt-2 px-3">
                            <div className="inline-block w-full">
                              <AnimatedBadge 
                                variant="outline" 
                                interactive 
                                className="border-2 border-indigo-200 text-indigo-700 bg-indigo-50/70 px-4 py-2 w-full overflow-hidden hover:bg-indigo-100/70 transition-colors shadow-sm"
                              >
                                <span className="block truncate text-[11px] sm:text-xs font-semibold uppercase tracking-wide">
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
                    <CardFooter className="border-t-2 border-blue-100 flex flex-col gap-2 py-4 sm:py-5 px-5 sm:px-6 bg-gradient-to-r from-blue-50/50 via-indigo-50/30 to-blue-50/50 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="text-center w-full max-w-full overflow-hidden relative z-10">
                        {institucion.contacto?.email && (
                          <p className="text-xs sm:text-sm text-blue-600 px-2 truncate font-semibold flex items-center justify-center gap-2 mb-2">
                            <span className="text-blue-400">✉</span>
                            <span>{institucion.contacto.email}</span>
                          </p>
                        )}
                        <div className="flex items-center justify-center gap-2 flex-wrap">
                          <AnimatedButton
                            variant="outline"
                            size="sm"
                            className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-transparent text-xs"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              window.location.href = `/instituciones/${institucion.id}`
                            }}
                          >
                            <GraduationCap className="mr-1.5 h-3.5 w-3.5" />
                            Ver detalles
                          </AnimatedButton>
                          {institucion.sitioWeb && (
                            <AnimatedButton
                              variant="outline"
                              size="sm"
                              className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-transparent text-xs"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                window.open(institucion.sitioWeb, "_blank")
                              }}
                            >
                              <Globe2 className="mr-1.5 h-3.5 w-3.5" />
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
