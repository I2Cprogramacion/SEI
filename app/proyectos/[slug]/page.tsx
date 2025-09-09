"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDays, Link2, Share2, Users } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"

// Datos de ejemplo para un proyecto
const project = {
  id: 1,
  title: "Patrones de actividad neuronal durante el sueño REM",
  description:
    "Este proyecto investiga los patrones de actividad cerebral durante las diferentes fases del sueño, con un enfoque especial en la fase REM. Utilizamos técnicas avanzadas de neuroimagen y electroencefalografía para monitorear la actividad cerebral durante el sueño y analizar cómo estos patrones se relacionan con la consolidación de la memoria y otros procesos cognitivos.",
  image: "/placeholder.svg?height=600&width=1200",
  startDate: "Enero 2020",
  endDate: "Diciembre 2023",
  status: "En curso",
  category: "Neurociencia",
  tags: ["Neurociencia", "Sueño REM", "Cognición", "Memoria", "EEG"],
  researchers: [
    {
      id: 1,
      name: "Dra. María Rodríguez",
      role: "Investigadora Principal",
      avatar: "/placeholder.svg?height=100&width=100",
      slug: "maria-rodriguez",
    },
    {
      id: 2,
      name: "Dr. Carlos Méndez",
      role: "Investigador Asociado",
      avatar: "/placeholder.svg?height=100&width=100",
      slug: "carlos-mendez",
    },
    {
      id: 3,
      name: "Dra. Ana Martínez",
      role: "Investigadora Asociada",
      avatar: "/placeholder.svg?height=100&width=100",
      slug: "ana-martinez",
    },
  ],
  institution: "Universidad Autónoma de Chihuahua",
  funding: "Consejo Estatal de Ciencia, Tecnología e Innovación de Chihuahua",
  fundingAmount: "$450,000",
  publications: [
    {
      id: 1,
      title: "Correlatos neurales del procesamiento de la memoria durante el sueño REM",
      journal: "Journal of Sleep Research",
      year: "2022",
      doi: "10.1234/jsr.2022.001",
    },
    {
      id: 2,
      title: "Patrones de actividad cerebral durante diferentes fases del sueño",
      journal: "Neuroscience",
      year: "2021",
      doi: "10.1234/neuro.2021.002",
    },
  ],
  methodology:
    "Este estudio utiliza un enfoque multidisciplinario que combina electroencefalografía (EEG), resonancia magnética funcional (fMRI) y pruebas cognitivas. Los participantes son monitoreados durante ciclos completos de sueño en un laboratorio especializado, mientras se registra su actividad cerebral. Posteriormente, se realizan pruebas de memoria y otras funciones cognitivas para correlacionar con los patrones observados durante el sueño.",
  findings:
    "Los resultados preliminares sugieren una correlación significativa entre ciertos patrones de actividad durante la fase REM y la consolidación de la memoria declarativa. También hemos identificado patrones específicos asociados con el procesamiento emocional durante esta fase del sueño.",
  impact:
    "Este estudio tiene implicaciones importantes para la comprensión de los trastornos del sueño y su relación con problemas cognitivos. Los hallazgos podrían contribuir al desarrollo de nuevas terapias para trastornos como el insomnio, la apnea del sueño y ciertas condiciones neurodegenerativas.",
}

export default function ProjectPage({ params }: { params: { slug: string } }) {
  const [contactDialogOpen, setContactDialogOpen] = useState(false)
  const { toast } = useToast()

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: project.title,
          text: `Mira este proyecto de investigación: ${project.title}`,
          url: window.location.href,
        })
      } else {
        // Fallback para navegadores que no soportan Web Share API
        navigator.clipboard.writeText(window.location.href)
        toast({
          title: "Enlace copiado",
          description: "El enlace al proyecto ha sido copiado al portapapeles.",
        })
      }
    } catch (error) {
      console.error("Error al compartir:", error)
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    toast({
      title: "Enlace copiado",
      description: "El enlace al proyecto ha sido copiado al portapapeles.",
    })
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="space-y-8">
        {/* Encabezado del proyecto */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge className="bg-blue-700 text-white">{project.category}</Badge>
            <Badge variant="outline" className="border-blue-200 text-blue-700">
              {project.status}
            </Badge>
          </div>

          <h1 className="text-3xl font-bold md:text-4xl text-blue-900">{project.title}</h1>

          <div className="flex flex-wrap gap-4 text-sm text-blue-600">
            <div className="flex items-center">
              <CalendarDays className="mr-1 h-4 w-4" />
              <span>
                {project.startDate} - {project.endDate}
              </span>
            </div>
            <div className="flex items-center">
              <Users className="mr-1 h-4 w-4" />
              <span>{project.researchers.length} investigadores</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-2">
            {project.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              className="border-blue-200 text-blue-700 hover:bg-blue-50"
              onClick={handleShare}
            >
              <Share2 className="mr-2 h-4 w-4" />
              Compartir
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-blue-200 text-blue-700 hover:bg-blue-50"
              onClick={handleCopyLink}
            >
              <Link2 className="mr-2 h-4 w-4" />
              Copiar enlace
            </Button>
          </div>
        </div>

        {/* Imagen del proyecto */}
        <div className="relative w-full h-[300px] md:h-[400px] rounded-lg overflow-hidden">
          <Image src={project.image || "/placeholder.svg"} alt={project.title} fill className="object-cover" priority />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Contenido principal */}
          <div className="md:col-span-2 space-y-6">
            <Card className="bg-white border-blue-100">
              <CardHeader>
                <CardTitle className="text-blue-900">Descripción del proyecto</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-blue-600">{project.description}</p>
              </CardContent>
            </Card>

            <Tabs defaultValue="methodology" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-blue-50">
                <TabsTrigger
                  value="methodology"
                  className="text-blue-700 data-[state=active]:bg-white data-[state=active]:text-blue-900"
                >
                  Metodología
                </TabsTrigger>
                <TabsTrigger
                  value="findings"
                  className="text-blue-700 data-[state=active]:bg-white data-[state=active]:text-blue-900"
                >
                  Hallazgos
                </TabsTrigger>
                <TabsTrigger
                  value="impact"
                  className="text-blue-700 data-[state=active]:bg-white data-[state=active]:text-blue-900"
                >
                  Impacto
                </TabsTrigger>
              </TabsList>

              <TabsContent value="methodology" className="mt-6">
                <Card className="bg-white border-blue-100">
                  <CardContent className="pt-6">
                    <p className="text-blue-600">{project.methodology}</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="findings" className="mt-6">
                <Card className="bg-white border-blue-100">
                  <CardContent className="pt-6">
                    <p className="text-blue-600">{project.findings}</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="impact" className="mt-6">
                <Card className="bg-white border-blue-100">
                  <CardContent className="pt-6">
                    <p className="text-blue-600">{project.impact}</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Información adicional */}
          <div className="space-y-6">
            <Card className="bg-white border-blue-100">
              <CardHeader>
                <CardTitle className="text-blue-900">Investigadores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-4">
                  {project.researchers.map((researcher) => (
                    <div key={researcher.id} className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={researcher.avatar || "/placeholder.svg"} alt={researcher.name} />
                        <AvatarFallback>{researcher.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h2 className="text-blue-900 font-bold">{researcher.name}</h2>
                        <p className="text-blue-600">{researcher.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-blue-100">
              <CardHeader>
                <CardTitle className="text-blue-900">Publicaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-6">
                  {project.publications.map((publication) => (
                    <li key={publication.id} className="text-blue-600">
                      <Link href={`https://doi.org/${publication.doi}`} target="_blank">
                        {publication.title} - {publication.journal} ({publication.year})
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white border-blue-100">
              <CardHeader>
                <CardTitle className="text-blue-900">Financiamiento</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-blue-600">
                  {project.funding}: {project.fundingAmount}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
