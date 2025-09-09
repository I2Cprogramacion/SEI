# 🎯 Configuración OCR - Solución Simple

## **Opción 1: OCR.space (Recomendado - Gratis)**

### **Paso 1: Obtener API Key**
1. Ve a: https://ocr.space/ocrapi/freekey
2. Regístrate (es gratis)
3. Copia tu API key

### **Paso 2: Configurar en el Proyecto**
1. Crea archivo `.env.local` en la raíz del proyecto:
```
OCR_SPACE_API_KEY=tu_api_key_aqui
```

2. Modifica `app/api/ocr/route.ts` línea 187:
```typescript
apikey: process.env.OCR_SPACE_API_KEY || 'helloworld'
```

## **Opción 2: Google Vision API (Más Preciso)**

### **Paso 1: Crear Proyecto**
1. Ve a: https://console.cloud.google.com/
2. Crea proyecto: `researcher-platform-ocr`
3. Habilita Vision API

### **Paso 2: Crear Service Account**
1. Ve a "APIs y servicios" → "Credenciales"
2. Crea "Cuenta de servicio"
3. Descarga archivo JSON
4. Renómbralo a `google-credentials.json`
5. Ponlo en la raíz del proyecto

### **Paso 3: Configurar Variables**
En `.env.local`:
```
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json
```

## **Opción 3: Usar API Key Temporal**

Si quieres probar inmediatamente, puedo darte una API key temporal para testing.

## **¿Cuál prefieres?**

1. **OCR.space** - Más fácil, gratis, buena precisión
2. **Google Vision** - Más preciso, requiere configuración
3. **API key temporal** - Para probar ahora mismo

**¡Dime cuál opción prefieres y te ayudo a configurarla!**
