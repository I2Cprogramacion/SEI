"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Users, ExternalLink, Calendar, Globe, Building, Award } from "lucide-react"
import Image from "next/image"
import { JoinNetworkDialog } from "@/components/join-network-dialog"
import { EventRegistrationDialog } from "@/components/event-registration-dialog"

// Datos de ejemplo para redes de colaboración
const redesNacionales = [
  {
    id: 1,
    nombre: "Red Nacional de Investigación en Energías Renovables",
    descripcion:
      "Red que conecta a investigadores especializados en energías renovables de todo México, facilitando la colaboración en proyectos de impacto nacional.",
    miembros: 120,
    instituciones: 18,
    categoria: "Energía",
    imagen: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 2,
    nombre: "Red Mexicana de Investigadores en Biotecnología",
    descripcion:
      "Comunidad de científicos dedicados a la investigación biotecnológica, con énfasis en aplicaciones para la agricultura y la salud.",
    miembros: 85,
    instituciones: 12,
    categoria: "Biotecnología",
    imagen: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 3,
    nombre: "Red de Investigación en Ciencias Sociales y Humanidades",
    descripcion:
      "Plataforma colaborativa para investigadores en ciencias sociales, enfocada en estudios interdisciplinarios sobre problemáticas nacionales.",
    miembros: 150,
    instituciones: 22,
    categoria: "Ciencias Sociales",
    imagen: "/placeholder.svg?height=200&width=300",
  },
]

const redesInternacionales = [
  {
    id: 1,
    nombre: "Consorcio Internacional de Investigación en Cambio Climático",
    descripcion:
      "Red global de investigadores dedicados al estudio del cambio climático y sus efectos en diferentes regiones del mundo.",
    paises: 28,
    instituciones: 45,
    categoria: "Medio Ambiente",
    imagen: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 2,
    nombre: "Alianza Global para la Investigación en Inteligencia Artificial",
    descripcion:
      "Colaboración internacional para el desarrollo ético y responsable de tecnologías de inteligencia artificial.",
    paises: 32,
    instituciones: 60,
    categoria: "Tecnología",
    imagen: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 3,
    nombre: "Red Iberoamericana de Investigación en Salud Pública",
    descripcion:
      "Comunidad de investigadores de países iberoamericanos enfocados en mejorar los sistemas de salud pública y abordar desafíos sanitarios regionales.",
    paises: 12,
    instituciones: 30,
    categoria: "Salud",
    imagen: "/placeholder.svg?height=200&width=300",
  },
]

const eventos = [
  {
    id: 1,
    nombre: "Congreso Internacional de Investigación Científica",
    descripcion:
      "Evento anual que reúne a investigadores de diversas disciplinas para compartir avances y establecer colaboraciones.",
    fecha: "15-18 Octubre, 2023",
    ubicacion: "Ciudad de México, México",
    modalidad: "Presencial",
    categoria: "Multidisciplinario",
    imagen: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 2,
    nombre: "Simposio de Innovación Tecnológica",
    descripcion:
      "Encuentro especializado en las últimas tendencias tecnológicas y su aplicación en la investigación científica.",
    fecha: "5-7 Noviembre, 2023",
    ubicacion: "Monterrey, México",
    modalidad: "Híbrido",
    categoria: "Tecnología",
    imagen: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 3,
    nombre: "Foro de Colaboración Academia-Industria",
    descripcion:
      "Espacio de diálogo entre investigadores y representantes de la industria para fomentar proyectos colaborativos.",
    fecha: "12 Diciembre, 2023",
    ubicacion: "Chihuahua, México",
    modalidad: "Presencial",
    categoria: "Vinculación",
    imagen: "/placeholder.svg?height=200&width=300",
  },
]

export default function RedesPage() {
  const [joinNetworkDialog, setJoinNetworkDialog] = useState<{
    open: boolean
    networkName: string
    networkId: number
  }>({
    open: false,
    networkName: "",
    networkId: 0,
  })

  const [eventRegistrationDialog, setEventRegistrationDialog] = useState<{
    open: boolean
    eventName: string
    eventId: number
    eventDate: string
  }>({
    open: false,
    eventName: "",
    eventId: 0,
    eventDate: "",
  })

  const handleJoinNetwork = (networkName: string, networkId: number) => {
    setJoinNetworkDialog({
      open: true,
      networkName,
      networkId,
    })
  }

  const handleRegisterEvent = (eventName: string, eventId: number, eventDate: string) => {
    setEventRegistrationDialog({
      open: true,
      eventName,
      eventId,
      eventDate,
    })
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-blue-900">Redes de Colaboración</h1>
          <p className="text-blue-600">
            Conecta con redes de investigación nacionales e internacionales y participa en eventos académicos
          </p>
        </div>

        <Tabs defaultValue="nacionales" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-blue-50">
            <TabsTrigger
              value="nacionales"
              className="text-blue-700 data-[state=active]:bg-white data-[state=active]:text-blue-900"
            >
              Redes Nacionales
            </TabsTrigger>
            <TabsTrigger
              value="internacionales"
              className="text-blue-700 data-[state=active]:bg-white data-[state=active]:text-blue-900"
            >
              Redes Internacionales
            </TabsTrigger>
            <TabsTrigger
              value="eventos"
              className="text-blue-700 data-[state=active]:bg-white data-[state=active]:text-blue-900"
            >
              Eventos Académicos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="nacionales" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {redesNacionales.map((red) => (
                <Card key={red.id} className="bg-white border-blue-100">
                  <div className="relative h-40 w-full">
                    <Image
                      src={red.imagen || "/placeholder.svg"}
                      alt={red.nombre}
                      fill
                      className="object-cover rounded-t-lg"
                    />
                  </div>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <Badge className="mb-2 bg-blue-700 text-white">{red.categoria}</Badge>
                    </div>
                    <CardTitle className="text-lg text-blue-900">{red.nombre}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-blue-600 text-sm mb-4">{red.descripcion}</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center text-blue-600">
                        <Users className="mr-1 h-4 w-4" />
                        <span>{red.miembros} investigadores</span>
                      </div>
                      <div className="flex items-center text-blue-600">
                        <Building className="mr-1 h-4 w-4" />
                        <span>{red.instituciones} instituciones</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t border-blue-100 pt-4">
                    <Button
                      className="w-full bg-blue-700 text-white hover:bg-blue-800"
                      onClick={() => handleJoinNetwork(red.nombre, red.id)}
                    >
                      <Users className="mr-2 h-4 w-4" />
                      Unirse a la red
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="internacionales" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {redesInternacionales.map((red) => (
                <Card key={red.id} className="bg-white border-blue-100">
                  <div className="relative h-40 w-full">
                    <Image
                      src={red.imagen || "/placeholder.svg"}
                      alt={red.nombre}
                      fill
                      className="object-cover rounded-t-lg"
                    />
                  </div>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <Badge className="mb-2 bg-blue-700 text-white">{red.categoria}</Badge>
                    </div>
                    <CardTitle className="text-lg text-blue-900">{red.nombre}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-blue-600 text-sm mb-4">{red.descripcion}</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center text-blue-600">
                        <Globe className="mr-1 h-4 w-4" />
                        <span>{red.paises} países</span>
                      </div>
                      <div className="flex items-center text-blue-600">
                        <Building className="mr-1 h-4 w-4" />
                        <span>{red.instituciones} instituciones</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t border-blue-100 pt-4">
                    <Button
                      className="w-full bg-blue-700 text-white hover:bg-blue-800"
                      onClick={() => window.open("https://example.com", "_blank")}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Más información
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="eventos" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {eventos.map((evento) => (
                <Card key={evento.id} className="bg-white border-blue-100">
                  <div className="relative h-40 w-full">
                    <Image
                      src={evento.imagen || "/placeholder.svg"}
                      alt={evento.nombre}
                      fill
                      className="object-cover rounded-t-lg"
                    />
                  </div>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <Badge className="mb-2 bg-blue-700 text-white">{evento.categoria}</Badge>
                    </div>
                    <CardTitle className="text-lg text-blue-900">{evento.nombre}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-blue-600 text-sm mb-4">{evento.descripcion}</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center text-blue-600">
                        <Calendar className="mr-1 h-4 w-4" />
                        <span>{evento.fecha}</span>
                      </div>
                      <div className="flex items-center text-blue-600">
                        <Globe className="mr-1 h-4 w-4" />
                        <span>{evento.ubicacion}</span>
                      </div>
                      <div className="flex items-center text-blue-600">
                        <Badge variant="outline" className="border-blue-200 text-blue-700 mt-1">
                          {evento.modalidad}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t border-blue-100 pt-4">
                    <Button
                      className="w-full bg-blue-700 text-white hover:bg-blue-800"
                      onClick={() => handleRegisterEvent(evento.nombre, evento.id, evento.fecha)}
                    >
                      <Award className="mr-2 h-4 w-4" />
                      Inscribirse
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Diálogos */}
      <JoinNetworkDialog
        networkName={joinNetworkDialog.networkName}
        networkId={joinNetworkDialog.networkId}
        open={joinNetworkDialog.open}
        onOpenChange={(open) => setJoinNetworkDialog((prev) => ({ ...prev, open }))}
      />

      <EventRegistrationDialog
        eventName={eventRegistrationDialog.eventName}
        eventId={eventRegistrationDialog.eventId}
        eventDate={eventRegistrationDialog.eventDate}
        open={eventRegistrationDialog.open}
        onOpenChange={(open) => setEventRegistrationDialog((prev) => ({ ...prev, open }))}
      />
    </div>
  )
}
