"use client"

import { useState, useEffect } from "react"
import { useSignUp } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Mail, Loader2, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function VerificarEmailPage() {
  const { isLoaded, signUp, setActive } = useSignUp()
  const router = useRouter()
  const [code, setCode] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [email, setEmail] = useState("")

  useEffect(() => {
    if (isLoaded && signUp) {
      setEmail(signUp.emailAddress || "")
      
      // Verificar si el email ya está verificado al cargar la página
      if (signUp.verifications?.emailAddress?.status === "verified") {
        setSuccess(true)
        
        // Intentar establecer la sesión si existe
        if (setActive && signUp.createdSessionId) {
          setActive({ session: signUp.createdSessionId }).then(() => {
            setTimeout(() => {
              router.push("/admin")
            }, 1500)
          }).catch(() => {
            // Si falla la sesión, redirigir a login
            setTimeout(() => {
              router.push("/iniciar-sesion")
            }, 2000)
          })
        } else {
          // Si no hay sesión, redirigir al admin de todos modos
          setTimeout(() => {
            router.push("/admin")
          }, 1500)
        }
      }
    }
  }, [isLoaded, signUp, setActive, router])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isLoaded || !signUp) {
      setError("El sistema no está listo. Por favor, recarga la página.")
      return
    }

    if (!code || code.length !== 6) {
      setError("Por favor, ingresa el código de 6 dígitos que recibiste por correo.")
      return
    }

    setIsVerifying(true)
    setError(null)

    try {
      // Verificar si ya está verificado antes de intentar
      if (signUp.verifications?.emailAddress?.status === "verified") {
        setSuccess(true)
        
        // Intentar establecer la sesión si existe
        if (setActive && signUp.createdSessionId) {
          await setActive({ session: signUp.createdSessionId })
        }
        
        // Redirigir al admin
        setTimeout(() => {
          router.push("/admin")
        }, 1500)
        return
      }

      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      })

      if (completeSignUp.status === "complete") {
        setSuccess(true)
        
        // ✅ COMPLETAR REGISTRO: Mover datos de registros_pendientes → investigadores
        console.log("🔵 [VERIFICACIÓN] Email verificado, completando registro en PostgreSQL...")
        
        try {
          // Obtener el clerk_user_id del usuario verificado
          const clerkUserId = completeSignUp.createdUserId || 
                             completeSignUp.id ||
                             (completeSignUp as any).user?.id
          
          if (!clerkUserId) {
            console.error("❌ [VERIFICACIÓN] No se pudo obtener clerk_user_id")
            throw new Error("No se pudo obtener el ID del usuario")
          }

          console.log("📤 [VERIFICACIÓN] Enviando solicitud para completar registro...")
          console.log("   Clerk User ID:", clerkUserId)
          
          // Enviar solicitud para completar el registro
          const response = await fetch("/api/completar-registro", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              clerk_user_id: clerkUserId
            }),
          })

          const result = await response.json()
          
          if (response.ok && result.success) {
            console.log("✅ [VERIFICACIÓN] Registro completado en PostgreSQL")
            console.log("   ID asignado:", result.id)
            console.log("   Datos movidos de tabla temporal → tabla investigadores")
          } else {
            console.error("❌ [VERIFICACIÓN] Error al completar registro:", result.message || result.error)
            
            // Si es un error de duplicado, podría ser que el usuario ya completó el registro
            if (result.duplicado || response.status === 409) {
              console.log("ℹ️ [VERIFICACIÓN] El registro ya existe, continuando...")
            } else if (response.status === 404) {
              console.error("❌ [VERIFICACIÓN] Registro temporal no encontrado o expirado")
              console.error("   El usuario deberá registrarse nuevamente")
              setError("Tu registro ha expirado. Por favor, regístrate nuevamente.")
              return
            } else {
              // Otros errores no bloquean el inicio de sesión
              console.warn("⚠️ [VERIFICACIÓN] Error al completar registro, pero continuando...")
            }
          }
        } catch (dbError: any) {
          console.error("❌ [VERIFICACIÓN] Error al completar registro:", dbError)
          
          // Mostrar mensaje al usuario pero permitir continuar
          const errorMsg = dbError?.message || "Error desconocido"
          if (errorMsg.includes("no encontró") || errorMsg.includes("expiró")) {
            console.warn("⚠️ [VERIFICACIÓN] Registro temporal no encontrado. El usuario deberá completar su perfil manualmente.")
            setError("Tu sesión expiró. Puedes iniciar sesión, pero deberás completar tu perfil manualmente.")
          } else {
            console.warn("⚠️ [VERIFICACIÓN] Error no crítico, permitiendo inicio de sesión...")
          }
          // No bloqueamos el inicio de sesión por errores en la BD
          // El usuario puede completar su perfil después
        }
        
        // Establecer la sesión activa
        if (setActive) {
          await setActive({ session: completeSignUp.createdSessionId })
        }

        // Redirigir al admin después de 2 segundos
        setTimeout(() => {
          router.push("/admin")
        }, 2000)
      } else {
        setError("No se pudo completar la verificación. Por favor, intenta de nuevo.")
      }
    } catch (err: any) {
      console.error("Error al verificar:", err)
      
      // Manejar caso específico de "already verified"
      const errorMessage = err.errors?.[0]?.message || err.message || ""
      
      if (errorMessage.toLowerCase().includes("already verified") || 
          errorMessage.toLowerCase().includes("already been verified")) {
        // Si ya está verificado, tratar como éxito
        setSuccess(true)
        
        // Intentar establecer la sesión si existe
        if (setActive && signUp.createdSessionId) {
          try {
            await setActive({ session: signUp.createdSessionId })
          } catch {
            // Si falla la sesión, redirigir a login
            setTimeout(() => {
              router.push("/iniciar-sesion")
            }, 2000)
            return
          }
        }
        
        setTimeout(() => {
          router.push("/admin")
        }, 1500)
      } else {
        setError(
          errorMessage || 
          "Código incorrecto o expirado. Por favor, verifica el código e intenta de nuevo."
        )
      }
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResendCode = async () => {
    if (!isLoaded || !signUp) {
      setError("El sistema no está listo. Por favor, recarga la página.")
      return
    }

    setIsVerifying(true)
    setError(null)

    try {
      // Verificar si ya está verificado antes de intentar reenviar
      if (signUp.verifications?.emailAddress?.status === "verified") {
        setSuccess(true)
        
        // Intentar establecer la sesión si existe
        if (setActive && signUp.createdSessionId) {
          await setActive({ session: signUp.createdSessionId })
        }
        
        // Redirigir al admin
        setTimeout(() => {
          router.push("/admin")
        }, 1500)
        return
      }

      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      })
      
      setError(null)
      alert("Se ha enviado un nuevo código a tu correo electrónico.")
    } catch (err: any) {
      console.error("Error al reenviar código:", err)
      
      // Manejar caso específico de "already verified"
      const errorMessage = err.errors?.[0]?.message || err.message || ""
      
      if (errorMessage.toLowerCase().includes("already verified") || 
          errorMessage.toLowerCase().includes("already been verified")) {
        // Si ya está verificado, tratar como éxito
        setSuccess(true)
        
        // Intentar establecer la sesión si existe
        if (setActive && signUp.createdSessionId) {
          try {
            await setActive({ session: signUp.createdSessionId })
          } catch {
            // Si falla la sesión, redirigir a login
            setTimeout(() => {
              router.push("/iniciar-sesion")
            }, 2000)
            return
          }
        }
        
        setTimeout(() => {
          router.push("/admin")
        }, 1500)
      } else {
        setError(
          errorMessage || 
          "No se pudo reenviar el código. Por favor, intenta de nuevo."
        )
      }
    } finally {
      setIsVerifying(false)
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!signUp) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <Card className="max-w-md w-full mx-4">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>No se encontró información de registro</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/registro">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al registro
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg">
        <CardHeader className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto">
            <Mail className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl text-blue-900">
            {success ? "¡Verificación Exitosa!" : "Verifica tu Correo Electrónico"}
          </CardTitle>
          <CardDescription className="text-blue-600">
            {success 
              ? "Tu cuenta ha sido verificada correctamente"
              : `Hemos enviado un código de verificación de 6 dígitos a ${email}`
            }
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {success ? (
            <Alert className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <AlertTitle className="text-green-800 font-semibold">
                ¡Cuenta verificada!
              </AlertTitle>
              <AlertDescription className="text-green-700">
                Serás redirigido a tu panel de control en unos segundos...
              </AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handleVerify} className="space-y-6">
              <Alert className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <Mail className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-800 font-semibold">
                  Revisa tu bandeja de entrada
                </AlertTitle>
                <AlertDescription className="text-blue-700 text-sm">
                  Si no ves el correo en tu bandeja de entrada, revisa tu carpeta de spam o correo no deseado.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="code" className="text-blue-900 font-medium">
                  Código de Verificación
                </Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="000000"
                  value={code}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 6)
                    setCode(value)
                  }}
                  maxLength={6}
                  className="text-center text-2xl tracking-widest font-mono bg-white border-blue-200 text-blue-900"
                  autoComplete="one-time-code"
                  required
                  disabled={isVerifying}
                />
                <p className="text-xs text-blue-600 text-center">
                  Ingresa el código de 6 dígitos que recibiste por correo
                </p>
              </div>

              {error && (
                <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-700">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800"
                disabled={isVerifying || code.length !== 6}
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Verificar Correo
                  </>
                )}
              </Button>

              <div className="text-center space-y-2">
                <p className="text-sm text-blue-600">
                  ¿No recibiste el código?
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleResendCode}
                  disabled={isVerifying}
                  className="text-blue-700 hover:bg-blue-50"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Reenviando...
                    </>
                  ) : (
                    "Reenviar código"
                  )}
                </Button>
              </div>
            </form>
          )}

          <div className="text-center">
            <Button variant="ghost" asChild className="text-blue-700 hover:bg-blue-50">
              <Link href="/registro">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al registro
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
