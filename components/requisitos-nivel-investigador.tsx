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
      <Alert className="bg-amber-50 border-amber-200 p-3 sm:p-4">
        <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-600 flex-shrink-0" />
        <AlertTitle className="text-amber-800 text-sm sm:text-base">Selecciona tu área de investigación</AlertTitle>
        <AlertDescription className="text-amber-700 text-xs sm:text-sm">
          Primero debes seleccionar tu área de investigación para ver los requisitos específicos de tu nivel.
        </AlertDescription>
      </Alert>
    )
  }

  // Mensaje si no se encontraron requisitos
  if (!requisitos) {
    return (
      <Alert className="bg-blue-50 border-blue-200 p-3 sm:p-4">
        <Info className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600 flex-shrink-0" />
        <AlertTitle className="text-blue-800 text-sm sm:text-base">Información no disponible</AlertTitle>
        <AlertDescription className="text-blue-700 text-xs sm:text-sm">
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
        <CardContent className="p-3 sm:p-4 h-full flex flex-col">
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <div className={`${tieneValores ? 'text-blue-600' : 'text-gray-400'} flex-shrink-0`}>
              {icono}
            </div>
            <h5 className={`text-xs sm:text-sm font-semibold leading-tight ${
              tieneValores ? 'text-gray-900' : 'text-gray-500'
            }`}>
              {titulo}
            </h5>
          </div>
          
          <div className="space-y-1.5 sm:space-y-2 flex-1">
            {/* Q1 - Mínimo */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] sm:text-xs text-gray-600 whitespace-nowrap">Q1 (Mín)</span>
              <Badge variant="outline" className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 ${
                valores.q1 > 0 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-500 border-gray-200'
              }`}>
                {valores.q1}
              </Badge>
            </div>
            
            {/* Q2 - Mediana */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] sm:text-xs text-gray-600 font-medium whitespace-nowrap">Q2 (Med)</span>
              <Badge className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 ${
                valores.q2 > 0 ? 'bg-blue-100 text-blue-800 border-blue-300' : 'bg-gray-100 text-gray-600 border-gray-200'
              }`}>
                {valores.q2} ⭐
              </Badge>
            </div>
            
            {/* Q3 - Alto */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] sm:text-xs text-gray-600 whitespace-nowrap">Q3 (Alto)</span>
              <Badge variant="outline" className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 ${
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
      <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6">
        <CardTitle className="text-base sm:text-lg text-blue-900 flex items-center gap-2">
          <Award className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
          <span className="leading-tight">Requisitos para {nivelSNII}</span>
        </CardTitle>
        <p className="text-[10px] sm:text-xs text-blue-700 mt-1">
          Área: <span className="font-semibold">{areaInvestigacion}</span>
        </p>
      </CardHeader>
      
      <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
        {/* Descripción general */}
        {requisitos.consideraciones && (
          <Alert className="bg-white border-blue-200 p-2.5 sm:p-3">
            <Info className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600 flex-shrink-0" />
            <AlertDescription className="text-[11px] sm:text-sm text-gray-700 leading-relaxed">
              {requisitos.consideraciones}
            </AlertDescription>
          </Alert>
        )}

        {/* Tabs con los indicadores organizados */}
        <Tabs defaultValue="produccion" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white h-auto p-1">
            <TabsTrigger 
              value="produccion" 
              className="text-[10px] sm:text-xs px-1 sm:px-3 py-1.5 sm:py-2 flex flex-col sm:flex-row items-center gap-0.5 sm:gap-1"
            >
              <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Producción</span>
              <span className="sm:hidden">Prod.</span>
            </TabsTrigger>
            <TabsTrigger 
              value="innovacion" 
              className="text-[10px] sm:text-xs px-1 sm:px-3 py-1.5 sm:py-2 flex flex-col sm:flex-row items-center gap-0.5 sm:gap-1"
            >
              <Lightbulb className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Innovación</span>
              <span className="sm:hidden">Innov.</span>
            </TabsTrigger>
            <TabsTrigger 
              value="formacion" 
              className="text-[10px] sm:text-xs px-1 sm:px-3 py-1.5 sm:py-2 flex flex-col sm:flex-row items-center gap-0.5 sm:gap-1"
            >
              <GraduationCap className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Formación</span>
              <span className="sm:hidden">Form.</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Producción Académica */}
          <TabsContent value="produccion" className="mt-3 sm:mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {renderIndicador(
                "Artículos",
                <FileText className="h-4 w-4 sm:h-5 sm:w-5" />,
                requisitos.articulos
              )}
              {renderIndicador(
                "Libros",
                <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />,
                requisitos.libros
              )}
              {renderIndicador(
                "Capítulos",
                <FileCheck className="h-4 w-4 sm:h-5 sm:w-5" />,
                requisitos.capitulos
              )}
            </div>
          </TabsContent>

          {/* Tab 2: Innovación */}
          <TabsContent value="innovacion" className="mt-3 sm:mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {renderIndicador(
                "Desarrollo Tecnológico",
                <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5" />,
                requisitos.desarrolloTecnologico
              )}
              {renderIndicador(
                "Propiedad Intelectual",
                <Award className="h-4 w-4 sm:h-5 sm:w-5" />,
                requisitos.propiedadIntelectual
              )}
              {renderIndicador(
                "Transferencia Tecnológica",
                <Repeat className="h-4 w-4 sm:h-5 sm:w-5" />,
                requisitos.transferenciaTecnologica
              )}
            </div>
          </TabsContent>

          {/* Tab 3: Formación y Divulgación */}
          <TabsContent value="formacion" className="mt-3 sm:mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {renderIndicador(
                "Docencia",
                <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5" />,
                requisitos.docencia
              )}
              {renderIndicador(
                "Formación de Comunidad",
                <Users className="h-4 w-4 sm:h-5 sm:w-5" />,
                requisitos.formacionComunidad
              )}
              {renderIndicador(
                "Acceso Universal",
                <Globe className="h-4 w-4 sm:h-5 sm:w-5" />,
                requisitos.accesoUniversal
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Nota informativa */}
        <Alert className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 p-2.5 sm:p-3">
          <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600 flex-shrink-0" />
          <AlertDescription className="text-[10px] sm:text-xs text-blue-700 leading-relaxed">
            <strong>Nota:</strong> Q2 (Mediana) representa el valor típico. Estos son los requisitos de referencia establecidos por el SNII para tu nivel y área.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}

