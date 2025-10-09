"use client"

import { Button, ButtonProps } from "@/components/ui/button"
import { forwardRef } from "react"

interface AnimatedButtonProps extends ButtonProps {
  ripple?: boolean
}

export const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ children, className = "", ripple = true, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        className={`
          ${className}
          smooth-hover
          button-press
          ${ripple ? "ripple-effect" : ""}
          transition-all duration-200
          hover:shadow-lg
        `}
        {...props}
      >
        {children}
      </Button>
    )
  }
)

AnimatedButton.displayName = "AnimatedButton"

