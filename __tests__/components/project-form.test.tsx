import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import ProjectForm from '@/app/proyectos/nuevo/page'

// Mock de Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

// Mock de fetch
global.fetch = jest.fn()

const mockRouter = {
  push: jest.fn(),
  back: jest.fn(),
}

describe('Formulario de Proyecto', () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(global.fetch as jest.Mock).mockClear()
    mockRouter.push.mockClear()
  })

  it('debería renderizar todos los campos requeridos', () => {
    render(<ProjectForm />)

    // Campos básicos
    expect(screen.getByLabelText(/título/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/descripción/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/resumen/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/categoría/i)).toBeInTheDocument()

    // Campos del autor
    expect(screen.getByLabelText(/nombre completo/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/institución/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/fecha de inicio/i)).toBeInTheDocument()

    // Palabras clave
    expect(screen.getByLabelText(/agregar palabras clave/i)).toBeInTheDocument()
  })

  it('debería validar campos requeridos', async () => {
    render(<ProjectForm />)

    const submitButton = screen.getByText(/subir proyecto/i)
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/título es requerido/i)).toBeInTheDocument()
      expect(screen.getByText(/descripción es requerida/i)).toBeInTheDocument()
      expect(screen.getByText(/resumen es requerido/i)).toBeInTheDocument()
    })
  })

  it('debería agregar palabras clave correctamente', () => {
    render(<ProjectForm />)

    const inputPalabras = screen.getByLabelText(/agregar palabras clave/i)
    const botonAgregar = screen.getByRole('button', { name: /\+/ })

    // Agregar palabra clave
    fireEvent.change(inputPalabras, { target: { value: 'energía solar' } })
    fireEvent.click(botonAgregar)

    // Verificar que aparece como badge
    expect(screen.getByText('energía solar')).toBeInTheDocument()
    
    // Verificar que el input se limpia
    expect(inputPalabras).toHaveValue('')
  })

  it('debería permitir agregar palabras clave con Enter', () => {
    render(<ProjectForm />)

    const inputPalabras = screen.getByLabelText(/agregar palabras clave/i)

    fireEvent.change(inputPalabras, { target: { value: 'sostenibilidad' } })
    fireEvent.keyPress(inputPalabras, { key: 'Enter', code: 'Enter' })

    expect(screen.getByText('sostenibilidad')).toBeInTheDocument()
    expect(inputPalabras).toHaveValue('')
  })

  it('debería eliminar palabras clave', () => {
    render(<ProjectForm />)

    const inputPalabras = screen.getByLabelText(/agregar palabras clave/i)
    const botonAgregar = screen.getByRole('button', { name: /\+/ })

    // Agregar palabra clave
    fireEvent.change(inputPalabras, { target: { value: 'test keyword' } })
    fireEvent.click(botonAgregar)

    // Verificar que aparece
    expect(screen.getByText('test keyword')).toBeInTheDocument()

    // Eliminar palabra clave
    const botonEliminar = screen.getByTitle(/eliminar/i)
    fireEvent.click(botonEliminar)

    // Verificar que desaparece
    expect(screen.queryByText('test keyword')).not.toBeInTheDocument()
  })

  it('debería validar que hay al menos una palabra clave', async () => {
    render(<ProjectForm />)

    // Llenar campos requeridos
    fireEvent.change(screen.getByLabelText(/título/i), { 
      target: { value: 'Test Project' } 
    })
    fireEvent.change(screen.getByLabelText(/descripción/i), { 
      target: { value: 'Test Description' } 
    })
    fireEvent.change(screen.getByLabelText(/resumen/i), { 
      target: { value: 'Test Summary' } 
    })
    fireEvent.change(screen.getByLabelText(/categoría/i), { 
      target: { value: 'Test Category' } 
    })
    fireEvent.change(screen.getByLabelText(/nombre completo/i), { 
      target: { value: 'Test Author' } 
    })
    fireEvent.change(screen.getByLabelText(/institución/i), { 
      target: { value: 'Test Institution' } 
    })
    fireEvent.change(screen.getByLabelText(/fecha de inicio/i), { 
      target: { value: '2024-01-01' } 
    })

    const submitButton = screen.getByText(/subir proyecto/i)
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/debe agregar al menos una palabra clave/i)).toBeInTheDocument()
    })
  })

  it('debería subir archivo correctamente', async () => {
    // Mock de archivo
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' })
    
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ 
          message: 'Archivo subido exitosamente',
          fileName: 'test.pdf',
          url: '/uploads/test.pdf'
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ 
          message: 'Proyecto creado exitosamente' 
        })
      })

    render(<ProjectForm />)

    // Llenar formulario
    fireEvent.change(screen.getByLabelText(/título/i), { 
      target: { value: 'Test Project' } 
    })
    fireEvent.change(screen.getByLabelText(/descripción/i), { 
      target: { value: 'Test Description' } 
    })
    fireEvent.change(screen.getByLabelText(/resumen/i), { 
      target: { value: 'Test Summary' } 
    })
    fireEvent.change(screen.getByLabelText(/categoría/i), { 
      target: { value: 'Test Category' } 
    })
    fireEvent.change(screen.getByLabelText(/nombre completo/i), { 
      target: { value: 'Test Author' } 
    })
    fireEvent.change(screen.getByLabelText(/institución/i), { 
      target: { value: 'Test Institution' } 
    })
    fireEvent.change(screen.getByLabelText(/fecha de inicio/i), { 
      target: { value: '2024-01-01' } 
    })

    // Agregar palabra clave
    const inputPalabras = screen.getByLabelText(/agregar palabras clave/i)
    fireEvent.change(inputPalabras, { target: { value: 'test keyword' } })
    fireEvent.keyPress(inputPalabras, { key: 'Enter', code: 'Enter' })

    // Subir archivo
    const fileInput = screen.getByLabelText(/archivo del proyecto/i)
    fireEvent.change(fileInput, { target: { files: [file] } })

    // Enviar formulario
    const submitButton = screen.getByText(/subir proyecto/i)
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/upload', expect.any(Object))
      expect(global.fetch).toHaveBeenCalledWith('/api/proyectos', expect.any(Object))
    })
  })
})
