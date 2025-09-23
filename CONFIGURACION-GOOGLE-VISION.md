# 🚀 Configuración Completa de Google Vision API

## **📋 Pasos Detallados**

### **1. Crear Proyecto en Google Cloud**
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Haz clic en **"Seleccionar proyecto"** → **"Nuevo proyecto"**
3. Nombre del proyecto: `researcher-platform-ocr`
4. Haz clic en **"Crear"**

### **2. Habilitar Vision API**
1. En el menú lateral, ve a **"APIs y servicios"** → **"Biblioteca"**
2. Busca **"Vision API"**
3. Haz clic en **"Vision API"** → **"Habilitar"**

### **3. Crear Service Account**
1. Ve a **"APIs y servicios"** → **"Credenciales"**
2. Haz clic en **"+ CREAR CREDENCIALES"** → **"Cuenta de servicio"**
3. Nombre: `researcher-platform-ocr`
4. Descripción: `OCR para plataforma de investigadores`
5. Haz clic en **"Crear y continuar"**

### **4. Asignar Permisos**
1. Rol: **"Editor"** o **"Vision API User"**
2. Haz clic en **"Continuar"** → **"Listo"**

### **5. Descargar Credenciales**
1. En la lista de cuentas de servicio, haz clic en la que creaste
2. Ve a la pestaña **"Claves"**
3. Haz clic en **"Agregar clave"** → **"Crear nueva clave"**
4. Tipo: **JSON**
5. Haz clic en **"Crear"**
6. Se descargará un archivo JSON

### **6. Configurar en el Proyecto**
1. **Renombra** el archivo descargado a `google-credentials.json`
2. **Muévelo** a la raíz de tu proyecto (donde está `package.json`)
3. **Crea** un archivo `.env.local` en la raíz con:
   ```
   GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json
   ```

### **7. Verificar Configuración**
1. Reinicia el servidor: `npm run dev`
2. Sube una imagen
3. Deberías ver en la consola:
   ```
   ✅ SOLUCIÓN 1 EXITOSA: Texto extraído con Google Vision API
   ```

## **🔧 Comandos de Verificación**

```bash
# Verificar que el archivo existe
ls google-credentials.json

# Verificar variables de entorno
echo $GOOGLE_APPLICATION_CREDENTIALS
```

## **⚠️ Importante**

- **Nunca subas** `google-credentials.json` a Git
- **Mantén** las credenciales seguras
- **Usa** `.env.local` para variables de entorno

## **🎯 Resultado Esperado**

Una vez configurado, el sistema:
1. **Intentará Google Vision API** primero (más preciso)
2. **Si falla**, usará OCR.space como fallback
3. **Si falla**, usará Mathpix como fallback
4. **Si todo falla**, usará modo demostración

**¡Con Google Vision API obtendrás la mejor precisión para extraer datos reales de tus imágenes!**

