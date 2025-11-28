/**
 * Parámetros de referencia para la evaluación del SNII
 * (Sistema Nacional de Investigadores e Innovadores)
 * 
 * DATOS OFICIALES del Anexo de Parámetros de Referencia para la Evaluación del SNII
 * Q1: Cuartil 25% | Q2: Mediana 50% | Q3: Cuartil 75%
 */

export interface ParametrosSNII {
  articulos: { q1: number; q2: number; q3: number }
  libros: { q1: number; q2: number; q3: number }
  capitulos: { q1: number; q2: number; q3: number }
  desarrolloTecnologico: { q1: number; q2: number; q3: number }
  propiedadIntelectual: { q1: number; q2: number; q3: number }
  transferenciaTecnologica: { q1: number; q2: number; q3: number }
  docencia: { q1: number; q2: number; q3: number }
  formacionComunidad: { q1: number; q2: number; q3: number }
  accesoUniversal: { q1: number; q2: number; q3: number }
  consideraciones: string
}

export interface AreaSNII {
  id: string
  nombre: string
  candidato: ParametrosSNII
  nivel1: ParametrosSNII
  nivel2: ParametrosSNII
  nivel3: ParametrosSNII
}

export const AREAS_SNII: Record<string, AreaSNII> = {
  area1: {
    id: "area1",
    nombre: "Físico-Matemáticas y Ciencias de la Tierra",
    candidato: {
      articulos: { q1: 2, q2: 3, q3: 5 },
      libros: { q1: 0, q2: 0, q3: 0 },
      capitulos: { q1: 0, q2: 0, q3: 0 },
      desarrolloTecnologico: { q1: 0, q2: 0, q3: 0 },
      propiedadIntelectual: { q1: 0, q2: 0, q3: 0 },
      transferenciaTecnologica: { q1: 0, q2: 0, q3: 0 },
      docencia: { q1: 2, q2: 6, q3: 17 },
      formacionComunidad: { q1: 4, q2: 8, q3: 19 },
      accesoUniversal: { q1: 9, q2: 14, q3: 21 },
      consideraciones: "Candidato SNII - Área I: Producción mínima de 3 artículos (Q2). Actividad en docencia y formación de comunidad científica.",
    },
    nivel1: {
      articulos: { q1: 5, q2: 8, q3: 13 },
      libros: { q1: 0, q2: 0, q3: 0 },
      capitulos: { q1: 0, q2: 0, q3: 1 },
      desarrolloTecnologico: { q1: 0, q2: 0, q3: 0 },
      propiedadIntelectual: { q1: 0, q2: 0, q3: 0 },
      transferenciaTecnologica: { q1: 0, q2: 0, q3: 0 },
      docencia: { q1: 14, q2: 34, q3: 67 },
      formacionComunidad: { q1: 19, q2: 45, q3: 82 },
      accesoUniversal: { q1: 23, q2: 38, q3: 63 },
      consideraciones: "SNII I - Área I: Perfil consolidado con 8 artículos (Q2). Fuerte incremento en actividades de docencia y formación.",
    },
    nivel2: {
      articulos: { q1: 12, q2: 21, q3: 34 },
      libros: { q1: 0, q2: 0, q3: 0 },
      capitulos: { q1: 0, q2: 0, q3: 2 },
      desarrolloTecnologico: { q1: 0, q2: 0, q3: 0 },
      propiedadIntelectual: { q1: 0, q2: 0, q3: 0 },
      transferenciaTecnologica: { q1: 0, q2: 0, q3: 0 },
      docencia: { q1: 31, q2: 57, q3: 88 },
      formacionComunidad: { q1: 47, q2: 81, q3: 120 },
      accesoUniversal: { q1: 52, q2: 80, q3: 124 },
      consideraciones: "SNII II - Área I: Producción consolidada de 21 artículos (Q2). Notable actividad en formación de recursos humanos.",
    },
    nivel3: {
      articulos: { q1: 19, q2: 35, q3: 67 },
      libros: { q1: 0, q2: 0, q3: 0 },
      capitulos: { q1: 0, q2: 0, q3: 2 },
      desarrolloTecnologico: { q1: 0, q2: 0, q3: 0 },
      propiedadIntelectual: { q1: 0, q2: 0, q3: 0 },
      transferenciaTecnologica: { q1: 0, q2: 0, q3: 0 },
      docencia: { q1: 37, q2: 54, q3: 81 },
      formacionComunidad: { q1: 62, q2: 90, q3: 121 },
      accesoUniversal: { q1: 73, q2: 128, q3: 196 },
      consideraciones: "SNII III - Área I: Alto perfil con 35 artículos (Q2). Liderazgo en formación y acceso universal al conocimiento.",
    },
  },
  area2: {
    id: "area2",
    nombre: "Biología y Química",
    candidato: {
      articulos: { q1: 2, q2: 4, q3: 5 },
      libros: { q1: 0, q2: 0, q3: 0 },
      capitulos: { q1: 0, q2: 0, q3: 0 },
      desarrolloTecnologico: { q1: 0, q2: 0, q3: 0 },
      propiedadIntelectual: { q1: 0, q2: 0, q3: 0 },
      transferenciaTecnologica: { q1: 0, q2: 0, q3: 0 },
      docencia: { q1: 2, q2: 5, q3: 14 },
      formacionComunidad: { q1: 4, q2: 7, q3: 18 },
      accesoUniversal: { q1: 9, q2: 14, q3: 24 },
      consideraciones: "Candidato SNII - Área II: Producción mínima de 4 artículos (Q2). Actividad docente y formación científica.",
    },
    nivel1: {
      articulos: { q1: 5, q2: 8, q3: 13 },
      libros: { q1: 0, q2: 0, q3: 0 },
      capitulos: { q1: 0, q2: 0, q3: 1 },
      desarrolloTecnologico: { q1: 0, q2: 0, q3: 0 },
      propiedadIntelectual: { q1: 0, q2: 0, q3: 0 },
      transferenciaTecnologica: { q1: 0, q2: 0, q3: 0 },
      docencia: { q1: 9, q2: 24, q3: 53 },
      formacionComunidad: { q1: 15, q2: 34, q3: 71 },
      accesoUniversal: { q1: 21, q2: 36, q3: 63 },
      consideraciones: "SNII I - Área II: Perfil consolidado con 8 artículos (Q2). Actividad destacada en docencia y formación.",
    },
    nivel2: {
      articulos: { q1: 13, q2: 21, q3: 35 },
      libros: { q1: 0, q2: 0, q3: 0 },
      capitulos: { q1: 0, q2: 1, q3: 3 },
      desarrolloTecnologico: { q1: 0, q2: 0, q3: 0 },
      propiedadIntelectual: { q1: 0, q2: 0, q3: 0 },
      transferenciaTecnologica: { q1: 0, q2: 0, q3: 0 },
      docencia: { q1: 28, q2: 51, q3: 89 },
      formacionComunidad: { q1: 48, q2: 76, q3: 128 },
      accesoUniversal: { q1: 54, q2: 80, q3: 118 },
      consideraciones: "SNII II - Área II: Producción consolidada de 21 artículos (Q2). Incremento en capítulos y formación de recursos humanos.",
    },
    nivel3: {
      articulos: { q1: 24, q2: 37, q3: 65 },
      libros: { q1: 0, q2: 0, q3: 0 },
      capitulos: { q1: 0, q2: 2, q3: 4 },
      desarrolloTecnologico: { q1: 0, q2: 0, q3: 0 },
      propiedadIntelectual: { q1: 0, q2: 0, q3: 1 },
      transferenciaTecnologica: { q1: 0, q2: 0, q3: 0 },
      docencia: { q1: 29, q2: 57, q3: 93 },
      formacionComunidad: { q1: 65, q2: 101, q3: 158 },
      accesoUniversal: { q1: 84, q2: 138, q3: 199 },
      consideraciones: "SNII III - Área II: Alto perfil con 37 artículos (Q2). Liderazgo en investigación y acceso universal al conocimiento.",
    },
  },
  area3: {
    id: "area3",
    nombre: "Medicina y Ciencias de la Salud",
    candidato: {
      articulos: { q1: 3, q2: 5, q3: 8 },
      libros: { q1: 0, q2: 0, q3: 0 },
      capitulos: { q1: 0, q2: 0, q3: 0 },
      desarrolloTecnologico: { q1: 0, q2: 0, q3: 0 },
      propiedadIntelectual: { q1: 0, q2: 0, q3: 0 },
      transferenciaTecnologica: { q1: 0, q2: 0, q3: 0 },
      docencia: { q1: 4, q2: 9, q3: 21 },
      formacionComunidad: { q1: 7, q2: 17, q3: 32 },
      accesoUniversal: { q1: 11, q2: 20, q3: 38 },
      consideraciones: "Candidato SNII - Área III: Producción mínima de 5 artículos (Q2). Actividad en docencia y formación científica.",
    },
    nivel1: {
      articulos: { q1: 7, q2: 11, q3: 18 },
      libros: { q1: 0, q2: 0, q3: 0 },
      capitulos: { q1: 0, q2: 0, q3: 1 },
      desarrolloTecnologico: { q1: 0, q2: 0, q3: 0 },
      propiedadIntelectual: { q1: 0, q2: 0, q3: 0 },
      transferenciaTecnologica: { q1: 0, q2: 0, q3: 0 },
      docencia: { q1: 8, q2: 21, q3: 46 },
      formacionComunidad: { q1: 15, q2: 35, q3: 67 },
      accesoUniversal: { q1: 26, q2: 44, q3: 77 },
      consideraciones: "SNII I - Área III: Perfil consolidado con 11 artículos (Q2). Fuerte actividad en docencia y formación.",
    },
    nivel2: {
      articulos: { q1: 15, q2: 26, q3: 41 },
      libros: { q1: 0, q2: 0, q3: 0 },
      capitulos: { q1: 0, q2: 0, q3: 2 },
      desarrolloTecnologico: { q1: 0, q2: 0, q3: 0 },
      propiedadIntelectual: { q1: 0, q2: 0, q3: 0 },
      transferenciaTecnologica: { q1: 0, q2: 0, q3: 0 },
      docencia: { q1: 18, q2: 43, q3: 75 },
      formacionComunidad: { q1: 36, q2: 69, q3: 108 },
      accesoUniversal: { q1: 54, q2: 90, q3: 155 },
      consideraciones: "SNII II - Área III: Producción consolidada de 26 artículos (Q2). Notable actividad en formación y acceso universal.",
    },
    nivel3: {
      articulos: { q1: 25, q2: 45, q3: 91 },
      libros: { q1: 0, q2: 0, q3: 0 },
      capitulos: { q1: 0, q2: 1, q3: 4 },
      desarrolloTecnologico: { q1: 0, q2: 0, q3: 0 },
      propiedadIntelectual: { q1: 0, q2: 0, q3: 0 },
      transferenciaTecnologica: { q1: 0, q2: 0, q3: 0 },
      docencia: { q1: 26, q2: 46, q3: 90 },
      formacionComunidad: { q1: 60, q2: 88, q3: 132 },
      accesoUniversal: { q1: 126, q2: 197, q3: 320 },
      consideraciones: "SNII III - Área III: Alto perfil con 45 artículos (Q2). Liderazgo en investigación médica y acceso universal.",
    },
  },
  area4: {
    id: "area4",
    nombre: "Ciencias de la Conducta y la Educación",
    candidato: {
      articulos: { q1: 2, q2: 4, q3: 7 },
      libros: { q1: 0, q2: 0, q3: 0 },
      capitulos: { q1: 0, q2: 2, q3: 4 },
      desarrolloTecnologico: { q1: 0, q2: 0, q3: 0 },
      propiedadIntelectual: { q1: 0, q2: 0, q3: 0 },
      transferenciaTecnologica: { q1: 0, q2: 0, q3: 0 },
      docencia: { q1: 13, q2: 29, q3: 54 },
      formacionComunidad: { q1: 21, q2: 43, q3: 76 },
      accesoUniversal: { q1: 14, q2: 26, q3: 43 },
      consideraciones: "Candidato SNII - Área IV: Producción de 4 artículos (Q2). Capítulos relevantes. Fuerte énfasis en docencia.",
    },
    nivel1: {
      articulos: { q1: 6, q2: 9, q3: 15 },
      libros: { q1: 0, q2: 0, q3: 2 },
      capitulos: { q1: 2, q2: 5, q3: 10 },
      desarrolloTecnologico: { q1: 0, q2: 0, q3: 0 },
      propiedadIntelectual: { q1: 0, q2: 0, q3: 0 },
      transferenciaTecnologica: { q1: 0, q2: 0, q3: 0 },
      docencia: { q1: 41, q2: 70, q3: 101 },
      formacionComunidad: { q1: 58, q2: 92, q3: 137 },
      accesoUniversal: { q1: 40, q2: 68, q3: 123 },
      consideraciones: "SNII I - Área IV: 9 artículos (Q2). Incremento en libros y capítulos. Actividad docente muy importante.",
    },
    nivel2: {
      articulos: { q1: 12, q2: 22, q3: 38 },
      libros: { q1: 0, q2: 3, q3: 6 },
      capitulos: { q1: 4, q2: 10, q3: 19 },
      desarrolloTecnologico: { q1: 0, q2: 0, q3: 0 },
      propiedadIntelectual: { q1: 0, q2: 0, q3: 0 },
      transferenciaTecnologica: { q1: 0, q2: 0, q3: 0 },
      docencia: { q1: 62, q2: 98, q3: 133 },
      formacionComunidad: { q1: 97, q2: 144, q3: 197 },
      accesoUniversal: { q1: 101, q2: 163, q3: 236 },
      consideraciones: "SNII II - Área IV: 22 artículos (Q2). Notable presencia de libros y capítulos. Fuerte en formación.",
    },
    nivel3: {
      articulos: { q1: 18, q2: 32, q3: 69 },
      libros: { q1: 0, q2: 2, q3: 6 },
      capitulos: { q1: 3, q2: 8, q3: 20 },
      desarrolloTecnologico: { q1: 0, q2: 0, q3: 0 },
      propiedadIntelectual: { q1: 0, q2: 0, q3: 0 },
      transferenciaTecnologica: { q1: 0, q2: 0, q3: 0 },
      docencia: { q1: 103, q2: 151, q3: 181 },
      formacionComunidad: { q1: 174, q2: 200, q3: 235 },
      accesoUniversal: { q1: 158, q2: 221, q3: 265 },
      consideraciones: "SNII III - Área IV: Alto perfil con 32 artículos (Q2). Liderazgo destacado en formación y acceso universal.",
    },
  },
  area5: {
    id: "area5",
    nombre: "Humanidades",
    candidato: {
      articulos: { q1: 1, q2: 2, q3: 4 },
      libros: { q1: 0, q2: 0, q3: 1 },
      capitulos: { q1: 0, q2: 2, q3: 4 },
      desarrolloTecnologico: { q1: 0, q2: 0, q3: 0 },
      propiedadIntelectual: { q1: 0, q2: 0, q3: 0 },
      transferenciaTecnologica: { q1: 0, q2: 0, q3: 0 },
      docencia: { q1: 7, q2: 19, q3: 42 },
      formacionComunidad: { q1: 10, q2: 25, q3: 52 },
      accesoUniversal: { q1: 15, q2: 27, q3: 41 },
      consideraciones: "Candidato SNII - Área V: 2 artículos (Q2). Equilibrio entre artículos y capítulos. Fuerte componente docente.",
    },
    nivel1: {
      articulos: { q1: 3, q2: 5, q3: 8 },
      libros: { q1: 1, q2: 2, q3: 4 },
      capitulos: { q1: 3, q2: 5, q3: 10 },
      desarrolloTecnologico: { q1: 0, q2: 0, q3: 0 },
      propiedadIntelectual: { q1: 0, q2: 0, q3: 0 },
      transferenciaTecnologica: { q1: 0, q2: 0, q3: 0 },
      docencia: { q1: 27, q2: 55, q3: 90 },
      formacionComunidad: { q1: 36, q2: 72, q3: 115 },
      accesoUniversal: { q1: 40, q2: 67, q3: 114 },
      consideraciones: "SNII I - Área V: 5 artículos (Q2), 2 libros (Q2). Equilibrio entre artículos, libros y capítulos. Muy fuerte en docencia.",
    },
    nivel2: {
      articulos: { q1: 4, q2: 9, q3: 17 },
      libros: { q1: 2, q2: 4, q3: 8 },
      capitulos: { q1: 5, q2: 10, q3: 17 },
      desarrolloTecnologico: { q1: 0, q2: 0, q3: 0 },
      propiedadIntelectual: { q1: 0, q2: 0, q3: 0 },
      transferenciaTecnologica: { q1: 0, q2: 0, q3: 0 },
      docencia: { q1: 50, q2: 83, q3: 119 },
      formacionComunidad: { q1: 72, q2: 114, q3: 162 },
      accesoUniversal: { q1: 87, q2: 124, q3: 200 },
      consideraciones: "SNII II - Área V: 9 artículos (Q2), 4 libros (Q2), 10 capítulos (Q2). Mayor presencia de libros. Fuerte liderazgo en formación.",
    },
    nivel3: {
      articulos: { q1: 6, q2: 12, q3: 27 },
      libros: { q1: 3, q2: 6, q3: 12 },
      capitulos: { q1: 8, q2: 16, q3: 27 },
      desarrolloTecnologico: { q1: 0, q2: 0, q3: 0 },
      propiedadIntelectual: { q1: 0, q2: 0, q3: 0 },
      transferenciaTecnologica: { q1: 0, q2: 0, q3: 0 },
      docencia: { q1: 50, q2: 79, q3: 122 },
      formacionComunidad: { q1: 77, q2: 118, q3: 186 },
      accesoUniversal: { q1: 154, q2: 221, q3: 303 },
      consideraciones: "SNII III - Área V: Perfil robusto con 12 artículos (Q2), 6 libros (Q2) y 16 capítulos (Q2). Liderazgo consolidado en formación.",
    },
  },
  area6: {
    id: "area6",
    nombre: "Ciencias Sociales",
    candidato: {
      articulos: { q1: 2, q2: 3, q3: 5 },
      libros: { q1: 0, q2: 0, q3: 1 },
      capitulos: { q1: 1, q2: 2, q3: 5 },
      desarrolloTecnologico: { q1: 0, q2: 0, q3: 0 },
      propiedadIntelectual: { q1: 0, q2: 0, q3: 0 },
      transferenciaTecnologica: { q1: 0, q2: 0, q3: 0 },
      docencia: { q1: 11, q2: 26, q3: 54 },
      formacionComunidad: { q1: 15, q2: 35, q3: 68 },
      accesoUniversal: { q1: 14, q2: 23, q3: 42 },
      consideraciones: "Candidato SNII - Área VI: 3 artículos (Q2). Capítulos relevantes. Importante actividad docente.",
    },
    nivel1: {
      articulos: { q1: 4, q2: 6, q3: 11 },
      libros: { q1: 0, q2: 2, q3: 4 },
      capitulos: { q1: 3, q2: 6, q3: 11 },
      desarrolloTecnologico: { q1: 0, q2: 0, q3: 0 },
      propiedadIntelectual: { q1: 0, q2: 0, q3: 0 },
      transferenciaTecnologica: { q1: 0, q2: 0, q3: 0 },
      docencia: { q1: 33, q2: 58, q3: 95 },
      formacionComunidad: { q1: 45, q2: 77, q3: 125 },
      accesoUniversal: { q1: 35, q2: 62, q3: 108 },
      consideraciones: "SNII I - Área VI: 6 artículos (Q2), 2 libros (Q2), 6 capítulos (Q2). Incremento de libros y capítulos. Fuerte en docencia.",
    },
    nivel2: {
      articulos: { q1: 6, q2: 13, q3: 22 },
      libros: { q1: 2, q2: 4, q3: 7 },
      capitulos: { q1: 6, q2: 11, q3: 19 },
      desarrolloTecnologico: { q1: 0, q2: 0, q3: 0 },
      propiedadIntelectual: { q1: 0, q2: 0, q3: 0 },
      transferenciaTecnologica: { q1: 0, q2: 0, q3: 0 },
      docencia: { q1: 53, q2: 83, q3: 117 },
      formacionComunidad: { q1: 77, q2: 115, q3: 158 },
      accesoUniversal: { q1: 85, q2: 131, q3: 207 },
      consideraciones: "SNII II - Área VI: 13 artículos (Q2), 4 libros (Q2), 11 capítulos (Q2). Liderazgo en formación de comunidad.",
    },
    nivel3: {
      articulos: { q1: 6, q2: 14, q3: 28 },
      libros: { q1: 2, q2: 5, q3: 11 },
      capitulos: { q1: 7, q2: 14, q3: 28 },
      desarrolloTecnologico: { q1: 0, q2: 0, q3: 0 },
      propiedadIntelectual: { q1: 0, q2: 0, q3: 0 },
      transferenciaTecnologica: { q1: 0, q2: 0, q3: 0 },
      docencia: { q1: 65, q2: 96, q3: 135 },
      formacionComunidad: { q1: 100, q2: 147, q3: 196 },
      accesoUniversal: { q1: 147, q2: 245, q3: 364 },
      consideraciones: "SNII III - Área VI: Alto perfil con 14 artículos (Q2), 5 libros (Q2) y 14 capítulos (Q2). Liderazgo destacado en acceso universal.",
    },
  },
  area7: {
    id: "area7",
    nombre: "Ciencias de Agricultura, Agropecuarias, Forestales y de Ecosistemas",
    candidato: {
      articulos: { q1: 2, q2: 3, q3: 5 },
      libros: { q1: 0, q2: 0, q3: 0 },
      capitulos: { q1: 0, q2: 0, q3: 0 },
      desarrolloTecnologico: { q1: 0, q2: 0, q3: 0 },
      propiedadIntelectual: { q1: 0, q2: 0, q3: 0 },
      transferenciaTecnologica: { q1: 0, q2: 0, q3: 0 },
      docencia: { q1: 3, q2: 9, q3: 26 },
      formacionComunidad: { q1: 7, q2: 14, q3: 35 },
      accesoUniversal: { q1: 11, q2: 18, q3: 29 },
      consideraciones: "Candidato SNII - Área VII: 3 artículos (Q2). Actividad docente importante.",
    },
    nivel1: {
      articulos: { q1: 6, q2: 10, q3: 17 },
      libros: { q1: 0, q2: 0, q3: 0 },
      capitulos: { q1: 0, q2: 0, q3: 2 },
      desarrolloTecnologico: { q1: 0, q2: 0, q3: 0 },
      propiedadIntelectual: { q1: 0, q2: 0, q3: 0 },
      transferenciaTecnologica: { q1: 0, q2: 0, q3: 0 },
      docencia: { q1: 17, q2: 38, q3: 69 },
      formacionComunidad: { q1: 28, q2: 58, q3: 100 },
      accesoUniversal: { q1: 27, q2: 47, q3: 82 },
      consideraciones: "SNII I - Área VII: 10 artículos (Q2). Perfil similar a otras áreas experimentales: énfasis en artículos y docencia.",
    },
    nivel2: {
      articulos: { q1: 19, q2: 29, q3: 48 },
      libros: { q1: 0, q2: 0, q3: 0 },
      capitulos: { q1: 0, q2: 2, q3: 5 },
      desarrolloTecnologico: { q1: 0, q2: 0, q3: 0 },
      propiedadIntelectual: { q1: 0, q2: 0, q3: 1 },
      transferenciaTecnologica: { q1: 0, q2: 0, q3: 0 },
      docencia: { q1: 37, q2: 65, q3: 104 },
      formacionComunidad: { q1: 66, q2: 102, q3: 153 },
      accesoUniversal: { q1: 66, q2: 100, q3: 151 },
      consideraciones: "SNII II - Área VII: 29 artículos (Q2), 2 capítulos (Q2). Incremento notable en producción científica y formación.",
    },
    nivel3: {
      articulos: { q1: 28, q2: 51, q3: 84 },
      libros: { q1: 0, q2: 0, q3: 1 },
      capitulos: { q1: 0, q2: 3, q3: 6 },
      desarrolloTecnologico: { q1: 0, q2: 0, q3: 0 },
      propiedadIntelectual: { q1: 0, q2: 0, q3: 1 },
      transferenciaTecnologica: { q1: 0, q2: 0, q3: 0 },
      docencia: { q1: 55, q2: 80, q3: 122 },
      formacionComunidad: { q1: 101, q2: 144, q3: 187 },
      accesoUniversal: { q1: 106, q2: 150, q3: 242 },
      consideraciones: "SNII III - Área VII: Alto perfil con 51 artículos (Q2), 3 capítulos (Q2), 1 libro (Q3). Liderazgo consolidado en investigación y formación.",
    },
  },
  area8: {
    id: "area8",
    nombre: "Ingenierías y Desarrollo Tecnológico",
    candidato: {
      articulos: { q1: 2, q2: 3, q3: 5 },
      libros: { q1: 0, q2: 0, q3: 0 },
      capitulos: { q1: 0, q2: 0, q3: 0 },
      desarrolloTecnologico: { q1: 0, q2: 0, q3: 1 },
      propiedadIntelectual: { q1: 0, q2: 0, q3: 1 },
      transferenciaTecnologica: { q1: 0, q2: 0, q3: 0 },
      docencia: { q1: 5, q2: 14, q3: 40 },
      formacionComunidad: { q1: 7, q2: 18, q3: 49 },
      accesoUniversal: { q1: 8, q2: 12, q3: 21 },
      consideraciones: "Candidato SNII - Área VIII: 3 artículos (Q2). Aparecen desarrollos tecnológicos y propiedad intelectual en Q3.",
    },
    nivel1: {
      articulos: { q1: 6, q2: 9, q3: 15 },
      libros: { q1: 0, q2: 0, q3: 0 },
      capitulos: { q1: 0, q2: 0, q3: 1 },
      desarrolloTecnologico: { q1: 0, q2: 0, q3: 1 },
      propiedadIntelectual: { q1: 0, q2: 0, q3: 2 },
      transferenciaTecnologica: { q1: 0, q2: 0, q3: 0 },
      docencia: { q1: 23, q2: 50, q3: 87 },
      formacionComunidad: { q1: 35, q2: 70, q3: 112 },
      accesoUniversal: { q1: 22, q2: 39, q3: 70 },
      consideraciones: "SNII I - Área VIII: 9 artículos (Q2). Perfil que combina artículos con primeros indicios de innovación y propiedad intelectual.",
    },
    nivel2: {
      articulos: { q1: 17, q2: 28, q3: 48 },
      libros: { q1: 0, q2: 0, q3: 0 },
      capitulos: { q1: 0, q2: 1, q3: 3 },
      desarrolloTecnologico: { q1: 0, q2: 0, q3: 1 },
      propiedadIntelectual: { q1: 0, q2: 1, q3: 2 },
      transferenciaTecnologica: { q1: 0, q2: 0, q3: 0 },
      docencia: { q1: 45, q2: 76, q3: 125 },
      formacionComunidad: { q1: 80, q2: 119, q3: 177 },
      accesoUniversal: { q1: 58, q2: 95, q3: 147 },
      consideraciones: "SNII II - Área VIII: 28 artículos (Q2). Incremento fuerte en innovación y propiedad intelectual. Alta actividad en docencia.",
    },
    nivel3: {
      articulos: { q1: 25, q2: 47, q3: 98 },
      libros: { q1: 0, q2: 0, q3: 1 },
      capitulos: { q1: 0, q2: 1, q3: 5 },
      desarrolloTecnologico: { q1: 0, q2: 0, q3: 0 },
      propiedadIntelectual: { q1: 0, q2: 1, q3: 2 },
      transferenciaTecnologica: { q1: 0, q2: 0, q3: 0 },
      docencia: { q1: 37, q2: 74, q3: 117 },
      formacionComunidad: { q1: 101, q2: 131, q3: 192 },
      accesoUniversal: { q1: 111, q2: 148, q3: 185 },
      consideraciones: "SNII III - Área VIII: Alto perfil con 47 artículos (Q2). Presencia clara de propiedad intelectual y liderazgo en formación.",
    },
  },
  area9: {
    id: "area9",
    nombre: "Interdisciplinaria",
    candidato: {
      articulos: { q1: 3, q2: 4, q3: 6 },
      libros: { q1: 0, q2: 0, q3: 0 },
      capitulos: { q1: 0, q2: 1, q3: 3 },
      desarrolloTecnologico: { q1: 0, q2: 0, q3: 0 },
      propiedadIntelectual: { q1: 0, q2: 0, q3: 0 },
      transferenciaTecnologica: { q1: 0, q2: 0, q3: 0 },
      docencia: { q1: 9, q2: 28, q3: 57 },
      formacionComunidad: { q1: 13, q2: 37, q3: 70 },
      accesoUniversal: { q1: 15, q2: 24, q3: 42 },
      consideraciones: "Candidato SNII - Área IX: Perfil mixto con 4 artículos (Q2) y primeros capítulos. Fuerte peso de docencia y formación.",
    },
    nivel1: {
      articulos: { q1: 6, q2: 10, q3: 16 },
      libros: { q1: 0, q2: 0, q3: 1 },
      capitulos: { q1: 0, q2: 2, q3: 5 },
      desarrolloTecnologico: { q1: 0, q2: 0, q3: 0 },
      propiedadIntelectual: { q1: 0, q2: 0, q3: 1 },
      transferenciaTecnologica: { q1: 0, q2: 0, q3: 0 },
      docencia: { q1: 27, q2: 50, q3: 81 },
      formacionComunidad: { q1: 39, q2: 69, q3: 107 },
      accesoUniversal: { q1: 30, q2: 52, q3: 88 },
      consideraciones: "SNII I - Área IX: 10 artículos (Q2), 2 capítulos (Q2). Combina publicaciones, libros/capítulos y propiedad intelectual, reflejando naturaleza interdisciplinaria.",
    },
    nivel2: {
      articulos: { q1: 15, q2: 25, q3: 41 },
      libros: { q1: 0, q2: 0, q3: 2 },
      capitulos: { q1: 0, q2: 2, q3: 6 },
      desarrolloTecnologico: { q1: 0, q2: 0, q3: 1 },
      propiedadIntelectual: { q1: 0, q2: 0, q3: 2 },
      transferenciaTecnologica: { q1: 0, q2: 0, q3: 0 },
      docencia: { q1: 40, q2: 61, q3: 93 },
      formacionComunidad: { q1: 64, q2: 97, q3: 145 },
      accesoUniversal: { q1: 69, q2: 103, q3: 145 },
      consideraciones: "SNII II - Área IX: 25 artículos (Q2), 2 capítulos (Q2). Aumenta diversidad de productos (innovación y propiedad intelectual) con altos niveles de docencia.",
    },
    nivel3: {
      articulos: { q1: 35, q2: 57, q3: 71 },
      libros: { q1: 0, q2: 0, q3: 2 },
      capitulos: { q1: 0, q2: 2, q3: 8 },
      desarrolloTecnologico: { q1: 0, q2: 0, q3: 0 },
      propiedadIntelectual: { q1: 0, q2: 1, q3: 2 },
      transferenciaTecnologica: { q1: 0, q2: 0, q3: 0 },
      docencia: { q1: 50, q2: 73, q3: 102 },
      formacionComunidad: { q1: 98, q2: 128, q3: 167 },
      accesoUniversal: { q1: 104, q2: 135, q3: 183 },
      consideraciones: "SNII III - Área IX: Perfil muy robusto con 57 artículos (Q2). Presencia significativa de propiedad intelectual y liderazgo en formación.",
    },
  },
}

export const NIVELES_SNII = [
  { id: "candidato", nombre: "Candidato SNII" },
  { id: "nivel1", nombre: "SNII I" },
  { id: "nivel2", nombre: "SNII II" },
  { id: "nivel3", nombre: "SNII III" },
]

export const INDICADORES_SNII = [
  { id: "articulos", nombre: "Artículos" },
  { id: "libros", nombre: "Libros" },
  { id: "capitulos", nombre: "Capítulos" },
  { id: "desarrolloTecnologico", nombre: "Desarrollo Tecnológico e Innovación" },
  { id: "propiedadIntelectual", nombre: "Propiedad Intelectual" },
  { id: "transferenciaTecnologica", nombre: "Transferencia Tecnológica" },
  { id: "docencia", nombre: "Docencia" },
  { id: "formacionComunidad", nombre: "Formación de Comunidad Científica" },
  { id: "accesoUniversal", nombre: "Acceso Universal al Conocimiento" },
]

/**
 * Obtiene los parámetros SNII para un área y nivel específicos
 */
export function getParametrosSNII(area: string, nivel: string): ParametrosSNII | null {
  const areaData = AREAS_SNII[area]
  if (!areaData) return null

  const nivelKey = nivel as keyof Omit<AreaSNII, "id" | "nombre">
  return areaData[nivelKey] || null
}

/**
 * Compara el desempeño de un investigador con los parámetros SNII
 * Devuelve: "bajo" (< Q1), "medio" (Q1-Q3), "alto" (> Q3)
 */
export function compararConParametros(
  valor: number,
  parametro: { q1: number; q2: number; q3: number }
): "bajo" | "medio" | "alto" {
  if (valor < parametro.q1) return "bajo"
  if (valor > parametro.q3) return "alto"
  return "medio"
}

/**
 * Calcula el porcentaje de cumplimiento vs la mediana (Q2)
 */
export function calcularPorcentajeCumplimiento(valor: number, q2: number): number {
  if (q2 === 0) return valor > 0 ? 100 : 0
  return Math.round((valor / q2) * 100)
}

/**
 * Mapea el nombre del nivel de investigador estatal al ID usado en AREAS_SNII
 */
export function mapearNivelAId(nivelNombre: string): string | null {
  const mapeo: Record<string, string> = {
    "Candidato a Investigador Estatal": "candidato",
    "Investigador Estatal Nivel I": "nivel1",
    "Investigador Estatal Nivel II": "nivel2",
    "Investigador Estatal Nivel III": "nivel3",
    "Investigador Excepcional": "nivel3", // Se mapea al nivel más alto disponible
    "Investigador Insigne": "nivel3", // Se mapea al nivel más alto disponible
  }
  
  return mapeo[nivelNombre] || null
}

/**
 * Mapea el nombre del área de investigación al ID usado en AREAS_SNII
 */
export function mapearAreaAId(areaNombre: string): string | null {
  const mapeo: Record<string, string> = {
    "I. Físico Matemáticas y Ciencias de la Tierra": "area1",
    "II. Biología y Química": "area2",
    "III. Medicina y Ciencias de la Salud": "area3",
    "IV. Ciencias de la Conducta y la Educación": "area4",
    "V. Humanidades": "area5",
    "VI. Ciencias Sociales": "area6",
    "VII. Ciencias de la Agricultura, Agropecuarias, Forestales y de Ecosistemas": "area7",
    "VIII. Ingenierías y Desarrollo Tecnológico": "area8",
    "IX. Multidisciplinaria": "area9",
  }
  
  return mapeo[areaNombre] || null
}

