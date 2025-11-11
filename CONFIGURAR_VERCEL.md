# 🚀 CONFIGURAR CLERK EN VERCEL (PRODUCCIÓN)

## ✅ Push completado: `9fb0650`

Vercel comenzará a desplegar automáticamente en unos segundos.

---

## 🔑 PASO 1: Configurar Variables de Entorno en Vercel

### Ve al Dashboard de Vercel:
1. https://vercel.com/
2. Selecciona tu proyecto **SEI**
3. Ve a **Settings** → **Environment Variables**

---

### Agrega estas 6 variables (COPY-PASTE):

#### **Variable 1:**
```
Name: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
Value: [TU_CLAVE_pk_live_AQUI]
```
- ✅ Marca: **Production**, **Preview**, **Development**

#### **Variable 2:**
```
Name: CLERK_SECRET_KEY  
Value: [TU_CLAVE_sk_live_AQUI]
```
- ✅ Marca: **Production**, **Preview**, **Development**

#### **Variable 3:**
```
Name: NEXT_PUBLIC_CLERK_SIGN_IN_URL
Value: /iniciar-sesion
```
- ✅ Marca: **Production**, **Preview**, **Development**

#### **Variable 4:**
```
Name: NEXT_PUBLIC_CLERK_SIGN_UP_URL
Value: /registro
```
- ✅ Marca: **Production**, **Preview**, **Development**

#### **Variable 5:**
```
Name: NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL
Value: /dashboard
```
- ✅ Marca: **Production**, **Preview**, **Development**

#### **Variable 6:**
```
Name: NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL
Value: /registro/exito
```
- ✅ Marca: **Production**, **Preview**, **Development**

---

## 🔄 PASO 2: Redeployar (IMPORTANTE)

Después de agregar las variables:

1. Ve a **Deployments**
2. Click en el deployment más reciente
3. Click en **"..."** (tres puntos)
4. Click en **"Redeploy"**
5. ✅ Confirma "Redeploy"

**Esto es NECESARIO** para que Vercel use las nuevas variables.

---

## ⚙️ PASO 3: Configurar Domain en Clerk

1. Ve a: https://dashboard.clerk.com/
2. Selecciona tu aplicación
3. Ve a **"Domains"**
4. Agrega tu dominio de producción:
   - `sei-chih.com.mx`
   - O tu dominio de Vercel: `tu-app.vercel.app`
5. ✅ Guarda los cambios

---

## 🧪 PASO 4: Probar en Producción

Una vez que Vercel termine de desplegar (~2 minutos):

1. Ve a: `https://sei-chih.com.mx/iniciar-sesion`
2. Abre la consola del navegador (F12)
3. Verifica:
   - ✅ NO hay error 401
   - ✅ NO aparece "Clerk is in keyless mode"
   - ✅ Campo de email VACÍO (sin CURP)
   - ✅ Logo y diseño se ven bien

---

## 🐛 DEBUGGING

### Si ves error 401:
- Verifica que las claves en Vercel sean las de **producción** (pk_live, sk_live)
- Asegúrate de haber redesplegado DESPUÉS de agregar las variables
- Limpia caché del navegador

### Si aparece CURP:
En la consola del navegador:
```javascript
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Si no carga:
- Revisa los logs en Vercel: **Deployments** → **[último deployment]** → **Runtime Logs**
- Comparte los errores que veas

---

## ✅ Checklist Final:

- [ ] 6 variables agregadas en Vercel
- [ ] Todas marcadas para Production
- [ ] Redesplegado después de agregar variables
- [ ] Dominio configurado en Clerk Dashboard
- [ ] Probado en producción (sin error 401)
- [ ] Login funciona correctamente
- [ ] Campo de email vacío

---

## 📊 Estado del Deploy:

**Commit:** `9fb0650`  
**Rama:** `main`  
**Archivos modificados:**
- ✅ Login mejorado con limpieza agresiva
- ✅ Configuración Clerk agregada
- ✅ Instrucciones completas

---

## 🎯 Próximo Paso:

**1. Configura las 6 variables en Vercel AHORA**  
**2. Redespliega**  
**3. Prueba en producción**  

¡Avísame cuando esté listo y probamos juntos!

