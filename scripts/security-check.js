/**
 * Script básico de verificación de seguridad
 * Verifica configuraciones comunes de seguridad
 */

const fs = require('fs');
const path = require('path');

console.log(' Verificando configuraciones de seguridad...\n');

const checks = [];
let issues = 0;

// Verificar variables de entorno sensibles
function checkEnvFile() {
  const envExample = path.join(__dirname, '../env.local.example');
  const envLocal = path.join(__dirname, '../.env.local');
  
  if (fs.existsSync(envLocal)) {
    const envContent = fs.readFileSync(envLocal, 'utf8');
    
    // Verificar que no hay credenciales hardcodeadas
    if (envContent.includes('password') && envContent.includes('=')) {
      const hasPassword = envContent.match(/password\s*=\s*['"]?[^'"]+['"]?/i);
      if (hasPassword && !hasPassword[0].includes('${') && !hasPassword[0].includes('process.env')) {
        checks.push({ type: 'warning', message: 'Posible contraseña hardcodeada en .env.local' });
        issues++;
      }
    }
    
    // Verificar que .env.local está en .gitignore
    const gitignore = fs.readFileSync(path.join(__dirname, '../.gitignore'), 'utf8');
    if (!gitignore.includes('.env.local')) {
      checks.push({ type: 'error', message: '.env.local no está en .gitignore' });
      issues++;
    } else {
      checks.push({ type: 'success', message: '.env.local está en .gitignore' });
    }
  } else {
    checks.push({ type: 'info', message: '.env.local no existe (usando variables de entorno del sistema)' });
  }
}

// Verificar headers de seguridad en next.config
function checkNextConfig() {
  const nextConfig = path.join(__dirname, '../next.config.mjs');
  
  if (fs.existsSync(nextConfig)) {
    const configContent = fs.readFileSync(nextConfig, 'utf8');
    
    // Verificar headers de seguridad
    if (configContent.includes('headers')) {
      checks.push({ type: 'success', message: 'next.config.mjs tiene configuración de headers' });
    } else {
      checks.push({ type: 'warning', message: 'Considera agregar headers de seguridad en next.config.mjs' });
    }
  }
}

// Verificar middleware de autenticación
function checkMiddleware() {
  const middleware = path.join(__dirname, '../middleware.ts');
  
  if (fs.existsSync(middleware)) {
    const middlewareContent = fs.readFileSync(middleware, 'utf8');
    
    if (middlewareContent.includes('authMiddleware') || middlewareContent.includes('clerkMiddleware')) {
      checks.push({ type: 'success', message: 'Middleware de autenticación configurado' });
    } else {
      checks.push({ type: 'warning', message: 'Verifica que el middleware de autenticación esté correctamente configurado' });
    }
  }
}

// Verificar que no hay secretos en el código
function checkForSecrets() {
  const srcDir = path.join(__dirname, '../app');
  
  function scanDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        scanDirectory(filePath);
      } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js')) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Patrones comunes de secretos
        const secretPatterns = [
          /api[_-]?key\s*[:=]\s*['"]([^'"]+)['"]/i,
          /secret\s*[:=]\s*['"]([^'"]+)['"]/i,
          /password\s*[:=]\s*['"]([^'"]{8,})['"]/i,
        ];
        
        secretPatterns.forEach(pattern => {
          const match = content.match(pattern);
          if (match && !match[0].includes('process.env') && !match[0].includes('${')) {
            checks.push({
              type: 'error',
              message: `Posible secreto hardcodeado en ${path.relative(__dirname, filePath)}`
            });
            issues++;
          }
        });
      }
    });
  }
  
  scanDirectory(srcDir);
}

// Ejecutar verificaciones
checkEnvFile();
checkNextConfig();
checkMiddleware();
checkForSecrets();

// Mostrar resultados
checks.forEach(check => {
  const icon = check.type === 'success' ? '✅' : check.type === 'warning' ? '⚠️' : check.type === 'error' ? '❌' : 'ℹ️';
  console.log(`${icon} ${check.message}`);
});

console.log(`\n📊 Resumen: ${checks.filter(c => c.type === 'success').length} verificaciones exitosas`);
if (issues > 0) {
  console.log(`⚠️  ${issues} problemas encontrados`);
} else {
  console.log('✅ No se encontraron problemas críticos de seguridad');
}

// Guardar reporte
const report = {
  timestamp: new Date().toISOString(),
  checks,
  issues,
  summary: {
    total: checks.length,
    success: checks.filter(c => c.type === 'success').length,
    warnings: checks.filter(c => c.type === 'warning').length,
    errors: checks.filter(c => c.type === 'error').length,
  }
};

const outputDir = path.join(__dirname, '../test-results/security');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(
  `${outputDir}/security-report.json`,
  JSON.stringify(report, null, 2)
);

console.log(`\n📄 Reporte guardado en: ${outputDir}/security-report.json`);

