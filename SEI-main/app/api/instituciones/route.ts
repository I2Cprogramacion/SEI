import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyJWT } from "@/lib/auth/verify-jwt"

function getAuthPayload(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (!authHeader) return null
  const token = authHeader.replace("Bearer ", "")
  return verifyJWT(token)
}

export async function GET(request: NextRequest) {
  const payload = getAuthPayload(request)
  if (!payload) {
    return NextResponse.json({ error: "Token inválido o no proporcionado" }, { status: 401 })
  }
  try {
    const searchParams = request.nextUrl.searchParams
    const q = searchParams.get("q")?.trim() ?? ""
    const tipo = searchParams.get("tipo")?.trim() ?? ""
    const estado = searchParams.get("estado")?.trim() ?? ""
    const page = Number(searchParams.get("page") ?? 1)
    const pageSize = Math.min(Number(searchParams.get("pageSize") ?? 20), 100)

    const where: any = {}
    
    // Filtro de búsqueda general
    if (q) {
      where.OR = [
        { nombre: { contains: q, mode: "insensitive" } },
        { tipo: { contains: q, mode: "insensitive" } },
        { ubicacion: { contains: q, mode: "insensitive" } },
      ]
    }
    
    // Filtro por tipo
    if (tipo) {
      where.tipo = { equals: tipo }
    }
    
    // Filtro por estado (asumiendo que activo es true por defecto)
    if (estado === "activo") {
      where.activo = { not: false }
    } else if (estado === "inactivo") {
      where.activo = false
    }

    const [total, items] = await Promise.all([
      prisma.institution.count({ where }),
      prisma.institution.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ])

    return NextResponse.json({ items, total, page, pageSize })
  } catch (error) {
    console.error("Error al listar instituciones:", error)
    return NextResponse.json({ error: "Error al obtener las instituciones" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const payload = getAuthPayload(request)
  if (!payload) {
    return NextResponse.json({ error: "Token inválido o no proporcionado" }, { status: 401 })
  }
  try {
    const body = await request.json()
    const { nombre, tipo, ubicacion, sitioWeb } = body ?? {}
    if (!nombre || typeof nombre !== "string") {
      return NextResponse.json({ error: "'nombre' es obligatorio" }, { status: 400 })
    }
    const created = await prisma.institution.create({
      data: {
        nombre,
        tipo: tipo ?? null,
        ubicacion: ubicacion ?? null,
        sitioWeb: sitioWeb ?? null,
      },
    })
    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    console.error("Error al crear institución:", error)
    return NextResponse.json({ error: "Error al crear la institución" }, { status: 500 })
  }
}



