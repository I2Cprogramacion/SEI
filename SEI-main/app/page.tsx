import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"
import { FeaturedResearchers } from "@/components/featured-researchers"
import { RecentProjects } from "@/components/recent-projects"
import { SearchBar } from "@/components/search-bar"
import { OfficeLocations } from "@/components/office-locations"

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="py-12 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-blue-900">
              Conectando investigadores de Chihuahua
            </h1>
            <p className="text-xl text-blue-600">
              Crea tu perfil profesional, comparte tus investigaciones y conecta con otros investigadores en el estado.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild className="bg-blue-700 text-white hover:bg-blue-800">
                <Link href="/convocatorias">Convocatorias abiertas</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-blue-200 text-blue-700 hover:bg-blue-50">
                <Link href="/redes">Redes de colaboración</Link>
              </Button>
            </div>
          </div>
          <div className="relative h-[400px] rounded-lg overflow-hidden bg-white p-6 flex items-center justify-center">
            <Image
              src="/images/cuenta-conmigo-logo.png"
              alt="Cuenta Conmigo"
              width={500}
              height={300}
              className="object-contain"
              priority
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-12">
        <h2 className="text-3xl font-bold text-center mb-12 text-blue-900">Cómo funciona</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-white border-blue-100">
            <CardContent className="pt-6">
              <div className="rounded-full bg-blue-50 w-12 h-12 flex items-center justify-center mb-4">
                <span className="text-blue-900 font-bold text-xl">1</span>
              </div>
              <h3 className="text-xl font-bold mb-2 text-blue-900">Crea tu perfil</h3>
              <p className="text-blue-600">
                Registra tu información profesional, experiencia, educación y áreas de investigación.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white border-blue-100">
            <CardContent className="pt-6">
              <div className="rounded-full bg-blue-50 w-12 h-12 flex items-center justify-center mb-4">
                <span className="text-blue-900 font-bold text-xl">2</span>
              </div>
              <h3 className="text-xl font-bold mb-2 text-blue-900">Comparte tus proyectos</h3>
              <p className="text-blue-600">
                Publica tus investigaciones, artículos y proyectos para que otros puedan conocer tu trabajo.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white border-blue-100">
            <CardContent className="pt-6">
              <div className="rounded-full bg-blue-50 w-12 h-12 flex items-center justify-center mb-4">
                <span className="text-blue-900 font-bold text-xl">3</span>
              </div>
              <h3 className="text-xl font-bold mb-2 text-blue-900">Conecta y colabora</h3>
              <p className="text-blue-600">
                Encuentra otros investigadores en Chihuahua, intercambia ideas y crea nuevas colaboraciones.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-12 bg-blue-50 rounded-xl px-6 my-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4 text-blue-900">Encuentra investigadores y proyectos en Chihuahua</h2>
          <p className="text-blue-600 max-w-2xl mx-auto">
            Busca por nombre, institución, campo de investigación o palabras clave
          </p>
        </div>
        <SearchBar />
      </section>

      {/* Featured Researchers */}
      <section className="py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-blue-900">Algunos de nuestros investigadores</h2>
          <Button variant="ghost" asChild className="text-blue-700 hover:bg-blue-50">
            <Link href="/investigadores">Ver todos</Link>
          </Button>
        </div>
        <FeaturedResearchers />
      </section>

      {/* Recent Projects */}
      <section className="py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-blue-900">Proyectos recientes</h2>
          <Button variant="ghost" asChild className="text-blue-700 hover:bg-blue-50">
            <Link href="/proyectos">Ver todos</Link>
          </Button>
        </div>
        <RecentProjects />
      </section>

      {/* Office Locations */}
      <OfficeLocations />
    </div>
  )
}
