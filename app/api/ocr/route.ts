import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  return NextResponse.json(
    {
      error:
        "La funcionalidad de procesamiento de PDFs ha sido deshabilitada. Por favor, utiliza el formulario de registro manual.",
    },
    { status: 501 },
  )
}
