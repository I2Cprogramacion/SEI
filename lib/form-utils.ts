// Utilidades para formateo automático de campos de formulario

/**
 * Formatea un RFC automáticamente
 */
export function formatRFC(value: string, tipoPersona: "fisica" | "moral"): string {
  // Eliminar espacios y caracteres especiales
  let formatted = value.toUpperCase().replace(/[^A-Z0-9Ñ&]/g, "")
  
  // Limitar longitud según tipo
  const maxLength = tipoPersona === "moral" ? 12 : 13
  formatted = formatted.slice(0, maxLength)
  
  return formatted
}

/**
 * Formatea un CURP automáticamente
 */
export function formatCURP(value: string): string {
  // Eliminar espacios y caracteres especiales, convertir a mayúsculas
  let formatted = value.toUpperCase().replace(/[^A-Z0-9]/g, "")
  
  // Limitar a 18 caracteres
  formatted = formatted.slice(0, 18)
  
  return formatted
}

/**
 * Formatea un teléfono automáticamente
 */
export function formatPhone(value: string): string {
  // Eliminar todo excepto números
  let formatted = value.replace(/\D/g, "")
  
  // Limitar a 10 dígitos
  formatted = formatted.slice(0, 10)
  
  // Formatear como (###) ###-####
  if (formatted.length >= 6) {
    formatted = `(${formatted.slice(0, 3)}) ${formatted.slice(3, 6)}-${formatted.slice(6)}`
  } else if (formatted.length >= 3) {
    formatted = `(${formatted.slice(0, 3)}) ${formatted.slice(3)}`
  }
  
  return formatted
}

/**
 * Formatea un código postal automáticamente
 */
export function formatCP(value: string): string {
  // Solo números, máximo 5
  return value.replace(/\D/g, "").slice(0, 5)
}

/**
 * Formatea un DOI automáticamente
 */
export function formatDOI(value: string): string {
  // Eliminar espacios al inicio y final
  return value.trim()
}

/**
 * Formatea un ISSN automáticamente (####-####)
 */
export function formatISSN(value: string): string {
  // Eliminar todo excepto números y X
  let formatted = value.toUpperCase().replace(/[^0-9X]/g, "")
  
  // Limitar a 8 caracteres
  formatted = formatted.slice(0, 8)
  
  // Agregar guion después del cuarto carácter
  if (formatted.length > 4) {
    formatted = `${formatted.slice(0, 4)}-${formatted.slice(4)}`
  }
  
  return formatted
}

/**
 * Validaciones en tiempo real
 */
export const validators = {
  rfc: (value: string, tipoPersona: "fisica" | "moral"): boolean => {
    const regex = tipoPersona === "moral" 
      ? /^[A-ZÑ&]{3}\d{6}[A-Z0-9]{3}$/
      : /^[A-Z]{4}\d{6}[A-Z0-9]{3}$/
    return regex.test(value)
  },
  
  curp: (value: string): boolean => {
    const regex = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[0-9A-Z]\d$/
    return regex.test(value)
  },
  
  phone: (value: string): boolean => {
    const cleanPhone = value.replace(/\D/g, "")
    return cleanPhone.length === 10
  },
  
  email: (value: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  },
  
  cp: (value: string): boolean => {
    return /^\d{5}$/.test(value)
  },
  
  doi: (value: string): boolean => {
    if (!value) return true
    return /^10\.\d{4,}(.\d+)*\/[-._;()/:A-Za-z0-9]+$/.test(value)
  },
  
  issn: (value: string): boolean => {
    if (!value) return true
    return /^\d{4}-\d{3}[0-9X]$/.test(value)
  },
  
  url: (value: string): boolean => {
    if (!value) return true
    try {
      new URL(value)
      return true
    } catch {
      return false
    }
  }
}

/**
 * Obtener el estado de validación de un campo
 */
export function getFieldValidationState(
  value: string | undefined, 
  validator?: (value: string) => boolean,
  required: boolean = false
): "valid" | "invalid" | "empty" {
  if (!value || value.trim() === "") {
    return "empty"
  }
  
  if (validator) {
    return validator(value) ? "valid" : "invalid"
  }
  
  return required && value.trim().length > 0 ? "valid" : "empty"
}

/**
 * Calcular el progreso de una sección basado en campos requeridos
 */
export function calculateSectionProgress(
  fields: Array<{ value: any; required: boolean }>,
): number {
  const requiredFields = fields.filter(f => f.required)
  if (requiredFields.length === 0) return 100
  
  const completedFields = requiredFields.filter(f => {
    if (typeof f.value === "string") {
      return f.value.trim().length > 0
    }
    if (Array.isArray(f.value)) {
      return f.value.length > 0
    }
    return !!f.value
  })
  
  return Math.round((completedFields.length / requiredFields.length) * 100)
}

