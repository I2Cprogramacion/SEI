"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertTriangle, Info } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

export default function ExitoRegistroPage() {
  const searchParams = useSearchParams()
  const [mensaje, setMensaje] = useState<string | null>(null)
  const [tipoMensaje, setTipoMensaje] = useState<"success" | "warning" | "info">("success")

  useEffect(() => {
    // Verificar si hay un mensaje en los parámetros de la URL
    const mensajeParam = searchParams.get("mensaje")
    const tipoParam = searchParams.get("tipo") as "success" | "warning" | "info" | null

    if (mensajeParam) {
      setMensaje(mensajeParam)
      if (tipoParam && ["success", "warning", "info"].includes(tipoParam)) {
        setTipoMensaje(tipoParam)
      }
    }
  }, [searchParams])

  return (
    <div className="container max-w-2xl mx-auto py-10 px-4">
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div
            className={`rounded-full ${
              tipoMensaje === "success" ? "bg-green-100" : tipoMensaje === "warning" ? "bg-amber-100" : "bg-blue-100"
            } p-4`}
          >
            {tipoMensaje === "success" ? (
              <CheckCircle className="h-12 w-12 text-green-500" />
            ) : tipoMensaje === "warning" ? (
              <AlertTriangle className="h-12 w-12 text-amber-500" />
            ) : (
              <Info className="h-12 w-12 text-blue-500" />
            )}
          </div>
          <h1 className="text-3xl font-bold text-blue-900">
            {tipoMensaje === "success"
              ? "¡Registro completado!"
              : tipoMensaje === "warning"
                ? "Registro completado con advertencias"
                : "Registro completado"}
          </h1>
          <p className="text-blue-600 max-w-md">
            {mensaje || "Tu perfil de investigador ha sido creado exitosamente en la plataforma SECCTI."}
          </p>
        </div>

        {mensaje && tipoMensaje !== "success" && (
          <Alert
            className={`
            ${tipoMensaje === "warning" ? "bg-amber-50 border-amber-200 text-amber-800" : "bg-blue-50 border-blue-200 text-blue-900"}
          `}
          >
            {tipoMensaje === "warning" ? <AlertTriangle className="h-4 w-4" /> : <Info className="h-4 w-4" />}
            <AlertTitle>{tipoMensaje === "warning" ? "Atención requerida" : "Información"}</AlertTitle>
            <AlertDescription>{mensaje}</AlertDescription>
          </Alert>
        )}

        <Card className="bg-white border-blue-100">
          <CardHeader>
            <CardTitle className="text-blue-900">¿Qué sigue?</CardTitle>
            <CardDescription className="text-blue-600">
              Completa tu perfil y comienza a utilizar la plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-blue-100 w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-700 text-sm font-medium">1</span>
                </div>
                <div>
                  <h3 className="font-medium text-blue-900">Completa tu perfil académico</h3>
                  <p className="text-sm text-blue-600">
                    Añade información sobre tu formación, experiencia y áreas de investigación.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-full bg-blue-100 w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-700 text-sm font-medium">2</span>
                </div>
                <div>
                  <h3 className="font-medium text-blue-900">Publica tus proyectos</h3>
                  <p className="text-sm text-blue-600">
                    Comparte tus investigaciones actuales y pasadas con la comunidad científica.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-full bg-blue-100 w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-700 text-sm font-medium">3</span>
                </div>
                <div>
                  <h3 className="font-medium text-blue-900">Conecta con otros investigadores</h3>
                  <p className="text-sm text-blue-600">
                    Busca y conecta con colegas de tu campo para posibles colaboraciones.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t border-blue-100 flex justify-center pt-6">
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50 sm:flex-1" asChild>
                <Link href="/investigadores/nuevo-perfil">Completar perfil</Link>
              </Button>
              <Button className="bg-blue-700 text-white hover:bg-blue-800 sm:flex-1" asChild>
                <Link href="/admin">Ir al dashboard</Link>
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
