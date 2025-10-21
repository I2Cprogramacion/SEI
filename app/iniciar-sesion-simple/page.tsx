'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Lock, Mail, Shield, Eye, EyeOff } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function IniciarSesionSimplePage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Aquí se haría la llamada a Clerk API o tu backend
      // Por ahora, simularemos el login
      
      if (!email || !password) {
        setError('Por favor completa todos los campos')
        setLoading(false)
        return
      }

      // Simulación de login exitoso
      console.log('Login attempt:', { email, password: '***' })
      
      // Redirigir al dashboard
      setTimeout(() => {
        router.push('/dashboard')
      }, 1000)
      
    } catch (err) {
      setError('Error al iniciar sesión. Por favor intenta de nuevo.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="w-full max-w-6xl mx-auto">
        {/* Botón de regreso */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-blue-700 hover:text-blue-800 font-medium transition-colors group"
          >
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Volver al inicio
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start max-w-5xl mx-auto">
          {/* Panel izquierdo - Información */}
          <div className="hidden lg:flex flex-col space-y-6">
            <div className="flex items-center gap-3">
              <div className="relative h-14 w-14 flex-shrink-0">
                <Image
                  src="/images/sei-logo.png"
                  alt="SEI Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-blue-900">
                  Bienvenido de vuelta
                </h1>
                <p className="text-lg text-blue-600 mt-1">
                  Sistema Estatal de Investigadores
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-white/60 backdrop-blur-sm rounded-lg border border-blue-100">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">Acceso Seguro</h3>
                  <p className="text-sm text-blue-700">
                    Tu información está protegida con los más altos estándares de seguridad
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white/60 backdrop-blur-sm rounded-lg border border-blue-100">
                <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Mail className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">Colaboración</h3>
                  <p className="text-sm text-blue-700">
                    Conecta con otros investigadores y comparte tus proyectos
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white/60 backdrop-blur-sm rounded-lg border border-blue-100">
                <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Lock className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">Control Total</h3>
                  <p className="text-sm text-blue-700">
                    Gestiona tu perfil, publicaciones y red de colaboradores
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Panel derecho - Formulario */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            {/* Header móvil */}
            <div className="lg:hidden text-center mb-6">
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
              <p className="text-base text-blue-600">
                Sistema Estatal de Investigadores
              </p>
            </div>

            {/* Formulario */}
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-blue-900 mb-2">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none"
                    placeholder="tu@email.com"
                    required
                  />
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-blue-900 mb-2">
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none pr-12"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Recordar / Olvidaste */}
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-gray-700">Recordarme</span>
                  </label>
                  <Link href="/recuperar-password" className="text-blue-600 hover:text-blue-700 hover:underline">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>

                {/* Botón de submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Iniciando sesión...</span>
                    </div>
                  ) : (
                    'Iniciar Sesión'
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">o</span>
                </div>
              </div>

              {/* Enlace a registro */}
              <div className="text-center">
                <p className="text-sm text-gray-600">
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

            {/* Nota temporal */}
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-800">
                <span className="font-semibold">Nota:</span> Este es un formulario temporal mientras se configura Clerk. 
                Para usar Clerk, visita <Link href="/iniciar-sesion" className="underline">/iniciar-sesion</Link>
              </p>
            </div>

            {/* Ayuda adicional */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
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
