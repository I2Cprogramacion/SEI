"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Filter, Calendar, Users, ExternalLink, FileText, User as UserIcon, Building, Plus } from "lucide-react"
import Link from "next/link"

// Función para generar slug del perfil público
const generatePublicProfileSlug = (name: any) => {
  if (!name || typeof name !== 'string') return 'usuario'
  return name.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .trim()
    || 'usuario'
}

// Interfaces para tipos de datos
interface Proyecto {
  id: number
  titulo: string
  descripcion: string
  autor: {
    nombreCompleto: string
    estado: string
    instituto: string
    email?: string
    telefono?: string
  }
  fechaPublicacion: string
  categoria: string
  tags: string[]
  estado: string // Activo, Completado, En revisión, etc.
  slug: string
  archivo?: string
  resumen?: string
}

export default function ProyectosPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedEstado, setSelectedEstado] = useState("all")
  const [selectedInstitution, setSelectedInstitution] = useState("all")
  const [proyectos, setProyectos] = useState<Proyecto[]>([])
  const [loading, setLoading] = useState(true)

  // Conectar con API real
  useEffect(() => {
    const fetchProyectos = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/proyectos')
        const data = await response.json()
        
        if (response.ok) {
          // Transformar datos de la API al formato esperado
          const proyectosFormateados = data.proyectos.map((proyecto: any) => ({
            id: proyecto.id,
            titulo: proyecto.titulo,
            descripcion: proyecto.descripcion,
            resumen: proyecto.resumen,
            autor: {
              nombreCompleto: typeof proyecto.autor === 'string' 
                ? proyecto.autor 
                : proyecto.autor?.nombreCompleto || 'Usuario',
              estado: typeof proyecto.autor === 'object' && proyecto.autor?.estado 
                ? proyecto.autor.estado 
                : proyecto.estado || 'Chihuahua',
              instituto: typeof proyecto.autor === 'object' && proyecto.autor?.instituto 
                ? proyecto.autor.instituto 
                : proyecto.institucion || 'Institución no especificada',
              email: typeof proyecto.autor === 'object' && proyecto.autor?.email 
                ? proyecto.autor.email 
                : proyecto.email,
              telefono: typeof proyecto.autor === 'object' && proyecto.autor?.telefono 
                ? proyecto.autor.telefono 
                : proyecto.telefono
            },
            fechaPublicacion: proyecto.fechaPublicacion || proyecto.fechaCreacion?.split('T')[0] || new Date().toISOString().split('T')[0],
            categoria: proyecto.categoria,
            tags: proyecto.palabrasClave || [],
            estado: proyecto.estadoProyecto || 'Activo',
            slug: proyecto.slug,
            archivo: proyecto.archivo
          }))
          setProyectos(proyectosFormateados)
        } else {
          console.error('Error en la respuesta:', data.error)
          setProyectos([])
        }
      } catch (error) {
        console.error("Error fetching proyectos:", error)
        setProyectos([])
      } finally {
        setLoading(false)
      }
    }

    fetchProyectos()
  }, [])

  // Filtrar proyectos
  const filteredProyectos = proyectos.filter((proyecto) => {
    const matchesSearch =
      proyecto.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proyecto.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proyecto.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
      proyecto.autor.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proyecto.autor.instituto.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = selectedCategory === "all" || proyecto.categoria === selectedCategory
    const matchesStatus = selectedStatus === "all" || proyecto.estado === selectedStatus
    const matchesEstado = selectedEstado === "all" || proyecto.autor.estado === selectedEstado
    const matchesInstitution = selectedInstitution === "all" || proyecto.autor.instituto === selectedInstitution

    return matchesSearch && matchesCategory && matchesStatus && matchesEstado && matchesInstitution
  })

  // Obtener opciones únicas desde los datos
  const categories = [...new Set(proyectos.map(p => p.categoria))]
  const statuses = [...new Set(proyectos.map(p => p.estado))]
  const estados = [...new Set(proyectos.map(p => p.autor.estado))]
  const institutions = [...new Set(proyectos.map(p => p.autor.instituto))]

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-blue-900">Proyectos de Investigación</h1>
            <p className="text-blue-600">Explora los proyectos de investigación activos y completados en Chihuahua</p>
          </div>
          <Button className="bg-blue-700 text-white hover:bg-blue-800" asChild>
            <Link href="/proyectos/nuevo">
              <Plus className="mr-2 h-4 w-4" />
              Subir Proyecto
            </Link>
          </Button>
        </div>

        {/* Filtros y búsqueda */}
        <Card className="bg-white border-blue-100">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Buscar por título, autor o institución..."
                    className="pl-10 bg-white border-blue-200 text-blue-900 placeholder:text-blue-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="bg-white border-blue-200 text-blue-900">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent className="bg-white border-blue-100">
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="bg-white border-blue-200 text-blue-900">
                  <SelectValue placeholder="Estado del proyecto" />
                </SelectTrigger>
                <SelectContent className="bg-white border-blue-100">
                  <SelectItem value="all">Todos los estados</SelectItem>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedEstado} onValueChange={setSelectedEstado}>
                <SelectTrigger className="bg-white border-blue-200 text-blue-900">
                  <SelectValue placeholder="Estado del autor" />
                </SelectTrigger>
                <SelectContent className="bg-white border-blue-100">
                  <SelectItem value="all">Todos los estados</SelectItem>
                  {estados.map((estado) => (
                    <SelectItem key={estado} value={estado}>
                      {estado}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedInstitution} onValueChange={setSelectedInstitution}>
                <SelectTrigger className="bg-white border-blue-200 text-blue-900">
                  <SelectValue placeholder="Institución" />
                </SelectTrigger>
                <SelectContent className="bg-white border-blue-100">
                  <SelectItem value="all">Todas las instituciones</SelectItem>
                  {institutions.map((institution) => (
                    <SelectItem key={institution} value={institution}>
                      {institution}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Resultados */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-blue-600">
              {loading
                ? "Cargando..."
                : `${filteredProyectos.length} proyecto${filteredProyectos.length !== 1 ? "s" : ""} encontrado${filteredProyectos.length !== 1 ? "s" : ""}`}
            </p>
            <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-transparent">
              <Filter className="mr-2 h-4 w-4" />
              Filtros avanzados
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
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
          ) : filteredProyectos.length > 0 ? (
            <div className="space-y-4">
              {filteredProyectos.map((proyecto) => (
                <Card key={proyecto.id} className="bg-white border-blue-100 hover:border-blue-300 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      {/* Información principal */}
                      <div className="flex-1 space-y-3">
                        {/* Título y badges */}
                        <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-blue-900 mb-2 line-clamp-2">
                              {proyecto.titulo}
                            </h3>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Badge className="bg-blue-700 text-white text-xs">{proyecto.categoria}</Badge>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                proyecto.estado === 'Activo' ? 'border-green-200 text-green-700' :
                                proyecto.estado === 'Completado' ? 'border-gray-200 text-gray-700' :
                                'border-yellow-200 text-yellow-700'
                              }`}
                            >
                              {proyecto.estado}
                            </Badge>
                          </div>
                        </div>

                        {/* Información del autor */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-blue-600">
                          <div className="flex items-center gap-2">
                            <UserIcon className="h-4 w-4 flex-shrink-0" />
                            <Link 
                              href={`/investigadores/${generatePublicProfileSlug(
                                typeof proyecto.autor === 'string' 
                                  ? proyecto.autor 
                                  : proyecto.autor?.nombreCompleto || 'usuario'
                              )}`}
                              className="font-medium text-blue-900 hover:text-blue-700 hover:underline transition-colors"
                            >
                              {typeof proyecto.autor === 'string' 
                                ? proyecto.autor 
                                : proyecto.autor?.nombreCompleto || 'Usuario'
                              }
                            </Link>
                          </div>
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 flex-shrink-0" />
                            <span>
                              {typeof proyecto.autor === 'object' && proyecto.autor?.instituto 
                                ? proyecto.autor.instituto 
                                : 'Institución no especificada'
                              }
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 flex-shrink-0" />
                            <span>
                              {new Date(proyecto.fechaPublicacion).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-blue-500">•</span>
                            <span>
                              {typeof proyecto.autor === 'object' && proyecto.autor?.estado 
                                ? proyecto.autor.estado 
                                : 'Estado no especificado'
                              }
                            </span>
                          </div>
                        </div>

                        {/* Resumen */}
                        <p className="text-sm text-blue-600 line-clamp-2">
                          {proyecto.resumen || proyecto.descripcion}
                        </p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1">
                          {proyecto.tags.slice(0, 4).map((tag, index) => (
                            <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700 text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {proyecto.tags.length > 4 && (
                            <Badge variant="secondary" className="bg-blue-50 text-blue-700 text-xs">
                              +{proyecto.tags.length - 4}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Botón de acción */}
                      <div className="flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-transparent"
                          asChild
                        >
                          <Link href={proyecto.archivo || `/proyectos/${proyecto.slug}`}>
                            <FileText className="mr-2 h-4 w-4" />
                            {proyecto.archivo ? 'Ver documento' : 'Ver detalles'}
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-white border-blue-100">
              <CardContent className="pt-6 text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-blue-300 mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-blue-900">No se encontraron proyectos</h3>
                <p className="text-sm text-blue-600 mb-6">
                  {proyectos.length === 0
                    ? "Aún no hay proyectos registrados en la plataforma."
                    : "Intenta ajustar los filtros de búsqueda para encontrar más resultados."}
                </p>
                {proyectos.length > 0 && (
                  <Button
                    onClick={() => {
                      setSearchTerm("")
                      setSelectedCategory("all")
                      setSelectedStatus("all")
                      setSelectedEstado("all")
                      setSelectedInstitution("all")
                    }}
                    className="bg-blue-700 text-white hover:bg-blue-800"
                  >
                    Limpiar filtros
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
