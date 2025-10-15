# 🔍 Diagnóstico: CV No Se Actualiza

## 📋 Checklist de Diagnóstico

### 1️⃣ Abrir la Consola del Navegador

1. Presiona `F12`
2. Ve a la pestaña "Console"
3. Ve a la pestaña "Network"

### 2️⃣ Intenta Subir el CV Nuevamente

1. Click en "Subir CV"
2. Selecciona un PDF
3. **Observa la consola**

### 3️⃣ Busca Estos Errores

#### ❌ Error 1: "No autorizado" (401)
```
POST /api/investigadores/update-cv 401 (Unauthorized)
```
**Causa:** El token no se está enviando correctamente

#### ❌ Error 2: "Error al subir CV" (500)
```
Error al actualizar CV: Error: Error al actualizar el CV
```
**Causa:** Problema en la base de datos

#### ❌ Error 3: BLOB_STORE_ID not found
```
Error: BLOB_STORE_ID environment variable is not set
```
**Causa:** Vercel Blob no está configurado

#### ❌ Error 4: CORS / Network Error
```
Failed to fetch
```
**Causa:** Problema de red o servidor caído

### 4️⃣ Verifica en la Pestaña Network

1. Busca la request `upload-cv-vercel`
2. Verifica el Status Code:
   - ✅ 200: Todo bien
   - ❌ 401: No autorizado
   - ❌ 500: Error del servidor

---

## 🔍 Por Favor, Dime:

1. **¿Ves algún mensaje en pantalla cuando subes el PDF?**
   - [ ] "Subiendo archivo..."
   - [ ] Mensaje de error en rojo
   - [ ] No aparece nada

2. **¿Qué errores ves en la consola (F12)?**
   - Copia y pega los errores aquí

3. **¿El botón "Subir CV" hace algo?**
   - [ ] Abre el selector de archivos
   - [ ] No hace nada
   - [ ] Muestra un spinner/loading

4. **¿Después de seleccionar el PDF qué pasa?**
   - [ ] Muestra "Subiendo..."
   - [ ] No pasa nada
   - [ ] Muestra un error

---

## 🛠️ Soluciones Rápidas

### Si ves "No autorizado" (401):
El token no se está enviando. Prueba cerrar sesión y volver a iniciar.

### Si ves "BLOB_STORE_ID not found":
Vercel Blob no está configurado. Usa la versión local.

### Si no ves ningún mensaje:
El componente no se está ejecutando. Verifica que `npm run dev` esté corriendo.

---

**Responde con los errores que ves en la consola y te ayudo a solucionarlo** 🔧

