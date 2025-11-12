
"use client"

import { useUser, useClerk } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
// removed unused Badge/Progress imports

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { UploadCv } from "@/components/upload-cv"
import { GestionarCvDialog } from "@/components/gestionar-cv-dialog"

import {
  User as UserIcon,
  Building,
  GraduationCap,
  Briefcase,
  MapPin,
  Calendar,
  FileText,
  Phone,
  Mail,
  Edit,
  Loader2,
  AlertCircle,
  Users,
  BookOpen,
  Trash2,
  Download,
  ExternalLink,
  ChevronDown
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog"
import ErrorBoundary from '@/components/error-boundary'

export default function DashboardPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const { signOut } = useClerk()

  const [investigadorData, setInvestigadorData] = useState<any>(null)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)
  const [misPublicaciones, setMisPublicaciones] = useState<any[]>([])
  const [isLoadingMisPublicaciones, setIsLoadingMisPublicaciones] = useState(true)
  const [gestionarCvDialogOpen, setGestionarCvDialogOpen] = useState(false)
  const [tipoDocumento, setTipoDocumento] = useState<'PU' | 'Dictamen' | 'SNI'>('PU')
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)

  useEffect(() => {
    const cargar = async () => {
      if (!isLoaded || !user) return
      try {
        const r = await fetch('/api/investigadores/perfil')
        if (r.ok) {
          const j = await r.json()
          if (j.success && j.data) {
            const data = j.data
            if (typeof data.linea_investigacion === 'string') {
              data.linea_investigacion = data.linea_investigacion.split(',').map((s: string) => s.trim()).filter(Boolean)
            }
            setInvestigadorData(data)
          }
        }
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoadingData(false)
      }
    }
    cargar()
  }, [isLoaded, user])

  useEffect(() => {
    const cargarPublicaciones = async () => {
      if (!isLoaded || !user) return
      try {
        setIsLoadingMisPublicaciones(true)
        const r = await fetch(`/api/publicaciones?clerk_user_id=${encodeURIComponent(user.id)}`)
        if (r.ok) {
          const j = await r.json()
          setMisPublicaciones(j.publicaciones || [])
        } else {
          setMisPublicaciones([])
        }
      } catch (err) {
        console.error('Error loading user publications:', err)
        setMisPublicaciones([])
      } finally {
        setIsLoadingMisPublicaciones(false)
      }
    }
    cargarPublicaciones()
  }, [isLoaded, user])

  if (!isLoaded) return <div className="text-center p-10 text-blue-700">Cargando sesión de usuario...</div>
  if (!user) return <div className="text-center p-10 text-red-700">No has iniciado sesión. Inicia sesión para ver tu dashboard.</div>
  if (isLoadingData) return <div className="text-center p-10 text-blue-700">Cargando datos del perfil...</div>
  if (!investigadorData) return <div className="text-center p-10 text-orange-700">No se encontraron datos de tu perfil en la base de datos.</div>

  const perfilCompleto = investigadorData?.perfil_completo === true

  const getValidCvUrl = (url: string | null | undefined) => {
    if (!url) return null
    if (url.startsWith('http://') || url.startsWith('https://')) return url
    if (url.startsWith('/uploads/')) return url
    return null
  }

  const validCvUrl = getValidCvUrl(investigadorData?.cv_url)
  const validDictamenUrl = getValidCvUrl(investigadorData?.dictamen_url)
  const validSniUrl = getValidCvUrl(investigadorData?.sni_url)

  const formatDate = (dateStr: string | Date | null | undefined) => {
    if (!dateStr) return null
    // If it's already a Date object, format directly (no timezone shift)
    if (dateStr instanceof Date) {
      return dateStr.toLocaleDateString('es-ES')
    }

    // If the string includes a time (ISO), prefer to strip time and parse date-only
    if (typeof dateStr === 'string' && dateStr.includes('T')) {
      const only = dateStr.split('T')[0]
      const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(only)
      if (m) {
        const y = Number(m[1]), mo = Number(m[2]) - 1, d = Number(m[3])
        const dt = new Date(y, mo, d)
        return dt.toLocaleDateString('es-ES')
      }
      // fallback to original string if unexpected
    }

    // Handle plain YYYY-MM-DD (date-only) to avoid timezone shifts
    const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(dateStr))
    if (dateOnlyMatch) {
      const year = Number(dateOnlyMatch[1])
      const monthIndex = Number(dateOnlyMatch[2]) - 1
      const day = Number(dateOnlyMatch[3])
      // Use local Date constructor to preserve the intended calendar date
      const d = new Date(year, monthIndex, day)
      if (isNaN(d.getTime())) return dateStr
      return d.toLocaleDateString('es-ES')
    }

    // Fallback for other ISO formats including full timestamp strings
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return dateStr
      return d.toLocaleDateString('es-ES')
    } catch (e) {
      return dateStr
    }
  }

  const handleEliminarConfirmed = async () => {
    setIsDeletingAccount(true)
    try {
      const r = await fetch('/api/investigadores/eliminar', { method: 'POST' })
      const j = await r.json()
      if (r.ok && j.success) {
        // close dialog and redirect
        setOpenDeleteDialog(false)
        router.push('/iniciar-sesion')
      } else {
        // keep dialog open and log
        console.error('Error al eliminar:', j.error)
        setOpenDeleteDialog(false)
      }
    } catch (err) {
      console.error(err)
      setOpenDeleteDialog(false)
    } finally {
      setIsDeletingAccount(false)
    }
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* add bottom padding to avoid sticky overlap with footer */}
      <div className="container mx-auto py-6 px-4 pb-24">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-900">Dashboard Social</h1>
          <p className="text-blue-600">Tu red de colaboración científica</p>
        </div>

        {investigadorData && !perfilCompleto && (
          <Card className="mb-6 bg-amber-50 border-amber-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-900">Perfil incompleto</h3>
                  <p className="text-sm text-amber-700 mt-1">Faltan datos clave en tu perfil. Completa tu información para aprovechar todas las funcionalidades.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-6 space-y-6">
              {/* Perfil del Investigador (diseño inspirado en el ejemplo proporcionado) */}
              <Card className="bg-white border-blue-100 shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle className="text-blue-900 flex items-center"><UserIcon className="mr-2 h-5 w-5" />Perfil del Investigador</CardTitle>
                    <CardDescription className="text-blue-600">Información de tu cuenta</CardDescription>
                  </div>
                  <Button onClick={() => router.push('/dashboard/editar-perfil')} size="sm" className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                    <Edit className="mr-2 h-4 w-4" />Editar
                  </Button>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-20 w-20 flex-shrink-0">
                      {investigadorData?.fotografia_url && investigadorData.fotografia_url.trim() !== "" ? (
                        <AvatarImage src={investigadorData.fotografia_url} alt={investigadorData?.nombre_completo || 'Usuario'} />
                      ) : (
                        <AvatarFallback className="bg-blue-100 text-blue-700 text-xl">
                          {(investigadorData?.nombre_completo && investigadorData.nombre_completo.trim() !== "") ? investigadorData.nombre_completo.charAt(0).toUpperCase() : (user.fullName || 'U').charAt(0).toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl font-bold text-blue-900 break-words">{(investigadorData?.nombre_completo && investigadorData.nombre_completo.trim() !== "") ? investigadorData.nombre_completo : user.fullName || user.firstName || 'Usuario'}</h2>
                      <p className="text-sm text-blue-600 flex items-center gap-2 mt-1"><Mail className="h-3.5 w-3.5" />{(investigadorData?.correo && investigadorData.correo.trim() !== "") ? investigadorData.correo : user.primaryEmailAddress?.emailAddress || 'No disponible'}</p>
                      {investigadorData?.telefono && investigadorData.telefono.trim() !== "" && (
                        <p className="text-sm text-blue-600 flex items-center gap-2 mt-1"><Phone className="h-3.5 w-3.5" />{investigadorData.telefono}</p>
                      )}
                    </div>
                  </div>

                  {/* Información secundaria: mostrar debajo de la foto/nombre y encima de los chips */}
                  <div className="mt-3 text-sm text-slate-700 space-y-1">
                    {investigadorData?.fecha_nacimiento && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span className="truncate">{formatDate(investigadorData.fecha_nacimiento)}</span>
                      </div>
                    )}
                    {investigadorData?.nacionalidad && (
                      <div className="flex items-center gap-2 break-words break-all">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        <span className="truncate">{investigadorData.nacionalidad}</span>
                      </div>
                    )}
                    {investigadorData?.ultimo_grado_estudios && (
                      <div className="flex items-center gap-2 break-words break-all">
                        <GraduationCap className="h-4 w-4 text-slate-400" />
                        <span className="truncate">{investigadorData.ultimo_grado_estudios}</span>
                      </div>
                    )}
                    {investigadorData?.empleo_actual && (
                      <div className="flex items-center gap-2 break-words break-all">
                        <Briefcase className="h-4 w-4 text-slate-400" />
                        <span className="truncate">{investigadorData.empleo_actual}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {investigadorData?.curp && <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-md">CURP: {investigadorData.curp}</span>}
                      {investigadorData?.rfc && <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-md">RFC: {investigadorData.rfc}</span>}
                      {investigadorData?.no_cvu && <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-md">CVU: {investigadorData.no_cvu}</span>}
                    </div>

                    <div className="text-sm text-blue-600 space-y-1">
                      {investigadorData?.institucion && <div className="flex items-center gap-2"><Building className="h-4 w-4" />{investigadorData.institucion}</div>}
                      {investigadorData?.dependencia && <div className="flex items-center gap-2 mt-1"><Users className="h-4 w-4" />{investigadorData.dependencia}</div>}
                      {investigadorData?.departamento && <div className="flex items-center gap-2 mt-1"><BookOpen className="h-4 w-4" />{investigadorData.departamento}</div>}

                      {investigadorData?.linea_investigacion && Array.isArray(investigadorData.linea_investigacion) && (
                        <div className="mt-6 pt-3 border-t border-blue-50">
                          <label className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Líneas de Investigación</label>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {investigadorData.linea_investigacion.slice(0,5).map((tag: string, idx: number) => (
                              <span key={idx} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100 break-words break-all">{tag}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Área de Investigación (subtítulo + contenido) */}
                      {investigadorData?.area_investigacion && investigadorData.area_investigacion.trim() !== "" && (
                        <div className="mt-3">
                          <label className="text-xs font-semibold text-blue-700 flex items-center gap-2 uppercase tracking-wide">
                            <BookOpen className="h-3.5 w-3.5" />Área de Investigación
                          </label>
                          <p className="text-sm text-blue-900 mt-2 whitespace-pre-line break-words break-all">{investigadorData.area_investigacion}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Zona de Peligro */}
              <Card className="bg-white border-red-200">
                <CardHeader className="px-6 pt-6">
                  <CardTitle className="text-red-900 flex items-center"><AlertCircle className="mr-2 h-5 w-5" />Zona de Peligro</CardTitle>
                  <CardDescription className="text-red-600 text-sm">Acciones irreversibles</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4 bg-red-50 rounded-md border border-red-200 p-4">
                    {investigadorData?.activo !== false && (
                      <Button variant="outline" className="w-full border border-red-400 text-red-700 hover:bg-red-100">Ocultar perfil</Button>
                    )}
                      <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-red-900">Eliminar Cuenta</h3>
                        <p className="text-sm text-red-700 mt-1">Esta acción eliminará permanentemente tu cuenta y datos. Esta acción no se puede deshacer.</p>
                      </div>
                      {/* Open the confirmation dialog instead of calling undefined handler */}
                      <Button variant="destructive" className="bg-red-600 hover:bg-red-700 text-white" disabled={isDeletingAccount} onClick={() => setOpenDeleteDialog(true)}>{isDeletingAccount ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Eliminando...</> : <><Trash2 className="mr-2 h-4 w-4" />Eliminar Cuenta</>}</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="lg:col-span-8 flex flex-col gap-8">
            <Card className="bg-white border-blue-100 shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between w-full">
                  <div>
                    <CardTitle className="text-blue-900 flex items-center"><FileText className="mr-2 h-5 w-5" />Perfil Único del Investigador</CardTitle>
                    <CardDescription className="text-blue-600">{validCvUrl ? 'Documento disponible' : 'Completa tu perfil público'}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">{tipoDocumento}<ChevronDown className="ml-2 h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setTipoDocumento('PU')}>PU</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTipoDocumento('Dictamen')}>Dictamen</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTipoDocumento('SNI')}>SNI</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    {(tipoDocumento === 'PU' ? validCvUrl : tipoDocumento === 'Dictamen' ? validDictamenUrl : validSniUrl) && (
                      <Button onClick={() => setGestionarCvDialogOpen(true)} variant="outline" className="border-blue-300 text-blue-700"> <Edit className="mr-2 h-4 w-4" />Gestionar</Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {tipoDocumento === 'PU' ? (
                  validCvUrl ? (
                    <div className="w-full space-y-4">
                      <div className="flex gap-3 justify-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <Button onClick={() => window.open(validCvUrl, '_blank')} className="bg-gradient-to-r from-blue-600 to-blue-700 text-white"><ExternalLink className="mr-2 h-4 w-4" />Abrir PDF</Button>
                        <Button variant="outline" onClick={() => { const l = document.createElement('a'); l.href = validCvUrl as string; l.download = `${investigadorData?.nombre_completo?.replace(/\s+/g, '_') || 'perfil'}.pdf`; document.body.appendChild(l); l.click(); document.body.removeChild(l); }}> <Download className="mr-2 h-4 w-4" />Descargar</Button>
                      </div>
                      <div className="relative w-full bg-gray-100 rounded-lg overflow-hidden border-2 border-blue-200 h-[50vh] md:h-[60vh] lg:h-[70vh]">
                        <iframe src={validCvUrl as string} className="w-full h-full" title="Vista previa" style={{ border: 'none' }} />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 p-6">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                        <FileText className="h-12 w-12 text-blue-400 mx-auto mb-3" />
                        <p className="text-blue-700 font-medium mb-2">Perfil Único no disponible</p>
                        <p className="text-sm text-blue-600 mb-4">Sube tu Perfil Único (PDF) para visualizarlo aquí.</p>
                      </div>
                      <UploadCv value={investigadorData?.cv_url || ''} onChange={async (url) => { try { const res = await fetch('/api/investigadores/update-cv', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cv_url: url }) }); if (res.ok) { setInvestigadorData({ ...investigadorData, cv_url: url }); alert('CV actualizado'); } else { alert('Error al actualizar'); } } catch (e) { alert('Error al actualizar'); } }} nombreCompleto={investigadorData?.nombre_completo || 'Usuario'} showPreview />
                    </div>
                  )
                ) : tipoDocumento === 'Dictamen' ? (
                  validDictamenUrl ? (
                    <div className="w-full space-y-4">
                      <div className="flex gap-3 justify-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <Button onClick={() => window.open(validDictamenUrl as string, '_blank')} className="bg-gradient-to-r from-blue-600 to-blue-700 text-white"><ExternalLink className="mr-2 h-4 w-4" />Abrir PDF</Button>
                        <Button variant="outline" onClick={() => { const l = document.createElement('a'); l.href = validDictamenUrl as string; l.download = `${investigadorData?.nombre_completo?.replace(/\s+/g, '_') || 'dictamen'}_dictamen.pdf`; document.body.appendChild(l); l.click(); document.body.removeChild(l); }}> <Download className="mr-2 h-4 w-4" />Descargar</Button>
                      </div>
                      <div className="relative w-full bg-gray-100 rounded-lg overflow-hidden border-2 border-blue-200 h-[50vh] md:h-[60vh] lg:h-[70vh]">
                        <iframe src={validDictamenUrl as string} className="w-full h-full" title="Vista previa dictamen" style={{ border: 'none' }} />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 p-6">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                        <FileText className="h-12 w-12 text-blue-400 mx-auto mb-3" />
                        <p className="text-blue-700 font-medium mb-2">Dictamen no disponible</p>
                        <p className="text-sm text-blue-600 mb-4">Sube tu dictamen en PDF para visualizarlo aquí.</p>
                      </div>
                      <UploadCv value={investigadorData?.dictamen_url || ''} onChange={async (url) => { try { const res = await fetch('/api/investigadores/update-dictamen', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dictamen_url: url }) }); if (res.ok) { setInvestigadorData({ ...investigadorData, dictamen_url: url }); alert('Dictamen actualizado'); } else { alert('Error al actualizar'); } } catch (e) { alert('Error al actualizar'); } }} nombreCompleto={investigadorData?.nombre_completo || 'Usuario'} showPreview />
                    </div>
                  )
                ) : (
                  validSniUrl ? (
                    <div className="w-full space-y-4">
                      <div className="flex gap-3 justify-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <Button onClick={() => window.open(validSniUrl as string, '_blank')} className="bg-gradient-to-r from-blue-600 to-blue-700 text-white"><ExternalLink className="mr-2 h-4 w-4" />Abrir PDF</Button>
                        <Button variant="outline" onClick={() => { const l = document.createElement('a'); l.href = validSniUrl as string; l.download = `${investigadorData?.nombre_completo?.replace(/\s+/g, '_') || 'sni'}_sni.pdf`; document.body.appendChild(l); l.click(); document.body.removeChild(l); }}> <Download className="mr-2 h-4 w-4" />Descargar</Button>
                      </div>
                      <div className="relative w-full bg-gray-100 rounded-lg overflow-hidden border-2 border-blue-200 h-[50vh] md:h-[60vh] lg:h-[70vh]">
                        <iframe src={validSniUrl as string} className="w-full h-full" title="Vista previa SNI" style={{ border: 'none' }} />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 p-6">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                        <FileText className="h-12 w-12 text-blue-400 mx-auto mb-3" />
                        <p className="text-blue-700 font-medium mb-2">SNI no disponible</p>
                        <p className="text-sm text-blue-600 mb-4">Sube tu documento SNI en PDF para visualizarlo aquí.</p>
                      </div>
                      <UploadCv value={investigadorData?.sni_url || ''} onChange={async (url) => { try { const res = await fetch('/api/investigadores/update-sni', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sni_url: url }) }); if (res.ok) { setInvestigadorData({ ...investigadorData, sni_url: url }); alert('SNI actualizado'); } else { alert('Error al actualizar'); } } catch (e) { alert('Error al actualizar'); } }} nombreCompleto={investigadorData?.nombre_completo || 'Usuario'} showPreview />
                    </div>
                  )
                )}
              </CardContent>
            </Card>

              {/* Publicaciones del investigador: incluimos aquí 'Mis publicaciones' para mantener agrupación visual */}

            <Card className="bg-white border-blue-100 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-blue-900 flex items-center"><FileText className="mr-2 h-5 w-5" />Publicaciones</CardTitle>
                <CardDescription className="text-blue-600">Gestiona tu producción científica</CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                {/* Integrar "Mis publicaciones" directamente dentro de este bloque para evitar cards separadas */}
                <div style={{ maxHeight: 260 }} className="overflow-y-auto">
                  {isLoadingMisPublicaciones ? (
                    <div className="text-sm text-blue-600">Cargando tus publicaciones...</div>
                  ) : misPublicaciones.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-blue-900 font-medium mb-2">No has subido publicaciones aún.</p>
                      <p className="text-sm text-blue-600 mb-4">Comienza agregando tu primera publicación para que aparezca en tu perfil.</p>
                      <div className="flex justify-center">
                        <Button onClick={() => router.push('/publicaciones/nueva')} className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">Crear publicación</Button>
                      </div>
                    </div>
                  ) : (
                    <ul className="space-y-3">
                      {misPublicaciones.map((p: any) => (
                        <li key={p.id} className="text-sm">
                          <div className="font-medium text-blue-900 truncate">{p.titulo}</div>
                          <div className="text-xs text-blue-600">{(p.año || 's.f.')} • {p.revista || p.institucion || '—'}</div>
                          <div className="mt-1 flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => { if (p.archivoUrl) window.open(p.archivoUrl, '_blank'); else if (p.doi) window.open(`https://doi.org/${p.doi}`, '_blank'); else alert('No hay recurso disponible') }}>Ver</Button>
                            <Button size="sm" variant="ghost" onClick={() => router.push(`/publicaciones/nueva?id=${p.id}`)}>Editar</Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {/* Acción rápida para crear una nueva publicación, visible siempre */}
                <div className="mt-4 flex justify-end">
                  <Button size="sm" onClick={() => router.push('/publicaciones/nueva')} className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">Nueva publicación</Button>
                </div>
              </CardContent>
            </Card>

            <GestionarCvDialog
              open={gestionarCvDialogOpen}
              onOpenChange={setGestionarCvDialogOpen}
              cvUrlActual={tipoDocumento === 'PU' ? investigadorData?.cv_url : tipoDocumento === 'Dictamen' ? investigadorData?.dictamen_url : investigadorData?.sni_url}
              tipoDocumento={tipoDocumento}
              onCvUpdated={async (newUrl) => {
                if (investigadorData) {
                  if (tipoDocumento === 'PU') setInvestigadorData({ ...investigadorData, cv_url: newUrl || undefined })
                  else if (tipoDocumento === 'Dictamen') setInvestigadorData({ ...investigadorData, dictamen_url: newUrl || undefined })
                  else setInvestigadorData({ ...investigadorData, sni_url: newUrl || undefined })
                }
                try {
                  const r = await fetch('/api/investigadores/perfil')
                  if (r.ok) {
                    const j = await r.json()
                    if (j.success && j.data) setInvestigadorData(j.data)
                  }
                } catch (e) { console.error(e) }
              }}
            />

            {/* Confirmación de eliminación usando AlertDialog del sistema de UI */}
            <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Eliminar cuenta</AlertDialogTitle>
                  <AlertDialogDescription>Esta acción eliminará permanentemente tu cuenta y todos tus datos. ¿Estás seguro que deseas continuar?</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleEliminarConfirmed} className="bg-red-600 text-white">{isDeletingAccount ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Eliminando...</> : <>Eliminar cuenta</>}</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
      </div>
    </ErrorBoundary>
  )
}