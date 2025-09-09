import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { FileText, Shield, Users, AlertTriangle, Scale, Calendar } from "lucide-react"

export default function TerminosPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-blue-900">Términos de Servicio</h1>
          <p className="text-blue-600">Sistema Estatal de Ciencia, Tecnología e Innovación de Chihuahua (SECCTI)</p>
          <div className="flex items-center justify-center gap-2">
            <Calendar className="h-4 w-4 text-blue-500" />
            <span className="text-sm text-blue-600">Última actualización: 15 de enero de 2024</span>
          </div>
        </div>

        <Card className="border-blue-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <FileText className="h-5 w-5" />
              1. Aceptación de los Términos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-blue-700">
              Al acceder y utilizar la plataforma del Sistema Estatal de Investigadores de Chihuahua (SEI), usted acepta
              estar sujeto a estos términos de servicio y todas las leyes y regulaciones aplicables.
            </p>
            <p className="text-blue-700">
              Si no está de acuerdo con alguno de estos términos, no debe utilizar este sitio web.
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Users className="h-5 w-5" />
              2. Descripción del Servicio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-blue-700">El SEI es una plataforma digital que facilita:</p>
            <ul className="list-disc list-inside space-y-2 text-blue-700 ml-4">
              <li>Registro y gestión de perfiles de investigadores</li>
              <li>Publicación y búsqueda de proyectos de investigación</li>
              <li>Colaboración entre investigadores e instituciones</li>
              <li>Acceso a convocatorias y oportunidades de financiamiento</li>
              <li>Difusión de resultados de investigación</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-blue-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Shield className="h-5 w-5" />
              3. Registro y Responsabilidades del Usuario
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-blue-800">3.1 Elegibilidad</h4>
              <p className="text-blue-700">
                Para registrarse debe ser investigador, académico, estudiante de posgrado o representante de una
                institución de investigación reconocida.
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-blue-800">3.2 Veracidad de la Información</h4>
              <p className="text-blue-700">
                Usted se compromete a proporcionar información veraz, precisa y actualizada. La información falsa puede
                resultar en la suspensión de su cuenta.
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-blue-800">3.3 Seguridad de la Cuenta</h4>
              <p className="text-blue-700">
                Es responsable de mantener la confidencialidad de sus credenciales de acceso y de todas las actividades
                realizadas bajo su cuenta.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <AlertTriangle className="h-5 w-5" />
              4. Uso Aceptable
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-green-800">✓ Permitido:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Compartir investigación académica</li>
                  <li>• Colaborar con otros investigadores</li>
                  <li>• Publicar resultados científicos</li>
                  <li>• Buscar oportunidades de financiamiento</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-red-800">✗ Prohibido:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Publicar contenido falso o plagiado</li>
                  <li>• Usar la plataforma con fines comerciales</li>
                  <li>• Compartir información confidencial</li>
                  <li>• Realizar actividades ilegales</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Scale className="h-5 w-5" />
              5. Propiedad Intelectual
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-blue-700">
              Los usuarios conservan todos los derechos de propiedad intelectual sobre el contenido que publican. Al
              publicar contenido, otorgan a SECCTI una licencia no exclusiva para mostrar, distribuir y promover dicho
              contenido dentro de la plataforma.
            </p>
            <Badge className="bg-blue-100 text-blue-800">Respeto a la Propiedad Intelectual</Badge>
          </CardContent>
        </Card>

        <Card className="border-blue-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Shield className="h-5 w-5" />
              6. Limitación de Responsabilidad
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-blue-700">
              SECCTI no será responsable por daños directos, indirectos, incidentales o consecuentes que resulten del
              uso de esta plataforma. El servicio se proporciona "tal como está" sin garantías de ningún tipo.
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Scale className="h-5 w-5" />
              7. Jurisdicción y Ley Aplicable
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-blue-700">
              Estos términos se rigen por las leyes de México y del Estado de Chihuahua. Cualquier disputa será resuelta
              en los tribunales competentes de Chihuahua, México.
            </p>
          </CardContent>
        </Card>

        <Separator className="my-8" />

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h3 className="font-semibold text-blue-900">Contacto</h3>
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
