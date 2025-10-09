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
    
    // Determinar si el usuario es admin
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@sei.com.mx';
    const isAdmin = entry.user.email === adminEmail || entry.user.correo === adminEmail;
    
    // Preparar datos del usuario
    const userData = {
      id: entry.user.id,
      email: entry.user.email || entry.user.correo,
      nombre: entry.user.nombre_completo || entry.user.nombre,
      rol: entry.user.rol || 'investigador',
      isAdmin: isAdmin
    };
    
    // Generar JWT
    const token = jwt.sign(
      {
        id: userData.id,
        email: userData.email,
        nombre: userData.nombre,
        isAdmin: userData.isAdmin
      },
      process.env.JWT_SECRET || "default_secret",
      { expiresIn: "7d" }
    );
    
    // Crear respuesta
    const response = NextResponse.json({ 
      success: true, 
      token, 
      user: userData 
    });
    
    // Crear cookie de sesión (auth-token)
    response.cookies.set('auth-token', userData.id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 días
    });

    // Crear cookie con datos del usuario (user-data) para el middleware
    response.cookies.set('user-data', JSON.stringify(userData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 días
    });
    
    console.log('✅ 2FA verificado para:', userData.email, '| isAdmin:', isAdmin);
    
    // Limpia el código usado
    delete codes[email];
    return response;
  } catch (error) {
    console.error('Error en verify-2fa:', error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}