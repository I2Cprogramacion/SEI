"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw, CheckCircle, XCircle } from "lucide-react"

export function UserDebugInfo() {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDebugInfo = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/debug/usuario-actual")
      const data = await response.json()
      setDebugInfo(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDebugInfo()
  }, [])

  if (!debugInfo) return null

  const hasProfile = debugInfo.database_results?.busqueda_clerk_user_id?.encontrado ||
                    debugInfo.database_results?.busqueda_email_case_insensitive?.encontrado

  return (
    <div className="space-y-4">
      {!hasProfile && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Perfil no encontrado</AlertTitle>
          <AlertDescription>
            Tu perfil no se encuentra en la base de datos. Esto puede ocurrir si:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>No completaste el registro correctamente</li>
              <li>No verificaste tu email</li>
              <li>Hubo un error al guardar tus datos</li>
            </ul>
            <div className="mt-4">
              <p className="font-mono text-xs bg-gray-100 p-2 rounded">
                Email en Clerk: {debugInfo.clerk_info?.email}
              </p>
              <p className="font-mono text-xs bg-gray-100 p-2 rounded mt-2">
                Clerk User ID: {debugInfo.clerk_info?.clerk_user_id}
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {hasProfile && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Perfil encontrado</AlertTitle>
          <AlertDescription>
            {debugInfo.database_results?.busqueda_clerk_user_id?.resultado?.nombre_completo || "Usuario"}
          </AlertDescription>
        </Alert>
      )}

      <Button 
        onClick={fetchDebugInfo} 
        disabled={loading}
        variant="outline"
        size="sm"
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        {loading ? "Cargando..." : "Verificar de nuevo"}
      </Button>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
