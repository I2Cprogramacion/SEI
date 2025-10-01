// app/api/ocr/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { guardarInvestigador } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic'; // evita prerender o edge accidental

function bad(status: number, msg: string, extra: Record<string, any> = {}) {
  return NextResponse.json({ error: msg, ...extra }, { status });
}

export async function POST(request: NextRequest) {
  // 1) ENV VALIDATION
  const RAW = process.env.PDF_PROCESSOR_URL ?? '';
  const BASE = RAW.replace(/\/$/, '');
  if (!BASE) return bad(500, 'PDF_PROCESSOR_URL no está definida');
  if (!/^https:\/\//i.test(BASE)) return bad(500, 'PDF_PROCESSOR_URL debe iniciar con https://', { PDF_PROCESSOR_URL: BASE });
  if (/localhost|127\.0\.0\.1/i.test(BASE)) return bad(500, 'PDF_PROCESSOR_URL no puede ser localhost en producción', { PDF_PROCESSOR_URL: BASE });

  try {
    // 2) ARCHIVO
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) return bad(400, 'No se proporcionó archivo');
    if (!file.type?.includes('pdf')) return bad(400, 'El archivo debe ser PDF');
    if (file.size > 10 * 1024 * 1024) return bad(400, 'PDF demasiado grande (máx 10MB)');

    // 3) PREPARAR FORM HACIA BACKEND
    const ab = await file.arrayBuffer();
    const backendForm = new FormData();
    backendForm.append('file', new Blob([ab], { type: file.type }), file.name);

    // 4) LLAMADA CON FALLBACK DE ENDPOINT
    const tryFetch = async (endpoint: string) => {
      const url = `${BASE}${endpoint}`;
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 55_000);
      try {
        const r = await fetch(url, { method: 'POST', body: backendForm, signal: controller.signal });
        return { url, r };
      } finally {
        clearTimeout(t);
      }
    };

    // Primero intentamos /ocr; si 404 o 405, intentamos /process-pdf
    let { url, r } = await tryFetch('/ocr');
    if (r.status === 404 || r.status === 405) {
      ({ url, r } = await tryFetch('/process-pdf'));
    }

    if (!r.ok) {
      const txt = await r.text().catch(() => '');
      return bad(502, `Backend OCR ${r.status}`, { backend_url: url, body: txt || null });
    }

    const ct = r.headers.get('content-type') || '';
    const payload = ct.includes('application/json') ? await r.json() : { data: await r.text() };
    const fields = (payload as any)?.data;

    if (!fields || (!fields.curp && !fields.rfc && !fields.no_cvu)) {
      return bad(400, 'No se extrajeron datos suficientes del PDF', {
        backend_url: url,
        ocr: fields ?? null,
        filename: file.name,
      });
    }

    // 5) GUARDADO EN BD (aislado)
    const datosAGuardar: any = {
      curp: fields.curp || null,
      rfc: fields.rfc || null,
      no_cvu: fields.no_cvu || null,
      correo: fields.correo || null,
      telefono: fields.telefono || null,
      origen: 'ocr',
      fecha_registro: new Date().toISOString(),
    };

    try {
      const res = await guardarInvestigador(datosAGuardar);
      if (!res?.success) {
        // si falla el guardado, devolvemos el OCR igualmente con detalle
        return bad(400, res?.message || 'Fallo al guardar', {
          ocr: fields,
          filename: file.name,
        });
      }
      return NextResponse.json({
        success: true,
        message: res.message,
        id: res.id,
        data: datosAGuardar,
        filename: file.name,
      });
    } catch (e: any) {
      // NO rompemos toda la ruta; devolvemos OCR + motivo del fallo
      return bad(500, 'Error al guardar en BD', {
        reason: e?.message || String(e),
        ocr: fields,
        filename: file.name,
      });
    }
  } catch (err: any) {
    // 6) DIAGNÓSTICO CLARO EN LOGS
    console.error('OCR proxy error', {
      PDF_PROCESSOR_URL: process.env.PDF_PROCESSOR_URL,
      message: err?.message,
      name: err?.name,
      stack: err?.stack,
    });
    const isAbort = err?.name === 'AbortError';
    return bad(isAbort ? 504 : 500, isAbort ? 'Timeout llamando al backend OCR' : `Proxy failed: ${err?.message}`);
  }
}
