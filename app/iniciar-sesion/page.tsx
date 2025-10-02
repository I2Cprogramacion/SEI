"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

export default function IniciarSesionPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      // Llamar a la API de login
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSuccess("¡Login exitoso! Redirigiendo...")
        
        // Guardar información del usuario en localStorage
        localStorage.setItem("user", JSON.stringify(data.user))
        
        // Disparar evento personalizado para notificar al navbar
        window.dispatchEvent(new CustomEvent('userUpdated'))
        
        // Redirigir según el tipo de usuario después de un breve delay
        setTimeout(() => {
          if (data.user.isAdmin) {
            router.push("/admin")
          } else {
            router.push("/dashboard")
          }
        }, 1500)
      } else {
        setError(data.error || "Error al iniciar sesión")
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error)
      setError("Error de conexión. Intenta nuevamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container max-w-md mx-auto py-10 px-4">
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold text-blue-900">Iniciar sesión</h1>
          <p className="text-blue-600">Accede a tu cuenta de investigador en SECCTI</p>
        </div>

        {/* Mostrar mensajes de error o éxito */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <Card className="bg-white border-blue-100">
          <CardHeader>
            <CardTitle className="text-blue-900">Ingresa tus credenciales</CardTitle>
            <CardDescription className="text-blue-600">
              Introduce tu correo electrónico y contraseña para acceder
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium leading-none text-blue-900 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Correo electrónico
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="maria.rodriguez@universidad.edu"
                  className="bg-white border-blue-200 text-blue-900 placeholder:text-blue-400"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium leading-none text-blue-900 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Contraseña
                  </label>
                  <Link
                    href="/recuperar-contrasena"
                    className="text-sm text-blue-600 underline underline-offset-4 hover:text-blue-900"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white border-blue-200 text-blue-900"
                  required
                  disabled={isLoading}
                />
              </div>
              <Button 
                type="submit" 
                disabled={isLoading} 
                className="w-full bg-blue-700 text-white hover:bg-blue-800"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  "Iniciar sesión"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-blue-600">
          <p>
            ¿No tienes una cuenta?{" "}
            <Link href="/registro" className="text-blue-700 underline underline-offset-4 hover:text-blue-900">
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
