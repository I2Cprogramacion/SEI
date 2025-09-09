import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Users, FileText, Award, Lightbulb } from "lucide-react"
import Link from "next/link"

// Datos de ejemplo para campos de estudio
const camposEstudio = [
  {
    id: 1,
    nombre: "Inteligencia Artificial",
    descripcion:
      "Desarrollo de sistemas inteligentes, machine learning, deep learning y aplicaciones de IA en diversos sectores.",
    investigadores: 23,
    proyectos: 15,
    publicaciones: 67,
    instituciones: 4,
    crecimiento: 85,
    tendencia: "up",
    subcampos: ["Machine Learning", "Deep Learning", "Visión Computacional", "Procesamiento de Lenguaje Natural"],
    color: "bg-blue-100 text-blue-800",
    slug: "inteligencia-artificial",
  },
  {
    id: 2,
    nombre: "Neurociencia",
    descripcion: "Estudio del sistema nervioso, trastornos neurológicos, neuroimagen y neuroplasticidad.",
    investigadores: 18,
    proyectos: 12,
    publicaciones: 54,
    instituciones: 3,
    crecimiento: 72,
    tendencia: "up",
    subcampos: ["Neuroimagen", "Trastornos del Sueño", "Neuroplasticidad", "Neurociencia Cognitiva"],
    color: "bg-purple-100 text-purple-800",
    slug: "neurociencia",
  },
  {
    id: 3,
    nombre: "Energías Renovables",
    descripcion:
      "Investigación en energía solar, eólica, biomasa y tecnologías para la transición energética sostenible.",
    investigadores: 16,
    proyectos: 10,
    publicaciones: 42,
    instituciones: 3,
    crecimiento: 78,
    tendencia: "up",
    subcampos: ["Energía Solar", "Energía Eólica", "Biomasa", "Almacenamiento de Energía"],
    color: "bg-green-100 text-green-800",
    slug: "energias-renovables",
  },
  {
    id: 4,
    nombre: "Biotecnología",
    descripcion: "Aplicación de tecnología biológica en medicina, agricultura, industria alimentaria y medio ambiente.",
    investigadores: 14,
    proyectos: 8,
    publicaciones: 38,
    instituciones: 3,
    crecimiento: 65,
    tendencia: "up",
    subcampos: ["Biotecnología Médica", "Biotecnología Alimentaria", "Microbiología", "Ingeniería Genética"],
    color: "bg-orange-100 text-orange-800",
    slug: "biotecnologia",
  },
  {
    id: 5,
    nombre: "Ciencias Ambientales",
    descripcion: "Estudio del cambio climático, conservación de ecosistemas, contaminación y sostenibilidad ambiental.",
    investigadores: 12,
    proyectos: 9,
    publicaciones: 35,
    instituciones: 2,
    crecimiento: 70,
    tendencia: "up",
    subcampos: ["Cambio Climático", "Ecosistemas Áridos", "Conservación", "Contaminación"],
    color: "bg-teal-100 text-teal-800",
    slug: "ciencias-ambientales",
  },
  {
    id: 6,
    nombre: "Robótica",
    descripcion: "Desarrollo de robots autónomos, automatización industrial, IoT y sistemas ciberfísicos.",
    investigadores: 11,
    proyectos: 7,
    publicaciones: 29,
    instituciones: 2,
    crecimiento: 60,
    tendencia: "up",
    subcampos: ["Robótica Industrial", "Automatización", "IoT", "Sistemas Autónomos"],
    color: "bg-indigo-100 text-indigo-800",
    slug: "robotica",
  },
  {
    id: 7,
    nombre: "Ciencias Sociales",
    descripcion: "Investigación en políticas públicas, desarrollo social, estudios fronterizos y economía regional.",
    investigadores: 10,
    proyectos: 6,
    publicaciones: 24,
    instituciones: 2,
    crecimiento: 45,
    tendencia: "stable",
    subcampos: ["Políticas Públicas", "Desarrollo Social", "Estudios Fronterizos", "Economía Regional"],
    color: "bg-pink-100 text-pink-800",
    slug: "ciencias-sociales",
  },
  {
    id: 8,
    nombre: "Agricultura Sostenible",
    descripcion: "Tecnologías para agricultura de precisión, riego inteligente y cultivos en zonas áridas.",
    investigadores: 9,
    proyectos: 5,
    publicaciones: 21,
    instituciones: 2,
    crecimiento: 55,
    tendencia: "up",
    subcampos: ["Agricultura de Precisión", "Riego Inteligente", "Cultivos Áridos", "Sostenibilidad"],
    color: "bg-lime-100 text-lime-800",
    slug: "agricultura-sostenible",
  },
]

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
