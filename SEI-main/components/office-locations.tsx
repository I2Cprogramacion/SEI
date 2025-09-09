"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Clock } from "lucide-react"

const offices = [
  {
    id: "chihuahua",
    name: "Oficina Chihuahua",
    address: "Centro Empresarial de Chihuahua, Av. Cuauhtémoc 1800, Cuauhtémoc, 31020 Chihuahua, Chih., México",
    hours: "Lunes a Viernes: 8:00 AM - 4:00 PM",
    coordinates: "28.6307269,-106.0809655",
    embedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3515.123456789!2d-106.0809655!3d28.6307269!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x86ea5cb350080b01:0x4ea88608722fd97a!2sCentro%20Empresarial%20de%20Chihuahua!5e0!3m2!1ses!2smx!4v1640995200000!5m2!1ses!2smx",
  },
  {
    id: "juarez",
    name: "Oficina Ciudad Juárez",
    address: "Av. Abraham Lincoln 1290, 32000 Juárez, Chih., México",
    hours: "Lunes a Viernes: 8:00 AM - 4:00 PM",
    coordinates: "31.7499011,-106.4521279",
    embedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3462.123456789!2d-106.4521279!3d31.7499011!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x86e75968007a0975:0xe7eef5adc1d15628!2sRegistro%20Civil%20Pueblito%20Mexicano!5e0!3m2!1ses!2smx!4v1640995200000!5m2!1ses!2smx",
    mapLink: "https://maps.app.goo.gl/iFZRTC1oxZhzJCgs9",
  },
]

export function OfficeLocations() {
  return (
    <section className="py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4 text-blue-900">Nuestras Oficinas</h2>
        <p className="text-blue-600 max-w-2xl mx-auto">
          Visítanos en cualquiera de nuestras dos ubicaciones en el estado de Chihuahua
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {offices.map((office) => (
          <Card key={office.id} className="bg-white border-blue-100 overflow-hidden">
            <CardHeader className="bg-blue-50 border-b border-blue-100">
              <CardTitle className="text-blue-900 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {office.name}
              </CardTitle>
            </CardHeader>

            <CardContent className="p-0">
              {/* Mapa */}
              <div className="h-64 bg-blue-50">
                <iframe
                  src={office.embedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`Mapa de ${office.name}`}
                  onError={(e) => {
                    const target = e.target as HTMLIFrameElement
                    const parent = target.parentElement
                    if (parent) {
                      parent.innerHTML = `
                        <div class="flex items-center justify-center h-full bg-gradient-to-br from-blue-50 to-blue-100">
                          <div class="text-center p-6">
                            <div class="text-blue-600 mb-3">
                              <svg class="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <h3 class="text-blue-900 font-semibold text-lg mb-2">${office.name}</h3>
                            <p class="text-blue-600 text-sm leading-relaxed">${office.address}</p>
                            ${
                              office.mapLink
                                ? `
                              <div class="mt-3">
                                <a href="${office.mapLink}" target="_blank" rel="noopener noreferrer" 
                                   class="inline-block px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors">
                                  Ver ubicación exacta
                                </a>
                              </div>
                            `
                                : ""
                            }
                          </div>
                        </div>
                      `
                    }
                  }}
                />
              </div>

              {/* Información simplificada */}
              <div className="p-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-blue-900 font-medium leading-relaxed">{office.address}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-900">{office.hours}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
