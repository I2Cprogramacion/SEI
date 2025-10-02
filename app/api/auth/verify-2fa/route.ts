import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as jwt from "jsonwebtoken";

// Simulación: en producción usar Redis o DB temporal
const codes: Record<string, { code: string; expires: number; user: any }> = {};

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();
    if (!email || !code) {
      return NextResponse.json({ error: "Email y código requeridos" }, { status: 400 });
    }
    const entry = codes[email];
    if (!entry || entry.code !== code || Date.now() > entry.expires) {
      return NextResponse.json({ error: "Código inválido o expirado" }, { status: 401 });
    }
    // Generar JWT
    const token = jwt.sign(
      {
        id: entry.user.id,
        email: entry.user.email,
        nombre: entry.user.nombre
      },
      process.env.JWT_SECRET || "default_secret",
      { expiresIn: "7d" }
    );
    // Limpia el código usado
    delete codes[email];
    return NextResponse.json({ success: true, token, user: entry.user });
  } catch (error) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}