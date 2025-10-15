# 🚀 Guía Rápida: Probar el Nuevo Visor de PDF

## ⏱️ 5 Minutos para Probar Todo

---

## 📋 Pasos Rápidos

### 1️⃣ Iniciar el Servidor (30 segundos)

Abre PowerShell en la carpeta del proyecto:

```powershell
npm run dev
```

Espera a ver:
```
✓ Ready in 3.2s
○ Local: http://localhost:3000
```

---

### 2️⃣ Abrir el Dashboard (10 segundos)

Abre tu navegador y ve a:
```
http://localhost:3000/dashboard
```

Si no has iniciado sesión, primero ve a:
```
http://localhost:3000/iniciar-sesion
```

---

### 3️⃣ Ver el Visor de PDF (1 minuto)

Una vez en el dashboard, busca la sección **"Curriculum Vitae"**:

#### Si YA TIENES un CV subido:
✅ **Verás la tarjeta del CV con:**
- Vista previa del PDF (500px de alto)
- Botón azul grande **"Ver PDF"**
- Botón de descarga

#### Si NO TIENES un CV:
1. Verás un mensaje: "No has subido tu CV aún"
2. Haz clic en **"Subir CV"** o **"Seleccionar archivo"**
3. Sube un PDF de prueba
4. Espera a que se suba (verás "✅ CV subido exitosamente")
5. La página se recargará y verás el visor

---

### 4️⃣ Probar el Modal (1 minuto)

1. **Haz clic en el botón azul "Ver PDF"**
   - Se abrirá un modal grande con el PDF

2. **Prueba los controles:**
   - **⛶ Pantalla completa:** El modal crece a 98% de la pantalla
   - **⬇️ Descargar:** Descarga el PDF
   - **🔗 Nueva pestaña:** Abre el PDF en el navegador
   - **❌ Cerrar:** Cierra el modal

3. **Cierra el modal:**
   - Haz clic en la X o click fuera del modal

---

### 5️⃣ Probar Métodos de Visualización (1 minuto)

Si el PDF **NO SE VE** en el modal:

1. Ve a la parte inferior del modal
2. Verás: **"Método de visualización:"**
3. Prueba cada botón:
   - Click en **[Object]**
   - Espera 2 segundos
   - ¿Se ve ahora? ✅
   - Si no, prueba **[Embed]**

---

### 6️⃣ Probar en Perfil Público (1 minuto)

1. Abre otra pestaña y ve a:
   ```
   http://localhost:3000/investigadores/tu-slug
   ```
   (Reemplaza `tu-slug` con tu slug de investigador)

2. Busca la tarjeta **"Curriculum Vitae"**

3. Verás el mismo visor mejorado

4. Prueba el botón **"Ver PDF"**

---

## ✅ Checklist Rápido

Marca lo que ya probaste:

- [ ] Servidor iniciado (`npm run dev`)
- [ ] Dashboard cargado
- [ ] Vista previa del PDF visible en tarjeta
- [ ] Botón "Ver PDF" hace clic correctamente
- [ ] Modal se abre al 90% de la pantalla
- [ ] PDF se ve dentro del modal
- [ ] Botón de pantalla completa funciona
- [ ] Botón de descarga funciona
- [ ] Botón de nueva pestaña funciona
- [ ] Botón de cerrar (X) funciona
- [ ] Click fuera del modal lo cierra
- [ ] Métodos de visualización se pueden cambiar
- [ ] Vista previa en perfil público funciona

---

## 🐛 Troubleshooting Rápido

### ❌ El servidor no inicia
```powershell
# Reinstala dependencias
npm install
npm run dev
```

### ❌ No me deja entrar al dashboard
- Ve primero a `/iniciar-sesion`
- Inicia sesión con tu cuenta
- Luego ve a `/dashboard`

### ❌ No tengo un CV para probar
**Opción 1:** Sube cualquier PDF de prueba (puede ser un documento cualquiera)

**Opción 2:** Descarga un PDF de prueba:
- Ve a Google
- Busca "sample pdf download"
- Descarga uno
- Súbelo en el dashboard

### ❌ El PDF no se ve en el modal
1. **Abre la consola del navegador:**
   - Presiona `F12`
   - Ve a la pestaña "Console"
   - Busca errores en rojo

2. **Prueba cambiar el método:**
   - En la parte inferior del modal
   - Click en **[Object]** o **[Embed]**

3. **Verifica la URL del CV:**
   - En la consola, busca el valor de `cvUrl`
   - Debería ser algo como: `https://...blob.vercel-storage.com/...`

### ❌ El botón "Ver PDF" no hace nada
1. Abre la consola (`F12`)
2. Busca errores
3. Verifica que `@radix-ui/react-dialog` esté instalado:
   ```powershell
   npm install @radix-ui/react-dialog
   ```

### ❌ Estoy usando Opera y no funciona
1. **Método más rápido:** Usa Edge, Chrome o Firefox para desarrollo
2. **Si quieres usar Opera:**
   - Click en el escudo 🛡️ (barra de direcciones)
   - Desactiva bloqueadores para `localhost`
   - Recarga (`Ctrl + Shift + R`)
   - Prueba los 3 métodos de visualización

---

## 🎯 Lo que Deberías Ver

### Vista en Tarjeta (Dashboard)
```
┌────────────────────────────────────────┐
│ [📄] Curriculum Vitae  [Ver PDF] [⬇️] │
│ CV de Tu Nombre                        │
├────────────────────────────────────────┤
│ 📄 Vista previa del documento          │
│ ┌────────────────────────────────────┐ │
│ │                                    │ │
│ │   [TU PDF SE VE AQUÍ]             │ │
│ │   Puedes hacer scroll             │ │
│ │   500px de alto                   │ │
│ │                                    │ │
│ └────────────────────────────────────┘ │
│ ¿No se ve bien? [Métodos...]          │
└────────────────────────────────────────┘
```

### Modal de Pantalla Completa
```
┌──────────────────────────────────────────────┐
│ Curriculum Vitae     [⛶][⬇️][🔗][❌]        │
│ Tu Nombre                                    │
├──────────────────────────────────────────────┤
│                                              │
│                                              │
│         [TU PDF COMPLETO AQUÍ]              │
│         Ocupa 90% de la pantalla            │
│                                              │
│                                              │
├──────────────────────────────────────────────┤
│ Método: [IFrame][Object][Embed]              │
└──────────────────────────────────────────────┘
```

---

## 📸 Capturas Esperadas

### ✅ Todo Funciona Bien
- Vista previa del PDF visible en la tarjeta
- Al hacer clic en "Ver PDF", modal se abre
- PDF se muestra completo en el modal
- Todos los botones responden

### ⚠️ Necesitas Cambiar Método
- Vista previa funciona
- Modal se abre
- PDF no se ve (pantalla en blanco o gris)
- **Solución:** Cambiar a "Object" o "Embed"

### ❌ Hay un Problema
- Modal no se abre
- Errores en consola
- Botones no responden
- **Solución:** Revisar consola, verificar instalación

---

## ⏱️ Timeline de Prueba

```
0:00 - Iniciar servidor
0:30 - Servidor listo
0:40 - Abrir dashboard en navegador
1:00 - Ver tarjeta del CV
1:30 - Click en "Ver PDF"
2:00 - Modal abierto con PDF
2:30 - Probar pantalla completa
3:00 - Probar descarga
3:30 - Probar nueva pestaña
4:00 - Probar cambio de métodos
4:30 - Probar en perfil público
5:00 - ✅ TODO PROBADO
```

---

## 🎊 Si Todo Funciona

**¡Felicidades!** El nuevo visor de PDF está funcionando perfectamente.

Ahora puedes:
1. ✅ Usar el visor en tu dashboard
2. ✅ Compartir perfiles públicos con el CV visible
3. ✅ Descargar CVs cuando lo necesites
4. ✅ Ver PDFs sin salir de la página

---

## 📝 Comandos Útiles

### Iniciar servidor
```powershell
npm run dev
```

### Detener servidor
```
Ctrl + C
```

### Reinstalar dependencias
```powershell
npm install
```

### Limpiar caché y reiniciar
```powershell
# Detener servidor (Ctrl + C)
Remove-Item -Recurse -Force .next
npm run dev
```

---

## 🔗 URLs Útiles

| Página | URL |
|--------|-----|
| Dashboard | http://localhost:3000/dashboard |
| Login | http://localhost:3000/iniciar-sesion |
| Investigadores | http://localhost:3000/investigadores |
| Admin | http://localhost:3000/admin |
| Home | http://localhost:3000 |

---

## 💡 Tips Rápidos

1. **Usa Edge o Chrome para desarrollo** - Opera puede tener problemas
2. **Abre la consola (F12)** - Siempre es útil para debug
3. **Recarga forzada si algo falla** - `Ctrl + Shift + R`
4. **Prueba los 3 métodos** - Uno siempre funciona
5. **Revisa que cv_url exista** - Necesitas tener un CV subido

---

## ✅ Resultado Esperado

Al finalizar esta guía (5 minutos), deberías:

✅ Ver el PDF en la tarjeta del dashboard  
✅ Poder abrir el modal de pantalla completa  
✅ Ver el PDF completo en el modal  
✅ Usar todos los controles (descargar, nueva pestaña, etc.)  
✅ Cambiar métodos de visualización si es necesario  
✅ Ver el mismo visor en perfiles públicos  

---

**🎯 ¡Empieza ahora!** Solo toma 5 minutos.

```powershell
npm run dev
```

¡Disfruta tu nuevo visor de PDF mejorado! 🚀

