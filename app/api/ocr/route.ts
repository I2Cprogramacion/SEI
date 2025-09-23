
// Endpoint OCR: usa PDF_PROCESSOR_URL obligatoria (fail-fast en prod)
const PDF_PROCESSOR_URL = process.env.PDF_PROCESSOR_URL;
function requireProcessorURL() {
  if (!PDF_PROCESSOR_URL) {
    throw new Error("PDF_PROCESSOR_URL no está definida (prod). Configúrala en Vercel.");
  }
  return PDF_PROCESSOR_URL;
}

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { guardarInvestigador } from "@/lib/db";


export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No se proporcionó archivo" }, { status: 400 });
    }
    if (!file.type.includes("pdf")) {
      return NextResponse.json({ error: "El archivo debe ser un PDF" }, { status: 400 });
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "El archivo es demasiado grande (máximo 10MB)" }, { status: 400 });
    }

    // Reenviar el PDF al microservicio Node.js local (ocr-server.js)
    const arrayBuffer = await file.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: file.type });
    const backendForm = new FormData();
    backendForm.append("file", blob, file.name);


    const response = await fetch(`${requireProcessorURL()}/process-pdf`, {
      method: "POST",
      body: backendForm,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return NextResponse.json({ error: error.error || "Error en backend OCR Node" }, { status: 500 });
    }

    const result = await response.json();
    const fields = result.data;

    if (!fields || (!fields.curp && !fields.rfc && !fields.no_cvu)) {
      return NextResponse.json({
        error: "No se pudieron extraer datos suficientes del PDF.",
        ocr: fields || null,
        filename: file.name
      }, { status: 400 });
    }

    const datosAGuardar: any = {
      curp: fields.curp || null,
      rfc: fields.rfc || null,
      no_cvu: fields.no_cvu || null,
      correo: fields.correo || null,
      telefono: fields.telefono || null,
      origen: "ocr",
      fecha_registro: new Date().toISOString(),
    };

    if (!datosAGuardar.curp && !datosAGuardar.rfc && !datosAGuardar.no_cvu) {
      return NextResponse.json({
        error: "No se detectó CURP, RFC ni CVU para guardar.",
        ocr: fields,
        filename: file.name
      }, { status: 400 });
    }

    const resultadoGuardado = await guardarInvestigador(datosAGuardar);

    if (resultadoGuardado.success) {
      return NextResponse.json({
        success: true,
        message: resultadoGuardado.message,
        id: resultadoGuardado.id,
        data: datosAGuardar,
        filename: file.name
      });
    } else {
      return NextResponse.json({
        error: resultadoGuardado.message,
        ocr: fields,
        filename: file.name
      }, { status: 400 });
    }
  } catch (error) {
    console.error("Error en procesamiento de PDF:", error);
    return NextResponse.json(
      { error: "Error interno del servidor al procesar PDF" },
      { status: 500 }
    );
  }
}
