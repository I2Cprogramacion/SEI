import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Users, FileText, Award, Lightbulb } from "lucide-react"
import Link from "next/link"

// Campos de estudio (por ahora vacíos)
const camposEstudio: any[] = []

export default function CamposPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-blue-900">Campos de Investigación</h1>
          <p className="text-blue-600">
            Explora las diferentes áreas de conocimiento y especialización de los investigadores en Chihuahua
          </p>
        </div>

        {/* Estadísticas generales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white border-blue-100 text-center">
            <CardContent className="pt-6">
              <Lightbulb className="h-8 w-8 mx-auto text-blue-600 mb-2" />
              <div className="text-2xl font-bold text-blue-900">{camposEstudio.length}</div>
              <p className="text-sm text-blue-600">Campos activos</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-blue-100 text-center">
            <CardContent className="pt-6">
              <Users className="h-8 w-8 mx-auto text-blue-600 mb-2" />
              <div className="text-2xl font-bold text-blue-900">
                {camposEstudio.reduce((sum, campo) => sum + campo.investigadores, 0)}
              </div>
              <p className="text-sm text-blue-600">Investigadores</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-blue-100 text-center">
            <CardContent className="pt-6">
              <FileText className="h-8 w-8 mx-auto text-blue-600 mb-2" />
              <div className="text-2xl font-bold text-blue-900">
                {camposEstudio.reduce((sum, campo) => sum + campo.proyectos, 0)}
              </div>
              <p className="text-sm text-blue-600">Proyectos</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-blue-100 text-center">
            <CardContent className="pt-6">
              <Award className="h-8 w-8 mx-auto text-blue-600 mb-2" />
              <div className="text-2xl font-bold text-blue-900">
                {camposEstudio.reduce((sum, campo) => sum + campo.publicaciones, 0)}
              </div>
              <p className="text-sm text-blue-600">Publicaciones</p>
            </CardContent>
          </Card>
        </div>

        {/* Lista de campos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {camposEstudio.map((campo) => (
            <Link href={`/campos/${campo.slug}`} key={campo.id}>
              <Card className="bg-white border-blue-100 hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={campo.color}>{campo.nombre}</Badge>
                        <div className="flex items-center gap-1">
                          <TrendingUp
                            className={`h-4 w-4 ${campo.tendencia === "up" ? "text-green-500" : "text-blue-500"}`}
                          />
                          <span className="text-xs text-blue-600">{campo.crecimiento}% actividad</span>
                        </div>
                      </div>
                      <CardTitle className="text-xl text-blue-900">{campo.nombre}</CardTitle>
                      <CardDescription className="text-blue-600">{campo.descripcion}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Estadísticas del campo */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-blue-600">Investigadores</span>
                          <span className="font-medium text-blue-900">{campo.investigadores}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-blue-600">Proyectos</span>
                          <span className="font-medium text-blue-900">{campo.proyectos}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-blue-600">Publicaciones</span>
                          <span className="font-medium text-blue-900">{campo.publicaciones}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-blue-600">Instituciones</span>
                          <span className="font-medium text-blue-900">{campo.instituciones}</span>
                        </div>
                      </div>
                    </div>

                    {/* Barra de progreso de actividad */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-blue-600">Nivel de actividad</span>
                        <span className="text-blue-900 font-medium">{campo.crecimiento}%</span>
                      </div>
                      <Progress value={campo.crecimiento} className="h-2" />
                    </div>

                    {/* Subcampos */}
                    <div>
                      <h4 className="font-medium text-blue-900 mb-2 text-sm">Especialidades:</h4>
                      <div className="flex flex-wrap gap-1">
                        {campo.subcampos.slice(0, 3).map((subcampo, index) => (
                          <Badge key={index} variant="outline" className="border-blue-200 text-blue-700 text-xs">
                            {subcampo}
                          </Badge>
                        ))}
                        {campo.subcampos.length > 3 && (
                          <Badge variant="outline" className="border-blue-200 text-blue-700 text-xs">
                            +{campo.subcampos.length - 3} más
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Sección de tendencias */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Tendencias de Investigación</CardTitle>
            <CardDescription className="text-blue-700">
              Campos con mayor crecimiento y actividad en los últimos años
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {camposEstudio
                .sort((a, b) => b.crecimiento - a.crecimiento)
                .slice(0, 3)
                .map((campo, index) => (
                  <div
                    key={campo.id}
                    className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-100"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-700 font-bold text-sm">{index + 1}</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-blue-900 text-sm">{campo.nombre}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <TrendingUp className="h-3 w-3 text-green-500" />
                        <span className="text-xs text-blue-600">{campo.crecimiento}% crecimiento</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
