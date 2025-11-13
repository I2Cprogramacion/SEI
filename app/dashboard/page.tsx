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
  Trash2,
  Download,
  ExternalLink,
  ChevronDown
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Main dashboard component
export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const { signOut } = useClerk();

  const [investigadorData, setInvestigadorData] = useState<any>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isLoadingSugerencias, setIsLoadingSugerencias] = useState(true);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [gestionarCvDialogOpen, setGestionarCvDialogOpen] = useState(false);
  const [sugerencias, setSugerencias] = useState<any>(null);
  const [isDesactivando, setIsDesactivando] = useState(false);
  const [areasInput, setAreasInput] = useState("");
  const [isFixingCvUrl, setIsFixingCvUrl] = useState(false);
  const [tipoDocumento, setTipoDocumento] = useState<'PU' | 'Dictamen' | 'SNI'>('PU');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
            // linea_investigacion es el campo de etiquetas (TagsInput)
            if (typeof data.linea_investigacion === "string") {
              data.linea_investigacion = data.linea_investigacion.split(",").map((l: string) => l.trim()).filter(Boolean);
            }
            // area_investigacion es texto libre (Textarea), NO convertir a array
            setInvestigadorData(data);
          }
        } else {
          console.warn("No se pudieron cargar los datos del perfil desde PostgreSQL");
          setErrorMessage("No se pudo cargar tu perfil. Intenta recargar la página.");
        }
      } catch (error) {
        console.error("Error al cargar datos del investigador:", error);
        setErrorMessage("Error al cargar los datos de tu perfil. Por favor, recarga la página.");
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

  // Depuración visual y de consola
  if (!isLoaded) {
    console.log('Clerk: user no está cargado todavía');
    return <div className="text-center p-10 text-blue-700">Cargando sesión de usuario...</div>;
  }
  if (!user) {
    console.log('Clerk: user es null, no hay sesión activa');
    return <div className="text-center p-10 text-red-700">No has iniciado sesión. Inicia sesión para ver tu dashboard.</div>;
  }
  if (isLoadingData) {
    console.log('Esperando datos del investigador...');
    return <div className="text-center p-10 text-blue-700">Cargando datos del perfil...</div>;
  }
  if (!investigadorData) {
    console.log('API /api/investigadores/perfil no devolvió datos para el usuario:', user?.primaryEmailAddress?.emailAddress || user.id);
    return <div className="text-center p-10 text-orange-700">No se encontraron datos de tu perfil en la base de datos.<br/>Verifica que tu usuario esté correctamente registrado.<br/>Si el problema persiste, contacta a soporte.</div>;
  }

  // Determinar si el perfil está completo
  const perfilCompleto = investigadorData?.perfil_completo === true;

  // Función para validar y corregir URL del CV
  const getValidCvUrl = (url: string | undefined | null): string | null => {
    if (!url || url.trim() === '') return null;
    
    // Si es una URL completa válida (Cloudinary, Vercel Blob, etc.)
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // Si es una ruta local que empieza con /uploads/
    if (url.startsWith('/uploads/')) {
      return url;
    }
    
    // Si no cumple ninguno de los criterios anteriores, es inválida
    console.warn('⚠️ URL de CV inválida detectada:', url);
    return null;
  };

  // Detectar si es una URL de Vercel Blob
  const isVercelBlobUrl = (url: string | null | undefined): boolean => {
    if (!url) return false;
    return url.includes('blob.vercel-storage.com') || url.includes('public.blob.vercel-storage.com');
  };

  // Detectar si es una URL de Cloudinary
  const isCloudinaryUrl = (url: string | null | undefined): boolean => {
    if (!url) return false;
    return url.includes('cloudinary.com');
  };

  // Obtener URL válida del CV
  const validCvUrl = investigadorData?.cv_url ? getValidCvUrl(investigadorData.cv_url) : null;

  // Obtener URL válida del Dictamen (permitir null/vacío)
  const validDictamenUrl = investigadorData?.dictamen_url && 
    typeof investigadorData.dictamen_url === 'string' && 
    investigadorData.dictamen_url.trim() !== '' 
    ? getValidCvUrl(investigadorData.dictamen_url) 
    : null;

  // Obtener URL válida del SNI (permitir null/vacío)
  const validSniUrl = investigadorData?.sni_url && 
    typeof investigadorData.sni_url === 'string' && 
    investigadorData.sni_url.trim() !== '' 
    ? getValidCvUrl(investigadorData.sni_url) 
    : null;

  // Función para reparar URL de CV problemática
  const handleFixCvUrl = async () => {
    if (!investigadorData?.cv_url) return;
    
    setIsFixingCvUrl(true);
    try {
      const response = await fetch('/api/investigadores/fix-cv-url', {
        method: 'POST',
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        // Recargar los datos del investigador
        const perfilResponse = await fetch("/api/investigadores/perfil");
        if (perfilResponse.ok) {
          const perfilResult = await perfilResponse.json();
          if (perfilResult.success && perfilResult.data) {
            let data = perfilResult.data;
            if (typeof data.linea_investigacion === "string") {
              data.linea_investigacion = data.linea_investigacion.split(",").map((l: string) => l.trim()).filter(Boolean);
            }
            setInvestigadorData(data);
          }
        }
        alert("✅ URL del CV reparada exitosamente. Recargando página...");
        window.location.reload();
      } else {
        alert("No se pudo reparar la URL: " + (result.error || "Error desconocido"));
      }
    } catch (error) {
      console.error("Error al reparar URL:", error);
      alert("Error al reparar la URL del CV. Por favor, intenta de nuevo.");
    } finally {
      setIsFixingCvUrl(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="container mx-auto py-4 md:py-6 px-3 md:px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-blue-900">Dashboard Social</h1>
          <p className="text-sm md:text-base text-blue-600">Tu red de colaboración científica</p>
        </div>

        {/* Mensaje de error si hubo problemas cargando datos */}
        {errorMessage && (
          <Card className="mb-6 bg-red-50 border-red-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-red-900">Error al cargar datos</h3>
                  <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.reload()}
                  className="border-red-300 text-red-700 hover:bg-red-100"
                >
                  Recargar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mensaje informativo si el perfil está incompleto */}
        {investigadorData && !perfilCompleto && (
          <Card className="mb-6 bg-amber-50 border-amber-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-900">Perfil incompleto</h3>
                  <p className="text-sm text-amber-700 mt-1">
                    Faltan datos clave en tu perfil. Haz clic en "Editar Perfil" para completarlo y aprovechar todas las funcionalidades.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        {/* Si no hay datos, mostrar mensaje */}
        {!investigadorData && (
          <Card className="mb-6 bg-amber-50 border-amber-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-900">Perfil no encontrado</h3>
                  <p className="text-sm text-amber-700 mt-1">
                    No se encontraron datos de tu perfil. Por favor, regístrate o contacta soporte.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Layout de dos columnas: Perfil + Vista previa del CV */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 mb-6 md:mb-8">
          {/* Columna izquierda: Información del investigador (35% del ancho) */}
          <Card className="bg-white border-blue-100 shadow-md h-fit lg:col-span-4">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 pb-4">
              <div>
                <CardTitle className="text-blue-900 flex items-center text-lg md:text-xl">
                  <UserIcon className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                  Perfil del Investigador
                </CardTitle>
                <CardDescription className="text-blue-600 text-sm">
                  Información completa de tu cuenta
                </CardDescription>
              </div>
              <Button
                onClick={() => router.push("/dashboard/editar-perfil")}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 w-full sm:w-auto"
                size="sm"
              >
                <Edit className="mr-2 h-4 w-4" />
                Editar Perfil
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Foto y datos básicos */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                <Avatar className="h-20 w-20 md:h-24 md:w-24 flex-shrink-0">
                  {investigadorData?.fotografia_url && investigadorData.fotografia_url.trim() !== "" ? (
                    <AvatarImage src={investigadorData.fotografia_url} alt={investigadorData?.nombre_completo || "Usuario"} />
                  ) : null}
                  <AvatarFallback className="bg-blue-100 text-blue-700 text-xl md:text-2xl">
                    {(investigadorData?.nombre_completo && investigadorData.nombre_completo.trim() !== ""
                      ? investigadorData.nombre_completo
                      : user.fullName || "U").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 text-center sm:text-left w-full">
                  <h2 className="text-lg md:text-xl font-bold text-blue-900 break-words">
                    {(investigadorData?.nombre_completo && investigadorData.nombre_completo.trim() !== "")
                      ? investigadorData.nombre_completo
                      : user.fullName || user.firstName || "Usuario"}
                  </h2>
                  <p className="text-xs md:text-sm text-blue-600 flex items-center justify-center sm:justify-start gap-2 mt-1">
                    <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate">
                      {(investigadorData?.correo && investigadorData.correo.trim() !== "")
                        ? investigadorData.correo
                        : user.primaryEmailAddress?.emailAddress || "No disponible"}
                    </span>
                  </p>
                  {investigadorData?.telefono && investigadorData.telefono.trim() !== "" && (
                    <p className="text-xs md:text-sm text-blue-600 flex items-center justify-center sm:justify-start gap-2 mt-1">
                      <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                      {investigadorData.telefono}
                    </p>
                  )}
                </div>
              </div>

              {/* Información detallada */}
              {investigadorData && (
                <div className="space-y-3 pt-3 border-t border-blue-100">
                  {/* 1. Empleo Actual */}
                  {investigadorData.empleo_actual && investigadorData.empleo_actual.trim() !== "" && (
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-blue-700 flex items-center gap-2 uppercase tracking-wide">
                        <Briefcase className="h-3.5 w-3.5" />
                        Empleo Actual
                      </label>
                      <p className="text-sm text-blue-900 break-words whitespace-pre-line overflow-x-auto">{investigadorData.empleo_actual}</p>
                    </div>
                  )}

                  {/* 2. CVU/PU */}
                  {investigadorData.no_cvu && investigadorData.no_cvu.trim() !== "" && (
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-blue-700 flex items-center gap-2 uppercase tracking-wide">
                        <Award className="h-3.5 w-3.5" />
                        CVU/PU
                      </label>
                      <p className="text-sm text-blue-900 font-mono break-words whitespace-pre-line overflow-x-auto">{investigadorData.no_cvu}</p>
                    </div>
                  )}

                  {/* 3. Nacionalidad */}
                  {investigadorData.nacionalidad && investigadorData.nacionalidad.trim() !== "" && (
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-blue-700 flex items-center gap-2 uppercase tracking-wide">
                        <MapPin className="h-3.5 w-3.5" />
                        Nacionalidad
                      </label>
                      <p className="text-sm text-blue-900 break-words whitespace-pre-line overflow-x-auto">{investigadorData.nacionalidad}</p>
                    </div>
                  )}

                  {/* 4. Municipio */}
                  {investigadorData.municipio && investigadorData.municipio.trim() !== "" && (
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-blue-700 flex items-center gap-2 uppercase tracking-wide">
                        <MapPin className="h-3.5 w-3.5" />
                        Municipio
                      </label>
                      <p className="text-sm text-blue-900 break-words whitespace-pre-line overflow-x-auto">{investigadorData.municipio}</p>
                    </div>
                  )}

                  {/* 5. CURP */}
                  {investigadorData.curp && investigadorData.curp.trim() !== "" && (
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-blue-700 flex items-center gap-2 uppercase tracking-wide">
                        <FileText className="h-3.5 w-3.5" />
                        CURP
                      </label>
                      <p className="text-sm text-blue-900 font-mono break-words whitespace-pre-line overflow-x-auto">{investigadorData.curp}</p>
                    </div>
                  )}

                  {/* 6. RFC */}
                  {investigadorData.rfc && investigadorData.rfc.trim() !== "" && (
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-blue-700 flex items-center gap-2 uppercase tracking-wide">
                        <FileText className="h-3.5 w-3.5" />
                        RFC
                      </label>
                      <p className="text-sm text-blue-900 font-mono break-words whitespace-pre-line overflow-x-auto">{investigadorData.rfc}</p>
                    </div>
                  )}

                  {/* 7. Línea de Investigación */}
                  {Array.isArray(investigadorData.linea_investigacion) && investigadorData.linea_investigacion.length > 0 && (
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-blue-700 flex items-center gap-2 uppercase tracking-wide">
                        <GraduationCap className="h-3.5 w-3.5" />
                        Línea de Investigación
                      </label>
                      <p className="text-sm text-blue-900 break-words whitespace-pre-line overflow-x-auto">{investigadorData.linea_investigacion.join(', ')}</p>
                    </div>
                  )}

                  {/* 8. Área de Investigación */}
                  {investigadorData.area_investigacion && investigadorData.area_investigacion.trim() !== "" && (
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-blue-700 flex items-center gap-2 uppercase tracking-wide">
                        <Award className="h-3.5 w-3.5" />
                        Área de Investigación
                      </label>
                      <p className="text-sm text-blue-900 break-words whitespace-pre-line overflow-x-auto">{investigadorData.area_investigacion}</p>
                    </div>
                  )}

                  {/* Campos adicionales al final */}
                  {investigadorData.ultimo_grado_estudios && investigadorData.ultimo_grado_estudios.trim() !== "" && (
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-blue-700 flex items-center gap-2 uppercase tracking-wide">
                        <GraduationCap className="h-3.5 w-3.5" />
                        Último Grado de Estudios
                      </label>
                      <p className="text-sm text-blue-900">{investigadorData.ultimo_grado_estudios}</p>
                    </div>
                  )}

                  {investigadorData.orcid && investigadorData.orcid.trim() !== "" && (
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-blue-700 flex items-center gap-2 uppercase tracking-wide">
                        <Award className="h-3.5 w-3.5" />
                        ORCID
                      </label>
                      <p className="text-sm text-blue-900 font-mono">{investigadorData.orcid}</p>
                    </div>
                  )}

                  {investigadorData.sni && investigadorData.sni.trim() !== "" && (
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-blue-700 flex items-center gap-2 uppercase tracking-wide">
                        <Award className="h-3.5 w-3.5" />
                        SNI
                      </label>
                      <p className="text-sm text-blue-900">
                        {investigadorData.sni}
                        {investigadorData.anio_sni && ` (${investigadorData.anio_sni})`}
                      </p>
                    </div>
                  )}

                  {investigadorData.nivel_investigador && investigadorData.nivel_investigador.trim() !== "" && (
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-blue-700 flex items-center gap-2 uppercase tracking-wide">
                        <Award className="h-3.5 w-3.5" />
                        Nivel Investigador
                      </label>
                      <p className="text-sm text-blue-900">{investigadorData.nivel_investigador}</p>
                    </div>
                  )}

                  {investigadorData.disciplina && investigadorData.disciplina.trim() !== "" && (
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-blue-700 flex items-center gap-2 uppercase tracking-wide">
                        <GraduationCap className="h-3.5 w-3.5" />
                        Disciplina
                      </label>
                      <p className="text-sm text-blue-900">{investigadorData.disciplina}</p>
                    </div>
                  )}

                  {investigadorData.especialidad && investigadorData.especialidad.trim() !== "" && (
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-blue-700 flex items-center gap-2 uppercase tracking-wide">
                        <GraduationCap className="h-3.5 w-3.5" />
                        Especialidad
                      </label>
                      <p className="text-sm text-blue-900">{investigadorData.especialidad}</p>
                    </div>
                  )}

                  {investigadorData.institucion && investigadorData.institucion.trim() !== "" && (
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-blue-700 flex items-center gap-2 uppercase tracking-wide">
                        <Briefcase className="h-3.5 w-3.5" />
                        Institución
                      </label>
                      <p className="text-sm text-blue-900">{investigadorData.institucion}</p>
                    </div>
                  )}

                  {investigadorData.departamento && investigadorData.departamento.trim() !== "" && (
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-blue-700 flex items-center gap-2 uppercase tracking-wide">
                        <Briefcase className="h-3.5 w-3.5" />
                        Departamento
                      </label>
                      <p className="text-sm text-blue-900">{investigadorData.departamento}</p>
                    </div>
                  )}

                  {investigadorData.entidad_federativa && investigadorData.entidad_federativa.trim() !== "" && (
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-blue-700 flex items-center gap-2 uppercase tracking-wide">
                        <MapPin className="h-3.5 w-3.5" />
                        Entidad Federativa
                      </label>
                      <p className="text-sm text-blue-900">{investigadorData.entidad_federativa}</p>
                    </div>
                  )}

                  {investigadorData.sitio_web && investigadorData.sitio_web.trim() !== "" && (
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-blue-700 flex items-center gap-2 uppercase tracking-wide">
                        <FileText className="h-3.5 w-3.5" />
                        Sitio Web
                      </label>
                      <a 
                        href={investigadorData.sitio_web} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline break-all"
                      >
                        {investigadorData.sitio_web}
                      </a>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Columna derecha: Vista previa del CV/Perfil Único (65% del ancho) */}
          <Card className="bg-white border-blue-100 shadow-md lg:col-span-8">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-blue-900 flex items-center text-lg md:text-xl">
                  <FileText className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                  Perfil Único del Investigador
                </CardTitle>
                <CardDescription className="text-blue-600 text-sm">
                  {validCvUrl ? "Documento procesado automáticamente durante el registro" : "Completa tu perfil público"}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                {/* Botón desplegable para cambiar entre PU, Dictamen y SNI */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="border-blue-300 text-blue-700 hover:bg-blue-50 w-full sm:w-auto"
                      size="sm"
                    >
                      {tipoDocumento === 'PU' ? 'PU' : tipoDocumento === 'Dictamen' ? 'Dictamen' : 'SNI'}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => setTipoDocumento('PU')}
                      className="cursor-pointer"
                    >
                      Cambiar PU
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setTipoDocumento('Dictamen')}
                      className="cursor-pointer"
                    >
                      Cambiar Dictamen
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setTipoDocumento('SNI')}
                      className="cursor-pointer"
                    >
                      Cambiar SNI
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                {((tipoDocumento === 'PU' && validCvUrl) || (tipoDocumento === 'Dictamen' && validDictamenUrl) || (tipoDocumento === 'SNI' && validSniUrl)) && (
                  <Button
                    onClick={() => setGestionarCvDialogOpen(true)}
                    variant="outline"
                    className="border-blue-300 text-blue-700 hover:bg-blue-50 w-full sm:w-auto"
                    size="sm"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Gestionar
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {tipoDocumento === 'PU' ? (
              // Contenido del Perfil Único (PU)
              validCvUrl ? (
                <>
                  {/* Debug: Mostrar URL del CV en desarrollo */}
                  {process.env.NODE_ENV === 'development' && investigadorData?.cv_url && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <strong>🔍 Debug - URL del CV:</strong>
                          <div className="font-mono mt-1 break-all">
                            Original: {investigadorData.cv_url}
                            <br />
                            Validada: {validCvUrl || "❌ URL INVÁLIDA"}
                          </div>
                        </div>
                        {investigadorData.cv_url.includes('?') && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleFixCvUrl}
                            disabled={isFixingCvUrl}
                            className="border-yellow-400 text-yellow-700 hover:bg-yellow-100"
                          >
                            {isFixingCvUrl ? "Reparando..." : "Reparar URL"}
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Información sobre el almacenamiento */}
                  {investigadorData?.cv_url && process.env.NODE_ENV === 'development' && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-xs">
                      <strong>📦 Almacenamiento:</strong>
                      {isVercelBlobUrl(investigadorData.cv_url) && ' Vercel Blob Storage ✅'}
                      {isCloudinaryUrl(investigadorData.cv_url) && ' Cloudinary Storage ✅'}
                      {!isVercelBlobUrl(investigadorData.cv_url) && !isCloudinaryUrl(investigadorData.cv_url) && ' Local Storage 📁'}
                    </div>
                  )}

                  {/* Si la URL tiene parámetros sospechosos de Cloudinary, mostrar advertencia */}
                  {investigadorData?.cv_url && investigadorData.cv_url.includes('?') && isCloudinaryUrl(investigadorData.cv_url) && (
                    <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-amber-900">URL de CV puede tener problemas</h4>
                          <p className="text-sm text-amber-700 mt-1">
                            Tu URL de CV contiene parámetros que pueden impedir su visualización. Haz clic en "Reparar URL" para solucionarlo.
                          </p>
                          <Button
                            size="sm"
                            onClick={handleFixCvUrl}
                            disabled={isFixingCvUrl}
                            className="mt-3 bg-amber-600 hover:bg-amber-700 text-white"
                          >
                            {isFixingCvUrl ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Reparando...
                              </>
                            ) : (
                              "Reparar URL del CV"
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Vista previa del PDF - SOLUCIÓN SIMPLE */}
                  <div className="w-full space-y-4">
                    {/* Botones de acción */}
                    <div className="flex gap-3 justify-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex flex-col md:flex-row gap-3 w-full justify-center items-center">
                        <Button
                          onClick={() => window.open(validCvUrl, "_blank", "noopener,noreferrer")}
                          className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800"
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Abrir PDF en Nueva Pestaña
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            const link = document.createElement('a')
                            link.href = validCvUrl
                            link.download = `${investigadorData?.nombre_completo?.replace(/\s+/g, '_') || 'perfil'}.pdf`
                            document.body.appendChild(link)
                            link.click()
                            document.body.removeChild(link)
                          }}
                          className="w-full md:w-auto border-blue-300 text-blue-700 hover:bg-blue-50"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Descargar PDF
                        </Button>
                      </div>
                    </div>

                    {/* Vista previa del PDF con iframe simple */}
                    <div className="relative w-full bg-gray-100 rounded-lg overflow-hidden border-2 border-blue-200" style={{ height: '650px' }}>
                      <iframe
                        src={validCvUrl}
                        className="w-full h-full"
                        title="Vista previa del Perfil Único"
                        style={{ border: 'none' }}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-4 p-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                    <FileText className="h-12 w-12 text-blue-400 mx-auto mb-3" />
                    <p className="text-blue-700 font-medium mb-2">Perfil Único no disponible</p>
                    <p className="text-sm text-blue-600 mb-4">
                      Tu Perfil Único debería haberse guardado automáticamente durante el registro.
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
              )
            ) : tipoDocumento === 'Dictamen' ? (
              // Contenido del Dictamen
              validDictamenUrl ? (
                <>
                  {/* Vista previa del PDF del Dictamen */}
                  <div className="w-full space-y-4">
                    {/* Botones de acción mejorados */}
                    <div className="flex flex-col md:flex-row flex-wrap gap-3 justify-center p-4 bg-blue-50 rounded-lg border border-blue-200 min-w-0 max-w-full">
                      <Button
                        onClick={() => window.open(validDictamenUrl, "_blank", "noopener,noreferrer")}
                        className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 min-w-0 max-w-full truncate"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Abrir PDF en Nueva Pestaña
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          const link = document.createElement('a')
                          link.href = validDictamenUrl
                          link.download = `${investigadorData?.nombre_completo?.replace(/\s+/g, '_') || 'dictamen'}_dictamen.pdf`
                          document.body.appendChild(link)
                          link.click()
                          document.body.removeChild(link)
                        }}
                        className="w-full md:w-auto border-blue-300 text-blue-700 hover:bg-blue-50 min-w-0 max-w-full truncate"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Descargar PDF
                      </Button>
                    </div>

                    {/* Vista previa del PDF con iframe simple */}
                    <div className="relative w-full bg-gray-100 rounded-lg overflow-hidden border-2 border-blue-200" style={{ height: '650px' }}>
                      <iframe
                        src={validDictamenUrl}
                        className="w-full h-full"
                        title="Vista previa del Dictamen"
                        style={{ border: 'none' }}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-4 p-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                    <FileText className="h-12 w-12 text-blue-400 mx-auto mb-3" />
                    <p className="text-blue-700 font-medium mb-2">Dictamen no disponible</p>
                    <p className="text-sm text-blue-600 mb-4">
                      Sube tu dictamen en formato PDF para visualizarlo aquí.
                    </p>
                  </div>
                  <UploadCv
                    value={investigadorData?.dictamen_url || ""}
                    onChange={async (url) => {
                      console.log("=== DICTAMEN SUBIDO ===")
                      console.log("URL recibida:", url)
                      
                      // Actualizar el Dictamen en la base de datos
                      try {
                        const response = await fetch('/api/investigadores/update-dictamen', {
                          method: 'POST',
                          headers: { 
                            'Content-Type': 'application/json'
                          },
                          body: JSON.stringify({ dictamen_url: url })
                        })
                        
                        console.log("Response status:", response.status)
                        const responseData = await response.json()
                        console.log("Response data:", responseData)
                        
                        if (response.ok) {
                          console.log("✅ Dictamen actualizado en la base de datos")
                          // Actualizar el estado local
                          if (investigadorData) {
                            setInvestigadorData({ ...investigadorData, dictamen_url: url })
                          }
                          alert("¡Dictamen subido exitosamente! Recargando página...")
                          // Recargar la página para mostrar el dictamen
                          window.location.reload()
                        } else {
                          console.error("❌ Error en la respuesta:", responseData)
                          alert(`Error al actualizar: ${responseData.error || 'Error desconocido'}`)
                        }
                      } catch (error) {
                        console.error('❌ Error al actualizar Dictamen:', error)
                        alert('Error al actualizar el Dictamen. Por favor, intenta de nuevo.')
                      }
                    }}
                    nombreCompleto={investigadorData?.nombre_completo || "Usuario"}
                    showPreview={true}
                  />
                </div>
              )
            ) : (
              // Contenido del SNI
              validSniUrl ? (
                <>
                  {/* Vista previa del PDF del SNI */}
                  <div className="w-full space-y-4">
                    {/* Botones de acción mejorados */}
                    <div className="flex flex-col md:flex-row flex-wrap gap-3 justify-center p-4 bg-blue-50 rounded-lg border border-blue-200 min-w-0 max-w-full">
                      <Button
                        onClick={() => window.open(validSniUrl, "_blank", "noopener,noreferrer")}
                        className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 min-w-0 max-w-full truncate"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Abrir PDF en Nueva Pestaña
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          const link = document.createElement('a')
                          link.href = validSniUrl
                          link.download = `${investigadorData?.nombre_completo?.replace(/\s+/g, '_') || 'sni'}_sni.pdf`
                          document.body.appendChild(link)
                          link.click()
                          document.body.removeChild(link)
                        }}
                        className="w-full md:w-auto border-blue-300 text-blue-700 hover:bg-blue-50 min-w-0 max-w-full truncate"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Descargar PDF
                      </Button>
                    </div>

                    {/* Vista previa del PDF con iframe simple */}
                    <div className="relative w-full bg-gray-100 rounded-lg overflow-hidden border-2 border-blue-200" style={{ height: '650px' }}>
                      <iframe
                        src={validSniUrl}
                        className="w-full h-full"
                        title="Vista previa del SNI"
                        style={{ border: 'none' }}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-4 p-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                    <FileText className="h-12 w-12 text-blue-400 mx-auto mb-3" />
                    <p className="text-blue-700 font-medium mb-2">SNI no disponible</p>
                    <p className="text-sm text-blue-600 mb-4">
                      Sube tu documento SNI en formato PDF para visualizarlo aquí.
                    </p>
                  </div>
                  <UploadCv
                    value={investigadorData?.sni_url || ""}
                    onChange={async (url) => {
                      console.log("=== SNI SUBIDO ===")
                      console.log("URL recibida:", url)
                      
                      // Actualizar el SNI en la base de datos
                      try {
                        const response = await fetch('/api/investigadores/update-sni', {
                          method: 'POST',
                          headers: { 
                            'Content-Type': 'application/json'
                          },
                          body: JSON.stringify({ sni_url: url })
                        })
                        
                        console.log("Response status:", response.status)
                        const responseData = await response.json()
                        console.log("Response data:", responseData)
                        
                        if (response.ok) {
                          console.log("✅ SNI actualizado en la base de datos")
                          // Actualizar el estado local
                          if (investigadorData) {
                            setInvestigadorData({ ...investigadorData, sni_url: url })
                          }
                          alert("¡SNI subido exitosamente! Recargando página...")
                          // Recargar la página para mostrar el SNI
                          window.location.reload()
                        } else {
                          console.error("❌ Error en la respuesta:", responseData)
                          alert(`Error al actualizar: ${responseData.error || 'Error desconocido'}`)
                        }
                      } catch (error) {
                        console.error('❌ Error al actualizar SNI:', error)
                        alert('Error al actualizar el SNI. Por favor, intenta de nuevo.')
                      }
                    }}
                    nombreCompleto={investigadorData?.nombre_completo || "Usuario"}
                    showPreview={true}
                  />
                </div>
              )
            )}
          </CardContent>
        </Card>
        </div> {/* Fin del grid de dos columnas */}

        {/* Publicaciones */}
        <Card className="bg-white border-blue-100 shadow-md hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="text-blue-900 flex items-center text-lg md:text-xl">
              <FileText className="mr-2 h-4 w-4 md:h-5 md:w-5" />
              Publicaciones
            </CardTitle>
            <CardDescription className="text-blue-600 text-sm">
              Gestiona tu producción científica
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Zona de peligro - Ocultar perfil y Eliminar cuenta */}
        <div className="mt-6 md:mt-8">
          <Card className="bg-white border-red-200">
            <CardHeader>
              <CardTitle className="text-red-900 flex items-center text-lg md:text-xl">
                <AlertCircle className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                Zona de Peligro
              </CardTitle>
              <CardDescription className="text-red-600 text-sm">
                Acciones irreversibles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3 md:gap-4 p-3 md:p-4 bg-red-50 rounded-lg border border-red-200">
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
                  <div className="flex flex-col md:flex-row w-full gap-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-red-900">Eliminar Cuenta</h3>
                      <p className="text-sm text-red-700 mt-1">
                        Esta acción eliminará permanentemente tu cuenta, todos tus datos del sistema y tu usuario de Clerk. 
                        <strong className="block mt-1">Esta acción no se puede deshacer.</strong>
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white border-none"
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
              </div>
            </CardContent>
          </Card>
        </div>

      </div>

      {/* Dialog para gestionar CV/Dictamen */}
      <GestionarCvDialog
        open={gestionarCvDialogOpen}
        onOpenChange={setGestionarCvDialogOpen}
        cvUrlActual={tipoDocumento === 'PU' ? investigadorData?.cv_url : tipoDocumento === 'Dictamen' ? investigadorData?.dictamen_url : investigadorData?.sni_url}
        tipoDocumento={tipoDocumento}
        onCvUpdated={async (newUrl) => {
          if (investigadorData) {
            if (tipoDocumento === 'PU') {
              setInvestigadorData({ ...investigadorData, cv_url: newUrl || undefined })
            } else if (tipoDocumento === 'Dictamen') {
              setInvestigadorData({ ...investigadorData, dictamen_url: newUrl || undefined })
            } else {
              setInvestigadorData({ ...investigadorData, sni_url: newUrl || undefined })
            }
          }
          
          // Recargar datos del perfil para reflejar los cambios
          try {
            const response = await fetch("/api/investigadores/perfil");
            if (response.ok) {
              const result = await response.json();
              if (result.success && result.data) {
                let data = result.data;
                if (typeof data.linea_investigacion === "string") {
                  data.linea_investigacion = data.linea_investigacion.split(",").map((l: string) => l.trim()).filter(Boolean);
                }
                setInvestigadorData(data);
              }
            }
          } catch (error) {
            console.error("Error al recargar datos del perfil:", error);
          }
        }}
      />
    </div>
  )
}
