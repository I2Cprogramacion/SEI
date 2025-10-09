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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pending2FA, setPending2FA] = useState(false);
  const [code2FA, setCode2FA] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      // Llamar a la API de login
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log("Respuesta login:", data);
      if (data.pending_2fa) {
        setPending2FA(true);
        setSuccess("Código de verificación enviado a tu email");
      } else if (response.ok && data.success) {
        setSuccess("¡Login exitoso! Redirigiendo...");
        localStorage.setItem("user", JSON.stringify(data.user));
        if (data.token) {
          localStorage.setItem("token", data.token);
        }
        
        // Redirigir a /admin si es admin, sino a /dashboard
        const redirectUrl = data.user.isAdmin ? "/admin" : "/dashboard";
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 1500);
      } else {
        setError(data.error || "Error al iniciar sesión");
      }
    } catch (error) {
      setError("Error de conexión. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch("/api/auth/verify-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: code2FA }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setSuccess("¡Login exitoso! Redirigiendo...");
        localStorage.setItem("user", JSON.stringify(data.user));
        if (data.token) {
          localStorage.setItem("token", data.token);
        }
        
        // Redirigir a /admin si es admin, sino a /dashboard
        const redirectUrl = data.user.isAdmin ? "/admin" : "/dashboard";
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 1500);
      } else {
        setError(data.error || "Código incorrecto o expirado");
      }
    } catch (error) {
      setError("Error de conexión. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

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
            <CardTitle className="text-blue-900">{pending2FA ? "Verifica tu email" : "Ingresa tus credenciales"}</CardTitle>
            <CardDescription className="text-blue-600">
              {pending2FA
                ? "Introduce el código de verificación enviado a tu correo electrónico."
                : "Introduce tu correo electrónico y contraseña para acceder"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!pending2FA ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium leading-none text-blue-900 peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Correo electrónico</label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="maria.rodriguez@universidad.edu" className="bg-white border-blue-200 text-blue-900 placeholder:text-blue-400" required disabled={isLoading} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="text-sm font-medium leading-none text-blue-900 peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Contraseña</label>
                    <Link href="/recuperar-contrasena" className="text-sm text-blue-600 underline underline-offset-4 hover:text-blue-900">¿Olvidaste tu contraseña?</Link>
                  </div>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-white border-blue-200 text-blue-900" required disabled={isLoading} />
                </div>
                <Button type="submit" disabled={isLoading} className="w-full bg-blue-700 text-white hover:bg-blue-800">
                  {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Iniciando sesión...</>) : ("Iniciar sesión")}
                </Button>
              </form>
            ) : (
              <form onSubmit={handle2FASubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="code2fa" className="text-sm font-medium leading-none text-blue-900">Código de verificación</label>
                  <Input id="code2fa" type="text" value={code2FA} onChange={(e) => setCode2FA(e.target.value)} placeholder="Ingresa el código recibido" className="bg-white border-blue-200 text-blue-900" required disabled={isLoading} maxLength={6} />
                </div>
                <Button type="submit" disabled={isLoading || code2FA.length !== 6} className="w-full bg-blue-700 text-white hover:bg-blue-800">
                  {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Verificando...</>) : ("Verificar código")}
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter className="border-t border-blue-100 flex flex-col items-center pt-6">
            <div className="relative w-full mb-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-blue-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-blue-600">O continúa con</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full">
              <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                Google
              </Button>
              <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                ORCID
              </Button>
            </div>
          </CardFooter>
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
