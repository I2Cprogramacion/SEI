import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { guardarInvestigador } from "@/lib/db"
import { verifyJWT } from "@/lib/auth/verify-jwt"

/**
 * Verifica el token de reCAPTCHA con Google
 */
async function verificarCaptcha(token: string): Promise<boolean> {
  const secretKey = process.env.RECAPTCHA_SECRET
  
  if (!secretKey) {
    console.error("❌ RECAPTCHA_SECRET no está configurada en las variables de entorno")
    return false
  }

  try {
    console.log("🔍 Verificando CAPTCHA con Google...")
    
    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `secret=${secretKey}&response=${token}`,
    })

    const data = await response.json()
    
    console.log("📊 Respuesta de Google reCAPTCHA:", {
      success: data.success,
      challenge_ts: data.challenge_ts,
      hostname: data.hostname,
      score: data.score,
      action: data.action,
      error_codes: data["error-codes"],
    })

    if (!data.success) {
      console.error("❌ CAPTCHA inválido. Error codes:", data["error-codes"])
      return false
    }

    console.log("✅ CAPTCHA verificado exitosamente")
    return true
  } catch (error) {
    console.error("❌ Error al verificar CAPTCHA con Google:", error)
    return false
  }
}

export async function POST(request: NextRequest) {
  // Permitir registro abierto, pero si se envía token, verificarlo
  const authHeader = request.headers.get("authorization")
  let payload = null
  if (authHeader) {
    const token = authHeader.replace("Bearer ", "")
    payload = verifyJWT(token)
    if (!payload) {
      return NextResponse.json({ error: "Token inválido o expirado" }, { status: 401 })
    }
  }
  try {
    const data = await request.json()
    console.log("==================================================")
    console.log("📥 DATOS RECIBIDOS PARA REGISTRO:")
    console.log(JSON.stringify(data, null, 2))
    console.log("==================================================")
    // Validar y normalizar nombres de variables
    const camposTabla = [
      "nombre_completo", "nombres", "apellidos", "correo", "clerk_user_id",
      "linea_investigacion", "area_investigacion", "institucion", "fotografia_url",
      "slug", "curp", "rfc", "no_cvu", "telefono", "nacionalidad", "fecha_nacimiento",
      "genero", "tipo_perfil", "nivel_investigador", "nivel_tecnologo", "municipio",
      "cv_url", "fecha_registro", "origen", "es_admin", "estado_nacimiento",
      "entidad_federativa", "orcid", "empleo_actual", "nivel_actual", "institucion_id", "activo",
      "departamento", "ubicacion", "sitio_web", "grado_maximo_estudios", "especialidad",
      "disciplina", "nivel_actual_id", "fecha_asignacion_nivel", "puntaje_total", "estado_evaluacion",
      "articulos", "libros", "capitulos_libros", "proyectos_investigacion", "proyectos_vinculacion",
      "experiencia_docente", "experiencia_laboral", "premios_distinciones", "idiomas",
      "colaboracion_internacional", "colaboracion_nacional", "sni", "anio_sni", "archivo_procesado"
    ];
    // Eliminar campos no válidos y asegurar que todos los obligatorios estén presentes
    const datosRegistro: any = {};
    for (const campo of camposTabla) {
      datosRegistro[campo] = data[campo] !== undefined ? data[campo] : null;
    }
    // Guardar el PDF subido para el OCR como cv_url si existe
    if (data.fotografia_url && !datosRegistro.cv_url && data.archivo_procesado) {
      datosRegistro.cv_url = data.archivo_procesado;
    }
    // Asignar valores por defecto a activo y es_admin si no se reciben
    if (datosRegistro.activo === null || datosRegistro.activo === undefined) {
      datosRegistro.activo = true;
    }
    if (datosRegistro.es_admin === null || datosRegistro.es_admin === undefined) {
      datosRegistro.es_admin = false;
    }
    // Validar obligatorios
    if (!datosRegistro.correo) {
      console.error("Falta el correo electrónico")
      return NextResponse.json({ error: "El correo electrónico es obligatorio" }, { status: 400 })
    }
    if (!datosRegistro.nombre_completo && datosRegistro.nombres && datosRegistro.apellidos) {
      datosRegistro.nombre_completo = `${datosRegistro.nombres} ${datosRegistro.apellidos}`.trim()
      console.log("✅ nombre_completo construido desde nombres + apellidos:", datosRegistro.nombre_completo)
    }
    if (!datosRegistro.nombre_completo) {
      console.error("Falta el nombre completo (no se pudo construir)")
      return NextResponse.json({ error: "El nombre completo es obligatorio" }, { status: 400 })
    }
    if (!datosRegistro.fecha_registro) {
      datosRegistro.fecha_registro = new Date().toISOString()
    }
    // Mostrar los datos finales que se enviarán a la base
    console.log("Datos normalizados para guardar en la base:", JSON.stringify(datosRegistro, null, 2))

    // 🔒 VERIFICACIÓN DE CAPTCHA DESHABILITADA TEMPORALMENTE
    // const captchaToken = data.captchaToken || data.recaptcha
    
    // if (!captchaToken) {
    //   console.error("❌ No se recibió token de CAPTCHA")
    //   return NextResponse.json(
    //     { 
    //       error: "Token de CAPTCHA no proporcionado",
    //       message: "Por favor, completa el CAPTCHA para continuar"
    //     },
    //     { status: 400 }
    //   )
    // }

    // const captchaValido = await verificarCaptcha(captchaToken)
    
    // if (!captchaValido) {
    //   console.error("❌ CAPTCHA inválido o expirado")
    //   return NextResponse.json(
    //     {
    //       error: "CAPTCHA inválido o expirado",
    //       message: "Por favor, marca el CAPTCHA nuevamente e intenta de nuevo"
    //     },
    //     { status: 400 }
    //   )
    // }

    // console.log("✅ CAPTCHA verificado correctamente, continuando con el registro...")
    console.log("⚠️ CAPTCHA DESHABILITADO - Continuando sin verificación...")
    
    // Validar datos obligatorios
    if (!data.correo) {
      console.error("Falta el correo electrónico")
      return NextResponse.json({ error: "El correo electrónico es obligatorio" }, { status: 400 })
    }
    
    // Si no hay nombre_completo pero sí nombres y apellidos, construirlo
    if (!data.nombre_completo && data.nombres && data.apellidos) {
      data.nombre_completo = `${data.nombres} ${data.apellidos}`.trim()
      console.log("✅ nombre_completo construido desde nombres + apellidos:", data.nombre_completo)
    }
    
    // Validar que ahora sí tengamos nombre_completo
    if (!data.nombre_completo) {
      console.error("Falta el nombre completo (no se pudo construir)")
      return NextResponse.json({ error: "El nombre completo es obligatorio" }, { status: 400 })
    }
    // Añadir fecha de registro si no existe
    if (!data.fecha_registro) {
      data.fecha_registro = new Date().toISOString()
    }
    // NOTA: El hash de password se hace en postgresql-database.ts (guardarInvestigador)
    // NO hashear aquí para evitar doble hash
    try {
      const resultado = await guardarInvestigador(datosRegistro)
      console.log("Resultado del guardado:", resultado)
      if (resultado.success) {
        return NextResponse.json({
          success: true,
          message: resultado.message,
          id: resultado.id,
        })
      } else {
        // Error de duplicado o validación
        return NextResponse.json({
          success: false,
          message: resultado.message,
          duplicado: !resultado.success,
        }, { status: 409 }) // 409 Conflict para duplicados
      }
    } catch (dbError) {
      console.error("Error al guardar en la base de datos:", dbError)
      return NextResponse.json({
        error: `Error al guardar en la base de datos: ${dbError instanceof Error ? dbError.message : "Error desconocido"}`,
      }, { status: 500 })
    }
  } catch (error) {
    console.error("Error al procesar el registro:", error)
    return NextResponse.json({
      error: `Error al procesar el registro: ${error instanceof Error ? error.message : "Error desconocido"}`,
    }, { status: 500 })
  }
}
