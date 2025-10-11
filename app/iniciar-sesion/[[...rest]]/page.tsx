'use client'

import { SignIn } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Lock, Mail, Shield } from 'lucide-react'

export default function IniciarSesionPage() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="w-full max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-7xl mx-auto">
        {/* Botón de regreso */}
        <div className="mb-6 max-w-6xl mx-auto">
          <Link 
            href="/" 
            className="inline-flex items-center text-blue-700 hover:text-blue-800 font-medium transition-colors group"
          >
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Volver al inicio
          </Link>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_auto] gap-8 lg:gap-12 items-center justify-items-center max-w-6xl mx-auto">
          {/* Panel izquierdo - Información */}
          <div className="hidden xl:block space-y-6 w-full max-w-lg justify-self-end">
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative h-14 w-14 flex-shrink-0">
                  <Image
                    src="/images/sei-logo.png"
                    alt="SEI Logo"
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <h1 className="text-3xl xl:text-4xl font-bold text-blue-900 leading-tight">
                    Bienvenido de vuelta
                  </h1>
                  <p className="text-lg xl:text-xl text-blue-600 mt-1">
                    Sistema Estatal de Investigadores
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 xl:p-4 bg-white/60 backdrop-blur-sm rounded-lg border border-blue-100">
                <div className="flex-shrink-0 w-10 h-10 xl:w-12 xl:h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Shield className="h-5 w-5 xl:h-6 xl:w-6 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-blue-900 mb-1 text-sm xl:text-base">Acceso Seguro</h3>
                  <p className="text-xs xl:text-sm text-blue-700">
                    Tu información está protegida con los más altos estándares de seguridad
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 xl:p-4 bg-white/60 backdrop-blur-sm rounded-lg border border-blue-100">
                <div className="flex-shrink-0 w-10 h-10 xl:w-12 xl:h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Mail className="h-5 w-5 xl:h-6 xl:w-6 text-green-600" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-blue-900 mb-1 text-sm xl:text-base">Colaboración</h3>
                  <p className="text-xs xl:text-sm text-blue-700">
                    Conecta con otros investigadores y comparte tus proyectos
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 xl:p-4 bg-white/60 backdrop-blur-sm rounded-lg border border-blue-100">
                <div className="flex-shrink-0 w-10 h-10 xl:w-12 xl:h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Lock className="h-5 w-5 xl:h-6 xl:w-6 text-purple-600" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-blue-900 mb-1 text-sm xl:text-base">Control Total</h3>
                  <p className="text-xs xl:text-sm text-blue-700">
                    Gestiona tu perfil, publicaciones y red de colaboradores
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Panel derecho - Formulario de inicio de sesión */}
          <div className="w-full max-w-md justify-self-start">
            {/* Header móvil */}
            <div className="xl:hidden text-center mb-6">
              <div className="flex justify-center mb-3">
                <div className="relative h-16 w-16">
                  <Image
                    src="/images/sei-logo.png"
                    alt="SEI Logo"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-blue-900 mb-2">
                Iniciar Sesión
              </h1>
              <p className="text-sm sm:text-base text-blue-600">
                Sistema Estatal de Investigadores
              </p>
            </div>

            {/* Contenedor del SignIn de Clerk */}
            <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 xl:p-8 border border-blue-100">
              <SignIn 
                appearance={{
                  elements: {
                    rootBox: 'w-full',
                    card: 'shadow-none bg-transparent',
                    headerTitle: 'hidden',
                    headerSubtitle: 'hidden',
                    socialButtonsBlockButton: 
                      'border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 text-gray-700 font-medium',
                    socialButtonsBlockButtonText: 'font-medium text-sm',
                    formButtonPrimary: 
                      'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 transition-all duration-200 shadow-md hover:shadow-lg',
                    formFieldInput: 
                      'border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 py-3',
                    formFieldLabel: 'text-blue-900 font-medium text-sm',
                    footerActionLink: 
                      'text-blue-600 hover:text-blue-700 font-semibold hover:underline',
                    identityPreviewText: 'text-blue-900',
                    formResendCodeLink: 'text-blue-600 hover:text-blue-700',
                    otpCodeFieldInput: 'border-2 border-gray-300 focus:border-blue-500',
                    footer: 'hidden',
                    footerAction: 'hidden',
                  },
                  layout: {
                    socialButtonsPlacement: 'top',
                    socialButtonsVariant: 'blockButton',
                  }
                }}
                routing="path"
                path="/iniciar-sesion"
                signUpUrl="/registro"
                afterSignInUrl="/dashboard"
                redirectUrl="/dashboard"
              />

              {/* Enlace personalizado para registro */}
              <div className="mt-4 sm:mt-6 text-center">
                <p className="text-sm sm:text-base text-gray-600">
                  ¿No tienes una cuenta?{' '}
                  <Link 
                    href="/registro" 
                    className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors"
                  >
                    Regístrate aquí
                  </Link>
                </p>
              </div>
            </div>

            {/* Ayuda adicional */}
            <div className="mt-4 sm:mt-6 text-center">
              <p className="text-xs sm:text-sm text-gray-600">
                ¿Problemas para iniciar sesión?{' '}
                <Link href="/contacto" className="text-blue-600 hover:text-blue-700 hover:underline">
                  Contáctanos
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
