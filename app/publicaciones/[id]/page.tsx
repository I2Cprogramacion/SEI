import { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, ExternalLink, FileText, Building2, Tag } from "lucide-react"
import { getDatabase } from "@/lib/database-config"

interface PublicacionPageProps {
  params: {
    id: string
  }
}

async function getPublicacion(id: string) {
  try {
    console.log('🔍 [Publicacion Detail] Fetching publicacion ID:', id)
    const db = await getDatabase()
    const result = await db.query(
      `SELECT 
        p.*,
        i.nombre_completo as investigador_nombre,
        i.slug as investigador_slug,
        i.institucion as investigador_institucion
       FROM publicaciones p
       LEFT JOIN investigadores i ON p.clerk_user_id = i.clerk_user_id
       WHERE p.id = $1`,
      [id]
    )
    
    console.log('📊 [Publicacion Detail] Query result rows:', result.rows.length)
    
    if (result.rows.length === 0) {
      console.log('⚠️ [Publicacion Detail] No publication found with ID:', id)
      return null
    }
    
    console.log('✅ [Publicacion Detail] Found publication:', result.rows[0].titulo)
    return result.rows[0]
  } catch (error) {
    console.error('❌ [Publicacion Detail] Error fetching publicacion:', error)
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
  const publicacion = await getPublicacion(id)
  
  if (!publicacion) {
    notFound()
  }

  const categoriaColors: Record<string, string> = {
    'Artículo': 'bg-blue-100 text-blue-800',
    'Libro': 'bg-purple-100 text-purple-800',
    'Capítulo': 'bg-green-100 text-green-800',
    'Conferencia': 'bg-orange-100 text-orange-800',
    'Tesis': 'bg-pink-100 text-pink-800',
  }

  const accesoColors: Record<string, string> = {
    'Abierto': 'bg-green-100 text-green-800',
    'Cerrado': 'bg-red-100 text-red-800',
    'Restringido': 'bg-yellow-100 text-yellow-800',
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-8">
        <div className="container mx-auto px-4">
          <Link href="/publicaciones">
            <Button variant="ghost" className="text-white hover:bg-blue-500 mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a publicaciones
            </Button>
          </Link>
          
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {publicacion.categoria && (
                <Badge className={categoriaColors[publicacion.categoria] || 'bg-blue-100 text-blue-800'}>
                  {publicacion.categoria}
                </Badge>
              )}
              {publicacion.acceso && (
                <Badge className={accesoColors[publicacion.acceso] || 'bg-blue-100 text-blue-800'}>
                  {publicacion.acceso}
                </Badge>
              )}
              {publicacion.año_creacion && (
                <Badge variant="secondary" className="bg-white/20 text-white">
                  {publicacion.año_creacion}
                </Badge>
              )}
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold leading-tight">
              {publicacion.titulo}
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Detalles Bibliográficos */}
            <Card className="animate-in slide-in-from-left duration-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Detalles Bibliográficos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {publicacion.editorial && (
                    <div>
                      <p className="text-sm text-blue-600 font-semibold mb-1">Revista/Editorial</p>
                      <p className="text-base">{publicacion.editorial}</p>
                    </div>
                  )}
                  
                  {publicacion.volumen && (
                    <div>
                      <p className="text-sm text-blue-600 font-semibold mb-1">Volumen</p>
                      <p className="text-base">{publicacion.volumen}</p>
                    </div>
                  )}
                  
                  {publicacion.paginas && (
                    <div>
                      <p className="text-sm text-blue-600 font-semibold mb-1">Páginas</p>
                      <p className="text-base">{publicacion.paginas}</p>
                    </div>
                  )}
                  
                  {publicacion.issn && (
                    <div>
                      <p className="text-sm text-blue-600 font-semibold mb-1">ISSN</p>
                      <p className="text-base font-mono">{publicacion.issn}</p>
                    </div>
                  )}
                  
                  {publicacion.isbn && (
                    <div>
                      <p className="text-sm text-blue-600 font-semibold mb-1">ISBN</p>
                      <p className="text-base font-mono">{publicacion.isbn}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Abstract/Resumen */}
            {publicacion.resumen && (
              <Card className="animate-in slide-in-from-left duration-500 delay-100">
                <CardHeader>
                  <CardTitle>Resumen</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-base leading-relaxed text-blue-900/80">
                    {publicacion.resumen}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Palabras Clave */}
            {publicacion.palabras_clave && (
              <Card className="animate-in slide-in-from-left duration-500 delay-150">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5 text-blue-600" />
                    Palabras Clave
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {publicacion.palabras_clave.split(/[,;]/).map((keyword: string, index: number) => (
                      <Badge 
                        key={index} 
                        variant="outline" 
                        className="bg-blue-50 text-blue-700 border-blue-200"
                      >
                        {keyword.trim()}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Autores */}
            {publicacion.autor && (
              <Card className="animate-in slide-in-from-right duration-500">
                <CardHeader>
                  <CardTitle>Autores</CardTitle>
                  <CardDescription>
                    Investigadores que contribuyeron a esta publicación
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {publicacion.autor.split(/[,;]/).map((autor: string, index: number) => (
                      <p key={index} className="text-sm text-blue-700">
                        {autor.trim()}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Institución */}
            {(publicacion.investigador_institucion || publicacion.institucion) && (
              <Card className="animate-in slide-in-from-right duration-500 delay-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    Institución
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-base">
                    {publicacion.investigador_institucion || publicacion.institucion}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Enlaces */}
            <Card className="animate-in slide-in-from-right duration-500 delay-150">
              <CardHeader>
                <CardTitle>Enlaces</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {publicacion.doi && (
                  <a
                    href={publicacion.doi.startsWith('http') ? publicacion.doi : `https://doi.org/${publicacion.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Ver DOI</span>
                  </a>
                )}
                
                {publicacion.archivo_url && (
                  <a
                    href={publicacion.archivo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    <FileText className="h-4 w-4" />
                    <span>Ver PDF</span>
                  </a>
                )}
                
                {publicacion.url && (
                  <a
                    href={publicacion.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Enlace externo</span>
                  </a>
                )}

                {publicacion.investigador_slug && (
                  <Link
                    href={`/investigadores/${publicacion.investigador_slug}`}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Perfil del investigador</span>
                  </Link>
                )}
                
                {!publicacion.doi && !publicacion.archivo_url && !publicacion.url && !publicacion.investigador_slug && (
                  <p className="text-sm text-blue-600/60">No hay enlaces disponibles</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
