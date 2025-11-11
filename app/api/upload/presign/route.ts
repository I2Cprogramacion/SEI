import { NextRequest, NextResponse } from 'next/server'

/**
 * Endpoint de presign para Vercel Blob
 * Recibe JSON { filename, contentType, size }
 * Requiere la variable de entorno VERCEL_TOKEN con permisos de Blob (scope: "scope:project" o similar)
 * Retorna { uploadUrl, url } donde el cliente hará PUT a uploadUrl y url es la URL pública final.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { filename, contentType, size } = body || {}

    if (!filename || !contentType) {
      return NextResponse.json({ error: 'filename y contentType son requeridos' }, { status: 400 })
    }

    const token = process.env.VERCEL_TOKEN
    if (!token) {
      return NextResponse.json({ error: 'VERCEL_TOKEN no está configurado en el entorno' }, { status: 500 })
    }

    // Llamada a la API de Vercel Blob para crear un upload
    const vercelRes = await fetch('https://api.vercel.com/v1/blob', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: filename,
        // metadata opcional
        size: size || undefined,
        contentType: contentType
      })
    })

    if (!vercelRes.ok) {
      const text = await vercelRes.text()
      console.error('Vercel Blob API error:', vercelRes.status, text)
      return NextResponse.json({ error: 'Fallo al solicitar presign a Vercel Blob', details: text }, { status: 502 })
    }

    const data = await vercelRes.json()

    // La API de Vercel Blob responde con campos como uploadURL y url (puede variar);
    // devolveremos ambos y el cliente elegirá cuál usar.
    const uploadUrl = data.uploadURL || data.uploadUrl || data.upload_url || data.u || null
    const url = data.url || data.fileUrl || data.publicUrl || null

    if (!uploadUrl) {
      console.error('Respuesta inesperada de Vercel Blob:', data)
      return NextResponse.json({ error: 'Respuesta inválida de Vercel Blob' }, { status: 502 })
    }

    return NextResponse.json({ uploadUrl, url })
  } catch (err) {
    console.error('Error en presign route:', err)
    return NextResponse.json({ error: 'Error interno en presign' }, { status: 500 })
  }
}
