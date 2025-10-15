"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MessageCircle,
  Mail,
  Send,
  Inbox,
  Clock,
  User,
  AlertCircle,
  CheckCircle2,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"

interface Mensaje {
  id: number
  asunto: string
  mensaje: string
  fecha_envio: string
  leido: boolean
  tipo: "enviado" | "recibido"
  otro_usuario: string
  otro_email: string
  otro_foto?: string
}

export default function MensajesPage() {
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMensaje, setSelectedMensaje] = useState<Mensaje | null>(null)

  useEffect(() => {
    fetchMensajes()
  }, [])

  const fetchMensajes = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/mensajes")
      if (response.ok) {
        const data = await response.json()
        setMensajes(data)
      }
    } catch (error) {
      console.error("Error al cargar mensajes:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const mensajesRecibidos = mensajes.filter((m) => m.tipo === "recibido")
  const mensajesEnviados = mensajes.filter((m) => m.tipo === "enviado")
  const mensajesNoLeidos = mensajesRecibidos.filter((m) => !m.leido)

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-4">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-blue-900 mb-2">Mensajes</h1>
        <p className="text-blue-600">Gestiona tu comunicación con otros investigadores</p>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Inbox className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-900">{mensajesRecibidos.length}</p>
                <p className="text-sm text-blue-600">Recibidos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-full">
                <AlertCircle className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-900">{mensajesNoLeidos.length}</p>
                <p className="text-sm text-orange-600">No leídos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full">
                <Send className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-900">{mensajesEnviados.length}</p>
                <p className="text-sm text-green-600">Enviados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de mensajes */}
      <Tabs defaultValue="recibidos" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="recibidos" className="flex items-center gap-2">
            <Inbox className="h-4 w-4" />
            Recibidos
            {mensajesNoLeidos.length > 0 && (
              <Badge className="ml-1 bg-orange-500">{mensajesNoLeidos.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="enviados" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Enviados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recibidos" className="mt-6">
          {mensajesRecibidos.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <Mail className="h-12 w-12 text-blue-300 mx-auto mb-4" />
                <p className="text-blue-600 mb-2">No tienes mensajes recibidos</p>
                <p className="text-sm text-muted-foreground">
                  Los mensajes que recibas aparecerán aquí
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {mensajesRecibidos.map((mensaje) => (
                <Card
                  key={mensaje.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    !mensaje.leido ? "border-l-4 border-l-orange-500 bg-orange-50" : ""
                  }`}
                  onClick={() => setSelectedMensaje(mensaje)}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-blue-900">{mensaje.otro_usuario}</p>
                            {!mensaje.leido && (
                              <Badge className="bg-orange-500 text-xs">Nuevo</Badge>
                            )}
                          </div>
                          <p className="text-sm text-blue-600 mb-2">{mensaje.otro_email}</p>
                          <p className="font-medium text-blue-900 mb-1">{mensaje.asunto}</p>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {mensaje.mensaje}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {formatDistanceToNow(new Date(mensaje.fecha_envio), {
                          addSuffix: true,
                          locale: es,
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="enviados" className="mt-6">
          {mensajesEnviados.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <Send className="h-12 w-12 text-blue-300 mx-auto mb-4" />
                <p className="text-blue-600 mb-2">No has enviado mensajes</p>
                <p className="text-sm text-muted-foreground">
                  Tus mensajes enviados aparecerán aquí
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {mensajesEnviados.map((mensaje) => (
                <Card
                  key={mensaje.id}
                  className="cursor-pointer transition-all hover:shadow-md"
                  onClick={() => setSelectedMensaje(mensaje)}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="p-2 bg-green-100 rounded-full">
                          <Send className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm text-muted-foreground">Para:</p>
                            <p className="font-semibold text-blue-900">{mensaje.otro_usuario}</p>
                          </div>
                          <p className="text-sm text-blue-600 mb-2">{mensaje.otro_email}</p>
                          <p className="font-medium text-blue-900 mb-1">{mensaje.asunto}</p>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {mensaje.mensaje}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {formatDistanceToNow(new Date(mensaje.fecha_envio), {
                          addSuffix: true,
                          locale: es,
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Modal de detalle del mensaje */}
      {selectedMensaje && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedMensaje(null)}
        >
          <Card
            className="max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl text-blue-900">
                    {selectedMensaje.asunto}
                  </CardTitle>
                  <CardDescription className="mt-2">
                    <div className="flex items-center gap-2">
                      {selectedMensaje.tipo === "recibido" ? "De:" : "Para:"}
                      <span className="font-semibold">{selectedMensaje.otro_usuario}</span>
                      <span className="text-xs">({selectedMensaje.otro_email})</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(selectedMensaje.fecha_envio), {
                        addSuffix: true,
                        locale: es,
                      })}
                    </div>
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedMensaje(null)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap text-blue-900">{selectedMensaje.mensaje}</div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
