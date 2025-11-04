"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface FadeCarouselProps {
  images: Array<{
    src: string
    alt: string
  }>
  interval?: number // Intervalo en milisegundos (default: 5000)
  transitionDuration?: number // Duración de la transición en milisegundos (default: 1000)
  className?: string
  showIndicators?: boolean // Mostrar indicadores de posición
  autoPlay?: boolean // Reproducción automática
}

export function FadeCarousel({
  images,
  interval = 5000,
  transitionDuration = 1000,
  className,
  showIndicators = true,
  autoPlay = true,
}: FadeCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Cambio automático de imágenes
  useEffect(() => {
    if (!autoPlay || images.length <= 1) return

    const timer = setInterval(() => {
      setIsTransitioning(true)
      
      // Esperar a que termine la transición de salida antes de cambiar la imagen
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
        setIsTransitioning(false)
      }, transitionDuration / 2)
    }, interval)

    return () => clearInterval(timer)
  }, [images.length, interval, transitionDuration, autoPlay])

  // Navegación manual
  const goToSlide = (index: number) => {
    if (index === currentIndex) return
    
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentIndex(index)
      setIsTransitioning(false)
    }, transitionDuration / 2)
  }


  if (images.length === 0) {
    return null
  }

  return (
    <div className={cn("relative w-full h-full", className)}>
      {/* Contenedor de imágenes */}
      <div className="relative w-full h-full overflow-hidden">
        {images.map((image, index) => (
          <div
            key={index}
            className={cn(
              "absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out",
              index === currentIndex && !isTransitioning
                ? "opacity-100 z-10"
                : "opacity-0 z-0"
            )}
            style={{
              transitionDuration: `${transitionDuration}ms`,
            }}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              className="object-contain w-full h-full"
              priority={index === 0}
            />
          </div>
        ))}
      </div>

      {/* Indicadores - Posicionados fuera del contenedor de imágenes */}
      {showIndicators && images.length > 1 && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                index === currentIndex
                  ? "w-8 bg-blue-600"
                  : "w-2 bg-blue-300 hover:bg-blue-400"
              )}
              aria-label={`Ir a imagen ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

