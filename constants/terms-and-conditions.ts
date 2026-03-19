/**
 * TÉRMINOS Y CONDICIONES - Sistema Estatal de Investigadores
 * Última actualización: 19 de Marzo de 2026
 * 
 * Este archivo contiene el contenido oficial de T&C
 * Cambios aquí se reflejan automáticamente en toda la plataforma
 */

export const TERMS_AND_CONDITIONS = {
  version: "1.0",
  lastUpdated: "2026-03-19",
  content: `TÉRMINOS Y CONDICIONES DE USO DE LA PLATAFORMA
DEL SISTEMA ESTATAL DE INVESTIGADORES

El Instituto de Innovación y Competitividad (en lo sucesivo, "el Instituto") pone a disposición de las personas usuarias la Plataforma del Sistema Estatal de Investigadores (en lo sucesivo, "la Plataforma"), la cual se rige por los presentes Términos y Condiciones.

El acceso, registro y uso de la Plataforma implica la aceptación expresa de estos Términos.

---

1. OBJETO DE LA PLATAFORMA

La Plataforma tiene como finalidad facilitar la integración, gestión, consulta y difusión de información relacionada con investigadores, producción científica, proyectos, instituciones y convocatorias, en el marco del Sistema Estatal de Investigadores.

---

2. NATURALEZA DE LA PLATAFORMA

La Plataforma constituye un medio tecnológico de apoyo para la gestión de información y procesos administrativos.

Su uso no implica:

• reconocimiento automático como miembro del Sistema
• validación institucional de la información registrada
• modificación de los procesos de evaluación establecidos en la normativa aplicable

---

3. REGISTRO Y ACCESO

Para el uso de la Plataforma, la persona usuaria deberá crear una cuenta, proporcionando información veraz y actualizada.

El usuario es responsable de:

• la confidencialidad de sus credenciales
• el uso de su cuenta
• cualquier actividad realizada desde la misma

La Plataforma podrá permitir el acceso mediante servicios de terceros (como Google o GitHub), sin que ello implique responsabilidad del Instituto respecto de dichos servicios.

---

4. PERFIL DEL INVESTIGADOR

La información contenida en el perfil del usuario constituye su expediente digital.

El usuario es responsable de:

• la veracidad de los datos personales, académicos y profesionales
• la autenticidad de los documentos que cargue

El Instituto no valida de manera automática dicha información.

---

5. CONTENIDO GENERADO POR EL USUARIO

La Plataforma permite el registro de:

• publicaciones científicas
• proyectos de investigación
• documentos y archivos adjuntos

El usuario garantiza que:

• cuenta con los derechos para compartir dicha información
• el contenido no infringe derechos de terceros

El Instituto podrá retirar contenido que contravenga disposiciones legales o estos Términos.

---

6. USO DE FUNCIONALIDADES DE INTERACCIÓN

La Plataforma podrá incluir funciones de:

• mensajería
• conexiones entre usuarios
• notificaciones

Las personas usuarias se obligan a:

• mantener un uso respetuoso
• abstenerse de enviar contenido ilícito, ofensivo o no relacionado con los fines de la Plataforma

El Instituto no será responsable del contenido generado por usuarios en estas interacciones.

---

7. BÚSQUEDA Y CONSULTA DE INFORMACIÓN

La Plataforma permite la consulta de información de investigadores, instituciones, publicaciones y proyectos.

La información disponible tiene fines informativos y de vinculación académica, sin que implique certificación oficial.

---

8. CONVOCATORIAS Y PROCESOS

Las convocatorias publicadas en la Plataforma se regirán por sus propios términos, requisitos y disposiciones legales.

La Plataforma únicamente facilita su difusión y seguimiento, sin sustituir la normativa aplicable.

---

9. DISPONIBILIDAD DEL SISTEMA

El Instituto procurará la disponibilidad continua de la Plataforma; sin embargo, no garantiza la inexistencia de interrupciones derivadas de:

• mantenimiento técnico
• fallas del sistema
• causas externas

---

10. ADMINISTRACIÓN Y CONTROL

El Instituto, a través del personal autorizado, podrá:

• gestionar usuarios
• supervisar contenidos
• realizar auditorías del sistema

Lo anterior con el fin de garantizar el correcto funcionamiento de la Plataforma.

---

11. PROTECCIÓN DE DATOS PERSONALES

El tratamiento de los datos personales se realizará conforme al Aviso de Privacidad correspondiente, disponible en la Plataforma.

---

12. RESPONSABILIDAD INSTITUCIONAL

El Instituto no será responsable por:

• la veracidad de la información proporcionada por los usuarios
• decisiones derivadas de procesos de evaluación
• interacciones entre usuarios
• el uso indebido de la Plataforma

---

13. MODIFICACIONES

El Instituto podrá modificar los presentes Términos en cualquier momento. Las modificaciones serán publicadas en la Plataforma.

---

14. ACEPTACIÓN

El uso de la Plataforma implica la aceptación plena de los presentes Términos y Condiciones.`,
  
  sections: [
    { id: 1, title: "OBJETO DE LA PLATAFORMA" },
    { id: 2, title: "NATURALEZA DE LA PLATAFORMA" },
    { id: 3, title: "REGISTRO Y ACCESO" },
    { id: 4, title: "PERFIL DEL INVESTIGADOR" },
    { id: 5, title: "CONTENIDO GENERADO POR EL USUARIO" },
    { id: 6, title: "USO DE FUNCIONALIDADES DE INTERACCIÓN" },
    { id: 7, title: "BÚSQUEDA Y CONSULTA DE INFORMACIÓN" },
    { id: 8, title: "CONVOCATORIAS Y PROCESOS" },
    { id: 9, title: "DISPONIBILIDAD DEL SISTEMA" },
    { id: 10, title: "ADMINISTRACIÓN Y CONTROL" },
    { id: 11, title: "PROTECCIÓN DE DATOS PERSONALES" },
    { id: 12, title: "RESPONSABILIDAD INSTITUCIONAL" },
    { id: 13, title: "MODIFICACIONES" },
    { id: 14, title: "ACEPTACIÓN" },
  ]
}

/**
 * Logging para compliance - registra que el usuario aceptó T&C
 * Útil para auditoría y cumplimiento legal
 */
export function logTermsAcceptance(userId: string, email: string, version: string) {
  const timestamp = new Date().toISOString()
  console.log(`✅ [COMPLIANCE] Términos aceptados`)
  console.log(`   - Usuario: ${email}`)
  console.log(`   - Versión T&C: ${version}`)
  console.log(`   - Timestamp: ${timestamp}`)
  
  // En producción, esto debería guardarse en BD
  // Para auditoría y compliance
}
