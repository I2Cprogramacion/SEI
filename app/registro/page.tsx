"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LogIn, UserPlus, ArrowRight } from "lucide-react"

export default function RegistroSelectorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Sistema Estatal de Investigadores
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Bienvenido a la plataforma de investigadores de Chihuahua. ¿Cuál es tu situación?
          </p>
        </div>

        {/* Options Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Option 1: Ya formo parte */}
          <Link href="/registro/investigador-existente">
            <Card className="h-full bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 hover:shadow-lg dark:hover:shadow-slate-900/50 hover:border-blue-400 dark:hover:border-blue-600 transition-all cursor-pointer group">
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <div className="h-14 w-14 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                    <LogIn className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 dark:text-gray-600 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                </div>
                <CardTitle className="text-2xl text-gray-900 dark:text-white">
                  Ya formo parte del SEI
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-gray-600 dark:text-gray-400 mb-6">
                  Si ya tienes una cuenta registrada y necesitas actualizar tu perfil, subir tu dictamen o publicaciones.
                </CardDescription>
                <div className="space-y-2 mb-6 text-sm text-gray-600 dark:text-gray-400">
                  <p>? Sube tu Dictamen SNII</p>
                  <p>? Sube tu Perfil Único (PU)</p>
                  <p>? Actualiza tu información</p>
                </div>
                <div className="pt-6 border-t border-gray-200 dark:border-slate-700">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white">
                    Continuar
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Option 2: Quiero ser parte */}
          <Link href="/registro/investigador-nuevo">
            <Card className="h-full bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 hover:shadow-lg dark:hover:shadow-slate-900/50 hover:border-purple-400 dark:hover:border-purple-600 transition-all cursor-pointer group">
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <div className="h-14 w-14 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
                    <UserPlus className="h-7 w-7 text-purple-600 dark:text-purple-400" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 dark:text-gray-600 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
                </div>
                <CardTitle className="text-2xl text-gray-900 dark:text-white">
                  Quiero ser parte del SEI
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-gray-600 dark:text-gray-400 mb-6">
                  Si eres investigador y deseas registrarte en el sistema estatal por primera vez.
                </CardDescription>
                <div className="space-y-2 mb-6 text-sm text-gray-600 dark:text-gray-400">
                  <p>? Registro como nuevo investigador</p>
                  <p>? Subir Perfil Único (PU)</p>
                  <p>? Validación de datos académicos</p>
                </div>
                <div className="pt-6 border-t border-gray-200 dark:border-slate-700">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800 text-white">
                    Registrarse
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Footer Info */}
        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          <p>¿Tienes dudas? Consulta nuestras <Link href="/faq" className="text-blue-600 dark:text-blue-400 hover:underline">preguntas frecuentes</Link></p>
        </div>
      </div>
    </div>
  )
}
