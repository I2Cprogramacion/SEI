"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Info, 
  BookOpen, 
  FileText, 
  Users, 
  Award,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  GraduationCap,
  Repeat,
  FileCheck,
  Globe
} from "lucide-react"
import { getParametrosSNII, mapearNivelAId, mapearAreaAId } from "@/lib/snii-parametros"

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
      // Mapear el área al ID correspondiente
      const areaId = mapearAreaAId(areaInvestigacion)
      
      if (areaId) {
        const params = getParametrosSNII(areaId, nivelId)
        setRequisitos(params)
        setNivelSNII(nivelInvestigador)
      } else {
        setRequisitos(null)
        setNivelSNII("")
      }
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

  // Función auxiliar para renderizar un indicador individual
  const renderIndicador = (
    titulo: string,
    icono: React.ReactNode,
    valores: { q1: number; q2: number; q3: number }
  ) => {
    const tieneValores = valores.q1 > 0 || valores.q2 > 0 || valores.q3 > 0
    
    return (
      <Card className={`bg-white border hover:shadow-md transition-shadow ${
        tieneValores ? 'border-gray-200' : 'border-gray-100 opacity-60'
      }`}>
        <CardContent className="p-4 h-full flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <div className={tieneValores ? 'text-blue-600' : 'text-gray-400'}>
              {icono}
            </div>
            <h5 className={`text-sm font-semibold ${
              tieneValores ? 'text-gray-900' : 'text-gray-500'
            }`}>
              {titulo}
            </h5>
          </div>
          
          <div className="space-y-2 flex-1">
            {/* Q1 - Mínimo */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Q1 (Mín 25%)</span>
              <Badge variant="outline" className={`${
                valores.q1 > 0 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-500 border-gray-200'
              }`}>
                {valores.q1}
              </Badge>
            </div>
            
            {/* Q2 - Mediana */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600 font-medium">Q2 (Mediana)</span>
              <Badge className={`${
                valores.q2 > 0 ? 'bg-blue-100 text-blue-800 border-blue-300' : 'bg-gray-100 text-gray-600 border-gray-200'
              }`}>
                {valores.q2} ⭐
              </Badge>
            </div>
            
            {/* Q3 - Alto */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Q3 (Alto 75%)</span>
              <Badge variant="outline" className={`${
                valores.q3 > 0 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-gray-50 text-gray-500 border-gray-200'
              }`}>
                {valores.q3}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
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
        {requisitos.consideraciones && (
          <Alert className="bg-white border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-sm text-gray-700">
              {requisitos.consideraciones}
            </AlertDescription>
          </Alert>
        )}

        {/* Tabs con los indicadores organizados */}
        <Tabs defaultValue="produccion" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white">
            <TabsTrigger value="produccion" className="text-xs">
              <FileText className="h-4 w-4 mr-1" />
              Producción
            </TabsTrigger>
            <TabsTrigger value="innovacion" className="text-xs">
              <Lightbulb className="h-4 w-4 mr-1" />
              Innovación
            </TabsTrigger>
            <TabsTrigger value="formacion" className="text-xs">
              <GraduationCap className="h-4 w-4 mr-1" />
              Formación
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Producción Académica */}
          <TabsContent value="produccion" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {renderIndicador(
                "Artículos",
                <FileText className="h-5 w-5" />,
                requisitos.articulos
              )}
              {renderIndicador(
                "Libros",
                <BookOpen className="h-5 w-5" />,
                requisitos.libros
              )}
              {renderIndicador(
                "Capítulos",
                <FileCheck className="h-5 w-5" />,
                requisitos.capitulos
              )}
            </div>
          </TabsContent>

          {/* Tab 2: Innovación */}
          <TabsContent value="innovacion" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {renderIndicador(
                "Desarrollo Tecnológico",
                <Lightbulb className="h-5 w-5" />,
                requisitos.desarrolloTecnologico
              )}
              {renderIndicador(
                "Propiedad Intelectual",
                <Award className="h-5 w-5" />,
                requisitos.propiedadIntelectual
              )}
              {renderIndicador(
                "Transferencia Tecnológica",
                <Repeat className="h-5 w-5" />,
                requisitos.transferenciaTecnologica
              )}
            </div>
          </TabsContent>

          {/* Tab 3: Formación y Divulgación */}
          <TabsContent value="formacion" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {renderIndicador(
                "Docencia",
                <GraduationCap className="h-5 w-5" />,
                requisitos.docencia
              )}
              {renderIndicador(
                "Formación de Comunidad",
                <Users className="h-5 w-5" />,
                requisitos.formacionComunidad
              )}
              {renderIndicador(
                "Acceso Universal",
                <Globe className="h-5 w-5" />,
                requisitos.accesoUniversal
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Nota informativa */}
        <Alert className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CheckCircle2 className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-xs text-blue-700">
            <strong>Nota:</strong> Q2 (Mediana) representa el valor típico. Estos son los requisitos de referencia establecidos por el SNII para tu nivel y área.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}

