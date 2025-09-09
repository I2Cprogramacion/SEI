"use client"
import { notFound } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Building, Mail, Globe, Calendar, Award, FileText, Users, ExternalLink, Download, MapPin } from "lucide-react"

// Interface para el investigador completo
interface InvestigadorCompleto {
  id: number
  name: string
  title: string
  avatar?: string
  institution: string
  department?: string
  location: string
  email?: string
  phone?: string
  website?: string
  biography: string
  expertise: string[]
  education: Array<{
    degree: string
    institution: string
    year: number
  }>
  experience: Array<{
    position: string
    institution: string
    startYear: number
    endYear?: number
  }>
  projects: Array<{
    id: number
    title: string
    status: string
    year: number
    slug: string
  }>
  publications: Array<{
    id: number
    title: string
    journal: string
    year: number
    doi?: string
  }>
  awards: Array<{
    title: string
    organization: string
    year: number
  }>
  collaborators: Array<{
    id: number
    name: string
    institution: string
    avatar?: string
    slug: string
  }>
  stats: {
    totalProjects: number
    activeProjects: number
    totalPublications: number
    hIndex?: number
    citations?: number
  }
}

// TODO: Esta función debe obtener los datos del investigador desde la API
async function getInvestigador(slug: string): Promise<InvestigadorCompleto | null> {
  try {
    // const response = await fetch(`${process.env.API_URL}/api/investigadores/${slug}`)
    // if (!response.ok) return null
    // return await response.json()

    // Por ahora retornamos null para mostrar el estado vacío
    return null
  } catch (error) {
    console.error("Error fetching investigador:", error)
    return null
  }
}

export default async function InvestigadorPage({ params }: { params: { slug: string } }) {
  const investigador = await getInvestigador(params.slug)

  if (!investigador) {
    notFound()
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="space-y-8">
        {/* Header del perfil */}
        <Card className="bg-white border-blue-100">
          <CardContent className="pt-8">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-shrink-0">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={investigador.avatar || "/placeholder.svg"} alt={investigador.name} />
                  <AvatarFallback className="bg-blue-100 text-blue-700 text-2xl">
                    {investigador.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-grow">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-blue-900 mb-2">{investigador.name}</h1>
                    <p className="text-xl text-blue-600 mb-4">{investigador.title}</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-blue-600">
                        <Building className="h-4 w-4" />
                        <span>{investigador.institution}</span>
                        {investigador.department && <span>• {investigador.department}</span>}
                      </div>
                      <div className="flex items-center gap-2 text-blue-600">
                        <MapPin className="h-4 w-4" />
                        <span>{investigador.location}</span>
                      </div>
                      {investigador.email && (
                        <div className="flex items-center gap-2 text-blue-600">
                          <Mail className="h-4 w-4" />
                          <a href={`mailto:${investigador.email}`} className="hover:underline">
                            {investigador.email}
                          </a>
                        </div>
                      )}
                      {investigador.website && (
                        <div className="flex items-center gap-2 text-blue-600">
                          <Globe className="h-4 w-4" />
                          <a
                            href={investigador.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            Sitio web personal
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button className="bg-blue-700 text-white hover:bg-blue-800">
                      <Mail className="mr-2 h-4 w-4" />
                      Contactar
                    </Button>
                    <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-transparent">
                      <Download className="mr-2 h-4 w-4" />
                      Descargar CV
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="bg-white border-blue-100 text-center">
            <CardContent className="pt-6">
              <FileText className="h-8 w-8 mx-auto text-blue-600 mb-2" />
              <div className="text-2xl font-bold text-blue-900">{investigador.stats.totalProjects}</div>
              <p className="text-sm text-blue-600">Proyectos Totales</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-blue-100 text-center">
            <CardContent className="pt-6">
              <Users className="h-8 w-8 mx-auto text-blue-600 mb-2" />
              <div className="text-2xl font-bold text-blue-900">{investigador.stats.activeProjects}</div>
              <p className="text-sm text-blue-600">Proyectos Activos</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-blue-100 text-center">
            <CardContent className="pt-6">
              <Award className="h-8 w-8 mx-auto text-blue-600 mb-2" />
              <div className="text-2xl font-bold text-blue-900">{investigador.stats.totalPublications}</div>
              <p className="text-sm text-blue-600">Publicaciones</p>
            </CardContent>
          </Card>
          {investigador.stats.hIndex && (
            <Card className="bg-white border-blue-100 text-center">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-blue-900">{investigador.stats.hIndex}</div>
                <p className="text-sm text-blue-600">Índice H</p>
              </CardContent>
            </Card>
          )}
          {investigador.stats.citations && (
            <Card className="bg-white border-blue-100 text-center">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-blue-900">{investigador.stats.citations}</div>
                <p className="text-sm text-blue-600">Citas</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-8">
            {/* Biografía */}
            <Card className="bg-white border-blue-100">
              <CardHeader>
                <CardTitle className="text-blue-900">Biografía</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-blue-600 leading-relaxed">{investigador.biography}</p>
              </CardContent>
            </Card>

            {/* Áreas de especialización */}
            <Card className="bg-white border-blue-100">
              <CardHeader>
                <CardTitle className="text-blue-900">Áreas de Especialización</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {investigador.expertise.map((area, index) => (
                    <Badge key={index} className="bg-blue-700 text-white">
                      {area}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Proyectos recientes */}
            <Card className="bg-white border-blue-100">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-blue-900">Proyectos Recientes</CardTitle>
                  <Button variant="ghost" className="text-blue-700 hover:bg-blue-50" asChild>
                    <Link href="/proyectos">Ver todos</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {investigador.projects.slice(0, 5).map((project) => (
                    <div key={project.id} className="border-b border-blue-100 pb-4 last:border-0">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <Link
                            href={`/proyectos/${project.slug}`}
                            className="font-medium text-blue-900 hover:underline"
                          >
                            {project.title}
                          </Link>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                project.status === "Activo"
                                  ? "border-green-200 text-green-700"
                                  : "border-blue-200 text-blue-700"
                              }`}
                            >
                              {project.status}
                            </Badge>
                            <span className="text-sm text-blue-600">{project.year}</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-blue-700 hover:bg-blue-50" asChild>
                          <Link href={`/proyectos/${project.slug}`}>
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Publicaciones recientes */}
            <Card className="bg-white border-blue-100">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-blue-900">Publicaciones Recientes</CardTitle>
                  <Button variant="ghost" className="text-blue-700 hover:bg-blue-50" asChild>
                    <Link href="/publicaciones">Ver todas</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {investigador.publications.slice(0, 5).map((publication) => (
                    <div key={publication.id} className="border-b border-blue-100 pb-4 last:border-0">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-blue-900">{publication.title}</h4>
                          <p className="text-sm text-blue-600 mt-1">
                            {publication.journal} • {publication.year}
                          </p>
                          {publication.doi && <p className="text-xs text-blue-500 mt-1">DOI: {publication.doi}</p>}
                        </div>
                        {publication.doi && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-700 hover:bg-blue-50"
                            onClick={() => window.open(`https://doi.org/${publication.doi}`, "_blank")}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Columna lateral */}
          <div className="space-y-8">
            {/* Formación académica */}
            <Card className="bg-white border-blue-100">
              <CardHeader>
                <CardTitle className="text-blue-900">Formación Académica</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {investigador.education.map((edu, index) => (
                    <div key={index} className="border-b border-blue-100 pb-4 last:border-0">
                      <h4 className="font-medium text-blue-900">{edu.degree}</h4>
                      <p className="text-sm text-blue-600">{edu.institution}</p>
                      <div className="flex items-center gap-1 text-xs text-blue-500 mt-1">
                        <Calendar className="h-3 w-3" />
                        <span>{edu.year}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Experiencia profesional */}
            <Card className="bg-white border-blue-100">
              <CardHeader>
                <CardTitle className="text-blue-900">Experiencia Profesional</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {investigador.experience.map((exp, index) => (
                    <div key={index} className="border-b border-blue-100 pb-4 last:border-0">
                      <h4 className="font-medium text-blue-900">{exp.position}</h4>
                      <p className="text-sm text-blue-600">{exp.institution}</p>
                      <div className="flex items-center gap-1 text-xs text-blue-500 mt-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {exp.startYear} - {exp.endYear || "Presente"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Reconocimientos */}
            {investigador.awards.length > 0 && (
              <Card className="bg-white border-blue-100">
                <CardHeader>
                  <CardTitle className="text-blue-900">Reconocimientos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {investigador.awards.map((award, index) => (
                      <div key={index} className="border-b border-blue-100 pb-4 last:border-0">
                        <h4 className="font-medium text-blue-900">{award.title}</h4>
                        <p className="text-sm text-blue-600">{award.organization}</p>
                        <div className="flex items-center gap-1 text-xs text-blue-500 mt-1">
                          <Award className="h-3 w-3" />
                          <span>{award.year}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Colaboradores */}
            {investigador.collaborators.length > 0 && (
              <Card className="bg-white border-blue-100">
                <CardHeader>
                  <CardTitle className="text-blue-900">Colaboradores Frecuentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {investigador.collaborators.slice(0, 5).map((collaborator) => (
                      <Link
                        key={collaborator.id}
                        href={`/investigadores/${collaborator.slug}`}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={collaborator.avatar || "/placeholder.svg"} alt={collaborator.name} />
                          <AvatarFallback className="bg-blue-100 text-blue-700">
                            {collaborator.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium text-blue-900 text-sm">{collaborator.name}</p>
                          <p className="text-xs text-blue-600">{collaborator.institution}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
