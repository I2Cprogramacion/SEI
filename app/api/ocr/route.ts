// app/api/ocr/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { guardarInvestigador } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic'; // evita edge/prerender accidental en pruebas

function bad(status: number, msg: string, extra: Record<string, any> = {}) {
  return NextResponse.json({ ok: false, error: msg, ...extra }, { status });
}

async function postToBackend(base: string, form: FormData, endpoint: string) {
  const url = `${base}${endpoint}`;
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 55_000); // ~55s por límites de Vercel
  try {
    const r = await fetch(url, { method: 'POST', body: form, signal: controller.signal });
    return { url, r };
  } finally {
    clearTimeout(t);
  }
}

export async function POST(request: NextRequest) {
  // 1) ENV
  const RAW = process.env.PDF_PROCESSOR_URL ?? '';
  const BASE = RAW.trim().replace(/^["']|["']$/g, '').replace(/\/+$/, ''); // quita comillas/espacios y barra final

  if (!BASE) return bad(500, 'PDF_PROCESSOR_URL no está definida');
  const fixedBase = /^https?:\/\//i.test(BASE) ? BASE.replace(/^http:\/\//i, 'https://') : `https://${BASE}`;
  if (/localhost|127\.0\.0\.1/i.test(fixedBase)) return bad(500, 'PDF_PROCESSOR_URL no puede ser localhost en producción', { PDF_PROCESSOR_URL: fixedBase });

  try {
    // 2) ARCHIVO
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) return bad(400, 'No se proporcionó archivo');
    if (!file.type?.includes('pdf')) return bad(400, 'El archivo debe ser PDF');
    if (file.size > 10 * 1024 * 1024) return bad(400, 'PDF demasiado grande (máx 10MB)');

    // 3) FORM HACIA BACKEND
    const ab = await file.arrayBuffer();
    const upstreamForm = new FormData();
    upstreamForm.append('file', new Blob([ab], { type: file.type }), file.name);

    // 4) CALL con fallback de endpoint
    let { url, r } = await postToBackend(fixedBase, upstreamForm, '/ocr');
    if (r.status === 404 || r.status === 405) {
      ({ url, r } = await postToBackend(fixedBase, upstreamForm, '/process-pdf'));
    }

    // 5) Normaliza respuesta → siempre JSON
    const ct = r.headers.get('content-type')?.toLowerCase() ?? '';
    let payload: any = null;

    if (ct.includes('application/json')) {
      try {
        payload = await r.json();
      } catch {
        payload = { data: null, note: 'upstream-claimed-json-but-empty' };
      }
    } else {
      const txt = await r.text().catch(() => '');
      payload = { data: txt || null, note: 'upstream-non-json' };
    }

    if (!r.ok) {
      return bad(502, `Backend OCR ${r.status}`, {
        backend_url: url,
        upstream: payload,
      });
    }

    // 6) Extrae campos esperados
    const fields = payload?.data ?? null;
    if (!fields || (!fields.curp && !fields.rfc && !fields.no_cvu)) {
      return bad(400, 'No se extrajeron datos suficientes del PDF', {
        backend_url: url,
        ocr: fields ?? null,
        filename: file.name,
      });
    }

    // 7) Guardado en BD (aislado)
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
        return bad(400, res?.message || 'Fallo al guardar', {
          ocr: fields,
          filename: file.name,
        });
      }
      return NextResponse.json({
        ok: true,
        success: true,
        message: res.message,
        id: res.id,
        data: datosAGuardar,
        filename: file.name,
        backend_url: url,
      });
    } catch (e: any) {
      return bad(500, 'Error al guardar en BD', {
        reason: e?.message || String(e),
        ocr: fields,
        filename: file.name,
        backend_url: url,
      });
    }
  } catch (err: any) {
    const isAbort = err?.name === 'AbortError';
    console.error('OCR proxy error', {
      PDF_PROCESSOR_URL: process.env.PDF_PROCESSOR_URL,
      message: err?.message,
      name: err?.name,
    });
    return bad(isAbort ? 504 : 500, isAbort ? 'Timeout llamando al backend OCR' : `Proxy failed: ${err?.message}`);
  }
}
