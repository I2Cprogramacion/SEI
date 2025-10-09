"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Shield, Lock, AlertTriangle, Loader2 } from "lucide-react"

interface AccessDeniedModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AccessDeniedModal({ isOpen, onClose }: AccessDeniedModalProps) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [pending2FA, setPending2FA] = useState(false)
  const [code2FA, setCode2FA] = useState("")
  const [debugLogs, setDebugLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    console.log(message)
    const logEntry = `${new Date().toLocaleTimeString()}: ${message}`
    setDebugLogs(prev => {
      const newLogs = [...prev, logEntry]
      // Guardar en localStorage para persistir entre recargas
      localStorage.setItem('admin-modal-logs', JSON.stringify(newLogs))
      return newLogs
    })
  }

  // Cargar logs persistentes al montar el componente
  useEffect(() => {
    const savedLogs = localStorage.getItem('admin-modal-logs')
    if (savedLogs) {
      try {
        setDebugLogs(JSON.parse(savedLogs))
      } catch (e) {
        console.error('Error cargando logs:', e)
      }
    }
  }, [])

  // Función para verificar que la sesión esté activa
  const verifySessionAndRedirect = async (isAdmin: boolean): Promise<boolean> => {
    const maxAttempts = 10
    const pollInterval = 200
    
    addLog(`🔍 Iniciando verificación de sesión (isAdmin: ${isAdmin})`)
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        addLog(`Intento ${attempt}/${maxAttempts}`)
        
        const response = await fetch('/api/auth/check-session', {
          method: 'GET',
          credentials: 'include'
        })
        
        addLog(`Response status: ${response.status}`)
        const data = await response.json()
        addLog(`Response data: ${JSON.stringify(data)}`)
        
        if (data.authenticated && data.isAdmin === isAdmin) {
          // Sesión verificada, redirigir
          addLog(`✅ Sesión verificada! Redirigiendo a ${isAdmin ? "/admin" : "/dashboard"}`)
          
          const targetUrl = isAdmin ? "/admin" : "/dashboard"
          
          // Intentar tres métodos de navegación para asegurar que funcione
          addLog(`Método 1: router.push con refresh`)
          router.refresh()
          
          // Esperar que el refresh complete
          await new Promise(resolve => setTimeout(resolve, 300))
          
          addLog(`Método 2: router.push`)
          router.push(targetUrl)
          
          // Si después de 1 segundo no ha navegado, forzar con window.location
          setTimeout(() => {
            addLog(`Método 3: window.location.replace (fallback)`)
            window.location.replace(targetUrl)
          }, 1000)
          
          return true
        }
        
        addLog(`⏳ Sesión aún no disponible (authenticated: ${data.authenticated}, isAdmin: ${data.isAdmin})`)
        
        // Esperar antes del siguiente intento
        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, pollInterval))
        }
      } catch (error) {
        addLog(`❌ Error verificando sesión (intento ${attempt}): ${error}`)
        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, pollInterval))
        }
      }
    }
    
    addLog('❌ Verificación de sesión agotada después de 10 intentos')
    return false
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      addLog(`🔐 Intentando login desde modal (${email})`)
      
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      addLog(`📡 Respuesta recibida: ${response.status}`)
      const data = await response.json()
      addLog(`📋 Datos: ${JSON.stringify(data)}`)

      if (data.pending_2fa) {
        setPending2FA(true)
        setSuccess("Código de verificación enviado a tu email")
        addLog('📧 2FA requerido')
      } else if (response.ok && data.success) {
        addLog('✅ Login exitoso, iniciando verificación')
        setSuccess("¡Acceso autorizado! Verificando sesión...")
        localStorage.setItem("user", JSON.stringify(data.user))
        if (data.token) {
          localStorage.setItem("token", data.token)
        }
        
        // Verificar si es admin autorizado
        if (data.user.isAdmin) {
          addLog('👤 Usuario es admin, redirigiendo directamente')
          
          // Las cookies ya están establecidas por el servidor
          // NO cerrar el modal, dejar que la navegación lo haga
          addLog('Redirigiendo en 500ms...')
          setTimeout(() => {
            addLog('Ejecutando redirección')
            window.location.href = "/admin"
          }, 500)
        } else {
          addLog('⚠️ Usuario no es admin')
          setError("Acceso denegado: Solo el administrador principal puede acceder")
          setIsLoading(false)
        }
      } else {
        addLog(`❌ Login falló: ${data.error}`)
        setError(data.error || "Credenciales incorrectas")
        setIsLoading(false)
      }
    } catch (error) {
      addLog(`❌ Error en login: ${error}`)
      const errorMessage = error instanceof Error ? error.message : "Error de conexión"
      setError(`Error de conexión: ${errorMessage}. Inténtalo de nuevo.`)
      setIsLoading(false)
    }
  }

  const handle2FA = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
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
        setSuccess("¡Verificación exitosa! Redirigiendo...")
        localStorage.setItem("user", JSON.stringify(data.user))
        if (data.token) {
          localStorage.setItem("token", data.token)
        }
        
        // Redirigir según el rol (NO cerrar modal, dejar que la navegación lo haga)
        setTimeout(() => {
          const targetUrl = data.user.isAdmin ? "/admin" : "/dashboard"
          window.location.href = targetUrl
        }, 500)
      } else {
        setError(data.error || "Código incorrecto")
        setIsLoading(false)
      }
    } catch (error) {
      console.error("Error en 2FA:", error)
      setError("Error de conexión. Inténtalo de nuevo.")
      setIsLoading(false)
    }
  }

  const handleGoToLogin = () => {
    onClose()
    router.push("/iniciar-sesion")
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      // No permitir cerrar el modal mientras está cargando
      if (!isLoading) {
        onClose()
      }
    }}>
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
                  placeholder={process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@sei.com.mx"}
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

          {/* Debug logs */}
          {debugLogs.length > 0 && (
            <div className="mt-4 p-3 bg-gray-100 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs font-semibold text-gray-700">Logs de depuración:</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setDebugLogs([])
                    localStorage.removeItem('admin-modal-logs')
                  }}
                  className="text-xs h-6 px-2"
                >
                  Limpiar
                </Button>
              </div>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {debugLogs.map((log, index) => (
                  <p key={index} className="text-xs text-gray-600 font-mono break-all">{log}</p>
                ))}
              </div>
            </div>
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
