/**
 * Validación Zod para endpoints de registro
 * Previene campos maliciosos y asegura datos seguros
 */

import { z } from 'zod'

// Schema para validar registro de investigador
export const registroInvestigadorSchema = z.object({
  // Clerk ID (requerido)
  clerk_user_id: z.string().min(1, 'clerk_user_id es requerido'),
  
  // Datos personales básicos
  correo: z.string().email('Correo inválido'),
  nombre_completo: z.string().min(1, 'Nombre completo es requerido'),
  nombres: z.string().optional(),
  apellidos: z.string().optional(),
  
  // Identificación oficial (longitud exacta)
  curp: z.string().length(18, 'CURP debe tener 18 caracteres').optional().or(z.literal('')),
  rfc: z.string().max(13, 'RFC debe tener máximo 13 caracteres').optional().or(z.literal('')),
  no_cvu: z.string().optional(),
  
  // Contacto
  telefono: z.string().optional(),
  
  // Académico
  ultimo_grado_estudios: z.string().optional(),
  grado_maximo_estudios: z.string().optional(),
  empleo_actual: z.string().optional(),
  
  // Investigación
  linea_investigacion: z.string().optional(),
  area_investigacion: z.string().optional(),
  disciplina: z.string().optional(),
  especialidad: z.string().optional(),
  
  // Ubicación
  nacionalidad: z.string().optional(),
  fecha_nacimiento: z.string().optional(),
  genero: z.string().optional(),
  municipio: z.string().optional(),
  estado_nacimiento: z.string().optional(),
  entidad_federativa: z.string().optional(),
  
  // Institucional
  institucion_id: z.string().optional(),
  institucion: z.string().optional(),
  departamento: z.string().optional(),
  ubicacion: z.string().optional(),
  sitio_web: z.string().url().optional().or(z.literal('')),
  
  // Identificadores
  orcid: z.string().optional(),
  
  // Nivel
  nivel: z.string().optional(),
  nivel_investigador: z.string().optional(),
  nivel_actual_id: z.string().optional(),
  fecha_asignacion_nivel: z.string().optional(),
  nivel_sni: z.string().optional(),
  sni: z.string().optional(),
  anio_sni: z.number().optional(),
  
  // Tipo perfil
  tipo_perfil: z.enum(['INVESTIGADOR', 'TECNOLOGO', 'AMBOS']).optional(),
  nivel_tecnologo: z.string().optional(),
  nivel_tecnologo_id: z.string().optional(),
  
  // URLs
  fotografia_url: z.string().url().optional().or(z.literal('')),
  cv_url: z.string().url().optional().or(z.literal('')),
  
  // Metadata
  fecha_registro: z.string().optional(),
  origen: z.string().optional(),
  
  // Producción académica
  experiencia_docente: z.string().optional(),
  experiencia_laboral: z.string().optional(),
  proyectos_investigacion: z.string().optional(),
  proyectos_vinculacion: z.string().optional(),
  libros: z.string().optional(),
  capitulos_libros: z.string().optional(),
  articulos: z.string().optional(),
  premios_distinciones: z.string().optional(),
  idiomas: z.string().optional(),
  colaboracion_internacional: z.string().optional(),
  colaboracion_nacional: z.string().optional(),
})
// Bloquear explícitamente campos admin que no deben venir del cliente
.refine((data) => !('es_admin' in data), {
  message: 'Campo es_admin no permitido',
  path: ['es_admin'],
})
.refine((data) => !('es_evaluador' in data), {
  message: 'Campo es_evaluador no permitido',
  path: ['es_evaluador'],
})
.refine((data) => !('activo' in data), {
  message: 'Campo activo no permitido',
  path: ['activo'],
})

export type RegistroInvestigadorInput = z.infer<typeof registroInvestigadorSchema>

// Schema para actualización de perfil (usuario regular)
// Recrear sin clerk_user_id y correo, todos los campos opcionales
export const actualizarPerfilSchema = z.object({
  nombre_completo: z.string().optional(),
  nombres: z.string().optional(),
  apellidos: z.string().optional(),
  curp: z.string().length(18).optional().or(z.literal('')),
  rfc: z.string().max(13).optional().or(z.literal('')),
  no_cvu: z.string().optional(),
  telefono: z.string().optional(),
  ultimo_grado_estudios: z.string().optional(),
  grado_maximo_estudios: z.string().optional(),
  empleo_actual: z.string().optional(),
  linea_investigacion: z.string().optional(),
  area_investigacion: z.string().optional(),
  disciplina: z.string().optional(),
  especialidad: z.string().optional(),
  nacionalidad: z.string().optional(),
  fecha_nacimiento: z.string().optional(),
  genero: z.string().optional(),
  municipio: z.string().optional(),
  estado_nacimiento: z.string().optional(),
  entidad_federativa: z.string().optional(),
  institucion_id: z.string().optional(),
  institucion: z.string().optional(),
  departamento: z.string().optional(),
  ubicacion: z.string().optional(),
  sitio_web: z.string().url().optional().or(z.literal('')),
  orcid: z.string().optional(),
  nivel: z.string().optional(),
  nivel_investigador: z.string().optional(),
  nivel_actual_id: z.string().optional(),
  fecha_asignacion_nivel: z.string().optional(),
  nivel_sni: z.string().optional(),
  sni: z.string().optional(),
  anio_sni: z.number().optional(),
  tipo_perfil: z.enum(['INVESTIGADOR', 'TECNOLOGO', 'AMBOS']).optional(),
  nivel_tecnologo: z.string().optional(),
  nivel_tecnologo_id: z.string().optional(),
  fotografia_url: z.string().url().optional().or(z.literal('')),
  cv_url: z.string().url().optional().or(z.literal('')),
  experiencia_docente: z.string().optional(),
  experiencia_laboral: z.string().optional(),
  proyectos_investigacion: z.string().optional(),
  proyectos_vinculacion: z.string().optional(),
  libros: z.string().optional(),
  capitulos_libros: z.string().optional(),
  articulos: z.string().optional(),
  premios_distinciones: z.string().optional(),
  idiomas: z.string().optional(),
  colaboracion_internacional: z.string().optional(),
  colaboracion_nacional: z.string().optional(),
})
.refine((data) => !('es_admin' in data), {
  message: 'Campo es_admin no permitido',
})
.refine((data) => !('es_evaluador' in data), {
  message: 'Campo es_evaluador no permitido',
})
.refine((data) => !('activo' in data), {
  message: 'Campo activo no permitido',
})
