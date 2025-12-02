"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Loader2, Save, X, Plus, Award } from "lucide-react"
import Link from "next/link"

// Interface para el formulario de investigador
interface InvestigadorForm {
  // Información personal
  nombre: string
  apellidos: string
  email: string
  telefono: string
  fechaNacimiento: string
  nacionalidad: string
  curp: string
  rfc: string
  noCvu: string

  // Información académica
  titulo: string
  institucion: string
  departamento: string
  ubicacion: string
  sitioWeb: string

  // Información profesional
  biografia: string
  areasEspecializacion: string[]
  lineaInvestigacion: string

  // Información adicional
  orcid: string
  nivel: string
  empleoActual: string
  gradoMaximoEstudios: string
  disciplina: string
  especialidad: string
  sni: string
  anioSni: string
  experienciaDocente: string
  experienciaLaboral: string
  proyectosInvestigacion: string
  proyectosVinculacion: string
  libros: string
  capitulosLibros: string
  articulos: string
  premiosDistinciones: string
  idiomas: string
  colaboracionInternacional: string
  colaboracionNacional: string
  nivel_sni: string
  tipo_perfil: string
  nivel_tecnologo: string
  nivel_tecnologo_id: string

  // Ubicación
  domicilio: string
  cp: string
  estadoNacimiento: string
  municipio: string
  entidadFederativa: string
}

export default function EditarInvestigadorPage() {
  const router = useRouter()
  const params = useParams()
  const slug = params?.id as string

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [formData, setFormData] = useState<InvestigadorForm>({
    nombre: "",
    apellidos: "",
    email: "",
    telefono: "",
    fechaNacimiento: "",
    nacionalidad: "Mexicana",
    curp: "",
    rfc: "",
    noCvu: "",
    titulo: "",
    institucion: "",
    departamento: "",
    ubicacion: "",
    sitioWeb: "",
    biografia: "",
    areasEspecializacion: [],
    lineaInvestigacion: "",
    orcid: "",
    nivel: "",
    empleoActual: "",
    gradoMaximoEstudios: "",
    disciplina: "",
    especialidad: "",
    sni: "",
    anioSni: "",
    experienciaDocente: "",
    experienciaLaboral: "",
    proyectosInvestigacion: "",
    proyectosVinculacion: "",
    libros: "",
    capitulosLibros: "",
    articulos: "",
    premiosDistinciones: "",
    idiomas: "",
    colaboracionInternacional: "",
    colaboracionNacional: "",
    domicilio: "",
    cp: "",
    estadoNacimiento: "",
    municipio: "",
    entidadFederativa: "",
    nivel_sni: "",
    tipo_perfil: "INVESTIGADOR",
    nivel_tecnologo: "",
    nivel_tecnologo_id: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [newArea, setNewArea] = useState("")

  // Cargar datos del investigador
  useEffect(() => {
    const fetchInvestigador = async () => {
      if (!slug) return

      try {
        setIsLoading(true)
        const response = await fetch(`/api/investigadores/${slug}`)
        
        if (!response.ok) {
          throw new Error("Error al cargar el investigador")
        }

        const data = await response.json()
        
        // Mapear datos del API al formulario
        setFormData({
          nombre: data.name?.split(' ')[0] || "",
          apellidos: data.name?.split(' ').slice(1).join(' ') || "",
          email: data.email || "",
          telefono: data.telefono || "",
          fechaNacimiento: data.fechaNacimiento || "",
          nacionalidad: data.nacionalidad || "Mexicana",
          curp: data.curp || "",
          rfc: data.rfc || "",
          noCvu: data.noCvu || "",
          titulo: data.title || "",
          institucion: data.institution || "",
          departamento: "",
          ubicacion: data.location || "",
          sitioWeb: "",
          biografia: data.lineaInvestigacion || "",
          areasEspecializacion: data.area ? [data.area] : [],
          lineaInvestigacion: data.lineaInvestigacion || "",
          orcid: data.orcid || "",
          nivel: data.nivel || "",
          empleoActual: data.empleoActual || "",
          gradoMaximoEstudios: data.gradoMaximoEstudios || "",
          disciplina: data.disciplina || "",
          especialidad: data.especialidad || "",
          sni: data.sni || "",
          anioSni: data.anioSni?.toString() || "",
          experienciaDocente: data.experienciaDocente || "",
          experienciaLaboral: data.experienciaLaboral || "",
          proyectosInvestigacion: data.proyectosInvestigacion || "",
          proyectosVinculacion: data.proyectosVinculacion || "",
          libros: data.libros || "",
          capitulosLibros: data.capitulosLibros || "",
          articulos: data.articulos || "",
          premiosDistinciones: data.premiosDistinciones || "",
          idiomas: data.idiomas || "",
          colaboracionInternacional: data.colaboracionInternacional || "",
          colaboracionNacional: data.colaboracionNacional || "",
          domicilio: data.domicilio || "",
          cp: data.cp || "",
          estadoNacimiento: "",
          municipio: "",
          entidadFederativa: "",
          nivel_sni: data.nivel_sni || "",
          tipo_perfil: data.tipo_perfil || "INVESTIGADOR",
          nivel_tecnologo: data.nivel_tecnologo || "",
          nivel_tecnologo_id: data.nivel_tecnologo_id || "",
        })
      } catch (err) {
        console.error("Error fetching investigador:", err)
        setError(err instanceof Error ? err.message : "Error desconocido")
      } finally {
        setIsLoading(false)
      }
    }

    fetchInvestigador()
  }, [slug])

  // Agregar área de especialización
  const addArea = () => {
    if (newArea.trim() && !formData.areasEspecializacion.includes(newArea.trim())) {
      setFormData((prev) => ({
        ...prev,
        areasEspecializacion: [...prev.areasEspecializacion, newArea.trim()],
      }))
      setNewArea("")
    }
  }

  // Remover área de especialización
  const removeArea = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      areasEspecializacion: prev.areasEspecializacion.filter((_, i) => i !== index),
    }))
  }

  // Validar formulario
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.nombre) newErrors.nombre = "El nombre es requerido"
    if (!formData.apellidos) newErrors.apellidos = "Los apellidos son requeridos"
    if (!formData.email) newErrors.email = "El email es requerido"
    if (!formData.curp) newErrors.curp = "El CURP es requerido"
    if (!formData.rfc) newErrors.rfc = "El RFC es requerido"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Guardar cambios
  const handleSave = async () => {
    if (!validateForm()) return

    setIsSaving(true)
    setError(null)
    setSuccess(null)

    try {
      // TODO: Implementar API de actualización
      // const response = await fetch(`/api/investigadores/${slug}`, {
      //   method: "PUT",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     nombre_completo: `${formData.nombre} ${formData.apellidos}`,
      //     correo: formData.email,
      //     telefono: formData.telefono,
      //     curp: formData.curp,
      //     rfc: formData.rfc,
      //     no_cvu: formData.noCvu,
      //     institucion: formData.institucion,
      //     area: formData.areasEspecializacion.join(', '),
      //     linea_investigacion: formData.lineaInvestigacion,
      //     ultimo_grado_estudios: formData.titulo,
      //     empleo_actual: formData.empleoActual,
      //     orcid: formData.orcid,
      //     nivel: formData.nivel,
      //     grado_maximo_estudios: formData.gradoMaximoEstudios,
      //     disciplina: formData.disciplina,
      //     especialidad: formData.especialidad,
      //     sni: formData.sni,
      //     anio_sni: formData.anioSni ? parseInt(formData.anioSni) : null,
      //     experiencia_docente: formData.experienciaDocente,
      //     experiencia_laboral: formData.experienciaLaboral,
      //     proyectos_investigacion: formData.proyectosInvestigacion,
      //     proyectos_vinculacion: formData.proyectosVinculacion,
      //     libros: formData.libros,
      //     capitulos_libros: formData.capitulosLibros,
      //     articulos: formData.articulos,
      //     premios_distinciones: formData.premiosDistinciones,
      //     idiomas: formData.idiomas,
      //     colaboracion_internacional: formData.colaboracionInternacional,
      //     colaboracion_nacional: formData.colaboracionNacional,
      //     domicilio: formData.domicilio,
      //     cp: formData.cp,
      //     estado_nacimiento: formData.estadoNacimiento,
      //     municipio: formData.municipio,
      //     entidad_federativa: formData.entidadFederativa,
      //     nivel_sni: formData.nivel_sni,
      //     tipo_perfil: formData.tipo_perfil,
      //     nivel_tecnologo: formData.nivel_tecnologo,
      //     nivel_tecnologo_id: formData.nivel_tecnologo_id,
      //   }),
      // })

      // if (!response.ok) {
      //   throw new Error("Error al actualizar el investigador")
      // }

      // Simular guardado exitoso
      setTimeout(() => {
        setSuccess("Investigador actualizado exitosamente")
        setTimeout(() => {
          router.push("/admin/investigadores")
        }, 2000)
      }, 1000)

    } catch (err) {
      console.error("Error saving investigador:", err)
      setError(err instanceof Error ? err.message : "Error al guardar los cambios")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-blue-600">Cargando datos del investigador...</p>
        </div>
      </div>
    )
  }

  if (error && !formData.nombre) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-red-600">Error</h1>
          <p className="text-red-600">{error}</p>
          <Button asChild className="bg-blue-700 text-white hover:bg-blue-800">
            <Link href="/admin/investigadores">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a la lista
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild className="text-blue-700 hover:bg-blue-50">
                <Link href="/admin/investigadores">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver a la lista
                </Link>
              </Button>
              <h1 className="text-3xl font-bold text-blue-900">
                Editar Investigador: {formData.nombre} {formData.apellidos}
              </h1>
            </div>
            <p className="text-blue-600">Modifica la información del investigador</p>
          </div>
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="bg-blue-700 text-white hover:bg-blue-800"
          >
            {isSaving ? (
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

        {/* Mensajes de estado */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información personal */}
            <Card className="bg-white border-blue-100">
              <CardHeader>
                <CardTitle className="text-blue-900">Información Personal</CardTitle>
                <CardDescription className="text-blue-600">
                  Datos básicos del investigador
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre(s) *</Label>
                    <Input
                      id="nombre"
                      value={formData.nombre}
                      onChange={(e) => setFormData((prev) => ({ ...prev, nombre: e.target.value }))}
                      className={errors.nombre ? "border-red-300" : ""}
                    />
                    {errors.nombre && <p className="text-sm text-red-600">{errors.nombre}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="apellidos">Apellidos *</Label>
                    <Input
                      id="apellidos"
                      value={formData.apellidos}
                      onChange={(e) => setFormData((prev) => ({ ...prev, apellidos: e.target.value }))}
                      className={errors.apellidos ? "border-red-300" : ""}
                    />
                    {errors.apellidos && <p className="text-sm text-red-600">{errors.apellidos}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                      className={errors.email ? "border-red-300" : ""}
                    />
                    {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input
                      id="telefono"
                      value={formData.telefono}
                      onChange={(e) => setFormData((prev) => ({ ...prev, telefono: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="curp">CURP *</Label>
                    <Input
                      id="curp"
                      value={formData.curp}
                      onChange={(e) => setFormData((prev) => ({ ...prev, curp: e.target.value.toUpperCase() }))}
                      className={errors.curp ? "border-red-300" : ""}
                      maxLength={18}
                    />
                    {errors.curp && <p className="text-sm text-red-600">{errors.curp}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rfc">RFC *</Label>
                    <Input
                      id="rfc"
                      value={formData.rfc}
                      onChange={(e) => setFormData((prev) => ({ ...prev, rfc: e.target.value.toUpperCase() }))}
                      className={errors.rfc ? "border-red-300" : ""}
                      maxLength={13}
                    />
                    {errors.rfc && <p className="text-sm text-red-600">{errors.rfc}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="noCvu">CVU/PU</Label>
                    <Input
                      id="noCvu"
                      value={formData.noCvu}
                      onChange={(e) => setFormData((prev) => ({ ...prev, noCvu: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nacionalidad">Nacionalidad</Label>
                    <Select
                      value={formData.nacionalidad}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, nacionalidad: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mexicana">Mexicana</SelectItem>
                        <SelectItem value="Extranjera">Extranjera</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tipo de Perfil y Nivel */}
            <Card className="bg-white border-blue-100">
              <CardHeader>
                <CardTitle className="text-blue-900">Tipo de Perfil y Nivel</CardTitle>
                <CardDescription className="text-blue-600">
                  Clasificación y nivel del investigador o tecnólogo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="tipo_perfil">Tipo de Perfil</Label>
                    <Select
                      value={formData.tipo_perfil}
                      onValueChange={(value) => {
                        setFormData((prev) => ({ ...prev, tipo_perfil: value }))
                        // Limpiar el nivel cuando cambia el tipo
                        if (value === "INVESTIGADOR") {
                          setFormData((prev) => ({ ...prev, nivel_tecnologo: "", nivel_tecnologo_id: "" }))
                        } else {
                          setFormData((prev) => ({ ...prev, nivel: "", nivel_sni: "" }))
                        }
                      }}
                    >
                      <SelectTrigger>
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
                      <Label htmlFor="nivel_sni">Nivel SNI</Label>
                      <Input
                        id="nivel_sni"
                        value={formData.nivel_sni}
                        onChange={(e) => setFormData((prev) => ({ ...prev, nivel_sni: e.target.value }))}
                        placeholder="Ej: Candidato, I, II, III"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="nivel_tecnologo">Nivel de Tecnólogo</Label>
                      <Input
                        id="nivel_tecnologo"
                        value={formData.nivel_tecnologo}
                        onChange={(e) => setFormData((prev) => ({ ...prev, nivel_tecnologo: e.target.value }))}
                        placeholder="Nivel de tecnólogo"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Información académica */}
            <Card className="bg-white border-blue-100">
              <CardHeader>
                <CardTitle className="text-blue-900">Información Académica</CardTitle>
                <CardDescription className="text-blue-600">
                  Datos sobre la formación y posición académica
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="titulo">Título Académico</Label>
                    <Input
                      id="titulo"
                      placeholder="Ej: Dr. en Neurociencia"
                      value={formData.titulo}
                      onChange={(e) => setFormData((prev) => ({ ...prev, titulo: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="institucion">Institución</Label>
                    <Input
                      id="institucion"
                      value={formData.institucion}
                      onChange={(e) => setFormData((prev) => ({ ...prev, institucion: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ubicacion">Ubicación</Label>
                    <Input
                      id="ubicacion"
                      placeholder="Ciudad, Estado"
                      value={formData.ubicacion}
                      onChange={(e) => setFormData((prev) => ({ ...prev, ubicacion: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nivel">Nivel</Label>
                    <Input
                      id="nivel"
                      value={formData.nivel}
                      onChange={(e) => setFormData((prev) => ({ ...prev, nivel: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lineaInvestigacion">Línea de Investigación</Label>
                  <Textarea
                    id="lineaInvestigacion"
                    placeholder="Describe tu línea de investigación principal..."
                    value={formData.lineaInvestigacion}
                    onChange={(e) => setFormData((prev) => ({ ...prev, lineaInvestigacion: e.target.value }))}
                    className="min-h-24"
                  />
                </div>

                <div className="space-y-4">
                  <Label>Áreas de Especialización</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Agregar área de especialización"
                      value={newArea}
                      onChange={(e) => setNewArea(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addArea())}
                    />
                    <Button
                      type="button"
                      onClick={addArea}
                      variant="outline"
                      className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-transparent"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.areasEspecializacion.map((area, index) => (
                      <Badge key={index} className="bg-blue-700 text-white">
                        {area}
                        <button
                          type="button"
                          onClick={() => removeArea(index)}
                          className="ml-2 hover:bg-blue-600 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Experiencia y logros */}
            <Card className="bg-white border-blue-100">
              <CardHeader>
                <CardTitle className="text-blue-900">Experiencia y Logros</CardTitle>
                <CardDescription className="text-blue-600">
                  Información sobre experiencia laboral y académica
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="experienciaLaboral">Experiencia Laboral</Label>
                  <Textarea
                    id="experienciaLaboral"
                    placeholder="Describe tu experiencia laboral..."
                    value={formData.experienciaLaboral}
                    onChange={(e) => setFormData((prev) => ({ ...prev, experienciaLaboral: e.target.value }))}
                    className="min-h-24"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="proyectosInvestigacion">Proyectos de Investigación</Label>
                  <Textarea
                    id="proyectosInvestigacion"
                    placeholder="Lista tus proyectos de investigación..."
                    value={formData.proyectosInvestigacion}
                    onChange={(e) => setFormData((prev) => ({ ...prev, proyectosInvestigacion: e.target.value }))}
                    className="min-h-24"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="articulos">Artículos Publicados</Label>
                  <Textarea
                    id="articulos"
                    placeholder="Lista tus artículos publicados..."
                    value={formData.articulos}
                    onChange={(e) => setFormData((prev) => ({ ...prev, articulos: e.target.value }))}
                    className="min-h-24"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Columna lateral */}
          <div className="space-y-6">
            {/* SNI */}
            <Card className="bg-white border-blue-100">
              <CardHeader>
                <CardTitle className="text-blue-900">Sistema Nacional de Investigadores</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sni">Nivel SNI</Label>
                  <Input
                    id="sni"
                    value={formData.sni}
                    onChange={(e) => setFormData((prev) => ({ ...prev, sni: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="anioSni">Año SNI</Label>
                  <Input
                    id="anioSni"
                    type="number"
                    value={formData.anioSni}
                    onChange={(e) => setFormData((prev) => ({ ...prev, anioSni: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Información adicional */}
            <Card className="bg-white border-blue-100">
              <CardHeader>
                <CardTitle className="text-blue-900">Información Adicional</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="orcid">ORCID</Label>
                  <Input
                    id="orcid"
                    value={formData.orcid}
                    onChange={(e) => setFormData((prev) => ({ ...prev, orcid: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="empleoActual">Empleo Actual</Label>
                  <Input
                    id="empleoActual"
                    value={formData.empleoActual}
                    onChange={(e) => setFormData((prev) => ({ ...prev, empleoActual: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="idiomas">Idiomas</Label>
                  <Input
                    id="idiomas"
                    value={formData.idiomas}
                    onChange={(e) => setFormData((prev) => ({ ...prev, idiomas: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
