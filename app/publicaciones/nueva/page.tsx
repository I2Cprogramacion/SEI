"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { AnimatedButton } from "@/components/ui/animated-button"
import { AnimatedCard } from "@/components/ui/animated-card"
import { AnimatedBadge } from "@/components/ui/animated-badge"
import { AnimatedHeader } from "@/components/ui/animated-header"
import { FormProgress } from "@/components/ui/form-progress"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, Plus, X, FileText, Calendar, User, Building, Globe, BookOpen, Users, Link as LinkIcon, CheckCircle2 } from "lucide-react"
import { calculateSectionProgress } from "@/lib/form-utils"
import { InvestigadorSearch } from "@/components/investigador-search"

// Interfaces
interface Coautor {
  nombre: string
  institucion: string
  email?: string
}

interface Investigador {
  id: number
  nombre: string
  email: string
  institucion: string
  area: string
  slug: string
}

interface FormData {
  titulo: string
  autores: string[]
  coautores: Coautor[]
  institucion: string
  revista: string
  añoPublicacion: string
  volumen: string
  numero: string
  paginas: string
  doi: string
  issn: string
  isbn: string
  url: string
  resumen: string
  abstract: string
  palabrasClave: string[]
  categoria: string
  tipo: string
  acceso: string
  idioma: string
  revista_indexada: string
  archivo?: File
  enlaceExterno?: string
  tipoDocumento: 'archivo' | 'enlace' | 'ninguno'
}

interface ErrorMessage {
  field: string
  message: string
}

export default function NuevaPublicacionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<ErrorMessage[]>([])
  const [palabraClave, setPalabraClave] = useState("")
  const [autor, setAutor] = useState("")
  const [coautorNombre, setCoautorNombre] = useState("")
  const [coautorInstitucion, setCoautorInstitucion] = useState("")
  const [coautorEmail, setCoautorEmail] = useState("")
  const [currentSection, setCurrentSection] = useState("basica")
  const [autoresSeleccionados, setAutoresSeleccionados] = useState<Investigador[]>([])
  const [coautoresSeleccionados, setCoautoresSeleccionados] = useState<Investigador[]>([])
  const [emailCoautor, setEmailCoautor] = useState<Record<number, string>>({})

  const [formData, setFormData] = useState<FormData>({
    titulo: "",
    autores: [],
    coautores: [],
    institucion: "",
    revista: "",
    añoPublicacion: new Date().getFullYear().toString(),
    volumen: "",
    numero: "",
    paginas: "",
    doi: "",
    issn: "",
    isbn: "",
    url: "",
    resumen: "",
    abstract: "",
    palabrasClave: [],
    categoria: "",
    tipo: "",
    acceso: "Abierto",
    idioma: "Español",
    revista_indexada: "",
    archivo: undefined,
    enlaceExterno: "",
    tipoDocumento: 'ninguno'
  })
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const searchParams = useSearchParams()
  // Si hay query param `id`, cargamos la publicación existente para editar
  useEffect(() => {
    const id = searchParams?.get('id')
    if (!id) return
    setIsEditing(true)
    setEditingId(id)

    ;(async () => {
      try {
        const resp = await fetch(`/api/publicaciones/${id}`)
        if (!resp.ok) return
        const data = await resp.json()
        const p = data.publicacion
        if (!p) return

        // Mapear los campos del servidor al formData
        setFormData(prev => ({
          ...prev,
          titulo: p.titulo || '',
          autores: p.autor ? String(p.autor).split(/,\s*/).filter(Boolean) : [],
          institucion: p.institucion || '',
          revista: p.revista || p.editorial || '',
          añoPublicacion: p.año_creacion ? String(p.año_creacion) : prev.añoPublicacion,
          volumen: p.volumen || '',
          numero: p.numero || '',
          paginas: p.paginas || '',
          doi: p.doi || '',
          issn: p.issn || '',
          isbn: p.isbn || '',
          url: p.url || '',
          resumen: p.resumen || '',
          abstract: p.abstract || '',
          palabrasClave: p.palabras_clave ? (Array.isArray(p.palabras_clave) ? p.palabras_clave : String(p.palabras_clave).split(/,\s*/).filter(Boolean)) : [],
          categoria: p.categoria || '',
          tipo: p.tipo || '',
          acceso: p.acceso || 'Abierto',
          idioma: p.idioma || 'Español',
          revista_indexada: p.revista_indexada || '',
          archivo: undefined,
          enlaceExterno: p.enlace_externo || '',
          tipoDocumento: p.archivo_url || p.enlace_externo ? (p.archivo_url ? 'archivo' : 'enlace') : 'ninguno'
        }))
        toast.success('Cargando publicación para editar')
      } catch (err) {
        console.error('Error cargando publicación:', err)
      }
    })()
  }, [searchParams])


  // Categorías
  const categorias = [
    "Ciencias Naturales",
    "Ingeniería y Tecnología",
    "Ciencias Médicas y de la Salud",
    "Ciencias Sociales",
    "Humanidades y Artes",
    "Ciencias Agrícolas",
    "Ciencias Exactas",
    "Multidisciplinario",
    "Otro"
  ]

  // Tipos de publicación
  const tipos = [
    "Artículo de investigación",
    "Artículo de revisión",
    "Artículo corto",
    "Nota técnica",
    "Carta al editor",
    "Editorial",
    "Libro",
    "Capítulo de libro",
    "Memoria de conferencia",
    "Tesis",
    "Reporte técnico",
    "Otro"
  ]

  // Tipos de acceso
  const accesos = [
    "Abierto",
    "Restringido",
    "Híbrido"
  ]

  // Idiomas
  const idiomas = [
    "Español",
    "Inglés",
    "Francés",
    "Alemán",
    "Portugués",
    "Italiano",
    "Otro"
  ]

  // Índices
  const indices = [
    "Scopus",
    "Web of Science",
    "SciELO",
    "DOAJ",
    "PubMed",
    "IEEE Xplore",
    "Google Scholar",
    "Latindex",
    "Redalyc",
    "No indexada",
    "Otro"
  ]

  // Secciones de progreso
  const sections = [
    {
      id: "basica",
      title: "Información Básica",
      completed: calculateSectionProgress([
        { value: formData.titulo, required: true },
        { value: formData.categoria, required: true },
        { value: formData.tipo, required: true }
      ]) === 100
    },
    {
      id: "autores",
      title: "Autores",
      completed: formData.autores.length > 0
    },
    {
      id: "revista",
      title: "Revista e Institución",
      completed: calculateSectionProgress([
        { value: formData.revista, required: true },
        { value: formData.institucion, required: true }
      ]) === 100
    },
    {
      id: "detalles",
      title: "Detalles",
      completed: calculateSectionProgress([
        { value: formData.añoPublicacion, required: true }
      ]) === 100
    },
    {
      id: "resumen",
      title: "Resumen",
      completed: calculateSectionProgress([
        { value: formData.resumen, required: true }
      ]) === 100
    },
    {
      id: "palabras",
      title: "Palabras Clave",
      completed: formData.palabrasClave.length > 0
    }
  ]

  // Manejar cambios en el formulario
  const handleInputChange = (field: keyof FormData, value: string | File) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Limpiar errores del campo modificado
    setErrors(prev => prev.filter(error => error.field !== field))
  }

  // Agregar palabra clave
  const handleAddPalabraClave = () => {
    if (palabraClave.trim() && !formData.palabrasClave.includes(palabraClave.trim())) {
      setFormData(prev => ({
        ...prev,
        palabrasClave: [...prev.palabrasClave, palabraClave.trim()]
      }))
      setPalabraClave("")
    }
  }

  // Remover palabra clave
  const handleRemovePalabraClave = (palabra: string) => {
    setFormData(prev => ({
      ...prev,
      palabrasClave: prev.palabrasClave.filter(p => p !== palabra)
    }))
  }

  // Agregar autor (método antiguo para compatibilidad)
  const handleAddAutor = () => {
    if (autor.trim() && !formData.autores.includes(autor.trim())) {
      setFormData(prev => ({
        ...prev,
        autores: [...prev.autores, autor.trim()]
      }))
      setAutor("")
    }
  }

  // Remover autor
  const handleRemoveAutor = (nombreAutor: string) => {
    setFormData(prev => ({
      ...prev,
      autores: prev.autores.filter(a => a !== nombreAutor)
    }))
  }

  // Agregar coautor (método antiguo para compatibilidad)
  const handleAddCoautor = () => {
    if (coautorNombre.trim() && coautorInstitucion.trim()) {
      setFormData(prev => ({
        ...prev,
        coautores: [...prev.coautores, {
          nombre: coautorNombre.trim(),
          institucion: coautorInstitucion.trim(),
          email: coautorEmail.trim() || undefined
        }]
      }))
      setCoautorNombre("")
      setCoautorInstitucion("")
      setCoautorEmail("")
    }
  }

  // Remover coautor
  const handleRemoveCoautor = (index: number) => {
    setFormData(prev => ({
      ...prev,
      coautores: prev.coautores.filter((_, i) => i !== index)
    }))
  }

  // Manejar selección de autores
  useEffect(() => {
    const nombresAutores = autoresSeleccionados.map(inv => inv.nombre)
    // Combinar con autores manuales existentes (evitar duplicados)
    setFormData(prev => ({
      ...prev,
      autores: [...new Set([...nombresAutores, ...prev.autores.filter(a => !nombresAutores.includes(a))])]
    }))
  }, [autoresSeleccionados])

  // Manejar selección de coautores
  useEffect(() => {
    const coautoresFormateados: Coautor[] = coautoresSeleccionados.map(inv => ({
      nombre: inv.nombre,
      institucion: inv.institucion,
      email: emailCoautor[inv.id] || inv.email || undefined
    }))
    setFormData(prev => ({
      ...prev,
      coautores: coautoresFormateados
    }))
  }, [coautoresSeleccionados, emailCoautor])

  // Manejar archivo
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validar tamaño (máximo 15MB para publicaciones académicas)
      const maxSize = 15 * 1024 * 1024 // 15MB en bytes
      if (file.size > maxSize) {
        setErrors(prev => [...prev, {
          field: "archivo",
          message: "El archivo es demasiado grande. El tamaño máximo es 15MB"
        }])
        event.target.value = "" // Limpiar input
        return
      }

      // Validar tipo de archivo
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!validTypes.includes(file.type)) {
        setErrors(prev => [...prev, {
          field: "archivo",
          message: "Formato de archivo no válido. Solo se permiten PDF, DOC y DOCX"
        }])
        event.target.value = "" // Limpiar input
        return
      }

      setFormData(prev => ({
        ...prev,
        archivo: file
      }))
      // Limpiar errores de archivo
      setErrors(prev => prev.filter(e => e.field !== "archivo"))
    }
  }

  // Validar DOI
  const validateDOI = (doi: string): boolean => {
    if (!doi) return true // DOI es opcional
    const doiRegex = /^10\.\d{4,}(.\d+)*\/[-._;()/:A-Za-z0-9]+$/
    return doiRegex.test(doi)
  }

  // Validar ISSN
  const validateISSN = (issn: string): boolean => {
    if (!issn) return true // ISSN es opcional
    const issnRegex = /^\d{4}-\d{3}[0-9X]$/
    return issnRegex.test(issn)
  }

  // Validar ISBN
  const validateISBN = (isbn: string): boolean => {
    if (!isbn) return true // ISBN es opcional
    const isbnRegex = /^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/
    return isbnRegex.test(isbn.replace(/[- ]/g, ''))
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

    // Validar título
    if (!formData.titulo.trim()) {
      newErrors.push({ field: "titulo", message: "El título es obligatorio" })
    } else if (formData.titulo.length < 10) {
      newErrors.push({ field: "titulo", message: "El título debe tener al menos 10 caracteres" })
    }

    // Validar autores
    if (formData.autores.length === 0) {
      newErrors.push({ field: "autores", message: "Debe agregar al menos un autor" })
    }

    // Validar institución
    if (!formData.institucion.trim()) {
      newErrors.push({ field: "institucion", message: "La institución es obligatoria" })
    }

    // Validar revista
    if (!formData.revista.trim()) {
      newErrors.push({ field: "revista", message: "La revista o editorial es obligatoria" })
    }

    // Validar año
    if (!formData.añoPublicacion) {
      newErrors.push({ field: "añoPublicacion", message: "El año de publicación es obligatorio" })
    } else {
      const año = parseInt(formData.añoPublicacion)
      if (año < 1900 || año > new Date().getFullYear() + 1) {
        newErrors.push({ field: "añoPublicacion", message: `El año debe estar entre 1900 y ${new Date().getFullYear() + 1}` })
      }
    }

    // Validar categoría
    if (!formData.categoria) {
      newErrors.push({ field: "categoria", message: "La categoría es obligatoria" })
    }

    // Validar tipo
    if (!formData.tipo) {
      newErrors.push({ field: "tipo", message: "El tipo de publicación es obligatorio" })
    }

    // Validar resumen
    if (!formData.resumen.trim()) {
      newErrors.push({ field: "resumen", message: "El resumen es obligatorio" })
    } else if (formData.resumen.length < 50) {
      newErrors.push({ field: "resumen", message: "El resumen debe tener al menos 50 caracteres" })
    }

    // Validar palabras clave
    if (formData.palabrasClave.length === 0) {
      newErrors.push({ field: "palabrasClave", message: "Debe agregar al menos una palabra clave" })
    }

    // Validar DOI
    if (formData.doi && !validateDOI(formData.doi)) {
      newErrors.push({ field: "doi", message: "Formato de DOI inválido (ejemplo: 10.1234/example)" })
    }

    // Validar ISSN
    if (formData.issn && !validateISSN(formData.issn)) {
      newErrors.push({ field: "issn", message: "Formato de ISSN inválido (ejemplo: 1234-5678)" })
    }

    // Validar ISBN
    if (formData.isbn && !validateISBN(formData.isbn)) {
      newErrors.push({ field: "isbn", message: "Formato de ISBN inválido" })
    }

    // Validar URL
    if (formData.url && !validateURL(formData.url)) {
      newErrors.push({ field: "url", message: "URL inválida (debe empezar con http:// o https://)" })
    }

    // Validar enlace externo si se seleccionó
    if (formData.tipoDocumento === 'enlace' && formData.enlaceExterno && !validateURL(formData.enlaceExterno)) {
      newErrors.push({ field: "enlaceExterno", message: "Enlace externo inválido (debe empezar con http:// o https://)" })
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
      let archivoUrl = null
      let archivoNombre = null

      // Si hay archivo, subirlo primero usando Vercel Blob presign (PUT directo)
      if (formData.archivo) {
        toast.loading('Subiendo archivo...', { id: 'upload' })

        // Solicitar presign al servidor
        const presignResp = await fetch('/api/upload/presign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: formData.archivo.name,
            contentType: formData.archivo.type,
            size: formData.archivo.size
          })
        })

        if (!presignResp.ok) {
          const err = await presignResp.json().catch(() => ({ error: 'Error al solicitar presign' }))
          toast.error('Error al preparar la subida', { id: 'upload', description: err.error || 'No se pudo obtener URL de subida' })
          throw new Error(err.error || 'Error al solicitar presign')
        }

        const presignData = await presignResp.json()
        const uploadUrl: string | undefined = presignData.uploadUrl || presignData.uploadURL
        const publicUrl: string | undefined = presignData.url || presignData.publicUrl

        if (!uploadUrl) {
          toast.error('Presign inválido: no se recibió uploadUrl', { id: 'upload' })
          throw new Error('Respuesta inválida de presign')
        }

        // Hacer PUT directo a la URL de Vercel Blob
        const putResp = await fetch(uploadUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': formData.archivo.type
          },
          body: formData.archivo
        })

        if (!putResp.ok) {
          const text = await putResp.text().catch(() => '')
          toast.error('Error al subir el archivo', { id: 'upload', description: text || 'Fallo en la transferencia' })
          throw new Error('Error al subir archivo a Vercel Blob')
        }

        // Determinar URL pública final (presign puede devolverla; si no, derivar de uploadUrl)
        archivoUrl = publicUrl || (uploadUrl.split('?')[0])
        archivoNombre = formData.archivo.name
        toast.success('Archivo subido correctamente', { id: 'upload' })
      }

      // Preparar datos para enviar a la API
      toast.loading('Guardando publicación...', { id: 'save' })
      
      // Normalizar payload para que el servidor reciba los campos que espera
      const publicacionData = {
        titulo: formData.titulo,
        // El servidor espera 'autor' (string o array). Convertimos a string si es array.
        autor: Array.isArray(formData.autores) ? formData.autores.join(', ') : (formData.autores as unknown as string) || null,
        // Coautores los enviamos como JSON si existen
        coautores: formData.coautores && formData.coautores.length > 0 ? JSON.stringify(formData.coautores) : null,
        institucion: formData.institucion || null,
        revista: formData.revista || null,
        // El servidor busca 'año_creacion' o 'año'
        año_creacion: formData.añoPublicacion ? parseInt(formData.añoPublicacion) : null,
        volumen: formData.volumen || null,
        numero: formData.numero || null,
        paginas: formData.paginas || null,
        doi: formData.doi || null,
        issn: formData.issn || null,
        isbn: formData.isbn || null,
        url: formData.url || null,
        resumen: formData.resumen,
        abstract: formData.abstract || null,
        // Server expects 'palabras_clave' as CSV or array; send as array
        palabras_clave: formData.palabrasClave && formData.palabrasClave.length > 0 ? formData.palabrasClave : null,
        categoria: formData.categoria,
        tipo: formData.tipo,
        acceso: formData.acceso,
        idioma: formData.idioma,
        revista_indexada: formData.revista_indexada || null,
        archivo: archivoNombre || null,
        // The API supports archivo_url or archivoUrl; use archivo_url (snake_case)
        archivo_url: archivoUrl || null,
        enlace_externo: formData.enlaceExterno || null,
        tipoDocumento: formData.tipoDocumento
      }

      // Enviar a la API
      // Enviar a la API (POST para crear, PUT para actualizar)
      let response: Response
      if (isEditing && editingId) {
        response = await fetch(`/api/publicaciones/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(publicacionData)
        })
      } else {
        response = await fetch('/api/publicaciones', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(publicacionData),
        })
      }

      if (!response.ok) {
        let errorData
        try {
          errorData = await response.json()
        } catch {
          errorData = { error: `Error ${response.status}: ${response.statusText}` }
        }
        toast.error('Error al guardar la publicación', { 
          id: 'save',
          description: errorData.error || 'Inténtalo de nuevo más tarde' 
        })
        throw new Error(errorData.error || 'Error al guardar la publicación')
      }

      let result
      try {
        result = await response.json()
      } catch {
        result = { success: true }
      }
      console.log("Publicación creada:", result.publicacion)
      console.log("Publicación guardada:", result.publicacion)

      // Mostrar éxito y redirigir
      if (isEditing) {
        toast.success('Cambios guardados en la publicación', { id: 'save' })
      } else {
        toast.success('¡Publicación creada exitosamente!', { id: 'save', description: 'Tu publicación ha sido registrada y estará visible para la comunidad' })
      }

      setTimeout(() => router.push('/publicaciones'), 1200)

    } catch (error) {
      console.error("Error al crear publicación:", error)
      setErrors([{ 
        field: "general", 
        message: error instanceof Error ? error.message : "Error al crear la publicación. Inténtalo de nuevo." 
      }])
      
      // También mostrar toast de error si no se mostró antes
      if (!formData.archivo) {
        toast.error('Error al crear la publicación', {
          description: error instanceof Error ? error.message : 'Inténtalo de nuevo'
        })
      }
    } finally {
      setLoading(false)
    }
  }

    return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="space-y-6">
        {/* Header */}
        <AnimatedHeader 
          title="Subir Nueva Publicación"
          subtitle="Comparte tu publicación científica con la comunidad académica de Chihuahua"
        />

        {/* Errores generales */}
        {errors.some(error => error.field === "general") && (
          <Alert className="border-red-200 bg-red-50 animate-bounce-in">
            <AlertDescription className="text-red-700">
              {errors.find(error => error.field === "general")?.message}
            </AlertDescription>
          </Alert>
        )}

        {/* Layout con progreso lateral */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Indicador de progreso */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <FormProgress sections={sections} currentSection={currentSection} />
        </div>

        {/* Formulario */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <AnimatedCard className="bg-white border-blue-100" delay={100}>
            <CardHeader>
            <CardTitle className="text-blue-900 flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Información de la Publicación
            </CardTitle>
            <CardDescription>
              Completa todos los campos obligatorios para registrar tu publicación
            </CardDescription>
            </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Información básica */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-blue-900 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Información Básica
                </h3>
                
                <div className="space-y-2">
                  <Label htmlFor="titulo" className="text-blue-900">
                    Título de la Publicación *
                  </Label>
                  <Input
                    id="titulo"
                    placeholder="Título completo de la publicación..."
                    value={formData.titulo}
                    onChange={(e) => handleInputChange("titulo", e.target.value)}
                    className={errors.some(e => e.field === "titulo") ? "border-red-300" : ""}
                  />
                  {errors.some(e => e.field === "titulo") && (
                    <p className="text-sm text-red-600">
                      {errors.find(e => e.field === "titulo")?.message}
                    </p>
                  )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="categoria" className="text-blue-900">
                      Categoría *
                    </Label>
                    <Select value={formData.categoria} onValueChange={(value) => handleInputChange("categoria", value)}>
                      <SelectTrigger className={errors.some(e => e.field === "categoria") ? "border-red-300" : ""}>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map((categoria) => (
                        <SelectItem key={categoria} value={categoria}>
                          {categoria}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                    {errors.some(e => e.field === "categoria") && (
                      <p className="text-sm text-red-600">
                        {errors.find(e => e.field === "categoria")?.message}
                      </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="tipo" className="text-blue-900">
                      Tipo de Publicación *
                    </Label>
                    <Select value={formData.tipo} onValueChange={(value) => handleInputChange("tipo", value)}>
                      <SelectTrigger className={errors.some(e => e.field === "tipo") ? "border-red-300" : ""}>
                      <SelectValue placeholder="Selecciona el tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {tipos.map((tipo) => (
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
              </div>
              </div>

              {/* Autores y coautores */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-blue-900 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Autores
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <Label className="text-blue-900">
                      Buscar y Agregar Autores *
                    </Label>
                    <p className="text-sm text-blue-600 mb-2">
                      Busca investigadores registrados o agrega manualmente
                    </p>
                    <InvestigadorSearch
                      selectedInvestigadores={autoresSeleccionados}
                      onSelectionChange={setAutoresSeleccionados}
                      placeholder="Buscar autores registrados..."
                    />
                  </div>

                  {/* Método alternativo manual */}
                  <div className="pt-2 border-t border-blue-100">
                    <Label htmlFor="autor" className="text-xs text-blue-600 mb-1 block">
                      O escribe el nombre manualmente:
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="autor"
                        placeholder="Nombre completo del autor..."
                        value={autor}
                        onChange={(e) => setAutor(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            handleAddAutor()
                          }
                        }}
                        className="flex-1 text-sm"
                      />
                      <Button 
                        type="button" 
                        onClick={handleAddAutor} 
                        variant="outline"
                        size="sm"
                        className="px-3"
                        disabled={!autor.trim()}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {errors.some(e => e.field === "autores") && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertDescription className="text-red-700 text-sm">
                        {errors.find(e => e.field === "autores")?.message}
                      </AlertDescription>
                    </Alert>
                  )}

                  {formData.autores.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-blue-900">
                        Autores ({formData.autores.length})
                      </span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.autores.map((nombreAutor, index) => (
                          <Badge 
                            key={index} 
                            variant="secondary" 
                            className="bg-blue-100 text-blue-800 border-blue-300 flex items-center gap-1 px-2 py-1"
                          >
                            {nombreAutor}
                            <button
                              type="button"
                              onClick={() => handleRemoveAutor(nombreAutor)}
                              className="ml-1 hover:text-red-600 transition-colors"
                              title={`Eliminar "${nombreAutor}"`}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Coautores */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-blue-900 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Coautores (Opcional)
                </h3>
                
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-blue-900">
                      Buscar y Agregar Coautores
                    </Label>
                    <InvestigadorSearch
                      selectedInvestigadores={coautoresSeleccionados}
                      onSelectionChange={setCoautoresSeleccionados}
                      placeholder="Buscar coautores registrados..."
                    />
                  </div>

                  {/* Emails para coautores seleccionados */}
                  {coautoresSeleccionados.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm text-blue-700">Asignar Emails (Opcional)</Label>
                      <div className="space-y-2">
                        {coautoresSeleccionados.map((inv) => (
                          <div key={inv.id} className="flex items-center gap-2 p-2 bg-blue-50 rounded-md">
                            <span className="text-sm text-blue-900 flex-1 min-w-0 truncate">{inv.nombre}</span>
                            <Input
                              type="email"
                              placeholder="email@ejemplo.com"
                              value={emailCoautor[inv.id] || inv.email || ""}
                              onChange={(e) => setEmailCoautor(prev => ({ ...prev, [inv.id]: e.target.value }))}
                              className="max-w-xs text-sm"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Método alternativo manual */}
                  <div className="pt-2 border-t border-blue-100">
                    <Label className="text-sm text-blue-700 mb-2 block">O agregar manualmente (si no está registrado)</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="coautorNombre" className="text-xs text-blue-600">
                          Nombre del Coautor
                        </Label>
                        <Input
                          id="coautorNombre"
                          placeholder="Nombre completo"
                          value={coautorNombre}
                          onChange={(e) => setCoautorNombre(e.target.value)}
                          className="text-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="coautorInstitucion" className="text-xs text-blue-600">
                          Institución
                        </Label>
                        <Input
                          id="coautorInstitucion"
                          placeholder="Institución"
                          value={coautorInstitucion}
                          onChange={(e) => setCoautorInstitucion(e.target.value)}
                          className="text-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="coautorEmail" className="text-xs text-blue-600">
                          Email (Opcional)
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            id="coautorEmail"
                            type="email"
                            placeholder="email@ejemplo.com"
                            value={coautorEmail}
                            onChange={(e) => setCoautorEmail(e.target.value)}
                            className="flex-1 text-sm"
                          />
                          <Button 
                            type="button" 
                            onClick={handleAddCoautor} 
                            variant="outline"
                            size="sm"
                            className="px-3"
                            disabled={!coautorNombre.trim() || !coautorInstitucion.trim()}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {formData.coautores.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-blue-900">
                        Coautores Agregados ({formData.coautores.length})
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                        {formData.coautores.map((coautor, index) => (
                          <div 
                            key={index} 
                            className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md"
                          >
                            <div className="flex-1">
                              <p className="text-sm font-medium text-blue-900">{coautor.nombre}</p>
                              <p className="text-xs text-blue-600">{coautor.institucion}</p>
                              {coautor.email && (
                                <p className="text-xs text-blue-500">{coautor.email}</p>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveCoautor(index)}
                              className="text-red-600 hover:text-red-700 transition-colors"
                              title="Eliminar coautor"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Publicación e institución */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-blue-900 flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Revista e Institución
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="revista" className="text-blue-900">
                      Revista o Editorial *
                    </Label>
                    <Input
                      id="revista"
                      placeholder="Nombre de la revista o editorial..."
                      value={formData.revista}
                      onChange={(e) => handleInputChange("revista", e.target.value)}
                      className={errors.some(e => e.field === "revista") ? "border-red-300" : ""}
                    />
                    {errors.some(e => e.field === "revista") && (
                      <p className="text-sm text-red-600">
                        {errors.find(e => e.field === "revista")?.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="institucion" className="text-blue-900">
                      Institución *
                    </Label>
                    <Input
                      id="institucion"
                      placeholder="Institución de afiliación..."
                      value={formData.institucion}
                      onChange={(e) => handleInputChange("institucion", e.target.value)}
                      className={errors.some(e => e.field === "institucion") ? "border-red-300" : ""}
                    />
                    {errors.some(e => e.field === "institucion") && (
                      <p className="text-sm text-red-600">
                        {errors.find(e => e.field === "institucion")?.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Detalles de publicación */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-blue-900 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Detalles de Publicación
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="añoPublicacion" className="text-blue-900">
                      Año *
                    </Label>
                    <Input
                      id="añoPublicacion"
                      type="number"
                      min="1900"
                      max={new Date().getFullYear() + 1}
                      value={formData.añoPublicacion}
                      onChange={(e) => {
                        const value = e.target.value
                        // Permitir valores vacíos o números válidos
                        if (value === '' || (!isNaN(Number(value)) && Number(value) >= 1900 && Number(value) <= new Date().getFullYear() + 1)) {
                          handleInputChange("añoPublicacion", value)
                        }
                      }}
                      onBlur={(e) => {
                        // Validar al salir del campo
                        const value = e.target.value
                        if (value && (isNaN(Number(value)) || Number(value) < 1900 || Number(value) > new Date().getFullYear() + 1)) {
                          setErrors(prev => [...prev.filter(e => e.field !== "añoPublicacion"), {
                            field: "añoPublicacion",
                            message: `El año debe estar entre 1900 y ${new Date().getFullYear() + 1}`
                          }])
                        }
                      }}
                      className={errors.some(e => e.field === "añoPublicacion") ? "border-red-300" : ""}
                    />
                    {errors.some(e => e.field === "añoPublicacion") && (
                      <p className="text-sm text-red-600">
                        {errors.find(e => e.field === "añoPublicacion")?.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="volumen" className="text-blue-900">
                      Volumen
                    </Label>
                  <Input
                    id="volumen"
                    placeholder="Vol."
                      value={formData.volumen}
                      onChange={(e) => handleInputChange("volumen", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="numero" className="text-blue-900">
                      Número
                    </Label>
                  <Input
                    id="numero"
                    placeholder="No."
                      value={formData.numero}
                      onChange={(e) => handleInputChange("numero", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="paginas" className="text-blue-900">
                      Páginas
                    </Label>
                  <Input
                    id="paginas"
                      placeholder="1-10"
                    value={formData.paginas}
                      onChange={(e) => handleInputChange("paginas", e.target.value)}
                  />
                  </div>
                </div>
              </div>

              {/* Identificadores */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-blue-900 flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Identificadores y Enlaces
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                    <Label htmlFor="doi" className="text-blue-900">
                      DOI (Digital Object Identifier)
                    </Label>
                    <Input
                      id="doi"
                      placeholder="10.1234/example"
                      value={formData.doi}
                      onChange={(e) => handleInputChange("doi", e.target.value)}
                      className={errors.some(e => e.field === "doi") ? "border-red-300" : ""}
                    />
                    {errors.some(e => e.field === "doi") && (
                      <p className="text-sm text-red-600">
                        {errors.find(e => e.field === "doi")?.message}
                      </p>
                    )}
              </div>

                  <div className="space-y-2">
                    <Label htmlFor="issn" className="text-blue-900">
                      ISSN (para revistas)
                    </Label>
                    <Input
                      id="issn"
                      placeholder="1234-5678"
                      value={formData.issn}
                      onChange={(e) => handleInputChange("issn", e.target.value)}
                      className={errors.some(e => e.field === "issn") ? "border-red-300" : ""}
                    />
                    {errors.some(e => e.field === "issn") && (
                      <p className="text-sm text-red-600">
                        {errors.find(e => e.field === "issn")?.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="isbn" className="text-blue-900">
                      ISBN (para libros)
                    </Label>
                    <Input
                      id="isbn"
                      placeholder="978-3-16-148410-0"
                      value={formData.isbn}
                      onChange={(e) => handleInputChange("isbn", e.target.value)}
                      className={errors.some(e => e.field === "isbn") ? "border-red-300" : ""}
                    />
                    {errors.some(e => e.field === "isbn") && (
                      <p className="text-sm text-red-600">
                        {errors.find(e => e.field === "isbn")?.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="url" className="text-blue-900">
                      URL de la Publicación
                    </Label>
                    <Input
                      id="url"
                      type="url"
                      placeholder="https://..."
                      value={formData.url}
                      onChange={(e) => handleInputChange("url", e.target.value)}
                      className={errors.some(e => e.field === "url") ? "border-red-300" : ""}
                    />
                    {errors.some(e => e.field === "url") && (
                      <p className="text-sm text-red-600">
                        {errors.find(e => e.field === "url")?.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Resumen y Abstract */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-blue-900 flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Resumen
                </h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="resumen" className="text-blue-900">
                      Resumen *
                    </Label>
                    <Textarea
                      id="resumen"
                      placeholder="Resumen de la publicación en español..."
                      value={formData.resumen}
                      onChange={(e) => handleInputChange("resumen", e.target.value)}
                      className={`min-h-[120px] ${errors.some(e => e.field === "resumen") ? "border-red-300" : ""}`}
                    />
                    <div className="flex justify-between text-sm text-blue-600">
                      <span>Mínimo 50 caracteres</span>
                      <span>{formData.resumen.length} caracteres</span>
                    </div>
                    {errors.some(e => e.field === "resumen") && (
                      <p className="text-sm text-red-600">
                        {errors.find(e => e.field === "resumen")?.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="abstract" className="text-blue-900">
                      Abstract (Opcional)
                    </Label>
                    <Textarea
                      id="abstract"
                      placeholder="Abstract in English (optional)..."
                      value={formData.abstract}
                      onChange={(e) => handleInputChange("abstract", e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>
                </div>
              </div>

          {/* Palabras clave */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-blue-900">Palabras Clave</h3>
                
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="palabrasClave" className="text-blue-900">
                      Agregar Palabras Clave *
                    </Label>
                    <p className="text-sm text-blue-600 mb-2">
                      Escribe una palabra clave y presiona Enter o haz clic en el botón +
                    </p>
              <div className="flex gap-2">
                <Input
                        id="palabrasClave"
                        placeholder="Ej: Investigación, Ciencia, Tecnología..."
                        value={palabraClave}
                        onChange={(e) => setPalabraClave(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            handleAddPalabraClave()
                          }
                        }}
                        className="flex-1"
                />
                <Button
                  type="button"
                        onClick={handleAddPalabraClave} 
                  variant="outline"
                        className="px-3"
                        disabled={!palabraClave.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
                  </div>

                  {errors.some(e => e.field === "palabrasClave") && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertDescription className="text-red-700 text-sm">
                        {errors.find(e => e.field === "palabrasClave")?.message}
                      </AlertDescription>
                    </Alert>
                  )}

              {formData.palabrasClave.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-blue-900">
                          Palabras Clave ({formData.palabrasClave.length})
                        </span>
                        {formData.palabrasClave.length > 0 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setFormData(prev => ({ ...prev, palabrasClave: [] }))}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            Limpiar todas
                          </Button>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md min-h-[50px]">
                  {formData.palabrasClave.map((palabra, index) => (
                          <Badge 
                            key={index} 
                            variant="secondary" 
                            className="bg-blue-100 text-blue-800 border-blue-300 flex items-center gap-1 px-2 py-1"
                          >
                      {palabra}
                      <button
                        type="button"
                              onClick={() => handleRemovePalabraClave(palabra)}
                              className="ml-1 hover:text-red-600 transition-colors"
                              title={`Eliminar "${palabra}"`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                      </div>
                </div>
              )}
                </div>
              </div>

              {/* Configuración adicional */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-blue-900 flex items-center gap-2">
                  <LinkIcon className="h-4 w-4" />
                  Configuración Adicional
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                    <Label htmlFor="acceso" className="text-blue-900">
                      Tipo de Acceso
                    </Label>
                    <Select value={formData.acceso} onValueChange={(value) => handleInputChange("acceso", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {accesos.map((acceso) => (
                          <SelectItem key={acceso} value={acceso}>
                            {acceso}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="idioma" className="text-blue-900">
                      Idioma
                    </Label>
                    <Select value={formData.idioma} onValueChange={(value) => handleInputChange("idioma", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {idiomas.map((idioma) => (
                          <SelectItem key={idioma} value={idioma}>
                            {idioma}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="revista_indexada" className="text-blue-900">
                      Indexación
                    </Label>
                    <Select value={formData.revista_indexada} onValueChange={(value) => handleInputChange("revista_indexada", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona" />
                      </SelectTrigger>
                      <SelectContent>
                        {indices.map((indice) => (
                          <SelectItem key={indice} value={indice}>
                            {indice}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Documento - Archivo o Enlace */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-blue-900 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Documento de la Publicación (Opcional)
                </h3>
                
                <div className="space-y-4">
                  {/* Selector de tipo de documento */}
                  <div className="space-y-3">
                    <Label className="text-blue-900">
                      ¿Cómo quieres compartir el documento?
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, tipoDocumento: 'ninguno', archivo: undefined, enlaceExterno: '' }))}
                        className={`p-4 border-2 rounded-lg text-center transition-all ${
                          formData.tipoDocumento === 'ninguno' 
                            ? 'border-blue-500 bg-blue-50 text-blue-700' 
                            : 'border-gray-200 hover:border-blue-300 text-gray-600'
                        }`}
                      >
                        <div className="text-2xl mb-2">📄</div>
                        <div className="font-medium">Solo información</div>
                        <div className="text-xs mt-1">Sin documento</div>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, tipoDocumento: 'archivo', enlaceExterno: '' }))}
                        className={`p-4 border-2 rounded-lg text-center transition-all ${
                          formData.tipoDocumento === 'archivo' 
                            ? 'border-blue-500 bg-blue-50 text-blue-700' 
                            : 'border-gray-200 hover:border-blue-300 text-gray-600'
                        }`}
                      >
                        <div className="text-2xl mb-2">📎</div>
                        <div className="font-medium">Subir archivo</div>
                        <div className="text-xs mt-1">PDF, DOC, DOCX</div>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, tipoDocumento: 'enlace', archivo: undefined }))}
                        className={`p-4 border-2 rounded-lg text-center transition-all ${
                          formData.tipoDocumento === 'enlace' 
                            ? 'border-blue-500 bg-blue-50 text-blue-700' 
                            : 'border-gray-200 hover:border-blue-300 text-gray-600'
                        }`}
                      >
                        <div className="text-2xl mb-2">🔗</div>
                        <div className="font-medium">Enlace externo</div>
                        <div className="text-xs mt-1">URL del documento</div>
                      </button>
                    </div>
                  </div>

                  {/* Subir archivo */}
                  {formData.tipoDocumento === 'archivo' && (
                    <div className="space-y-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="space-y-2">
                        <Label htmlFor="archivo" className="text-blue-900">
                          Subir Documento
                        </Label>
                        <Input
                          id="archivo"
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileChange}
                          className={`file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 ${
                            errors.some(e => e.field === "archivo") ? "border-red-300" : ""
                          }`}
                        />
                        <p className="text-sm text-blue-600">
                          Formatos permitidos: PDF, DOC, DOCX (máximo 15MB)
                        </p>
                        {errors.some(e => e.field === "archivo") && (
                          <Alert className="border-red-200 bg-red-50">
                            <AlertDescription className="text-red-700 text-sm">
                              {errors.find(e => e.field === "archivo")?.message}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>

                      {/* Vista previa del archivo */}
                      {formData.archivo && !errors.some(e => e.field === "archivo") && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <FileText className="h-6 w-6 text-green-700" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-green-900 truncate">
                                {formData.archivo.name}
                              </p>
                              <p className="text-xs text-green-700 mt-1">
                                Tamaño: {(formData.archivo.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                              <p className="text-xs text-green-600 mt-1">
                                Tipo: {formData.archivo.type || 'Desconocido'}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({ ...prev, archivo: undefined }))
                                const fileInput = document.getElementById('archivo') as HTMLInputElement
                                if (fileInput) fileInput.value = ''
                              }}
                              className="flex-shrink-0 text-red-600 hover:text-red-700 transition-colors"
                              title="Eliminar archivo"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </div>
                          <div className="mt-3 pt-3 border-t border-green-200">
                            <p className="text-xs text-green-700 flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Archivo listo para ser subido
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Enlace externo */}
                  {formData.tipoDocumento === 'enlace' && (
                    <div className="space-y-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="space-y-2">
                        <Label htmlFor="enlaceExterno" className="text-blue-900">
                          Enlace al Documento
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            id="enlaceExterno"
                            type="url"
                            placeholder="https://ejemplo.com/documento.pdf"
                            value={formData.enlaceExterno || ''}
                            onChange={(e) => handleInputChange("enlaceExterno", e.target.value)}
                            className={`flex-1 ${errors.some(e => e.field === "enlaceExterno") ? "border-red-300" : ""}`}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              if (formData.enlaceExterno) {
                                window.open(formData.enlaceExterno, '_blank')
                              }
                            }}
                            disabled={!formData.enlaceExterno}
                            className="px-3"
                          >
                            <LinkIcon className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-blue-600">
                          Ingresa la URL donde se encuentra el documento (PDF, página web, etc.)
                        </p>
                        {errors.some(e => e.field === "enlaceExterno") && (
                          <Alert className="border-red-200 bg-red-50">
                            <AlertDescription className="text-red-700 text-sm">
                              {errors.find(e => e.field === "enlaceExterno")?.message}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>

                      {/* Vista previa del enlace */}
                      {formData.enlaceExterno && !errors.some(e => e.field === "enlaceExterno") && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <LinkIcon className="h-6 w-6 text-green-700" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-green-900 truncate">
                                {formData.enlaceExterno}
                              </p>
                              <p className="text-xs text-green-600 mt-1">
                                Enlace externo configurado
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleInputChange("enlaceExterno", "")}
                              className="flex-shrink-0 text-red-600 hover:text-red-700 transition-colors"
                              title="Eliminar enlace"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </div>
                          <div className="mt-3 pt-3 border-t border-green-200">
                            <p className="text-xs text-green-700 flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Enlace listo para ser guardado
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Mensaje informativo */}
                  {formData.tipoDocumento === 'ninguno' && (
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <FileText className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            Solo información de la publicación
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            Se guardará únicamente la información de la publicación sin documento adjunto.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Botones */}
              <div className="flex justify-end gap-4 pt-6 border-t border-blue-100">
                <AnimatedButton
              type="button"
              variant="outline"
                  onClick={() => router.push("/publicaciones")}
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
                      {isEditing ? 'Guardando...' : 'Creando...'}
                </>
              ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      {isEditing ? 'Guardar cambios' : 'Crear Publicación'}
                    </>
              )}
                </AnimatedButton>
          </div>
        </form>
          </CardContent>
            </AnimatedCard>
          </div>
        </div>
      </div>
    </div>
  )
}
