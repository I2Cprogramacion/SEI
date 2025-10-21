# 🔐 Configuración de Google Sign-In en Clerk

Este documento explica cómo habilitar el inicio de sesión con Google en tu aplicación SEI usando Clerk.

## 📋 Requisitos Previos

- Cuenta de Clerk activa
- Acceso al Dashboard de Clerk
- Proyecto SEI configurado en Clerk

## 🚀 Pasos para Habilitar Google Sign-In

### 1. Acceder al Dashboard de Clerk

1. Ve a [https://dashboard.clerk.com](https://dashboard.clerk.com)
2. Inicia sesión con tu cuenta
3. Selecciona tu aplicación **SEI**

### 2. Habilitar Google como Proveedor OAuth

1. En el menú lateral, ve a **"User & Authentication"** → **"Social Connections"**
2. Busca **"Google"** en la lista de proveedores
3. Haz clic en el toggle para **habilitar Google**
4. Clerk proporcionará credenciales de desarrollo automáticamente

### 3. Configuración de Producción (Opcional pero Recomendado)

Para producción, debes usar tus propias credenciales de Google:

#### a) Crear Proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la **Google+ API**

#### b) Configurar OAuth Consent Screen

1. Ve a **"APIs & Services"** → **"OAuth consent screen"**
2. Selecciona **"External"** como tipo de usuario
3. Completa la información:
   - **App name**: SEI - Sistema Estatal de Investigadores
   - **User support email**: tu email
   - **Developer contact email**: tu email
4. Guarda y continúa

#### c) Crear Credenciales OAuth 2.0

1. Ve a **"APIs & Services"** → **"Credentials"**
2. Clic en **"Create Credentials"** → **"OAuth 2.0 Client ID"**
3. Selecciona **"Web application"**
4. Configura:
   - **Name**: SEI Clerk OAuth
   - **Authorized JavaScript origins**:
     ```
     https://sei-chih.com.mx
     https://accounts.sei-chih.com.mx
     ```
   - **Authorized redirect URIs** (obtén esto de Clerk Dashboard):
     ```
     https://accounts.sei-chih.com.mx/v1/oauth_callback
     ```
5. Clic en **"Create"**
6. Copia el **Client ID** y **Client Secret**

#### d) Configurar en Clerk

1. Regresa al Clerk Dashboard
2. En la configuración de Google, clic en **"Use custom credentials"**
3. Pega:
   - **Client ID**: el que copiaste de Google
   - **Client Secret**: el que copiaste de Google
4. Guarda los cambios

### 4. Verificar Configuración en el Código

El código ya está configurado para soportar Google Sign-In. Verifica en:

**`app/iniciar-sesion/[[...rest]]/page.tsx`**:
```tsx
<SignIn 
  appearance={{
    layout: {
      socialButtonsPlacement: 'top',  // ✅ Botones sociales arriba
      socialButtonsVariant: 'blockButton',  // ✅ Botones grandes
    }
  }}
  // ... resto de configuración
/>
```

**`app/registro/[[...rest]]/page.tsx`** (debe ser similar)

### 5. Probar Google Sign-In

1. Ve a tu aplicación en desarrollo: `http://localhost:3000/iniciar-sesion`
2. Deberías ver un botón **"Continue with Google"** en la parte superior
3. Haz clic y prueba el flujo de autenticación
4. Si funciona, también prueba en producción

## 🎨 Personalización del Botón de Google

Ya está personalizado en el código con estos estilos:

```tsx
socialButtonsBlockButton: 
  'border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 text-gray-700 font-medium',
```

## 🔍 Verificación de Estado

Para verificar que Google está habilitado:

1. Ve al Clerk Dashboard
2. **User & Authentication** → **Social Connections**
3. Google debe mostrar un toggle verde ✅

## 📱 Flujo de Usuario

### Inicio de Sesión
1. Usuario hace clic en **"Continue with Google"**
2. Redirige a Google OAuth
3. Usuario selecciona su cuenta de Google
4. Google redirige de vuelta a Clerk
5. Clerk crea/actualiza el usuario
6. Usuario es redirigido a `/dashboard`

### Registro
1. Mismo flujo que inicio de sesión
2. Si es primera vez, Clerk crea cuenta automáticamente
3. Se sincroniza con tu base de datos mediante webhooks (opcional)

## ⚙️ Configuración Adicional

### Habilitar más proveedores OAuth

Además de Google, puedes habilitar:

- **GitHub** - Ideal para investigadores técnicos
- **Microsoft** - Para usuarios con cuentas institucionales
- **Facebook** - Mayor alcance general
- **LinkedIn** - Para networking profesional

Para habilitar cualquiera:
1. Ve a **Social Connections**
2. Activa el toggle del proveedor deseado
3. Configura credenciales si es necesario

### Campos adicionales de Google

Por defecto, Clerk obtiene:
- ✅ Nombre completo
- ✅ Email
- ✅ Foto de perfil
- ✅ Email verificado

## 🐛 Solución de Problemas

### Botón de Google no aparece

**Posibles causas:**
1. Google no está habilitado en Clerk Dashboard
2. Error en la configuración de `appearance` en SignIn
3. Caché del navegador

**Solución:**
```bash
# Limpiar caché de Next.js
rm -rf .next
npm run dev
```

### Error "redirect_uri_mismatch"

**Causa:** La URI de redirección no coincide

**Solución:**
1. Verifica las URIs en Google Cloud Console
2. Asegúrate de que coincidan EXACTAMENTE con las de Clerk
3. Incluye tanto desarrollo como producción

### Usuario no se sincroniza con BD

**Causa:** No hay webhook configurado

**Solución:**
1. Ve a **Webhooks** en Clerk Dashboard
2. Crea webhook para evento `user.created`
3. Apunta a `https://sei-chih.com.mx/api/webhooks/clerk`

## 📚 Referencias

- [Documentación de Clerk - Social Login](https://clerk.com/docs/authentication/social-connections/google)
- [Google OAuth 2.0 Setup](https://developers.google.com/identity/protocols/oauth2)
- [Clerk Dashboard](https://dashboard.clerk.com)

## ✅ Checklist de Configuración

- [ ] Google habilitado en Clerk Dashboard
- [ ] Credenciales de producción configuradas (opcional)
- [ ] Botón de Google visible en `/iniciar-sesion`
- [ ] Flujo de OAuth funcional en desarrollo
- [ ] Flujo de OAuth funcional en producción
- [ ] URIs de redirección configuradas correctamente
- [ ] Webhooks configurados para sincronizar usuarios (opcional)

## 🎉 Resultado Final

Una vez configurado, los usuarios podrán:

1. ✅ Iniciar sesión con un clic usando su cuenta de Google
2. ✅ No necesitan crear contraseña
3. ✅ Perfil pre-poblado con datos de Google
4. ✅ Email verificado automáticamente
5. ✅ Experiencia más rápida y segura

---

**Nota**: El código de la aplicación **ya está preparado** para Google Sign-In. Solo necesitas habilitarlo en el Dashboard de Clerk.
