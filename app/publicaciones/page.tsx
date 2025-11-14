"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AnimatedCard } from "@/components/ui/animated-card"
import { AnimatedButton } from "@/components/ui/animated-button"
import { AnimatedBadge } from "@/components/ui/animated-badge"
import { AnimatedHeader } from "@/components/ui/animated-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { InvestigadorSearch } from "@/components/investigador-search"
import { Search, Filter, ExternalLink, FileText, Calendar, User, Building, Plus, Edit, Trash2, Upload, Settings } from "lucide-react"
import Link from "next/link"

// Interfaces para tipos de datos
interface AutorInfo {
  nombre: string
  slug?: string
  fotografia_url?: string
  correo?: string
}

interface Publicacion {
  id: number
  titulo: string
  autores: string[]
  autoresInfo?: AutorInfo[] // Información detallada de autores si están registrados
  revista: string
  año: number
  volumen?: string
  numero?: string
  paginas?: string
  doi: string
  resumen: string
  palabrasClave: string[]
  categoria: string
  institucion: string
  tipo: string
  acceso: string
  archivoUrl?: string
  clerkUserId?: string | null
  uploaderNombre?: string | null
}

// Interfaces para gestión de publicaciones
interface Investigador {
  id: number
  nombre: string
  email: string
  institucion: string
  area: string
  slug: string
}

interface NuevaPublicacion {
  id: number
  titulo: string
  autores: Investigador[]
  descripcion: string
  archivo: File | null
  doi: string
  solicitarDoi: boolean
  fechaCreacion: Date
}

interface FormData {
  titulo: string
  autores: Investigador[]
  descripcion: string
  archivo: File | null
  doi: string
  solicitarDoi: boolean
}

interface FormErrors {
  titulo?: string
  autores?: string
  descripcion?: string
  archivo?: string
  doi?: string
  solicitarDoi?: string
}

// Validación de DOI
const validateDOI = (doi: string): boolean => {
  if (!doi) return true // DOI es opcional
  const doiRegex = /^10\.\d{4,}\/[^\s]+$/
  return doiRegex.test(doi)
}

// Generar DOI temporal (solo para desarrollo)
const generateTemporaryDOI = (id: number): string => {
  return `10.temp/publication-${id}`
}

export default function PublicacionesPage() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedYear, setSelectedYear] = useState("all")
  const [selectedAccess, setSelectedAccess] = useState("all")
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([])
  const [loading, setLoading] = useState(true)
  
  // Estados para gestión de publicaciones
  const [nuevasPublicaciones, setNuevasPublicaciones] = useState<NuevaPublicacion[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isManagementOpen, setIsManagementOpen] = useState(false)
  const [editingPublication, setEditingPublication] = useState<NuevaPublicacion | null>(null)
  const [formData, setFormData] = useState<FormData>({
    titulo: "",
    autores: [],
    descripcion: "",
    archivo: null,
    doi: "",
    solicitarDoi: false
  })
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  
  // Estados para autenticación
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [citationOpen, setCitationOpen] = useState(false)
  const [citationText, setCitationText] = useState("")

  // Verificar autenticación del usuario
  useEffect(() => {
    const checkAuth = () => {
      try {
        const userData = localStorage.getItem("user")
        if (userData) {
          const userObj = JSON.parse(userData)
          setUser(userObj)
          // Verificar si es admin autorizado
          setIsAdmin(userObj.isAdmin && userObj.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL)
        } else {
          setUser(null)
          setIsAdmin(false)
        }
      } catch (error) {
        console.error("Error checking auth:", error)
        setUser(null)
        setIsAdmin(false)
      }
    }

    checkAuth()

    // Listener para cambios en localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "user") {
        checkAuth()
      }
    }

    // Listener para cambios en la misma pestaña
    const handleCustomStorageChange = () => {
      checkAuth()
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange)
      window.addEventListener('userUpdated', handleCustomStorageChange)
      
      return () => {
        window.removeEventListener('storage', handleStorageChange)
        window.removeEventListener('userUpdated', handleCustomStorageChange)
      }
    }
  }, [])

  const formatCitation = (pub: Publicacion) => {
    const authors = pub.autores && pub.autores.length ? pub.autores.join(', ') : 'Autor'
    const year = pub.año || 's.f.'
    const title = pub.titulo || ''
    const journal = pub.revista || ''
    const doi = pub.doi ? `https://doi.org/${pub.doi}` : (pub.archivoUrl || '')
    return `${authors} (${year}). ${title}. ${journal}. ${doi}`.trim()
  }

  const handleCopyCitation = async () => {
    try {
      await navigator.clipboard.writeText(citationText)
      toast({ title: 'Cita copiada', description: 'La referencia se copió al portapapeles.' })
      setCitationOpen(false)
    } catch (err) {
      toast({ title: 'Error', description: 'No se pudo copiar la cita.' , variant: 'destructive' })
    }
  }

  // Conectar con API real
  useEffect(() => {
    const fetchPublicaciones = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/publicaciones')
        const data = await response.json()
        
        if (response.ok) {
          setPublicaciones(data.publicaciones || [])
        } else {
          // Manejo silencioso de errores - tabla podría no existir aún
          console.warn("⚠️ No se pudieron cargar publicaciones:", data.error)
          setPublicaciones([])
        }
      } catch (error) {
        // Error de red o parsing - manejar gracefully
        console.warn("⚠️ Error al conectar con API de publicaciones:", error)
        setPublicaciones([])
      } finally {
        setLoading(false)
      }
    }

    fetchPublicaciones()
  }, [])

  // Filtrar publicaciones
  const filteredPublicaciones = publicaciones.filter((pub) => {
    const matchesSearch =
      pub.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pub.autores.some((autor) => autor.toLowerCase().includes(searchTerm.toLowerCase())) ||
      pub.revista.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pub.palabrasClave.some((palabra) => palabra.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory = selectedCategory === "all" || pub.categoria === selectedCategory
    const matchesYear = selectedYear === "all" || pub.año.toString() === selectedYear
    const matchesAccess = selectedAccess === "all" || pub.acceso === selectedAccess

    return matchesSearch && matchesCategory && matchesYear && matchesAccess
  })

  // Estados para filtros
  const [categorias, setCategorias] = useState<string[]>([])
  const [años, setAños] = useState<number[]>([])

  // Cargar opciones de filtros
  useEffect(() => {
    const fetchFiltros = async () => {
      try {
        const response = await fetch('/api/publicaciones')
        const data = await response.json()
        
        if (response.ok && data.filtros) {
          setCategorias(data.filtros.categorias || [])
          setAños(data.filtros.años || [])
        }
      } catch (error) {
        console.error("Error fetching filtros:", error)
      }
    }

    fetchFiltros()
  }, [])

  // Funciones para gestión de publicaciones
  const resetForm = () => {
    setFormData({
      titulo: "",
      autores: [],
      descripcion: "",
      archivo: null,
      doi: "",
      solicitarDoi: false
    })
    setErrors({})
    setEditingPublication(null)
  }

  const openNewModal = () => {
    resetForm()
    setIsModalOpen(true)
  }

  const openEditModal = (publication: NuevaPublicacion) => {
    setFormData({
      titulo: publication.titulo,
      autores: publication.autores,
      descripcion: publication.descripcion,
      archivo: publication.archivo,
      doi: publication.doi,
      solicitarDoi: publication.solicitarDoi
    })
    setEditingPublication(publication)
    setIsModalOpen(true)
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.titulo.trim()) {
      newErrors.titulo = "El título es obligatorio"
    }

    if (formData.autores.length === 0) {
      newErrors.autores = "Debe seleccionar al menos un autor"
    }

    if (formData.archivo) {
      const allowedTypes = ['application/pdf', 'application/zip']
      if (!allowedTypes.includes(formData.archivo.type)) {
        newErrors.archivo = "Solo se permiten archivos PDF o ZIP"
      }
    }

    if (formData.doi && !validateDOI(formData.doi)) {
      newErrors.doi = "Formato de DOI inválido. Debe ser: 10.####/xxxxx"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const simulateUpload = async (): Promise<void> => {
    setIsUploading(true)
    setUploadProgress(0)

    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 100))
      setUploadProgress(i)
    }

    setIsUploading(false)
  }

  const handleSave = async () => {
    if (!validateForm()) {
      toast({
        title: "Error de validación",
        description: "Por favor corrige los errores en el formulario",
        variant: "destructive"
      })
      return
    }

    try {
      if (formData.archivo) {
        await simulateUpload()
      }

      const newPublication: NuevaPublicacion = {
        id: editingPublication ? editingPublication.id : Date.now(),
        titulo: formData.titulo,
        autores: formData.autores,
        descripcion: formData.descripcion,
        archivo: formData.archivo,
        doi: formData.solicitarDoi && !formData.doi 
          ? generateTemporaryDOI(editingPublication ? editingPublication.id : Date.now())
          : formData.doi,
        solicitarDoi: formData.solicitarDoi,
        fechaCreacion: editingPublication ? editingPublication.fechaCreacion : new Date()
      }

      if (editingPublication) {
        setNuevasPublicaciones(prev => 
          prev.map(pub => pub.id === editingPublication.id ? newPublication : pub)
        )
        toast({
          title: "Publicación actualizada",
          description: "La publicación se ha actualizado correctamente",
        })
      } else {
        setNuevasPublicaciones(prev => [newPublication, ...prev])
        toast({
          title: "Publicación creada",
          description: "La publicación se ha creado correctamente",
        })
      }

      setIsModalOpen(false)
      resetForm()
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un problema al guardar la publicación",
        variant: "destructive"
      })
    }
  }

  const handleDelete = (id: number) => {
    setNuevasPublicaciones(prev => prev.filter(pub => pub.id !== id))
    toast({
      title: "Publicación eliminada",
      description: "La publicación se ha eliminado correctamente",
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setFormData(prev => ({ ...prev, archivo: file }))
    if (errors.archivo) {
      setErrors(prev => ({ ...prev, archivo: undefined }))
    }
  }

  return (
    <div className="container mx-auto py-6 sm:py-8 px-3 sm:px-4 lg:px-6">
      <div className="space-y-4 sm:space-y-6">
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <AnimatedHeader 
              title="Publicaciones Científicas"
              subtitle="Explora las publicaciones científicas de investigadores de Chihuahua en revistas nacionales e internacionales"
            />
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <AnimatedButton 
                asChild
                className="bg-blue-700 hover:bg-blue-800 text-white animate-glow"
              >
                <Link href="/publicaciones/nueva">
                  <Upload className="mr-2 h-4 w-4" />
                  Subir Publicación
                </Link>
              </AnimatedButton>
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
                  <DialogHeader>
                    <DialogTitle>
                      {editingPublication ? "Editar Publicación" : "Nueva Publicación"}
                    </DialogTitle>
                    <DialogDescription>
                      {editingPublication 
                        ? "Modifica los datos de la publicación" 
                        : "Completa la información de la nueva publicación"
                      }
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    {/* Título */}
                    <div className="space-y-2">
                      <Label htmlFor="titulo">Título *</Label>
                      <Input
                        id="titulo"
                        value={formData.titulo}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, titulo: e.target.value }))
                          if (errors.titulo) {
                            setErrors(prev => ({ ...prev, titulo: undefined }))
                          }
                        }}
                        placeholder="Título de la publicación"
                        className={errors.titulo ? "border-red-500" : ""}
                      />
                      {errors.titulo && (
                        <p className="text-sm text-red-500">{errors.titulo}</p>
                      )}
                    </div>

                    {/* Autores */}
                    <div className="space-y-2">
                      <Label htmlFor="autores">Autor/es *</Label>
                      <InvestigadorSearch
                        selectedInvestigadores={formData.autores}
                        onSelectionChange={(autores) => {
                          setFormData(prev => ({ ...prev, autores }))
                          if (errors.autores) {
                            setErrors(prev => ({ ...prev, autores: undefined }))
                          }
                        }}
                        placeholder="Buscar investigadores registrados..."
                        className={errors.autores ? "border-red-500" : ""}
                      />
                      {errors.autores && (
                        <p className="text-sm text-red-500">{errors.autores}</p>
                      )}
                    </div>

                    {/* Descripción */}
                    <div className="space-y-2">
                      <Label htmlFor="descripcion">Descripción</Label>
                      <Textarea
                        id="descripcion"
                        value={formData.descripcion}
                        onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                        placeholder="Descripción de la publicación"
                        rows={4}
                      />
                    </div>

                    {/* Archivo */}
                    <div className="space-y-2">
                      <Label htmlFor="archivo">Archivo (PDF/ZIP)</Label>
                      <Input
                        id="archivo"
                        type="file"
                        accept=".pdf,.zip"
                        onChange={handleFileChange}
                        className={errors.archivo ? "border-red-500" : ""}
                      />
                      {errors.archivo && (
                        <p className="text-sm text-red-500">{errors.archivo}</p>
                      )}
                      {formData.archivo && (
                        <div className="flex items-center gap-2 text-sm text-green-600">
                          <FileText className="h-4 w-4" />
                          {formData.archivo.name}
                        </div>
                      )}
                    </div>

                    {/* DOI */}
                    <div className="space-y-2">
                      <Label htmlFor="doi">DOI (opcional)</Label>
                      <Input
                        id="doi"
                        value={formData.doi}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, doi: e.target.value }))
                          if (errors.doi) {
                            setErrors(prev => ({ ...prev, doi: undefined }))
                          }
                        }}
                        placeholder="10.xxxx/xxxxx"
                        className={errors.doi ? "border-red-500" : ""}
                        disabled={formData.solicitarDoi}
                      />
                      {errors.doi && (
                        <p className="text-sm text-red-500">{errors.doi}</p>
                      )}
                    </div>

                    {/* Solicitar DOI */}
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="solicitar-doi"
                        checked={formData.solicitarDoi}
                        onCheckedChange={(checked) => {
                          setFormData(prev => ({ 
                            ...prev, 
                            solicitarDoi: checked,
                            doi: checked ? "" : prev.doi
                          }))
                        }}
                      />
                      <Label htmlFor="solicitar-doi">Solicitar DOI automático</Label>
                    </div>

                    {/* Progress bar para subida */}
                    {isUploading && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Subiendo archivo...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <Progress value={uploadProgress} className="w-full" />
                      </div>
                    )}
                  </div>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsModalOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={isUploading}
                      className="bg-blue-600 text-white hover:bg-blue-700"
                    >
                      {editingPublication ? "Actualizar" : "Guardar"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Botón de gestión para admin */}
              {isAdmin && (
                <Button
                  variant="outline"
                  onClick={() => setIsManagementOpen(!isManagementOpen)}
                  className="border-blue-200 text-blue-700 hover:bg-blue-50 w-full sm:w-auto"
                  size="sm"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span className="text-sm sm:text-base">Gestión</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Citation dialog */}
        <Dialog open={citationOpen} onOpenChange={setCitationOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Referencia / Cita</DialogTitle>
            </DialogHeader>
            <div className="py-2">
              <Textarea value={citationText} readOnly rows={4} />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCitationOpen(false)}>Cerrar</Button>
              <Button onClick={handleCopyCitation} className="bg-blue-600 text-white hover:bg-blue-700">Copiar cita</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Filtros y búsqueda */}
        <Card className="bg-white border-blue-100">
          <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
              <div className="sm:col-span-2 lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Buscar por título, autor, revista o palabras clave..."
                    className="pl-10 bg-white border-blue-200 text-blue-900 placeholder:text-blue-400 h-10 sm:h-11"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="bg-white border-blue-200 text-blue-900 h-10 sm:h-11">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent className="bg-white border-blue-100">
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categorias.map((categoria) => (
                    <SelectItem key={categoria} value={categoria}>
                      {categoria}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="bg-white border-blue-200 text-blue-900 h-10 sm:h-11">
                  <SelectValue placeholder="Año" />
                </SelectTrigger>
                <SelectContent className="bg-white border-blue-100">
                  <SelectItem value="all">Todos los años</SelectItem>
                  {años.map((año) => (
                    <SelectItem key={año} value={año.toString()}>
                      {año}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedAccess} onValueChange={setSelectedAccess}>
                <SelectTrigger className="bg-white border-blue-200 text-blue-900 h-10 sm:h-11">
                  <SelectValue placeholder="Acceso" />
                </SelectTrigger>
                <SelectContent className="bg-white border-blue-100">
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Abierto">Acceso abierto</SelectItem>
                  <SelectItem value="Restringido">Acceso restringido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Sección de gestión para admin */}
        {isAdmin && isManagementOpen && (
          <Card className="bg-white border-blue-100">
            <CardHeader>
              <CardTitle>Gestión de Publicaciones</CardTitle>
              <CardDescription>
                Administra las publicaciones subidas por usuarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              {nuevasPublicaciones.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Autor/es</TableHead>
                      <TableHead>DOI</TableHead>
                      <TableHead>Archivo</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {nuevasPublicaciones.map((publication) => (
                      <TableRow key={publication.id}>
                        <TableCell className="font-medium">
                          {publication.titulo}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {publication.autores.map((autor, index) => (
                              <Badge key={autor.id} variant="secondary" className="text-xs">
                                {autor.nombre}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          {publication.doi ? (
                            <div className="flex items-center gap-2">
                              <a
                                href={`https://doi.org/${publication.doi}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline flex items-center gap-1"
                              >
                                {publication.doi}
                                <ExternalLink className="h-3 w-3" />
                              </a>
                              {publication.solicitarDoi && (
                                <Badge variant="secondary" className="text-xs">
                                  Auto
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">Sin DOI</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {publication.archivo ? (
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-green-600" />
                              <span className="text-sm">{publication.archivo.name}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400">Sin archivo</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {publication.fechaCreacion.toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditModal(publication)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>¿Eliminar publicación?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta acción no se puede deshacer. Se eliminará permanentemente
                                    la publicación "{publication.titulo}".
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(publication.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Eliminar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No hay publicaciones pendientes</h3>
                  <p className="text-gray-600">
                    Las publicaciones subidas por usuarios aparecerán aquí
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Resultados */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <p className="text-blue-600 text-sm sm:text-base break-words">
              {loading
                ? "Cargando..."
                : `${filteredPublicaciones.length} publicación${filteredPublicaciones.length !== 1 ? "es" : ""} encontrada${filteredPublicaciones.length !== 1 ? "s" : ""}`}
            </p>
            <AnimatedButton variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-transparent w-full sm:w-auto text-xs sm:text-sm">
              <Filter className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Filtros avanzados
            </AnimatedButton>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="bg-white border-blue-100">
                  <CardHeader>
                    <div className="animate-pulse">
                      <div className="h-4 bg-blue-100 rounded w-1/4 mb-2"></div>
                      <div className="h-6 bg-blue-100 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-blue-100 rounded w-1/2"></div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="animate-pulse">
                      <div className="h-4 bg-blue-100 rounded w-full mb-2"></div>
                      <div className="h-4 bg-blue-100 rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredPublicaciones.length > 0 ? (
            filteredPublicaciones.map((publicacion, index) => (
              <AnimatedCard key={publicacion.id} className="bg-white border-blue-100" delay={index * 100}>
                <CardHeader className="px-3 sm:px-6 pt-4 sm:pt-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Badge className="bg-blue-700 text-white text-xs break-words">{publicacion.categoria}</Badge>
                        <Badge variant="outline" className="border-blue-200 text-blue-700 text-xs break-words">
                          {publicacion.tipo}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-xs break-words ${
                            publicacion.acceso === "Abierto"
                              ? "border-green-200 text-green-700 bg-green-50"
                              : "border-amber-200 text-amber-700 bg-amber-50"
                          }`}
                        >
                          {publicacion.acceso === "Abierto" ? "Acceso abierto" : "Acceso restringido"}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg sm:text-xl text-blue-900 mb-2 break-words">{publicacion.titulo}</CardTitle>
                      <CardDescription className="text-blue-600 text-xs sm:text-sm">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 break-words">
                            <User className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span className="break-words">{publicacion.autores.join(", ")}</span>
                          </div>
                          <div className="flex items-center gap-2 break-words">
                            <FileText className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span className="break-words">{publicacion.revista}</span>
                          </div>
                          <div className="flex items-center gap-2 break-words">
                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span className="break-words">
                              {publicacion.año}
                              {publicacion.volumen && `, Vol. ${publicacion.volumen}`}
                              {publicacion.numero && `(${publicacion.numero})`}
                              {publicacion.paginas && `, pp. ${publicacion.paginas}`}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 break-words">
                            <Building className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span className="break-words">{publicacion.institucion}</span>
                          </div>
                        </div>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-3 sm:px-6">
                  <p className="text-blue-600 mb-4 text-sm sm:text-base break-words line-clamp-3">{publicacion.resumen}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {publicacion.palabrasClave.map((palabra, index) => (
                      <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700 text-xs break-words">
                        {palabra}
                      </Badge>
                    ))}
                  </div>
                  <div className="text-xs sm:text-sm text-blue-600 break-words">
                    <strong>DOI:</strong> {publicacion.doi}
                  </div>
                </CardContent>
                <CardFooter className="border-t border-blue-100 flex flex-col sm:flex-row justify-between gap-3 sm:gap-4 py-3 sm:py-4 px-3 sm:px-6">
                  <div className="flex flex-wrap gap-2">
                    {/* Mostrar autores con avatares si hay información disponible */}
                    {publicacion.autoresInfo && publicacion.autoresInfo.length > 0 ? (
                      <>
                        {publicacion.autoresInfo.slice(0, 3).map((autor, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Avatar className="h-8 w-8 flex-shrink-0 border-2 border-blue-100">
                              {autor.fotografia_url ? (
                                <AvatarImage src={autor.fotografia_url} alt={autor.nombre} />
                              ) : null}
                              <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-semibold">
                                {autor.nombre
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .substring(0, 2)
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            {autor.slug ? (
                              <Link
                                href={`/investigadores/${autor.slug}`}
                                className="text-xs sm:text-sm text-blue-700 hover:underline hover:text-blue-900 font-medium break-words transition-colors"
                              >
                                {autor.nombre}
                              </Link>
                            ) : (
                              <span className="text-xs sm:text-sm text-blue-700 font-medium break-words">
                                {autor.nombre}
                              </span>
                            )}
                          </div>
                        ))}
                        {publicacion.autoresInfo.length > 3 && (
                          <span className="text-xs sm:text-sm text-blue-600 self-center">
                            +{publicacion.autoresInfo.length - 3} más
                          </span>
                        )}
                      </>
                    ) : (
                      // Fallback si no hay información detallada
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs sm:text-sm text-blue-600 font-medium flex-shrink-0">Autores:</span>
                        {publicacion.autores.slice(0, 3).map((autor, index) => (
                          <span key={index} className="text-xs sm:text-sm text-blue-700 break-words">
                            {autor}{index < Math.min(publicacion.autores.length, 3) - 1 && ", "}
                          </span>
                        ))}
                        {publicacion.autores.length > 3 && (
                          <span className="text-xs sm:text-sm text-blue-600">
                            +{publicacion.autores.length - 3} más
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-blue-500 break-words mt-2">
                    {publicacion.uploaderNombre ? (
                      <>
                        Subido por: <span className="font-medium">{publicacion.uploaderNombre}</span>
                        {user && (user.id === publicacion.clerkUserId || user.clerkUserId === publicacion.clerkUserId) && (
                          <span className="ml-1 font-semibold text-blue-700">(Tú)</span>
                        )}
                      </>
                    ) : (
                      publicacion.autores.length > 0 && (
                        <>Publicación de: <span className="font-medium">{publicacion.autores[0]}</span></>
                      )
                    )}
                  </div>
                    <div className="flex gap-2">
                      <AnimatedButton
                        variant="outline"
                        size="sm"
                        className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-transparent"
                        onClick={() => {
                          if (publicacion.archivoUrl) {
                            window.open(publicacion.archivoUrl, "_blank")
                          } else if (publicacion.doi) {
                            window.open(`https://doi.org/${publicacion.doi}`, "_blank")
                          } else {
                            toast({ title: 'Sin recurso', description: 'No hay archivo ni DOI disponible para esta publicación.' })
                          }
                        }}
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Ver publicación
                      </AnimatedButton>

                      <AnimatedButton
                        variant="outline"
                        size="sm"
                        className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-transparent"
                        onClick={() => {
                          const citation = formatCitation(publicacion)
                          setCitationText(citation)
                          setCitationOpen(true)
                        }}
                      >
                        Citar
                      </AnimatedButton>

                      {/* If the current user is the uploader, show a small Edit link */}
                      {user && (user.id === publicacion.clerkUserId || user.clerkUserId === publicacion.clerkUserId) && (
                        <Link href={`/publicaciones/nueva?id=${publicacion.id}`} className="text-sm text-blue-700 hover:underline flex items-center gap-2">
                          <Edit className="h-4 w-4" />
                          Editar
                        </Link>
                      )}
                    </div>
                </CardFooter>
              </AnimatedCard>
            ))
          ) : (
            <AnimatedCard className="bg-white border-blue-100" delay={500}>
              <CardContent className="pt-6 text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-blue-300 mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-blue-900">No se encontraron publicaciones</h3>
                <p className="text-sm text-blue-600 mb-6">
                  {publicaciones.length === 0
                    ? "Aún no hay publicaciones registradas en la plataforma."
                    : "Intenta ajustar los filtros de búsqueda para encontrar más resultados."}
                </p>
                <div className="flex justify-center">
                  {publicaciones.length === 0 ? (
                    <AnimatedButton asChild className="bg-blue-700 text-white hover:bg-blue-800">
                      <Link href="/publicaciones/nueva">Subir la primera publicación</Link>
                    </AnimatedButton>
                  ) : publicaciones.length > 0 && (
                    <AnimatedButton
                      onClick={() => {
                        setSearchTerm("")
                        setSelectedCategory("all")
                        setSelectedYear("all")
                        setSelectedAccess("all")
                      }}
                      className="bg-blue-700 text-white hover:bg-blue-800"
                    >
                      Limpiar filtros
                    </AnimatedButton>
                  )}
                </div>
              </CardContent>
            </AnimatedCard>
          )}
        </div>
      </div>
    </div>
  )
}
