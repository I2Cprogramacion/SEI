/**
 * Configuración de cookies seguras para la aplicación
 * Maneja los atributos necesarios para cookies de terceros y particionadas
 */

export const secureCookieOptions = {
  // Para cookies de terceros (como __cf_bm de Cloudflare)
  thirdParty: {
    sameSite: 'None' as const,
    secure: true,
    partitioned: true, // Requerido para navegadores modernos con SameSite=None
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  // Para cookies de sesión (propias del sitio)
  session: {
    sameSite: 'Strict' as const,
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 12 * 60 * 60, // 12 horas
  },
  // Para cookies de preferencias
  preferences: {
    sameSite: 'Lax' as const,
    secure: process.env.NODE_ENV === 'production',
    httpOnly: false,
    maxAge: 365 * 24 * 60 * 60, // 1 año
  },
};

/**
 * Formatea las opciones de cookie para Set-Cookie header
 */
export function formatCookieHeader(
  name: string,
  value: string,
  options: {
    sameSite?: 'Strict' | 'Lax' | 'None';
    secure?: boolean;
    httpOnly?: boolean;
    partitioned?: boolean;
    maxAge?: number;
    path?: string;
    domain?: string;
  } = {}
): string {
  const {
    sameSite = 'Lax',
    secure = true,
    httpOnly = true,
    partitioned = false,
    maxAge,
    path = '/',
  } = options;

  let header = `${name}=${encodeURIComponent(value)}`;
  
  if (path) header += `; Path=${path}`;
  if (sameSite) header += `; SameSite=${sameSite}`;
  if (secure) header += '; Secure';
  if (httpOnly) header += '; HttpOnly';
  if (partitioned && sameSite === 'None') header += '; Partitioned';
  if (maxAge) header += `; Max-Age=${maxAge}`;

  return header;
}

/**
 * Detecta si una cookie es de terceros basándose en su nombre
 */
export function isThirdPartyCookie(cookieName: string): boolean {
  const thirdPartyCookies = [
    '__cf_bm', // Cloudflare Bot Management
    '__cf_chl', // Cloudflare Challenge
    '_cf_', // Cloudflare general
    '__cfruid', // Cloudflare RID
    '__cfruid', // Cloudflare
    'ga', // Google Analytics
    '_ga', // Google Analytics
    '_gid', // Google Analytics
  ];

  return thirdPartyCookies.some(prefix => cookieName.startsWith(prefix));
}

/**
 * Valida y normaliza cookies para cumplir con estándares modernos
 */
export function normalizeCookie(cookieHeader: string): string {
  // Si la cookie no tiene SameSite=None, añadirlo
  if (cookieHeader.includes('SameSite=None')) {
    // Ya tiene SameSite=None, asegurar que tiene Partitioned
    if (!cookieHeader.includes('Partitioned')) {
      cookieHeader += '; Partitioned';
    }
  }
  return cookieHeader;
}
