"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, ArrowLeft, AlertTriangle, Building, MapPin, Mail, Phone, User, Calendar } from 'lucide-react'
import Link from "next/link"

// Interface para investigadores incompletos
interface InvestigadorIncompleto {
  id: number
  no_cvu?: string
  curp?: string
  nombre_completo: string
  rfc?: string
  correo: string
  nacionalidad?: string
  fecha_nacimiento?: string
  institucion?: string
  slug?: string
}

export default function InvestigadoresIncompletosPage() {
  const [investigadores, setInvestigadores] = useState<InvestigadorIncompleto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  // Cargar investigadores incompletos desde la API
  useEffect(() => {
    const fetchInvestigadoresIncompletos = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/investigadores/incompletos")
        if (!response.ok) {
          throw new Error("Error al cargar los investigadores incompletos")
        }
        const data = await response.json()
        
        // Convertir datos al formato esperado y generar slugs
        const investigadoresFormateados = data.map((inv: any) => ({
          ...inv,
          slug: inv.nombre_completo?.toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '-')
            .trim() || `investigador-${inv.id}`
        }))
        
        setInvestigadores(investigadoresFormateados)
      } catch (error) {
        console.error("Error al cargar investigadores incompletos:", error)
        setError("No se pudieron cargar los investigadores incompletos.")
      } finally {
        setLoading(false)
      }
    }

    fetchInvestigadoresIncompletos()
  }, [])

  // Filtrar investigadores por término de búsqueda
  const filteredInvestigadores = investigadores.filter((investigador) => {
    const searchLower = searchTerm.toLowerCase().trim()
    return searchLower === "" || (
      investigador.nombre_completo.toLowerCase().includes(searchLower) ||
      investigador.correo.toLowerCase().includes(searchLower) ||
      investigador.institucion?.toLowerCase().includes(searchLower) ||
      investigador.no_cvu?.toLowerCase().includes(searchLower)
    )
  })

  // Función para obtener campos faltantes
  const getCamposFaltantes = (investigador: InvestigadorIncompleto) => {
    const faltantes = []
    if (!investigador.curp || investigador.curp === 'NO DETECTADO' || investigador.curp === '') {
      faltantes.push('CURP')
    }
    if (!investigador.rfc || investigador.rfc === '') {
      faltantes.push('RFC')
    }
    if (!investigador.no_cvu || investigador.no_cvu === '') {
      faltantes.push('CVU')
    }
    if (!investigador.fecha_nacimiento) {
      faltantes.push('Fecha de nacimiento')
    }
    if (!investigador.institucion) {
      faltantes.push('Institución')
    }
    return faltantes
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild className="border-blue-200 text-blue-700 hover:bg-blue-50">
            <Link href="/investigadores">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a investigadores
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-blue-900">Investigadores con Datos Incompletos</h1>
            <p className="text-blue-600 mt-2">
              Estos investigadores necesitan completar su información para tener un perfil completo
            </p>
          </div>
        </div>

        {/* Búsqueda */}
        <Card className="bg-white border-blue-100">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar por nombre, correo, institución o CVU..."
                className="w-full pl-10 pr-4 py-2 border border-blue-200 rounded-lg bg-white text-blue-900 placeholder:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="pt-6 text-center">
              <AlertTriangle className="h-8 w-8 mx-auto text-orange-600 mb-2" />
              <div className="text-2xl font-bold text-orange-900">{investigadores.length}</div>
              <p className="text-sm text-orange-600">Total incompletos</p>
            </CardContent>
          </Card>
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6 text-center">
              <User className="h-8 w-8 mx-auto text-blue-600 mb-2" />
              <div className="text-2xl font-bold text-blue-900">{filteredInvestigadores.length}</div>
              <p className="text-sm text-blue-600">Mostrados</p>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6 text-center">
              <Calendar className="h-8 w-8 mx-auto text-green-600 mb-2" />
              <div className="text-2xl font-bold text-green-900">
                {investigadores.filter(inv => getCamposFaltantes(inv).length <= 2).length}
              </div>
              <p className="text-sm text-green-600">Casi completos</p>
            </CardContent>
          </Card>
        </div>

        {/* Lista de investigadores */}
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
        ) : error ? (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="pt-6 text-center py-12">
              <AlertTriangle className="h-12 w-12 mx-auto text-red-300 mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-red-900">Error al cargar datos</h3>
              <p className="text-sm text-red-600 mb-6">{error}</p>
              <Button 
                onClick={() => window.location.reload()}
                className="bg-red-700 text-white hover:bg-red-800"
              >
                Reintentar
              </Button>
            </CardContent>
          </Card>
        ) : filteredInvestigadores.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInvestigadores.map((investigador) => {
              const camposFaltantes = getCamposFaltantes(investigador)
              return (
                <Card key={investigador.id} className="h-full bg-white border-orange-100 hover:shadow-md transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src="/placeholder-user.jpg" alt={investigador.nombre_completo} />
                        <AvatarFallback className="bg-orange-100 text-orange-700">
                          {investigador.nombre_completo
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <CardTitle className="text-lg text-blue-900 line-clamp-2">
                          {investigador.nombre_completo}
                        </CardTitle>
                        <div className="flex items-center gap-1 mt-1">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              camposFaltantes.length > 3 
                                ? "border-red-200 text-red-700 bg-red-50" 
                                : camposFaltantes.length > 1 
                                ? "border-orange-200 text-orange-700 bg-orange-50"
                                : "border-yellow-200 text-yellow-700 bg-yellow-50"
                            }`}
                          >
                            {camposFaltantes.length} campo{camposFaltantes.length !== 1 ? 's' : ''} faltante{camposFaltantes.length !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-blue-600 text-sm">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{investigador.correo}</span>
                      </div>
                      {investigador.institucion && (
                        <div className="flex items-center gap-2 text-blue-600 text-sm">
                          <Building className="h-3 w-3" />
                          <span className="truncate">{investigador.institucion}</span>
                        </div>
                      )}
                      {investigador.no_cvu && (
                        <div className="flex items-center gap-2 text-blue-600 text-sm">
                          <User className="h-3 w-3" />
                          <span className="truncate">CVU: {investigador.no_cvu}</span>
                        </div>
                      )}
                    </div>

                    {/* Campos faltantes */}
                    <div className="pt-2 border-t border-blue-100">
                      <p className="text-xs text-orange-600 font-medium mb-2">Campos faltantes:</p>
                      <div className="flex flex-wrap gap-1">
                        {camposFaltantes.map((campo, index) => (
                          <Badge key={index} variant="outline" className="text-xs border-orange-200 text-orange-700">
                            {campo}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card className="bg-white border-blue-100">
            <CardContent className="pt-6 text-center py-12">
              <AlertTriangle className="h-12 w-12 mx-auto text-blue-300 mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-blue-900">
                {searchTerm ? "No se encontraron investigadores" : "No hay investigadores incompletos"}
              </h3>
              <p className="text-sm text-blue-600 mb-6">
                {searchTerm 
                  ? "Intenta ajustar el término de búsqueda para encontrar más resultados."
                  : "Todos los investigadores tienen sus datos completos."}
              </p>
              {searchTerm && (
                <Button
                  onClick={() => setSearchTerm("")}
                  className="bg-blue-700 text-white hover:bg-blue-800"
                >
                  Limpiar búsqueda
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}


