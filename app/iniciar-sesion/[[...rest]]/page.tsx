"use client"

import { SignIn } from "@clerk/nextjs"
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
      <div className="min-h-screen w-full flex items-center justify-center bg-[#f6f8fc]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-blue-700 font-semibold">Preparando inicio de sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#f6f8fc] px-2">
      <div className="flex flex-col items-center w-full max-w-md mx-auto">
        <img
          src="/images/sei-logo.png"
          alt="Logo SEI Chihuahua"
          className="w-24 h-24 object-contain mb-6 drop-shadow-lg"
          draggable="false"
        />
        <h1 className="text-3xl md:text-4xl font-extrabold text-blue-900 mb-1 text-center">Bienvenido de vuelta</h1>
        <p className="text-gray-600 font-medium mb-8 text-center">Sistema Estatal de Investigadores de Chihuahua</p>
        <div key={key} className="w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden p-6">
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
            fallbackRedirectUrl="/dashboard"
          />
        </div>
        <div className="mt-6 text-center w-full">
          <p className="text-gray-600 text-sm">
            ¿No tienes una cuenta?{' '}
            <Link href="/registro" className="text-blue-600 hover:text-blue-700 font-semibold">Regístrate aquí</Link>
          </p>
          <p className="text-gray-500 text-xs mt-2">
            ¿Problemas para iniciar sesión?{' '}
            <a href="mailto:contacto@sei-chih.com.mx" className="text-blue-600 hover:text-blue-700">Contáctanos</a>
          </p>
        </div>
        <div className="mt-8 text-center space-x-3 text-xs text-gray-400 w-full">
          <Link href="/terminos" className="hover:text-blue-600">Términos</Link>
          <span>•</span>
          <Link href="/privacidad" className="hover:text-blue-600">Privacidad</Link>
          <span>•</span>
          <Link href="/cookies" className="hover:text-blue-600">Cookies</Link>
        </div>
      </div>
    </div>
  );
}
