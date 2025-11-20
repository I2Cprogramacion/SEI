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
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, Plus, X, FileText, Calendar, User, Building, Globe, BookOpen, Users, Link as LinkIcon, CheckCircle2, Check, Save, Loader2 } from "lucide-react"
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
  fechaPublicacion: string
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
  const [institucionesDisponibles, setInstitucionesDisponibles] = useState<string[]>([])
  const [camposFaltantes, setCamposFaltantes] = useState<string[]>([])
  const [mostrarErrores, setMostrarErrores] = useState(false)
  const [revistasDisponibles, setRevistasDisponibles] = useState<string[]>([])
  const [pdfPreview, setPdfPreview] = useState<string | null>(null)
  const [guardandoBorrador, setGuardandoBorrador] = useState(false)

  // Funciones de validación de identificadores
  const validarISSN = (issn: string): boolean => {
    // ISSN formato: ####-#### o ########
    const issnRegex = /^\d{4}-?\d{3}[\dxX]$/
    if (!issnRegex.test(issn.replace(/\s/g, ''))) return false
    
    // Validar dígito de control
    const digits = issn.replace(/[^\dxX]/g, '')
    if (digits.length !== 8) return false
    
    let sum = 0
    for (let i = 0; i < 7; i++) {
      sum += parseInt(digits[i]) * (8 - i)
    }
    const checkDigit = digits[7].toUpperCase()
    const calculatedCheck = (11 - (sum % 11)) % 11
    const expectedCheck = calculatedCheck === 10 ? 'X' : calculatedCheck.toString()
    
    return checkDigit === expectedCheck
  }

  const validarISBN = (isbn: string): boolean => {
    // ISBN-10 o ISBN-13
    const digits = isbn.replace(/[^\dxX]/g, '')
    
    if (digits.length === 10) {
      // ISBN-10
      let sum = 0
      for (let i = 0; i < 9; i++) {
        sum += parseInt(digits[i]) * (10 - i)
      }
      const checkDigit = digits[9].toUpperCase()
      const calculatedCheck = (11 - (sum % 11)) % 11
      const expectedCheck = calculatedCheck === 10 ? 'X' : calculatedCheck.toString()
      return checkDigit === expectedCheck
    } else if (digits.length === 13) {
      // ISBN-13
      let sum = 0
      for (let i = 0; i < 12; i++) {
        sum += parseInt(digits[i]) * (i % 2 === 0 ? 1 : 3)
      }
      const checkDigit = parseInt(digits[12])
      const calculatedCheck = (10 - (sum % 10)) % 10
      return checkDigit === calculatedCheck
    }
    
    return false
  }

  const validarDOI = (doi: string): boolean => {
    // DOI formato básico: 10.####/...
    const doiRegex = /^10\.\d{4,}(\.\d+)*\/[\S]+$/
    const cleanDOI = doi.replace(/^https?:\/\/(dx\.)?doi\.org\//, '')
    return doiRegex.test(cleanDOI)
  }

  const formatearIdentificador = (tipo: 'issn' | 'isbn', valor: string): string => {
    const digits = valor.replace(/[^\dxX]/g, '')
    if (tipo === 'issn' && digits.length === 8) {
      return `${digits.slice(0, 4)}-${digits.slice(4)}`
    } else if (tipo === 'isbn') {
      if (digits.length === 10) {
        return `${digits.slice(0, 1)}-${digits.slice(1, 4)}-${digits.slice(4, 9)}-${digits.slice(9)}`
      } else if (digits.length === 13) {
        return `${digits.slice(0, 3)}-${digits.slice(3, 4)}-${digits.slice(4, 7)}-${digits.slice(7, 12)}-${digits.slice(12)}`
      }
    }
    return valor
  }

  const [formData, setFormData] = useState<FormData>({
    titulo: "",
    autores: [],
    coautores: [],
    institucion: "",
    revista: "",
    fechaPublicacion: new Date().toISOString().split('T')[0],
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
  
  // Cargar instituciones disponibles
  useEffect(() => {
    const fetchInstituciones = async () => {
      try {
        const response = await fetch('/api/instituciones')
        if (response.ok) {
          const data = await response.json()
          const instituciones = data.institutions?.map((inst: any) => inst.nombre || inst.name) || []
          setInstitucionesDisponibles(instituciones)
        }
      } catch (error) {
        console.error('Error al cargar instituciones:', error)
      }
    }
    fetchInstituciones()
  }, [])
  
  // Cargar revistas disponibles para autocompletado
  useEffect(() => {
    const fetchRevistas = async () => {
      try {
        const response = await fetch('/api/publicaciones/revistas')
        if (response.ok) {
          const data = await response.json()
          setRevistasDisponibles(data.revistas || [])
        }
      } catch (error) {
        console.error('Error cargando revistas:', error)
      }
    }
    fetchRevistas()
  }, [])
  
  // Cargar borrador al iniciar
  useEffect(() => {
    const borradorGuardado = localStorage.getItem('borrador_publicacion')
    if (borradorGuardado) {
      try {
        const borrador = JSON.parse(borradorGuardado)
        const fechaGuardado = new Date(borrador.fecha_guardado)
        const diasDesdeGuardado = (Date.now() - fechaGuardado.getTime()) / (1000 * 60 * 60 * 24)
        
        // Solo cargar si tiene menos de 7 días
        if (diasDesdeGuardado < 7) {
          if (confirm('¿Deseas cargar el borrador guardado?')) {
            setFormData(prev => ({
              ...prev,
              ...borrador,
              archivo: undefined
            }))
            toast.success('Borrador cargado')
          }
        } else {
          // Eliminar borradores antiguos
          localStorage.removeItem('borrador_publicacion')
        }
      } catch (error) {
        console.error('Error cargando borrador:', error)
      }
    }
  }, [])
  
  // Limpiar campos de identificadores no relevantes al cambiar tipo
  useEffect(() => {
    if (!formData.tipo) return
    
    const relevantes = getIdentificadoresRelevantes(formData.tipo)
    
    setFormData(prev => ({
      ...prev,
      doi: relevantes.doi ? prev.doi : '',
      issn: relevantes.issn ? prev.issn : '',
      isbn: relevantes.isbn ? prev.isbn : '',
    }))
  }, [formData.tipo])
  
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
          fechaPublicacion: p.fecha_publicacion || p.año_creacion ? 
            (p.fecha_publicacion || `${p.año_creacion}-01-01`) : 
            prev.fechaPublicacion,
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
    "Chino",
    "Japonés",
    "Ruso",
    "Coreano",
    "Árabe",
    "Holandés",
    "Sueco",
    "Noruego",
    "Danés",
    "Polaco",
    "Turco",
    "Catalán",
    "Gallego",
    "Vasco",
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
      title: "Revista y Editorial",
      completed: calculateSectionProgress([
        { value: formData.revista, required: true },
        { value: formData.institucion, required: true }
      ]) === 100
    },
    {
      id: "detalles",
      title: "Detalles",
      completed: calculateSectionProgress([
        { value: formData.fechaPublicacion, required: true }
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

  // Manejar archivo PDF con preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar que sea PDF
      if (file.type !== 'application/pdf') {
        toast.error('Solo se permiten archivos PDF')
        return
      }
      
      // Validar tamaño (máximo 15MB)
      if (file.size > 15 * 1024 * 1024) {
        toast.error('El archivo es demasiado grande. Máximo 15MB')
        return
      }
      
      setFormData(prev => ({ ...prev, archivo: file }))
      
      // Generar preview
      const reader = new FileReader()
      reader.onload = () => {
        setPdfPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      
      toast.success('Archivo cargado correctamente')
    }
  }

  const eliminarPreview = () => {
    setPdfPreview(null)
    setFormData(prev => ({ ...prev, archivo: undefined }))
    // Limpiar input file
    const fileInput = document.getElementById('archivo') as HTMLInputElement
    if (fileInput) fileInput.value = ''
  }

  // Guardar borrador
  const guardarBorrador = async () => {
    try {
      setGuardandoBorrador(true)
      
      // Guardar en localStorage
      const borrador = {
        ...formData,
        fecha_guardado: new Date().toISOString(),
        archivo: undefined // No guardar el archivo en localStorage
      }
      
      localStorage.setItem('borrador_publicacion', JSON.stringify(borrador))
      
      toast.success('Borrador guardado correctamente')
    } catch (error) {
      toast.error('Error al guardar borrador')
      console.error('Error:', error)
    } finally {
      setGuardandoBorrador(false)
    }
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

  // Determinar qué identificadores son relevantes según el tipo de publicación
  const getIdentificadoresRelevantes = (tipo: string) => {
    switch (tipo) {
      case 'Artículo de investigación':
      case 'Artículo de revisión':
      case 'Artículo corto':
        return { doi: true, issn: true, isbn: false, url: true }
      
      case 'Libro':
        return { doi: false, issn: false, isbn: true, url: true }
      
      case 'Capítulo de libro':
        return { doi: false, issn: false, isbn: true, url: true }
      
      case 'Memoria de conferencia':
        return { doi: true, issn: false, isbn: false, url: true }
      
      case 'Tesis':
      case 'Reporte técnico':
        return { doi: false, issn: false, isbn: false, url: true }
      
      default:
        return { doi: true, issn: true, isbn: true, url: true }
    }
  }

  // Obtener campos requeridos según tipo de publicación
  const getCamposRequeridos = (tipo: string): string[] => {
    const camposBase = ['titulo', 'autores', 'categoria', 'tipo', 'resumen', 'palabrasClave', 'fechaPublicacion']
    
    switch (tipo) {
      case 'Artículo de investigación':
      case 'Artículo de revisión':
      case 'Artículo corto':
        return [...camposBase, 'revista', 'institucion', 'doi', 'volumen', 'numero']
      
      case 'Libro':
        return [...camposBase, 'institucion', 'isbn']
      
      case 'Capítulo de libro':
        return [...camposBase, 'revista', 'institucion', 'isbn', 'paginas']
      
      case 'Memoria de conferencia':
        return [...camposBase, 'revista', 'institucion']
      
      case 'Tesis':
        return [...camposBase, 'institucion']
      
      case 'Reporte técnico':
        return [...camposBase, 'institucion']
      
      default:
        return [...camposBase, 'revista', 'institucion']
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

  // Validar formulario con campos dinámicos
  const validateForm = (): boolean => {
    const newErrors: ErrorMessage[] = []
    const faltantes: string[] = []
    const camposRequeridos = getCamposRequeridos(formData.tipo)

    // Validar título
    if (camposRequeridos.includes('titulo') && !formData.titulo.trim()) {
      newErrors.push({ field: "titulo", message: "El título es obligatorio" })
      faltantes.push("Título")
    } else if (formData.titulo && formData.titulo.length < 10) {
      newErrors.push({ field: "titulo", message: "El título debe tener al menos 10 caracteres" })
      faltantes.push("Título (mínimo 10 caracteres)")
    }

    // Validar autores
    if (camposRequeridos.includes('autores') && formData.autores.length === 0) {
      newErrors.push({ field: "autores", message: "Debe agregar al menos un autor" })
      faltantes.push("Autores")
    }

    // Validar institución (editorial) - solo si es requerida
    if (camposRequeridos.includes('institucion') && !formData.institucion.trim()) {
      newErrors.push({ field: "institucion", message: "La editorial es obligatoria para este tipo de publicación" })
      faltantes.push("Editorial")
    }

    // Validar revista - solo si es requerida
    if (camposRequeridos.includes('revista') && !formData.revista.trim()) {
      newErrors.push({ field: "revista", message: "La revista es obligatoria para este tipo de publicación" })
      faltantes.push("Revista")
    }

    // Validar DOI - solo si es requerido
    if (camposRequeridos.includes('doi') && !formData.doi.trim()) {
      newErrors.push({ field: "doi", message: "El DOI es obligatorio para artículos de investigación" })
      faltantes.push("DOI")
    }

    // Validar ISBN - solo si es requerido
    if (camposRequeridos.includes('isbn') && !formData.isbn.trim()) {
      newErrors.push({ field: "isbn", message: "El ISBN es obligatorio para libros y capítulos" })
      faltantes.push("ISBN")
    }

    // Validar volumen - solo si es requerido
    if (camposRequeridos.includes('volumen') && !formData.volumen.trim()) {
      newErrors.push({ field: "volumen", message: "El volumen es obligatorio para este tipo de publicación" })
      faltantes.push("Volumen")
    }

    // Validar número - solo si es requerido
    if (camposRequeridos.includes('numero') && !formData.numero.trim()) {
      newErrors.push({ field: "numero", message: "El número es obligatorio para este tipo de publicación" })
      faltantes.push("Número")
    }

    // Validar páginas - solo si es requerido
    if (camposRequeridos.includes('paginas') && !formData.paginas.trim()) {
      newErrors.push({ field: "paginas", message: "Las páginas son obligatorias para este tipo de publicación" })
      faltantes.push("Páginas")
    }

    // Validar fecha de publicación
    if (!formData.fechaPublicacion) {
      newErrors.push({ field: "fechaPublicacion", message: "La fecha de publicación es obligatoria" })
      faltantes.push("Fecha de publicación")
    } else {
      const fecha = new Date(formData.fechaPublicacion)
      const año = fecha.getFullYear()
      const fechaMaxima = new Date()
      fechaMaxima.setFullYear(fechaMaxima.getFullYear() + 1)
      
      if (año < 1900 || fecha > fechaMaxima) {
        newErrors.push({ field: "fechaPublicacion", message: `La fecha debe ser entre 1900 y el próximo año` })
        faltantes.push("Fecha válida")
      }
    }

    // Validar categoría
    if (!formData.categoria) {
      newErrors.push({ field: "categoria", message: "La categoría es obligatoria" })
      faltantes.push("Categoría")
    }

    // Validar tipo
    if (!formData.tipo) {
      newErrors.push({ field: "tipo", message: "El tipo de publicación es obligatorio" })
      faltantes.push("Tipo de publicación")
    }

    // Validar resumen
    if (!formData.resumen.trim()) {
      newErrors.push({ field: "resumen", message: "El resumen es obligatorio" })
      faltantes.push("Resumen")
    } else if (formData.resumen.length < 50) {
      newErrors.push({ field: "resumen", message: "El resumen debe tener al menos 50 caracteres" })
      faltantes.push("Resumen (mínimo 50 caracteres)")
    }

    // Validar DOI si está presente
    if (formData.doi && !validarDOI(formData.doi)) {
      newErrors.push({ 
        field: "doi", 
        message: "Formato de DOI inválido. Debe ser: 10.####/xxxxx" 
      })
      faltantes.push("DOI válido")
    }

    // Validar ISSN si está presente
    if (formData.issn && formData.issn.trim() && !validarISSN(formData.issn)) {
      newErrors.push({ 
        field: "issn", 
        message: "Formato de ISSN inválido. Debe ser: ####-#### (con dígito de control válido)" 
      })
      faltantes.push("ISSN válido")
    }

    // Validar ISBN si está presente
    if (formData.isbn && formData.isbn.trim() && !validarISBN(formData.isbn)) {
      newErrors.push({ 
        field: "isbn", 
        message: "Formato de ISBN inválido. Debe ser ISBN-10 o ISBN-13 válido" 
      })
      faltantes.push("ISBN válido")
    }

    // Validar palabras clave
    if (formData.palabrasClave.length === 0) {
      newErrors.push({ field: "palabrasClave", message: "Debe agregar al menos una palabra clave" })
      faltantes.push("Palabras clave")
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
    setCamposFaltantes(faltantes)
    
    // Si hay errores, hacer scroll al primer campo con error
    if (newErrors.length > 0) {
      setMostrarErrores(true)
      setTimeout(() => {
        const primerError = document.getElementById(newErrors[0].field)
        if (primerError) {
          primerError.scrollIntoView({ behavior: 'smooth', block: 'center' })
          primerError.focus()
        }
      }, 100)
    }
    
    return newErrors.length === 0
  }

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      const mensajeFaltantes = camposFaltantes.length > 0 
        ? `Campos faltantes: ${camposFaltantes.join(', ')}`
        : 'Por favor corrige los errores antes de continuar'
      
      toast.error('Formulario incompleto', {
        description: mensajeFaltantes,
        duration: 5000
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
        // Enviar fecha completa
        fecha_publicacion: formData.fechaPublicacion || null,
        // También extraer el año por compatibilidad
        año_creacion: formData.fechaPublicacion ? new Date(formData.fechaPublicacion).getFullYear() : null,
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
                    <Select value={formData.tipo} onValueChange={(value) => {
                      handleInputChange("tipo", value)
                      // Limpiar errores al cambiar tipo
                      setMostrarErrores(false)
                      // Mostrar info de campos requeridos
                      if (value) {
                        const requeridos = getCamposRequeridos(value)
                        const nombresRequeridos = requeridos
                          .filter(r => !['titulo', 'autores', 'categoria', 'tipo', 'resumen', 'palabrasClave', 'fechaPublicacion'].includes(r))
                          .map(r => {
                            switch(r) {
                              case 'revista': return 'Revista'
                              case 'institucion': return 'Editorial'
                              case 'doi': return 'DOI'
                              case 'isbn': return 'ISBN'
                              case 'volumen': return 'Volumen'
                              case 'numero': return 'Número'
                              case 'paginas': return 'Páginas'
                              default: return r
                            }
                          })
                        
                        if (nombresRequeridos.length > 0) {
                          toast.info(`Campos requeridos para ${value}:`, {
                            description: nombresRequeridos.join(', '),
                            duration: 4000
                          })
                        }
                      }
                    }}>
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

              {/* Revista y Editorial */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-blue-900 flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Revista y Editorial
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="revista" className="text-blue-900">
                      Revista {getCamposRequeridos(formData.tipo).includes('revista') && <span className="text-red-500">*</span>}
                    </Label>
                    <div className="relative">
                      <Input
                        id="revista"
                        placeholder="Nombre de la revista..."
                        value={formData.revista}
                        onChange={(e) => handleInputChange("revista", e.target.value)}
                        className={errors.some(e => e.field === "revista") ? "border-red-300" : ""}
                        list="revistas-list"
                      />
                      <datalist id="revistas-list">
                        {revistasDisponibles.map((revista, index) => (
                          <option key={index} value={revista} />
                        ))}
                      </datalist>
                    </div>
                    {errors.some(e => e.field === "revista") && (
                      <p className="text-sm text-red-600">
                        {errors.find(e => e.field === "revista")?.message}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">Comienza a escribir para ver sugerencias</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="institucion" className="text-blue-900">
                      Editorial {getCamposRequeridos(formData.tipo).includes('institucion') && <span className="text-red-500">*</span>}
                    </Label>
                    <Input
                      id="institucion"
                      placeholder="Nombre de la editorial..."
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
                    <Label htmlFor="fechaPublicacion" className="text-blue-900">
                      Fecha de Publicación *
                    </Label>
                    <Input
                      id="fechaPublicacion"
                      type="date"
                      min="1900-01-01"
                      max={new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]}
                      value={formData.fechaPublicacion}
                      onChange={(e) => {
                        handleInputChange("fechaPublicacion", e.target.value)
                      }}
                      className={errors.some(e => e.field === "fechaPublicacion") ? "border-red-300" : ""}
                    />
                    {errors.some(e => e.field === "fechaPublicacion") && (
                      <p className="text-sm text-red-600">
                        {errors.find(e => e.field === "fechaPublicacion")?.message}
                      </p>
                    )}
                    <p className="text-xs text-slate-500">Fecha exacta de publicación (día/mes/año)</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="volumen" className="text-blue-900">
                      Volumen {getCamposRequeridos(formData.tipo).includes('volumen') && <span className="text-red-500">*</span>}
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
                      Número {getCamposRequeridos(formData.tipo).includes('numero') && <span className="text-red-500">*</span>}
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
                      Páginas {getCamposRequeridos(formData.tipo).includes('paginas') && <span className="text-red-500">*</span>}
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

                {formData.tipo && (
                  <Alert className="bg-blue-50 border-blue-200">
                    <AlertDescription className="text-sm text-blue-700">
                      Los campos mostrados son relevantes para: <strong>{formData.tipo}</strong>
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* DOI - visible solo para artículos y conferencias */}
                  {getIdentificadoresRelevantes(formData.tipo).doi && (
                    <div className="space-y-2">
                      <Label htmlFor="doi" className="text-blue-900 flex items-center gap-2">
                        DOI {getCamposRequeridos(formData.tipo).includes('doi') ? 
                          <span className="text-red-500">*</span> : 
                          <span className="text-gray-500 text-xs font-normal">(Opcional)</span>
                        }
                      </Label>
                      <Input
                        id="doi"
                        placeholder="10.1234/example"
                        value={formData.doi}
                        onChange={(e) => handleInputChange("doi", e.target.value)}
                        onBlur={(e) => {
                          const valor = e.target.value.trim()
                          if (valor && !validarDOI(valor)) {
                            setErrors(prev => [...prev.filter(e => e.field !== "doi"), {
                              field: "doi",
                              message: "DOI inválido. Debe comenzar con '10.' seguido del prefijo y sufijo"
                            }])
                          } else if (valor) {
                            setErrors(prev => prev.filter(e => e.field !== "doi"))
                          }
                        }}
                        className={errors.some(e => e.field === "doi") ? "border-red-300" : ""}
                      />
                      <p className="text-xs text-gray-500">Digital Object Identifier (formato: 10.XXXX/YYYY)</p>
                      {errors.some(e => e.field === "doi") && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <X className="h-3 w-3" />
                          {errors.find(e => e.field === "doi")?.message}
                        </p>
                      )}
                      {formData.doi && validarDOI(formData.doi) && (
                        <p className="text-sm text-green-600 flex items-center gap-1">
                          <Check className="h-3 w-3" />
                          DOI válido
                        </p>
                      )}
                    </div>
                  )}

                  {/* ISSN - solo para artículos de revista */}
                  {getIdentificadoresRelevantes(formData.tipo).issn && (
                    <div className="space-y-2">
                      <Label htmlFor="issn" className="text-blue-900 flex items-center gap-2">
                        ISSN <span className="text-gray-500 text-xs font-normal">(Opcional)</span>
                      </Label>
                      <Input
                        id="issn"
                        placeholder="####-####"
                        value={formData.issn}
                        onChange={(e) => handleInputChange("issn", e.target.value)}
                        onBlur={(e) => {
                          const valor = e.target.value.trim()
                          if (valor && !validarISSN(valor)) {
                            setErrors(prev => [...prev.filter(e => e.field !== "issn"), {
                              field: "issn",
                              message: "ISSN inválido. Verifica el formato y dígito de control"
                            }])
                          } else if (valor) {
                            // Auto-formatear
                            const formateado = formatearIdentificador('issn', valor)
                            handleInputChange("issn", formateado)
                            setErrors(prev => prev.filter(e => e.field !== "issn"))
                          }
                        }}
                        className={errors.some(e => e.field === "issn") ? "border-red-300" : ""}
                      />
                      <p className="text-xs text-gray-500">International Standard Serial Number (formato: ####-####)</p>
                      {errors.some(e => e.field === "issn") && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <X className="h-3 w-3" />
                          {errors.find(e => e.field === "issn")?.message}
                        </p>
                      )}
                      {formData.issn && validarISSN(formData.issn) && (
                        <p className="text-sm text-green-600 flex items-center gap-1">
                          <Check className="h-3 w-3" />
                          ISSN válido
                        </p>
                      )}
                    </div>
                  )}

                  {/* ISBN - solo para libros y capítulos */}
                  {getIdentificadoresRelevantes(formData.tipo).isbn && (
                    <div className="space-y-2">
                      <Label htmlFor="isbn" className="text-blue-900 flex items-center gap-2">
                        ISBN {getCamposRequeridos(formData.tipo).includes('isbn') ? 
                          <span className="text-red-500">*</span> : 
                          <span className="text-gray-500 text-xs font-normal">(Opcional)</span>
                        }
                      </Label>
                      <Input
                        id="isbn"
                        placeholder="###-#-###-#####-# (ISBN-10/13)"
                        value={formData.isbn}
                        onChange={(e) => handleInputChange("isbn", e.target.value)}
                        onBlur={(e) => {
                          const valor = e.target.value.trim()
                          if (valor && !validarISBN(valor)) {
                            setErrors(prev => [...prev.filter(e => e.field !== "isbn"), {
                              field: "isbn",
                              message: "ISBN inválido. Debe ser ISBN-10 o ISBN-13 válido"
                            }])
                          } else if (valor) {
                            // Auto-formatear
                            const formateado = formatearIdentificador('isbn', valor)
                            handleInputChange("isbn", formateado)
                            setErrors(prev => prev.filter(e => e.field !== "isbn"))
                          }
                        }}
                        className={errors.some(e => e.field === "isbn") ? "border-red-300" : ""}
                      />
                      <p className="text-xs text-gray-500">International Standard Book Number (10 o 13 dígitos)</p>
                      {errors.some(e => e.field === "isbn") && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <X className="h-3 w-3" />
                          {errors.find(e => e.field === "isbn")?.message}
                        </p>
                      )}
                      {formData.isbn && validarISBN(formData.isbn) && (
                        <p className="text-sm text-green-600 flex items-center gap-1">
                          <Check className="h-3 w-3" />
                          ISBN válido
                        </p>
                      )}
                    </div>
                  )}

                  {/* URL - siempre visible */}
                  {getIdentificadoresRelevantes(formData.tipo).url && (
                    <div className="space-y-2">
                      <Label htmlFor="url" className="text-blue-900 flex items-center gap-2">
                        URL <span className="text-gray-500 text-xs font-normal">(Opcional)</span>
                      </Label>
                      <Input
                        id="url"
                        type="url"
                        placeholder="https://..."
                        value={formData.url}
                        onChange={(e) => handleInputChange("url", e.target.value)}
                        className={errors.some(e => e.field === "url") ? "border-red-300" : ""}
                      />
                      <p className="text-xs text-gray-500">Enlace a la publicación en línea</p>
                      {errors.some(e => e.field === "url") && (
                        <p className="text-sm text-red-600">
                          {errors.find(e => e.field === "url")?.message}
                        </p>
                      )}
                    </div>
                  )}
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

              {/* Banner de campos faltantes - Antes de documento */}
              {mostrarErrores && errors.length > 0 && (
                <Alert className="border-red-300 bg-red-50 shadow-lg">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <X className="h-5 w-5 text-red-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-red-900 mb-1">
                        Formulario incompleto ({errors.length} {errors.length === 1 ? 'error' : 'errores'})
                      </h3>
                      <p className="text-sm text-red-700 mb-2">
                        Por favor completa los siguientes campos:
                      </p>
                      <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
                        {camposFaltantes.map((campo, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                            {campo}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <button
                      onClick={() => setMostrarErrores(false)}
                      className="flex-shrink-0 text-red-400 hover:text-red-600 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </Alert>
              )}

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
                        <div className="space-y-3">
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
                                onClick={eliminarPreview}
                                className="flex-shrink-0 text-red-600 hover:text-red-700 transition-colors"
                                title="Eliminar archivo"
                              >
                                <X className="h-5 w-5" />
                              </button>
                            </div>
                          </div>

                          {/* Preview del PDF */}
                          {pdfPreview && formData.archivo.type === 'application/pdf' && (
                            <div className="border border-blue-200 rounded-lg overflow-hidden">
                              <div className="bg-blue-50 px-3 py-2 flex items-center justify-between">
                                <span className="text-sm font-medium text-blue-900">Vista previa del PDF</span>
                                <button
                                  type="button"
                                  onClick={eliminarPreview}
                                  className="text-blue-600 hover:text-blue-700 text-xs"
                                >
                                  Cerrar preview
                                </button>
                              </div>
                              <iframe
                                src={pdfPreview}
                                className="w-full h-96"
                                title="Vista previa del PDF"
                              />
                            </div>
                          )}
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
              <div className="flex justify-between gap-4 pt-6 border-t border-blue-100">
                <AnimatedButton
                  type="button"
                  variant="outline"
                  onClick={guardarBorrador}
                  disabled={loading || guardandoBorrador}
                  className="border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  {guardandoBorrador ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Guardar Borrador
                    </>
                  )}
                </AnimatedButton>

                <div className="flex gap-4">
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
