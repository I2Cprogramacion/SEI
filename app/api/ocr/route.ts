


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

    if (!upstream.ok) {
      const txt = await upstream.text().catch(() => '');
      console.error('Backend OCR', upstream.status, txt);
      return NextResponse.json({ error: `Backend OCR ${upstream.status}: ${txt || 'sin cuerpo'}` }, { status: 502 });
    }

    const ct = upstream.headers.get('content-type') || '';
    const payload = ct.includes('application/json') ? await upstream.json() : { data: await upstream.text() };
    const fields = (payload as any).data;

    if (!fields || (!fields.curp && !fields.rfc && !fields.no_cvu)) {
      return NextResponse.json(
        { error: 'No se extrajeron datos suficientes del PDF.', ocr: fields || null, filename: file.name },
        { status: 400 }
      );
    }

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
      return NextResponse.json({
        success: true,
        message: resultado.message,
        id: resultado.id,
        data: datosAGuardar,
        filename: file.name,
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
