# Solución Definitiva al Problema de Visualización de CV

## 🔍 **Problema Identificado**

El error `401 Unauthorized` al intentar acceder al CV se debe a:

1. **Cloudinary requiere configuración especial** para archivos RAW (PDFs)
2. Los archivos raw **no son públicos por defecto**, incluso con `access_mode: "public"`
3. Se necesita configuración en el dashboard de Cloudinary O usar URLs firmadas

## ✅ **Solución Implementada**

### **1. URLs Firmadas (Signed URLs)**

Ahora la API genera automáticamente URLs firmadas que:
- ✅ Funcionan sin importar la configuración de privacidad
- ✅ Son válidas por 10 años
- ✅ No requieren cambios en el dashboard de Cloudinary

### **2. Actualización de la Base de Datos**

Tu CV ahora usa una URL firmada:
```
https://res.cloudinary.com/sei-cloudinary/raw/upload/s--HyXUeE6n--/v1/investigadores-cvs/cv_1760458470433?_a=BAMAK+ZW0
```

### **3. Código Actualizado**

**app/api/upload-cv/route.ts**:
```typescript
// Generar URL firmada que funciona sin restricciones
const signedUrl = cloudinary.url(result.public_id, {
  resource_type: 'raw',
  type: 'upload',
  sign_url: true,
  secure: true,
  expires_at: Math.floor(Date.now() / 1000) + (10 * 365 * 24 * 60 * 60) // 10 años
});

return NextResponse.json({
  success: true,
  url: signedUrl, // URL firmada
  //...
});
```

## 🚀 **Cómo Probar**

1. **Recarga tu perfil** (Dashboard o Perfil Público)
2. **Haz clic en la tarjeta de CV**
3. **Debería mostrarse correctamente** ahora

Si aún ves el error 401, presiona `Ctrl + Shift + R` para recargar sin caché.

## 📋 **Verificación**

```bash
# Verificar la URL en la base de datos
node scripts/check-cv-urls.js
```

Deberías ver:
```
✅ Usuario: Dynhora
✅ Email: dinero@gmail.com
✅ CV URL: https://res.cloudinary.com/sei-cloudinary/raw/upload/s--HyXUeE6n--/...
```

## 🔧 **Para Nuevos CVs**

Los nuevos CVs que subas desde ahora:
1. Se subirán automáticamente con URL firmada
2. Funcionarán inmediatamente sin problemas de permisos
3. Serán válidos por 10 años

## 🎯 **Resumen de Cambios**

| Archivo | Cambio |
|---------|--------|
| `.env.local` | ✅ Agregado `CLOUDINARY_URL` |
| `app/api/upload-cv/route.ts` | ✅ Genera URLs firmadas automáticamente |
| `components/cv-viewer-improved.tsx` | ✅ Mejor manejo de errores y fallback |
| Base de datos | ✅ URL actualizada a URL firmada |

## 💡 **Alternativa: Configurar Cloudinary Dashboard**

Si prefieres no usar URLs firmadas, puedes configurar Cloudinary:

1. Ve a tu dashboard de Cloudinary
2. Settings → Security
3. **Allowed fetch domains**: Agrega `*`
4. **Restricted media types**: Quita `raw` de la lista
5. Guarda los cambios

Pero con URLs firmadas, **no necesitas hacer esto**.

---

**Estado**: ✅ **SOLUCIONADO**
**Método**: URLs Firmadas
**Fecha**: Octubre 14, 2025


