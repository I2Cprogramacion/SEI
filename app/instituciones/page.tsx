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
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2">
              Instituciones de Investigación
            </h1>
            <p className="text-gray-500 text-sm">
              Explora las instituciones registradas y conoce sus áreas de especialidad
            </p>
          </div>
          <AnimatedButton
            asChild
            className="bg-gray-900 hover:bg-gray-800 text-white border-0"
          >
            <Link href="/instituciones/nueva">
              <Building className="mr-2 h-4 w-4" />
              Registrar Institución
            </Link>
          </AnimatedButton>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <AnimatedCard className="bg-white border border-gray-200 hover:border-gray-300 transition-colors text-center" delay={100}>
            <CardContent className="pt-6">
              <Building className="h-6 w-6 mx-auto mb-2 text-gray-600" />
              <div className="text-2xl font-semibold text-gray-900">{loading ? "..." : stats.total}</div>
              <p className="text-sm text-gray-500 mt-1">Instituciones</p>
            </CardContent>
          </AnimatedCard>
          <AnimatedCard className="bg-white border border-gray-200 hover:border-gray-300 transition-colors text-center" delay={200}>
            <CardContent className="pt-6">
              <CheckCircle2 className="h-6 w-6 mx-auto mb-2 text-gray-600" />
              <div className="text-2xl font-semibold text-gray-900">{loading ? "..." : stats.activas}</div>
              <p className="text-sm text-gray-500 mt-1">Instituciones activas</p>
            </CardContent>
          </AnimatedCard>
          <AnimatedCard className="bg-white border border-gray-200 hover:border-gray-300 transition-colors text-center" delay={300}>
            <CardContent className="pt-6">
              <Clock className="h-6 w-6 mx-auto mb-2 text-gray-600" />
              <div className="text-2xl font-semibold text-gray-900">{loading ? "..." : stats.enRevision}</div>
              <p className="text-sm text-gray-500 mt-1">En revisión</p>
            </CardContent>
          </AnimatedCard>
          <AnimatedCard className="bg-white border border-gray-200 hover:border-gray-300 transition-colors text-center" delay={400}>
            <CardContent className="pt-6">
              <FileText className="h-6 w-6 mx-auto mb-2 text-gray-600" />
              <div className="text-2xl font-semibold text-gray-900">{loading ? "..." : stats.conDocumentos}</div>
              <p className="text-sm text-gray-500 mt-1">Con documentación</p>
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
          <AnimatedCard className="bg-white border border-gray-200" delay={300}>
            <CardContent className="pt-6 text-center py-12">
              <Building className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2 text-gray-700">No hay instituciones registradas</h3>
              <p className="text-sm text-gray-500">En cuanto se registre la primera institución aparecerá aquí.</p>
            </CardContent>
          </AnimatedCard>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {instituciones.map((institucion, index) => {
              const estado = estadoConfig(institucion.estado, institucion.activo)

              return (
                <Link href={`/instituciones/${institucion.id}`} key={institucion.id}>
                  <AnimatedCard className="h-full bg-white border border-gray-200 hover:border-gray-300 hover:shadow-md cursor-pointer transition-all duration-200" delay={index * 100}>
                    <CardContent className="p-6">
                      <div className="flex flex-col gap-4">
                        {/* Imagen y nombre en la misma línea */}
                        <div className="flex items-start gap-4">
                          {/* Imagen pequeña integrada */}
                          <div className="flex-shrink-0">
                            {institucion.imagenUrl ? (
                              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
                                <img
                                  src={institucion.imagenUrl}
                                  alt={`Imagen de ${institucion.nombre}`}
                                  className="w-full h-full object-contain p-2"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement
                                    target.style.display = 'none'
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center">
                                <span className="text-lg sm:text-xl font-semibold text-gray-400 uppercase">
                                  {getInitials(institucion.siglas || institucion.nombre)}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          {/* Nombre y badges */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 text-base sm:text-lg mb-2 line-clamp-2 leading-tight">
                              {institucion.nombre || 'Sin nombre'}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {institucion.tipo && (
                                <Badge variant="secondary" className="bg-gray-100 text-gray-700 text-xs border-0">
                                  {institucion.tipo}
                                </Badge>
                              )}
                              <Badge variant="outline" className={`text-xs ${estado.className} border`}>
                                {estado.label}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Información básica */}
                        <div className="space-y-2 text-sm text-gray-600">
                          {institucion.añoFundacion && (
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                              <span className="text-sm">Fundada en {institucion.añoFundacion}</span>
                            </div>
                          )}
                          {institucion.ubicacion && institucion.ubicacion.trim() !== '' && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                              <span className="text-sm line-clamp-1">{institucion.ubicacion}</span>
                            </div>
                          )}
                          {institucion.contacto?.telefono && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                              <span className="text-sm">
                                {institucion.contacto.telefono}
                                {institucion.contacto.extension ? ` ext. ${institucion.contacto.extension}` : ""}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Áreas de investigación */}
                        {institucion.areasInvestigacion.length > 0 && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Áreas de investigación</p>
                            <p className="text-sm text-gray-700 line-clamp-2">
                              {institucion.areasInvestigacion.slice(0, 2).join(', ')}
                              {institucion.areasInvestigacion.length > 2 && ` +${institucion.areasInvestigacion.length - 2} más`}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    
                    {/* Footer minimalista */}
                    <CardFooter className="border-t border-gray-100 pt-4 px-6 pb-6">
                      <div className="w-full">
                        {institucion.contacto?.email && (
                          <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
                            <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <span className="truncate">{institucion.contacto.email}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <AnimatedButton
                            variant="outline"
                            size="sm"
                            className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50 text-sm"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              window.location.href = `/instituciones/${institucion.id}`
                            }}
                          >
                            Ver detalles
                          </AnimatedButton>
                          {institucion.sitioWeb && (
                            <AnimatedButton
                              variant="outline"
                              size="sm"
                              className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50 text-sm"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              if (institucion.sitioWeb) {
                                window.open(institucion.sitioWeb, "_blank")
                              }
                            }}
                            >
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
