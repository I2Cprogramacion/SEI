"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AnimatedCard } from "@/components/ui/animated-card"
import { AnimatedButton } from "@/components/ui/animated-button"
import { AnimatedBadge } from "@/components/ui/animated-badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { InputWithValidation } from "@/components/ui/input-with-validation"
import { FormProgress } from "@/components/ui/form-progress"
import { AnimatedHeader } from "@/components/ui/animated-header"
import { formatRFC, formatCURP, formatPhone, formatCP, validators, calculateSectionProgress } from "@/lib/form-utils"
import { Upload, Plus, X, FileText, Building, MapPin, User, Users, Phone as PhoneIcon, Mail, FileCheck, Briefcase, Globe, CheckCircle2 } from "lucide-react"

// Interfaces
interface DomicilioFiscal {
  calle: string
  numeroExterior: string
  numeroInterior: string
  colonia: string
  codigoPostal: string
  municipio: string
  estado: string
  pais: string
}

interface RepresentanteLegal {
  nombre: string
  cargo: string
  rfc: string
  telefono: string
  email: string
}

interface ContactoInstitucional {
  nombreContacto: string
  cargo: string
  telefono: string
  email: string
  extension: string
}

interface FormData {
  // Información básica
  nombre: string
  siglas: string
  tipo: string
  tipoOtroEspecificar?: string
  añoFundacion: string
  sitioWeb: string
  descripcion: string
  
  // Régimen fiscal
  tipoPersona: "fisica" | "moral"
  rfc: string
  razonSocial: string
  regimenFiscal: string
  actividadEconomica: string
  
  // Persona física específicos
  curp?: string
  nombreCompleto?: string
  
  // Persona moral específicos
  numeroEscritura?: string
  fechaConstitucion?: string
  notarioPublico?: string
  numeroNotaria?: string
  registroPublico?: string
  
  // Domicilio fiscal
  domicilioFiscal: DomicilioFiscal
  
  // Representante legal (persona moral)
  representanteLegal?: RepresentanteLegal
  
  // Contacto institucional
  contactoInstitucional: ContactoInstitucional
  
  // Áreas de investigación
  areasInvestigacion: string[]
  
  // Documentos
  constanciaSituacionFiscal?: File
  actaConstitutiva?: File
  poderRepresentante?: File
  comprobanteDomicilio?: File
  identificacionOficial?: File
  
  // Otros
  objetoSocial?: string
  capacidadInvestigacion: string
}

interface ErrorMessage {
  field: string
  message: string
}

export default function NuevaInstitucionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<ErrorMessage[]>([])
  const [areaInvestigacion, setAreaInvestigacion] = useState("")
  const [currentSection, setCurrentSection] = useState("basica")
  
  const [formData, setFormData] = useState<FormData>({
    // Información básica
    nombre: "",
    siglas: "",
    tipo: "",
    añoFundacion: new Date().getFullYear().toString(),
    sitioWeb: "",
    descripcion: "",
    
    // Régimen fiscal
    tipoPersona: "moral",
    rfc: "",
    razonSocial: "",
    regimenFiscal: "",
    actividadEconomica: "",
    
    // Domicilio fiscal
    domicilioFiscal: {
      calle: "",
      numeroExterior: "",
      numeroInterior: "",
      colonia: "",
      codigoPostal: "",
      municipio: "",
      estado: "Chihuahua",
      pais: "México"
    },
    
    // Contacto institucional
    contactoInstitucional: {
      nombreContacto: "",
      cargo: "",
    telefono: "",
    email: "",
      extension: ""
    },

    // Áreas de investigación
    areasInvestigacion: [],

    // Otros
    capacidadInvestigacion: ""
  })

  // Tipos de institución
  const tiposInstitucion = [
    "Universidad Pública",
    "Universidad Privada",
    "Centro de Investigación",
    "Instituto Tecnológico",
    "Institución de Educación Superior",
    "Centro de Desarrollo",
    "Laboratorio de Investigación",
    "Otro"
  ]

  // Regímenes fiscales
  const regimenesFiscales = [
    "601 - General de Ley Personas Morales",
    "603 - Personas Morales con Fines no Lucrativos",
    "605 - Sueldos y Salarios e Ingresos Asimilados a Salarios",
    "606 - Arrendamiento",
    "607 - Régimen de Enajenación o Adquisición de Bienes",
    "608 - Demás ingresos",
    "610 - Residentes en el Extranjero sin Establecimiento Permanente en México",
    "611 - Ingresos por Dividendos (socios y accionistas)",
    "612 - Personas Físicas con Actividades Empresariales y Profesionales",
    "614 - Ingresos por intereses",
    "615 - Régimen de los ingresos por obtención de premios",
    "616 - Sin obligaciones fiscales",
    "620 - Sociedades Cooperativas de Producción que optan por diferir sus ingresos",
    "621 - Incorporación Fiscal",
    "622 - Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras",
    "623 - Opcional para Grupos de Sociedades",
    "624 - Coordinados",
    "625 - Régimen de las Actividades Empresariales con ingresos a través de Plataformas Tecnológicas",
    "626 - Régimen Simplificado de Confianza"
  ]

  // Estados de México
  const estados = [
    "Aguascalientes", "Baja California", "Baja California Sur", "Campeche", "Chiapas",
    "Chihuahua", "Ciudad de México", "Coahuila", "Colima", "Durango", "Guanajuato",
    "Guerrero", "Hidalgo", "Jalisco", "México", "Michoacán", "Morelos", "Nayarit",
    "Nuevo León", "Oaxaca", "Puebla", "Querétaro", "Quintana Roo", "San Luis Potosí",
    "Sinaloa", "Sonora", "Tabasco", "Tamaulipas", "Tlaxcala", "Veracruz", "Yucatán", "Zacatecas"
  ]

  // Calcular progreso de secciones
  const sections = [
    {
      id: "basica",
      title: "Información Básica",
      completed: calculateSectionProgress([
        { value: formData.nombre, required: true },
        { value: formData.tipo, required: true },
        { value: formData.añoFundacion, required: true },
        { value: formData.descripcion, required: true }
      ]) === 100
    },
    {
      id: "fiscal",
      title: "Régimen Fiscal",
      completed: calculateSectionProgress([
        { value: formData.rfc, required: true },
        { value: formData.razonSocial, required: true },
        { value: formData.regimenFiscal, required: true },
        ...(formData.tipoPersona === "moral" ? [
          { value: formData.numeroEscritura, required: true },
          { value: formData.fechaConstitucion, required: true }
        ] : [])
      ]) === 100
    },
    {
      id: "domicilio",
      title: "Domicilio Fiscal",
      completed: calculateSectionProgress([
        { value: formData.domicilioFiscal.calle, required: true },
        { value: formData.domicilioFiscal.numeroExterior, required: true },
        { value: formData.domicilioFiscal.colonia, required: true },
        { value: formData.domicilioFiscal.codigoPostal, required: true },
        { value: formData.domicilioFiscal.municipio, required: true }
      ]) === 100
    },
    {
      id: "contacto",
      title: "Contacto",
      completed: calculateSectionProgress([
        { value: formData.contactoInstitucional.nombreContacto, required: true },
        { value: formData.contactoInstitucional.telefono, required: true },
        { value: formData.contactoInstitucional.email, required: true }
      ]) === 100
    },
    {
      id: "areas",
      title: "Áreas de Investigación",
      completed: formData.areasInvestigacion.length > 0
    },
    {
      id: "documentos",
      title: "Documentos",
      completed: !!formData.constanciaSituacionFiscal && (
        formData.tipoPersona === "fisica" || !!formData.actaConstitutiva
      )
    }
  ]

  // Manejar cambios en el formulario con auto-formato
  const handleInputChange = (field: keyof FormData, value: string | File) => {
    let formattedValue = value

    // Auto-formato según el campo
    if (typeof value === "string") {
      switch (field) {
        case "rfc":
          formattedValue = formatRFC(value, formData.tipoPersona)
          break
        case "curp":
          formattedValue = formatCURP(value)
          break
      }
    }

    setFormData(prev => ({
      ...prev,
      [field]: formattedValue
    }))
    
    // Limpiar errores del campo modificado
    setErrors(prev => prev.filter(error => error.field !== field))
  }

  // Manejar cambios en domicilio fiscal con auto-formato
  const handleDomicilioChange = (field: keyof DomicilioFiscal, value: string) => {
    let formattedValue = value
    
    // Auto-formato para código postal
    if (field === "codigoPostal") {
      formattedValue = formatCP(value)
    }
    
    setFormData(prev => ({
      ...prev,
      domicilioFiscal: {
        ...prev.domicilioFiscal,
        [field]: formattedValue
      }
    }))
    
    setErrors(prev => prev.filter(error => error.field !== `domicilioFiscal.${field}`))
  }

  // Manejar cambios en contacto institucional con auto-formato
  const handleContactoChange = (field: keyof ContactoInstitucional, value: string) => {
    let formattedValue = value
    
    // Auto-formato para teléfono
    if (field === "telefono") {
      formattedValue = formatPhone(value)
    }
    
    setFormData(prev => ({
      ...prev,
      contactoInstitucional: {
        ...prev.contactoInstitucional,
        [field]: formattedValue
      }
    }))
    
    setErrors(prev => prev.filter(error => error.field !== `contactoInstitucional.${field}`))
  }

  // Manejar cambios en representante legal con auto-formato
  const handleRepresentanteChange = (field: keyof RepresentanteLegal, value: string) => {
    let formattedValue = value
    
    // Auto-formato para RFC y teléfono
    if (field === "rfc") {
      formattedValue = formatRFC(value, "fisica") // Representante siempre es persona física
    } else if (field === "telefono") {
      formattedValue = formatPhone(value)
    }
    
    setFormData(prev => ({
      ...prev,
      representanteLegal: {
        ...prev.representanteLegal!,
        [field]: formattedValue
      }
    }))
    
    setErrors(prev => prev.filter(error => error.field !== `representanteLegal.${field}`))
  }

  // Inicializar representante legal cuando se selecciona persona moral
  const handleTipoPersonaChange = (value: "fisica" | "moral") => {
    setFormData(prev => {
      const newData = {
        ...prev,
        tipoPersona: value
      }
      
      if (value === "moral" && !newData.representanteLegal) {
        newData.representanteLegal = {
          nombre: "",
          cargo: "",
          rfc: "",
          telefono: "",
          email: ""
        }
      }
      
      return newData
    })
  }

  // Agregar área de investigación
  const handleAddArea = () => {
    if (areaInvestigacion.trim() && !formData.areasInvestigacion.includes(areaInvestigacion.trim())) {
      setFormData(prev => ({
        ...prev,
        areasInvestigacion: [...prev.areasInvestigacion, areaInvestigacion.trim()]
      }))
      setAreaInvestigacion("")
    }
  }

  // Remover área de investigación
  const handleRemoveArea = (area: string) => {
    setFormData(prev => ({
      ...prev,
      areasInvestigacion: prev.areasInvestigacion.filter(a => a !== area)
    }))
  }

  // Manejar archivos
  const handleFileChange = (field: keyof FormData, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validar tamaño (máximo 10MB)
      const maxSize = 10 * 1024 * 1024
      if (file.size > maxSize) {
        setErrors(prev => [...prev, {
          field: field,
          message: "El archivo es demasiado grande. El tamaño máximo es 10MB"
        }])
        event.target.value = ""
        return
      }

      // Validar tipo de archivo
      const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
      if (!validTypes.includes(file.type)) {
        setErrors(prev => [...prev, {
          field: field,
          message: "Formato no válido. Solo se permiten PDF, JPG y PNG"
        }])
        event.target.value = ""
        return
      }

      setFormData(prev => ({
        ...prev,
        [field]: file
      }))
      
      setErrors(prev => prev.filter(e => e.field !== field))
    }
  }

  // Validar RFC
  const validateRFC = (rfc: string): boolean => {
    if (!rfc) return false
    // Persona moral: 12 caracteres, Persona física: 13 caracteres
    const rfcRegex = formData.tipoPersona === "moral" 
      ? /^[A-ZÑ&]{3}\d{6}[A-Z0-9]{3}$/
      : /^[A-Z]{4}\d{6}[A-Z0-9]{3}$/
    return rfcRegex.test(rfc.toUpperCase())
  }

  // Validar CURP
  const validateCURP = (curp: string): boolean => {
    if (!curp) return false
    const curpRegex = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[0-9A-Z]\d$/
    return curpRegex.test(curp.toUpperCase())
  }

  // Validar código postal
  const validateCP = (cp: string): boolean => {
    return /^\d{5}$/.test(cp)
  }

  // Validar teléfono
  const validatePhone = (phone: string): boolean => {
    return /^\d{10}$/.test(phone.replace(/\D/g, ''))
  }

  // Validar email
  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  // Validar URL
  const validateURL = (url: string): boolean => {
    if (!url) return true // URL es opcional
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  // Validar formulario
  const validateForm = (): boolean => {
    const newErrors: ErrorMessage[] = []

    // Información básica
    if (!formData.nombre.trim()) {
      newErrors.push({ field: "nombre", message: "El nombre es obligatorio" })
    } else if (formData.nombre.length < 5) {
      newErrors.push({ field: "nombre", message: "El nombre debe tener al menos 5 caracteres" })
    }

    if (!formData.tipo) {
      newErrors.push({ field: "tipo", message: "El tipo de institución es obligatorio" })
    }

    // Validar campo "Otro" especificar
    if (formData.tipo === "Otro" && !formData.tipoOtroEspecificar?.trim()) {
      newErrors.push({ field: "tipoOtroEspecificar", message: "Debe especificar el tipo de institución" })
    }

    if (!formData.añoFundacion) {
      newErrors.push({ field: "añoFundacion", message: "El año de fundación es obligatorio" })
        } else {
      const año = parseInt(formData.añoFundacion)
      if (año < 1500 || año > new Date().getFullYear()) {
        newErrors.push({ field: "añoFundacion", message: `El año debe estar entre 1500 y ${new Date().getFullYear()}` })
      }
    }

    if (!formData.descripcion.trim()) {
      newErrors.push({ field: "descripcion", message: "La descripción es obligatoria" })
    } else if (formData.descripcion.length < 50) {
      newErrors.push({ field: "descripcion", message: "La descripción debe tener al menos 50 caracteres" })
    }

    if (formData.sitioWeb && !validateURL(formData.sitioWeb)) {
      newErrors.push({ field: "sitioWeb", message: "URL inválida (debe empezar con http:// o https://)" })
    }

    // Régimen fiscal
    if (!formData.rfc) {
      newErrors.push({ field: "rfc", message: "El RFC es obligatorio" })
    } else if (!validateRFC(formData.rfc)) {
      newErrors.push({ field: "rfc", message: `RFC inválido (debe tener ${formData.tipoPersona === "moral" ? "12" : "13"} caracteres)` })
    }

    if (!formData.razonSocial.trim()) {
      newErrors.push({ field: "razonSocial", message: "La razón social es obligatoria" })
    }

    if (!formData.regimenFiscal) {
      newErrors.push({ field: "regimenFiscal", message: "El régimen fiscal es obligatorio" })
    }

    // Validaciones específicas persona física
    if (formData.tipoPersona === "fisica") {
      if (formData.curp && !validateCURP(formData.curp)) {
        newErrors.push({ field: "curp", message: "CURP inválido" })
      }
    }

    // Validaciones específicas persona moral
    if (formData.tipoPersona === "moral") {
      if (!formData.numeroEscritura) {
        newErrors.push({ field: "numeroEscritura", message: "El número de escritura es obligatorio para persona moral" })
      }
      
      if (!formData.fechaConstitucion) {
        newErrors.push({ field: "fechaConstitucion", message: "La fecha de constitución es obligatoria" })
      }
    }

    // Domicilio fiscal
    if (!formData.domicilioFiscal.calle.trim()) {
      newErrors.push({ field: "domicilioFiscal.calle", message: "La calle es obligatoria" })
    }

    if (!formData.domicilioFiscal.numeroExterior.trim()) {
      newErrors.push({ field: "domicilioFiscal.numeroExterior", message: "El número exterior es obligatorio" })
    }

    if (!formData.domicilioFiscal.colonia.trim()) {
      newErrors.push({ field: "domicilioFiscal.colonia", message: "La colonia es obligatoria" })
    }

    if (!formData.domicilioFiscal.codigoPostal) {
      newErrors.push({ field: "domicilioFiscal.codigoPostal", message: "El código postal es obligatorio" })
    } else if (!validateCP(formData.domicilioFiscal.codigoPostal)) {
      newErrors.push({ field: "domicilioFiscal.codigoPostal", message: "Código postal inválido (debe tener 5 dígitos)" })
    }

    if (!formData.domicilioFiscal.municipio.trim()) {
      newErrors.push({ field: "domicilioFiscal.municipio", message: "El municipio es obligatorio" })
    }

    // Contacto institucional
    if (!formData.contactoInstitucional.nombreContacto.trim()) {
      newErrors.push({ field: "contactoInstitucional.nombreContacto", message: "El nombre de contacto es obligatorio" })
    }

    if (!formData.contactoInstitucional.telefono) {
      newErrors.push({ field: "contactoInstitucional.telefono", message: "El teléfono de contacto es obligatorio" })
    } else if (!validatePhone(formData.contactoInstitucional.telefono)) {
      newErrors.push({ field: "contactoInstitucional.telefono", message: "Teléfono inválido (debe tener 10 dígitos)" })
    }

    if (!formData.contactoInstitucional.email) {
      newErrors.push({ field: "contactoInstitucional.email", message: "El email de contacto es obligatorio" })
    } else if (!validateEmail(formData.contactoInstitucional.email)) {
      newErrors.push({ field: "contactoInstitucional.email", message: "Email inválido" })
    }

    // Representante legal (persona moral)
    if (formData.tipoPersona === "moral" && formData.representanteLegal) {
      if (!formData.representanteLegal.nombre.trim()) {
        newErrors.push({ field: "representanteLegal.nombre", message: "El nombre del representante legal es obligatorio" })
      }

      if (!formData.representanteLegal.rfc) {
        newErrors.push({ field: "representanteLegal.rfc", message: "El RFC del representante legal es obligatorio" })
      } else if (!/^[A-Z]{4}\d{6}[A-Z0-9]{3}$/.test(formData.representanteLegal.rfc.toUpperCase())) {
        newErrors.push({ field: "representanteLegal.rfc", message: "RFC del representante inválido" })
      }

      if (formData.representanteLegal.email && !validateEmail(formData.representanteLegal.email)) {
        newErrors.push({ field: "representanteLegal.email", message: "Email del representante inválido" })
      }
    }

    // Áreas de investigación
    if (formData.areasInvestigacion.length === 0) {
      newErrors.push({ field: "areasInvestigacion", message: "Debe agregar al menos un área de investigación" })
    }

    setErrors(newErrors)
    return newErrors.length === 0
  }

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Errores en el formulario', {
        description: 'Por favor corrige los errores antes de continuar'
      })
      return
    }

    setLoading(true)

    try {
      // Subir documentos si existen
      toast.loading('Subiendo documentos...', { id: 'upload' })
      
      const documentUrls: Record<string, string> = {}
      
      const documentFields = [
        'constanciaSituacionFiscal',
        'actaConstitutiva',
        'poderRepresentante',
        'comprobanteDomicilio',
        'identificacionOficial'
      ] as const

      for (const field of documentFields) {
        const file = formData[field]
        if (file) {
          const formDataUpload = new FormData()
          formDataUpload.append('file', file)

          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: formDataUpload,
          })

          if (!uploadResponse.ok) {
            const uploadError = await uploadResponse.json()
            throw new Error(`Error al subir ${field}: ${uploadError.error}`)
          }

          const uploadResult = await uploadResponse.json()
          documentUrls[field] = uploadResult.url
        }
      }

      toast.success('Documentos subidos correctamente', { id: 'upload' })

      // Preparar datos para enviar a la API
      toast.loading('Registrando institución...', { id: 'save' })
      
      const institucionData = {
        // Información básica
        nombre: formData.nombre,
        siglas: formData.siglas,
        tipo: formData.tipo,
        añoFundacion: parseInt(formData.añoFundacion),
        sitioWeb: formData.sitioWeb || null,
        descripcion: formData.descripcion,
        
        // Régimen fiscal
        tipoPersona: formData.tipoPersona,
        rfc: formData.rfc.toUpperCase(),
        razonSocial: formData.razonSocial,
        regimenFiscal: formData.regimenFiscal,
        actividadEconomica: formData.actividadEconomica || null,
        
        // Específicos persona física
        curp: formData.curp?.toUpperCase() || null,
        nombreCompleto: formData.nombreCompleto || null,
        
        // Específicos persona moral
        numeroEscritura: formData.numeroEscritura || null,
        fechaConstitucion: formData.fechaConstitucion || null,
        notarioPublico: formData.notarioPublico || null,
        numeroNotaria: formData.numeroNotaria || null,
        registroPublico: formData.registroPublico || null,
        objetoSocial: formData.objetoSocial || null,
        
        // Domicilio fiscal
        domicilioFiscal: formData.domicilioFiscal,
        
        // Representante legal
        representanteLegal: formData.tipoPersona === "moral" ? formData.representanteLegal : null,
        
        // Contacto institucional
        contactoInstitucional: formData.contactoInstitucional,
        
        // Áreas de investigación
        areasInvestigacion: formData.areasInvestigacion,
        
        // Capacidad de investigación
        capacidadInvestigacion: formData.capacidadInvestigacion || null,
        
        // URLs de documentos
        documentos: documentUrls
      }

      // Enviar a la API
      const response = await fetch('/api/instituciones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(institucionData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        toast.error('Error al registrar la institución', { 
          id: 'save',
          description: errorData.error || 'Inténtalo de nuevo más tarde' 
        })
        throw new Error(errorData.error || 'Error al registrar la institución')
      }

      const result = await response.json()
      console.log("Institución creada:", result)
      
      // Mostrar éxito
      toast.success('¡Institución registrada exitosamente!', { 
        id: 'save',
        description: 'La institución ha sido registrada y estará visible tras revisión' 
      })
      
      // Redirigir a la página de instituciones después de un breve delay
      setTimeout(() => {
        router.push("/instituciones")
      }, 1500)

    } catch (error) {
      console.error("Error al registrar institución:", error)
      setErrors([{ 
        field: "general", 
        message: error instanceof Error ? error.message : "Error al registrar la institución. Inténtalo de nuevo." 
      }])
      
      toast.error('Error al registrar la institución', {
        description: error instanceof Error ? error.message : 'Inténtalo de nuevo'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="space-y-6">
          {/* Header */}
        <AnimatedHeader 
          title="Registrar Nueva Institución"
          subtitle="Complete la información fiscal y académica de su institución"
        />

        {/* Errores generales */}
        {errors.some(error => error.field === "general") && (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-700">
              {errors.find(error => error.field === "general")?.message}
            </AlertDescription>
          </Alert>
        )}

        {/* Layout con progreso lateral */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Indicador de progreso (lateral en desktop) */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <FormProgress sections={sections} currentSection={currentSection} />
          </div>

          {/* Formulario */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Información básica */}
              <AnimatedCard 
                className="bg-white border-blue-100 scroll-mt-24" 
                id="basica"
                delay={100}
                onFocus={() => setCurrentSection("basica")}
              >
            <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-700">1</span>
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-blue-900 flex items-center gap-2">
                        <Building className="h-5 w-5" />
                        Información Básica de la Institución
                      </CardTitle>
                      <CardDescription>
                        Datos generales de identificación
              </CardDescription>
                    </div>
                    {sections[0]?.completed && (
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    )}
                  </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                  <Label htmlFor="nombre" className="text-blue-900">
                      Nombre de la Institución *
                    </Label>
                    <Input
                      id="nombre"
                      placeholder="Universidad Autónoma de Chihuahua"
                    value={formData.nombre}
                    onChange={(e) => handleInputChange("nombre", e.target.value)}
                    className={errors.some(e => e.field === "nombre") ? "border-red-300" : ""}
                    />
                  {errors.some(e => e.field === "nombre") && (
                    <p className="text-sm text-red-600">
                      {errors.find(e => e.field === "nombre")?.message}
                    </p>
                  )}
                  </div>

                  <div className="space-y-2">
                  <Label htmlFor="siglas" className="text-blue-900">
                    Siglas o Abreviatura
                    </Label>
                    <Input
                      id="siglas"
                      placeholder="UACH"
                    value={formData.siglas}
                    onChange={(e) => handleInputChange("siglas", e.target.value)}
                    />
                  </div>
                </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                  <Label htmlFor="tipo" className="text-blue-900">
                      Tipo de Institución *
                    </Label>
                  <Select value={formData.tipo} onValueChange={(value) => handleInputChange("tipo", value)}>
                    <SelectTrigger className={errors.some(e => e.field === "tipo") ? "border-red-300" : ""}>
                        <SelectValue placeholder="Selecciona el tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {tiposInstitucion.map((tipo) => (
                          <SelectItem key={tipo} value={tipo}>
                            {tipo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  {errors.some(e => e.field === "tipo") && (
                    <p className="text-sm text-red-600">
                      {errors.find(e => e.field === "tipo")?.message}
                    </p>
                  )}
                  </div>

                  <div className="space-y-2">
                  <Label htmlFor="añoFundacion" className="text-blue-900">
                      Año de Fundación *
                    </Label>
                    <Input
                    id="añoFundacion"
                      type="number"
                    min="1500"
                      max={new Date().getFullYear()}
                    value={formData.añoFundacion}
                    onChange={(e) => handleInputChange("añoFundacion", e.target.value)}
                    className={errors.some(e => e.field === "añoFundacion") ? "border-red-300" : ""}
                    />
                  {errors.some(e => e.field === "añoFundacion") && (
                    <p className="text-sm text-red-600">
                      {errors.find(e => e.field === "añoFundacion")?.message}
                    </p>
                  )}
                  </div>
                </div>

                {/* Campo condicional para especificar "Otro" tipo de institución */}
                {formData.tipo === "Otro" && (
                  <div className="space-y-2">
                    <Label htmlFor="tipoOtroEspecificar" className="text-blue-900">
                      Especificar Tipo de Institución *
                    </Label>
                    <Input
                      id="tipoOtroEspecificar"
                      placeholder="Especifica el tipo de institución"
                      value={formData.tipoOtroEspecificar || ""}
                      onChange={(e) => handleInputChange("tipoOtroEspecificar", e.target.value)}
                      className={errors.some(e => e.field === "tipoOtroEspecificar") ? "border-red-300" : ""}
                    />
                    {errors.some(e => e.field === "tipoOtroEspecificar") && (
                      <p className="text-sm text-red-600">
                        {errors.find(e => e.field === "tipoOtroEspecificar")?.message}
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                <Label htmlFor="sitioWeb" className="text-blue-900">
                  Sitio Web
                  </Label>
                  <Input
                  id="sitioWeb"
                  type="url"
                  placeholder="https://www.ejemplo.edu.mx"
                  value={formData.sitioWeb}
                  onChange={(e) => handleInputChange("sitioWeb", e.target.value)}
                  className={errors.some(e => e.field === "sitioWeb") ? "border-red-300" : ""}
                />
                {errors.some(e => e.field === "sitioWeb") && (
                  <p className="text-sm text-red-600">
                    {errors.find(e => e.field === "sitioWeb")?.message}
                  </p>
                )}
                </div>

                <div className="space-y-2">
                <Label htmlFor="descripcion" className="text-blue-900">
                  Descripción de la Institución *
                  </Label>
                  <Textarea
                    id="descripcion"
                  placeholder="Describe la misión, visión y principales actividades de la institución..."
                    value={formData.descripcion}
                  onChange={(e) => handleInputChange("descripcion", e.target.value)}
                  className={`min-h-[120px] ${errors.some(e => e.field === "descripcion") ? "border-red-300" : ""}`}
                />
                <div className="flex justify-between text-sm text-blue-600">
                  <span>Mínimo 50 caracteres</span>
                  <span>{formData.descripcion.length} caracteres</span>
                </div>
                {errors.some(e => e.field === "descripcion") && (
                  <p className="text-sm text-red-600">
                    {errors.find(e => e.field === "descripcion")?.message}
                  </p>
                )}
              </div>
            </CardContent>
              </AnimatedCard>

              {/* Régimen Fiscal */}
              <AnimatedCard 
                className="bg-white border-blue-100 scroll-mt-24" 
                id="fiscal"
                onFocus={() => setCurrentSection("fiscal")}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-700">2</span>
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-blue-900 flex items-center gap-2">
                        <FileCheck className="h-5 w-5" />
                        Régimen Fiscal
                      </CardTitle>
                      <CardDescription>
                        Información de la carta de régimen fiscal y datos tributarios
                      </CardDescription>
                    </div>
                    {sections[1]?.completed && (
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    )}
                  </div>
                </CardHeader>
            <CardContent className="space-y-4">
              {/* Tipo de persona */}
              <div className="space-y-3">
                <Label className="text-blue-900">Tipo de Persona *</Label>
                <RadioGroup 
                  value={formData.tipoPersona} 
                  onValueChange={(value: "fisica" | "moral") => handleTipoPersonaChange(value)}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fisica" id="fisica" />
                    <Label htmlFor="fisica" className="font-normal cursor-pointer">
                      Persona Física
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="moral" id="moral" />
                    <Label htmlFor="moral" className="font-normal cursor-pointer">
                      Persona Moral
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                  <Label htmlFor="rfc" className="text-blue-900">
                    RFC (Registro Federal de Contribuyentes) *
                      </Label>
                      <Input
                    id="rfc"
                    placeholder={formData.tipoPersona === "moral" ? "ABC123456XXX" : "ABCD123456XXX"}
                    value={formData.rfc}
                    onChange={(e) => handleInputChange("rfc", e.target.value.toUpperCase())}
                    className={errors.some(e => e.field === "rfc") ? "border-red-300" : ""}
                    maxLength={formData.tipoPersona === "moral" ? 12 : 13}
                  />
                  <p className="text-xs text-blue-600">
                    {formData.tipoPersona === "moral" ? "12 caracteres" : "13 caracteres"} (sin guiones ni espacios)
                  </p>
                  {errors.some(e => e.field === "rfc") && (
                    <p className="text-sm text-red-600">
                      {errors.find(e => e.field === "rfc")?.message}
                    </p>
                  )}
                    </div>

                    <div className="space-y-2">
                  <Label htmlFor="razonSocial" className="text-blue-900">
                    Razón Social *
                  </Label>
                  <Input
                    id="razonSocial"
                    placeholder="Nombre fiscal completo"
                    value={formData.razonSocial}
                    onChange={(e) => handleInputChange("razonSocial", e.target.value)}
                    className={errors.some(e => e.field === "razonSocial") ? "border-red-300" : ""}
                  />
                  {errors.some(e => e.field === "razonSocial") && (
                    <p className="text-sm text-red-600">
                      {errors.find(e => e.field === "razonSocial")?.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="regimenFiscal" className="text-blue-900">
                  Régimen Fiscal *
                </Label>
                <Select value={formData.regimenFiscal} onValueChange={(value) => handleInputChange("regimenFiscal", value)}>
                  <SelectTrigger className={errors.some(e => e.field === "regimenFiscal") ? "border-red-300" : ""}>
                    <SelectValue placeholder="Selecciona el régimen fiscal" />
                  </SelectTrigger>
                  <SelectContent>
                    {regimenesFiscales.map((regimen) => (
                      <SelectItem key={regimen} value={regimen}>
                        {regimen}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.some(e => e.field === "regimenFiscal") && (
                  <p className="text-sm text-red-600">
                    {errors.find(e => e.field === "regimenFiscal")?.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="actividadEconomica" className="text-blue-900">
                  Actividad Económica
                </Label>
                <Input
                  id="actividadEconomica"
                  placeholder="Educación superior, Investigación científica..."
                  value={formData.actividadEconomica}
                  onChange={(e) => handleInputChange("actividadEconomica", e.target.value)}
                />
              </div>

              {/* Campos específicos para persona física */}
              {formData.tipoPersona === "fisica" && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-4">
                  <h4 className="font-medium text-amber-900 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Información de Persona Física
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nombreCompleto" className="text-amber-900">
                        Nombre Completo
                      </Label>
                      <Input
                        id="nombreCompleto"
                        placeholder="Nombre completo del titular"
                        value={formData.nombreCompleto || ""}
                        onChange={(e) => handleInputChange("nombreCompleto", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="curp" className="text-amber-900">
                        CURP
                      </Label>
                      <Input
                        id="curp"
                        placeholder="ABCD123456HDFXXX00"
                        value={formData.curp || ""}
                        onChange={(e) => handleInputChange("curp", e.target.value.toUpperCase())}
                        className={errors.some(e => e.field === "curp") ? "border-red-300" : ""}
                        maxLength={18}
                      />
                      {errors.some(e => e.field === "curp") && (
                        <p className="text-sm text-red-600">
                          {errors.find(e => e.field === "curp")?.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Campos específicos para persona moral */}
              {formData.tipoPersona === "moral" && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-4">
                  <h4 className="font-medium text-blue-900 flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Información de Persona Moral
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="numeroEscritura" className="text-blue-900">
                        Número de Escritura Pública *
                      </Label>
                      <Input
                        id="numeroEscritura"
                        placeholder="12345"
                        value={formData.numeroEscritura || ""}
                        onChange={(e) => handleInputChange("numeroEscritura", e.target.value)}
                        className={errors.some(e => e.field === "numeroEscritura") ? "border-red-300" : ""}
                      />
                      {errors.some(e => e.field === "numeroEscritura") && (
                        <p className="text-sm text-red-600">
                          {errors.find(e => e.field === "numeroEscritura")?.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fechaConstitucion" className="text-blue-900">
                        Fecha de Constitución *
                      </Label>
                      <Input
                        id="fechaConstitucion"
                        type="date"
                        value={formData.fechaConstitucion || ""}
                        onChange={(e) => handleInputChange("fechaConstitucion", e.target.value)}
                        className={errors.some(e => e.field === "fechaConstitucion") ? "border-red-300" : ""}
                      />
                      {errors.some(e => e.field === "fechaConstitucion") && (
                        <p className="text-sm text-red-600">
                          {errors.find(e => e.field === "fechaConstitucion")?.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="notarioPublico" className="text-blue-900">
                        Notario Público
                      </Label>
                      <Input
                        id="notarioPublico"
                        placeholder="Lic. Juan Pérez"
                        value={formData.notarioPublico || ""}
                        onChange={(e) => handleInputChange("notarioPublico", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="numeroNotaria" className="text-blue-900">
                        Número de Notaría
                      </Label>
                      <Input
                        id="numeroNotaria"
                        placeholder="15"
                        value={formData.numeroNotaria || ""}
                        onChange={(e) => handleInputChange("numeroNotaria", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="registroPublico" className="text-blue-900">
                        Folio Registro Público
                      </Label>
                      <Input
                        id="registroPublico"
                        placeholder="Folio de inscripción"
                        value={formData.registroPublico || ""}
                        onChange={(e) => handleInputChange("registroPublico", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="objetoSocial" className="text-blue-900">
                      Objeto Social
                    </Label>
                    <Textarea
                      id="objetoSocial"
                      placeholder="Describe las actividades principales conforme al acta constitutiva..."
                      value={formData.objetoSocial || ""}
                      onChange={(e) => handleInputChange("objetoSocial", e.target.value)}
                      className="min-h-[80px]"
                    />
                  </div>
                </div>
              )}
            </CardContent>
              </AnimatedCard>

              {/* Domicilio Fiscal */}
              <AnimatedCard 
                className="bg-white border-blue-100 scroll-mt-24" 
                id="domicilio"
                delay={300}
                onFocus={() => setCurrentSection("domicilio")}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-700">3</span>
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-blue-900 flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Domicilio Fiscal
                      </CardTitle>
                      <CardDescription>
                        Dirección fiscal registrada ante el SAT
                      </CardDescription>
                    </div>
                    {sections[2]?.completed && (
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    )}
                  </div>
                </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="calle" className="text-blue-900">
                    Calle *
                  </Label>
                  <Input
                    id="calle"
                    placeholder="Nombre de la calle"
                    value={formData.domicilioFiscal.calle}
                    onChange={(e) => handleDomicilioChange("calle", e.target.value)}
                    className={errors.some(e => e.field === "domicilioFiscal.calle") ? "border-red-300" : ""}
                  />
                  {errors.some(e => e.field === "domicilioFiscal.calle") && (
                    <p className="text-sm text-red-600">
                      {errors.find(e => e.field === "domicilioFiscal.calle")?.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numeroExterior" className="text-blue-900">
                    Número Exterior *
                  </Label>
                  <Input
                    id="numeroExterior"
                    placeholder="123"
                    value={formData.domicilioFiscal.numeroExterior}
                    onChange={(e) => handleDomicilioChange("numeroExterior", e.target.value)}
                    className={errors.some(e => e.field === "domicilioFiscal.numeroExterior") ? "border-red-300" : ""}
                  />
                  {errors.some(e => e.field === "domicilioFiscal.numeroExterior") && (
                    <p className="text-sm text-red-600">
                      {errors.find(e => e.field === "domicilioFiscal.numeroExterior")?.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="numeroInterior" className="text-blue-900">
                    Número Interior
                  </Label>
                  <Input
                    id="numeroInterior"
                    placeholder="A, B, 101..."
                    value={formData.domicilioFiscal.numeroInterior}
                    onChange={(e) => handleDomicilioChange("numeroInterior", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="colonia" className="text-blue-900">
                    Colonia *
                  </Label>
                  <Input
                    id="colonia"
                    placeholder="Nombre de la colonia"
                    value={formData.domicilioFiscal.colonia}
                    onChange={(e) => handleDomicilioChange("colonia", e.target.value)}
                    className={errors.some(e => e.field === "domicilioFiscal.colonia") ? "border-red-300" : ""}
                  />
                  {errors.some(e => e.field === "domicilioFiscal.colonia") && (
                    <p className="text-sm text-red-600">
                      {errors.find(e => e.field === "domicilioFiscal.colonia")?.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="codigoPostal" className="text-blue-900">
                    Código Postal *
                  </Label>
                  <Input
                    id="codigoPostal"
                    placeholder="31000"
                    value={formData.domicilioFiscal.codigoPostal}
                    onChange={(e) => handleDomicilioChange("codigoPostal", e.target.value)}
                    className={errors.some(e => e.field === "domicilioFiscal.codigoPostal") ? "border-red-300" : ""}
                    maxLength={5}
                  />
                  {errors.some(e => e.field === "domicilioFiscal.codigoPostal") && (
                    <p className="text-sm text-red-600">
                      {errors.find(e => e.field === "domicilioFiscal.codigoPostal")?.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="municipio" className="text-blue-900">
                    Municipio *
                  </Label>
                  <Input
                    id="municipio"
                    placeholder="Chihuahua"
                    value={formData.domicilioFiscal.municipio}
                    onChange={(e) => handleDomicilioChange("municipio", e.target.value)}
                    className={errors.some(e => e.field === "domicilioFiscal.municipio") ? "border-red-300" : ""}
                  />
                  {errors.some(e => e.field === "domicilioFiscal.municipio") && (
                    <p className="text-sm text-red-600">
                      {errors.find(e => e.field === "domicilioFiscal.municipio")?.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estado" className="text-blue-900">
                    Estado
                  </Label>
                  <Select value={formData.domicilioFiscal.estado} onValueChange={(value) => handleDomicilioChange("estado", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {estados.map((estado) => (
                        <SelectItem key={estado} value={estado}>
                          {estado}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pais" className="text-blue-900">
                    País
                  </Label>
                  <Input
                    id="pais"
                    value={formData.domicilioFiscal.pais}
                    onChange={(e) => handleDomicilioChange("pais", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
              </AnimatedCard>

              {/* Representante Legal (solo persona moral) */}
              {formData.tipoPersona === "moral" && (
                <AnimatedCard 
                  className="bg-white border-blue-100 scroll-mt-24" 
                  id="representante"
                  delay={350}
                  onFocus={() => setCurrentSection("fiscal")}
                >
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-amber-700" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-blue-900 flex items-center gap-2">
                          Representante Legal
                        </CardTitle>
                        <CardDescription>
                          Información del representante legal de la institución
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="representanteNombre" className="text-blue-900">
                      Nombre Completo *
                    </Label>
                    <Input
                      id="representanteNombre"
                      placeholder="Lic. María García López"
                      value={formData.representanteLegal?.nombre || ""}
                      onChange={(e) => handleRepresentanteChange("nombre", e.target.value)}
                      className={errors.some(e => e.field === "representanteLegal.nombre") ? "border-red-300" : ""}
                    />
                    {errors.some(e => e.field === "representanteLegal.nombre") && (
                      <p className="text-sm text-red-600">
                        {errors.find(e => e.field === "representanteLegal.nombre")?.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="representanteCargo" className="text-blue-900">
                      Cargo
                    </Label>
                    <Input
                      id="representanteCargo"
                      placeholder="Director General, Rector..."
                      value={formData.representanteLegal?.cargo || ""}
                      onChange={(e) => handleRepresentanteChange("cargo", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="representanteRFC" className="text-blue-900">
                      RFC *
                    </Label>
                    <Input
                      id="representanteRFC"
                      placeholder="ABCD123456XXX"
                      value={formData.representanteLegal?.rfc || ""}
                      onChange={(e) => handleRepresentanteChange("rfc", e.target.value.toUpperCase())}
                      className={errors.some(e => e.field === "representanteLegal.rfc") ? "border-red-300" : ""}
                      maxLength={13}
                    />
                    {errors.some(e => e.field === "representanteLegal.rfc") && (
                      <p className="text-sm text-red-600">
                        {errors.find(e => e.field === "representanteLegal.rfc")?.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="representanteTelefono" className="text-blue-900">
                        Teléfono
                      </Label>
                      <Input
                      id="representanteTelefono"
                      placeholder="6141234567"
                      value={formData.representanteLegal?.telefono || ""}
                      onChange={(e) => handleRepresentanteChange("telefono", e.target.value)}
                      />
                    </div>

                  <div className="space-y-2">
                    <Label htmlFor="representanteEmail" className="text-blue-900">
                      Email
                    </Label>
                    <Input
                      id="representanteEmail"
                      type="email"
                      placeholder="representante@institucion.edu.mx"
                      value={formData.representanteLegal?.email || ""}
                      onChange={(e) => handleRepresentanteChange("email", e.target.value)}
                      className={errors.some(e => e.field === "representanteLegal.email") ? "border-red-300" : ""}
                    />
                    {errors.some(e => e.field === "representanteLegal.email") && (
                      <p className="text-sm text-red-600">
                        {errors.find(e => e.field === "representanteLegal.email")?.message}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
                </AnimatedCard>
              )}

              {/* Contacto Institucional */}
              <AnimatedCard 
                className="bg-white border-blue-100 scroll-mt-24" 
                id="contacto"
                delay={400}
                onFocus={() => setCurrentSection("contacto")}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-700">4</span>
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-blue-900 flex items-center gap-2">
                        <PhoneIcon className="h-5 w-5" />
                        Contacto Institucional
                      </CardTitle>
                      <CardDescription>
                        Persona de contacto para asuntos de la plataforma
                      </CardDescription>
                    </div>
                    {sections[3]?.completed && (
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    )}
                  </div>
                </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                  <Label htmlFor="nombreContacto" className="text-blue-900">
                    Nombre del Contacto *
                    </Label>
                    <Input
                    id="nombreContacto"
                    placeholder="Dr. Juan Pérez"
                    value={formData.contactoInstitucional.nombreContacto}
                    onChange={(e) => handleContactoChange("nombreContacto", e.target.value)}
                    className={errors.some(e => e.field === "contactoInstitucional.nombreContacto") ? "border-red-300" : ""}
                  />
                  {errors.some(e => e.field === "contactoInstitucional.nombreContacto") && (
                    <p className="text-sm text-red-600">
                      {errors.find(e => e.field === "contactoInstitucional.nombreContacto")?.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cargoContacto" className="text-blue-900">
                    Cargo
                  </Label>
                  <Input
                    id="cargoContacto"
                    placeholder="Coordinador de Investigación"
                    value={formData.contactoInstitucional.cargo}
                    onChange={(e) => handleContactoChange("cargo", e.target.value)}
                  />
                  </div>
                </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telefonoContacto" className="text-blue-900">
                    Teléfono *
                  </Label>
                  <Input
                    id="telefonoContacto"
                    placeholder="6141234567"
                    value={formData.contactoInstitucional.telefono}
                    onChange={(e) => handleContactoChange("telefono", e.target.value)}
                    className={errors.some(e => e.field === "contactoInstitucional.telefono") ? "border-red-300" : ""}
                    maxLength={10}
                  />
                  {errors.some(e => e.field === "contactoInstitucional.telefono") && (
                    <p className="text-sm text-red-600">
                      {errors.find(e => e.field === "contactoInstitucional.telefono")?.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="extensionContacto" className="text-blue-900">
                    Extensión
                  </Label>
                  <Input
                    id="extensionContacto"
                    placeholder="1234"
                    value={formData.contactoInstitucional.extension}
                    onChange={(e) => handleContactoChange("extension", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emailContacto" className="text-blue-900">
                    Email *
                  </Label>
                  <Input
                    id="emailContacto"
                    type="email"
                    placeholder="contacto@institucion.edu.mx"
                    value={formData.contactoInstitucional.email}
                    onChange={(e) => handleContactoChange("email", e.target.value)}
                    className={errors.some(e => e.field === "contactoInstitucional.email") ? "border-red-300" : ""}
                  />
                  {errors.some(e => e.field === "contactoInstitucional.email") && (
                    <p className="text-sm text-red-600">
                      {errors.find(e => e.field === "contactoInstitucional.email")?.message}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
              </AnimatedCard>

              {/* Áreas de Investigación */}
              <AnimatedCard 
                className="bg-white border-blue-100 scroll-mt-24" 
                id="areas"
                delay={500}
                onFocus={() => setCurrentSection("areas")}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-700">5</span>
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-blue-900 flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        Áreas de Investigación
                      </CardTitle>
                      <CardDescription>
                        Áreas de conocimiento y líneas de investigación de la institución
                      </CardDescription>
                    </div>
                    {sections[4]?.completed && (
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    )}
                  </div>
                </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <Label htmlFor="areasInvestigacion" className="text-blue-900">
                    Agregar Áreas de Investigación *
                  </Label>
                  <p className="text-sm text-blue-600 mb-2">
                    Escribe un área y presiona Enter o haz clic en +
                  </p>
                  <div className="flex gap-2">
                    <Input
                      id="areasInvestigacion"
                      placeholder="Ej: Biotecnología, Energías Renovables..."
                      value={areaInvestigacion}
                      onChange={(e) => setAreaInvestigacion(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          handleAddArea()
                        }
                      }}
                      className="flex-1"
                    />
                    <Button 
                      type="button" 
                      onClick={handleAddArea} 
                      variant="outline"
                      className="px-3"
                      disabled={!areaInvestigacion.trim()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  </div>

                {errors.some(e => e.field === "areasInvestigacion") && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-700 text-sm">
                      {errors.find(e => e.field === "areasInvestigacion")?.message}
                    </AlertDescription>
                  </Alert>
                )}

                {formData.areasInvestigacion.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-900">
                        Áreas ({formData.areasInvestigacion.length})
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setFormData(prev => ({ ...prev, areasInvestigacion: [] }))}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Limpiar todas
                      </Button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md min-h-[50px]">
                      {formData.areasInvestigacion.map((area, index) => (
                        <AnimatedBadge 
                          key={index} 
                          variant="secondary" 
                          interactive={true}
                          className="bg-blue-100 text-blue-800 border-blue-300 flex items-center gap-1 px-2 py-1 stagger-item"
                        >
                          {area}
                          <button
                            type="button"
                            onClick={() => handleRemoveArea(area)}
                            className="ml-1 hover:text-red-600 smooth-transition hover:scale-110"
                            title={`Eliminar "${area}"`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </AnimatedBadge>
                      ))}
                    </div>
                    </div>
                  )}
                </div>

              <div className="space-y-2">
                <Label htmlFor="capacidadInvestigacion" className="text-blue-900">
                  Capacidad de Investigación
                </Label>
                <Textarea
                  id="capacidadInvestigacion"
                  placeholder="Describe la infraestructura, laboratorios, equipamiento y recursos disponibles para investigación..."
                  value={formData.capacidadInvestigacion}
                  onChange={(e) => handleInputChange("capacidadInvestigacion", e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
              </AnimatedCard>

              {/* Documentos */}
              <AnimatedCard 
                className="bg-white border-blue-100 scroll-mt-24" 
                id="documentos"
                delay={600}
                onFocus={() => setCurrentSection("documentos")}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-700">6</span>
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-blue-900 flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Documentación Requerida
                      </CardTitle>
                      <CardDescription>
                        Sube los documentos oficiales de la institución
                      </CardDescription>
                    </div>
                    {sections[5]?.completed && (
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    )}
                  </div>
                </CardHeader>
            <CardContent className="space-y-4">
              {/* Constancia de Situación Fiscal */}
              <div className="space-y-2">
                <Label htmlFor="constanciaSituacionFiscal" className="text-blue-900">
                  Constancia de Situación Fiscal (CSF) *
                </Label>
                <Input
                  id="constanciaSituacionFiscal"
                        type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange("constanciaSituacionFiscal", e)}
                  className={`h-14 py-2.5 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 ${
                    errors.some(e => e.field === "constanciaSituacionFiscal") ? "border-red-300" : ""
                  }`}
                />
                <p className="text-xs text-blue-600">
                  Descarga reciente del SAT (PDF, JPG, PNG - máx 10MB)
                </p>
                {formData.constanciaSituacionFiscal && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <FileText className="h-4 w-4" />
                    {formData.constanciaSituacionFiscal.name}
                        </div>
                )}
                {errors.some(e => e.field === "constanciaSituacionFiscal") && (
                  <p className="text-sm text-red-600">
                    {errors.find(e => e.field === "constanciaSituacionFiscal")?.message}
                  </p>
                )}
              </div>

              {/* Acta Constitutiva (persona moral) */}
              {formData.tipoPersona === "moral" && (
                <div className="space-y-2">
                  <Label htmlFor="actaConstitutiva" className="text-blue-900">
                    Acta Constitutiva *
                      </Label>
                  <Input
                    id="actaConstitutiva"
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handleFileChange("actaConstitutiva", e)}
                    className={`h-14 py-2.5 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 ${
                      errors.some(e => e.field === "actaConstitutiva") ? "border-red-300" : ""
                    }`}
                  />
                  <p className="text-xs text-blue-600">
                    Documento notariado (PDF - máx 10MB)
                  </p>
                  {formData.actaConstitutiva && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <FileText className="h-4 w-4" />
                      {formData.actaConstitutiva.name}
                    </div>
                  )}
                  {errors.some(e => e.field === "actaConstitutiva") && (
                    <p className="text-sm text-red-600">
                      {errors.find(e => e.field === "actaConstitutiva")?.message}
                    </p>
                      )}
                    </div>
              )}

              {/* Poder del Representante (persona moral) */}
              {formData.tipoPersona === "moral" && (
                <div className="space-y-2">
                  <Label htmlFor="poderRepresentante" className="text-blue-900">
                    Poder del Representante Legal
                  </Label>
                  <Input
                    id="poderRepresentante"
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handleFileChange("poderRepresentante", e)}
                    className="h-14 py-2.5 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <p className="text-xs text-blue-600">
                    Documento que acredita facultades del representante (PDF - máx 10MB)
                  </p>
                  {formData.poderRepresentante && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <FileText className="h-4 w-4" />
                      {formData.poderRepresentante.name}
                      </div>
                    )}
                  </div>
              )}

              {/* Comprobante de Domicilio */}
              <div className="space-y-2">
                <Label htmlFor="comprobanteDomicilio" className="text-blue-900">
                  Comprobante de Domicilio Fiscal
                </Label>
                <Input
                  id="comprobanteDomicilio"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange("comprobanteDomicilio", e)}
                  className="h-14 py-2.5 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="text-xs text-blue-600">
                  Recibo de luz, agua o predial no mayor a 3 meses (PDF, JPG, PNG - máx 10MB)
                </p>
                {formData.comprobanteDomicilio && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <FileText className="h-4 w-4" />
                    {formData.comprobanteDomicilio.name}
                  </div>
                )}
                </div>

              {/* Identificación Oficial */}
              <div className="space-y-2">
                <Label htmlFor="identificacionOficial" className="text-blue-900">
                  Identificación Oficial del Representante
                </Label>
                <Input
                  id="identificacionOficial"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange("identificacionOficial", e)}
                  className="h-14 py-2.5 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="text-xs text-blue-600">
                  INE, Pasaporte o Cédula Profesional (PDF, JPG, PNG - máx 10MB)
                </p>
                {formData.identificacionOficial && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <FileText className="h-4 w-4" />
                    {formData.identificacionOficial.name}
                  </div>
                )}
              </div>

              {/* Resumen de documentos */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Documentos Subidos</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    {formData.constanciaSituacionFiscal ? (
                      <span className="text-green-600">✓ Constancia de Situación Fiscal</span>
                    ) : (
                      <span className="text-gray-400">○ Constancia de Situación Fiscal (Requerida)</span>
                    )}
                  </div>
                  {formData.tipoPersona === "moral" && (
                    <>
                      <div className="flex items-center gap-2">
                        {formData.actaConstitutiva ? (
                          <span className="text-green-600">✓ Acta Constitutiva</span>
                        ) : (
                          <span className="text-gray-400">○ Acta Constitutiva (Requerida)</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {formData.poderRepresentante ? (
                          <span className="text-green-600">✓ Poder del Representante</span>
                        ) : (
                          <span className="text-gray-400">○ Poder del Representante (Opcional)</span>
                        )}
                      </div>
                    </>
                  )}
                  <div className="flex items-center gap-2">
                    {formData.comprobanteDomicilio ? (
                      <span className="text-green-600">✓ Comprobante de Domicilio</span>
                    ) : (
                      <span className="text-gray-400">○ Comprobante de Domicilio (Opcional)</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {formData.identificacionOficial ? (
                      <span className="text-green-600">✓ Identificación Oficial</span>
                    ) : (
                      <span className="text-gray-400">○ Identificación Oficial (Opcional)</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
              </AnimatedCard>

                {/* Botones */}
              <div className="flex justify-end gap-4 pt-6">
                <AnimatedButton
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/instituciones")}
                  disabled={loading}
                >
                  Cancelar
                </AnimatedButton>
                <AnimatedButton
                    type="submit"
                  className="bg-blue-700 text-white hover:bg-blue-800 animate-glow"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Registrando...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                  Registrar Institución
                </>
              )}
                </AnimatedButton>
                </div>
              </form>
          </div>
        </div>
      </div>
    </div>
  )
}
