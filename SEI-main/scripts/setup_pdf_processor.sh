#!/bin/bash

# Script de configuración para el procesador de PDFs
# Este script instala las dependencias necesarias y configura el entorno

echo "🔧 Configurando procesador de PDFs para SEI..."

# Verificar si Python 3 está instalado
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 no está instalado. Por favor instala Python 3.8 o superior."
    exit 1
fi

# Verificar si pip está instalado
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 no está instalado. Por favor instala pip3."
    exit 1
fi

echo "✅ Python 3 encontrado: $(python3 --version)"

# Crear entorno virtual si no existe
if [ ! -d "venv" ]; then
    echo "📦 Creando entorno virtual..."
    python3 -m venv venv
fi

# Activar entorno virtual
echo "🔄 Activando entorno virtual..."
source venv/bin/activate

# Actualizar pip
echo "⬆️ Actualizando pip..."
pip install --upgrade pip

# Instalar dependencias
echo "📚 Instalando dependencias de Python..."
pip install -r requirements.txt

# Verificar instalación de Tesseract
echo "🔍 Verificando instalación de Tesseract..."

# Detectar el sistema operativo
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    if command -v tesseract &> /dev/null; then
        echo "✅ Tesseract encontrado: $(tesseract --version | head -n1)"
    else
        echo "⚠️ Tesseract no encontrado. Instalando con Homebrew..."
        if command -v brew &> /dev/null; then
            brew install tesseract
            brew install tesseract-lang
        else
            echo "❌ Homebrew no está instalado. Por favor instala Tesseract manualmente:"
            echo "   brew install tesseract tesseract-lang"
            exit 1
        fi
    fi
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    if command -v tesseract &> /dev/null; then
        echo "✅ Tesseract encontrado: $(tesseract --version | head -n1)"
    else
        echo "⚠️ Tesseract no encontrado. Instalando con apt..."
        sudo apt update
        sudo apt install -y tesseract-ocr tesseract-ocr-spa
    fi
else
    echo "⚠️ Sistema operativo no reconocido. Por favor instala Tesseract manualmente."
fi

# Crear archivo de configuración
echo "⚙️ Creando archivo de configuración..."
cat > .env.local << EOF
# Configuración del procesador de PDFs
PDF_PROCESSOR_URL=http://localhost:8001

# Configuración de Tesseract (ajustar según tu instalación)
# macOS con Homebrew:
# TESSERACT_CMD=/opt/homebrew/bin/tesseract
# Linux:
# TESSERACT_CMD=/usr/bin/tesseract
# Windows:
# TESSERACT_CMD=C:\Program Files\Tesseract-OCR\tesseract.exe
EOF

echo "✅ Configuración completada!"
echo ""
echo "🚀 Para iniciar el servidor de procesamiento de PDFs:"
echo "   cd scripts"
echo "   source ../venv/bin/activate"
echo "   python pdf_server.py"
echo ""
echo "🌐 El servidor estará disponible en: http://localhost:8001"
echo ""
echo "📖 Para probar el procesador:"
echo "   python pdf_processor.py ../perfil-unico\(Dynhora-Ramirez\)\ \(1\).pdf"
