import { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  ArrowLeft, 
  ExternalLink, 
  FileText, 
  Building2, 
  Tag, 
  Calendar,
  BookOpen,
  Users,
  User,
  Globe,
  Download,
  Share2,
  Quote
} from "lucide-react"
import { getDatabase } from "@/lib/database-config"

interface PublicacionPageProps {
  params: {
    id: string
  }
}

async function getPublicacion(id: string) {
  try {
    console.log('🔍 [Publicacion Detail] Fetching publicacion ID:', id)
    console.log('🔍 [Publicacion Detail] ID type:', typeof id)
    
    const db = await getDatabase()
    console.log('✅ [Publicacion Detail] Database connection obtained')
    
    // El método query() ya retorna result.rows (no el result completo)
    const rows = await db.query(
      `SELECT 
        p.*,
        i.nombre_completo as investigador_nombre,
        i.slug as investigador_slug,
        i.institucion as investigador_institucion
       FROM publicaciones p
       LEFT JOIN investigadores i ON p.clerk_user_id = i.clerk_user_id
       WHERE p.id = $1`,
      [parseInt(id)]
    )
    
    console.log('📊 [Publicacion Detail] Query executed successfully')
    console.log('📊 [Publicacion Detail] Result rows:', rows?.length || 0)
    
    if (!rows || rows.length === 0) {
      console.log('⚠️ [Publicacion Detail] No publication found with ID:', id)
      return null
    }
    
    const publicacion = rows[0]
    console.log('✅ [Publicacion Detail] Found publication:', publicacion.titulo)
    console.log('✅ [Publicacion Detail] Publication data keys:', Object.keys(publicacion).join(', '))
    
    return publicacion
  } catch (error) {
    console.error('❌ [Publicacion Detail] Error fetching publicacion:', error)
    console.error('❌ [Publicacion Detail] Error details:', error instanceof Error ? error.message : 'Unknown error')
    console.error('❌ [Publicacion Detail] Error stack:', error instanceof Error ? error.stack : 'No stack')
    return null
  }
}

export async function generateMetadata({ params }: PublicacionPageProps): Promise<Metadata> {
  const { id } = await params
  const publicacion = await getPublicacion(id)
  
  if (!publicacion) {
    return {
      title: "Publicación no encontrada"
    }
  }
  
  return {
    title: `${publicacion.titulo} | SEI`,
    description: publicacion.resumen || `Publicación de ${publicacion.autor}`,
  }
}

export default async function PublicacionPage({ params }: PublicacionPageProps) {
  const { id } = await params
  console.log('🎯 [Page Component] Rendering publicacion page for ID:', id)
  const publicacion = await getPublicacion(id)
  
  if (!publicacion) {
    console.log('⚠️ [Page Component] Publication not found, calling notFound()')
    notFound()
  }
  
  console.log('✅ [Page Component] Rendering publication:', publicacion.titulo)

  const categoriaColors: Record<string, string> = {
    'Artículo': 'bg-blue-600 text-white',
    'Libro': 'bg-purple-600 text-white',
    'Capítulo': 'bg-green-600 text-white',
    'Conferencia': 'bg-orange-600 text-white',
    'Tesis': 'bg-pink-600 text-white',
  }

  const accesoColors: Record<string, string> = {
    'Abierto': 'bg-emerald-600 text-white',
    'Cerrado': 'bg-red-600 text-white',
    'Restringido': 'bg-amber-600 text-white',
  }

  // Procesar autores para extraer información
  const autores = publicacion.autor ? publicacion.autor.split(/[,;]/).map((a: string) => a.trim()) : []

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header con diseño consistente */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <Link href="/publicaciones">
            <Button variant="ghost" className="text-slate-700 hover:bg-slate-100 mb-4 -ml-2">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a publicaciones
            </Button>
          </Link>
          
          <div className="space-y-4">
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {publicacion.categoria && (
                <Badge className={`${categoriaColors[publicacion.categoria] || 'bg-blue-600 text-white'} px-3 py-1 text-sm font-medium shadow-sm`}>
                  <BookOpen className="mr-1 h-3 w-3" />
                  {publicacion.categoria}
                </Badge>
              )}
              {publicacion.tipo && (
                <Badge className="bg-slate-100 text-slate-700 px-3 py-1 text-sm font-medium border border-slate-300">
                  {publicacion.tipo}
                </Badge>
              )}
              {publicacion.acceso && (
                <Badge className={`${accesoColors[publicacion.acceso] || 'bg-blue-600 text-white'} px-3 py-1 text-sm font-medium shadow-sm`}>
                  <Globe className="mr-1 h-3 w-3" />
                  {publicacion.acceso}
                </Badge>
              )}
              {publicacion.año_creacion && (
                <Badge className="bg-blue-600 text-white px-3 py-1 text-sm font-medium shadow-sm">
                  <Calendar className="mr-1 h-3 w-3" />
                  {publicacion.año_creacion}
                </Badge>
              )}
            </div>
            
            {/* Título */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-slate-900">
              {publicacion.titulo}
            </h1>

            {/* Metadatos rápidos */}
            <div className="flex flex-wrap gap-4 text-sm text-slate-600">
              {publicacion.editorial && (
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  <span>{publicacion.editorial}</span>
                </div>
              )}
              {publicacion.volumen && (
                <div className="flex items-center gap-1">
                  <span>Vol. {publicacion.volumen}</span>
                  {publicacion.numero && <span>, No. {publicacion.numero}</span>}
                </div>
              )}
              {publicacion.paginas && (
                <div className="flex items-center gap-1">
                  <span>pp. {publicacion.paginas}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna Principal (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Resumen/Abstract */}
            {(publicacion.resumen || publicacion.abstract) && (
              <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-0">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-2xl text-slate-800">
                    <Quote className="h-6 w-6 text-blue-600" />
                    {publicacion.abstract ? 'Abstract' : 'Resumen'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-base leading-relaxed text-slate-700">
                    {publicacion.abstract || publicacion.resumen}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Detalles Bibliográficos Completos */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl text-slate-800">
                  <FileText className="h-6 w-6 text-blue-600" />
                  Información Bibliográfica
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  {/* Editorial/Revista */}
                  {publicacion.editorial && (
                    <div className="flex flex-col gap-1 p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
                        Revista/Editorial
                      </span>
                      <span className="text-base text-slate-900">{publicacion.editorial}</span>
                    </div>
                  )}

                  {/* Volumen, Número y Páginas */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {publicacion.volumen && (
                      <div className="flex flex-col gap-1 p-3 bg-slate-50 rounded-lg">
                        <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
                          Volumen
                        </span>
                        <span className="text-base text-slate-900">{publicacion.volumen}</span>
                      </div>
                    )}
                    
                    {publicacion.numero && (
                      <div className="flex flex-col gap-1 p-3 bg-slate-50 rounded-lg">
                        <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
                          Número
                        </span>
                        <span className="text-base text-slate-900">{publicacion.numero}</span>
                      </div>
                    )}
                    
                    {publicacion.paginas && (
                      <div className="flex flex-col gap-1 p-3 bg-slate-50 rounded-lg">
                        <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
                          Páginas
                        </span>
                        <span className="text-base text-slate-900">{publicacion.paginas}</span>
                      </div>
                    )}
                  </div>

                  {/* Identificadores */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {publicacion.issn && (
                      <div className="flex flex-col gap-1 p-3 bg-slate-50 rounded-lg">
                        <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
                          ISSN
                        </span>
                        <span className="text-base font-mono text-slate-900">{publicacion.issn}</span>
                      </div>
                    )}
                    
                    {publicacion.isbn && (
                      <div className="flex flex-col gap-1 p-3 bg-slate-50 rounded-lg">
                        <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
                          ISBN
                        </span>
                        <span className="text-base font-mono text-slate-900">{publicacion.isbn}</span>
                      </div>
                    )}
                  </div>

                  {/* DOI */}
                  {publicacion.doi && (
                    <div className="flex flex-col gap-1 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <span className="text-sm font-semibold text-blue-700 uppercase tracking-wide">
                        DOI
                      </span>
                      <a
                        href={publicacion.doi.startsWith('http') ? publicacion.doi : `https://doi.org/${publicacion.doi}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-base font-mono text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-2"
                      >
                        {publicacion.doi}
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  )}

                  {/* Idioma */}
                  {publicacion.idioma && (
                    <div className="flex flex-col gap-1 p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
                        Idioma
                      </span>
                      <span className="text-base text-slate-900">{publicacion.idioma}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Palabras Clave */}
            {publicacion.palabras_clave && (
              <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl text-slate-800">
                    <Tag className="h-6 w-6 text-blue-600" />
                    Palabras Clave
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {publicacion.palabras_clave.split(/[,;]/).map((keyword: string, index: number) => (
                      <Badge 
                        key={index} 
                        variant="outline" 
                        className="bg-blue-50 text-blue-700 border-blue-300 px-3 py-1 text-sm hover:bg-blue-100 transition-colors"
                      >
                        {keyword.trim()}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Cómo citar */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-0 bg-slate-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl text-slate-800">
                  <Quote className="h-6 w-6 text-blue-600" />
                  Cómo citar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Formato APA */}
                  <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <p className="text-xs font-semibold text-slate-600 uppercase mb-2">Formato APA</p>
                    <p className="text-sm text-slate-800 font-mono leading-relaxed">
                      {autores.slice(0, 3).join(', ')}{autores.length > 3 && ', et al.'} ({publicacion.año_creacion || 'n.d.'}). {publicacion.titulo}. 
                      {publicacion.editorial && <em> {publicacion.editorial}</em>}
                      {publicacion.volumen && `, ${publicacion.volumen}`}
                      {publicacion.numero && `(${publicacion.numero})`}
                      {publicacion.paginas && `, ${publicacion.paginas}`}.
                      {publicacion.doi && ` https://doi.org/${publicacion.doi.replace('https://doi.org/', '')}`}
                    </p>
                  </div>

                  {/* Formato IEEE */}
                  <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <p className="text-xs font-semibold text-slate-600 uppercase mb-2">Formato IEEE</p>
                    <p className="text-sm text-slate-800 font-mono leading-relaxed">
                      {autores.slice(0, 3).map((autor, idx) => {
                        const parts = autor.trim().split(' ')
                        const lastName = parts[parts.length - 1]
                        const initials = parts.slice(0, -1).map(n => n[0]).join('. ')
                        return `${idx > 0 ? ', ' : ''}${lastName}${initials ? ', ' + initials + '.' : ''}`
                      })}{autores.length > 3 && ', et al.'}, "{publicacion.titulo}," 
                      {publicacion.editorial && <em> {publicacion.editorial}</em>}
                      {publicacion.volumen && `, vol. ${publicacion.volumen}`}
                      {publicacion.numero && `, no. ${publicacion.numero}`}
                      {publicacion.paginas && `, pp. ${publicacion.paginas}`}, {publicacion.año_creacion || 'n.d.'}.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Columna Lateral (1/3) */}
          <div className="space-y-6">
            {/* Autores con avatares */}
            {autores.length > 0 && (
              <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl text-slate-800">
                    <Users className="h-5 w-5 text-blue-600" />
                    Autores
                  </CardTitle>
                  <CardDescription>
                    {autores.length} {autores.length === 1 ? 'autor' : 'autores'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {autores.map((autor: string, index: number) => (
                      <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                        <Avatar className="h-10 w-10 border-2 border-blue-200">
                          <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white font-semibold">
                            {autor.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900">{autor}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Si hay investigador registrado, mostrar link a perfil */}
                  {publicacion.investigador_slug && (
                    <>
                      <Separator className="my-4" />
                      <Link href={`/investigadores/${publicacion.investigador_slug}`}>
                        <Button variant="outline" className="w-full hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-colors">
                          <User className="mr-2 h-4 w-4" />
                          Ver perfil del investigador
                        </Button>
                      </Link>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Institución */}
            {(publicacion.investigador_institucion || publicacion.institucion) && (
              <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl text-slate-800">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    Institución
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-base text-slate-700">
                    {publicacion.investigador_institucion || publicacion.institucion}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Enlaces y Acciones */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-slate-800">
                  <Share2 className="h-5 w-5 text-blue-600" />
                  Enlaces y Recursos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {publicacion.doi && (
                  <a
                    href={publicacion.doi.startsWith('http') ? publicacion.doi : `https://doi.org/${publicacion.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" className="w-full justify-start hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-colors">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Ver en DOI
                    </Button>
                  </a>
                )}
                
                {publicacion.archivo_url && (
                  <a
                    href={publicacion.archivo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" className="w-full justify-start hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-colors">
                      <Download className="mr-2 h-4 w-4" />
                      Descargar PDF
                    </Button>
                  </a>
                )}
                
                {publicacion.url && (
                  <a
                    href={publicacion.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" className="w-full justify-start hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-colors">
                      <Globe className="mr-2 h-4 w-4" />
                      Sitio web externo
                    </Button>
                  </a>
                )}
                
                {!publicacion.doi && !publicacion.archivo_url && !publicacion.url && (
                  <p className="text-sm text-slate-500 text-center py-4">
                    No hay recursos disponibles
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Metadata adicional */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-0 bg-slate-50">
              <CardHeader>
                <CardTitle className="text-lg text-slate-800">
                  Información Adicional
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {publicacion.fecha_creacion && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Fecha de registro:</span>
                    <span className="text-slate-900 font-medium">
                      {new Date(publicacion.fecha_creacion).toLocaleDateString('es-MX')}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-600">ID de publicación:</span>
                  <span className="text-slate-900 font-mono font-medium">#{publicacion.id}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
