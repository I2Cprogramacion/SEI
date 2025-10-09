"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Building, MapPin, Phone, Filter } from "lucide-react"
import Link from "next/link"
import { AnimatedCard } from "@/components/ui/animated-card"
import { AnimatedBadge } from "@/components/ui/animated-badge"

interface Investigador {
  id: number
  nombre: string
  email: string
  fotografiaUrl?: string
  institucion?: string
  area?: string
  ultimoGradoEstudios?: string
  nivel?: string
  estadoNacimiento?: string
  entidadFederativa?: string
  telefono?: string
  lineaInvestigacion?: string
  slug: string
}

export default function InvestigadoresPage() {
  const [investigadores, setInvestigadores] = useState<Investigador[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedField, setSelectedField] = useState("all")
  const [selectedInstitution, setSelectedInstitution] = useState("all")
  const [selectedLocation, setSelectedLocation] = useState("all")

  // Estados para filtros
  const [areas, setAreas] = useState<string[]>([])
  const [instituciones, setInstituciones] = useState<string[]>([])
  const [ubicaciones, setUbicaciones] = useState<string[]>([])

  // Cargar investigadores
  useEffect(() => {
    const fetchInvestigadores = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/investigadores')
        const data = await response.json()
        
        if (response.ok) {
          const investigadoresList = data.investigadores || []
          setInvestigadores(investigadoresList)
        } else {
          console.error("Error fetching investigadores:", data.error)
          setInvestigadores([])
        }
      } catch (error) {
        console.error("Error fetching investigadores:", error)
        setInvestigadores([])
      } finally {
        setLoading(false)
      }
    }

    fetchInvestigadores()
  }, [])

  // Cargar opciones de filtros
  useEffect(() => {
    const fetchFiltros = async () => {
      try {
        const response = await fetch('/api/investigadores')
        const data = await response.json()
        
        if (response.ok && data.filtros) {
          setAreas(data.filtros.areas || [])
          setInstituciones(data.filtros.instituciones || [])
          setUbicaciones(data.filtros.ubicaciones || [])
        }
      } catch (error) {
        console.error("Error fetching filtros:", error)
      }
    }

    fetchFiltros()
  }, [])

  // Filtrar investigadores - SIMPLIFICADO: Solo validar datos esenciales
  const filteredInvestigadores = investigadores.filter((investigador) => {
    // SOLO validar que tenga los datos MÍNIMOS ESENCIALES (id, nombre, email)
    const hasBasicData = investigador.id && investigador.nombre && investigador.email
    
    if (!hasBasicData) {
      return false
    }

    // Si no hay término de búsqueda ni filtros activos, MOSTRAR TODOS
    if (!searchTerm && selectedField === "all" && selectedInstitution === "all" && selectedLocation === "all") {
      return true
    }

    // Aplicar búsqueda si hay término
    if (searchTerm) {
      const matchesSearch =
        (investigador.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (investigador.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (investigador.area || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (investigador.institucion || '').toLowerCase().includes(searchTerm.toLowerCase())
      
      if (!matchesSearch) {
        return false
      }
    }

    // Aplicar filtros de área
    if (selectedField !== "all") {
      if (!investigador.area || investigador.area !== selectedField) {
        return false
      }
    }

    if (selectedInstitution !== "all") {
      if (!investigador.institucion || investigador.institucion !== selectedInstitution) {
        return false
      }
    }

    if (selectedLocation !== "all") {
      const hasLocation = investigador.estadoNacimiento === selectedLocation || investigador.entidadFederativa === selectedLocation
      if (!hasLocation) {
        return false
      }
    }

    return true
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <AnimatedCard className="bg-white border-blue-100 mb-8" delay={100}>
          <CardContent className="pt-6">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-blue-900 mb-4">
                Investigadores
              </h1>
              <p className="text-blue-600 text-lg mb-6">
                Descubre a los investigadores registrados en nuestra plataforma
              </p>
              
              {/* Barra de búsqueda */}
              <div className="relative max-w-md mx-auto mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Buscar investigadores..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-blue-200 focus:border-blue-400"
                />
              </div>

              {/* Filtros */}
              <div className="flex flex-wrap gap-4 justify-center">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-blue-500" />
                  <select
                    value={selectedField}
                    onChange={(e) => setSelectedField(e.target.value)}
                    className="px-3 py-1 border border-blue-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="all">Todas las áreas</option>
                    {areas.map((area) => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
                </div>

                <select
                  value={selectedInstitution}
                  onChange={(e) => setSelectedInstitution(e.target.value)}
                  className="px-3 py-1 border border-blue-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="all">Todas las instituciones</option>
                  {instituciones.map((institucion) => (
                    <option key={institucion} value={institucion}>{institucion}</option>
                  ))}
                </select>

                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="px-3 py-1 border border-blue-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="all">Todas las ubicaciones</option>
                  {ubicaciones.map((ubicacion) => (
                    <option key={ubicacion} value={ubicacion}>{ubicacion}</option>
                  ))}
                </select>
              </div>

              {/* Estadísticas */}
              <div className="mt-6 flex justify-center gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-900">{investigadores.length}</p>
                  <p className="text-sm text-blue-600">Total</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-900">{filteredInvestigadores.length}</p>
                  <p className="text-sm text-blue-600">Mostrando</p>
                </div>
              </div>
            </div>
          </CardContent>
        </AnimatedCard>

        {/* Grid de investigadores */}
        <div className="space-y-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="h-full bg-white border-blue-100">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center animate-pulse">
                      <div className="h-24 w-24 bg-blue-100 rounded-full mb-4"></div>
                      <div className="h-4 bg-blue-100 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-blue-100 rounded w-1/2 mb-4"></div>
                      <div className="h-6 bg-blue-100 rounded w-1/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredInvestigadores.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredInvestigadores.map((investigador, index) => (
                <Link href={`/investigadores/${investigador.slug}`} key={investigador.id}>
                  <AnimatedCard className="h-full bg-white border-blue-100 cursor-pointer hover:shadow-lg transition-shadow" delay={index * 100}>
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center">
                        <Avatar className="h-24 w-24 mb-4">
                          <AvatarImage 
                            src={investigador.fotografiaUrl && investigador.fotografiaUrl.includes('/image/upload/') && investigador.fotografiaUrl.length > 50 
                              ? investigador.fotografiaUrl 
                              : "/placeholder.svg"} 
                            alt={investigador.nombre}
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg"
                            }}
                          />
                          <AvatarFallback className="bg-blue-100 text-blue-700">
                            {investigador.nombre
                              ?.split(" ")
                              ?.map((n) => n[0])
                              ?.join("")
                              ?.toUpperCase()
                              ?.slice(0, 2) || "??"}
                          </AvatarFallback>
                        </Avatar>
                        <h3 className="font-bold text-blue-900 mb-1">{investigador.nombre || 'Sin nombre'}</h3>
                        <p className="text-blue-600 text-sm mb-2">
                          {investigador.ultimoGradoEstudios || investigador.nivel || 'Investigador'}
                        </p>
                        {investigador.area && (
                          <AnimatedBadge variant="secondary" className="mb-3 bg-blue-50 text-blue-700">
                            {investigador.area}
                          </AnimatedBadge>
                        )}

                        <div className="w-full space-y-2 text-sm">
                          <div className="flex items-center justify-center gap-1 text-blue-600">
                            <Building className="h-3 w-3" />
                            <span className="text-xs">{investigador.institucion || 'Sin institución'}</span>
                          </div>
                          
                          {(investigador.estadoNacimiento || investigador.entidadFederativa) && (
                            <div className="flex items-center justify-center gap-1 text-blue-600">
                              <MapPin className="h-3 w-3" />
                              <span className="text-xs">{investigador.estadoNacimiento || investigador.entidadFederativa}</span>
                            </div>
                          )}

                          {investigador.telefono && (
                            <div className="flex items-center justify-center gap-1 text-blue-600">
                              <Phone className="h-3 w-3" />
                              <span className="text-xs">{investigador.telefono}</span>
                            </div>
                          )}
                        </div>

                        {investigador.lineaInvestigacion && (
                          <div className="w-full mt-4">
                            <div className="flex flex-wrap gap-1 justify-center">
                              <AnimatedBadge variant="outline" interactive className="text-xs border-blue-200 text-blue-700">
                                {investigador.lineaInvestigacion}
                              </AnimatedBadge>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="border-t border-blue-100 flex justify-center py-3">
                      <div className="text-center">
                        <p className="text-xs text-blue-600">{investigador.email || 'Sin email'}</p>
                      </div>
                    </CardFooter>
                  </AnimatedCard>
                </Link>
              ))}
            </div>
          ) : (
            <AnimatedCard className="bg-white border-blue-100" delay={500}>
              <CardContent className="pt-6 text-center py-12">
                <Search className="h-12 w-12 mx-auto text-blue-300 mb-4 animate-float" />
                <h3 className="text-lg font-semibold mb-2 text-blue-900">No se encontraron investigadores</h3>
                <p className="text-sm text-blue-600 mb-6">
                  {investigadores.length === 0
                    ? "No hay investigadores registrados aún."
                    : "Intenta ajustar los filtros de búsqueda."}
                </p>
                {(searchTerm || selectedField !== "all" || selectedInstitution !== "all" || selectedLocation !== "all") && (
                  <Button
                    onClick={() => {
                      setSearchTerm("")
                      setSelectedField("all")
                      setSelectedInstitution("all")
                      setSelectedLocation("all")
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Limpiar filtros
                  </Button>
                )}
              </CardContent>
            </AnimatedCard>
          )}
        </div>
      </div>
    </div>
  )
}