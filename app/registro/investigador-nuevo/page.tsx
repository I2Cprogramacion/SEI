"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function InvestigadorNuevoRegistroPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link href="/registro" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
            ← Volver a opciones
          </Link>
        </div>

        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-3">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Registro de Nuevo Investigador
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Bienvenido al Sistema Estatal de Investigadores
            </p>
          </div>

          {/* Coming Soon Card */}
          <Card className="bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-purple-900 dark:text-white">Próximamente</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Formulario de registro para nuevos investigadores
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <Alert className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <AlertTitle className="text-amber-800 dark:text-amber-400">En Desarrollo</AlertTitle>
                <AlertDescription className="text-amber-700 dark:text-amber-300">
                  El formulario de registro para nuevos investigadores estará disponible próximamente. 
                  Durante esta fase, por favor contacta al administrador del sistema.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">¿Qué incluirá?</h3>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 dark:text-purple-400 mt-1">✓</span>
                    <span>Formulario de registro completo</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 dark:text-purple-400 mt-1">✓</span>
                    <span>Subida de Perfil Único (PU) con OCR</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 dark:text-purple-400 mt-1">✓</span>
                    <span>Validación de datos académicos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 dark:text-purple-400 mt-1">✓</span>
                    <span>Aprobación administrativa</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6 border-t border-gray-200 dark:border-slate-700">
                <Link href="/registro">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800 text-white">
                    Volver al Selector
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* FAQ */}
          <Card className="bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="text-lg text-blue-900 dark:text-white">¿Necesitas Ayuda?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-blue-700 dark:text-blue-300">
                Si eres un nuevo investigador y deseas registrarte, por favor:
              </p>
              <ul className="space-y-2 text-blue-700 dark:text-blue-300">
                <li>1. Contacta al administrador del sistema</li>
                <li>2. Prepara tu Perfil Único (PU) en PDF</li>
                <li>3. Proporciona la información académica requerida</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
