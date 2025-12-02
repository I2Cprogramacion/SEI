"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Users, FileText, Building, GraduationCap, Award, Globe } from "lucide-react"

// Interfaces para tipos de datos
interface Estadisticas {
  investigadores: number
  proyectos: number
  publicaciones: number
  instituciones: number
  colaboraciones: number
  areas: number
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
  const [institucionesDestacadas, setInstitucionesDestacadas] = useState<InstitucionDestacada[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [statsResponse, institutionsResponse] = await Promise.all([
          fetch('/api/estadisticas'),
          fetch('/api/instituciones-destacadas?limit=4')
        ])

        if (statsResponse.ok) {
          const stats = await statsResponse.json()
          setEstadisticas(stats)
        }

        if (institutionsResponse.ok) {
          const institutions = await institutionsResponse.json()
          setInstitucionesDestacadas(institutions)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        // En caso de error, mantener valores por defecto
        setEstadisticas({
          investigadores: 0,
          proyectos: 0,
          publicaciones: 0,
          instituciones: 0,
          colaboraciones: 0,
          areas: 0,
        })
        setInstitucionesDestacadas([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="container mx-auto py-4 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6">
      <div className="space-y-6 sm:space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-3 sm:space-y-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-blue-900 px-2 break-words">Explora la Investigación en Chihuahua</h1>
          <p className="text-base sm:text-lg md:text-xl text-blue-600 max-w-3xl mx-auto px-2 break-words">
            Descubre investigadores, proyectos, publicaciones e instituciones que están impulsando la ciencia y
            tecnología en el estado
          </p>
        </div>


        {/* Estadísticas generales */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <Card className="glass-effect card-hover text-center">
            <CardContent className="pt-4 sm:pt-6 px-2 sm:px-4">
              <Users className="h-6 w-6 sm:h-8 sm:w-8 mx-auto text-blue-600 mb-2" />
              <div className="text-xl sm:text-2xl font-bold text-blue-900 break-words">{loading ? "..." : estadisticas.investigadores}</div>
              <p className="text-xs sm:text-sm text-blue-600 break-words">Investigadores</p>
            </CardContent>
          </Card>
          <Card className="glass-effect card-hover text-center">
            <CardContent className="pt-4 sm:pt-6 px-2 sm:px-4">
              <FileText className="h-6 w-6 sm:h-8 sm:w-8 mx-auto text-blue-600 mb-2" />
              <div className="text-xl sm:text-2xl font-bold text-blue-900 break-words">{loading ? "..." : estadisticas.proyectos}</div>
              <p className="text-xs sm:text-sm text-blue-600 break-words">Proyectos</p>
            </CardContent>
          </Card>
          <Card className="glass-effect card-hover text-center">
            <CardContent className="pt-4 sm:pt-6 px-2 sm:px-4">
              <Award className="h-6 w-6 sm:h-8 sm:w-8 mx-auto text-blue-600 mb-2" />
              <div className="text-xl sm:text-2xl font-bold text-blue-900 break-words">{loading ? "..." : estadisticas.publicaciones}</div>
              <p className="text-xs sm:text-sm text-blue-600 break-words">Publicaciones</p>
            </CardContent>
          </Card>
          <Card className="glass-effect card-hover text-center">
            <CardContent className="pt-4 sm:pt-6 px-2 sm:px-4">
              <Building className="h-6 w-6 sm:h-8 sm:w-8 mx-auto text-blue-600 mb-2" />
              <div className="text-xl sm:text-2xl font-bold text-blue-900 break-words">{loading ? "..." : estadisticas.instituciones}</div>
              <p className="text-xs sm:text-sm text-blue-600 break-words">Instituciones</p>
            </CardContent>
          </Card>
          <Card className="glass-effect card-hover text-center">
            <CardContent className="pt-4 sm:pt-6 px-2 sm:px-4">
              <Globe className="h-6 w-6 sm:h-8 sm:w-8 mx-auto text-blue-600 mb-2" />
              <div className="text-xl sm:text-2xl font-bold text-blue-900 break-words">{loading ? "..." : estadisticas.colaboraciones}</div>
              <p className="text-xs sm:text-sm text-blue-600 break-words">Colaboraciones</p>
            </CardContent>
          </Card>
          <Card className="glass-effect card-hover text-center">
            <CardContent className="pt-4 sm:pt-6 px-2 sm:px-4">
              <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 mx-auto text-blue-600 mb-2" />
              <div className="text-xl sm:text-2xl font-bold text-blue-900 break-words">{loading ? "..." : estadisticas.areas}</div>
              <p className="text-xs sm:text-sm text-blue-600 break-words">Áreas</p>
            </CardContent>
          </Card>
        </div>

        {/* Navegación rápida */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Link href="/investigadores">
            <Card className="glass-effect card-hover cursor-pointer">
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
            <Card className="glass-effect card-hover cursor-pointer">
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
            <Card className="glass-effect card-hover cursor-pointer">
              <CardHeader className="text-center">
                <Award className="h-12 w-12 mx-auto text-blue-600 mb-2" />
                <CardTitle className="text-blue-900">Publicaciones</CardTitle>
                <CardDescription className="text-blue-600">Accede a publicaciones científicas</CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link href="/instituciones">
            <Card className="glass-effect card-hover cursor-pointer">
              <CardHeader className="text-center">
                <Building className="h-12 w-12 mx-auto text-blue-600 mb-2" />
                <CardTitle className="text-blue-900">Instituciones</CardTitle>
                <CardDescription className="text-blue-600">Conoce las instituciones de investigación</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>

        {/* Instituciones destacadas */}
        <div className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 px-2">
            <h2 className="text-xl sm:text-2xl font-bold text-blue-900 break-words">Instituciones Destacadas</h2>
            <Button variant="ghost" asChild className="text-blue-700 hover:bg-blue-50 w-full sm:w-auto">
              <Link href="/instituciones">Ver todas</Link>
            </Button>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="glass-effect">
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
                  <Card className="glass-effect card-hover cursor-pointer">
                    <CardHeader className="px-3 sm:px-6 pt-4 sm:pt-6">
                      <CardTitle className="text-blue-900 text-base sm:text-lg break-words">{institucion.nombre}</CardTitle>
                      <CardDescription className="text-blue-600 text-xs sm:text-sm break-words">
                        {institucion.investigadores} investigadores • {institucion.proyectos} proyectos
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6">
                      <div className="space-y-2">
                        <p className="text-xs sm:text-sm font-medium text-blue-900">Áreas principales:</p>
                        <div className="flex flex-wrap gap-2">
                          {institucion.areas.map((area, areaIndex) => (
                            <Badge key={areaIndex} variant="secondary" className="bg-blue-50 text-blue-700 text-xs break-words">
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
            <Card className="glass-effect">
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
