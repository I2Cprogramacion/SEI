"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import {
  ArrowLeft,
  Building,
  Calendar,
  ExternalLink,
  FileDown,
  Globe2,
  Landmark,
  MapPin,
  Mail,
  Phone,
  ScrollText,
  User,
  Users
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AnimatedCard } from "@/components/ui/animated-card"
import { AnimatedButton } from "@/components/ui/animated-button"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const DOCUMENT_INFO: Record<string, { label: string; description: string; icon: string; category: 'fiscal' | 'legal' | 'identidad' }> = {
  constanciaSituacionFiscal: {
    label: "Constancia de Situación Fiscal",
    description: "Documento oficial del SAT que acredita la situación fiscal vigente",
    icon: "📋",
    category: "fiscal"
  },
  actaConstitutiva: {
    label: "Acta Constitutiva",
    description: "Documento notarial de constitución de la persona moral",
    icon: "📜",
    category: "legal"
  },
  poderRepresentante: {
    label: "Poder del Representante",
    description: "Documento que acredita las facultades del representante legal",
    icon: "⚖️",
    category: "legal"
  },
  comprobanteDomicilio: {
    label: "Comprobante de Domicilio",
    description: "Recibo de servicios o constancia de domicilio fiscal",
    icon: "🏠",
    category: "fiscal"
  },
  identificacionOficial: {
    label: "Identificación Oficial",
    description: "INE, pasaporte o cédula profesional del representante",
    icon: "🪪",
    category: "identidad"
  }
}

const CATEGORY_STYLES = {
  fiscal: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", badge: "bg-emerald-100 text-emerald-800" },
  legal: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", badge: "bg-blue-100 text-blue-800" },
  identidad: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", badge: "bg-amber-100 text-amber-800" }
}

const DOCUMENT_LABELS: Record<string, string> = {
  constanciaSituacionFiscal: "Constancia de situación fiscal",
  actaConstitutiva: "Acta constitutiva",
  poderRepresentante: "Poder del representante",
  comprobanteDomicilio: "Comprobante de domicilio",
  identificacionOficial: "Identificación oficial"
}

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  APROBADA: {
    label: "Aprobada",
    className: "bg-emerald-50 text-emerald-700 border border-emerald-200"
  },
  PENDIENTE: {
    label: "Pendiente",
    className: "bg-amber-50 text-amber-700 border border-amber-200"
  },
  RECHAZADA: {
    label: "Rechazada",
    className: "bg-rose-50 text-rose-700 border border-rose-200"
  }
}

type ContactoInstitucional = {
  nombreContacto?: string
  cargo?: string
  telefono?: string
  email?: string
  extension?: string
}

type DomicilioFiscal = {
  calle?: string
  numeroExterior?: string
  numeroInterior?: string
  colonia?: string
  codigoPostal?: string
  municipio?: string
  estado?: string
  pais?: string
}

type RepresentanteLegal = {
  nombre?: string
  cargo?: string
  rfc?: string
  telefono?: string
  email?: string
}

type Institucion = {
  id: string
  nombre: string
  siglas?: string | null
  tipo?: string | null
  tipoOtroEspecificar?: string | null
  descripcion?: string | null
  añoFundacion?: number | null
  sitioWeb?: string | null
  imagenUrl?: string | null
  tipoPersona?: string | null
  rfc?: string | null
  razonSocial?: string | null
  regimenFiscal?: string | null
  actividadEconomica?: string | null
  curp?: string | null
  nombreCompleto?: string | null
  numeroEscritura?: string | null
  fechaConstitucion?: string | null
  notarioPublico?: string | null
  numeroNotaria?: string | null
  registroPublico?: string | null
  objetoSocial?: string | null
  domicilioFiscal?: DomicilioFiscal | null
  representanteLegal?: RepresentanteLegal | null
  contactoInstitucional?: ContactoInstitucional | null
  areasInvestigacion: string[]
  capacidadInvestigacion?: string | null
  documentos: Record<string, string>
  ubicacion?: string | null
  estado: string
  activo: boolean
  createdAt?: string | null
  updatedAt?: string | null
}

type PerfilInvestigador = {
  id: string
  nombre_completo: string
  institucion_id?: string | null
  institucion?: string | null
}

const documentLabel = (key: string) => {
  return (
    DOCUMENT_LABELS[key] ||
    key
      .replace(/([A-Z])/g, " $1")
      .replace(/_/g, " ")
      .replace(/^./, (c) => c.toUpperCase())
      .trim()
  )
}

const formatDate = (value?: string | null) => {
  if (!value) return "Sin registro"
  try {
    return new Intl.DateTimeFormat("es-MX", { dateStyle: "medium" }).format(new Date(value))
  } catch {
    return value
  }
}

const formatPhone = (phone?: string | null, extension?: string | null) => {
  if (!phone) return ""
  const formatted = phone.replace(/\D/g, "")
  if (formatted.length === 10) {
    const first = formatted.slice(0, 2)
    const middle = formatted.slice(2, 6)
    const last = formatted.slice(6)
    return `${first} ${middle} ${last}${extension ? ` ext. ${extension}` : ""}`
  }
  return `${phone}${extension ? ` ext. ${extension}` : ""}`
}

const formatAddress = (domicilio?: DomicilioFiscal | null) => {
  if (!domicilio) return ""
  const parts = [
    domicilio.calle,
    domicilio.numeroExterior,
    domicilio.numeroInterior ? `Int. ${domicilio.numeroInterior}` : undefined,
    domicilio.colonia
  ].filter(Boolean)
  const location = [domicilio.municipio, domicilio.estado, domicilio.codigoPostal]
    .filter(Boolean)
    .join(", ")
  const address = parts.join(" ")
  return [address, location, domicilio.pais].filter(Boolean).join(" · ")
}

function AlertCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-blue-700">
      <p className="font-semibold text-blue-900">{title}</p>
      <p className="text-sm mt-1">{description}</p>
    </div>
  )
}

export default function InstitucionDetallePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [institucion, setInstitucion] = useState<Institucion | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, isLoaded } = useUser()
  const [perfil, setPerfil] = useState<PerfilInvestigador | null>(null)
  const [inscribiendo, setInscribiendo] = useState(false)
  const [mostrandoConfirmacionRegistro, setMostrandoConfirmacionRegistro] = useState(false)
  const [mostrandoConfirmacionSalida, setMostrandoConfirmacionSalida] = useState(false)

  useEffect(() => {
    const fetchInstitucion = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/instituciones/${params.id}`, { cache: "no-store" })
        if (!response.ok) {
          if (response.status === 404) {
            setError("La institución no existe o fue removida")
            return
          }
          const data = await response.json().catch(() => ({}))
          throw new Error(data.error || "Error al obtener la institución")
        }
        const data = await response.json()
        setInstitucion(data.institucion)
        setError(null)
      } catch (err) {
        console.error("Error al cargar institución", err)
        const message = err instanceof Error ? err.message : "Error al obtener la institución"
        setError(message)
        toast.error(message)
      } finally {
        setLoading(false)
      }
    }

    fetchInstitucion()
  }, [params.id])

  useEffect(() => {
    const obtenerPerfil = async () => {
      if (!isLoaded) return
      if (!user) {
        setPerfil(null)
        return
      }
      try {
        const response = await fetch("/api/investigadores/perfil", { cache: "no-store" })
        if (!response.ok) {
          // Si no hay perfil o hay error, no bloqueamos UI
          return
        }
        const data = await response.json()
        if (data?.data) {
          const perfilData = data.data as PerfilInvestigador
          setPerfil({
            id: String(perfilData.id ?? ""),
            nombre_completo: perfilData.nombre_completo ?? "",
            institucion_id: perfilData.institucion_id ?? null,
            institucion: perfilData.institucion ?? null
          })
        }
      } catch (err) {
        console.warn("No se pudo obtener el perfil del investigador", err)
      }
    }

    obtenerPerfil()
  }, [user, isLoaded])

  const yaRegistrado = useMemo(() => {
    if (!perfil || !institucion) return false
    return perfil.institucion_id === institucion.id
  }, [perfil, institucion])

  const manejarRegistro = async () => {
    if (!institucion) return
    if (!user) {
      toast.error("Inicia sesión para completar tu registro")
      router.push("/iniciar-sesion")
      return
    }
    if (!perfil) {
      toast.error("Necesitamos tu perfil de investigador para completar el registro")
      router.push("/dashboard/editar-perfil")
      return
    }
    if (yaRegistrado) {
      toast.success("Ya estás registrado en esta institución")
      return
    }

    setMostrandoConfirmacionRegistro(true)
  }

  const confirmarRegistro = async () => {
    if (!institucion) return

    try {
      setInscribiendo(true)
      setMostrandoConfirmacionRegistro(false)
      toast.loading("Registrando en la institución...", { id: "registro-institucion" })
      const response = await fetch("/api/investigadores/actualizar", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          institucion_id: institucion.id,
          institucion: institucion.nombre
        })
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        const msg = data?.error || "No se pudo registrar la institución"
        toast.error(msg, { id: "registro-institucion" })
        return
      }

      toast.success("¡Te registraste en la institución exitosamente!", { id: "registro-institucion" })
      setPerfil((prev) => (
        prev
          ? { ...prev, institucion_id: institucion.id, institucion: institucion.nombre }
          : { id: "", nombre_completo: "", institucion_id: institucion.id, institucion: institucion.nombre }
      ))
    } catch (err) {
      console.error("Error al registrar institución", err)
      toast.error("Ocurrió un error al registrarte. Inténtalo más tarde", { id: "registro-institucion" })
    } finally {
      setInscribiendo(false)
    }
  }

  const manejarSalida = () => {
    if (!institucion) return
    if (!perfil || !yaRegistrado) {
      toast.error("No estás vinculado a esta institución")
      return
    }
    setMostrandoConfirmacionSalida(true)
  }

  const confirmarSalida = async () => {
    if (!institucion) return

    try {
      setInscribiendo(true)
      setMostrandoConfirmacionSalida(false)
      toast.loading("Eliminando vínculo...", { id: "salida-institucion" })
      const response = await fetch("/api/investigadores/actualizar", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          institucion_id: null,
          institucion: ""
        })
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        const msg = data?.error || "No se pudo eliminar el vínculo"
        toast.error(msg, { id: "salida-institucion" })
        return
      }

      toast.success("Se eliminó tu registro en la institución", { id: "salida-institucion" })
      setPerfil((prev) => (
        prev ? { ...prev, institucion_id: null, institucion: null } : null
      ))
    } catch (err) {
      console.error("Error al eliminar vínculo", err)
      toast.error("Ocurrió un error al desvincularte", { id: "salida-institucion" })
    } finally {
      setInscribiendo(false)
    }
  }

  const statusStyle = useMemo(() => {
    if (!institucion) return null
    return STATUS_STYLES[institucion.estado?.toUpperCase()] || STATUS_STYLES.PENDIENTE
  }, [institucion])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="space-y-6 max-w-5xl mx-auto">
          <div className="h-4 w-32 bg-blue-100 rounded animate-pulse" />
          <div className="h-10 w-64 bg-blue-100 rounded animate-pulse" />
          <div className="h-64 w-full bg-blue-100 rounded-xl animate-pulse" />
          <div className="grid gap-4 md:grid-cols-2">
            {[...Array(4)].map((_, idx) => (
              <div key={idx} className="h-40 bg-blue-50 rounded-lg border border-blue-100 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !institucion) {
    return (
      <div className="container mx-auto px-4 py-16 text-center space-y-6">
        <h1 className="text-3xl font-semibold text-blue-900">Institución no disponible</h1>
        <p className="text-blue-600">{error || "No encontramos la información solicitada."}</p>
        <AnimatedButton className="bg-blue-700 hover:bg-blue-800 text-white" onClick={() => router.push("/instituciones")}> 
          <ArrowLeft className="h-4 w-4 mr-2" /> Volver al listado
        </AnimatedButton>
      </div>
    )
  }

  const documentos = Object.entries(institucion.documentos || {}).filter(([, url]) => !!url)
  const direccion = formatAddress(institucion.domicilioFiscal)
  const contacto = institucion.contactoInstitucional

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="container mx-auto px-4 py-10 max-w-6xl space-y-8">
        <div className="flex items-center gap-3">
          <AnimatedButton variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Volver
          </AnimatedButton>
        </div>

        <AnimatedCard className="overflow-hidden bg-white border-blue-100">
          <div className="relative flex items-center justify-center h-[320px] w-full bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
            {institucion.imagenUrl ? (
              <Image
                src={institucion.imagenUrl}
                alt={`Imagen institucional de ${institucion.nombre}`}
                fill
                className="object-contain p-6"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
              />
            ) : (
              <div className="text-center text-blue-600">
                <Building className="h-16 w-16 mx-auto mb-3" />
                <p className="text-sm">Esta institución aún no ha cargado una imagen</p>
              </div>
            )}
          </div>

          <CardHeader className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              {institucion.tipo && (
                <Badge className="bg-blue-700 text-white">{institucion.tipo}</Badge>
              )}
              {statusStyle && (
                <Badge className={statusStyle.className}>{statusStyle.label}</Badge>
              )}
              {institucion.siglas && (
                <Badge variant="outline" className="text-blue-600 border-blue-200">
                  {institucion.siglas}
                </Badge>
              )}
            </div>
            <div>
              <CardTitle className="text-3xl text-blue-950 mb-1">{institucion.nombre}</CardTitle>
              <p className="text-blue-600 text-sm">
                Registrada: {formatDate(institucion.createdAt)}
                {institucion.añoFundacion ? ` · Fundada en ${institucion.añoFundacion}` : ""}
              </p>
            </div>
            {institucion.descripcion && (
              <p className="text-blue-700 leading-relaxed bg-blue-50/60 border border-blue-100 rounded-lg p-4">
                {institucion.descripcion}
              </p>
            )}
          </CardHeader>
        </AnimatedCard>

        <div className="grid gap-6 md:grid-cols-2">
          <AnimatedCard className="bg-white border-blue-100" delay={100}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900 text-lg">
                <MapPin className="h-5 w-5" /> Ubicación y contacto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-blue-700">
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-1 text-blue-500" />
                <div>
                  <p className="font-medium">Dirección</p>
                  <p>{direccion || "No proporcionada"}</p>
                </div>
              </div>

              {contacto?.telefono && (
                <div className="flex items-start gap-3">
                  <Phone className="h-4 w-4 mt-1 text-blue-500" />
                  <div>
                    <p className="font-medium">Teléfono</p>
                    <p>{formatPhone(contacto.telefono, contacto.extension)}</p>
                  </div>
                </div>
              )}

              {contacto?.email && (
                <div className="flex items-start gap-3">
                  <Mail className="h-4 w-4 mt-1 text-blue-500" />
                  <div>
                    <p className="font-medium">Correo de contacto</p>
                    <Link className="text-blue-600 hover:underline" href={`mailto:${contacto.email}`}>
                      {contacto.email}
                    </Link>
                  </div>
                </div>
              )}

              {contacto?.nombreContacto && (
                <div className="flex items-start gap-3">
                  <Users className="h-4 w-4 mt-1 text-blue-500" />
                  <div>
                    <p className="font-medium">Contacto institucional</p>
                    <p>{contacto.nombreContacto}{contacto.cargo ? ` · ${contacto.cargo}` : ""}</p>
                  </div>
                </div>
              )}

              {institucion.sitioWeb && (
                <AnimatedButton
                  variant="outline"
                  className="border-blue-200 text-blue-700 hover:bg-blue-50"
                  onClick={() => window.open(institucion.sitioWeb!, "_blank")}
                >
                  <Globe2 className="h-4 w-4 mr-2" /> Visitar sitio web
                </AnimatedButton>
              )}
            </CardContent>
          </AnimatedCard>

          <AnimatedCard className="bg-white border-blue-100" delay={130}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900 text-lg">
                <Users className="h-5 w-5" /> Únete a esta institución
              </CardTitle>
              <p className="text-sm text-blue-600">Vincula tu perfil para aparecer como investigador afiliado</p>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-blue-700">
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500" />
                  Conectarás tu perfil de investigador con la institución.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500" />
                  Aparecerás en listados y buscadores como miembro de esta entidad.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500" />
                  Podrás recibir notificaciones o convocatorias específicas.
                </li>
              </ul>

              {yaRegistrado ? (
                <div className="space-y-3">
                  <AlertCard
                    title="Ya formas parte"
                    description="Tu perfil ya está vinculado a esta institución."
                  />
                  <Button
                    variant="outline"
                    className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
                    onClick={manejarSalida}
                    disabled={inscribiendo}
                  >
                    Abandonar institución
                  </Button>
                </div>
              ) : (
                <Button
                  className="w-full bg-blue-700 hover:bg-blue-800 text-white"
                  onClick={manejarRegistro}
                  disabled={inscribiendo}
                >
                  {inscribiendo ? "Registrando..." : user ? "Registrarme en esta institución" : "Inicia sesión para registrarte"}
                </Button>
              )}

              {!user && (
                <p className="text-xs text-blue-500 text-center">
                  Debes iniciar sesión para vincular tu perfil.
                </p>
              )}
            </CardContent>
          </AnimatedCard>

          <AnimatedCard className="bg-white border-blue-100" delay={150}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900 text-lg">
                <ScrollText className="h-5 w-5" /> Información fiscal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-blue-700">
              <div>
                <p className="font-medium">Tipo de persona</p>
                <p>{institucion.tipoPersona ? institucion.tipoPersona.toUpperCase() : "No especificado"}</p>
              </div>
              {institucion.rfc && (
                <div>
                  <p className="font-medium">RFC</p>
                  <p>{institucion.rfc}</p>
                </div>
              )}
              {institucion.razonSocial && (
                <div>
                  <p className="font-medium">Razón social</p>
                  <p>{institucion.razonSocial}</p>
                </div>
              )}
              {institucion.regimenFiscal && (
                <div>
                  <p className="font-medium">Régimen fiscal</p>
                  <p>{institucion.regimenFiscal}</p>
                </div>
              )}
              {institucion.actividadEconomica && (
                <div>
                  <p className="font-medium">Actividad económica</p>
                  <p>{institucion.actividadEconomica}</p>
                </div>
              )}
            </CardContent>
          </AnimatedCard>

          <AnimatedCard className="bg-white border-blue-100" delay={180}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900 text-lg">
                <Building className="h-5 w-5" /> Capacidades y áreas de investigación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-blue-700">
              {institucion.capacidadInvestigacion && (
                <div className="bg-blue-50/60 border border-blue-100 rounded-lg p-4">
                  <p className="font-medium text-blue-900 mb-1">Capacidad de investigación</p>
                  <p className="leading-relaxed">{institucion.capacidadInvestigacion}</p>
                </div>
              )}

              {institucion.areasInvestigacion.length > 0 && (
                <div className="space-y-2">
                  <p className="font-medium text-blue-900">Áreas de investigación</p>
                  <div className="flex flex-wrap gap-2">
                    {institucion.areasInvestigacion.map((area) => (
                      <Badge key={area} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </AnimatedCard>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {institucion.representanteLegal && (
            <AnimatedCard className="bg-white border-blue-100" delay={200}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900 text-lg">
                  <User className="h-5 w-5" /> Representante legal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-blue-700">
                {institucion.representanteLegal.nombre && (
                  <p><span className="font-medium">Nombre:</span> {institucion.representanteLegal.nombre}</p>
                )}
                {institucion.representanteLegal.cargo && (
                  <p><span className="font-medium">Cargo:</span> {institucion.representanteLegal.cargo}</p>
                )}
                {institucion.representanteLegal.rfc && (
                  <p><span className="font-medium">RFC:</span> {institucion.representanteLegal.rfc}</p>
                )}
                {institucion.representanteLegal.email && (
                  <p>
                    <span className="font-medium">Correo:</span>{" "}
                    <Link href={`mailto:${institucion.representanteLegal.email}`} className="text-blue-600 hover:underline">
                      {institucion.representanteLegal.email}
                    </Link>
                  </p>
                )}
                {institucion.representanteLegal.telefono && (
                  <p><span className="font-medium">Teléfono:</span> {formatPhone(institucion.representanteLegal.telefono)}</p>
                )}
              </CardContent>
            </AnimatedCard>
          )}

          <AnimatedCard className="bg-white border-blue-100" delay={240}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900 text-lg">
                <Landmark className="h-5 w-5" /> Constitución y registros
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-blue-700">
              {institucion.numeroEscritura && (
                <p><span className="font-medium">Número de escritura:</span> {institucion.numeroEscritura}</p>
              )}
              {institucion.fechaConstitucion && (
                <p><span className="font-medium">Fecha de constitución:</span> {formatDate(institucion.fechaConstitucion)}</p>
              )}
              {institucion.notarioPublico && (
                <p><span className="font-medium">Notario público:</span> {institucion.notarioPublico}</p>
              )}
              {institucion.numeroNotaria && (
                <p><span className="font-medium">Número de notaría:</span> {institucion.numeroNotaria}</p>
              )}
              {institucion.registroPublico && (
                <p><span className="font-medium">Registro público:</span> {institucion.registroPublico}</p>
              )}
              {institucion.objetoSocial && (
                <p className="leading-relaxed"><span className="font-medium">Objeto social:</span> {institucion.objetoSocial}</p>
              )}
            </CardContent>
          </AnimatedCard>
        </div>

        {documentos.length > 0 && (
          <AnimatedCard className="bg-white border-blue-100" delay={320}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-blue-900 text-lg">
                  <FileDown className="h-5 w-5" /> Documentación Disponible
                </CardTitle>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {documentos.length} {documentos.length === 1 ? 'documento' : 'documentos'}
                </Badge>
              </div>
              <p className="text-sm text-slate-500 mt-1">
                Documentos oficiales verificados de la institución
              </p>
            </CardHeader>
            <CardContent className="pt-4">
              {/* Agrupación por categoría */}
              {(['fiscal', 'legal', 'identidad'] as const).map(categoria => {
                const docsCategoria = documentos.filter(([key]) => 
                  DOCUMENT_INFO[key]?.category === categoria
                )
                if (docsCategoria.length === 0) return null
                
                const categoryNames = {
                  fiscal: 'Documentos Fiscales',
                  legal: 'Documentos Legales', 
                  identidad: 'Identificación'
                }
                
                return (
                  <div key={categoria} className="mb-6 last:mb-0">
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`h-1 w-1 rounded-full ${CATEGORY_STYLES[categoria].text.replace('text-', 'bg-')}`} />
                      <h4 className={`text-sm font-semibold ${CATEGORY_STYLES[categoria].text}`}>
                        {categoryNames[categoria]}
                      </h4>
                      <div className="flex-1 h-px bg-slate-200" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {docsCategoria.map(([key, url]) => {
                        const info = DOCUMENT_INFO[key]
                        const styles = info ? CATEGORY_STYLES[info.category] : CATEGORY_STYLES.fiscal
                        
                        return (
                          <div
                            key={key}
                            className={`group relative rounded-xl border-2 ${styles.border} ${styles.bg} p-4 transition-all duration-200 hover:shadow-md hover:scale-[1.02] cursor-pointer`}
                            onClick={() => window.open(url, "_blank")}
                          >
                            {/* Icono y título */}
                            <div className="flex items-start gap-3">
                              <div className="text-2xl flex-shrink-0">
                                {info?.icon || '📄'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h5 className={`font-semibold text-sm ${styles.text} leading-tight`}>
                                  {info?.label || documentLabel(key)}
                                </h5>
                                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                  {info?.description || 'Documento oficial'}
                                </p>
                              </div>
                            </div>
                            
                            {/* Acción de ver documento */}
                            <div className="mt-3 flex items-center justify-end">
                              <span className="inline-flex items-center gap-1 text-xs text-slate-400 group-hover:text-blue-600 transition-colors">
                                <ExternalLink className="w-3 h-3" />
                                Ver documento
                              </span>
                            </div>
                            
                            {/* Hover overlay */}
                            <div className="absolute inset-0 rounded-xl bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
              
              {/* Documentos sin categoría (fallback) */}
              {documentos.filter(([key]) => !DOCUMENT_INFO[key]).length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <h4 className="text-sm font-semibold text-slate-600 mb-3">Otros documentos</h4>
                  <div className="flex flex-wrap gap-2">
                    {documentos.filter(([key]) => !DOCUMENT_INFO[key]).map(([key, url]) => (
                      <Button
                        key={key}
                        variant="outline"
                        size="sm"
                        className="border-slate-200 text-slate-700 hover:bg-slate-50"
                        onClick={() => window.open(url, "_blank")}
                      >
                        <FileDown className="h-4 w-4 mr-2" /> {documentLabel(key)}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </AnimatedCard>
        )}
      </div>

      <Dialog open={mostrandoConfirmacionRegistro} onOpenChange={setMostrandoConfirmacionRegistro}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>¿Te unes a esta institución?</DialogTitle>
            <DialogDescription>
              Confirma que perteneces a <span className="font-semibold text-blue-900">{institucion.nombre}</span> y deseas vincular tu perfil.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-end gap-2">
            <Button variant="outline" onClick={() => setMostrandoConfirmacionRegistro(false)} disabled={inscribiendo}>
              Cancelar
            </Button>
            <Button className="bg-blue-700 hover:bg-blue-800 text-white" onClick={confirmarRegistro} disabled={inscribiendo}>
              Sí, pertenezco a esta institución
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={mostrandoConfirmacionSalida} onOpenChange={setMostrandoConfirmacionSalida}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Abandonar institución</DialogTitle>
            <DialogDescription>
              Esta acción desvinculará tu perfil de <span className="font-semibold text-blue-900">{institucion.nombre}</span>. Podrás volver a registrarte más adelante.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-end gap-2">
            <Button variant="outline" onClick={() => setMostrandoConfirmacionSalida(false)} disabled={inscribiendo}>
              Cancelar
            </Button>
            <Button className="bg-rose-600 hover:bg-rose-700 text-white" onClick={confirmarSalida} disabled={inscribiendo}>
              Sí, abandonar institución
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


