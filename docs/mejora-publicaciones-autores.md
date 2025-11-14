# Mejora del Sistema de Publicaciones - Integración de Autores

## Resumen
Se implementó una mejora integral al módulo de publicaciones para conectar los autores de publicaciones con sus perfiles de investigadores, incluyendo avatares, enlaces directos a perfiles, y páginas de detalle completas.

## Fecha de Implementación
${new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}

## Archivos Creados

### 1. `/app/api/buscar-investigador-por-nombre/route.ts`
**Propósito**: API endpoint para búsqueda difusa de investigadores por nombre

**Características**:
- Búsqueda con `ILIKE` para coincidencias parciales
- Ordenamiento por relevancia (coincidencia exacta > comienza con > contiene)
- Límite de 10 resultados
- Solo devuelve investigadores activos
- Retorna: id, clerkUserId, nombreCompleto, slug, fotografiaUrl, institucion

**Uso**:
```typescript
GET /api/buscar-investigador-por-nombre?nombre=Juan%20Perez
```

**Respuesta**:
```json
{
  "investigadores": [
    {
      "id": 1,
      "clerkUserId": "user_xxx",
      "nombreCompleto": "Juan Pérez García",
      "slug": "juan-perez-garcia",
      "fotografiaUrl": "https://...",
      "institucion": "Universidad Autónoma de Chihuahua"
    }
  ]
}
```

---

### 2. `/components/author-avatar-group.tsx`
**Propósito**: Componente reutilizable para mostrar avatares de autores con enlaces a perfiles

**Props**:
- `authors`: string[] | string - Lista de nombres de autores o string separado por comas
- `maxVisible`: number (default: 3) - Máximo de avatares visibles
- `size`: 'sm' | 'md' | 'lg' (default: 'md') - Tamaño de los avatares
- `showNames`: boolean (default: false) - Mostrar nombres debajo de avatares

**Características**:
- Búsqueda automática de perfiles de investigadores
- Avatares circulares con overlap (-space-x-2)
- Anillo azul para perfiles verificados (ring-2 ring-blue-500)
- Tooltips con información del investigador
- Enlaces clicables a perfiles (/investigadores/[slug])
- Badge "+X más" para autores ocultos
- Estado de carga con skeletons animados
- Fallback graceful para autores sin perfil

**Uso**:
```tsx
<AuthorAvatarGroup 
  authors="Juan Pérez, María González, Pedro López"
  maxVisible={3}
  size="md"
  showNames={true}
/>
```

---

### 3. `/app/publicaciones/[id]/page.tsx`
**Propósito**: Página de detalle individual de publicaciones

**Características**:
- **Hero Section**: Título, año, badges (categoría, acceso, tipo)
- **Layout de 2 columnas** (grid lg:grid-cols-3):
  - **Columna izquierda (2/3)**:
    - Card de Detalles Bibliográficos (revista, editorial, volumen, páginas, ISSN, ISBN)
    - Card de Resumen (abstract completo)
    - Card de Palabras Clave (badges con términos)
  - **Columna derecha (1/3)**:
    - Card de Autores (con AuthorAvatarGroup)
    - Card de Institución
    - Card de Enlaces (DOI, PDF, perfil del investigador)

**Animaciones**:
- Entrada escalonada de cards (animate-in slide-in-from-left/right)
- Delays incrementales (duration-500 delay-100/150)

**SEO**:
- Metadata dinámica con título y descripción
- Open Graph tags preparados

**Navegación**:
- Botón "Volver a publicaciones" con icono
- Enlaces a perfiles de autores
- Enlaces externos a DOI, PDF

---

## Archivos Modificados

### 1. `/components/publicaciones-list.tsx`
**Cambios**:
- ✅ Agregado import de `AuthorAvatarGroup`, `Eye`, `Link`, `CardFooter`
- ✅ Reemplazado texto plano de autores con `<AuthorAvatarGroup>`
- ✅ Agregado botón "Ver detalles" con icono Eye
- ✅ Link a `/publicaciones/[id]` en cada card

**Antes**:
```tsx
{pub.autor && (
  <p className="text-sm text-blue-700 mb-3 font-medium">
    <span className="text-blue-500">Autores:</span> {pub.autor}
  </p>
)}
```

**Después**:
```tsx
{pub.autor && (
  <div className="mb-3">
    <AuthorAvatarGroup 
      authors={pub.autor}
      maxVisible={3}
      size="sm"
    />
  </div>
)}
```

---

### 2. `/app/publicaciones/page.tsx`
**Cambios**:
- ✅ Agregado import de `AuthorAvatarGroup`, `Eye`
- ✅ Reemplazado display de autores con `<AuthorAvatarGroup>` en CardDescription
- ✅ Reorganizado CardFooter con botones:
  - "Ver detalles" (nuevo)
  - "Abrir publicación" (renombrado de "Ver publicación")
  - "Citar" (existente)
  - "Editar" (condicional para dueño)
- ✅ Movido info de uploader a la izquierda del footer

**Antes**:
```tsx
<div className="flex items-center gap-2">
  <User className="h-4 w-4" />
  <span>{publicacion.autores.join(", ")}</span>
</div>
```

**Después**:
```tsx
<div className="flex items-start gap-2">
  <User className="h-4 w-4 mt-1" />
  <div className="min-w-0 flex-1">
    <AuthorAvatarGroup 
      authors={publicacion.autores}
      maxVisible={3}
      size="sm"
    />
  </div>
</div>
```

---

## Flujo de Datos

### 1. Carga de Publicación
```
Usuario → /publicaciones/[id] → getPublicacion(id)
  ↓
  Database Query (publicaciones JOIN investigadores)
  ↓
  Render página con metadatos y contenido
```

### 2. Búsqueda de Autores
```
AuthorAvatarGroup render
  ↓
  useEffect: Parsear autores (split por , o ;)
  ↓
  Promise.all: fetch /api/buscar-investigador-por-nombre para cada autor
  ↓
  Map: autor nombre → perfil investigador
  ↓
  Render avatares con links o fallback
```

### 3. Navegación
```
/publicaciones (lista)
  ↓ Click "Ver detalles" o avatar de autor
  ↓
/publicaciones/[id] (detalle) O /investigadores/[slug] (perfil)
  ↓ Click en autor del detalle
  ↓
/investigadores/[slug]/publicaciones (publicaciones del autor)
```

---

## Diseño Visual

### Paleta de Colores
- **Primario**: `blue-500`, `blue-600`, `blue-700`
- **Acentos**: `blue-50`, `blue-100` (fondos claros)
- **Verificados**: `ring-2 ring-blue-500 ring-offset-1`
- **Badges**: 
  - Categoría: `bg-blue-100 text-blue-800`
  - Acceso abierto: `bg-green-100 text-green-800`
  - Acceso cerrado: `bg-red-100 text-red-800`

### Componentes UI
- **Avatares**: Circulares, overlap de -8px (-space-x-2)
- **Tooltips**: Información emergente con nombre, institución, indicador de perfil
- **Badges**: Redondeados, con sombra sutil
- **Cards**: Bordes redondeados (rounded-xl), sombra en hover
- **Buttons**: Outline con hover azul claro

---

## Patrón de Referencias

Esta implementación sigue el patrón establecido en:
- `/app/instituciones/[id]/page.tsx` (diseño de detalle)
- `/components/investigador-autocomplete.tsx` (búsqueda de perfiles)

---

## Testing Sugerido

### Casos de Prueba

1. **Búsqueda de autor existente**
   - Input: "Juan Pérez"
   - Esperado: Avatar con foto, tooltip con institución, link funcional

2. **Búsqueda de autor sin perfil**
   - Input: "Autor Externo"
   - Esperado: Avatar con iniciales, tooltip solo con nombre, sin link

3. **Lista con muchos autores**
   - Input: "Autor1, Autor2, Autor3, Autor4, Autor5"
   - Esperado: 3 avatares + badge "+2 más"

4. **Página de detalle**
   - Navegar a `/publicaciones/1`
   - Verificar: Todos los campos se muestran correctamente
   - Verificar: Links a DOI, PDF funcionan
   - Verificar: Click en avatar lleva a perfil

5. **Búsqueda difusa**
   - Input: "juan" (minúsculas)
   - Esperado: Coincide con "Juan Pérez" (mayúsculas)

---

## Mejoras Futuras

### Corto Plazo
- [ ] Cache de búsquedas de autores (evitar llamadas repetidas)
- [ ] Indicador de co-autores (frecuencia de colaboración)
- [ ] Filtro por autor en página de publicaciones

### Mediano Plazo
- [ ] Gráfico de red de colaboración entre autores
- [ ] Exportar lista de publicaciones a BibTeX
- [ ] Sistema de recomendación de publicaciones relacionadas

### Largo Plazo
- [ ] Integración con ORCID para validación de autorías
- [ ] Importación masiva desde ORCID, Google Scholar, Scopus
- [ ] Estadísticas de impacto (citas, h-index)

---

## Dependencias

### Nuevas Dependencias
Ninguna - se utilizaron componentes existentes de shadcn/ui:
- `Avatar`, `AvatarFallback`, `AvatarImage`
- `Badge`
- `Tooltip`, `TooltipContent`, `TooltipProvider`, `TooltipTrigger`
- `Card`, `CardContent`, `CardDescription`, `CardHeader`, `CardTitle`
- `Button`

### APIs Utilizadas
- `/api/buscar-investigador-por-nombre` (nueva)
- `/api/publicaciones` (existente)
- `/api/publicaciones/[id]` (existente)

---

## Notas de Implementación

### Base de Datos
- Query en `/app/publicaciones/[id]/page.tsx` usa `LEFT JOIN` para obtener datos del investigador que subió la publicación
- Campo `autor` en tabla `publicaciones` es texto libre (no FK)
- Búsqueda de autores es "best effort" - puede no encontrar coincidencias exactas

### Performance
- `AuthorAvatarGroup` hace fetch paralelo con `Promise.all`
- Máximo 10 resultados por búsqueda de nombre
- Solo investigadores activos son buscados

### Responsive Design
- Avatares mantienen tamaño en móvil y desktop
- Layout de detalle cambia de 1 columna (móvil) a 2 columnas (desktop)
- Tooltips se ajustan automáticamente

---

## Autor
Sistema de Ecosistema de Investigación (SEI)

## Versión
1.0.0 - Implementación inicial de integración de autores
