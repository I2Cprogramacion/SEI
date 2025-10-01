import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { send2FACode } from "@/lib/email-2fa";
import { crearUsuarioSimple } from "@/lib/db";

// Simulación: en producción usar Redis o DB temporal
const codes: Record<string, { code: string; expires: number; user: any }> = {};

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email y contraseña requeridos" }, { status: 400 });
    }
    // Crear usuario en la base de datos (o retornar error si ya existe)
    const user = await crearUsuarioSimple(email, password);
    if (!user) {
      return NextResponse.json({ error: "El usuario ya existe" }, { status: 409 });
    }
    // Generar código 2FA y enviar por email
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    codes[email] = { code, expires: Date.now() + 5 * 60 * 1000, user };
    await send2FACode(email, code);
    return NextResponse.json({ pending_2fa: true, message: "Código enviado" });
  } catch (error) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
