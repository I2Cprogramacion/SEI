import { render, screen } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/navbar'

// Mock de Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

// Mock de localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
})

describe('Navbar Component', () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: jest.fn(),
      back: jest.fn(),
    })
    mockLocalStorage.getItem.mockClear()
  })

  it('debería mostrar botones de login y registro cuando no hay usuario', () => {
    mockLocalStorage.getItem.mockReturnValue(null)

    render(<Navbar />)

    expect(screen.getByText('Iniciar Sesión')).toBeInTheDocument()
    expect(screen.getByText('Registrarse')).toBeInTheDocument()
    expect(screen.queryByText('Cerrar sesión')).not.toBeInTheDocument()
  })

  it('debería mostrar nombre del usuario y botón de logout cuando está logueado', () => {
    const usuarioMock = {
      nombre: 'Juan Pérez',
      email: 'juan@example.com'
    }
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(usuarioMock))

    render(<Navbar />)

    expect(screen.getByText('Juan Pérez')).toBeInTheDocument()
    expect(screen.getByText('Cerrar sesión')).toBeInTheDocument()
    expect(screen.queryByText('Iniciar Sesión')).not.toBeInTheDocument()
    expect(screen.queryByText('Registrarse')).not.toBeInTheDocument()
  })

  it('debería mostrar email cuando el nombre es muy largo', () => {
    const usuarioMock = {
      nombre: 'Este es un nombre muy largo que excede los 35 caracteres permitidos',
      email: 'usuario@example.com'
    }
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(usuarioMock))

    render(<Navbar />)

    expect(screen.getByText('usuario@example.com')).toBeInTheDocument()
    expect(screen.queryByText(usuarioMock.nombre)).not.toBeInTheDocument()
  })

  it('debería manejar error de parsing de localStorage', () => {
    mockLocalStorage.getItem.mockReturnValue('invalid json')

    render(<Navbar />)

    // Debería mostrar botones de login/registro como fallback
    expect(screen.getByText('Iniciar Sesión')).toBeInTheDocument()
    expect(screen.getByText('Registrarse')).toBeInTheDocument()
  })

  it('debería tener enlaces de navegación correctos', () => {
    mockLocalStorage.getItem.mockReturnValue(null)

    render(<Navbar />)

    // Verificar que los enlaces apuntan a las páginas correctas
    expect(screen.getByText('Inicio').closest('a')).toHaveAttribute('href', '/')
    expect(screen.getByText('Proyectos').closest('a')).toHaveAttribute('href', '/proyectos')
    expect(screen.getByText('Publicaciones').closest('a')).toHaveAttribute('href', '/publicaciones')
    expect(screen.getByText('Investigadores').closest('a')).toHaveAttribute('href', '/investigadores')
  })
})
