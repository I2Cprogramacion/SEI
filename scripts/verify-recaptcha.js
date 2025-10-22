#!/usr/bin/env node

/**
 * Script de diagnóstico para reCAPTCHA v2 Clásico
 * Verifica que la configuración sea correcta
 */

console.log("🔍 Diagnóstico de reCAPTCHA v2 Clásico\n");

// Verificar variables de entorno
const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE;
const secretKey = process.env.RECAPTCHA_SECRET;

console.log("📋 Variables de entorno:");
console.log(`NEXT_PUBLIC_RECAPTCHA_SITE: ${siteKey ? "✅ Configurada" : "❌ NO configurada"}`);
console.log(`RECAPTCHA_SECRET: ${secretKey ? "✅ Configurada" : "❌ NO configurada"}\n`);

if (!siteKey || !secretKey) {
  console.error("❌ ERROR: Faltan variables de entorno");
  console.log("\n📝 Agrega a .env.local:");
  console.log("NEXT_PUBLIC_RECAPTCHA_SITE=tu_site_key");
  console.log("RECAPTCHA_SECRET=tu_secret_key\n");
  process.exit(1);
}

// Verificar formato de las claves
console.log("🔑 Verificación de claves:");

const isTestKey = siteKey === "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI";
if (isTestKey) {
  console.log("⚠️  Usando claves de PRUEBA de Google");
  console.log("   Estas claves siempre pasan el CAPTCHA");
  console.log("   NO usar en producción\n");
} else {
  if (siteKey.startsWith("6L")) {
    console.log("✅ Site Key tiene formato válido (empieza con 6L)");
  } else {
    console.log("⚠️  Site Key NO empieza con 6L (puede ser Enterprise o inválida)");
  }

  if (secretKey.startsWith("6L")) {
    console.log("✅ Secret Key tiene formato válido (empieza con 6L)");
  } else {
    console.log("⚠️  Secret Key NO empieza con 6L (puede ser Enterprise o inválida)");
  }
}

console.log("\n🌐 Endpoints correctos:");
console.log("✅ Frontend usa: react-google-recaptcha");
console.log("✅ Backend usa: https://www.google.com/recaptcha/api/siteverify");

console.log("\n📊 Panel de verificación:");
console.log("✅ Clásico: https://www.google.com/recaptcha/admin");
console.log("❌ NO uses: https://console.cloud.google.com (Enterprise)");

console.log("\n🧪 Prueba de verificación simulada:");
console.log("Simulando verificación con Google...\n");

// Simular llamada a siteverify (solo para verificar que el endpoint es alcanzable)
const testToken = "test-token-invalid";

fetch("https://www.google.com/recaptcha/api/siteverify", {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
  },
  body: `secret=${secretKey}&response=${testToken}`,
})
  .then((res) => res.json())
  .then((data) => {
    console.log("📡 Respuesta de Google:");
    console.log(JSON.stringify(data, null, 2));

    if (data["error-codes"]) {
      console.log("\n⚠️  Error codes detectados:");
      data["error-codes"].forEach((code) => {
        switch (code) {
          case "missing-input-secret":
            console.log("   - Secret key falta");
            break;
          case "invalid-input-secret":
            console.log("   - Secret key INVÁLIDA (verifica que sea de v2 clásico)");
            break;
          case "invalid-input-response":
            console.log("   - Token de prueba inválido (esto es ESPERADO)");
            break;
          case "timeout-or-duplicate":
            console.log("   - Token expirado o duplicado");
            break;
          default:
            console.log(`   - ${code}`);
        }
      });
    }

    console.log("\n✅ Verificación completada");
    console.log("\n📝 Próximos pasos:");
    console.log("1. Si 'invalid-input-secret' → Verifica tus claves en .env.local");
    console.log("2. Asegúrate de tener las claves del panel CLÁSICO (no Enterprise)");
    console.log("3. Agrega sei-chih.com.mx y localhost a dominios permitidos");
    console.log("4. Prueba en el navegador completando el CAPTCHA");
  })
  .catch((error) => {
    console.error("❌ Error al conectar con Google:", error.message);
    console.log("\n🔧 Posibles causas:");
    console.log("- Sin conexión a internet");
    console.log("- Firewall bloqueando la conexión");
    console.log("- URL incorrecta (verifica que sea siteverify, no Enterprise)");
  });
