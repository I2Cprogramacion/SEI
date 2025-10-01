

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { guardarInvestigador } from '@/lib/db';

// Usa la URL pública del backend OCR (Railway) desde variable de entorno
const API_BASE_URL = process.env.PDF_PROCESSOR_URL || process.env.API_BASE_URL;
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    if (!API_BASE_URL) {
      return NextResponse.json({ error: 'PDF_PROCESSOR_URL no está definida en entorno' }, { status: 500 });
    }
    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ error: 'No se proporcionó archivo' }, { status: 400 });
    }
    if (!file.type.includes('pdf')) {
      return NextResponse.json({ error: 'El archivo debe ser un PDF' }, { status: 400 });
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'El archivo es demasiado grande (máximo 10MB)' }, { status: 400 });
    }

    // Prepara el formData para reenviar al backend OCR
    const arrayBuffer = await file.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: file.type });
    const backendForm = new FormData();
    backendForm.append('file', blob, file.name);

    // Llama al backend OCR en Railway
    const url = `${API_BASE_URL.replace(/\/$/, '')}/process-pdf`;
    console.log('Proxy OCR →', url);
    const response = await fetch(url, {
      method: 'POST',
      body: backendForm,
    });

    if (!response.ok) {
      const txt = await response.text().catch(() => '');
      console.error('Error backend OCR', response.status, txt);
      return NextResponse.json({ error: `Backend OCR ${response.status}: ${txt}` }, { status: 502 });
    }

    const result = await response.json();
    const fields = result.data;

    if (!fields || (!fields.curp && !fields.rfc && !fields.no_cvu)) {
      return NextResponse.json({
        error: 'No se pudieron extraer datos suficientes del PDF.',
        ocr: fields || null,
        filename: file.name,
      }, { status: 400 });
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
      return NextResponse.json({
        error: 'No se detectó CURP, RFC ni CVU para guardar.',
        ocr: fields,
        filename: file.name,
      }, { status: 400 });
    }

    const resultadoGuardado = await guardarInvestigador(datosAGuardar);

    if (resultadoGuardado.success) {
      return NextResponse.json({
        success: true,
        message: resultadoGuardado.message,
        id: resultadoGuardado.id,
        data: datosAGuardar,
        filename: file.name,
      });
    } else {
      return NextResponse.json({
        error: resultadoGuardado.message,
        ocr: fields,
        filename: file.name,
      }, { status: 400 });
    }
  } catch (err: any) {
    console.error('OCR proxy error', { API_BASE_URL, message: err?.message });
    return NextResponse.json(
      { error: `Proxy failed: ${err?.message}` },
      { status: 500 }
    );
  }
}
