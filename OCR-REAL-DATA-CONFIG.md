# 🎯 Configuración para Extracción de Datos Reales

## ⚠️ **IMPORTANTE: Sistema Modificado**

He modificado el sistema OCR para que **SOLO extraiga datos reales** del documento. Ya no hay modo de demostración ni datos simulados.

## 🔧 **Configuración Recomendada para Máxima Precisión**

### **1. OCR.space API (Gratis - Recomendado)**

```bash
# 1. Obtener API Key gratuita
# Ve a: https://ocr.space/ocrapi/freekey
# Regístrate (es gratis)
# Copia tu API key

# 2. Configurar en .env.local
OCR_SPACE_API_KEY=tu_api_key_real_aqui

# 3. Reiniciar servidor
npm run dev
```

**Ventajas:**
- ✅ Gratuito (25,000 requests/mes)
- ✅ Buena precisión
- ✅ Soporte para PDFs e imágenes
- ✅ API estable

### **2. Google Vision API (Máxima Precisión)**

```bash
# 1. Crear proyecto en Google Cloud
# Ve a: https://console.cloud.google.com/
# Crea proyecto: researcher-platform-ocr
# Habilita Vision API

# 2. Crear Service Account
# Ve a "APIs y servicios" → "Credenciales"
# Crea "Cuenta de servicio"
# Descarga archivo JSON
# Renómbralo a google-credentials.json
# Ponlo en la raíz del proyecto

# 3. Configurar en .env.local
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json

# 4. Reiniciar servidor
npm run dev
```

**Ventajas:**
- ✅ Máxima precisión
- ✅ Soporte para múltiples idiomas
- ✅ Detección de texto avanzada
- ✅ API confiable de Google

## 🚀 **Sistema de Fallback Mejorado**

El sistema ahora tiene **4 niveles de fallback** para extraer datos reales:

1. **Google Vision API** (si está configurado)
2. **Tesseract.js Local** (optimizado)
3. **OCR.space API** (si está configurado)
4. **API alternativa** (Mathpix)

**Si todos fallan:** El sistema retorna un error en lugar de datos simulados.

## 📋 **Tipos de Archivo Soportados**

### **Imágenes (Recomendado para OCR)**
- ✅ JPG, JPEG
- ✅ PNG
- ✅ GIF
- ✅ BMP
- ✅ TIFF

### **PDFs**
- ✅ PDFs con texto seleccionable
- ⚠️ PDFs escaneados (convertir a imagen)

## 🎯 **Recomendaciones para Mejores Resultados**

### **Para Imágenes:**
1. **Resolución**: Mínimo 300 DPI
2. **Formato**: JPG o PNG
3. **Calidad**: Texto claro y legible
4. **Orientación**: Correcta (no rotada)

### **Para PDFs:**
1. **Tipo**: PDFs con texto seleccionable
2. **Si está escaneado**: Convertir a imagen JPG/PNG
3. **Calidad**: Texto claro y legible

## 🔍 **Verificación de Resultados**

### **En la Consola del Navegador (F12):**
```
✅ SOLUCIÓN X EXITOSA: Texto extraído con [API]
📊 Texto extraído (longitud): XXXX caracteres
✅ Datos extraídos del documento real: {...}
📊 Campos extraídos: X de Y
```

### **Si hay Error:**
```
❌ Error en OCR: [mensaje específico]
⚠️ No se pudo extraer texto del documento
```

## 🛠️ **Solución de Problemas**

### **Error: "No se pudo extraer texto"**
1. Verificar que el archivo contenga texto legible
2. Probar con una imagen de mejor calidad
3. Configurar APIs externas para mejor precisión

### **Error: "Texto extraído muy corto"**
1. El documento puede estar mal escaneado
2. Probar con una imagen de mayor resolución
3. Verificar que el texto sea legible

### **Error: "No se pudieron extraer datos"**
1. El documento puede no contener los campos esperados
2. Verificar que tenga CURP, RFC, nombre, etc.
3. Probar con un documento más completo

## 🎉 **Resultado Final**

Con esta configuración, el sistema:
- ✅ **Solo extrae datos reales** del documento
- ✅ **No usa datos simulados** como fallback
- ✅ **Retorna errores claros** si no puede procesar
- ✅ **Máxima precisión** con APIs configuradas
- ✅ **Funciona offline** con Tesseract.js local

**¡El sistema ahora garantiza que solo trabajará con datos reales de tus documentos!** 🚀

