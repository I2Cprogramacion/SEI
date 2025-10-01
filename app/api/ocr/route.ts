// app/api/ocr/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { guardarInvestigador } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic'; // evita edge/prerender accidental

function jsonError(status: number, message: string, extra: Record<string, any> = {}) {
  return NextResponse.json({ ok: false, error: message, ...extra }, { status });
}

async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit = {}, ms = 55_000) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(t);
  }
}

async function postMultipart(base: string, endpoint: string, buf: ArrayBuffer, filename: string, mime: string) {
  const url = `${base}${endpoint}`;
  const fd = new FormData();
  fd.append('file', new Blob([buf], { type: mime }), filename);
  const r = await fetchWithTimeout(url, { method: 'POST', body: fd });
  const ct = r.headers.get('content-type')?.toLowerCase() ?? '';

  let payload: any;
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

  return { url, ok: r.ok, status: r.status, payload };
}

export async function POST(request: NextRequest) {
  // 1) ENV + normalización
  const RAW = process.env.PDF_PROCESSOR_URL ?? '';
  const BASE0 = RAW.trim().replace(/^["']|["']$/g, '').replace(/\/+$/, '');
  if (!BASE0) return jsonError(500, 'PDF_PROCESSOR_URL no está definida');

  // fuerza https si vino http o sin esquema
  const BASE = /^https?:\/\//i.test(BASE0) ? BASE0.replace(/^http:\/\//i, 'https://') : `https://${BASE0}`;

  // permite localhost solo fuera de Vercel prod/preview
  const isProd = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
  if (isProd && /(^|\/\/)(localhost|127\.0\.0\.1)(:|\/|$)/i.test(BASE)) {
    return jsonError(500, 'PDF_PROCESSOR_URL no puede ser localhost en producción', { PDF_PROCESSOR_URL: BASE });
  }

  try {
    // 2) Archivo
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) return jsonError(400, 'No se proporcionó archivo');
    if (!file.type?.includes('pdf')) return jsonError(400, 'El archivo debe ser PDF');
    if (file.size > 10 * 1024 * 1024) return jsonError(400, 'PDF demasiado grande (máx 10MB)');

    const ab = await file.arrayBuffer();

    // 3) Opcional: health (no fatal si falla)
    try {
      await fetchWithTimeout(`${BASE}/health`, { method: 'GET' }, 5000);
    } catch { /* ignorar */ }

    // 4) Intentos contra backend (rutas comunes)
    const attempts = ['/ocr', '/process-pdf'];
    let last: { url: string; status: number; payload: any } | null = null;

    for (const ep of attempts) {
      const res = await postMultipart(BASE, ep, ab, file.name, file.type);
      if (res.ok) {
        // 5) Normaliza campos esperados
        const fields = (res.payload as any)?.data ?? null;

        if (!fields || (!fields.curp && !fields.rfc && !fields.no_cvu)) {
          return jsonError(400, 'No se extrajeron datos suficientes del PDF', {
            backend_url: res.url,
            ocr: fields ?? null,
            filename: file.name,
          });
        }

        // 6) Guardar en BD (aislado)
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
          const saved = await guardarInvestigador(datosAGuardar);
          if (!saved?.success) {
            return NextResponse.json(
              {
                ok: false,
                error: saved?.message || 'Fallo al guardar',
                ocr: fields,
                filename: file.name,
                backend_url: res.url,
              },
              { status: 400 }
            );
          }

          return NextResponse.json({
            ok: true,
            success: true,
            message: saved.message,
            id: saved.id,
            data: datosAGuardar,
            filename: file.name,
            backend_url: res.url,
          });
        } catch (e: any) {
          return jsonError(500, 'Error al guardar en BD', {
            reason: e?.message || String(e),
            ocr: fields,
            filename: file.name,
            backend_url: res.url,
          });
        }
      }
      // guarda último fallo para informar
      last = { url: res.url, status: res.status, payload: res.payload };
      // si 404/405 seguimos al siguiente endpoint
      if (res.status !== 404 && res.status !== 405) break;
    }

    // si ninguno funcionó:
    return jsonError(502, `Backend OCR ${last?.status ?? 502}`, {
      backend_url: last?.url ?? `${BASE}${attempts[attempts.length - 1]}`,
      upstream: last?.payload ?? null,
    });
  } catch (err: any) {
    const isAbort = err?.name === 'AbortError';
    console.error('OCR proxy error', {
      PDF_PROCESSOR_URL: process.env.PDF_PROCESSOR_URL,
      message: err?.message,
      name: err?.name,
    });
    return jsonError(isAbort ? 504 : 500, isAbort ? 'Timeout llamando al backend OCR' : `Proxy failed: ${err?.message}`);
  }
}

