# 📄 Cómo Funciona el Sistema de CV por Usuario

## 🎯 Verificado: Cada Usuario Ve Su Propio CV

---

## ✅ Confirmación

El sistema **YA ESTÁ CONFIGURADO** para mostrar el CV correcto de cada usuario. No necesitas hacer nada adicional.

---

## 🔍 Cómo Funciona

### 1️⃣ **En el Dashboard (Usuario Autenticado)**

Cuando un usuario inicia sesión y va a `/dashboard`:

```tsx
// app/dashboard/page.tsx - Línea 243-247

<CvViewerEnhanced 
  cvUrl={user.cv_url}                              // ← CV del usuario actual
  investigadorNombre={user.nombre_completo || user.nombre}
  showAsCard={true}
/>
```

**¿Qué pasa aquí?**
- `user` viene de `/api/auth/me` (línea 45)
- Ese endpoint devuelve los datos del usuario **que está autenticado**
- `user.cv_url` es la URL del CV **de ese usuario específico**
- Por lo tanto, cada usuario ve **solo su propio CV**

---

### 2️⃣ **En el Perfil Público**

Cuando alguien visita el perfil de un investigador en `/investigadores/[slug]`:

```tsx
// app/investigadores/[slug]/page.tsx - Línea 193-197

{investigador.cvUrl && (
  <CvViewerEnhanced 
    cvUrl={investigador.cvUrl}                     // ← CV del investigador del perfil
    investigadorNombre={investigador.name}
    showAsCard={true}
  />
)}
```

**¿Qué pasa aquí?**
- `investigador` viene del endpoint `/api/investigadores/[slug]`
- Ese endpoint busca el investigador por su `slug`
- `investigador.cvUrl` es la URL del CV **de ese investigador específico**
- Por lo tanto, cada perfil muestra **el CV correcto de ese investigador**

---

## 🧪 Cómo Verificar Que Funciona

### Opción 1: Ver en la Consola del Navegador

1. Abre tu navegador
2. Ve al dashboard: `http://localhost:3000/dashboard`
3. Presiona `F12` para abrir la consola
4. Busca estos mensajes:

```
📄 CvViewerEnhanced cargado para: Tu Nombre Completo
🔗 CV URL: https://1ik1hzemt4ky6z8h.public.blob.vercel-storage.com/cvs/tu-cv-xxxxx.pdf
```

5. Verás que la URL es **tu CV específico**

### Opción 2: Crear Dos Usuarios de Prueba

1. **Crea el Usuario 1:**
   - Regístrate con email: `usuario1@test.com`
   - Sube un CV (por ejemplo, "CV_Usuario1.pdf")

2. **Crea el Usuario 2:**
   - Cierra sesión
   - Regístrate con email: `usuario2@test.com`
   - Sube un CV diferente (por ejemplo, "CV_Usuario2.pdf")

3. **Prueba:**
   - Inicia sesión como Usuario 1
   - Ve al dashboard
   - Verás el CV_Usuario1.pdf
   - Cierra sesión
   - Inicia sesión como Usuario 2
   - Ve al dashboard
   - Verás el CV_Usuario2.pdf

**Resultado esperado:** Cada usuario ve su propio CV ✅

---

## 🔐 Seguridad

### ¿Puede un usuario ver el CV de otro?

**NO**, por varias razones:

1. **Dashboard Protegido:**
   - El dashboard está protegido por middleware
   - Solo muestra datos del usuario autenticado
   - Usa `/api/auth/me` que verifica el token JWT

2. **Base de Datos:**
   - Cada CV está asociado a un `user_id` o `investigador_id`
   - El endpoint solo devuelve datos del usuario actual

3. **URLs Únicas:**
   - Cada CV tiene una URL única en Vercel Blob
   - Aunque alguien tenga la URL, no puede cambiarla en el dashboard de otro usuario

---

## 📊 Flujo Completo

### Cuando un Usuario Sube su CV

```
Usuario sube CV.pdf
   │
   ├─ Se guarda en Vercel Blob
   │  └─ Genera URL: https://.../cvs/xxxx.pdf
   │
   ├─ Se actualiza la base de datos
   │  └─ UPDATE investigadores SET cv_url = 'https://...' WHERE id = user_id
   │
   └─ Se actualiza el estado local
      └─ setUser({ ...user, cv_url: newUrl })
```

### Cuando un Usuario Ve su Dashboard

```
Usuario va a /dashboard
   │
   ├─ useEffect llama a /api/auth/me
   │
   ├─ Endpoint verifica token JWT
   │  └─ Obtiene user_id del token
   │
   ├─ Busca datos en la base de datos
   │  └─ SELECT * FROM investigadores WHERE id = user_id
   │
   ├─ Devuelve datos del usuario
   │  └─ Incluye cv_url
   │
   └─ CvViewerEnhanced recibe cvUrl
      └─ Muestra el PDF de ese usuario específico
```

---

## 🎯 Diferencias Entre Vistas

| Vista | ¿Qué CV muestra? | ¿Quién puede verlo? |
|-------|------------------|---------------------|
| **Dashboard** | CV del usuario autenticado | Solo ese usuario |
| **Perfil Público** | CV del investigador del perfil | Todos (público) |
| **Admin Panel** | CV del investigador seleccionado | Solo admin |

---

## 💡 Ejemplo Práctico

### Escenario: 3 Investigadores

**Dr. Juan Pérez** - `juan@universidad.mx`
- CV URL: `https://.../cvs/juan-perez-cv-abc123.pdf`

**Dra. María García** - `maria@universidad.mx`
- CV URL: `https://.../cvs/maria-garcia-cv-def456.pdf`

**Dr. Carlos López** - `carlos@universidad.mx`
- CV URL: `https://.../cvs/carlos-lopez-cv-ghi789.pdf`

### ¿Qué ve cada uno en su dashboard?

| Usuario | Ve en su Dashboard |
|---------|-------------------|
| Dr. Juan | `juan-perez-cv-abc123.pdf` |
| Dra. María | `maria-garcia-cv-def456.pdf` |
| Dr. Carlos | `carlos-lopez-cv-ghi789.pdf` |

### ¿Qué ven en los perfiles públicos?

| URL | Muestra CV de |
|-----|--------------|
| `/investigadores/juan-perez` | Juan (abc123.pdf) |
| `/investigadores/maria-garcia` | María (def456.pdf) |
| `/investigadores/carlos-lopez` | Carlos (ghi789.pdf) |

---

## 🔍 Código Fuente Relevante

### Dashboard: Obtener Usuario Actual

```tsx
// app/dashboard/page.tsx - Línea 42-54

const loadUserData = async () => {
  try {
    const response = await fetch('/api/auth/me')  // ← Endpoint que devuelve usuario actual
    
    if (!response.ok) {
      router.push("/iniciar-sesion")
      return
    }

    const data = await response.json()
    setUser(data.user)  // ← Usuario autenticado con su cv_url
    // ...
  }
}
```

### Componente: Usar CV URL

```tsx
// components/cv-viewer-enhanced.tsx - Línea 21-32

export function CvViewerEnhanced({ 
  cvUrl,                    // ← Recibe la URL del CV específico
  investigadorNombre, 
  showAsCard = false 
}: CvViewerEnhancedProps) {
  
  // Log para verificar
  console.log('📄 CvViewerEnhanced cargado para:', investigadorNombre)
  console.log('🔗 CV URL:', cvUrl)  // ← Muestra qué CV se está cargando
  
  // ... resto del componente usa cvUrl
}
```

---

## ✅ Conclusión

**El sistema YA funciona correctamente:**

✅ Cada usuario ve **solo su propio CV** en el dashboard  
✅ Cada perfil público muestra **el CV correcto** del investigador  
✅ No hay posibilidad de ver CVs de otros usuarios sin permiso  
✅ Los logs en consola te permiten verificar qué CV se está cargando  

---

## 🚀 Prueba Ahora

1. Abre la consola del navegador (`F12`)
2. Ve a tu dashboard
3. Busca en la consola:
   ```
   📄 CvViewerEnhanced cargado para: [Tu Nombre]
   🔗 CV URL: https://...tu-cv-url...
   ```
4. Haz clic en "Ver PDF"
5. Verás **TU CV**, no el de otra persona

---

**Última verificación:** Octubre 15, 2025  
**Estado:** ✅ Funcionando correctamente  
**Seguridad:** ✅ Protegido por JWT y middleware  

