/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    domains: ['res.cloudinary.com'],
  },
  // Optimizaciones para Railway
  experimental: {
    optimizeCss: true,
  },
  // Caché agresivo para builds más rápidos
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },
  // Comprimir recursos
  compress: true,
  // Optimizar fuentes
  optimizeFonts: true,
  // Reducir tamaño de build
  productionBrowserSourceMaps: false,
}

export default nextConfig
