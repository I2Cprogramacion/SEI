"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  MessageCircle,
  Mail,
  Send,
  Inbox,
  Clock,
  User,
  AlertCircle,
  CheckCircle2,
  Reply,
  X,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { useToast } from "@/hooks/use-toast"
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
  remitente_id?: number
  destinatario_id?: number
}

export default function MensajesPage() {
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMensaje, setSelectedMensaje] = useState<Mensaje | null>(null)
  const [isReplying, setIsReplying] = useState(false)
  const [replyAsunto, setReplyAsunto] = useState("")
  const [replyMensaje, setReplyMensaje] = useState("")
  const [isSending, setIsSending] = useState(false)
  const { toast } = useToast()

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

  const marcarComoLeido = async (mensajeId: number) => {
    try {
      const response = await fetch("/api/mensajes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensajeId }),
      })

      if (response.ok) {
        // Actualizar el mensaje en el estado
        setMensajes((prev) =>
          prev.map((m) => (m.id === mensajeId ? { ...m, leido: true } : m))
        )
      }
    } catch (error) {
      console.error("Error al marcar como leído:", error)
    }
  }

  const handleOpenMensaje = (mensaje: Mensaje) => {
    setSelectedMensaje(mensaje)
    // Si es un mensaje recibido y no está leído, marcarlo como leído
    if (mensaje.tipo === "recibido" && !mensaje.leido) {
      marcarComoLeido(mensaje.id)
    }
  }

  const handleResponder = () => {
    if (selectedMensaje) {
      setReplyAsunto(`Re: ${selectedMensaje.asunto}`)
      setReplyMensaje("")
      setIsReplying(true)
    }
  }

  const enviarRespuesta = async () => {
    if (!selectedMensaje || !replyAsunto || !replyMensaje) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSending(true)
      const response = await fetch("/api/mensajes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destinatarioId: selectedMensaje.remitente_id,
          asunto: replyAsunto,
          mensaje: replyMensaje,
        }),
      })

      if (response.ok) {
        toast({
          title: "¡Respuesta enviada!",
          description: "Tu mensaje ha sido enviado exitosamente",
        })
        setIsReplying(false)
        setSelectedMensaje(null)
        fetchMensajes() // Recargar mensajes
      } else {
        throw new Error("Error al enviar respuesta")
      }
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "No se pudo enviar la respuesta",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
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
                  onClick={() => handleOpenMensaje(mensaje)}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-gray-900">{mensaje.otro_usuario}</p>
                            {!mensaje.leido && (
                              <Badge className="bg-orange-500 text-xs">Nuevo</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{mensaje.otro_email}</p>
                          <p className="font-medium text-gray-900 mb-1">{mensaje.asunto}</p>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {mensaje.mensaje}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
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
                            <p className="text-sm text-gray-500">Para:</p>
                            <p className="font-semibold text-gray-900">{mensaje.otro_usuario}</p>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{mensaje.otro_email}</p>
                          <p className="font-medium text-gray-900 mb-1">{mensaje.asunto}</p>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {mensaje.mensaje}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
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
      <Dialog open={!!selectedMensaje && !isReplying} onOpenChange={() => setSelectedMensaje(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl text-blue-900">
              {selectedMensaje?.asunto}
            </DialogTitle>
            <DialogDescription>
              <div className="flex items-center gap-2 mt-2">
                {selectedMensaje?.tipo === "recibido" ? "De:" : "Para:"}
                <span className="font-semibold">{selectedMensaje?.otro_usuario}</span>
                <span className="text-xs">({selectedMensaje?.otro_email})</span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs">
                <Clock className="h-3 w-3" />
                {selectedMensaje &&
                  formatDistanceToNow(new Date(selectedMensaje.fecha_envio), {
                    addSuffix: true,
                    locale: es,
                  })}
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <div className="whitespace-pre-wrap text-gray-900 p-4 bg-gray-50 rounded-lg border border-gray-200">
              {selectedMensaje?.mensaje}
            </div>
          </div>
          {selectedMensaje?.tipo === "recibido" && (
            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={() => setSelectedMensaje(null)}>
                Cerrar
              </Button>
              <Button onClick={handleResponder} className="flex items-center gap-2">
                <Reply className="h-4 w-4" />
                Responder
              </Button>
            </DialogFooter>
          )}
          {selectedMensaje?.tipo === "enviado" && (
            <DialogFooter className="mt-6">
              <Button onClick={() => setSelectedMensaje(null)}>Cerrar</Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de respuesta */}
      <Dialog open={isReplying} onOpenChange={setIsReplying}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl text-blue-900">Responder mensaje</DialogTitle>
            <DialogDescription>
              Respondiendo a {selectedMensaje?.otro_usuario}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="asunto">Asunto</Label>
              <Input
                id="asunto"
                value={replyAsunto}
                onChange={(e) => setReplyAsunto(e.target.value)}
                placeholder="Asunto del mensaje"
              />
            </div>
            <div>
              <Label htmlFor="mensaje">Mensaje</Label>
              <Textarea
                id="mensaje"
                value={replyMensaje}
                onChange={(e) => setReplyMensaje(e.target.value)}
                placeholder="Escribe tu respuesta..."
                rows={8}
              />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setIsReplying(false)
                setReplyAsunto("")
                setReplyMensaje("")
              }}
              disabled={isSending}
            >
              Cancelar
            </Button>
            <Button
              onClick={enviarRespuesta}
              disabled={isSending || !replyAsunto || !replyMensaje}
              className="flex items-center gap-2"
            >
              {isSending ? (
                <>Enviando...</>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Enviar respuesta
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
