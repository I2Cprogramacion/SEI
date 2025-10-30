# 🚨 DIAGNÓSTICO: Datos NO se guardan en Neon

## 🔍 **PROBLEMA IDENTIFICADO**

Los datos del registro NO se están guardando en la base de datos Neon PostgreSQL.

---

## 🎯 **CAUSA RAÍZ**

**Problema:** Hay un **DESAJUSTE entre el Schema de Prisma y las columnas reales de la base de datos**.

### **El Schema de Prisma usa CamelCase mapeado a snake_case:**

```prisma
// prisma/schema.prisma
model Profile {
  nombreCompleto      String     @map("nombre_completo")
  noCvu               String?    @map("no_cvu")
  ultimoGradoEstudios String?    @map("ultimo_grado_estudios")
  //... etc
  
  @@map("investigadores")  // Se mapea a tabla "investigadores"
}
```

### **Pero el código SQL directo espera los nombres exactos:**

```typescript
// lib/databases/postgresql-database.ts línea 212
const query = `INSERT INTO investigadores (${campos.join(", ")}) VALUES (${placeholders}) RETURNING id, nombre_completo, correo, clerk_user_id`;
```

El problema es que `campos` contiene nombres como podrían venir del frontend, que pueden no coincidir con los nombres reales de columnas en Neon.

---

## 🔎 **ANÁLISIS DETALLADO**

### **1. Flujo actual del guardado**

```
Frontend (/registro)
    ↓ [datos con nombres variables]
POST /api/registro
    ↓
Normalización de campos (líneas 70-87)
    ↓ [construye datosRegistro con nombres "correctos"]
guardarInvestigador(datosRegistro)
    ↓
lib/databases/postgresql-database.ts
    ↓ [línea 204]
const campos = Object.keys(datos).filter((campo) => datos[campo] !== undefined && datos[campo] !== null)
    ↓ [línea 212]
INSERT INTO investigadores (${campos.join(", ")})...
    ↓
❌ ERROR: columna "X" no existe
```

### **2. Problema en la línea 204 de postgresql-database.ts**

```typescript
const campos = Object.keys(datos).filter((campo) => datos[campo] !== undefined && datos[campo] !== null)
```

**Esto asume que:**
- Los nombres de las keys en `datos` son EXACTAMENTE iguales a los nombres de columnas en la BD
- No hay validación de que la columna exista

**Pero el frontend puede enviar:**
- `ultimo_grado_estudios` ✅ (correcto)
- `ultimoGradoEstudios` ❌ (incorrecto, no existe en BD)
- `area_investigacionRaw` ❌ (no existe en BD)
- `nivel_tecnologo` ✅ (correcto)
- `nivelTecnologo` ❌ (incorrecto)

---

## 🔬 **VERIFICACIÓN**

### **Columnas reales en Neon (según schema.prisma):**

```sql
CREATE TABLE investigadores (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  clerk_user_id TEXT UNIQUE,
  slug TEXT UNIQUE,
  nombre_completo TEXT NOT NULL,
  nombres TEXT,
  apellidos TEXT,
  curp TEXT UNIQUE,
  rfc TEXT,
  no_cvu TEXT,
  correo TEXT,
  telefono TEXT,
  fotografia_url TEXT,
  nacionalidad TEXT DEFAULT 'Mexicana',
  fecha_nacimiento TIMESTAMP,
  genero TEXT,
  municipio TEXT,
  estado_nacimiento TEXT,
  entidad_federativa TEXT,
  institucion_id TEXT,
  institucion TEXT,
  departamento TEXT,
  ubicacion TEXT,
  sitio_web TEXT,
  origen TEXT,
  archivo_procesado TEXT,
  fecha_registro TIMESTAMP DEFAULT now(),
  es_admin BOOLEAN DEFAULT false,
  activo BOOLEAN DEFAULT true,
  ultimo_grado_estudios TEXT,
  grado_maximo_estudios TEXT,
  empleo_actual TEXT,
  linea_investigacion TEXT,
  area_investigacion TEXT,
  disciplina TEXT,
  especialidad TEXT,
  orcid TEXT,
  nivel TEXT,
  nivel_investigador TEXT,
  nivel_actual_id TEXT,
  fecha_asignacion_nivel TIMESTAMP,
  puntaje_total INT DEFAULT 0,
  estado_evaluacion TEXT DEFAULT 'PENDIENTE',
  articulos TEXT,
  libros TEXT,
  capitulos_libros TEXT,
  proyectos_investigacion TEXT,
  proyectos_vinculacion TEXT,
  experiencia_docente TEXT,
  experiencia_laboral TEXT,
  premios_distinciones TEXT,
  idiomas TEXT,
  colaboracion_internacional TEXT,
  colaboracion_nacional TEXT,
  sni TEXT,
  anio_sni INT,
  cv_url TEXT,
  tipo_perfil TEXT DEFAULT 'INVESTIGADOR',
  nivel_tecnologo_id TEXT,
  nivel_tecnologo TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

**Nota importante:** Prisma usa `id` como TEXT (cuid), pero el código SQL antiguo en `postgresql-database.ts` espera `id SERIAL PRIMARY KEY`.

---

## 🚨 **PROBLEMAS IDENTIFICADOS**

### **Problema 1: Uso de SQL directo en lugar de Prisma Client**

El archivo `lib/databases/postgresql-database.ts` NO usa Prisma Client, usa queries SQL directas con `pg`.

**Consecuencias:**
- ❌ No hay validación de esquema
- ❌ No hay type-safety
- ❌ Los nombres de columnas deben ser exactos
- ❌ Puede haber campos en `datos` que no existen en la BD

### **Problema 2: La tabla `investigadores` NO tiene `id SERIAL`**

Según el schema de Prisma:
```prisma
model Profile {
  id String @id @default(cuid())  // TEXT, no SERIAL
  // ...
  @@map("investigadores")
}
```

Pero el código en `postgresql-database.ts` línea 212 hace:
```typescript
const query = `INSERT INTO investigadores (${campos.join(", ")}) VALUES (${placeholders}) RETURNING id, nombre_completo, correo, clerk_user_id`;
```

**Esto falla porque:**
- No se está insertando el campo `id` (se espera que sea auto-generado)
- Pero Prisma lo define como `cuid()` (string), no como SERIAL
- Si Prisma creó la tabla, `id` es TEXT y requiere valor explícito

### **Problema 3: Campos enviados desde frontend que no existen en BD**

En `app/api/registro/route.ts` líneas 70-82, se definen los campos válidos:

```typescript
const camposTabla = [
  "nombre_completo", "nombres", "apellidos", "correo", "clerk_user_id",
  "linea_investigacion", "area_investigacion", "institucion", "fotografia_url",
  "slug", "curp", "rfc", "no_cvu", "telefono", "nacionalidad", "fecha_nacimiento",
  "genero", "tipo_perfil", "nivel_investigador", "nivel_tecnologo", "municipio",
  "cv_url", "fecha_registro", "origen", "es_admin", "estado_nacimiento",
  "entidad_federativa", "orcid", "empleo_actual", "nivel_actual", "institucion_id", "activo",
  "departamento", "ubicacion", "sitio_web", "grado_maximo_estudios", "especialidad",
  "disciplina", "nivel_actual_id", "fecha_asignacion_nivel", "puntaje_total", "estado_evaluacion",
  "articulos", "libros", "capitulos_libros", "proyectos_investigacion", "proyectos_vinculacion",
  "experiencia_docente", "experiencia_laboral", "premios_distinciones", "idiomas",
  "colaboracion_internacional", "colaboracion_nacional", "sni", "anio_sni", "archivo_procesado"
];
```

**Problema:**
- `nivel_actual` NO existe en la BD → debería ser `nivel`
- Algunos de estos campos están en snake_case, otros pueden venir en camelCase
- No hay validación de que estos campos coincidan con la BD

---

## 🛠️ **SOLUCIONES**

### **Solución 1: Usar Prisma Client (RECOMENDADO)** ✅

Modificar `lib/databases/postgresql-database.ts` para usar Prisma en lugar de SQL directo.

**Ventajas:**
- ✅ Type-safety
- ✅ Validación automática de esquema
- ✅ No más problemas con nombres de columnas
- ✅ Genera IDs automáticamente

**Implementación:**

```typescript
// lib/databases/postgresql-database.ts

import { PrismaClient } from '@prisma/client'
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

export class PostgreSQLDatabase implements DatabaseInterface {
  private client: any = null;
  private config: DatabaseConfig;

  constructor(config: DatabaseConfig) {
    this.config = config;
  }

  async conectar(): Promise<void> {
    // Prisma maneja la conexión automáticamente
    console.log('✅ Usando Prisma Client para PostgreSQL/Neon')
  }

  async desconectar(): Promise<void> {
    await prisma.$disconnect()
  }

  async guardarInvestigador(datos: any) {
    try {
      console.log("💾 ========== GUARDANDO INVESTIGADOR CON PRISMA ==========")
      console.log("Datos recibidos:", JSON.stringify(datos, null, 2))

      // Verificar duplicados por CURP
      if (datos.curp && datos.curp.trim() !== "") {
        const existente = await prisma.profile.findUnique({
          where: { curp: datos.curp }
        })
        
        if (existente) {
          console.log("❌ CURP ya existe:", datos.curp)
          return {
            success: false,
            message: `⚠️ El CURP ${datos.curp} ya existe en el sistema.`,
          }
        }
      }

      // Mapear campos a nomenclatura de Prisma
      const dataPrisma: any = {
        // Obligatorios
        nombreCompleto: datos.nombre_completo || `${datos.nombres || ''} ${datos.apellidos || ''}`.trim(),
        correo: datos.correo,
        clerkUserId: datos.clerk_user_id,
        
        // Opcionales
        nombres: datos.nombres || null,
        apellidos: datos.apellidos || null,
        curp: datos.curp || null,
        rfc: datos.rfc || null,
        noCvu: datos.no_cvu || null,
        telefono: datos.telefono || null,
        fotografiaUrl: datos.fotografia_url || null,
        nacionalidad: datos.nacionalidad || 'Mexicana',
        fechaNacimiento: datos.fecha_nacimiento ? new Date(datos.fecha_nacimiento) : null,
        genero: datos.genero || null,
        municipio: datos.municipio || null,
        estadoNacimiento: datos.estado_nacimiento || null,
        entidadFederativa: datos.entidad_federativa || null,
        institucionId: datos.institucion_id || null,
        institucion: datos.institucion || null,
        departamento: datos.departamento || null,
        ubicacion: datos.ubicacion || null,
        sitioWeb: datos.sitio_web || null,
        slug: datos.slug || null,
        origen: datos.origen || 'registro',
        archivoProcesado: datos.archivo_procesado || null,
        fechaRegistro: datos.fecha_registro ? new Date(datos.fecha_registro) : new Date(),
        isAdmin: datos.es_admin || false,
        activo: datos.activo !== undefined ? datos.activo : true,
        
        // Académico
        ultimoGradoEstudios: datos.ultimo_grado_estudios || null,
        gradoMaximoEstudios: datos.grado_maximo_estudios || null,
        empleoActual: datos.empleo_actual || null,
        lineaInvestigacion: datos.linea_investigacion || null,
        areaInvestigacion: datos.area_investigacion || null,
        disciplina: datos.disciplina || null,
        especialidad: datos.especialidad || null,
        orcid: datos.orcid || null,
        nivel: datos.nivel || null,
        nivelInvestigador: datos.nivel_investigador || null,
        nivelActualId: datos.nivel_actual_id || null,
        fechaAsignacionNivel: datos.fecha_asignacion_nivel ? new Date(datos.fecha_asignacion_nivel) : null,
        puntajeTotal: datos.puntaje_total || 0,
        estadoEvaluacion: datos.estado_evaluacion || 'PENDIENTE',
        
        // Producción
        articulos: datos.articulos || null,
        libros: datos.libros || null,
        capitulosLibros: datos.capitulos_libros || null,
        proyectosInvestigacion: datos.proyectos_investigacion || null,
        proyectosVinculacion: datos.proyectos_vinculacion || null,
        experienciaDocente: datos.experiencia_docente || null,
        experienciaLaboral: datos.experiencia_laboral || null,
        premiosDistinciones: datos.premios_distinciones || null,
        idiomas: datos.idiomas || null,
        colaboracionInternacional: datos.colaboracion_internacional || null,
        colaboracionNacional: datos.colaboracion_nacional || null,
        sni: datos.sni || null,
        anioSni: datos.anio_sni || null,
        cvUrl: datos.cv_url || null,
        
        // Tipo de perfil
        tipoPerfil: datos.tipo_perfil || 'INVESTIGADOR',
        nivelTecnologoTexto: datos.nivel_tecnologo || null,
      }

      // Crear el registro con Prisma
      const result = await prisma.profile.create({
        data: dataPrisma
      })

      console.log("✅ REGISTRO EXITOSO:")
      console.log("   - ID:", result.id)
      console.log("   - Nombre:", result.nombreCompleto)
      console.log("   - Correo:", result.correo)
      console.log("   - Clerk User ID:", result.clerkUserId)
      console.log("===============================================")

      return {
        success: true,
        message: `Registro exitoso para ${result.nombreCompleto}`,
        id: result.id,
      }
    } catch (error: any) {
      console.error("❌ ========== ERROR AL GUARDAR ==========")
      console.error("Error:", error)
      console.error("Código:", error.code)
      console.error("Meta:", error.meta)
      console.error("========================================")
      
      // Manejar errores específicos de Prisma
      if (error.code === 'P2002') {
        const target = error.meta?.target || 'campo'
        return {
          success: false,
          message: `Ya existe un registro con ese ${target}.`,
        }
      }
      
      return {
        success: false,
        message: `Error al guardar: ${error.message}`,
        error,
      }
    }
  }

  // ... resto de métodos también usando Prisma
}
```

---

### **Solución 2: Arreglar SQL directo (TEMPORAL)** ⚠️

Si no quieres usar Prisma ahora, al menos arregla el SQL:

```typescript
// lib/databases/postgresql-database.ts

async guardarInvestigador(datos: any) {
  try {
    if (!this.client) {
      await this.conectar()
    }

    console.log("💾 ========== GUARDANDO INVESTIGADOR ==========")

    // MAPEO DE CAMPOS: frontend → BD
    const camposBD: Record<string, string> = {
      'nombre_completo': datos.nombre_completo || `${datos.nombres || ''} ${datos.apellidos || ''}`.trim(),
      'nombres': datos.nombres,
      'apellidos': datos.apellidos,
      'correo': datos.correo,
      'clerk_user_id': datos.clerk_user_id,
      'curp': datos.curp,
      'rfc': datos.rfc,
      'no_cvu': datos.no_cvu,
      'telefono': datos.telefono,
      'fotografia_url': datos.fotografia_url,
      'nacionalidad': datos.nacionalidad || 'Mexicana',
      'fecha_nacimiento': datos.fecha_nacimiento,
      'genero': datos.genero,
      'municipio': datos.municipio,
      'estado_nacimiento': datos.estado_nacimiento,
      'entidad_federativa': datos.entidad_federativa,
      'institucion_id': datos.institucion_id,
      'institucion': datos.institucion,
      'departamento': datos.departamento,
      'ubicacion': datos.ubicacion,
      'sitio_web': datos.sitio_web,
      'slug': datos.slug,
      'origen': datos.origen || 'registro',
      'archivo_procesado': datos.archivo_procesado,
      'fecha_registro': datos.fecha_registro || new Date().toISOString(),
      'es_admin': datos.es_admin || false,
      'activo': datos.activo !== undefined ? datos.activo : true,
      'ultimo_grado_estudios': datos.ultimo_grado_estudios,
      'grado_maximo_estudios': datos.grado_maximo_estudios,
      'empleo_actual': datos.empleo_actual,
      'linea_investigacion': datos.linea_investigacion,
      'area_investigacion': datos.area_investigacion,
      'disciplina': datos.disciplina,
      'especialidad': datos.especialidad,
      'orcid': datos.orcid,
      'nivel': datos.nivel,
      'nivel_investigador': datos.nivel_investigador,
      'nivel_actual_id': datos.nivel_actual_id,
      'fecha_asignacion_nivel': datos.fecha_asignacion_nivel,
      'puntaje_total': datos.puntaje_total || 0,
      'estado_evaluacion': datos.estado_evaluacion || 'PENDIENTE',
      'articulos': datos.articulos,
      'libros': datos.libros,
      'capitulos_libros': datos.capitulos_libros,
      'proyectos_investigacion': datos.proyectos_investigacion,
      'proyectos_vinculacion': datos.proyectos_vinculacion,
      'experiencia_docente': datos.experiencia_docente,
      'experiencia_laboral': datos.experiencia_laboral,
      'premios_distinciones': datos.premios_distinciones,
      'idiomas': datos.idiomas,
      'colaboracion_internacional': datos.colaboracion_internacional,
      'colaboracion_nacional': datos.colaboracion_nacional,
      'sni': datos.sni,
      'anio_sni': datos.anio_sni,
      'cv_url': datos.cv_url,
      'tipo_perfil': datos.tipo_perfil || 'INVESTIGADOR',
      'nivel_tecnologo': datos.nivel_tecnologo,
    }

    // Filtrar solo campos con valor (not null/undefined)
    const campos: string[] = []
    const valores: any[] = []
    
    for (const [campo, valor] of Object.entries(camposBD)) {
      if (valor !== null && valor !== undefined && valor !== '') {
        campos.push(campo)
        valores.push(valor)
      }
    }

    console.log("📋 Campos a insertar:", campos)
    console.log("📋 Valores:", valores)

    // Verificar duplicado CURP
    if (datos.curp) {
      const existente = await this.client.query(
        'SELECT id FROM investigadores WHERE curp = $1',
        [datos.curp]
      )
      if (existente.rows.length > 0) {
        console.log("❌ CURP ya existe:", datos.curp)
        return {
          success: false,
          message: `⚠️ El CURP ${datos.curp} ya existe en el sistema.`,
        }
      }
    }

    // Generar placeholders
    const placeholders = campos.map((_, index) => `$${index + 1}`).join(", ")

    // Construir query
    const query = `
      INSERT INTO investigadores (${campos.join(", ")}) 
      VALUES (${placeholders}) 
      RETURNING id, nombre_completo, correo, clerk_user_id
    `

    console.log("🔧 Query SQL:", query)

    // Ejecutar
    const result = await this.client.query(query, valores)

    console.log("✅ REGISTRO EXITOSO:")
    console.log("   - ID:", result.rows[0].id)
    console.log("   - Nombre:", result.rows[0].nombre_completo)
    console.log("   - Correo:", result.rows[0].correo)
    console.log("===============================================")

    return {
      success: true,
      message: `Registro exitoso`,
      id: result.rows[0].id,
    }
  } catch (error: any) {
    console.error("❌ ERROR AL GUARDAR:", error)
    console.error("Código de error:", error.code)
    console.error("Detalle:", error.detail)
    
    // Error de llave duplicada
    if (error.code === '23505') {
      return {
        success: false,
        message: 'Ya existe un registro con esos datos (CURP, correo o clerk_user_id duplicado).',
      }
    }
    
    // Error de columna no existe
    if (error.code === '42703') {
      console.error("❌ COLUMNA NO EXISTE:", error.message)
      return {
        success: false,
        message: `Error de configuración: ${error.message}`,
      }
    }
    
    return {
      success: false,
      message: `Error al guardar: ${error.message}`,
      error,
    }
  }
}
```

---

## 🎯 **ACCIÓN INMEDIATA RECOMENDADA**

### **Opción A: Migrar a Prisma Client (30-45 minutos)** ✅

1. Crear nuevo archivo `lib/databases/prisma-postgresql-database.ts`
2. Implementar usando Prisma Client
3. Actualizar `lib/database-config.ts` para usar la nueva clase
4. Probar registro

**Ventajas:**
- ✅ Solución permanente
- ✅ Type-safe
- ✅ Más fácil de mantener
- ✅ No más problemas con nombres de columnas

### **Opción B: Arreglar SQL directo (15 minutos)** ⚠️

1. Aplicar el fix temporal en `lib/databases/postgresql-database.ts`
2. Probar registro

**Desventajas:**
- ⚠️ Solución temporal
- ⚠️ Más propenso a errores
- ⚠️ Difícil de mantener

---

## 📋 **CHECKLIST DE VERIFICACIÓN**

Antes de implementar cualquier solución, verifica:

- [ ] `DATABASE_URL` está configurada en `.env.local`
- [ ] La base de datos Neon está accesible
- [ ] Prisma Client está instalado (`npm list @prisma/client`)
- [ ] Las migraciones de Prisma están aplicadas (`npx prisma migrate deploy`)
- [ ] El schema de Prisma está sincronizado con Neon

---

## 🚀 **¿QUÉ SOLUCIÓN IMPLEMENTO?**

**Recomendación:** Usar Prisma Client (Opción A)

¿Quieres que implemente la migración a Prisma Client ahora? 🚀

