# =============================================================================
# Script de Diagnóstico: Servicio OCR en Railway (PowerShell)
# =============================================================================
# 
# Este script verifica el estado del servicio OCR desplegado en Railway
# y diagnostica problemas comunes.
#
# Uso:
#   .\test-railway-ocr.ps1 -Url "https://tu-servicio.railway.app"
#
# O usando variable de entorno:
#   $env:PDF_PROCESSOR_URL = "https://tu-servicio.railway.app"
#   .\test-railway-ocr.ps1
#
# =============================================================================

param(
    [string]$Url = $env:PDF_PROCESSOR_URL
)

# Funciones de colores
function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Write-Warning-Custom {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Blue
}

# Verificar que se proporcionó URL
if ([string]::IsNullOrWhiteSpace($Url)) {
    Write-Error-Custom "No se proporcionó URL del servicio Railway"
    Write-Host ""
    Write-Host "Uso:"
    Write-Host "  .\test-railway-ocr.ps1 -Url `"https://tu-servicio.railway.app`""
    Write-Host ""
    Write-Host "O configura la variable de entorno:"
    Write-Host "  `$env:PDF_PROCESSOR_URL = `"https://tu-servicio.railway.app`""
    exit 1
}

# Remover trailing slash
$Url = $Url.TrimEnd('/')

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "🔍 DIAGNÓSTICO DE SERVICIO OCR EN RAILWAY" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "URL del servicio: " -NoNewline
Write-Host $Url -ForegroundColor Blue
Write-Host ""

# =============================================================================
# TEST 1: Verificar conectividad básica
# =============================================================================
Write-Host "----------------------------------------" -ForegroundColor Gray
Write-Host "📡 Test 1: Conectividad básica" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Gray

try {
    $response = Invoke-WebRequest -Uri $Url -Method Get -TimeoutSec 10 -ErrorAction Stop
    $statusCode = $response.StatusCode
    
    if ($statusCode -eq 200 -or $statusCode -eq 404) {
        Write-Success "El servicio responde"
        Write-Host "   HTTP Status: $statusCode"
    } else {
        Write-Warning-Custom "Respuesta inusual"
        Write-Host "   HTTP Status: $statusCode"
    }
} catch {
    if ($_.Exception.Message -match "Unable to connect") {
        Write-Error-Custom "No se pudo conectar al servicio"
        Write-Host ""
        Write-Host "Posibles causas:"
        Write-Host "  - La URL es incorrecta"
        Write-Host "  - Railway está caído"
        Write-Host "  - Firewall bloqueando la conexión"
        Write-Host "  - El servicio no está desplegado"
        Write-Host ""
        exit 1
    } elseif ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Warning-Custom "Respuesta inusual"
        Write-Host "   HTTP Status: $statusCode"
    } else {
        Write-Error-Custom "Error de conexión: $($_.Exception.Message)"
    }
}

Write-Host ""

# =============================================================================
# TEST 2: Verificar endpoint /health (si existe)
# =============================================================================
Write-Host "----------------------------------------" -ForegroundColor Gray
Write-Host "🏥 Test 2: Health Check" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Gray

try {
    $healthResponse = Invoke-WebRequest -Uri "$Url/health" -Method Get -TimeoutSec 5 -ErrorAction Stop
    $healthCode = $healthResponse.StatusCode
    
    if ($healthCode -eq 200) {
        Write-Success "Endpoint /health responde"
        Write-Host "   Respuesta: $($healthResponse.Content)"
    }
} catch {
    if ($_.Exception.Response) {
        $healthCode = $_.Exception.Response.StatusCode.value__
        if ($healthCode -eq 404) {
            Write-Warning-Custom "Endpoint /health no existe"
            Write-Host "   (Esto es normal si no está implementado)"
        } else {
            Write-Error-Custom "Endpoint /health no responde correctamente"
            Write-Host "   HTTP Status: $healthCode"
        }
    } else {
        Write-Warning-Custom "No se pudo verificar /health"
    }
}

Write-Host ""

# =============================================================================
# TEST 3: Medir tiempo de respuesta (Cold Start)
# =============================================================================
Write-Host "----------------------------------------" -ForegroundColor Gray
Write-Host "⏱️  Test 3: Tiempo de Respuesta" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Gray

$startTime = Get-Date
try {
    $testResponse = Invoke-WebRequest -Uri $Url -Method Get -TimeoutSec 30 -ErrorAction Stop
    $endTime = Get-Date
    $responseTime = ($endTime - $startTime).TotalMilliseconds
    
    Write-Host "   Tiempo de respuesta: $([math]::Round($responseTime, 0))ms"
    
    if ($responseTime -lt 1000) {
        Write-Success "EXCELENTE: Respuesta muy rápida"
    } elseif ($responseTime -lt 5000) {
        Write-Success "BUENO: Respuesta aceptable"
    } elseif ($responseTime -lt 15000) {
        Write-Warning-Custom "Respuesta lenta (posible cold start)"
    } else {
        Write-Error-Custom "Respuesta muy lenta (>15s)"
        Write-Host "   Posibles causas:"
        Write-Host "     - Cold start de Railway"
        Write-Host "     - Problemas de rendimiento"
        Write-Host "     - Servicio sobrecargado"
    }
} catch {
    Write-Error-Custom "No se pudo medir el tiempo de respuesta"
}

Write-Host ""

# =============================================================================
# TEST 4: Verificar endpoint /process-pdf (sin archivo)
# =============================================================================
Write-Host "----------------------------------------" -ForegroundColor Gray
Write-Host "📄 Test 4: Endpoint /process-pdf" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Gray

try {
    $processResponse = Invoke-WebRequest -Uri "$Url/process-pdf" -Method Post -TimeoutSec 10 -ErrorAction Stop
    $processCode = $processResponse.StatusCode
    
    Write-Warning-Custom "Respuesta inusual del endpoint"
    Write-Host "   HTTP Status: $processCode"
} catch {
    if ($_.Exception.Response) {
        $processCode = $_.Exception.Response.StatusCode.value__
        
        if ($processCode -eq 400) {
            Write-Success "Endpoint /process-pdf existe"
            Write-Host "   HTTP Status: $processCode (esperado sin archivo)"
        } elseif ($processCode -eq 404) {
            Write-Error-Custom "Endpoint /process-pdf no existe"
            Write-Host "   Verifica que el endpoint correcto esté desplegado"
        } elseif ($processCode -eq 500) {
            Write-Error-Custom "Error interno del servidor"
            Write-Host "   Revisa los logs de Railway"
        } else {
            Write-Warning-Custom "Respuesta inusual"
            Write-Host "   HTTP Status: $processCode"
        }
    } else {
        Write-Error-Custom "No se pudo verificar el endpoint /process-pdf"
    }
}

Write-Host ""

# =============================================================================
# TEST 5: Verificar headers y configuración
# =============================================================================
Write-Host "----------------------------------------" -ForegroundColor Gray
Write-Host "🔧 Test 5: Configuración y Headers" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Gray

try {
    $headersResponse = Invoke-WebRequest -Uri $Url -Method Head -TimeoutSec 10 -ErrorAction Stop
    
    Write-Host "Headers recibidos:"
    $relevantHeaders = $headersResponse.Headers.GetEnumerator() | 
        Where-Object { $_.Key -match "^(Server|Content-Type|X-|Access-Control)" }
    
    if ($relevantHeaders) {
        foreach ($header in $relevantHeaders) {
            Write-Host "   $($header.Key): $($header.Value)"
        }
    } else {
        Write-Host "   (No headers relevantes)"
    }
    
    Write-Host ""
    
    # Verificar CORS
    if ($headersResponse.Headers.ContainsKey("Access-Control-Allow-Origin")) {
        Write-Success "CORS configurado"
    } else {
        Write-Warning-Custom "CORS no detectado (puede causar problemas en navegador)"
    }
} catch {
    Write-Warning-Custom "No se pudieron obtener los headers"
}

Write-Host ""

# =============================================================================
# RESUMEN
# =============================================================================
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "📊 RESUMEN DEL DIAGNÓSTICO" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Variable para determinar si el servicio funciona
$serviceWorking = $true

try {
    $finalCheck = Invoke-WebRequest -Uri "$Url/process-pdf" -Method Post -TimeoutSec 5 -ErrorAction Stop
} catch {
    if ($_.Exception.Response) {
        $finalCode = $_.Exception.Response.StatusCode.value__
        if ($finalCode -eq 404 -or $finalCode -eq 500) {
            $serviceWorking = $false
        }
    } else {
        $serviceWorking = $false
    }
}

if ($serviceWorking) {
    Write-Success "El servicio de Railway parece estar funcionando"
    Write-Host ""
    Write-Host "Próximos pasos:"
    Write-Host "  1. Verificar que PDF_PROCESSOR_URL esté configurada en Vercel"
    Write-Host "  2. Probar subida de CV desde la aplicación"
    Write-Host "  3. Revisar logs de Railway para errores específicos"
} else {
    Write-Error-Custom "Se detectaron problemas con el servicio de Railway"
    Write-Host ""
    Write-Host "Acciones recomendadas:"
    Write-Host "  1. Verificar que el servicio esté desplegado en Railway"
    Write-Host "  2. Revisar logs de Railway para errores"
    Write-Host "  3. Verificar que la URL sea correcta"
    Write-Host "  4. Considerar redeploy del servicio"
}

Write-Host ""
Write-Host "Para más información, consulta: DIAGNOSTICO_RAILWAY_OCR.md" -ForegroundColor Cyan
Write-Host ""

# =============================================================================
# TEST ADICIONAL: Verificar variable de entorno en el sistema
# =============================================================================
Write-Host "----------------------------------------" -ForegroundColor Gray
Write-Host "🔑 Test Adicional: Variables de Entorno" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Gray

if ($env:PDF_PROCESSOR_URL) {
    Write-Success "PDF_PROCESSOR_URL está configurada localmente"
    Write-Host "   Valor: $env:PDF_PROCESSOR_URL"
} else {
    Write-Warning-Custom "PDF_PROCESSOR_URL NO está configurada localmente"
    Write-Host "   Esto es normal si solo la usas en Vercel/producción"
}

Write-Host ""

