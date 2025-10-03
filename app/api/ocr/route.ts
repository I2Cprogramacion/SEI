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
    if (file) {
      console.log('[OCR Proxy] Archivo recibido:', {
        nombre: file.name,
        tipo: file.type,
        tamano: file.size
      });
    } else {
      console.log('[OCR Proxy] No se recibió archivo');
    }

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
    console.log('[OCR Proxy] Respuesta backend OCR:', {
      status: upstream.status,
      contentType: upstream.headers.get('content-type'),
      body: rawText?.slice(0, 500) // solo los primeros 500 caracteres
    });

    if (!upstream.ok) {
      console.error('Backend OCR', upstream.status, rawText);
      return NextResponse.json({ error: `Backend OCR ${upstream.status}: ${rawText || 'sin cuerpo'}` }, { status: 502 });
    }

    const ct = upstream.headers.get('content-type') || '';
    const payload = ct.includes('application/json') ? await upstream.json() : { data: rawText };
    let fields = (payload as any).data;

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

    if (!fields || (!fields.curp && !fields.rfc && !fields.no_cvu)) {
      return NextResponse.json(
        { error: 'No se extrajeron datos suficientes del PDF.', ocr: fields || null, filename: file.name },
        { status: 400 }
      );
    }


    // Extraer nombre_completo del texto si es posible

    // Solo enviar los campos clave al frontend
    const datosAGuardar: any = {
      curp: fields.curp || null,
      rfc: fields.rfc || null,
      no_cvu: fields.no_cvu || null,
      correo: fields.correo || null,
      telefono: fields.telefono || null,
      origen: 'ocr',
      fecha_registro: new Date().toISOString(),
    };

    if (!datosAGuardar.curp && !datosAGuardar.rfc && !datosAGuardar.no_cvu) {
      return NextResponse.json(
        { error: 'No se detectó CURP, RFC ni CVU para guardar.', ocr: fields, filename: file.name },
        { status: 400 }
      );
    }

    const resultado = await guardarInvestigador(datosAGuardar);
    if (resultado?.success) {
      // Responder solo los campos clave al frontend
      return NextResponse.json({
        curp: datosAGuardar.curp,
        rfc: datosAGuardar.rfc,
        no_cvu: datosAGuardar.no_cvu,
        correo: datosAGuardar.correo,
        telefono: datosAGuardar.telefono
      });
    }

    return NextResponse.json(
      { error: resultado?.message || 'Fallo al guardar', ocr: fields, filename: file.name },
      { status: 400 }
    );
  } catch (err: any) {
    console.error('OCR proxy error', { PDF_PROCESSOR_URL: process.env.PDF_PROCESSOR_URL, message: err?.message });
    return NextResponse.json({ error: `Proxy failed: ${err?.message}` }, { status: 500 });
  }
}
