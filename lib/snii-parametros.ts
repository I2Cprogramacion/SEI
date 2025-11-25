/**
 * Parámetros de referencia para la evaluación del SNII
 * (Sistema Nacional de Investigadores e Innovadores)
 * 
 * Basado en datos estadísticos de investigadores aprobados 2020-2024
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
      formacionComunidad: { q1: 10, q2: 19, q3: 35 },
      accesoUniversal: { q1: 3, q2: 8, q3: 17 },
      consideraciones: "Producción central de 3 artículos. Actividad importante en docencia y formación.",
    },
    nivel1: {
      articulos: { q1: 9, q2: 13, q3: 19 },
      libros: { q1: 0, q2: 0, q3: 0 },
      capitulos: { q1: 0, q2: 0, q3: 1 },
      desarrolloTecnologico: { q1: 0, q2: 0, q3: 0 },
      propiedadIntelectual: { q1: 0, q2: 0, q3: 0 },
      transferenciaTecnologica: { q1: 0, q2: 0, q3: 0 },
      docencia: { q1: 20, q2: 42, q3: 75 },
      formacionComunidad: { q1: 38, q2: 64, q3: 112 },
      accesoUniversal: { q1: 23, q2: 42, q3: 73 },
      consideraciones: "Perfil consolidado de 13 artículos (mediana). Fuerte actividad en docencia y formación.",
    },
    nivel2: {
      articulos: { q1: 20, q2: 30, q3: 45 },
      libros: { q1: 0, q2: 0, q3: 1 },
      capitulos: { q1: 0, q2: 1, q3: 3 },
      desarrolloTecnologico: { q1: 0, q2: 0, q3: 0 },
      propiedadIntelectual: { q1: 0, q2: 0, q3: 1 },
      transferenciaTecnologica: { q1: 0, q2: 0, q3: 0 },
      docencia: { q1: 39, q2: 70, q3: 116 },
      formacionComunidad: { q1: 68, q2: 116, q3: 178 },
      accesoUniversal: { q1: 54, q2: 88, q3: 136 },
      consideraciones: "Perfil consolidado con 30 artículos. Incremento en capítulos y presencia de propiedad intelectual.",
    },
    nivel3: {
      articulos: { q1: 32, q2: 48, q3: 74 },
      libros: { q1: 0, q2: 0, q3: 1 },
      capitulos: { q1: 0, q2: 2, q3: 6 },
      desarrolloTecnologico: { q1: 0, q2: 0, q3: 0 },
      propiedadIntelectual: { q1: 0, q2: 0, q3: 1 },
      transferenciaTecnologica: { q1: 0, q2: 0, q3: 0 },
      docencia: { q1: 54, q2: 94, q3: 147 },
      formacionComunidad: { q1: 92, q2: 147, q3: 226 },
      accesoUniversal: { q1: 86, q2: 133, q3: 202 },
      consideraciones: "Alto perfil de 48 artículos. Fuerte liderazgo en formación de investigadores.",
    },
  },
  area2: {
    id: "area2",
    nombre: "Biología y Química",
    candidato: {
      articulos: { q1: 3, q2: 5, q3: 7 },
      libros: { q1: 0, q2: 0, q3: 0 },
      capitulos: { q1: 0, q2: 0, q3: 0 },
      desarrolloTecnologico: { q1: 0, q2: 0, q3: 0 },
      propiedadIntelectual: { q1: 0, q2: 0, q3: 0 },
      transferenciaTecnologica: { q1: 0, q2: 0, q3: 0 },
      docencia: { q1: 3, q2: 8, q3: 19 },
      formacionComunidad: { q1: 11, q2: 21, q3: 38 },
      accesoUniversal: { q1: 5, q2: 11, q3: 21 },
      consideraciones: "Producción central de 5 artículos. Importante actividad docente.",
    },
    nivel1: {
      articulos: { q1: 11, q2: 18, q3: 29 },
      libros: { q1: 0, q2: 0, q3: 0 },
      capitulos: { q1: 0, q2: 0, q3: 2 },
      desarrolloTecnologico: { q1: 0, q2: 0, q3: 0 },
      propiedadIntelectual: { q1: 0, q2: 0, q3: 0 },
      transferenciaTecnologica: { q1: 0, q2: 0, q3: 0 },
      docencia: { q1: 17, q2: 38, q3: 69 },
      formacionComunidad: { q1: 28, q2: 58, q3: 100 },
      accesoUniversal: { q1: 27, q2: 47, q3: 82 },
      consideraciones: "Artículos en mediano 10; la contribución docente y de difusión crece claramente.",
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
      consideraciones: "Incremento notable de artículos (mediana 29). Presencia incipiente de propiedad intelectual y capítulos.",
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
      consideraciones: "Perfil consolidado con fuerte énfasis en artículos, formación y difusión, y presencia incipiente de propiedad intelectual.",
    },
  },
  area3: {
    id: "area3",
    nombre: "Medicina y Ciencias de la Salud",
    candidato: {
      articulos: { q1: 2, q2: 4, q3: 6 },
      libros: { q1: 0, q2: 0, q3: 0 },
      capitulos: { q1: 0, q2: 0, q3: 1 },
      desarrolloTecnologico: { q1: 0, q2: 0, q3: 0 },
      propiedadIntelectual: { q1: 0, q2: 0, q3: 0 },
      transferenciaTecnologica: { q1: 0, q2: 0, q3: 0 },
      docencia: { q1: 3, q2: 10, q3: 24 },
      formacionComunidad: { q1: 12, q2: 24, q3: 44 },
      accesoUniversal: { q1: 6, q2: 14, q3: 28 },
      consideraciones: "Producción de 4 artículos (mediana). Actividad docente relevante.",
    },
    nivel1: {
      articulos: { q1: 8, q2: 13, q3: 21 },
      libros: { q1: 0, q2: 0, q3: 0 },
      capitulos: { q1: 0, q2: 1, q3: 3 },
      desarrolloTecnologico: { q1: 0, q2: 0, q3: 0 },
      propiedadIntelectual: { q1: 0, q2: 0, q3: 1 },
      transferenciaTecnologica: { q1: 0, q2: 0, q3: 0 },
      docencia: { q1: 20, q2: 45, q3: 81 },
      formacionComunidad: { q1: 34, q2: 66, q3: 114 },
      accesoUniversal: { q1: 28, q2: 51, q3: 92 },
      consideraciones: "Artículos en mediana 13. Creciente actividad en docencia y formación.",
    },
    nivel2: {
      articulos: { q1: 16, q2: 26, q3: 42 },
      libros: { q1: 0, q2: 0, q3: 1 },
      capitulos: { q1: 0, q2: 2, q3: 5 },
      desarrolloTecnologico: { q1: 0, q2: 0, q3: 0 },
      propiedadIntelectual: { q1: 0, q2: 0, q3: 1 },
      transferenciaTecnologica: { q1: 0, q2: 0, q3: 0 },
      docencia: { q1: 38, q2: 72, q3: 120 },
      formacionComunidad: { q1: 70, q2: 113, q3: 170 },
      accesoUniversal: { q1: 63, q2: 100, q3: 157 },
      consideraciones: "Incremento notable en artículos (26) y capítulos. Fuerte presencia en formación.",
    },
    nivel3: {
      articulos: { q1: 25, q2: 42, q3: 70 },
      libros: { q1: 0, q2: 0, q3: 1 },
      capitulos: { q1: 0, q2: 3, q3: 7 },
      desarrolloTecnologico: { q1: 0, q2: 0, q3: 0 },
      propiedadIntelectual: { q1: 0, q2: 0, q3: 2 },
      transferenciaTecnologica: { q1: 0, q2: 0, q3: 0 },
      docencia: { q1: 54, q2: 95, q3: 152 },
      formacionComunidad: { q1: 97, q2: 150, q3: 225 },
      accesoUniversal: { q1: 101, q2: 156, q3: 240 },
      consideraciones: "Alto nivel de producción en artículos (42) y formación. Liderazgo consolidado.",
    },
  },
  area4: {
    id: "area4",
    nombre: "Ciencias de la Conducta y la Educación",
    candidato: {
      articulos: { q1: 1, q2: 2, q3: 4 },
      libros: { q1: 0, q2: 0, q3: 0 },
      capitulos: { q1: 0, q2: 0, q3: 2 },
      desarrolloTecnologico: { q1: 0, q2: 0, q3: 0 },
      propiedadIntelectual: { q1: 0, q2: 0, q3: 0 },
      transferenciaTecnologica: { q1: 0, q2: 0, q3: 0 },
      docencia: { q1: 4, q2: 12, q3: 29 },
      formacionComunidad: { q1: 13, q2: 26, q3: 48 },
      accesoUniversal: { q1: 7, q2: 15, q3: 30 },
      consideraciones: "Producción de 2 artículos. Comienza a haber capítulos. Fuerte énfasis en docencia.",
    },
    nivel1: {
      articulos: { q1: 5, q2: 9, q3: 15 },
      libros: { q1: 0, q2: 0, q3: 1 },
      capitulos: { q1: 0, q2: 2, q3: 5 },
      desarrolloTecnologico: { q1: 0, q2: 0, q3: 0 },
      propiedadIntelectual: { q1: 0, q2: 0, q3: 0 },
      transferenciaTecnologica: { q1: 0, q2: 0, q3: 0 },
      docencia: { q1: 22, q2: 48, q3: 87 },
      formacionComunidad: { q1: 38, q2: 70, q3: 118 },
      accesoUniversal: { q1: 29, q2: 54, q3: 95 },
      consideraciones: "Mediana de 9 artículos. Mayor presencia de libros y capítulos. Actividad docente muy importante.",
    },
    nivel2: {
      articulos: { q1: 12, q2: 19, q3: 31 },
      libros: { q1: 0, q2: 1, q3: 2 },
      capitulos: { q1: 1, q2: 4, q3: 9 },
      desarrolloTecnologico: { q1: 0, q2: 0, q3: 0 },
      propiedadIntelectual: { q1: 0, q2: 0, q3: 0 },
      transferenciaTecnologica: { q1: 0, q2: 0, q3: 0 },
      docencia: { q1: 45, q2: 78, q3: 128 },
      formacionComunidad: { q1: 74, q2: 122, q3: 187 },
      accesoUniversal: { q1: 64, q2: 107, q3: 168 },
      consideraciones: "Incremento en artículos (19), libros y capítulos. Muy fuerte en docencia y formación.",
    },
    nivel3: {
      articulos: { q1: 20, q2: 33, q3: 53 },
      libros: { q1: 0, q2: 1, q3: 3 },
      capitulos: { q1: 2, q2: 7, q3: 14 },
      desarrolloTecnologico: { q1: 0, q2: 0, q3: 0 },
      propiedadIntelectual: { q1: 0, q2: 0, q3: 0 },
      transferenciaTecnologica: { q1: 0, q2: 0, q3: 0 },
      docencia: { q1: 66, q2: 109, q3: 169 },
      formacionComunidad: { q1: 105, q2: 162, q3: 243 },
      accesoUniversal: { q1: 96, q2: 149, q3: 229 },
      consideraciones: "Alto perfil en artículos (33), libros y capítulos. Liderazgo destacado en formación.",
    },
  },
  area5: {
    id: "area5",
    nombre: "Humanidades",
    candidato: {
      articulos: { q1: 0, q2: 1, q3: 3 },
      libros: { q1: 0, q2: 0, q3: 0 },
      capitulos: { q1: 0, q2: 1, q3: 3 },
      desarrolloTecnologico: { q1: 0, q2: 0, q3: 0 },
      propiedadIntelectual: { q1: 0, q2: 0, q3: 0 },
      transferenciaTecnologica: { q1: 0, q2: 0, q3: 0 },
      docencia: { q1: 4, q2: 11, q3: 26 },
      formacionComunidad: { q1: 13, q2: 25, q3: 46 },
      accesoUniversal: { q1: 7, q2: 14, q3: 27 },
      consideraciones: "Equilibrio entre artículos y capítulos. Fuerte componente docente.",
    },
    nivel1: {
      articulos: { q1: 2, q2: 5, q3: 10 },
      libros: { q1: 0, q2: 0, q3: 1 },
      capitulos: { q1: 1, q2: 4, q3: 8 },
      desarrolloTecnologico: { q1: 0, q2: 0, q3: 0 },
      propiedadIntelectual: { q1: 0, q2: 0, q3: 0 },
      transferenciaTecnologica: { q1: 0, q2: 0, q3: 0 },
      docencia: { q1: 21, q2: 46, q3: 84 },
      formacionComunidad: { q1: 38, q2: 70, q3: 119 },
      accesoUniversal: { q1: 29, q2: 53, q3: 94 },
      consideraciones: "Artículos (5) y capítulos (4) balanceados. Libros empiezan a aparecer. Muy fuerte en docencia.",
    },
    nivel2: {
      articulos: { q1: 6, q2: 11, q3: 20 },
      libros: { q1: 0, q2: 1, q3: 2 },
      capitulos: { q1: 3, q2: 8, q3: 15 },
      desarrolloTecnologico: { q1: 0, q2: 0, q3: 0 },
      propiedadIntelectual: { q1: 0, q2: 0, q3: 0 },
      transferenciaTecnologica: { q1: 0, q2: 0, q3: 0 },
      docencia: { q1: 44, q2: 76, q3: 126 },
      formacionComunidad: { q1: 74, q2: 121, q3: 186 },
      accesoUniversal: { q1: 64, q2: 106, q3: 167 },
      consideraciones: "Mayor presencia de libros (mediana 1) y capítulos (8). Fuerte liderazgo en formación.",
    },
    nivel3: {
      articulos: { q1: 11, q2: 20, q3: 35 },
      libros: { q1: 1, q2: 2, q3: 4 },
      capitulos: { q1: 7, q2: 14, q3: 25 },
      desarrolloTecnologico: { q1: 0, q2: 0, q3: 0 },
      propiedadIntelectual: { q1: 0, q2: 0, q3: 0 },
      transferenciaTecnologica: { q1: 0, q2: 0, q3: 0 },
      docencia: { q1: 65, q2: 108, q3: 168 },
      formacionComunidad: { q1: 105, q2: 162, q3: 244 },
      accesoUniversal: { q1: 96, q2: 149, q3: 229 },
      consideraciones: "Perfil robusto: artículos (20), libros (2) y capítulos (14). Liderazgo consolidado en formación.",
    },
  },
  area6: {
    id: "area6",
    nombre: "Ciencias Sociales",
    candidato: {
      articulos: { q1: 1, q2: 2, q3: 4 },
      libros: { q1: 0, q2: 0, q3: 0 },
      capitulos: { q1: 0, q2: 0, q3: 2 },
      desarrolloTecnologico: { q1: 0, q2: 0, q3: 0 },
      propiedadIntelectual: { q1: 0, q2: 0, q3: 0 },
      transferenciaTecnologica: { q1: 0, q2: 0, q3: 0 },
      docencia: { q1: 4, q2: 12, q3: 28 },
      formacionComunidad: { q1: 13, q2: 26, q3: 48 },
      accesoUniversal: { q1: 7, q2: 15, q3: 29 },
      consideraciones: "Artículos en mediana 2. Comienzan capítulos. Importante actividad docente.",
    },
    nivel1: {
      articulos: { q1: 5, q2: 9, q3: 15 },
      libros: { q1: 0, q2: 0, q3: 1 },
      capitulos: { q1: 0, q2: 2, q3: 5 },
      desarrolloTecnologico: { q1: 0, q2: 0, q3: 0 },
      propiedadIntelectual: { q1: 0, q2: 0, q3: 0 },
      transferenciaTecnologica: { q1: 0, q2: 0, q3: 0 },
      docencia: { q1: 22, q2: 48, q3: 86 },
      formacionComunidad: { q1: 39, q2: 70, q3: 118 },
      accesoUniversal: { q1: 29, q2: 54, q3: 94 },
      consideraciones: "Producción de 9 artículos (mediana). Incremento de libros y capítulos. Fuerte en docencia.",
    },
    nivel2: {
      articulos: { q1: 12, q2: 19, q3: 31 },
      libros: { q1: 0, q2: 1, q3: 2 },
      capitulos: { q1: 1, q2: 4, q3: 9 },
      desarrolloTecnologico: { q1: 0, q2: 0, q3: 0 },
      propiedadIntelectual: { q1: 0, q2: 0, q3: 0 },
      transferenciaTecnologica: { q1: 0, q2: 0, q3: 0 },
      docencia: { q1: 45, q2: 78, q3: 128 },
      formacionComunidad: { q1: 74, q2: 122, q3: 187 },
      accesoUniversal: { q1: 64, q2: 107, q3: 168 },
      consideraciones: "Artículos (19), libros y capítulos en aumento. Liderazgo en formación de comunidad.",
    },
    nivel3: {
      articulos: { q1: 20, q2: 33, q3: 54 },
      libros: { q1: 0, q2: 1, q3: 3 },
      capitulos: { q1: 2, q2: 7, q3: 14 },
      desarrolloTecnologico: { q1: 0, q2: 0, q3: 0 },
      propiedadIntelectual: { q1: 0, q2: 0, q3: 0 },
      transferenciaTecnologica: { q1: 0, q2: 0, q3: 0 },
      docencia: { q1: 66, q2: 109, q3: 169 },
      formacionComunidad: { q1: 105, q2: 162, q3: 243 },
      accesoUniversal: { q1: 96, q2: 149, q3: 229 },
      consideraciones: "Alto perfil: artículos (33), libros y capítulos consolidados. Liderazgo destacado.",
    },
  },
  area7: {
    id: "area7",
    nombre: "Ciencias de Agricultura, Agropecuarias, Forestales y de Ecosistemas",
    candidato: {
      articulos: { q1: 2, q2: 4, q3: 6 },
      libros: { q1: 0, q2: 0, q3: 0 },
      capitulos: { q1: 0, q2: 0, q3: 1 },
      desarrolloTecnologico: { q1: 0, q2: 0, q3: 0 },
      propiedadIntelectual: { q1: 0, q2: 0, q3: 0 },
      transferenciaTecnologica: { q1: 0, q2: 0, q3: 0 },
      docencia: { q1: 3, q2: 9, q3: 21 },
      formacionComunidad: { q1: 11, q2: 22, q3: 40 },
      accesoUniversal: { q1: 6, q2: 12, q3: 24 },
      consideraciones: "Producción de 4 artículos. Actividad docente importante.",
    },
    nivel1: {
      articulos: { q1: 11, q2: 18, q3: 29 },
      libros: { q1: 0, q2: 0, q3: 0 },
      capitulos: { q1: 0, q2: 0, q3: 2 },
      desarrolloTecnologico: { q1: 0, q2: 0, q3: 0 },
      propiedadIntelectual: { q1: 0, q2: 0, q3: 0 },
      transferenciaTecnologica: { q1: 0, q2: 0, q3: 0 },
      docencia: { q1: 17, q2: 38, q3: 69 },
      formacionComunidad: { q1: 28, q2: 58, q3: 100 },
      accesoUniversal: { q1: 27, q2: 47, q3: 82 },
      consideraciones: "Perfil inicial similar al de otras áreas experimentales: énfasis en artículos y docencia.",
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
      consideraciones: "Incremento notable de artículos (mediana 29). Presencia incipiente de propiedad intelectual y capítulos.",
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
      consideraciones: "Perfil consolidado con fuerte énfasis en artículos, formación y difusión, y presencia incipiente de propiedad intelectual.",
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
      consideraciones: "Producción similar a otras áreas STEM, pero ya aparecen desarrollos tecnológicos y propiedad intelectual en el cuartil superior.",
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
      consideraciones: "Perfil que combina artículos con primeros indicios de innovación y propiedad intelectual.",
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
      consideraciones: "Incremento fuerte en innovación y propiedad intelectual (aunque la mediana sigue baja). Alta actividad en docencia y difusión.",
    },
    nivel3: {
      articulos: { q1: 25, q2: 47, q3: 98 },
      libros: { q1: 0, q2: 0, q3: 1 },
      capitulos: { q1: 0, q2: 1, q3: 5 },
      desarrolloTecnologico: { q1: 0, q2: 0, q3: 0 },
      propiedadIntelectual: { q1: 0, q2: 1, q3: 2 },
      transferenciaTecnologica: { q1: 0, q2: 0, q3: 0 },
      docencia: { q1: 57, q2: 94, q3: 147 },
      formacionComunidad: { q1: 101, q2: 147, q3: 226 },
      accesoUniversal: { q1: 111, q2: 148, q3: 185 },
      consideraciones: "Perfil de alta productividad en artículos y presencia clara de propiedad intelectual, aunque todavía no generalizada.",
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
      consideraciones: "Perfil mixto con artículos y primeros capítulos, y fuerte peso de docencia y formación desde el nivel Candidato.",
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
      consideraciones: "Se combinan publicaciones, libros/capítulos e incluso algo de propiedad intelectual, reflejando la naturaleza interdisciplinaria.",
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
      consideraciones: "Aumenta la diversidad de productos (incluyendo innovación y propiedad intelectual), junto con altos niveles de docencia y difusión.",
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
      consideraciones: "Perfil muy robusto en artículos y en formación/difusión, con presencia significativa, aunque no generalizada, de propiedad intelectual y libros/capítulos.",
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

