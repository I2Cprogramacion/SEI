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
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    console.log('🚀 [AdminLayout] useEffect iniciado')
    
    const checkAuth = async () => {
      console.log('🔍 [AdminLayout] checkAuth iniciado')
      
      try {
        // Verificar permisos desde endpoint simple
        const response = await fetch('/api/auth/verify-admin')
        
        console.log('📬 [AdminLayout] Response status:', response.status)
        
        if (!response.ok) {
          console.warn('⚠️ Access denied, status:', response.status)
          
          if (response.status === 401) {
            router.push("/iniciar-sesion")
            return
          }
          
          // 403 = no permissions
          if (response.status === 403) {
            router.push("/dashboard")
            return
          }
        }
        
        const data = await response.json()
        
        if (!data.tieneAcceso) {
          console.warn('⚠️ Usuario sin permisos')
          router.push("/dashboard")
          return
        }
        
        console.log('✅ Acceso permitido')
        setIsAuthorized(true)
        
      } catch (error) {
        console.error("❌ Error:", error)
        setError(error instanceof Error ? error.message : 'Error desconocido')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="text-blue-600 font-medium">Verificando acceso...</p>
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg max-w-lg">
              <p className="text-red-600 text-sm">
                <span className="font-semibold">Error:</span> {error}
              </p>
              {debugInfo && (
                <div className="mt-3 p-3 bg-red-100 rounded border border-red-300 text-left">
                  <p className="text-red-700 text-xs font-mono whitespace-pre-wrap break-words">
                    {JSON.stringify(debugInfo, null, 2)}
                  </p>
                </div>
              )}
              <p className="text-red-500 text-xs mt-2">
                Revisar consola del navegador para más detalles
              </p>
            </div>
          )}
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      <AdminSidebar />
      <div className="w-full md:pl-64 min-h-screen">{children}</div>
    </div>
  )
}
