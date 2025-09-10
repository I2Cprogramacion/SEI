# Guía de Deployment - Sistema SEI

Esta guía explica cómo desplegar el sistema SEI en testing y producción.

## 🏗️ Arquitectura de Deployment

### Componentes
1. **Frontend + API Next.js**: Desplegado en Vercel
2. **Servidor de OCR Python**: Desplegado en Railway/Fly/Render
3. **Base de datos**: PostgreSQL en Vercel

## 🚀 Deployment Rápido (Testing)

### 1. Frontend en Vercel
```bash
# Push a la rama de testing
git add .
git commit -m "feat: sistema de procesamiento de PDFs con fallback"
git push origin testing
```

El frontend se desplegará automáticamente en Vercel. **El OCR funcionará en modo fallback** (formulario manual).

### 2. Configurar Variables de Entorno en Vercel
En el dashboard de Vercel, añade:
```
PDF_PROCESSOR_URL=http://localhost:8001
```

## 🔧 Deployment Completo (Producción)

### 1. Desplegar Servidor de OCR

#### Opción A: Railway (Recomendado)
```bash
cd scripts
./deploy_ocr.sh
```

#### Opción B: Fly.io
```bash
cd scripts
fly launch
fly deploy
```

#### Opción C: Render
1. Conecta tu repositorio
2. Selecciona el directorio `scripts/`
3. Usa el Dockerfile incluido

### 2. Configurar Variables de Entorno

Una vez desplegado el servidor OCR, actualiza en Vercel:
```
PDF_PROCESSOR_URL=https://tu-servidor-ocr.railway.app
```

### 3. Redeploy en Vercel
```bash
git push origin main  # o la rama de producción
```

## 🧪 Verificación

### 1. Verificar Servidor OCR
```bash
curl https://tu-servidor-ocr.railway.app/health
```

### 2. Verificar Frontend
- Ve a `/registro`
- Sube un PDF
- Verifica que se procese o muestre fallback

## 🔄 Estados del Sistema

### Modo Fallback (Sin OCR)
- ✅ Frontend funciona completamente
- ✅ Formulario de registro disponible
- ✅ Llenado manual de datos
- ⚠️ Sin procesamiento automático de PDFs

### Modo Completo (Con OCR)
- ✅ Frontend funciona completamente
- ✅ Procesamiento automático de PDFs
- ✅ Extracción de datos del Perfil Único
- ✅ Formulario se llena automáticamente

## 🛠️ Solución de Problemas

### Error: "Servidor de OCR no disponible"
- **Causa**: `PDF_PROCESSOR_URL` apunta a localhost o servidor caído
- **Solución**: Verificar URL en variables de entorno de Vercel

### Error: "Timeout en procesamiento"
- **Causa**: Servidor OCR lento o sobrecargado
- **Solución**: Aumentar timeout o escalar servidor

### Error: "CORS"
- **Causa**: Servidor OCR no permite dominio de Vercel
- **Solución**: Actualizar `allow_origins` en `pdf_server.py`

## 📊 Monitoreo

### Vercel
- Dashboard: https://vercel.com/dashboard
- Logs de funciones en tiempo real
- Métricas de rendimiento

### Railway/Fly
- Logs del servidor OCR
- Métricas de CPU/memoria
- Estado de salud del servicio

## 🔒 Seguridad en Producción

### Variables de Entorno Sensibles
- `JWT_SECRET`: Generar nuevo para producción
- `POSTGRES_URL`: Configurada automáticamente por Vercel
- `PDF_PROCESSOR_URL`: URL pública del servidor OCR

### CORS
El servidor OCR debe permitir:
```python
allow_origins=[
    "https://tu-app.vercel.app",
    "https://tu-app-git-testing.vercel.app"
]
```

## 📈 Escalabilidad

### Servidor OCR
- **Railway**: Escala automáticamente
- **Fly.io**: Configurar auto-scaling
- **Render**: Planes escalables

### Base de Datos
- **Vercel Postgres**: Escala automáticamente
- **Límites**: Revisar en dashboard de Vercel

## 🚨 Rollback

### Si algo falla:
1. **Frontend**: Revertir commit en Vercel
2. **OCR**: Desplegar versión anterior
3. **Base de datos**: Restaurar backup si es necesario

### Comando de rollback:
```bash
git revert <commit-hash>
git push origin main
```

## 📞 Soporte

### Logs Importantes
- **Vercel**: Function logs en dashboard
- **OCR**: Logs del servidor Python
- **Base de datos**: Logs de Vercel Postgres

### Debugging
1. Revisar logs de Vercel
2. Probar endpoint OCR directamente
3. Verificar variables de entorno
4. Probar con PDF de ejemplo

## ✅ Checklist de Deployment

### Pre-deployment
- [ ] Código probado localmente
- [ ] Variables de entorno configuradas
- [ ] Servidor OCR desplegado y funcionando
- [ ] CORS configurado correctamente

### Post-deployment
- [ ] Frontend accesible
- [ ] Formulario de registro funciona
- [ ] OCR procesa PDFs correctamente
- [ ] Base de datos conectada
- [ ] Logs sin errores críticos

### Monitoreo continuo
- [ ] Verificar salud del servidor OCR
- [ ] Revisar logs periódicamente
- [ ] Monitorear métricas de rendimiento
- [ ] Backup de base de datos
