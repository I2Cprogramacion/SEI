'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Loader2, Shield, ShieldOff, RefreshCw } from 'lucide-react'

interface Investigador {
  id: string
  nombre_completo: string
  correo: string
  clerk_user_id?: string
}

interface InvestigadorConClaims extends Investigador {
  es_admin: boolean // Estado real en Clerk
}

export default function GestionarAdminsPage() {
  const { userId } = useAuth()
  const [investigadores, setInvestigadores] = useState<InvestigadorConClaims[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Obtener lista de investigadores y sus claims en Clerk
  useEffect(() => {
    const fetchInvestigadores = async () => {
      try {
        setLoading(true)
        // Usar endpoint que retorna investigadores con su estado de BD
        const response = await fetch('/api/admin/investigadores-with-claims')
        if (!response.ok) throw new Error('Error cargando investigadores')
        const data = await response.json()
        
        const listaInvestigadores = data.investigadores || []
        setInvestigadores(listaInvestigadores)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }
    
    fetchInvestigadores()
  }, [])

  // Toggle admin status
  const handleToggleAdmin = async (investigadorId: string, currentAdmin: boolean) => {
    try {
      setUpdatingId(investigadorId)
      const response = await fetch('/api/admin/update-investigador', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          investigadorId,
          es_admin: !currentAdmin,
          es_evaluador: false
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error actualizando')
      }

      // Actualizar lista local
      setInvestigadores(prev =>
        prev.map(inv =>
          inv.id === investigadorId
            ? { ...inv, es_admin: !currentAdmin }
            : inv
        )
      )

      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setUpdatingId(null)
    }
  }

  // Filtrar por búsqueda
  const filtrados = investigadores.filter(inv =>
    inv.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.correo.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Contar admins
  const adminCount = investigadores.filter(inv => inv.es_admin).length

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestionar Admins</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Total admins: <span className="font-bold">{adminCount}</span>
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Search */}
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Buscar por nombre o correo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-700 rounded bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          size="sm"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Tabla */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 dark:bg-slate-800 border-b dark:border-slate-700">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Nombre</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Correo</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">Estado</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">Acción</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  No se encontraron investigadores
                </td>
              </tr>
            ) : (
              filtrados.map((inv) => (
                <tr key={inv.id} className="border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800">
                  <td className="px-6 py-3 font-medium text-gray-900 dark:text-white">{inv.nombre_completo}</td>
                  <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-300">{inv.correo}</td>
                  <td className="px-6 py-3 text-center">
                    {inv.es_admin ? (
                      <span className="inline-flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-3 py-1 rounded-full text-sm font-medium">
                        <Shield className="w-4 h-4" />
                        Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm">
                        Usuario
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-center">
                    <Button
                      onClick={() => handleToggleAdmin(inv.id, inv.es_admin === true)}
                      disabled={updatingId === inv.id}
                      variant={inv.es_admin ? 'destructive' : 'default'}
                      size="sm"
                    >
                      {updatingId === inv.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : inv.es_admin ? (
                        <>
                          <ShieldOff className="w-4 h-4 mr-1" />
                          Remover Admin
                        </>
                      ) : (
                        <>
                          <Shield className="w-4 h-4 mr-1" />
                          Hacer Admin
                        </>
                      )}
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          💡 Los cambios se aplican instantáneamente en Clerk. Los usuarios podrán acceder a /admin inmediatamente.
        </p>
      </div>
    </div>
  )
}
