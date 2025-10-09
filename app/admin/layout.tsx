"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Loader2 } from "lucide-react"

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Verificar autenticación del lado del cliente también
    const checkAuth = () => {
      try {
        const userData = localStorage.getItem("user")
        if (!userData) {
          // No hay sesión, redirigir al login
          router.push("/iniciar-sesion")
          return
        }

        const user = JSON.parse(userData)
        
        // Verificar que el usuario sea admin Y que sea el email autorizado
        const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@sei.com.mx'
        if (!user.isAdmin || user.email !== adminEmail) {
          // Usuario no es admin, redirigir a la página principal
          console.warn('Acceso denegado: Usuario no es administrador')
          router.push("/")
          return
        }
        
        setIsAuthorized(true)
      } catch (error) {
        console.error("Error checking auth:", error)
        router.push("/iniciar-sesion")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-4" />
          <p className="text-blue-600">Verificando acceso...</p>
        </div>
      </div>
    )
  }

  // Si no está autorizado, ya se redirigió en el useEffect
  // Solo mostrar loading mientras se verifica
  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-4" />
          <p className="text-blue-600">Verificando acceso...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1">{children}</div>
    </div>
  )
}
