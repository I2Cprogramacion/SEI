"use client"

import React from "react"
import { Button } from "./ui/button"

type Props = {
  children: React.ReactNode
}

type State = {
  hasError: boolean
  error?: Error | null
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: any) {
    // Log the error + stack to console so the developer can copy the trace
    console.error("ErrorBoundary caught an error:", error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 border border-red-200 rounded-md">
          <h2 className="text-red-900 font-semibold">Ha ocurrido un error en esta sección</h2>
          <p className="text-sm text-red-700 mt-2">La sección afectada no pudo renderizarse. Revisa la consola del navegador para más detalles (stack trace).</p>
          <div className="mt-4">
            <Button onClick={() => window.location.reload()} className="bg-red-600 text-white">Recargar</Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
