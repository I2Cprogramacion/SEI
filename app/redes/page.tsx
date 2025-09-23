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

// Datos de redes de colaboración (por ahora vacíos)
const redesNacionales: any[] = []
const redesInternacionales: any[] = []
const eventos: any[] = []

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
