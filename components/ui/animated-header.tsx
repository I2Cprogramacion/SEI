"use client"

import { useEffect, useState } from "react"

interface AnimatedHeaderProps {
  title: string
  subtitle?: string
  className?: string
}

export function AnimatedHeader({ title, subtitle, className = "" }: AnimatedHeaderProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Trigger animation after mount
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 100)
    
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className={`space-y-2 ${className}`}>
      <h1 
        className={`
          text-3xl font-bold text-blue-900
          transition-all duration-700
          ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
        `}
      >
        {title}
      </h1>
      {subtitle && (
        <p 
          className={`
            text-blue-600
            transition-all duration-700 delay-200
            ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
          `}
        >
          {subtitle}
        </p>
      )}
    </div>
  )
}

