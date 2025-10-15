# 🔧 Configurar Opera para Vercel Blob

## 🎯 Objetivo
Desbloquear `*.vercel-storage.com` en Opera para que puedas subir y ver CVs.

---

## 📋 Método 1: Deshabilitar Bloqueador de Anuncios (Más fácil)

### **Pasos:**

1. **Abre Opera**

2. **Ve a Configuración:**
   - Click en el menú Opera (esquina superior izquierda)
   - Click en **"Configuración"** o presiona `Alt + P`

3. **Ve a la sección "Privacidad y seguridad":**
   - En el menú lateral izquierdo
   - Click en **"Privacidad y seguridad"**

4. **Deshabilitar bloqueador de anuncios (temporalmente):**
   - Busca **"Bloqueador de anuncios"**
   - **Desactiva** el switch
   
   O mejor:
   
5. **Administrar excepciones:**
   - Click en **"Administrar excepciones"** o **"Manage lists"**
   - Agregar excepción para: `*.vercel-storage.com`
   - Agregar excepción para: `1ik1hzemt4ky6z8h.public.blob.vercel-storage.com`

6. **Recarga la página:**
   - Presiona `Ctrl + Shift + R` (recarga forzada)
   - Intenta ver el CV de nuevo

---

## 📋 Método 2: Deshabilitar Protección de Rastreo

### **Pasos:**

1. **Abre Opera → Configuración** (`Alt + P`)

2. **Privacidad y seguridad**

3. **Busca "Tracker blocker" o "Bloqueador de rastreadores"**
   - Cambia de **"Strict"** a **"Standard"** o **"Off"**

4. **Recarga la página** (`Ctrl + Shift + R`)

---

## 📋 Método 3: Agregar Excepción por Sitio

### **Pasos:**

1. **Mientras estás en** http://localhost:3000/dashboard

2. **Click en el icono del escudo 🛡️** (a la izquierda de la URL)

3. **Verás algo como:**
   ```
   Bloqueadores activos: 1
   ```

4. **Click en "Administrar" o "Ver detalles"**

5. **Desactiva bloqueadores para este sitio:**
   - Toggle off "Bloqueador de anuncios"
   - Toggle off "Bloqueador de rastreadores"

6. **Recarga la página**

---

## 📋 Método 4: Modo de Navegación Privada

### **Pasos:**

1. **Abre una ventana privada:**
   - `Ctrl + Shift + N`

2. **Ve a:** http://localhost:3000/dashboard

3. **Intenta subir el CV**
   - En modo privado, muchas extensiones están desactivadas

---

## 📋 Método 5: Verificar Extensiones

### **Pasos:**

1. **Abre extensiones:**
   - `Ctrl + Shift + E`
   - O: Menu → Extensiones

2. **Busca extensiones de bloqueo:**
   - uBlock Origin
   - AdBlock
   - Privacy Badger
   - Cualquier bloqueador de anuncios/rastreadores

3. **Desactívalas temporalmente:**
   - Toggle off cada una
   - O agrégales excepción para `localhost`

4. **Recarga la página**

---

## 🧪 Método 6: Verificar en Consola

### **Pasos:**

1. **Abre la consola del navegador:**
   - Presiona `F12`
   - O: Click derecho → Inspeccionar

2. **Ve a la pestaña "Console"**

3. **Intenta subir un CV**

4. **Busca mensajes de error:**
   - Si ves `ERR_BLOCKED_BY_CLIENT` → Es el bloqueador
   - Si ves `Failed to fetch` → Es problema de red
   - Si ves `500` → Es problema del servidor

5. **Ve a la pestaña "Network"**
   - Filtra por "Blocked"
   - Verás qué está bloqueando Opera

---

## ✅ Verificación Rápida

Después de aplicar cualquier método:

1. **Recarga la página:** `Ctrl + Shift + R`
2. **Abre consola:** `F12`
3. **Intenta subir un CV**
4. **Deberías ver:**
   ```
   ✅ CV subido exitosamente
   URL: https://1ik1hzemt4ky6z8h.public.blob.vercel-storage.com/cvs/...
   ```

---

## 🔍 Troubleshooting

### Si sigue sin funcionar:

1. **Cierra completamente Opera:**
   - Cierra todas las ventanas
   - Verifica en el Administrador de tareas que no esté corriendo
   - Abre de nuevo

2. **Limpia caché:**
   - `Ctrl + Shift + Del`
   - Selecciona "Imágenes y archivos en caché"
   - Click en "Borrar datos"

3. **Actualiza Opera:**
   - Menu → Actualizar y recuperar → Buscar actualizaciones
   - Reinicia después de actualizar

---

## 🌐 Alternativa: Usar Edge (Viene con Windows)

Si nada funciona con Opera, **Edge viene preinstalado en Windows**:

1. **Busca "Edge" en el menú inicio**
2. **Abre Edge**
3. **Ve a:** http://localhost:3000/dashboard
4. **Intenta subir el CV**

**Edge NO bloqueará Vercel Blob** ✅

---

## 💡 Recomendación

**Para desarrollo:**
- Usa Edge o Firefox Developer Edition
- Opera puede seguir bloqueando servicios en la nube

**Para producción:**
- Los usuarios finales en Chrome/Firefox/Edge no tendrán problemas
- Opera representa <3% de usuarios
- El 97% de tus usuarios NO tendrá este problema

---

## 🎯 ¿Qué método probar primero?

**Si tienes prisa:** Método 6 (Edge, ya instalado)  
**Si quieres configurar Opera:** Método 1 (Bloqueador de anuncios)  
**Si eres técnico:** Método 5 (Verificar extensiones)

---

**Última actualización:** Octubre 14, 2025

