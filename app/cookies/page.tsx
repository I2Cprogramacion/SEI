import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Cookie, Settings, BarChart3, Shield, Calendar, AlertCircle } from "lucide-react"

export default function CookiesPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-blue-900">Política de Cookies</h1>
          <p className="text-blue-600">Sistema Estatal de Ciencia, Tecnología e Innovación de Chihuahua (SECCTI)</p>
          <div className="flex items-center justify-center gap-2">
            <Calendar className="h-4 w-4 text-blue-500" />
            <span className="text-sm text-blue-600">Última actualización: 15 de enero de 2024</span>
          </div>
        </div>

        <Card className="border-blue-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Cookie className="h-5 w-5" />
              ¿Qué son las Cookies?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-700">
              Las cookies son pequeños archivos de texto que se almacenan en su dispositivo cuando visita nuestro sitio
              web. Nos ayudan a mejorar su experiencia, recordar sus preferencias y proporcionar funcionalidades
              esenciales de la plataforma.
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Settings className="h-5 w-5" />
              Tipos de Cookies que Utilizamos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="border-l-4 border-green-500 pl-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  <h4 className="font-semibold text-blue-800">Cookies Esenciales</h4>
                  <Badge className="bg-green-100 text-green-800">Siempre Activas</Badge>
                </div>
                <p className="text-blue-700 mb-2">Necesarias para el funcionamiento básico del sitio web.</p>
                <ul className="text-sm text-blue-600 space-y-1">
                  <li>• Autenticación de sesión</li>
                  <li>• Preferencias de idioma</li>
                  <li>• Configuración de seguridad</li>
                  <li>• Funcionalidad del carrito/formularios</li>
                </ul>
              </div>

              <div className="border-l-4 border-blue-500 pl-4">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  <h4 className="font-semibold text-blue-800">Cookies de Análisis</h4>
                  <Badge className="bg-blue-100 text-blue-800">Opcional</Badge>
                </div>
                <p className="text-blue-700 mb-2">
                  Nos ayudan a entender cómo los usuarios interactúan con nuestro sitio.
                </p>
                <ul className="text-sm text-blue-600 space-y-1">
                  <li>• Google Analytics (tráfico y comportamiento)</li>
                  <li>• Vercel Analytics (rendimiento)</li>
                  <li>• Estadísticas de uso de páginas</li>
                  <li>• Tiempo de permanencia en el sitio</li>
                </ul>
              </div>

              <div className="border-l-4 border-purple-500 pl-4">
                <div className="flex items-center gap-2 mb-2">
                  <Settings className="h-5 w-5 text-purple-600" />
                  <h4 className="font-semibold text-blue-800">Cookies de Funcionalidad</h4>
                  <Badge className="bg-purple-100 text-purple-800">Opcional</Badge>
                </div>
                <p className="text-blue-700 mb-2">Mejoran la experiencia del usuario recordando preferencias.</p>
                <ul className="text-sm text-blue-600 space-y-1">
                  <li>• Tema oscuro/claro</li>
                  <li>• Filtros de búsqueda guardados</li>
                  <li>• Configuración de notificaciones</li>
                  <li>• Preferencias de visualización</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <AlertCircle className="h-5 w-5" />
              Cookies de Terceros
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-blue-700 mb-4">
              Algunos servicios de terceros pueden establecer cookies en nuestro sitio:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Google Analytics</h4>
                <p className="text-sm text-blue-700 mb-2">Analiza el tráfico y comportamiento de usuarios</p>
                <Badge variant="outline" className="text-xs">
                  _ga, _gid, _gat
                </Badge>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Vercel Analytics</h4>
                <p className="text-sm text-blue-700 mb-2">Monitorea el rendimiento del sitio web</p>
                <Badge variant="outline" className="text-xs">
                  __vercel_live_token
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Settings className="h-5 w-5" />
              Control de Cookies
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-blue-800 mb-2">Configuración del Navegador</h4>
                <p className="text-blue-700 mb-2">
                  Puede controlar las cookies a través de la configuración de su navegador:
                </p>
                <ul className="text-sm text-blue-600 space-y-1 ml-4">
                  <li>• Bloquear todas las cookies</li>
                  <li>• Permitir solo cookies esenciales</li>
                  <li>• Eliminar cookies existentes</li>
                  <li>• Recibir notificaciones antes de aceptar cookies</li>
                </ul>
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <h4 className="font-semibold text-yellow-800">Importante</h4>
                </div>
                <p className="text-sm text-yellow-700">
                  Deshabilitar las cookies esenciales puede afectar la funcionalidad del sitio web y su capacidad para
                  acceder a ciertas características.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Shield className="h-5 w-5" />
              Gestión de Consentimiento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-blue-700">
              Al continuar navegando en nuestro sitio web, usted acepta el uso de cookies según se describe en esta
              política. Puede cambiar sus preferencias en cualquier momento.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 rounded-lg text-center">
                <h4 className="font-semibold text-green-800 mb-2">✓ Aceptar Todas</h4>
                <p className="text-sm text-green-700">Permite todas las cookies para una experiencia completa</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg text-center">
                <h4 className="font-semibold text-blue-800 mb-2">⚙️ Personalizar</h4>
                <p className="text-sm text-blue-700">Elija qué tipos de cookies desea permitir</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator className="my-8" />

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h3 className="font-semibold text-blue-900">¿Preguntas sobre Cookies?</h3>
              <p className="text-blue-700">Si tiene dudas sobre nuestra política de cookies, contáctenos:</p>
              <div className="grid md:grid-cols-2 gap-6 text-sm text-blue-600">
                <div className="space-y-2">
                  <p className="font-semibold">Supervisora Administrativa – Unidad de Ciencia y Tecnología</p>
                  <p>Irma Gabriela Miranda Alcalá</p>
                  <p>
                    <strong>Email:</strong> g.miranda@i2c.com.mx
                  </p>
                  <p>
                    <strong>Tel. Chihuahua:</strong> (614) 415.09.86
                  </p>
                  <p>
                    <strong>Cd. Juárez:</strong> (656) 629 33 00. Ext: 54902
                  </p>
                  <p>
                    <strong>Dirección:</strong> Calle Cuauhtémoc #1800 int.3 Col. Cuauhtémoc C.P. 31020 Chihuahua, Chih.
                    (Edificio Empresarial)
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="font-semibold">Supervisor Administrativo – Unidad de Transparencia</p>
                  <p>Lic. Carlos Andrés Martínez Mijares</p>
                  <p>
                    <strong>Email:</strong> a.martinez@i2c.com.mx
                  </p>
                  <p>
                    <strong>Tel. Chihuahua:</strong> (614) 415.09.86
                  </p>
                  <p>
                    <strong>Cd. Juárez:</strong> (656) 629 33 00. Ext: 54931
                  </p>
                  <p>
                    <strong>Dirección:</strong> Av. Abraham Lincoln #1320, Edificio José Ma. Morelos Oficinas
                    administrativas de Gobierno del Estado (Pueblito Mexicano) Fracc. Córdova Américas, C.P. 32310
                    Ciudad Juárez, Chih.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
