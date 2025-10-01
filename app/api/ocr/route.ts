// app/api/ocr/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { guardarInvestigador } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function bad(status: number, msg: string, extra: Record<string, any> = {}) {
  return NextResponse.json({ ok: false, error: msg, ...extra }, { status });
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

async function tryEndpoints(BASE: string, buf: ArrayBuffer, filename: string, mime: string) {
  const endpoints = ['/ocr', '/process-pdf', '/extract', '/upload'];
  const fieldNames = ['file', 'pdf'];

  for (const ep of endpoints) {
    for (const field of fieldNames) {
      const form = new FormData();
      form.append(field, new Blob([buf], { type: mime }), filename);

      const url = `${BASE}${ep}`;
      const r = await fetchWithTimeout(url, { method: 'POST', body: form });

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

      if (r.ok) {
        return { ok: true as const, urlTried: url, field, payload, status: r.status };
      }

      // guarda último intento fallido para reportar
      var lastFail = { ok: false as const, urlTried: url, field, payload, status: r.status };
    }
  }
  return lastFail!;
}

export async function POST(request: NextRequest) {
  // 1) ENV y normalización
  const RAW = process.env.PDF_PROCESSOR_URL ?? '';
  const BASE0 = RAW.trim().replace(/^["']|["']$/g, '').replace(/\/+$/, '');
  if (!BASE0) return bad(500, 'PDF_PROCESSOR_URL no está definida');

  const BASE = /^https?:\/\//i.test(BASE0) ? BASE0.replace(/^http:\/\//i, 'https://') : `https://${BASE0}`;
  const isProd = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
  if (isProd && /localhost|127\.0\.0\.1/i.test(BASE)) {
    return bad(500, 'PDF_PROCESSOR_URL no puede ser localhost en producción', { PDF_PROCESSOR_URL: BASE });
  }

  try {
    // 2) archivo del cliente
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) return bad(400, 'No se proporcionó archivo');
    if (!file.type?.includes('pdf')) return bad(400, 'El archivo debe ser PDF');
    if (file.size > 10 * 1024 * 1024) return bad(400, 'PDF demasiado grande (máx 10MB)');

    const ab = await file.arrayBuffer();

    // 3) (Opcional) health-check: no es fatal si falla, pero ayuda a depurar
    try {
      const health = await fetchWithTimeout(`${BASE}/health`, { method: 'GET' }, 5000);
      // no hacemos nada con el resultado; sólo verificar conectividad
    } catch {
      // seguimos; algunos backends no exponen /health
    }

    // 4) intentos contra el backend (rutas + nombres de campo)
    const result = await tryEndpoints(BASE, ab, file.name, file.type);

    if (!result.ok) {
      return bad(502, `Backend OCR ${result.status}`, {
        backend_url: result.urlTried,
        fieldTried: result.field,
        upstream: result.payload,
      });
    }

    const fields = (result.payload as any)?.data ?? null;
    if (!fields || (!fields.curp && !fields.rfc && !fields.no_cvu)) {
      return bad(400, 'No se extrajeron datos suficientes del PDF', {
        backend_url: result.urlTried,
        fieldTried: result.field,
        ocr: fields ?? null,
        filename: file.name,
      });
    }

    // 5) guardar en BD (aislado)
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
            backend_url: result.urlTried,
            fieldUsed: result.field,
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
        backend_url: result.urlTried,
        fieldUsed: result.field,
      });
    } catch (e: any) {
      return bad(500, 'Error al guardar en BD', {
        reason: e?.message || String(e),
        ocr: fields,
        filename: file.name,
        backend_url: result.urlTried,
        fieldUsed: result.field,
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

