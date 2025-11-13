import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { guardarInvestigador } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic'; // evita prerender/edge accidental

export async function POST(request: NextRequest) {
  try {
    const RAW = process.env.PDF_PROCESSOR_URL;
    if (!RAW) {
      return NextResponse.json(
        { error: 'PDF_PROCESSOR_URL no está definida' },
        { status: 500 }
      );
    }
    const BASE = RAW.replace(/\/$/, '');
    if (!/^https:\/\//i.test(BASE) || /localhost|127\.0\.0\.1/i.test(BASE)) {
      return NextResponse.json(
        { error: 'PDF_PROCESSOR_URL inválida para producción' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    // Log: archivo recibido
    // (Eliminados logs de archivo recibido y bytes para reducir el rate limit)

    if (!file) return NextResponse.json({ error: 'No se proporcionó archivo' }, { status: 400 });
    if (!file.type?.includes('pdf')) {
      return NextResponse.json({ error: 'El archivo debe ser PDF' }, { status: 400 });
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'PDF demasiado grande (máx 10MB)' }, { status: 400 });
    }

    // Reenvío al backend OCR en Railway
    const ab = await file.arrayBuffer();
    const blob = new Blob([ab], { type: file.type });
    const upstreamForm = new FormData();
    upstreamForm.append('file', blob, file.name);
    // (Eliminado log de envío de archivo para reducir el rate limit)

    const url = `${BASE}/process-pdf`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 55_000);

    let upstream: Response;
    try {
      upstream = await fetch(url, { method: 'POST', body: upstreamForm, signal: controller.signal });
    } finally {
      clearTimeout(timeout);
    }

    // Log: status y cuerpo de la respuesta del backend OCR
    const rawText = await upstream.clone().text().catch(() => '[no se pudo leer cuerpo]');
    // (Eliminado log de respuesta backend OCR para reducir el rate limit)

    if (!upstream.ok) {
      console.error('Backend OCR', upstream.status, rawText);
      return NextResponse.json({ error: `Backend OCR ${upstream.status}: ${rawText || 'sin cuerpo'}` }, { status: 502 });
    }


    const ct = upstream.headers.get('content-type') || '';
    const payload = ct.includes('application/json') ? await upstream.json() : { data: rawText };
    
    // Extraer los campos del payload
    let fields = (payload as any).data || payload;
    console.log('📦 Campos recibidos del backend OCR:', JSON.stringify(fields, null, 2));

    // Verificar si el backend devolvió el texto plano que necesitamos procesar
    // El backend SIEMPRE devuelve estructura {curp, rfc, no_cvu, correo, telefono, ...}
    // Si NO tiene 'text', significa que el backend ya intentó extraer (exitoso o no)
    const hasText = fields && typeof fields.text === 'string';
    const hasStructuredData = fields && (fields.curp || fields.rfc || fields.no_cvu || fields.correo || fields.telefono);
    
    console.log('🔍 Análisis de respuesta del backend:');
    console.log('   - hasText:', hasText);
    console.log('   - hasStructuredData:', hasStructuredData);
    
    // Si el backend ya intentó extraer datos (con o sin éxito), usar su resultado
    if (!hasText) {
      console.log('✅ Usando datos del backend OCR (extraídos o vacíos)');
      // Los datos ya vienen procesados del servidor OCR, usar tal cual
      // Puede que sean todos null si el backend no encontró nada
    }
    // Si solo hay 'text', intentar extraer campos clave con regex mejorados
    else if (hasText) {
      console.log('📝 Procesando texto plano con regex...');
      const text = fields.text;
      
      // CURP: 18 caracteres (4 letras + 6 dígitos + H/M + 5 letras + alfanumérico + dígito)
      const curpMatch = text.match(/\b([A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d)\b/i);
      
      // RFC: 13 caracteres (4 letras + 6 dígitos + 3 alfanuméricos)
      const rfcMatch = text.match(/\b([A-Z]{4}\d{6}[A-Z0-9]{3})\b/i);
      
      // CVU: 4-8 dígitos después de 'CVU:' o 'NO.CVU:' o similar
      const cvuMatch = text.match(/(?:CVU|C\.V\.U\.?|NO\.?\s*CVU)[:\s-]*(\d{4,8})/i) || 
                      text.match(/\bCVU[\s:-]*(\d{4,8})\b/i);
      
      // Correo electrónico - patrón más robusto con validación estricta
      const correoPattern1 = text.match(/(?:email|correo|e-mail|mail)[:\s]*([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/i);
      const correoPattern2 = text.match(/\b([A-Z0-9][A-Z0-9._%+-]*@[A-Z0-9.-]+\.[A-Z]{2,})\b/i);
      
      let correo = null;
      const correoMatch = correoPattern1 || correoPattern2;
      
      if (correoMatch) {
        let emailRaw = correoMatch[1] || correoMatch[0];
        // Limpiar cualquier texto pegado al final del dominio
        // Ejemplo: @gmail.comcelular -> @gmail.com
        const emailClean = emailRaw.match(/([A-Z0-9._%+-]+@[A-Z0-9.-]+\.(com|mx|edu|org|net|gob|gov|es|cl|ar|co|br|uk|us|ca|de|fr|it|jp|cn))/i);
        if (emailClean) {
          correo = emailClean[1].toLowerCase();
        } else {
          // Si no matchea con TLD específico, intentar limpiar con regex general
          emailRaw = emailRaw.replace(/\.(com|mx|edu|org|net|gob|gov)[a-z]+$/i, '.$1');
          if (/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(emailRaw)) {
            correo = emailRaw.toLowerCase();
          }
        }
      }
      
      // Teléfono - formatos mexicanos (10 dígitos)
      const telefonoMatch = text.match(/(?:tel|teléfono|phone)[:\s]*(\+?52)?[\s\-]?(\d{3})[\s\-]?(\d{3})[\s\-]?(\d{4})/i) ||
                           text.match(/\b(\d{10})\b/);
      
      let telefono = null;
      if (telefonoMatch) {
        const digits = telefonoMatch[0].replace(/\D/g, '');
        telefono = digits.length > 10 ? digits.slice(-10) : digits;
      }
      
      fields = {
        curp: curpMatch ? curpMatch[1].toUpperCase() : null,
        rfc: rfcMatch ? rfcMatch[1].toUpperCase() : null,
        no_cvu: cvuMatch ? cvuMatch[1] : null,
        correo: correo,
        telefono: telefono,
        origen: 'ocr',
        fecha_registro: new Date().toISOString(),
        fallback: true,
        raw_text: text.substring(0, 1000), // Guardar solo primeros 1000 chars
      };
    } else if (!fields) {
      // No hay datos en absoluto
      return NextResponse.json(
        {
          error: 'No se pudo procesar el PDF. El servidor OCR no devolvió datos.',
          curp: null,
          rfc: null,
          no_cvu: null,
          correo: null,
          telefono: null,
          origen: 'ocr',
          filename: file.name
        },
        { status: 400 }
      );
    }

    console.log('📊 Campos finales procesados:', JSON.stringify(fields, null, 2));

    // Validar que se extrajeron datos mínimos
    // NOTA: Permitir continuar si al menos hay CURP O RFC O CVU O (correo Y teléfono)
    const hasCURP = fields && fields.curp && fields.curp.length === 18;
    const hasRFC = fields && fields.rfc && fields.rfc.length === 13;
    const hasCVU = fields && fields.no_cvu && fields.no_cvu.length >= 4;
    const hasContacto = fields && fields.correo && fields.telefono;
    
    const hasMinimalData = hasCURP || hasRFC || hasCVU || hasContacto;
    
    console.log('🔍 Validación de datos mínimos:');
    console.log('   - CURP válido (18 chars):', hasCURP ? '✅' : '❌', fields?.curp || 'null');
    console.log('   - RFC válido (13 chars):', hasRFC ? '✅' : '❌', fields?.rfc || 'null');
    console.log('   - CVU válido (4+ dígitos):', hasCVU ? '✅' : '❌', fields?.no_cvu || 'null');
    console.log('   - Contacto (correo+tel):', hasContacto ? '✅' : '❌');
    console.log('   - Resultado final:', hasMinimalData ? '✅ VÁLIDO' : '❌ RECHAZADO');
    
    if (!hasMinimalData) {
      return NextResponse.json(
        {
          error: 'No se pudieron extraer datos clave del PDF. Se requiere al menos: CURP (18 caracteres) O RFC (13 caracteres) O CVU (4+ dígitos) O (correo electrónico + teléfono).',
          detalles: {
            curp: fields?.curp ? `Encontrado pero inválido: ${fields.curp} (longitud: ${fields.curp.length})` : 'No encontrado',
            rfc: fields?.rfc ? `Encontrado pero inválido: ${fields.rfc} (longitud: ${fields.rfc.length})` : 'No encontrado',
            no_cvu: fields?.no_cvu ? `Encontrado: ${fields.no_cvu}` : 'No encontrado',
            correo: fields?.correo || 'No encontrado',
            telefono: fields?.telefono || 'No encontrado'
          },
          origen: 'ocr',
          filename: file.name,
          sugerencias: [
            '• Verifica que el PDF contenga texto legible (no sea una imagen de baja calidad)',
            '• El CURP debe tener exactamente 18 caracteres',
            '• El RFC debe tener exactamente 13 caracteres',
            '• El CVU debe tener al menos 4 dígitos',
            '• Alternativamente, asegúrate de incluir correo electrónico y teléfono'
          ]
        },
        { status: 400 }
      );
    }


    // Normalizar y validar datos extraídos
    const datosAGuardar: any = {
      curp: fields.curp?.trim().toUpperCase() || null,
      rfc: fields.rfc?.trim().toUpperCase() || null,
      no_cvu: fields.no_cvu?.trim() || null,
      correo: fields.correo?.trim().toLowerCase() || null,
      telefono: fields.telefono?.trim() || null,
      nombre_completo: fields.nombre_completo?.trim() || null,
      fecha_nacimiento: fields.fecha_nacimiento?.trim() || null,
      institucion: fields.institucion?.trim() || null,
      grado_maximo_estudios: fields.grado_maximo_estudios?.trim() || null,
      experiencia_laboral: fields.experiencia_laboral?.trim() || null,
      origen: 'ocr',
      fecha_registro: new Date().toISOString(),
    };

    // Validar formato de CURP si existe
    if (datosAGuardar.curp && !/^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/.test(datosAGuardar.curp)) {
      console.log('⚠️  CURP con formato inválido:', datosAGuardar.curp);
      datosAGuardar.curp = null;
    }

    // Validar formato de RFC si existe
    if (datosAGuardar.rfc && !/^[A-Z]{4}\d{6}[A-Z0-9]{3}$/.test(datosAGuardar.rfc)) {
      console.log('⚠️  RFC con formato inválido:', datosAGuardar.rfc);
      datosAGuardar.rfc = null;
    }

    // Validar formato de correo si existe
    if (datosAGuardar.correo && !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$/i.test(datosAGuardar.correo)) {
      console.log('⚠️  Correo con formato inválido:', datosAGuardar.correo);
      datosAGuardar.correo = null;
    }

    // Validar que tenga al menos uno de los campos clave
    if (!datosAGuardar.curp && !datosAGuardar.rfc && !datosAGuardar.no_cvu) {
      return NextResponse.json(
        {
          error: 'No se detectó CURP, RFC ni CVU válidos en el PDF. Verifica que el documento contenga esta información claramente.',
          curp: null,
          rfc: null,
          no_cvu: null,
          correo: datosAGuardar.correo,
          telefono: datosAGuardar.telefono,
          nombre_completo: datosAGuardar.nombre_completo,
          origen: 'ocr',
          filename: file.name
        },
        { status: 400 }
      );
    }

    // Validar que el correo esté presente (requerido para registro)
    if (!datosAGuardar.correo) {
      return NextResponse.json(
        {
          error: 'No se detectó correo electrónico en el PDF. Por favor ingrésalo manualmente.',
          curp: datosAGuardar.curp,
          rfc: datosAGuardar.rfc,
          no_cvu: datosAGuardar.no_cvu,
          correo: null,
          telefono: datosAGuardar.telefono,
          nombre_completo: datosAGuardar.nombre_completo,
          origen: 'ocr',
          filename: file.name,
          requiere_correccion: true
        },
        { status: 400 }
      );
    }

    const resultado = await guardarInvestigador(datosAGuardar);
    if (resultado?.success) {
      // Responder con todos los campos extraídos
      return NextResponse.json({
        success: true,
        curp: datosAGuardar.curp,
        rfc: datosAGuardar.rfc,
        no_cvu: datosAGuardar.no_cvu,
        correo: datosAGuardar.correo,
        telefono: datosAGuardar.telefono,
        nombre_completo: datosAGuardar.nombre_completo,
        fecha_nacimiento: datosAGuardar.fecha_nacimiento,
        institucion: datosAGuardar.institucion,
        grado_maximo_estudios: datosAGuardar.grado_maximo_estudios,
        experiencia_laboral: datosAGuardar.experiencia_laboral,
        mensaje: 'Datos extraídos y guardados exitosamente'
      });
    }

    return NextResponse.json(
      { 
        error: resultado?.message || 'Error al guardar los datos en la base de datos', 
        datos_extraidos: {
          curp: datosAGuardar.curp,
          rfc: datosAGuardar.rfc,
          no_cvu: datosAGuardar.no_cvu,
          correo: datosAGuardar.correo,
          telefono: datosAGuardar.telefono,
          nombre_completo: datosAGuardar.nombre_completo
        },
        filename: file.name 
      },
      { status: 400 }
    );
  } catch (err: any) {
    console.error('OCR proxy error', { PDF_PROCESSOR_URL: process.env.PDF_PROCESSOR_URL, message: err?.message });
    return NextResponse.json({ error: `Proxy failed: ${err?.message}` }, { status: 500 });
  }
}

