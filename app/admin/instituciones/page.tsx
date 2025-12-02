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
import { 
  ArrowLeft, Download, Eye, Filter, Search, Building, MapPin, Globe, Users, 
  CheckCircle, XCircle, Clock, Trash2, Loader2, AlertCircle
} from "lucide-react"
import { ExportDialog } from "@/components/export-dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"

// Interfaz para los datos de instituciones
interface Institucion {
  id: string
  nombre: string
  siglas?: string
  tipo?: string
  ubicacion?: string
  sitioWeb?: string
  estado: string // PENDIENTE, APROBADA, RECHAZADA
  activo: boolean
  createdAt?: string
}

export default function InstitucionesAdmin() {
  const [searchTerm, setSearchTerm] = useState("")
  const [estadoFilter, setEstadoFilter] = useState("todos")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [instituciones, setInstituciones] = useState<Institucion[]>([])
  const [filteredData, setFilteredData] = useState<Institucion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [institucionToDelete, setInstitucionToDelete] = useState<Institucion | null>(null)
  const { toast } = useToast()

  // Cargar instituciones desde la API
  const fetchInstituciones = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/instituciones?admin=true")
      if (!response.ok) {
        throw new Error("Error al cargar las instituciones")
      }
      const data = await response.json()
      const institucionesData = data.instituciones || data || []
      setInstituciones(institucionesData)
      setFilteredData(institucionesData)
    } catch (error) {
      console.error("Error al cargar instituciones:", error)
      setError("No se pudieron cargar las instituciones.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchInstituciones()
  }, [])

  // Filtrar datos basados en el término de búsqueda y estado
  useEffect(() => {
    if (!Array.isArray(instituciones)) return
    
    let filtered = instituciones

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (institucion) =>
          institucion.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          institucion.siglas?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          institucion.tipo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          institucion.ubicacion?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtrar por estado
    if (estadoFilter !== "todos") {
      filtered = filtered.filter(inst => inst.estado === estadoFilter)
    }

    setFilteredData(filtered)
    setCurrentPage(1)
  }, [searchTerm, estadoFilter, instituciones])

  // Aprobar institución
  const handleAprobar = async (id: string) => {
    setProcessingId(id)
    try {
      const response = await fetch(`/api/instituciones/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: "APROBADA", activo: true })
      })

      if (!response.ok) throw new Error("Error al aprobar")

      toast({
        title: "Institución aprobada",
        description: "La institución ha sido aprobada y ahora es visible públicamente.",
      })

      // Recargar datos
      await fetchInstituciones()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo aprobar la institución.",
        variant: "destructive"
      })
    } finally {
      setProcessingId(null)
    }
  }

  // Rechazar y eliminar institución
  const handleRechazar = async () => {
    if (!institucionToDelete) return

    setProcessingId(institucionToDelete.id)
    try {
      const response = await fetch(`/api/instituciones/${institucionToDelete.id}`, {
        method: "DELETE"
      })

      if (!response.ok) throw new Error("Error al rechazar")

      toast({
        title: "Institución rechazada",
        description: "La institución ha sido rechazada y eliminada del sistema.",
      })

      // Recargar datos
      await fetchInstituciones()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo rechazar la institución.",
        variant: "destructive"
      })
    } finally {
      setProcessingId(null)
      setDeleteDialogOpen(false)
      setInstitucionToDelete(null)
    }
  }

  // Calcular índices para paginación
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = Array.isArray(filteredData) ? filteredData.slice(indexOfFirstItem, indexOfLastItem) : []
  const totalPages = Math.ceil((filteredData?.length || 0) / itemsPerPage)

  // Contar por estado
  const pendientes = instituciones.filter(i => i.estado === "PENDIENTE").length
  const aprobadas = instituciones.filter(i => i.estado === "APROBADA").length

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "APROBADA":
        return <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="w-3 h-3 mr-1" /> Aprobada</Badge>
      case "RECHAZADA":
        return <Badge className="bg-red-100 text-red-800 border-red-200"><XCircle className="w-3 h-3 mr-1" /> Rechazada</Badge>
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200"><Clock className="w-3 h-3 mr-1" /> Pendiente</Badge>
    }
  }

  const getTipoBadge = (tipo: string) => {
    const tipos: Record<string, string> = {
      'universidad_publica': 'bg-blue-100 text-blue-800',
      'universidad_privada': 'bg-indigo-100 text-indigo-800',
      'centro_investigacion': 'bg-green-100 text-green-800',
      'instituto_tecnologico': 'bg-purple-100 text-purple-800',
      'gobierno': 'bg-orange-100 text-orange-800',
      'empresa': 'bg-gray-100 text-gray-800',
    }
    return tipos[tipo] || 'bg-gray-100 text-gray-800'
  }

  const formatTipo = (tipo: string) => {
    const labels: Record<string, string> = {
      'universidad_publica': 'Universidad Pública',
      'universidad_privada': 'Universidad Privada',
      'centro_investigacion': 'Centro de Investigación',
      'instituto_tecnologico': 'Instituto Tecnológico',
      'gobierno': 'Gobierno',
      'empresa': 'Empresa',
      'ong': 'ONG',
      'otro': 'Otro',
    }
    return labels[tipo] || tipo || 'Sin especificar'
  }

  return (
    <div className="w-full">
      <div className="w-full py-4 md:py-8 px-4 md:px-6">
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

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white border-blue-100">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600">Total</p>
                  <p className="text-2xl font-bold text-blue-900">{instituciones.length}</p>
                </div>
                <Building className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-700">Pendientes</p>
                  <p className="text-2xl font-bold text-yellow-800">{pendientes}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700">Aprobadas</p>
                  <p className="text-2xl font-bold text-green-800">{aprobadas}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700">Verificadas</p>
                  <p className="text-2xl font-bold text-blue-800">{aprobadas}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {error && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        )}

        <Card className="bg-white border-blue-100 mb-8 w-full">
          <CardHeader>
            <CardTitle className="text-blue-900">Instituciones Registradas</CardTitle>
            <CardDescription className="text-blue-600">
              Revisa y aprueba las instituciones que solicitan registro en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="w-full p-0 md:p-6">
            {/* Filtros */}
            <div className="flex flex-col md:flex-row gap-3 md:gap-4 mb-6 px-4 md:px-0 pt-4 md:pt-0">
              <div className="flex-1 flex flex-col sm:flex-row gap-2">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Buscar por nombre, siglas, tipo..."
                    className="pl-10 bg-white border-blue-200 text-blue-900 placeholder:text-blue-400 text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={estadoFilter} onValueChange={setEstadoFilter}>
                  <SelectTrigger className="w-full sm:w-[180px] bg-white border-blue-200">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los estados</SelectItem>
                    <SelectItem value="PENDIENTE">
                      <span className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-yellow-600" /> Pendientes
                      </span>
                    </SelectItem>
                    <SelectItem value="APROBADA">
                      <span className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-600" /> Aprobadas
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {(searchTerm || estadoFilter !== "todos") && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSearchTerm("")
                      setEstadoFilter("todos")
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
              </div>
            </div>

            {/* Vista de tabla para desktop */}
            <div className="hidden lg:block w-full -mx-4 md:mx-0">
              <div className="rounded-md border border-blue-100 overflow-x-auto w-full">
                <Table className="w-full min-w-full">
                  <TableHeader className="bg-blue-50">
                    <TableRow className="hover:bg-blue-50 border-b border-blue-100">
                      <TableHead className="text-blue-700">Nombre</TableHead>
                      <TableHead className="text-blue-700">Tipo</TableHead>
                      <TableHead className="text-blue-700">Ubicación</TableHead>
                      <TableHead className="text-blue-700">Estado</TableHead>
                      <TableHead className="text-blue-700">Sitio Web</TableHead>
                      <TableHead className="text-blue-700 text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-blue-600">
                          <div className="flex items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin mr-2" />
                            Cargando instituciones...
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : currentItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-blue-600">
                          No se encontraron instituciones
                        </TableCell>
                      </TableRow>
                    ) : (
                      currentItems.map((institucion) => (
                        <TableRow key={institucion.id} className="hover:bg-blue-50 border-b border-blue-100">
                          <TableCell className="text-blue-900 font-medium">
                            <div>
                              <div className="font-semibold">{institucion.nombre || "N/A"}</div>
                              {institucion.siglas && (
                                <div className="text-xs text-blue-500">{institucion.siglas}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getTipoBadge(institucion.tipo || "")}>
                              {formatTipo(institucion.tipo || "")}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-blue-900">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-blue-500" />
                              <span className="max-w-xs truncate">
                                {institucion.ubicacion || "N/A"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getEstadoBadge(institucion.estado)}
                          </TableCell>
                          <TableCell className="text-blue-900">
                            {institucion.sitioWeb ? (
                              <a 
                                href={institucion.sitioWeb} 
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
                              {institucion.estado === "PENDIENTE" && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-green-200 text-green-700 hover:bg-green-50"
                                    onClick={() => handleAprobar(institucion.id)}
                                    disabled={processingId === institucion.id}
                                  >
                                    {processingId === institucion.id ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <>
                                        <CheckCircle className="mr-1 h-3 w-3" />
                                        Aprobar
                                      </>
                                    )}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-red-200 text-red-700 hover:bg-red-50"
                                    onClick={() => {
                                      setInstitucionToDelete(institucion)
                                      setDeleteDialogOpen(true)
                                    }}
                                    disabled={processingId === institucion.id}
                                  >
                                    <XCircle className="mr-1 h-3 w-3" />
                                    Rechazar
                                  </Button>
                                </>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-blue-200 text-blue-700 hover:bg-blue-50"
                                asChild
                              >
                                <Link href={`/admin/instituciones/editar/${institucion.id}`}>
                                  <Eye className="mr-1 h-3 w-3" />
                                  Editar
                                </Link>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Vista de cards para móvil/tablet */}
            <div className="lg:hidden space-y-4 w-full px-4 md:px-0 pb-4 md:pb-0">
              {isLoading ? (
                <div className="text-center py-8 text-blue-600">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                  Cargando instituciones...
                </div>
              ) : currentItems.length === 0 ? (
                <div className="text-center py-8 text-blue-600">
                  No se encontraron instituciones
                </div>
              ) : (
                currentItems.map((institucion) => (
                  <Card key={institucion.id} className="bg-white border-blue-100 w-full">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-blue-900">{institucion.nombre || "N/A"}</h3>
                            {institucion.siglas && (
                              <p className="text-xs text-blue-500">{institucion.siglas}</p>
                            )}
                          </div>
                          {getEstadoBadge(institucion.estado)}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge className={getTipoBadge(institucion.tipo || "")}>
                            {formatTipo(institucion.tipo || "")}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-sm text-blue-700">
                          {institucion.ubicacion && (
                            <p className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>{institucion.ubicacion}</span>
                            </p>
                          )}
                          {institucion.sitioWeb && (
                            <p>
                              <a 
                                href={institucion.sitioWeb} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                              >
                                <Globe className="h-3 w-3" />
                                Visitar sitio web
                              </a>
                            </p>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 mt-4">
                          {institucion.estado === "PENDIENTE" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 border-green-200 text-green-700 hover:bg-green-50"
                                onClick={() => handleAprobar(institucion.id)}
                                disabled={processingId === institucion.id}
                              >
                                {processingId === institucion.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Aprobar
                                  </>
                                )}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 border-red-200 text-red-700 hover:bg-red-50"
                                onClick={() => {
                                  setInstitucionToDelete(institucion)
                                  setDeleteDialogOpen(true)
                                }}
                                disabled={processingId === institucion.id}
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Rechazar
                              </Button>
                            </>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className={`${institucion.estado === "PENDIENTE" ? "" : "flex-1"} border-blue-200 text-blue-700 hover:bg-blue-50`}
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
              )}
            </div>

            {/* Paginación */}
            {filteredData.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 px-4 md:px-0">
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
                  <p className="text-xs sm:text-sm text-blue-600 ml-2">
                    Mostrando {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredData.length)} de {filteredData.length}
                  </p>
                </div>

                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          if (currentPage > 1) setCurrentPage(currentPage - 1)
                        }}
                        className={`${currentPage === 1 ? "pointer-events-none opacity-50" : ""} text-blue-700 hover:bg-blue-50`}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }).map((_, index) => {
                      if (
                        index === 0 ||
                        index === totalPages - 1 ||
                        (index >= currentPage - 2 && index <= currentPage)
                      ) {
                        return (
                          <PaginationItem key={index}>
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault()
                                setCurrentPage(index + 1)
                              }}
                              isActive={currentPage === index + 1}
                              className="text-blue-700 hover:bg-blue-50"
                            >
                              {index + 1}
                            </PaginationLink>
                          </PaginationItem>
                        )
                      } else if (index === 1 || index === totalPages - 2) {
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
                          if (currentPage < totalPages) setCurrentPage(currentPage + 1)
                        }}
                        className={`${currentPage === totalPages ? "pointer-events-none opacity-50" : ""} text-blue-700 hover:bg-blue-50`}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
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

        {/* Dialog de confirmación para rechazar */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-red-700">¿Rechazar institución?</AlertDialogTitle>
              <AlertDialogDescription>
                Estás a punto de rechazar y eliminar la institución <strong>"{institucionToDelete?.nombre}"</strong>.
                <br /><br />
                Esta acción es irreversible. La institución será eliminada permanentemente del sistema.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleRechazar}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Rechazar y Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
