# 🚨 ERROR: Clerk sin configurar

## Problema Actual:
```
ERROR [fapiClient]: request failed {"method":"GET","path":"/environment","status":401}
Unable to authenticate this browser for your development instance
```

Esto significa que **NO TIENES las claves de Clerk configuradas**.

---

## ✅ SOLUCIÓN PASO A PASO:

### **PASO 1: Obtén tus claves de Clerk**

1. Ve a: **https://dashboard.clerk.com/**
2. Inicia sesión (o crea una cuenta si no tienes)
3. Crea una nueva aplicación o selecciona una existente
4. Ve a la sección **"API Keys"**
5. Copia estas dos claves:
   - **Publishable key** (empieza con `pk_test_...`)
   - **Secret key** (empieza con `sk_test_...`)

---

### **PASO 2: Edita el archivo `.env.local`**

Abre el archivo `.env.local` en la raíz del proyecto y REEMPLAZA estas líneas:

```env
# ❌ ANTES (ejemplo/placeholder):
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ✅ DESPUÉS (tus claves reales):
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_TU_CLAVE_REAL_AQUÍ
CLERK_SECRET_KEY=sk_test_TU_CLAVE_SECRETA_AQUÍ
```

**IMPORTANTE:** Las claves deben ser REALES, no los ejemplos que tienen muchas 'x'.

---

### **PASO 3: Reinicia el servidor COMPLETAMENTE**

```bash
# 1. Detén el servidor (Ctrl + C)
# 2. Espera 2 segundos
# 3. Reinicia:
npm run dev
```

**MUY IMPORTANTE:** Debes reiniciar DESPUÉS de cambiar `.env.local`

---

### **PASO 4: Limpia el navegador**

Abre la consola del navegador (F12) y ejecuta:

```javascript
localStorage.clear();
sessionStorage.clear();
document.cookie.split(";").forEach(c => {
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});
location.reload();
```

---

### **PASO 5: Prueba de nuevo**

Ve a: `http://localhost:3000/iniciar-sesion`

**Deberías ver:**
- ✅ NO más errores 401 en consola
- ✅ El formulario funciona correctamente
- ✅ Campo de email VACÍO (sin CURP)

---

## 📝 Verificación

### ✅ Checklist:

- [ ] Tengo cuenta en Clerk (https://dashboard.clerk.com)
- [ ] Copié la `Publishable key` (pk_test_...)
- [ ] Copié la `Secret key` (sk_test_...)
- [ ] Actualicé `.env.local` con las claves REALES
- [ ] Reinicié el servidor completamente
- [ ] Limpié el navegador (localStorage, cookies)
- [ ] NO hay error 401 en consola
- [ ] Iniciar sesión funciona

---

## 🆘 Si todavía falla:

1. **Verifica que las claves sean correctas:**
   - La Publishable key debe empezar con `pk_test_`
   - La Secret key debe empezar con `sk_test_`

2. **Asegúrate de que `.env.local` esté en la RAÍZ del proyecto:**
   ```
   SEI/
   ├── .env.local          ← AQUÍ
   ├── package.json
   ├── app/
   └── ...
   ```

3. **Verifica que el archivo se llame EXACTAMENTE** `.env.local` (no `.env.local.txt`)

4. **Comparte las primeras letras de tus claves** (sin revelar la clave completa):
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_ABC...
   CLERK_SECRET_KEY=sk_test_XYZ...
   ```

---

## 🎯 Resultado Esperado:

Una vez configurado correctamente:
```
✅ Servidor inicia sin errores
✅ Login funciona perfectamente
✅ Campo de email vacío
✅ Puede registrar usuarios
✅ Autenticación completa funcionando
```

