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
    <div className="container mx-auto py-8 px-4">
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
          <AnimatedCard className="bg-white border-blue-100 text-center" delay={100}>
            <CardContent className="pt-6">
              <Building className="h-8 w-8 mx-auto text-blue-600 mb-2 animate-float" />
              <div className="text-2xl font-bold text-blue-900">{loading ? "..." : stats.total}</div>
              <p className="text-sm text-blue-600">Instituciones</p>
            </CardContent>
          </AnimatedCard>
          <AnimatedCard className="bg-white border-blue-100 text-center" delay={200}>
            <CardContent className="pt-6">
              <CheckCircle2 className="h-8 w-8 mx-auto text-blue-600 mb-2 animate-float" />
              <div className="text-2xl font-bold text-blue-900">{loading ? "..." : stats.activas}</div>
              <p className="text-sm text-blue-600">Instituciones activas</p>
            </CardContent>
          </AnimatedCard>
          <AnimatedCard className="bg-white border-blue-100 text-center" delay={300}>
            <CardContent className="pt-6">
              <Clock className="h-8 w-8 mx-auto text-blue-600 mb-2 animate-float" />
              <div className="text-2xl font-bold text-blue-900">{loading ? "..." : stats.enRevision}</div>
              <p className="text-sm text-blue-600">En revisión</p>
            </CardContent>
          </AnimatedCard>
          <AnimatedCard className="bg-white border-blue-100 text-center" delay={400}>
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
          <AnimatedCard className="bg-white border-blue-100" delay={300}>
            <CardContent className="pt-6 text-center py-12">
              <Building className="h-12 w-12 mx-auto text-blue-300 mb-4 animate-float" />
              <h3 className="text-lg font-semibold mb-2 text-blue-900">No hay instituciones registradas</h3>
              <p className="text-sm text-blue-600">En cuanto se registre la primera institución aparecerá aquí.</p>
            </CardContent>
          </AnimatedCard>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {instituciones.map((institucion, index) => {
              const estado = estadoConfig(institucion.estado, institucion.activo)

              return (
                <AnimatedCard key={institucion.id} className="bg-white border-blue-100" delay={index * 80}>
                  <div className="relative flex items-center justify-center h-44 w-full overflow-hidden rounded-t-lg bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
                    {institucion.imagenUrl ? (
                      <Image
                        src={institucion.imagenUrl}
                        alt={`Imagen de ${institucion.nombre}`}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-blue-900/50">
                        <span className="text-4xl font-bold uppercase tracking-wide">
                          {getInitials(institucion.siglas || institucion.nombre)}
                        </span>
                        {institucion.siglas && (
                          <span className="text-xs mt-2">{institucion.siglas}</span>
                        )}
                      </div>
                    )}
                  </div>

                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          {institucion.tipo && (
                            <AnimatedBadge className="bg-blue-700 text-white">
                              {institucion.tipo}
                            </AnimatedBadge>
                          )}
                          <Badge variant="outline" className={`text-xs ${estado.className}`}>
                            {estado.label}
                          </Badge>
                        </div>
                        <CardTitle className="text-xl text-blue-900 leading-tight">
                          {institucion.nombre}
                        </CardTitle>
                        <CardDescription className="text-blue-600 mt-1 space-y-1">
                          <span>
                            {institucion.añoFundacion
                              ? `Fundada en ${institucion.añoFundacion}`
                              : "Año de fundación no disponible"}
                          </span>
                          {institucion.tipoOtroEspecificar && (
                            <span className="block text-xs text-blue-500">
                              Especialidad: {institucion.tipoOtroEspecificar}
                            </span>
                          )}
                        </CardDescription>
                      </div>
                      {institucion.contacto?.email && (
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                          <Mail className="h-3 w-3 mr-1" /> {institucion.contacto.email}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-4 text-sm text-blue-700">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{institucion.ubicacion || "Ubicación por confirmar"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>Registrada: {formatDate(institucion.createdAt)}</span>
                        </div>
                        {institucion.contacto?.telefono && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <span>
                              {institucion.contacto.telefono}
                              {institucion.contacto.extension ? ` ext. ${institucion.contacto.extension}` : ""}
                            </span>
                          </div>
                        )}
                        {institucion.contacto?.nombreContacto && (
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>
                              {institucion.contacto.nombreContacto}
                              {institucion.contacto.cargo ? ` • ${institucion.contacto.cargo}` : ""}
                            </span>
                          </div>
                        )}
                      </div>

                      {institucion.descripcion && (
                        <p className="leading-relaxed text-blue-600 bg-blue-50/60 border border-blue-100 rounded-lg p-3">
                          {institucion.descripcion}
                        </p>
                      )}

                      {institucion.areasInvestigacion.length > 0 && (
                        <div>
                          <h4 className="font-medium text-blue-900 mb-2">Áreas de investigación</h4>
                          <div className="flex flex-wrap gap-2">
                            {institucion.areasInvestigacion.slice(0, 6).map((area, idx) => (
                              <AnimatedBadge
                                key={idx}
                                variant="secondary"
                                interactive
                                className="bg-blue-50 text-blue-700 text-xs"
                              >
                                {area}
                              </AnimatedBadge>
                            ))}
                            {institucion.areasInvestigacion.length > 6 && (
                              <AnimatedBadge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
                                +{institucion.areasInvestigacion.length - 6} más
                              </AnimatedBadge>
                            )}
                          </div>
                        </div>
                      )}

                    </div>
                  </CardContent>

                  <CardFooter className="border-t border-blue-100 flex justify-between">
                    <AnimatedButton
                      variant="outline"
                      className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-transparent"
                      asChild
                    >
                      <Link href={`/instituciones/${institucion.id}`}>
                        <GraduationCap className="mr-2 h-4 w-4" />
                        Ver detalles
                      </Link>
                    </AnimatedButton>
                    <AnimatedButton
                      variant="outline"
                      className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-transparent"
                      onClick={() => institucion.sitioWeb && window.open(institucion.sitioWeb, "_blank")}
                      disabled={!institucion.sitioWeb}
                    >
                      <Globe2 className="mr-2 h-4 w-4" />
                      Sitio web
                    </AnimatedButton>
                  </CardFooter>
                </AnimatedCard>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
