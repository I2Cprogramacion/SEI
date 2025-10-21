# 📋 RESUMEN EJECUTIVO - NUEVOS MÓDULOS SEI

**Fecha**: 21 de Octubre, 2025  
**Proyecto**: Sistema Estatal de Investigadores (SEI)  
**Versión**: 1.0

---

## 🎯 REQUERIMIENTOS

Se han definido tres nuevos módulos para ampliar la funcionalidad de la plataforma:

1. **Sistema de Evaluación y Niveles de Investigadores**
2. **Sistema de Expedición de Certificados**
3. **Sistema de Gestión de Convocatorias**

---

## 📊 NIVELES DE INVESTIGADORES

El sistema contempla **5 niveles** jerárquicos:

| Nivel | Código | Puntaje | Color | Descripción |
|-------|--------|---------|-------|-------------|
| **Nivel 1** | NIVEL_1 | 0-40 | Verde | Investigador Junior |
| **Nivel 2** | NIVEL_2 | 41-65 | Azul | Investigador Consolidado |
| **Nivel 3** | NIVEL_3 | 66-85 | Morado | Investigador Senior |
| **Candidato** | CANDIDATO | 86-94 | Ámbar | Candidato a Emérito |
| **Emérito** | EMERITO | 95-100 | Rojo | Investigador Emérito |

### Criterios de Evaluación (100 puntos total)

- **Productividad Científica**: 40 puntos
  - Publicaciones (Q1, Q2, Q3, Q4, libros)
  - Proyectos de investigación
  - Financiamiento obtenido

- **Formación de Recursos Humanos**: 25 puntos
  - Dirección de tesis (doctorado, maestría, licenciatura)
  - Cursos impartidos

- **Experiencia y Trayectoria**: 20 puntos
  - Años de experiencia
  - Grado académico
  - Pertenencia a SNI

- **Impacto y Vinculación**: 15 puntos
  - Patentes
  - Colaboraciones internacionales
  - Premios y distinciones

---

## 📜 CERTIFICADOS DIGITALES

### Características

- **Folio único**: SEI-YYYY-NNNNNN
- **Formato**: PDF generado dinámicamente
- **Código QR**: Para verificación pública
- **Verificación**: Hash SHA-256
- **Vigencia**: Configurable (12 meses por defecto)

### Estados

- ✅ **ACTIVO**: Certificado válido
- ⚠️ **EXPIRADO**: Vigencia vencida
- ❌ **REVOCADO**: Cancelado manualmente
- ⏸️ **SUSPENDIDO**: Temporalmente inactivo

### Página de Verificación Pública

URL: `https://sei-chih.com.mx/verificar/{folio}`

Muestra:
- Validez del certificado
- Datos del investigador
- Nivel asignado
- Fecha de emisión y vigencia
- Fotografía institucional

---

## 📢 GESTIÓN DE CONVOCATORIAS

### Ciclo de Vida

```
BORRADOR → PUBLICADA → ABIERTA → CERRADA → EN_EVALUACION → RESULTADOS_PUBLICADOS → FINALIZADA
```

### Tipos de Convocatorias

- **Proyectos de Investigación**
- **Becas**
- **Estancias**
- **Premios y Reconocimientos**

### Proceso de Postulación

1. **Investigador** crea postulación (puede ser borrador)
2. Completa formulario con:
   - Datos del proyecto
   - Presupuesto solicitado
   - Documentos requeridos
3. **Envía** postulación antes del cierre
4. **Sistema** asigna evaluadores
5. **Evaluadores** califican según criterios
6. **Administradores** publican resultados
7. **Sistema** notifica a postulantes

### Notificaciones Automáticas

- 🔔 Nueva convocatoria publicada
- ⏰ Recordatorio 3 días antes del cierre
- 🚫 Convocatoria cerrada
- 📊 Resultados publicados

---

## 💾 BASE DE DATOS

### Nuevos Modelos (14 total)

**Módulo de Evaluación:**
- `NivelInvestigador` (5 niveles predefinidos)
- `Evaluacion` (historial de evaluaciones)
- `CriterioEvaluacion` (14 criterios configurables)
- `MetricaInvestigador` (métricas calculadas automáticamente)

**Módulo de Certificados:**
- `Certificado` (certificados emitidos)
- `VerificacionCertificado` (log de verificaciones)
- `PlantillaCertificado` (plantillas HTML/CSS)

**Módulo de Convocatorias:**
- `Convocatoria` (convocatorias publicadas)
- `Postulacion` (postulaciones de investigadores)
- `EvaluacionPostulacion` (evaluaciones de postulaciones)
- `CicloConvocatoria` (ciclos semestrales/anuales)
- `NotificacionConvocatoria` (notificaciones masivas)

### Extensiones a Modelos Existentes

**Profile** (ahora PerfilInvestigador):
- `nivelActualId`: Relación con nivel actual
- `fechaAsignacionNivel`: Fecha de última asignación
- `puntajeTotal`: Puntaje de evaluación
- `estadoEvaluacion`: PENDIENTE, EN_PROCESO, APROBADO, RECHAZADO

---

## 🔌 APIs (40+ endpoints)

### Evaluaciones
- GET/POST `/api/evaluaciones`
- GET/PUT/DELETE `/api/evaluaciones/[id]`
- POST `/api/evaluaciones/calcular` (cálculo automático)
- POST `/api/evaluaciones/[id]/aprobar`

### Certificados
- GET/POST `/api/certificados`
- POST `/api/certificados/generar` (genera PDF)
- GET `/api/certificados/verificar/[folio]` (público)
- POST `/api/certificados/[id]/revocar`
- GET `/api/certificados/[id]/descargar`

### Convocatorias
- GET/POST `/api/convocatorias`
- POST `/api/convocatorias/[id]/publicar`
- POST `/api/convocatorias/[id]/cerrar`
- GET `/api/convocatorias/activas`

### Postulaciones
- GET/POST `/api/postulaciones`
- POST `/api/postulaciones/[id]/enviar`
- GET/POST `/api/postulaciones/[id]/evaluaciones`

---

## 🎨 INTERFACES DE USUARIO

### Panel de Administración

**Dashboard Principal:**
- Resumen de investigadores por nivel (gráfica de dona)
- Evaluaciones pendientes (tabla con acciones)
- Convocatorias activas (cards con estadísticas)
- Certificados emitidos (contador + últimos 5)

**Gestión de Evaluaciones:**
- Lista de investigadores pendientes
- Formulario de evaluación con sliders
- Cálculo automático de puntaje
- Sugerencia de nivel
- Vista previa antes de guardar

**Gestión de Certificados:**
- Lista de certificados (filtros por nivel, fecha, estado)
- Botón "Emitir Certificado"
- Vista previa del PDF
- Descarga y revocación

**Gestión de Convocatorias:**
- CRUD completo de convocatorias
- Editor multi-paso
- Panel de postulaciones
- Asignación de evaluadores
- Publicación de resultados

### Dashboard de Investigador

**Mi Perfil:**
- Distintivo de nivel actual
- Puntaje y porcentaje
- Gráfica de radar con métricas
- Comparación con siguiente nivel
- Recomendaciones personalizadas

**Mis Certificados:**
- Lista de certificados vigentes
- Botón de descarga
- Compartir en redes sociales
- Certificados expirados (historial)

**Convocatorias:**
- Explorador de convocatorias activas
- Filtros por categoría, monto, área
- Botón "Postularme"
- Mis postulaciones (borradores y enviadas)
- Seguimiento de estado

### Páginas Públicas

**Verificador de Certificados:**
- Input de folio o escaneo QR
- Resultado con diseño atractivo
- Validación en tiempo real
- Compartible por URL

---

## 📦 DEPENDENCIAS NUEVAS

```json
{
  "dependencies": {
    "puppeteer": "^21.0.0",
    "qrcode": "^1.5.3",
    "@pdfme/generator": "^4.0.0",
    "uuid": "^9.0.1"
  }
}
```

---

## 🚀 PLAN DE IMPLEMENTACIÓN

### Fase 1: Base de Datos (2 semanas)
- [ ] Actualizar `schema.prisma`
- [ ] Crear migraciones
- [ ] Ejecutar seed
- [ ] Validar en desarrollo

### Fase 2: Evaluación (3 semanas)
- [ ] APIs de evaluaciones
- [ ] Cálculo automático de métricas
- [ ] Admin: Dashboard y formularios
- [ ] Investigador: Vista de nivel
- [ ] Notificaciones

### Fase 3: Certificados (2 semanas)
- [ ] Diseño de plantilla
- [ ] Generación de PDF
- [ ] Sistema de QR
- [ ] Verificación pública
- [ ] Admin: Gestión

### Fase 4: Convocatorias (4 semanas)
- [ ] APIs completas
- [ ] Admin: CRUD + evaluación
- [ ] Público: Catálogo
- [ ] Investigador: Postulación
- [ ] Notificaciones automáticas

### Fase 5: Integración y Testing (2 semanas)
- [ ] Testing E2E
- [ ] Optimización
- [ ] Documentación
- [ ] Deploy a producción

**Duración total estimada**: 13 semanas (3 meses aprox.)

---

## 💰 ESTIMACIÓN DE RECURSOS

### Desarrollo
- Backend: ~80 horas
- Frontend: ~100 horas
- Testing: ~40 horas
- **Total**: ~220 horas

### Infraestructura
- Generación de PDFs (Puppeteer): Proceso intensivo
- Almacenamiento de certificados: ~10GB/año estimado
- Base de datos: +15 tablas nuevas

---

## ✅ ENTREGABLES

### Documentación
- ✅ Arquitectura completa (`ARQUITECTURA_NUEVOS_MODULOS.md`)
- ✅ Schema de base de datos (`schema-nuevos-modulos.prisma`)
- ✅ Script de inicialización (`seed-nuevos-modulos.ts`)
- ✅ Ejemplos de APIs (`EJEMPLOS_APIS.md`)
- ✅ Resumen ejecutivo (este documento)

### Próximos Pasos
1. **Revisión y aprobación** del diseño propuesto
2. **Priorización** de funcionalidades (¿qué se implementa primero?)
3. **Asignación de recursos** (desarrolladores disponibles)
4. **Inicio de desarrollo** según plan de implementación

---

## 📞 CONTACTO

Para preguntas, cambios o aclaraciones sobre este diseño, consultar la documentación técnica completa en:

- `/docs/ARQUITECTURA_NUEVOS_MODULOS.md`
- `/docs/EJEMPLOS_APIS.md`
- `/prisma/schema-nuevos-modulos.prisma`
- `/prisma/seed-nuevos-modulos.ts`

---

**Estado**: ✅ Diseño completo - Listo para revisión e implementación
