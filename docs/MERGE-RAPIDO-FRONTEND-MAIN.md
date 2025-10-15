# ⚡ Guía Rápida: Merge Frontend → Main

## 🎯 Para hacer el merge en 3 minutos

---

## ✅ Paso 1: Preparación (30 segundos)

```powershell
# Ver en qué rama estás
git branch

# Si hay cambios sin guardar, guárdalos
git add .
git commit -m "feat: Visor de PDF mejorado con múltiples métodos"
```

---

## ✅ Paso 2: Merge (1 minuto)

```powershell
# Cambiar a main
git checkout main

# Hacer el merge
git merge frontend -m "merge: Integrar visor de PDF mejorado desde frontend"
```

**Si hay conflictos:**
1. Abre los archivos marcados en VS Code
2. Busca `<<<<<<<` y `>>>>>>>`
3. Elige "Accept Incoming" (para quedarte con frontend)
4. Guarda y haz commit:
   ```powershell
   git add .
   git commit -m "merge: Resolver conflictos"
   ```

---

## ✅ Paso 3: Verificar (1 minuto)

```powershell
# Instalar dependencias (por si acaso)
npm install

# Iniciar servidor
npm run dev
```

**Prueba rápida:**
1. Ve a http://localhost:3000/dashboard
2. Verifica que el visor de PDF funciona
3. Haz clic en "Ver PDF"
4. Prueba los métodos de visualización

**Si todo funciona → ¡Listo!** 🎉

---

## 📤 Paso 4: Subir (30 segundos) - Opcional

```powershell
# Subir main actualizado
git push origin main
```

---

## 🔙 Si Algo Sale Mal

```powershell
# Deshacer el merge
git reset --hard HEAD~1

# Volver a frontend
git checkout frontend
```

---

## 📝 Resumen de Comandos

```powershell
# Todo en uno (si no hay conflictos)
git add .
git commit -m "feat: Visor de PDF mejorado"
git checkout main
git merge frontend -m "merge: Integrar visor de PDF desde frontend"
npm install
npm run dev
```

---

**Tiempo total:** ~3 minutos  
**Riesgo:** Bajo  
**Recomendación:** Haz un backup antes (copia la carpeta del proyecto)  

