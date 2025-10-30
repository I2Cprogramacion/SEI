#!/bin/bash

# =============================================================================
# Script de Diagnóstico: Servicio OCR en Railway
# =============================================================================
# 
# Este script verifica el estado del servicio OCR desplegado en Railway
# y diagnostica problemas comunes.
#
# Uso:
#   chmod +x test-railway-ocr.sh
#   ./test-railway-ocr.sh https://tu-servicio.railway.app
#
# =============================================================================

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# URL del servicio (primer argumento o variable de entorno)
RAILWAY_URL="${1:-$PDF_PROCESSOR_URL}"

if [ -z "$RAILWAY_URL" ]; then
  echo -e "${RED}❌ ERROR: No se proporcionó URL del servicio Railway${NC}"
  echo ""
  echo "Uso:"
  echo "  $0 https://tu-servicio.railway.app"
  echo ""
  echo "O configura la variable de entorno:"
  echo "  export PDF_PROCESSOR_URL=https://tu-servicio.railway.app"
  exit 1
fi

# Remover trailing slash
RAILWAY_URL="${RAILWAY_URL%/}"

echo ""
echo "=========================================="
echo "🔍 DIAGNÓSTICO DE SERVICIO OCR EN RAILWAY"
echo "=========================================="
echo ""
echo "URL del servicio: ${BLUE}${RAILWAY_URL}${NC}"
echo ""

# =============================================================================
# TEST 1: Verificar conectividad básica
# =============================================================================
echo "----------------------------------------"
echo "📡 Test 1: Conectividad básica"
echo "----------------------------------------"

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "${RAILWAY_URL}" 2>/dev/null)

if [ "$HTTP_CODE" = "000" ]; then
  echo -e "${RED}❌ FALLO: No se pudo conectar al servicio${NC}"
  echo ""
  echo "Posibles causas:"
  echo "  - La URL es incorrecta"
  echo "  - Railway está caído"
  echo "  - Firewall bloqueando la conexión"
  echo "  - El servicio no está desplegado"
  echo ""
  exit 1
elif [ "$HTTP_CODE" = "404" ] || [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✅ ÉXITO: El servicio responde${NC}"
  echo "   HTTP Status: ${HTTP_CODE}"
else
  echo -e "${YELLOW}⚠️  ADVERTENCIA: Respuesta inusual${NC}"
  echo "   HTTP Status: ${HTTP_CODE}"
fi

echo ""

# =============================================================================
# TEST 2: Verificar endpoint /health (si existe)
# =============================================================================
echo "----------------------------------------"
echo "🏥 Test 2: Health Check"
echo "----------------------------------------"

HEALTH_RESPONSE=$(curl -s --max-time 5 "${RAILWAY_URL}/health" 2>/dev/null)
HEALTH_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "${RAILWAY_URL}/health" 2>/dev/null)

if [ "$HEALTH_CODE" = "200" ]; then
  echo -e "${GREEN}✅ ÉXITO: Endpoint /health responde${NC}"
  echo "   Respuesta: ${HEALTH_RESPONSE}"
elif [ "$HEALTH_CODE" = "404" ]; then
  echo -e "${YELLOW}⚠️  ADVERTENCIA: Endpoint /health no existe${NC}"
  echo "   (Esto es normal si no está implementado)"
else
  echo -e "${RED}❌ FALLO: Endpoint /health no responde correctamente${NC}"
  echo "   HTTP Status: ${HEALTH_CODE}"
fi

echo ""

# =============================================================================
# TEST 3: Medir tiempo de respuesta (Cold Start)
# =============================================================================
echo "----------------------------------------"
echo "⏱️  Test 3: Tiempo de Respuesta"
echo "----------------------------------------"

START_TIME=$(date +%s.%N)
curl -s --max-time 30 "${RAILWAY_URL}" > /dev/null 2>&1
END_TIME=$(date +%s.%N)

RESPONSE_TIME=$(echo "$END_TIME - $START_TIME" | bc)
RESPONSE_TIME_MS=$(echo "$RESPONSE_TIME * 1000" | bc | cut -d'.' -f1)

echo "   Tiempo de respuesta: ${RESPONSE_TIME_MS}ms"

if (( RESPONSE_TIME_MS < 1000 )); then
  echo -e "${GREEN}✅ EXCELENTE: Respuesta muy rápida${NC}"
elif (( RESPONSE_TIME_MS < 5000 )); then
  echo -e "${GREEN}✅ BUENO: Respuesta aceptable${NC}"
elif (( RESPONSE_TIME_MS < 15000 )); then
  echo -e "${YELLOW}⚠️  ADVERTENCIA: Respuesta lenta (posible cold start)${NC}"
else
  echo -e "${RED}❌ FALLO: Respuesta muy lenta (>15s)${NC}"
  echo "   Posibles causas:"
  echo "     - Cold start de Railway"
  echo "     - Problemas de rendimiento"
  echo "     - Servicio sobrecargado"
fi

echo ""

# =============================================================================
# TEST 4: Verificar endpoint /process-pdf (sin archivo)
# =============================================================================
echo "----------------------------------------"
echo "📄 Test 4: Endpoint /process-pdf"
echo "----------------------------------------"

PROCESS_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 \
  -X POST "${RAILWAY_URL}/process-pdf" 2>/dev/null)

if [ "$PROCESS_CODE" = "400" ]; then
  echo -e "${GREEN}✅ ÉXITO: Endpoint /process-pdf existe${NC}"
  echo "   HTTP Status: ${PROCESS_CODE} (esperado sin archivo)"
elif [ "$PROCESS_CODE" = "404" ]; then
  echo -e "${RED}❌ FALLO: Endpoint /process-pdf no existe${NC}"
  echo "   Verifica que el endpoint correcto esté desplegado"
elif [ "$PROCESS_CODE" = "500" ]; then
  echo -e "${RED}❌ FALLO: Error interno del servidor${NC}"
  echo "   Revisa los logs de Railway"
else
  echo -e "${YELLOW}⚠️  ADVERTENCIA: Respuesta inusual${NC}"
  echo "   HTTP Status: ${PROCESS_CODE}"
fi

echo ""

# =============================================================================
# TEST 5: Verificar headers y configuración
# =============================================================================
echo "----------------------------------------"
echo "🔧 Test 5: Configuración y Headers"
echo "----------------------------------------"

HEADERS=$(curl -s -I --max-time 10 "${RAILWAY_URL}" 2>/dev/null)

echo "Headers recibidos:"
echo "$HEADERS" | grep -E "^(HTTP|Server|Content-Type|X-|Access-Control)" || echo "   (No headers relevantes)"

echo ""

# Verificar CORS
if echo "$HEADERS" | grep -q "Access-Control-Allow-Origin"; then
  echo -e "${GREEN}✅ CORS configurado${NC}"
else
  echo -e "${YELLOW}⚠️  CORS no detectado (puede causar problemas en navegador)${NC}"
fi

echo ""

# =============================================================================
# RESUMEN
# =============================================================================
echo "=========================================="
echo "📊 RESUMEN DEL DIAGNÓSTICO"
echo "=========================================="
echo ""

if [ "$HTTP_CODE" != "000" ] && [ "$PROCESS_CODE" != "404" ]; then
  echo -e "${GREEN}✅ El servicio de Railway parece estar funcionando${NC}"
  echo ""
  echo "Próximos pasos:"
  echo "  1. Verificar que PDF_PROCESSOR_URL esté configurada en Vercel"
  echo "  2. Probar subida de CV desde la aplicación"
  echo "  3. Revisar logs de Railway para errores específicos"
else
  echo -e "${RED}❌ Se detectaron problemas con el servicio de Railway${NC}"
  echo ""
  echo "Acciones recomendadas:"
  echo "  1. Verificar que el servicio esté desplegado en Railway"
  echo "  2. Revisar logs de Railway para errores"
  echo "  3. Verificar que la URL sea correcta"
  echo "  4. Considerar redeploy del servicio"
fi

echo ""
echo "Para más información, consulta: DIAGNOSTICO_RAILWAY_OCR.md"
echo ""

