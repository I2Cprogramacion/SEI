# Procesamiento de PDFs - Sistema SEI

Este documento explica cómo configurar y usar el sistema de procesamiento de PDFs para extraer datos del Perfil Único (PU) usando PyMuPDF y pytesseract.

## 🏗️ Arquitectura

El sistema de procesamiento de PDFs consta de tres componentes principales:

1. **Servidor Python (FastAPI)**: Procesa los PDFs y extrae datos usando OCR
2. **API Next.js**: Recibe archivos del frontend y los envía al servidor Python
3. **Frontend React**: Interfaz de usuario para cargar PDFs y mostrar datos extraídos

## 📋 Requisitos del Sistema

### Software Requerido
- Python 3.8 o superior
- pip3
- Tesseract OCR
- Node.js 18+ (ya instalado para el proyecto Next.js)

### Dependencias de Python
- PyMuPDF (fitz): Para extraer texto e imágenes de PDFs
- pytesseract: Para OCR en imágenes
- Pillow: Para procesamiento de imágenes
- FastAPI: Para el servidor de procesamiento
- uvicorn: Para ejecutar el servidor

## 🚀 Configuración Inicial

### 1. Instalar Dependencias

```bash
# Ejecutar el script de configuración
cd scripts
./setup_pdf_processor.sh
```

Este script:
- Crea un entorno virtual de Python
- Instala todas las dependencias necesarias
- Configura Tesseract OCR
- Crea archivos de configuración

### 2. Configurar Tesseract (si es necesario)

El script detecta automáticamente tu sistema operativo e instala Tesseract:

- **macOS**: `brew install tesseract tesseract-lang`
- **Linux**: `sudo apt install tesseract-ocr tesseract-ocr-spa`
- **Windows**: Descargar desde [GitHub](https://github.com/UB-Mannheim/tesseract/wiki)

## 🏃‍♂️ Ejecución

### 1. Iniciar el Servidor de Procesamiento

```bash
cd scripts
./start_pdf_server.sh
```

El servidor estará disponible en: `http://localhost:8001`

### 2. Iniciar la Aplicación Next.js

```bash
# En otra terminal
npm run dev
```

La aplicación estará disponible en: `http://localhost:3000`

## 🔧 Uso del Sistema

### 1. Cargar PDF en el Formulario de Registro

1. Ve a `/registro` en la aplicación web
2. Selecciona un archivo PDF del Perfil Único
3. Haz clic en "Procesar PDF"
4. El sistema extraerá automáticamente los datos

### 2. Campos Extraídos

El sistema extrae los siguientes campos del Perfil Único:

- **Nombre completo**
- **CURP** (Clave Única de Registro de Población)
- **RFC** (Registro Federal de Contribuyentes)
- **CVU** (Código de Validación Única)
- **Correo electrónico**
- **Teléfono**
- **Último grado de estudios**
- **Empleo actual**
- **Fecha de nacimiento**
- **Nacionalidad**

### 3. Validación de Datos

El sistema valida automáticamente:
- Formato de CURP
- Formato de RFC
- Formato de email
- Tamaño del archivo (máximo 10MB)

## 🧪 Pruebas

### Probar el Procesador Directamente

```bash
cd scripts
source ../venv/bin/activate
python pdf_processor.py ../perfil-unico\(Dynhora-Ramirez\)\ \(1\).pdf
```

### Probar el Servidor API

```bash
# Verificar que el servidor esté funcionando
curl http://localhost:8001/health

# Probar procesamiento de PDF
curl -X POST "http://localhost:8001/process-pdf" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@perfil-unico.pdf"
```

## 🔍 Solución de Problemas

### Error: "Tesseract no encontrado"

```bash
# macOS
brew install tesseract tesseract-lang

# Linux
sudo apt install tesseract-ocr tesseract-ocr-spa

# Verificar instalación
tesseract --version
```

### Error: "Dependencias faltantes"

```bash
cd scripts
source ../venv/bin/activate
pip install -r requirements.txt
```

### Error: "Servidor no responde"

1. Verificar que el servidor Python esté ejecutándose en el puerto 8001
2. Verificar la variable de entorno `PDF_PROCESSOR_URL` en `.env.local`
3. Revisar los logs del servidor para errores específicos

### Baja precisión en OCR

1. Asegurar que el PDF tenga buena calidad de imagen
2. Verificar que Tesseract tenga el paquete de idioma español instalado
3. Considerar preprocesar las imágenes antes del OCR

## 📊 Monitoreo

### Logs del Servidor

Los logs del servidor Python muestran:
- Archivos procesados
- Campos extraídos
- Errores de procesamiento
- Tiempo de procesamiento

### Métricas de la API

- Total de archivos procesados
- Tasa de éxito de extracción
- Tiempo promedio de procesamiento
- Campos más comúnmente extraídos

## 🔒 Seguridad

- Validación de tipos de archivo (solo PDF)
- Límite de tamaño de archivo (10MB)
- Autenticación JWT requerida
- Archivos temporales se eliminan automáticamente
- CORS configurado para dominios específicos

## 🚀 Despliegue

### Variables de Entorno

```bash
# .env.local
PDF_PROCESSOR_URL=http://localhost:8001
TESSERACT_CMD=/opt/homebrew/bin/tesseract  # Ajustar según tu instalación
```

### Docker (Opcional)

```dockerfile
# Dockerfile para el servidor de procesamiento
FROM python:3.9-slim

RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    tesseract-ocr-spa \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
CMD ["python", "pdf_server.py"]
```

## 📈 Mejoras Futuras

- [ ] Soporte para múltiples idiomas
- [ ] Mejora de precisión con modelos de IA
- [ ] Procesamiento en lotes
- [ ] Cache de resultados
- [ ] Interfaz de administración para monitoreo
- [ ] Soporte para otros formatos de documento

## 🤝 Contribución

Para contribuir al sistema de procesamiento de PDFs:

1. Fork el repositorio
2. Crea una rama para tu feature
3. Implementa las mejoras
4. Añade tests
5. Envía un pull request

## 📞 Soporte

Si encuentras problemas:

1. Revisa los logs del servidor
2. Verifica la configuración de Tesseract
3. Prueba con un PDF de ejemplo
4. Abre un issue en el repositorio
