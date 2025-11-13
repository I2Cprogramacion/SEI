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
    console.log('📦 Campos recibidos del backend OCR:', fields);

    // Si el backend ya extrajo los datos estructurados, usarlos directamente
    if (fields && !fields.text && (fields.curp || fields.rfc || fields.no_cvu || fields.correo || fields.telefono)) {
      console.log('✅ Backend OCR ya extrajo datos estructurados');
      // Los datos ya vienen procesados del servidor OCR
    }
    // Si solo hay 'text', intentar extraer campos clave con regex mejorados
    else if (fields && typeof fields.text === 'string') {
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

    console.log('📊 Campos finales procesados:', fields);

    // Validar que se extrajeron datos mínimos
    const hasMinimalData = fields && (fields.curp || fields.rfc || fields.no_cvu);
    
    if (!hasMinimalData) {
      console.log('⚠️ No se encontraron datos mínimos:', {
        curp: fields?.curp || 'no encontrado',
        rfc: fields?.rfc || 'no encontrado',
        no_cvu: fields?.no_cvu || 'no encontrado',
        correo: fields?.correo || 'no encontrado',
        telefono: fields?.telefono || 'no encontrado'
      });
      
      return NextResponse.json(
        {
          error: 'No se pudieron extraer datos clave del PDF (CURP, RFC o CVU). Verifica que el documento contenga esta información de forma legible.',
          curp: fields?.curp || null,
          rfc: fields?.rfc || null,
          no_cvu: fields?.no_cvu || null,
          correo: fields?.correo || null,
          telefono: fields?.telefono || null,
          origen: 'ocr',
          filename: file.name,
          sugerencia: 'Si el PDF es una imagen escaneada, asegúrate de que el texto sea legible. Los campos CURP, RFC o CVU deben estar visibles y sin errores.'
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

