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
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Loader2, Save, X, Plus, Award, Shield } from "lucide-react"
import { AreaSNIISelector } from "@/components/area-snii-selector"
import Link from "next/link"

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

// Interface para el formulario de investigador (alineado con registro)
interface InvestigadorForm {
  // Información personal básica
  nombres: string
  apellidos: string
  nombre_completo: string
  correo: string
  telefono: string
  fecha_nacimiento: string
  nacionalidad: string
  curp: string
  rfc: string
  no_cvu: string
  genero: string

  // Ubicación
  municipio: string
  estado_nacimiento: string
  entidad_federativa: string

  // Información académica/institucional
  institucion: string
  departamento: string
  ubicacion: string
  sitio_web: string
  ultimo_grado_estudios: string
  grado_maximo_estudios: string
  empleo_actual: string

  // Investigación
  linea_investigacion: string
  area_investigacion: string
  disciplina: string
  especialidad: string
  orcid: string

  // Nivel y SNI
  nivel: string
  nivel_investigador: string
  nivel_sni: string
  sni: string
  anio_sni: string
  nivel_actual_id: string
  fecha_asignacion_nivel: string

  // Producción académica
  experiencia_docente: string
  experiencia_laboral: string
  proyectos_investigacion: string
  proyectos_vinculacion: string
  libros: string
  capitulos_libros: string
  articulos: string
  premios_distinciones: string
  idiomas: string
  colaboracion_internacional: string
  colaboracion_nacional: string

  // CV
  cv_url: string

  // Evaluación
  puntaje_total: number
  estado_evaluacion: string

  // Campos de admin
  es_admin: boolean
  activo: boolean
  perfil_publico: boolean
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
    nombres: "",
    apellidos: "",
    nombre_completo: "",
    correo: "",
    telefono: "",
    fecha_nacimiento: "",
    nacionalidad: "Mexicana",
    curp: "",
    rfc: "",
    no_cvu: "",
    genero: "",
    municipio: "",
    estado_nacimiento: "",
    entidad_federativa: "",
    institucion: "",
    departamento: "",
    ubicacion: "",
    sitio_web: "",
    ultimo_grado_estudios: "",
    grado_maximo_estudios: "",
    empleo_actual: "",
    linea_investigacion: "",
    area_investigacion: "",
    disciplina: "",
    especialidad: "",
    orcid: "",
    nivel: "",
    nivel_investigador: "",
    nivel_sni: "",
    sni: "",
    anio_sni: "",
    nivel_actual_id: "",
    fecha_asignacion_nivel: "",
    experiencia_docente: "",
    experiencia_laboral: "",
    proyectos_investigacion: "",
    proyectos_vinculacion: "",
    libros: "",
    capitulos_libros: "",
    articulos: "",
    premios_distinciones: "",
    idiomas: "",
    colaboracion_internacional: "",
    colaboracion_nacional: "",
    cv_url: "",
    puntaje_total: 0,
    estado_evaluacion: "PENDIENTE",
    es_admin: false,
    activo: true,
    perfil_publico: true,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Cargar datos del investigador
  useEffect(() => {
    const fetchInvestigador = async () => {
      if (!slug) return

      try {
        setIsLoading(true)
        const response = await fetch(`/api/admin/investigadores/${slug}`)
        
        if (!response.ok) {
          throw new Error("Error al cargar el investigador")
        }

        const data = await response.json()
        
        // Mapear datos del API al formulario (usando nombres exactos de la BD)
        setFormData({
          nombres: data.nombres || "",
          apellidos: data.apellidos || "",
          nombre_completo: data.nombre_completo || "",
          correo: data.correo || "",
          telefono: data.telefono || "",
          fecha_nacimiento: data.fecha_nacimiento || "",
          nacionalidad: data.nacionalidad || "Mexicana",
          curp: data.curp || "",
          rfc: data.rfc || "",
          no_cvu: data.no_cvu || "",
          genero: data.genero || "",
          municipio: data.municipio || "",
          estado_nacimiento: data.estado_nacimiento || "",
          entidad_federativa: data.entidad_federativa || "",
          institucion: data.institucion || "",
          departamento: data.departamento || "",
          ubicacion: data.ubicacion || "",
          sitio_web: data.sitio_web || "",
          ultimo_grado_estudios: data.ultimo_grado_estudios || "",
          grado_maximo_estudios: data.grado_maximo_estudios || "",
          empleo_actual: data.empleo_actual || "",
          linea_investigacion: data.linea_investigacion || "",
          area_investigacion: data.area_investigacion || "",
          disciplina: data.disciplina || "",
          especialidad: data.especialidad || "",
          orcid: data.orcid || "",
          nivel: data.nivel || "",
          nivel_investigador: data.nivel_investigador || "",
          nivel_sni: data.nivel_sni || "",
          sni: data.sni || "",
          anio_sni: data.anio_sni?.toString() || "",
          nivel_actual_id: data.nivel_actual_id?.toString() || "",
          fecha_asignacion_nivel: data.fecha_asignacion_nivel || "",
          experiencia_docente: data.experiencia_docente || "",
          experiencia_laboral: data.experiencia_laboral || "",
          proyectos_investigacion: data.proyectos_investigacion || "",
          proyectos_vinculacion: data.proyectos_vinculacion || "",
          libros: data.libros || "",
          capitulos_libros: data.capitulos_libros || "",
          articulos: data.articulos || "",
          premios_distinciones: data.premios_distinciones || "",
          idiomas: data.idiomas || "",
          colaboracion_internacional: data.colaboracion_internacional || "",
          colaboracion_nacional: data.colaboracion_nacional || "",
          cv_url: data.cv_url || "",
          puntaje_total: data.puntaje_total || 0,
          estado_evaluacion: data.estado_evaluacion || "PENDIENTE",
          es_admin: data.es_admin || false,
          activo: data.activo !== undefined ? data.activo : true,
          perfil_publico: data.perfil_publico !== undefined ? data.perfil_publico : true,
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

  // Validar formulario
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.nombres) newErrors.nombres = "El nombre es requerido"
    if (!formData.apellidos) newErrors.apellidos = "Los apellidos son requeridos"
    if (!formData.correo) newErrors.correo = "El email es requerido"
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
      const response = await fetch(`/api/admin/investigadores/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Datos personales
          nombres: formData.nombres,
          apellidos: formData.apellidos,
          nombre_completo: formData.nombre_completo || `${formData.nombres} ${formData.apellidos}`,
          correo: formData.correo,
          telefono: formData.telefono,
          fecha_nacimiento: formData.fecha_nacimiento,
          nacionalidad: formData.nacionalidad,
          curp: formData.curp,
          rfc: formData.rfc,
          no_cvu: formData.no_cvu,
          genero: formData.genero,
          
          // Ubicación
          municipio: formData.municipio,
          estado_nacimiento: formData.estado_nacimiento,
          entidad_federativa: formData.entidad_federativa,
          
          // Información institucional
          institucion: formData.institucion,
          departamento: formData.departamento,
          ubicacion: formData.ubicacion,
          sitio_web: formData.sitio_web,
          
          // Formación académica
          ultimo_grado_estudios: formData.ultimo_grado_estudios,
          grado_maximo_estudios: formData.grado_maximo_estudios,
          empleo_actual: formData.empleo_actual,
          
          // Investigación
          linea_investigacion: formData.linea_investigacion,
          area_investigacion: formData.area_investigacion,
          disciplina: formData.disciplina,
          especialidad: formData.especialidad,
          orcid: formData.orcid,
          
          // Nivel y SNI
          nivel: formData.nivel,
          nivel_investigador: formData.nivel_investigador,
          nivel_sni: formData.nivel_sni,
          sni: formData.sni,
          anio_sni: formData.anio_sni ? parseInt(formData.anio_sni) : null,
          nivel_actual_id: formData.nivel_actual_id || null,
          fecha_asignacion_nivel: formData.fecha_asignacion_nivel || null,
          
          // Producción académica
          experiencia_docente: formData.experiencia_docente,
          experiencia_laboral: formData.experiencia_laboral,
          proyectos_investigacion: formData.proyectos_investigacion,
          proyectos_vinculacion: formData.proyectos_vinculacion,
          libros: formData.libros,
          capitulos_libros: formData.capitulos_libros,
          articulos: formData.articulos,
          premios_distinciones: formData.premios_distinciones,
          idiomas: formData.idiomas,
          colaboracion_internacional: formData.colaboracion_internacional,
          colaboracion_nacional: formData.colaboracion_nacional,
          
          // CV
          cv_url: formData.cv_url,
          
          // Evaluación
          puntaje_total: formData.puntaje_total,
          estado_evaluacion: formData.estado_evaluacion,
          
          // Campos de admin
          es_admin: formData.es_admin,
          activo: formData.activo,
          perfil_publico: formData.perfil_publico,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al actualizar el investigador")
      }

      const result = await response.json()
      setSuccess(result.message || "Investigador actualizado exitosamente")
      
      setTimeout(() => {
        router.push("/admin/investigadores")
      }, 2000)

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

  if (error && !formData.nombres) {
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
                Editar Investigador: {formData.nombres} {formData.apellidos}
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
                    <Label htmlFor="nombres">Nombre(s) *</Label>
                    <Input
                      id="nombres"
                      value={formData.nombres}
                      onChange={(e) => setFormData((prev) => ({ ...prev, nombres: e.target.value }))}
                      className={errors.nombres ? "border-red-300" : ""}
                    />
                    {errors.nombres && <p className="text-sm text-red-600">{errors.nombres}</p>}
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
                    <Label htmlFor="correo">Correo Electrónico *</Label>
                    <Input
                      id="correo"
                      type="email"
                      value={formData.correo}
                      onChange={(e) => setFormData((prev) => ({ ...prev, correo: e.target.value }))}
                      className={errors.correo ? "border-red-300" : ""}
                    />
                    {errors.correo && <p className="text-sm text-red-600">{errors.correo}</p>}
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
                    <Label htmlFor="no_cvu">CVU/PU</Label>
                    <Input
                      id="no_cvu"
                      value={formData.no_cvu}
                      onChange={(e) => setFormData((prev) => ({ ...prev, no_cvu: e.target.value }))}
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
                    <Label htmlFor="ultimo_grado_estudios">Último Grado de Estudios</Label>
                    <Input
                      id="ultimo_grado_estudios"
                      placeholder="Ej: Doctorado en Neurociencia"
                      value={formData.ultimo_grado_estudios}
                      onChange={(e) => setFormData((prev) => ({ ...prev, ultimo_grado_estudios: e.target.value }))}
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
                  <Label htmlFor="linea_investigacion">Línea de Investigación Específica</Label>
                  <Textarea
                    id="linea_investigacion"
                    placeholder="Describe tus líneas de investigación específicas (separadas por coma)..."
                    value={formData.linea_investigacion}
                    onChange={(e) => setFormData((prev) => ({ ...prev, linea_investigacion: e.target.value }))}
                    className="min-h-24"
                  />
                  <p className="text-xs text-gray-600">
                    Ejemplos: Inteligencia Artificial, Biotecnología, Energías Renovables
                  </p>
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
                  <Label htmlFor="experiencia_laboral">Experiencia Laboral</Label>
                  <Textarea
                    id="experiencia_laboral"
                    placeholder="Describe tu experiencia laboral..."
                    value={formData.experiencia_laboral}
                    onChange={(e) => setFormData((prev) => ({ ...prev, experiencia_laboral: e.target.value }))}
                    className="min-h-24"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="proyectos_investigacion">Proyectos de Investigación</Label>
                  <Textarea
                    id="proyectos_investigacion"
                    placeholder="Lista tus proyectos de investigación..."
                    value={formData.proyectos_investigacion}
                    onChange={(e) => setFormData((prev) => ({ ...prev, proyectos_investigacion: e.target.value }))}
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
                  <Label htmlFor="anio_sni">Año SNI</Label>
                  <Input
                    id="anio_sni"
                    type="number"
                    value={formData.anio_sni}
                    onChange={(e) => setFormData((prev) => ({ ...prev, anio_sni: e.target.value }))}
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
                  <Label htmlFor="empleo_actual">Empleo Actual</Label>
                  <Input
                    id="empleo_actual"
                    value={formData.empleo_actual}
                    onChange={(e) => setFormData((prev) => ({ ...prev, empleo_actual: e.target.value }))}
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

        {/* Sección de Controles de Administrador */}
        <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200">
          <CardHeader>
            <CardTitle className="text-red-900 flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Controles de Administrador
            </CardTitle>
            <CardDescription className="text-red-700">
              Configuración sensible - Solo administradores
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Es Admin */}
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-red-200">
                <div className="space-y-1">
                  <Label htmlFor="es_admin" className="font-semibold text-red-900">
                    Permisos de Administrador
                  </Label>
                  <p className="text-sm text-red-600">
                    {formData.es_admin ? "Usuario es administrador" : "Usuario estándar"}
                  </p>
                </div>
                <Switch
                  id="es_admin"
                  checked={formData.es_admin}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, es_admin: checked }))}
                />
              </div>

              {/* Perfil Activo */}
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-red-200">
                <div className="space-y-1">
                  <Label htmlFor="activo" className="font-semibold text-red-900">
                    Perfil Activo
                  </Label>
                  <p className="text-sm text-red-600">
                    {formData.activo ? "Perfil visible" : "Perfil oculto"}
                  </p>
                </div>
                <Switch
                  id="activo"
                  checked={formData.activo}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, activo: checked }))}
                />
              </div>

              {/* Perfil Público */}
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-red-200">
                <div className="space-y-1">
                  <Label htmlFor="perfil_publico" className="font-semibold text-red-900">
                    Perfil Público
                  </Label>
                  <p className="text-sm text-red-600">
                    {formData.perfil_publico ? "Visible en búsquedas" : "Privado"}
                  </p>
                </div>
                <Switch
                  id="perfil_publico"
                  checked={formData.perfil_publico}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, perfil_publico: checked }))}
                />
              </div>
            </div>

            <Alert className="bg-red-50 border-red-200">
              <AlertDescription className="text-red-700">
                <strong>⚠️ Advertencia:</strong> Cambiar estos valores puede afectar el acceso y visibilidad del investigador en el sistema.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
