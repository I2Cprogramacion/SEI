"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"

type Institution = {
  id: string
  nombre: string
  tipo?: string | null
  ubicacion?: string | null
  sitioWeb?: string | null
  createdAt: string
  activo?: boolean
}

const TIPOS_INSTITUCION = [
  "Universidad",
  "Centro de Investigación", 
  "Instituto Tecnológico",
  "Empresa",
  "Organización Gubernamental",
  "Otro"
]

export default function AdminInstitucionesPage() {
  const { toast } = useToast()
  const [items, setItems] = useState<Institution[]>([])
  const [q, setQ] = useState("")
  const [filtroTipo, setFiltroTipo] = useState("")
  const [filtroEstado, setFiltroEstado] = useState("")
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Institution | null>(null)
  const [form, setForm] = useState({ nombre: "", tipo: "", ubicacion: "", sitioWeb: "" })

  const token = useMemo(() => {
    if (typeof window === "undefined") return ""
    return localStorage.getItem("token") ?? ""
  }, [])

  async function load() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (q) params.append("q", q)
      if (filtroTipo && filtroTipo !== "todos") params.append("tipo", filtroTipo)
      if (filtroEstado && filtroEstado !== "todos") params.append("estado", filtroEstado)
      
      const res = await fetch(`/api/instituciones?${params.toString()}` , {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
      if (!res.ok) throw new Error("Error al cargar instituciones")
      const data = await res.json()
      setItems(data.items ?? [])
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function limpiarFiltros() {
    setQ("")
    setFiltroTipo("todos")
    setFiltroEstado("todos")
  }
  
  function openCreate() {
    setEditing(null)
    setForm({ nombre: "", tipo: "sin-tipo", ubicacion: "", sitioWeb: "" })
    setOpen(true)
  }

  function openEdit(item: Institution) {
    setEditing(item)
    setForm({ 
      nombre: item.nombre ?? "", 
      tipo: item.tipo || "sin-tipo", 
      ubicacion: item.ubicacion ?? "", 
      sitioWeb: item.sitioWeb ?? "" 
    })
    setOpen(true)
  }

  async function onSave() {
    try {
      const method = editing ? "PUT" : "POST"
      const url = editing ? `/api/instituciones/${editing.id}` : "/api/instituciones"
      const formData = {
        ...form,
        tipo: form.tipo === "sin-tipo" ? "" : form.tipo
      }
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(formData),
      })
      if (!res.ok) throw new Error("Error al guardar")
      toast({ title: "Guardado", description: "La institución se guardó correctamente" })
      setOpen(false)
      await load()
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" })
    }
  }

  async function onDelete(id: string) {
    if (!confirm("¿Eliminar esta institución?")) return
    try {
      const res = await fetch(`/api/instituciones/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
      if (!res.ok) throw new Error("Error al eliminar")
      toast({ title: "Eliminado", description: "La institución fue eliminada" })
      await load()
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" })
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Instituciones</h1>
        <Button onClick={openCreate}>Nueva institución</Button>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          <Input placeholder="Buscar por nombre, tipo o ubicación" value={q} onChange={(e) => setQ(e.target.value)} />
          <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={load} disabled={loading}>Buscar</Button>
        </div>
        
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Tipo:</label>
            <Select value={filtroTipo} onValueChange={setFiltroTipo}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Todos los tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los tipos</SelectItem>
                {TIPOS_INSTITUCION.map((tipo) => (
                  <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Estado:</label>
            <Select value={filtroEstado} onValueChange={setFiltroEstado}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="activo">Activo</SelectItem>
                <SelectItem value="inactivo">Inactivo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button variant="outline" onClick={limpiarFiltros}>Limpiar filtros</Button>
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Ubicación</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Sitio web</TableHead>
              <TableHead className="w-[160px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((it) => (
              <TableRow key={it.id}>
                <TableCell>{it.nombre}</TableCell>
                <TableCell>
                  {it.tipo ? (
                    <Badge variant="secondary">{it.tipo}</Badge>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell>{it.ubicacion ?? "-"}</TableCell>
                <TableCell>
                  <Badge variant={it.activo !== false ? "default" : "destructive"}>
                    {it.activo !== false ? "Activo" : "Inactivo"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {it.sitioWeb ? (
                    <a className="text-blue-600 underline" href={it.sitioWeb} target="_blank" rel="noreferrer">
                      {it.sitioWeb}
                    </a>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell className="space-x-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(it)}>Editar</Button>
                  <Button size="sm" variant="destructive" onClick={() => onDelete(it.id)}>Eliminar</Button>
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">No hay instituciones</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar institución" : "Nueva institución"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <label className="text-sm font-medium">Nombre</label>
              <Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Tipo</label>
              <Select value={form.tipo} onValueChange={(value) => setForm({ ...form, tipo: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sin-tipo">Sin tipo</SelectItem>
                  {TIPOS_INSTITUCION.map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Ubicación</label>
              <Input value={form.ubicacion} onChange={(e) => setForm({ ...form, ubicacion: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Sitio web</label>
              <Input value={form.sitioWeb} onChange={(e) => setForm({ ...form, sitioWeb: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={onSave}>{editing ? "Guardar cambios" : "Crear"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


