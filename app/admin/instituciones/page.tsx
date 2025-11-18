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
import { ArrowLeft, Download, Eye, Filter, Search, Building, MapPin, Globe, Users } from "lucide-react"
import { ExportDialog } from "@/components/export-dialog"

// Interfaz para los datos de instituciones
interface Institucion {
  id: number
  nombre: string
  tipo?: string
  ubicacion?: string
  sitio_web?: string
  telefono?: string
  email?: string
  director?: string
  fecha_fundacion?: string
  numero_investigadores?: number
  fecha_registro?: string
}

export default function InstitucionesAdmin() {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [instituciones, setInstituciones] = useState<Institucion[]>([])
  const [filteredData, setFilteredData] = useState<Institucion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [exportDialogOpen, setExportDialogOpen] = useState(false)

  // Cargar instituciones desde la API
  useEffect(() => {
    const fetchInstituciones = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/instituciones")
        if (!response.ok) {
          throw new Error("Error al cargar las instituciones")
        }
        const data = await response.json()
        console.log("Datos recibidos de la API:", data)
        const institucionesData = data.instituciones || data || []
        console.log("Datos procesados:", institucionesData)
        setInstituciones(institucionesData)
        setFilteredData(institucionesData)
      } catch (error) {
        console.error("Error al cargar instituciones:", error)
        setError("No se pudieron cargar las instituciones.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchInstituciones()
  }, [])

  // Filtrar datos basados en el término de búsqueda
  const handleSearch = () => {
    if (!Array.isArray(instituciones)) return
    
    const filtered = instituciones.filter(
      (institucion) =>
        institucion.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        institucion.tipo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        institucion.ubicacion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        institucion.director?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        institucion.email?.toLowerCase().includes(searchTerm.toLowerCase()),
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
  }, [searchTerm, instituciones])

  // Calcular índices para paginación
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = Array.isArray(filteredData) ? filteredData.slice(indexOfFirstItem, indexOfLastItem) : []

  // Cambiar página
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  const getTipoBadge = (tipo: string) => {
    const tipos = {
      'universidad': 'bg-blue-100 text-blue-800',
      'centro_investigacion': 'bg-green-100 text-green-800',
      'instituto': 'bg-purple-100 text-purple-800',
      'organismo_publico': 'bg-orange-100 text-orange-800',
      'empresa': 'bg-gray-100 text-gray-800',
    }
    return tipos[tipo as keyof typeof tipos] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="container mx-auto py-4 md:py-8 px-4 md:px-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" asChild className="text-blue-700 hover:bg-blue-50">
          <Link href="/admin">
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Volver al panel</span>
            <span className="sm:hidden">Volver</span>
          </Link>
        </Button>
        <h1 className="text-xl sm:text-2xl font-bold text-blue-900">Administración de Instituciones</h1>
      </div>

      {error && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6">
          <p>{error}</p>
        </div>
      )}

      <Card className="bg-white border-blue-100 mb-8">
        <CardHeader>
          <CardTitle className="text-blue-900">Instituciones Registradas</CardTitle>
          <CardDescription className="text-blue-600">
            Gestiona todas las instituciones educativas y de investigación registradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-3 md:gap-4 mb-6">
            <div className="flex-1 flex flex-col sm:flex-row gap-2">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Buscar por nombre..."
                  className="pl-10 bg-white border-blue-200 text-blue-900 placeholder:text-blue-400 text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <Button 
                onClick={handleSearch} 
                size="sm"
                className="bg-blue-700 text-white hover:bg-blue-800"
              >
                <Search className="mr-2 h-4 w-4 sm:hidden" />
                <span className="sm:inline">Buscar</span>
              </Button>
              {searchTerm && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSearchTerm("")
                    setFilteredData(instituciones)
                    setCurrentPage(1)
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
              >
                <Filter className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Filtros</span>
              </Button>
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
                <Link href="/instituciones/nueva">
                  <Building className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Nueva Institución</span>
                  <span className="sm:hidden">Nueva</span>
                </Link>
              </Button>
            </div>
          </div>

          {/* Vista de tabla para desktop */}
          <div className="hidden lg:block rounded-md border border-blue-100 overflow-x-auto">
            <Table>
              <TableHeader className="bg-blue-50">
                <TableRow className="hover:bg-blue-50 border-b border-blue-100">
                  <TableHead className="text-blue-700">ID</TableHead>
                  <TableHead className="text-blue-700">Nombre</TableHead>
                  <TableHead className="text-blue-700">Tipo</TableHead>
                  <TableHead className="text-blue-700">Ubicación</TableHead>
                  <TableHead className="text-blue-700">Director</TableHead>
                  <TableHead className="text-blue-700">Investigadores</TableHead>
                  <TableHead className="text-blue-700">Sitio Web</TableHead>
                  <TableHead className="text-blue-700 text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-blue-600">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                        Cargando instituciones...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : !Array.isArray(filteredData) || filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-blue-600">
                      {error ? "Error al cargar los datos" : "No se encontraron instituciones"}
                    </TableCell>
                  </TableRow>
                ) : currentItems.length > 0 ? (
                  currentItems.map((institucion) => (
                    <TableRow key={institucion.id} className="hover:bg-blue-50 border-b border-blue-100">
                      <TableCell className="text-blue-900">{institucion.id}</TableCell>
                      <TableCell className="text-blue-900 font-medium">
                        <div className="max-w-xs truncate" title={institucion.nombre}>
                          {institucion.nombre || "N/A"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getTipoBadge(institucion.tipo || "universidad")}>
                          {institucion.tipo || "Universidad"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-blue-900">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-blue-500" />
                          <span className="max-w-xs truncate" title={institucion.ubicacion}>
                            {institucion.ubicacion || "N/A"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-blue-900">{institucion.director || "N/A"}</TableCell>
                      <TableCell className="text-blue-900">
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3 text-blue-500" />
                          {institucion.numero_investigadores || 0}
                        </div>
                      </TableCell>
                      <TableCell className="text-blue-900">
                        {institucion.sitio_web ? (
                          <a 
                            href={institucion.sitio_web} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                          >
                            <Globe className="h-3 w-3" />
                            Visitar
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
                            <Link href={`/instituciones/${institucion.id}`}>
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
                            <Link href={`/admin/instituciones/editar/${institucion.id}`}>
                              <Building className="mr-1 h-3 w-3" />
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
                      No hay instituciones en esta página
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Vista de cards para móvil/tablet */}
          <div className="lg:hidden space-y-4">
            {isLoading ? (
              <div className="text-center py-8 text-blue-600">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                  Cargando instituciones...
                </div>
              </div>
            ) : !Array.isArray(filteredData) || filteredData.length === 0 ? (
              <div className="text-center py-8 text-blue-600">
                {error ? "Error al cargar los datos" : "No se encontraron instituciones"}
              </div>
            ) : currentItems.length > 0 ? (
              currentItems.map((institucion) => (
                <Card key={institucion.id} className="bg-white border-blue-100">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-blue-900 flex-1">{institucion.nombre || "N/A"}</h3>
                        <Badge className={getTipoBadge(institucion.tipo || "universidad")}>
                          {institucion.tipo || "Universidad"}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm text-blue-700">
                        {institucion.ubicacion && (
                          <p className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{institucion.ubicacion}</span>
                          </p>
                        )}
                        {institucion.director && (
                          <p><span className="font-medium">Director:</span> {institucion.director}</p>
                        )}
                        {institucion.numero_investigadores !== undefined && (
                          <p className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>{institucion.numero_investigadores} investigadores</span>
                          </p>
                        )}
                        {institucion.sitio_web && (
                          <p>
                            <span className="font-medium">Web:</span>{" "}
                            <a 
                              href={institucion.sitio_web} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                            >
                              Visitar sitio
                              <Globe className="h-3 w-3" />
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
                          <Link href={`/instituciones/${institucion.id}`}>
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
                          <Link href={`/admin/instituciones/editar/${institucion.id}`}>
                            <Building className="mr-2 h-4 w-4" />
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
                No hay instituciones en esta página
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
        dataType="instituciones"
        data={filteredData}
        filename="instituciones"
        title="Exportar Instituciones"
        description="Selecciona los campos que deseas incluir en la exportación"
      />
    </div>
  )
}
