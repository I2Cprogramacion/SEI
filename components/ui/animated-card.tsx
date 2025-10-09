"use client"

import React, { useEffect, useRef, useState } from "react"
import { Card, CardProps } from "@/components/ui/card"

interface AnimatedCardProps {
  delay?: number
  hoverEffect?: boolean
  children?: React.ReactNode
  className?: string
  id?: string
  onFocus?: () => void
  [key: string]: any
}

export function AnimatedCard({ 
  children, 
  className = "", 
  delay = 0,
  hoverEffect = true,
  ...props 
}: AnimatedCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true)
          }, delay)
        }
      },
      { threshold: 0.1 }
    )

    if (cardRef.current) {
      observer.observe(cardRef.current)
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current)
      }
    }
  }, [delay])

  return (
    <Card
      ref={cardRef}
      className={`
        ${className}
        ${isVisible ? "animate-fade-in-up" : "opacity-0"}
        ${hoverEffect ? "card-hover" : ""}
        transition-all duration-300
      `}
      {...props}
    >
      {children}
    </Card>
  )
}

