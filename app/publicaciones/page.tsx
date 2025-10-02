"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Filter, ExternalLink, FileText, Calendar, User, Building, Plus } from "lucide-react"
import Link from "next/link"

// Interfaces para tipos de datos
interface Publicacion {
  id: number
  titulo: string
  autor: {
    nombreCompleto: string
    institucion: string
    slug: string
  }
  editorial: string
  añoCreacion: number
  doi?: string
  resumen?: string
  palabrasClave?: string[]
  categoria?: string
  tipo?: string
  acceso?: string
  volumen?: string
  numero?: string
  paginas?: string
}

export default function PublicacionesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedYear, setSelectedYear] = useState("all")
  const [selectedEditorial, setSelectedEditorial] = useState("all")
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPublicaciones = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/publicaciones')
        const data = await response.json()
        setPublicaciones(data.publicaciones || [])
      } catch (error) {
        console.error("Error fetching publicaciones:", error)
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
      pub.autor.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pub.editorial.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pub.autor.institucion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pub.palabrasClave && pub.palabrasClave.some((palabra) => palabra.toLowerCase().includes(searchTerm.toLowerCase())))

    const matchesCategory = selectedCategory === "all" || pub.categoria === selectedCategory
    const matchesYear = selectedYear === "all" || pub.añoCreacion.toString() === selectedYear
    const matchesEditorial = selectedEditorial === "all" || pub.editorial === selectedEditorial

    return matchesSearch && matchesCategory && matchesYear && matchesEditorial
  })

  // Obtener opciones únicas desde los datos
  const categorias = [...new Set(publicaciones.map(p => p.categoria).filter(Boolean))]
  const años = [...new Set(publicaciones.map(p => p.añoCreacion))].sort((a, b) => b - a)
  const editoriales = [...new Set(publicaciones.map(p => p.editorial))]

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-blue-900">Publicaciones Científicas</h1>
              <p className="text-blue-600">
                Explora las publicaciones científicas de investigadores de Chihuahua en revistas nacionales e
                internacionales
              </p>
            </div>
            <Button 
              className="bg-blue-700 text-white hover:bg-blue-800 self-start sm:self-center"
              asChild
            >
              <Link href="/publicaciones/nueva">
                <Plus className="mr-2 h-4 w-4" />
                Crear Publicación
              </Link>
            </Button>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <Card className="bg-white border-blue-100">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Buscar por título, autor, editorial o institución..."
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
                  {categorias.map((categoria) => (
                    <SelectItem key={categoria} value={categoria!}>
                      {categoria}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="bg-white border-blue-200 text-blue-900">
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
              <Select value={selectedEditorial} onValueChange={setSelectedEditorial}>
                <SelectTrigger className="bg-white border-blue-200 text-blue-900">
                  <SelectValue placeholder="Editorial" />
                </SelectTrigger>
                <SelectContent className="bg-white border-blue-100">
                  <SelectItem value="all">Todas las editoriales</SelectItem>
                  {editoriales.map((editorial) => (
                    <SelectItem key={editorial} value={editorial}>
                      {editorial}
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
                : `${filteredPublicaciones.length} publicación${filteredPublicaciones.length !== 1 ? "es" : ""} encontrada${filteredPublicaciones.length !== 1 ? "s" : ""}`}
            </p>
            <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-transparent">
              <Filter className="mr-2 h-4 w-4" />
              Filtros avanzados
            </Button>
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
            <div className="space-y-4">
              {filteredPublicaciones.map((publicacion) => (
                <Card key={publicacion.id} className="bg-white border-blue-100 hover:border-blue-300 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      {/* Información principal */}
                      <div className="flex-1 space-y-3">
                        {/* Título y badges */}
                        <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-blue-900 mb-2 line-clamp-2">
                              {publicacion.titulo}
                            </h3>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {publicacion.categoria && (
                              <Badge className="bg-blue-700 text-white text-xs">{publicacion.categoria}</Badge>
                            )}
                            {publicacion.acceso && (
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${
                                  publicacion.acceso === 'Abierto' ? 'border-green-200 text-green-700' : 'border-amber-200 text-amber-700'
                                }`}
                              >
                                {publicacion.acceso === 'Abierto' ? 'Acceso abierto' : 'Acceso restringido'}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Información del autor */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-blue-600">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 flex-shrink-0" />
                            <Link 
                              href={`/investigadores/${publicacion.autor.slug}`}
                              className="font-medium text-blue-900 hover:text-blue-700 hover:underline transition-colors"
                            >
                              {publicacion.autor.nombreCompleto}
                            </Link>
                          </div>
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 flex-shrink-0" />
                            <span>{publicacion.autor.institucion}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 flex-shrink-0" />
                            <span>{publicacion.editorial}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 flex-shrink-0" />
                            <span>{publicacion.añoCreacion}</span>
                          </div>
                        </div>

                        {/* Resumen */}
                        {publicacion.resumen && (
                          <p className="text-sm text-blue-600 line-clamp-2">
                            {publicacion.resumen}
                          </p>
                        )}

                        {/* Tags */}
                        {publicacion.palabrasClave && publicacion.palabrasClave.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {publicacion.palabrasClave.slice(0, 4).map((palabra, index) => (
                              <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700 text-xs">
                                {palabra}
                              </Badge>
                            ))}
                            {publicacion.palabrasClave.length > 4 && (
                              <Badge variant="secondary" className="bg-blue-50 text-blue-700 text-xs">
                                +{publicacion.palabrasClave.length - 4}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Botón de acción */}
                      <div className="flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-transparent"
                          onClick={() => publicacion.doi && window.open(`https://doi.org/${publicacion.doi}`, "_blank")}
                          disabled={!publicacion.doi}
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Ver publicación
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
                <h3 className="text-lg font-semibold mb-2 text-blue-900">No se encontraron publicaciones</h3>
                <p className="text-sm text-blue-600 mb-6">
                  {publicaciones.length === 0
                    ? "Aún no hay publicaciones registradas en la plataforma."
                    : "Intenta ajustar los filtros de búsqueda para encontrar más resultados."}
                </p>
                {publicaciones.length > 0 && (
                  <Button
                    onClick={() => {
                      setSearchTerm("")
                      setSelectedCategory("all")
                      setSelectedYear("all")
                      setSelectedEditorial("all")
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
