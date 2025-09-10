#!/bin/bash

# Script para desplegar el servidor de OCR a Railway
# Requiere tener Railway CLI instalado: https://docs.railway.app/develop/cli

echo "🚀 Desplegando servidor de OCR a Railway..."

# Verificar que Railway CLI esté instalado
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI no está instalado"
    echo "   Instala desde: https://docs.railway.app/develop/cli"
    exit 1
fi

# Verificar que estemos en el directorio correcto
if [ ! -f "pdf_server.py" ]; then
    echo "❌ No se encontró pdf_server.py. Ejecuta desde el directorio scripts/"
    exit 1
fi

# Login a Railway (si no está logueado)
echo "🔐 Verificando autenticación con Railway..."
railway whoami || {
    echo "🔑 Iniciando sesión en Railway..."
    railway login
}

# Crear nuevo proyecto o usar existente
echo "📦 Configurando proyecto en Railway..."
railway link || railway init

# Desplegar
echo "🚀 Desplegando aplicación..."
railway up

# Obtener URL del servicio
echo "🌐 Obteniendo URL del servicio..."
SERVICE_URL=$(railway domain)

if [ -n "$SERVICE_URL" ]; then
    echo "✅ Servidor desplegado exitosamente!"
    echo "🌐 URL del servicio: https://$SERVICE_URL"
    echo ""
    echo "📝 Configura la variable de entorno en Vercel:"
    echo "   PDF_PROCESSOR_URL=https://$SERVICE_URL"
    echo ""
    echo "🧪 Prueba el servicio:"
    echo "   curl https://$SERVICE_URL/health"
else
    echo "⚠️ No se pudo obtener la URL del servicio"
    echo "   Revisa el dashboard de Railway: https://railway.app/dashboard"
fi
