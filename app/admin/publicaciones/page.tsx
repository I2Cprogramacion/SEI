"use client"

import { useState, useEffect } from "react"
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
import { ArrowLeft, Download, Eye, Filter, Search, BookOpen, Calendar, User, ExternalLink } from "lucide-react"
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
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([])
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

  // Filtrar datos basados en el término de búsqueda
  const handleSearch = () => {
    if (!Array.isArray(publicaciones)) return
    
    const filtered = publicaciones.filter(
      (publicacion) =>
        publicacion.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        publicacion.autores?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        publicacion.revista?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        publicacion.area_tematica?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        publicacion.palabras_clave?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        publicacion.investigador_principal?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        publicacion.institucion?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredData(filtered)
    setCurrentPage(1)
  }

  // Búsqueda automática cuando cambia el término de búsqueda
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch()
    }, 300) // Debounce de 300ms

    return () => clearTimeout(timeoutId)
  }, [searchTerm, publicaciones])

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
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center mb-6">
        <Button variant="ghost" asChild className="mr-4 text-blue-700 hover:bg-blue-50">
          <Link href="/admin">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al panel
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-blue-900">Administración de Publicaciones</h1>
      </div>

      {error && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6">
          <p>{error}</p>
        </div>
      )}

      <Card className="bg-white border-blue-100 mb-8">
        <CardHeader>
          <CardTitle className="text-blue-900">Publicaciones Académicas</CardTitle>
          <CardDescription className="text-blue-600">
            Gestiona todas las publicaciones académicas registradas en la plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 flex gap-2">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Buscar por título, autores, revista o área temática..."
                  className="pl-10 bg-white border-blue-200 text-blue-900 placeholder:text-blue-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch} className="bg-blue-700 text-white hover:bg-blue-800">
                Buscar
              </Button>
              {searchTerm && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm("")
                    setFilteredData(publicaciones)
                    setCurrentPage(1)
                  }}
                  className="border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  Limpiar
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-transparent">
                <Filter className="mr-2 h-4 w-4" />
                Filtros
              </Button>
              <Button
                variant="outline"
                className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-transparent"
                onClick={() => setExportDialogOpen(true)}
              >
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
              <Button className="bg-blue-700 text-white hover:bg-blue-800" asChild>
                <Link href="/publicaciones/nueva">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Nueva Publicación
                </Link>
              </Button>
            </div>
          </div>

          <div className="rounded-md border border-blue-100 overflow-hidden">
            <Table>
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
                        {publicacion.fecha_publicacion ? new Date(publicacion.fecha_publicacion).toLocaleDateString() : "N/A"}
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
                          >
                            <BookOpen className="mr-1 h-3 w-3" />
                            Editar
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

          {/* Paginación */}
          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center gap-2">
              <p className="text-sm text-blue-600">Mostrar</p>
              <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
                <SelectTrigger className="w-20 border-blue-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-blue-600">por página</p>
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
  )
}
