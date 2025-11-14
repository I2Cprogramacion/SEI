import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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
    // Permitir tanto payload.data como payload plano
  let fields = (payload as any).data || payload;
  // (Eliminado log de campos extraídos para reducir el rate limit)

    // Si solo hay 'text', intentar extraer campos clave con regex
    if (fields && typeof fields.text === 'string') {
      const text = fields.text;
      // CURP: 18 caracteres, letras y números
      const curpMatch = text.match(/\b([A-Z]{4}\d{6}[A-Z]{6}\d{2})\b/i);
      // RFC: 13 caracteres, letras y números
      const rfcMatch = text.match(/\b([A-Z]{4}\d{6}[A-Z0-9]{3})\b/i);
      // CVU: después de 'NO.CVU:' o 'CVU:'
      const cvuMatch = text.match(/CVU[:\s-]*([0-9]{5,})/i) || text.match(/NO\.CVU[:\s-]*([0-9]{5,})/i);
      // Correo electrónico
      const correoMatch = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
      fields = {
        curp: curpMatch ? curpMatch[1].toUpperCase() : null,
        rfc: rfcMatch ? rfcMatch[1].toUpperCase() : null,
        no_cvu: cvuMatch ? cvuMatch[1] : null,
        correo: correoMatch ? correoMatch[0] : null,
        telefono: null,
        origen: 'ocr',
        fecha_registro: new Date().toISOString(),
        fallback: true,
        raw_text: text,
      };
    }

    // ✅ CORRECCIÓN: El OCR solo debe extraer y retornar datos, NO guardar en la BD
    // El guardado completo se hace en /api/registro después de que el usuario complete todo el formulario
    
    // Preparar los datos extraídos para retornar al frontend
    const datosExtraidos: any = {
      curp: fields.curp || null,
      rfc: fields.rfc || null,
      no_cvu: fields.no_cvu || null,
      correo: fields.correo || null,
      telefono: fields.telefono || null,
      nombre_completo: fields.nombre_completo || null,
      fecha_nacimiento: fields.fecha_nacimiento || null,
    };

    // Validar que al menos tengamos algunos datos útiles
    if (!datosExtraidos.curp && !datosExtraidos.rfc && !datosExtraidos.no_cvu) {
      return NextResponse.json(
        {
          error: 'No se extrajeron datos suficientes del PDF. Por favor, completa los datos manualmente.',
          curp: datosExtraidos.curp,
          rfc: datosExtraidos.rfc,
          no_cvu: datosExtraidos.no_cvu,
          correo: datosExtraidos.correo,
          telefono: datosExtraidos.telefono,
          nombre_completo: datosExtraidos.nombre_completo,
          fecha_nacimiento: datosExtraidos.fecha_nacimiento,
        },
        { status: 200 } // Cambiar a 200 porque no es un error crítico
      );
    }

    // ✅ Retornar solo los datos extraídos sin guardar en BD
    console.log('✅ [OCR] Datos extraídos exitosamente, retornando al frontend...')
    return NextResponse.json({
      success: true,
      message: 'Datos extraídos exitosamente',
      curp: datosExtraidos.curp,
      rfc: datosExtraidos.rfc,
      no_cvu: datosExtraidos.no_cvu,
      correo: datosExtraidos.correo,
      telefono: datosExtraidos.telefono,
      nombre_completo: datosExtraidos.nombre_completo,
      fecha_nacimiento: datosExtraidos.fecha_nacimiento,
    });
  } catch (err: any) {
    console.error('OCR proxy error', { PDF_PROCESSOR_URL: process.env.PDF_PROCESSOR_URL, message: err?.message });
    return NextResponse.json({ error: `Proxy failed: ${err?.message}` }, { status: 500 });
  }
}

