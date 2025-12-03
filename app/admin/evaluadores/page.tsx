"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, UserCheck, UserX, Shield, AlertCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { InvestigadorSearch } from "@/components/investigador-search"

interface Evaluador {
  id: string
  nombre: string
  email: string
  esEvaluador: boolean
  esAdmin: boolean
  activo: boolean
  fechaRegistro: string | null
}

interface Investigador {
  id: number
  nombre: string
  email: string
  foto: string | null
  slug: string
}

export default function GestionarEvaluadoresPage() {
  const router = useRouter()
  const [evaluadores, setEvaluadores] = useState<Evaluador[]>([])
  const [todosInvestigadores, setTodosInvestigadores] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [esAdmin, setEsAdmin] = useState(false)
  const [investigadorSeleccionado, setInvestigadorSeleccionado] = useState<Investigador | null>(null)

  useEffect(() => {
    // Verificar que el usuario es admin
    const checkAdmin = async () => {
      try {
        const response = await fetch('/api/admin/verificar')
        if (!response.ok || !(await response.json()).esAdmin) {
          router.push('/admin')
          return
        }
        setEsAdmin(true)
        await cargarDatos()
      } catch (error) {
        console.error('Error verificando admin:', error)
        router.push('/admin')
      } finally {
        setLoading(false)
      }
    }
    checkAdmin()
  }, [router])

  const cargarDatos = async () => {
    try {
      // Cargar evaluadores actuales
      const evaluadoresRes = await fetch('/api/admin/evaluadores')
      if (evaluadoresRes.ok) {
        const data = await evaluadoresRes.json()
        setEvaluadores(data.evaluadores || [])
      }

      // Cargar todos los investigadores para poder asignar roles
      const investigadoresRes = await fetch('/api/investigadores?limit=1000')
      if (investigadoresRes.ok) {
        const data = await investigadoresRes.json()
        setTodosInvestigadores(data.investigadores || [])
      }
    } catch (error) {
      console.error('Error cargando datos:', error)
      toast.error('Error al cargar datos')
    }
  }

  const toggleEvaluador = async (investigadorId: string, esEvaluadorActual: boolean) => {
    try {
      const response = await fetch('/api/admin/evaluadores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          investigadorId,
          esEvaluador: !esEvaluadorActual
        })
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Error al actualizar rol')
        return
      }

      toast.success(data.message)
      await cargarDatos()
    } catch (error) {
      console.error('Error actualizando rol:', error)
      toast.error('Error al actualizar rol de evaluador')
    }
  }

  // Filtrar investigadores para mostrar
  const investigadoresFiltrados = todosInvestigadores.filter(inv => {
    const matchSearch = searchTerm === "" || 
      inv.nombre_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.correo?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchSearch
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!esAdmin) {
    return null
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Evaluadores</h1>
          <p className="text-gray-600 mt-1">
            Asigna o remueve el rol de evaluador a investigadores
          </p>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Evaluadores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{evaluadores.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Evaluadores Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {evaluadores.filter(e => e.activo).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Investigadores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{todosInvestigadores.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de evaluadores actuales */}
      <Card>
        <CardHeader>
          <CardTitle>Evaluadores Actuales</CardTitle>
          <CardDescription>
            Lista de investigadores con rol de evaluador
          </CardDescription>
        </CardHeader>
        <CardContent>
          {evaluadores.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Shield className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No hay evaluadores asignados aún</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {evaluadores.map((evaluador) => (
                  <TableRow key={evaluador.id}>
                    <TableCell className="font-medium">{evaluador.nombre}</TableCell>
                    <TableCell>{evaluador.email}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {evaluador.esAdmin && (
                          <Badge variant="default" className="bg-purple-500 text-white">
                            Admin
                          </Badge>
                        )}
                        <Badge variant="default" className="bg-blue-500 text-white">
                          Evaluador
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={evaluador.activo ? "default" : "secondary"} className={evaluador.activo ? "bg-green-500 text-white" : ""}>
                        {evaluador.activo ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleEvaluador(evaluador.id, evaluador.esEvaluador)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <UserX className="h-4 w-4 mr-1" />
                        Remover
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Asignar nuevos evaluadores */}
      <Card>
        <CardHeader>
          <CardTitle>Asignar Nuevos Evaluadores</CardTitle>
          <CardDescription>
            Busca investigadores para asignarles el rol de evaluador
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Buscar Investigador
            </label>
            <InvestigadorSearch
              selectedInvestigadores={investigadorSeleccionado ? [investigadorSeleccionado] : []}
              onSelectionChange={(investigadores) => {
                if (investigadores.length > 0) {
                  const nuevoSeleccionado = investigadores[investigadores.length - 1]
                  setInvestigadorSeleccionado(nuevoSeleccionado)
                } else {
                  setInvestigadorSeleccionado(null)
                }
              }}
              placeholder="Buscar investigador para asignar como evaluador..."
              excludeIds={evaluadores.map(e => {
                const idNum = typeof e.id === 'string' ? parseInt(e.id) : e.id
                return isNaN(idNum as number) ? 0 : (idNum as number)
              })}
            />
            {investigadorSeleccionado && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{investigadorSeleccionado.nombre}</p>
                    <p className="text-sm text-gray-600">{investigadorSeleccionado.email}</p>
                  </div>
                  <Button
                    onClick={async () => {
                      if (investigadorSeleccionado) {
                        await toggleEvaluador(investigadorSeleccionado.id.toString(), false)
                        setInvestigadorSeleccionado(null)
                      }
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <UserCheck className="h-4 w-4 mr-2" />
                    Asignar como Evaluador
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nombre o email en la tabla..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Roles Actuales</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {investigadoresFiltrados
                  .filter(inv => !evaluadores.some(e => e.id === inv.id))
                  .slice(0, 20)
                  .map((investigador) => {
                    const esEvaluador = evaluadores.some(e => e.id === investigador.id)
                    return (
                      <TableRow key={investigador.id}>
                        <TableCell className="font-medium">
                          {investigador.nombre_completo || 'Sin nombre'}
                        </TableCell>
                        <TableCell>{investigador.correo || 'Sin email'}</TableCell>
                        <TableCell>
                          {investigador.es_admin ? (
                            <Badge variant="default" className="bg-purple-500 text-white">
                              Admin
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Investigador</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleEvaluador(investigador.id, esEvaluador)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <UserCheck className="h-4 w-4 mr-1" />
                            Asignar Evaluador
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
              </TableBody>
            </Table>
            {investigadoresFiltrados.filter(inv => !evaluadores.some(e => e.id === inv.id)).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No se encontraron investigadores</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

