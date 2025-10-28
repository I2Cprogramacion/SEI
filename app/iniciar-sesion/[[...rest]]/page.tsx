"use client"

import { SignIn } from "@clerk/nextjs"
import { ArrowLeft, BookOpen } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function IniciarSesionPage() {
  const [key, setKey] = useState(0)
  const [mounted, setMounted] = useState(false)
  
  // Limpiar COMPLETAMENTE y forzar remount
  useEffect(() => {
    // Limpiar TODO agresivamente
    try {
      // Limpiar localStorage
      localStorage.clear()
      sessionStorage.clear()
      
      // Limpiar cookies de Clerk
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`)
      })
    } catch (e) {
      console.log('Error limpiando:', e)
    }
    
    // Forzar remount completo del componente SignIn
    setKey(Date.now())
    
    // Pequeño delay para asegurar limpieza
    setTimeout(() => setMounted(true), 100)
  }, [])
  
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-blue-600 font-medium">Preparando inicio de sesión...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="w-full max-w-md mx-auto">
        {/* Botón de regreso */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio
        </Link>

        {/* Logo y título */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
              <BookOpen className="w-12 h-12 text-white" strokeWidth={2.5} />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-blue-900 mb-2">
            Bienvenido de vuelta
          </h1>
          <p className="text-gray-600 font-medium">
            Sistema Estatal de Investigadores de Chihuahua
          </p>
        </div>

        {/* Formulario de inicio de sesión - CON KEY ÚNICA */}
        <div key={key} className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          <SignIn 
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none border-0 w-full",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsBlockButton: "border-gray-200 hover:bg-gray-50 transition-all",
                socialButtonsBlockButtonText: "font-medium text-gray-700",
                formButtonPrimary: "bg-blue-600 hover:bg-blue-700 transition-all shadow-md hover:shadow-lg",
                footerActionLink: "text-blue-600 hover:text-blue-700 font-medium",
                formFieldInput: "border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all",
                formFieldLabel: "text-gray-700 font-medium",
                identityPreviewText: "text-gray-700",
                formResendCodeLink: "text-blue-600 hover:text-blue-700",
                otpCodeFieldInput: "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
                footer: "hidden",
              },
              layout: {
                socialButtonsPlacement: "bottom",
                socialButtonsVariant: "blockButton",
              }
            }}
            routing="path"
            path="/iniciar-sesion"
            signUpUrl="/registro"
            afterSignInUrl="/dashboard"
            fallbackRedirectUrl="/dashboard"
          />
        </div>

        {/* Enlaces adicionales */}
        <div className="mt-6 text-center space-y-3">
          <p className="text-gray-600 text-sm">
            ¿No tienes una cuenta?{" "}
            <Link 
              href="/registro" 
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Regístrate aquí
            </Link>
          </p>
          <p className="text-gray-500 text-xs">
            ¿Problemas para iniciar sesión?{" "}
            <a 
              href="mailto:contacto@sei-chih.com.mx" 
              className="text-blue-600 hover:text-blue-700"
            >
              Contáctanos
            </a>
          </p>
        </div>

        {/* Footer legal */}
        <div className="mt-8 text-center space-x-3 text-xs text-gray-500">
          <Link href="/terminos" className="hover:text-blue-600">
            Términos
          </Link>
          <span>•</span>
          <Link href="/privacidad" className="hover:text-blue-600">
            Privacidad
          </Link>
          <span>•</span>
          <Link href="/cookies" className="hover:text-blue-600">
            Cookies
          </Link>
        </div>
      </div>
    </div>
  )
}
