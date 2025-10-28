"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Clock, Download, ExternalLink } from "lucide-react"
import { CrearConvocatoriaDialog } from "@/components/crear-convocatoria-dialog"
import { ConvocatoriaPdfViewer } from "@/components/convocatoria-pdf-viewer"

// Interfaces para tipos de datos
interface Convocatoria {
  id: string
  titulo: string
  organizacion: string
  descripcion: string
  fechaApertura: string
  fechaCierre: string
  montoMaximo: string
  categoria: string
  estado: string
  pdfUrl?: string
}

export default function ConvocatoriasPage() {
  const [convocatorias, setConvocatorias] = useState<Convocatoria[]>([])
  const [loading, setLoading] = useState(true)

  const fetchConvocatorias = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/convocatorias')
      const data = await response.json()
      setConvocatorias(data)
    } catch (error) {
      console.error("Error fetching convocatorias:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConvocatorias()
  }, [])

  // Función para formatear fechas
  const formatearFecha = (fechaStr: string) => {
    const fecha = new Date(fechaStr)
    return fecha.toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Función para determinar el color de la insignia de estado
  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "Abierta":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      case "Cerrada":
        return "bg-red-100 text-red-800 hover:bg-red-200"
      case "Próxima":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
      default:
        return "bg-blue-100 text-blue-800 hover:bg-blue-200"
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-blue-900">Convocatorias</h1>
            <p className="text-blue-600">
              Encuentra las convocatorias abiertas para financiamiento de proyectos de investigación en Chihuahua
            </p>
          </div>
          <CrearConvocatoriaDialog onConvocatoriaCreada={fetchConvocatorias} />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="bg-white border-blue-100">
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
        ) : convocatorias.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {convocatorias.map((convocatoria) => (
              <Card key={convocatoria.id} className="bg-white border-blue-100">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge className="mb-2 bg-blue-700 text-white">{convocatoria.categoria}</Badge>
                      <Badge className={`ml-2 ${getEstadoColor(convocatoria.estado)}`}>{convocatoria.estado}</Badge>
                    </div>
                  </div>
                  <CardTitle className="text-xl text-blue-900">{convocatoria.titulo}</CardTitle>
                  <CardDescription className="text-blue-600">{convocatoria.organizacion}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-blue-600 mb-4">{convocatoria.descripcion}</p>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-blue-600">
                      <CalendarDays className="mr-2 h-4 w-4" />
                      <span>
                        Apertura: {formatearFecha(convocatoria.fechaApertura)} - Cierre:{" "}
                        {formatearFecha(convocatoria.fechaCierre)}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-blue-600">
                      <Clock className="mr-2 h-4 w-4" />
                      <span>
                        {new Date(convocatoria.fechaCierre) > new Date()
                          ? `Cierra en ${Math.ceil(
                              (new Date(convocatoria.fechaCierre).getTime() - new Date().getTime()) /
                                (1000 * 60 * 60 * 24),
                            )} días`
                          : "Convocatoria cerrada"}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t border-blue-100 pt-4">
                  {convocatoria.pdfUrl ? (
                    <ConvocatoriaPdfViewer
                      pdfUrl={convocatoria.pdfUrl}
                      titulo={convocatoria.titulo}
                      triggerText="Descargar bases"
                      triggerVariant="outline"
                    />
                  ) : (
                    <Button 
                      variant="outline" 
                      className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-transparent"
                      disabled
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Sin bases disponibles
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-white border-blue-100">
            <CardContent className="pt-6 text-center py-12">
              <CalendarDays className="h-12 w-12 mx-auto text-blue-300 mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-blue-900">No hay convocatorias disponibles</h3>
              <p className="text-sm text-blue-600">Actualmente no hay convocatorias registradas en la plataforma.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
