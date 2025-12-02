"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Save, Loader2, Building, FileText, MapPin, User, AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

interface Institucion {
  id: string
  nombre: string
  siglas: string | null
  tipo: string | null
  tipoOtroEspecificar: string | null
  añoFundacion: number | null
  sitioWeb: string | null
  imagenUrl: string | null
  descripcion: string | null
  tipoPersona: string | null
  rfc: string | null
  razonSocial: string | null
  regimenFiscal: string | null
  actividadEconomica: string | null
  curp: string | null
  nombreCompleto: string | null
  numeroEscritura: string | null
  fechaConstitucion: string | null
  notarioPublico: string | null
  numeroNotaria: string | null
  registroPublico: string | null
  objetoSocial: string | null
  domicilioFiscal: {
    calle?: string
    numeroExterior?: string
    numeroInterior?: string
    colonia?: string
    codigoPostal?: string
    municipio?: string
    estado?: string
    pais?: string
  } | null
  representanteLegal: {
    nombre?: string
    cargo?: string
    rfc?: string
    telefono?: string
    email?: string
  } | null
  contactoInstitucional: {
    nombreContacto?: string
    cargo?: string
    telefono?: string
    email?: string
    extension?: string
  } | null
  areasInvestigacion: string[]
  capacidadInvestigacion: string | null
  documentos: Record<string, string>
  ubicacion: string | null
  activo: boolean
  estado: string
}

export default function EditarInstitucionPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [institucion, setInstitucion] = useState<Institucion | null>(null)

  // Formulario
  const [formData, setFormData] = useState({
    nombre: "",
    siglas: "",
    tipo: "",
    tipoOtroEspecificar: "",
    añoFundacion: "",
    sitioWeb: "",
    descripcion: "",
    tipoPersona: "moral",
    rfc: "",
    razonSocial: "",
    regimenFiscal: "",
    actividadEconomica: "",
    curp: "",
    nombreCompleto: "",
    capacidadInvestigacion: "",
    ubicacion: "",
    activo: true,
    estado: "PENDIENTE",
    // Domicilio
    domicilioCalle: "",
    domicilioNumeroExterior: "",
    domicilioNumeroInterior: "",
    domicilioColonia: "",
    domicilioCodigoPostal: "",
    domicilioMunicipio: "",
    domicilioEstado: "",
    // Contacto
    contactoNombre: "",
    contactoCargo: "",
    contactoTelefono: "",
    contactoEmail: "",
    contactoExtension: "",
    // Representante legal
    representanteNombre: "",
    representanteCargo: "",
    representanteRfc: "",
    representanteTelefono: "",
    representanteEmail: "",
  })

  // Cargar datos de la institución
  useEffect(() => {
    const fetchInstitucion = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/instituciones/${id}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Institución no encontrada")
          }
          throw new Error("Error al cargar la institución")
        }

        const data = await response.json()
        const inst = data.institucion

        setInstitucion(inst)
        
        // Llenar el formulario con los datos
        setFormData({
          nombre: inst.nombre || "",
          siglas: inst.siglas || "",
          tipo: inst.tipo || "",
          tipoOtroEspecificar: inst.tipoOtroEspecificar || "",
          añoFundacion: inst.añoFundacion?.toString() || "",
          sitioWeb: inst.sitioWeb || "",
          descripcion: inst.descripcion || "",
          tipoPersona: inst.tipoPersona || "moral",
          rfc: inst.rfc || "",
          razonSocial: inst.razonSocial || "",
          regimenFiscal: inst.regimenFiscal || "",
          actividadEconomica: inst.actividadEconomica || "",
          curp: inst.curp || "",
          nombreCompleto: inst.nombreCompleto || "",
          capacidadInvestigacion: inst.capacidadInvestigacion || "",
          ubicacion: inst.ubicacion || "",
          activo: inst.activo ?? true,
          estado: inst.estado || "PENDIENTE",
          // Domicilio
          domicilioCalle: inst.domicilioFiscal?.calle || "",
          domicilioNumeroExterior: inst.domicilioFiscal?.numeroExterior || "",
          domicilioNumeroInterior: inst.domicilioFiscal?.numeroInterior || "",
          domicilioColonia: inst.domicilioFiscal?.colonia || "",
          domicilioCodigoPostal: inst.domicilioFiscal?.codigoPostal || "",
          domicilioMunicipio: inst.domicilioFiscal?.municipio || "",
          domicilioEstado: inst.domicilioFiscal?.estado || "",
          // Contacto
          contactoNombre: inst.contactoInstitucional?.nombreContacto || "",
          contactoCargo: inst.contactoInstitucional?.cargo || "",
          contactoTelefono: inst.contactoInstitucional?.telefono || "",
          contactoEmail: inst.contactoInstitucional?.email || "",
          contactoExtension: inst.contactoInstitucional?.extension || "",
          // Representante
          representanteNombre: inst.representanteLegal?.nombre || "",
          representanteCargo: inst.representanteLegal?.cargo || "",
          representanteRfc: inst.representanteLegal?.rfc || "",
          representanteTelefono: inst.representanteLegal?.telefono || "",
          representanteEmail: inst.representanteLegal?.email || "",
        })

      } catch (err) {
        console.error("Error:", err)
        setError(err instanceof Error ? err.message : "Error desconocido")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchInstitucion()
    }
  }, [id])

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
    setSuccess(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nombre.trim()) {
      setError("El nombre es requerido")
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      // Preparar datos para enviar
      const dataToSend = {
        nombre: formData.nombre,
        siglas: formData.siglas || null,
        tipo: formData.tipo || null,
        tipoOtroEspecificar: formData.tipoOtroEspecificar || null,
        añoFundacion: formData.añoFundacion ? parseInt(formData.añoFundacion) : null,
        sitioWeb: formData.sitioWeb || null,
        descripcion: formData.descripcion || null,
        tipoPersona: formData.tipoPersona,
        rfc: formData.rfc?.toUpperCase() || null,
        razonSocial: formData.razonSocial || null,
        regimenFiscal: formData.regimenFiscal || null,
        actividadEconomica: formData.actividadEconomica || null,
        curp: formData.curp?.toUpperCase() || null,
        nombreCompleto: formData.nombreCompleto || null,
        capacidadInvestigacion: formData.capacidadInvestigacion || null,
        ubicacion: formData.ubicacion || null,
        activo: formData.activo,
        estado: formData.estado,
        domicilioFiscal: {
          calle: formData.domicilioCalle || null,
          numeroExterior: formData.domicilioNumeroExterior || null,
          numeroInterior: formData.domicilioNumeroInterior || null,
          colonia: formData.domicilioColonia || null,
          codigoPostal: formData.domicilioCodigoPostal || null,
          municipio: formData.domicilioMunicipio || null,
          estado: formData.domicilioEstado || null,
        },
        contactoInstitucional: {
          nombreContacto: formData.contactoNombre || null,
          cargo: formData.contactoCargo || null,
          telefono: formData.contactoTelefono || null,
          email: formData.contactoEmail || null,
          extension: formData.contactoExtension || null,
        },
        representanteLegal: {
          nombre: formData.representanteNombre || null,
          cargo: formData.representanteCargo || null,
          rfc: formData.representanteRfc || null,
          telefono: formData.representanteTelefono || null,
          email: formData.representanteEmail || null,
        },
      }

      const response = await fetch(`/api/instituciones/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Error al actualizar")
      }

      setSuccess("Institución actualizada correctamente")
      
      // Redirigir después de 1.5 segundos
      setTimeout(() => {
        router.push("/admin/instituciones")
      }, 1500)

    } catch (err) {
      console.error("Error:", err)
      setError(err instanceof Error ? err.message : "Error al guardar")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-4" />
          <p className="text-blue-600">Cargando institución...</p>
        </div>
      </div>
    )
  }

  if (error && !institucion) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button asChild className="mt-4">
          <Link href="/admin/instituciones">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Instituciones
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" asChild>
          <Link href="/admin/instituciones">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-blue-900">Editar Institución</h1>
          <p className="text-blue-600 text-sm">{institucion?.nombre}</p>
        </div>
        <Badge variant={formData.activo ? "default" : "secondary"}>
          {formData.activo ? "Activa" : "Inactiva"}
        </Badge>
        <Badge variant={
          formData.estado === "APROBADA" ? "default" :
          formData.estado === "PENDIENTE" ? "secondary" : "destructive"
        }>
          {formData.estado}
        </Badge>
      </div>

      {/* Alertas */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert className="mb-4 bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">{success}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="general" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              <span className="hidden sm:inline">General</span>
            </TabsTrigger>
            <TabsTrigger value="fiscal" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Fiscal</span>
            </TabsTrigger>
            <TabsTrigger value="ubicacion" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">Ubicación</span>
            </TabsTrigger>
            <TabsTrigger value="contacto" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Contacto</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab General */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Información General</CardTitle>
                <CardDescription>Datos básicos de la institución</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre *</Label>
                    <Input
                      id="nombre"
                      value={formData.nombre}
                      onChange={(e) => handleChange("nombre", e.target.value)}
                      placeholder="Nombre de la institución"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="siglas">Siglas</Label>
                    <Input
                      id="siglas"
                      value={formData.siglas}
                      onChange={(e) => handleChange("siglas", e.target.value)}
                      placeholder="Ej: UACH, CIMAV"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo de Institución</Label>
                    <Select value={formData.tipo} onValueChange={(v) => handleChange("tipo", v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="universidad_publica">Universidad Pública</SelectItem>
                        <SelectItem value="universidad_privada">Universidad Privada</SelectItem>
                        <SelectItem value="centro_investigacion">Centro de Investigación</SelectItem>
                        <SelectItem value="instituto_tecnologico">Instituto Tecnológico</SelectItem>
                        <SelectItem value="gobierno">Gobierno</SelectItem>
                        <SelectItem value="empresa">Empresa</SelectItem>
                        <SelectItem value="ong">ONG</SelectItem>
                        <SelectItem value="otro">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="añoFundacion">Año de Fundación</Label>
                    <Input
                      id="añoFundacion"
                      type="number"
                      value={formData.añoFundacion}
                      onChange={(e) => handleChange("añoFundacion", e.target.value)}
                      placeholder="Ej: 1954"
                      min="1800"
                      max={new Date().getFullYear()}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sitioWeb">Sitio Web</Label>
                  <Input
                    id="sitioWeb"
                    type="url"
                    value={formData.sitioWeb}
                    onChange={(e) => handleChange("sitioWeb", e.target.value)}
                    placeholder="https://www.ejemplo.edu.mx"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea
                    id="descripcion"
                    value={formData.descripcion}
                    onChange={(e) => handleChange("descripcion", e.target.value)}
                    placeholder="Descripción de la institución..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="estado">Estado de Aprobación</Label>
                    <Select value={formData.estado} onValueChange={(v) => handleChange("estado", v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                        <SelectItem value="APROBADA">Aprobada</SelectItem>
                        <SelectItem value="RECHAZADA">Rechazada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="activo">Estado de Activación</Label>
                    <div className="flex items-center space-x-2 pt-2">
                      <Switch
                        id="activo"
                        checked={formData.activo}
                        onCheckedChange={(v) => handleChange("activo", v)}
                      />
                      <Label htmlFor="activo" className="cursor-pointer">
                        {formData.activo ? "Activa" : "Inactiva"}
                      </Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Fiscal */}
          <TabsContent value="fiscal">
            <Card>
              <CardHeader>
                <CardTitle>Información Fiscal</CardTitle>
                <CardDescription>Datos fiscales y legales de la institución</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tipoPersona">Tipo de Persona</Label>
                    <Select value={formData.tipoPersona} onValueChange={(v) => handleChange("tipoPersona", v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="moral">Persona Moral</SelectItem>
                        <SelectItem value="fisica">Persona Física</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rfc">RFC</Label>
                    <Input
                      id="rfc"
                      value={formData.rfc}
                      onChange={(e) => handleChange("rfc", e.target.value.toUpperCase())}
                      placeholder="RFC de la institución"
                      maxLength={13}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="razonSocial">Razón Social</Label>
                    <Input
                      id="razonSocial"
                      value={formData.razonSocial}
                      onChange={(e) => handleChange("razonSocial", e.target.value)}
                      placeholder="Razón social completa"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="regimenFiscal">Régimen Fiscal</Label>
                    <Select value={formData.regimenFiscal} onValueChange={(v) => handleChange("regimenFiscal", v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar régimen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="601">601 - General de Ley Personas Morales</SelectItem>
                        <SelectItem value="603">603 - Personas Morales con Fines no Lucrativos</SelectItem>
                        <SelectItem value="612">612 - Personas Físicas con Actividades Empresariales</SelectItem>
                        <SelectItem value="626">626 - Régimen Simplificado de Confianza</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="actividadEconomica">Actividad Económica</Label>
                  <Input
                    id="actividadEconomica"
                    value={formData.actividadEconomica}
                    onChange={(e) => handleChange("actividadEconomica", e.target.value)}
                    placeholder="Actividad económica principal"
                  />
                </div>

                {formData.tipoPersona === "fisica" && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="curp">CURP</Label>
                        <Input
                          id="curp"
                          value={formData.curp}
                          onChange={(e) => handleChange("curp", e.target.value.toUpperCase())}
                          placeholder="CURP del titular"
                          maxLength={18}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="nombreCompleto">Nombre Completo</Label>
                        <Input
                          id="nombreCompleto"
                          value={formData.nombreCompleto}
                          onChange={(e) => handleChange("nombreCompleto", e.target.value)}
                          placeholder="Nombre completo del titular"
                        />
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Ubicación */}
          <TabsContent value="ubicacion">
            <Card>
              <CardHeader>
                <CardTitle>Domicilio Fiscal</CardTitle>
                <CardDescription>Dirección de la institución</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="domicilioCalle">Calle</Label>
                    <Input
                      id="domicilioCalle"
                      value={formData.domicilioCalle}
                      onChange={(e) => handleChange("domicilioCalle", e.target.value)}
                      placeholder="Nombre de la calle"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="domicilioNumeroExterior">Número Exterior</Label>
                    <Input
                      id="domicilioNumeroExterior"
                      value={formData.domicilioNumeroExterior}
                      onChange={(e) => handleChange("domicilioNumeroExterior", e.target.value)}
                      placeholder="No. Ext."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="domicilioNumeroInterior">Número Interior</Label>
                    <Input
                      id="domicilioNumeroInterior"
                      value={formData.domicilioNumeroInterior}
                      onChange={(e) => handleChange("domicilioNumeroInterior", e.target.value)}
                      placeholder="No. Int. (opcional)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="domicilioColonia">Colonia</Label>
                    <Input
                      id="domicilioColonia"
                      value={formData.domicilioColonia}
                      onChange={(e) => handleChange("domicilioColonia", e.target.value)}
                      placeholder="Colonia"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="domicilioCodigoPostal">Código Postal</Label>
                    <Input
                      id="domicilioCodigoPostal"
                      value={formData.domicilioCodigoPostal}
                      onChange={(e) => handleChange("domicilioCodigoPostal", e.target.value)}
                      placeholder="C.P."
                      maxLength={5}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="domicilioMunicipio">Municipio</Label>
                    <Input
                      id="domicilioMunicipio"
                      value={formData.domicilioMunicipio}
                      onChange={(e) => handleChange("domicilioMunicipio", e.target.value)}
                      placeholder="Municipio"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="domicilioEstado">Estado</Label>
                    <Input
                      id="domicilioEstado"
                      value={formData.domicilioEstado}
                      onChange={(e) => handleChange("domicilioEstado", e.target.value)}
                      placeholder="Estado"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Contacto */}
          <TabsContent value="contacto">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Contacto Institucional</CardTitle>
                  <CardDescription>Persona de contacto principal</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactoNombre">Nombre del Contacto</Label>
                      <Input
                        id="contactoNombre"
                        value={formData.contactoNombre}
                        onChange={(e) => handleChange("contactoNombre", e.target.value)}
                        placeholder="Nombre completo"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactoCargo">Cargo</Label>
                      <Input
                        id="contactoCargo"
                        value={formData.contactoCargo}
                        onChange={(e) => handleChange("contactoCargo", e.target.value)}
                        placeholder="Cargo o puesto"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactoTelefono">Teléfono</Label>
                      <Input
                        id="contactoTelefono"
                        value={formData.contactoTelefono}
                        onChange={(e) => handleChange("contactoTelefono", e.target.value)}
                        placeholder="Teléfono"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactoExtension">Extensión</Label>
                      <Input
                        id="contactoExtension"
                        value={formData.contactoExtension}
                        onChange={(e) => handleChange("contactoExtension", e.target.value)}
                        placeholder="Ext."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactoEmail">Correo Electrónico</Label>
                      <Input
                        id="contactoEmail"
                        type="email"
                        value={formData.contactoEmail}
                        onChange={(e) => handleChange("contactoEmail", e.target.value)}
                        placeholder="correo@institucion.edu.mx"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Representante Legal</CardTitle>
                  <CardDescription>Información del representante legal</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="representanteNombre">Nombre</Label>
                      <Input
                        id="representanteNombre"
                        value={formData.representanteNombre}
                        onChange={(e) => handleChange("representanteNombre", e.target.value)}
                        placeholder="Nombre del representante"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="representanteCargo">Cargo</Label>
                      <Input
                        id="representanteCargo"
                        value={formData.representanteCargo}
                        onChange={(e) => handleChange("representanteCargo", e.target.value)}
                        placeholder="Cargo"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="representanteRfc">RFC</Label>
                      <Input
                        id="representanteRfc"
                        value={formData.representanteRfc}
                        onChange={(e) => handleChange("representanteRfc", e.target.value.toUpperCase())}
                        placeholder="RFC"
                        maxLength={13}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="representanteTelefono">Teléfono</Label>
                      <Input
                        id="representanteTelefono"
                        value={formData.representanteTelefono}
                        onChange={(e) => handleChange("representanteTelefono", e.target.value)}
                        placeholder="Teléfono"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="representanteEmail">Correo</Label>
                      <Input
                        id="representanteEmail"
                        type="email"
                        value={formData.representanteEmail}
                        onChange={(e) => handleChange("representanteEmail", e.target.value)}
                        placeholder="correo@ejemplo.com"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Botones de acción */}
        <div className="flex justify-end gap-4 mt-6">
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/instituciones">Cancelar</Link>
          </Button>
          <Button 
            type="submit" 
            disabled={saving}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Guardar Cambios
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

