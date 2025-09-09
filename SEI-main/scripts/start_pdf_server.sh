#!/bin/bash

# Script para iniciar el servidor de procesamiento de PDFs

echo "🚀 Iniciando servidor de procesamiento de PDFs..."

# Verificar si el entorno virtual existe
if [ ! -d "../venv" ]; then
    echo "❌ Entorno virtual no encontrado. Ejecuta primero: ./setup_pdf_processor.sh"
    exit 1
fi

# Activar entorno virtual
echo "🔄 Activando entorno virtual..."
source ../venv/bin/activate

# Verificar que las dependencias estén instaladas
echo "🔍 Verificando dependencias..."
python -c "import fitz, pytesseract, PIL; print('✅ Dependencias OK')" 2>/dev/null || {
    echo "❌ Dependencias faltantes. Ejecuta: ./setup_pdf_processor.sh"
    exit 1
}

# Iniciar servidor
echo "🌐 Iniciando servidor en http://localhost:8001..."
echo "📝 Logs del servidor:"
echo "===================="
python pdf_server.py
