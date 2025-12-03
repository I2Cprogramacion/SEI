"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, UserCheck, UserX, Shield, AlertCircle, Loader2, Users, CheckCircle2, Database } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface Evaluador {
  id: string
  nombre: string
  email: string
  esEvaluador: boolean
  esAdmin: boolean
  activo: boolean
  fechaRegistro: string | null
}

export default function GestionarEvaluadoresPage() {
  const router = useRouter()
  const [evaluadores, setEvaluadores] = useState<Evaluador[]>([])
  const [todosInvestigadores, setTodosInvestigadores] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [esAdmin, setEsAdmin] = useState(false)

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="p-6 space-y-8 max-w-7xl mx-auto">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg p-8 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
              <Shield className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Gestión de Evaluadores</h1>
              <p className="text-blue-100 mt-1">
                Asigna o remueve el rol de evaluador a investigadores del sistema
              </p>
            </div>
          </div>
        </div>

        {/* Estadísticas con diseño mejorado */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                  <Users className="h-6 w-6" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-blue-100">Total</p>
                  <p className="text-3xl font-bold">{evaluadores.length}</p>
                </div>
              </div>
              <p className="text-sm font-medium text-blue-50">Evaluadores Registrados</p>
            </div>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-green-100">Activos</p>
                  <p className="text-3xl font-bold">
                    {evaluadores.filter(e => e.activo).length}
                  </p>
                </div>
              </div>
              <p className="text-sm font-medium text-green-50">Evaluadores Activos</p>
            </div>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                  <Database className="h-6 w-6" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-purple-100">Base de datos</p>
                  <p className="text-3xl font-bold">{todosInvestigadores.length}</p>
                </div>
              </div>
              <p className="text-sm font-medium text-purple-50">Total Investigadores</p>
            </div>
          </Card>
        </div>

      {/* Lista de evaluadores actuales con diseño mejorado */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Shield className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl">Evaluadores Actuales</CardTitle>
              <CardDescription className="mt-1">
                Lista de investigadores con rol de evaluador activo
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {evaluadores.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay evaluadores asignados</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Utiliza la sección de abajo para asignar el rol de evaluador a investigadores del sistema
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="font-semibold">Nombre</TableHead>
                    <TableHead className="font-semibold">Email</TableHead>
                    <TableHead className="font-semibold">Roles</TableHead>
                    <TableHead className="font-semibold">Estado</TableHead>
                    <TableHead className="font-semibold text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {evaluadores.map((evaluador) => (
                    <TableRow key={evaluador.id} className="hover:bg-gray-50 transition-colors">
                      <TableCell className="font-medium text-gray-900">{evaluador.nombre}</TableCell>
                      <TableCell className="text-gray-600">{evaluador.email}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {evaluador.esAdmin && (
                            <Badge className="bg-purple-500 hover:bg-purple-600 text-white border-0 shadow-sm">
                              <Shield className="h-3 w-3 mr-1" />
                              Admin
                            </Badge>
                          )}
                          <Badge className="bg-blue-500 hover:bg-blue-600 text-white border-0 shadow-sm">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Evaluador
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={evaluador.activo ? "default" : "secondary"} 
                          className={evaluador.activo 
                            ? "bg-green-500 hover:bg-green-600 text-white border-0 shadow-sm" 
                            : "bg-gray-300 text-gray-700 border-0"
                          }
                        >
                          {evaluador.activo ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleEvaluador(evaluador.id, evaluador.esEvaluador)}
                          className="text-red-600 hover:text-white hover:bg-red-600 border-red-200 hover:border-red-600 transition-all shadow-sm"
                        >
                          <UserX className="h-4 w-4 mr-1" />
                          Remover
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Asignar nuevos evaluadores con diseño mejorado */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <UserCheck className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-xl">Asignar Nuevos Evaluadores</CardTitle>
              <CardDescription className="mt-1">
                Busca investigadores en el sistema para asignarles el rol de evaluador
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
              />
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="font-semibold">Nombre</TableHead>
                  <TableHead className="font-semibold">Email</TableHead>
                  <TableHead className="font-semibold">Roles Actuales</TableHead>
                  <TableHead className="font-semibold text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {investigadoresFiltrados
                  .filter(inv => !evaluadores.some(e => e.id === inv.id))
                  .slice(0, 20)
                  .map((investigador) => {
                    const esEvaluador = evaluadores.some(e => e.id === investigador.id)
                    return (
                      <TableRow key={investigador.id} className="hover:bg-blue-50/50 transition-colors">
                        <TableCell className="font-medium text-gray-900">
                          {investigador.nombre_completo || 'Sin nombre'}
                        </TableCell>
                        <TableCell className="text-gray-600">{investigador.correo || 'Sin email'}</TableCell>
                        <TableCell>
                          {investigador.es_admin ? (
                            <Badge className="bg-purple-500 hover:bg-purple-600 text-white border-0 shadow-sm">
                              <Shield className="h-3 w-3 mr-1" />
                              Admin
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-gray-200 text-gray-700 border-0">
                              Investigador
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleEvaluador(investigador.id, esEvaluador)}
                            className="text-blue-600 hover:text-white hover:bg-blue-600 border-blue-200 hover:border-blue-600 transition-all shadow-sm"
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
              <div className="text-center py-16 bg-gray-50">
                <div className="bg-gray-200 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No se encontraron investigadores</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Todos los investigadores ya tienen rol de evaluador o no coinciden con tu búsqueda
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
    </div>
  )
}

