# 🚀 Configuración de Vercel Blob Storage

## ✅ Ventajas de Vercel Blob

- 🌐 **Accesible desde cualquier computadora** (en la nube)
- 🚫 **Sin problemas de CORS** 
- 🆓 **Plan gratuito**: 1GB de almacenamiento
- ⚡ **Súper rápido** (CDN global)
- 🔒 **URLs públicas** simples y seguras
- 💯 **Funciona en desarrollo y producción**

## 📋 Pasos para Configurar

### 1️⃣ **Obtener el Token de Vercel**

Tienes 2 opciones:

#### **Opción A: Desde el Dashboard de Vercel** (Recomendado)

1. Ve a: https://vercel.com/dashboard
2. Selecciona tu proyecto (o crea uno nuevo)
3. Ve a **Settings** → **Storage**
4. Haz clic en **"Create Database"**
5. Selecciona **"Blob"**
6. Copia el **BLOB_READ_WRITE_TOKEN**

#### **Opción B: Usando Vercel CLI** (Más rápido)

```bash
# Instalar Vercel CLI (si no lo tienes)
npm install -g vercel

# Iniciar sesión
vercel login

# Vincular proyecto
vercel link

# Esto creará automáticamente las variables de entorno
```

### 2️⃣ **Agregar Token al .env.local**

Agrega esta línea a tu archivo `.env.local`:

```env
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_TuTokenAqui123456789
```

### 3️⃣ **Reiniciar el Servidor**

```bash
# Detén el servidor (Ctrl+C) y vuelve a iniciar
npm run dev
```

### 4️⃣ **Subir tu CV**

1. Ve a: `http://localhost:3000/dashboard`
2. Sección "Curriculum Vitae"
3. Haz clic en "Subir CV"
4. Selecciona tu PDF
5. ¡Listo!

## 🌐 URLs Generadas

Vercel Blob genera URLs como:
```
https://tu-proyecto.vercel-storage.com/cvs/Tu_CV_123456.pdf
```

Estas URLs:
- ✅ Son públicas y accesibles desde cualquier lugar
- ✅ Funcionan en desarrollo y producción
- ✅ Son permanentes (no expiran)
- ✅ No tienen problemas de CORS

## 💰 Límites del Plan Gratuito

| Recurso | Límite Gratuito |
|---------|----------------|
| Almacenamiento | 1 GB |
| Transferencia | 100 GB/mes |
| Archivos | Ilimitados |

**Suficiente para ~100-200 CVs** (asumiendo 5-10MB cada uno)

## 🔄 Migración desde Cloudinary

Si ya tienes CVs en Cloudinary, tendrás que volver a subirlos:

1. Ve a tu dashboard
2. Sube nuevamente los CVs
3. Se guardarán automáticamente en Vercel Blob

## ⚠️ Notas Importantes

### En Desarrollo (localhost):
- Funciona si tienes el token configurado
- Los archivos se guardan en Vercel Blob
- Son accesibles desde internet

### En Producción (vercel.com):
- Funciona automáticamente
- Las variables de entorno se sincronizan
- Todo funciona sin cambios

## 🆘 Solución de Problemas

### Error: "BLOB_READ_WRITE_TOKEN is not set"
**Solución**: Agrega el token a `.env.local` y reinicia el servidor

### Error: "Failed to upload to blob"
**Solución**: 
1. Verifica que el token sea correcto
2. Verifica tu conexión a internet
3. Verifica que el archivo sea un PDF válido

### Los archivos no aparecen
**Solución**: 
1. Verifica que el upload fue exitoso (revisa la consola)
2. Verifica la URL en la base de datos
3. Recarga la página (Ctrl+Shift+R)

## 📞 Soporte

Si tienes problemas:
1. Revisa la consola del navegador (F12)
2. Revisa los logs del servidor
3. Verifica que el token esté configurado correctamente

---

**Siguiente paso**: Obtén tu token de Vercel y agrégalo al `.env.local`


