"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, Eye, Search, BookOpen, Calendar, User, ExternalLink } from "lucide-react"
import { ExportDialog } from "@/components/export-dialog"

// Interfaz para los datos de publicaciones
interface Publicacion {
  id: number
  titulo: string
  autores?: string
  revista?: string
  volumen?: string
  numero?: string
  paginas?: string
  fecha_publicacion?: string
  doi?: string
  issn?: string
  tipo_publicacion?: string
  area_tematica?: string
  palabras_clave?: string
  resumen?: string
  url?: string
  investigador_principal?: string
  institucion?: string
  fecha_registro?: string
}

export default function PublicacionesAdmin() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [tipoFilter, setTipoFilter] = useState("todos")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([])

  // Verificar que el usuario es admin (no evaluador)
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const response = await fetch('/api/admin/verificar-acceso')
        if (response.ok) {
          const data = await response.json()
          // Si es evaluador pero no admin, redirigir a instituciones
          if (data.esEvaluador && !data.esAdmin) {
            router.push('/admin/instituciones')
            return
          }
          // Si no tiene acceso, redirigir al dashboard
          if (!data.tieneAcceso) {
            router.push('/dashboard')
            return
          }
        }
      } catch (error) {
        console.error('Error verificando acceso:', error)
      }
    }
    checkAdmin()
  }, [router])
  const [filteredData, setFilteredData] = useState<Publicacion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [exportDialogOpen, setExportDialogOpen] = useState(false)

  // Cargar publicaciones desde la API
  useEffect(() => {
    const fetchPublicaciones = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/publicaciones")
        
        if (!response.ok) {
          const data = await response.json()
          console.warn("⚠️ No se pudieron cargar publicaciones:", data.error)
          setPublicaciones([])
          setFilteredData([])
          setError("No se pudieron cargar las publicaciones. La tabla podría no existir aún.")
          return
        }
        
        const data = await response.json()
        console.log("Datos recibidos de la API:", data)
        const publicacionesData = Array.isArray(data.publicaciones) ? data.publicaciones : Array.isArray(data) ? data : []
        console.log("Datos procesados:", publicacionesData)
        setPublicaciones(publicacionesData)
        setFilteredData(publicacionesData)
        setError(null)
      } catch (error) {
        console.warn("⚠️ Error al conectar con API de publicaciones:", error)
        setPublicaciones([])
        setFilteredData([])
        setError("No se pudo conectar con el servidor. Intenta nuevamente.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPublicaciones()
  }, [])

  // Filtrar datos basados en búsqueda y filtros
  useEffect(() => {
    if (!Array.isArray(publicaciones)) return
    
    let filtered = publicaciones

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (publicacion) =>
          publicacion.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          publicacion.autores?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          publicacion.revista?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          publicacion.area_tematica?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          publicacion.palabras_clave?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          publicacion.investigador_principal?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          publicacion.institucion?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtrar por tipo de publicación
    if (tipoFilter !== "todos") {
      filtered = filtered.filter(publicacion => 
        publicacion.tipo_publicacion?.toLowerCase() === tipoFilter.toLowerCase()
      )
    }

    setFilteredData(filtered)
    setCurrentPage(1)
  }, [searchTerm, tipoFilter, publicaciones])

  // Calcular índices para paginación
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = Array.isArray(filteredData) ? filteredData.slice(indexOfFirstItem, indexOfLastItem) : []

  // Cambiar página
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  const getTipoBadge = (tipo: string) => {
    const tipos = {
      'articulo': 'bg-blue-100 text-blue-800',
      'libro': 'bg-green-100 text-green-800',
      'capitulo': 'bg-purple-100 text-purple-800',
      'ponencia': 'bg-orange-100 text-orange-800',
      'tesis': 'bg-gray-100 text-gray-800',
      'patente': 'bg-yellow-100 text-yellow-800',
    }
    return tipos[tipo as keyof typeof tipos] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="w-full">
      <div className="w-full py-4 md:py-8 px-4 md:px-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
        <Button variant="ghost" size="sm" asChild className="text-gray-700 hover:bg-gray-100">
          <Link href="/admin">
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Volver al panel</span>
            <span className="sm:hidden">Volver</span>
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">Publicaciones</h1>
            <p className="text-sm text-gray-600">Gestión de producción académica</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6">
          <p>{error}</p>
        </div>
      )}

      <Card className="bg-white border-0 shadow-xl hover:shadow-2xl transition-shadow mb-8 w-full">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-xl">
          <CardTitle className="text-gray-900 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            Publicaciones Académicas
          </CardTitle>
          <CardDescription className="text-gray-600">
            Gestiona todas las publicaciones académicas registradas en la plataforma
          </CardDescription>
        </CardHeader>
        <CardContent className="w-full p-0 md:p-6">
          <div className="flex flex-col md:flex-row gap-3 md:gap-4 mb-6 px-4 md:px-0 pt-4 md:pt-0">
            <div className="flex-1 flex flex-col sm:flex-row gap-2">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Buscar por título, autor, revista..."
                  className="pl-10 bg-white border-blue-200 text-blue-900 placeholder:text-blue-400 text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={tipoFilter} onValueChange={setTipoFilter}>
                <SelectTrigger className="w-full sm:w-[160px] bg-white border-blue-200">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los tipos</SelectItem>
                  <SelectItem value="articulo">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-blue-500" /> Artículo
                    </span>
                  </SelectItem>
                  <SelectItem value="libro">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-green-500" /> Libro
                    </span>
                  </SelectItem>
                  <SelectItem value="capitulo">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-purple-500" /> Capítulo
                    </span>
                  </SelectItem>
                  <SelectItem value="ponencia">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-orange-500" /> Ponencia
                    </span>
                  </SelectItem>
                  <SelectItem value="tesis">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-gray-500" /> Tesis
                    </span>
                  </SelectItem>
                  <SelectItem value="patente">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-yellow-500" /> Patente
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
              {(searchTerm || tipoFilter !== "todos") && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSearchTerm("")
                    setTipoFilter("todos")
                  }}
                  className="border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  Limpiar
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-transparent flex-1 sm:flex-initial"
                onClick={() => setExportDialogOpen(true)}
              >
                <Download className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Exportar</span>
              </Button>
              <Button 
                size="sm"
                className="bg-blue-700 text-white hover:bg-blue-800 flex-1 sm:flex-initial" 
                asChild
              >
                <Link href="/publicaciones/nueva">
                  <BookOpen className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Nueva Publicación</span>
                  <span className="sm:hidden">Nueva</span>
                </Link>
              </Button>
            </div>
          </div>

          {/* Vista de tabla para desktop */}
          <div className="hidden lg:block w-full -mx-4 md:mx-0">
            <div className="rounded-md border border-blue-100 overflow-x-auto w-full">
            <Table className="w-full min-w-full">
              <TableHeader className="bg-blue-50">
                <TableRow className="hover:bg-blue-50 border-b border-blue-100">
                  <TableHead className="text-blue-700">ID</TableHead>
                  <TableHead className="text-blue-700">Título</TableHead>
                  <TableHead className="text-blue-700">Autores</TableHead>
                  <TableHead className="text-blue-700">Revista</TableHead>
                  <TableHead className="text-blue-700">Tipo</TableHead>
                  <TableHead className="text-blue-700">Fecha</TableHead>
                  <TableHead className="text-blue-700">DOI</TableHead>
                  <TableHead className="text-blue-700 text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-blue-600">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                        Cargando publicaciones...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : !Array.isArray(filteredData) || filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-blue-600">
                      {error ? "Error al cargar los datos" : "No se encontraron publicaciones"}
                    </TableCell>
                  </TableRow>
                ) : currentItems.length > 0 ? (
                  currentItems.map((publicacion) => (
                    <TableRow key={publicacion.id} className="hover:bg-blue-50 border-b border-blue-100">
                      <TableCell className="text-blue-900">{publicacion.id}</TableCell>
                      <TableCell className="text-blue-900 font-medium">
                        <div className="max-w-xs truncate" title={publicacion.titulo}>
                          {publicacion.titulo || "N/A"}
                        </div>
                      </TableCell>
                      <TableCell className="text-blue-900">
                        <div className="max-w-xs truncate" title={publicacion.autores}>
                          {publicacion.autores || "N/A"}
                        </div>
                      </TableCell>
                      <TableCell className="text-blue-900">
                        <div className="max-w-xs truncate" title={publicacion.revista}>
                          {publicacion.revista || "N/A"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getTipoBadge(publicacion.tipo_publicacion || "articulo")}>
                          {publicacion.tipo_publicacion || "Artículo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-blue-900">
                        {(publicacion.fecha_publicacion || publicacion.fecha_creacion) ? 
                          new Date(publicacion.fecha_publicacion || publicacion.fecha_creacion).toLocaleDateString() : "N/A"}
                      </TableCell>
                      <TableCell className="text-blue-900">
                        {publicacion.doi ? (
                          <a 
                            href={`https://doi.org/${publicacion.doi}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                          >
                            <ExternalLink className="h-3 w-3" />
                            {publicacion.doi}
                          </a>
                        ) : "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-blue-200 text-blue-700 hover:bg-blue-50"
                            asChild
                          >
                            <Link href={`/publicaciones/${publicacion.id}`}>
                              <Eye className="mr-1 h-3 w-3" />
                              Ver
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-blue-200 text-blue-700 hover:bg-blue-50"
                            asChild
                          >
                            <Link href={`/admin/publicaciones/editar/${publicacion.id}`}>
                              <BookOpen className="mr-1 h-3 w-3" />
                              Editar
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-blue-600">
                      No hay publicaciones en esta página
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            </div>
          </div>

          {/* Vista de cards para móvil/tablet */}
          <div className="lg:hidden space-y-4 w-full px-4 md:px-0 pb-4 md:pb-0">
            {isLoading ? (
              <div className="text-center py-8 text-blue-600">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                  Cargando publicaciones...
                </div>
              </div>
            ) : !Array.isArray(filteredData) || filteredData.length === 0 ? (
              <div className="text-center py-8 text-blue-600">
                {error ? "Error al cargar los datos" : "No se encontraron publicaciones"}
              </div>
            ) : currentItems.length > 0 ? (
              currentItems.map((publicacion) => (
                <Card key={publicacion.id} className="bg-white border-blue-100 w-full">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-blue-900 flex-1">{publicacion.titulo || "N/A"}</h3>
                        <Badge className={getTipoBadge(publicacion.tipo_publicacion || "articulo")}>
                          {publicacion.tipo_publicacion || "Artículo"}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm text-blue-700">
                        {publicacion.autores && (
                          <p><span className="font-medium">Autores:</span> {publicacion.autores}</p>
                        )}
                        {publicacion.revista && (
                          <p><span className="font-medium">Revista:</span> {publicacion.revista}</p>
                        )}
                        {(publicacion.fecha_publicacion || publicacion.fecha_creacion) && (
                          <p><span className="font-medium">Fecha:</span> {new Date(publicacion.fecha_publicacion || publicacion.fecha_creacion).toLocaleDateString()}</p>
                        )}
                        {publicacion.doi && (
                          <p>
                            <span className="font-medium">DOI:</span>{" "}
                            <a 
                              href={`https://doi.org/${publicacion.doi}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                            >
                              {publicacion.doi}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50"
                          asChild
                        >
                          <Link href={`/publicaciones/${publicacion.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50"
                          asChild
                        >
                          <Link href={`/admin/publicaciones/editar/${publicacion.id}`}>
                            <BookOpen className="mr-2 h-4 w-4" />
                            Editar
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-blue-600">
                No hay publicaciones en esta página
              </div>
            )}
          </div>

          {/* Paginación */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm text-blue-600 hidden sm:inline">Mostrar</p>
              <Select value={itemsPerPage.toString()} onValueChange={(value) => {
                setItemsPerPage(Number.parseInt(value))
                setCurrentPage(1)
              }}>
                <SelectTrigger className="w-[70px] bg-white border-blue-200 text-blue-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-blue-100 text-blue-900">
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-blue-600 hidden sm:inline">por página</p>
              {Array.isArray(filteredData) && filteredData.length > 0 && (
                <p className="text-xs sm:text-sm text-blue-600 ml-2">
                  Mostrando {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredData.length)} de {filteredData.length}
                </p>
              )}
            </div>

            {Array.isArray(filteredData) && filteredData.length > 0 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        if (currentPage > 1) paginate(currentPage - 1)
                      }}
                      className={`${
                        currentPage === 1 ? "pointer-events-none opacity-50" : ""
                      } text-blue-700 hover:bg-blue-50`}
                    />
                  </PaginationItem>
                  {Array.from({ length: Math.ceil((Array.isArray(filteredData) ? filteredData.length : 0) / itemsPerPage) }).map((_, index) => {
                    // Mostrar solo un número limitado de páginas
                    if (
                      index === 0 ||
                      index === Math.ceil((Array.isArray(filteredData) ? filteredData.length : 0) / itemsPerPage) - 1 ||
                      (index >= currentPage - 2 && index <= currentPage + 0)
                    ) {
                      return (
                        <PaginationItem key={index}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault()
                              paginate(index + 1)
                            }}
                            isActive={currentPage === index + 1}
                            className="text-blue-700 hover:bg-blue-50"
                          >
                            {index + 1}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    } else if (index === 1 || index === Math.ceil((Array.isArray(filteredData) ? filteredData.length : 0) / itemsPerPage) - 2) {
                      return (
                        <PaginationItem key={index}>
                          <PaginationEllipsis className="text-blue-600" />
                        </PaginationItem>
                      )
                    }
                    return null
                  })}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        if (currentPage < Math.ceil((Array.isArray(filteredData) ? filteredData.length : 0) / itemsPerPage)) paginate(currentPage + 1)
                      }}
                      className={`${
                        currentPage === Math.ceil((Array.isArray(filteredData) ? filteredData.length : 0) / itemsPerPage)
                          ? "pointer-events-none opacity-50"
                          : ""
                      } text-blue-700 hover:bg-blue-50`}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </CardContent>
      </Card>

      <ExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        dataType="publicaciones"
        data={filteredData}
        filename="publicaciones"
        title="Exportar Publicaciones"
        description="Selecciona los campos que deseas incluir en la exportación"
      />
      </div>
    </div>
  )
}
