"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  UserPlus,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  Mail,
  Check,
  X,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { useToast } from "@/hooks/use-toast"

interface Conexion {
  id: number
  estado: "pendiente" | "aceptada" | "rechazada"
  fecha_solicitud: string
  fecha_respuesta?: string
  id_conexion: number
  nombre: string
  email: string
  fotografia_url?: string
  institucion?: string
  es_destinatario?: boolean
}

export default function ConexionesPage() {
  const [conexiones, setConexiones] = useState<Conexion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [processingId, setProcessingId] = useState<number | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchConexiones()
  }, [])

  const fetchConexiones = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/conexiones")
      if (response.ok) {
        const data = await response.json()
        setConexiones(data)
      }
    } catch (error) {
      console.error("Error al cargar conexiones:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRespuesta = async (conexionId: number, estado: "aceptada" | "rechazada") => {
    try {
      setProcessingId(conexionId)
      const response = await fetch("/api/conexiones", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conexionId, estado }),
      })

      if (response.ok) {
        toast({
          title: estado === "aceptada" ? "¡Conexión aceptada!" : "Solicitud rechazada",
          description:
            estado === "aceptada"
              ? "Ahora estás conectado con este investigador"
              : "Has rechazado esta solicitud de conexión",
        })
        fetchConexiones() // Recargar conexiones
      } else {
        throw new Error("Error al procesar solicitud")
      }
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "No se pudo procesar la solicitud",
        variant: "destructive",
      })
    } finally {
      setProcessingId(null)
    }
  }

  const conexionesAceptadas = conexiones.filter((c) => c.estado === "aceptada")
  const conexionesPendientes = conexiones.filter((c) => c.estado === "pendiente")
  const conexionesRechazadas = conexiones.filter((c) => c.estado === "rechazada")

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "aceptada":
        return <Badge className="bg-green-500">Conectado</Badge>
      case "pendiente":
        return <Badge className="bg-orange-500">Pendiente</Badge>
      case "rechazada":
        return <Badge className="bg-red-500">Rechazada</Badge>
      default:
        return null
    }
  }

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
        <h1 className="text-3xl font-bold text-blue-900 mb-2">Mis Conexiones</h1>
        <p className="text-blue-600">Red de colaboración con otros investigadores</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-900">{conexionesAceptadas.length}</p>
                <p className="text-sm text-green-600">Conectados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-full">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-900">{conexionesPendientes.length}</p>
                <p className="text-sm text-orange-600">Pendientes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-900">{conexiones.length}</p>
                <p className="text-sm text-blue-600">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de conexiones */}
      <div className="space-y-6">
        {/* Conexiones activas */}
        <div>
          <h2 className="text-xl font-semibold text-blue-900 mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Conectados ({conexionesAceptadas.length})
          </h2>
          {conexionesAceptadas.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center py-8">
                <Users className="h-12 w-12 text-blue-300 mx-auto mb-4" />
                <p className="text-blue-600">No tienes conexiones activas aún</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {conexionesAceptadas.map((conexion) => (
                <Card key={conexion.id} className="hover:shadow-md transition-all">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={conexion.fotografia_url} />
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {conexion.nombre
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-blue-900">{conexion.nombre}</h3>
                            {conexion.institucion && (
                              <p className="text-sm text-blue-600 flex items-center gap-1 mt-1">
                                <Building2 className="h-3 w-3" />
                                {conexion.institucion}
                              </p>
                            )}
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                              <Mail className="h-3 w-3" />
                              {conexion.email}
                            </p>
                          </div>
                          {getEstadoBadge(conexion.estado)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Conectado{" "}
                          {formatDistanceToNow(new Date(conexion.fecha_respuesta || conexion.fecha_solicitud), {
                            addSuffix: true,
                            locale: es,
                          })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Conexiones pendientes */}
        {conexionesPendientes.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-blue-900 mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              Solicitudes Pendientes ({conexionesPendientes.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {conexionesPendientes.map((conexion) => (
                <Card key={conexion.id} className="border-l-4 border-l-orange-500">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={conexion.fotografia_url} />
                        <AvatarFallback className="bg-orange-100 text-orange-600">
                          {conexion.nombre
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-blue-900">{conexion.nombre}</h3>
                            {conexion.institucion && (
                              <p className="text-sm text-blue-600 flex items-center gap-1 mt-1">
                                <Building2 className="h-3 w-3" />
                                {conexion.institucion}
                              </p>
                            )}
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                              <Mail className="h-3 w-3" />
                              {conexion.email}
                            </p>
                          </div>
                          {getEstadoBadge(conexion.estado)}
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">
                          Solicitud enviada{" "}
                          {formatDistanceToNow(new Date(conexion.fecha_solicitud), {
                            addSuffix: true,
                            locale: es,
                          })}
                        </p>
                        {conexion.es_destinatario && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleRespuesta(conexion.id, "aceptada")}
                              disabled={processingId === conexion.id}
                              className="flex-1 bg-green-600 hover:bg-green-700"
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Aceptar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRespuesta(conexion.id, "rechazada")}
                              disabled={processingId === conexion.id}
                              className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Rechazar
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
