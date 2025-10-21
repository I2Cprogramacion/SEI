# 🎯 ARQUITECTURA DE NUEVOS MÓDULOS - SEI

## 📋 Resumen Ejecutivo

Este documento define la arquitectura técnica de tres nuevos módulos:
1. **Sistema de Evaluación y Niveles de Investigadores**
2. **Sistema de Expedición de Certificados**
3. **Sistema de Gestión de Convocatorias**

---

## 1️⃣ MÓDULO: SISTEMA DE EVALUACIÓN Y NIVELES

### 🎓 Niveles de Investigadores

```
Nivel 1       → Investigador Junior (recién ingresado)
Nivel 2       → Investigador Consolidado
Nivel 3       → Investigador Senior
Candidato     → Candidato a Emérito (pre-emérito)
Emérito       → Investigador Emérito (máxima distinción)
```

### 📊 Criterios de Evaluación

#### A. Productividad Científica (40%)
- **Publicaciones** (20%)
  - Artículos en revistas indexadas (Q1, Q2, Q3, Q4)
  - Capítulos de libro
  - Libros completos
  - Factor de impacto y citas
  
- **Proyectos de Investigación** (20%)
  - Proyectos como investigador principal
  - Proyectos como colaborador
  - Financiamiento obtenido
  - Proyectos completados vs en curso

#### B. Formación de Recursos Humanos (25%)
- Dirección de tesis (licenciatura, maestría, doctorado)
- Estudiantes graduados
- Postdoctorados supervisados
- Cursos impartidos

#### C. Experiencia y Trayectoria (20%)
- Años de experiencia en investigación
- Grado académico (maestría, doctorado, postdoctorado)
- Estancias de investigación
- Pertenencia a sistemas nacionales (SNI, etc.)

#### D. Impacto y Vinculación (15%)
- Transferencia tecnológica
- Patentes
- Colaboraciones internacionales
- Participación en comités
- Divulgación científica

### 🗄️ Modelo de Datos

```prisma
// Nuevo modelo: Nivel de Investigador
model NivelInvestigador {
  id                String   @id @default(cuid())
  codigo            String   @unique // "NIVEL_1", "NIVEL_2", "NIVEL_3", "CANDIDATO", "EMERITO"
  nombre            String   // "Nivel 1", "Nivel 2", etc.
  descripcion       String
  puntajeMinimo     Int      // Puntaje mínimo requerido
  puntajeMaximo     Int      // Puntaje máximo del rango
  color             String   // Color para UI (hex)
  orden             Int      // Orden jerárquico (1-5)
  activo            Boolean  @default(true)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  investigadores    PerfilInvestigador[]
  evaluaciones      Evaluacion[]
  
  @@map("niveles_investigador")
}

// Extensión del modelo Profile
model PerfilInvestigador {
  id                  String              @id @default(cuid())
  userId              String              @unique
  nombreCompleto      String
  curp                String?             @unique
  rfc                 String?
  noCvu               String?
  telefono            String?
  ultimoGradoEstudios String?
  empleoActual        String?
  lineaInvestigacion  String?
  areaInvestigacion   String?
  fotografiaUrl       String?
  nacionalidad        String              @default("Mexicana")
  fechaNacimiento     DateTime?
  institucionId       String?
  institucion         String?
  
  // NUEVOS CAMPOS
  nivelActualId       String?
  fechaAsignacionNivel DateTime?
  puntajeTotal        Int                 @default(0)
  estadoEvaluacion    String              @default("PENDIENTE") // PENDIENTE, EN_PROCESO, APROBADO, RECHAZADO
  
  nivelActual         NivelInvestigador?  @relation(fields: [nivelActualId], references: [id])
  evaluaciones        Evaluacion[]
  certificados        Certificado[]
  
  createdAt           DateTime            @default(now())
  updatedAt           DateTime            @updatedAt
  
  @@map("perfiles_investigador")
}

// Modelo: Evaluación
model Evaluacion {
  id                    String              @id @default(cuid())
  investigadorId        String
  evaluadorId           String
  nivelPropuestoId      String
  ciclo                 String              // "2025-1", "2025-2"
  
  // Puntajes por criterio
  puntajePublicaciones  Int                 @default(0)
  puntajeProyectos      Int                 @default(0)
  puntajeFormacion      Int                 @default(0)
  puntajeExperiencia    Int                 @default(0)
  puntajeImpacto        Int                 @default(0)
  puntajeTotal          Int                 @default(0)
  
  // Detalles
  observaciones         String?
  documentosSoporte     Json?               // URLs de documentos
  estado                String              @default("EN_REVISION") // EN_REVISION, APROBADA, RECHAZADA
  
  fechaInicio           DateTime            @default(now())
  fechaFinalizacion     DateTime?
  
  investigador          PerfilInvestigador  @relation(fields: [investigadorId], references: [id])
  nivelPropuesto        NivelInvestigador   @relation(fields: [nivelPropuestoId], references: [id])
  
  createdAt             DateTime            @default(now())
  updatedAt             DateTime            @updatedAt
  
  @@map("evaluaciones")
}

// Modelo: Criterio de Evaluación (configurable)
model CriterioEvaluacion {
  id              String   @id @default(cuid())
  codigo          String   @unique
  nombre          String
  descripcion     String
  categoria       String   // "PRODUCTIVIDAD", "FORMACION", "EXPERIENCIA", "IMPACTO"
  peso            Int      // Peso porcentual (0-100)
  puntajeMaximo   Int
  activo          Boolean  @default(true)
  orden           Int
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@map("criterios_evaluacion")
}

// Modelo: Métrica de Investigador (para cálculo automático)
model MetricaInvestigador {
  id                        String    @id @default(cuid())
  investigadorId            String
  
  // Métricas de publicaciones
  totalPublicaciones        Int       @default(0)
  publicacionesQ1           Int       @default(0)
  publicacionesQ2           Int       @default(0)
  totalCitas                Int       @default(0)
  indiceH                   Int       @default(0)
  
  // Métricas de proyectos
  totalProyectos            Int       @default(0)
  proyectosVigentes         Int       @default(0)
  proyectosPrincipal        Int       @default(0)
  montoTotalFinanciamiento  Float     @default(0)
  
  // Métricas de formación
  tesisLicenciatura         Int       @default(0)
  tesisMaestria             Int       @default(0)
  tesisDoctorado            Int       @default(0)
  
  // Métricas de impacto
  patentes                  Int       @default(0)
  colaboracionesInternacionales Int   @default(0)
  
  fechaActualizacion        DateTime  @default(now())
  
  createdAt                 DateTime  @default(now())
  updatedAt                 DateTime  @updatedAt
  
  @@unique([investigadorId])
  @@map("metricas_investigador")
}
```

### 🔌 APIs del Módulo

```typescript
// app/api/evaluaciones/route.ts
POST   /api/evaluaciones              // Crear nueva evaluación
GET    /api/evaluaciones              // Listar evaluaciones
GET    /api/evaluaciones/[id]         // Obtener evaluación específica
PUT    /api/evaluaciones/[id]         // Actualizar evaluación
DELETE /api/evaluaciones/[id]         // Eliminar evaluación

// app/api/evaluaciones/calcular/route.ts
POST   /api/evaluaciones/calcular     // Calcular puntaje automático

// app/api/niveles/route.ts
GET    /api/niveles                   // Listar niveles
POST   /api/niveles                   // Crear nivel (admin)
PUT    /api/niveles/[id]              // Actualizar nivel (admin)

// app/api/investigadores/[id]/metricas/route.ts
GET    /api/investigadores/[id]/metricas  // Obtener métricas
POST   /api/investigadores/[id]/metricas/actualizar  // Actualizar métricas

// app/api/investigadores/[id]/nivel/route.ts
GET    /api/investigadores/[id]/nivel     // Obtener nivel actual
POST   /api/investigadores/[id]/nivel     // Asignar nivel (admin)
```

### 🎨 Interfaces de Usuario

#### Admin Panel
- **Dashboard de Evaluaciones**
  - Lista de investigadores pendientes de evaluación
  - Filtros por nivel, ciclo, estado
  - Botones de acción rápida
  
- **Formulario de Evaluación**
  - Datos del investigador
  - Criterios con sliders de puntaje
  - Cálculo automático de puntaje total
  - Sugerencia de nivel según puntaje
  - Campo de observaciones
  - Carga de documentos soporte

- **Gestión de Niveles**
  - CRUD de niveles
  - Configuración de rangos de puntaje
  - Vista previa de distintivos

#### Dashboard Investigador
- **Mi Nivel Actual**
  - Distintivo visual del nivel
  - Fecha de asignación
  - Puntaje obtenido
  
- **Mis Métricas**
  - Dashboard con gráficas
  - Comparación con requisitos del siguiente nivel
  - Recomendaciones para mejorar
  
- **Historial de Evaluaciones**
  - Lista de evaluaciones anteriores
  - Evolución de puntajes
  - Documentos descargables

---

## 2️⃣ MÓDULO: SISTEMA DE CERTIFICADOS

### 📜 Características del Certificado

#### Contenido del Certificado
```
┌─────────────────────────────────────────────────────────────┐
│                    [LOGO SEI - GOBIERNO]                    │
│                                                             │
│              SISTEMA ESTATAL DE INVESTIGADORES              │
│                     ESTADO DE CHIHUAHUA                     │
│                                                             │
│                         CERTIFICA                           │
│                                                             │
│  Que el/la Dr(a). [NOMBRE COMPLETO]                        │
│  con CURP: [CURP]                                           │
│  pertenece al Sistema Estatal de Investigadores            │
│  del Estado de Chihuahua con el nivel:                     │
│                                                             │
│                    [NIVEL EMÉRITO]                          │
│                                                             │
│  Reconocimiento otorgado el: [FECHA]                       │
│  Vigencia: [FECHA INICIO] - [FECHA FIN]                    │
│                                                             │
│  Folio: SEI-2025-000123                                     │
│                                                             │
│  [QR CODE]              [FIRMA DIGITAL]                     │
│  Verificar en:          Secretario Técnico                  │
│  sei-chih.com.mx/       Sistema Estatal                     │
│  verificar/000123       de Investigadores                   │
└─────────────────────────────────────────────────────────────┘
```

### 🗄️ Modelo de Datos

```prisma
// Modelo: Certificado
model Certificado {
  id                    String              @id @default(cuid())
  folio                 String              @unique // SEI-2025-000123
  investigadorId        String
  nivelId               String
  
  // Datos del certificado
  nombreCompleto        String
  curp                  String
  nivel                 String
  
  // Fechas
  fechaEmision          DateTime            @default(now())
  fechaVigenciaInicio   DateTime
  fechaVigenciaFin      DateTime
  
  // Archivos
  pdfUrl                String?             // URL del PDF generado
  qrCodeUrl             String?             // URL del QR code
  
  // Verificación
  codigoVerificacion    String              @unique // Hash para verificación
  verificado            Boolean             @default(false)
  vecesVerificado       Int                 @default(0)
  ultimaVerificacion    DateTime?
  
  // Estado
  estado                String              @default("ACTIVO") // ACTIVO, REVOCADO, EXPIRADO
  motivoRevocacion      String?
  
  // Metadata
  firmadoPor            String?             // Nombre del funcionario
  cargoFirmante         String?
  
  investigador          PerfilInvestigador  @relation(fields: [investigadorId], references: [id])
  
  createdAt             DateTime            @default(now())
  updatedAt             DateTime            @updatedAt
  
  @@map("certificados")
}

// Modelo: Log de Verificaciones
model VerificacionCertificado {
  id                String      @id @default(cuid())
  certificadoId     String
  folio             String
  ipAddress         String?
  userAgent         String?
  fechaVerificacion DateTime    @default(now())
  
  @@map("verificaciones_certificado")
}

// Modelo: Plantilla de Certificado (configurable)
model PlantillaCertificado {
  id              String   @id @default(cuid())
  nombre          String
  descripcion     String?
  htmlTemplate    String   // HTML del certificado
  cssStyles       String?  // Estilos CSS
  activa          Boolean  @default(false)
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@map("plantillas_certificado")
}
```

### 🔌 APIs del Módulo

```typescript
// app/api/certificados/route.ts
POST   /api/certificados                    // Generar certificado
GET    /api/certificados                    // Listar certificados (admin)
GET    /api/certificados/[id]               // Obtener certificado específico

// app/api/certificados/generar/route.ts
POST   /api/certificados/generar            // Generar PDF del certificado

// app/api/certificados/verificar/route.ts
GET    /api/certificados/verificar/[folio]  // Verificar certificado público
POST   /api/certificados/verificar          // Verificar con código

// app/api/certificados/revocar/route.ts
POST   /api/certificados/[id]/revocar       // Revocar certificado (admin)

// app/api/certificados/descargar/route.ts
GET    /api/certificados/[id]/descargar     // Descargar PDF

// app/api/investigadores/[id]/certificados/route.ts
GET    /api/investigadores/[id]/certificados // Certificados del investigador
```

### 🎨 Interfaces de Usuario

#### Admin Panel
- **Gestión de Certificados**
  - Lista de certificados emitidos
  - Filtros por nivel, fecha, estado
  - Búsqueda por folio o investigador
  - Acciones: Ver, Descargar, Revocar
  
- **Emitir Certificado**
  - Selección de investigador
  - Configuración de vigencia
  - Vista previa del certificado
  - Firma digital
  - Generación automática de folio y QR

#### Dashboard Investigador
- **Mis Certificados**
  - Lista de certificados
  - Botón de descarga
  - Estado de vigencia
  - Compartir en redes sociales

#### Página Pública
- **Verificador de Certificados**
  - Input de folio o escaneo de QR
  - Resultado de verificación:
    - ✅ VÁLIDO (datos del investigador, nivel, vigencia)
    - ⚠️ EXPIRADO
    - ❌ NO VÁLIDO

### 📦 Librerías Necesarias

```json
{
  "dependencies": {
    "puppeteer": "^21.0.0",          // Generación de PDF
    "qrcode": "^1.5.3",               // Generación de QR codes
    "@pdfme/generator": "^4.0.0",     // Alternativa para PDF
    "uuid": "^9.0.1",                 // Generación de folios únicos
    "crypto": "built-in"              // Hash para verificación
  }
}
```

---

## 3️⃣ MÓDULO: GESTIÓN DE CONVOCATORIAS

### 📢 Flujo de Convocatorias

```
1. CREACIÓN (Admin)
   ↓
2. PUBLICACIÓN
   ↓
3. POSTULACIÓN (Investigadores)
   ↓
4. EVALUACIÓN (Comité)
   ↓
5. RESULTADOS
   ↓
6. SEGUIMIENTO
```

### 🗄️ Modelo de Datos

```prisma
// Modelo: Convocatoria
model Convocatoria {
  id                    String              @id @default(cuid())
  folio                 String              @unique // CONV-2025-001
  titulo                String
  descripcion           String
  objetivos             String
  
  // Organización
  organizacion          String
  contacto              String?
  email                 String?
  telefono              String?
  
  // Fechas
  fechaPublicacion      DateTime
  fechaAperturaConv     DateTime
  fechaCierreConv       DateTime
  fechaResultados       DateTime?
  
  // Financiamiento
  presupuestoTotal      Float?
  montoMinimo           Float?
  montoMaximo           Float?
  numeroPlazas          Int?
  
  // Requisitos
  nivelMinimo           String?             // Nivel mínimo requerido
  areasElegibles        Json?               // Array de áreas
  requisitos            Json?               // Array de requisitos
  documentosRequeridos  Json?               // Array de documentos
  
  // Archivos
  basesPdf              String?             // URL del PDF de bases
  formatosPdf           String?             // URL de formatos
  
  // Estado
  estado                String              @default("BORRADOR") 
  // Estados: BORRADOR, PUBLICADA, ABIERTA, CERRADA, EN_EVALUACION, FINALIZADA, CANCELADA
  
  // Configuración
  permitePostulacion    Boolean             @default(true)
  requiereEvaluacion    Boolean             @default(true)
  esPublica             Boolean             @default(true)
  
  postulaciones         Postulacion[]
  
  createdAt             DateTime            @default(now())
  updatedAt             DateTime            @updatedAt
  
  @@map("convocatorias")
}

// Modelo: Postulación
model Postulacion {
  id                    String              @id @default(cuid())
  convocatoriaId        String
  investigadorId        String
  folio                 String              @unique // POST-2025-000123
  
  // Datos de la postulación
  tituloProyecto        String?
  resumen               String?
  objetivos             String?
  metodologia           String?
  impactoEsperado       String?
  presupuestoSolicitado Float?
  
  // Documentos
  documentos            Json?               // Array de URLs de documentos
  cartaPostulacion      String?
  curriculumVitae       String?
  
  // Evaluación
  puntajeTotal          Float?
  dictamen              String?
  observaciones         String?
  
  // Estado
  estado                String              @default("ENVIADA")
  // Estados: BORRADOR, ENVIADA, EN_REVISION, APROBADA, RECHAZADA, PENDIENTE_DOCUMENTACION
  
  // Fechas
  fechaPostulacion      DateTime            @default(now())
  fechaEvaluacion       DateTime?
  fechaResultado        DateTime?
  
  convocatoria          Convocatoria        @relation(fields: [convocatoriaId], references: [id])
  evaluaciones          EvaluacionPostulacion[]
  
  createdAt             DateTime            @default(now())
  updatedAt             DateTime            @updatedAt
  
  @@map("postulaciones")
}

// Modelo: Evaluación de Postulación
model EvaluacionPostulacion {
  id                    String      @id @default(cuid())
  postulacionId         String
  evaluadorId           String
  
  // Criterios de evaluación (configurables)
  criterios             Json        // Array de {criterio, puntaje, comentario}
  puntajeTotal          Float
  
  // Dictamen
  recomendacion         String      // APROBAR, RECHAZAR, REVISION_ADICIONAL
  comentarios           String?
  fortalezas            String?
  debilidades           String?
  
  // Estado
  estado                String      @default("PENDIENTE")
  
  fechaAsignacion       DateTime    @default(now())
  fechaCompletada       DateTime?
  
  postulacion           Postulacion @relation(fields: [postulacionId], references: [id])
  
  createdAt             DateTime    @default(now())
  updatedAt             DateTime    @updatedAt
  
  @@map("evaluaciones_postulacion")
}

// Modelo: Ciclo de Convocatorias
model CicloConvocatoria {
  id                String      @id @default(cuid())
  nombre            String      // "2025-1", "2025-2"
  anio              Int
  periodo           String      // "Primer Semestre", "Segundo Semestre"
  fechaInicio       DateTime
  fechaFin          DateTime
  activo            Boolean     @default(true)
  
  descripcion       String?
  
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  
  @@map("ciclos_convocatoria")
}

// Modelo: Notificación de Convocatoria
model NotificacionConvocatoria {
  id                String      @id @default(cuid())
  convocatoriaId    String?
  tipo              String      // NUEVA, PROXIMO_CIERRE, RESULTADOS, RECORDATORIO
  asunto            String
  mensaje           String
  destinatarios     Json        // Array de IDs o "TODOS"
  
  // Estado de envío
  enviada           Boolean     @default(false)
  fechaEnvio        DateTime?
  totalEnviados     Int         @default(0)
  totalFallidos     Int         @default(0)
  
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  
  @@map("notificaciones_convocatoria")
}
```

### 🔌 APIs del Módulo

```typescript
// app/api/convocatorias/route.ts
POST   /api/convocatorias                          // Crear convocatoria (admin)
GET    /api/convocatorias                          // Listar convocatorias
GET    /api/convocatorias/[id]                     // Obtener convocatoria
PUT    /api/convocatorias/[id]                     // Actualizar convocatoria (admin)
DELETE /api/convocatorias/[id]                     // Eliminar convocatoria (admin)

// app/api/convocatorias/[id]/publicar/route.ts
POST   /api/convocatorias/[id]/publicar            // Publicar convocatoria

// app/api/convocatorias/[id]/cerrar/route.ts
POST   /api/convocatorias/[id]/cerrar              // Cerrar convocatoria

// app/api/convocatorias/activas/route.ts
GET    /api/convocatorias/activas                  // Convocatorias abiertas

// app/api/postulaciones/route.ts
POST   /api/postulaciones                          // Crear postulación
GET    /api/postulaciones                          // Listar postulaciones
GET    /api/postulaciones/[id]                     // Obtener postulación
PUT    /api/postulaciones/[id]                     // Actualizar postulación
DELETE /api/postulaciones/[id]                     // Eliminar postulación

// app/api/postulaciones/[id]/enviar/route.ts
POST   /api/postulaciones/[id]/enviar              // Enviar postulación

// app/api/postulaciones/[id]/evaluaciones/route.ts
GET    /api/postulaciones/[id]/evaluaciones        // Ver evaluaciones
POST   /api/postulaciones/[id]/evaluaciones        // Crear evaluación

// app/api/investigadores/[id]/postulaciones/route.ts
GET    /api/investigadores/[id]/postulaciones      // Postulaciones del investigador

// app/api/notificaciones/convocatorias/route.ts
POST   /api/notificaciones/convocatorias           // Enviar notificación masiva
```

### 🎨 Interfaces de Usuario

#### Admin Panel

**1. Dashboard de Convocatorias**
- Resumen: Total, Activas, Cerradas, En evaluación
- Gráfica de postulaciones por convocatoria
- Timeline de convocatorias
- Acciones rápidas

**2. Crear/Editar Convocatoria**
- Formulario multi-paso:
  1. Información general
  2. Fechas y presupuesto
  3. Requisitos y documentos
  4. Configuración y publicación
- Vista previa
- Guardar como borrador

**3. Gestión de Postulaciones**
- Lista de postulaciones por convocatoria
- Filtros: Estado, Fecha, Investigador
- Asignación de evaluadores
- Dashboard de evaluación
- Exportar resultados

**4. Panel de Evaluación**
- Lista de postulaciones asignadas
- Formulario de evaluación con criterios
- Cálculo automático de puntaje
- Comparación entre postulaciones
- Generar dictamen

#### Página Pública

**1. Catálogo de Convocatorias**
- Grid/Lista de convocatorias activas
- Filtros: Área, Monto, Fecha
- Búsqueda
- Contador de días restantes
- Badges: "Nueva", "Próximo a cerrar"

**2. Detalle de Convocatoria**
- Toda la información
- Descargar bases y formatos
- Botón "Postularme" (si está autenticado)
- Timeline de fechas
- FAQ

#### Dashboard Investigador

**1. Mis Postulaciones**
- Lista de postulaciones
- Estados con colores
- Ver detalle
- Editar (si está en borrador)
- Seguimiento

**2. Nueva Postulación**
- Formulario con validaciones
- Subida de documentos
- Autoguardado
- Validación pre-envío
- Confirmación

**3. Resultados**
- Notificaciones de resultados
- Ver evaluaciones (si son públicas)
- Descargar constancias

---

## 🛠️ PLAN DE IMPLEMENTACIÓN

### Fase 1: Base de Datos y Migraciones (Semana 1-2)
```bash
# Prioridad: ALTA
1. Actualizar schema.prisma con todos los modelos
2. Crear migraciones
3. Seeders con datos iniciales:
   - Niveles de investigador (1, 2, 3, Candidato, Emérito)
   - Criterios de evaluación
   - Plantilla de certificado
4. Probar en desarrollo
```

### Fase 2: Módulo de Evaluación (Semana 3-5)
```bash
# Prioridad: ALTA (base para certificados)
1. APIs de niveles y evaluaciones
2. Cálculo automático de métricas
3. Admin: Dashboard de evaluaciones
4. Admin: Formulario de evaluación
5. Investigador: Ver mi nivel y métricas
6. Sistema de notificaciones
```

### Fase 3: Módulo de Certificados (Semana 6-7)
```bash
# Prioridad: MEDIA (depende de evaluación)
1. Diseño de plantilla HTML/CSS
2. API de generación de certificados
3. Integración con Puppeteer/PDF
4. Generación de QR codes
5. Página de verificación pública
6. Admin: Gestión de certificados
7. Investigador: Mis certificados
```

### Fase 4: Módulo de Convocatorias (Semana 8-11)
```bash
# Prioridad: MEDIA
1. APIs de convocatorias y postulaciones
2. Admin: CRUD de convocatorias
3. Admin: Panel de evaluación
4. Público: Catálogo y detalle
5. Investigador: Sistema de postulación
6. Sistema de notificaciones automáticas
7. Integración con evaluación (nivel mínimo)
```

### Fase 5: Integración y Testing (Semana 12-13)
```bash
# Prioridad: ALTA
1. Testing end-to-end
2. Optimización de queries
3. Validaciones y seguridad
4. Documentación de usuario
5. Capacitación a admins
```

---

## 📊 MÉTRICAS DE ÉXITO

### Módulo de Evaluación
- [ ] Tiempo promedio de evaluación < 30 minutos
- [ ] 100% de investigadores con nivel asignado
- [ ] Cálculo automático de métricas 95% preciso

### Módulo de Certificados
- [ ] Generación de certificado < 10 segundos
- [ ] 100% de certificados con QR funcional
- [ ] Página de verificación con 99.9% uptime

### Módulo de Convocatorias
- [ ] 80% de postulaciones completadas sin errores
- [ ] Notificaciones enviadas 100% de las veces
- [ ] Tiempo de evaluación reducido 50%

---

## 🔒 CONSIDERACIONES DE SEGURIDAD

1. **Evaluaciones**
   - Solo admins pueden crear/editar evaluaciones
   - Log de auditoría de cambios de nivel
   - Validación de puntajes

2. **Certificados**
   - Firma digital con hash SHA-256
   - Prevención de falsificación
   - Rate limiting en verificación

3. **Convocatorias**
   - Solo una postulación por investigador por convocatoria
   - Validación de archivos subidos
   - Encriptación de datos sensibles

---

## 📚 DOCUMENTACIÓN ADICIONAL

- [ ] Manual de usuario para investigadores
- [ ] Manual de administrador
- [ ] Guía de evaluación
- [ ] API documentation (Swagger)
- [ ] Troubleshooting guide

---

**Creado**: 21 de Octubre, 2025  
**Versión**: 1.0  
**Última actualización**: 21/10/2025
