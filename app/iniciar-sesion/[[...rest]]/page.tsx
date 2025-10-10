'use client'

import { SignIn } from '@clerk/nextjs'
import { useEffect, useState } from 'react'

export default function IniciarSesionPage() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Iniciar Sesión
            </h1>
            <p className="text-gray-600">
              Accede a tu cuenta del Sistema Estatal de Investigadores
            </p>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-xl">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Iniciar Sesión
          </h1>
          <p className="text-gray-600">
            Accede a tu cuenta del Sistema Estatal de Investigadores
          </p>
        </div>
        
        <SignIn 
          appearance={{
            elements: {
              formButtonPrimary: 
                'bg-blue-600 hover:bg-blue-700 text-sm normal-case',
              card: 'shadow-xl',
              headerTitle: 'hidden',
              headerSubtitle: 'hidden',
              socialButtonsBlockButton: 
                'border-gray-300 hover:bg-gray-50',
              formFieldInput: 
                'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
              footerActionLink: 
                'text-blue-600 hover:text-blue-700',
            },
          }}
          routing="path"
          path="/iniciar-sesion"
          signUpUrl="/registro"
          afterSignInUrl="/dashboard"
          redirectUrl="/dashboard"
        />
      </div>
    </div>
  )
}
