# 🔀 Guía: Combinar Frontend con Main de Forma Segura

## 🎯 Objetivo
Llevar todos los cambios del visor de PDF de la rama `frontend` a `main` sin romper nada.

---

## ⚠️ IMPORTANTE: Antes de Empezar

### 1. **Haz un Backup** (Por Seguridad)
```powershell
# Navega a la carpeta padre
cd ..

# Copia todo el proyecto
Copy-Item -Path "researcher-platform" -Destination "researcher-platform-backup-$(Get-Date -Format 'yyyy-MM-dd-HHmm')" -Recurse

# Vuelve al proyecto
cd researcher-platform
```

**Ahora tienes un backup completo** ✅

---

## 📋 Estrategia Recomendada

Vamos a usar una estrategia de **3 pasos** para minimizar riesgos:

1. ✅ **Verificar el estado actual**
2. ✅ **Actualizar y preparar main**
3. ✅ **Hacer el merge con precaución**

---

## 🚀 Paso 1: Verificar Estado Actual

### 1.1 Ver en qué rama estás
```powershell
git branch
```

**Deberías ver:**
```
* frontend    ← (asterisco indica rama actual)
  main
```

### 1.2 Ver cambios pendientes
```powershell
git status
```

**Si hay archivos modificados:**
```powershell
# Opción A: Guardarlos (commit)
git add .
git commit -m "feat: Visor de PDF mejorado con múltiples métodos de visualización"

# Opción B: Guardarlos temporalmente (stash)
git stash save "Cambios del visor de PDF"
```

---

## 🔄 Paso 2: Actualizar Main

### 2.1 Cambiar a la rama main
```powershell
git checkout main
```

### 2.2 Ver qué hay en main
```powershell
git log --oneline -5
```

### 2.3 Actualizar main desde el remoto (si existe)
```powershell
# Solo si tienes un repositorio remoto (GitHub, GitLab, etc.)
git pull origin main
```

**Si dice "Already up to date" → Perfecto ✅**

---

## 🎯 Paso 3: Hacer el Merge (Opción Segura)

Tienes **3 opciones**, de más segura a menos segura:

### ✅ **Opción 1: Merge con Revisión** (RECOMENDADO)

```powershell
# Estando en main
git merge frontend --no-ff --no-commit
```

**¿Qué hace esto?**
- `--no-ff`: Crea un commit de merge (mantiene historial)
- `--no-commit`: NO hace el merge automáticamente, te deja revisar

**Luego revisa:**
```powershell
git status
```

**Si todo se ve bien:**
```powershell
git commit -m "merge: Integrar visor de PDF mejorado desde frontend"
```

**Si hay conflictos:**
- Vete al **Paso 4: Resolver Conflictos** (abajo)

---

### ✅ **Opción 2: Merge Directo** (MÁS RÁPIDO)

```powershell
# Estando en main
git merge frontend -m "merge: Integrar visor de PDF mejorado desde frontend"
```

**¿Qué hace esto?**
- Hace el merge automáticamente
- Si hay conflictos, te avisa

---

### ✅ **Opción 3: Rebase** (MÁS LIMPIO, PERO MÁS COMPLEJO)

```powershell
# Volver a frontend
git checkout frontend

# Rebase sobre main
git rebase main

# Si hay conflictos, resuélvelos

# Volver a main
git checkout main

# Merge rápido
git merge frontend --ff-only
```

**⚠️ Solo usa esta opción si sabes lo que haces**

---

## 🛠️ Paso 4: Resolver Conflictos (Si Aparecen)

### 4.1 Ver qué archivos tienen conflictos
```powershell
git status
```

**Verás algo como:**
```
both modified: app/dashboard/page.tsx
both modified: components/cv-viewer.tsx
```

### 4.2 Abrir archivo con conflicto en VS Code

Busca líneas como:
```tsx
<<<<<<< HEAD
// Código de main
=======
// Código de frontend
>>>>>>> frontend
```

### 4.3 Resolver el conflicto

**Opciones:**
1. **Mantener cambios de frontend** (lo que queremos):
   - Elimina las líneas de `main`
   - Elimina los marcadores `<<<<<<<`, `=======`, `>>>>>>>`
   - Deja solo el código de `frontend`

2. **Mantener ambos** (si es necesario):
   - Combina ambos códigos manualmente
   - Elimina los marcadores

3. **Usar VS Code**:
   - VS Code detecta conflictos automáticamente
   - Te muestra botones: "Accept Current" / "Accept Incoming" / "Accept Both"
   - Usa "Accept Incoming" para quedarte con frontend

### 4.4 Marcar como resuelto
```powershell
git add .
git commit -m "merge: Resolver conflictos del visor de PDF"
```

---

## 🧪 Paso 5: Probar que Todo Funciona

### 5.1 Verificar que estás en main
```powershell
git branch
# Debería mostrar: * main
```

### 5.2 Instalar dependencias (por si acaso)
```powershell
npm install
```

### 5.3 Iniciar el servidor
```powershell
npm run dev
```

### 5.4 Probar las funcionalidades clave

| Prueba | URL | ¿Funciona? |
|--------|-----|-----------|
| Home | http://localhost:3000 | [ ] |
| Login | http://localhost:3000/iniciar-sesion | [ ] |
| Dashboard | http://localhost:3000/dashboard | [ ] |
| Visor de PDF | Dashboard → Ver PDF | [ ] |
| Perfil público | http://localhost:3000/investigadores/[slug] | [ ] |
| Admin panel | http://localhost:3000/admin | [ ] |

**Si TODO funciona → ¡Merge exitoso!** 🎉

---

## 📤 Paso 6: Subir Cambios al Remoto (Opcional)

### 6.1 Verificar remoto
```powershell
git remote -v
```

### 6.2 Subir main actualizado
```powershell
git push origin main
```

### 6.3 Subir frontend también (para mantenerlo actualizado)
```powershell
git checkout frontend
git merge main
git push origin frontend
```

---

## 🔙 Paso 7: Si Algo Sale Mal (Plan B)

### Opción 1: Deshacer el Merge (antes de push)
```powershell
# Volver al estado anterior
git reset --hard HEAD~1

# O volver a un commit específico
git log --oneline -5
git reset --hard [hash-del-commit]
```

### Opción 2: Restaurar desde Backup
```powershell
# Ir a la carpeta padre
cd ..

# Ver backups disponibles
dir | Where-Object {$_.Name -like "*backup*"}

# Restaurar desde backup
Remove-Item -Recurse -Force researcher-platform
Copy-Item -Path "researcher-platform-backup-[fecha]" -Destination "researcher-platform" -Recurse
```

---

## 📊 Diagrama del Proceso

```
ANTES:
┌─────────────┐
│   main      │ ← Versión antigua (sin visor mejorado)
└─────────────┘
       │
       ├─────────────┐
       │             │
┌─────────────┐ ┌──────────────┐
│   main      │ │  frontend    │ ← Visor de PDF mejorado
└─────────────┘ └──────────────┘

DESPUÉS del Merge:
┌──────────────────────────┐
│   main (actualizado)     │ ← Tiene todo de frontend
└──────────────────────────┘
       │
       ├─────────────┐
       │             │
┌─────────────┐ ┌──────────────┐
│   main      │ │  frontend    │ ← Ambos iguales ahora
└─────────────┘ └──────────────┘
```

---

## ✅ Checklist Completo

Marca cada paso cuando lo completes:

### Preparación
- [ ] Backup creado
- [ ] Guardé cambios pendientes (commit o stash)
- [ ] Estoy en la rama correcta

### Merge
- [ ] Cambié a main (`git checkout main`)
- [ ] Actualicé main (`git pull origin main`)
- [ ] Hice el merge (`git merge frontend`)
- [ ] Resolví conflictos (si hubo)
- [ ] Commité los cambios

### Verificación
- [ ] Instalé dependencias (`npm install`)
- [ ] Servidor inicia sin errores
- [ ] Home funciona
- [ ] Login funciona
- [ ] Dashboard funciona
- [ ] Visor de PDF funciona
- [ ] Perfiles públicos funcionan

### Finalización
- [ ] Subí cambios al remoto (opcional)
- [ ] Eliminé backup (opcional, solo si todo funciona)

---

## 🎯 Comandos Resumidos (Opción Rápida)

**Si estás seguro y quieres ir directo:**

```powershell
# 1. Guardar cambios en frontend
git add .
git commit -m "feat: Visor de PDF mejorado"

# 2. Cambiar a main
git checkout main

# 3. Merge
git merge frontend -m "merge: Integrar visor de PDF desde frontend"

# 4. Probar
npm install
npm run dev

# 5. Si funciona, push
git push origin main
```

---

## ❓ Preguntas Frecuentes

### ¿Qué pasa si hay conflictos?
- Tranquilo, es normal
- Git te marca exactamente dónde están
- Resuélvelos uno por uno
- Usa VS Code, te ayuda visualmente

### ¿Puedo deshacer el merge?
- Sí, antes de hacer push: `git reset --hard HEAD~1`
- Después de push: `git revert HEAD`

### ¿Se perderá mi rama frontend?
- No, las ramas no se eliminan automáticamente
- Puedes seguir trabajando en frontend si quieres

### ¿Debo eliminar frontend después?
- No es necesario
- Puedes mantenerla para desarrollo futuro
- O eliminarla: `git branch -d frontend`

---

## 📚 Recursos Útiles

- **Ver historial:** `git log --oneline --graph --all`
- **Ver diferencias:** `git diff main frontend`
- **Ver archivos que cambiaron:** `git diff --name-only main frontend`

---

## 🎊 Siguiente Paso

Una vez que hayas hecho el merge exitosamente:

1. ✅ Verifica que todo funciona en main
2. ✅ Considera hacer un release/tag
3. ✅ Despliega a producción (si aplica)

---

**Fecha:** Octubre 15, 2025  
**Objetivo:** Merge seguro de frontend a main  
**Componente afectado:** Visor de PDF mejorado  
**Riesgo:** Bajo (con backup y revisión)  

