"use client"

import React, { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UploadFotografia } from "@/components/upload-fotografia"
import { TagsInput } from "@/components/ui/tags-input"
import { AreaSNIISelector } from "@/components/area-snii-selector"
import { Switch } from "@/components/ui/switch"
import {
  Loader2,
  CheckCircle,
  User,
  Phone,
  GraduationCap,
  Calendar,
  Flag,
  Hash,
  CreditCard,
  Briefcase,
  AlertCircle,
  ArrowLeft,
  Save,
  Edit,
  Award,
  Shield,
  Eye,
} from "lucide-react"

// Niveles de investigador (mismo formato que registro)
const NIVELES_INVESTIGADOR = [
  "Candidato a Investigador Estatal",
  "Investigador Estatal Nivel I",
  "Investigador Estatal Nivel II",
  "Investigador Estatal Nivel III",
  "Investigador Excepcional",
  "Investigador Insigne"
] as const

// Niveles de tecnólogo (mismo formato que registro)
const NIVELES_TECNOLOGO = [
  "Tecnólogo Nivel A",
  "Tecnólogo Nivel B"
] as const

interface InvestigadorData {
  id: number
  nombre_completo: string
  nombres: string
  apellidos: string
  curp: string
  rfc: string
  no_cvu: string
  correo: string
  telefono: string
  fotografia_url?: string
  nacionalidad: string
  fecha_nacimiento: string
  genero: string
  municipio: string
  estado_nacimiento?: string
  entidad_federativa?: string
  institucion_id?: string | null
  institucion?: string
  departamento?: string
  ubicacion?: string
  sitio_web?: string
  ultimo_grado_estudios: string
  grado_maximo_estudios?: string
  empleo_actual: string
  linea_investigacion: string | string[]
  area_investigacion: string | string[]
  disciplina?: string
  area_investigacionRaw?: string
  especialidad?: string
  orcid?: string
  nivel?: string
  nivel_investigador: string
  nivel_actual_id?: string | null
  fecha_asignacion_nivel?: string | null
  fecha_registro: string
  origen: string
  nivel_sni: string
  sni?: string
  anio_sni?: string | null
  tipo_perfil: string
  nivel_tecnologo?: string
  nivel_tecnologo_id?: string | null
  es_admin: boolean
  es_evaluador: boolean
  activo: boolean
}

interface FormData {
  nombres: string
  apellidos: string
  nombre_completo: string
  curp: string
  rfc: string
  no_cvu: string
  telefono: string
  fotografia_url?: string
  nacionalidad: string
  fecha_nacimiento: string
  genero: string
  municipio: string
  estado_nacimiento?: string
  entidad_federativa?: string
  institucion_id?: string | null
  institucion?: string
  departamento?: string
  ubicacion?: string
  sitio_web?: string
  ultimo_grado_estudios: string
  grado_maximo_estudios?: string
  empleo_actual: string
  linea_investigacion: string[]
  area_investigacion: string
  disciplina?: string
  area_investigacionRaw?: string
  especialidad?: string
  orcid?: string
  nivel?: string
  nivel_investigador: string
  nivel_actual_id?: string | null
  fecha_asignacion_nivel?: string | null
  nivel_sni: string
  sni?: string
  anio_sni?: string | null
  tipo_perfil: string
  nivel_tecnologo?: string
  nivel_tecnologo_id?: string | null
  es_admin: boolean
  es_evaluador: boolean
  activo: boolean
}

export default function EditarInvestigadorPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [investigadorId, setInvestigadorId] = useState<number | null>(null)
  
  const [formData, setFormData] = useState<FormData>({
    nombres: "",
    apellidos: "",
    nombre_completo: "",
    curp: "",
    rfc: "",
    no_cvu: "",
    telefono: "",
    fotografia_url: "",
    nacionalidad: "Mexicana",
    fecha_nacimiento: "",
    genero: "",
    municipio: "",
    estado_nacimiento: "",
    entidad_federativa: "",
    institucion_id: "",
    institucion: "",
    departamento: "",
    ubicacion: "",
    sitio_web: "",
    ultimo_grado_estudios: "",
    grado_maximo_estudios: "",
    empleo_actual: "",
    linea_investigacion: [],
    area_investigacion: "",
    disciplina: "",
    area_investigacionRaw: "",
    especialidad: "",
    orcid: "",
    nivel: "",
    nivel_investigador: "",
    nivel_actual_id: "",
    fecha_asignacion_nivel: "",
    nivel_sni: "",
    sni: "",
    anio_sni: "",
    tipo_perfil: "INVESTIGADOR",
    nivel_tecnologo: "",
    nivel_tecnologo_id: "",
    es_admin: false,
    es_evaluador: false,
    activo: true,
  })

  // Cargar datos del investigador
  useEffect(() => {
    const cargarDatos = async () => {
      if (!isLoaded || !user) return

      try {
        setIsLoading(true)
        const response = await fetch(`/api/admin/investigadores/${id}`)
        
        if (!response.ok) {
          throw new Error("No se pudo cargar el investigador")
        }

        const data = await response.json() as InvestigadorData
        setInvestigadorId(data.id)
        
        // Formatear fecha_nacimiento a YYYY-MM-DD (simplificado)
        const fechaNacimiento = data.fecha_nacimiento?.split('T')[0] || ""
        
        setFormData({
          nombres: data.nombres || "",
          apellidos: data.apellidos || "",
          nombre_completo: data.nombre_completo || "",
          curp: data.curp || "",
          rfc: data.rfc || "",
          no_cvu: data.no_cvu || "",
          telefono: data.telefono || "",
          fotografia_url: data.fotografia_url || "",
          nacionalidad: data.nacionalidad || "Mexicana",
          fecha_nacimiento: fechaNacimiento,
          genero: data.genero || "",
          municipio: data.municipio || "",
          estado_nacimiento: data.estado_nacimiento || "",
          entidad_federativa: data.entidad_federativa || "",
          institucion_id: data.institucion_id || "",
          institucion: data.institucion || "",
          departamento: data.departamento || "",
          ubicacion: data.ubicacion || "",
          sitio_web: data.sitio_web || "",
          ultimo_grado_estudios: data.ultimo_grado_estudios || "",
          grado_maximo_estudios: data.grado_maximo_estudios || "",
          empleo_actual: data.empleo_actual || "",
          linea_investigacion: typeof data.linea_investigacion === "string" 
            ? (data.linea_investigacion.trim() === "" ? [] : data.linea_investigacion.split(",").map((l: string) => l.trim()).filter(Boolean))
            : Array.isArray(data.linea_investigacion) ? data.linea_investigacion : [],
          area_investigacion: typeof data.area_investigacion === "string" 
            ? data.area_investigacion 
            : Array.isArray(data.area_investigacion) 
              ? data.area_investigacion.join(", ") 
              : "",
          disciplina: data.disciplina || "",
          area_investigacionRaw: data.area_investigacionRaw || "",
          especialidad: data.especialidad || "",
          orcid: data.orcid || "",
          nivel: data.nivel || "",
          nivel_investigador: data.nivel_investigador || "",
          nivel_actual_id: data.nivel_actual_id || "",
          fecha_asignacion_nivel: data.fecha_asignacion_nivel || "",
          nivel_sni: data.nivel_sni || "",
          sni: data.sni || "",
          anio_sni: data.anio_sni || "",
          tipo_perfil: data.tipo_perfil || "INVESTIGADOR",
          nivel_tecnologo: data.nivel_tecnologo || "",
          nivel_tecnologo_id: data.nivel_tecnologo_id || "",
          es_admin: data.es_admin || false,
          es_evaluador: data.es_evaluador || false,
          activo: data.activo !== undefined ? data.activo : true,
        })
      } catch (err) {
        console.error("Error al cargar datos:", err)
        setError(err instanceof Error ? err.message : "Error al cargar los datos")
      } finally {
        setIsLoading(false)
      }
    }

    cargarDatos()
  }, [isLoaded, user, id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFotografiaUpload = (url: string) => {
    setFormData(prev => ({
      ...prev,
      fotografia_url: url
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setIsSaving(true)

    try {
      // Validaciones básicas
      if (!formData.nombres.trim()) {
        throw new Error("El nombre es obligatorio")
      }

      if (!formData.apellidos.trim()) {
        throw new Error("Los apellidos son obligatorios")
      }

      if (!formData.telefono.trim()) {
        throw new Error("El teléfono es obligatorio")
      }

      // Preparar datos para envío
      const dataToSend: any = {
        ...formData,
        nombre_completo: `${formData.nombres} ${formData.apellidos}`.trim(),
        linea_investigacion: formData.linea_investigacion.join(", ")
      }
      
      // Limpiar campos vacíos o null antes de enviar
      Object.keys(dataToSend).forEach(key => {
        if (dataToSend[key] === "" || dataToSend[key] === null) {
          // Mantener campos obligatorios aunque estén vacíos
          if (!['nombres', 'apellidos', 'nombre_completo', 'telefono'].includes(key)) {
            delete dataToSend[key]
          }
        }
      })

      // Enviar actualización
      const response = await fetch(`/api/admin/investigadores/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Error al actualizar el perfil")
      }

      setSuccess(result.message || "✅ Perfil actualizado exitosamente")
      
      // Redirigir a la lista de investigadores después de 2 segundos
      setTimeout(() => {
        router.push("/admin/investigadores")
      }, 2000)
    } catch (err) {
      console.error("Error al guardar:", err)
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setIsSaving(false)
    }
  }

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-blue-600">Cargando investigador...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    router.push("/iniciar-sesion")
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="container max-w-4xl mx-auto py-6 md:py-12 px-4">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => router.push("/admin/investigadores")}
            variant="outline"
            className="mb-4 border-blue-200 text-blue-700 hover:bg-blue-50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Investigadores
          </Button>
          
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Edit className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-blue-900">Editar Investigador (Admin)</h1>
            <p className="text-blue-600">Modifica la información del investigador</p>
          </div>
        </div>

        <Card className="bg-white border-blue-100 shadow-lg">
          <CardHeader>
            <CardTitle className="text-blue-900">Información del Investigador</CardTitle>
            <CardDescription className="text-blue-600">
              Modifica los campos que desees actualizar
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6 bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-6 bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">¡Éxito!</AlertTitle>
                <AlertDescription className="text-green-700">{success}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Fotografía */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-blue-900 border-b border-blue-100 pb-2">
                  Fotografía de Perfil
                </h3>
                <UploadFotografia
                  value={formData.fotografia_url}
                  onChange={handleFotografiaUpload}
                  nombreCompleto={formData.nombre_completo}
                />
              </div>

              {/* Información Personal */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-blue-900 border-b border-blue-100 pb-2 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Información Personal
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombres" className="text-blue-900 font-medium flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Nombres *
                    </Label>
                    <Input
                      id="nombres"
                      name="nombres"
                      value={formData.nombres}
                      onChange={handleChange}
                      placeholder="Ej: Juan Carlos"
                      className="bg-white border-blue-200"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="apellidos" className="text-blue-900 font-medium flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Apellidos *
                    </Label>
                    <Input
                      id="apellidos"
                      name="apellidos"
                      value={formData.apellidos}
                      onChange={handleChange}
                      placeholder="Ej: García López"
                      className="bg-white border-blue-200"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telefono" className="text-blue-900 font-medium flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Teléfono *
                    </Label>
                    <Input
                      id="telefono"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      placeholder="Teléfono"
                      className="bg-white border-blue-200"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fecha_nacimiento" className="text-blue-900 font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Fecha de Nacimiento
                    </Label>
                    <Input
                      id="fecha_nacimiento"
                      name="fecha_nacimiento"
                      type="date"
                      value={formData.fecha_nacimiento}
                      onChange={handleChange}
                      className="bg-white border-blue-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nacionalidad" className="text-blue-900 font-medium flex items-center gap-2">
                      <Flag className="h-4 w-4" />
                      Nacionalidad
                    </Label>
                    <Input
                      id="nacionalidad"
                      name="nacionalidad"
                      value={formData.nacionalidad}
                      onChange={handleChange}
                      placeholder="Nacionalidad"
                      className="bg-white border-blue-200"
                    />
                  </div>
                </div>
              </div>

              {/* Tipo de Perfil y Nivel */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-blue-900 border-b border-blue-100 pb-2 flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Tipo de Perfil y Nivel
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tipo_perfil" className="text-blue-900 font-medium flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      Tipo de Perfil
                    </Label>
                    <Select
                      value={formData.tipo_perfil}
                      onValueChange={(value) => {
                        handleSelectChange("tipo_perfil", value)
                        // Limpiar el nivel cuando cambia el tipo
                        if (value === "INVESTIGADOR") {
                          handleSelectChange("nivel_tecnologo", "")
                          handleSelectChange("nivel_tecnologo_id", "")
                        } else {
                          handleSelectChange("nivel_investigador", "")
                          handleSelectChange("nivel_actual_id", "")
                        }
                      }}
                    >
                      <SelectTrigger className="bg-white border-blue-200">
                        <SelectValue placeholder="Selecciona tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INVESTIGADOR">Investigador</SelectItem>
                        <SelectItem value="TECNOLOGO">Tecnólogo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.tipo_perfil === "INVESTIGADOR" ? (
                    <div className="space-y-2">
                      <Label htmlFor="nivel_investigador" className="text-blue-900 font-medium flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        Nivel de Investigador
                      </Label>
                      <Select
                        value={formData.nivel_investigador}
                        onValueChange={(value) => handleSelectChange("nivel_investigador", value)}
                      >
                        <SelectTrigger className="bg-white border-blue-200">
                          <SelectValue placeholder="Selecciona nivel" />
                        </SelectTrigger>
                        <SelectContent>
                          {NIVELES_INVESTIGADOR.map((nivel) => (
                            <SelectItem key={nivel} value={nivel}>
                              {nivel}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="nivel_tecnologo" className="text-blue-900 font-medium flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        Nivel de Tecnólogo
                      </Label>
                      <Select
                        value={formData.nivel_tecnologo || ""}
                        onValueChange={(value) => handleSelectChange("nivel_tecnologo", value)}
                      >
                        <SelectTrigger className="bg-white border-blue-200">
                          <SelectValue placeholder="Selecciona nivel" />
                        </SelectTrigger>
                        <SelectContent>
                          {NIVELES_TECNOLOGO.map((nivel) => (
                            <SelectItem key={nivel} value={nivel}>
                              {nivel}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>

              {/* Identificación Oficial */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-blue-900 border-b border-blue-100 pb-2 flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Identificación Oficial
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="curp" className="text-blue-900 font-medium flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      CURP
                    </Label>
                    <Input
                      id="curp"
                      name="curp"
                      value={formData.curp}
                      onChange={handleChange}
                      placeholder="CURP"
                      className="bg-white border-blue-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rfc" className="text-blue-900 font-medium flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      RFC
                    </Label>
                    <Input
                      id="rfc"
                      name="rfc"
                      value={formData.rfc}
                      onChange={handleChange}
                      placeholder="RFC"
                      className="bg-white border-blue-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="no_cvu" className="text-blue-900 font-medium flex items-center gap-2">
                      <Hash className="h-4 w-4" />
                      CVU/PU
                    </Label>
                    <Input
                      id="no_cvu"
                      name="no_cvu"
                      value={formData.no_cvu}
                      onChange={handleChange}
                      placeholder="CVU/PU"
                      className="bg-white border-blue-200"
                    />
                  </div>
                </div>
              </div>

              {/* Información Académica y Profesional */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-blue-900 border-b border-blue-100 pb-2 flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Información Académica y Profesional
                </h3>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ultimo_grado_estudios" className="text-blue-900 font-medium flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      Último Grado de Estudios
                    </Label>
                    <Input
                      id="ultimo_grado_estudios"
                      name="ultimo_grado_estudios"
                      value={formData.ultimo_grado_estudios}
                      onChange={handleChange}
                      placeholder="Ej: Doctorado en..."
                      className="bg-white border-blue-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="empleo_actual" className="text-blue-900 font-medium flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Empleo Actual
                    </Label>
                    <Input
                      id="empleo_actual"
                      name="empleo_actual"
                      value={formData.empleo_actual}
                      onChange={handleChange}
                      placeholder="Puesto y lugar de trabajo"
                      className="bg-white border-blue-200"
                    />
                  </div>

                  {/* Área de Investigación SNII */}
                  <AreaSNIISelector
                    value={formData.area_investigacion}
                    onChange={(value) => setFormData(prev => ({ ...prev, area_investigacion: value }))}
                    required
                  />

                  {/* Línea de Investigación */}
                  <div className="space-y-2">
                    <TagsInput
                      value={Array.isArray(formData.linea_investigacion) ? formData.linea_investigacion : []}
                      onChange={(tags) => setFormData(prev => ({ ...prev, linea_investigacion: tags }))}
                      label="Línea de Investigación Específica"
                      placeholder="Escribe una línea de investigación y presiona Enter para agregarla"
                      maxTags={5}
                      className="bg-white border-blue-200"
                    />
                  </div>
                </div>
              </div>

              {/* Controles de Administrador */}
              <div className="space-y-4 bg-red-50 p-6 rounded-lg border-2 border-red-200">
                <h3 className="text-lg font-semibold text-red-900 border-b border-red-200 pb-2 flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Controles de Administrador
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-center justify-between space-x-4 p-4 bg-white rounded-lg border-2 border-red-100 hover:border-green-300 transition-colors">
                    <div className="space-y-1">
                      <Label htmlFor="activo" className="text-red-900 font-medium flex items-center gap-2 cursor-pointer">
                        <Eye className="h-4 w-4" />
                        Perfil Visible
                      </Label>
                      <p className="text-sm text-red-600">
                        {formData.activo ? "El perfil es visible públicamente" : "El perfil está oculto"}
                      </p>
                    </div>
                    <Switch
                      id="activo"
                      checked={formData.activo}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, activo: checked }))}
                      className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-300 data-[state=unchecked]:border-gray-400"
                    />
                  </div>

                  <div className="flex items-center justify-between space-x-4 p-4 bg-white rounded-lg border-2 border-red-100 hover:border-red-300 transition-colors">
                    <div className="space-y-1">
                      <Label htmlFor="es_admin" className="text-red-900 font-medium flex items-center gap-2 cursor-pointer">
                        <Shield className="h-4 w-4" />
                        Permisos de Administrador
                      </Label>
                      <p className="text-sm text-red-600">
                        {formData.es_admin ? "Usuario tiene permisos de admin" : "Usuario regular"}
                      </p>
                    </div>
                    <Switch
                      id="es_admin"
                      checked={formData.es_admin}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, es_admin: checked }))}
                      className="data-[state=checked]:bg-red-600 data-[state=unchecked]:bg-gray-300 data-[state=unchecked]:border-gray-400"
                    />
                  </div>

                  <div className="flex items-center justify-between space-x-4 p-4 bg-white rounded-lg border-2 border-red-100 hover:border-purple-300 transition-colors">
                    <div className="space-y-1">
                      <Label htmlFor="es_evaluador" className="text-red-900 font-medium flex items-center gap-2 cursor-pointer">
                        <Award className="h-4 w-4" />
                        Permisos de Evaluador
                      </Label>
                      <p className="text-sm text-red-600">
                        {formData.es_evaluador ? "Usuario puede evaluar investigadores" : "Usuario sin permisos de evaluación"}
                      </p>
                    </div>
                    <Switch
                      id="es_evaluador"
                      checked={formData.es_evaluador}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, es_evaluador: checked }))}
                      className="data-[state=checked]:bg-purple-600 data-[state=unchecked]:bg-gray-300 data-[state=unchecked]:border-gray-400"
                    />
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/admin/investigadores")}
                  className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                  disabled={isSaving}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-5 w-5" />
                      Guardar Cambios
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
