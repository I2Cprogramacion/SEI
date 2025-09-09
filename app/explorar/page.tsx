"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Users, FileText, Building, GraduationCap, TrendingUp, Award, Globe } from "lucide-react"
import { SearchBar } from "@/components/search-bar"

// Interfaces para tipos de datos
interface Estadisticas {
  investigadores: number
  proyectos: number
  publicaciones: number
  instituciones: number
  colaboraciones: number
  areas: number
}

interface AreaPopular {
  nombre: string
  investigadores: number
  proyectos: number
  color: string
}

interface InstitucionDestacada {
  nombre: string
  investigadores: number
  proyectos: number
  areas: string[]
}

export default function ExplorarPage() {
  const [estadisticas, setEstadisticas] = useState<Estadisticas>({
    investigadores: 0,
    proyectos: 0,
    publicaciones: 0,
    instituciones: 0,
    colaboraciones: 0,
    areas: 0,
  })
  const [areasPopulares, setAreasPopulares] = useState<AreaPopular[]>([])
  const [institucionesDestacadas, setInstitucionesDestacadas] = useState<InstitucionDestacada[]>([])
  const [loading, setLoading] = useState(true)

  // TODO: Conectar con APIs reales
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // const [statsResponse, areasResponse, institutionsResponse] = await Promise.all([
        //   fetch('/api/estadisticas'),
        //   fetch('/api/areas-populares'),
        //   fetch('/api/instituciones-destacadas')
        // ])

        // const stats = await statsResponse.json()
        // const areas = await areasResponse.json()
        // const institutions = await institutionsResponse.json()

        // setEstadisticas(stats)
        // setAreasPopulares(areas)
        // setInstitucionesDestacadas(institutions)

        // Por ahora, datos vacíos
        setEstadisticas({
          investigadores: 0,
          proyectos: 0,
          publicaciones: 0,
          instituciones: 0,
          colaboraciones: 0,
          areas: 0,
        })
        setAreasPopulares([])
        setInstitucionesDestacadas([])
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-blue-900">Explora la Investigación en Chihuahua</h1>
          <p className="text-xl text-blue-600 max-w-3xl mx-auto">
            Descubre investigadores, proyectos, publicaciones e instituciones que están impulsando la ciencia y
            tecnología en el estado
          </p>
        </div>

        {/* Barra de búsqueda */}
        <div className="bg-blue-50 rounded-xl px-6 py-8">
          <SearchBar />
        </div>

        {/* Estadísticas generales */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="bg-white border-blue-100 text-center">
            <CardContent className="pt-6">
              <Users className="h-8 w-8 mx-auto text-blue-600 mb-2" />
              <div className="text-2xl font-bold text-blue-900">{loading ? "..." : estadisticas.investigadores}</div>
              <p className="text-sm text-blue-600">Investigadores</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-blue-100 text-center">
            <CardContent className="pt-6">
              <FileText className="h-8 w-8 mx-auto text-blue-600 mb-2" />
              <div className="text-2xl font-bold text-blue-900">{loading ? "..." : estadisticas.proyectos}</div>
              <p className="text-sm text-blue-600">Proyectos</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-blue-100 text-center">
            <CardContent className="pt-6">
              <Award className="h-8 w-8 mx-auto text-blue-600 mb-2" />
              <div className="text-2xl font-bold text-blue-900">{loading ? "..." : estadisticas.publicaciones}</div>
              <p className="text-sm text-blue-600">Publicaciones</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-blue-100 text-center">
            <CardContent className="pt-6">
              <Building className="h-8 w-8 mx-auto text-blue-600 mb-2" />
              <div className="text-2xl font-bold text-blue-900">{loading ? "..." : estadisticas.instituciones}</div>
              <p className="text-sm text-blue-600">Instituciones</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-blue-100 text-center">
            <CardContent className="pt-6">
              <Globe className="h-8 w-8 mx-auto text-blue-600 mb-2" />
              <div className="text-2xl font-bold text-blue-900">{loading ? "..." : estadisticas.colaboraciones}</div>
              <p className="text-sm text-blue-600">Colaboraciones</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-blue-100 text-center">
            <CardContent className="pt-6">
              <GraduationCap className="h-8 w-8 mx-auto text-blue-600 mb-2" />
              <div className="text-2xl font-bold text-blue-900">{loading ? "..." : estadisticas.areas}</div>
              <p className="text-sm text-blue-600">Áreas</p>
            </CardContent>
          </Card>
        </div>

        {/* Navegación rápida */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/investigadores">
            <Card className="bg-white border-blue-100 hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <Users className="h-12 w-12 mx-auto text-blue-600 mb-2" />
                <CardTitle className="text-blue-900">Investigadores</CardTitle>
                <CardDescription className="text-blue-600">
                  Explora perfiles de investigadores destacados
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link href="/proyectos">
            <Card className="bg-white border-blue-100 hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <FileText className="h-12 w-12 mx-auto text-blue-600 mb-2" />
                <CardTitle className="text-blue-900">Proyectos</CardTitle>
                <CardDescription className="text-blue-600">
                  Descubre proyectos de investigación actuales
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link href="/publicaciones">
            <Card className="bg-white border-blue-100 hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <Award className="h-12 w-12 mx-auto text-blue-600 mb-2" />
                <CardTitle className="text-blue-900">Publicaciones</CardTitle>
                <CardDescription className="text-blue-600">Accede a publicaciones científicas</CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link href="/instituciones">
            <Card className="bg-white border-blue-100 hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <Building className="h-12 w-12 mx-auto text-blue-600 mb-2" />
                <CardTitle className="text-blue-900">Instituciones</CardTitle>
                <CardDescription className="text-blue-600">Conoce las instituciones de investigación</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>

        {/* Áreas de investigación populares */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-blue-900">Áreas de Investigación Populares</h2>
            <Button variant="ghost" asChild className="text-blue-700 hover:bg-blue-50">
              <Link href="/campos">Ver todas</Link>
            </Button>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="bg-white border-blue-100">
                  <CardContent className="pt-6">
                    <div className="animate-pulse">
                      <div className="h-4 bg-blue-100 rounded w-1/2 mb-3"></div>
                      <div className="h-3 bg-blue-100 rounded w-1/3 mb-2"></div>
                      <div className="h-3 bg-blue-100 rounded w-1/4"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : areasPopulares.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {areasPopulares.map((area, index) => (
                <Link key={index} href={`/campos/${area.nombre.toLowerCase().replace(/\s+/g, "-")}`}>
                  <Card className="bg-white border-blue-100 hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-3">
                        <Badge className={area.color}>{area.nombre}</Badge>
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-blue-600">Investigadores:</span>
                          <span className="font-medium text-blue-900">{area.investigadores}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-blue-600">Proyectos:</span>
                          <span className="font-medium text-blue-900">{area.proyectos}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="bg-white border-blue-100">
              <CardContent className="pt-6 text-center py-8">
                <TrendingUp className="h-8 w-8 mx-auto text-blue-300 mb-2" />
                <p className="text-blue-600">No hay áreas de investigación registradas aún.</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Instituciones destacadas */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-blue-900">Instituciones Destacadas</h2>
            <Button variant="ghost" asChild className="text-blue-700 hover:bg-blue-50">
              <Link href="/instituciones">Ver todas</Link>
            </Button>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="bg-white border-blue-100">
                  <CardHeader>
                    <div className="animate-pulse">
                      <div className="h-6 bg-blue-100 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-blue-100 rounded w-1/2"></div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="animate-pulse">
                      <div className="h-4 bg-blue-100 rounded w-1/3 mb-2"></div>
                      <div className="flex gap-2">
                        <div className="h-6 bg-blue-100 rounded w-16"></div>
                        <div className="h-6 bg-blue-100 rounded w-20"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : institucionesDestacadas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {institucionesDestacadas.map((institucion, index) => (
                <Link key={index} href={`/instituciones/${institucion.nombre.toLowerCase().replace(/\s+/g, "-")}`}>
                  <Card className="bg-white border-blue-100 hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader>
                      <CardTitle className="text-blue-900">{institucion.nombre}</CardTitle>
                      <CardDescription className="text-blue-600">
                        {institucion.investigadores} investigadores • {institucion.proyectos} proyectos
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-blue-900">Áreas principales:</p>
                        <div className="flex flex-wrap gap-2">
                          {institucion.areas.map((area, areaIndex) => (
                            <Badge key={areaIndex} variant="secondary" className="bg-blue-50 text-blue-700">
                              {area}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="bg-white border-blue-100">
              <CardContent className="pt-6 text-center py-8">
                <Building className="h-8 w-8 mx-auto text-blue-300 mb-2" />
                <p className="text-blue-600">No hay instituciones registradas aún.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
