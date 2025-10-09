# Checklist de Deploy de Prueba

## ✅ Configuración Completada

### 1. Variables de Entorno
- [x] `NEXT_PUBLIC_ADMIN_EMAIL` configurado en `env.example`
- [x] Email de admin movido a variable de entorno
- [x] Configuración de base de datos lista para producción

### 2. Limpieza de Datos Mock
- [x] Eliminado `generateFakeDOI` → `generateTemporaryDOI`
- [x] DOI temporal cambiado de `10.1234/` a `10.temp/`
- [x] Placeholder de DOI actualizado a `10.xxxx/xxxxx`
- [x] Eliminado archivo de test `/api/test/route.ts`
- [x] Removido enlace de ejemplo en redes sociales

### 3. Configuración de Producción
- [x] `vercel.json` limpiado (removido localhost)
- [x] Middleware configurado con variables de entorno
- [x] Layout de admin configurado con variables de entorno
- [x] Modal de acceso denegado configurado con variables de entorno

### 4. Base de Datos
- [x] Configuración automática según entorno
- [x] Vercel Postgres configurado para producción
- [x] SQLite como fallback para desarrollo

## 🚀 Pasos para Deploy

### 1. Configurar Variables de Entorno en Vercel
```bash
# Variables requeridas
NEXT_PUBLIC_ADMIN_EMAIL=admin@sei.com.mx
JWT_SECRET=tu-jwt-secret-seguro
NODE_ENV=production

# Variables de Vercel Postgres (se configuran automáticamente)
POSTGRES_HOST
POSTGRES_PORT
POSTGRES_DATABASE
POSTGRES_USER
POSTGRES_PASSWORD

# Variables opcionales
PDF_PROCESSOR_URL=https://tu-servidor-ocr.com
```

### 2. Verificar Base de Datos
- [ ] Crear base de datos PostgreSQL en Vercel
- [ ] Ejecutar migraciones de Prisma
- [ ] Crear usuario administrador

### 3. Deploy
```bash
# Instalar dependencias
npm install

# Build de producción
npm run build

# Deploy a Vercel
vercel --prod
```

### 4. Post-Deploy
- [ ] Verificar que la aplicación carga correctamente
- [ ] Probar login de administrador
- [ ] Verificar que el botón de gestión solo aparece para admin
- [ ] Probar subida de publicaciones
- [ ] Verificar generación de DOI temporal

## 🔧 Configuración de Admin

### Crear Usuario Administrador
```sql
-- Ejecutar en la base de datos PostgreSQL
INSERT INTO usuarios (
  email, 
  password_hash, 
  nombre, 
  isAdmin, 
  email_verificado
) VALUES (
  'admin@sei.com.mx',
  'hash_de_contraseña_segura',
  'Administrador',
  true,
  true
);
```

### O usar el script de creación
```bash
node scripts/create-admin-vercel.js
```

## 📝 Notas Importantes

1. **DOI Temporal**: Los DOI generados automáticamente usan el formato `10.temp/` para indicar que son temporales
2. **Autenticación**: Solo usuarios con `isAdmin: true` y email configurado pueden acceder a la gestión
3. **Base de Datos**: Se configura automáticamente según el entorno (SQLite en desarrollo, PostgreSQL en producción)
4. **Variables de Entorno**: Todas las configuraciones sensibles están en variables de entorno

## 🐛 Troubleshooting

### Si el botón de gestión no aparece
- Verificar que `NEXT_PUBLIC_ADMIN_EMAIL` esté configurado
- Verificar que el usuario tenga `isAdmin: true`
- Verificar que el email del usuario coincida con la variable de entorno

### Si hay errores de base de datos
- Verificar que las variables de PostgreSQL estén configuradas
- Ejecutar `npx prisma db push` para sincronizar el schema
- Verificar que el usuario de la base de datos tenga permisos

### Si hay errores de build
- Verificar que todas las variables de entorno estén configuradas
- Ejecutar `npm run build` localmente para verificar errores
- Revisar los logs de Vercel para más detalles
