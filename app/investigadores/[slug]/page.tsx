"use client"
import { notFound } from "next/navigation"
import React, { useState, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Building, Mail, Globe, Calendar, Award, FileText, Users, ExternalLink, Download, MapPin, User, Upload, Plus } from "lucide-react"

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

// Función para obtener los datos del investigador desde localStorage (simulando API)
async function getInvestigador(slug: string): Promise<InvestigadorCompleto | null> {
  try {
    // Perfil especial para el administrador del sistema
    if (slug === 'administrador-del-sistema' || slug === 'admin') {
      return {
        id: 1,
        name: 'Administrador del Sistema',
        title: 'Administrador',
        avatar: "/placeholder-user.jpg",
        institution: 'SECCTI Chihuahua',
        department: 'Administración',
        location: 'Chihuahua, México',
        email: 'admin@sei.com.mx',
        phone: undefined,
        website: undefined,
        biography: 'Administrador del Sistema Estatal de Investigadores de Chihuahua. Responsable de la gestión y mantenimiento de la plataforma.',
        expertise: ['Administración', 'Gestión de Sistemas', 'Tecnología'],
        education: [{
          degree: 'Administración de Sistemas',
          institution: 'SECCTI Chihuahua',
          year: new Date().getFullYear() - 3
        }],
        experience: [{
          position: 'Administrador del Sistema',
          institution: 'SECCTI Chihuahua',
          startYear: new Date().getFullYear() - 2
        }],
        projects: [],
        publications: [],
        awards: [],
        collaborators: [],
        stats: {
          totalProjects: 0,
          activeProjects: 0,
          totalPublications: 0,
          hIndex: undefined,
          citations: undefined
        }
      }
    }
    
    // En una implementación real, aquí buscarías en la base de datos
    // return null para indicar que no se encontró el investigador
    
    // También mantener compatibilidad con el usuario logueado
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem("user")
      if (userData) {
        const user = JSON.parse(userData)
        const userSlug = (user.nombre || user.email || '').toLowerCase()
          .replace(/[^a-z0-9\s]/g, '')
          .replace(/\s+/g, '-')
          .trim()
          || 'usuario'
        
        if (userSlug === slug) {
          // Convertir datos del usuario a formato de perfil público
          return {
            id: user.id,
            name: user.nombre,
            title: user.empleoActual || "Investigador",
            avatar: "/placeholder-user.jpg",
            institution: user.institucion || "Institución no especificada",
            department: user.area,
            location: "Chihuahua, México",
            email: user.email,
            phone: user.telefono,
            website: undefined,
            biography: user.biografia || "Biografía no disponible",
            expertise: user.area ? [user.area] : [],
            education: user.ultimoGradoEstudios ? [{
              degree: user.ultimoGradoEstudios,
              institution: user.institucion || "Institución no especificada",
              year: new Date().getFullYear() - 5
            }] : [],
            experience: user.empleoActual ? [{
              position: user.empleoActual,
              institution: user.institucion || "Institución no especificada",
              startYear: new Date().getFullYear() - 3
            }] : [],
            projects: [],
            publications: [],
            awards: user.nivel ? [{
              title: `Nivel SNI ${user.nivel}`,
              organization: "CONACYT",
              year: new Date().getFullYear()
            }] : [],
            collaborators: [],
            stats: {
              totalProjects: 0,
              activeProjects: 0,
              totalPublications: 0,
              hIndex: undefined,
              citations: undefined
            }
          }
        }
      }
    }
    
    // Buscar en los proyectos para ver si es un autor de proyecto
    try {
      const response = await fetch('/api/proyectos')
      if (response.ok) {
        const data = await response.json()
        const proyectos = data.proyectos || []
        
        // Buscar el autor por slug
        for (const proyecto of proyectos) {
          if (proyecto.autor && proyecto.autor.nombreCompleto) {
            const autorSlug = proyecto.autor.nombreCompleto.toLowerCase()
              .replace(/[^a-z0-9\s]/g, '')
              .replace(/\s+/g, '-')
              .trim()
              || 'usuario'
            
            if (autorSlug === slug) {
              // Crear perfil público para el autor del proyecto
              return {
                id: proyecto.id,
                name: proyecto.autor.nombreCompleto,
                title: "Investigador",
                avatar: "/placeholder-user.jpg",
                institution: proyecto.autor.instituto || "Institución no especificada",
                department: proyecto.categoria,
                location: `${proyecto.autor.estado}, México`,
                email: proyecto.autor.email,
                phone: proyecto.autor.telefono,
                website: undefined,
                biography: `Investigador especializado en ${proyecto.categoria.toLowerCase()}. ${proyecto.resumen || proyecto.descripcion}`,
                expertise: proyecto.tags || [proyecto.categoria],
                education: [],
                experience: [{
                  position: "Investigador",
                  institution: proyecto.autor.instituto || "Institución no especificada",
                  startYear: new Date().getFullYear() - 5
                }],
                projects: [{
                  id: proyecto.id,
                  title: proyecto.titulo,
                  status: proyecto.estado,
                  year: new Date(proyecto.fechaPublicacion).getFullYear(),
                  slug: proyecto.slug
                }],
                publications: [],
                awards: [],
                collaborators: [],
                stats: {
                  totalProjects: 1,
                  activeProjects: proyecto.estado === 'Activo' ? 1 : 0,
                  totalPublications: 0,
                  hIndex: undefined,
                  citations: undefined
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Error fetching proyectos for autor:", error)
    }
    
    return null
  } catch (error) {
    console.error("Error fetching investigador:", error)
    return null
  }
}

export default function InvestigadorPage({ params }: { params: { slug: string } }) {
  const [investigador, setInvestigador] = useState<InvestigadorCompleto | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const projectFileInputRef = useRef<HTMLInputElement>(null)
  const publicationFileInputRef = useRef<HTMLInputElement>(null)

  // Cargar datos del investigador
  React.useEffect(() => {
    async function loadInvestigador() {
      try {
        const data = await getInvestigador(params.slug)
        if (!data) {
          notFound()
        }
        setInvestigador(data)
      } catch (error) {
        console.error("Error loading investigador:", error)
        notFound()
      } finally {
        setLoading(false)
      }
    }
    loadInvestigador()
  }, [params.slug])

  // Manejar subida de archivos
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al subir el archivo')
      }

      const result = await response.json()
      
      // Aquí podrías agregar la publicación a la lista o mostrar un mensaje de éxito
      alert(`Archivo "${result.originalName}" subido exitosamente`)
      
      // Limpiar el input
      if (projectFileInputRef.current) {
        projectFileInputRef.current.value = ''
      }
      if (publicationFileInputRef.current) {
        publicationFileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      setUploadError(error instanceof Error ? error.message : 'Error al subir el archivo')
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return <div className="container mx-auto py-8 px-4">Cargando...</div>
  }

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
                    {investigador.email ? (
                      <Button 
                        asChild
                        className="bg-blue-700 text-white hover:bg-blue-800"
                      >
                        <a 
                          href={`mailto:${investigador.email}?subject=Consulta desde la Plataforma de Investigadores&body=Hola ${investigador.name},%0D%0A%0D%0AMe pongo en contacto contigo a través de la Plataforma de Investigadores.%0D%0A%0D%0A[Escribe tu mensaje aquí]%0D%0A%0D%0ASaludos cordiales`}
                        >
                          <Mail className="mr-2 h-4 w-4" />
                          Contactar
                        </a>
                      </Button>
                    ) : (
                      <Button 
                        disabled
                        className="bg-gray-400 text-white cursor-not-allowed"
                      >
                        <Mail className="mr-2 h-4 w-4" />
                        Contactar
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-transparent"
                      onClick={() => {
                        // Por ahora, mostrar un mensaje informativo
                        alert('Funcionalidad de descarga de CV en desarrollo. Por favor, contacte al investigador directamente para solicitar su CV.')
                      }}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Descargar CV
                    </Button>
                    {typeof window !== 'undefined' && localStorage.getItem("user") && (
                      <Button asChild variant="outline" className="border-green-200 text-green-700 hover:bg-green-50">
                        <Link href="/dashboard">
                          <User className="mr-2 h-4 w-4" />
                          Mi Perfil Privado
                        </Link>
                      </Button>
                    )}
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
                  <div className="flex gap-2">
                    <input
                      ref={projectFileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-blue-700 hover:bg-blue-50 border-blue-200"
                      onClick={() => projectFileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      {uploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-2"></div>
                          Subiendo...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Subir Archivo
                        </>
                      )}
                    </Button>
                    <Button variant="ghost" className="text-blue-700 hover:bg-blue-50" asChild>
                      <Link href="/proyectos">Ver todos</Link>
                    </Button>
                  </div>
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
                  <div className="flex gap-2">
                    <input
                      ref={publicationFileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-blue-700 hover:bg-blue-50 border-blue-200"
                      onClick={() => publicationFileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      {uploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-2"></div>
                          Subiendo...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Subir Archivo
                        </>
                      )}
                    </Button>
                    <Button variant="ghost" className="text-blue-700 hover:bg-blue-50" asChild>
                      <Link href="/publicaciones">Ver todas</Link>
                    </Button>
                  </div>
                </div>
                {uploadError && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                    {uploadError}
                  </div>
                )}
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
