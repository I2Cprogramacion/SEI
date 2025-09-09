"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Phone, Mail, ExternalLink, Navigation, Clock } from "lucide-react"

// Definir las ubicaciones
const ubicaciones = [
  {
    id: 1,
    nombre: "Oficina Chihuahua",
    supervisor: "Irma Gabriela Miranda Alcalá",
    cargo: "Supervisora Administrativa – Unidad de Ciencia y Tecnología",
    direccion: "Calle Cuauhtémoc #1800 int.3 Col. Cuauhtémoc C.P. 31020 Chihuahua, Chih. (Edificio Empresarial)",
    telefono: "(614) 415.09.86",
    email: "g.miranda@i2c.com.mx",
    coordenadas: { lat: 28.6353, lng: -106.0889 },
    horarios: "Lunes a Viernes: 8:00 AM - 5:00 PM",
    servicios: ["Registro de Investigadores", "Convocatorias", "Asesoría Técnica", "Trámites Administrativos"],
  },
  {
    id: 2,
    nombre: "Oficina Ciudad Juárez",
    supervisor: "Lic. Carlos Andrés Martínez Mijares",
    cargo: "Supervisor Administrativo – Unidad de Transparencia",
    direccion:
      "Av. Abraham Lincoln #1320, Edificio José Ma. Morelos Oficinas administrativas de Gobierno del Estado (Pueblito Mexicano) Fracc. Córdova Américas, C.P. 32310 Ciudad Juárez, Chih.",
    telefono: "(656) 629 33 00. Ext: 54931",
    email: "a.martinez@i2c.com.mx",
    coordenadas: { lat: 31.6904, lng: -106.4245 },
    horarios: "Lunes a Viernes: 8:00 AM - 5:00 PM",
    servicios: ["Transparencia", "Acceso a la Información", "Asesoría Legal", "Trámites Gubernamentales"],
  },
]

export default function UbicacionesPage() {
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null)

  const openInGoogleMaps = (direccion: string) => {
    const encodedAddress = encodeURIComponent(direccion)
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, "_blank")
  }

  const getDirections = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank")
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-blue-900">Nuestras Ubicaciones</h1>
          <p className="text-blue-600">
            Visítanos en nuestras oficinas en Chihuahua y Ciudad Juárez para recibir atención personalizada
          </p>
        </div>

        {/* Mapa estático como placeholder */}
        <Card className="border-blue-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <MapPin className="h-5 w-5" />
              Ubicaciones en Chihuahua
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full h-96 rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
              <div className="text-center space-y-4">
                <MapPin className="h-16 w-16 text-blue-400 mx-auto" />
                <div>
                  <h3 className="text-lg font-semibold text-blue-900">Dos Oficinas Principales</h3>
                  <p className="text-blue-600">Chihuahua Capital y Ciudad Juárez</p>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  {ubicaciones.map((ubicacion) => (
                    <Button
                      key={ubicacion.id}
                      variant="outline"
                      size="sm"
                      onClick={() => openInGoogleMaps(ubicacion.direccion)}
                      className="border-blue-200 text-blue-700 hover:bg-blue-50"
                    >
                      Ver {ubicacion.nombre} en Maps
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-sm text-blue-600 mt-2">Haz clic en los botones para ver cada ubicación en Google Maps</p>
          </CardContent>
        </Card>

        {/* Información de las oficinas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {ubicaciones.map((ubicacion) => (
            <Card
              key={ubicacion.id}
              className={`border-blue-100 transition-all duration-200 ${
                selectedLocation === ubicacion.id ? "ring-2 ring-blue-300 shadow-lg" : ""
              }`}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl text-blue-900 mb-2">{ubicacion.nombre}</CardTitle>
                    <Badge className="bg-blue-700 text-white mb-2">{ubicacion.cargo.split("–")[1]?.trim()}</Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => getDirections(ubicacion.coordenadas.lat, ubicacion.coordenadas.lng)}
                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    <Navigation className="h-4 w-4 mr-1" />
                    Cómo llegar
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-1">Responsable</h4>
                    <p className="text-blue-700">{ubicacion.supervisor}</p>
                    <p className="text-sm text-blue-600">{ubicacion.cargo}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-blue-500 mt-1 flex-shrink-0" />
                      <p className="text-sm text-blue-700">{ubicacion.direccion}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-blue-500" />
                      <a href={`tel:${ubicacion.telefono}`} className="text-sm text-blue-700 hover:underline">
                        {ubicacion.telefono}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-blue-500" />
                      <a href={`mailto:${ubicacion.email}`} className="text-sm text-blue-700 hover:underline">
                        {ubicacion.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <p className="text-sm text-blue-700">{ubicacion.horarios}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-blue-800 mb-2">Servicios Disponibles</h4>
                    <div className="flex flex-wrap gap-1">
                      {ubicacion.servicios.map((servicio, index) => (
                        <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700 text-xs">
                          {servicio}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openInGoogleMaps(ubicacion.direccion)}
                    className="border-blue-200 text-blue-700 hover:bg-blue-50 flex-1"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Ver en Maps
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`mailto:${ubicacion.email}`, "_blank")}
                    className="border-blue-200 text-blue-700 hover:bg-blue-50 flex-1"
                  >
                    <Mail className="h-4 w-4 mr-1" />
                    Enviar Email
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Información adicional */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h3 className="font-semibold text-blue-900">¿Necesitas ayuda?</h3>
              <p className="text-blue-700">
                Nuestro equipo está disponible para apoyarte con el registro en el Sistema Estatal de Investigadores,
                trámites administrativos, y cualquier consulta sobre convocatorias y oportunidades de financiamiento.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Badge className="bg-blue-700 text-white">Atención Personalizada</Badge>
                <Badge className="bg-blue-700 text-white">Asesoría Técnica</Badge>
                <Badge className="bg-blue-700 text-white">Soporte Administrativo</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sección de contacto rápido */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Contacto Telefónico
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-green-700 mb-2">Llámanos directamente para consultas urgentes:</p>
              <div className="space-y-1">
                <p className="font-medium text-green-800">Chihuahua: (614) 415.09.86</p>
                <p className="font-medium text-green-800">Ciudad Juárez: (656) 629 33 00 Ext: 54931</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="text-purple-800 flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Contacto por Email
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-purple-700 mb-2">Envíanos un correo para consultas detalladas:</p>
              <div className="space-y-1">
                <p className="font-medium text-purple-800">g.miranda@i2c.com.mx</p>
                <p className="font-medium text-purple-800">a.martinez@i2c.com.mx</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
