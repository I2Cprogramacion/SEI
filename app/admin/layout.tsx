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
    // Verificar si el usuario es admin desde el servidor
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin/verificar')
        
        if (!response.ok) {
          console.warn('Acceso denegado: Usuario no es administrador')
          router.push("/dashboard")
          return
        }

        const data = await response.json()
        
        if (!data.esAdmin) {
          console.warn('Acceso denegado: Usuario no es administrador')
          router.push("/dashboard")
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
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      <AdminSidebar />
      <div className="flex-1 w-full md:ml-64 min-h-screen pt-16 md:pt-0">{children}</div>
    </div>
  )
}
