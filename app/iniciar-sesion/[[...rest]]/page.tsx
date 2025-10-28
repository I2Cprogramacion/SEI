"use client"

import { SignIn } from "@clerk/nextjs"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useEffect } from "react"

export default function IniciarSesionPage() {
  // Limpiar datos guardados de Clerk al cargar la página
  useEffect(() => {
    // Limpiar el localStorage de Clerk relacionado con identificadores
    const keysToRemove = Object.keys(localStorage).filter(key => 
      key.includes('clerk') || key.includes('identifier')
    );
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }, []);
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
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-blue-900 mb-2">
            Bienvenido de vuelta
          </h1>
          <p className="text-gray-600">
            Sistema Estatal de Investigadores de Chihuahua
          </p>
        </div>

        {/* Formulario de inicio de sesión */}
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
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
            afterSignUpUrl="/registro/exito"
            redirectUrl="/dashboard"
            signUpFallbackRedirectUrl="/registro/exito"
            signInFallbackRedirectUrl="/dashboard"
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
