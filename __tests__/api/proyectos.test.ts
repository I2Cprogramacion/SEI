import { NextRequest } from 'next/server'
import { POST, GET } from '@/app/api/proyectos/route'
import { promises as fs } from 'fs'
import path from 'path'

// Mock del sistema de archivos
jest.mock('fs', () => ({
  promises: {
    mkdir: jest.fn(),
    readFile: jest.fn(),
    writeFile: jest.fn(),
  },
}))

const mockFs = fs as jest.Mocked<typeof fs>

describe('/api/proyectos', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Mock del archivo de datos existente
    mockFs.readFile.mockResolvedValue('[]')
  })

  describe('GET', () => {
    it('debería devolver lista vacía cuando no hay proyectos', async () => {
      mockFs.readFile.mockResolvedValue('[]')
      
      const response = await GET()
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.proyectos).toEqual([])
    })

    it('debería devolver proyectos existentes', async () => {
      const proyectosMock = [
        {
          id: 1,
          titulo: 'Test Project',
          autor: 'Test Author',
          categoria: 'Test Category'
        }
      ]
      mockFs.readFile.mockResolvedValue(JSON.stringify(proyectosMock))
      
      const response = await GET()
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.proyectos).toEqual(proyectosMock)
    })

    it('debería manejar errores de lectura de archivo', async () => {
      mockFs.readFile.mockRejectedValue(new Error('File read error'))
      
      const response = await GET()
      const data = await response.json()
      
      expect(response.status).toBe(200)
      expect(data.proyectos).toEqual([])
    })
  })

  describe('POST', () => {
    const proyectoValido = {
      titulo: 'Test Project',
      descripcion: 'Test Description',
      resumen: 'Test Summary',
      categoria: 'Test Category',
      autor: 'Test Author',
      institucion: 'Test Institution',
      fechaInicio: '2024-01-01',
      palabrasClave: ['test', 'keyword']
    }

    it('debería crear un proyecto válido', async () => {
      const request = new NextRequest('http://localhost:3000/api/proyectos', {
        method: 'POST',
        body: JSON.stringify(proyectoValido),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.message).toBe('Proyecto creado exitosamente')
      expect(data.proyecto).toMatchObject({
        titulo: proyectoValido.titulo,
        autor: proyectoValido.autor,
        slug: 'test-project'
      })
      expect(mockFs.writeFile).toHaveBeenCalled()
    })

    it('debería rechazar proyecto con campos faltantes', async () => {
      const proyectoIncompleto = {
        titulo: 'Test Project'
        // Faltan campos requeridos
      }

      const request = new NextRequest('http://localhost:3000/api/proyectos', {
        method: 'POST',
        body: JSON.stringify(proyectoIncompleto),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Campos faltantes')
    })

    it('debería generar slug correctamente', async () => {
      const request = new NextRequest('http://localhost:3000/api/proyectos', {
        method: 'POST',
        body: JSON.stringify(proyectoValido),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(data.proyecto.slug).toBe('test-project')
    })

    it('debería manejar errores de escritura', async () => {
      mockFs.writeFile.mockRejectedValue(new Error('Write error'))

      const request = new NextRequest('http://localhost:3000/api/proyectos', {
        method: 'POST',
        body: JSON.stringify(proyectoValido),
        headers: { 'Content-Type': 'application/json' }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Error interno del servidor')
    })
  })
})
