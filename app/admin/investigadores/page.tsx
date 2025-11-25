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
import { ArrowLeft, Download, Eye, Filter, Search, UserCog, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { ExportDialog } from "@/components/export-dialog"
import { InvestigadoresFiltrosAvanzados, type FiltrosInvestigador } from "@/components/investigadores-filtros-avanzados"
import { getParametrosSNII, compararConParametros } from "@/lib/snii-parametros"

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
  // Campos para evaluación SNII
  area_investigacion?: string
  nivel_investigador?: string
  articulos_publicados?: string | number
  libros_publicados?: string | number
  capitulos_publicados?: string | number
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
  const [filtrosAvanzados, setFiltrosAvanzados] = useState<FiltrosInvestigador>({})

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

  // Calcular estado de un investigador vs parámetros SNII
  const calcularEstadoInvestigador = (inv: Investigador): "bajo" | "medio" | "alto" | "sin_datos" => {
    if (!inv.area || !inv.nivel) return "sin_datos"
    
    const areaId = mapearAreaAId(inv.area)
    const nivelId = mapearNivelAId(inv.nivel)
    
    if (!areaId || !nivelId) return "sin_datos"
    
    const parametros = getParametrosSNII(areaId, nivelId)
    if (!parametros) return "sin_datos"
    
    // Usar los campos que existan en el investigador
    const articulos = parseInt(String(inv.articulos_publicados || 0)) || 0
    
    const estadoArticulos = compararConParametros(articulos, parametros.articulos)
    
    // Por simplicidad, basamos el estado general en los artículos
    // (puedes hacerlo más complejo si tienes más datos)
    return estadoArticulos
  }

  // Función auxiliar para mapear área a ID
  const mapearAreaAId = (area: string): string | null => {
    if (!area) return null
    const areaLower = area.toLowerCase()
    
    if (areaLower.includes("físico") || areaLower.includes("matemáticas")) return "area1"
    if (areaLower.includes("biología") || areaLower.includes("química")) return "area2"
    if (areaLower.includes("medicina") || areaLower.includes("salud")) return "area3"
    if (areaLower.includes("conducta") || areaLower.includes("educación")) return "area4"
    if (areaLower.includes("humanidades")) return "area5"
    if (areaLower.includes("sociales")) return "area6"
    if (areaLower.includes("agricultura") || areaLower.includes("agropecuarias")) return "area7"
    if (areaLower.includes("ingenierías") || areaLower.includes("tecnológico")) return "area8"
    if (areaLower.includes("interdisciplinaria")) return "area9"
    
    return null
  }

  // Función auxiliar para mapear nivel a ID
  const mapearNivelAId = (nivel: string): string | null => {
    if (!nivel) return null
    const nivelLower = nivel.toLowerCase()
    
    if (nivelLower.includes("candidato")) return "candidato"
    if (nivelLower.includes("snii iii") || nivelLower.includes("nivel 3")) return "nivel3"
    if (nivelLower.includes("snii ii") || nivelLower.includes("nivel 2")) return "nivel2"
    if (nivelLower.includes("snii i") || nivelLower.includes("nivel 1")) return "nivel1"
    
    return null
  }

  // Filtrar datos basados en el término de búsqueda y filtros avanzados
  const handleSearch = () => {
    if (!Array.isArray(investigadores)) return
    
    let filtered = investigadores.filter(
      (investigador) =>
        (investigador.nombre || investigador.nombre_completo)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (investigador.email || investigador.correo)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (investigador.institucion && investigador.institucion.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (investigador.area && investigador.area.toLowerCase().includes(searchTerm.toLowerCase())),
    )

    // Aplicar filtros avanzados
    if (filtrosAvanzados.area) {
      filtered = filtered.filter(inv => 
        (inv.area || inv.area_investigacion || "").toLowerCase().includes(filtrosAvanzados.area!.toLowerCase())
      )
    }

    if (filtrosAvanzados.nivel) {
      filtered = filtered.filter(inv => 
        (inv.nivel || inv.nivel_investigador || "").toLowerCase().includes(filtrosAvanzados.nivel!.toLowerCase())
      )
    }

    if (filtrosAvanzados.estado) {
      filtered = filtered.filter(inv => {
        const estado = calcularEstadoInvestigador(inv)
        return estado === filtrosAvanzados.estado
      })
    }

    setFilteredData(filtered)
    setCurrentPage(1)
  }

  // Búsqueda automática cuando cambia el término de búsqueda o filtros
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch()
    }, 300) // Debounce de 300ms

    return () => clearTimeout(timeoutId)
  }, [searchTerm, investigadores, filtrosAvanzados])

  // Calcular índices para paginación
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = Array.isArray(filteredData) ? filteredData.slice(indexOfFirstItem, indexOfLastItem) : []

  // Cambiar página
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  // Renderizar badge de estado SNII
  const renderEstadoBadge = (investigador: Investigador) => {
    const estado = calcularEstadoInvestigador(investigador)
    
    if (estado === "sin_datos") {
      return null // No mostrar badge si no hay datos
    }

    const badgeConfig = {
      alto: {
        icon: TrendingUp,
        className: "bg-green-100 text-green-700 border-green-200",
        texto: "Por encima"
      },
      medio: {
        icon: Minus,
        className: "bg-yellow-100 text-yellow-700 border-yellow-200",
        texto: "En rango"
      },
      bajo: {
        icon: TrendingDown,
        className: "bg-red-100 text-red-700 border-red-200",
        texto: "Por debajo"
      }
    }

    const config = badgeConfig[estado]
    const Icon = config.icon

    return (
      <Badge variant="outline" className={`${config.className} flex items-center gap-1 text-xs`}>
        <Icon className="h-3 w-3" />
        <span>{config.texto}</span>
      </Badge>
    )
  }

  return (
    <div className="w-full">
      <div className="w-full py-6 md:py-8 px-4 md:px-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
        <Button variant="ghost" size="sm" asChild className="text-gray-700 hover:bg-gray-100 hover:text-blue-600">
          <Link href="/admin">
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Volver al panel</span>
            <span className="sm:hidden">Volver</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Administración de Investigadores
          </h1>
          <p className="text-sm text-gray-600 mt-1">Gestiona los perfiles de investigadores registrados</p>
        </div>
      </div>

      {error && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6">
          <p>{error}</p>
        </div>
      )}

      <Card className="bg-white border-0 shadow-md mb-8 w-full">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-gray-900">Investigadores Registrados</CardTitle>
          <CardDescription className="text-gray-500">
            Gestiona los perfiles de investigadores registrados en la plataforma SECCTI
          </CardDescription>
        </CardHeader>
        <CardContent className="w-full p-0 md:p-6">
          <div className="flex flex-col md:flex-row gap-3 md:gap-4 mb-6 px-4 md:px-0 pt-4 md:pt-0">
            <div className="flex-1 flex flex-col sm:flex-row gap-2">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Buscar por nombre, correo..."
                  className="pl-10 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 text-sm focus:border-blue-500 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <Button 
                onClick={handleSearch} 
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all"
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
                  className="border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  Limpiar
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <InvestigadoresFiltrosAvanzados
                onFiltrosChange={setFiltrosAvanzados}
                filtrosActivos={filtrosAvanzados}
              />
              <Button
                variant="outline"
                size="sm"
                className="border-gray-200 text-gray-700 hover:bg-gray-50 bg-white shadow-sm hover:shadow-md transition-all flex-1 sm:flex-initial"
                onClick={() => setExportDialogOpen(true)}
              >
                <Download className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Exportar</span>
              </Button>
              <Button 
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all flex-1 sm:flex-initial" 
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
          <div className="hidden lg:block w-full -mx-4 md:mx-0">
            <div className="rounded-lg border border-gray-200 overflow-x-auto w-full shadow-sm">
              <Table className="w-full min-w-full">
                <TableHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <TableRow className="hover:bg-gray-50 border-b border-gray-200">
                  <TableHead className="text-gray-700 font-semibold">Foto</TableHead>
                  <TableHead className="text-gray-700 font-semibold">ID</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Nombre Completo</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Correo</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Institución</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Teléfono</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Rol</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Estado SNII</TableHead>
                  <TableHead className="text-gray-700 font-semibold">Fecha Registro</TableHead>
                  <TableHead className="text-gray-700 font-semibold text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-blue-600">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                        Cargando investigadores...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : !Array.isArray(filteredData) || filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-blue-600">
                      {error ? "Error al cargar los datos" : "No se encontraron investigadores"}
                    </TableCell>
                  </TableRow>
                ) : currentItems.length > 0 ? (
                  currentItems.map((investigador) => (
                    <TableRow key={investigador.id} className="hover:bg-gray-50 border-b border-gray-100 transition-colors">
                      <TableCell>
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={(investigador.fotografiaUrl || investigador.fotografia_url) || "/placeholder-user.jpg"} alt={investigador.nombre || investigador.nombre_completo} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm">
                            {(investigador.nombre || investigador.nombre_completo)
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2) || "IN"}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="text-gray-900">{investigador.id}</TableCell>
                      <TableCell className="text-gray-900 font-medium">
                        {investigador.nombre || investigador.nombre_completo || "N/A"}
                      </TableCell>
                      <TableCell className="text-gray-700">{investigador.email || investigador.correo || "N/A"}</TableCell>
                      <TableCell className="text-gray-700">{investigador.institucion || "N/A"}</TableCell>
                      <TableCell className="text-gray-700">{investigador.telefono || "N/A"}</TableCell>
                      <TableCell>
                        {investigador.is_admin ? (
                          <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0">
                            Admin
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-gray-200 text-gray-700">
                            Usuario
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {renderEstadoBadge(investigador)}
                      </TableCell>
                      <TableCell className="text-gray-700">
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
                    <TableCell colSpan={10} className="text-center py-8 text-blue-600">
                      {investigadores.length === 0
                        ? "No hay investigadores registrados en la plataforma."
                        : "No se encontraron investigadores con los criterios de búsqueda."}
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
                          {renderEstadoBadge(investigador) && (
                            <div className="pt-2">
                              <span className="font-medium">Estado SNII:</span>{" "}
                              {renderEstadoBadge(investigador)}
                            </div>
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
