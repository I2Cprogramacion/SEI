"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AnimatedCard } from "@/components/ui/animated-card"
import { AnimatedButton } from "@/components/ui/animated-button"
import { AnimatedBadge } from "@/components/ui/animated-badge"
import { AnimatedHeader } from "@/components/ui/animated-header"
import { Badge } from "@/components/ui/badge"
import { Building, Users, FileText, MapPin, Globe2, GraduationCap, Mail, Phone, CheckCircle2, Clock, Calendar, ChevronLeft, ChevronRight } from "lucide-react"
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
  
  // Estado para paginación
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 9

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

  // Calcular paginación
  const totalPages = Math.ceil(instituciones.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedInstituciones = instituciones.slice(startIndex, endIndex)

  // Funciones de navegación
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1)
    }
  }

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-blue-900 mb-2">
              Instituciones de Investigación
            </h1>
            <p className="text-blue-600 text-sm">
              Explora las instituciones registradas y conoce sus áreas de especialidad
            </p>
          </div>
          <AnimatedButton
            asChild
            className="bg-blue-600 hover:bg-blue-700 text-white border-0"
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
              <Building className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-semibold text-blue-900">{loading ? "..." : stats.total}</div>
              <p className="text-sm text-blue-600 mt-1">Instituciones</p>
            </CardContent>
          </AnimatedCard>
          <AnimatedCard className="glass-effect card-hover text-center" delay={200}>
            <CardContent className="pt-6">
              <CheckCircle2 className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-semibold text-blue-900">{loading ? "..." : stats.activas}</div>
              <p className="text-sm text-blue-600 mt-1">Instituciones activas</p>
            </CardContent>
          </AnimatedCard>
          <AnimatedCard className="glass-effect card-hover text-center" delay={300}>
            <CardContent className="pt-6">
              <Clock className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-semibold text-blue-900">{loading ? "..." : stats.enRevision}</div>
              <p className="text-sm text-blue-600 mt-1">En revisión</p>
            </CardContent>
          </AnimatedCard>
          <AnimatedCard className="glass-effect card-hover text-center" delay={400}>
            <CardContent className="pt-6">
              <FileText className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-semibold text-blue-900">{loading ? "..." : stats.conDocumentos}</div>
              <p className="text-sm text-blue-600 mt-1">Con documentación</p>
            </CardContent>
          </AnimatedCard>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="glass-effect">
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
          <AnimatedCard className="glass-effect" delay={300}>
            <CardContent className="pt-6 text-center py-12">
              <Building className="h-12 w-12 mx-auto mb-4 text-blue-300" />
              <h3 className="text-lg font-medium mb-2 text-blue-900">No hay instituciones registradas</h3>
              <p className="text-sm text-blue-600">En cuanto se registre la primera institución aparecerá aquí.</p>
            </CardContent>
          </AnimatedCard>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedInstituciones.map((institucion, index) => {
              const estado = estadoConfig(institucion.estado, institucion.activo)

              return (
                <Link href={`/instituciones/${institucion.id}`} key={institucion.id}>
                  <AnimatedCard className="h-full glass-effect card-hover cursor-pointer overflow-hidden group relative" delay={index * 100}>
                    {/* Gradiente decorativo superior */}
                    <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <CardContent className="p-6 relative z-10">
                      <div className="flex flex-col gap-4">
                        {/* Imagen y nombre en la misma línea */}
                        <div className="flex items-start gap-4">
                          {/* Imagen pequeña integrada con relación de aspecto 1:1 */}
                          <div className="flex-shrink-0">
                            {institucion.imagenUrl ? (
                              <div className="w-24 h-24 sm:w-28 sm:h-28 aspect-square rounded-lg border border-blue-200 bg-blue-50 flex items-center justify-center overflow-hidden p-3">
                                <img
                                  src={institucion.imagenUrl}
                                  alt={`Imagen de ${institucion.nombre}`}
                                  className="w-full h-full object-contain"
                                  style={{
                                    maxWidth: '100%',
                                    maxHeight: '100%',
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain'
                                  }}
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement
                                    target.style.display = 'none'
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="w-24 h-24 sm:w-28 sm:h-28 aspect-square rounded-lg border border-blue-200 bg-blue-50 flex items-center justify-center">
                                <span className="text-lg sm:text-xl font-semibold text-blue-400 uppercase">
                                  {getInitials(institucion.siglas || institucion.nombre)}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          {/* Nombre y badges */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-blue-900 text-base sm:text-lg mb-2 line-clamp-2 leading-tight group-hover:text-blue-700 transition-colors">
                              {institucion.nombre || 'Sin nombre'}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {institucion.tipo && (
                                <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs border-0">
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
                        <div className="space-y-2 text-sm text-blue-600">
                          {institucion.añoFundacion && (
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-blue-400 flex-shrink-0" />
                              <span className="text-sm">Fundada en {institucion.añoFundacion}</span>
                            </div>
                          )}
                          {institucion.ubicacion && institucion.ubicacion.trim() !== '' && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-blue-400 flex-shrink-0" />
                              <span className="text-sm line-clamp-1">{institucion.ubicacion}</span>
                            </div>
                          )}
                          {institucion.contacto?.telefono && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-blue-400 flex-shrink-0" />
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
                            <p className="text-xs text-blue-600 mb-1">Áreas de investigación</p>
                            <p className="text-sm text-blue-700 line-clamp-2">
                              {institucion.areasInvestigacion.slice(0, 2).join(', ')}
                              {institucion.areasInvestigacion.length > 2 && ` +${institucion.areasInvestigacion.length - 2} más`}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    
                    {/* Footer minimalista */}
                    <CardFooter className="border-t-2 border-blue-100 flex justify-center py-4 px-6 bg-gradient-to-r from-blue-50/50 via-indigo-50/30 to-blue-50/50 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="w-full relative z-10">
                        {institucion.contacto?.email && (
                          <div className="flex items-center gap-2 mb-3 text-sm text-blue-600">
                            <Mail className="h-4 w-4 text-blue-400 flex-shrink-0" />
                            <span className="truncate">{institucion.contacto.email}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <AnimatedButton
                            variant="outline"
                            size="sm"
                            className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50 text-sm"
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
                              className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50 text-sm"
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

            {/* Controles de paginación */}
            {totalPages > 1 && (
              <div className="flex flex-col items-center justify-center gap-4 mt-8 sm:mt-10">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Anterior</span>
                  </Button>

                  <div className="flex items-center gap-1 sm:gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      // Mostrar todas las páginas si son 7 o menos
                      if (totalPages <= 7) {
                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => goToPage(page)}
                            className={`min-w-[40px] ${
                              currentPage === page
                                ? "bg-blue-600 hover:bg-blue-700 text-white"
                                : ""
                            }`}
                          >
                            {page}
                          </Button>
                        )
                      }

                      // Si hay más de 7 páginas, mostrar lógica de elipsis
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => goToPage(page)}
                            className={`min-w-[40px] ${
                              currentPage === page
                                ? "bg-blue-600 hover:bg-blue-700 text-white"
                                : ""
                            }`}
                          >
                            {page}
                          </Button>
                        )
                      }

                      // Mostrar elipsis
                      if (page === currentPage - 2 || page === currentPage + 2) {
                        return (
                          <span key={page} className="px-2 text-blue-600">
                            ...
                          </span>
                        )
                      }

                      return null
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1"
                  >
                    <span className="hidden sm:inline">Siguiente</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                <p className="text-sm text-blue-600">
                  Mostrando {startIndex + 1} - {Math.min(endIndex, instituciones.length)} de {instituciones.length} instituciones
                </p>
              </div>
            )}
          </>
        )}
      </div>
      </div>
    </div>
  )
}
