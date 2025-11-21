/**
 * Script para medir métricas de rendimiento
 * Ejecuta Lighthouse y Web Vitals
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.PERFORMANCE_TEST_URL || 'http://localhost:3000';
const OUTPUT_DIR = path.join(__dirname, '../test-results/performance');

// Crear directorio de resultados si no existe
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const pages = [
  { name: 'home', url: '/' },
  { name: 'publicaciones', url: '/publicaciones' },
  { name: 'proyectos', url: '/proyectos' },
  { name: 'investigadores', url: '/investigadores' },
];

console.log('🚀 Iniciando medición de métricas de rendimiento...\n');

const results = [];

pages.forEach(({ name, url }) => {
  console.log(`📊 Analizando: ${name} (${url})`);
  
  try {
    const fullUrl = `${BASE_URL}${url}`;
    
    // Ejecutar Lighthouse (si está instalado)
    try {
      const lighthouseCmd = `npx lighthouse ${fullUrl} --output=json --output-path=${OUTPUT_DIR}/${name}-lighthouse.json --chrome-flags="--headless" --quiet`;
      execSync(lighthouseCmd, { stdio: 'inherit' });
      
      // Leer resultados
      const lighthouseData = JSON.parse(
        fs.readFileSync(`${OUTPUT_DIR}/${name}-lighthouse.json`, 'utf8')
      );
      
      const scores = {
        performance: Math.round(lighthouseData.categories.performance.score * 100),
        accessibility: Math.round(lighthouseData.categories.accessibility.score * 100),
        bestPractices: Math.round(lighthouseData.categories['best-practices'].score * 100),
        seo: Math.round(lighthouseData.categories.seo.score * 100),
      };
      
      results.push({
        page: name,
        url,
        scores,
        metrics: {
          fcp: lighthouseData.audits['first-contentful-paint'].numericValue,
          lcp: lighthouseData.audits['largest-contentful-paint'].numericValue,
          tti: lighthouseData.audits['interactive'].numericValue,
          cls: lighthouseData.audits['cumulative-layout-shift'].numericValue,
        }
      });
      
      console.log(`  ✅ Performance: ${scores.performance}/100`);
      console.log(`  ✅ Accessibility: ${scores.accessibility}/100`);
      console.log(`  ✅ Best Practices: ${scores.bestPractices}/100`);
      console.log(`  ✅ SEO: ${scores.seo}/100\n`);
    } catch (error) {
      console.log(`  ⚠️  Lighthouse no disponible, saltando análisis detallado\n`);
    }
  } catch (error) {
    console.error(`  ❌ Error analizando ${name}:`, error.message);
  }
});

// Generar reporte
const report = {
  timestamp: new Date().toISOString(),
  baseUrl: BASE_URL,
  results,
  summary: {
    averagePerformance: Math.round(
      results.reduce((sum, r) => sum + r.scores.performance, 0) / results.length
    ),
    averageAccessibility: Math.round(
      results.reduce((sum, r) => sum + r.scores.accessibility, 0) / results.length
    ),
  }
};

fs.writeFileSync(
  `${OUTPUT_DIR}/performance-report.json`,
  JSON.stringify(report, null, 2)
);

console.log('\n📈 Resumen de Métricas:');
console.log(`  Performance promedio: ${report.summary.averagePerformance}/100`);
console.log(`  Accessibility promedio: ${report.summary.averageAccessibility}/100`);
console.log(`\n✅ Reporte guardado en: ${OUTPUT_DIR}/performance-report.json`);

