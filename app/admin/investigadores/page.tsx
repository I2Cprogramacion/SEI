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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Download, Eye, Filter, Search, UserCog } from "lucide-react"
import { ExportDialog } from "@/components/export-dialog"

// Interfaz para los datos de investigadores (ajustada al API)
interface Investigador {
  id: number
  nombre: string
  email: string
  fotografiaUrl?: string
  institucion?: string
  telefono?: string
  area?: string
  ultimoGradoEstudios?: string
  lineaInvestigacion?: string
  curp?: string
  rfc?: string
  noCvu?: string
  nacionalidad?: string
  fechaNacimiento?: string
  estadoNacimiento?: string
  entidadFederativa?: string
  municipio?: string
  empleoActual?: string
  orcid?: string
  nivel?: string
  slug: string
  // Campos adicionales para compatibilidad
  nombre_completo?: string
  correo?: string
  fotografia_url?: string
  fecha_registro?: string
  is_admin?: boolean
}

export default function InvestigadoresAdmin() {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [investigadores, setInvestigadores] = useState<Investigador[]>([])
  const [filteredData, setFilteredData] = useState<Investigador[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [exportDialogOpen, setExportDialogOpen] = useState(false)

  // Cargar investigadores desde la API
  useEffect(() => {
    const fetchInvestigadores = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/investigadores")
        if (!response.ok) {
          throw new Error("Error al cargar los investigadores")
        }
        const data = await response.json()
        console.log("Datos recibidos de la API:", data)
        // La API devuelve { investigadores: [...] } o un array directo
        const investigadoresData = data.investigadores || data || []
        console.log("Datos procesados:", investigadoresData)
        setInvestigadores(investigadoresData)
        setFilteredData(investigadoresData)
      } catch (error) {
        console.error("Error al cargar investigadores:", error)
        setError("No se pudieron cargar los investigadores.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchInvestigadores()
  }, [])

  // Filtrar datos basados en el término de búsqueda
  const handleSearch = () => {
    if (!Array.isArray(investigadores)) return
    
    const filtered = investigadores.filter(
      (investigador) =>
        (investigador.nombre || investigador.nombre_completo)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (investigador.email || investigador.correo)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (investigador.institucion && investigador.institucion.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (investigador.area && investigador.area.toLowerCase().includes(searchTerm.toLowerCase())),
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
  }, [searchTerm, investigadores])

  // Calcular índices para paginación
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = Array.isArray(filteredData) ? filteredData.slice(indexOfFirstItem, indexOfLastItem) : []

  // Cambiar página
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="container mx-auto py-4 md:py-8 px-3 sm:px-4 md:px-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" asChild className="text-blue-700 hover:bg-blue-50">
          <Link href="/admin">
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Volver al panel</span>
            <span className="sm:hidden">Volver</span>
          </Link>
        </Button>
        <h1 className="text-xl sm:text-2xl font-bold text-blue-900">Administración de Investigadores</h1>
      </div>

      {error && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6">
          <p>{error}</p>
        </div>
      )}

      <Card className="bg-white border-blue-100 mb-8 w-full">
        <CardHeader>
          <CardTitle className="text-blue-900">Investigadores Registrados</CardTitle>
          <CardDescription className="text-blue-600">
            Gestiona los perfiles de investigadores registrados en la plataforma SECCTI
          </CardDescription>
        </CardHeader>
        <CardContent className="w-full">
          <div className="flex flex-col md:flex-row gap-3 md:gap-4 mb-6">
            <div className="flex-1 flex flex-col sm:flex-row gap-2">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Buscar por nombre, correo..."
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
                    setFilteredData(investigadores)
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
                <Link href="/investigadores/nuevo-perfil">
                  <UserCog className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Nuevo Investigador</span>
                  <span className="sm:hidden">Nuevo</span>
                </Link>
              </Button>
            </div>
          </div>

          {/* Vista de tabla para desktop */}
          <div className="hidden lg:block rounded-md border border-blue-100 overflow-x-auto w-full">
            <Table className="w-full">
              <TableHeader className="bg-blue-50">
                <TableRow className="hover:bg-blue-50 border-b border-blue-100">
                  <TableHead className="text-blue-700">Foto</TableHead>
                  <TableHead className="text-blue-700">ID</TableHead>
                  <TableHead className="text-blue-700">Nombre Completo</TableHead>
                  <TableHead className="text-blue-700">Correo</TableHead>
                  <TableHead className="text-blue-700">Institución</TableHead>
                  <TableHead className="text-blue-700">Teléfono</TableHead>
                  <TableHead className="text-blue-700">Rol</TableHead>
                  <TableHead className="text-blue-700">Fecha Registro</TableHead>
                  <TableHead className="text-blue-700 text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-blue-600">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                        Cargando investigadores...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : !Array.isArray(filteredData) || filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-blue-600">
                      {error ? "Error al cargar los datos" : "No se encontraron investigadores"}
                    </TableCell>
                  </TableRow>
                ) : currentItems.length > 0 ? (
                  currentItems.map((investigador) => (
                    <TableRow key={investigador.id} className="hover:bg-blue-50 border-b border-blue-100">
                      <TableCell>
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={(investigador.fotografiaUrl || investigador.fotografia_url) || "/placeholder-user.jpg"} alt={investigador.nombre || investigador.nombre_completo} />
                          <AvatarFallback className="bg-blue-100 text-blue-700 text-sm">
                            {(investigador.nombre || investigador.nombre_completo)
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2) || "IN"}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="text-blue-900">{investigador.id}</TableCell>
                      <TableCell className="text-blue-900 font-medium">
                        {investigador.nombre || investigador.nombre_completo || "N/A"}
                      </TableCell>
                      <TableCell className="text-blue-900">{investigador.email || investigador.correo || "N/A"}</TableCell>
                      <TableCell className="text-blue-900">{investigador.institucion || "N/A"}</TableCell>
                      <TableCell className="text-blue-900">{investigador.telefono || "N/A"}</TableCell>
                      <TableCell className="text-blue-900">
                        {investigador.is_admin ? (
                          <Badge className="bg-red-600 text-white">
                            Admin
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-blue-200 text-blue-700">
                            Usuario
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-blue-900">
                        {investigador.fecha_registro 
                          ? new Date(investigador.fecha_registro).toLocaleDateString('es-ES')
                          : "N/A"
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-700 hover:bg-blue-50"
                            asChild
                          >
                            <Link href={`/investigadores/${investigador.slug || investigador.id}`}>
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">Ver perfil</span>
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-700 hover:bg-blue-50"
                            asChild
                          >
                            <Link href={`/admin/investigadores/editar/${investigador.id}`}>
                              <UserCog className="h-4 w-4" />
                              <span className="sr-only">Editar investigador</span>
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-blue-600">
                      {investigadores.length === 0
                        ? "No hay investigadores registrados en la plataforma."
                        : "No se encontraron investigadores con los criterios de búsqueda."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Vista de cards para móvil/tablet */}
          <div className="lg:hidden space-y-4 w-full">
            {isLoading ? (
              <div className="text-center py-8 text-blue-600">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                  Cargando investigadores...
                </div>
              </div>
            ) : !Array.isArray(filteredData) || filteredData.length === 0 ? (
              <div className="text-center py-8 text-blue-600">
                {error ? "Error al cargar los datos" : "No se encontraron investigadores"}
              </div>
            ) : currentItems.length > 0 ? (
              currentItems.map((investigador) => (
                <Card key={investigador.id} className="bg-white border-blue-100 w-full">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={(investigador.fotografiaUrl || investigador.fotografia_url) || "/placeholder-user.jpg"} alt={investigador.nombre || investigador.nombre_completo} />
                        <AvatarFallback className="bg-blue-100 text-blue-700">
                          {(investigador.nombre || investigador.nombre_completo)
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2) || "IN"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-blue-900 truncate">
                              {investigador.nombre || investigador.nombre_completo || "N/A"}
                            </h3>
                            <p className="text-sm text-blue-600 truncate">{investigador.email || investigador.correo || "N/A"}</p>
                          </div>
                          {investigador.is_admin ? (
                            <Badge className="bg-red-600 text-white flex-shrink-0">
                              Admin
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-blue-200 text-blue-700 flex-shrink-0">
                              Usuario
                            </Badge>
                          )}
                        </div>
                        <div className="space-y-1 text-sm text-blue-700">
                          <p><span className="font-medium">Institución:</span> {investigador.institucion || "N/A"}</p>
                          {investigador.telefono && (
                            <p><span className="font-medium">Teléfono:</span> {investigador.telefono}</p>
                          )}
                          {investigador.fecha_registro && (
                            <p><span className="font-medium">Registro:</span> {new Date(investigador.fecha_registro).toLocaleDateString('es-ES')}</p>
                          )}
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50"
                            asChild
                          >
                            <Link href={`/investigadores/${investigador.slug || investigador.id}`}>
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
                            <Link href={`/admin/investigadores/editar/${investigador.id}`}>
                              <UserCog className="mr-2 h-4 w-4" />
                              Editar
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-blue-600">
                {investigadores.length === 0
                  ? "No hay investigadores registrados en la plataforma."
                  : "No se encontraron investigadores con los criterios de búsqueda."}
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm text-blue-600 hidden sm:inline">Mostrar</p>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => {
                  setItemsPerPage(Number.parseInt(value))
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className="w-[70px] bg-white border-blue-200 text-blue-900">
                  <SelectValue placeholder="5" />
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
                            className={`${
                              currentPage === index + 1 ? "bg-blue-700 text-white" : "text-blue-700 hover:bg-blue-50"
                            }`}
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

      {/* Diálogo de exportación */}
      <ExportDialog
        title="Exportar Investigadores"
        description="Selecciona el formato y los campos que deseas exportar."
        dataType="investigadores"
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
      />
      </div>
    </div>
  )
}
