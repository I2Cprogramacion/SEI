import { Card, CardContent } from "@/components/ui/card"
import { AnimatedCard } from "@/components/ui/animated-card"
import { AnimatedButton } from "@/components/ui/animated-button"
import Link from "next/link"
import Image from "next/image"
import { FeaturedResearchers } from "@/components/featured-researchers"
import { RecentProjects } from "@/components/recent-projects"
import { SearchBar } from "@/components/search-bar"
import { OfficeLocations } from "@/components/office-locations"

export default function Home() {
  return (
    <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8">
      {/* Hero Section */}
      <section className="py-8 sm:py-12 md:py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-center">
          <div className="space-y-4 sm:space-y-6 text-center lg:text-left">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-blue-900 leading-tight animate-fade-in-up">
              Conectando investigadores de Chihuahua
            </h1>
            <p className="text-lg sm:text-xl text-blue-600 max-w-2xl mx-auto lg:mx-0 animate-fade-in-up delay-200">
              Crea tu perfil profesional, comparte tus investigaciones y conecta con otros investigadores en el estado.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start animate-fade-in-up delay-300">
              <AnimatedButton size="lg" asChild className="bg-blue-700 text-white hover:bg-blue-800 w-full sm:w-auto animate-glow">
                <Link href="/convocatorias">Convocatorias abiertas</Link>
              </AnimatedButton>
              <AnimatedButton size="lg" variant="outline" asChild className="border-blue-200 text-blue-700 hover:bg-blue-50 w-full sm:w-auto">
                <Link href="/redes">Redes de colaboración</Link>
              </AnimatedButton>
            </div>
          </div>
          <div className="relative h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px] rounded-lg overflow-hidden bg-white p-4 sm:p-6 flex items-center justify-center order-first lg:order-last animate-fade-in-right">
            <Image
              src="/images/cuenta-conmigo-logo.png"
              alt="Cuenta Conmigo"
              width={500}
              height={300}
              className="object-contain w-full h-full"
              priority
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-8 sm:py-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12 text-blue-900 animate-fade-in-up">Cómo funciona</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          <AnimatedCard className="glass-effect card-hover" delay={100}>
            <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
              <div className="rounded-full bg-gradient-to-br from-blue-500 to-blue-600 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mb-3 sm:mb-4 mx-auto sm:mx-0 animate-gentle-pulse shadow-lg">
                <span className="text-white font-bold text-lg sm:text-xl">1</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2 text-blue-900 text-center sm:text-left">Crea tu perfil</h3>
              <p className="text-blue-600 text-sm sm:text-base text-center sm:text-left">
                Registra tu información profesional, experiencia, educación y áreas de investigación.
              </p>
            </CardContent>
          </AnimatedCard>
          <AnimatedCard className="glass-effect card-hover" delay={200}>
            <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
              <div className="rounded-full bg-gradient-to-br from-blue-500 to-blue-600 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mb-3 sm:mb-4 mx-auto sm:mx-0 animate-gentle-pulse shadow-lg">
                <span className="text-white font-bold text-lg sm:text-xl">2</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2 text-blue-900 text-center sm:text-left">Comparte tus proyectos</h3>
              <p className="text-blue-600 text-sm sm:text-base text-center sm:text-left">
                Publica tus investigaciones, artículos y proyectos para que otros puedan conocer tu trabajo.
              </p>
            </CardContent>
          </AnimatedCard>
          <AnimatedCard className="glass-effect card-hover sm:col-span-2 lg:col-span-1" delay={300}>
            <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
              <div className="rounded-full bg-gradient-to-br from-blue-500 to-blue-600 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mb-3 sm:mb-4 mx-auto sm:mx-0 animate-gentle-pulse shadow-lg">
                <span className="text-white font-bold text-lg sm:text-xl">3</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2 text-blue-900 text-center sm:text-left">Conecta y colabora</h3>
              <p className="text-blue-600 text-sm sm:text-base text-center sm:text-left">
                Encuentra otros investigadores en Chihuahua, intercambia ideas y crea nuevas colaboraciones.
              </p>
            </CardContent>
          </AnimatedCard>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-8 sm:py-12 bg-gradient-to-br from-blue-100/50 via-blue-50/30 to-transparent rounded-lg sm:rounded-xl px-4 sm:px-6 my-8 sm:my-12 animate-fade-in-up delay-400 backdrop-blur-sm border border-blue-100/50 shadow-lg">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-blue-900">Encuentra investigadores y proyectos en Chihuahua</h2>
          <p className="text-blue-600 max-w-2xl mx-auto text-sm sm:text-base">
            Busca por nombre, institución, campo de investigación o palabras clave
          </p>
        </div>
        <SearchBar />
      </section>

      {/* Featured Researchers */}
      <section className="py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-5 gap-4 animate-fade-in-up delay-500">
          <h2 className="text-2xl sm:text-3xl font-bold text-blue-900">Algunos de nuestros investigadores</h2>
          <AnimatedButton variant="ghost" asChild className="text-blue-700 hover:bg-blue-50 w-full sm:w-auto">
            <Link href="/investigadores">Ver todos</Link>
          </AnimatedButton>
        </div>
        <FeaturedResearchers />
      </section>

      {/* Recent Projects */}
      <section className="py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-5 gap-4 animate-fade-in-up">
          <h2 className="text-2xl sm:text-3xl font-bold text-blue-900">Proyectos recientes</h2>
          <AnimatedButton variant="ghost" asChild className="text-blue-700 hover:bg-blue-50 w-full sm:w-auto">
            <Link href="/proyectos">Ver todos</Link>
          </AnimatedButton>
        </div>
        <RecentProjects />
      </section>

      {/* Office Locations */}
      <div className="animate-fade-in-up">
        <OfficeLocations />
      </div>
    </div>
  )
}
