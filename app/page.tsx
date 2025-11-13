import { Card, CardContent } from "@/components/ui/card"
import { AnimatedCard } from "@/components/ui/animated-card"
import { AnimatedButton } from "@/components/ui/animated-button"
import { FadeCarousel } from "@/components/ui/fade-carousel"
import Link from "next/link"
import { FeaturedResearchers } from "@/components/featured-researchers"
import { RecentProjects } from "@/components/recent-projects"

export default function Home() {
  return (
    <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8">
      {/* Hero Section - Mejorado */}
      <section className="relative py-12 sm:py-16 md:py-20 lg:py-24 overflow-hidden">
        {/* Gradiente de fondo decorativo */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-3xl -z-10"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5 -z-10"></div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          <div className="space-y-6 sm:space-y-8 text-center lg:text-left">
            {/* Badge informativo */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full text-blue-700 text-sm font-medium mx-auto lg:mx-0 animate-fade-in-up">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Sistema Estatal de Investigadores
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight bg-gradient-to-r from-blue-900 via-blue-700 to-purple-800 bg-clip-text text-transparent leading-tight animate-fade-in-up">
              Conectando investigadores de Chihuahua
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl text-blue-700 max-w-2xl mx-auto lg:mx-0 animate-fade-in-up delay-200 leading-relaxed">
              Crea tu perfil profesional, comparte tus investigaciones y conecta con otros investigadores en el estado.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-up delay-300">
              <AnimatedButton 
                size="lg" 
                asChild 
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all w-full sm:w-auto text-base sm:text-lg px-8 py-6"
              >
                <Link href="/convocatorias">
                  🎯 Ver Convocatorias
                </Link>
              </AnimatedButton>
              <AnimatedButton 
                size="lg" 
                variant="outline" 
                asChild 
                className="border-2 border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400 w-full sm:w-auto text-base sm:text-lg px-8 py-6"
              >
                <Link href="/redes">
                  🤝 Redes de colaboración
                </Link>
              </AnimatedButton>
            </div>
            
            {/* Stats preview */}
            <div className="grid grid-cols-3 gap-4 pt-8 animate-fade-in-up delay-400">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-blue-900">100+</div>
                <div className="text-sm text-blue-600 mt-1">Investigadores</div>
              </div>
              <div className="text-center border-x border-blue-200">
                <div className="text-2xl sm:text-3xl font-bold text-blue-900">50+</div>
                <div className="text-sm text-blue-600 mt-1">Publicaciones</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-blue-900">20+</div>
                <div className="text-sm text-blue-600 mt-1">Redes Activas</div>
              </div>
            </div>
          </div>
          
          <div className="relative h-[300px] sm:h-[350px] md:h-[400px] lg:h-[450px] rounded-2xl overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 p-6 sm:p-8 flex items-center justify-center order-first lg:order-last animate-fade-in-right shadow-2xl">
            <FadeCarousel
              images={[
                {
                  src: "/images/cuenta-conmigo-logo.png",
                  alt: "Cuenta Conmigo"
                },
                {
                  src: "/images/sei-logo.png",
                  alt: "Sistema Estatal de Investigadores"
                },
                {
                  src: "/images/IIC_logo_letras-removebg-preview.png",
                  alt: "IIC - Instituto de Innovación y Competitividad"
                },
                {
                  src: "/images/sistema-estatal-investigadores.png",
                  alt: "Sistema Estatal de Investigadores"
                }
              ]}
              interval={5000}
              transitionDuration={1000}
              showIndicators={true}
              autoPlay={true}
              className="w-full h-full"
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
        <section className="py-8 sm:py-12">
          <div className="text-center mb-8 sm:mb-12 animate-fade-in-up">
            <h2 className="text-2xl sm:text-3xl font-bold text-blue-900 mb-4">Nuestras Ubicaciones</h2>
            <p className="text-blue-600 max-w-2xl mx-auto">
              Visítanos en nuestras oficinas en Chihuahua y Ciudad Juárez para recibir atención personalizada
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Oficina Chihuahua */}
            <AnimatedCard className="glass-effect card-hover" delay={100}>
              <CardContent className="p-0 overflow-hidden">
                {/* Encabezado de la oficina */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shadow-md">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-blue-900">Oficina Chihuahua</h3>
                  </div>
                  <p className="text-gray-700 text-sm mb-2">
                    Centro Empresarial de Chihuahua, Av. Cuauhtémoc 1800, Cuauhtémoc, 31020 Chihuahua, Chih.
                  </p>
                  <p className="text-gray-600 text-sm font-medium mb-2">
                    📅 Lunes a Viernes: 8:00 AM - 4:00 PM
                  </p>
                  <Link 
                    href="https://www.google.com/maps/search/?api=1&query=Calle+Cuauhtémoc+1800+Chihuahua" 
                    target="_blank"
                    className="text-blue-600 text-sm hover:text-blue-800 underline font-medium inline-flex items-center gap-1"
                  >
                    📍 Ampliar el mapa
                  </Link>
                </div>
                
                {/* Mapa embebido */}
                <div className="h-80 w-full">
                  <iframe
                    src={`https://maps.google.com/maps?q=${encodeURIComponent("Calle Cuauhtémoc #1800 int.3 Col. Cuauhtémoc C.P. 31020 Chihuahua, Chih.")}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </CardContent>
            </AnimatedCard>

            {/* Oficina Ciudad Juárez */}
            <AnimatedCard className="glass-effect card-hover" delay={200}>
              <CardContent className="p-0 overflow-hidden">
                {/* Encabezado de la oficina */}
                <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 border-b border-purple-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center shadow-md">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-purple-900">Oficina Ciudad Juárez</h3>
                  </div>
                  <p className="text-gray-700 text-sm mb-2">
                    Av. Abraham Lincoln 1290, 32000 Juárez, Chih.
                  </p>
                  <p className="text-gray-600 text-sm font-medium mb-2">
                    📅 Lunes a Viernes: 8:00 AM - 4:00 PM
                  </p>
                  <Link 
                    href="https://www.google.com/maps/search/?api=1&query=Av+Abraham+Lincoln+1320+Ciudad+Juarez" 
                    target="_blank"
                    className="text-purple-600 text-sm hover:text-purple-800 underline font-medium inline-flex items-center gap-1"
                  >
                    📍 Ampliar el mapa
                  </Link>
                </div>
                
                {/* Mapa embebido */}
                <div className="h-80 w-full">
                  <iframe
                    src={`https://maps.google.com/maps?q=${encodeURIComponent("Av. Abraham Lincoln #1320, Edificio José Ma. Morelos Oficinas administrativas de Gobierno del Estado (Pueblito Mexicano) Fracc. Córdova Américas, C.P. 32310 Ciudad Juárez, Chih.")}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </CardContent>
            </AnimatedCard>
          </div>
        </section>

      </div>
    )
  }
