/**
 * Utilidad para generar slugs URL-friendly
 */

/**
 * Convierte un texto a slug (URL-friendly)
 * @param text - Texto a convertir
 * @returns Slug generado
 * 
 * @example
 * generateSlug("José García López") // => "jose-garcia-lopez"
 * generateSlug("María Ángeles Pérez") // => "maria-angeles-perez"
 */
export function generateSlug(text: string): string {
  if (!text) return ''
  
  return text
    .toLowerCase()
    .normalize('NFD') // Descomponer caracteres con acentos
    .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
    .replace(/[^a-z0-9\s-]/g, '') // Eliminar caracteres especiales
    .trim()
    .replace(/\s+/g, '-') // Espacios a guiones
    .replace(/-+/g, '-') // Múltiples guiones a uno solo
}

/**
 * Genera un slug único agregando un sufijo si es necesario
 * @param baseSlug - Slug base
 * @param id - ID opcional para hacer único
 * @returns Slug único
 */
export function generateUniqueSlug(baseSlug: string, id?: number): string {
  if (!id) return baseSlug
  return `${baseSlug}-${id}`
}

/**
 * Valida si un slug es válido
 * @param slug - Slug a validar
 * @returns true si es válido
 */
export function isValidSlug(slug: string): boolean {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
  return slugRegex.test(slug)
}
