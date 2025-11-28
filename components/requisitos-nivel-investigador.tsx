"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { 
  Info, 
  BookOpen, 
  FileText, 
  Users, 
  Award,
  CheckCircle2,
  AlertCircle
} from "lucide-react"
import { getParametrosSNII, mapearNivelAId } from "@/lib/snii-parametros"

interface RequisitosNivelInvestigadorProps {
  nivelInvestigador: string
  areaInvestigacion: string
}

export function RequisitosNivelInvestigador({
  nivelInvestigador,
  areaInvestigacion
}: RequisitosNivelInvestigadorProps) {
  const [requisitos, setRequisitos] = useState<any>(null)
  const [nivelSNII, setNivelSNII] = useState<string>("")

  useEffect(() => {
    // Solo mostrar si hay nivel de investigador seleccionado
    if (!nivelInvestigador) {
      setRequisitos(null)
      setNivelSNII("")
      return
    }

    // Mapear nivel de investigador estatal a nivel SNII
    const nivelId = mapearNivelAId(nivelInvestigador)
    
    if (nivelId && areaInvestigacion) {
      const params = getParametrosSNII(areaInvestigacion, nivelId)
      setRequisitos(params)
      setNivelSNII(nivelInvestigador)
    } else {
      setRequisitos(null)
      setNivelSNII("")
    }
  }, [nivelInvestigador, areaInvestigacion])

  // No mostrar nada si no hay nivel seleccionado
  if (!nivelInvestigador) {
    return null
  }

  // Mensaje si falta el área de investigación
  if (!areaInvestigacion) {
    return (
      <Alert className="bg-amber-50 border-amber-200">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-800">Selecciona tu área de investigación</AlertTitle>
        <AlertDescription className="text-amber-700">
          Primero debes seleccionar tu área de investigación para ver los requisitos específicos de tu nivel.
        </AlertDescription>
      </Alert>
    )
  }

  // Mensaje si no se encontraron requisitos
  if (!requisitos) {
    return (
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-800">Información no disponible</AlertTitle>
        <AlertDescription className="text-blue-700">
          No se encontraron requisitos específicos para el nivel seleccionado.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-blue-900 flex items-center gap-2">
          <Award className="h-5 w-5" />
          Requisitos para {nivelSNII}
        </CardTitle>
        <p className="text-xs text-blue-700 mt-1">
          Área: <span className="font-semibold">{areaInvestigacion}</span>
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Descripción general */}
        {requisitos.descripcion && (
          <Alert className="bg-white border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-sm text-gray-700">
              {requisitos.descripcion}
            </AlertDescription>
          </Alert>
        )}

        {/* Requisitos de artículos */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-blue-900 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Producción Científica Requerida
          </h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Artículos Q1 */}
            {requisitos.articulos_q1 !== undefined && (
              <Card className="bg-white border-green-200">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600">Artículos Q1</p>
                      <p className="text-2xl font-bold text-green-700">
                        {requisitos.articulos_q1}
                      </p>
                    </div>
                    <Badge className="bg-green-100 text-green-800 border-green-300">
                      Alto Impacto
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Publicaciones en revistas del primer cuartil
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Artículos Q2 */}
            {requisitos.articulos_q2 !== undefined && (
              <Card className="bg-white border-blue-200">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600">Artículos Q2</p>
                      <p className="text-2xl font-bold text-blue-700">
                        {requisitos.articulos_q2}
                      </p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                      Medio Alto
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Publicaciones en revistas del segundo cuartil
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Artículos Q3 */}
            {requisitos.articulos_q3 !== undefined && (
              <Card className="bg-white border-amber-200">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600">Artículos Q3</p>
                      <p className="text-2xl font-bold text-amber-700">
                        {requisitos.articulos_q3}
                      </p>
                    </div>
                    <Badge className="bg-amber-100 text-amber-800 border-amber-300">
                      Medio
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Publicaciones en revistas del tercer cuartil
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Otros requisitos */}
        {(requisitos.libros || requisitos.capitulos || requisitos.formacion_rh) && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-blue-900 flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Otros Requisitos
            </h4>
            
            <div className="space-y-2">
              {requisitos.libros !== undefined && requisitos.libros > 0 && (
                <div className="flex items-center justify-between bg-white rounded-lg p-2 border border-gray-200">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Libros publicados</span>
                  </div>
                  <Badge variant="outline" className="text-blue-700 border-blue-300">
                    Mínimo {requisitos.libros}
                  </Badge>
                </div>
              )}

              {requisitos.capitulos !== undefined && requisitos.capitulos > 0 && (
                <div className="flex items-center justify-between bg-white rounded-lg p-2 border border-gray-200">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Capítulos de libros</span>
                  </div>
                  <Badge variant="outline" className="text-blue-700 border-blue-300">
                    Mínimo {requisitos.capitulos}
                  </Badge>
                </div>
              )}

              {requisitos.formacion_rh !== undefined && requisitos.formacion_rh > 0 && (
                <div className="flex items-center justify-between bg-white rounded-lg p-2 border border-gray-200">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Formación de recursos humanos</span>
                  </div>
                  <Badge variant="outline" className="text-blue-700 border-blue-300">
                    Mínimo {requisitos.formacion_rh}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Nota informativa */}
        <Alert className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CheckCircle2 className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-xs text-blue-700">
            <strong>Nota:</strong> Estos son los requisitos mínimos establecidos por el SNII para tu nivel y área.
            Durante el proceso de evaluación se verificará que cumplas con estos criterios.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}

