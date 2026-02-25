// La interfaz para el catálogo de Juzgados
export interface CatJuzgados {
    idCveJuzgado: number,
    cve: string,
    descripcion: string,
    instancia: string,
    activo: boolean;
}

// La interfaz para el catálogo de salas
export interface CatSalas {
    idCveSalas: number,
    cve: string,
    descripcion: string,
    instancia: string,
    activo: boolean;
}

// La interfaz para el catálogo de materias
export interface CatTramites {
    idElemencat: number,
    clave: string,
    descripcion: string,
    instancia: string,
    activo: boolean;
}

// La interfaz para el catálogo de trámites
export interface CatAnexos {
    idCatCveAnexos: number,
    cveAnexo: string,
    descripcion: string,
    instancia: string,
    activo: boolean;
}
// La interfaz para la solicitud de creación de un escrito
export interface EscritoRequest {
  instancia: string;
  materia: string;
  expediente: string;
  secretaria: string;
  juzgado: string;
  tramite: string;
  fojas: number;
  traslados: number;
  observaciones: string;
  toca: string;
  sala: string;
  anexos: AnexoRequest[];
  partes: ParteRequest[];
}

// La interfaz para la solicitud de creación de un anexo
export interface AnexoRequest {
  cveAnexo: string;
  cantidad: number;
  descripcion: number;
}

// La interfaz para la solicitud de creación de una parte
export interface ParteRequest {
  nombre: string;
}

// La interfaz para la respuesta genérica de la API
export interface GenericResponse<T> {
  success: boolean;
  message: string;
  errors: string[] | null;
  data: T;
}

// La interfaz para el reporte de un documento
export interface ReporteDocumento {
  folio: string;
  expediente: string;
  tramite: string;
  secretaria: string;
  encabezado: string;
  toca: string;
  fecha_rec: string;
  hora_rec: string;
  traslados: string;
  fojas: string;
  observaciones: string;
  partes: string[];
  anexos: string[];
  otrosAnexos: string[];
}





