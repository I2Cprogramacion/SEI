# 📋 REVISIÓN COMPLETA: Actualización de esquema de base de datos

## ✅ COLUMNAS AGREGADAS (todas funcionan correctamente):
- clerk_user_id
- nombres, apellidos, nombre_completo
- ultimo_grado_estudios
- area_investigacion, linea_investigacion
- empleo_actual, institucion, area
- cv_url, fotografia_url, slug
- ultima_actividad, es_admin
- fecha_registro, origen, archivo_procesado

## 🔍 ARCHIVOS QUE USAN LA BASE DE DATOS:

### APIs de Investigadores:
1. ✅ app/api/investigadores/perfil/route.ts - YA ACTUALIZADO (usa clerk_user_id)
2. ⚠️  app/api/investigadores/featured/route.ts - REVISAR (usa slug, area, institucion)
3. ⚠️  app/api/investigadores/route.ts - REVISAR
4. ⚠️  app/api/investigadores/search/route.ts - REVISAR
5. ⚠️  app/api/investigadores/actualizar/route.ts - REVISAR
6. ⚠️  app/api/investigadores/[slug]/route.ts - REVISAR
7. ⚠️  app/api/investigadores/incompletos/route.ts - REVISAR

### APIs de Proyectos:
8. ⚠️  app/api/proyectos/route.ts - REVISAR
9. ⚠️  app/api/proyectos/recent/route.ts - REVISAR

### APIs de Publicaciones:
10. ⚠️  app/api/publicaciones/route.ts - REVISAR

### APIs de Mensajes y Conexiones:
11. ⚠️  app/api/mensajes/no-leidos/route.ts - Usa correo para buscar investigador
12. ⚠️  app/api/conexiones/pendientes/route.ts - Usa correo para buscar investigador

### Lib/Database:
13. ✅ lib/databases/postgresql-database.ts - YA ACTUALIZADO (sin password hash)

## 📝 PLAN DE ACCIÓN:

### Prioridad 1 - CRÍTICO (evita errores):
- [ ] Verificar que TODOS los SELECTs usen columnas que existen
- [ ] Actualizar queries de mensajes/conexiones para usar clerk_user_id O correo
- [ ] Verificar que featured/search no usen columnas inexistentes

### Prioridad 2 - IMPORTANTE (mejora funcionalidad):
- [ ] Actualizar incompletos para usar nuevas columnas
- [ ] Asegurar que proyectos/publicaciones funcionen

### Prioridad 3 - MEJORAS:
- [ ] Optimizar queries para usar índices nuevos
- [ ] Agregar clerk_user_id como búsqueda primaria

## 🎯 SIGUIENTE PASO:
Revisar CADA archivo marcado con ⚠️ y actualizar columnas según sea necesario.
