"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AnimatedCard } from "@/components/ui/animated-card"
import { AnimatedButton } from "@/components/ui/animated-button"
import { AnimatedBadge } from "@/components/ui/animated-badge"
import { AnimatedHeader } from "@/components/ui/animated-header"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Building, Users, FileText, MapPin, ExternalLink, Award, GraduationCap } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

// Interfaces para tipos de datos
interface Institucion {
  id: number
  nombre: string
  siglas: string
  tipo: string
  ubicacion: string
  descripcion: string
  imagen?: string
  investigadores: number
  proyectos: number
  publicaciones: number
  areas: string[]
  fundacion: number
  sitioWeb: string
  slug: string
  investigadoresDestacados: Array<{
    nombre: string
    area: string
    avatar?: string
  }>
}

export default function InstitucionesPage() {
  const [instituciones, setInstituciones] = useState<Institucion[]>([])
  const [loading, setLoading] = useState(true)

  // TODO: Conectar con API real
  useEffect(() => {
    const fetchInstituciones = async () => {
      try {
        setLoading(true)
        // const response = await fetch('/api/instituciones')
        // const data = await response.json()
        // setInstituciones(data)

        // Por ahora, datos vacíos
        setInstituciones([])
      } catch (error) {
        console.error("Error fetching instituciones:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchInstituciones()
  }, [])

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <AnimatedHeader 
            title="Instituciones de Investigación"
            subtitle="Conoce las principales instituciones de educación superior y centros de investigación en Chihuahua"
          />
          <AnimatedButton 
            asChild
            className="bg-blue-700 hover:bg-blue-800 text-white animate-glow"
          >
            <Link href="/instituciones/nueva">
              <Building className="mr-2 h-4 w-4" />
              Registrar Institución
            </Link>
          </AnimatedButton>
        </div>

        {/* Estadísticas generales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <AnimatedCard className="bg-white border-blue-100 text-center" delay={100}>
            <CardContent className="pt-6">
              <Building className="h-8 w-8 mx-auto text-blue-600 mb-2 animate-float" />
              <div className="text-2xl font-bold text-blue-900">{loading ? "..." : instituciones.length}</div>
              <p className="text-sm text-blue-600">Instituciones</p>
            </CardContent>
          </AnimatedCard>
          <AnimatedCard className="bg-white border-blue-100 text-center" delay={200}>
            <CardContent className="pt-6">
              <Users className="h-8 w-8 mx-auto text-blue-600 mb-2 animate-float" />
              <div className="text-2xl font-bold text-blue-900">
                {loading ? "..." : instituciones.reduce((sum, inst) => sum + inst.investigadores, 0)}
              </div>
              <p className="text-sm text-blue-600">Investigadores</p>
            </CardContent>
          </AnimatedCard>
          <AnimatedCard className="bg-white border-blue-100 text-center" delay={300}>
            <CardContent className="pt-6">
              <FileText className="h-8 w-8 mx-auto text-blue-600 mb-2 animate-float" />
              <div className="text-2xl font-bold text-blue-900">
                {loading ? "..." : instituciones.reduce((sum, inst) => sum + inst.proyectos, 0)}
              </div>
              <p className="text-sm text-blue-600">Proyectos</p>
            </CardContent>
          </AnimatedCard>
          <AnimatedCard className="bg-white border-blue-100 text-center" delay={400}>
            <CardContent className="pt-6">
              <Award className="h-8 w-8 mx-auto text-blue-600 mb-2 animate-float" />
              <div className="text-2xl font-bold text-blue-900">
                {loading ? "..." : instituciones.reduce((sum, inst) => sum + inst.publicaciones, 0)}
              </div>
              <p className="text-sm text-blue-600">Publicaciones</p>
            </CardContent>
          </AnimatedCard>
        </div>

        {/* Lista de instituciones */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="bg-white border-blue-100">
                <div className="relative h-48 w-full bg-blue-100 animate-pulse"></div>
                <CardHeader>
                  <div className="animate-pulse">
                    <div className="h-4 bg-blue-100 rounded w-1/4 mb-2"></div>
                    <div className="h-6 bg-blue-100 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-blue-100 rounded w-1/2"></div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="animate-pulse">
                    <div className="h-4 bg-blue-100 rounded w-full mb-2"></div>
                    <div className="h-4 bg-blue-100 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : instituciones.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {instituciones.map((institucion, index) => (
              <AnimatedCard 
                key={institucion.id} 
                className="bg-white border-blue-100" 
                delay={index * 100}
              >
                <div className="relative h-48 w-full">
                  <Image
                    src={institucion.imagen || "/placeholder.svg"}
                    alt={institucion.nombre}
                    fill
                    className="object-cover rounded-t-lg"
                  />
                </div>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <AnimatedBadge className="mb-2 bg-blue-700 text-white">{institucion.tipo}</AnimatedBadge>
                      <CardTitle className="text-xl text-blue-900">{institucion.nombre}</CardTitle>
                      <CardDescription className="text-blue-600">
                        {institucion.siglas} • Fundada en {institucion.fundacion}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-blue-600">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm">{institucion.ubicacion}</span>
                    </div>

                    <p className="text-blue-600 text-sm">{institucion.descripcion}</p>

                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="font-bold text-blue-900">{institucion.investigadores}</div>
                        <div className="text-xs text-blue-600">Investigadores</div>
                      </div>
                      <div>
                        <div className="font-bold text-blue-900">{institucion.proyectos}</div>
                        <div className="text-xs text-blue-600">Proyectos</div>
                      </div>
                      <div>
                        <div className="font-bold text-blue-900">{institucion.publicaciones}</div>
                        <div className="text-xs text-blue-600">Publicaciones</div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-blue-900 mb-2">Áreas de investigación:</h4>
                      <div className="flex flex-wrap gap-1">
                        {institucion.areas.slice(0, 4).map((area, areaIndex) => (
                          <AnimatedBadge 
                            key={areaIndex} 
                            variant="secondary" 
                            interactive={true}
                            className="bg-blue-50 text-blue-700 text-xs stagger-item"
                          >
                            {area}
                          </AnimatedBadge>
                        ))}
                        {institucion.areas.length > 4 && (
                          <AnimatedBadge variant="secondary" className="bg-blue-50 text-blue-700 text-xs">
                            +{institucion.areas.length - 4} más
                          </AnimatedBadge>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-blue-900 mb-2">Investigadores destacados:</h4>
                      <div className="flex gap-2">
                        {institucion.investigadoresDestacados.slice(0, 3).map((investigador, index) => (
                          <div key={index} className="flex items-center gap-1">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={investigador.avatar || "/placeholder.svg"} alt={investigador.nombre} />
                              <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                                {investigador.nombre
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-blue-600">
                              {investigador.nombre.split(" ")[0]} {investigador.nombre.split(" ")[1]}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t border-blue-100 flex justify-between">
                  <AnimatedButton
                    variant="outline"
                    className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-transparent"
                    asChild
                  >
                    <Link href={`/instituciones/${institucion.slug}`}>
                      <GraduationCap className="mr-2 h-4 w-4" />
                      Ver detalles
                    </Link>
                  </AnimatedButton>
                  <AnimatedButton
                    variant="outline"
                    className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-transparent"
                    onClick={() => window.open(institucion.sitioWeb, "_blank")}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Sitio web
                  </AnimatedButton>
                </CardFooter>
              </AnimatedCard>
            ))}
          </div>
        ) : (
          <AnimatedCard className="bg-white border-blue-100" delay={500}>
            <CardContent className="pt-6 text-center py-12">
              <Building className="h-12 w-12 mx-auto text-blue-300 mb-4 animate-float" />
              <h3 className="text-lg font-semibold mb-2 text-blue-900">No hay instituciones registradas</h3>
              <p className="text-sm text-blue-600">Aún no hay instituciones registradas en la plataforma.</p>
            </CardContent>
          </AnimatedCard>
        )}
      </div>
    </div>
  )
}
