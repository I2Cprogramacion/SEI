"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AccessDeniedModal } from "@/components/access-denied-modal"
import { Loader2 } from "lucide-react"

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [showAccessDenied, setShowAccessDenied] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Verificar autenticación del lado del cliente también
    const checkAuth = () => {
      try {
        const userData = localStorage.getItem("user")
        if (!userData) {
          router.push("/iniciar-sesion")
          return
        }

        const user = JSON.parse(userData)
        
        // Verificar que el usuario sea admin Y que sea el email autorizado
        if (!user.isAdmin || user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
          setShowAccessDenied(true)
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

  if (!isAuthorized) {
    return (
      <>
        <AccessDeniedModal 
          isOpen={showAccessDenied} 
          onClose={() => {
            setShowAccessDenied(false)
            router.push("/")
          }} 
        />
        {!showAccessDenied && (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-4" />
              <p className="text-blue-600">Verificando acceso...</p>
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1">{children}</div>
    </div>
  )
}
