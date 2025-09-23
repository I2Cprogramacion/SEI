import { NextRequest } from 'next/server'
import { POST } from '@/app/api/auth/login/route'

describe('/api/auth/login', () => {
  const credencialesValidas = {
    email: 'test@example.com',
    password: 'password123'
  }

  const credencialesInvalidas = {
    email: 'wrong@example.com',
    password: 'wrongpassword'
  }

  it('debería autenticar usuario con credenciales válidas', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credencialesValidas),
      headers: { 'Content-Type': 'application/json' }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.user).toBeDefined()
    expect(data.user.email).toBe(credencialesValidas.email)
    expect(data.user.nombre).toBeDefined()
  })

  it('debería rechazar credenciales inválidas', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credencialesInvalidas),
      headers: { 'Content-Type': 'application/json' }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Credenciales inválidas')
  })

  it('debería rechazar request sin email', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ password: 'password123' }),
      headers: { 'Content-Type': 'application/json' }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Email y contraseña son requeridos')
  })

  it('debería rechazar request sin contraseña', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com' }),
      headers: { 'Content-Type': 'application/json' }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Email y contraseña son requeridos')
  })

  it('debería manejar errores de parsing JSON', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: 'invalid json',
      headers: { 'Content-Type': 'application/json' }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Datos inválidos')
  })
})
