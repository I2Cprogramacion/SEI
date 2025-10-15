"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, User, FileText, Building, Eye, Filter, X, Users } from "lucide-react"
import Link from "next/link"

interface SearchResult {
  investigadores: Array<{
    id: number
    nombre: string
    institucion: string
    area: string
    lineaInvestigacion?: string
    fotografiaUrl?: string
    ultimoGradoEstudios?: string
    slug: string
    keywords: string[]
  }>
  proyectos: Array<{
    id: string
    titulo: string
    investigador: string
    institucion: string
    area: string
    slug: string
    keywords: string[]
  }>
  total: number
}

export default function BuscarPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const query = searchParams.get('q') || ''
  const type = searchParams.get('type') || 'all'
  const areaFilter = searchParams.get('area') || 'all'
  const institucionFilter = searchParams.get('institucion') || 'all'
  
  const [results, setResults] = useState<SearchResult>({
    investigadores: [],
    proyectos: [],
    total: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  
  // Filtros locales
  const [localQuery, setLocalQuery] = useState(query)
  const [localArea, setLocalArea] = useState(areaFilter)
  const [localInstitucion, setLocalInstitucion] = useState(institucionFilter)

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        let url = `/api/search?q=${encodeURIComponent(query)}&type=${type}`
        if (areaFilter !== 'all') url += `&area=${encodeURIComponent(areaFilter)}`
        if (institucionFilter !== 'all') url += `&institucion=${encodeURIComponent(institucionFilter)}`
        
        const response = await fetch(url)
        const data = await response.json()
        setResults(data)
      } catch (error) {
        console.error('Error fetching search results:', error)
        setError('Error al realizar la búsqueda')
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [query, type, areaFilter, institucionFilter])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    let url = `/buscar?q=${encodeURIComponent(localQuery)}&type=${type}`
    if (localArea !== 'all') url += `&area=${encodeURIComponent(localArea)}`
    if (localInstitucion !== 'all') url += `&institucion=${encodeURIComponent(localInstitucion)}`
    router.push(url)
  }

  const clearFilters = () => {
    setLocalArea('all')
    setLocalInstitucion('all')
    router.push(`/buscar?q=${encodeURIComponent(localQuery)}&type=${type}`)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
          <p className="text-blue-600">Buscando...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-blue-900 mb-2">
          Buscar Investigadores y Proyectos
        </h1>
        <p className="text-blue-600">
          {query && (
            <>
              {results.total} resultado{results.total !== 1 ? 's' : ''} para "{query}"
            </>
          )}
        </p>
      </div>

      {/* Barra de búsqueda y filtros */}
      <Card className="bg-white border-blue-100 mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-blue-900 flex items-center gap-2">
              <Search className="h-5 w-5" />
              Búsqueda Avanzada
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="text-blue-700"
            >
              <Filter className="h-4 w-4 mr-2" />
              {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            {/* Búsqueda principal */}
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Buscar por nombre, área, institución, línea de investigación..."
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                className="flex-1 bg-white border-blue-200"
              />
              <Button type="submit" className="bg-blue-700 hover:bg-blue-800">
                <Search className="h-4 w-4 mr-2" />
                Buscar
              </Button>
            </div>

            {/* Filtros avanzados */}
            {showFilters && (
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-blue-900 flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filtros Avanzados
                  </h3>
                  {(localArea !== 'all' || localInstitucion !== 'all') && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Limpiar filtros
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Filtro por área */}
                  <div className="space-y-2">
                    <Label htmlFor="area" className="text-blue-900">
                      Área de Investigación
                    </Label>
                    <Select value={localArea} onValueChange={setLocalArea}>
                      <SelectTrigger className="bg-white border-blue-200">
                        <SelectValue placeholder="Todas las áreas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas las áreas</SelectItem>
                        <SelectItem value="Ciencias Naturales">Ciencias Naturales</SelectItem>
                        <SelectItem value="Ingeniería">Ingeniería</SelectItem>
                        <SelectItem value="Ciencias Sociales">Ciencias Sociales</SelectItem>
                        <SelectItem value="Humanidades">Humanidades</SelectItem>
                        <SelectItem value="Ciencias de la Salud">Ciencias de la Salud</SelectItem>
                        <SelectItem value="Agronomía">Agronomía</SelectItem>
                        <SelectItem value="Tecnología">Tecnología</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Filtro por institución */}
                  <div className="space-y-2">
                    <Label htmlFor="institucion" className="text-blue-900">
                      Institución
                    </Label>
                    <Select value={localInstitucion} onValueChange={setLocalInstitucion}>
                      <SelectTrigger className="bg-white border-blue-200">
                        <SelectValue placeholder="Todas las instituciones" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas las instituciones</SelectItem>
                        <SelectItem value="Universidad Autónoma de Chihuahua">Universidad Autónoma de Chihuahua</SelectItem>
                        <SelectItem value="Instituto Tecnológico de Chihuahua">Instituto Tecnológico de Chihuahua</SelectItem>
                        <SelectItem value="CIMAV">CIMAV</SelectItem>
                        <SelectItem value="CICESE">CICESE</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <Users className="h-4 w-4" />
                  <span>
                    Encuentra colaboradores con intereses similares usando los filtros
                  </span>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {!query.trim() && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-blue-400 mx-auto mb-4" />
          <p className="text-blue-600">Ingresa un término de búsqueda para comenzar</p>
        </div>
      )}

      {query.trim() && results.total === 0 && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-blue-400 mx-auto mb-4" />
          <p className="text-blue-600">No se encontraron resultados para "{query}"</p>
        </div>
      )}

      {/* Investigadores */}
      {results.investigadores.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <User className="h-5 w-5 text-blue-700" />
            <h2 className="text-xl font-semibold text-blue-900">
              Investigadores ({results.investigadores.length})
            </h2>
          </div>
          <div className="grid gap-4">
            {results.investigadores.map((investigador) => (
              <Card key={investigador.id} className="bg-white border-blue-100 hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start space-x-4 flex-1">
                      <Avatar className="h-16 w-16 ring-2 ring-blue-100">
                        <AvatarImage src={investigador.fotografiaUrl || "/placeholder-user.jpg"} alt={investigador.nombre} />
                        <AvatarFallback className="bg-blue-100 text-blue-700">
                          {investigador.nombre
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <Link href={`/investigadores/${investigador.slug}`} className="hover:underline">
                          <h3 className="font-semibold text-lg text-blue-900 hover:text-blue-700 cursor-pointer mb-1">
                            {investigador.nombre}
                          </h3>
                        </Link>
                        {investigador.ultimoGradoEstudios && (
                          <p className="text-sm text-blue-600 mb-2">{investigador.ultimoGradoEstudios}</p>
                        )}
                        <div className="flex items-center gap-2 text-sm text-blue-600 mb-2">
                          <Building className="h-4 w-4" />
                          <span>{investigador.institucion}</span>
                        </div>
                        {investigador.lineaInvestigacion && (
                          <p className="text-sm text-blue-500 mb-2 line-clamp-2">
                            {investigador.lineaInvestigacion}
                          </p>
                        )}
                        <div className="flex gap-2 mt-2">
                          {investigador.area && (
                            <Badge variant="secondary" className="bg-blue-700 text-white text-xs">
                              {investigador.area}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button variant="ghost" size="sm" className="text-blue-700 hover:bg-blue-50" asChild>
                        <Link href={`/investigadores/${investigador.slug}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver perfil
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Proyectos y Publicaciones */}
      {results.proyectos.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-blue-700" />
            <h2 className="text-xl font-semibold text-blue-900">
              Proyectos y Publicaciones ({results.proyectos.length})
            </h2>
          </div>
          <div className="grid gap-4">
            {results.proyectos.map((proyecto) => (
              <Card key={proyecto.id} className="bg-white border-blue-100">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-blue-900 mb-2">{proyecto.titulo}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-blue-700 text-white text-xs">
                          {proyecto.area}
                        </Badge>
                      </div>
                      <div className="flex items-center text-sm text-blue-600">
                        <User className="h-4 w-4 mr-1" />
                        {proyecto.investigador}
                      </div>
                      <div className="flex items-center text-sm text-blue-600 mt-1">
                        <Building className="h-4 w-4 mr-1" />
                        {proyecto.institucion}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-blue-700 hover:bg-blue-50" asChild>
                      <Link href={`/proyectos/${proyecto.slug}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
