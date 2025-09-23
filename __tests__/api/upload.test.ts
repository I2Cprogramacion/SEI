import { NextRequest } from 'next/server'
import { POST } from '@/app/api/upload/route'
import { promises as fs } from 'fs'

// Mock del sistema de archivos
jest.mock('fs', () => ({
  promises: {
    writeFile: jest.fn(),
    mkdir: jest.fn(),
  },
}))

const mockFs = fs as jest.Mocked<typeof fs>

describe('/api/upload', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('debería rechazar request sin archivo', async () => {
    const formData = new FormData()
    const request = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('No se encontró archivo')
  })

  it('debería rechazar archivos muy grandes', async () => {
    // Crear un archivo mock de 15MB (mayor al límite de 10MB)
    const archivoGrande = new File(['x'.repeat(15 * 1024 * 1024)], 'test.pdf', {
      type: 'application/pdf'
    })

    const formData = new FormData()
    formData.append('file', archivoGrande)

    const request = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('El archivo es demasiado grande. Máximo 10MB')
  })

  it('debería rechazar tipos de archivo no permitidos', async () => {
    const archivoInvalido = new File(['contenido'], 'test.txt', {
      type: 'text/plain'
    })

    const formData = new FormData()
    formData.append('file', archivoInvalido)

    const request = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Tipo de archivo no permitido. Solo PDF, DOC, DOCX')
  })

  it('debería aceptar archivo PDF válido', async () => {
    const archivoValido = new File(['contenido pdf'], 'test.pdf', {
      type: 'application/pdf'
    })

    const formData = new FormData()
    formData.append('file', archivoValido)

    const request = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.message).toBe('Archivo subido exitosamente')
    expect(data.fileName).toMatch(/^\d{13}-test\.pdf$/)
    expect(data.url).toMatch(/^\/uploads\/\d{13}-test\.pdf$/)
  })

  it('debería aceptar archivo DOC válido', async () => {
    const archivoValido = new File(['contenido doc'], 'test.doc', {
      type: 'application/msword'
    })

    const formData = new FormData()
    formData.append('file', archivoValido)

    const request = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.message).toBe('Archivo subido exitosamente')
    expect(data.fileName).toMatch(/^\d{13}-test\.doc$/)
  })

  it('debería manejar errores de escritura', async () => {
    mockFs.writeFile.mockRejectedValue(new Error('Write error'))

    const archivoValido = new File(['contenido'], 'test.pdf', {
      type: 'application/pdf'
    })

    const formData = new FormData()
    formData.append('file', archivoValido)

    const request = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Error interno del servidor')
  })
})
