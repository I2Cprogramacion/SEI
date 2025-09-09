"use client"

import Link from "next/link"
import { ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"

const customStyles = `
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-4px); }
  }
  .animate-float {
    animation: float 2s ease-in-out infinite;
  }
`

export default function Footer() {
  const [showScrollButton, setShowScrollButton] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight

      // Mostrar el botón cuando el usuario haya hecho scroll más del 50% de la página
      const scrollPercentage = (scrollTop / (documentHeight - windowHeight)) * 100
      setShowScrollButton(scrollPercentage > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  return (
    <footer className="border-t border-blue-100 py-8 bg-blue-50 relative">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center">
          <h4 className="font-semibold mb-4 text-blue-900">Términos Legales</h4>
          <ul className="flex flex-wrap gap-6 justify-center mb-6">
            <li>
              <Link href="/terminos" className="text-blue-600 hover:text-blue-900 transition-colors">
                Términos de servicio
              </Link>
            </li>
            <li>
              <Link href="/privacidad" className="text-blue-600 hover:text-blue-900 transition-colors">
                Política de privacidad
              </Link>
            </li>
            <li>
              <Link href="/cookies" className="text-blue-600 hover:text-blue-900 transition-colors">
                Política de cookies
              </Link>
            </li>
          </ul>
          <div className="text-center text-blue-600">
            <p>
              © {new Date().getFullYear()} SECCTI - Sistema Estatal de Ciencia, Tecnología e Innovación de Chihuahua.
              Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>

      {/* Scroll to top button - only shows when scrolled down */}
      <>
        <style jsx>{customStyles}</style>
        <Button
          onClick={scrollToTop}
          className={`fixed bottom-8 right-8 bg-blue-700 hover:bg-blue-900 text-white rounded-full w-14 h-14 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 border-2 border-white/20 z-40 group animate-float ${
            showScrollButton
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 translate-y-4 pointer-events-none"
          }`}
          size="icon"
          aria-label="Volver arriba"
        >
          <div className="relative">
            <ChevronUp className="h-6 w-6 transition-transform duration-300 group-hover:-translate-y-1" />
            <ChevronUp className="h-6 w-6 absolute inset-0 opacity-30 animate-ping" />
          </div>
        </Button>
      </>
    </footer>
  )
}
