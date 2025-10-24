"use client"

import { useUser, useClerk } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { CvViewer } from "@/components/cv-viewer";
import { UploadCv } from "@/components/upload-cv";
import { GestionarCvDialog } from "@/components/gestionar-cv-dialog";

import {
  User as UserIcon,
  Building,
  Award,
  FileText,
  Phone,
  Mail,
  Briefcase,
  GraduationCap,
  MapPin,
  Edit,
  Loader2,
  AlertCircle,
  Users,
  TrendingUp,
  BookOpen,
  Network,
  MessageCircle,
  UserPlus,
  BarChart3,
  Eye,
  Sparkles,
  Trash2
} from "lucide-react"

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

// Define missing types
type Estadisticas = {
  publicaciones: number;
  proyectos: number;
  conexiones: number;
  perfilCompleto: number;
};

// Main dashboard component
export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const { signOut } = useClerk();

  const [investigadorData, setInvestigadorData] = useState<any>(null);
  const [estadisticas, setEstadisticas] = useState<Estadisticas>({
    publicaciones: 0,
    proyectos: 0,
    conexiones: 0,
    perfilCompleto: 0
  });
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isLoadingSugerencias, setIsLoadingSugerencias] = useState(true);
  const [isLoadingEstadisticas, setIsLoadingEstadisticas] = useState(true);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [gestionarCvDialogOpen, setGestionarCvDialogOpen] = useState(false);
  const [sugerencias, setSugerencias] = useState<any>(null);
  const [isDesactivando, setIsDesactivando] = useState(false);
  const [areasInput, setAreasInput] = useState("");

  // Cargar datos del investigador
  useEffect(() => {
    const cargarDatos = async () => {
      if (!isLoaded || !user) return;
      try {
        const response = await fetch("/api/investigadores/perfil");
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            let data = result.data;
            if (typeof data.area_investigacion === "string") {
              data.area_investigacion = data.area_investigacion.split(",").map((a: string) => a.trim()).filter(Boolean);
            }
            if (typeof data.linea_investigacion === "string") {
              data.linea_investigacion = data.linea_investigacion.split(",").map((l: string) => l.trim()).filter(Boolean);
            }
            setInvestigadorData(data);
          }
        } else {
          console.warn("No se pudieron cargar los datos del perfil desde PostgreSQL");
        }
      } catch (error) {
        console.error("Error al cargar datos del investigador:", error);
      } finally {
        setIsLoadingData(false);
      }
    };
    cargarDatos();
  }, [isLoaded, user]);

  // Cargar sugerencias de colaboración
  useEffect(() => {
    const cargarSugerencias = async () => {
      if (!isLoaded || !user) return;
      try {
        const response = await fetch("/api/dashboard/sugerencias");
        if (response.ok) {
          const data = await response.json();
          setSugerencias(data);
        }
      } catch (error) {
        console.error("Error al cargar sugerencias:", error);
      } finally {
        setIsLoadingSugerencias(false);
      }
    };
    cargarSugerencias();
  }, [isLoaded, user]);

  // Cargar estadísticas
  useEffect(() => {
    const cargarEstadisticas = async () => {
      if (!isLoaded || !user) return;
      try {
        const response = await fetch("/api/dashboard/estadisticas");
        if (response.ok) {
          const data = await response.json();
          setEstadisticas(data);
        }
      } catch (error) {
        console.error("Error al cargar estadísticas:", error);
      } finally {
        setIsLoadingEstadisticas(false);
      }
    };
    cargarEstadisticas();
  }, [isLoaded, user]);

  // Función para eliminar cuenta
  const handleEliminarCuenta = async () => {
    setIsDeletingAccount(true);
    try {
      const response = await fetch("/api/usuario/eliminar", {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        await signOut();
        router.push("/");
      } else {
        alert(`Error al eliminar cuenta: ${data.error || data.warning}`);
      }
    } catch (error) {
      console.error("Error al eliminar cuenta:", error);
      alert("Error al eliminar la cuenta. Por favor, intenta de nuevo.");
    } finally {
      setIsDeletingAccount(false);
    }
  };

  if (!isLoaded || isLoadingData) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-700 mx-auto" />
          <p className="mt-4 text-blue-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="container mx-auto py-6 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-900">Dashboard Social</h1>
          <p className="text-blue-600">Tu red de colaboración científica</p>
        </div>

        {/* Mensaje informativo si no hay datos de PostgreSQL */}
        {!investigadorData && (
          <Card className="mb-6 bg-amber-50 border-amber-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-900">Perfil incompleto</h3>
                  <p className="text-sm text-amber-700 mt-1">
                    No se encontraron datos adicionales en tu perfil. Haz clic en "Editar Perfil" para completar tu información.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Información del usuario */}
        <Card className="mb-8 bg-white border-blue-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-blue-900 flex items-center">
                <UserIcon className="mr-2 h-5 w-5" />
                Perfil del Investigador
              </CardTitle>
              <CardDescription className="text-blue-600">
                Información completa de tu cuenta
              </CardDescription>
            </div>
            <Button
              onClick={() => router.push("/dashboard/editar-perfil")}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800"
            >
              <Edit className="mr-2 h-4 w-4" />
              Editar Perfil
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Foto y datos básicos */}
            <div className="flex items-start gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={investigadorData?.fotografia_url || ""} alt={investigadorData?.nombre_completo || "Usuario"} />
                <AvatarFallback className="bg-blue-100 text-blue-700 text-2xl">
                  {(investigadorData?.nombre_completo || user.fullName || "U").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-blue-900">
                  {investigadorData?.nombre_completo || user.fullName || user.firstName || "Usuario"}
                </h2>
                <p className="text-blue-600 flex items-center gap-2 mt-1">
                  <Mail className="h-4 w-4" />
                  {investigadorData?.correo || user.primaryEmailAddress?.emailAddress || "No disponible"}
                </p>
                {investigadorData?.telefono && (
                  <p className="text-blue-600 flex items-center gap-2 mt-1">
                    <Phone className="h-4 w-4" />
                    {investigadorData.telefono}
                  </p>
                )}
              </div>
            </div>

            {/* Información detallada */}
            {investigadorData && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-blue-100">
                {investigadorData.empleo_actual && (
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-blue-700 flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Empleo Actual
                    </label>
                    <p className="text-blue-900">{investigadorData.empleo_actual}</p>
                  </div>
                )}
                
                {investigadorData.ultimo_grado_estudios && (
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-blue-700 flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      Último Grado de Estudios
                    </label>
                    <p className="text-blue-900">{investigadorData.ultimo_grado_estudios}</p>
                  </div>
                )}

                {investigadorData.area_investigacion && investigadorData.area_investigacion.length > 0 && (
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-blue-700 flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      Área de Investigación
                    </label>
                    <p className="text-blue-900">
                      {Array.isArray(investigadorData.area_investigacion) 
                        ? investigadorData.area_investigacion.join(', ')
                        : investigadorData.area_investigacion
                      }
                    </p>
                  </div>
                )}

                {investigadorData.linea_investigacion && investigadorData.linea_investigacion.length > 0 && (
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-blue-700 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Línea de Investigación
                    </label>
                    <p className="text-blue-900">
                      {Array.isArray(investigadorData.linea_investigacion) 
                        ? investigadorData.linea_investigacion.join(', ')
                        : investigadorData.linea_investigacion
                      }
                    </p>
                  </div>
                )}

                {investigadorData.no_cvu && (
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-blue-700">CVU/PU</label>
                    <p className="text-blue-900">{investigadorData.no_cvu}</p>
                  </div>
                )}

                {investigadorData.nacionalidad && (
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-blue-700 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Nacionalidad
                    </label>
                    <p className="text-blue-900">{investigadorData.nacionalidad}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Perfil del Investigador */}
        <Card className="mb-8 bg-white border-blue-100">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-blue-900 flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Perfil del Investigador
                </CardTitle>
                <CardDescription className="text-blue-600">
                  {investigadorData?.cv_url ? "Tu perfil es visible públicamente con Perfil Único del registro" : "Completa tu perfil público"}
                </CardDescription>
              </div>
              {investigadorData?.cv_url && (
                <Button
                  onClick={() => setGestionarCvDialogOpen(true)}
                  variant="outline"
                  className="border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Gestionar Perfil Único
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {investigadorData?.cv_url ? (
              <CvViewer 
                cvUrl={investigadorData.cv_url} 
                investigadorNombre={investigadorData.nombre_completo}
              />
            ) : (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                  <FileText className="h-12 w-12 text-blue-400 mx-auto mb-3" />
                  <p className="text-blue-700 font-medium mb-2">Perfil Único del registro no disponible</p>
                  <p className="text-sm text-blue-600 mb-4">
                    Tu Perfil Único debería haberse guardado automáticamente durante el registro. Si no aparece, puedes subirlo manualmente.
                  </p>
                </div>
                <UploadCv
                  value={investigadorData?.cv_url || ""}
                  onChange={async (url) => {
                    console.log("=== PERFIL ÚNICO SUBIDO ===")
                    console.log("URL recibida:", url)
                    
                    // Actualizar el CV en la base de datos
                    try {
                      const response = await fetch('/api/investigadores/update-cv', {
                        method: 'POST',
                        headers: { 
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ cv_url: url })
                      })
                      
                      console.log("Response status:", response.status)
                      const responseData = await response.json()
                      console.log("Response data:", responseData)
                      
                      if (response.ok) {
                        console.log("✅ Perfil Único actualizado en la base de datos")
                        // Actualizar el estado local
                        if (investigadorData) {
                          setInvestigadorData({ ...investigadorData, cv_url: url })
                        }
                        alert("¡Perfil Único subido exitosamente! Recargando página...")
                        // Recargar la página para mostrar el CV
                        window.location.reload()
                      } else {
                        console.error("❌ Error en la respuesta:", responseData)
                        alert(`Error al actualizar: ${responseData.error || 'Error desconocido'}`)
                      }
                    } catch (error) {
                      console.error('❌ Error al actualizar Perfil Único:', error)
                      alert('Error al actualizar el Perfil Único. Por favor, intenta de nuevo.')
                    }
                  }}
                  nombreCompleto={investigadorData?.nombre_completo || "Usuario"}
                  showPreview={true}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Botón para desactivar perfil */}
        {investigadorData?.activo !== false && (
          <div className="my-6 flex justify-center">
            <Button
              variant="destructive"
              disabled={isDesactivando}
              onClick={async () => {
                setIsDesactivando(true);
                try {
                  const response = await fetch("/api/investigadores/desactivar", { method: "POST" });
                  const result = await response.json();
                  if (response.ok && result.success) {
                    alert("Tu perfil ha sido desactivado y ahora está oculto para los demás.");
                    if (investigadorData) {
                      setInvestigadorData({
                        ...investigadorData,
                        activo: false
                      });
                    }
                  }
                } finally {
                  setIsDesactivando(false);
                }
              }}
            >
              Desactivar perfil
            </Button>
          </div>
        )}

        {/* Publicaciones */}
        <Card className="bg-white border-blue-100 hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="text-blue-900 flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Publicaciones
            </CardTitle>
            <CardDescription className="text-blue-600">
              Gestiona tu producción científica
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Estadísticas */}
        <div className="mt-8">
          <Card className="bg-white border-blue-100">
            <CardHeader>
              <CardTitle className="text-blue-900">Resumen de Actividad</CardTitle>
              <CardDescription className="text-blue-600">
                Estadísticas de tu perfil de investigador
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  {isLoadingEstadisticas ? (
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                  ) : (
                    <div className="text-3xl font-bold mb-1">{estadisticas.publicaciones}</div>
                  )}
                  <div className="text-sm opacity-90 flex items-center justify-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    Publicaciones
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  {isLoadingEstadisticas ? (
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                  ) : (
                    <div className="text-3xl font-bold mb-1">{estadisticas.proyectos}</div>
                  )}
                  <div className="text-sm opacity-90 flex items-center justify-center gap-1">
                    <FileText className="h-4 w-4" />
                    Proyectos
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  {isLoadingEstadisticas ? (
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                  ) : (
                    <div className="text-3xl font-bold mb-1">{estadisticas.conexiones}</div>
                  )}
                  <div className="text-sm opacity-90 flex items-center justify-center gap-1">
                    <Users className="h-4 w-4" />
                    Conexiones
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  {isLoadingEstadisticas ? (
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                  ) : (
                    <div className="text-3xl font-bold mb-1">{estadisticas.perfilCompleto}%</div>
                  )}
                  <div className="text-sm opacity-90 flex items-center justify-center gap-1">
                    <BarChart3 className="h-4 w-4" />
                    Perfil Completo
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>


        {/* Zona de peligro - Ocultar perfil y Eliminar cuenta */}
        <div className="mt-8">
          <Card className="bg-white border-red-200">
            <CardHeader>
              <CardTitle className="text-red-900 flex items-center">
                <AlertCircle className="mr-2 h-5 w-5" />
                Zona de Peligro
              </CardTitle>
              <CardDescription className="text-red-600">
                Acciones irreversibles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 p-4 bg-red-50 rounded-lg border border-red-200">
                {/* Ocultar perfil solo si activo === true */}
                {investigadorData?.activo !== false && (
                  <Button
                    variant="outline"
                    className="border border-red-400 text-red-700 hover:bg-red-100"
                    disabled={isDesactivando}
                    onClick={async () => {
                      setIsDesactivando(true);
                      try {
                        const response = await fetch("/api/investigadores/desactivar", { method: "POST" });
                        const result = await response.json();
                        if (response.ok && result.success) {
                          alert("Tu perfil ha sido ocultado y ahora está invisible para los demás.");
                          if (investigadorData) {
                            setInvestigadorData({ ...investigadorData, activo: false });
                          }
                        } else {
                          alert("Error al ocultar perfil: " + (result.error || "Error desconocido"));
                        }
                      } catch (error) {
                        alert("Error al ocultar perfil. Por favor, intenta de nuevo.");
                      } finally {
                        setIsDesactivando(false);
                      }
                    }}
                  >
                    Ocultar perfil
                  </Button>
                )}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-900">Eliminar Cuenta</h3>
                    <p className="text-sm text-red-700 mt-1">
                      Esta acción eliminará permanentemente tu cuenta, todos tus datos del sistema y tu usuario de Clerk. 
                      <strong className="block mt-1">Esta acción no se puede deshacer.</strong>
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    className="ml-4 bg-red-600 hover:bg-red-700 text-white border-none"
                    disabled={isDeletingAccount}
                    onClick={async () => {
                      setIsDeletingAccount(true);
                      try {
                        const response = await fetch("/api/investigadores/eliminar", { method: "POST" });
                        const result = await response.json();
                        if (response.ok && result.success) {
                          alert("Tu usuario ha sido eliminado completamente de la base de datos.");
                          router.push("/iniciar-sesion");
                        } else {
                          alert("Error al eliminar usuario: " + (result.error || "Error desconocido"));
                        }
                      } catch (error) {
                        alert("Error al eliminar usuario. Por favor, intenta de nuevo.");
                      } finally {
                        setIsDeletingAccount(false);
                      }
                    }}
                  >
                    {isDeletingAccount ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Eliminando...
                      </>
                    ) : (
                      <>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar Cuenta
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>

      {/* Dialog para gestionar CV */}
      <GestionarCvDialog
        open={gestionarCvDialogOpen}
        onOpenChange={setGestionarCvDialogOpen}
        cvUrlActual={investigadorData?.cv_url}
        onCvUpdated={(newUrl) => {
          if (investigadorData) {
            setInvestigadorData({ ...investigadorData, cv_url: newUrl || undefined })
          }
        }}
      />
    </div>
  )
}
