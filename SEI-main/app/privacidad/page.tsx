import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Shield, Eye, Lock, Users, Database, AlertCircle, Calendar } from "lucide-react"

export default function PrivacidadPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-blue-900">Política de Privacidad</h1>
          <p className="text-blue-600">Sistema Estatal de Ciencia, Tecnología e Innovación de Chihuahua (SECCTI)</p>
          <div className="flex items-center justify-center gap-2">
            <Calendar className="h-4 w-4 text-blue-500" />
            <span className="text-sm text-blue-600">Última actualización: 15 de enero de 2024</span>
          </div>
        </div>

        <Card className="border-blue-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Shield className="h-5 w-5" />
              Compromiso con su Privacidad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-700">
              SECCTI se compromete a proteger su privacidad y cumplir con la Ley Federal de Protección de Datos
              Personales en Posesión de los Particulares (LFPDPPP) y demás normativas aplicables en México.
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Database className="h-5 w-5" />
              Información que Recopilamos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-blue-800 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Datos Personales
                </h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Nombre completo</li>
                  <li>• Correo electrónico</li>
                  <li>• Teléfono</li>
                  <li>• Institución de afiliación</li>
                  <li>• Grado académico</li>
                  <li>• Área de especialización</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-blue-800 flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Datos Técnicos
                </h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Dirección IP</li>
                  <li>• Tipo de navegador</li>
                  <li>• Páginas visitadas</li>
                  <li>• Tiempo de sesión</li>
                  <li>• Cookies técnicas</li>
                  <li>• Datos de uso de la plataforma</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <AlertCircle className="h-5 w-5" />
              Finalidades del Tratamiento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <Badge className="bg-green-100 text-green-800 mb-2">Finalidades Primarias</Badge>
                <ul className="text-blue-700 space-y-1 ml-4">
                  <li>• Crear y gestionar su perfil de investigador</li>
                  <li>• Facilitar la colaboración científica</li>
                  <li>• Proporcionar acceso a convocatorias</li>
                  <li>• Comunicar información relevante del sistema</li>
                </ul>
              </div>
              <div>
                <Badge className="bg-blue-100 text-blue-800 mb-2">Finalidades Secundarias</Badge>
                <ul className="text-blue-700 space-y-1 ml-4">
                  <li>• Análisis estadístico y mejora de servicios</li>
                  <li>• Envío de boletines informativos</li>
                  <li>• Invitaciones a eventos académicos</li>
                  <li>• Estudios de mercado y satisfacción</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Users className="h-5 w-5" />
              Sus Derechos ARCO
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-blue-700 mb-4">
              Usted tiene derecho a ejercer los siguientes derechos sobre sus datos personales:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-blue-800">🔍 Acceso</h4>
                <p className="text-sm text-blue-700">Conocer qué datos tenemos sobre usted</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-blue-800">✏️ Rectificación</h4>
                <p className="text-sm text-blue-700">Corregir datos inexactos o incompletos</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-blue-800">🗑️ Cancelación</h4>
                <p className="text-sm text-blue-700">Solicitar la eliminación de sus datos</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-blue-800">🚫 Oposición</h4>
                <p className="text-sm text-blue-700">Oponerse al tratamiento de sus datos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Lock className="h-5 w-5" />
              Medidas de Seguridad
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-blue-700">Implementamos medidas técnicas y organizacionales para proteger sus datos:</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Lock className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                <h4 className="font-semibold text-blue-800">Cifrado</h4>
                <p className="text-sm text-blue-700">SSL/TLS en todas las comunicaciones</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Shield className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                <h4 className="font-semibold text-blue-800">Acceso Controlado</h4>
                <p className="text-sm text-blue-700">Solo personal autorizado</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Database className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                <h4 className="font-semibold text-blue-800">Respaldos</h4>
                <p className="text-sm text-blue-700">Copias de seguridad regulares</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <AlertCircle className="h-5 w-5" />
              Retención y Transferencias
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-blue-800">Tiempo de Retención</h4>
              <p className="text-blue-700">
                Conservamos sus datos mientras mantenga su cuenta activa o según lo requieran las obligaciones legales
                aplicables.
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-blue-800">Transferencias</h4>
              <p className="text-blue-700">
                Sus datos pueden ser compartidos con instituciones académicas colaboradoras únicamente para fines de
                investigación, previa autorización.
              </p>
            </div>
          </CardContent>
        </Card>

        <Separator className="my-8" />

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h3 className="font-semibold text-blue-900">Contacto para Ejercer sus Derechos</h3>
              <p className="text-blue-700">Para ejercer sus derechos ARCO o resolver dudas sobre privacidad:</p>
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
