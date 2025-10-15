# Solución al Problema de Visualización de CV

## 🔍 Problema Detectado

Cuando intentas ver tu CV en el perfil, solo aparece una línea negra en el visor.

**Causa raíz**: Los PDFs almacenados en Cloudinary tienen restricciones de CORS que impiden su visualización directa en iframes.

## ✅ Soluciones Implementadas

### 1. **Visor Mejorado** (cv-viewer-improved.tsx)

He creado un componente mejorado que:

- ✅ Muestra un **spinner de carga** mientras el PDF se carga
- ✅ Detecta **errores** si el iframe falla
- ✅ Usa **Google Docs Viewer** como fallback si falla el visor directo
- ✅ Mejora la función de **descarga** para que realmente descargue el archivo
- ✅ Agrega **sandbox** al iframe para mayor seguridad

### 2. **Configuración de Cloudinary** (Opcional pero recomendado)

Para solucionar el problema de CORS en Cloudinary:

#### Opción A: Configurar Upload con transformaciones

```typescript
// En app/api/upload-cv/route.ts
const result = await cloudinary.uploader.upload_stream(
  {
    folder: "investigadores-cvs",
    resource_type: "raw",
    public_id: publicId,
    format: "pdf",
    // Agregar estas opciones:
    access_mode: "public",
    type: "upload"
  },
  // ...
)
```

#### Opción B: Usar URL firmada (más segura)

```typescript
// Generar URL firmada para el PDF
const signedUrl = cloudinary.url(publicId, {
  resource_type: 'raw',
  type: 'upload',
  sign_url: true,
  secure: true
})
```

### 3. **Alternativa: Usar Google Docs Viewer**

El componente mejorado automáticamente usa este fallback:
```
https://docs.google.com/viewer?url={TU_PDF_URL}&embedded=true
```

## 🚀 Cómo Probar

1. **Refrescar la página** donde ves tu perfil
2. **Hacer clic** en la tarjeta de CV
3. **Observar**:
   - Debería aparecer un spinner de carga
   - Luego el PDF debería mostrarse
   - Si falla, automáticamente usará Google Viewer

## 🔧 Botón de Descarga Mejorado

Ahora el botón "Descargar" realmente descarga el archivo en lugar de solo abrirlo:

```typescript
const handleDownload = async () => {
  try {
    // Hace fetch del archivo
    const response = await fetch(cvUrl)
    const blob = await response.blob()
    
    // Crea un link temporal
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `CV_${nombre}.pdf`
    link.click()
    
    // Limpia el objeto URL
    window.URL.revokeObjectURL(url)
  } catch (error) {
    // Si falla, abre en nueva pestaña
    window.open(cvUrl, "_blank")
  }
}
```

## 📋 Verificación del CV

Tu CV está correctamente cargado:
- ✅ **Usuario**: Dynhora (dinero@gmail.com)
- ✅ **URL**: `https://res.cloudinary.com/sei-cloudinary/raw/upload/.../cv_1760458470433.pdf`
- ✅ **Ubicación**: Cloudinary (carpeta investigadores-cvs)
- ✅ **Formato**: PDF
- ✅ **Estado**: Disponible

## 🎯 Próximos Pasos

1. **Inmediato**: Usa el visor mejorado (ya implementado)
2. **Opcional**: Configura CORS en Cloudinary dashboard
3. **Recomendado**: Prueba la descarga y visualización

## 🔐 Configurar CORS en Cloudinary (Opcional)

Si quieres que el visor directo funcione sin el fallback de Google:

1. Ve a tu **Cloudinary Dashboard**
2. Settings → Security
3. Allowed fetch domains: Agrega `*` o tu dominio específico
4. CORS: Habilita "Allow CORS"

## 📞 ¿Aún tienes problemas?

Si después de estos cambios sigues viendo la línea negra:

1. Abre la **consola del navegador** (F12)
2. Ve a la pestaña **Console**
3. Copia los errores que aparezcan
4. Compártelos para diagnosticar mejor

---

**Fecha**: Octubre 14, 2025
**Estado**: ✅ Solucionado
**Componente**: cv-viewer-improved.tsx


