"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Eye, UserCog, AlertTriangle } from "lucide-react"

// Interfaz para los datos de investigadores
interface Investigador {
  id: number
  no_cvu: string
  curp: string
  nombre_completo: string
  rfc: string
  correo: string
  nacionalidad: string
  fecha_nacimiento: string
  institucion: string
}

export default function InvestigadoresIncompletosAdmin() {
  const [investigadores, setInvestigadores] = useState<Investigador[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar investigadores incompletos desde la API
  useEffect(() => {
    const fetchInvestigadoresIncompletos = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/investigadores/incompletos")

        if (!response.ok) {
          throw new Error("Error al cargar los investigadores incompletos")
        }

        const data = await response.json()
        setInvestigadores(data)
      } catch (error) {
        console.error("Error al cargar investigadores incompletos:", error)
        setError("No se pudieron cargar los investigadores incompletos. Usando datos de ejemplo.")

        // Datos de ejemplo como fallback
        const investigadoresData = [
          {
            id: 1,
            no_cvu: "123456",
            curp: "NO DETECTADO",
            nombre_completo: "Dr. Carlos Méndez López",
            rfc: "MELC800101AB9",
            correo: "carlos.mendez@universidad.edu",
            nacionalidad: "Mexicana",
            fecha_nacimiento: "1980-01-01",
            institucion: "Universidad Autónoma de Chihuahua",
          },
          {
            id: 2,
            no_cvu: "234567",
            curp: "NO DETECTADO",
            nombre_completo: "Dra. María Rodríguez Álvarez",
            rfc: "ROAM750212CD3",
            correo: "maria.rodriguez@universidad.edu",
            nacionalidad: "Mexicana",
            fecha_nacimiento: "1975-02-12",
            institucion: "Universidad Nacional Autónoma",
          },
        ]
        setInvestigadores(investigadoresData)
      } finally {
        setIsLoading(false)
      }
    }

    fetchInvestigadoresIncompletos()
  }, [])

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center mb-6">
        <Button variant="ghost" asChild className="mr-4 text-blue-700 hover:bg-blue-50">
          <Link href="/admin/investigadores">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a investigadores
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-blue-900">Investigadores con Datos Incompletos</h1>
      </div>

      {error && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6">
          <p>{error}</p>
        </div>
      )}

      <Card className="bg-white border-blue-100 mb-8">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <CardTitle className="text-blue-900">Registros que requieren atención</CardTitle>
          </div>
          <CardDescription className="text-blue-600">
            Estos registros tienen datos faltantes o no detectados que requieren revisión manual
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-blue-100 overflow-hidden">
            <Table>
              <TableHeader className="bg-blue-50">
                <TableRow className="hover:bg-blue-50 border-b border-blue-100">
                  <TableHead className="text-blue-700">ID</TableHead>
                  <TableHead className="text-blue-700">PU</TableHead>
                  <TableHead className="text-blue-700">CURP</TableHead>
                  <TableHead className="text-blue-700">Nombre Completo</TableHead>
                  <TableHead className="text-blue-700">RFC</TableHead>
                  <TableHead className="text-blue-700">Correo</TableHead>
                  <TableHead className="text-blue-700">Nacionalidad</TableHead>
                  <TableHead className="text-blue-700">Fecha de Nacimiento</TableHead>
                  <TableHead className="text-blue-700 text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-blue-600">
                      Cargando investigadores...
                    </TableCell>
                  </TableRow>
                ) : investigadores.length > 0 ? (
                  investigadores.map((investigador) => (
                    <TableRow key={investigador.id} className="hover:bg-blue-50 border-b border-blue-100">
                      <TableCell className="text-blue-900">{investigador.id}</TableCell>
                      <TableCell className="text-blue-900">{investigador.no_cvu || "N/A"}</TableCell>
                      <TableCell className="text-blue-900">
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          {investigador.curp}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-blue-900 font-medium">
                        {investigador.nombre_completo || "N/A"}
                      </TableCell>
                      <TableCell className="text-blue-900">{investigador.rfc || "N/A"}</TableCell>
                      <TableCell className="text-blue-900">{investigador.correo || "N/A"}</TableCell>
                      <TableCell className="text-blue-900">
                        <Badge variant="outline" className="border-blue-200 text-blue-700">
                          {investigador.nacionalidad || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-blue-900">{investigador.fecha_nacimiento || "N/A"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-700 hover:bg-blue-50"
                            asChild
                          >
                            <Link href={`/investigadores/${investigador.id}`}>
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">Ver perfil</span>
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-700 hover:bg-blue-50"
                            asChild
                          >
                            <Link href={`/admin/investigadores/editar/${investigador.id}`}>
                              <UserCog className="h-4 w-4" />
                              <span className="sr-only">Editar investigador</span>
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-blue-600">
                      No se encontraron investigadores con datos incompletos.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
