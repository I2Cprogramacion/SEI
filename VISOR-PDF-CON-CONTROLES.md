# 🎨 Visor de PDF con Controles Avanzados

## 🎯 Nuevas Funcionalidades Implementadas

Tu visor de CV ahora tiene **controles profesionales** como los de Adobe Reader o Google Drive.

---

## ✨ **Características Principales**

### 1. 🔍 **Controles de Zoom**
- **Acercar (+)**: Aumenta el tamaño hasta 300%
- **Alejar (-)**: Reduce el tamaño hasta 50%
- **Porcentaje actual**: Muestra el zoom actual
- **Botón "100%"**: Restablece el zoom original
- **Botón "Ajustar"**: Ajusta automáticamente al ancho

### 2. 📄 **Navegación de Páginas**
- **Anterior (←)**: Va a la página anterior
- **Siguiente (→)**: Va a la página siguiente
- **Input numérico**: Escribe el número de página y presiona Enter
- **Contador**: "Página X de Y"
- **Auto-deshabilitado**: Los botones se deshabilitan en la primera/última página

### 3. 🔄 **Rotación**
- **Botón de rotar**: Gira el PDF 90° cada vez
- Útil para PDFs en formato horizontal

### 4. 🖥️ **Pantalla Completa**
- **Maximizar**: Expande el modal a 98% de la pantalla
- **Minimizar**: Vuelve al tamaño normal (95vh)

### 5. ⬇️ **Otras Acciones**
- **Descargar**: Descarga el PDF a tu computadora
- **Nueva pestaña**: Abre el PDF en el navegador
- **Vista previa**: Muestra el PDF en la tarjeta (iframe simple)

---

## 🎨 **Interfaz del Visor**

```
┌─────────────────────────────────────────────────────────────────┐
│ Curriculum Vitae                    [⬇️ Descargar] [🔗] [⛶]    │
│ Nombre del Investigador                                         │
├─────────────────────────────────────────────────────────────────┤
│ [←] [Input: 1] de 5 [→]  [🔍-] 100% [🔍+]  [🔄] [📐] [100%]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                      [PDF AQUÍ]                                │
│                   Con zoom, rotación                           │
│                   y navegación                                 │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ Página 1 de 5                    Zoom: 100% | Rotación: 0°    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🕹️ **Cómo Usar los Controles**

### **Barra de Navegación (Superior Izquierda)**

| Botón | Acción | Atajo |
|-------|--------|-------|
| `←` | Página anterior | |
| Input numérico | Ir a página específica | Escribe y Enter |
| `→` | Página siguiente | |

**Ejemplo:**
```
[←] [2] de 5 [→]
```
- Click en `←` → Va a página 1
- Escribe `5` en el input → Va a página 5
- Click en `→` → Va a página 6 (si existe)

---

### **Controles de Zoom (Centro)**

| Botón | Acción | Resultado |
|-------|--------|-----------|
| 🔍- | Alejar | Reduce 25% |
| `X%` | Muestra zoom actual | Solo lectura |
| 🔍+ | Acercar | Aumenta 25% |

**Niveles de zoom:**
- Mínimo: 50%
- Por defecto: 100%
- Máximo: 300%

**Ejemplo de uso:**
```
Zoom actual: 100%
Click en 🔍+ → 125%
Click en 🔍+ → 150%
Click en 🔍+ → 175%
Click en 🔍- → 150%
```

---

### **Controles Adicionales (Derecha)**

| Botón | Icono | Acción |
|-------|-------|--------|
| Rotar | 🔄 | Gira 90° en sentido horario |
| Ajustar | 📐 | Ajusta a 150% de ancho |
| 100% | `100%` | Restablece zoom y rotación |

**Rotación:**
```
0° → 90° → 180° → 270° → 0° (ciclo)
```

---

## 📊 **Barra de Información (Inferior)**

Muestra en tiempo real:
- **Izquierda**: Página actual de total (ej: "Página 2 de 5")
- **Derecha**: Zoom y rotación (ej: "Zoom: 125% | Rotación: 90°")

---

## 🧪 **Cómo Probarlo**

### 1️⃣ **Iniciar el Servidor**
```bash
npm run dev
```

### 2️⃣ **Ir al Dashboard**
```
http://localhost:3000/dashboard
```

### 3️⃣ **Abrir el Visor**
1. Si tienes CV, verás la tarjeta con vista previa
2. Click en **"Ver PDF"** (botón azul)
3. Se abrirá el modal con TODOS los controles

### 4️⃣ **Prueba los Controles**

**Navegación:**
- Click en `→` para ir a la siguiente página
- Escribe `3` en el input y presiona Enter
- Click en `←` para volver

**Zoom:**
- Click en 🔍+ varias veces (hasta 300%)
- Click en 🔍- para reducir
- Click en "100%" para restablecer

**Rotación:**
- Click en 🔄 para girar
- Click 4 veces para dar la vuelta completa

**Pantalla Completa:**
- Click en ⛶ para maximizar
- Click de nuevo para minimizar

---

## 🎨 **Estados de los Botones**

### **Botones Deshabilitados**

Se deshabilitan automáticamente cuando no se pueden usar:

```
Página 1 de 5:
[← DESHABILITADO] [1] de 5 [→ ACTIVO]

Página 5 de 5:
[← ACTIVO] [5] de 5 [→ DESHABILITADO]

Zoom al 50%:
[🔍- DESHABILITADO] 50% [🔍+ ACTIVO]

Zoom al 300%:
[🔍- ACTIVO] 300% [🔍+ DESHABILITADO]
```

---

## 🔧 **Comparación: Antes vs Ahora**

| Característica | Antes | Ahora |
|----------------|-------|-------|
| **Zoom** | ❌ No | ✅ 50% - 300% |
| **Navegación** | ❌ No | ✅ Sí (←/→ + input) |
| **Rotación** | ❌ No | ✅ Sí (90°, 180°, 270°) |
| **Contador de páginas** | ❌ No | ✅ Sí (Pág X de Y) |
| **Ajustar tamaño** | ❌ No | ✅ Sí (botón "Ajustar") |
| **Restablecer vista** | ❌ No | ✅ Sí (botón "100%") |
| **Pantalla completa** | ⚠️ Básica | ✅ Mejorada (98vh) |
| **Barra de herramientas** | ❌ No | ✅ Completa |
| **Vista previa** | ✅ Sí (iframe) | ✅ Mejorada |
| **Modal con PDF.js** | ❌ No | ✅ Sí |

---

## 💡 **Tips de Uso**

### **Para Leer Documentos Largos**
1. Usa las flechas `←` `→` para navegar rápidamente
2. O escribe el número de página directamente

### **Para Ver Detalles Pequeños**
1. Click en 🔍+ varias veces hasta 200%-300%
2. Usa el scroll del mouse para moverte por el documento

### **Para PDFs en Horizontal**
1. Click en 🔄 para rotar 90°
2. Ajusta el zoom con 🔍+ si es necesario

### **Para Pantalla Completa**
1. Click en ⛶ (maximizar)
2. Usa F11 en el navegador para pantalla completa real

### **Para Restablecer Todo**
1. Click en "100%" restablece zoom y rotación
2. O recarga el PDF cerrando y abriendo el modal

---

## 📱 **Responsive**

El visor se adapta a diferentes tamaños de pantalla:

### Desktop (>1024px)
- Barra de herramientas en una sola línea
- Todos los controles visibles
- Modal de 95vh (7xl)

### Tablet (768px-1024px)
- Barra de herramientas en dos líneas
- Controles agrupados
- Modal adaptado

### Mobile (<768px)
- Barra de herramientas en 3 líneas
- Controles apilados verticalmente
- Modal a 90vw

---

## 🐛 **Troubleshooting**

### El PDF no se carga
**Causa:** PDF.js no puede acceder al archivo
**Solución:**
1. Verifica que `cv_url` sea válida
2. Verifica CORS (Vercel Blob es compatible)
3. Usa "Nueva pestaña" como fallback

### Los controles no responden
**Causa:** El PDF aún está cargando
**Solución:**
- Espera a que aparezca "Página 1 de X"
- Verás un spinner mientras carga

### El zoom está muy limitado
**Esto es normal:**
- Mínimo: 50% (para ver el documento completo)
- Máximo: 300% (más puede causar problemas de rendimiento)

---

## 🎯 **Tecnologías Usadas**

- **react-pdf**: Renderizado de PDFs en React
- **pdfjs-dist**: Motor de PDF.js de Mozilla
- **shadcn/ui**: Componentes de UI
- **Lucide React**: Iconos

---

## ✅ **Checklist de Funcionalidades**

Marca lo que probaste:

- [ ] Navegación entre páginas (←/→)
- [ ] Ir a página específica (input)
- [ ] Zoom in (+)
- [ ] Zoom out (-)
- [ ] Rotar PDF (🔄)
- [ ] Ajustar a ancho
- [ ] Restablecer vista (100%)
- [ ] Pantalla completa
- [ ] Descargar PDF
- [ ] Abrir en nueva pestaña
- [ ] Vista previa en tarjeta
- [ ] Cambio de páginas con teclado (si lo implementamos)

---

## 🚀 **Próximas Mejoras Posibles**

Ideas para el futuro:
- [ ] Atajos de teclado (←/→ para páginas)
- [ ] Búsqueda de texto en el PDF
- [ ] Modo de presentación
- [ ] Imprimir directamente
- [ ] Selección de texto
- [ ] Anotaciones/comentarios
- [ ] Comparar dos PDFs lado a lado
- [ ] Vista de miniaturas de páginas

---

**Fecha:** Octubre 15, 2025  
**Componente:** `cv-viewer-with-controls.tsx`  
**Estado:** ✅ Completado y funcionando  
**Linter:** ✅ Sin errores  

🎉 **¡Disfruta tu nuevo visor de PDF profesional!** 🎉

