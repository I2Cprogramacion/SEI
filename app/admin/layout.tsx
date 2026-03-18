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
    // Verificar si el usuario tiene acceso (admin o evaluador) desde el servidor
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin/verificar-acceso', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })
        
        const data = await response.json()
        
        console.log('🔍 [AdminLayout] Respuesta de verificar-acceso:', {
          status: response.status,
          tieneAcceso: data.tieneAcceso,
          esAdmin: data.esAdmin,
          esEvaluador: data.esEvaluador,
          error: data.error,
          debug: data.debug
        })
        
        // Guardar debug info para mostrar en pantalla
        setDebugInfo(data.debug)
        
        if (!response.ok) {
          const errorMsg = data.error || 'Error desconocido'
          console.warn('⚠️ Acceso denegado:', response.status, errorMsg)
          setError(errorMsg)
          
          // Si es 401 (no autenticado), redirigir a login
          if (response.status === 401) {
            setTimeout(() => router.push("/iniciar-sesion"), 1500)
            return
          }
          
          // Si es 403 (prohibido), redirigir a dashboard
          if (response.status === 403) {
            setTimeout(() => router.push("/dashboard"), 1500)
            return
          }
          
          // Si es 500 (error BD), esperar y reintentar
          if (response.status === 500) {
            console.log("⏳ Error de BD, reintentando en 3s...")
            setTimeout(() => checkAuth(), 3000)
            return
          }
        }
        
        if (!data.tieneAcceso) {
          console.warn('⚠️ Usuario no tiene permisos:', data.debug?.razon)
          setError(data.debug?.razon || 'Sin permisos de admin')
          setTimeout(() => router.push("/dashboard"), 1500)
          return
        }
        
        console.log('✅ Acceso de admin verificado:', {
          esAdmin: data.esAdmin,
          esEvaluador: data.esEvaluador,
          usuario: data.usuario?.nombre
        })
        
        setIsAuthorized(true)
      } catch (error) {
        console.error("❌ Error checking admin auth:", error)
        setError(error instanceof Error ? error.message : 'Error de conexión')
        // Reintentar en caso de error de red
        setTimeout(() => {
          console.log("⏳ Reintentando verificación de acceso...")
          checkAuth()
        }, 2000)
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
