"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Shield, Lock, AlertTriangle, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface AccessDeniedModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AccessDeniedModal({ isOpen, onClose }: AccessDeniedModalProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [pending2FA, setPending2FA] = useState(false)
  const [code2FA, setCode2FA] = useState("")
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (data.pending_2fa) {
        setPending2FA(true)
        setSuccess("Código de verificación enviado a tu email")
      } else if (response.ok && data.success) {
        setSuccess("¡Acceso autorizado! Redirigiendo...")
        localStorage.setItem("user", JSON.stringify(data.user))
        if (data.token) {
          localStorage.setItem("token", data.token)
        }
        
        // Verificar si es admin autorizado
        if (data.user.isAdmin && data.user.email === 'admin@sei.com.mx') {
          setTimeout(() => {
            window.location.reload() // Recargar para actualizar el estado de autorización
          }, 1500)
        } else {
          setError("Acceso denegado: Solo el administrador principal puede acceder")
        }
      } else {
        setError(data.error || "Credenciales incorrectas")
      }
    } catch (error) {
      console.error("Error en login:", error)
      setError("Error de conexión. Inténtalo de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  const handle2FA = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/verify-2fa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code: code2FA }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSuccess("¡Verificación exitosa! Accediendo al panel...")
        localStorage.setItem("user", JSON.stringify(data.user))
        if (data.token) {
          localStorage.setItem("token", data.token)
        }
        
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } else {
        setError(data.error || "Código incorrecto")
      }
    } catch (error) {
      console.error("Error en 2FA:", error)
      setError("Error de conexión. Inténtalo de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoToLogin = () => {
    router.push("/iniciar-sesion")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Shield className="h-5 w-5" />
            Acceso Restringido
          </DialogTitle>
          <DialogDescription>
            Solo el administrador autorizado puede acceder a esta sección.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Mensaje de restricción */}
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Acceso Denegado:</strong> Esta área está restringida únicamente al administrador principal del sistema.
            </AlertDescription>
          </Alert>

          {/* Formulario de login */}
          {!pending2FA ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email de Administrador</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@sei.com.mx"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <AlertDescription className="text-green-800">
                    {success}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Acceder
                    </>
                  )}
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleGoToLogin}
                  disabled={isLoading}
                >
                  Ir al Login
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handle2FA} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code2FA">Código de Verificación</Label>
                <Input
                  id="code2FA"
                  type="text"
                  placeholder="123456"
                  value={code2FA}
                  onChange={(e) => setCode2FA(e.target.value)}
                  maxLength={6}
                  required
                />
                <p className="text-sm text-gray-600">
                  Ingresa el código de 6 dígitos enviado a tu email
                </p>
              </div>

              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <AlertDescription className="text-green-800">
                    {success}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    "Verificar Código"
                  )}
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setPending2FA(false)}
                  disabled={isLoading}
                >
                  Volver
                </Button>
              </div>
            </form>
          )}

          {/* Información adicional */}
          <div className="text-center text-sm text-gray-600">
            <p>¿No tienes acceso? Contacta al administrador del sistema.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
